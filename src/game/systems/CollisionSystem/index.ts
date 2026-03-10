export {
  type CollisionLayer,
  type ColliderShape,
  type Collider,
  type CollisionResult,
  type MovementCollisionResult,
  type TriggerCallback,
  isCircle,
  isAABB,
} from './types';

export { CollisionSystem } from './CollisionSystem';

export {
  getCollisionSystem,
  resetCollisionSystem,
  createBuildingCollider,
  createNPCCollider,
  createTriggerCollider,
  createTerrainCollider,
} from './factories';
