// PhysicsWorld — Raycasting-based physics abstraction with trigger support.
//
// Maintains a registry of static colliders (buildings, terrain, triggers) and
// provides collision queries: movePlayer (with slide response and step-up),
// raycast (weapons, interact), ground-height sampling, and trigger overlap
// tests. No rigid-body engine required.

import * as THREE from 'three';

import type {
  BoxCollider,
  Collider,
  HeightfieldCollider,
  SphereCollider,
  TriggerCollider,
  TrimeshCollider,
} from './CollisionShapes';
import { buildHeightfieldMesh } from './CollisionShapes';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface RaycastHit {
  hit: true;
  point: THREE.Vector3;
  normal: THREE.Vector3;
  distance: number;
  colliderId: string;
}

export interface RaycastMiss { hit: false }

export type RaycastResult = RaycastHit | RaycastMiss;

export interface MoveResult {
  position: THREE.Vector3;
  grounded: boolean;
}

export interface TriggerEvent {
  type: 'enter' | 'exit';
  colliderId: string;
  tag?: string;
}

export interface TriggerOverlapInfo {
  id: string;
  tag?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRAVITY = 20;
const STEP_HEIGHT = 0.3;
const SKIN_WIDTH = 0.05;
const MAX_SLIDE_ITERATIONS = 3;

// Scratch objects (reused to avoid per-frame allocation)
const _ray = new THREE.Raycaster();
const _downDir = new THREE.Vector3(0, -1, 0);
const _origin = new THREE.Vector3();
const _testPos = new THREE.Vector3();
const _slideNormal = new THREE.Vector3();
const _displacement = new THREE.Vector3();
const _playerBox = new THREE.Box3();
const _pushDir = new THREE.Vector3();

// ---------------------------------------------------------------------------
// PhysicsWorld
// ---------------------------------------------------------------------------

export class PhysicsWorld {
  private boxColliders: Map<string, BoxCollider> = new Map();
  private trimeshColliders: Map<string, TrimeshCollider> = new Map();
  private heightfieldColliders: Map<string, HeightfieldCollider> = new Map();
  private sphereColliders: Map<string, SphereCollider> = new Map();
  private triggerColliders: Map<string, TriggerCollider> = new Map();

  // -----------------------------------------------------------------------
  // Collider registration
  // -----------------------------------------------------------------------

  addStaticCollider(collider: Collider): void {
    switch (collider.type) {
      case 'box':
        this.boxColliders.set(collider.id, collider);
        break;
      case 'trimesh':
        this.trimeshColliders.set(collider.id, collider);
        break;
      case 'heightfield':
        if (!collider.mesh) {
          collider.mesh = buildHeightfieldMesh(collider);
        }
        this.heightfieldColliders.set(collider.id, collider);
        break;
      case 'sphere':
        this.sphereColliders.set(collider.id, collider);
        break;
      case 'capsule': {
        // Capsule colliders (NPCs) approximated as box for static collision
        const halfW = collider.radius;
        const halfH = collider.height / 2;
        const center = collider.center.clone();
        const box = new THREE.Box3().setFromCenterAndSize(
          center,
          new THREE.Vector3(halfW * 2, halfH * 2, halfW * 2),
        );
        this.boxColliders.set(collider.id, {
          type: 'box',
          id: collider.id,
          box,
          center,
          halfExtents: new THREE.Vector3(halfW, halfH, halfW),
          isTrigger: false,
          tag: collider.tag,
        });
        break;
      }
      case 'trigger':
        this.triggerColliders.set(collider.id, collider);
        break;
    }
  }

  removeStaticCollider(id: string): void {
    this.boxColliders.delete(id);
    this.trimeshColliders.delete(id);
    this.heightfieldColliders.delete(id);
    this.sphereColliders.delete(id);
    this.triggerColliders.delete(id);
  }

  clearAll(): void {
    this.boxColliders.clear();
    this.trimeshColliders.clear();
    this.heightfieldColliders.clear();
    this.sphereColliders.clear();
    this.triggerColliders.clear();
  }

  get colliderCount(): number {
    return (
      this.boxColliders.size +
      this.trimeshColliders.size +
      this.heightfieldColliders.size +
      this.sphereColliders.size +
      this.triggerColliders.size
    );
  }

  // -----------------------------------------------------------------------
  // Player movement
  // -----------------------------------------------------------------------

