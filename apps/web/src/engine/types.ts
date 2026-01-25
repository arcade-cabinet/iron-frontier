// Core Engine Types - Iron Frontier v2
// Modern diorama-based world with layered terrain

import { Color3, Vector3 } from '@babylonjs/core/Maths/math';
import { WesternAssets } from '@iron-frontier/assets';

// ============================================================================
// COORDINATE SYSTEMS
// ============================================================================

export interface WorldPosition {
  x: number;  // East-West (meters)
  z: number;  // North-South (meters) 
  y: number;  // Elevation (computed from heightmap)
}

export interface ChunkCoord {
  cx: number;
  cz: number;
}

export const CHUNK_SIZE = 64;  // 64x64 meters per chunk
export const VIEW_DISTANCE = 3; // Load chunks within this radius

export function worldToChunk(pos: WorldPosition): ChunkCoord {
  return {
    cx: Math.floor(pos.x / CHUNK_SIZE),
    cz: Math.floor(pos.z / CHUNK_SIZE),
  };
}

export function chunkToWorld(coord: ChunkCoord): WorldPosition {
  return {
    x: coord.cx * CHUNK_SIZE + CHUNK_SIZE / 2,
    z: coord.cz * CHUNK_SIZE + CHUNK_SIZE / 2,
    y: 0,
  };
}

export function chunkKey(coord: ChunkCoord): string {
  return `${coord.cx},${coord.cz}`;
}

// ============================================================================
// BIOME SYSTEM
// ============================================================================

export type BiomeType =
  | 'desert'      // Sandy, cacti, mesas
  | 'grassland'   // Prairie grass, wildflowers
  | 'badlands'    // Rocky, canyons, red earth
  | 'riverside'   // Near water, greener
  | 'town'        // Developed area, buildings
  | 'railyard'    // Industrial, tracks, coal
  | 'mine';       // Rocky, cave entrances, ore veins

export interface BiomeConfig {
  type: BiomeType;
  groundColor: Color3;
  detailColor: Color3;
  vegetationDensity: number;
  rockDensity: number;
  moisture: number;
  temperature: number;
}

export const BIOME_CONFIGS: Record<BiomeType, BiomeConfig> = {
  desert: {
    type: 'desert',
    groundColor: Color3.FromHexString('#C4A574'),
    detailColor: Color3.FromHexString('#D4B584'),
    vegetationDensity: 0.1,
    rockDensity: 0.2,
    moisture: 0.1,
    temperature: 0.9,
  },
  grassland: {
    type: 'grassland',
    groundColor: Color3.FromHexString('#8B9A6B'),
    detailColor: Color3.FromHexString('#A5B57B'),
    vegetationDensity: 0.7,
    rockDensity: 0.1,
    moisture: 0.5,
    temperature: 0.6,
  },
  badlands: {
    type: 'badlands',
    groundColor: Color3.FromHexString('#8B4513'),
    detailColor: Color3.FromHexString('#A0522D'),
    vegetationDensity: 0.05,
    rockDensity: 0.6,
    moisture: 0.15,
    temperature: 0.8,
  },
  riverside: {
    type: 'riverside',
    groundColor: Color3.FromHexString('#6B8E6B'),
    detailColor: Color3.FromHexString('#7BA87B'),
    vegetationDensity: 0.8,
    rockDensity: 0.15,
    moisture: 0.9,
    temperature: 0.5,
  },
  town: {
    type: 'town',
    groundColor: Color3.FromHexString('#9B8B7B'),
    detailColor: Color3.FromHexString('#A89888'),
    vegetationDensity: 0.1,
    rockDensity: 0.05,
    moisture: 0.3,
    temperature: 0.6,
  },
  railyard: {
    type: 'railyard',
    groundColor: Color3.FromHexString('#5A5A5A'),
    detailColor: Color3.FromHexString('#6A6A6A'),
    vegetationDensity: 0.02,
    rockDensity: 0.1,
    moisture: 0.2,
    temperature: 0.7,
  },
  mine: {
    type: 'mine',
    groundColor: Color3.FromHexString('#6B5B4B'),
    detailColor: Color3.FromHexString('#7B6B5B'),
    vegetationDensity: 0.05,
    rockDensity: 0.7,
    moisture: 0.2,
    temperature: 0.5,
  },
};

// ============================================================================
// TERRAIN
// ============================================================================

export interface TerrainConfig {
  seed: number;
  baseHeight: number;
  maxElevation: number;

  // Noise scales
  continentalScale: number;
  erosionScale: number;
  detailScale: number;
}

export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  seed: 12345,
  baseHeight: 0,
  maxElevation: 20,
  continentalScale: 0.005,
  erosionScale: 0.02,
  detailScale: 0.1,
};

// ============================================================================
// SURFACE OVERLAYS (Decals)
// ============================================================================

export type OverlayType = 'road' | 'track' | 'water' | 'boardwalk' | 'shadow';

