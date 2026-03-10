// Engine Types - Coordinate Systems
// Platform-agnostic coordinate and spatial definitions

// Simple vector/color types to avoid engine dependencies
export interface Vector3Simple {
  x: number;
  y: number;
  z: number;
}

export interface Color3Simple {
  r: number;
  g: number;
  b: number;
}

// ============================================================================
// COORDINATE SYSTEMS
// ============================================================================

export interface WorldPosition {
  x: number; // East-West (meters)
  z: number; // North-South (meters)
  y: number; // Elevation (computed from heightmap)
}

export interface ChunkCoord {
  cx: number;
  cz: number;
}

export const CHUNK_SIZE = 64; // 64x64 meters per chunk
export const VIEW_DISTANCE = 3; // Load chunks within this radius

export function worldToChunk(pos: WorldPosition): ChunkCoord {
  return {
    cx: Math.floor(pos.x / CHUNK_SIZE),
    cz: Math.floor(pos.z / CHUNK_SIZE),
  };
}

export function chunkToWorld(coord: ChunkCoord): WorldPosition {
  return {
    x: coord.cx * CHUNK_SIZE + CHUNK_SIZE / 2,
    z: coord.cz * CHUNK_SIZE + CHUNK_SIZE / 2,
    y: 0,
  };
}

export function chunkKey(coord: ChunkCoord): string {
  return `${coord.cx},${coord.cz}`;
}
