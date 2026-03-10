// colliderFactories — Factory functions that produce lightweight collider descriptors.

import * as THREE from "three";

import type {
  BoxCollider,
  CapsuleCollider,
  HeightfieldCollider,
  SphereCollider,
  TriggerCollider,
  TrimeshCollider,
} from "./colliderTypes.ts";

// ---------------------------------------------------------------------------
// Collider ID counter
// ---------------------------------------------------------------------------

let nextColliderId = 0;

function generateId(prefix: string): string {
  nextColliderId += 1;
  return `${prefix}_${nextColliderId}`;
}

/** Reset the internal collider ID counter. Useful for deterministic tests. */
export function resetColliderIds(): void {
  nextColliderId = 0;
}

// ---------------------------------------------------------------------------
// Scratch objects
// ---------------------------------------------------------------------------

const _box3 = new THREE.Box3();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

export function createBoxCollider(
  width: number,
  height: number,
  depth: number,
  position: THREE.Vector3,
  tag?: string,
): BoxCollider {
  const halfExtents = new THREE.Vector3(width / 2, height / 2, depth / 2);
  const center = position.clone();
  center.y += height / 2;
  const box = new THREE.Box3().setFromCenterAndSize(
    center,
    new THREE.Vector3(width, height, depth),
  );
  return { type: "box", id: generateId("box"), box, center, halfExtents, isTrigger: false, tag };
}

export function createCapsuleCollider(
  radius: number,
  height: number,
  position: THREE.Vector3,
  tag?: string,
): CapsuleCollider {
  const center = position.clone();
  center.y += height / 2;
  return {
    type: "capsule",
    id: generateId("capsule"),
    radius,
    height,
    center,
    isTrigger: false,
    tag,
  };
}

export function createNpcCapsule(
  radius: number,
  height: number,
  position: THREE.Vector3,
  tag?: string,
): CapsuleCollider {
  const center = position.clone();
  center.y += height / 2;
  return {
    type: "capsule",
    id: generateId("npc"),
    radius,
    height,
    center,
    isTrigger: false,
    tag,
  };
}

export function createProjectileSphere(
  radius: number,
  position: THREE.Vector3,
  tag?: string,
): SphereCollider {
  return {
    type: "sphere",
    id: generateId("projectile"),
    radius,
    center: position.clone(),
    isTrigger: false,
    tag,
  };
}

export function createHeightfieldCollider(
  xSegments: number,
  zSegments: number,
  width: number,
  depth: number,
  heights: Float32Array,
  origin: THREE.Vector3,
  tag?: string,
): HeightfieldCollider {
  if (heights.length !== xSegments * zSegments) {
    throw new Error(
      `Height data length (${heights.length}) must equal xSegments * zSegments (${xSegments * zSegments})`,
    );
  }
  return {
    type: "heightfield",
    id: generateId("terrain"),
    xSegments,
    zSegments,
    width,
    depth,
    heights,
    origin: origin.clone(),
    isTrigger: false,
    tag,
    mesh: null,
  };
}

export function createTerrainCollider(heightmapMesh: THREE.Mesh, tag?: string): TrimeshCollider {
  heightmapMesh.updateMatrixWorld(true);
  return {
    type: "trimesh",
    id: generateId("terrain"),
    mesh: heightmapMesh,
    isTrigger: false,
    tag,
  };
}

export function createTriggerVolume(
  width: number,
  height: number,
  depth: number,
  position: THREE.Vector3,
  tag: string,
): TriggerCollider {
  const center = position.clone();
  center.y += height / 2;
  const halfExtents = new THREE.Vector3(width / 2, height / 2, depth / 2);
  const box = new THREE.Box3().setFromCenterAndSize(
    center,
    new THREE.Vector3(width, height, depth),
  );
  return {
    type: "trigger",
    id: generateId("trigger"),
    box,
    center,
    halfExtents,
    isTrigger: true,
    tag,
  };
}

export function extractBuildingColliders(
  buildingGroup: THREE.Group,
  singleBox = false,
  tag?: string,
): BoxCollider[] {
  const colliders: BoxCollider[] = [];

  if (singleBox) {
    _box3.setFromObject(buildingGroup);
    _box3.getSize(_size);
    _box3.getCenter(_center);
    colliders.push({
      type: "box",
      id: generateId("building"),
      box: _box3.clone(),
      center: _center.clone(),
      halfExtents: _size.clone().multiplyScalar(0.5),
      isTrigger: false,
      tag,
    });
    return colliders;
  }

  buildingGroup.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    _box3.setFromObject(child);
    if (_box3.isEmpty()) return;

    _box3.getSize(_size);
    _box3.getCenter(_center);

    colliders.push({
      type: "box",
      id: generateId("building"),
      box: _box3.clone(),
      center: _center.clone(),
      halfExtents: _size.clone().multiplyScalar(0.5),
      isTrigger: false,
      tag,
    });
  });

  return colliders;
}
