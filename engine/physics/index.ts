// engine/physics — Barrel export for the raycasting physics layer.

export type {
  BoxCollider,
  CapsuleCollider,
  Collider,
  ColliderType,
  HeightfieldCollider,
  SolidCollider,
  SphereCollider,
  TriggerCollider,
  TrimeshCollider,
} from "./CollisionShapes.ts";
export {
  buildHeightfieldMesh,
  createBoxCollider,
  createCapsuleCollider,
  createHeightfieldCollider,
  createNpcCapsule,
  createProjectileSphere,
  createTerrainCollider,
  createTriggerVolume,
  extractBuildingColliders,
  resetColliderIds,
} from "./CollisionShapes.ts";
export type {
  MoveResult,
  RaycastHit,
  RaycastMiss,
  RaycastResult,
  TriggerEvent,
  TriggerOverlapInfo,
} from "./PhysicsWorld.ts";
export { PhysicsWorld } from "./PhysicsWorld.ts";
export type { PlayerState, TriggerCallback } from "./PlayerController.ts";
export { PlayerController } from "./PlayerController.ts";
