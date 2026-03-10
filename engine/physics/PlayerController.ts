// PlayerController — FPS character controller backed by PhysicsWorld.
//
// Converts InputFrame movement intents into physics-resolved positions.
// Handles walk/sprint speeds, jumping (with coyote time), terrain following,
// step-up for small obstacles (0.3 unit threshold), trigger volume enter/exit
// callbacks, and head bob driven by actual displacement.

import * as THREE from "three";

import type { InputFrame } from "@/src/game/input/InputFrame";
import type { PhysicsWorld } from "./PhysicsWorld.ts";
import type { TriggerEvent, TriggerOverlapInfo } from "./physicsTypes.ts";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WALK_SPEED = 5; // m/s
const SPRINT_SPEED = 9; // m/s
const CROUCH_SPEED = 2.5; // m/s
const JUMP_VELOCITY = 8; // m/s initial upward velocity
const PLAYER_HEIGHT = 1.7; // Full capsule height
const PLAYER_RADIUS = 0.3; // Capsule horizontal radius
const EYE_OFFSET = 1.6; // Eye height above feet
const PITCH_LIMIT = (85 * Math.PI) / 180;
const STEP_UP_THRESHOLD = 0.3; // Max obstacle height for automatic step-up
const BOB_FREQUENCY = 10; // Cycles per second while walking
const BOB_AMPLITUDE = 0.04; // Vertical displacement in meters
const COYOTE_TIME = 0.1; // Seconds after leaving ground where jump is still allowed

// ---------------------------------------------------------------------------
// Scratch vectors
// ---------------------------------------------------------------------------

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _wishDir = new THREE.Vector3();
const _yAxis = new THREE.Vector3(0, 1, 0);
const _xAxis = new THREE.Vector3(1, 0, 0);
const _yawQuat = new THREE.Quaternion();
const _testPos = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface PlayerState {
  readonly position: THREE.Vector3;
  readonly velocity: THREE.Vector3;
  readonly yaw: number;
  readonly pitch: number;
  readonly grounded: boolean;
  readonly sprinting: boolean;
}

export type TriggerCallback = (event: TriggerEvent) => void;

// ---------------------------------------------------------------------------
// PlayerController
// ---------------------------------------------------------------------------

export class PlayerController {
  /** Player feet position (ground level). */
  readonly position: THREE.Vector3;

  /** Current velocity (physics modifies this for gravity, collision). */
  readonly velocity = new THREE.Vector3();

  /** Camera yaw in radians (rotation around world Y). */
  yaw = 0;
  /** Camera pitch in radians (rotation around local X). */
  pitch = 0;

  /** True when the player is on solid ground. */
  grounded = false;

  /** True when the player is sprinting this frame. */
  sprinting = false;

  /** Head-bob phase accumulator. */
  private bobPhase = 0;

  /** Horizontal displacement last frame (used for bob amplitude). */
  private lastHorizontalSpeed = 0;

  /** Time since the player last stood on ground (coyote time). */
  private airborneTimer = 0;

  /** Prevents double-jump: cleared when jump key is released. */
  private jumpConsumed = false;

  /** Trigger overlap callbacks. */
  private triggerCallbacks: TriggerCallback[] = [];

  /** Set of trigger collider ids the player is currently overlapping. */
  private activeTriggers = new Set<string>();

  private readonly physics: PhysicsWorld;

  constructor(physics: PhysicsWorld, initialPosition?: THREE.Vector3) {
    this.physics = physics;
    this.position = initialPosition?.clone() ?? new THREE.Vector3(0, 0, 5);
  }

  // -----------------------------------------------------------------------
  // Trigger callbacks
  // -----------------------------------------------------------------------

  /** Register a callback that fires on trigger enter/exit events. */
  onTrigger(callback: TriggerCallback): () => void {
    this.triggerCallbacks.push(callback);
    return () => {
      const idx = this.triggerCallbacks.indexOf(callback);
      if (idx >= 0) this.triggerCallbacks.splice(idx, 1);
    };
  }

  // -----------------------------------------------------------------------
  // Per-frame update
  // -----------------------------------------------------------------------

