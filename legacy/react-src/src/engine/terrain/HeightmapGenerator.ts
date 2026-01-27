// Heightmap Generator - Procedural terrain with biome blending

import Alea from 'alea';
import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';
import {
  type BiomeType,
  CHUNK_SIZE,
  type ChunkCoord,
  DEFAULT_TERRAIN_CONFIG,
  type TerrainConfig,
} from '../types';

const HEIGHTMAP_RESOLUTION = 65; // 65x65 vertices per chunk (64 quads)

export interface HeightmapResult {
  heights: Float32Array;
  biomeWeights: Map<BiomeType, Float32Array>;
  resolution: number;
}

export class HeightmapGenerator {
  private config: TerrainConfig;
  private continentalNoise: NoiseFunction2D;
  private erosionNoise: NoiseFunction2D;
  private detailNoise: NoiseFunction2D;
  private moistureNoise: NoiseFunction2D;
  private temperatureNoise: NoiseFunction2D;
  private variationNoise: NoiseFunction2D;

  constructor(config: Partial<TerrainConfig> = {}) {
    this.config = { ...DEFAULT_TERRAIN_CONFIG, ...config };

    // Create seeded noise functions
    const prng = Alea(this.config.seed);
    this.continentalNoise = createNoise2D(prng);
    this.erosionNoise = createNoise2D(Alea(this.config.seed + 1));
    this.detailNoise = createNoise2D(Alea(this.config.seed + 2));
    this.moistureNoise = createNoise2D(Alea(this.config.seed + 3));
    this.temperatureNoise = createNoise2D(Alea(this.config.seed + 4));
    this.variationNoise = createNoise2D(Alea(this.config.seed + 5));
  }

  generate(chunk: ChunkCoord): HeightmapResult {
    const size = HEIGHTMAP_RESOLUTION;
    const heights = new Float32Array(size * size);

    // Initialize biome weight maps
    const biomeWeights = new Map<BiomeType, Float32Array>();
    const biomeTypes: BiomeType[] = [
      'desert',
      'grassland',
      'badlands',
      'riverside',
      'town',
      'railyard',
      'mine',
    ];
    for (const biome of biomeTypes) {
      biomeWeights.set(biome, new Float32Array(size * size));
    }

    // World offset for this chunk
    const worldOffsetX = chunk.cx * CHUNK_SIZE;
    const worldOffsetZ = chunk.cz * CHUNK_SIZE;

    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {
        // Convert to world coordinates
        const worldX = worldOffsetX + (x / (size - 1)) * CHUNK_SIZE;
        const worldZ = worldOffsetZ + (z / (size - 1)) * CHUNK_SIZE;

        // Sample height
        const height = this.sampleHeight(worldX, worldZ);
        heights[z * size + x] = height;

        // Sample biome weights
        const weights = this.sampleBiomeWeights(worldX, worldZ, height);
        for (const [biome, weight] of Object.entries(weights)) {
          const arr = biomeWeights.get(biome as BiomeType);
          if (arr) {
            arr[z * size + x] = weight;
          }
        }
      }
    }

    return {
      heights,
      biomeWeights,
      resolution: size,
    };
  }

  private sampleHeight(worldX: number, worldZ: number): number {
    const { baseHeight, maxElevation, continentalScale, erosionScale, detailScale } = this.config;

    // Layer 1: Continental (large features - mesas, valleys)
    const continental = this.continentalNoise(worldX * continentalScale, worldZ * continentalScale);

    // Layer 2: Erosion (medium features - hills, gullies)
    const erosion = this.erosionNoise(worldX * erosionScale, worldZ * erosionScale) * 0.5;

    // Layer 3: Detail (small features - bumps)
    const detail = this.detailNoise(worldX * detailScale, worldZ * detailScale) * 0.15;

    // Combine with weighted sum
    let height = continental * 0.6 + erosion * 0.3 + detail * 0.1;

    // Normalize from [-1, 1] to [0, 1]
    height = (height + 1) / 2;

    // Scale to elevation range
    height = baseHeight + height * maxElevation;

    // Add mesa-like plateaus in certain areas
    const mesaFactor = this.variationNoise(worldX * 0.003, worldZ * 0.003);
    if (mesaFactor > 0.6) {
      height = Math.max(height, maxElevation * 0.7);
    }

    return height;
  }

  private sampleBiomeWeights(
    worldX: number,
    worldZ: number,
    height: number
  ): Record<BiomeType, number> {
    // Sample environmental factors
    const moisture = (this.moistureNoise(worldX * 0.01, worldZ * 0.01) + 1) / 2;
    const temperature = (this.temperatureNoise(worldX * 0.008, worldZ * 0.008) + 1) / 2;
    const variation = (this.variationNoise(worldX * 0.02, worldZ * 0.02) + 1) / 2;

    // Normalized height factor
    const heightFactor = height / this.config.maxElevation;

    // Calculate raw weights based on environmental conditions
    const weights: Record<BiomeType, number> = {
      desert: this.clamp(1 - moisture - 0.3 + temperature * 0.5, 0, 1),
      grassland: this.clamp(moisture * 0.8 + (1 - temperature) * 0.3 - heightFactor * 0.2, 0, 1),
      badlands: this.clamp(heightFactor * 0.8 + (1 - moisture) * 0.4 - 0.3, 0, 1),
      riverside: this.clamp(moisture * 1.5 - 0.5, 0, 1),
      town: 0, // Set by structure placement
      railyard: 0, // Set by structure placement
      mine: this.clamp(heightFactor * 0.5 + variation * 0.3 - 0.6, 0, 1),
    };

    // Normalize weights to sum to 1
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (total > 0) {
      for (const key of Object.keys(weights) as BiomeType[]) {
        weights[key] /= total;
      }
    } else {
      weights.desert = 1; // Fallback
    }

    return weights;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  // Get height at exact world position (interpolated)
  getHeightAt(worldX: number, worldZ: number): number {
    return this.sampleHeight(worldX, worldZ);
  }

  // Get dominant biome at position
  getBiomeAt(worldX: number, worldZ: number): BiomeType {
    const height = this.sampleHeight(worldX, worldZ);
    const weights = this.sampleBiomeWeights(worldX, worldZ, height);

    let maxBiome: BiomeType = 'desert';
    let maxWeight = 0;

    for (const [biome, weight] of Object.entries(weights)) {
      if (weight > maxWeight) {
        maxWeight = weight;
        maxBiome = biome as BiomeType;
      }
    }

    return maxBiome;
  }
}

// Singleton for consistent terrain across the game
let globalGenerator: HeightmapGenerator | null = null;

export function getHeightmapGenerator(seed?: number): HeightmapGenerator {
  if (!globalGenerator || (seed !== undefined && seed !== globalGenerator['config'].seed)) {
    globalGenerator = new HeightmapGenerator(seed !== undefined ? { seed } : undefined);
  }
  return globalGenerator;
}