export interface SurfaceOverlay {
  id: string;
  type: OverlayType;

  // Spline path for roads/tracks
  path?: Vector3[];

  // Polygon for area overlays
  polygon?: Vector3[];

  width: number;
  material: string;
  fadeEdges: boolean;
  priority: number;
}

// ============================================================================
// STRUCTURES
// ============================================================================

export type StructureType =
  | 'saloon'
  | 'sheriff_office'
  | 'general_store'
  | 'bank'
  | 'hotel'
  | 'stable'
  | 'water_tower'
  | 'windmill'
  | 'mine_entrance'
  | 'train_station'
  | 'house_small'
  | 'house_large'
  | 'outhouse'
  | 'well'
  | 'fence'
  | 'hitching_post';

export interface Structure {
  id: string;
  type: StructureType;
  position: WorldPosition;
  rotation: number;
  scale: number;
  footprint: { x: number; z: number }[];
  condition: number;
  ownerNpcId?: string;
}

export interface StructureTemplate {
  type: StructureType;
  name: string;
  width: number;
  depth: number;
  height: number;
  hasInterior: boolean;
  entranceOffset: { x: number; z: number };
  modelPath: string | null;
}

export const STRUCTURE_TEMPLATES: Record<StructureType, StructureTemplate> = {
  saloon: { type: 'saloon', name: 'Saloon', width: 12, depth: 10, height: 6, hasInterior: true, entranceOffset: { x: 0, z: 5 }, modelPath: null },
  sheriff_office: { type: 'sheriff_office', name: 'Sheriff Office', width: 8, depth: 8, height: 5, hasInterior: true, entranceOffset: { x: 0, z: 4 }, modelPath: null },
  general_store: { type: 'general_store', name: 'General Store', width: 10, depth: 8, height: 5, hasInterior: true, entranceOffset: { x: 0, z: 4 }, modelPath: null },
  bank: { type: 'bank', name: 'Bank', width: 10, depth: 10, height: 6, hasInterior: true, entranceOffset: { x: 0, z: 5 }, modelPath: null },
  hotel: { type: 'hotel', name: 'Hotel', width: 12, depth: 10, height: 8, hasInterior: true, entranceOffset: { x: 0, z: 5 }, modelPath: null },
  stable: { type: 'stable', name: 'Stable', width: 14, depth: 8, height: 5, hasInterior: false, entranceOffset: { x: 0, z: 4 }, modelPath: null },
  water_tower: { type: 'water_tower', name: 'Water Tower', width: 4, depth: 4, height: 12, hasInterior: false, entranceOffset: { x: 0, z: 0 }, modelPath: WesternAssets.WATER_TOWER },
  windmill: { type: 'windmill', name: 'Windmill', width: 3, depth: 3, height: 10, hasInterior: false, entranceOffset: { x: 0, z: 0 }, modelPath: null },
  mine_entrance: { type: 'mine_entrance', name: 'Mine Entrance', width: 6, depth: 4, height: 4, hasInterior: false, entranceOffset: { x: 0, z: 2 }, modelPath: null },
  train_station: { type: 'train_station', name: 'Train Station', width: 16, depth: 6, height: 5, hasInterior: true, entranceOffset: { x: 0, z: 3 }, modelPath: null },
  house_small: { type: 'house_small', name: 'Small House', width: 6, depth: 6, height: 4, hasInterior: true, entranceOffset: { x: 0, z: 3 }, modelPath: null },
  house_large: { type: 'house_large', name: 'Large House', width: 10, depth: 8, height: 5, hasInterior: true, entranceOffset: { x: 0, z: 4 }, modelPath: null },
  outhouse: { type: 'outhouse', name: 'Outhouse', width: 1.5, depth: 1.5, height: 2.5, hasInterior: false, entranceOffset: { x: 0, z: 0.75 }, modelPath: null },
  well: { type: 'well', name: 'Well', width: 2, depth: 2, height: 2, hasInterior: false, entranceOffset: { x: 0, z: 0 }, modelPath: WesternAssets.WELL },
  fence: { type: 'fence', name: 'Fence', width: 4, depth: 0.2, height: 1.2, hasInterior: false, entranceOffset: { x: 0, z: 0 }, modelPath: WesternAssets.FENCE },
  hitching_post: { type: 'hitching_post', name: 'Hitching Post', width: 2, depth: 0.5, height: 1, hasInterior: false, entranceOffset: { x: 0, z: 0 }, modelPath: WesternAssets.RAIL }, // Placeholder usage of RAIL visual if allowed, else null
};

// ============================================================================
// PROPS
// ============================================================================

export type PropType =
  | 'cactus_small'
  | 'cactus_large'
  | 'cactus_saguaro'
  | 'rock_small'
  | 'rock_medium'
  | 'rock_large'
  | 'boulder'
  | 'tumbleweed'
  | 'dead_tree'
  | 'grass_tuft'
  | 'barrel'
  | 'crate'
  | 'wagon_wheel'
  | 'skull'
  | 'campfire'
  | 'lantern'
  | 'sign_post';

