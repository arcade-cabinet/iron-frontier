/**
 * World Validation & Utility Functions
 */

import type { Connection, LocationRef, Region, World, WorldCoord } from './schemas.ts';
import { ConnectionSchema, LocationRefSchema, RegionSchema, WorldSchema } from './schemas.ts';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateWorld(data: unknown): World {
  return WorldSchema.parse(data);
}

export function validateRegion(data: unknown): Region {
  return RegionSchema.parse(data);
}

export function validateLocationRef(data: unknown): LocationRef {
  return LocationRefSchema.parse(data);
}

export function validateConnection(data: unknown): Connection {
  return ConnectionSchema.parse(data);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getLocationsInRegion(world: World, regionId: string): LocationRef[] {
  const region = world.regions.find((r) => r.id === regionId);
  if (!region) return [];

  return world.locations.filter(
    (loc) =>
      loc.coord.wx >= region.bounds.minX &&
      loc.coord.wx <= region.bounds.maxX &&
      loc.coord.wy >= region.bounds.minY &&
      loc.coord.wy <= region.bounds.maxY
  );
}

export function getConnectionsFrom(world: World, locationId: string): Connection[] {
  return world.connections.filter(
    (c) => c.from === locationId || (c.bidirectional && c.to === locationId)
  );
}

export function getRegionAt(world: World, coord: WorldCoord): Region | undefined {
  return world.regions.find(
    (r) =>
      coord.wx >= r.bounds.minX &&
      coord.wx <= r.bounds.maxX &&
      coord.wy >= r.bounds.minY &&
      coord.wy <= r.bounds.maxY
  );
}

export function getLocationAt(world: World, coord: WorldCoord): LocationRef | undefined {
  return world.locations.find((loc) => loc.coord.wx === coord.wx && loc.coord.wy === coord.wy);
}

export function worldDistance(a: WorldCoord, b: WorldCoord): number {
  return Math.abs(a.wx - b.wx) + Math.abs(a.wy - b.wy);
}
