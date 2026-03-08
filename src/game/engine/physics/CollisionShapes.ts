// CollisionShapes — Factory functions for physics collider descriptions.
//
// Produces lightweight geometry descriptors consumed by PhysicsWorld for
// collision detection. Works with the raycasting fallback (THREE.js based)
// and can be extended for a full Rapier backend when available.
//
// Supported shapes:
//   - Box        — building footprints, walls, crates
//   - Capsule    — NPCs, player (via PlayerController)
//   - Sphere     — projectiles, area-of-effect blasts
//   - Heightfield — terrain chunks from heightmap data
//   - Trimesh    — arbitrary terrain mesh geometry (fallback)
//   - Trigger    — non-blocking volumes for quest zones, town boundaries

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Collider type discriminators
// ---------------------------------------------------------------------------

export type ColliderType = 'box' | 'capsule' | 'sphere' | 'heightfield' | 'trimesh' | 'trigger';

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

// ---------------------------------------------------------------------------
// Concrete collider shapes
// ---------------------------------------------------------------------------

export interface BoxCollider extends ColliderBase {
  readonly type: 'box';
  readonly box: THREE.Box3;
  readonly center: THREE.Vector3;
  readonly halfExtents: THREE.Vector3;
}

export interface CapsuleCollider extends ColliderBase {
  readonly type: 'capsule';
  readonly radius: number;
  /** Total height including the two hemisphere caps. */
  readonly height: number;
  /** Center of the capsule (midpoint between the two hemisphere centers). */
  readonly center: THREE.Vector3;
}

export interface SphereCollider extends ColliderBase {
  readonly type: 'sphere';
  readonly radius: number;
  readonly center: THREE.Vector3;
}

export interface HeightfieldCollider extends ColliderBase {
  readonly type: 'heightfield';
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
  readonly type: 'trimesh';
  readonly mesh: THREE.Mesh;
}

export interface TriggerCollider extends ColliderBase {
  readonly type: 'trigger';
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
// ID generation
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
// Factory: Box
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
  center.y += height / 2; // Position is at the base; center is offset up.
  const box = new THREE.Box3().setFromCenterAndSize(
    center,
    new THREE.Vector3(width, height, depth),
  );
  return { type: 'box', id: generateId('box'), box, center, halfExtents, isTrigger: false, tag };
}

// ---------------------------------------------------------------------------
// Factory: Building footprints
// ---------------------------------------------------------------------------

/**
 * Extract one or more box colliders from a building THREE.Group.
 *
 * Walks the group hierarchy and produces one AABB per child mesh.
 * For simple building archetypes a single bounding box around the
 * entire group is sufficient -- pass `singleBox: true` to get that.
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
      type: 'box',
      id: generateId('building'),
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
      type: 'box',
      id: generateId('building'),
      box: _box3.clone(),
      center: _center.clone(),
      halfExtents: _size.clone().multiplyScalar(0.5),
      isTrigger: false,
      tag,
    });
  });

  return colliders;
}

// ---------------------------------------------------------------------------
// Factory: Capsule (NPCs)
// ---------------------------------------------------------------------------

/**
 * Create a capsule collider for an NPC or character.
 *
 * @param radius  Horizontal radius.
 * @param height  Total height including hemispherical caps.
 * @param position World position of the capsule base (feet).
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
    type: 'capsule',
    id: generateId('npc'),
    radius,
    height,
    center,
    isTrigger: false,
    tag,
  };
}

/**
 * Alias: create any capsule collider (generic use).
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
    type: 'capsule',
    id: generateId('capsule'),
    radius,
    height,
    center,
    isTrigger: false,
    tag,
  };
}

// ---------------------------------------------------------------------------
// Factory: Sphere (projectiles)
// ---------------------------------------------------------------------------

/**
 * Create a sphere collider for a projectile or area-of-effect blast.
 */
export function createProjectileSphere(
  radius: number,
  position: THREE.Vector3,
  tag?: string,
): SphereCollider {
  return {
    type: 'sphere',
    id: generateId('projectile'),
    radius,
    center: position.clone(),
    isTrigger: false,
    tag,
  };
}

// ---------------------------------------------------------------------------
// Factory: Heightfield (terrain chunks)
// ---------------------------------------------------------------------------

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
    type: 'heightfield',
    id: generateId('terrain'),
    xSegments,
    zSegments,
    width,
    depth,
    heights,
    origin: origin.clone(),
    isTrigger: false,
    tag,
    mesh: null, // Built lazily by PhysicsWorld on first query
  };
}

// ---------------------------------------------------------------------------
// Factory: Trimesh (terrain mesh fallback)
// ---------------------------------------------------------------------------

/**
 * Create a trimesh collider from a terrain chunk mesh.
 *
 * The mesh is stored by reference so raycasting can use its geometry directly.
 * The mesh must have its matrixWorld up-to-date before being passed in.
 */
export function createTerrainCollider(heightmapMesh: THREE.Mesh, tag?: string): TrimeshCollider {
  heightmapMesh.updateMatrixWorld(true);
  return {
    type: 'trimesh',
    id: generateId('terrain'),
    mesh: heightmapMesh,
    isTrigger: false,
    tag,
  };
}

// ---------------------------------------------------------------------------
// Factory: Trigger volumes
// ---------------------------------------------------------------------------

/**
 * Create a trigger volume for quest zones, town boundaries, etc.
 *
 * Triggers never block movement. They fire overlap callbacks when the
 * player (or another entity) enters/exits the volume.
 *
 * @param width     Width along X.
 * @param height    Height along Y.
 * @param depth     Depth along Z.
 * @param position  World position of the trigger base center (ground level).
 * @param tag       Identifier for matching in callback handlers.
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
    type: 'trigger',
    id: generateId('trigger'),
    box,
    center,
    halfExtents,
    isTrigger: true,
    tag,
  };
}

// ---------------------------------------------------------------------------
// Heightfield mesh builder (used internally by PhysicsWorld)
// ---------------------------------------------------------------------------

/**
 * Build a THREE.Mesh from a HeightfieldCollider for raycasting.
 *
 * The resulting PlaneGeometry has its vertices displaced according to
 * the heightmap data and is positioned at the collider's world origin.
 */
export function buildHeightfieldMesh(hf: HeightfieldCollider): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(
    hf.width,
    hf.depth,
    hf.xSegments - 1,
    hf.zSegments - 1,
  );

  // PlaneGeometry is in XY by default; rotate so the plane lies in XZ.
  geometry.rotateX(-Math.PI / 2);

  const posAttr = geometry.getAttribute('position');
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

  // Position mesh so that vertex (0,0) maps to origin and the mesh spans width x depth.
  mesh.position.copy(hf.origin);
  mesh.position.x += hf.width / 2;
  mesh.position.z += hf.depth / 2;
  mesh.updateMatrixWorld(true);

  return mesh;
}
