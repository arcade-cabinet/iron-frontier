// ChunkManager — Manages which terrain chunks are loaded based on player
// position.
//
// Maintains a grid of terrain meshes around the player. When the player
// crosses a chunk boundary the grid shifts: new chunks are generated and
// chunks that fall outside the load radius are disposed.

import * as THREE from 'three';

import type { BiomeId } from '@/engine/renderers/TerrainConfig';

import {
  CHUNK_SIZE,
  DEFAULT_LOAD_RADIUS,
  DEFAULT_RENDER_RADIUS,
  DEFAULT_SEED,
  FLATTEN_BLEND_DISTANCE,
} from './WorldConfig';

export type { ChunkState, ChunkManagerConfig, FlattenZone } from './chunkTypes';
import type { ChunkState, ChunkManagerConfig, FlattenZone } from './chunkTypes';
import { generateChunk256 } from './chunkGeneration';

function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

function worldToChunk(worldCoord: number): number {
  return Math.floor(worldCoord / CHUNK_SIZE);
}

export class ChunkManager {
  private readonly config: ChunkManagerConfig;
  private readonly cache = new Map<string, ChunkState>();
  private centerCx = -9999;
  private centerCz = -9999;

  private readonly resolveBiome: (cx: number, cz: number) => BiomeId;

  private readonly flattenZones: FlattenZone[] = [];

  constructor(
    config: Partial<ChunkManagerConfig> = {},
    resolveBiome?: (cx: number, cz: number) => BiomeId,
  ) {
    this.config = {
      loadRadius: config.loadRadius ?? DEFAULT_LOAD_RADIUS,
      renderRadius: config.renderRadius ?? DEFAULT_RENDER_RADIUS,
      seed: config.seed ?? DEFAULT_SEED,
      defaultBiome: config.defaultBiome ?? 'desert',
    };
    this.resolveBiome = resolveBiome ?? (() => this.config.defaultBiome);
  }

  addFlattenZone(zone: FlattenZone): void {
    this.flattenZones.push(zone);
  }

  addFlattenZones(zones: FlattenZone[]): void {
    for (const z of zones) this.flattenZones.push(z);
  }

  update(playerX: number, playerZ: number): readonly ChunkState[] {
    const cx = worldToChunk(playerX);
    const cz = worldToChunk(playerZ);

    if (cx === this.centerCx && cz === this.centerCz && this.cache.size > 0) {
      return this.getActiveChunks();
    }

    this.centerCx = cx;
    this.centerCz = cz;

    const { loadRadius, renderRadius } = this.config;

    const desired = new Set<string>();
    for (let dz = -loadRadius; dz <= loadRadius; dz++) {
      for (let dx = -loadRadius; dx <= loadRadius; dx++) {
        desired.add(chunkKey(cx + dx, cz + dz));
      }
    }

    for (const [key, state] of this.cache) {
      if (!desired.has(key)) {
        this.disposeChunk(state);
        this.cache.delete(key);
      }
    }

    const loadOrder = this.buildLoadOrder(cx, cz, loadRadius);
    for (const { cx: lx, cz: lz } of loadOrder) {
      const key = chunkKey(lx, lz);
      if (!this.cache.has(key)) {
        this.loadChunk(lx, lz);
      }
    }

    for (const state of this.cache.values()) {
      const dx = Math.abs(state.cx - cx);
      const dz = Math.abs(state.cz - cz);
      state.fullDetail = dx <= renderRadius && dz <= renderRadius;
    }

    return this.getActiveChunks();
  }

  getActiveChunks(): readonly ChunkState[] {
    return Array.from(this.cache.values());
  }

  getChunk(key: string): ChunkState | undefined {
    return this.cache.get(key);
  }

  get size(): number {
    return this.cache.size;
  }

  dispose(): void {
    for (const state of this.cache.values()) {
      this.disposeChunk(state);
    }
    this.cache.clear();
  }

  private loadChunk(cx: number, cz: number): void {
    const biome = this.resolveBiome(cx, cz);
    const mesh = generateChunk256(cx, cz, this.config.seed, biome);

    if (this.flattenZones.length > 0) {
      applyFlattenZones(mesh, cx, cz, this.flattenZones);
    }

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
  }

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

    order.sort((a, b) => a.dist - b.dist);
    return order;
  }
}

/**
 * Depress / raise vertices within each flatten zone that overlaps
 * the given chunk mesh. Uses smooth blending at the zone edges.
 */
function applyFlattenZones(
  mesh: THREE.Mesh,
  cx: number,
  cz: number,
  flattenZones: FlattenZone[],
): void {
  const geo = mesh.geometry as THREE.BufferGeometry;
  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const count = posAttr.count;

  const originX = cx * CHUNK_SIZE;
  const originZ = cz * CHUNK_SIZE;

  let modified = false;

  for (let i = 0; i < count; i++) {
    const localX = posAttr.getX(i);
    const localZ = posAttr.getZ(i);
    const worldX = originX + localX + CHUNK_SIZE / 2;
    const worldZ = originZ + localZ + CHUNK_SIZE / 2;

    for (const zone of flattenZones) {
      const dx = worldX - zone.wx;
      const dz = worldZ - zone.wz;
      const dist = Math.sqrt(dx * dx + dz * dz);

      const outerRadius = zone.radius + FLATTEN_BLEND_DISTANCE;

      if (dist <= outerRadius) {
        const currentY = posAttr.getY(i);

        if (dist <= zone.radius) {
          posAttr.setY(i, zone.targetY);
          modified = true;
        } else {
          const t = (dist - zone.radius) / FLATTEN_BLEND_DISTANCE;
          const smooth = t * t * (3 - 2 * t);
          const blended = zone.targetY * (1 - smooth) + currentY * smooth;
          posAttr.setY(i, blended);
          modified = true;
        }
      }
    }
  }

  if (modified) {
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
    mesh.updateMatrixWorld(true);
  }
}
