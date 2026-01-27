/**
 * HexTypes.ts - Type definitions for the hex-tile map system
 *
 * Iron Frontier uses a hex grid for terrain tiles, providing organic-looking
 * landscapes that fit the steampunk western aesthetic. This module defines
 * all types, enums, and interfaces for the hex system.
 *
 * Coordinate System: Axial coordinates (q, r) where:
 * - q: column (east-west axis)
 * - r: row (northwest-southeast axis)
 * - s: derived as (-q - r) for cube coordinates when needed
 *
 * The hex tiles are flat-topped (pointy sides face north/south).
 */

// ============================================================================
// HEX TILE TYPES - Based on Kenney Hexagon Kit
// ============================================================================

/**
 * Base terrain types matching Kenney Hexagon Kit assets.
 * These represent the primary ground surface of each tile.
 */
export enum HexTerrainType {
  // Natural terrain
  Grass = 'grass',
  GrassHill = 'grass_hill',
  GrassForest = 'grass_forest',

  Sand = 'sand',
  SandHill = 'sand_hill',
  SandDunes = 'sand_dunes',

  Dirt = 'dirt',
  DirtHill = 'dirt_hill',

  Stone = 'stone',
  StoneHill = 'stone_hill',
  StoneMountain = 'stone_mountain',
  StoneRocks = 'stone_rocks',

  // Water
  Water = 'water',
  WaterShallow = 'water_shallow',
  WaterDeep = 'water_deep',

  // Special terrain
  Lava = 'lava',
  Snow = 'snow',
  Ice = 'ice',

  // Western-specific
  Mesa = 'mesa',
  Canyon = 'canyon',
  Badlands = 'badlands',
}

/**
 * Elevation levels for hex tiles.
 * Each level represents a discrete height step.
 */
export enum HexElevation {
  Water = -1, // Below ground level (rivers, lakes)
  Ground = 0, // Base ground level
  Low = 1, // Slight elevation (small hills)
  Medium = 2, // Medium elevation (hills)
  High = 3, // High elevation (large hills, plateaus)
  Mountain = 4, // Mountain peaks
}

/**
 * Edge features that connect between adjacent tiles.
 * Used for rivers, roads, railways, and cliffs.
 */
export enum HexEdgeType {
  None = 'none',
  River = 'river',
  Road = 'road',
  Railroad = 'railroad',
  Cliff = 'cliff',
  Bridge = 'bridge',
  Ford = 'ford', // Shallow river crossing
  Fence = 'fence',
}

/**
 * Features that can be placed on top of a hex tile.
 * These are decorative or functional overlays.
 */
export enum HexFeatureType {
  None = 'none',

  // Vegetation
  Tree = 'tree',
  TreeDead = 'tree_dead',
  Bush = 'bush',
  Cactus = 'cactus',
  CactusTall = 'cactus_tall',
  Stump = 'stump',
  Log = 'log',

  // Rocks
  RockSmall = 'rock_small',
  RockLarge = 'rock_large',
  Boulder = 'boulder',

  // Resources
  OreDeposit = 'ore_deposit',
  OilSeep = 'oil_seep',
  Spring = 'spring',

  // Western Props - Town decoration
  Barrel = 'barrel',
  BarrelWater = 'barrel_water',
  BarrelHay = 'barrel_hay',
  Fence = 'fence',
  Bench = 'bench',
  Cart = 'cart',
  WantedPoster = 'wanted_poster',
  Signpost = 'signpost',

  // Ruins/Special
  Ruins = 'ruins',
  Camp = 'camp',
}

/**
 * Building types that can occupy a hex tile.
 * Buildings are centered on their tile and may span multiple tiles.
 */
export enum HexBuildingType {
  None = 'none',

  // Residential
  Cabin = 'cabin',
  House = 'house',
  Mansion = 'mansion',

  // Commercial
  Saloon = 'saloon',
  GeneralStore = 'general_store',
  Bank = 'bank',
  Hotel = 'hotel',

  // Industrial
  Mine = 'mine',
  Smelter = 'smelter',
  Workshop = 'workshop',
  Windmill = 'windmill',
  WaterTower = 'water_tower',

  // Civic
  SheriffOffice = 'sheriff_office',
  Church = 'church',
  TrainStation = 'train_station',
  Telegraph = 'telegraph',

  // Infrastructure
  Well = 'well',
  Stable = 'stable',
  Warehouse = 'warehouse',
  Dock = 'dock',

  // Defensive
  WatchTower = 'watch_tower',
  Fort = 'fort',
}

// ============================================================================
// HEX COORDINATE TYPES
// ============================================================================

/**
 * Axial hex coordinate (q, r).
 * This is the primary coordinate system used throughout the game.
 */
export interface HexCoord {
  readonly q: number; // Column
  readonly r: number; // Row
}

/**
 * Cube hex coordinate (q, r, s) where q + r + s = 0.
 * Used for distance calculations and rotations.
 */
