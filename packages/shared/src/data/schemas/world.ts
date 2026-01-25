/**
 * World Schema - Top-level structure for the game world
 *
 * Defines regions, location connections, and world map structure.
 * Follows the same decoupled spatial-only philosophy as location schemas.
 */

import { z } from 'zod';

// ============================================================================
// WORLD COORDINATES
// ============================================================================

/**
 * World map uses a simple grid coordinate system.
 * Each cell can contain a location or be wilderness.
 */
export const WorldCoordSchema = z.object({
  wx: z.number().int(),
  wy: z.number().int(),
});
export type WorldCoord = z.infer<typeof WorldCoordSchema>;

// ============================================================================
// REGION TYPES
// ============================================================================

/**
 * Biome types for world regions - affects terrain generation and atmosphere
 */
export const RegionBiomeSchema = z.enum([
  'desert', // Hot, sandy, cacti
  'badlands', // Rocky, canyons, mesas
  'grassland', // Plains, scattered trees
  'scrubland', // Dry grass, bushes
  'mountain', // Rocky peaks, mines
  'riverside', // Near water, fertile
  'salt_flat', // Barren, mineral deposits
]);
export type RegionBiome = z.infer<typeof RegionBiomeSchema>;

/**
 * Region danger levels - affects encounter frequency and difficulty
 */
export const DangerLevelSchema = z.enum([
  'safe', // Towns, patrolled roads
  'low', // Near civilization
  'moderate', // Frontier territory
  'high', // Bandit territory, wildlife
  'extreme', // Lawless, dangerous creatures
]);
export type DangerLevel = z.infer<typeof DangerLevelSchema>;

// ============================================================================
// LOCATION REFERENCE
// ============================================================================

/**
 * Location types that can exist in the world
 */
export const LocationTypeSchema = z.enum([
  // Settlements
  'city', // Large settlement, multiple districts
  'town', // Medium settlement, shops and services
  'village', // Small settlement, basic services
  'hamlet', // Tiny settlement, few buildings
  'outpost', // Frontier post, minimal services

  // Industrial
  'mine', // Mining operation
  'quarry', // Stone extraction
  'oil_field', // Oil drilling
  'lumber_camp', // Logging operation
  'ranch', // Cattle/horse ranch
  'farm', // Agricultural

  // Infrastructure
  'train_station', // Railroad stop
  'telegraph_office', // Communication hub
  'trading_post', // Remote commerce
  'waystation', // Rest stop on trails

  // Points of Interest
  'ruins', // Abandoned structures
  'cave', // Natural cavern
  'camp', // Temporary encampment
  'hideout', // Bandit/outlaw base
  'landmark', // Notable natural feature

  // Special
  'wilderness', // No specific location (procedural encounters)
]);
export type LocationType = z.infer<typeof LocationTypeSchema>;

/**
 * Reference to a location within the world
 */
export const LocationRefSchema = z.object({
  /** Unique location ID */
  id: z.string(),

  /** Location type */
  type: LocationTypeSchema,

  /** Display name */
  name: z.string(),

  /** World map position */
  coord: WorldCoordSchema,

  /** Reference to location data file (if hand-crafted) */
  locationDataId: z.string().optional(),

  /** Generation seed (for procedural locations) */
  seed: z.number().int().optional(),

  /** Size hint for procedural generation */
  size: z.enum(['tiny', 'small', 'medium', 'large', 'huge']).default('medium'),

  /** Is this location discovered by player? */
  discovered: z.boolean().default(false),

  /** Is this location visitable? (false = destroyed, locked, etc) */
  accessible: z.boolean().default(true),

  /** Tags for filtering and queries */
  tags: z.array(z.string()).default([]),
});
export type LocationRef = z.infer<typeof LocationRefSchema>;

// ============================================================================
// CONNECTIONS
// ============================================================================

/**
 * Travel method between locations
 */
