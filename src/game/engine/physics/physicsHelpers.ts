// physicsHelpers — Free functions for AABB push-out and ray-vs-box intersection.

import * as THREE from 'three';

import type { BoxCollider } from './CollisionShapes';
import type { RaycastHit } from './physicsTypes';

export const SKIN_WIDTH = 0.05;

const _pushDir = new THREE.Vector3();

/** Minimum translation vector to separate two AABBs. */
export function computeBoxPushOut(
  playerBox: THREE.Box3,
  staticBox: THREE.Box3,
): THREE.Vector3 | null {
  const ox1 = playerBox.max.x - staticBox.min.x;
  const ox2 = staticBox.max.x - playerBox.min.x;
  const oy1 = playerBox.max.y - staticBox.min.y;
  const oy2 = staticBox.max.y - playerBox.min.y;
  const oz1 = playerBox.max.z - staticBox.min.z;
  const oz2 = staticBox.max.z - playerBox.min.z;

  if (ox1 <= 0 || ox2 <= 0 || oy1 <= 0 || oy2 <= 0 || oz1 <= 0 || oz2 <= 0) return null;

  let min = ox1;
  _pushDir.set(-1, 0, 0);
  if (ox2 < min) { min = ox2; _pushDir.set(1, 0, 0); }
  if (oy1 < min) { min = oy1; _pushDir.set(0, -1, 0); }
  if (oy2 < min) { min = oy2; _pushDir.set(0, 1, 0); }
  if (oz1 < min) { min = oz1; _pushDir.set(0, 0, -1); }
  if (oz2 < min) { min = oz2; _pushDir.set(0, 0, 1); }

  return _pushDir.clone().multiplyScalar(min + SKIN_WIDTH);
}

/** Slab-method ray vs AABB intersection. */
export function raycastBox(
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
