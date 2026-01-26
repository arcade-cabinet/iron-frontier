// ChunkManager - R3F component that manages chunk loading/unloading
// Tracks player position and loads chunks within view distance

import { useRef, useMemo, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkCoord } from '@iron-frontier/shared/types/engine';
import {
  useHeightmap,
  CHUNK_SIZE,
  VIEW_DISTANCE,
  chunkKey,
  worldToChunk,
  parseChunkKey,
  type HeightmapData,
  type UseHeightmapOptions,
} from './useHeightmap';
import { TerrainChunk, type LODLevel, getHeightAtLocal } from './TerrainChunk';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum chunks to load per frame to avoid frame drops */
const CHUNKS_PER_FRAME = 2;

/** Buffer distance beyond view distance before unloading */
const UNLOAD_BUFFER = 1;

// ============================================================================
// TYPES
// ============================================================================

export interface ChunkManagerProps {
  /** Player position in world coordinates */
  playerPosition?: THREE.Vector3 | [number, number, number];
  /** View distance in chunks (default: 3) */
  viewDistance?: number;
  /** Heightmap generation options */
  heightmapOptions?: UseHeightmapOptions;
  /** Callback when a chunk is clicked */
  onChunkClick?: (coord: ChunkCoord, worldPoint: THREE.Vector3) => void;
  /** Debug mode */
  debug?: boolean;
  /** Enable auto-update from camera position */
  followCamera?: boolean;
}

interface ChunkState {
  coord: ChunkCoord;
  key: string;
  heightmapData: HeightmapData;
  lodLevel: LODLevel;
  loadedAt: number;
}

