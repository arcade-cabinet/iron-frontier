/**
 * Hex Grid System for Iron Frontier
 *
 * This module provides a complete hex-tile map system using axial coordinates.
 * It is designed to work with Kenney Hexagon Kit 3D assets and Babylon.js.
 *
 * Usage:
 * ```ts
 * import { hex, hexToWorld, hexNeighbors, HexTerrainType } from '@/engine/hex';
 *
 * const coord = hex(3, -1);
 * const worldPos = hexToWorld(coord);
 * const neighbors = hexNeighbors(coord);
 * ```
 */

// Coordinate utilities
export {
  angleToDirection,
  // Pathfinding helpers
  areAdjacent,
  // Conversions
  axialToCube,
  // Set utilities
  createHexSet,
  cubeToAxial,
  directionToAngle,
  // Neighbors
  directionVector,
  // Direction utilities
  getApproximateDirection,
  getDirection,
  getSharedEdge,
  getVisibleChunks,
  // Creation
  hex,
  // Arithmetic
  hexAdd,
  // Area calculations
  hexArea,
  hexCorners,
  hexCube,
  // Distance and range
  hexDistance,
  hexEquals,
  hexesInChunk,
  hexesInRange,
  hexFromCube,
  hexHeight,
  // Line drawing
  hexLine,
  hexNeighbor,
  hexNeighbors,
  hexRing,
  hexRotate,
  hexRotateAround,
  hexRound,
  hexScale,
  hexSetAdd,
  hexSetDelete,
  hexSetHas,
  hexSpiral,
  hexSubtract,
  // Chunks
  hexToChunk,
  hexToWorld,
  hexWidth,
  isValidHexCoord,
  oppositeDirection,
  rotateDirection,
  worldToFractionalHex,
  worldToHex,
} from './HexCoord';
// ECS System (miniplex)
export {
  type AdjacencyComponent,
  addAdjacencyComponent,
  addFeatureComponent,
  addResourceComponent,
  addVisibilityComponent,
  canTraverse,
  createHexQueries,
  // Entity factories
  createHexTileEntity,
  // World creation
  createHexWorld,
  type FeatureComponent,
  findEntityByCoord,
  // Queries
  findEntityByKey,
  // Pathfinding
  findPath,
  getEffectiveMovementCost,
  getMovementCost,
  getPassableNeighbors,
  type HexPositionComponent,
  type HexQueries,
  // Types
  type HexTileEntity,
  type HexWorldContext,
  type MovementCapabilities,
  type MovementComponent,
  type PathResult,
  // World population
  populateWorldFromGrid,
  type ResourceComponent,
  // Constants
  TERRAIN_MOVEMENT_COSTS,
  type TerrainComponent,
  type VisibilityComponent,
} from './HexECS';

// Grid Renderer (Babylon.js integration)
export {
  createEmptyGrid,
  DEFAULT_ISOMETRIC_CONFIG,
  HEX_HEIGHT,
  HEX_SIZE,
  HEX_WIDTH,
  type HexGrid,
  HexGridRenderer,
  type HexGridRendererConfig,
  // Vector3 wrappers for coordinate conversion
  hexToWorld as hexToWorldVector,
  type IsometricCameraConfig,
  rotationToRadians,
  worldToHex as worldToHexFromVector,
} from './HexGridRenderer';
// Map Generator
export {
  createHexMapGenerator,
  DEFAULT_HEX_MAP_CONFIG,
  generateHexMap,
  type HexMapConfig,
  HexMapGenerator,
  type HexTileData as GeneratorTileData,
} from './HexMapGenerator';
// Scene Manager (Babylon.js integration)
export {
  type HexSceneConfig,
  HexSceneManager,
  type WorldPosition as HexWorldPosition,
} from './HexSceneManager';
// Tile Loader (Kenney GLB models)
export {
  disposeHexTileLoader,
  getHexTileLoader,
  HexTileLoader,
  type HexTileType as LoaderTileType,
  type TileInstanceOptions,
} from './HexTileLoader';
// Types and Enums
export {
  // Building placement
  type BuildingFootprint,
  type BuildingPlacementResult,
  createEmptyTile,
  DEFAULT_HEX_ASSET_CONFIG,
  DEFAULT_HEX_CHUNK_CONFIG,
  DEFAULT_HEX_LAYOUT,
  type FractionalHexCoord,
  HEX_DIRECTIONS,
  // Asset configuration
  type HexAssetConfig,
  HexBuildingType,
  type HexChunkConfig,
  // Chunk system
  type HexChunkCoord,
  type HexChunkData,
  // Coordinate types
  type HexCoord,
  type HexCubeCoord,
  // Direction
  HexDirection,
  // Tile data
  type HexEdges,
  HexEdgeType,
  HexElevation,
  HexFeatureType,
  type HexLayout,
  // Layout
  HexOrientation,
  type HexPath,
  // Path system
  type HexPathSegment,
  // Terrain types
  HexTerrainType,
  type HexTileData,
  hexChunkKey,
  // Utilities
  hexKey,
  isTerrainBuildable,
  isTerrainPassable,
  isTerrainWater,
  parseHexKey,
  type WorldPosition,
} from './HexTypes';

// Textured Hex Tiles (PBR materials with custom textures)
export {
  disposeTexturedHexTileFactory,
  getTexturedHexTileFactory,
  TERRAIN_FALLBACK_COLORS,
  TERRAIN_TEXTURES,
  type TerrainTextureConfig,
  TexturedHexTileFactory,
  type TextureSet,
} from './TexturedHexTile';
