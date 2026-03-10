// chunkTypes — Public types for the chunk management system.

import type * as THREE from 'three';

import type { BiomeId } from '@/engine/renderers/TerrainConfig';

export interface ChunkState {
  /** Integer chunk coordinate X. */
  cx: number;
  /** Integer chunk coordinate Z. */
  cz: number;
  /** Cache key "cx,cz". */
  key: string;
  /** The generated THREE.Mesh. */
  mesh: THREE.Mesh;
  /** True when within the inner (render) radius — full vegetation/props. */
  fullDetail: boolean;
  /** Biome assigned to this chunk. */
  biome: BiomeId;
}

export interface ChunkManagerConfig {
  /** Chunks to keep loaded in each direction from the player. */
  loadRadius: number;
  /** Chunks to render at full detail (vegetation, props). */
  renderRadius: number;
  /** World seed for terrain generation. */
  seed: string;
  /** Default biome when no region override is provided. */
  defaultBiome: BiomeId;
}

/** A point on the terrain that should be flattened (building footprint). */
export interface FlattenZone {
  /** World-space X. */
  wx: number;
  /** World-space Z. */
  wz: number;
  /** Flatten radius in world units. */
  radius: number;
  /** Target Y height to flatten to. */
  targetY: number;
}
