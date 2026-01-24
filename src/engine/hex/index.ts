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

// Types and Enums
export {
  // Terrain types
  HexTerrainType,
  HexElevation,
  HexEdgeType,
  HexFeatureType,
  HexBuildingType,

  // Coordinate types
  type HexCoord,
  type HexCubeCoord,
  type FractionalHexCoord,
  type WorldPosition,

  // Tile data
  type HexEdges,
  type HexTileData,
  createEmptyTile,

  // Chunk system
  type HexChunkCoord,
  type HexChunkConfig,
  type HexChunkData,
  DEFAULT_HEX_CHUNK_CONFIG,

  // Layout
  HexOrientation,
  type HexLayout,
  DEFAULT_HEX_LAYOUT,

  // Direction
  HexDirection,
  HEX_DIRECTIONS,

  // Building placement
  type BuildingFootprint,
  type BuildingPlacementResult,

  // Path system
  type HexPathSegment,
  type HexPath,

  // Asset configuration
  type HexAssetConfig,
  DEFAULT_HEX_ASSET_CONFIG,

  // Utilities
  hexKey,
  parseHexKey,
  hexChunkKey,
  isTerrainPassable,
  isTerrainWater,
  isTerrainBuildable,
} from './HexTypes';

// Coordinate utilities
export {
  // Creation
  hex,
  hexCube,
  hexFromCube,

  // Conversions
  axialToCube,
  cubeToAxial,
  hexRound,
  hexToWorld,
  worldToFractionalHex,
  worldToHex,
  hexCorners,

  // Neighbors
  directionVector,
  hexNeighbor,
  hexNeighbors,
  oppositeDirection,
  rotateDirection,
  getDirection,

  // Distance and range
  hexDistance,
  hexesInRange,
  hexRing,
  hexSpiral,

  // Line drawing
  hexLine,
  isValidHexCoord,

  // Arithmetic
  hexAdd,
  hexSubtract,
  hexScale,
  hexEquals,
  hexRotate,
  hexRotateAround,

  // Chunks
  hexToChunk,
  hexesInChunk,
  getVisibleChunks,

  // Pathfinding helpers
  areAdjacent,
  getSharedEdge,

  // Area calculations
  hexArea,
  hexWidth,
  hexHeight,

  // Set utilities
  createHexSet,
  hexSetHas,
  hexSetAdd,
  hexSetDelete,

  // Direction utilities
  getApproximateDirection,
  angleToDirection,
  directionToAngle,
} from './HexCoord';

// Grid Renderer (Babylon.js integration)
export {
  HexGridRenderer,
  createEmptyGrid,
  rotationToRadians,
  HEX_SIZE,
  HEX_WIDTH,
  HEX_HEIGHT,
  DEFAULT_ISOMETRIC_CONFIG,
  type HexGrid,
  type HexGridRendererConfig,
  type IsometricCameraConfig,
  // Vector3 wrappers for coordinate conversion
  hexToWorld as hexToWorldVector,
  worldToHex as worldToHexFromVector,
} from './HexGridRenderer';

// Tile Loader (Kenney GLB models)
export {
  HexTileLoader,
  getHexTileLoader,
  disposeHexTileLoader,
  type HexTileType as LoaderTileType,
  type TileInstanceOptions,
} from './HexTileLoader';

// Map Generator
export {
  HexMapGenerator,
  generateHexMap,
  createHexMapGenerator,
  type HexMapConfig,
  type HexTileData as GeneratorTileData,
  DEFAULT_HEX_MAP_CONFIG,
} from './HexMapGenerator';

// Scene Manager (Babylon.js integration)
export {
  HexSceneManager,
  type HexSceneConfig,
  type WorldPosition as HexWorldPosition,
} from './HexSceneManager';

// ECS System (miniplex)
export {
  // World creation
  createHexWorld,

  // Entity factories
  createHexTileEntity,
  addAdjacencyComponent,
  addFeatureComponent,
  addVisibilityComponent,
  addResourceComponent,

  // Queries
  findEntityByKey,
  findEntityByCoord,
  getPassableNeighbors,
  getMovementCost,
  canTraverse,
  getEffectiveMovementCost,

  // Pathfinding
  findPath,

  // World population
  populateWorldFromGrid,
  createHexQueries,

  // Constants
  TERRAIN_MOVEMENT_COSTS,

  // Types
  type HexTileEntity,
  type HexPositionComponent,
  type TerrainComponent,
  type MovementComponent,
  type AdjacencyComponent,
  type FeatureComponent,
  type VisibilityComponent,
  type ResourceComponent,
  type MovementCapabilities,
  type PathResult,
  type HexQueries,
  type HexWorldContext,
} from './HexECS';
