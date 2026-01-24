/**
 * Iron Frontier World Schema Definitions
 *
 * Zod-backed DDL for procedural world generation.
 * These schemas define the grammar for:
 * - Assemblages (tile groupings)
 * - Towns (location maps)
 * - Regions (world map areas)
 * - The complete World
 *
 * Designed for parallel subagent generation - strict validation
 * ensures all generated content is compatible.
 */

import { z } from 'zod';

// ============================================================================
// PRIMITIVES
// ============================================================================

/** Hex coordinate in axial system */
export const HexCoordSchema = z.object({
  q: z.number().int(),
  r: z.number().int(),
});
export type HexCoordData = z.infer<typeof HexCoordSchema>;

/** World map position (separate from hex coords) */
export const WorldPosSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type WorldPosData = z.infer<typeof WorldPosSchema>;

/** Rotation in 60-degree increments (0-5) */
export const HexRotationSchema = z.number().int().min(0).max(5);

// ============================================================================
// TILE TYPES (matching HexTypes.ts enums)
// ============================================================================

export const TerrainTypeSchema = z.enum([
  'grass', 'grass_hill', 'grass_forest',
  'sand', 'sand_hill', 'sand_dunes',
  'dirt', 'dirt_hill',
  'stone', 'stone_hill', 'stone_mountain', 'stone_rocks',
  'water', 'water_shallow', 'water_deep',
  'mesa', 'canyon', 'badlands',
]);
export type TerrainType = z.infer<typeof TerrainTypeSchema>;

export const FeatureTypeSchema = z.enum([
  'none',
  'tree', 'tree_dead', 'bush', 'cactus', 'cactus_tall',
  'rock_small', 'rock_large', 'boulder',
  'ore_deposit', 'oil_seep', 'spring',
  'ruins', 'camp',
]);
export type FeatureType = z.infer<typeof FeatureTypeSchema>;

export const BuildingTypeSchema = z.enum([
  'none',
  // Residential
  'cabin', 'house', 'mansion',
  // Commercial
  'saloon', 'general_store', 'bank', 'hotel',
  // Industrial
  'mine', 'smelter', 'workshop', 'windmill', 'water_tower',
  // Civic
  'sheriff_office', 'church', 'train_station', 'telegraph',
  // Infrastructure
  'well', 'stable', 'warehouse', 'dock',
  // Defensive
  'watch_tower', 'fort',
]);
export type BuildingType = z.infer<typeof BuildingTypeSchema>;

export const EdgeTypeSchema = z.enum([
  'none', 'river', 'road', 'railroad', 'cliff', 'bridge', 'ford', 'fence',
]);
export type EdgeType = z.infer<typeof EdgeTypeSchema>;

// ============================================================================
// TILE DEFINITION
// ============================================================================

/** Single hex tile within an assemblage or town */
export const TileDefSchema = z.object({
  /** Relative position within the assemblage/town */
  coord: HexCoordSchema,

  /** Base terrain type */
  terrain: TerrainTypeSchema,

  /** Elevation level 0-4 */
  elevation: z.number().int().min(0).max(4).default(0),

  /** Feature on this tile (vegetation, rocks, etc) */
  feature: FeatureTypeSchema.default('none'),

  /** Building on this tile */
  building: BuildingTypeSchema.default('none'),

  /** Building rotation (0-5 = 0-300 degrees) */
  buildingRotation: HexRotationSchema.default(0),

  /** Edge connections [E, SE, SW, W, NW, NE] */
  edges: z.array(EdgeTypeSchema).length(6).optional(),

  /** Model variant for visual variety (0-3) */
  variant: z.number().int().min(0).max(3).default(0),
});
export type TileDef = z.infer<typeof TileDefSchema>;

// ============================================================================
// ASSEMBLAGE - Reusable tile groupings
// ============================================================================

