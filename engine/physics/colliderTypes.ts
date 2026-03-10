// colliderTypes — Type definitions for all collision shape descriptors.

import type * as THREE from "three";

export type ColliderType = "box" | "capsule" | "sphere" | "heightfield" | "trimesh" | "trigger";

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
  readonly center: THREE.Vector3;
}

export interface SphereCollider extends ColliderBase {
  readonly type: "sphere";
  readonly radius: number;
  readonly center: THREE.Vector3;
}

export interface HeightfieldCollider extends ColliderBase {
  readonly type: "heightfield";
  readonly xSegments: number;
  readonly zSegments: number;
  readonly width: number;
  readonly depth: number;
  readonly heights: Float32Array;
  readonly origin: THREE.Vector3;
  mesh: THREE.Mesh | null;
}

export interface TrimeshCollider extends ColliderBase {
  readonly type: "trimesh";
  readonly mesh: THREE.Mesh;
}

export interface TriggerCollider extends ColliderBase {
  readonly type: "trigger";
  readonly isTrigger: true;
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
