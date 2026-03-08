// ChunkManager — Manages the lifecycle of terrain chunks.
//
// Maintains a cache of generated THREE.Mesh chunks keyed by "cx,cz".
// Supports two radii: a load radius (chunks exist in memory) and a
// render radius (chunks are visible with full detail).  Far chunks
// are flagged for simplified rendering (no vegetation, no props).

import * as THREE from 'three';

import { generateChunk } from '@/engine/renderers/TerrainChunk';
import { CHUNK_SIZE, type BiomeId, DEFAULT_SEED } from '@/engine/renderers/TerrainConfig';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChunkState {
  cx: number;
  cz: number;
  key: string;
  mesh: THREE.Mesh;
  /** True when within the inner (render) radius — full detail. */
  fullDetail: boolean;
  biome: BiomeId;
}

export interface ChunkManagerConfig {
  /** Chunks to keep in memory in each direction from the player. */
  loadRadius: number;
  /** Chunks to render at full detail in each direction. */
  renderRadius: number;
  /** World seed for terrain generation. */
  seed: string;
  /** Default biome for chunks without a region override. */
  defaultBiome: BiomeId;
}

const DEFAULT_CONFIG: ChunkManagerConfig = {
  loadRadius: 2,
  renderRadius: 1,
  seed: DEFAULT_SEED,
  defaultBiome: 'desert',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

function worldToChunk(worldCoord: number): number {
  return Math.floor(worldCoord / CHUNK_SIZE);
}

// ---------------------------------------------------------------------------
// ChunkManager
// ---------------------------------------------------------------------------

export class ChunkManager {
  private readonly config: ChunkManagerConfig;
  private readonly cache = new Map<string, ChunkState>();
  private centerCx = 0;
  private centerCz = 0;

  /** Callback to resolve the biome for a given chunk coordinate. */
  private readonly resolveBiome: (cx: number, cz: number) => BiomeId;

  constructor(
    config: Partial<ChunkManagerConfig> = {},
    resolveBiome?: (cx: number, cz: number) => BiomeId,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.resolveBiome = resolveBiome ?? (() => this.config.defaultBiome);
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /**
   * Update the chunk grid based on player position.
   * Returns the list of chunks that should be rendered this frame.
   */
  update(
    playerX: number,
    playerZ: number,
  ): readonly ChunkState[] {
    const cx = worldToChunk(playerX);
    const cz = worldToChunk(playerZ);

    // Only recalculate when the player crosses a chunk boundary
    if (cx === this.centerCx && cz === this.centerCz && this.cache.size > 0) {
      return this.getActiveChunks();
    }

    this.centerCx = cx;
    this.centerCz = cz;

    const { loadRadius, renderRadius } = this.config;

    // Determine which chunks should exist
    const desired = new Set<string>();
    for (let dz = -loadRadius; dz <= loadRadius; dz++) {
      for (let dx = -loadRadius; dx <= loadRadius; dx++) {
        desired.add(chunkKey(cx + dx, cz + dz));
      }
    }

    // Dispose chunks outside load radius
    for (const [key, state] of this.cache) {
      if (!desired.has(key)) {
        this.disposeChunk(state);
        this.cache.delete(key);
      }
    }

    // Load missing chunks — prioritise the player's own chunk first
    const loadOrder = this.buildLoadOrder(cx, cz, loadRadius);
    for (const { cx: lx, cz: lz } of loadOrder) {
      const key = chunkKey(lx, lz);
      if (!this.cache.has(key)) {
        this.loadChunk(lx, lz);
      }
    }

    // Update detail flags
    for (const state of this.cache.values()) {
      const dx = Math.abs(state.cx - cx);
      const dz = Math.abs(state.cz - cz);
      state.fullDetail = dx <= renderRadius && dz <= renderRadius;
    }

    return this.getActiveChunks();
  }

  /** Get all currently loaded chunks. */
  getActiveChunks(): readonly ChunkState[] {
    return Array.from(this.cache.values());
  }

  /** Get a specific chunk by key. */
  getChunk(key: string): ChunkState | undefined {
    return this.cache.get(key);
  }

  /** Number of chunks currently loaded. */
  get size(): number {
    return this.cache.size;
  }

  /** Dispose all chunks and clear the cache. */
  dispose(): void {
    for (const state of this.cache.values()) {
      this.disposeChunk(state);
    }
    this.cache.clear();
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private loadChunk(cx: number, cz: number): void {
    const biome = this.resolveBiome(cx, cz);
    const mesh = generateChunk(cx, cz, this.config.seed, biome);
    const key = chunkKey(cx, cz);

    this.cache.set(key, {
      cx,
      cz,
      key,
      mesh,
      fullDetail: true,
      biome,
    });
  }

  private disposeChunk(state: ChunkState): void {
    state.mesh.geometry.dispose();
    const mat = state.mesh.material;
    if (Array.isArray(mat)) {
      for (const m of mat) m.dispose();
    } else {
      mat.dispose();
    }
  }

  /**
   * Build a load order that starts with the player's chunk and spirals
   * outward.  This ensures the most important chunk loads first.
   */
  private buildLoadOrder(
    cx: number,
    cz: number,
    radius: number,
  ): Array<{ cx: number; cz: number }> {
    const order: Array<{ cx: number; cz: number; dist: number }> = [];

    for (let dz = -radius; dz <= radius; dz++) {
      for (let dx = -radius; dx <= radius; dx++) {
        order.push({
          cx: cx + dx,
          cz: cz + dz,
          dist: Math.abs(dx) + Math.abs(dz),
        });
      }
    }

    // Sort by Manhattan distance so center chunk loads first
    order.sort((a, b) => a.dist - b.dist);
    return order;
  }
}
