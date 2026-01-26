// TerrainChunk - R3F component for a single terrain chunk
// Uses Three.js PlaneGeometry with vertex displacement for heightmap

import { useRef, useMemo, useEffect, Suspense, memo } from 'react';
import { useLoader } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader, RepeatWrapping, LinearMipMapLinearFilter, SRGBColorSpace } from 'three';
import type { BiomeType, ChunkCoord } from '@iron-frontier/shared/types/engine';
import { TerrainTextures, getTextureSetPaths } from '@iron-frontier/assets';
import {
  CHUNK_SIZE,
  HEIGHTMAP_RESOLUTION,
  type HeightmapData,
  chunkKey,
} from './useHeightmap';

// ============================================================================
// CONSTANTS
// ============================================================================

export const LOD_RESOLUTIONS = {
  high: 65,
  medium: 33,
  low: 17,
} as const;

export type LODLevel = keyof typeof LOD_RESOLUTIONS;

const TEXTURE_REPEAT = 8; // Number of times to repeat texture across chunk

// ============================================================================
// TYPES
// ============================================================================

export interface TerrainChunkProps {
  /** Chunk coordinate */
  coord: ChunkCoord;
  /** Pre-generated heightmap data */
  heightmapData: HeightmapData;
  /** LOD level based on distance to camera */
  lodLevel?: LODLevel;
  /** Whether chunk is visible */
  visible?: boolean;
  /** Callback when chunk is clicked */
  onClick?: (coord: ChunkCoord, point: THREE.Vector3) => void;
  /** Debug mode - show wireframe */
  debug?: boolean;
}

// ============================================================================
// BIOME TEXTURE MAPPING
// ============================================================================

interface BiomeTextureSet {
  color: string;
  normal: string;
  roughness: string;
}

function getBiomeTextures(biome: BiomeType): BiomeTextureSet {
  switch (biome) {
    case 'desert':
      return getTextureSetPaths(TerrainTextures.DESERT) as BiomeTextureSet;
    case 'grassland':
      return getTextureSetPaths(TerrainTextures.GRASSLAND) as BiomeTextureSet;
    case 'badlands':
      return getTextureSetPaths(TerrainTextures.BADLANDS) as BiomeTextureSet;
    case 'riverside':
      return getTextureSetPaths(TerrainTextures.RIVERSIDE) as BiomeTextureSet;
    case 'mine':
      return getTextureSetPaths(TerrainTextures.ROCK) as BiomeTextureSet;
    case 'town':
    case 'railyard':
    default:
      return getTextureSetPaths(TerrainTextures.DESERT) as BiomeTextureSet;
  }
}

// ============================================================================
// GEOMETRY GENERATION
// ============================================================================

interface TerrainGeometryResult {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
}

