// src/game/engine/world — Open world chunk loading and town placement system.
//
// Barrel export for all world engine modules.

export {
  ChunkManager,
} from './ChunkManager';
export type {
  ChunkManagerConfig,
  ChunkState,
  FlattenZone,
} from './ChunkManager';

export {
  buildAllRoutes,
  buildRoute,
  buildInternalRoadMesh,
  collectRouteFlattenZones,
} from './RouteRenderer';
export type {
  RouteEndpoints,
  RouteSegment,
} from './RouteRenderer';

export {
  placeTown,
} from './TownPlacer';
export type {
  BuildingPlacement,
  InternalRoad,
  NPCPlacement,
  PropPlacement,
  TownPlacement,
} from './TownPlacer';

export {
  CHUNK_SEGMENTS,
  CHUNK_SIZE,
  DEFAULT_LOAD_RADIUS,
  DEFAULT_RENDER_RADIUS,
  DEFAULT_SEED,
  DEFAULT_VIEW_DISTANCE,
  WORLD_CELL_SIZE,
  TOWN_BOUNDARY_RADIUS,
  HEX_CELL_SIZE,
  HEX_ROTATION_STEP,
  BUILDING_FLATTEN_RADIUS,
  FLATTEN_BLEND_DISTANCE,
  ROAD_WIDTH,
  TRAIL_WIDTH,
  RAILROAD_WIDTH,
  ROAD_Y_OFFSET,
  ROAD_COLOR,
  TRAIL_COLOR,
  RAILROAD_COLOR,
  RAIL_COLOR,
  FENCE_POST_SPACING,
  FENCE_POST_HEIGHT,
  FENCE_POST_RADIUS,
  REGION_BIOME_MAP,
  resolveBiome,
} from './WorldConfig';
