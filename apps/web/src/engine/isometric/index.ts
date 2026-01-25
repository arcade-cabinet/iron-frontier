/**
 * Isometric Tile Engine
 *
 * Fallout 2-style isometric square tiles (diamonds from top view).
 * Separate terrain, props, and building layers for flexible rendering.
 */

// Types and enums
export {
  type GridCoord,
  type WorldPosition,
  type IsometricLayout,
  type IsometricGrid,
  type TerrainTileData,
  type PropPlacement,
  type BuildingPlacement,
  TerrainType,
  PropType,
  BuildingType,
  RenderLayer,
  DEFAULT_ISOMETRIC_LAYOUT,
  tileKey,
  parseTileKey,
  createEmptyGrid,
} from './IsometricTypes';

// Coordinate utilities
export {
  gridToWorld,
  worldToGrid,
  worldToFractionalGrid,
  Direction,
  DIRECTION_OFFSETS,
  getNeighbor,
  getNeighbors,
  getCardinalNeighbors,
  manhattanDistance,
  chebyshevDistance,
  euclideanDistance,
  gridDistance,
  tilesInLine,
  tilesInRange,
  tilesInRadius,
  coordsEqual,
  areAdjacent,
  getDirection,
  clampToGrid,
} from './IsometricCoord';

// Tile geometry
export {
  createIsometricTileGeometry,
  createSimpleTileGeometry,
  createTileMeshTemplate,
  createSimpleTileMeshTemplate,
} from './IsometricTileGeometry';

// Tile factory
export {
  IsometricTileFactory,
  TERRAIN_TEXTURE_CONFIGS,
  type TerrainTextureConfig,
} from './IsometricTileFactory';

// Grid renderer
export {
  IsometricGridRenderer,
  type IsometricRendererConfig,
  type IsometricCameraConfig,
  DEFAULT_CAMERA_CONFIG,
} from './IsometricGridRenderer';

// Tile loader (for precompiled GLBs)
export {
  IsometricTileLoader,
  getIsometricTileLoader,
} from './IsometricTileLoader';