function generateTerrainGeometry(
  heightmapData: HeightmapData,
  lodLevel: LODLevel
): TerrainGeometryResult {
  const resolution = LOD_RESOLUTIONS[lodLevel];
  const sourceResolution = HEIGHTMAP_RESOLUTION;

  const vertexCount = resolution * resolution;
  const indexCount = (resolution - 1) * (resolution - 1) * 6;

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = new Uint32Array(indexCount);

  const cellSize = CHUNK_SIZE / (resolution - 1);
  const sampleStep = (sourceResolution - 1) / (resolution - 1);

  // Fill positions and UVs, sampling from full-resolution heightmap
  for (let z = 0; z < resolution; z++) {
    for (let x = 0; x < resolution; x++) {
      const idx = z * resolution + x;

      // Sample from heightmap (may need interpolation for lower LODs)
      const srcX = Math.min(Math.floor(x * sampleStep), sourceResolution - 1);
      const srcZ = Math.min(Math.floor(z * sampleStep), sourceResolution - 1);
      const height = heightmapData.heights[srcZ * sourceResolution + srcX];

      // Three.js uses Y-up, so height goes to Y axis
      // X is east-west, Z is north-south
      positions[idx * 3 + 0] = x * cellSize;
      positions[idx * 3 + 1] = height;
      positions[idx * 3 + 2] = z * cellSize;

      uvs[idx * 2 + 0] = x / (resolution - 1);
      uvs[idx * 2 + 1] = z / (resolution - 1);
    }
  }

  // Calculate normals using central differences
  for (let z = 0; z < resolution; z++) {
    for (let x = 0; x < resolution; x++) {
      const idx = z * resolution + x;
      const h = positions[idx * 3 + 1];

      const hL = x > 0 ? positions[(z * resolution + (x - 1)) * 3 + 1] : h;
      const hR = x < resolution - 1 ? positions[(z * resolution + (x + 1)) * 3 + 1] : h;
      const hD = z > 0 ? positions[((z - 1) * resolution + x) * 3 + 1] : h;
      const hU = z < resolution - 1 ? positions[((z + 1) * resolution + x) * 3 + 1] : h;

      // Normal from height differences
      const nx = hL - hR;
      const nz = hD - hU;
      const ny = 2 * cellSize;

      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      normals[idx * 3 + 0] = nx / len;
      normals[idx * 3 + 1] = ny / len;
      normals[idx * 3 + 2] = nz / len;
    }
  }

  // Fill indices (two triangles per quad)
  let indexIdx = 0;
  for (let z = 0; z < resolution - 1; z++) {
    for (let x = 0; x < resolution - 1; x++) {
      const topLeft = z * resolution + x;
      const topRight = topLeft + 1;
      const bottomLeft = (z + 1) * resolution + x;
      const bottomRight = bottomLeft + 1;

      // First triangle (top-left, bottom-left, top-right)
      indices[indexIdx++] = topLeft;
      indices[indexIdx++] = bottomLeft;
      indices[indexIdx++] = topRight;

      // Second triangle (top-right, bottom-left, bottom-right)
      indices[indexIdx++] = topRight;
      indices[indexIdx++] = bottomLeft;
      indices[indexIdx++] = bottomRight;
    }
  }

  return { positions, normals, uvs, indices };
}

// ============================================================================
// DOMINANT BIOME CALCULATION
// ============================================================================

function getDominantBiome(heightmapData: HeightmapData): BiomeType {
  const totals: Record<BiomeType, number> = {
    desert: 0,
    grassland: 0,
    badlands: 0,
    riverside: 0,
    town: 0,
    railyard: 0,
    mine: 0,
  };

  for (const [biomeType, weights] of heightmapData.biomeWeights) {
    for (let i = 0; i < weights.length; i++) {
      totals[biomeType] += weights[i];
    }
  }

  let dominant: BiomeType = 'desert';
  let maxWeight = 0;
  for (const [biome, total] of Object.entries(totals)) {
    if (total > maxWeight) {
      maxWeight = total;
      dominant = biome as BiomeType;
    }
  }

  return dominant;
}

// ============================================================================
// TEXTURE LOADER COMPONENT
// ============================================================================

interface TerrainMaterialProps {
  biome: BiomeType;
  debug: boolean;
}

function TerrainMaterial({ biome, debug }: TerrainMaterialProps) {
  const texturePaths = getBiomeTextures(biome);

  const [colorMap, normalMap, roughnessMap] = useLoader(TextureLoader, [
    texturePaths.color,
    texturePaths.normal,
    texturePaths.roughness,
  ]);

  // Configure textures
  useEffect(() => {
    [colorMap, normalMap, roughnessMap].forEach((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
      texture.minFilter = LinearMipMapLinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
    });

    // Color map needs sRGB color space
    colorMap.colorSpace = SRGBColorSpace;
  }, [colorMap, normalMap, roughnessMap]);

  if (debug) {
    return (
      <meshBasicMaterial
        wireframe
        color={0x00ff00}
      />
    );
  }

  return (
    <meshStandardMaterial
      map={colorMap}
      normalMap={normalMap}
      roughnessMap={roughnessMap}
      roughness={0.8}
      metalness={0.1}
      side={THREE.FrontSide}
    />
  );
}

// ============================================================================
// FALLBACK MATERIAL
// ============================================================================

