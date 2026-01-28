/**
 * EncounterSystem.ts - Random encounter triggering for Iron Frontier v2
 *
 * Pokemon-style encounter system that triggers based on:
 * - Steps taken in encounter-enabled zones
 * - Time of day (more dangerous at night)
 * - Current route/area danger level
 * - Player level (scaling)
 * - Repel items
 */

import type { MovementVector } from '../input/types';

/**
 * Encounter zone configuration
 */
export interface EncounterZone {
  /** Zone identifier */
  id: string;
  /** Base encounter rate (0-1, chance per step) */
  baseRate: number;
  /** Minimum steps before encounter can trigger */
  minSteps: number;
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
  terrain: 'grass' | 'desert' | 'mountain' | 'road' | 'forest';
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
  /** Steps taken since last encounter */
  stepsSinceEncounter: number;
  /** Current zone (null if in safe area) */
  currentZone: EncounterZone | null;
  /** Repel steps remaining */
  repelSteps: number;
  /** Is encounter system active */
  enabled: boolean;
}

type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
type EncounterCallback = (trigger: EncounterTrigger) => void;

export class EncounterSystem {
  private state: EncounterState = {
    stepsSinceEncounter: 0,
    currentZone: null,
    repelSteps: 0,
    enabled: true,
  };

  private zones: Map<string, EncounterZone> = new Map();
  private encounterCallbacks: Set<EncounterCallback> = new Set();
  private timeOfDay: TimeOfDay = 'day';

  // Movement tracking
  private lastPosition: { x: number; z: number } = { x: 0, z: 0 };
  private accumulatedDistance = 0;
  private readonly STEP_DISTANCE = 1.0; // Units of movement per "step"

  // Terrain-based rate modifiers
  private readonly TERRAIN_MODIFIERS: Record<string, number> = {
    grass: 1.0,
    desert: 0.7,
    mountain: 0.5,
    road: 0.2,
    forest: 1.2,
  };

  constructor() {
    console.log('[EncounterSystem] Initialized');
  }

  /**
   * Register an encounter zone
   */
  public registerZone(zone: EncounterZone): void {
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
   * Update player position (call when player moves)
   */
  public updatePosition(x: number, z: number): void {
    if (!this.state.enabled || !this.state.currentZone) {
      this.lastPosition = { x, z };
      return;
    }

    // Calculate distance moved
    const dx = x - this.lastPosition.x;
    const dz = z - this.lastPosition.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    this.accumulatedDistance += distance;
    this.lastPosition = { x, z };

    // Convert distance to steps
    while (this.accumulatedDistance >= this.STEP_DISTANCE) {
      this.accumulatedDistance -= this.STEP_DISTANCE;
      this.processStep();
    }
  }

  /**
   * Process a single step for encounter checking
   */
  private processStep(): void {
    const zone = this.state.currentZone;
    if (!zone) return;

    this.state.stepsSinceEncounter++;

    // Check repel effect
    if (this.state.repelSteps > 0) {
      this.state.repelSteps--;
      return;
    }

    // Must take minimum steps before encounter
    if (this.state.stepsSinceEncounter < zone.minSteps) {
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
   * Calculate current encounter chance
   */
  private calculateEncounterChance(zone: EncounterZone): number {
    let rate = zone.baseRate;

    // Apply time modifier
    rate *= zone.timeModifiers[this.timeOfDay];

    // Apply terrain modifier
    rate *= this.TERRAIN_MODIFIERS[zone.terrain] ?? 1.0;

    // Increase chance slightly based on steps since last encounter
    // This prevents long dry spells
    const stepBonus = Math.min(0.1, (this.state.stepsSinceEncounter - zone.minSteps) * 0.002);
    rate += stepBonus;

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

    // Reset step counter
    this.state.stepsSinceEncounter = 0;

    // Notify listeners
    this.encounterCallbacks.forEach((cb) => cb(trigger));

    console.log(`[EncounterSystem] Triggered: ${encounterId} in ${zone.id}`);
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
   * Apply repel effect (no encounters for N steps)
   */
  public applyRepel(steps: number): void {
    this.state.repelSteps = Math.max(this.state.repelSteps, steps);
    console.log(`[EncounterSystem] Repel active for ${this.state.repelSteps} steps`);
  }

  /**
   * Get remaining repel steps
   */
  public getRepelSteps(): number {
    return this.state.repelSteps;
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
    this.state.stepsSinceEncounter = 0;
    this.state.repelSteps = 0;
    this.accumulatedDistance = 0;
  }

  /**
   * Get debug info
   */
  public getDebugInfo(): {
    zone: string | null;
    steps: number;
    repel: number;
    chance: number;
  } {
    return {
      zone: this.state.currentZone?.id ?? null,
      steps: this.state.stepsSinceEncounter,
      repel: this.state.repelSteps,
      chance: this.state.currentZone
        ? this.calculateEncounterChance(this.state.currentZone)
        : 0,
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
 * Create default route encounter zones
 */
export function createRouteEncounterZones(): EncounterZone[] {
  return [
    {
      id: 'dusty_trail',
      baseRate: 0.08,
      minSteps: 15,
      encounterPool: ['bandit_ambush', 'coyote_pack', 'rattlesnake'],
      timeModifiers: { dawn: 0.8, day: 1.0, dusk: 1.2, night: 1.5 },
      terrain: 'desert',
    },
    {
      id: 'canyon_pass',
      baseRate: 0.1,
      minSteps: 10,
      encounterPool: ['bandit_gang', 'mountain_lion', 'rockslide'],
      timeModifiers: { dawn: 0.9, day: 1.0, dusk: 1.3, night: 1.8 },
      terrain: 'mountain',
    },
    {
      id: 'riverside_path',
      baseRate: 0.06,
      minSteps: 20,
      encounterPool: ['snake_nest', 'wild_boar', 'drifter'],
      timeModifiers: { dawn: 1.1, day: 0.9, dusk: 1.0, night: 1.3 },
      terrain: 'grass',
    },
    {
      id: 'forest_road',
      baseRate: 0.09,
      minSteps: 12,
      encounterPool: ['wolf_pack', 'bear', 'outlaw_camp'],
      timeModifiers: { dawn: 1.0, day: 0.8, dusk: 1.4, night: 2.0 },
      terrain: 'forest',
    },
    {
      id: 'main_road',
      baseRate: 0.03,
      minSteps: 30,
      encounterPool: ['highwayman', 'traveling_merchant'],
      timeModifiers: { dawn: 0.5, day: 0.3, dusk: 0.8, night: 1.5 },
      terrain: 'road',
    },
  ];
}
