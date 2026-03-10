// playerMovement — Core movement constants, helpers, and scratch vectors
// for the PlayerController.

import * as THREE from "three";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const WALK_SPEED = 5;
export const SPRINT_SPEED = 9;
export const CROUCH_SPEED = 2.5;
export const JUMP_VELOCITY = 8;
export const PLAYER_HEIGHT = 1.7;
export const PLAYER_RADIUS = 0.3;
export const EYE_OFFSET = 1.6;
export const PITCH_LIMIT = (85 * Math.PI) / 180;
export const STEP_UP_THRESHOLD = 0.3;
export const BOB_FREQUENCY = 10;
export const BOB_AMPLITUDE = 0.04;
export const COYOTE_TIME = 0.1;

// ---------------------------------------------------------------------------
// Scratch vectors (reused every frame to avoid GC pressure)
// ---------------------------------------------------------------------------

export const _forward = new THREE.Vector3();
export const _right = new THREE.Vector3();
export const _wishDir = new THREE.Vector3();
export const _yAxis = new THREE.Vector3(0, 1, 0);
export const _xAxis = new THREE.Vector3(1, 0, 0);
export const _yawQuat = new THREE.Quaternion();
export const _testPos = new THREE.Vector3();
export const _scratchQuat1 = new THREE.Quaternion();
export const _scratchQuat2 = new THREE.Quaternion();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Check if the player is horizontally blocked at a given position. */
export function isHorizontallyBlocked(
  resolvedPos: THREE.Vector3,
  currentPos: THREE.Vector3,
  velocity: THREE.Vector3,
): boolean {
  const desiredDx = velocity.x * 0.016;
  const desiredDz = velocity.z * 0.016;
  const desiredSq = desiredDx * desiredDx + desiredDz * desiredDz;
  if (desiredSq < 0.0001) return false;

  const actualDx = resolvedPos.x - currentPos.x;
  const actualDz = resolvedPos.z - currentPos.z;
  const actualSq = actualDx * actualDx + actualDz * actualDz;

  return actualSq < desiredSq * 0.3;
}
