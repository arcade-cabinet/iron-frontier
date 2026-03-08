// engine/spatial — Open world spatial management system.
//
// Barrel export for chunk loading, town placement, route rendering,
// and the central world manager.

export { ChunkManager } from './ChunkManager';
export type { ChunkManagerConfig, ChunkState } from './ChunkManager';

export { buildAllRoutes, buildRoute } from './RouteRenderer';
export type { RouteEndpoints, RouteSegment } from './RouteRenderer';

export { placeTown } from './TownPlacer';
export type {
  BuildingPlacement,
  NPCPlacement,
  PropPlacement,
  TownPlacement,
} from './TownPlacer';

export {
  TOWN_BOUNDARY_RADIUS,
  WORLD_CELL_SIZE,
  WorldManager,
  worldCoordToPosition,
} from './WorldManager';
export type {
  TownInfo,
  WorldEntity,
  WorldEvent,
  WorldEventListener,
} from './WorldManager';
