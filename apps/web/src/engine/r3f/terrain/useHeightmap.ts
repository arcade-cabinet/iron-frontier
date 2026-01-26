// useHeightmap - React hook for procedural heightmap generation
// Ported from HeightmapGenerator.ts for R3F terrain system

import Alea from 'alea';
import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';
import { useMemo, useCallback } from 'react';
import type { BiomeType, ChunkCoord } from '@iron-frontier/shared/types/engine';

// ============================================================================
// CONSTANTS
// ============================================================================

export const CHUNK_SIZE = 64; // 64x64 meters per chunk
export const VIEW_DISTANCE = 3; // Load chunks within this radius
export const HEIGHTMAP_RESOLUTION = 65; // 65x65 vertices per chunk (64 quads)

// ============================================================================
// TYPES
// ============================================================================

export interface TerrainConfig {
  seed: number;
  baseHeight: number;
  maxElevation: number;
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

export interface HeightmapData {
  heights: Float32Array;
  biomeWeights: Map<BiomeType, Float32Array>;
  resolution: number;
}

export interface HeightmapGenerator {
  generate: (chunk: ChunkCoord) => HeightmapData;
  getHeightAt: (worldX: number, worldZ: number) => number;
  getBiomeAt: (worldX: number, worldZ: number) => BiomeType;
  sampleBiomeWeights: (worldX: number, worldZ: number, height: number) => Record<BiomeType, number>;
}

// ============================================================================
// NOISE GENERATOR CLASS
// ============================================================================

class NoiseGenerator implements HeightmapGenerator {
  private config: TerrainConfig;
  private continentalNoise: NoiseFunction2D;
  private erosionNoise: NoiseFunction2D;
  private detailNoise: NoiseFunction2D;
  private moistureNoise: NoiseFunction2D;
  private temperatureNoise: NoiseFunction2D;
  private variationNoise: NoiseFunction2D;

  constructor(config: TerrainConfig) {
    this.config = config;

    // Create seeded noise functions
    const prng = Alea(config.seed);
    this.continentalNoise = createNoise2D(prng);
    this.erosionNoise = createNoise2D(Alea(config.seed + 1));
    this.detailNoise = createNoise2D(Alea(config.seed + 2));
    this.moistureNoise = createNoise2D(Alea(config.seed + 3));
    this.temperatureNoise = createNoise2D(Alea(config.seed + 4));
    this.variationNoise = createNoise2D(Alea(config.seed + 5));
  }

  generate(chunk: ChunkCoord): HeightmapData {
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

  sampleBiomeWeights(
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

  getHeightAt(worldX: number, worldZ: number): number {
    return this.sampleHeight(worldX, worldZ);
  }

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

// ============================================================================
// SINGLETON CACHE
// ============================================================================

const generatorCache = new Map<number, NoiseGenerator>();

function getGenerator(seed: number, config: TerrainConfig): NoiseGenerator {
  if (!generatorCache.has(seed)) {
    generatorCache.set(seed, new NoiseGenerator(config));
  }
  return generatorCache.get(seed)!;
}

// ============================================================================
// REACT HOOK
// ============================================================================

export interface UseHeightmapOptions {
  seed?: number;
  config?: Partial<TerrainConfig>;
}

export interface UseHeightmapResult {
  /** Generate heightmap data for a chunk */
  generate: (chunk: ChunkCoord) => HeightmapData;
  /** Get interpolated height at any world position */
  getHeightAt: (worldX: number, worldZ: number) => number;
  /** Get dominant biome at any world position */
  getBiomeAt: (worldX: number, worldZ: number) => BiomeType;
  /** Get biome weights at any world position */
  getBiomeWeights: (worldX: number, worldZ: number) => Record<BiomeType, number>;
  /** The terrain configuration */
  config: TerrainConfig;
}

/**
 * Hook for procedural heightmap generation.
 *
 * Uses layered simplex noise for terrain generation with biome blending.
 * The noise functions are deterministic based on the seed.
 *
 * @example
 * ```tsx
 * const { getHeightAt, generate } = useHeightmap({ seed: 12345 });
 * const height = getHeightAt(100, 200);
 * const chunkData = generate({ cx: 0, cz: 0 });
 * ```
 */
export function useHeightmap(options: UseHeightmapOptions = {}): UseHeightmapResult {
  const { seed = DEFAULT_TERRAIN_CONFIG.seed, config: configOverride } = options;

  const config = useMemo<TerrainConfig>(() => ({
    ...DEFAULT_TERRAIN_CONFIG,
    ...configOverride,
    seed,
  }), [seed, configOverride]);

  const generator = useMemo(() => getGenerator(seed, config), [seed, config]);

  const generate = useCallback(
    (chunk: ChunkCoord): HeightmapData => generator.generate(chunk),
    [generator]
  );

  const getHeightAt = useCallback(
    (worldX: number, worldZ: number): number => generator.getHeightAt(worldX, worldZ),
    [generator]
  );

  const getBiomeAt = useCallback(
    (worldX: number, worldZ: number): BiomeType => generator.getBiomeAt(worldX, worldZ),
    [generator]
  );

  const getBiomeWeights = useCallback(
    (worldX: number, worldZ: number): Record<BiomeType, number> => {
      const height = generator.getHeightAt(worldX, worldZ);
      return generator.sampleBiomeWeights(worldX, worldZ, height);
    },
    [generator]
  );

  return {
    generate,
    getHeightAt,
    getBiomeAt,
    getBiomeWeights,
    config,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert world position to chunk coordinate
 */
export function worldToChunk(x: number, z: number): ChunkCoord {
  return {
    cx: Math.floor(x / CHUNK_SIZE),
    cz: Math.floor(z / CHUNK_SIZE),
  };
}

/**
 * Convert chunk coordinate to world position (center of chunk)
 */
export function chunkToWorld(coord: ChunkCoord): { x: number; z: number } {
  return {
    x: coord.cx * CHUNK_SIZE + CHUNK_SIZE / 2,
    z: coord.cz * CHUNK_SIZE + CHUNK_SIZE / 2,
  };
}

/**
 * Create a unique key for a chunk coordinate
 */
export function chunkKey(coord: ChunkCoord): string {
  return `${coord.cx},${coord.cz}`;
}

/**
 * Parse a chunk key back to coordinates
 */
export function parseChunkKey(key: string): ChunkCoord {
  const [cx, cz] = key.split(',').map(Number);
  return { cx, cz };
}
