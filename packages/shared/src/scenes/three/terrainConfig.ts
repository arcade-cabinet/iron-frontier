/**
 * Three.js Terrain Configuration
 *
 * Biome definitions, height noise parameters, and vegetation configs
 * for procedural terrain generation.
 *
 * Pure data - no Three.js runtime code.
 *
 * Usage:
 *   import { BIOME_CONFIGS, getTerrainNoiseConfig } from '@iron-frontier/shared/scenes/three';
 *
 *   const desert = BIOME_CONFIGS.desert;
 *   console.log(desert.textures.diffuse); // texture path
 */

import type { RGBColor } from './sceneConfig';

// ============================================================================
// BIOME TYPES
// ============================================================================

export type BiomeType =
  | 'desert'
  | 'grassland'
  | 'badlands'
  | 'riverside'
  | 'mesa'
  | 'scrubland'
  | 'canyon'
  | 'town';

// ============================================================================
// TEXTURE CONFIGURATION
// ============================================================================

export interface TerrainTextureConfig {
  /** Path to diffuse/albedo texture */
  diffuse: string;
  /** Path to normal map */
  normal: string;
  /** Path to roughness map (optional) */
  roughness?: string;
  /** Path to ambient occlusion map (optional) */
  ao?: string;
  /** Path to displacement/height map (optional) */
  displacement?: string;
  /** Texture tiling scale */
  scale: number;
}

// ============================================================================
// NOISE CONFIGURATION
// ============================================================================

export interface NoiseConfig {
  /** Base frequency of noise */
  frequency: number;
  /** Maximum amplitude (height) */
  amplitude: number;
  /** Number of octaves */
  octaves: number;
  /** How quickly amplitude decreases per octave (0-1) */
  persistence: number;
  /** How quickly frequency increases per octave */
  lacunarity: number;
}

// ============================================================================
// VEGETATION CONFIGURATION
// ============================================================================

export interface VegetationItem {
  /** Model asset path */
  model: string;
  /** Spawn weight (higher = more common) */
  weight: number;
  /** Minimum scale */
  scaleMin: number;
  /** Maximum scale */
  scaleMax: number;
  /** Random rotation enabled */
  randomRotation: boolean;
  /** Y offset from terrain */
  yOffset: number;
  /** Slope limit (0-1, where 1 = vertical) */
  maxSlope: number;
}

export interface VegetationConfig {
  /** Base density (0-1) */
  density: number;
  /** Vegetation items that can spawn */
  items: VegetationItem[];
  /** Noise frequency for density variation */
  noiseFrequency: number;
  /** Minimum height for vegetation */
  minHeight: number;
  /** Maximum height for vegetation */
  maxHeight: number;
}

// ============================================================================
// ENCOUNTER CONFIGURATION
// ============================================================================

export interface EncounterConfig {
  /** Base encounter rate (0-1) per tile */
  baseRate: number;
  /** Enemy types that can spawn */
  enemyTypes: string[];
  /** Minimum player level for encounters */
  minLevel: number;
  /** Maximum enemy group size */
  maxGroupSize: number;
}

// ============================================================================
// BIOME CONFIGURATION
// ============================================================================

export interface BiomeConfig {
  /** Biome type identifier */
  type: BiomeType;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Primary ground color (fallback if no texture) */
  groundColor: RGBColor;
  /** Ground textures */
  textures: TerrainTextureConfig;
  /** Height noise parameters */
  heightNoise: NoiseConfig;
  /** Vegetation configuration */
  vegetation: VegetationConfig;
  /** Encounter configuration */
  encounters: EncounterConfig;
  /** Ambient sound ID */
  ambientSound: string;
  /** Weather probabilities */
  weather: {
    clear: number;
    dusty: number;
    storm: number;
  };
}

// ============================================================================
// BIOME DEFINITIONS
// ============================================================================

