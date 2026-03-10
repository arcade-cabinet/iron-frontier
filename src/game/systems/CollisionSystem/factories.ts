import type { AABB } from '../SpatialHash';
import type { Collider, ColliderShape } from './types';
import { CollisionSystem } from './CollisionSystem';

let collisionSystemInstance: CollisionSystem | null = null;

export function getCollisionSystem(): CollisionSystem {
  if (!collisionSystemInstance) {
    collisionSystemInstance = new CollisionSystem();
  }
  return collisionSystemInstance;
}

export function resetCollisionSystem(): void {
  if (collisionSystemInstance) {
    collisionSystemInstance.dispose();
    collisionSystemInstance = null;
  }
}

export function createBuildingCollider(
  id: string,
  bounds: AABB,
  data?: unknown
): Collider {
  return {
    id,
    layer: 'building',
    bounds,
    enabled: true,
    isTrigger: false,
    data,
  };
}

export function createNPCCollider(
  id: string,
  center: { x: number; z: number },
  radius: number,
  data?: unknown
): Collider {
  return {
    id,
    layer: 'npc',
    bounds: { center, radius },
    enabled: true,
    isTrigger: false,
    data,
  };
}

export function createTriggerCollider(
  id: string,
  bounds: ColliderShape,
  data?: unknown
): Collider {
  return {
    id,
    layer: 'trigger',
    bounds,
    enabled: true,
    isTrigger: true,
    data,
  };
}

export function createTerrainCollider(id: string, bounds: AABB): Collider {
  return {
    id,
    layer: 'terrain',
    bounds,
    enabled: true,
    isTrigger: false,
  };
}
