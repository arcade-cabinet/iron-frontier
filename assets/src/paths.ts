/**
 * Asset path constants for all 3D models.
 *
 * These paths are relative to the assets root directory.
 * On web, they resolve to /assets/models/...
 * The base path prefix is handled by the platform-specific loader.
 */

// Base path - can be overridden for different platforms
const MODELS_BASE = 'models';

/**
 * Character model paths
 */
export const CharacterAssets = {
  ENGINEER: `${MODELS_BASE}/characters/engineer.glb`,
  GUNSLINGER: `${MODELS_BASE}/characters/gunslinger.glb`,
  MAN_ADVENTURER: `${MODELS_BASE}/characters/man_adventurer.gltf`,
  MAN_FARMER: `${MODELS_BASE}/characters/man_farmer.gltf`,
  WOMAN_CASUAL: `${MODELS_BASE}/characters/woman_casual.gltf`,
  WOMAN_WORKER: `${MODELS_BASE}/characters/woman_worker.gltf`,
} as const;

/**
 * Weapon model paths
 */
export const WeaponAssets = {
  REVOLVER_FIXED: `${MODELS_BASE}/weapons/revolver-fixed.glb`,
  REVOLVER_ANIMATED: `${MODELS_BASE}/weapons/revolver-animated.glb`,
} as const;

/**
 * Structure/building model paths
 */
export const StructureAssets = {
  BARRIER: `${MODELS_BASE}/structures/barrier.glb`,
  FENCE: `${MODELS_BASE}/structures/fence.glb`,
  POST_SIGN: `${MODELS_BASE}/structures/postsign.glb`,
  RAIL: `${MODELS_BASE}/structures/rail.glb`,
  WATER_TOWER: `${MODELS_BASE}/structures/watertower.glb`,
  WELL: `${MODELS_BASE}/structures/well.glb`,
} as const;

/**
 * Furniture model paths
 */
export const FurnitureAssets = {
  OLD_BENCH: `${MODELS_BASE}/furniture/oldbench.glb`,
  OLD_CARPET: `${MODELS_BASE}/furniture/oldcarpet.glb`,
  PIANO: `${MODELS_BASE}/furniture/piano.glb`,
  POOL_TABLE: `${MODELS_BASE}/furniture/pooltable.glb`,
  WESTERN_BED: `${MODELS_BASE}/furniture/westernbed.glb`,
  WESTERN_CHAIR: `${MODELS_BASE}/furniture/westernchair.glb`,
  WESTERN_LOCKER: `${MODELS_BASE}/furniture/westernlocker.glb`,
  WESTERN_PLAY_TABLE: `${MODELS_BASE}/furniture/westernplaytable.glb`,
  WESTERN_TABLE: `${MODELS_BASE}/furniture/westerntable.glb`,
} as const;

/**
 * Container model paths
 */
export const ContainerAssets = {
  CHEST_BASE: `${MODELS_BASE}/containers/chest-base.glb`,
  CHEST_TOP: `${MODELS_BASE}/containers/chest-top.glb`,
  CRATE: `${MODELS_BASE}/containers/crate.glb`,
  DESTROYED_CRATE_1: `${MODELS_BASE}/containers/destroyedcrate1.glb`,
  DESTROYED_CRATE_2: `${MODELS_BASE}/containers/destroyedcrate2.glb`,
  DESTROYED_CRATE_3: `${MODELS_BASE}/containers/destroyedcrate3.glb`,
  DESTROYED_CRATE_4: `${MODELS_BASE}/containers/destroyedcrate4.glb`,
  DESTROYED_CRATE_5: `${MODELS_BASE}/containers/destroyedcrate5.glb`,
  DESTROYED_CRATE_6: `${MODELS_BASE}/containers/destroyedcrate6.glb`,
  WESTERN_BARREL: `${MODELS_BASE}/containers/westernbarrel.glb`,
  WESTERN_BARREL_HAY: `${MODELS_BASE}/containers/westernbarrel-hay.glb`,
  WESTERN_BARREL_WATER: `${MODELS_BASE}/containers/westernbarrel-water.glb`,
  WOOD_BARREL_DESTROYED: `${MODELS_BASE}/containers/woodbarreldestroyed.glb`,
  WOOD_BARREL_TOP_DESTROYED: `${MODELS_BASE}/containers/woodbarreltopdestroyed.glb`,
} as const;

/**
 * Nature/environment model paths
 */
