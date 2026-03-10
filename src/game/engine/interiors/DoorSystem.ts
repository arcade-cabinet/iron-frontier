/**
 * DoorSystem — Manages door trigger zones, door opening animation,
 * and seamless building entry/exit.
 *
 * @module engine/interiors/DoorSystem
 */

import * as THREE from 'three';

export type { DoorState, DoorChangeCallback } from './doorTypes';
import type { DoorState, DoorChangeCallback } from './doorTypes';
import {
  DOOR_ANIM_DURATION, DOOR_OPEN_ANGLE,
  TRIGGER_WIDTH, TRIGGER_HEIGHT, TRIGGER_DEPTH,
} from './doorTypes';

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

  unregisterDoor(buildingId: string): void {
    this.doors.delete(buildingId);
    this.animatingDoors.delete(buildingId);
  }

  openDoor(buildingId: string): void {
    const door = this.doors.get(buildingId);
    if (!door || door.isOpen) return;
    door.isOpen = true;
    door.targetAngle = DOOR_OPEN_ANGLE;
    this.animatingDoors.add(buildingId);
    this.notifyListeners(door);
  }

  closeDoor(buildingId: string): void {
    const door = this.doors.get(buildingId);
    if (!door || !door.isOpen) return;
    door.isOpen = false;
    door.targetAngle = 0;
    this.animatingDoors.add(buildingId);
    this.notifyListeners(door);
  }

  toggleDoor(buildingId: string): void {
    const door = this.doors.get(buildingId);
    if (!door) return;
    if (door.isOpen) { this.closeDoor(buildingId); } else { this.openDoor(buildingId); }
  }

  update(dt: number): void {
    const speed = DOOR_OPEN_ANGLE / DOOR_ANIM_DURATION;
    const completed: string[] = [];

    for (const buildingId of this.animatingDoors) {
      const door = this.doors.get(buildingId);
      if (!door) { completed.push(buildingId); continue; }

      if (door.currentAngle < door.targetAngle) {
        door.currentAngle = Math.min(door.currentAngle + speed * dt, door.targetAngle);
      } else if (door.currentAngle > door.targetAngle) {
        door.currentAngle = Math.max(door.currentAngle - speed * dt, door.targetAngle);
      }

      if (door.doorMesh) { door.doorMesh.rotation.y = door.currentAngle; }

      if (Math.abs(door.currentAngle - door.targetAngle) < 0.01) {
        door.currentAngle = door.targetAngle;
        completed.push(buildingId);
      }
    }

    for (const id of completed) { this.animatingDoors.delete(id); }
  }

  getAllDoors(): readonly DoorState[] {
    return Array.from(this.doors.values());
  }

  getDoor(buildingId: string): DoorState | null {
    return this.doors.get(buildingId) ?? null;
  }

  getTriggerDimensions(): { width: number; height: number; depth: number } {
    return { width: TRIGGER_WIDTH, height: TRIGGER_HEIGHT, depth: TRIGGER_DEPTH };
  }

  checkTriggerAt(worldPos: THREE.Vector3): string | null {
    for (const [buildingId, door] of this.doors) {
      const dx = Math.abs(worldPos.x - door.triggerPosition.x);
      const dy = Math.abs(worldPos.y - door.triggerPosition.y);
      const dz = Math.abs(worldPos.z - door.triggerPosition.z);
      if (dx < TRIGGER_WIDTH / 2 && dy < TRIGGER_HEIGHT / 2 && dz < TRIGGER_DEPTH / 2) {
        return buildingId;
      }
    }
    return null;
  }

  onChange(callback: DoorChangeCallback): () => void {
    this.listeners.add(callback);
    return () => { this.listeners.delete(callback); };
  }

  private notifyListeners(door: DoorState): void {
    for (const cb of this.listeners) { cb(door); }
  }

  dispose(): void {
    this.doors.clear();
    this.animatingDoors.clear();
    this.listeners.clear();
  }
}

/** Get the shared DoorSystem instance. */
export function getDoorSystem(): DoorSystem {
  return DoorSystem.getInstance();
}

/** Reset the DoorSystem singleton (for tests). */
export function resetDoorSystem(): void {
  DoorSystem.resetInstance();
}
