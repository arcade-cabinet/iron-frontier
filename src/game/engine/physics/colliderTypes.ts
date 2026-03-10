// colliderTypes — Collider shape type definitions for the physics system.

import type * as THREE from 'three';

export type ColliderType = 'box' | 'capsule' | 'sphere' | 'heightfield' | 'trimesh' | 'trigger';

interface ColliderBase {
  readonly id: string;
  /** If true, the collider does not block movement — only fires overlap events. */
  readonly isTrigger: boolean;
  /** Optional user-data tag for identifying the collider in callbacks. */
  readonly tag?: string;
}

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
