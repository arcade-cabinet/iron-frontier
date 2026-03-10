import {
  SpatialHash,
  type AABB,
  type Circle,
  aabbContainsPoint,
  aabbIntersects,
  aabbCircleIntersects,
  circleContainsPoint,
  circleIntersects,
  circleToAABB,
} from '../SpatialHash';
import type {
  Collider,
  ColliderShape,
  CollisionLayer,
  CollisionResult,
  TriggerCallback,
} from './types';
import { isCircle, isAABB } from './types';

export class CollisionSystem {
  private colliders: Map<string, Collider> = new Map();
  private spatialHash: SpatialHash<Collider>;
  private activeTriggers: Set<string> = new Set();
  private triggerEnterCallbacks: Set<TriggerCallback> = new Set();
  private triggerExitCallbacks: Set<TriggerCallback> = new Set();
  private defaultLayerMask: Set<CollisionLayer> = new Set(['terrain', 'building', 'npc']);

  constructor(cellSize: number = 50) {
    this.spatialHash = new SpatialHash<Collider>(cellSize);
    console.log('[CollisionSystem] Initialized');
  }

  addCollider(collider: Collider): void {
    if (!collider.id) {
      throw new Error('Collider must have an id');
    }
    collider.enabled = collider.enabled ?? true;
    collider.isTrigger = collider.isTrigger ?? false;
    if (this.colliders.has(collider.id)) {
      this.removeCollider(collider.id);
    }
    this.colliders.set(collider.id, collider);
    const aabb = this.getColliderAABB(collider);
    this.spatialHash.insert(collider, aabb);
  }

  removeCollider(id: string): void {
    const collider = this.colliders.get(id);
    if (collider) {
      this.spatialHash.remove(collider);
      this.colliders.delete(id);
      this.activeTriggers.delete(id);
    }
  }

  updateCollider(id: string, bounds: ColliderShape): void {
    const collider = this.colliders.get(id);
    if (collider) {
      collider.bounds = bounds;
      const aabb = this.getColliderAABB(collider);
      this.spatialHash.update(collider, aabb);
    }
  }

  setColliderEnabled(id: string, enabled: boolean): void {
    const collider = this.colliders.get(id);
    if (collider) {
      collider.enabled = enabled;
    }
  }

  getCollider(id: string): Collider | undefined {
    return this.colliders.get(id);
  }

  getAllColliders(): Collider[] {
    return Array.from(this.colliders.values());
  }

  private getColliderAABB(collider: Collider): AABB {
    if (isCircle(collider.bounds)) {
      return circleToAABB(collider.bounds);
    }
    return collider.bounds;
  }

  checkMovement(
    from: { x: number; z: number },
    to: { x: number; z: number },
    radius: number,
    layers?: CollisionLayer[]
  ): CollisionResult {
    const layerSet = layers ? new Set(layers) : this.defaultLayerMask;
    const sweptBounds: AABB = {
      min: {
        x: Math.min(from.x, to.x) - radius,
        z: Math.min(from.z, to.z) - radius,
      },
      max: {
        x: Math.max(from.x, to.x) + radius,
        z: Math.max(from.z, to.z) + radius,
      },
    };
    const candidates = this.spatialHash.query(sweptBounds);
    for (const collider of candidates) {
      if (!collider.enabled) continue;
      if (!layerSet.has(collider.layer)) continue;
      if (collider.isTrigger) continue;
      const playerCircle: Circle = { center: to, radius };
      if (this.checkShapeCollision(playerCircle, collider.bounds)) {
        const normal = this.calculateCollisionNormal(from, to, collider.bounds);
        const correctedPosition = this.calculateCorrectedPosition(from, to, collider.bounds, radius);
        return { collided: true, normal, collider, correctedPosition };
      }
    }
    return { collided: false };
  }

  private checkShapeCollision(a: ColliderShape, b: ColliderShape): boolean {
    if (isCircle(a) && isCircle(b)) return circleIntersects(a, b);
    if (isCircle(a) && isAABB(b)) return aabbCircleIntersects(b, a);
    if (isAABB(a) && isCircle(b)) return aabbCircleIntersects(a, b);
    if (isAABB(a) && isAABB(b)) return aabbIntersects(a, b);
    return false;
  }

  private getShapeCenter(shape: ColliderShape): { x: number; z: number } {
    if (isCircle(shape)) return shape.center;
    return {
      x: (shape.min.x + shape.max.x) / 2,
      z: (shape.min.z + shape.max.z) / 2,
    };
  }

  private calculateCollisionNormal(
    _from: { x: number; z: number },
    to: { x: number; z: number },
    collider: ColliderShape
  ): { x: number; z: number } {
    const c = this.getShapeCenter(collider);
    const dx = to.x - c.x;
    const dz = to.z - c.z;
    const length = Math.sqrt(dx * dx + dz * dz);
    if (length < 0.001) return { x: 1, z: 0 };
    return { x: dx / length, z: dz / length };
  }

