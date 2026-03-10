// TerrainChunk — Generates a single heightmap-displaced plane mesh.
//
// Uses simplex-noise + alea for deterministic, seed-based terrain.
// Returns a frozen THREE.Mesh suitable for static scene placement.

import Alea from "alea";
import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import * as THREE from "three";

import { createDirtTexture, createSandTexture } from "@/src/game/engine/materials";

import {
  BIOME_DEFINITIONS,
  type BiomeDefinition,
  type BiomeId,
  CHUNK_SEGMENTS,
  CHUNK_SIZE,
  DEFAULT_SEED,
  type NoiseParams,
} from "./TerrainConfig.ts";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a terrain mesh for the given chunk coordinates.
 *
 * @param chunkX - Integer chunk index on the X axis.
 * @param chunkZ - Integer chunk index on the Z axis.
 * @param seed   - World seed string (deterministic per-chunk).
 * @param biome  - Biome id controlling noise shape and material.
 * @returns A THREE.Mesh positioned at the correct world offset with a
 *          frozen matrix and pre-computed vertex normals.
 */
export function generateChunk(
  chunkX: number,
  chunkZ: number,
  seed: string = DEFAULT_SEED,
  biome: BiomeId = "desert",
): THREE.Mesh {
  const definition = BIOME_DEFINITIONS[biome];
  const chunkSeed = `${seed}:${chunkX}:${chunkZ}`;

  // Create a seeded noise function unique to this chunk's world seed.
  // We use the global seed (not chunk-local) so neighbouring chunks stitch.
  const noise = createNoise2D(Alea(seed) as unknown as () => number);

  const geometry = buildGeometry(chunkX, chunkZ, definition.noise, noise);
  const material = buildMaterial(biome, definition);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `terrain_${chunkX}_${chunkZ}`;

  // Position in world space
  mesh.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);
  mesh.receiveShadow = true;

  // Static geometry — freeze the world matrix to avoid per-frame recalc
  mesh.updateMatrixWorld(true);
  mesh.matrixAutoUpdate = false;

  return mesh;
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

function buildGeometry(
  chunkX: number,
  chunkZ: number,
  noise: NoiseParams,
  noiseFn: NoiseFunction2D,
): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SEGMENTS, CHUNK_SEGMENTS);

  // PlaneGeometry is XY by default — rotate to XZ (face up)
  geo.rotateX(-Math.PI / 2);

  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const uvAttr = geo.attributes.uv as THREE.BufferAttribute;
  const vertexCount = posAttr.count;

  // World-space origin of this chunk's bottom-left corner
  const originX = chunkX * CHUNK_SIZE;
  const originZ = chunkZ * CHUNK_SIZE;

  for (let i = 0; i < vertexCount; i++) {
    // After the -90 deg rotation: X stays, Z comes from old-Y, Y = 0
    const localX = posAttr.getX(i);
    const localZ = posAttr.getZ(i);

    // World coordinates for noise sampling (continuous across chunks)
    const worldX = originX + localX + CHUNK_SIZE / 2;
    const worldZ = originZ + localZ + CHUNK_SIZE / 2;

    const height = sampleFBM(worldX, worldZ, noise, noiseFn);
    posAttr.setY(i, height);

    // Tile UVs across world space so textures align at chunk borders
    uvAttr.setXY(i, worldX / CHUNK_SIZE, worldZ / CHUNK_SIZE);
  }

  posAttr.needsUpdate = true;
  uvAttr.needsUpdate = true;
  geo.computeVertexNormals();

  return geo;
}

// ---------------------------------------------------------------------------
// Fractional Brownian Motion
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

  // Normalize to [-1, 1] then scale
  const normalized = value / maxAmplitude;

  // Desert biome: add subtle dune ridges via abs-noise (ridged multifractal)
  const ridged = 1 - Math.abs(normalized);
  const blend = normalized * 0.6 + ridged * 0.4;

  return blend * params.amplitude;
}

// ---------------------------------------------------------------------------
// Material
// ---------------------------------------------------------------------------

function buildMaterial(biome: BiomeId, definition: BiomeDefinition): THREE.MeshStandardMaterial {
  // Reuse the existing procedural canvas texture factories
  switch (biome) {
    case "desert":
      return createSandTexture(definition.textureBaseColor);
    case "canyon":
    case "mountain":
      return createDirtTexture(definition.textureBaseColor);
    case "grassland":
      return createDirtTexture(definition.textureBaseColor);
    default: {
      const _exhaustive: never = biome;
      return createSandTexture(definition.textureBaseColor);
    }
  }
}
