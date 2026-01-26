// BiomeVegetation - Biome-aware vegetation layer for R3F
// Handles dynamic loading of vegetation based on player position and biomes

import React, { useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  type VegetationType,
  type VegetationInstance,
  type BiomeType,
  type HeightQueryFn,
  type BiomeQueryFn,
  type VegetationSpawnerConfig,
  BIOME_VEGETATION,
  DEFAULT_VEGETATION_CONFIG,
} from './types';
import { useVegetationSpawner } from './useVegetationSpawner';
import { VegetationInstances } from './VegetationInstances';

// ============================================================================
// TYPES
// ============================================================================

export interface BiomeVegetationProps {
  /** Current player position [x, y, z] */
  playerPosition: [number, number, number];
  /** Function to query terrain height at (x, z) */
  getHeight: HeightQueryFn;
  /** Function to query biome at (x, z) */
  getBiome: BiomeQueryFn;
  /** Spawner configuration */
  config?: Partial<VegetationSpawnerConfig>;
  /** Enable frustum culling */
  enableFrustumCulling?: boolean;
  /** Enable shadows */
  enableShadows?: boolean;
  /** Enable wind animation */
  enableWind?: boolean;
  /** Update rate in seconds (throttle updates) */
  updateRate?: number;
  /** Callback when vegetation is updated */
  onUpdate?: (stats: { totalInstances: number; loadedChunks: number }) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * BiomeVegetation - Dynamic biome-aware vegetation layer
 *
 * Automatically spawns and manages vegetation based on:
 * - Player position (loads/unloads chunks)
 * - Biome at each position (desert, grassland, etc.)
 * - Terrain height and slope
 * - Configurable density and view distance
 *
 * @example
 * ```tsx
 * <BiomeVegetation
 *   playerPosition={[playerX, playerY, playerZ]}
 *   getHeight={(x, z) => terrain.getHeight(x, z)}
 *   getBiome={(x, z) => terrain.getBiome(x, z)}
 *   config={{ viewDistance: 3, globalDensity: 0.8 }}
 * />
 * ```
 */
export function BiomeVegetation({
  playerPosition,
  getHeight,
  getBiome,
  config,
  enableFrustumCulling = true,
  enableShadows = true,
  enableWind = true,
  updateRate = 0.1,
  onUpdate,
}: BiomeVegetationProps) {
  const {
    instances,
    update,
    getStats,
  } = useVegetationSpawner(getHeight, getBiome, config);

  // Track time since last update
  const lastUpdateRef = React.useRef(0);

  // Update vegetation on frame
  useFrame((state, delta) => {
    lastUpdateRef.current += delta;

    if (lastUpdateRef.current >= updateRate) {
      lastUpdateRef.current = 0;
      update(playerPosition[0], playerPosition[2]);

      if (onUpdate) {
        onUpdate(getStats());
      }
    }
  });

  // Initial update
  useEffect(() => {
    update(playerPosition[0], playerPosition[2]);
  }, [update, playerPosition]);

  return (
    <VegetationInstances
      instances={instances}
      enableFrustumCulling={enableFrustumCulling}
      enableShadows={enableShadows}
      enableWind={enableWind}
      playerPosition={playerPosition}
      maxDistance={config?.lodDistances?.[2] ?? DEFAULT_VEGETATION_CONFIG.lodDistances[2]}
    />
  );
}

// ============================================================================
// BIOME-SPECIFIC COMPONENTS
// ============================================================================

export interface DesertVegetationProps {
  playerPosition: [number, number, number];
  getHeight: HeightQueryFn;
  density?: number;
  enableShadows?: boolean;
}

/**
 * Desert biome vegetation - cacti, rocks, dead trees
 */
export function DesertVegetation({
  playerPosition,
  getHeight,
  density = 0.8,
  enableShadows = true,
}: DesertVegetationProps) {
  const getBiome = useCallback((): BiomeType => 'desert', []);

  return (
    <BiomeVegetation
      playerPosition={playerPosition}
      getHeight={getHeight}
      getBiome={getBiome}
      config={{ globalDensity: density }}
      enableShadows={enableShadows}
    />
  );
}

/**
 * Grassland biome vegetation - sagebrush, tumbleweeds
 */
export function GrasslandVegetation({
  playerPosition,
  getHeight,
  density = 0.8,
  enableShadows = true,
}: DesertVegetationProps) {
  const getBiome = useCallback((): BiomeType => 'grassland', []);

  return (
    <BiomeVegetation
      playerPosition={playerPosition}
      getHeight={getHeight}
      getBiome={getBiome}
      config={{ globalDensity: density }}
      enableShadows={enableShadows}
    />
  );
}

/**
 * Riverside biome vegetation - denser trees and shrubs
 */
export function RiversideVegetation({
  playerPosition,
  getHeight,
  density = 0.8,
  enableShadows = true,
}: DesertVegetationProps) {
  const getBiome = useCallback((): BiomeType => 'riverside', []);

  return (
    <BiomeVegetation
      playerPosition={playerPosition}
      getHeight={getHeight}
      getBiome={getBiome}
      config={{ globalDensity: density }}
      enableShadows={enableShadows}
    />
  );
}

/**
 * Town edges vegetation - sparse, decorative
 */
export function TownVegetation({
  playerPosition,
  getHeight,
  density = 0.8,
  enableShadows = true,
}: DesertVegetationProps) {
  const getBiome = useCallback((): BiomeType => 'town', []);

  return (
    <BiomeVegetation
      playerPosition={playerPosition}
      getHeight={getHeight}
      getBiome={getBiome}
      config={{ globalDensity: density }}
      enableShadows={enableShadows}
    />
  );
}

/**
 * Badlands vegetation - mostly rocks and dead trees
 */
export function BadlandsVegetation({
  playerPosition,
  getHeight,
  density = 0.8,
  enableShadows = true,
}: DesertVegetationProps) {
  const getBiome = useCallback((): BiomeType => 'badlands', []);

  return (
    <BiomeVegetation
      playerPosition={playerPosition}
      getHeight={getHeight}
      getBiome={getBiome}
      config={{ globalDensity: density }}
      enableShadows={enableShadows}
    />
  );
}

// ============================================================================
// MIXED BIOME VEGETATION
// ============================================================================

export interface MixedBiomeVegetationProps {
  playerPosition: [number, number, number];
  getHeight: HeightQueryFn;
  /** Biome zones as array of { center, radius, biome } */
  zones: Array<{
    center: [number, number];
    radius: number;
    biome: BiomeType;
  }>;
  /** Default biome for areas outside zones */
  defaultBiome?: BiomeType;
  density?: number;
  enableShadows?: boolean;
}

/**
 * Mixed biome vegetation with defined zones
 * Useful for pre-designed levels with specific biome areas
 */
export function MixedBiomeVegetation({
  playerPosition,
  getHeight,
  zones,
  defaultBiome = 'desert',
  density = 0.8,
  enableShadows = true,
}: MixedBiomeVegetationProps) {
  const getBiome = useCallback(
    (x: number, z: number): BiomeType => {
      // Check each zone
      for (const zone of zones) {
        const dx = x - zone.center[0];
        const dz = z - zone.center[1];
        const distSq = dx * dx + dz * dz;

        if (distSq <= zone.radius * zone.radius) {
          return zone.biome;
        }
      }

      return defaultBiome;
    },
    [zones, defaultBiome]
  );

  return (
    <BiomeVegetation
      playerPosition={playerPosition}
      getHeight={getHeight}
      getBiome={getBiome}
      config={{ globalDensity: density }}
      enableShadows={enableShadows}
    />
  );
}

// ============================================================================
// DEBUG VISUALIZATION
// ============================================================================

export interface VegetationDebugProps {
  instances: VegetationInstance[];
  showBounds?: boolean;
  showTypes?: boolean;
}

/**
 * Debug visualization for vegetation instances
 * Shows bounding boxes and type labels
 */
export function VegetationDebug({
  instances,
  showBounds = true,
  showTypes = false,
}: VegetationDebugProps) {
  if (!showBounds && !showTypes) return null;

  return (
    <group name="vegetation-debug">
      {showBounds &&
        instances.map((instance) => (
          <mesh
            key={instance.id}
            position={instance.position}
            scale={[instance.scale * 2, instance.scale * 2, instance.scale * 2]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="yellow" wireframe opacity={0.3} transparent />
          </mesh>
        ))}
    </group>
  );
}

// ============================================================================
// VEGETATION STATS DISPLAY
// ============================================================================

export interface VegetationStatsProps {
  totalInstances: number;
  loadedChunks: number;
  position?: [number, number, number];
}

/**
 * 3D text display for vegetation statistics
 * Useful for debugging and performance monitoring
 */
export function VegetationStats({
  totalInstances,
  loadedChunks,
  position = [0, 10, 0],
}: VegetationStatsProps) {
  // This would typically use @react-three/drei Text component
  // Simplified version using a plane with debug info
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[5, 2]} />
        <meshBasicMaterial color="#333" opacity={0.8} transparent />
      </mesh>
    </group>
  );
}
