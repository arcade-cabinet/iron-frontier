/**
 * Iron Frontier - SPATIAL Schema Definitions
 *
 * These schemas define STRUCTURE only - where things ARE, not what they DO.
 * Behavior is injected at runtime based on slots, markers, and zones.
 *
 * Design principle: Generate once, reprogram infinitely.
 *
 * SLOTS - Functional roles that can be filled ("tavern", "law_office")
 * MARKERS - Named points for spawning/interaction ("bar_counter", "jail_cell")
 * ZONES - Areas that can be dynamically populated ("quest_staging", "loot_area")
 * TAGS - Semantic labels for filtering and matching
 */

import { z } from 'zod';

// ============================================================================
// PRIMITIVES
// ============================================================================

export const HexCoordSchema = z.object({
  q: z.number().int(),
  r: z.number().int(),
});
export type HexCoord = z.infer<typeof HexCoordSchema>;

export const WorldPosSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type WorldPos = z.infer<typeof WorldPosSchema>;

export const HexRotationSchema = z.number().int().min(0).max(5);

// ============================================================================
// TERRAIN & VISUALS (what it LOOKS like, not what it DOES)
// ============================================================================

export const TerrainTypeSchema = z.enum([
  // Natural
  'grass', 'grass_hill', 'grass_forest',
  'sand', 'sand_hill', 'sand_dunes',
  'dirt', 'dirt_hill',
  'stone', 'stone_hill', 'stone_mountain', 'stone_rocks',
  'water', 'water_shallow', 'water_deep',
  'mesa', 'canyon', 'badlands',
]);

export const FeatureTypeSchema = z.enum([
  'none',
  // Vegetation
  'tree', 'tree_dead', 'bush', 'cactus', 'cactus_tall', 'stump', 'log',
  // Rocks
  'rock_small', 'rock_large', 'boulder',
  // Visual-only resources (actual resource spawning is runtime)
  'ore_vein', 'oil_seep', 'spring',
  // Western Town Props
  'barrel', 'barrel_water', 'barrel_hay',
  'fence', 'bench', 'cart', 'wanted_poster', 'signpost',
  // Ambient
  'ruins', 'campfire_pit',
]);

export const StructureTypeSchema = z.enum([
  'none',
  // These are VISUAL MODELS only - functionality comes from slots
  // Residential shells
  'cabin', 'house', 'mansion',
  // Commercial shells
  'saloon_building', 'store_building', 'bank_building', 'hotel_building',
  // Industrial shells
  'mine_building', 'smelter_building', 'workshop_building', 'windmill', 'water_tower',
  // Civic shells
  'office_building', 'church_building', 'station_building', 'telegraph_building',
  // Infrastructure
  'well', 'stable', 'warehouse', 'dock',
  // Defensive
  'watch_tower', 'fort',
]);

export const EdgeTypeSchema = z.enum([
  'none', 'river', 'road', 'railroad', 'cliff', 'bridge', 'ford', 'fence',
]);

// ============================================================================
// SLOTS - Functional roles (WHAT a place IS FOR)
// ============================================================================

/**
 * Slot types define the FUNCTION of a location.
 * Game logic binds behavior to slots, not to specific buildings.
 *
 * Example: Any building with slot="tavern" gets tavern behaviors,
 * regardless of whether it's a fancy saloon or a dingy shack.
 */
export const SlotTypeSchema = z.enum([
  // Commerce
  'tavern',           // Social hub, rumors, recruiting
  'general_store',    // Buy/sell general goods
  'gunsmith',         // Weapons and ammo
  'doctor',           // Healing, medicine
  'bank',             // Money storage, loans
  'hotel',            // Rest, long-term storage
  'stable',           // Mount purchase/storage

  // Civic
  'law_office',       // Sheriff, bounties, justice
  'church',           // Healing, moral quests, sanctuary
  'telegraph',        // News, long-distance communication
  'train_station',    // Fast travel, cargo

  // Industrial
  'mine',             // Resource extraction
  'smelter',          // Processing
  'workshop',         // Crafting
  'farm',             // Agricultural production
  'ranch',            // Animal husbandry

  // Residential
  'residence',        // Generic home (NPC or player)
  'residence_wealthy', // Rich NPC home (better loot potential)
  'residence_poor',   // Poor NPC home

  // Wilderness & Camps
  'camp',             // Temporary encampment
  'hideout',          // Bandit/outlaw hideout
  'waystation',       // Rest stop on trails
  'water_source',     // Oasis, spring, well in wilderness
  'landmark',         // Natural landmark (rocks, canyon, etc)

  // Ruins & Abandoned
  'ruins',            // Abandoned structures

  // Special
  'quest_location',   // Dynamically assigned for quests
  'hidden_cache',     // Secret areas
  'ambush_point',     // Danger zones
  'meeting_point',    // NPC gatherings
]);
export type SlotType = z.infer<typeof SlotTypeSchema>;