export const AssemblageTypeSchema = z.enum([
  // Single buildings with surroundings
  'single_cabin', 'single_house', 'single_mansion',
  'single_saloon', 'single_store', 'single_bank',
  'single_church', 'single_sheriff',

  // Functional groups
  'ranch', 'farm', 'mine_entrance', 'lumber_camp',
  'train_depot', 'water_station',

  // Town features
  'town_square', 'main_street_segment', 'residential_block',
  'commercial_block', 'industrial_yard',

  // Decorative/filler
  'empty_lot', 'garden', 'graveyard', 'corral',

  // Special
  'custom',
]);
export type AssemblageType = z.infer<typeof AssemblageTypeSchema>;

/**
 * Assemblage - A reusable grouping of tiles
 * Like a prefab that can be placed in towns
 */
export const AssemblageSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Human-readable name */
  name: z.string(),

  /** Assemblage category */
  type: AssemblageTypeSchema,

  /** Description for editors/generation */
  description: z.string().optional(),

  /** Tags for filtering/selection */
  tags: z.array(z.string()).default([]),

  /**
   * Tile definitions - coordinates are relative to (0,0) anchor
   * The anchor tile should always exist at {q:0, r:0}
   */
  tiles: z.array(TileDefSchema).min(1),

  /** Valid rotations this assemblage supports (default: all) */
  validRotations: z.array(HexRotationSchema).default([0, 1, 2, 3, 4, 5]),

  /** Required terrain types this can be placed on */
  requiredTerrain: z.array(TerrainTypeSchema).optional(),

  /** Terrain types this CANNOT be placed on */
  forbiddenTerrain: z.array(TerrainTypeSchema).optional(),

  /** Minimum distance from water (in tiles) */
  minWaterDistance: z.number().int().min(0).default(0),

  /** Must be adjacent to road/path */
  requiresRoadAccess: z.boolean().default(false),
});
export type Assemblage = z.infer<typeof AssemblageSchema>;

// ============================================================================
// NPC DEFINITION
// ============================================================================

export const NPCRoleSchema = z.enum([
  'shopkeeper', 'bartender', 'sheriff', 'deputy',
  'blacksmith', 'doctor', 'preacher', 'banker',
  'rancher', 'miner', 'farmer', 'drifter',
  'outlaw', 'bounty_hunter', 'prospector',
  'train_conductor', 'telegraph_operator',
  'townsperson', 'child',
]);
export type NPCRole = z.infer<typeof NPCRoleSchema>;

export const NPCSchema = z.object({
  /** Unique identifier within the location */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Role determines behavior/dialogue */
  role: NPCRoleSchema,

  /** Starting hex position */
  spawnCoord: HexCoordSchema,

  /** Schedule: where they go at different times */
  schedule: z.array(z.object({
    time: z.enum(['morning', 'afternoon', 'evening', 'night']),
    coord: HexCoordSchema,
    activity: z.string().optional(),
  })).optional(),

  /** Dialogue tree reference */
  dialogueId: z.string().optional(),

  /** Shop inventory reference (if merchant) */
  shopId: z.string().optional(),

  /** Quest giver flags */
  quests: z.array(z.string()).default([]),

  /** Faction affiliation */
  faction: z.string().optional(),

  /** Is this NPC essential (can't die) */
  essential: z.boolean().default(false),
});
export type NPC = z.infer<typeof NPCSchema>;

// ============================================================================
// CONTAINER DEFINITION
// ============================================================================

export const ContainerTypeSchema = z.enum([
  'chest', 'crate', 'barrel', 'locker', 'safe',
  'desk', 'cabinet', 'grave', 'trash',
]);
export type ContainerType = z.infer<typeof ContainerTypeSchema>;

export const ContainerSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Container type (affects model) */
  type: ContainerTypeSchema,

  /** Position */
  coord: HexCoordSchema,

  /** Is it locked? */
  locked: z.boolean().default(false),

  /** Lock difficulty (if locked) */
  lockDifficulty: z.number().int().min(0).max(100).optional(),

  /** Key item ID (if locked) */
  keyId: z.string().optional(),

  /** Loot table reference */
  lootTable: z.string().optional(),

  /** Fixed items (override loot table) */
  fixedItems: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().int().min(1).default(1),
  })).optional(),

  /** Respawns? */
  respawns: z.boolean().default(false),
});
export type Container = z.infer<typeof ContainerSchema>;