export interface HexCubeCoord {
  readonly q: number;
  readonly r: number;
  readonly s: number;
}

/**
 * Fractional hex coordinate for precise positioning.
 * Used during world-to-hex conversions.
 */
export interface FractionalHexCoord {
  readonly q: number;
  readonly r: number;
}

/**
 * World-space position (x, y, z) in meters.
 * Used for Babylon.js rendering.
 */
export interface WorldPosition {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

// ============================================================================
// HEX TILE DATA
// ============================================================================

/**
 * Edge connectivity data for a single hex tile.
 * Hex tiles have 6 edges, indexed 0-5 starting from east and going clockwise.
 *
 * Edge indices (flat-topped hex):
 *   0: East (E)
 *   1: Southeast (SE)
 *   2: Southwest (SW)
 *   3: West (W)
 *   4: Northwest (NW)
 *   5: Northeast (NE)
 */
export interface HexEdges {
  readonly edges: readonly [
    HexEdgeType, // 0: E
    HexEdgeType, // 1: SE
    HexEdgeType, // 2: SW
    HexEdgeType, // 3: W
    HexEdgeType, // 4: NW
    HexEdgeType, // 5: NE
  ];
}

/**
 * Complete data for a single hex tile.
 */
export interface HexTileData {
  readonly coord: HexCoord;
  readonly terrain: HexTerrainType;
  readonly elevation: HexElevation;
  readonly edges: HexEdges;
  readonly feature: HexFeatureType;
  readonly building: HexBuildingType;
  readonly buildingRotation: number; // 0-5 for 60-degree increments

  // Flags
  readonly isPassable: boolean;
  readonly isWater: boolean;
  readonly isBuildable: boolean;