// ============================================================================
// MARKERS - Named points within a slot
// ============================================================================

/**
 * Markers are specific points within a slot where things can happen.
 * They're like "sockets" that game logic can plug into.
 */
export const MarkerTypeSchema = z.enum([
  // Universal
  'entrance',         // Main entry point
  'exit',             // Alternative exit
  'spawn_point',      // Where NPCs appear

  // Interaction
  'counter',          // Service counter (shops, bars)
  'desk',             // Work desk (offices)
  'bed',              // Sleeping spot
  'chair',            // Sitting spot
  'table',            // Gathering spot

  // Functional
  'storage',          // Where containers can go
  'display',          // Where items are shown (shop windows)
  'workbench',        // Crafting spot

  // Quest/Event
  'evidence_spot',    // Where clues can be placed
  'hiding_spot',      // Where things/people hide
  'ambush_trigger',   // Where combat can start
  'conversation_spot', // Where important talks happen

  // Special
  'cell',             // Jail cell
  'vault',            // Secure storage
  'altar',            // Religious spot
  'stage',            // Performance area

  // Wilderness/Camp
  'rest_spot',        // Where player can rest outdoors
  'vantage_point',    // Elevated lookout position
]);
export type MarkerType = z.infer<typeof MarkerTypeSchema>;

export const MarkerSchema = z.object({
  /** Marker type */
  type: MarkerTypeSchema,
  /** Unique name within the slot (e.g., "main_counter", "cell_1") */
  name: z.string(),
  /** Position relative to slot anchor */
  offset: HexCoordSchema,
  /** Facing direction (0-5) */
  facing: HexRotationSchema.optional(),
  /** Tags for additional filtering */
  tags: z.array(z.string()).default([]),
});
export type Marker = z.infer<typeof MarkerSchema>;

// ============================================================================
// ZONES - Areas that can be dynamically filled
// ============================================================================

/**
 * Zones are areas within a slot that can be populated at runtime.
 * Think of them as "fill regions" for procedural content.
 */
export const ZoneTypeSchema = z.enum([
  'loot_area',        // Containers can spawn here
  'npc_area',         // NPCs can wander here
  'combat_area',      // Fighting can happen here
  'combat_zone',      // Tactical combat zone (ambush, flanking)
  'event_stage',      // Events can be staged here
  'decoration_area',  // Random props can fill here
  'restricted_area',  // Player shouldn't normally access
  'public_area',      // Always accessible
]);
export type ZoneType = z.infer<typeof ZoneTypeSchema>;

export const ZoneSchema = z.object({
  /** Zone type */
  type: ZoneTypeSchema,
  /** Unique name within the slot */
  name: z.string(),
  /** Tiles that make up this zone (relative to slot anchor) */
  tiles: z.array(HexCoordSchema).min(1),
  /** Priority when zones overlap (higher = takes precedence) */
  priority: z.number().int().optional(),
  /** Tags for filtering */
  tags: z.array(z.string()).optional(),
});
export type Zone = z.infer<typeof ZoneSchema>;

// ============================================================================
// TILE DEFINITION (visual only)
// ============================================================================

export const TileDefSchema = z.object({
  coord: HexCoordSchema,
  terrain: TerrainTypeSchema,
  elevation: z.number().int().min(0).max(4).optional(),
  feature: FeatureTypeSchema.optional(),
  structure: StructureTypeSchema.optional(),
  structureRotation: HexRotationSchema.optional(),
  edges: z.array(EdgeTypeSchema).length(6).optional(),
  variant: z.number().int().min(0).max(3).optional(),
});
export type TileDef = z.infer<typeof TileDefSchema>;

// ============================================================================
// SLOT INSTANCE - A functional area within a location
// ============================================================================

/**
 * A slot instance is a functional area placed in a town.
 * It has a type (what it does), visual tiles (what it looks like),
 * and markers/zones (where things can happen).
 */
export const SlotInstanceSchema = z.object({
  /** Unique ID within the location */
  id: z.string(),

  /** Functional type - game logic binds to this */
  type: SlotTypeSchema,

  /** Human-readable name (for debugging/editors) */
  name: z.string().optional(),

  /** Anchor position in location coordinates */
  anchor: HexCoordSchema,

  /** Rotation (0-5) */
  rotation: HexRotationSchema.default(0),

  /** Visual tiles (relative to anchor) */
  tiles: z.array(TileDefSchema).min(1),

  /** Interaction markers */
  markers: z.array(MarkerSchema).default([]),

  /** Fillable zones */
  zones: z.array(ZoneSchema).default([]),

  /** Tags for filtering/matching */
  tags: z.array(z.string()).default([]),

  /**
   * Importance level (affects NPC assignment, quest placement)
   * 1 = minor, 5 = critical to town function
   */
  importance: z.number().int().min(1).max(5).default(3),
});
export type SlotInstance = z.infer<typeof SlotInstanceSchema>;