export interface Prop {
  id: string;
  type: PropType;
  position: WorldPosition;
  rotation: number;
  scale: number;
}

// ============================================================================
// CHARACTERS
// ============================================================================

export interface CharacterAppearance {
  bodyType: 'slim' | 'average' | 'stocky';
  height: number;
  skinTone: string;

  faceShape: number;
  hasBeard: boolean;
  beardStyle?: 'stubble' | 'full' | 'mustache' | 'goatee';
  hasScar: boolean;
  scarPosition?: 'cheek' | 'eye' | 'chin';

  hatStyle: 'cowboy' | 'bowler' | 'flat_cap' | 'none';
  hatColor: string;
  shirtStyle: 'work' | 'fancy' | 'vest';
  shirtColor: string;
  pantsStyle: 'jeans' | 'chaps' | 'slacks';
  pantsColor: string;
  bootsStyle: 'work' | 'fancy' | 'spurs';

  hasBandana: boolean;
  bandanaColor?: string;
  hasGunbelt: boolean;
  hasPoncho: boolean;
  ponchoColor?: string;
}

export type NPCRole =
  | 'sheriff'
  | 'deputy'
  | 'merchant'
  | 'bartender'
  | 'blacksmith'
  | 'doctor'
  | 'banker'
  | 'rancher'
  | 'miner'
  | 'prospector'
  | 'outlaw'
  | 'drifter'
  | 'preacher'
  | 'gambler'
  | 'undertaker';

export interface NPCPersonality {
  aggression: number;
  friendliness: number;
  curiosity: number;
  greed: number;
  honesty: number;
}

export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  appearance: CharacterAppearance;
  personality: NPCPersonality;
  position: WorldPosition;
  rotation: number;

  homeStructureId?: string;
  disposition: number;  // -100 to 100, relationship with player
  isAlive: boolean;

  questGiver: boolean;
  questIds: string[];
}

// ============================================================================
// ITEMS
// ============================================================================

export type ItemCategory = 'weapon' | 'consumable' | 'material' | 'quest' | 'valuable';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  stackable: boolean;
  maxStack: number;
  value: number;
  usable: boolean;
  effect?: ItemEffect;
}

export interface ItemEffect {
  type: 'heal' | 'buff' | 'damage' | 'unlock';
  value: number;
  duration?: number;
}

export interface WorldItem {
  id: string;
  itemId: string;
  position: WorldPosition;
  quantity: number;
}

// ============================================================================
// QUESTS
// ============================================================================

// Re-export quest types from the data schema for backwards compatibility
// The authoritative quest schema is in packages/shared/src/data/schemas/quest.ts
export type {
  Quest,
  QuestStage,
  Objective as QuestObjective,
  QuestStatus,
  QuestType,
  ActiveQuest,
} from '@iron-frontier/shared/data/schemas/quest';

export {
  isStageComplete,
  isCurrentStageComplete,
  isQuestComplete,
  getCurrentStage,
  createActiveQuest,
} from '@iron-frontier/shared/data/schemas/quest';

// ============================================================================
// CAMERA
// ============================================================================

export interface CameraState {
  focusPoint: Vector3;
  distance: number;
  azimuth: number;
  elevation: number;

  minDistance: number;
  maxDistance: number;
  minElevation: number;
  maxElevation: number;

  followTarget?: string;
  followLag: number;

  isInCutscene: boolean;
}

export const DEFAULT_CAMERA_STATE: CameraState = {
  focusPoint: new Vector3(32, 5, 32),  // Start focused near player spawn
  distance: 30,                         // Closer for better detail
  azimuth: Math.PI * 0.75,             // Rotate to face from top-right
  elevation: 0.4,                       // ~23° from vertical - more top-down view

  minDistance: 15,
  maxDistance: 80,
  minElevation: 0.2,                   // Allow near top-down
  maxElevation: 1.4,                   // Allow fairly horizontal

  followLag: 0.1,
  isInCutscene: false,
};

// ============================================================================
// WEATHER & TIME
// ============================================================================

export type WeatherType = 'clear' | 'cloudy' | 'dusty' | 'stormy';

export interface WeatherState {
  type: WeatherType;
  intensity: number;
  windDirection: number;
  windSpeed: number;
}

export interface TimeState {
  hour: number;      // 0-24
  dayOfYear: number; // 1-365
  year: number;
}

// ============================================================================
// CHUNK DATA
// ============================================================================

export interface ChunkData {
  coord: ChunkCoord;
  seed: number;
  generatedAt: number;

  // Terrain
  heightmap: Float32Array;
  biomeWeights: Map<BiomeType, Float32Array>;

  // Content
  structures: Structure[];
  props: Prop[];
  npcs: NPC[];
  items: WorldItem[];
  overlays: SurfaceOverlay[];
}