  // Rendering hints
  readonly modelVariant: number; // 0-3 for random model variation
  readonly rotationOffset: number; // 0-5 for visual rotation variety
}

/**
 * Default empty tile data factory.
 */
export function createEmptyTile(coord: HexCoord): HexTileData {
  return {
    coord,
    terrain: HexTerrainType.Grass,
    elevation: HexElevation.Ground,
    edges: {
      edges: [
        HexEdgeType.None,
        HexEdgeType.None,
        HexEdgeType.None,
        HexEdgeType.None,
        HexEdgeType.None,
        HexEdgeType.None,
      ],
    },
    feature: HexFeatureType.None,
    building: HexBuildingType.None,
    buildingRotation: 0,
    isPassable: true,
    isWater: false,
    isBuildable: true,
    modelVariant: 0,
    rotationOffset: 0,
  };
}

// ============================================================================
// HEX CHUNK SYSTEM
// ============================================================================

/**
 * Chunk coordinate for the hex chunk system.
 * Chunks group hex tiles for efficient loading/unloading.
 */
export interface HexChunkCoord {
  readonly cx: number;
  readonly cy: number;
}

/**
 * Configuration for the hex chunk system.
 */
export interface HexChunkConfig {
  readonly chunkRadius: number; // Hex tiles per chunk radius (default: 8)
  readonly viewDistance: number; // Chunks to load around player (default: 2)
  readonly unloadDistance: number; // Distance at which to unload chunks (default: 4)
}

export const DEFAULT_HEX_CHUNK_CONFIG: HexChunkConfig = {
  chunkRadius: 8,
  viewDistance: 2,
  unloadDistance: 4,
};

/**
 * Data for a chunk of hex tiles.
 */
export interface HexChunkData {
  readonly coord: HexChunkCoord;
  readonly tiles: Map<string, HexTileData>; // Key: "q,r"
  readonly generatedAt: number; // Timestamp
  readonly seed: number; // Generation seed
}

// ============================================================================
// HEX LAYOUT CONFIGURATION
// ============================================================================

/**
 * Hex grid orientation.
 */
export enum HexOrientation {
  FlatTop = 'flat', // Flat sides on top/bottom (pointy sides E/W)
  PointyTop = 'pointy', // Pointy sides on top/bottom (flat sides E/W)
}

/**
 * Layout configuration for hex-to-world coordinate conversion.
 */
export interface HexLayout {
  readonly orientation: HexOrientation;
  readonly size: number; // Distance from center to corner (meters)
  readonly origin: WorldPosition; // World origin for hex (0, 0)
  readonly spacing: number; // Additional spacing between tiles (default: 0)
}

/**
 * Default hex layout for Iron Frontier.
 * Uses flat-top hexes sized to match Kenney Hexagon Kit models.
 *
 * Kenney hex tiles are designed to tessellate when placed at specific intervals.
 * The models are scaled in HexTileLoader to fit the coordinate system.
 */
export const DEFAULT_HEX_LAYOUT: HexLayout = {
  orientation: HexOrientation.FlatTop,
  size: 1.0, // Base unit size - tiles will be scaled to match
  origin: { x: 0, y: 0, z: 0 },
  spacing: 0,
};

// ============================================================================
// HEX DIRECTION SYSTEM
// ============================================================================

/**
 * The six cardinal directions for a hex grid.
 * For flat-top hexes, direction 0 is East.
 */
export enum HexDirection {
  E = 0, // East
  SE = 1, // Southeast
  SW = 2, // Southwest
  W = 3, // West
  NW = 4, // Northwest
  NE = 5, // Northeast
}

/**
 * All hex directions as an array for iteration.
 */
export const HEX_DIRECTIONS: readonly HexDirection[] = [
  HexDirection.E,
  HexDirection.SE,
  HexDirection.SW,
  HexDirection.W,
  HexDirection.NW,
  HexDirection.NE,
] as const;

// ============================================================================
// BUILDING PLACEMENT
// ============================================================================

/**
 * Building footprint definition.
 * Defines which tiles a building occupies relative to its center.
 */
export interface BuildingFootprint {
  readonly buildingType: HexBuildingType;
  readonly tiles: readonly HexCoord[]; // Offsets from center tile
  readonly entranceDirection: HexDirection;
  readonly size: 'small' | 'medium' | 'large';
}

/**
 * Building placement validation result.
 */
export interface BuildingPlacementResult {
  readonly valid: boolean;
  readonly reason?: string;
  readonly affectedTiles: readonly HexCoord[];
}

// ============================================================================
// PATH/RIVER CONNECTIVITY
// ============================================================================

/**
 * A path segment connecting two hex tiles via an edge.
 */
export interface HexPathSegment {
  readonly from: HexCoord;
  readonly to: HexCoord;
  readonly edgeType: HexEdgeType;
}

/**
 * A complete path through the hex grid.
 */
export interface HexPath {
  readonly segments: readonly HexPathSegment[];
  readonly pathType: HexEdgeType;
  readonly totalLength: number;
}

// ============================================================================
// MODEL ASSET MAPPING
// ============================================================================

/**
 * Asset path configuration for hex tiles.
 */
export interface HexAssetConfig {
  readonly basePath: string;
  readonly terrainModels: Partial<Record<HexTerrainType, string[]>>;
  readonly featureModels: Partial<Record<HexFeatureType, string[]>>;
  readonly buildingModels: Partial<Record<HexBuildingType, string>>;
  readonly edgeModels: Partial<Record<HexEdgeType, string[]>>;
}

/**
 * Default asset paths for Kenney Hexagon Kit.
 */
export const DEFAULT_HEX_ASSET_CONFIG: HexAssetConfig = {
  basePath: 'assets/models/hex-tiles/',
  terrainModels: {
    [HexTerrainType.Grass]: ['grass.glb', 'grass_02.glb'],
    [HexTerrainType.Sand]: ['sand.glb', 'sand_02.glb'],
    [HexTerrainType.Dirt]: ['dirt.glb'],
    [HexTerrainType.Stone]: ['stone.glb'],
    [HexTerrainType.Water]: ['water.glb'],
  },
  featureModels: {
    [HexFeatureType.Tree]: ['tree.glb', 'tree_02.glb'],
    [HexFeatureType.Cactus]: ['cactus.glb'],
    [HexFeatureType.RockSmall]: ['rock_small.glb'],
    [HexFeatureType.RockLarge]: ['rock_large.glb'],
  },
  buildingModels: {},
  edgeModels: {
    [HexEdgeType.River]: ['river_straight.glb'],
    [HexEdgeType.Road]: ['road_straight.glb'],
  },
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Key generation for hex coordinates (used in Maps and Sets).
 */
export function hexKey(coord: HexCoord): string {
  return `${coord.q},${coord.r}`;
}

/**
 * Parse a hex key back to coordinates.
 */
export function parseHexKey(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

/**
 * Key generation for hex chunk coordinates.
 */
export function hexChunkKey(coord: HexChunkCoord): string {
  return `c${coord.cx},${coord.cy}`;
}

/**
 * Terrain passability lookup.
 */
export function isTerrainPassable(terrain: HexTerrainType): boolean {
  switch (terrain) {
    case HexTerrainType.Water:
    case HexTerrainType.WaterDeep:
    case HexTerrainType.Lava:
    case HexTerrainType.StoneMountain:
      return false;
    default:
      return true;
  }
}

/**
 * Terrain water check.
 */
export function isTerrainWater(terrain: HexTerrainType): boolean {
  return (
    terrain === HexTerrainType.Water ||
    terrain === HexTerrainType.WaterShallow ||
    terrain === HexTerrainType.WaterDeep
  );
}

/**
 * Terrain buildable check.
 */
export function isTerrainBuildable(terrain: HexTerrainType): boolean {
  switch (terrain) {
    case HexTerrainType.Water:
    case HexTerrainType.WaterShallow:
    case HexTerrainType.WaterDeep:
    case HexTerrainType.Lava:
    case HexTerrainType.StoneMountain:
    case HexTerrainType.Canyon:
      return false;
    default:
      return true;
  }
}
