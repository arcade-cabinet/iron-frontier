// Core Engine Types - Iron Frontier v2
// Modern diorama-based world with layered terrain

import { Color3, Vector3 } from '@babylonjs/core/Maths/math';
import { WesternAssets } from '~/assets';

// Re-export shared types
// This ensures that the engine uses the same data structures as the procedural generation
export * from '@/types/engine';

import type { BiomeType, ChunkCoord, NPC, StructureType, WorldItem } from '@/types/engine';

// ============================================================================
// EXTENDED TYPES (Web/Babylon Specific)
// ============================================================================

export interface BiomeConfig {
  type: BiomeType;
  groundColor: Color3; // Babylon Color3
  detailColor: Color3; // Babylon Color3
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
    modelPath: null,
  },
  sheriff_office: {
    type: 'sheriff_office',
    name: 'Sheriff Office',
    width: 8,
    depth: 8,
    height: 5,
    hasInterior: true,
    entranceOffset: { x: 0, z: 4 },
    modelPath: null,
  },
  general_store: {
    type: 'general_store',
    name: 'General Store',
    width: 10,
    depth: 8,
    height: 5,
    hasInterior: true,
    entranceOffset: { x: 0, z: 4 },
    modelPath: null,
  },
  bank: {
    type: 'bank',
    name: 'Bank',
    width: 10,
    depth: 10,
    height: 6,
    hasInterior: true,
    entranceOffset: { x: 0, z: 5 },
    modelPath: null,
  },
  hotel: {
    type: 'hotel',
    name: 'Hotel',
    width: 12,
    depth: 10,
    height: 8,
    hasInterior: true,
    entranceOffset: { x: 0, z: 5 },
    modelPath: null,
  },
  stable: {
    type: 'stable',
    name: 'Stable',
    width: 14,
    depth: 8,
    height: 5,
    hasInterior: false,
    entranceOffset: { x: 0, z: 4 },
    modelPath: null,
  },
  water_tower: {
    type: 'water_tower',
    name: 'Water Tower',
    width: 4,
    depth: 4,
    height: 12,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0 },
    modelPath: WesternAssets.WATER_TOWER,
  },
  windmill: {
    type: 'windmill',
    name: 'Windmill',
    width: 3,
    depth: 3,
    height: 10,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0 },
    modelPath: null,
  },
  mine_entrance: {
    type: 'mine_entrance',
    name: 'Mine Entrance',
    width: 6,
    depth: 4,
    height: 4,
    hasInterior: false,
    entranceOffset: { x: 0, z: 2 },
    modelPath: null,
  },
  train_station: {
    type: 'train_station',
    name: 'Train Station',
    width: 16,
    depth: 6,
    height: 5,
    hasInterior: true,
    entranceOffset: { x: 0, z: 3 },
    modelPath: null,
  },
  house_small: {
    type: 'house_small',
    name: 'Small House',
    width: 6,
    depth: 6,
    height: 4,
    hasInterior: true,
    entranceOffset: { x: 0, z: 3 },
    modelPath: null,
  },
  house_large: {
    type: 'house_large',
    name: 'Large House',
    width: 10,
    depth: 8,
    height: 5,
    hasInterior: true,
    entranceOffset: { x: 0, z: 4 },
    modelPath: null,
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
  },
  well: {
    type: 'well',
    name: 'Well',
    width: 2,
    depth: 2,
    height: 2,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0 },
    modelPath: WesternAssets.WELL,
  },
  fence: {
    type: 'fence',
    name: 'Fence',
    width: 4,
    depth: 0.2,
    height: 1.2,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0 },
    modelPath: WesternAssets.FENCE,
  },
  hitching_post: {
    type: 'hitching_post',
    name: 'Hitching Post',
    width: 2,
    depth: 0.5,
    height: 1,
    hasInterior: false,
    entranceOffset: { x: 0, z: 0 },
    modelPath: WesternAssets.RAIL,
  },
};

// ============================================================================
// PROPS & ITEMS
// ============================================================================
// (Types re-exported from shared/types/engine)

// ============================================================================
// QUESTS
// ============================================================================

// Re-export quest types from the data schema for backwards compatibility
// The authoritative quest schema is in packages/shared/src/data/schemas/quest.ts
export type {
  ActiveQuest,
  Objective as QuestObjective,
  Quest,
  QuestStage,
  QuestStatus,
  QuestType,
} from '@/data/schemas/quest';

export {
  createActiveQuest,
  getCurrentStage,
  isCurrentStageComplete,
  isQuestComplete,
  isStageComplete,
} from '@/data/schemas/quest';

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
  focusPoint: new Vector3(32, 5, 32), // Start focused near player spawn
  distance: 30, // Closer for better detail
  azimuth: Math.PI * 0.75, // Rotate to face from top-right
  elevation: 0.4, // ~23° from vertical - more top-down view

  minDistance: 15,
  maxDistance: 80,
  minElevation: 0.2, // Allow near top-down
  maxElevation: 1.4, // Allow fairly horizontal

  followLag: 0.1,
  isInCutscene: false,
};

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
  structures: import('@/types/engine').Structure[];
  props: import('@/types/engine').Prop[];
  npcs: NPC[];
  items: WorldItem[];
  overlays: SurfaceOverlay[];
}
