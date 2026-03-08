/**
 * EncounterSystem.ts - Random encounter triggering for Iron Frontier v2
 *
 * Distance-based encounter system for 3D first-person gameplay.
 * Triggers are based on meters traveled in 3D space, not tile steps.
 *
 * Design targets:
 * - Average encounter every 200-400m of wilderness travel (randomized)
 * - No encounters within 50m of town boundaries
 * - Time of day modifiers (more dangerous at night)
 * - Terrain-based rate modifiers
 * - Repel items prevent encounters for a distance
 */

/**
 * Encounter zone configuration
 */
export interface EncounterZone {
  /** Zone identifier */
  id: string;
  /** Base encounter rate (0-1, chance per distance check) */
  baseRate: number;
  /** Minimum meters traveled before encounter can trigger */
  minDistance: number;
  /** Available encounter IDs in this zone */
  encounterPool: string[];
  /** Time-based rate modifiers */
  timeModifiers: {
    dawn: number;
    day: number;
    dusk: number;
    night: number;
  };
  /** Terrain type affects encounter rate */
  terrain: 'grass' | 'desert' | 'mountain' | 'road' | 'forest' | 'town';
  /**
   * @deprecated Use minDistance instead. Kept for backwards compatibility.
   * If present and minDistance is not set, will be converted to minDistance.
   */
  minSteps?: number;
}

/**
 * Encounter result
 */
export interface EncounterTrigger {
  /** Encounter ID from the pool */
  encounterId: string;
  /** Zone where encounter occurred */
  zoneId: string;
  /** Terrain type */
  terrain: string;
  /** Time of day when triggered */
  timeOfDay: string;
}

/**
 * Encounter system state
 */
interface EncounterState {
  /** Meters traveled since last encounter */
  distanceSinceEncounter: number;
  /** Current zone (null if in safe area) */
  currentZone: EncounterZone | null;
  /** Repel distance remaining (meters) */
  repelDistance: number;
  /** Is encounter system active */
  enabled: boolean;
  /** Distance to nearest town boundary (meters); 0 = unknown */
  distanceToTown: number;
}

type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
type EncounterCallback = (trigger: EncounterTrigger) => void;

/** Meters between each encounter-chance check */
const DISTANCE_CHECK_INTERVAL = 10; // check every 10 meters traveled

/** No encounters within this distance of town boundaries */
const TOWN_SAFE_RADIUS = 50; // meters

export class EncounterSystem {
  private state: EncounterState = {
    distanceSinceEncounter: 0,
    currentZone: null,
    repelDistance: 0,
    enabled: true,
    distanceToTown: Infinity,
  };

  private zones: Map<string, EncounterZone> = new Map();
  private encounterCallbacks: Set<EncounterCallback> = new Set();
  private timeOfDay: TimeOfDay = 'day';

  // Movement tracking
  private lastPosition: { x: number; z: number } = { x: 0, z: 0 };
  private accumulatedDistance = 0;

  // Terrain-based rate modifiers
  private readonly TERRAIN_MODIFIERS: Record<string, number> = {
    grass: 1.0,
    desert: 0.7,
    mountain: 0.5,
    road: 0.2,
    forest: 1.2,
    town: 0, // no encounters in town
  };

  constructor() {
    console.log('[EncounterSystem] Initialized (distance-based, 3D)');
  }

  /**
   * Register an encounter zone.
   * Handles backwards-compatible conversion of minSteps to minDistance.
   */
  public registerZone(zone: EncounterZone): void {
    // Backwards compat: if zone has minSteps but no minDistance, convert
    if (zone.minSteps !== undefined && zone.minDistance === undefined) {
      zone = { ...zone, minDistance: zone.minSteps * DISTANCE_CHECK_INTERVAL };
    }
    this.zones.set(zone.id, zone);
  }

  /**
   * Set current encounter zone (call when player enters a new area)
   */
  public setCurrentZone(zoneId: string | null): void {
    if (zoneId === null) {
      this.state.currentZone = null;
    } else {
      this.state.currentZone = this.zones.get(zoneId) ?? null;
    }
  }

