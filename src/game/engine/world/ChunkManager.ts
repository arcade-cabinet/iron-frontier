// ChunkManager — Manages which terrain chunks are loaded based on player
// position.
//
// Maintains a 3x3 (or wider) grid of terrain meshes around the player.
// When the player crosses a chunk boundary the grid shifts: new chunks are
// generated and chunks that fall outside the load radius are disposed.
//
// Chunks are generated via the existing `generateChunk` helper from
// `engine/renderers/TerrainChunk`, but with the 256x256 chunk size defined
// in WorldConfig.  The manager also provides a terrain-flatten API that
// TownPlacer uses to depress vertices under buildings.

import Alea from 'alea';
import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';
import * as THREE from 'three';

import {
  BIOME_DEFINITIONS,
  type BiomeId,
  type NoiseParams,
} from '@/engine/renderers/TerrainConfig';
import {
  createPBRGroundDesert,
  createPBRGroundSandy,
  createPBRStoneRough,
} from '@/src/game/engine/materials';

import {
  CHUNK_SEGMENTS,
  CHUNK_SIZE,
  DEFAULT_LOAD_RADIUS,
  DEFAULT_RENDER_RADIUS,
  DEFAULT_SEED,
  BUILDING_FLATTEN_RADIUS,
  FLATTEN_BLEND_DISTANCE,
} from './WorldConfig';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

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
// FBM sampling (mirrors engine/renderers/TerrainChunk logic)
// ---------------------------------------------------------------------------

function sampleFBM(
  worldX: number,
  worldZ: number,
  params: NoiseParams,
  noiseFn: NoiseFunction2D,
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = params.frequency;
  let maxAmplitude = 0;

  for (let o = 0; o < params.octaves; o++) {
    value += noiseFn(worldX * frequency, worldZ * frequency) * amplitude;
    maxAmplitude += amplitude;
    frequency *= params.lacunarity;
    amplitude *= params.persistence;
  }

  const normalized = value / maxAmplitude;
  const ridged = 1 - Math.abs(normalized);
  const blend = normalized * 0.6 + ridged * 0.4;

  return blend * params.amplitude;
}

// ---------------------------------------------------------------------------
// Chunk generation (self-contained — 256x256 with CHUNK_SEGMENTS)
// ---------------------------------------------------------------------------

function generateChunk256(
  chunkX: number,
  chunkZ: number,
  seed: string,
  biome: BiomeId,
): THREE.Mesh {
  const definition = BIOME_DEFINITIONS[biome];
  const noise = createNoise2D(Alea(seed) as unknown as () => number);

  const geo = new THREE.PlaneGeometry(
    CHUNK_SIZE,
    CHUNK_SIZE,
    CHUNK_SEGMENTS,
    CHUNK_SEGMENTS,
  );
  geo.rotateX(-Math.PI / 2);

  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const uvAttr = geo.attributes.uv as THREE.BufferAttribute;
  const vertexCount = posAttr.count;

  const originX = chunkX * CHUNK_SIZE;
  const originZ = chunkZ * CHUNK_SIZE;

  for (let i = 0; i < vertexCount; i++) {
    const localX = posAttr.getX(i);
    const localZ = posAttr.getZ(i);

    const worldX = originX + localX + CHUNK_SIZE / 2;
    const worldZ = originZ + localZ + CHUNK_SIZE / 2;

    const height = sampleFBM(worldX, worldZ, definition.noise, noise);
    posAttr.setY(i, height);

    uvAttr.setXY(i, worldX / CHUNK_SIZE, worldZ / CHUNK_SIZE);
  }

  posAttr.needsUpdate = true;
  uvAttr.needsUpdate = true;
  geo.computeVertexNormals();

  // Material — PBR image-based textures from AmbientCG
  let material: THREE.MeshStandardMaterial;
  switch (biome) {
    case 'desert':
      material = createPBRGroundDesert(4);
      break;
    case 'canyon':
    case 'mountain':
      material = createPBRStoneRough(3);
      break;
    case 'grassland':
      material = createPBRGroundSandy(4);
      break;
    default:
      material = createPBRGroundDesert(4);
      break;
  }

  const mesh = new THREE.Mesh(geo, material);
  mesh.name = `terrain_${chunkX}_${chunkZ}`;
  mesh.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);
  mesh.receiveShadow = true;
  mesh.updateMatrixWorld(true);
  mesh.matrixAutoUpdate = false;

  return mesh;
}

