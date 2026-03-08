// Terrain — R3F component rendering a 3x3 grid of heightmap chunks.
//
// Tracks the player camera position each frame and recalculates which
// chunks are visible when the camera crosses a chunk boundary. Cached
// meshes are reused via useMemo keyed on chunk coordinate strings.
//
// Each chunk mesh is registered as a trimesh collider with PhysicsProvider
// so the player can walk on the terrain surface.

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { generateChunk } from '@/engine/renderers/TerrainChunk';
import {
  type BiomeId,
  CHUNK_SIZE,
  DEFAULT_SEED,
  VIEW_RADIUS,
} from '@/engine/renderers/TerrainConfig';

import { usePhysics } from './PhysicsProvider';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TerrainProps {
  /** World seed for deterministic generation. */
  seed?: string;
  /** Biome controlling noise shape and material selection. */
  biome?: BiomeId;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a world-space coordinate to the chunk index it falls within. */
function worldToChunk(worldCoord: number): number {
  return Math.floor(worldCoord / CHUNK_SIZE);
}

/** Serialize chunk coords for use as a cache key. */
function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Terrain({
  seed = DEFAULT_SEED,
  biome = 'desert',
}: TerrainProps) {
  const { camera } = useThree();
  const { registerTerrain, unregister } = usePhysics();

  // Current chunk the camera occupies — drives which 3x3 grid we show.
  const [centerChunk, setCenterChunk] = useState<{ cx: number; cz: number }>({
    cx: worldToChunk(camera.position.x),
    cz: worldToChunk(camera.position.z),
  });

  // Cache of generated meshes keyed by "cx,cz"
  const chunkCache = useRef<Map<string, THREE.Mesh>>(new Map());

  // Track which chunk keys have been registered as colliders (key -> collider id)
  const colliderIds = useRef<Map<string, string>>(new Map());

  // Detect chunk boundary crossings each frame
  const lastChunkRef = useRef({ cx: centerChunk.cx, cz: centerChunk.cz });

  useFrame(() => {
    const cx = worldToChunk(camera.position.x);
    const cz = worldToChunk(camera.position.z);

    if (cx !== lastChunkRef.current.cx || cz !== lastChunkRef.current.cz) {
      lastChunkRef.current = { cx, cz };
      setCenterChunk({ cx, cz });
    }
  });

  // Build or retrieve the mesh for a given chunk coordinate
  const getOrCreateChunk = useCallback(
    (cx: number, cz: number): THREE.Mesh => {
      const key = chunkKey(cx, cz);
      const existing = chunkCache.current.get(key);
      if (existing) return existing;

      const mesh = generateChunk(cx, cz, seed, biome);
      chunkCache.current.set(key, mesh);
      return mesh;
    },
    [seed, biome],
  );

  // Compute the list of visible chunk coordinates
  const visibleCoords = useMemo(() => {
    const coords: Array<{ cx: number; cz: number }> = [];
    for (let dz = -VIEW_RADIUS; dz <= VIEW_RADIUS; dz++) {
      for (let dx = -VIEW_RADIUS; dx <= VIEW_RADIUS; dx++) {
        coords.push({
          cx: centerChunk.cx + dx,
          cz: centerChunk.cz + dz,
        });
      }
    }
    return coords;
  }, [centerChunk.cx, centerChunk.cz]);

  // Generate meshes for all visible chunks (memoized per coordinate set)
  const chunkMeshes = useMemo(() => {
    return visibleCoords.map(({ cx, cz }) => ({
      key: chunkKey(cx, cz),
      mesh: getOrCreateChunk(cx, cz),
    }));
  }, [visibleCoords, getOrCreateChunk]);

  // Register / unregister terrain colliders when visible chunks change
  useEffect(() => {
    const currentKeys = new Set<string>();

    for (const { key, mesh } of chunkMeshes) {
      currentKeys.add(key);
      // Register new chunks that don't have colliders yet
      if (!colliderIds.current.has(key)) {
        const colliderId = registerTerrain(mesh);
        colliderIds.current.set(key, colliderId);
      }
    }

    // Unregister chunks that are no longer visible
    for (const [key, colliderId] of colliderIds.current) {
      if (!currentKeys.has(key)) {
        unregister(colliderId);
        colliderIds.current.delete(key);
      }
    }
  }, [chunkMeshes, registerTerrain, unregister]);

  // Cleanup all colliders on unmount
  useEffect(() => {
    return () => {
      for (const colliderId of colliderIds.current.values()) {
        unregister(colliderId);
      }
      colliderIds.current.clear();
    };
  }, [unregister]);

  return (
    <group name="terrain">
      {chunkMeshes.map(({ key, mesh }) => (
        <primitive key={key} object={mesh} />
      ))}
    </group>
  );
}
