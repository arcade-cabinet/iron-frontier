import type { AABB, Circle } from '../SpatialHash';

export type CollisionLayer = 'terrain' | 'building' | 'npc' | 'trigger';

export type ColliderShape = AABB | Circle;

export function isCircle(shape: ColliderShape): shape is Circle {
  return 'center' in shape && 'radius' in shape;
}

export function isAABB(shape: ColliderShape): shape is AABB {
  return 'min' in shape && 'max' in shape;
}

export interface Collider {
  id: string;
  layer: CollisionLayer;
  bounds: ColliderShape;
  enabled?: boolean;
  isTrigger?: boolean;
  data?: unknown;
}

export interface CollisionResult {
  collided: boolean;
  normal?: { x: number; z: number };
  collider?: Collider;
  penetration?: number;
  correctedPosition?: { x: number; z: number };
}

export interface MovementCollisionResult {
  blocked: boolean;
  correctedPosition?: { x: number; z: number };
  hitColliders: Collider[];
}

export type TriggerCallback = (collider: Collider) => void;