// ============================================================================
// ASSEMBLAGE - Reusable slot template
// ============================================================================

/**
 * Assemblage is a TEMPLATE for creating slot instances.
 * It defines the visual layout AND the functional slots within.
 *
 * A "Saloon" assemblage might include:
 * - The building tiles
 * - A "tavern" slot with markers for bar, tables, stage
 * - Zones for patron areas, back rooms
 */
export const AssemblageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),

  /** Primary slot type this assemblage provides */
  primarySlot: SlotTypeSchema,

  /** Additional slots (e.g., a hotel might also have a tavern) */
  secondarySlots: z.array(SlotTypeSchema).default([]),

  /** All tiles in the assemblage */
  tiles: z.array(TileDefSchema).min(1),

  /** Marker definitions (positions relative to anchor) */
  markers: z.array(MarkerSchema).default([]),

  /** Zone definitions */
  zones: z.array(ZoneSchema).default([]),

  /** Placement constraints */
  validRotations: z.array(HexRotationSchema).default([0, 1, 2, 3, 4, 5]),
  requiredTerrain: z.array(TerrainTypeSchema).optional(),
  forbiddenTerrain: z.array(TerrainTypeSchema).optional(),
  minWaterDistance: z.number().int().min(0).default(0),
  requiresRoadAccess: z.boolean().default(false),
});
export type Assemblage = z.infer<typeof AssemblageSchema>;

// ============================================================================
// ASSEMBLAGE REFERENCE - For placing assemblages in locations
// ============================================================================

/**
 * Reference to place an assemblage from the library into a location.
 * This allows town planners to compose locations from reusable pieces.
 */
export const AssemblageRefSchema = z.object({
  /** Reference to assemblage ID in the library */
  assemblageId: z.string(),

  /** Unique instance ID within this location */
  instanceId: z.string(),

  /** Position of assemblage anchor in location coordinates */
  anchor: HexCoordSchema,

  /** Rotation (0-5) */
  rotation: HexRotationSchema.default(0),

  /** Override the slot type (if different from assemblage default) */
  slotTypeOverride: SlotTypeSchema.optional(),

  /** Additional tags for this instance */
  tags: z.array(z.string()).default([]),

  /** Importance override */
  importance: z.number().int().min(1).max(5).optional(),
});
export type AssemblageRef = z.infer<typeof AssemblageRefSchema>;

// ============================================================================
// ENTRY POINT - Where players enter/exit
// ============================================================================

export const EntryPointSchema = z.object({
  id: z.string(),
  coord: HexCoordSchema,
  direction: z.enum(['north', 'south', 'east', 'west', 'up', 'down']),
  /** What this entry connects to (road, railroad, etc) */
  connectionType: z.enum(['road', 'trail', 'railroad', 'river', 'stairs', 'portal']).optional(),
  /** Tags for matching (e.g., "main_entrance", "secret_exit") */
  tags: z.array(z.string()).default([]),
});
export type EntryPoint = z.infer<typeof EntryPointSchema>;

// ============================================================================
// LOCATION - A complete map (town, dungeon, encounter, etc)
// ============================================================================

export const LocationTypeSchema = z.enum([
  'town', 'city', 'village', 'outpost',
  'mine', 'camp', 'ranch', 'fort',
  'ruins', 'cave', 'encounter', 'special',
]);

export const LocationSizeSchema = z.enum([
  'tiny',      // 1-3 slots
  'small',     // 4-8 slots
  'medium',    // 9-20 slots
  'large',     // 21-50 slots
  'huge',      // 50+ slots
]);

/**
 * Location - A complete spatial definition.
 *
 * Contains ONLY:
 * - Where things are (slots, tiles)
 * - What roles exist (slot types)
 * - Where things can happen (markers, zones)
 *
 * Does NOT contain:
 * - Specific NPCs (injected at runtime based on slots)
 * - Specific items (spawned based on zones)
 * - Quest states (determined by game logic)
 */
