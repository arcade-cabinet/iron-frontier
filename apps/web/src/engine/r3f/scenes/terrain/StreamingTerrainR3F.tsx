/**
 * StreamingTerrainR3F.tsx - R3F streaming terrain component
 *
 * Provides chunk-based infinite procedural terrain for Three.js/R3F:
 * - Procedural heightmap generation using noise
 * - LOD based on distance from player
 * - Chunk pooling and recycling
 * - Biome-based texturing
 */

import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Alea from 'alea';
import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';

// ============================================================================
// TYPES
// ============================================================================

export interface StreamingTerrainR3FProps {
  /** Random seed for terrain generation */
  seed: number;
  /** Current player position */
  playerPosition: THREE.Vector3;
  /** View distance in chunks (default: 3) */
  viewDistance?: number;
  /** Chunk size in world units (default: 64) */
  chunkSize?: number;
  /** Maximum terrain height (default: 30) */
  maxHeight?: number;
}

interface TerrainChunk {
  key: string;
  cx: number;
  cz: number;
  mesh: THREE.Mesh;
  lod: number;
}

interface ChunkCoord {
  cx: number;
  cz: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CHUNK_SIZE = 64;
const DEFAULT_VIEW_DISTANCE = 3;
const DEFAULT_MAX_HEIGHT = 30;

/** LOD resolutions (vertices per side) */
const LOD_RESOLUTIONS = [65, 33, 17];

/** Biome colors for terrain */
const BIOME_COLORS = {
  desert: new THREE.Color(0xc2a66a), // Sandy tan
  grassland: new THREE.Color(0x7c9f5a), // Sage green
  badlands: new THREE.Color(0x8b4513), // Saddle brown
  riverside: new THREE.Color(0x6b8e6b), // Darker green
  rocky: new THREE.Color(0x808080), // Gray
};

// ============================================================================
// TERRAIN GENERATOR
// ============================================================================

class TerrainGenerator {
  private seed: number;
  private baseNoise: NoiseFunction2D;
  private detailNoise: NoiseFunction2D;
  private biomeNoise: NoiseFunction2D;
  private maxHeight: number;

  constructor(seed: number, maxHeight: number) {
    this.seed = seed;
    this.maxHeight = maxHeight;

    const prng = Alea(seed);
    this.baseNoise = createNoise2D(prng);
    this.detailNoise = createNoise2D(Alea(seed + 1000));
    this.biomeNoise = createNoise2D(Alea(seed + 2000));
  }

  getHeightAt(x: number, z: number): number {
    // Multi-octave noise for natural terrain
    const scale1 = 0.005;
    const scale2 = 0.02;
    const scale3 = 0.08;

    const base = this.baseNoise(x * scale1, z * scale1) * 0.6;
    const detail = this.detailNoise(x * scale2, z * scale2) * 0.3;
    const micro = this.detailNoise(x * scale3, z * scale3) * 0.1;

    const combined = (base + detail + micro + 1) / 2; // Normalize to 0-1

    return combined * this.maxHeight;
  }

  getBiomeAt(x: number, z: number): keyof typeof BIOME_COLORS {
    const biomeValue = (this.biomeNoise(x * 0.002, z * 0.002) + 1) / 2;
    const height = this.getHeightAt(x, z) / this.maxHeight;

    // Biome selection based on noise and height
    if (height > 0.7) return 'rocky';
    if (biomeValue < 0.25) return 'riverside';
    if (biomeValue < 0.5) return 'grassland';
    if (biomeValue < 0.75) return 'desert';
    return 'badlands';
  }