export const TravelMethodSchema = z.enum([
  'road', // Maintained road (fast, safe)
  'trail', // Rough trail (slower, less safe)
  'wilderness', // Cross-country (slow, risky)
  'railroad', // Train travel (fast, very safe, requires station)
  'river', // Boat travel (moderate, follows waterways)
]);
export type TravelMethod = z.infer<typeof TravelMethodSchema>;

/**
 * Connection between two locations
 */
export const ConnectionSchema = z.object({
  /** Starting location ID */
  from: z.string(),

  /** Ending location ID */
  to: z.string(),

  /** Entry point ID at starting location */
  fromEntryPoint: z.string().optional(),

  /** Entry point ID at ending location */
  toEntryPoint: z.string().optional(),

  /** Primary travel method */
  method: TravelMethodSchema,

  /** Travel time in game hours */
  travelTime: z.number().positive(),

  /** Danger level of this route */
  danger: DangerLevelSchema.default('moderate'),

  /** Is this connection bidirectional? */
  bidirectional: z.boolean().default(true),

  /** Is this connection currently passable? */
  passable: z.boolean().default(true),

  /** Reason if not passable */
  blockedReason: z.string().optional(),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type Connection = z.infer<typeof ConnectionSchema>;

// ============================================================================
// REGION
// ============================================================================

/**
 * A region is a thematic area of the world map
 */
export const RegionSchema = z.object({
  /** Unique region ID */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Description for player */
  description: z.string(),

  /** Primary biome */
  biome: RegionBiomeSchema,

  /** Base danger level (locations may override) */
  baseDanger: DangerLevelSchema,

  /** World coordinates that belong to this region */
  bounds: z.object({
    minX: z.number().int(),
    maxX: z.number().int(),
    minY: z.number().int(),
    maxY: z.number().int(),
  }),

  /** Is this region discovered on world map? */
  discovered: z.boolean().default(false),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type Region = z.infer<typeof RegionSchema>;

// ============================================================================
// WORLD
// ============================================================================

/**
 * The complete world structure
 */
export const WorldSchema = z.object({
  /** World identifier */
  id: z.string(),

  /** World name */
  name: z.string(),

  /** World description */
  description: z.string(),

  /** Master seed for procedural generation */
  seed: z.number().int(),

  /** World dimensions in grid cells */
  dimensions: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),

  /** All regions in the world */
  regions: z.array(RegionSchema),

  /** All locations in the world */
  locations: z.array(LocationRefSchema),

  /** All connections between locations */
  connections: z.array(ConnectionSchema),

  /** Starting location ID for new games */
  startingLocationId: z.string(),

  /** World creation timestamp */
  createdAt: z.number().int().optional(),

  /** World version for migrations */
  version: z.number().int().default(1),
});
export type World = z.infer<typeof WorldSchema>;

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

/**
 * Get all locations in a region
 */
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

/**
 * Get all connections from a location
 */
export function getConnectionsFrom(world: World, locationId: string): Connection[] {
  return world.connections.filter(
    (c) => c.from === locationId || (c.bidirectional && c.to === locationId)
  );
}

/**
 * Get region at world coordinate
 */
export function getRegionAt(world: World, coord: WorldCoord): Region | undefined {
  return world.regions.find(
    (r) =>
      coord.wx >= r.bounds.minX &&
      coord.wx <= r.bounds.maxX &&
      coord.wy >= r.bounds.minY &&
      coord.wy <= r.bounds.maxY
  );
}

/**
 * Get location at world coordinate
 */
export function getLocationAt(world: World, coord: WorldCoord): LocationRef | undefined {
  return world.locations.find((loc) => loc.coord.wx === coord.wx && loc.coord.wy === coord.wy);
}

/**
 * Calculate Manhattan distance between world coordinates
 */
export function worldDistance(a: WorldCoord, b: WorldCoord): number {
  return Math.abs(a.wx - b.wx) + Math.abs(a.wy - b.wy);
}
