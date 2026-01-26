// R3F Vegetation System Types
// Shared types for the Three.js/React Three Fiber vegetation system

import type * as THREE from 'three';

// ============================================================================
// VEGETATION TYPES
// ============================================================================

/**
 * Types of vegetation available in the Western desert environment
 */
export type VegetationType =
  | 'cactus'
  | 'joshuaTree'
  | 'sagebrush'
  | 'deadTree'
  | 'tumbleweed'
  | 'rock'
  | 'barrelCactus'
  | 'pricklyPear'
  | 'yucca'
  | 'agave'
  | 'mesquite'
  | 'cottonwood'
  | 'willow';

/**
 * Biome types for vegetation spawning
 */
export type BiomeType = 'desert' | 'grassland' | 'badlands' | 'riverside' | 'town';

/**
 * A single vegetation instance with transform data
 */
export interface VegetationInstance {
  id: string;
  type: VegetationType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  colorVariation: [number, number, number];
}

/**
 * Configuration for a vegetation type
 */
export interface VegetationTypeConfig {
  type: VegetationType;
  name: string;
  minScale: number;
  maxScale: number;
  baseHeight: number;
  castsShadows: boolean;
  collisionRadius: number;
  colorTint: [number, number, number];
  colorVariation: number;
}

/**
 * Biome-specific spawn rule for vegetation
 */
export interface BiomeVegetationRule {
  type: VegetationType;
  density: number;
  minHeight: number;
  maxHeight: number;
  minSlope: number;
  maxSlope: number;
  clustering: number;
}

/**
 * Full biome vegetation configuration
 */
export interface BiomeVegetationConfig {
  biome: BiomeType;
  densityMultiplier: number;
  maxPerChunk: number;
  rules: BiomeVegetationRule[];
}

/**
 * Height query function type
 */
export type HeightQueryFn = (x: number, z: number) => number;

/**
 * Biome query function type
 */
export type BiomeQueryFn = (x: number, z: number) => BiomeType;

/**
 * Vegetation spawner configuration
 */
export interface VegetationSpawnerConfig {
  seed: number;
  viewDistance: number;
  chunkSize: number;
  globalDensity: number;
  minSpacing: number;
  maxTotalInstances: number;
  lodDistances: [number, number, number];
}

/**
 * Vegetation system props
 */
export interface VegetationSystemProps {
  playerPosition: [number, number, number];
  getHeight: HeightQueryFn;
  getBiome: BiomeQueryFn;
  config?: Partial<VegetationSpawnerConfig>;
  enableFrustumCulling?: boolean;
  enableShadows?: boolean;
  enableWind?: boolean;
}

// ============================================================================
// VEGETATION TYPE CONFIGURATIONS
// ============================================================================