  /**
   * Process one frame of player movement.
   *
   * @param frame  Current merged InputFrame.
   * @param delta  Frame delta time in seconds.
   */
  update(frame: Readonly<InputFrame>, delta: number): void {
    // --- Rotation ---
    this.yaw -= frame.look.yaw;
    this.pitch -= frame.look.pitch;
    this.pitch = clamp(this.pitch, -PITCH_LIMIT, PITCH_LIMIT);

    // --- Build wish direction (horizontal only) ---
    _yawQuat.setFromAxisAngle(_yAxis, this.yaw);
    _forward.set(0, 0, -1).applyQuaternion(_yawQuat);
    _right.set(1, 0, 0).applyQuaternion(_yawQuat);

    _wishDir.set(0, 0, 0);
    _wishDir.addScaledVector(_forward, frame.move.z);
    _wishDir.addScaledVector(_right, frame.move.x);

    const isMoving = _wishDir.lengthSq() > 0.001;
    if (isMoving) {
      _wishDir.normalize();
    }

    // --- Speed ---
    this.sprinting = frame.sprint && isMoving;
    const crouching = frame.crouch && !this.sprinting; // sprint overrides crouch
    const speed = this.sprinting ? SPRINT_SPEED : crouching ? CROUCH_SPEED : WALK_SPEED;

    // Set horizontal velocity from wish direction
    this.velocity.x = isMoving ? _wishDir.x * speed : 0;
    this.velocity.z = isMoving ? _wishDir.z * speed : 0;

    // --- Airborne timer (coyote time) ---
    if (this.grounded) {
      this.airborneTimer = 0;
    } else {
      this.airborneTimer += delta;
    }

    // --- Jump ---
    const canJump = this.grounded || this.airborneTimer < COYOTE_TIME;
    if (frame.jump && canJump && !this.jumpConsumed) {
      this.velocity.y = JUMP_VELOCITY;
      this.grounded = false;
      this.jumpConsumed = true;
      this.airborneTimer = COYOTE_TIME;
    }
    if (!frame.jump) {
      this.jumpConsumed = false;
    }

    // --- Gravity ---
    this.physics.applyGravity(this.velocity, delta, this.grounded);

    // --- Resolve collisions ---
    const result = this.physics.movePlayer(
      this.position,
      this.velocity,
      PLAYER_RADIUS,
      PLAYER_HEIGHT,
      delta,
    );

    // --- Step-up ---
    if (this.grounded && isMoving) {
      const blocked = this.isHorizontallyBlocked(result.position);
      if (blocked) {
        _testPos.copy(this.position);
        _testPos.y += STEP_UP_THRESHOLD;
        const stepResult = this.physics.movePlayer(
          _testPos,
          this.velocity,
          PLAYER_RADIUS,
          PLAYER_HEIGHT,
          delta,
        );
        const origDx = result.position.x - this.position.x;
        const origDz = result.position.z - this.position.z;
        const stepDx = stepResult.position.x - this.position.x;
        const stepDz = stepResult.position.z - this.position.z;
        if (stepDx * stepDx + stepDz * stepDz > origDx * origDx + origDz * origDz + 0.001) {
          result.position.copy(stepResult.position);
          result.grounded = stepResult.grounded;
        }
      }
    }

    // Track horizontal speed before snapping position
    const dx = result.position.x - this.position.x;
    const dz = result.position.z - this.position.z;
    this.lastHorizontalSpeed = Math.sqrt(dx * dx + dz * dz) / Math.max(delta, 0.001);

    this.position.copy(result.position);
    this.grounded = result.grounded;

    // --- Head bob ---
    if (this.grounded && this.lastHorizontalSpeed > 0.5) {
      const bobSpeed = this.sprinting
        ? BOB_FREQUENCY * 1.3
        : crouching
          ? BOB_FREQUENCY * 0.7
          : BOB_FREQUENCY;
      this.bobPhase += delta * bobSpeed;
    } else {
      // Ease bob back to zero
      this.bobPhase *= 0.9;
    }

    // --- Trigger overlap detection ---
    this.updateTriggers();
  }

  // -----------------------------------------------------------------------
  // Camera queries
  // -----------------------------------------------------------------------