  /**
   * Move a player capsule through the world, resolving collisions.
   *
   * @param position   Current player feet position.
   * @param velocity   Velocity vector (includes gravity contribution).
   * @param radius     Player capsule radius (horizontal).
   * @param height     Player capsule total height.
   * @param deltaTime  Frame delta in seconds.
   */
  movePlayer(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    radius: number,
    height: number,
    deltaTime: number,
  ): MoveResult {
    _displacement.copy(velocity).multiplyScalar(deltaTime);
    const newPos = position.clone().add(_displacement);

    // Slide against box colliders
    for (let iter = 0; iter < MAX_SLIDE_ITERATIONS; iter++) {
      const penetration = this.checkBoxPenetration(newPos, radius, height);
      if (!penetration) break;
      newPos.add(penetration);
      _slideNormal.copy(penetration).normalize();
      const dot = velocity.dot(_slideNormal);
      if (dot < 0) velocity.addScaledVector(_slideNormal, -dot);
    }

    // Step-up: if still blocked, try stepping up
    if (this.checkBoxPenetration(newPos, radius, height)) {
      _testPos.copy(newPos).setY(newPos.y + STEP_HEIGHT);
      if (!this.checkBoxPenetration(_testPos, radius, height)) {
        newPos.copy(_testPos);
      }
    }

    // Ground snap via terrain raycast (trimesh + heightfield)
    const groundHeight = this.sampleGroundHeight(newPos.x, newPos.z);
    let grounded = false;
    if (groundHeight !== null && newPos.y <= groundHeight + SKIN_WIDTH) {
      newPos.y = groundHeight;
      grounded = true;
      if (velocity.y < 0) velocity.y = 0;
    }

    return { position: newPos, grounded };
  }

  // -----------------------------------------------------------------------
  // Ground sampling
  // -----------------------------------------------------------------------

  /** Sample terrain height at world XZ. Returns null if no terrain found. */
  sampleGroundHeight(x: number, z: number): number | null {
    const hasTerrain =
      this.trimeshColliders.size > 0 || this.heightfieldColliders.size > 0;

    if (!hasTerrain) return 0;

    _origin.set(x, 200, z);
    _ray.set(_origin, _downDir);
    _ray.far = 400;
    _ray.near = 0;

    let closestY: number | null = null;

    // Trimesh terrain
    for (const collider of this.trimeshColliders.values()) {
      const hits = _ray.intersectObject(collider.mesh, false);
      if (hits.length > 0) {
        const y = hits[0].point.y;
        if (closestY === null || y > closestY) closestY = y;
      }
    }

    // Heightfield terrain
    for (const collider of this.heightfieldColliders.values()) {
      if (!collider.mesh) continue;
      const hits = _ray.intersectObject(collider.mesh, false);
      if (hits.length > 0) {
        const y = hits[0].point.y;
        if (closestY === null || y > closestY) closestY = y;
      }
    }

    return closestY;
  }

  // -----------------------------------------------------------------------
  // Raycasting
  // -----------------------------------------------------------------------

  /** Cast a ray and return the first intersection with any collider. */
  raycast(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number,
  ): RaycastResult {
    _ray.set(origin, direction.clone().normalize());
    _ray.far = maxDistance;
    _ray.near = 0;

    let best: RaycastHit | null = null;

    // Trimesh (terrain)
    for (const collider of this.trimeshColliders.values()) {
      const hits = _ray.intersectObject(collider.mesh, false);
      if (hits.length > 0 && hits[0].distance <= maxDistance) {
        const h = hits[0];
        if (!best || h.distance < best.distance) {
          best = {
            hit: true,
            point: h.point.clone(),
            normal: h.face?.normal.clone() ?? new THREE.Vector3(0, 1, 0),
            distance: h.distance,
            colliderId: collider.id,
          };
        }
      }
    }

    // Heightfield (terrain)
    for (const collider of this.heightfieldColliders.values()) {
      if (!collider.mesh) continue;
      const hits = _ray.intersectObject(collider.mesh, false);
      if (hits.length > 0 && hits[0].distance <= maxDistance) {
        const h = hits[0];
        if (!best || h.distance < best.distance) {
          best = {
            hit: true,
            point: h.point.clone(),
            normal: h.face?.normal.clone() ?? new THREE.Vector3(0, 1, 0),
            distance: h.distance,
            colliderId: collider.id,
          };
        }
      }
    }

    // Box (buildings)
    for (const collider of this.boxColliders.values()) {
      const h = raycastBox(origin, direction, maxDistance, collider);
      if (h && (!best || h.distance < best.distance)) best = h;
    }

    return best ?? { hit: false };
  }

  // -----------------------------------------------------------------------
  // Trigger queries
  // -----------------------------------------------------------------------

  /**
   * Query which trigger volumes overlap a player-shaped AABB.
   */
  queryTriggerOverlaps(
    feetPos: THREE.Vector3,
    radius: number,
    height: number,
  ): TriggerOverlapInfo[] {
    if (this.triggerColliders.size === 0) return [];

    _playerBox.min.set(feetPos.x - radius, feetPos.y, feetPos.z - radius);
    _playerBox.max.set(feetPos.x + radius, feetPos.y + height, feetPos.z + radius);

    const overlaps: TriggerOverlapInfo[] = [];
    for (const trigger of this.triggerColliders.values()) {
      if (_playerBox.intersectsBox(trigger.box)) {
        overlaps.push({ id: trigger.id, tag: trigger.tag });
      }
    }
    return overlaps;
  }