export const BIOME_CONFIGS: Record<BiomeType, BiomeConfig> = {
  desert: {
    type: 'desert',
    name: 'Desert',
    description: 'Arid sandy desert with sparse vegetation',
    groundColor: { r: 0.76, g: 0.65, b: 0.48 },
    textures: {
      diffuse: 'textures/terrain/desert_sand_diffuse.jpg',
      normal: 'textures/terrain/desert_sand_normal.jpg',
      roughness: 'textures/terrain/desert_sand_roughness.jpg',
      scale: 50,
    },
    heightNoise: {
      frequency: 0.003,
      amplitude: 8,
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
    },
    vegetation: {
      density: 0.15,
      items: [
        {
          model: 'models/vegetation/cactus_saguaro.glb',
          weight: 1.0,
          scaleMin: 0.8,
          scaleMax: 1.5,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.3,
        },
        {
          model: 'models/vegetation/cactus_barrel.glb',
          weight: 1.5,
          scaleMin: 0.6,
          scaleMax: 1.2,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.4,
        },
        {
          model: 'models/vegetation/tumbleweed.glb',
          weight: 2.0,
          scaleMin: 0.4,
          scaleMax: 0.8,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.5,
        },
        {
          model: 'models/vegetation/desert_shrub.glb',
          weight: 2.5,
          scaleMin: 0.5,
          scaleMax: 1.0,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.4,
        },
      ],
      noiseFrequency: 0.02,
      minHeight: 0,
      maxHeight: 20,
    },
    encounters: {
      baseRate: 0.08,
      enemyTypes: ['bandit', 'rattlesnake', 'scorpion', 'coyote'],
      minLevel: 1,
      maxGroupSize: 4,
    },
    ambientSound: 'ambient/desert_wind',
    weather: { clear: 0.7, dusty: 0.25, storm: 0.05 },
  },

  grassland: {
    type: 'grassland',
    name: 'Grassland',
    description: 'Rolling prairie with tall grass',
    groundColor: { r: 0.45, g: 0.55, b: 0.3 },
    textures: {
      diffuse: 'textures/terrain/prairie_grass_diffuse.jpg',
      normal: 'textures/terrain/prairie_grass_normal.jpg',
      scale: 40,
    },
    heightNoise: {
      frequency: 0.004,
      amplitude: 12,
      octaves: 5,
      persistence: 0.55,
      lacunarity: 2.1,
    },
    vegetation: {
      density: 0.6,
      items: [
        {
          model: 'models/vegetation/tall_grass.glb',
          weight: 5.0,
          scaleMin: 0.6,
          scaleMax: 1.2,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.6,
        },
        {
          model: 'models/vegetation/wildflowers.glb',
          weight: 2.0,
          scaleMin: 0.4,
          scaleMax: 0.8,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.5,
        },
        {
          model: 'models/vegetation/mesquite_tree.glb',
          weight: 0.5,
          scaleMin: 0.8,
          scaleMax: 1.4,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.3,
        },
      ],
      noiseFrequency: 0.015,
      minHeight: 0,
      maxHeight: 25,
    },
    encounters: {
      baseRate: 0.06,
      enemyTypes: ['bandit', 'wolf', 'bison'],
      minLevel: 1,
      maxGroupSize: 5,
    },
    ambientSound: 'ambient/prairie_wind',
    weather: { clear: 0.75, dusty: 0.15, storm: 0.1 },
  },

  badlands: {
    type: 'badlands',
    name: 'Badlands',
    description: 'Eroded rock formations and steep terrain',
    groundColor: { r: 0.6, g: 0.45, b: 0.35 },
    textures: {
      diffuse: 'textures/terrain/badlands_rock_diffuse.jpg',
      normal: 'textures/terrain/badlands_rock_normal.jpg',
      roughness: 'textures/terrain/badlands_rock_roughness.jpg',
      scale: 30,
    },
    heightNoise: {
      frequency: 0.008,
      amplitude: 35,
      octaves: 6,
      persistence: 0.45,
      lacunarity: 2.3,
    },
    vegetation: {
      density: 0.08,
      items: [
        {
          model: 'models/vegetation/dead_tree.glb',
          weight: 1.0,
          scaleMin: 0.6,
          scaleMax: 1.0,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.4,
        },
        {
          model: 'models/vegetation/rock_pile.glb',
          weight: 3.0,
          scaleMin: 0.5,
          scaleMax: 1.5,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.7,
        },
      ],
      noiseFrequency: 0.03,
      minHeight: 10,
      maxHeight: 50,
    },
    encounters: {
      baseRate: 0.1,
      enemyTypes: ['bandit', 'mountain_lion', 'vulture'],
      minLevel: 3,
      maxGroupSize: 3,
    },
    ambientSound: 'ambient/badlands_echo',
    weather: { clear: 0.6, dusty: 0.3, storm: 0.1 },
  },

  riverside: {
    type: 'riverside',
    name: 'Riverside',
    description: 'Lush vegetation along waterways',
    groundColor: { r: 0.35, g: 0.45, b: 0.3 },
    textures: {
      diffuse: 'textures/terrain/riverside_mud_diffuse.jpg',
      normal: 'textures/terrain/riverside_mud_normal.jpg',
      scale: 35,
    },
    heightNoise: {
      frequency: 0.005,
      amplitude: 6,
      octaves: 4,
      persistence: 0.6,
      lacunarity: 1.8,
    },
    vegetation: {
      density: 0.75,
      items: [
        {
          model: 'models/vegetation/cottonwood_tree.glb',
          weight: 1.0,
          scaleMin: 0.9,
          scaleMax: 1.5,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.25,
        },
        {
          model: 'models/vegetation/willow_tree.glb',
          weight: 0.8,
          scaleMin: 0.8,
          scaleMax: 1.3,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.25,
        },
        {
          model: 'models/vegetation/cattails.glb',
          weight: 3.0,
          scaleMin: 0.6,
          scaleMax: 1.0,
          randomRotation: true,
          yOffset: -0.1,
          maxSlope: 0.3,
        },
        {
          model: 'models/vegetation/fern.glb',
          weight: 2.0,
          scaleMin: 0.4,
          scaleMax: 0.8,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.4,
        },
      ],
      noiseFrequency: 0.01,
      minHeight: 0,
      maxHeight: 10,
    },
    encounters: {
      baseRate: 0.05,
      enemyTypes: ['bandit', 'alligator', 'water_moccasin'],
      minLevel: 2,
      maxGroupSize: 4,
    },
    ambientSound: 'ambient/river_flow',
    weather: { clear: 0.8, dusty: 0.05, storm: 0.15 },
  },

  mesa: {
    type: 'mesa',
    name: 'Mesa',
    description: 'Flat-topped elevated landforms',
    groundColor: { r: 0.7, g: 0.5, b: 0.35 },
    textures: {
      diffuse: 'textures/terrain/mesa_rock_diffuse.jpg',
      normal: 'textures/terrain/mesa_rock_normal.jpg',
      roughness: 'textures/terrain/mesa_rock_roughness.jpg',
      scale: 40,
    },
    heightNoise: {
      frequency: 0.002,
      amplitude: 40,
      octaves: 3,
      persistence: 0.3,
      lacunarity: 2.5,
    },
    vegetation: {
      density: 0.12,
      items: [
        {
          model: 'models/vegetation/juniper.glb',
          weight: 1.0,
          scaleMin: 0.6,
          scaleMax: 1.2,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.35,
        },
        {
          model: 'models/vegetation/yucca.glb',
          weight: 1.5,
          scaleMin: 0.5,
          scaleMax: 1.0,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.4,
        },
      ],
      noiseFrequency: 0.025,
      minHeight: 15,
      maxHeight: 60,
    },
    encounters: {
      baseRate: 0.07,
      enemyTypes: ['bandit', 'eagle', 'rattlesnake'],
      minLevel: 4,
      maxGroupSize: 3,
    },
    ambientSound: 'ambient/mesa_wind',
    weather: { clear: 0.65, dusty: 0.25, storm: 0.1 },
  },

  scrubland: {
    type: 'scrubland',
    name: 'Scrubland',
    description: 'Dry terrain with hardy shrubs',
    groundColor: { r: 0.55, g: 0.5, b: 0.4 },
    textures: {
      diffuse: 'textures/terrain/scrub_dirt_diffuse.jpg',
      normal: 'textures/terrain/scrub_dirt_normal.jpg',
      scale: 45,
    },
    heightNoise: {
      frequency: 0.004,
      amplitude: 10,
      octaves: 5,
      persistence: 0.5,
      lacunarity: 2.0,
    },
    vegetation: {
      density: 0.4,
      items: [
        {
          model: 'models/vegetation/sagebrush.glb',
          weight: 3.0,
          scaleMin: 0.5,
          scaleMax: 0.9,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.5,
        },
        {
          model: 'models/vegetation/creosote.glb',
          weight: 2.0,
          scaleMin: 0.6,
          scaleMax: 1.1,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.4,
        },
        {
          model: 'models/vegetation/prickly_pear.glb',
          weight: 1.5,
          scaleMin: 0.4,
          scaleMax: 0.8,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.45,
        },
      ],
      noiseFrequency: 0.018,
      minHeight: 0,
      maxHeight: 20,
    },
    encounters: {
      baseRate: 0.07,
      enemyTypes: ['bandit', 'coyote', 'javelina'],
      minLevel: 2,
      maxGroupSize: 5,
    },
    ambientSound: 'ambient/scrubland_breeze',
    weather: { clear: 0.7, dusty: 0.2, storm: 0.1 },
  },

  canyon: {
    type: 'canyon',
    name: 'Canyon',
    description: 'Deep river-carved gorges',
    groundColor: { r: 0.65, g: 0.4, b: 0.3 },
    textures: {
      diffuse: 'textures/terrain/canyon_rock_diffuse.jpg',
      normal: 'textures/terrain/canyon_rock_normal.jpg',
      roughness: 'textures/terrain/canyon_rock_roughness.jpg',
      displacement: 'textures/terrain/canyon_rock_height.jpg',
      scale: 25,
    },
    heightNoise: {
      frequency: 0.006,
      amplitude: 50,
      octaves: 5,
      persistence: 0.4,
      lacunarity: 2.4,
    },
    vegetation: {
      density: 0.1,
      items: [
        {
          model: 'models/vegetation/canyon_pine.glb',
          weight: 0.5,
          scaleMin: 0.7,
          scaleMax: 1.2,
          randomRotation: true,
          yOffset: 0,
          maxSlope: 0.5,
        },
        {
          model: 'models/vegetation/boulder.glb',
          weight: 2.0,
          scaleMin: 0.8,
          scaleMax: 2.0,
          randomRotation: true,
          yOffset: -0.2,
          maxSlope: 0.8,
        },
      ],
      noiseFrequency: 0.035,
      minHeight: -20,
      maxHeight: 40,
    },
    encounters: {
      baseRate: 0.12,
      enemyTypes: ['bandit', 'mountain_lion', 'outlaw_gang'],
      minLevel: 5,
      maxGroupSize: 4,
    },
    ambientSound: 'ambient/canyon_echo',
    weather: { clear: 0.7, dusty: 0.2, storm: 0.1 },
  },

  town: {
    type: 'town',
    name: 'Town',
    description: 'Settled area with buildings',
    groundColor: { r: 0.5, g: 0.45, b: 0.4 },
    textures: {
      diffuse: 'textures/terrain/town_dirt_diffuse.jpg',
      normal: 'textures/terrain/town_dirt_normal.jpg',
      scale: 20,
    },
    heightNoise: {
      frequency: 0.001,
      amplitude: 2,
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2.0,
    },
    vegetation: {
      density: 0.05,
      items: [
        {
          model: 'models/vegetation/hitching_post.glb',
          weight: 1.0,
          scaleMin: 1.0,
          scaleMax: 1.0,
          randomRotation: false,
          yOffset: 0,
          maxSlope: 0.1,
        },
        {
          model: 'models/vegetation/water_trough.glb',
          weight: 0.5,
          scaleMin: 1.0,
          scaleMax: 1.0,
          randomRotation: false,
          yOffset: 0,
          maxSlope: 0.1,
        },
      ],
      noiseFrequency: 0.05,
      minHeight: 0,
      maxHeight: 5,
    },
    encounters: {
      baseRate: 0.02,
      enemyTypes: ['drunk', 'pickpocket'],
      minLevel: 1,
      maxGroupSize: 2,
    },
    ambientSound: 'ambient/town_bustle',
    weather: { clear: 0.85, dusty: 0.1, storm: 0.05 },
  },
};