function FallbackMaterial({ biome }: { biome: BiomeType }) {
  // Biome-specific colors for fallback
  const colors: Record<BiomeType, number> = {
    desert: 0xc4a574,
    grassland: 0x8b9a6b,
    badlands: 0x8b4513,
    riverside: 0x6b8e6b,
    town: 0x9b8b7b,
    railyard: 0x5a5a5a,
    mine: 0x6b5b4b,
  };

  return (
    <meshStandardMaterial
      color={colors[biome]}
      roughness={0.9}
      metalness={0.0}
      side={THREE.FrontSide}
    />
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function TerrainChunkInner({
  coord,
  heightmapData,
  lodLevel = 'high',
  visible = true,
  onClick,
  debug = false,
}: TerrainChunkProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const key = chunkKey(coord);

  // Calculate dominant biome for texture selection
  const dominantBiome = useMemo(() => getDominantBiome(heightmapData), [heightmapData]);

  // Generate geometry based on LOD level
  const geometry = useMemo(() => {
    const { positions, normals, uvs, indices } = generateTerrainGeometry(heightmapData, lodLevel);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));

    // Compute bounding box/sphere for frustum culling
    geo.computeBoundingBox();
    geo.computeBoundingSphere();

    return geo;
  }, [heightmapData, lodLevel]);

  // Position in world space
  const position = useMemo<[number, number, number]>(
    () => [coord.cx * CHUNK_SIZE, 0, coord.cz * CHUNK_SIZE],
    [coord]
  );

  // Handle click events
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (onClick) {
      event.stopPropagation();
      onClick(coord, event.point);
    }
  };

  // Cleanup geometry on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh
      ref={meshRef}
      name={`terrain_${key}`}
      geometry={geometry}
      position={position}
      visible={visible}
      receiveShadow
      onClick={handleClick}
      frustumCulled
    >
      <Suspense fallback={<FallbackMaterial biome={dominantBiome} />}>
        <TerrainMaterial biome={dominantBiome} debug={debug} />
      </Suspense>
    </mesh>
  );
}

// ============================================================================
// MEMOIZED EXPORT
// ============================================================================

/**
 * TerrainChunk - R3F component for rendering a single terrain chunk.
 *
 * Uses Three.js PlaneGeometry with vertex displacement based on heightmap data.
 * Supports LOD (Level of Detail) for performance optimization.
 *
 * Features:
 * - Procedural vertex displacement from heightmap
 * - PBR materials with texture blending based on biome
 * - LOD system (high: 65x65, medium: 33x33, low: 17x17 vertices)
 * - Frustum culling
 * - Shadow receiving
 *
 * @example
 * ```tsx
 * <TerrainChunk
 *   coord={{ cx: 0, cz: 0 }}
 *   heightmapData={generatedData}
 *   lodLevel="high"
 * />
 * ```
 */
export const TerrainChunk = memo(TerrainChunkInner, (prev, next) => {
  // Custom comparison for performance
  return (
    prev.coord.cx === next.coord.cx &&
    prev.coord.cz === next.coord.cz &&
    prev.lodLevel === next.lodLevel &&
    prev.visible === next.visible &&
    prev.debug === next.debug &&
    prev.heightmapData === next.heightmapData
  );
});

TerrainChunk.displayName = 'TerrainChunk';

// ============================================================================
// HEIGHT QUERY UTILITY
// ============================================================================

/**
 * Get interpolated height at local chunk coordinates from heightmap data.
 */
export function getHeightAtLocal(
  heightmapData: HeightmapData,
  localX: number,
  localZ: number
): number {
  const resolution = HEIGHTMAP_RESOLUTION;
  const cellSize = CHUNK_SIZE / (resolution - 1);

  const gx = Math.max(0, Math.min(localX / cellSize, resolution - 1));
  const gz = Math.max(0, Math.min(localZ / cellSize, resolution - 1));

  const x0 = Math.floor(gx);
  const z0 = Math.floor(gz);
  const x1 = Math.min(x0 + 1, resolution - 1);
  const z1 = Math.min(z0 + 1, resolution - 1);

  const fx = gx - x0;
  const fz = gz - z0;

  const h00 = heightmapData.heights[z0 * resolution + x0];
  const h10 = heightmapData.heights[z0 * resolution + x1];
  const h01 = heightmapData.heights[z1 * resolution + x0];
  const h11 = heightmapData.heights[z1 * resolution + x1];

  // Bilinear interpolation
  const h0 = h00 * (1 - fx) + h10 * fx;
  const h1 = h01 * (1 - fx) + h11 * fx;

  return h0 * (1 - fz) + h1 * fz;
}