  // -----------------------------------------------------------------------
  // Gravity
  // -----------------------------------------------------------------------

  /** Apply gravity to a velocity vector. Call once per frame before movePlayer. */
  applyGravity(velocity: THREE.Vector3, deltaTime: number, grounded: boolean): void {
    if (!grounded) velocity.y -= GRAVITY * deltaTime;
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  /** Check player AABB against all box colliders. Returns push-out vector or null. */
  private checkBoxPenetration(
    feetPos: THREE.Vector3,
    radius: number,
    height: number,
  ): THREE.Vector3 | null {
    _playerBox.min.set(feetPos.x - radius, feetPos.y, feetPos.z - radius);
    _playerBox.max.set(feetPos.x + radius, feetPos.y + height, feetPos.z + radius);

    let deepestOverlap = 0;
    let result: THREE.Vector3 | null = null;

    for (const collider of this.boxColliders.values()) {
      if (!_playerBox.intersectsBox(collider.box)) continue;
      const push = computeBoxPushOut(_playerBox, collider.box);
      if (!push) continue;
      const overlap = push.length();
      if (overlap > deepestOverlap) {
        deepestOverlap = overlap;
        result = push;
      }
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// Free functions (kept out of class to reduce method count)
// ---------------------------------------------------------------------------

/** Minimum translation vector to separate two AABBs. */
function computeBoxPushOut(playerBox: THREE.Box3, staticBox: THREE.Box3): THREE.Vector3 | null {
  const ox1 = playerBox.max.x - staticBox.min.x;
  const ox2 = staticBox.max.x - playerBox.min.x;
  const oy1 = playerBox.max.y - staticBox.min.y;
  const oy2 = staticBox.max.y - playerBox.min.y;
  const oz1 = playerBox.max.z - staticBox.min.z;
  const oz2 = staticBox.max.z - playerBox.min.z;

  if (ox1 <= 0 || ox2 <= 0 || oy1 <= 0 || oy2 <= 0 || oz1 <= 0 || oz2 <= 0) return null;

  let min = ox1; _pushDir.set(-1, 0, 0);
  if (ox2 < min) { min = ox2; _pushDir.set(1, 0, 0); }
  if (oy1 < min) { min = oy1; _pushDir.set(0, -1, 0); }
  if (oy2 < min) { min = oy2; _pushDir.set(0, 1, 0); }
  if (oz1 < min) { min = oz1; _pushDir.set(0, 0, -1); }
  if (oz2 < min) { min = oz2; _pushDir.set(0, 0, 1); }

  return _pushDir.clone().multiplyScalar(min + SKIN_WIDTH);
}

/** Slab-method ray vs AABB intersection. */
function raycastBox(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  maxDist: number,
  collider: BoxCollider,
): RaycastHit | null {
  const ix = direction.x !== 0 ? 1 / direction.x : 1e10;
  const iy = direction.y !== 0 ? 1 / direction.y : 1e10;
  const iz = direction.z !== 0 ? 1 / direction.z : 1e10;

  const t1 = (collider.box.min.x - origin.x) * ix;
  const t2 = (collider.box.max.x - origin.x) * ix;
  const t3 = (collider.box.min.y - origin.y) * iy;
  const t4 = (collider.box.max.y - origin.y) * iy;
  const t5 = (collider.box.min.z - origin.z) * iz;
  const t6 = (collider.box.max.z - origin.z) * iz;

  const tMin = Math.max(Math.min(t1, t2), Math.min(t3, t4), Math.min(t5, t6));
  const tMax = Math.min(Math.max(t1, t2), Math.max(t3, t4), Math.max(t5, t6));

  if (tMax < 0 || tMin > tMax || tMin > maxDist) return null;
  const t = tMin >= 0 ? tMin : tMax;
  if (t > maxDist) return null;

  const point = origin.clone().addScaledVector(direction, t);
  const normal = new THREE.Vector3();
  const eps = 0.001;
  if (Math.abs(point.x - collider.box.min.x) < eps) normal.set(-1, 0, 0);
  else if (Math.abs(point.x - collider.box.max.x) < eps) normal.set(1, 0, 0);
  else if (Math.abs(point.y - collider.box.min.y) < eps) normal.set(0, -1, 0);
  else if (Math.abs(point.y - collider.box.max.y) < eps) normal.set(0, 1, 0);
  else if (Math.abs(point.z - collider.box.min.z) < eps) normal.set(0, 0, -1);
  else normal.set(0, 0, 1);

  return { hit: true, point, normal, distance: t, colliderId: collider.id };
}
