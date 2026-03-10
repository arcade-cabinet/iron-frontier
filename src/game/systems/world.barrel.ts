/**
 * World Systems Barrel
 *
 * Re-exports world-related systems:
 * EncounterSystem, TravelManager, SaveSystem, SpatialHash, ZoneSystem,
 * CollisionSystem, TownBoundarySystem
 *
 * @module systems/world
 */

// Encounter System
export {
  EncounterSystem,
  getEncounterSystem,
  createRouteEncounterZones,
  type EncounterZone,
  type EncounterTrigger,
} from './EncounterSystem';

// Travel Manager
export {
  TravelManager,
  getTravelManager,
  dangerDescription,
  methodDescription,
  type TravelRoute,
  type EncounterCheckpoint,
  type TravelTickResult,
  type TravelManagerState,
} from './TravelManager';

// Save System
export {
  SaveSystem,
  getSaveSystem,
  LocalStorageSaveAdapter,
  type SaveFile,
  type SaveSlotMeta,
  type SaveStorageAdapter,
} from './SaveSystem';

// Spatial Hash (efficient spatial partitioning)
export {
  SpatialHash,
  aabbIntersects,
  aabbContainsPoint,
  circleToAABB,
  aabbCircleIntersects,
  circleIntersects,
  circleContainsPoint,
  aabbCenter,
  aabbExpand,
  aabbFromCenter,
  aabbFromRadius,
  type AABB,
  type Circle,
} from './SpatialHash';

// Zone System
export {
  ZoneSystem,
  getZoneSystem,
  resetZoneSystem,
  TOWN_POSITIONS,
  type Zone,
  type ZoneType,
  type ZoneTransition,
  type ZoneChangeCallback,
  type TransitionCallback,
} from './ZoneSystem';

// Collision System
export {
  CollisionSystem,
  getCollisionSystem,
  resetCollisionSystem,
  createBuildingCollider,
  createNPCCollider,
  createTriggerCollider,
  createTerrainCollider,
  isCircle,
  isAABB,
  type CollisionLayer,
  type Collider,
  type ColliderShape,
  type CollisionResult,
  type MovementCollisionResult,
  type TriggerCallback,
} from './CollisionSystem';

// Town Boundary System
export {
  TownBoundarySystem,
  getTownBoundarySystem,
  type TownTransitionKind,
  type TownTransition,
  type BoundaryState,
  type BoundaryEventCallback,
} from './TownBoundarySystem';
