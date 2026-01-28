/**
 * ZoneSystem.ts - Zone management for Iron Frontier
 *
 * Manages game zones including:
 * - Overworld areas
 * - Towns and their interiors
 * - Routes between locations
 * - Zone transitions (entrances/exits)
 *
 * Integrates with:
 * - EncounterSystem: Sets current encounter zone when entering routes
 * - PlayerController: Can be wired to track player zone changes
 * - GameStateSlice: Updates current location state
 */

import { SpatialHash, type AABB, aabbContainsPoint, aabbFromRadius, aabbIntersects } from './SpatialHash';
import type { EncounterSystem } from './EncounterSystem';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Zone types representing different areas in the game world.
 */
export type ZoneType = 'overworld' | 'town' | 'building' | 'route';

/**
 * Zone definition for areas in the game world.
 */
export interface Zone {
  /** Unique zone identifier */
  id: string;

  /** Type of zone */
  type: ZoneType;

  /** Display name for the zone */
  name?: string;

  /** Axis-aligned bounding box for the zone */
  bounds: AABB;

  /** Link to EncounterSystem zone (for routes) */
  encounterZoneId?: string;

  /** Town ID if this is a town zone */
  townId?: string;

  /** Route ID if this is a route zone */
  routeId?: string;

  /** Building ID if this is a building interior */
  buildingId?: string;

  /** Transitions to other zones */
  transitions: ZoneTransition[];

  /** Whether encounters are enabled in this zone */
  encountersEnabled?: boolean;

  /** Zone priority for overlapping zones (higher = checked first) */
  priority?: number;

  /** Additional metadata */
  data?: Record<string, unknown>;
}

/**
 * Zone transition definition for moving between zones.
 */
export interface ZoneTransition {
  /** Target zone ID to transition to */
  targetZoneId: string;

  /** Trigger area for the transition */
  triggerBounds: AABB;

  /** Spawn position in the target zone */
  spawnPosition: { x: number; z: number };

  /** Display text when transition is triggered */
  transitionText?: string;

  /** Whether this is a one-way transition */
  oneWay?: boolean;

  /** Conditions for the transition to be available */
  conditions?: {
    /** Required quest flag */
    requiresFlag?: string;
    /** Required quest completion */
    requiresQuest?: string;
    /** Required item */
    requiresItem?: string;
    /** Time of day restriction */
    timeOfDay?: ('dawn' | 'day' | 'dusk' | 'night')[];
  };
}

/**
 * Callback for zone change events.
 */
export type ZoneChangeCallback = (newZone: Zone | null, previousZone: Zone | null) => void;

/**
 * Callback for transition events.
 */
export type TransitionCallback = (transition: ZoneTransition, fromZone: Zone) => void;

// ============================================================================
// TOWN POSITION DATA
// ============================================================================

/**
 * Town positions in the world with their collision radii.
 * These are used to create town zones automatically.
 */
export const TOWN_POSITIONS: Record<string, { x: number; z: number; radius: number }> = {
  frontiers_edge: { x: 0, z: 0, radius: 100 },
  dusty_springs: { x: 50, z: 25, radius: 80 },
  iron_gulch: { x: 100, z: 50, radius: 150 },
  mesa_point: { x: 75, z: -50, radius: 120 },
  coldwater: { x: 120, z: 80, radius: 130 },
  salvation: { x: 150, z: -100, radius: 140 },
};

// ============================================================================
// ZONE SYSTEM
// ============================================================================

/**
 * ZoneSystem manages all game zones and handles player zone tracking.
 *
 * @example
 * ```typescript
 * const zoneSystem = new ZoneSystem();
 *
 * // Register a town zone
 * zoneSystem.registerZone({
 *   id: 'frontiers_edge',
 *   type: 'town',
 *   townId: 'frontiers_edge',
 *   bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
 *   transitions: [],
 * });
 *
 * // Check player position
 * const zone = zoneSystem.checkPlayerPosition({ x: 10, z: 10 });
 * ```
 */
export class ZoneSystem {
  private zones: Map<string, Zone> = new Map();
  private spatialHash: SpatialHash<Zone>;
  private currentZone: Zone | null = null;

  // Callbacks
  private zoneChangeCallbacks: Set<ZoneChangeCallback> = new Set();
  private transitionCallbacks: Set<TransitionCallback> = new Set();

  // Integration references
  private encounterSystem: EncounterSystem | null = null;

  constructor(cellSize: number = 100) {
    this.spatialHash = new SpatialHash<Zone>(cellSize);
    console.log('[ZoneSystem] Initialized');
  }

  // ============================================================================
  // ZONE REGISTRATION
  // ============================================================================

  /**
   * Register a zone with the system.
   * @param zone The zone to register
   */
  registerZone(zone: Zone): void {
    // Validate zone
    if (!zone.id) {
      throw new Error('Zone must have an id');
    }
    if (!zone.bounds) {
      throw new Error(`Zone ${zone.id} must have bounds`);
    }

    // Remove existing zone with same ID
    if (this.zones.has(zone.id)) {
      this.unregisterZone(zone.id);
    }

    this.zones.set(zone.id, zone);
    this.spatialHash.insert(zone, zone.bounds);

    console.log(`[ZoneSystem] Registered zone: ${zone.id} (${zone.type})`);
  }

