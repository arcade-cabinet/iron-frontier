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

export type {
  RaycastHit,
  RaycastMiss,
  RaycastResult,
  MoveResult,
  TriggerEvent,
  TriggerOverlapInfo,
} from './physicsTypes';
import type { RaycastHit, RaycastResult, MoveResult, TriggerOverlapInfo } from './physicsTypes';

import { SKIN_WIDTH, computeBoxPushOut, raycastBox } from './physicsHelpers';

const GRAVITY = 20;
const STEP_HEIGHT = 0.3;
const MAX_SLIDE_ITERATIONS = 3;

// Scratch objects (reused to avoid per-frame allocation)
const _ray = new THREE.Raycaster();
const _downDir = new THREE.Vector3(0, -1, 0);
const _origin = new THREE.Vector3();
const _testPos = new THREE.Vector3();
const _slideNormal = new THREE.Vector3();
const _displacement = new THREE.Vector3();
const _playerBox = new THREE.Box3();

export class PhysicsWorld {
  private boxColliders: Map<string, BoxCollider> = new Map();
  private trimeshColliders: Map<string, TrimeshCollider> = new Map();
  private heightfieldColliders: Map<string, HeightfieldCollider> = new Map();
  private sphereColliders: Map<string, SphereCollider> = new Map();
  private triggerColliders: Map<string, TriggerCollider> = new Map();

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

  movePlayer(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    radius: number,
    height: number,
    deltaTime: number,
  ): MoveResult {
    _displacement.copy(velocity).multiplyScalar(deltaTime);
    const newPos = position.clone().add(_displacement);

    for (let iter = 0; iter < MAX_SLIDE_ITERATIONS; iter++) {
      const penetration = this.checkBoxPenetration(newPos, radius, height);
      if (!penetration) break;
      newPos.add(penetration);
      _slideNormal.copy(penetration).normalize();
      const dot = velocity.dot(_slideNormal);
      if (dot < 0) velocity.addScaledVector(_slideNormal, -dot);
    }

    if (this.checkBoxPenetration(newPos, radius, height)) {
      _testPos.copy(newPos).setY(newPos.y + STEP_HEIGHT);
      if (!this.checkBoxPenetration(_testPos, radius, height)) {
        newPos.copy(_testPos);
      }
    }

    const groundHeight = this.sampleGroundHeight(newPos.x, newPos.z);
    let grounded = false;
    if (groundHeight !== null && newPos.y <= groundHeight + SKIN_WIDTH) {
      newPos.y = groundHeight;
      grounded = true;
      if (velocity.y < 0) velocity.y = 0;
    }

    return { position: newPos, grounded };
  }

  sampleGroundHeight(x: number, z: number): number | null {
    const hasTerrain =
      this.trimeshColliders.size > 0 || this.heightfieldColliders.size > 0;

    if (!hasTerrain) return 0;

    _origin.set(x, 200, z);
    _ray.set(_origin, _downDir);
    _ray.far = 400;
    _ray.near = 0;

    let closestY: number | null = null;

    for (const collider of this.trimeshColliders.values()) {
      const hits = _ray.intersectObject(collider.mesh, false);
      if (hits.length > 0) {
        const y = hits[0].point.y;
        if (closestY === null || y > closestY) closestY = y;
      }
    }

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

  raycast(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number,
  ): RaycastResult {
    _ray.set(origin, direction.clone().normalize());
    _ray.far = maxDistance;
    _ray.near = 0;

    let best: RaycastHit | null = null;

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

    for (const collider of this.boxColliders.values()) {
      const h = raycastBox(origin, direction, maxDistance, collider);
      if (h && (!best || h.distance < best.distance)) best = h;
    }

    return best ?? { hit: false };
  }

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

  applyGravity(velocity: THREE.Vector3, deltaTime: number, grounded: boolean): void {
    if (!grounded) velocity.y -= GRAVITY * deltaTime;
  }

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