export const LocationSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Location type */
  type: LocationTypeSchema,

  /** Size category */
  size: LocationSizeSchema,

  /** Flavor text (for world-building, NOT behavior) */
  description: z.string().optional(),
  lore: z.string().optional(),

  /** Generation seed */
  seed: z.number().int(),

  /** Map dimensions */
  width: z.number().int().min(8).max(128),
  height: z.number().int().min(8).max(128),

  /** Base terrain for empty tiles */
  baseTerrain: TerrainTypeSchema,

  /** All slot instances in this location (inline definitions) */
  slots: z.array(SlotInstanceSchema).default([]),

  /**
   * Assemblage references - place assemblages from the library.
   * These get expanded into slots at load time.
   */
  assemblages: z.array(AssemblageRefSchema).default([]),

  /**
   * Override tiles - raw tiles that aren't part of any slot
   * Used for roads, terrain shaping, decorative areas
   */
  baseTiles: z.array(TileDefSchema).default([]),

  /** Entry/exit points */
  entryPoints: z.array(EntryPointSchema).min(1),

  /**
   * Player spawn point - where the player appears when entering this location.
   * Town planners designate this explicitly.
   * If not specified, defaults to first entry point.
   */
  playerSpawn: z.object({
    coord: HexCoordSchema,
    facing: HexRotationSchema.optional(), // Direction player faces (0-5)
  }).optional(),

  /** Tags for filtering/matching */
  tags: z.array(z.string()).default([]),

  /**
   * Atmosphere hints (for runtime systems, not hardcoded behavior)
   * These are SUGGESTIONS that game logic can use
   */
  atmosphere: z.object({
    /** General danger level (affects random spawns) */
    dangerLevel: z.number().int().min(0).max(10).default(0),
    /** Economic prosperity (affects loot, prices) */
    wealthLevel: z.number().int().min(1).max(10).default(5),
    /** Population density hint */
    populationDensity: z.enum(['abandoned', 'sparse', 'normal', 'crowded']).default('normal'),
    /** Lawfulness (affects NPC behavior) */
    lawLevel: z.enum(['lawless', 'frontier', 'orderly', 'strict']).default('frontier'),
  }).default(() => ({
    dangerLevel: 0,
    wealthLevel: 5,
    populationDensity: 'normal' as const,
    lawLevel: 'frontier' as const,
  })),
});
export type Location = z.infer<typeof LocationSchema>;

// ============================================================================
// WORLD LOCATION - Entry on the world map
// ============================================================================

export const WorldLocationSchema = z.object({
  /** Reference to location data */
  locationId: z.string(),
  /** Position on world map */
  worldPos: WorldPosSchema,
  /** Is it visible on map initially? */
  startDiscovered: z.boolean().default(false),
  /** Icon type */
  icon: z.enum([
    'town', 'city', 'village', 'camp', 'mine',
    'fort', 'ruins', 'cave', 'special', 'unknown',
  ]),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type WorldLocation = z.infer<typeof WorldLocationSchema>;

// ============================================================================
// REGION - World map area
// ============================================================================

export const RegionBiomeSchema = z.enum([
  'desert', 'grassland', 'badlands', 'mountains',
  'forest', 'swamp', 'tundra',
]);

export const WorldPathSchema = z.object({
  id: z.string(),
  type: z.enum(['road', 'railroad', 'trail', 'river']),
  points: z.array(WorldPosSchema).min(2),
  /** Travel speed modifier */
  speedModifier: z.number().min(0.1).max(5).default(1),
  tags: z.array(z.string()).default([]),
});
export type WorldPath = z.infer<typeof WorldPathSchema>;

export const RegionSchema = z.object({
  id: z.string(),
  name: z.string(),
  biome: RegionBiomeSchema,
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

  /** Paths */
  paths: z.array(WorldPathSchema).default([]),

  /** Atmosphere (hints for runtime) */
  atmosphere: z.object({
    baseDangerLevel: z.number().int().min(0).max(10).default(1),
    encounterDensity: z.enum(['none', 'rare', 'occasional', 'frequent']).default('occasional'),
  }).default(() => ({
    baseDangerLevel: 1,
    encounterDensity: 'occasional' as const,
  })),

  tags: z.array(z.string()).default([]),
});
export type Region = z.infer<typeof RegionSchema>;

// ============================================================================
// WORLD - Top level container
// ============================================================================

export const WorldSchema = z.object({
  name: z.string(),
  version: z.string(),
  seed: z.number().int(),

  worldSize: z.object({
    width: z.number().int().min(100).max(10000),
    height: z.number().int().min(100).max(10000),
  }),

  regions: z.array(RegionSchema),

  /** Starting point for new games */
  startingPoint: z.object({
    regionId: z.string(),
    locationId: z.string(),
    entryPointId: z.string(),
  }),

  tags: z.array(z.string()).default([]),
});
export type World = z.infer<typeof WorldSchema>;

// ============================================================================
// VALIDATION
// ============================================================================

export function validateAssemblage(data: unknown): Assemblage {
  return AssemblageSchema.parse(data);
}

export function validateLocation(data: unknown): Location {
  return LocationSchema.parse(data);
}

export function validateRegion(data: unknown): Region {
  return RegionSchema.parse(data);
}

export function validateWorld(data: unknown): World {
  return WorldSchema.parse(data);
}

export const SCHEMA_VERSION = '2.0.0';