export const VEGETATION_TYPES: Record<VegetationType, VegetationTypeConfig> = {
  cactus: {
    type: 'cactus',
    name: 'Saguaro Cactus',
    minScale: 0.6,
    maxScale: 1.5,
    baseHeight: 6,
    castsShadows: true,
    collisionRadius: 1.5,
    colorTint: [0.45, 0.65, 0.4],
    colorVariation: 0.1,
  },
  joshuaTree: {
    type: 'joshuaTree',
    name: 'Joshua Tree',
    minScale: 0.7,
    maxScale: 1.4,
    baseHeight: 5,
    castsShadows: true,
    collisionRadius: 2,
    colorTint: [0.65, 0.75, 0.55],
    colorVariation: 0.15,
  },
  sagebrush: {
    type: 'sagebrush',
    name: 'Sagebrush',
    minScale: 0.5,
    maxScale: 1.0,
    baseHeight: 0.8,
    castsShadows: false,
    collisionRadius: 0.6,
    colorTint: [0.6, 0.65, 0.55],
    colorVariation: 0.2,
  },
  deadTree: {
    type: 'deadTree',
    name: 'Dead Tree',
    minScale: 0.6,
    maxScale: 1.3,
    baseHeight: 4,
    castsShadows: true,
    collisionRadius: 1.5,
    colorTint: [0.8, 0.75, 0.65],
    colorVariation: 0.1,
  },
  tumbleweed: {
    type: 'tumbleweed',
    name: 'Tumbleweed',
    minScale: 0.4,
    maxScale: 0.9,
    baseHeight: 0.6,
    castsShadows: false,
    collisionRadius: 0.4,
    colorTint: [0.75, 0.65, 0.5],
    colorVariation: 0.15,
  },
  rock: {
    type: 'rock',
    name: 'Rock',
    minScale: 0.5,
    maxScale: 2.0,
    baseHeight: 1.0,
    castsShadows: true,
    collisionRadius: 1.0,
    colorTint: [0.55, 0.5, 0.45],
    colorVariation: 0.1,
  },
  barrelCactus: {
    type: 'barrelCactus',
    name: 'Barrel Cactus',
    minScale: 0.5,
    maxScale: 1.2,
    baseHeight: 1.0,
    castsShadows: true,
    collisionRadius: 0.8,
    colorTint: [0.4, 0.6, 0.35],
    colorVariation: 0.1,
  },
  pricklyPear: {
    type: 'pricklyPear',
    name: 'Prickly Pear',
    minScale: 0.6,
    maxScale: 1.3,
    baseHeight: 0.8,
    castsShadows: false,
    collisionRadius: 1,
    colorTint: [0.5, 0.7, 0.4],
    colorVariation: 0.15,
  },
  yucca: {
    type: 'yucca',
    name: 'Yucca',
    minScale: 0.5,
    maxScale: 1.1,
    baseHeight: 1.5,
    castsShadows: false,
    collisionRadius: 1,
    colorTint: [0.55, 0.7, 0.5],
    colorVariation: 0.12,
  },
  agave: {
    type: 'agave',
    name: 'Agave',
    minScale: 0.6,
    maxScale: 1.2,
    baseHeight: 1.0,
    castsShadows: false,
    collisionRadius: 1,
    colorTint: [0.5, 0.65, 0.55],
    colorVariation: 0.1,
  },
  mesquite: {
    type: 'mesquite',
    name: 'Mesquite',
    minScale: 0.6,
    maxScale: 1.1,
    baseHeight: 3,
    castsShadows: true,
    collisionRadius: 2,
    colorTint: [0.55, 0.6, 0.45],
    colorVariation: 0.15,
  },
  cottonwood: {
    type: 'cottonwood',
    name: 'Cottonwood',
    minScale: 0.8,
    maxScale: 1.4,
    baseHeight: 8,
    castsShadows: true,
    collisionRadius: 3,
    colorTint: [0.55, 0.7, 0.5],
    colorVariation: 0.12,
  },
  willow: {
    type: 'willow',
    name: 'Desert Willow',
    minScale: 0.7,
    maxScale: 1.2,
    baseHeight: 5,
    castsShadows: true,
    collisionRadius: 2,
    colorTint: [0.5, 0.65, 0.45],
    colorVariation: 0.15,
  },
};

// ============================================================================
// BIOME VEGETATION CONFIGURATIONS
// ============================================================================

