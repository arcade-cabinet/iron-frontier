// CollisionShapes — Barrel re-export preserving the original import path.

export type {
  ColliderType,
  BoxCollider,
  CapsuleCollider,
  SphereCollider,
  HeightfieldCollider,
  TrimeshCollider,
  TriggerCollider,
  Collider,
  SolidCollider,
} from './colliderTypes';

export {
  resetColliderIds,
  createBoxCollider,
  extractBuildingColliders,
  createNpcCapsule,
  createCapsuleCollider,
  createProjectileSphere,
  createHeightfieldCollider,
  createTerrainCollider,
  createTriggerVolume,
} from './colliderFactories';

export { buildHeightfieldMesh } from './heightfieldMesh';