export const NatureAssets = {
  BUSHES: `${MODELS_BASE}/nature/bushes.glb`,
  CACTUS_1: `${MODELS_BASE}/nature/cactus1.glb`,
  CACTUS_2: `${MODELS_BASE}/nature/cactus2.glb`,
  CACTUS_SHORT: `${MODELS_BASE}/nature/cactus_short.glb`,
  CACTUS_TALL: `${MODELS_BASE}/nature/cactus_tall.glb`,
  DEAD_TREE: `${MODELS_BASE}/nature/deadtree.glb`,
  LOG: `${MODELS_BASE}/nature/log.glb`,
  ROCK_LARGE: `${MODELS_BASE}/nature/rock_largeA.glb`,
  STUMP: `${MODELS_BASE}/nature/stump.glb`,
  TREE_DETAILED_FALL: `${MODELS_BASE}/nature/tree_detailed_fall.glb`,
} as const;

/**
 * Vehicle model paths
 */
export const VehicleAssets = {
  WESTERN_CART: `${MODELS_BASE}/vehicles/westerncart.glb`,
  COVERED_WAGON: `${MODELS_BASE}/vehicles/westerncart-001.glb`,
  WOOD_WHEEL: `${MODELS_BASE}/vehicles/woodwheel.glb`,
} as const;

/**
 * Decor/decoration model paths
 */
export const DecorAssets = {
  BEER: `${MODELS_BASE}/decor/beer.glb`,
  LIGHT_BULB: `${MODELS_BASE}/decor/lightbulb.glb`,
  WANTED_POSTER: `${MODELS_BASE}/decor/wantedposter.glb`,
  PAPER_1: `${MODELS_BASE}/decor/paper1.glb`,
  PAPER_2: `${MODELS_BASE}/decor/paper2.glb`,
  PAPER_3: `${MODELS_BASE}/decor/paper3.glb`,
} as const;

/**
 * Tool model paths
 */
export const ToolAssets = {
  COWBOY_HAT: `${MODELS_BASE}/tools/cowboyhat.glb`,
  PICKAXE: `${MODELS_BASE}/tools/pickaxe.glb`,
  STUFFED_BULL_HEAD: `${MODELS_BASE}/tools/stuffedbullhead.glb`,
} as const;

/**
 * Prop model paths
 */
export const PropAssets = {
  LAMP: `${MODELS_BASE}/props/lamo.glb`, // Original filename typo preserved
} as const;

/**
 * Mechanical/industrial model paths
 */
export const MechanicalAssets = {
  HOUSE_SMALL: `${MODELS_BASE}/mechanical/house_small.glb`,
  TRACK: `${MODELS_BASE}/mechanical/track.glb`,
  TRAIN_LOCOMOTIVE: `${MODELS_BASE}/mechanical/train-locomotive-a.glb`,
} as const;

/**
 * Hex tile model paths (Kenney Hexagon Kit)
 */
