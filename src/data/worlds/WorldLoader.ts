/**
 * WorldLoader - Resolves World schema references to loadable Location data
 *
 * Bridges the gap between World definitions (which use locationDataId references)
 * and the LocationLoader (which needs full Location data).
 *
 * For locations with locationDataId: loads hand-crafted Location from registry
 * For locations with seed only: provides seed for procedural generation
 */

import { getAllLocationIds, getLocationById } from '../locations/index';
import type { Location } from '../schemas/spatial';
import type { LocationRef, World } from '../schemas/world';

// ============================================================================
// TYPES
// ============================================================================

export interface ResolvedLocation {
  /** Reference from World definition */
  ref: LocationRef;

  /** Full Location data (if available) */
  location: Location | null;

  /** Whether this location uses procedural generation */
  isProcedural: boolean;

  /** Seed for generation (from locationDataId or world ref) */
  seed: number;
}

export interface LoadedWorld {
  /** Original world definition */
  world: World;

  /** All resolved locations indexed by ID */
  locations: Map<string, ResolvedLocation>;

  /** Starting location (resolved) */
  startingLocation: ResolvedLocation;

  /** Get connections from a location */
  getConnectionsFrom(locationId: string): LocationRef[];

  /** Get location by ID */
  getLocation(locationId: string): ResolvedLocation | undefined;

  /** Get all discovered locations */
  getDiscoveredLocations(): ResolvedLocation[];

  /** Check if a location is accessible from another */
  canTravelTo(fromId: string, toId: string): boolean;
}

// ============================================================================
// WORLD LOADER
// ============================================================================

/**
 * Load and resolve a World definition
 *
 * Resolves all locationDataId references to full Location data where available.
 * Locations without hand-crafted data are marked as procedural.
 */
export function loadWorld(world: World): LoadedWorld {
  console.log(`[WorldLoader] Loading world: ${world.name}`);

  const locations = new Map<string, ResolvedLocation>();

  // Resolve each location reference
  for (const ref of world.locations) {
    let location: Location | null = null;
    let isProcedural = true;
    let seed = ref.seed ?? world.seed;

    // Try to load hand-crafted location data
    if (ref.locationDataId) {
      const handCrafted = getLocationById(ref.locationDataId);
      if (handCrafted) {
        location = handCrafted;
        isProcedural = false;
        seed = handCrafted.seed;
        console.log(`[WorldLoader] Resolved ${ref.id} -> ${ref.locationDataId} (hand-crafted)`);
      } else {
        console.warn(
          `[WorldLoader] Location data not found for ${ref.locationDataId}, falling back to procedural`
        );
      }
    } else {
      console.log(`[WorldLoader] ${ref.id} is procedural (seed: ${seed})`);
    }

    locations.set(ref.id, {
      ref,
      location,
      isProcedural,
      seed,
    });
  }

  console.log(
    `[WorldLoader] Loaded ${locations.size} locations (${[...locations.values()].filter((l) => !l.isProcedural).length} hand-crafted)`
  );

  // Get starting location
  const startingLocation = locations.get(world.startingLocationId);
  if (!startingLocation) {
    throw new Error(`[WorldLoader] Starting location not found: ${world.startingLocationId}`);
  }

  // Build the loaded world object
  const loadedWorld: LoadedWorld = {
    world,
    locations,
    startingLocation,

    getConnectionsFrom(locationId: string): LocationRef[] {
      const connections = world.connections.filter(
        (c) => c.from === locationId || (c.bidirectional && c.to === locationId)
      );

      // Resolve to LocationRefs
      return connections
        .map((c) => {
          const targetId = c.from === locationId ? c.to : c.from;
          const targetRef = world.locations.find((l) => l.id === targetId);
          return targetRef!;
        })
        .filter(Boolean);
    },

    getLocation(locationId: string): ResolvedLocation | undefined {
      return locations.get(locationId);
    },

    getDiscoveredLocations(): ResolvedLocation[] {
      return [...locations.values()].filter((l) => l.ref.discovered);
    },

    canTravelTo(fromId: string, toId: string): boolean {
      const connection = world.connections.find(
        (c) =>
          (c.from === fromId && c.to === toId) ||
          (c.bidirectional && c.from === toId && c.to === fromId)
      );

      if (!connection) return false;

      // Check if target location is accessible
      const target = locations.get(toId);
      return target?.ref.accessible ?? false;
    },
  };

  return loadedWorld;
}

/**
 * Get the Location data for a resolved location
 *
 * For hand-crafted locations: returns the Location directly
 * For procedural locations: returns null (caller should use procedural generation)
 */
export function getLocationData(resolved: ResolvedLocation): Location | null {
  return resolved.location;
}

/**
 * Check if all location data references in a world are valid
 * Useful for validation during development
 */
export function validateWorldReferences(world: World): string[] {
  const errors: string[] = [];
  const availableIds = getAllLocationIds();

  for (const ref of world.locations) {
    if (ref.locationDataId && !availableIds.includes(ref.locationDataId)) {
      errors.push(`Location ${ref.id} references unknown locationDataId: ${ref.locationDataId}`);
    }
  }

  // Check connections reference valid locations
  const locationIds = new Set(world.locations.map((l) => l.id));
  for (const conn of world.connections) {
    if (!locationIds.has(conn.from)) {
      errors.push(`Connection references unknown location: ${conn.from}`);
    }
    if (!locationIds.has(conn.to)) {
      errors.push(`Connection references unknown location: ${conn.to}`);
    }
  }

  // Check starting location exists
  if (!locationIds.has(world.startingLocationId)) {
    errors.push(`Starting location not found: ${world.startingLocationId}`);
  }

  return errors;
}

/**
 * Get travel info between two locations
 */
export function getTravelInfo(
  loadedWorld: LoadedWorld,
  fromId: string,
  toId: string
): { travelTime: number; danger: string; method: string } | null {
  const connection = loadedWorld.world.connections.find(
    (c) =>
      (c.from === fromId && c.to === toId) ||
      (c.bidirectional && c.from === toId && c.to === fromId)
  );

  if (!connection) return null;

  return {
    travelTime: connection.travelTime,
    danger: connection.danger,
    method: connection.method,
  };
}
