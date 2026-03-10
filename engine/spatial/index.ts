// engine/spatial — Open world spatial management system.
//
// Barrel export for chunk loading, town placement, route rendering,
// and the central world manager.

export type { ChunkManagerConfig, ChunkState } from "./ChunkManager.ts";
export { ChunkManager } from "./ChunkManager.ts";
export type { RouteEndpoints, RouteSegment } from "./RouteRenderer.ts";
export { buildAllRoutes, buildRoute } from "./RouteRenderer.ts";
export type {
  BuildingPlacement,
  NPCPlacement,
  PropPlacement,
  TownPlacement,
} from "./TownPlacer.ts";
export { placeTown } from "./TownPlacer.ts";
export { WorldManager } from "./WorldManager.ts";
export type {
  TownInfo,
  WorldEntity,
  WorldEvent,
  WorldEventListener,
} from "./worldTypes.ts";
export {
  TOWN_BOUNDARY_RADIUS,
  WORLD_CELL_SIZE,
  worldCoordToPosition,
} from "./worldTypes.ts";