export const HexTileAssets = {
  // Terrain
  DIRT: `${MODELS_BASE}/hex-tiles/dirt.glb`,
  DIRT_LUMBER: `${MODELS_BASE}/hex-tiles/dirt-lumber.glb`,
  GRASS: `${MODELS_BASE}/hex-tiles/grass.glb`,
  GRASS_FOREST: `${MODELS_BASE}/hex-tiles/grass-forest.glb`,
  GRASS_HILL: `${MODELS_BASE}/hex-tiles/grass-hill.glb`,
  SAND: `${MODELS_BASE}/hex-tiles/sand.glb`,
  SAND_DESERT: `${MODELS_BASE}/hex-tiles/sand-desert.glb`,
  SAND_ROCKS: `${MODELS_BASE}/hex-tiles/sand-rocks.glb`,
  STONE: `${MODELS_BASE}/hex-tiles/stone.glb`,
  STONE_HILL: `${MODELS_BASE}/hex-tiles/stone-hill.glb`,
  STONE_MOUNTAIN: `${MODELS_BASE}/hex-tiles/stone-mountain.glb`,
  STONE_ROCKS: `${MODELS_BASE}/hex-tiles/stone-rocks.glb`,
  WATER: `${MODELS_BASE}/hex-tiles/water.glb`,
  WATER_ISLAND: `${MODELS_BASE}/hex-tiles/water-island.glb`,
  WATER_ROCKS: `${MODELS_BASE}/hex-tiles/water-rocks.glb`,

  // Buildings
  BUILDING_ARCHERY: `${MODELS_BASE}/hex-tiles/building-archery.glb`,
  BUILDING_CABIN: `${MODELS_BASE}/hex-tiles/building-cabin.glb`,
  BUILDING_CASTLE: `${MODELS_BASE}/hex-tiles/building-castle.glb`,
  BUILDING_DOCK: `${MODELS_BASE}/hex-tiles/building-dock.glb`,
  BUILDING_FARM: `${MODELS_BASE}/hex-tiles/building-farm.glb`,
  BUILDING_HOUSE: `${MODELS_BASE}/hex-tiles/building-house.glb`,
  BUILDING_MARKET: `${MODELS_BASE}/hex-tiles/building-market.glb`,
  BUILDING_MILL: `${MODELS_BASE}/hex-tiles/building-mill.glb`,
  BUILDING_MINE: `${MODELS_BASE}/hex-tiles/building-mine.glb`,
  BUILDING_PORT: `${MODELS_BASE}/hex-tiles/building-port.glb`,
  BUILDING_SHEEP: `${MODELS_BASE}/hex-tiles/building-sheep.glb`,
  BUILDING_SMELTER: `${MODELS_BASE}/hex-tiles/building-smelter.glb`,
  BUILDING_TOWER: `${MODELS_BASE}/hex-tiles/building-tower.glb`,
  BUILDING_VILLAGE: `${MODELS_BASE}/hex-tiles/building-village.glb`,
  BUILDING_WALL: `${MODELS_BASE}/hex-tiles/building-wall.glb`,
  BUILDING_WALLS: `${MODELS_BASE}/hex-tiles/building-walls.glb`,
  BUILDING_WATERMILL: `${MODELS_BASE}/hex-tiles/building-watermill.glb`,
  BUILDING_WIZARD_TOWER: `${MODELS_BASE}/hex-tiles/building-wizard-tower.glb`,

  // Infrastructure
  BRIDGE: `${MODELS_BASE}/hex-tiles/bridge.glb`,

  // Units
  UNIT_HOUSE: `${MODELS_BASE}/hex-tiles/unit-house.glb`,
  UNIT_MANSION: `${MODELS_BASE}/hex-tiles/unit-mansion.glb`,
  UNIT_MILL: `${MODELS_BASE}/hex-tiles/unit-mill.glb`,
  UNIT_SHIP: `${MODELS_BASE}/hex-tiles/unit-ship.glb`,
  UNIT_SHIP_LARGE: `${MODELS_BASE}/hex-tiles/unit-ship-large.glb`,
  UNIT_TOWER: `${MODELS_BASE}/hex-tiles/unit-tower.glb`,
  UNIT_TREE: `${MODELS_BASE}/hex-tiles/unit-tree.glb`,
  UNIT_WALL_TOWER: `${MODELS_BASE}/hex-tiles/unit-wall-tower.glb`,

  // Paths
  PATH_CORNER: `${MODELS_BASE}/hex-tiles/path-corner.glb`,
  PATH_CORNER_SHARP: `${MODELS_BASE}/hex-tiles/path-corner-sharp.glb`,
  PATH_CROSSING: `${MODELS_BASE}/hex-tiles/path-crossing.glb`,
  PATH_END: `${MODELS_BASE}/hex-tiles/path-end.glb`,
  PATH_START: `${MODELS_BASE}/hex-tiles/path-start.glb`,
  PATH_STRAIGHT: `${MODELS_BASE}/hex-tiles/path-straight.glb`,
  PATH_SQUARE: `${MODELS_BASE}/hex-tiles/path-square.glb`,
  PATH_SQUARE_END: `${MODELS_BASE}/hex-tiles/path-square-end.glb`,
  PATH_INTERSECTION_A: `${MODELS_BASE}/hex-tiles/path-intersectionA.glb`,
  PATH_INTERSECTION_B: `${MODELS_BASE}/hex-tiles/path-intersectionB.glb`,
  PATH_INTERSECTION_C: `${MODELS_BASE}/hex-tiles/path-intersectionC.glb`,
  PATH_INTERSECTION_D: `${MODELS_BASE}/hex-tiles/path-intersectionD.glb`,
  PATH_INTERSECTION_E: `${MODELS_BASE}/hex-tiles/path-intersectionE.glb`,
  PATH_INTERSECTION_F: `${MODELS_BASE}/hex-tiles/path-intersectionF.glb`,
  PATH_INTERSECTION_G: `${MODELS_BASE}/hex-tiles/path-intersectionG.glb`,
  PATH_INTERSECTION_H: `${MODELS_BASE}/hex-tiles/path-intersectionH.glb`,

  // Rivers
  RIVER_CORNER: `${MODELS_BASE}/hex-tiles/river-corner.glb`,
  RIVER_CORNER_SHARP: `${MODELS_BASE}/hex-tiles/river-corner-sharp.glb`,
  RIVER_CROSSING: `${MODELS_BASE}/hex-tiles/river-crossing.glb`,
  RIVER_END: `${MODELS_BASE}/hex-tiles/river-end.glb`,
  RIVER_START: `${MODELS_BASE}/hex-tiles/river-start.glb`,
  RIVER_STRAIGHT: `${MODELS_BASE}/hex-tiles/river-straight.glb`,
  RIVER_INTERSECTION_A: `${MODELS_BASE}/hex-tiles/river-intersectionA.glb`,
  RIVER_INTERSECTION_B: `${MODELS_BASE}/hex-tiles/river-intersectionB.glb`,
  RIVER_INTERSECTION_C: `${MODELS_BASE}/hex-tiles/river-intersectionC.glb`,
  RIVER_INTERSECTION_D: `${MODELS_BASE}/hex-tiles/river-intersectionD.glb`,
  RIVER_INTERSECTION_E: `${MODELS_BASE}/hex-tiles/river-intersectionE.glb`,
  RIVER_INTERSECTION_F: `${MODELS_BASE}/hex-tiles/river-intersectionF.glb`,
  RIVER_INTERSECTION_G: `${MODELS_BASE}/hex-tiles/river-intersectionG.glb`,
  RIVER_INTERSECTION_H: `${MODELS_BASE}/hex-tiles/river-intersectionH.glb`,
} as const;

