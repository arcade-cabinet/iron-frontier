/**
 * IsometricTypes.ts - Type definitions for the isometric tile system
 *
 * Simple (x, y) grid coordinates for diamond-shaped tiles (squares rotated 45°).
 * Fallout 2-style isometric rendering with separate terrain and props layers.
 */

// ============================================================================
// GRID COORDINATES
// ============================================================================

export interface GridCoord {
  readonly x: number;
  readonly y: number;
}

export interface WorldPosition {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

// ============================================================================
// LAYOUT CONFIGURATION
// ============================================================================

export interface IsometricLayout {
  /** Size from center to corner (world units) */
  readonly tileSize: number;
  /** World origin for tile (0, 0) */
  readonly origin: WorldPosition;
}

export const DEFAULT_ISOMETRIC_LAYOUT: IsometricLayout = {
  tileSize: 0.5, // Small tiles for smooth Fallout 2-style movement
  origin: { x: 0, y: 0, z: 0 },
};

// ============================================================================
// TERRAIN TYPES (Ground layer with PBR textures)
// ============================================================================

export enum TerrainType {
  // Basic terrains
  Grass = 'grass',
  GrassDry = 'grass_dry',
  Sand = 'sand',
  SandDunes = 'sand_dunes',
  Dirt = 'dirt',
  DirtPath = 'dirt_path',
  Stone = 'stone',
  StoneRough = 'stone_rough',

  // Water
  Water = 'water',
  WaterShallow = 'water_shallow',

  // Western-specific
  Mesa = 'mesa',
  Badlands = 'badlands',
  Clay = 'clay',
}

// ============================================================================
// PROP TYPES (Objects placed on terrain)
// ============================================================================

export enum PropType {
  None = 'none',

  // Vegetation - Nature
  TreePine = 'tree_pine',
  TreeOak = 'tree_oak',
  TreeDead = 'tree_dead',
  TreeTwisted = 'tree_twisted',
  Bush = 'bush',
  BushFlowers = 'bush_flowers',
  Cactus = 'cactus',
  CactusTall = 'cactus_tall',
  GrassTuft = 'grass_tuft',
  Tumbleweed = 'tumbleweed',

  // Rocks
  RockSmall = 'rock_small',
  RockMedium = 'rock_medium',
  RockLarge = 'rock_large',
  Boulder = 'boulder',
  Pebbles = 'pebbles',

  // Western Props
  Barrel = 'barrel',
  BarrelStack = 'barrel_stack',
  Crate = 'crate',
  CrateStack = 'crate_stack',
  Cart = 'cart',
  Wagon = 'wagon',
  Fence = 'fence',
  FenceGate = 'fence_gate',
  Signpost = 'signpost',
  Hitching = 'hitching_post',
  Trough = 'water_trough',
  WaterWell = 'well',
  Windmill = 'windmill',
  WaterTower = 'water_tower',

  // Interactive
  Campfire = 'campfire',
  Lantern = 'lantern',
  Chest = 'chest',
}

// ============================================================================
// BUILDING TYPES (Multi-tile structures)
// ============================================================================

export enum BuildingType {
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

  // Public
  SheriffOffice = 'sheriff',
  Church = 'church',
  TrainStation = 'train_station',
  Telegraph = 'telegraph',

  // Military
  Fort = 'fort',
  WatchTower = 'watch_tower',
}

// ============================================================================
// RENDERING LAYERS
// ============================================================================

export enum RenderLayer {
  TERRAIN = 0,
  TERRAIN_DECAL = 1,
  PROPS_LOW = 2, // Rocks, bushes
  PROPS_MID = 3, // Barrels, fences
  CHARACTERS = 4, // NPCs and player
  PROPS_HIGH = 5, // Trees, poles
  BUILDINGS = 6,
  EFFECTS = 7,
}

// ============================================================================
// TILE DATA
// ============================================================================

export interface TerrainTileData {
  readonly coord: GridCoord;
  readonly terrain: TerrainType;
  readonly elevation: number; // 0.0 to 1.0
  readonly walkable: boolean;
  readonly pathCost: number; // Movement cost multiplier
  readonly variant: number; // 0-3 for texture variation
}

export interface PropPlacement {
  readonly id: string;
  readonly coord: GridCoord;
  readonly propType: PropType;
  readonly rotation: number; // Degrees
  readonly scale: number;
  readonly layer: RenderLayer;
  readonly blocking: boolean;
  readonly interactable: boolean;
}

export interface BuildingPlacement {
  readonly id: string;
  readonly origin: GridCoord; // Top-left corner
  readonly width: number;
  readonly height: number;
  readonly buildingType: BuildingType;
  readonly rotation: number; // 0, 90, 180, 270
  readonly entrances: GridCoord[];
}

// ============================================================================
// GRID STRUCTURE
// ============================================================================

export interface IsometricGrid {
  tiles: Map<string, TerrainTileData>;
  props: Map<string, PropPlacement>;
  buildings: Map<string, BuildingPlacement>;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  layout: IsometricLayout;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function tileKey(coord: GridCoord): string {
  return `${coord.x},${coord.y}`;
}

export function parseTileKey(key: string): GridCoord {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

export function createEmptyGrid(
  layout: IsometricLayout = DEFAULT_ISOMETRIC_LAYOUT
): IsometricGrid {
  return {
    tiles: new Map(),
    props: new Map(),
    buildings: new Map(),
    bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
    layout,
  };
}