  /**
   * Set time of day (affects encounter rates)
   */
  public setTimeOfDay(time: TimeOfDay): void {
    this.timeOfDay = time;
  }

  /**
   * Set distance to nearest town boundary.
   * Encounters are suppressed within TOWN_SAFE_RADIUS (50m).
   */
  public setDistanceToTown(meters: number): void {
    this.state.distanceToTown = meters;
  }

  /**
   * Update player position (call when player moves in 3D world).
   * Coordinates are in world-space meters.
   */
  public updatePosition(x: number, z: number): void {
    if (!this.state.enabled || !this.state.currentZone) {
      this.lastPosition = { x, z };
      return;
    }

    // Calculate distance moved (meters)
    const dx = x - this.lastPosition.x;
    const dz = z - this.lastPosition.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    this.accumulatedDistance += distance;
    this.lastPosition = { x, z };

    // Check every DISTANCE_CHECK_INTERVAL meters
    while (this.accumulatedDistance >= DISTANCE_CHECK_INTERVAL) {
      this.accumulatedDistance -= DISTANCE_CHECK_INTERVAL;
      this.processDistanceCheck();
    }
  }

  /**
   * Process a distance check (every DISTANCE_CHECK_INTERVAL meters).
   */
  private processDistanceCheck(): void {
    const zone = this.state.currentZone;
    if (!zone) return;

    this.state.distanceSinceEncounter += DISTANCE_CHECK_INTERVAL;

    // Suppress encounters near towns (within 50m)
    if (this.state.distanceToTown < TOWN_SAFE_RADIUS) {
      return;
    }

    // Check repel effect
    if (this.state.repelDistance > 0) {
      this.state.repelDistance -= DISTANCE_CHECK_INTERVAL;
      return;
    }

    // Must travel minimum distance before encounter can trigger
    if (this.state.distanceSinceEncounter < zone.minDistance) {
      return;
    }

    // Calculate encounter chance
    const chance = this.calculateEncounterChance(zone);

    // Roll for encounter
    if (Math.random() < chance) {
      this.triggerEncounter(zone);
    }
  }

  /**
   * Calculate current encounter chance for this distance check.
   */
  private calculateEncounterChance(zone: EncounterZone): number {
    let rate = zone.baseRate;

    // Apply time modifier
    rate *= zone.timeModifiers[this.timeOfDay];

    // Apply terrain modifier
    rate *= this.TERRAIN_MODIFIERS[zone.terrain] ?? 1.0;

    // Increase chance based on distance since last encounter to prevent
    // long dry spells. Each check beyond minDistance adds a small bonus.
    const checksOverMin = Math.max(0, (this.state.distanceSinceEncounter - zone.minDistance) / DISTANCE_CHECK_INTERVAL);
    const distanceBonus = Math.min(0.1, checksOverMin * 0.002);
    rate += distanceBonus;

    // Cap at reasonable maximum
    return Math.min(0.25, rate);
  }

  /**
   * Trigger an encounter
   */
  private triggerEncounter(zone: EncounterZone): void {
    if (zone.encounterPool.length === 0) return;

    // Pick random encounter from pool
    const encounterId = zone.encounterPool[Math.floor(Math.random() * zone.encounterPool.length)];

    const trigger: EncounterTrigger = {
      encounterId,
      zoneId: zone.id,
      terrain: zone.terrain,
      timeOfDay: this.timeOfDay,
    };

    // Reset distance counter
    this.state.distanceSinceEncounter = 0;

    // Notify listeners
    this.encounterCallbacks.forEach((cb) => cb(trigger));

    console.log(`[EncounterSystem] Triggered: ${encounterId} in ${zone.id} (distance-based)`);
  }

  /**
   * Subscribe to encounter events
   */
  public onEncounter(callback: EncounterCallback): () => void {
    this.encounterCallbacks.add(callback);
    return () => {
      this.encounterCallbacks.delete(callback);
    };
  }

