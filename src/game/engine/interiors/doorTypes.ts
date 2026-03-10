// doorTypes — Types and constants for the DoorSystem.

import type * as THREE from 'three';

/** State of a single building door. */
export interface DoorState {
  /** Unique building instance ID. */
  buildingId: string;
  /** Archetype type key. */
  archetypeId: string;
  /** Human-readable building name. */
  buildingName: string;
  /** Whether the door is currently open. */
  isOpen: boolean;
  /** Current door rotation angle in radians (0 = closed, PI/2 = open). */
  currentAngle: number;
  /** Target angle (0 or PI/2). */
  targetAngle: number;
  /** World position of the door trigger zone. */
  triggerPosition: THREE.Vector3;
  /** The door mesh to animate (if found). */
  doorMesh: THREE.Object3D | null;
  /** The pivot point for rotation. */
  pivotPoint: THREE.Vector3;
}

/** Callback when a door state changes. */
export type DoorChangeCallback = (doorState: DoorState) => void;

/** Duration of door open/close animation in seconds. */
export const DOOR_ANIM_DURATION = 0.3;

/** Maximum door rotation angle in radians (90 degrees). */
export const DOOR_OPEN_ANGLE = Math.PI / 2;

/** Size of the door trigger zone box. */
export const TRIGGER_WIDTH = 2.0;
export const TRIGGER_HEIGHT = 2.5;
export const TRIGGER_DEPTH = 1.5;