// ============================================================================
// TERRAIN GENERATION HELPERS
// ============================================================================

/**
 * Get noise config for a specific biome
 */
export function getTerrainNoiseConfig(biome: BiomeType): NoiseConfig {
  return BIOME_CONFIGS[biome].heightNoise;
}

/**
 * Get blended noise config for biome transitions
 */
export function blendNoiseConfigs(configA: NoiseConfig, configB: NoiseConfig, t: number): NoiseConfig {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  return {
    frequency: lerp(configA.frequency, configB.frequency, t),
    amplitude: lerp(configA.amplitude, configB.amplitude, t),
    octaves: Math.round(lerp(configA.octaves, configB.octaves, t)),
    persistence: lerp(configA.persistence, configB.persistence, t),
    lacunarity: lerp(configA.lacunarity, configB.lacunarity, t),
  };
}

/**
 * Get vegetation items for a biome, filtered by slope and height
 */
export function getValidVegetationItems(
  biome: BiomeType,
  slope: number,
  height: number
): VegetationItem[] {
  const config = BIOME_CONFIGS[biome].vegetation;

  // Check height bounds
  if (height < config.minHeight || height > config.maxHeight) {
    return [];
  }

  // Filter by slope
  return config.items.filter((item) => slope <= item.maxSlope);
}

