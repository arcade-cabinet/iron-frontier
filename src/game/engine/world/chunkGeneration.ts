// chunkGeneration — FBM terrain sampling and chunk mesh generation.

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
} from './WorldConfig';

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

/**
 * Generate a terrain chunk mesh for the given chunk coordinates.
 * Uses FBM noise driven by the biome's noise parameters.
 */
export function generateChunk256(
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
