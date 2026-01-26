// useVegetationSpawner - Hook for placing vegetation based on terrain and biomes
// Handles procedural spawning with biome-based rules and clustering

import { useMemo, useRef, useCallback } from 'react';
import Alea from 'alea';
import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';
import {
  type VegetationType,
  type VegetationInstance,
  type BiomeType,
  type HeightQueryFn,
  type BiomeQueryFn,
  type VegetationSpawnerConfig,
  type BiomeVegetationRule,
  BIOME_VEGETATION,
  VEGETATION_TYPES,
  DEFAULT_VEGETATION_CONFIG,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

interface ChunkCoord {
  cx: number;
  cz: number;
}

interface SpawnerState {
  spawnNoise: NoiseFunction2D;
  clusterNoise: NoiseFunction2D;
  loadedChunks: Map<string, VegetationInstance[]>;
}

export interface UseVegetationSpawnerResult {
  /** All currently visible vegetation instances */
  instances: VegetationInstance[];
  /** Update vegetation based on player position */
  update: (playerX: number, playerZ: number) => void;
  /** Clear all loaded vegetation */
  clear: () => void;
  /** Get instances by type */
  getInstancesByType: (type: VegetationType) => VegetationInstance[];
  /** Get statistics */
  getStats: () => { totalInstances: number; loadedChunks: number };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function chunkKey(coord: ChunkCoord): string {
  return `${coord.cx},${coord.cz}`;
}

function worldToChunk(x: number, z: number, chunkSize: number): ChunkCoord {
  return {
    cx: Math.floor(x / chunkSize),
    cz: Math.floor(z / chunkSize),
  };
}

/**
 * Calculate spawn probability for vegetation at a position
 */
function calculateSpawnProbability(
  rule: BiomeVegetationRule,
  height: number,
  slope: number,
  densityMultiplier: number
): number {
  // Check height bounds
  if (height < rule.minHeight || height > rule.maxHeight) {
    return 0;
  }

  // Check slope bounds
  if (slope < rule.minSlope || slope > rule.maxSlope) {
    return 0;
  }

  // Base probability from density
  let probability = rule.density * densityMultiplier;

  // Reduce probability at height extremes
  const heightRange = rule.maxHeight - rule.minHeight;
  const heightCenter = (rule.maxHeight + rule.minHeight) / 2;
  const heightDistance = Math.abs(height - heightCenter) / (heightRange / 2);
  probability *= 1 - heightDistance * 0.3;

  // Reduce probability at slope extremes
  const slopeRange = rule.maxSlope - rule.minSlope;
  if (slopeRange > 0) {
    const slopeCenter = (rule.maxSlope + rule.minSlope) / 2;
    const slopeDistance = Math.abs(slope - slopeCenter) / (slopeRange / 2);
    probability *= 1 - slopeDistance * 0.2;
  }

  return Math.max(0, Math.min(1, probability));
}

/**
 * Calculate terrain slope at a position
 */
function calculateSlope(x: number, z: number, getHeight: HeightQueryFn): number {
  const sampleDist = 1;
  const centerHeight = getHeight(x, z);
  const hL = getHeight(x - sampleDist, z);
  const hR = getHeight(x + sampleDist, z);
  const hU = getHeight(x, z - sampleDist);
  const hD = getHeight(x, z + sampleDist);

  const dX = (hR - hL) / (sampleDist * 2);
  const dZ = (hD - hU) / (sampleDist * 2);

  // Slope as 0-1 (0 = flat, 1 = vertical)
  const slope = Math.sqrt(dX * dX + dZ * dZ);
  return Math.min(1, slope);
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook for spawning vegetation based on terrain and biomes
 *
 * @param getHeight - Function to query terrain height at (x, z)
 * @param getBiome - Function to query biome at (x, z)
 * @param config - Spawner configuration
 */
export function useVegetationSpawner(
  getHeight: HeightQueryFn,
  getBiome: BiomeQueryFn,
  config: Partial<VegetationSpawnerConfig> = {}
): UseVegetationSpawnerResult {
  const fullConfig = useMemo<VegetationSpawnerConfig>(
    () => ({ ...DEFAULT_VEGETATION_CONFIG, ...config }),
    [config]
  );

  // Initialize noise functions and state
  const stateRef = useRef<SpawnerState | null>(null);

  if (!stateRef.current) {
    const prng = Alea(fullConfig.seed + 1000);
    stateRef.current = {
      spawnNoise: createNoise2D(prng),
      clusterNoise: createNoise2D(Alea(fullConfig.seed + 2000)),
      loadedChunks: new Map(),
    };
  }

  const state = stateRef.current;

  // Track last update position to avoid redundant updates
  const lastUpdateRef = useRef<{ x: number; z: number } | null>(null);

  /**
   * Generate vegetation for a single chunk
   */
  const generateChunkVegetation = useCallback(
    (coord: ChunkCoord): VegetationInstance[] => {
      const instances: VegetationInstance[] = [];
      const { chunkSize, globalDensity, minSpacing, seed } = fullConfig;

      const worldX = coord.cx * chunkSize;
      const worldZ = coord.cz * chunkSize;

      // Sample biome at chunk center
      const centerX = worldX + chunkSize / 2;
      const centerZ = worldZ + chunkSize / 2;
      const biomeSample = getBiome(centerX, centerZ);
      const biomeConfig = BIOME_VEGETATION[biomeSample];

      if (!biomeConfig) return instances;

      // Seeded random for this chunk
      const chunkSeed = seed + coord.cx * 73856093 + coord.cz * 19349663;
      const prng = Alea(chunkSeed);
      const random = () => prng();

      // Grid-based spawn with jitter
      const spacing = minSpacing / globalDensity;
      const gridSize = Math.floor(chunkSize / spacing);

      for (let gx = 0; gx < gridSize; gx++) {
        for (let gz = 0; gz < gridSize; gz++) {
          // Jittered position within cell
          const jitterX = (random() - 0.5) * spacing * 0.8;
          const jitterZ = (random() - 0.5) * spacing * 0.8;

          const localX = gx * spacing + spacing / 2 + jitterX;
          const localZ = gz * spacing + spacing / 2 + jitterZ;

          const x = worldX + localX;
          const z = worldZ + localZ;

          // Skip if too close to chunk edge (prevents popping)
          if (localX < 1 || localX > chunkSize - 1 || localZ < 1 || localZ > chunkSize - 1) {
            continue;
          }

          // Get height and biome at this position
          const height = getHeight(x, z);
          const localBiome = getBiome(x, z);

          // Use local biome config if different
          const localBiomeConfig = BIOME_VEGETATION[localBiome] || biomeConfig;

          // Calculate slope
          const slope = calculateSlope(x, z, getHeight);

          // Use noise for base spawn chance
          const noiseValue = (state.spawnNoise(x * 0.05, z * 0.05) + 1) / 2;

          // Try each vegetation rule
          for (const rule of localBiomeConfig.rules) {
            const probability = calculateSpawnProbability(
              rule,
              height,
              slope,
              localBiomeConfig.densityMultiplier * globalDensity
            );

            // Factor in clustering
            const clusterValue = (state.clusterNoise(x * 0.1, z * 0.1) + 1) / 2;
            const clusterBonus = clusterValue > 0.6 ? rule.clustering * 2 : 0;
            const finalProbability = probability * noiseValue + clusterBonus * probability;

            if (random() < finalProbability) {
              const typeConfig = VEGETATION_TYPES[rule.type];

              // Calculate scale with variation
              const scaleRange = typeConfig.maxScale - typeConfig.minScale;
              const scale = typeConfig.minScale + random() * scaleRange;

              // Random rotation
              const rotation = random() * Math.PI * 2;

              // Color variation
              const colorVar = typeConfig.colorVariation;
              const colorVariation: [number, number, number] = [
                (random() - 0.5) * colorVar * 2,
                (random() - 0.5) * colorVar * 2,
                (random() - 0.5) * colorVar * 2,
              ];

              instances.push({
                id: `${coord.cx}_${coord.cz}_${instances.length}`,
                type: rule.type,
                position: [x, height, z],
                rotation: [0, rotation, 0],
                scale,
                colorVariation,
              });

              // Only spawn one vegetation per position
              break;
            }
          }

          // Limit instances per chunk
          if (instances.length >= localBiomeConfig.maxPerChunk * globalDensity) {
            break;
          }
        }

        if (instances.length >= biomeConfig.maxPerChunk * globalDensity) {
          break;
        }
      }

      return instances;
    },
    [fullConfig, getHeight, getBiome, state]
  );

  /**
   * Update vegetation based on player position
   */
  const update = useCallback(
    (playerX: number, playerZ: number) => {
      const { chunkSize, viewDistance } = fullConfig;

      // Check if we've moved enough to warrant an update
      if (lastUpdateRef.current) {
        const dx = Math.abs(playerX - lastUpdateRef.current.x);
        const dz = Math.abs(playerZ - lastUpdateRef.current.z);
        if (dx < chunkSize * 0.5 && dz < chunkSize * 0.5) {
          return;
        }
      }

      lastUpdateRef.current = { x: playerX, z: playerZ };

      const playerChunk = worldToChunk(playerX, playerZ, chunkSize);
      const chunksToLoad: ChunkCoord[] = [];
      const chunksToKeep = new Set<string>();

      // Determine chunks to load
      for (let dx = -viewDistance; dx <= viewDistance; dx++) {
        for (let dz = -viewDistance; dz <= viewDistance; dz++) {
          const coord: ChunkCoord = {
            cx: playerChunk.cx + dx,
            cz: playerChunk.cz + dz,
          };
          const key = chunkKey(coord);
          chunksToKeep.add(key);

          if (!state.loadedChunks.has(key)) {
            chunksToLoad.push(coord);
          }
        }
      }

      // Unload distant chunks
      for (const key of state.loadedChunks.keys()) {
        if (!chunksToKeep.has(key)) {
          state.loadedChunks.delete(key);
        }
      }

      // Load new chunks (limit to 2 per frame for performance)
      const maxLoadsPerFrame = 2;
      for (let i = 0; i < Math.min(chunksToLoad.length, maxLoadsPerFrame); i++) {
        const coord = chunksToLoad[i];
        const key = chunkKey(coord);
        const instances = generateChunkVegetation(coord);
        state.loadedChunks.set(key, instances);
      }
    },
    [fullConfig, state, generateChunkVegetation]
  );

  /**
   * Clear all loaded vegetation
   */
  const clear = useCallback(() => {
    state.loadedChunks.clear();
    lastUpdateRef.current = null;
  }, [state]);

  /**
   * Get all instances of a specific type
   */
  const getInstancesByType = useCallback(
    (type: VegetationType): VegetationInstance[] => {
      const result: VegetationInstance[] = [];
      for (const instances of state.loadedChunks.values()) {
        for (const instance of instances) {
          if (instance.type === type) {
            result.push(instance);
          }
        }
      }
      return result;
    },
    [state]
  );

  /**
   * Get statistics about loaded vegetation
   */
  const getStats = useCallback(() => {
    let totalInstances = 0;
    for (const instances of state.loadedChunks.values()) {
      totalInstances += instances.length;
    }
    return {
      totalInstances,
      loadedChunks: state.loadedChunks.size,
    };
  }, [state]);

  // Collect all instances
  const instances = useMemo(() => {
    const result: VegetationInstance[] = [];
    for (const chunkInstances of state.loadedChunks.values()) {
      result.push(...chunkInstances);
    }
    return result;
  }, [state.loadedChunks]);

  return {
    instances,
    update,
    clear,
    getInstancesByType,
    getStats,
  };
}

// ============================================================================
// SIMPLE SPAWNER FOR STATIC VEGETATION
// ============================================================================

export interface StaticSpawnConfig {
  center: [number, number];
  radius: number;
  density?: number;
  seed?: number;
}

/**
 * Generate static vegetation instances for a fixed area
 * Useful for pre-computed or level-loaded vegetation
 */
export function generateStaticVegetation(
  getHeight: HeightQueryFn,
  getBiome: BiomeQueryFn,
  config: StaticSpawnConfig
): VegetationInstance[] {
  const { center, radius, density = 0.8, seed = 12345 } = config;
  const instances: VegetationInstance[] = [];

  const prng = Alea(seed);
  const random = () => prng();
  const spawnNoise = createNoise2D(Alea(seed + 1000));
  const clusterNoise = createNoise2D(Alea(seed + 2000));

  const spacing = 2 / density;
  const gridSize = Math.ceil((radius * 2) / spacing);

  for (let gx = 0; gx < gridSize; gx++) {
    for (let gz = 0; gz < gridSize; gz++) {
      // Jittered position within cell
      const jitterX = (random() - 0.5) * spacing * 0.8;
      const jitterZ = (random() - 0.5) * spacing * 0.8;

      const x = center[0] - radius + gx * spacing + jitterX;
      const z = center[1] - radius + gz * spacing + jitterZ;

      // Check if within radius
      const dx = x - center[0];
      const dz = z - center[1];
      if (dx * dx + dz * dz > radius * radius) {
        continue;
      }

      const height = getHeight(x, z);
      const biome = getBiome(x, z);
      const biomeConfig = BIOME_VEGETATION[biome];

      if (!biomeConfig) continue;

      const slope = calculateSlope(x, z, getHeight);
      const noiseValue = (spawnNoise(x * 0.05, z * 0.05) + 1) / 2;

      for (const rule of biomeConfig.rules) {
        const probability = calculateSpawnProbability(
          rule,
          height,
          slope,
          biomeConfig.densityMultiplier * density
        );

        const clusterValue = (clusterNoise(x * 0.1, z * 0.1) + 1) / 2;
        const clusterBonus = clusterValue > 0.6 ? rule.clustering * 2 : 0;
        const finalProbability = probability * noiseValue + clusterBonus * probability;

        if (random() < finalProbability) {
          const typeConfig = VEGETATION_TYPES[rule.type];
          const scaleRange = typeConfig.maxScale - typeConfig.minScale;
          const scale = typeConfig.minScale + random() * scaleRange;
          const rotation = random() * Math.PI * 2;
          const colorVar = typeConfig.colorVariation;

          instances.push({
            id: `static_${instances.length}`,
            type: rule.type,
            position: [x, height, z],
            rotation: [0, rotation, 0],
            scale,
            colorVariation: [
              (random() - 0.5) * colorVar * 2,
              (random() - 0.5) * colorVar * 2,
              (random() - 0.5) * colorVar * 2,
            ],
          });

          break;
        }
      }
    }
  }

  return instances;
}
