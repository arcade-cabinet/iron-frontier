/**
 * Native asset loading for React Native / Expo
 *
 * This file provides require() calls for all assets so Metro can properly
 * bundle them. Use this in React Native apps instead of the web-oriented
 * path constants.
 *
 * Usage:
 * ```typescript
 * import { NativeAssets } from '@iron-frontier/assets/native';
 *
 * // Use with expo-asset or react-native-filament
 * const engineerModel = NativeAssets.models.characters.engineer;
 * ```
 */

// =============================================================================
// Character Models
// =============================================================================

export const CharacterModels = {
  engineer: require('../models/characters/engineer.glb'),
  gunslinger: require('../models/characters/gunslinger.glb'),
  manAdventurer: require('../models/characters/man_adventurer.gltf'),
  manFarmer: require('../models/characters/man_farmer.gltf'),
  womanCasual: require('../models/characters/woman_casual.gltf'),
  womanWorker: require('../models/characters/woman_worker.gltf'),
} as const;

// =============================================================================
// Weapon Models
// =============================================================================

export const WeaponModels = {
  revolverFixed: require('../models/weapons/revolver-fixed.glb'),
  revolverAnimated: require('../models/weapons/revolver-animated.glb'),
} as const;

// =============================================================================
// Structure Models
// =============================================================================

export const StructureModels = {
  barrier: require('../models/structures/barrier.glb'),
  fence: require('../models/structures/fence.glb'),
  postSign: require('../models/structures/postsign.glb'),
  rail: require('../models/structures/rail.glb'),
  waterTower: require('../models/structures/watertower.glb'),
  well: require('../models/structures/well.glb'),
} as const;

// =============================================================================
// Furniture Models
// =============================================================================

export const FurnitureModels = {
  oldBench: require('../models/furniture/oldbench.glb'),
  oldCarpet: require('../models/furniture/oldcarpet.glb'),
  piano: require('../models/furniture/piano.glb'),
  poolTable: require('../models/furniture/pooltable.glb'),
  westernBed: require('../models/furniture/westernbed.glb'),
  westernChair: require('../models/furniture/westernchair.glb'),
  westernLocker: require('../models/furniture/westernlocker.glb'),
  westernPlayTable: require('../models/furniture/westernplaytable.glb'),
  westernTable: require('../models/furniture/westerntable.glb'),
} as const;

// =============================================================================
// Container Models
// =============================================================================

export const ContainerModels = {
  chestBase: require('../models/containers/chest-base.glb'),
  chestTop: require('../models/containers/chest-top.glb'),
  crate: require('../models/containers/crate.glb'),
  destroyedCrate1: require('../models/containers/destroyedcrate1.glb'),
  destroyedCrate2: require('../models/containers/destroyedcrate2.glb'),
  destroyedCrate3: require('../models/containers/destroyedcrate3.glb'),
  destroyedCrate4: require('../models/containers/destroyedcrate4.glb'),
  destroyedCrate5: require('../models/containers/destroyedcrate5.glb'),
  destroyedCrate6: require('../models/containers/destroyedcrate6.glb'),
  westernBarrel: require('../models/containers/westernbarrel.glb'),
  westernBarrelHay: require('../models/containers/westernbarrel-hay.glb'),
  westernBarrelWater: require('../models/containers/westernbarrel-water.glb'),
  woodBarrelDestroyed: require('../models/containers/woodbarreldestroyed.glb'),
  woodBarrelTopDestroyed: require('../models/containers/woodbarreltopdestroyed.glb'),
} as const;

// =============================================================================
// Nature Models
// =============================================================================

export const NatureModels = {
  bushes: require('../models/nature/bushes.glb'),
  cactus1: require('../models/nature/cactus1.glb'),
  cactus2: require('../models/nature/cactus2.glb'),
  cactusShort: require('../models/nature/cactus_short.glb'),
  cactusTall: require('../models/nature/cactus_tall.glb'),
  deadTree: require('../models/nature/deadtree.glb'),
  log: require('../models/nature/log.glb'),
  rockLarge: require('../models/nature/rock_largeA.glb'),
  stump: require('../models/nature/stump.glb'),
  treeDetailedFall: require('../models/nature/tree_detailed_fall.glb'),
} as const;

// =============================================================================
// Vehicle Models
// =============================================================================

export const VehicleModels = {
  westernCart: require('../models/vehicles/westerncart.glb'),
  westernCartCovered: require('../models/vehicles/westerncart-001.glb'),
  woodWheel: require('../models/vehicles/woodwheel.glb'),
} as const;

// =============================================================================
// Decor Models
// =============================================================================

