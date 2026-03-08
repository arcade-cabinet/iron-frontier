/**
 * DoorSystem — Manages door trigger zones, door opening animation,
 * and seamless building entry/exit.
 *
 * Each building with an interior gets a door trigger zone (invisible box
 * collider) positioned at the door. When the player enters the trigger
 * zone, the InteractionDetector shows "[E] Enter [Building Name]".
 * On interaction, the door mesh rotates 90 degrees over 0.3s and the
 * player walks through seamlessly (no loading screen).
 *
 * The system uses the existing InteriorManager to track inside/outside
 * state and the PhysicsProvider trigger system for collision detection.
 *
 * @module engine/interiors/DoorSystem
 */

import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// CONSTANTS
// ============================================================================

/** Duration of door open/close animation in seconds. */
const DOOR_ANIM_DURATION = 0.3;

/** Maximum door rotation angle in radians (90 degrees). */
const DOOR_OPEN_ANGLE = Math.PI / 2;

/** Size of the door trigger zone box. */
const TRIGGER_WIDTH = 2.0;
const TRIGGER_HEIGHT = 2.5;
const TRIGGER_DEPTH = 1.5;

// ============================================================================
// DOOR SYSTEM CLASS
// ============================================================================

export class DoorSystem {
  private static instance: DoorSystem | null = null;

  private doors = new Map<string, DoorState>();
  private listeners = new Set<DoorChangeCallback>();
  private animatingDoors = new Set<string>();

  private constructor() {}

  static getInstance(): DoorSystem {
    if (!DoorSystem.instance) {
      DoorSystem.instance = new DoorSystem();
    }
    return DoorSystem.instance;
  }

  static resetInstance(): void {
    if (DoorSystem.instance) {
      DoorSystem.instance.dispose();
      DoorSystem.instance = null;
    }
  }

  // --------------------------------------------------------------------------
  // Registration
  // --------------------------------------------------------------------------

  /**
   * Register a building door for tracking.
   */
  registerDoor(
    buildingId: string,
    archetypeId: string,
    buildingName: string,
    triggerPosition: THREE.Vector3,
    doorMesh?: THREE.Object3D,
  ): void {
    if (this.doors.has(buildingId)) return;

    this.doors.set(buildingId, {
      buildingId,
      archetypeId,
      buildingName,
      isOpen: false,
      currentAngle: 0,
      targetAngle: 0,
      triggerPosition: triggerPosition.clone(),
      doorMesh: doorMesh ?? null,
      pivotPoint: new THREE.Vector3(
        triggerPosition.x - TRIGGER_WIDTH / 4,
        triggerPosition.y,
        triggerPosition.z,
      ),
    });
  }

  /**
   * Unregister a building door.
   */
  unregisterDoor(buildingId: string): void {
    this.doors.delete(buildingId);
    this.animatingDoors.delete(buildingId);
  }

  // --------------------------------------------------------------------------
  // Door operations
  // --------------------------------------------------------------------------

  /**
   * Open a door (trigger animation).
   */
  openDoor(buildingId: string): void {
    const door = this.doors.get(buildingId);
    if (!door || door.isOpen) return;

    door.isOpen = true;
    door.targetAngle = DOOR_OPEN_ANGLE;
    this.animatingDoors.add(buildingId);
    this.notifyListeners(door);
  }

  /**
   * Close a door (trigger animation).
   */
  closeDoor(buildingId: string): void {
    const door = this.doors.get(buildingId);
    if (!door || !door.isOpen) return;

    door.isOpen = false;
    door.targetAngle = 0;
    this.animatingDoors.add(buildingId);
    this.notifyListeners(door);
  }

  /**
   * Toggle a door open/closed.
   */
  toggleDoor(buildingId: string): void {
    const door = this.doors.get(buildingId);
    if (!door) return;

    if (door.isOpen) {
      this.closeDoor(buildingId);
    } else {
      this.openDoor(buildingId);
    }
  }

  // --------------------------------------------------------------------------
  // Per-frame update
  // --------------------------------------------------------------------------

  /**
   * Update door animations. Call once per frame with delta time.
   */
  update(dt: number): void {
    const speed = DOOR_OPEN_ANGLE / DOOR_ANIM_DURATION;
    const completed: string[] = [];

    for (const buildingId of this.animatingDoors) {
      const door = this.doors.get(buildingId);
      if (!door) {
        completed.push(buildingId);
        continue;
      }

      // Animate toward target
      if (door.currentAngle < door.targetAngle) {
        door.currentAngle = Math.min(
          door.currentAngle + speed * dt,
          door.targetAngle,
        );
      } else if (door.currentAngle > door.targetAngle) {
        door.currentAngle = Math.max(
          door.currentAngle - speed * dt,
          door.targetAngle,
        );
      }

      // Apply rotation to door mesh
      if (door.doorMesh) {
        door.doorMesh.rotation.y = door.currentAngle;
      }

      // Check if animation completed
      if (Math.abs(door.currentAngle - door.targetAngle) < 0.01) {
        door.currentAngle = door.targetAngle;
        completed.push(buildingId);
      }
    }

    for (const id of completed) {
      this.animatingDoors.delete(id);
    }
  }

  // --------------------------------------------------------------------------
  // Queries
  // --------------------------------------------------------------------------

  /** Get all registered doors. */
  getAllDoors(): readonly DoorState[] {
    return Array.from(this.doors.values());
  }

  /** Get a specific door state. */
  getDoor(buildingId: string): DoorState | null {
    return this.doors.get(buildingId) ?? null;
  }

  /** Get trigger zone dimensions for a door. */
  getTriggerDimensions(): { width: number; height: number; depth: number } {
    return {
      width: TRIGGER_WIDTH,
      height: TRIGGER_HEIGHT,
      depth: TRIGGER_DEPTH,
    };
  }

  /**
   * Check if a world position is within any door trigger zone.
   * Returns the building ID if inside a trigger, null otherwise.
   */
  checkTriggerAt(worldPos: THREE.Vector3): string | null {
    for (const [buildingId, door] of this.doors) {
      const dx = Math.abs(worldPos.x - door.triggerPosition.x);
      const dy = Math.abs(worldPos.y - door.triggerPosition.y);
      const dz = Math.abs(worldPos.z - door.triggerPosition.z);

      if (
        dx < TRIGGER_WIDTH / 2 &&
        dy < TRIGGER_HEIGHT / 2 &&
        dz < TRIGGER_DEPTH / 2
      ) {
        return buildingId;
      }
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // Listeners
  // --------------------------------------------------------------------------

  /** Subscribe to door state changes. */
  onChange(callback: DoorChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(door: DoorState): void {
    for (const cb of this.listeners) {
      cb(door);
    }
  }

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  dispose(): void {
    this.doors.clear();
    this.animatingDoors.clear();
    this.listeners.clear();
  }
}

// ============================================================================
// SINGLETON ACCESSORS
// ============================================================================

/** Get the shared DoorSystem instance. */
export function getDoorSystem(): DoorSystem {
  return DoorSystem.getInstance();
}

/** Reset the DoorSystem singleton (for tests). */
export function resetDoorSystem(): void {
  DoorSystem.resetInstance();
}
