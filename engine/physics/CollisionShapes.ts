// CollisionShapes — Collision geometry helpers for the raycasting physics layer.
//
// Provides factory functions that produce lightweight collider descriptors
// from Three.js scene objects. These descriptors are consumed by PhysicsWorld
// for collision detection without dragging in a full rigid-body engine.
//
// Supported shapes:
//   - Box        — building footprints, walls, crates
//   - Capsule    — NPCs, player (via PlayerController)
//   - Sphere     — projectiles, area-of-effect blasts
//   - Heightfield — terrain chunks from heightmap data
//   - Trimesh    — arbitrary terrain mesh geometry (fallback)
//   - Trigger    — non-blocking volumes for quest zones, town boundaries

import * as THREE from "three";

// ---------------------------------------------------------------------------
// Collider types
// ---------------------------------------------------------------------------

export type ColliderType = "box" | "capsule" | "sphere" | "heightfield" | "trimesh" | "trigger";

// ---------------------------------------------------------------------------
// Base collider fields
// ---------------------------------------------------------------------------

interface ColliderBase {
  readonly id: string;
  /** If true, the collider does not block movement — only fires overlap events. */
  readonly isTrigger: boolean;
  /** Optional user-data tag for identifying the collider in callbacks. */
  readonly tag?: string;
}

export interface BoxCollider extends ColliderBase {
  readonly type: "box";
  readonly box: THREE.Box3;
  readonly center: THREE.Vector3;
  readonly halfExtents: THREE.Vector3;
}

export interface CapsuleCollider extends ColliderBase {
  readonly type: "capsule";
  readonly radius: number;
  readonly height: number;
  /** Center of the capsule (midpoint between the two hemisphere centers). */
  readonly center: THREE.Vector3;
}

export interface SphereCollider extends ColliderBase {
  readonly type: "sphere";
  readonly radius: number;
  readonly center: THREE.Vector3;
}

export interface HeightfieldCollider extends ColliderBase {
  readonly type: "heightfield";
  /** Number of samples along X. */
  readonly xSegments: number;
  /** Number of samples along Z. */
  readonly zSegments: number;
  /** Total world-space width along X. */
  readonly width: number;
  /** Total world-space depth along Z. */
  readonly depth: number;
  /** Flat Float32Array of height values, row-major (Z outer, X inner). */
  readonly heights: Float32Array;
  /** World-space origin of the heightfield (min-X, base-Y, min-Z corner). */
  readonly origin: THREE.Vector3;
  /** The THREE.Mesh generated for raycasting (created lazily on first use). */
  mesh: THREE.Mesh | null;
}

export interface TrimeshCollider extends ColliderBase {
  readonly type: "trimesh";
  readonly mesh: THREE.Mesh;
}

export interface TriggerCollider extends ColliderBase {
  readonly type: "trigger";
  readonly isTrigger: true;
  /** Axis-aligned bounding box for the trigger volume. */
  readonly box: THREE.Box3;
  readonly center: THREE.Vector3;
  readonly halfExtents: THREE.Vector3;
}

export type Collider =
  | BoxCollider
  | CapsuleCollider
  | SphereCollider
  | HeightfieldCollider
  | TrimeshCollider
  | TriggerCollider;

/** Colliders that block movement (non-trigger). */
export type SolidCollider = Exclude<Collider, TriggerCollider>;

// ---------------------------------------------------------------------------
// Scratch objects (reused to avoid per-call allocation)
// ---------------------------------------------------------------------------

const _box3 = new THREE.Box3();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Collider ID counter
// ---------------------------------------------------------------------------

let nextColliderId = 0;

function generateId(prefix: string): string {
  nextColliderId += 1;
  return `${prefix}_${nextColliderId}`;
}

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Create a box collider from explicit dimensions and world position.
 *
 * Suitable for building footprints, walls, crates, etc.
 */
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

/**
 * Create a capsule collider from radius, total height, and world position.
 */
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

/**
 * Create a capsule collider specifically for an NPC character.
 */
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

/**
 * Create a sphere collider for a projectile or area-of-effect blast.
 */
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

/**
 * Create a heightfield collider from a grid of height samples.
 *
 * @param xSegments  Number of height samples along X (columns).
 * @param zSegments  Number of height samples along Z (rows).
 * @param width      World-space width of the heightfield.
 * @param depth      World-space depth of the heightfield.
 * @param heights    Row-major height data (length = xSegments * zSegments).
 * @param origin     World-space origin (min-X, base-Y, min-Z corner).
 */
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

/**
 * Create a trimesh collider from a terrain chunk mesh.
 *
 * The mesh is stored by reference so raycasting can use its geometry directly.
 * The mesh must have its matrixWorld up-to-date before being passed in.
 */
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

/**
 * Create a trigger volume for quest zones, town boundaries, etc.
 *
 * Triggers never block movement. They fire overlap callbacks when the
 * player (or another entity) enters/exits the volume.
 */
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

/**
 * Extract one or more box colliders from a building THREE.Group.
 *
 * Walks the group hierarchy and produces one AABB per child mesh.
 * For simple building archetypes a single bounding box around the
 * entire group is sufficient — pass `singleBox: true` to get that.
 */
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

/**
 * Build a THREE.Mesh from a HeightfieldCollider for raycasting.
 */
export function buildHeightfieldMesh(hf: HeightfieldCollider): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(hf.width, hf.depth, hf.xSegments - 1, hf.zSegments - 1);
  geometry.rotateX(-Math.PI / 2);

  const posAttr = geometry.getAttribute("position");
  for (let iz = 0; iz < hf.zSegments; iz++) {
    for (let ix = 0; ix < hf.xSegments; ix++) {
      const vertexIndex = iz * hf.xSegments + ix;
      if (vertexIndex < posAttr.count) {
        posAttr.setY(vertexIndex, hf.heights[vertexIndex]);
      }
    }
  }

  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const material = new THREE.MeshBasicMaterial({ visible: false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(hf.origin);
  mesh.position.x += hf.width / 2;
  mesh.position.z += hf.depth / 2;
  mesh.updateMatrixWorld(true);

  return mesh;
}

/**
 * Reset the internal collider ID counter. Useful for deterministic tests.
 */
export function resetColliderIds(): void {
  nextColliderId = 0;
}