/**
 * Combined WesternAssets enum for backward compatibility with existing code.
 * Maps to the same paths as the original WesternRegistry.ts
 */
export enum WesternAssets {
  // Characters
  ENGINEER = 'assets/models/characters/engineer.glb',

  // Weapons
  REVOLVER_FIXED = 'assets/models/weapons/revolver-fixed.glb',
  REVOLVER_ANIMATED = 'assets/models/weapons/revolver-animated.glb',

  // Structures
  BARRIER = 'assets/models/structures/barrier.glb',
  FENCE = 'assets/models/structures/fence.glb',
  POST_SIGN = 'assets/models/structures/postsign.glb',
  RAIL = 'assets/models/structures/rail.glb',
  WATER_TOWER = 'assets/models/structures/watertower.glb',
  WELL = 'assets/models/structures/well.glb',

  // Furniture
  OLD_BENCH = 'assets/models/furniture/oldbench.glb',
  OLD_CARPET = 'assets/models/furniture/oldcarpet.glb',
  PIANO = 'assets/models/furniture/piano.glb',
  POOL_TABLE = 'assets/models/furniture/pooltable.glb',
  WESTERN_BED = 'assets/models/furniture/westernbed.glb',
  WESTERN_CHAIR = 'assets/models/furniture/westernchair.glb',
  WESTERN_LOCKER = 'assets/models/furniture/westernlocker.glb',
  WESTERN_PLAY_TABLE = 'assets/models/furniture/westernplaytable.glb',
  WESTERN_TABLE = 'assets/models/furniture/westerntable.glb',

  // Containers
  CHEST_BASE = 'assets/models/containers/chest-base.glb',
  CHEST_TOP = 'assets/models/containers/chest-top.glb',
  CRATE = 'assets/models/containers/crate.glb',
  WESTERN_BARREL = 'assets/models/containers/westernbarrel.glb',
  WESTERN_BARREL_HAY = 'assets/models/containers/westernbarrel-hay.glb',
  WESTERN_BARREL_WATER = 'assets/models/containers/westernbarrel-water.glb',

  // Nature
  BUSHES = 'assets/models/nature/bushes.glb',
  CACTUS_1 = 'assets/models/nature/cactus1.glb',
  CACTUS_2 = 'assets/models/nature/cactus2.glb',
  DEAD_TREE = 'assets/models/nature/deadtree.glb',
  LOG = 'assets/models/nature/log.glb',
  STUMP = 'assets/models/nature/stump.glb',

  // Vehicles
  WESTERN_CART = 'assets/models/vehicles/westerncart.glb',
  COVERED_WAGON = 'assets/models/vehicles/westerncart-001.glb',
  WOOD_WHEEL = 'assets/models/vehicles/woodwheel.glb',

  // Decor
  BEER = 'assets/models/decor/beer.glb',
  LIGHT_BULB = 'assets/models/decor/lightbulb.glb',
  WANTED_POSTER = 'assets/models/decor/wantedposter.glb',

  // Tools
  COWBOY_HAT = 'assets/models/tools/cowboyhat.glb',
  PICKAXE = 'assets/models/tools/pickaxe.glb',
}

/**
 * Animation names for the Engineer character
 */
export const EngineerAnimations = {
  IDLE: 'Idle',
  WALK: 'Walk',
} as const;

/**
 * Get the full asset path with base URL prefix.
 * Call this when actually loading assets in the platform code.
 *
 * @param relativePath - The relative path from the asset constants
 * @param baseUrl - The base URL for the platform (default: '/assets/')
 */
export function getAssetPath(relativePath: string, baseUrl = '/assets/'): string {
  // If the path already starts with 'assets/', it's from WesternAssets enum
  if (relativePath.startsWith('assets/')) {
    return `/${relativePath}`;
  }
  return `${baseUrl}${relativePath}`;
}
