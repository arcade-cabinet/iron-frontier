/**
 * Engine Types - Platform-agnostic definitions for game entities and world data
 *
 * This module contains PURE TYPE DEFINITIONS only.
 * Runtime values (constants, functions) are in @iron-frontier/shared.
 */

// ============================================================================
// MATH PRIMITIVES
// ============================================================================

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

export interface ItemEffect {
  type: 'heal' | 'buff' | 'damage' | 'unlock';
  value: number;
  duration?: number;
}

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