interface QueuedChunk {
  coord: ChunkCoord;
  priority: number; // Lower = higher priority (distance-based)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get Manhattan distance between two chunk coordinates
 */
function chunkDistance(a: ChunkCoord, b: ChunkCoord): number {
  return Math.abs(a.cx - b.cx) + Math.abs(a.cz - b.cz);
}

/**
 * Check if a chunk is within a square radius of a center chunk
 */
function isInRadius(coord: ChunkCoord, center: ChunkCoord, radius: number): boolean {
  const dx = Math.abs(coord.cx - center.cx);
  const dz = Math.abs(coord.cz - center.cz);
  return dx <= radius && dz <= radius;
}

/**
 * Get all chunk coordinates within a radius, in spiral order (center outward)
 */
function getChunksInRadius(center: ChunkCoord, radius: number): ChunkCoord[] {
  const chunks: ChunkCoord[] = [];

  // Start at center
  chunks.push({ cx: center.cx, cz: center.cz });

  // Spiral outward
  for (let ring = 1; ring <= radius; ring++) {
    // Top edge (left to right)
    for (let x = -ring; x <= ring; x++) {
      chunks.push({ cx: center.cx + x, cz: center.cz - ring });
    }

    // Right edge (top to bottom, excluding corners)
    for (let z = -ring + 1; z <= ring - 1; z++) {
      chunks.push({ cx: center.cx + ring, cz: center.cz + z });
    }

    // Bottom edge (right to left)
    for (let x = ring; x >= -ring; x--) {
      chunks.push({ cx: center.cx + x, cz: center.cz + ring });
    }

    // Left edge (bottom to top, excluding corners)
    for (let z = ring - 1; z >= -ring + 1; z--) {
      chunks.push({ cx: center.cx - ring, cz: center.cz + z });
    }
  }

  return chunks;
}

/**
 * Determine LOD level based on distance to player chunk
 */
function getLODForDistance(distance: number): LODLevel {
  if (distance <= 1) return 'high';
  if (distance <= 2) return 'medium';
  return 'low';
}

// ============================================================================
// CHUNK MANAGER COMPONENT
// ============================================================================

/**
 * ChunkManager - Manages terrain chunk loading and unloading based on player position.
 *
 * Features:
 * - Priority-based chunk loading (closest chunks first)
 * - Spiral loading pattern from player position
 * - Automatic LOD adjustment based on distance
 * - Chunk pooling to minimize garbage collection
 * - Frame-budgeted loading to prevent stutters
 *
 * @example
 * ```tsx
 * <ChunkManager
 *   playerPosition={[100, 0, 200]}
 *   viewDistance={3}
 *   heightmapOptions={{ seed: 12345 }}
 * />
 * ```
 */
export function ChunkManager({
  playerPosition,
  viewDistance = VIEW_DISTANCE,
  heightmapOptions,
  onChunkClick,
  debug = false,
  followCamera = false,
}: ChunkManagerProps) {
  const { camera } = useThree();
  const { generate, getHeightAt, config } = useHeightmap(heightmapOptions);

  // Loaded chunks map
  const chunksRef = useRef<Map<string, ChunkState>>(new Map());

  // Load queue
  const loadQueueRef = useRef<QueuedChunk[]>([]);

  // Loading set (chunks currently being processed)
  const loadingRef = useRef<Set<string>>(new Set());

  // Current player chunk
  const playerChunkRef = useRef<ChunkCoord>({ cx: 0, cz: 0 });

  // Force update trigger
  const forceUpdateRef = useRef(0);

  // Get current player world position
  const getPlayerWorldPosition = useCallback((): THREE.Vector3 => {
    if (playerPosition) {
      if (Array.isArray(playerPosition)) {
        return new THREE.Vector3(playerPosition[0], playerPosition[1], playerPosition[2]);
      }
      // Clone to avoid type issues between different @types/three versions
      return new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
    }
    if (followCamera) {
      // Clone camera position to avoid type compatibility issues
      return new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
    }
    return new THREE.Vector3(0, 0, 0);
  }, [playerPosition, followCamera, camera]);

  // Queue a chunk for loading
  const queueChunkLoad = useCallback((coord: ChunkCoord, priority: number) => {
    const key = chunkKey(coord);

    // Skip if already loaded or loading
    if (chunksRef.current.has(key) || loadingRef.current.has(key)) {
      return;
    }

    // Insert in priority order
    const queue = loadQueueRef.current;
    const entry: QueuedChunk = { coord, priority };
    const insertIndex = queue.findIndex((q) => q.priority > priority);

    if (insertIndex === -1) {
      queue.push(entry);
    } else {
      queue.splice(insertIndex, 0, entry);
    }
  }, []);

  // Load a single chunk
  const loadChunk = useCallback((coord: ChunkCoord): ChunkState | null => {
    const key = chunkKey(coord);

    try {
      const heightmapData = generate(coord);
      const distance = chunkDistance(coord, playerChunkRef.current);
      const lodLevel = getLODForDistance(distance);

      const state: ChunkState = {
        coord,
        key,
        heightmapData,
        lodLevel,
        loadedAt: Date.now(),
      };

      chunksRef.current.set(key, state);
      return state;
    } catch (error) {
      console.error(`[ChunkManager] Failed to load chunk ${key}:`, error);
      return null;
    }
  }, [generate]);

  // Process the load queue
  const processLoadQueue = useCallback(() => {
    let loaded = 0;
    const queue = loadQueueRef.current;
    const playerChunk = playerChunkRef.current;

    while (queue.length > 0 && loaded < CHUNKS_PER_FRAME) {
      const entry = queue.shift()!;
      const key = chunkKey(entry.coord);

      // Skip if already loaded or loading
      if (chunksRef.current.has(key) || loadingRef.current.has(key)) {
        continue;
      }

      // Skip if no longer in view distance
      if (!isInRadius(entry.coord, playerChunk, viewDistance)) {
        continue;
      }

      loadingRef.current.add(key);

      const result = loadChunk(entry.coord);
      if (result) {
        loaded++;
        forceUpdateRef.current++;
      }

      loadingRef.current.delete(key);
    }

    return loaded > 0;
  }, [loadChunk, viewDistance]);

  // Unload chunks outside view distance
  const unloadDistantChunks = useCallback(() => {
    const playerChunk = playerChunkRef.current;
    const unloadDistance = viewDistance + UNLOAD_BUFFER;
    const toUnload: string[] = [];

    for (const [key, state] of chunksRef.current) {
      if (!isInRadius(state.coord, playerChunk, unloadDistance)) {
        toUnload.push(key);
      }
    }

    for (const key of toUnload) {
      chunksRef.current.delete(key);
    }

    return toUnload.length > 0;
  }, [viewDistance]);

  // Update LOD levels based on distance
  const updateLOD = useCallback(() => {
    const playerChunk = playerChunkRef.current;
    let changed = false;

    for (const [key, state] of chunksRef.current) {
      const distance = chunkDistance(state.coord, playerChunk);
      const newLOD = getLODForDistance(distance);

      if (state.lodLevel !== newLOD) {
        state.lodLevel = newLOD;
        changed = true;
      }
    }

    return changed;
  }, []);

  // Main update function - called each frame
  useFrame(() => {
    const worldPos = getPlayerWorldPosition();
    const newPlayerChunk = worldToChunk(worldPos.x, worldPos.z);

    // Check if player moved to a new chunk
    const chunkChanged =
      newPlayerChunk.cx !== playerChunkRef.current.cx ||
      newPlayerChunk.cz !== playerChunkRef.current.cz;

    playerChunkRef.current = newPlayerChunk;

    // Queue required chunks
    if (chunkChanged || chunksRef.current.size === 0) {
      const requiredChunks = getChunksInRadius(newPlayerChunk, viewDistance);

      for (const coord of requiredChunks) {
        const key = chunkKey(coord);
        if (!chunksRef.current.has(key)) {
          const priority = chunkDistance(coord, newPlayerChunk);
          queueChunkLoad(coord, priority);
        }
      }
    }

    // Process load queue
    const loadedAny = processLoadQueue();

    // Unload distant chunks
    if (chunkChanged) {
      unloadDistantChunks();
    }

    // Update LOD
    const lodChanged = updateLOD();

    // Trigger re-render if needed
    if (loadedAny || lodChanged) {
      forceUpdateRef.current++;
    }
  });

  // Initial load on mount
  useEffect(() => {
    const worldPos = getPlayerWorldPosition();
    const playerChunk = worldToChunk(worldPos.x, worldPos.z);
    playerChunkRef.current = playerChunk;

    const requiredChunks = getChunksInRadius(playerChunk, viewDistance);
    for (const coord of requiredChunks) {
      const priority = chunkDistance(coord, playerChunk);
      queueChunkLoad(coord, priority);
    }
  }, [getPlayerWorldPosition, viewDistance, queueChunkLoad]);

  // Render loaded chunks
  const chunks = useMemo(() => {
    // Force dependency on update counter
    const _ = forceUpdateRef.current;
    return Array.from(chunksRef.current.values());
  }, [forceUpdateRef.current]);

  // Handle chunk click
  const handleChunkClick = useCallback(
    (coord: ChunkCoord, point: THREE.Vector3) => {
      onChunkClick?.(coord, point);
    },
    [onChunkClick]
  );

  return (
    <group name="chunk-manager">
      {chunks.map((state) => (
        <TerrainChunk
          key={state.key}
          coord={state.coord}
          heightmapData={state.heightmapData}
          lodLevel={state.lodLevel}
          onClick={handleChunkClick}
          debug={debug}
        />
      ))}
    </group>
  );
}

// ============================================================================
// HOOKS FOR EXTERNAL ACCESS
// ============================================================================

/**
 * Hook to query terrain height at world position.
 * Uses the heightmap generator directly for immediate results.
 */
export function useTerrainHeight(
  options?: UseHeightmapOptions
): (x: number, z: number) => number {
  const { getHeightAt } = useHeightmap(options);
  return getHeightAt;
}

/**
 * Get terrain statistics for debugging
 */
export interface ChunkManagerStats {
  loadedChunks: number;
  loadingChunks: number;
  queuedChunks: number;
  playerChunk: ChunkCoord;
}

export function useChunkManagerStats(
  chunksRef: React.RefObject<Map<string, ChunkState>>,
  loadingRef: React.RefObject<Set<string>>,
  loadQueueRef: React.RefObject<QueuedChunk[]>,
  playerChunkRef: React.RefObject<ChunkCoord>
): ChunkManagerStats {
  return {
    loadedChunks: chunksRef.current?.size ?? 0,
    loadingChunks: loadingRef.current?.size ?? 0,
    queuedChunks: loadQueueRef.current?.length ?? 0,
    playerChunk: playerChunkRef.current ?? { cx: 0, cz: 0 },
  };
}
