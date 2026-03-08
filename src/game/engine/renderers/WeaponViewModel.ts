// WeaponViewModel — Abstract base class for first-person weapon view models.
//
// Handles weapon sway (lagging behind look rotation), movement bob (synced to
// player walking cadence), and idle breathing motion. Subclasses implement
// the geometry construction and fire/reload animations.

import * as THREE from 'three';
import type { InputFrame } from '@/src/game/input/InputFrame';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How quickly the weapon "catches up" to the camera rotation. */
const SWAY_SMOOTHING = 8;
/** Magnitude of horizontal/vertical sway in response to look deltas. */
const SWAY_AMOUNT_X = 0.012;
const SWAY_AMOUNT_Y = 0.008;
/** Maximum sway displacement so the weapon doesn't fly off screen. */
const SWAY_MAX = 0.035;

/** Walk-bob amplitude (vertical) and frequency multiplier. */
const BOB_AMPLITUDE_Y = 0.006;
const BOB_AMPLITUDE_X = 0.004;
const BOB_FREQUENCY = 10; // cycles per second — matches camera bob

/** Idle breathing motion amplitude and speed. */
const IDLE_AMPLITUDE_X = 0.0012;
const IDLE_AMPLITUDE_Y = 0.0008;
const IDLE_FREQUENCY = 1.5; // slow breath cycle

// Scratch objects to avoid per-frame allocation
const _targetOffset = new THREE.Vector3();
const _currentOffset = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Weapon states
// ---------------------------------------------------------------------------

export type WeaponState = 'idle' | 'firing' | 'reloading';

// ---------------------------------------------------------------------------
// Abstract base
// ---------------------------------------------------------------------------

export abstract class WeaponViewModel {
  /** The root THREE.Group — attach this to the camera. */
  readonly group: THREE.Group;

  protected state: WeaponState = 'idle';

  // Sway tracking
  private swayOffset = new THREE.Vector3();

  // Bob tracking
  private bobPhase = 0;

  // Idle timer
  private idleTime = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'WeaponViewModel';

    // Build the weapon geometry (implemented by subclass)
    const model = this.constructModel();
    this.group.add(model);

    // Start at rest position
    const rest = this.getRestPosition();
    this.group.position.copy(rest);

    // Render on top of the scene
    this.group.renderOrder = 1000;
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.renderOrder = 1000;
        child.material.depthTest = false;
        child.material.depthWrite = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Abstract — implemented by each weapon
  // ---------------------------------------------------------------------------

  /** Build and return the weapon's 3D model as a Group. */
  abstract constructModel(): THREE.Group;

  /** Play the fire animation. Subclass drives keyframe/tween logic. */
  abstract playFire(): void;

  /** Play the reload animation. */
  abstract playReload(): void;

  /** The weapon's "at rest" position relative to the camera. */
  abstract getRestPosition(): THREE.Vector3;

  // ---------------------------------------------------------------------------
  // Per-frame update
  // ---------------------------------------------------------------------------

  update(deltaTime: number, inputFrame: Readonly<InputFrame>): void {
    const rest = this.getRestPosition();

    // --- Weapon sway (lag behind look rotation) ---
    const targetSwayX = -inputFrame.look.yaw * SWAY_AMOUNT_X;
    const targetSwayY = -inputFrame.look.pitch * SWAY_AMOUNT_Y;

    _targetOffset.set(
      clamp(targetSwayX, -SWAY_MAX, SWAY_MAX),
      clamp(targetSwayY, -SWAY_MAX, SWAY_MAX),
      0,
    );

    const lerpFactor = 1 - Math.exp(-SWAY_SMOOTHING * deltaTime);
    this.swayOffset.lerp(_targetOffset, lerpFactor);

    // Decay sway back toward zero when look deltas are small
    if (Math.abs(inputFrame.look.yaw) < 0.0001 && Math.abs(inputFrame.look.pitch) < 0.0001) {
      this.swayOffset.lerp(THREE.Vector3.prototype, lerpFactor);
    }

    // --- Movement bob ---
    const moveSpeed = Math.sqrt(
      inputFrame.move.x * inputFrame.move.x +
      inputFrame.move.z * inputFrame.move.z,
    );
    const isMoving = moveSpeed > 0.1;

    if (isMoving) {
      this.bobPhase += deltaTime * BOB_FREQUENCY;
    } else {
      // Ease bob phase to zero so it doesn't "pop"
      this.bobPhase *= 1 - 3 * deltaTime;
    }

    const bobX = Math.sin(this.bobPhase) * BOB_AMPLITUDE_X * moveSpeed;
    const bobY = Math.sin(this.bobPhase * 2) * BOB_AMPLITUDE_Y * moveSpeed;

    // --- Idle sway (subtle breathing) ---
    if (!isMoving) {
      this.idleTime += deltaTime;
    } else {
      this.idleTime = 0;
    }

    const idleX = Math.sin(this.idleTime * IDLE_FREQUENCY * Math.PI * 2) * IDLE_AMPLITUDE_X;
    const idleY = Math.cos(this.idleTime * IDLE_FREQUENCY * 0.7 * Math.PI * 2) * IDLE_AMPLITUDE_Y;

    // --- Compose final position ---
    _currentOffset.set(
      rest.x + this.swayOffset.x + bobX + idleX,
      rest.y + this.swayOffset.y + bobY + idleY,
      rest.z,
    );

    this.group.position.lerp(_currentOffset, lerpFactor);
  }

  // ---------------------------------------------------------------------------
  // State helpers
  // ---------------------------------------------------------------------------

  getState(): WeaponState {
    return this.state;
  }

  canFire(): boolean {
    return this.state === 'idle';
  }

  canReload(): boolean {
    return this.state === 'idle';
  }

  dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          for (const mat of child.material) mat.dispose();
        } else {
          child.material.dispose();
        }
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