/**
 * Calculate effective vegetation density with noise
 */
export function getVegetationDensity(
  biome: BiomeType,
  noiseValue: number,
  qualityMultiplier = 1.0
): number {
  const baseConfig = BIOME_CONFIGS[biome].vegetation;
  // Noise value is -1 to 1, map to 0-2 multiplier
  const noiseMultiplier = (noiseValue + 1) * 0.5 + 0.5;
  return baseConfig.density * noiseMultiplier * qualityMultiplier;
}

/**
 * Select a vegetation item based on weighted random
 */
export function selectVegetationItem(
  items: VegetationItem[],
  random: number
): VegetationItem | null {
  if (items.length === 0) return null;

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let threshold = random * totalWeight;

  for (const item of items) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

/**
 * Get encounter rate for a biome
 */
export function getEncounterRate(biome: BiomeType, playerLevel: number): number {
  const config = BIOME_CONFIGS[biome].encounters;
  if (playerLevel < config.minLevel) {
    return 0;
  }
  return config.baseRate;
}

/**
 * Get weather probabilities for a biome
 */
export function getWeatherProbabilities(
  biome: BiomeType
): { clear: number; dusty: number; storm: number } {
  return BIOME_CONFIGS[biome].weather;
}

// ============================================================================
// TEXTURE SPLATMAP HELPERS
// ============================================================================

export interface SplatmapWeights {
  desert: number;
  grass: number;
  rock: number;
  mud: number;
}

/**
 * Calculate splatmap weights based on biome, slope, and height
 */
export function calculateSplatmapWeights(
  biome: BiomeType,
  slope: number,
  height: number,
  moisture: number
): SplatmapWeights {
  // Start with biome-based weights
  const weights: SplatmapWeights = {
    desert: 0,
    grass: 0,
    rock: 0,
    mud: 0,
  };

  // Base weights from biome
  switch (biome) {
    case 'desert':
    case 'scrubland':
      weights.desert = 1.0;
      break;
    case 'grassland':
      weights.grass = 1.0;
      break;
    case 'badlands':
    case 'mesa':
    case 'canyon':
      weights.rock = 1.0;
      break;
    case 'riverside':
      weights.mud = 0.6;
      weights.grass = 0.4;
      break;
    case 'town':
      weights.desert = 0.7;
      weights.mud = 0.3;
      break;
  }

  // Steep slopes get more rock
  if (slope > 0.4) {
    const rockBlend = (slope - 0.4) / 0.6;
    weights.rock = weights.rock + rockBlend * (1 - weights.rock);
    weights.desert *= 1 - rockBlend;
    weights.grass *= 1 - rockBlend;
    weights.mud *= 1 - rockBlend;
  }

  // Low areas with moisture get mud
  if (height < 5 && moisture > 0.5) {
    const mudBlend = moisture * 0.5;
    weights.mud += mudBlend;
  }

  // Normalize weights
  const total = weights.desert + weights.grass + weights.rock + weights.mud;
  if (total > 0) {
    weights.desert /= total;
    weights.grass /= total;
    weights.rock /= total;
    weights.mud /= total;
  }

  return weights;
}
