// Core Engine Types - Shared
// Platform-agnostic definitions for game entities and world data

import { HexTileAssets, MechanicalAssets, StructureAssets } from '~/assets';

// Simple vector/color types to avoid engine dependencies
export interface Vector3Simple {
  x: number;
  y: number;
  z: number;
}

export interface Color3Simple {
  r: number;
  g: number;
  b: number;
}

// ============================================================================
// COORDINATE SYSTEMS
// ============================================================================

export interface WorldPosition {
  x: number; // East-West (meters)
  z: number; // North-South (meters)
  y: number; // Elevation (computed from heightmap)
}

export interface ChunkCoord {
  cx: number;
  cz: number;
}

export const CHUNK_SIZE = 64; // 64x64 meters per chunk
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
  | 'desert' // Sandy, cacti, mesas
  | 'grassland' // Prairie grass, wildflowers
  | 'badlands' // Rocky, canyons, red earth
  | 'riverside' // Near water, greener
  | 'town' // Developed area, buildings
  | 'railyard' // Industrial, tracks, coal
  | 'mine'; // Rocky, cave entrances, ore veins

export interface BiomeConfig {
  type: BiomeType;
  groundColor: Color3Simple;
  detailColor: Color3Simple;
  vegetationDensity: number;
  rockDensity: number;
  moisture: number;
  temperature: number;
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
  saloon: {
    type: 'saloon',
    name: 'Saloon',
    width: 12,
    depth: 10,
    height: 6,
    hasInterior: true,
    entranceOffset: { x: 0, z: 5 },
    modelPath: HexTileAssets.BUILDING_MARKET,
  }, // Placeholder mapping
  sheriff_office: {
    type: 'sheriff_office',
    name: 'Sheriff Office',
    width: 8,
    depth: 8,
    height: 5,
    hasInterior: true,
    entranceOffset: { x: 0, z: 4 },
    modelPath: HexTileAssets.BUILDING_TOWER,
  },
  general_store: {
    type: 'general_store',
    name: 'General Store',
    width: 10,
    depth: 8,
    height: 5,
    hasInterior: true,
    entranceOffset: { x: 0, z: 4 },
    modelPath: HexTileAssets.BUILDING_HOUSE,
  },
  bank: {
    type: 'bank',
    name: 'Bank',
    width: 10,
    depth: 10,
    height: 6,
    hasInterior: true,
    entranceOffset: { x: 0, z: 5 },
    modelPath: HexTileAssets.BUILDING_CASTLE,
  },
  hotel: {
    type: 'hotel',
    name: 'Hotel',
    width: 12,
    depth: 10,
    height: 8,
    hasInterior: true,
    entranceOffset: { x: 0, z: 5 },
    modelPath: HexTileAssets.UNIT_MANSION,
  },
  stable: {
    type: 'stable',
    name: 'Stable',
    width: 14,
    depth: 8,
    height: 5,
    hasInterior: false,
    entranceOffset: { x: 0, z: 4 },
    modelPath: HexTileAssets.BUILDING_FARM,
  },
  water_tower: {
    type: 'water_tower',
    name: 'Water Tower',
    width: 4,
    depth: 4,
    height: 12,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0 },
    modelPath: StructureAssets.WATER_TOWER,
  },
  windmill: {
    type: 'windmill',
    name: 'Windmill',
    width: 3,
    depth: 3,
    height: 10,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0 },
    modelPath: HexTileAssets.BUILDING_MILL,
  },
  mine_entrance: {
    type: 'mine_entrance',
    name: 'Mine Entrance',
    width: 6,
    depth: 4,
    height: 4,
    hasInterior: false,
    entranceOffset: { x: 0, z: 2 },
    modelPath: HexTileAssets.BUILDING_MINE,
  },
  train_station: {
    type: 'train_station',
    name: 'Train Station',
    width: 16,
    depth: 6,
    height: 5,
    hasInterior: true,
    entranceOffset: { x: 0, z: 3 },
    modelPath: MechanicalAssets.HOUSE_SMALL,
  }, // Using mechanical house as station
  house_small: {
    type: 'house_small',
    name: 'Small House',
    width: 6,
    depth: 6,
    height: 4,
    hasInterior: true,
    entranceOffset: { x: 0, z: 3 },
    modelPath: HexTileAssets.BUILDING_CABIN,
  },
  house_large: {
    type: 'house_large',
    name: 'Large House',
    width: 10,
    depth: 8,
    height: 5,
    hasInterior: true,
    entranceOffset: { x: 0, z: 4 },
    modelPath: HexTileAssets.UNIT_HOUSE,
  },
  outhouse: {
    type: 'outhouse',
    name: 'Outhouse',
    width: 1.5,
    depth: 1.5,
    height: 2.5,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0.75 },
    modelPath: null,
  }, // No specific model yet
  well: {
    type: 'well',
    name: 'Well',
    width: 2,
    depth: 2,
    height: 2,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0 },
    modelPath: StructureAssets.WELL,
  },
  fence: {
    type: 'fence',
    name: 'Fence',
    width: 4,
    depth: 0.2,
    height: 1.2,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0 },
    modelPath: StructureAssets.FENCE,
  },
  hitching_post: {
    type: 'hitching_post',
    name: 'Hitching Post',
    width: 2,
    depth: 0.5,
    height: 1,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0 },
    modelPath: StructureAssets.RAIL,
  },
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
  disposition: number; // -100 to 100, relationship with player
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
  hour: number; // 0-24
  dayOfYear: number; // 1-365
  year: number;
}
