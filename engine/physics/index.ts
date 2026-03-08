// engine/physics — Barrel export for the raycasting physics layer.

export { PhysicsWorld } from './PhysicsWorld';
export type {
  RaycastHit,
  RaycastMiss,
  RaycastResult,
  MoveResult,
  TriggerEvent,
  TriggerOverlapInfo,
} from './PhysicsWorld';

export { PlayerController } from './PlayerController';
export type { PlayerState, TriggerCallback } from './PlayerController';

export {
  createBoxCollider,
  createCapsuleCollider,
  createNpcCapsule,
  createProjectileSphere,
  createHeightfieldCollider,
  createTerrainCollider,
  createTriggerVolume,
  extractBuildingColliders,
  buildHeightfieldMesh,
  resetColliderIds,
} from './CollisionShapes';
export type {
  BoxCollider,
  CapsuleCollider,
  SphereCollider,
  HeightfieldCollider,
  TrimeshCollider,
  TriggerCollider,
  Collider,
  SolidCollider,
  ColliderType,
} from './CollisionShapes';
