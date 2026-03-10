// physicsTypes — Public types for the raycasting physics layer.

import type * as THREE from "three";

export interface RaycastHit {
  hit: true;
  point: THREE.Vector3;
  normal: THREE.Vector3;
  distance: number;
  colliderId: string;
}

export interface RaycastMiss {
  hit: false;
}

export type RaycastResult = RaycastHit | RaycastMiss;

export interface MoveResult {
  position: THREE.Vector3;
  grounded: boolean;
}

export interface TriggerEvent {
  type: "enter" | "exit";
  colliderId: string;
  tag?: string;
}

export interface TriggerOverlapInfo {
  id: string;
  tag?: string;
}