  private calculateCorrectedPosition(
    from: { x: number; z: number },
    to: { x: number; z: number },
    collider: ColliderShape,
    _playerRadius: number
  ): { x: number; z: number } {
    const normal = this.calculateCollisionNormal(from, to, collider);
    const moveX = to.x - from.x;
    const moveZ = to.z - from.z;
    const dot = moveX * normal.x + moveZ * normal.z;
    if (dot < 0) {
      return {
        x: from.x + (moveX - normal.x * dot),
        z: from.z + (moveZ - normal.z * dot),
      };
    }
    return to;
  }

  queryNearby(
    pos: { x: number; z: number },
    radius: number,
    layers?: CollisionLayer[]
  ): Collider[] {
    const candidates = this.spatialHash.queryRadius(pos, radius);
    const layerSet = layers ? new Set(layers) : null;
    return candidates.filter((collider) => {
      if (!collider.enabled) return false;
      if (layerSet && !layerSet.has(collider.layer)) return false;
      return true;
    });
  }

  queryNearest(
    pos: { x: number; z: number },
    radius: number,
    layer: CollisionLayer
  ): Collider | null {
    const candidates = this.queryNearby(pos, radius, [layer]);
    if (candidates.length === 0) return null;
    let nearest: Collider | null = null;
    let nearestDistSq = Infinity;
    for (const collider of candidates) {
      const center = this.getShapeCenter(collider.bounds);
      const dx = pos.x - center.x;
      const dz = pos.z - center.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < nearestDistSq) {
        nearestDistSq = distSq;
        nearest = collider;
      }
    }
    return nearest;
  }

  queryPoint(pos: { x: number; z: number }, layers?: CollisionLayer[]): Collider[] {
    const candidates = this.spatialHash.queryPoint(pos);
    const layerSet = layers ? new Set(layers) : null;
    return candidates.filter((collider) => {
      if (!collider.enabled) return false;
      if (layerSet && !layerSet.has(collider.layer)) return false;
      if (isCircle(collider.bounds)) return circleContainsPoint(collider.bounds, pos);
      return aabbContainsPoint(collider.bounds, pos);
    });
  }

  updateTriggers(pos: { x: number; z: number }, radius: number): void {
    const currentTriggers = new Set<string>();
    const candidates = this.spatialHash.queryRadius(pos, radius);
    for (const collider of candidates) {
      if (!collider.enabled || !collider.isTrigger) continue;
      const playerCircle: Circle = { center: pos, radius };
      if (this.checkShapeCollision(playerCircle, collider.bounds)) {
        currentTriggers.add(collider.id);
      }
    }
    for (const id of currentTriggers) {
      if (!this.activeTriggers.has(id)) {
        const collider = this.colliders.get(id);
        if (collider) {
          for (const callback of this.triggerEnterCallbacks) callback(collider);
        }
      }
    }
    for (const id of this.activeTriggers) {
      if (!currentTriggers.has(id)) {
        const collider = this.colliders.get(id);
        if (collider) {
          for (const callback of this.triggerExitCallbacks) callback(collider);
        }
      }
    }
    this.activeTriggers = currentTriggers;
  }

  onTriggerEnter(callback: TriggerCallback): () => void {
    this.triggerEnterCallbacks.add(callback);
    return () => { this.triggerEnterCallbacks.delete(callback); };
  }

  onTriggerExit(callback: TriggerCallback): () => void {
    this.triggerExitCallbacks.add(callback);
    return () => { this.triggerExitCallbacks.delete(callback); };
  }

  createCollisionCallback(
    playerRadius: number,
    layers?: CollisionLayer[]
  ): (from: { x: number; z: number }, to: { x: number; z: number }) => {
    blocked: boolean;
    correctedPosition?: { x: number; z: number };
  } {
    return (from, to) => {
      const result = this.checkMovement(from, to, playerRadius, layers);
      return { blocked: result.collided, correctedPosition: result.correctedPosition };
    };
  }

  clear(): void {
    this.colliders.clear();
    this.spatialHash.clear();
    this.activeTriggers.clear();
    console.log('[CollisionSystem] Cleared');
  }

  dispose(): void {
    this.clear();
    this.triggerEnterCallbacks.clear();
    this.triggerExitCallbacks.clear();
    console.log('[CollisionSystem] Disposed');
  }

  getDebugInfo() {
    const collidersByLayer: Record<CollisionLayer, number> = { terrain: 0, building: 0, npc: 0, trigger: 0 };
    for (const c of this.colliders.values()) collidersByLayer[c.layer]++;
    return {
      colliderCount: this.colliders.size,
      activeTriggers: this.activeTriggers.size,
      collidersByLayer,
      spatialHashInfo: this.spatialHash.getDebugInfo(),
    };
  }
}