  /**
   * Apply repel effect (no encounters for N meters of travel).
   * For backwards compatibility, also accepts the old "steps" count
   * and converts to meters (steps * DISTANCE_CHECK_INTERVAL).
   */
  public applyRepel(distance: number): void {
    this.state.repelDistance = Math.max(this.state.repelDistance, distance);
    console.log(`[EncounterSystem] Repel active for ${this.state.repelDistance}m`);
  }

  /**
   * Get remaining repel distance (meters).
   * @deprecated Renamed from getRepelSteps for clarity; kept for compat.
   */
  public getRepelSteps(): number {
    return this.state.repelDistance;
  }

  /**
   * Get remaining repel distance in meters.
   */
  public getRepelDistance(): number {
    return this.state.repelDistance;
  }

  /**
   * Enable/disable encounter system
   */
  public setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
  }

  /**
   * Check if encounters are enabled
   */
  public isEnabled(): boolean {
    return this.state.enabled;
  }

  /**
   * Reset encounter state (e.g., after loading a save)
   */
  public reset(): void {
    this.state.distanceSinceEncounter = 0;
    this.state.repelDistance = 0;
    this.state.distanceToTown = Infinity;
    this.accumulatedDistance = 0;
  }

  /**
   * Get debug info
   */
  public getDebugInfo(): {
    zone: string | null;
    /** Meters traveled since last encounter */
    steps: number;
    /** Remaining repel distance in meters */
    repel: number;
    /** Current encounter chance per distance check */
    chance: number;
    /** Distance to nearest town (meters) */
    distanceToTown: number;
  } {
    return {
      zone: this.state.currentZone?.id ?? null,
      steps: this.state.distanceSinceEncounter,
      repel: this.state.repelDistance,
      chance: this.state.currentZone
        ? this.calculateEncounterChance(this.state.currentZone)
        : 0,
      distanceToTown: this.state.distanceToTown,
    };
  }
}

// Singleton instance
let encounterSystemInstance: EncounterSystem | null = null;

export function getEncounterSystem(): EncounterSystem {
  if (!encounterSystemInstance) {
    encounterSystemInstance = new EncounterSystem();
  }
  return encounterSystemInstance;
}

/**
 * Create default route encounter zones (distance-based for 3D).
 *
 * Design target: average encounter every 200-400m of wilderness travel.
 * minDistance is the mandatory safe travel before first possible encounter.
 * baseRate is the per-check (every 10m) chance once past minDistance.
 */
export function createRouteEncounterZones(): EncounterZone[] {
  return [
    {
      id: 'dusty_trail',
      baseRate: 0.08,
      minDistance: 150,  // 150m minimum before encounters
      encounterPool: ['bandit_ambush', 'coyote_pack', 'rattlesnake'],
      timeModifiers: { dawn: 0.8, day: 1.0, dusk: 1.2, night: 1.5 },
      terrain: 'desert',
    },
    {
      id: 'canyon_pass',
      baseRate: 0.10,
      minDistance: 100,  // Tight quarters, shorter safe distance
      encounterPool: ['bandit_gang', 'mountain_lion', 'rockslide'],
      timeModifiers: { dawn: 0.9, day: 1.0, dusk: 1.3, night: 1.8 },
      terrain: 'mountain',
    },
    {
      id: 'riverside_path',
      baseRate: 0.06,
      minDistance: 200,  // Calmer area, longer between encounters
      encounterPool: ['snake_nest', 'wild_boar', 'drifter'],
      timeModifiers: { dawn: 1.1, day: 0.9, dusk: 1.0, night: 1.3 },
      terrain: 'grass',
    },
    {
      id: 'forest_road',
      baseRate: 0.09,
      minDistance: 120,  // Dense terrain, more frequent checks
      encounterPool: ['wolf_pack', 'bear', 'outlaw_camp'],
      timeModifiers: { dawn: 1.0, day: 0.8, dusk: 1.4, night: 2.0 },
      terrain: 'forest',
    },
    {
      id: 'main_road',
      baseRate: 0.03,
      minDistance: 300,  // Safe patrolled road, rare encounters
      encounterPool: ['highwayman', 'traveling_merchant'],
      timeModifiers: { dawn: 0.5, day: 0.3, dusk: 0.8, night: 1.5 },
      terrain: 'road',
    },
  ];
}