  /**
   * Unregister a zone from the system.
   * @param zoneId The zone ID to unregister
   */
  unregisterZone(zoneId: string): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      this.spatialHash.remove(zone);
      this.zones.delete(zoneId);

      // Clear current zone if it was unregistered
      if (this.currentZone?.id === zoneId) {
        this.currentZone = null;
      }

      console.log(`[ZoneSystem] Unregistered zone: ${zoneId}`);
    }
  }

  /**
   * Register multiple zones at once.
   * @param zones Array of zones to register
   */
  registerZones(zones: Zone[]): void {
    for (const zone of zones) {
      this.registerZone(zone);
    }
  }

  /**
   * Get a zone by ID.
   * @param zoneId The zone ID
   */
  getZone(zoneId: string): Zone | undefined {
    return this.zones.get(zoneId);
  }

  /**
   * Get all registered zones.
   */
  getAllZones(): Zone[] {
    return Array.from(this.zones.values());
  }

  // ============================================================================
  // POSITION CHECKING
  // ============================================================================

  /**
   * Check which zone a position is in.
   * Returns the highest priority zone if multiple overlap.
   * @param pos The position to check
   */
  checkPlayerPosition(pos: { x: number; z: number }): Zone | null {
    // Query spatial hash for candidate zones
    const candidates = this.spatialHash.queryPoint(pos);

    if (candidates.length === 0) {
      return null;
    }

    // Filter to zones that actually contain the point
    const containingZones = candidates.filter((zone) => aabbContainsPoint(zone.bounds, pos));

    if (containingZones.length === 0) {
      return null;
    }

    // Sort by priority (higher first) and return the top one
    containingZones.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    return containingZones[0];
  }

  /**
   * Update the player's current zone and trigger callbacks.
   * @param pos The player's position
   * @returns The current zone (or null if in no zone)
   */
  updatePlayerPosition(pos: { x: number; z: number }): Zone | null {
    const newZone = this.checkPlayerPosition(pos);
    const previousZone = this.currentZone;

    // Check if zone changed
    if (newZone?.id !== previousZone?.id) {
      this.currentZone = newZone;

      // Notify callbacks
      for (const callback of this.zoneChangeCallbacks) {
        callback(newZone, previousZone);
      }

      // Update encounter system if integrated
      if (this.encounterSystem && newZone?.type === 'route' && newZone.encounterZoneId) {
        this.encounterSystem.setCurrentZone(newZone.encounterZoneId);
      } else if (this.encounterSystem && newZone?.type === 'town') {
        // Towns are safe zones - disable encounters
        this.encounterSystem.setCurrentZone(null);
      }

      console.log(
        `[ZoneSystem] Zone changed: ${previousZone?.id ?? 'none'} -> ${newZone?.id ?? 'none'}`
      );
    }

    return newZone;
  }

  /**
   * Check if a position triggers a zone transition.
   * @param pos The position to check
   */
  checkTransition(pos: { x: number; z: number }): ZoneTransition | null {
    const zone = this.currentZone;
    if (!zone) return null;

    for (const transition of zone.transitions) {
      if (aabbContainsPoint(transition.triggerBounds, pos)) {
        // Check conditions if present
        // Note: In production, this would check against game state
        return transition;
      }
    }

    return null;
  }

  /**
   * Get the current zone the player is in.
   */
  getCurrentZone(): Zone | null {
    return this.currentZone;
  }

  /**
   * Set the current zone directly (e.g., after loading a save).
   * @param zoneId The zone ID to set as current
   */
  setCurrentZone(zoneId: string | null): void {
    if (zoneId === null) {
      this.currentZone = null;
    } else {
      this.currentZone = this.zones.get(zoneId) ?? null;
    }
  }

  // ============================================================================
  // SPATIAL QUERIES
  // ============================================================================

  /**
   * Get all zones within a radius of a position.
   * @param pos Center position
   * @param radius Search radius
   */
  getZonesInRadius(pos: { x: number; z: number }, radius: number): Zone[] {
    return this.spatialHash.queryRadius(pos, radius);
  }

  /**
   * Get all zones of a specific type.
   * @param type The zone type to filter by
   */
  getZonesByType(type: ZoneType): Zone[] {
    return Array.from(this.zones.values()).filter((zone) => zone.type === type);
  }

  /**
   * Get the nearest zone of a specific type.
   * @param pos The position to search from
   * @param type The zone type to find
   */
  getNearestZone(pos: { x: number; z: number }, type?: ZoneType): Zone | null {
    const zones = type ? this.getZonesByType(type) : Array.from(this.zones.values());

    if (zones.length === 0) return null;

    let nearest: Zone | null = null;
    let nearestDistSq = Infinity;

    for (const zone of zones) {
      // Calculate distance to zone center
      const center = {
        x: (zone.bounds.min.x + zone.bounds.max.x) / 2,
        z: (zone.bounds.min.z + zone.bounds.max.z) / 2,
      };
      const dx = pos.x - center.x;
      const dz = pos.z - center.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < nearestDistSq) {
        nearestDistSq = distSq;
        nearest = zone;
      }
    }

    return nearest;
  }

  /**
   * Get all zones that intersect with the given bounds.
   * @param bounds The bounds to check
   */
  getZonesInBounds(bounds: AABB): Zone[] {
    const candidates = this.spatialHash.query(bounds);
    return candidates.filter((zone) => aabbIntersects(zone.bounds, bounds));
  }

  // ============================================================================
  // CALLBACKS
  // ============================================================================

  /**
   * Subscribe to zone change events.
   * @param callback The callback to invoke on zone change
   * @returns Unsubscribe function
   */
  onZoneChange(callback: ZoneChangeCallback): () => void {
    this.zoneChangeCallbacks.add(callback);
    return () => {
      this.zoneChangeCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to transition events.
   * @param callback The callback to invoke on transition
   * @returns Unsubscribe function
   */
  onTransition(callback: TransitionCallback): () => void {
    this.transitionCallbacks.add(callback);
    return () => {
      this.transitionCallbacks.delete(callback);
    };
  }

  // ============================================================================
  // INTEGRATION
  // ============================================================================

  /**
   * Set the encounter system for integration.
   * @param system The encounter system instance
   */
  setEncounterSystem(system: EncounterSystem): void {
    this.encounterSystem = system;
  }

  // ============================================================================
  // FACTORY METHODS
  // ============================================================================

  /**
   * Create town zones from the TOWN_POSITIONS data.
   * @returns Array of town zones
   */
  static createTownZones(): Zone[] {
    const zones: Zone[] = [];

    for (const [townId, pos] of Object.entries(TOWN_POSITIONS)) {
      zones.push({
        id: `town_${townId}`,
        type: 'town',
        name: townId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        townId,
        bounds: aabbFromRadius({ x: pos.x, z: pos.z }, pos.radius),
        transitions: [],
        encountersEnabled: false,
        priority: 10, // Towns have high priority
      });
    }

    return zones;
  }

  /**
   * Create a route zone between two positions.
   * @param routeId The route ID
   * @param fromPos Starting position
   * @param toPos Ending position
   * @param width Width of the route corridor
   * @param encounterZoneId Optional encounter zone ID
   */
  static createRouteZone(
    routeId: string,
    fromPos: { x: number; z: number },
    toPos: { x: number; z: number },
    width: number = 50,
    encounterZoneId?: string
  ): Zone {
    // Create a bounding box that encompasses the route corridor
    const minX = Math.min(fromPos.x, toPos.x) - width / 2;
    const maxX = Math.max(fromPos.x, toPos.x) + width / 2;
    const minZ = Math.min(fromPos.z, toPos.z) - width / 2;
    const maxZ = Math.max(fromPos.z, toPos.z) + width / 2;

    return {
      id: `route_${routeId}`,
      type: 'route',
      name: routeId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      routeId,
      bounds: {
        min: { x: minX, z: minZ },
        max: { x: maxX, z: maxZ },
      },
      transitions: [],
      encounterZoneId,
      encountersEnabled: true,
      priority: 5, // Routes have lower priority than towns
    };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Clear all zones and reset state.
   */
  clear(): void {
    this.zones.clear();
    this.spatialHash.clear();
    this.currentZone = null;
    console.log('[ZoneSystem] Cleared all zones');
  }

  /**
   * Dispose of the zone system.
   */
  dispose(): void {
    this.clear();
    this.zoneChangeCallbacks.clear();
    this.transitionCallbacks.clear();
    this.encounterSystem = null;
    console.log('[ZoneSystem] Disposed');
  }

  // ============================================================================
  // DEBUG
  // ============================================================================

  /**
   * Get debug information about the zone system.
   */
  getDebugInfo(): {
    zoneCount: number;
    currentZone: string | null;
    zonesByType: Record<ZoneType, number>;
    spatialHashInfo: ReturnType<SpatialHash<Zone>['getDebugInfo']>;
  } {
    const zonesByType: Record<ZoneType, number> = {
      overworld: 0,
      town: 0,
      building: 0,
      route: 0,
    };

    for (const zone of this.zones.values()) {
      zonesByType[zone.type]++;
    }

    return {
      zoneCount: this.zones.size,
      currentZone: this.currentZone?.id ?? null,
      zonesByType,
      spatialHashInfo: this.spatialHash.getDebugInfo(),
    };
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let zoneSystemInstance: ZoneSystem | null = null;

/**
 * Get the singleton ZoneSystem instance.
 */
export function getZoneSystem(): ZoneSystem {
  if (!zoneSystemInstance) {
    zoneSystemInstance = new ZoneSystem();
  }
  return zoneSystemInstance;
}

/**
 * Reset the singleton instance (for testing).
 */
export function resetZoneSystem(): void {
  if (zoneSystemInstance) {
    zoneSystemInstance.dispose();
    zoneSystemInstance = null;
  }
}
