// R3F Terrain System - Main exports
// Streaming terrain with LOD and biome-based textures

// Main component
export {
  StreamingTerrain,
  useTerrain,
  TerrainMarker,
  TerrainAligned,
  useTerrainRaycast,
  type StreamingTerrainConfig,
  type StreamingTerrainProps,
  type TerrainContextValue,
} from './StreamingTerrain';

// Chunk manager
export {
  ChunkManager,
  useTerrainHeight,
  type ChunkManagerProps,
  type ChunkManagerStats,
} from './ChunkManager';

// Individual chunk component
export {
  TerrainChunk,
  getHeightAtLocal,
  LOD_RESOLUTIONS,
  type TerrainChunkProps,
  type LODLevel,
} from './TerrainChunk';

// Heightmap generation
export {
  useHeightmap,
  CHUNK_SIZE,
  VIEW_DISTANCE,
  HEIGHTMAP_RESOLUTION,
  DEFAULT_TERRAIN_CONFIG,
  worldToChunk,
  chunkToWorld,
  chunkKey,
  parseChunkKey,
  type UseHeightmapOptions,
  type UseHeightmapResult,
  type HeightmapData,
  type HeightmapGenerator,
  type TerrainConfig,
} from './useHeightmap';