// ---------------------------------------------------------------------------
// ChunkManager
// ---------------------------------------------------------------------------

export class ChunkManager {
  private readonly config: ChunkManagerConfig;
  private readonly cache = new Map<string, ChunkState>();
  private centerCx = -9999;
  private centerCz = -9999;

  /** Optional callback to resolve the biome for a given chunk coordinate. */
  private readonly resolveBiome: (cx: number, cz: number) => BiomeId;

  /** Pending flatten zones that should be applied to any newly loaded chunk. */
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

  // -----------------------------------------------------------------------
  // Flatten API
  // -----------------------------------------------------------------------

  /**
   * Register a zone where the terrain should be flattened.
   * Call before the first `update()` so that chunks are generated with
   * flattened vertices.
   */
  addFlattenZone(zone: FlattenZone): void {
    this.flattenZones.push(zone);
  }

  /**
   * Register multiple flatten zones at once (typically from TownPlacer).
   */
  addFlattenZones(zones: FlattenZone[]): void {
    for (const z of zones) this.flattenZones.push(z);
  }

  // -----------------------------------------------------------------------
  // Core update
  // -----------------------------------------------------------------------

  /**
   * Update the loaded chunk grid based on the player's world-space position.
   * Returns the list of chunks that should be rendered this frame.
   */
  update(playerX: number, playerZ: number): readonly ChunkState[] {
    const cx = worldToChunk(playerX);
    const cz = worldToChunk(playerZ);

    if (cx === this.centerCx && cz === this.centerCz && this.cache.size > 0) {
      return this.getActiveChunks();
    }

    this.centerCx = cx;
    this.centerCz = cz;

    const { loadRadius, renderRadius } = this.config;

    // Determine desired set of chunks
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

    // Load missing chunks in spiral order (centre first)
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

  /** Get a specific chunk by its "cx,cz" key. */
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
  // Private — chunk lifecycle
  // -----------------------------------------------------------------------

  private loadChunk(cx: number, cz: number): void {
    const biome = this.resolveBiome(cx, cz);
    const mesh = generateChunk256(cx, cz, this.config.seed, biome);

    // Apply any flatten zones that overlap this chunk
    if (this.flattenZones.length > 0) {
      this.applyFlattenZones(mesh, cx, cz);
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
    // Materials are shared via globalTextureCache — do NOT dispose them here.
    // The LRU cache manages material lifetime and GPU resource cleanup.
  }

  // -----------------------------------------------------------------------
  // Terrain flattening
  // -----------------------------------------------------------------------

  /**
   * Depress / raise vertices within each flatten zone that overlaps
   * the given chunk mesh.  Uses smooth blending at the zone edges.
   */
  private applyFlattenZones(
    mesh: THREE.Mesh,
    cx: number,
    cz: number,
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

      for (const zone of this.flattenZones) {
        const dx = worldX - zone.wx;
        const dz = worldZ - zone.wz;
        const dist = Math.sqrt(dx * dx + dz * dz);

        const outerRadius = zone.radius + FLATTEN_BLEND_DISTANCE;

        if (dist <= outerRadius) {
          const currentY = posAttr.getY(i);

          if (dist <= zone.radius) {
            // Fully inside flatten zone — snap to target height
            posAttr.setY(i, zone.targetY);
            modified = true;
          } else {
            // Blend zone — smoothstep between target and natural height
            const t = (dist - zone.radius) / FLATTEN_BLEND_DISTANCE;
            const smooth = t * t * (3 - 2 * t); // smoothstep
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
      // Re-freeze the matrix after modifying geometry
      mesh.updateMatrixWorld(true);
    }
  }

  // -----------------------------------------------------------------------
  // Load ordering
  // -----------------------------------------------------------------------

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