export const DecorModels = {
  beer: require('../models/decor/beer.glb'),
  lightbulb: require('../models/decor/lightbulb.glb'),
  paper1: require('../models/decor/paper1.glb'),
  paper2: require('../models/decor/paper2.glb'),
  paper3: require('../models/decor/paper3.glb'),
  wantedPoster: require('../models/decor/wantedposter.glb'),
} as const;

// =============================================================================
// Tool Models
// =============================================================================

export const ToolModels = {
  cowboyHat: require('../models/tools/cowboyhat.glb'),
  pickaxe: require('../models/tools/pickaxe.glb'),
  stuffedBullHead: require('../models/tools/stuffedbullhead.glb'),
} as const;

// =============================================================================
// Prop Models
// =============================================================================

export const PropModels = {
  lamp: require('../models/props/lamo.glb'),
} as const;

// =============================================================================
// Mechanical Models
// =============================================================================

export const MechanicalModels = {
  houseSmall: require('../models/mechanical/house_small.glb'),
  track: require('../models/mechanical/track.glb'),
  trainLocomotive: require('../models/mechanical/train-locomotive-a.glb'),
} as const;

// =============================================================================
// Terrain Textures (PBR)
// =============================================================================

export const TerrainTextures = {
  desert: {
    color: require('../textures/Ground037_1K-JPG_Color.jpg'),
    normal: require('../textures/Ground037_1K-JPG_NormalGL.jpg'),
    roughness: require('../textures/Ground037_1K-JPG_Roughness.jpg'),
    displacement: require('../textures/Ground037_1K-JPG_Displacement.jpg'),
    ao: require('../textures/Ground037_1K-JPG_AmbientOcclusion.jpg'),
  },
  grassland: {
    color: require('../textures/Grass004_1K-JPG_Color.jpg'),
    normal: require('../textures/Grass004_1K-JPG_NormalGL.jpg'),
    roughness: require('../textures/Grass004_1K-JPG_Roughness.jpg'),
    displacement: require('../textures/Grass004_1K-JPG_Displacement.jpg'),
    ao: require('../textures/Grass004_1K-JPG_AmbientOcclusion.jpg'),
  },
  badlands: {
    color: require('../textures/Ground033_1K-JPG_Color.jpg'),
    normal: require('../textures/Ground033_1K-JPG_NormalGL.jpg'),
    roughness: require('../textures/Ground033_1K-JPG_Roughness.jpg'),
    displacement: require('../textures/Ground033_1K-JPG_Displacement.jpg'),
    ao: require('../textures/Ground033_1K-JPG_AmbientOcclusion.jpg'),
  },
  rock: {
    color: require('../textures/Rock020_1K-JPG_Color.jpg'),
    normal: require('../textures/Rock020_1K-JPG_NormalGL.jpg'),
    roughness: require('../textures/Rock020_1K-JPG_Roughness.jpg'),
    displacement: require('../textures/Rock020_1K-JPG_Displacement.jpg'),
    ao: require('../textures/Rock020_1K-JPG_AmbientOcclusion.jpg'),
  },
} as const;

// =============================================================================
// Western Textures
// =============================================================================

export const WesternTextures = {
  wood: require('../textures/western/Wood-Texture.png'),
  metal: require('../textures/western/Metal-Texture.png'),
  vegetation: require('../textures/western/Vegetation-Texture.png'),
  fabric: require('../textures/western/Fabric_Texture.png'),
  signs: require('../textures/western/Signs.png'),
  concrete: require('../textures/western/Concrete_Texture.png'),
  misc: require('../textures/western/Misc.png'),
} as const;

// =============================================================================
// Simple Terrain Textures
// =============================================================================

export const SimpleTerrainTextures = {
  sandColor: require('../textures/terrain/sand_color.jpg'),
  sandNormal: require('../textures/terrain/sand_normal.jpg'),
  rockColor: require('../textures/terrain/rock_color.jpg'),
  rockNormal: require('../textures/terrain/rock_normal.jpg'),
  woodColor: require('../textures/terrain/wood_color.jpg'),
} as const;

// =============================================================================
// Combined Native Assets Export
// =============================================================================

/**
 * All native assets organized by category.
 * Use these with expo-asset or react-native-filament.
 */
export const NativeAssets = {
  models: {
    characters: CharacterModels,
    weapons: WeaponModels,
    structures: StructureModels,
    furniture: FurnitureModels,
    containers: ContainerModels,
    nature: NatureModels,
    vehicles: VehicleModels,
    decor: DecorModels,
    tools: ToolModels,
    props: PropModels,
    mechanical: MechanicalModels,
  },
  textures: {
    terrain: TerrainTextures,
    western: WesternTextures,
    simple: SimpleTerrainTextures,
  },
} as const;

// Type helpers for the native asset references
export type NativeModelRef = number; // Metro converts require() to number IDs
export type NativeTextureRef = number;