export const BIOME_VEGETATION: Record<BiomeType, BiomeVegetationConfig> = {
  desert: {
    biome: 'desert',
    densityMultiplier: 0.3,
    maxPerChunk: 40,
    rules: [
      {
        type: 'cactus',
        density: 0.15,
        minHeight: -5,
        maxHeight: 15,
        minSlope: 0,
        maxSlope: 0.3,
        clustering: 0.2,
      },
      {
        type: 'barrelCactus',
        density: 0.25,
        minHeight: -5,
        maxHeight: 20,
        minSlope: 0,
        maxSlope: 0.4,
        clustering: 0.4,
      },
      {
        type: 'pricklyPear',
        density: 0.2,
        minHeight: -5,
        maxHeight: 18,
        minSlope: 0,
        maxSlope: 0.35,
        clustering: 0.5,
      },
      {
        type: 'joshuaTree',
        density: 0.1,
        minHeight: 0,
        maxHeight: 25,
        minSlope: 0,
        maxSlope: 0.25,
        clustering: 0.15,
      },
      {
        type: 'yucca',
        density: 0.15,
        minHeight: -5,
        maxHeight: 20,
        minSlope: 0,
        maxSlope: 0.4,
        clustering: 0.3,
      },
      {
        type: 'tumbleweed',
        density: 0.15,
        minHeight: -10,
        maxHeight: 30,
        minSlope: 0,
        maxSlope: 0.5,
        clustering: 0.1,
      },
      {
        type: 'rock',
        density: 0.1,
        minHeight: -5,
        maxHeight: 25,
        minSlope: 0,
        maxSlope: 0.6,
        clustering: 0.3,
      },
    ],
  },
  grassland: {
    biome: 'grassland',
    densityMultiplier: 0.6,
    maxPerChunk: 80,
    rules: [
      {
        type: 'sagebrush',
        density: 0.4,
        minHeight: -5,
        maxHeight: 20,
        minSlope: 0,
        maxSlope: 0.45,
        clustering: 0.5,
      },
      {
        type: 'mesquite',
        density: 0.15,
        minHeight: -2,
        maxHeight: 15,
        minSlope: 0,
        maxSlope: 0.3,
        clustering: 0.3,
      },
      {
        type: 'yucca',
        density: 0.2,
        minHeight: -5,
        maxHeight: 18,
        minSlope: 0,
        maxSlope: 0.4,
        clustering: 0.35,
      },
      {
        type: 'pricklyPear',
        density: 0.1,
        minHeight: -5,
        maxHeight: 15,
        minSlope: 0,
        maxSlope: 0.35,
        clustering: 0.4,
      },
      {
        type: 'joshuaTree',
        density: 0.08,
        minHeight: 2,
        maxHeight: 20,
        minSlope: 0,
        maxSlope: 0.2,
        clustering: 0.2,
      },
      {
        type: 'tumbleweed',
        density: 0.07,
        minHeight: -10,
        maxHeight: 25,
        minSlope: 0,
        maxSlope: 0.5,
        clustering: 0.05,
      },
    ],
  },
  badlands: {
    biome: 'badlands',
    densityMultiplier: 0.15,
    maxPerChunk: 25,
    rules: [
      {
        type: 'deadTree',
        density: 0.35,
        minHeight: -5,
        maxHeight: 30,
        minSlope: 0,
        maxSlope: 0.5,
        clustering: 0.25,
      },
      {
        type: 'sagebrush',
        density: 0.2,
        minHeight: -5,
        maxHeight: 20,
        minSlope: 0,
        maxSlope: 0.6,
        clustering: 0.4,
      },
      {
        type: 'barrelCactus',
        density: 0.15,
        minHeight: -5,
        maxHeight: 25,
        minSlope: 0,
        maxSlope: 0.5,
        clustering: 0.3,
      },
      {
        type: 'agave',
        density: 0.15,
        minHeight: -5,
        maxHeight: 20,
        minSlope: 0,
        maxSlope: 0.55,
        clustering: 0.35,
      },
      {
        type: 'tumbleweed',
        density: 0.15,
        minHeight: -10,
        maxHeight: 35,
        minSlope: 0,
        maxSlope: 0.7,
        clustering: 0.1,
      },
      {
        type: 'rock',
        density: 0.3,
        minHeight: -5,
        maxHeight: 35,
        minSlope: 0,
        maxSlope: 0.8,
        clustering: 0.5,
      },
    ],
  },
  riverside: {
    biome: 'riverside',
    densityMultiplier: 0.8,
    maxPerChunk: 100,
    rules: [
      {
        type: 'cottonwood',
        density: 0.25,
        minHeight: -5,
        maxHeight: 10,
        minSlope: 0,
        maxSlope: 0.25,
        clustering: 0.4,
      },
      {
        type: 'willow',
        density: 0.2,
        minHeight: -5,
        maxHeight: 8,
        minSlope: 0,
        maxSlope: 0.3,
        clustering: 0.45,
      },
      {
        type: 'sagebrush',
        density: 0.25,
        minHeight: -3,
        maxHeight: 12,
        minSlope: 0,
        maxSlope: 0.4,
        clustering: 0.5,
      },
      {
        type: 'mesquite',
        density: 0.15,
        minHeight: -2,
        maxHeight: 10,
        minSlope: 0,
        maxSlope: 0.3,
        clustering: 0.35,
      },
      {
        type: 'rock',
        density: 0.15,
        minHeight: -5,
        maxHeight: 15,
        minSlope: 0,
        maxSlope: 0.5,
        clustering: 0.4,
      },
    ],
  },
  town: {
    biome: 'town',
    densityMultiplier: 0.1,
    maxPerChunk: 10,
    rules: [
      {
        type: 'mesquite',
        density: 0.4,
        minHeight: -5,
        maxHeight: 15,
        minSlope: 0,
        maxSlope: 0.2,
        clustering: 0.2,
      },
      {
        type: 'sagebrush',
        density: 0.3,
        minHeight: -5,
        maxHeight: 15,
        minSlope: 0,
        maxSlope: 0.3,
        clustering: 0.3,
      },
      {
        type: 'barrelCactus',
        density: 0.2,
        minHeight: -5,
        maxHeight: 15,
        minSlope: 0,
        maxSlope: 0.25,
        clustering: 0.2,
      },
      {
        type: 'tumbleweed',
        density: 0.1,
        minHeight: -10,
        maxHeight: 20,
        minSlope: 0,
        maxSlope: 0.5,
        clustering: 0.05,
      },
    ],
  },
};

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_VEGETATION_CONFIG: VegetationSpawnerConfig = {
  seed: 12345,
  viewDistance: 3,
  chunkSize: 32,
  globalDensity: 0.8,
  minSpacing: 2,
  maxTotalInstances: 5000,
  lodDistances: [50, 100, 200],
};