// ============================================================================
// TOWN / LOCATION
// ============================================================================

export const LocationTypeSchema = z.enum([
  'town', 'city', 'village', 'outpost',
  'mine', 'camp', 'ranch', 'fort',
  'ruins', 'cave', 'special',
]);
export type LocationType = z.infer<typeof LocationTypeSchema>;

export const TownSizeSchema = z.enum([
  'tiny',      // 1-3 buildings (camp, outpost)
  'small',     // 4-8 buildings (village)
  'medium',    // 9-20 buildings (town)
  'large',     // 21-50 buildings (large town)
  'huge',      // 50+ buildings (city)
]);
export type TownSize = z.infer<typeof TownSizeSchema>;

/** Placed assemblage within a town */
export const PlacedAssemblageSchema = z.object({
  /** Reference to assemblage definition */
  assemblageId: z.string(),

  /** Position of assemblage anchor in town coordinates */
  position: HexCoordSchema,

  /** Rotation (0-5) */
  rotation: HexRotationSchema.default(0),
});
export type PlacedAssemblage = z.infer<typeof PlacedAssemblageSchema>;

/**
 * Town / Location - A complete hex map location
 */
export const TownSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Location type */
  type: LocationTypeSchema,

  /** Size category */
  size: TownSizeSchema,

  /** Description */
  description: z.string().optional(),

  /** Lore/history text */
  lore: z.string().optional(),

  /** Generation seed (for reproducibility) */
  seed: z.number().int(),

  /** Map dimensions */
  width: z.number().int().min(8).max(128),
  height: z.number().int().min(8).max(128),

  /** Base biome for empty tiles */
  baseBiome: TerrainTypeSchema,

  /**
   * Assemblages placed in this town
   * These are layered ON TOP of base terrain
   */
  assemblages: z.array(PlacedAssemblageSchema).default([]),

  /**
   * Override tiles - specific tiles that override everything
   * Used for custom terrain shaping, roads, etc.
   */
  overrideTiles: z.array(TileDefSchema).default([]),

  /** NPCs in this location */
  npcs: z.array(NPCSchema).default([]),

  /** Containers */
  containers: z.array(ContainerSchema).default([]),

  /** Entry points from world map */
  entryPoints: z.array(z.object({
    id: z.string(),
    coord: HexCoordSchema,
    direction: z.enum(['north', 'south', 'east', 'west']),
    label: z.string().optional(),
  })).min(1),

  /** Connections to other locations (for fast travel, etc) */
  connections: z.array(z.object({
    targetLocationId: z.string(),
    type: z.enum(['road', 'railroad', 'trail', 'river']),
  })).default([]),

  /** Faction control */
  controllingFaction: z.string().optional(),

  /** Economy level (affects shops, prices) */
  economyLevel: z.number().int().min(1).max(10).default(5),

  /** Danger level (affects encounters nearby) */
  dangerLevel: z.number().int().min(0).max(10).default(0),

  /** Tags for generation/filtering */
  tags: z.array(z.string()).default([]),
});
export type Town = z.infer<typeof TownSchema>;

// ============================================================================
// REGION - World map area
// ============================================================================

export const RegionBiomeSchema = z.enum([
  'desert', 'grassland', 'badlands', 'mountains',
  'forest', 'swamp', 'tundra',
]);
export type RegionBiome = z.infer<typeof RegionBiomeSchema>;

/** Location marker on world map */
export const WorldLocationSchema = z.object({
  /** Reference to town/location data */
  locationId: z.string(),

  /** Position on world map */
  worldPos: WorldPosSchema,

  /** Is it discovered by player? (for new games) */
  startDiscovered: z.boolean().default(false),

  /** Icon to show on map */
  icon: z.enum([
    'town', 'city', 'village', 'camp', 'mine',
    'fort', 'ruins', 'cave', 'special', 'unknown',
  ]),
});
export type WorldLocation = z.infer<typeof WorldLocationSchema>;

