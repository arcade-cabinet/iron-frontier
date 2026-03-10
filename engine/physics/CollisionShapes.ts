// CollisionShapes — Barrel re-export preserving the original import path.

export {
  createBoxCollider,
  createCapsuleCollider,
  createHeightfieldCollider,
  createNpcCapsule,
  createProjectileSphere,
  createTerrainCollider,
  createTriggerVolume,
  extractBuildingColliders,
  resetColliderIds,
} from "./colliderFactories.ts";
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
} from "./colliderTypes.ts";

export { buildHeightfieldMesh } from "./heightfieldMesh.ts";