  getColorAt(x: number, z: number): THREE.Color {
    const biome = this.getBiomeAt(x, z);
    const baseColor = BIOME_COLORS[biome].clone();

    // Add subtle variation
    const variation = this.detailNoise(x * 0.1, z * 0.1) * 0.1;
    baseColor.offsetHSL(0, 0, variation);

    return baseColor;
  }
}

// ============================================================================
// CHUNK GEOMETRY BUILDER
// ============================================================================

function buildChunkGeometry(
  generator: TerrainGenerator,
  cx: number,
  cz: number,
  chunkSize: number,
  resolution: number
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  const vertices: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const worldX = cx * chunkSize;
  const worldZ = cz * chunkSize;
  const step = chunkSize / (resolution - 1);

  // Generate vertices
  for (let z = 0; z < resolution; z++) {
    for (let x = 0; x < resolution; x++) {
      const wx = worldX + x * step;
      const wz = worldZ + z * step;
      const height = generator.getHeightAt(wx, wz);

      vertices.push(wx, height, wz);

      // Temporary normal (recalculated later)
      normals.push(0, 1, 0);

      // Vertex color from biome
      const color = generator.getColorAt(wx, wz);
      colors.push(color.r, color.g, color.b);
    }
  }

  // Generate indices
  for (let z = 0; z < resolution - 1; z++) {
    for (let x = 0; x < resolution - 1; x++) {
      const a = z * resolution + x;
      const b = z * resolution + x + 1;
      const c = (z + 1) * resolution + x;
      const d = (z + 1) * resolution + x + 1;

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  geometry.computeVertexNormals();

  return geometry;
}

// ============================================================================
// SINGLE CHUNK COMPONENT
// ============================================================================

interface TerrainChunkMeshProps {
  generator: TerrainGenerator;
  cx: number;
  cz: number;
  chunkSize: number;
  lod: number;
}

function TerrainChunkMesh({ generator, cx, cz, chunkSize, lod }: TerrainChunkMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Build geometry with appropriate LOD
  const geometry = useMemo(() => {
    const resolution = LOD_RESOLUTIONS[Math.min(lod, LOD_RESOLUTIONS.length - 1)];
    return buildChunkGeometry(generator, cx, cz, chunkSize, resolution);
  }, [generator, cx, cz, chunkSize, lod]);

  // Cleanup geometry on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.9}
        metalness={0.1}
        flatShading={lod > 1}
      />
    </mesh>
  );
}

// ============================================================================
// CHUNK MANAGER
// ============================================================================

function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

function worldToChunk(x: number, z: number, chunkSize: number): ChunkCoord {
  return {
    cx: Math.floor(x / chunkSize),
    cz: Math.floor(z / chunkSize),
  };
}

function calculateLOD(
  chunkCx: number,
  chunkCz: number,
  playerChunkCx: number,
  playerChunkCz: number
): number {
  const dx = Math.abs(chunkCx - playerChunkCx);
  const dz = Math.abs(chunkCz - playerChunkCz);
  const distance = Math.max(dx, dz);

  if (distance <= 1) return 0; // High detail
  if (distance <= 2) return 1; // Medium detail
  return 2; // Low detail
}

// ============================================================================
// MAIN STREAMING TERRAIN COMPONENT
// ============================================================================

export function StreamingTerrainR3F({
  seed,
  playerPosition,
  viewDistance = DEFAULT_VIEW_DISTANCE,
  chunkSize = DEFAULT_CHUNK_SIZE,
  maxHeight = DEFAULT_MAX_HEIGHT,
}: StreamingTerrainR3FProps) {
  // Create terrain generator
  const generator = useMemo(() => new TerrainGenerator(seed, maxHeight), [seed, maxHeight]);

  // Track visible chunks
  const [visibleChunks, setVisibleChunks] = useState<Map<string, { cx: number; cz: number; lod: number }>>(
    new Map()
  );

  // Update visible chunks based on player position
  useFrame(() => {
    const playerChunk = worldToChunk(playerPosition.x, playerPosition.z, chunkSize);

    const newChunks = new Map<string, { cx: number; cz: number; lod: number }>();

    // Generate chunks in view distance
    for (let dx = -viewDistance; dx <= viewDistance; dx++) {
      for (let dz = -viewDistance; dz <= viewDistance; dz++) {
        const cx = playerChunk.cx + dx;
        const cz = playerChunk.cz + dz;
        const key = chunkKey(cx, cz);
        const lod = calculateLOD(cx, cz, playerChunk.cx, playerChunk.cz);

        newChunks.set(key, { cx, cz, lod });
      }
    }

    // Check if chunks changed
    let changed = newChunks.size !== visibleChunks.size;
    if (!changed) {
      for (const [key, chunk] of newChunks) {
        const existing = visibleChunks.get(key);
        if (!existing || existing.lod !== chunk.lod) {
          changed = true;
          break;
        }
      }
    }

    if (changed) {
      setVisibleChunks(newChunks);
    }
  });

  // Render visible chunks
  const chunkElements = useMemo(() => {
    const elements: React.ReactElement[] = [];

    for (const [key, chunk] of visibleChunks) {
      elements.push(
        <TerrainChunkMesh
          key={key}
          generator={generator}
          cx={chunk.cx}
          cz={chunk.cz}
          chunkSize={chunkSize}
          lod={chunk.lod}
        />
      );
    }

    return elements;
  }, [visibleChunks, generator, chunkSize]);

  return <group name="streaming-terrain">{chunkElements}</group>;
}

// ============================================================================
// HEIGHT QUERY HOOK
// ============================================================================

/**
 * Hook to get a height query function for the terrain
 */
export function useTerrainHeight(seed: number, maxHeight: number = DEFAULT_MAX_HEIGHT) {
  const generator = useMemo(() => new TerrainGenerator(seed, maxHeight), [seed, maxHeight]);

  const getHeightAt = useCallback(
    (x: number, z: number): number => {
      return generator.getHeightAt(x, z);
    },
    [generator]
  );

  return getHeightAt;
}

export default StreamingTerrainR3F;