/** Path on world map (road, railroad, river) */
export const WorldPathSchema = z.object({
  id: z.string(),
  type: z.enum(['road', 'railroad', 'trail', 'river']),
  /** Waypoints defining the path */
  points: z.array(WorldPosSchema).min(2),
  /** Travel speed modifier (1.0 = normal) */
  speedModifier: z.number().min(0.1).max(5).default(1),
});
export type WorldPath = z.infer<typeof WorldPathSchema>;

/** Random encounter definition */
export const EncounterDefSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Probability weight */
  weight: z.number().min(0).default(1),
  /** Required conditions */
  conditions: z.object({
    minDanger: z.number().int().min(0).max(10).optional(),
    maxDanger: z.number().int().min(0).max(10).optional(),
    biomes: z.array(RegionBiomeSchema).optional(),
    timeOfDay: z.array(z.enum(['day', 'night'])).optional(),
  }).optional(),
  /** Encounter map template */
  mapTemplate: z.string().optional(),
  /** Enemy spawn table */
  enemyTable: z.string().optional(),
});
export type EncounterDef = z.infer<typeof EncounterDefSchema>;

/**
 * Region - A world map area
 */
export const RegionSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Primary biome */
  biome: RegionBiomeSchema,

  /** Description */
  description: z.string().optional(),

  /** Bounding box on world map */
  bounds: z.object({
    minX: z.number(),
    minY: z.number(),
    maxX: z.number(),
    maxY: z.number(),
  }),

  /** Locations in this region */
  locations: z.array(WorldLocationSchema).default([]),

  /** Paths in this region */
  paths: z.array(WorldPathSchema).default([]),

  /** Base danger level */
  dangerLevel: z.number().int().min(0).max(10).default(1),

  /** Random encounter table */
  encounters: z.array(EncounterDefSchema).default([]),

  /** Controlling faction (if any) */
  controllingFaction: z.string().optional(),
});
export type Region = z.infer<typeof RegionSchema>;

// ============================================================================
// WORLD - Everything
// ============================================================================

/**
 * World - Complete game world definition
 */
export const WorldSchema = z.object({
  /** World name */
  name: z.string(),

  /** Version for save compatibility */
  version: z.string(),

  /** Master seed */
  seed: z.number().int(),

  /** World map dimensions */
  worldSize: z.object({
    width: z.number().int().min(100).max(10000),
    height: z.number().int().min(100).max(10000),
  }),

  /** All regions */
  regions: z.array(RegionSchema),

  /** Global faction definitions */
  factions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    /** Relations with other factions (-100 to 100) */
    relations: z.record(z.string(), z.number().int().min(-100).max(100)).default({}),
  })).default([]),

  /** Starting location for new games */
  startingLocation: z.object({
    regionId: z.string(),
    locationId: z.string(),
    coord: HexCoordSchema,
  }),

  /** Global timeline events */
  timeline: z.array(z.object({
    id: z.string(),
    day: z.number().int().min(0),
    event: z.string(),
    effects: z.array(z.string()).default([]),
  })).default([]),
});
export type World = z.infer<typeof WorldSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateAssemblage(data: unknown): Assemblage {
  return AssemblageSchema.parse(data);
}

export function validateTown(data: unknown): Town {
  return TownSchema.parse(data);
}

export function validateRegion(data: unknown): Region {
  return RegionSchema.parse(data);
}

export function validateWorld(data: unknown): World {
  return WorldSchema.parse(data);
}

// ============================================================================
// EXPORTS FOR SUBAGENT GENERATION
// ============================================================================

/**
 * Schema exports for documentation/subagent prompts
 */
export const SCHEMA_VERSION = '1.0.0';

export const SchemaExports = {
  Assemblage: AssemblageSchema,
  Town: TownSchema,
  Region: RegionSchema,
  World: WorldSchema,
} as const;