  /** Eye-level position (feet + eye offset + head bob). */
  getEyePosition(out: THREE.Vector3): THREE.Vector3 {
    const bob = Math.sin(this.bobPhase) * BOB_AMPLITUDE;
    return out.set(this.position.x, this.position.y + EYE_OFFSET + bob, this.position.z);
  }

  /** Build the camera quaternion from current yaw and pitch. */
  getCameraQuaternion(out: THREE.Quaternion): THREE.Quaternion {
    const yawQ = _scratchQuat1.setFromAxisAngle(_yAxis, this.yaw);
    const pitchQ = _scratchQuat2.setFromAxisAngle(_xAxis, this.pitch);
    return out.copy(yawQ).multiply(pitchQ);
  }

  /** Camera forward direction (unit vector). */
  getForwardDirection(out: THREE.Vector3): THREE.Vector3 {
    this.getCameraQuaternion(_scratchQuat1);
    return out.set(0, 0, -1).applyQuaternion(_scratchQuat1);
  }

  /** Camera right direction (unit vector, world space). */
  getRightDirection(out: THREE.Vector3): THREE.Vector3 {
    _yawQuat.setFromAxisAngle(_yAxis, this.yaw);
    return out.set(1, 0, 0).applyQuaternion(_yawQuat);
  }

  /** Snapshot of current player state. */
  getState(): PlayerState {
    return {
      position: this.position.clone(),
      velocity: this.velocity.clone(),
      yaw: this.yaw,
      pitch: this.pitch,
      grounded: this.grounded,
      sprinting: this.sprinting,
    };
  }

  /** Teleport the player to a new position. Resets velocity and ground state. */
  teleport(position: THREE.Vector3): void {
    this.position.copy(position);
    this.velocity.set(0, 0, 0);
    this.grounded = false;
    this.airborneTimer = 0;
    this.jumpConsumed = false;
    this.bobPhase = 0;
    this.activeTriggers.clear();
  }

  // -----------------------------------------------------------------------
  // Static accessors
  // -----------------------------------------------------------------------

  static get PLAYER_HEIGHT(): number {
    return PLAYER_HEIGHT;
  }
  static get PLAYER_RADIUS(): number {
    return PLAYER_RADIUS;
  }
  static get EYE_OFFSET(): number {
    return EYE_OFFSET;
  }
  static get STEP_UP_THRESHOLD(): number {
    return STEP_UP_THRESHOLD;
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private isHorizontallyBlocked(resolvedPos: THREE.Vector3): boolean {
    const desiredDx = this.velocity.x * 0.016;
    const desiredDz = this.velocity.z * 0.016;
    const desiredSq = desiredDx * desiredDx + desiredDz * desiredDz;
    if (desiredSq < 0.0001) return false;

    const actualDx = resolvedPos.x - this.position.x;
    const actualDz = resolvedPos.z - this.position.z;
    const actualSq = actualDx * actualDx + actualDz * actualDz;

    return actualSq < desiredSq * 0.3;
  }

  private updateTriggers(): void {
    if (this.triggerCallbacks.length === 0) return;

    const currentOverlaps = this.physics.queryTriggerOverlaps(
      this.position,
      PLAYER_RADIUS,
      PLAYER_HEIGHT,
    );

    const currentIds = new Set(currentOverlaps.map((t) => t.id));

    // Fire enter events
    for (const trigger of currentOverlaps) {
      if (!this.activeTriggers.has(trigger.id)) {
        const event: TriggerEvent = { type: "enter", colliderId: trigger.id, tag: trigger.tag };
        for (const cb of this.triggerCallbacks) cb(event);
      }
    }

    // Fire exit events
    for (const prevId of this.activeTriggers) {
      if (!currentIds.has(prevId)) {
        const event: TriggerEvent = { type: "exit", colliderId: prevId };
        for (const cb of this.triggerCallbacks) cb(event);
      }
    }

    this.activeTriggers = currentIds;
  }
}

// ---------------------------------------------------------------------------
// Scratch quaternions
// ---------------------------------------------------------------------------

const _scratchQuat1 = new THREE.Quaternion();
const _scratchQuat2 = new THREE.Quaternion();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
