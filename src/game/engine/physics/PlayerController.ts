// PlayerController — FPS character controller backed by PhysicsWorld.
//
// Converts InputFrame movement intents into physics-resolved positions.
// Handles walk/sprint, jumping (with coyote time), terrain following,
// step-up, trigger volume enter/exit callbacks, and head bob.

import * as THREE from 'three';

import type { InputFrame } from '@/src/game/input/InputFrame';

import type { TriggerEvent } from './physicsTypes';
import type { PhysicsWorld } from './PhysicsWorld';
import {
  WALK_SPEED, SPRINT_SPEED, CROUCH_SPEED, JUMP_VELOCITY,
  PLAYER_HEIGHT, PLAYER_RADIUS, EYE_OFFSET, PITCH_LIMIT,
  STEP_UP_THRESHOLD, BOB_FREQUENCY, BOB_AMPLITUDE, COYOTE_TIME,
  _forward, _right, _wishDir, _yAxis, _xAxis,
  _yawQuat, _testPos, _scratchQuat1, _scratchQuat2,
  clamp, isHorizontallyBlocked,
} from './playerMovement';

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
  readonly position: THREE.Vector3;
  readonly velocity = new THREE.Vector3();
  yaw = 0;
  pitch = 0;
  grounded = false;
  sprinting = false;

  private bobPhase = 0;
  private lastHorizontalSpeed = 0;
  private airborneTimer = 0;
  private jumpConsumed = false;
  private triggerCallbacks: TriggerCallback[] = [];
  private activeTriggers = new Set<string>();
  private readonly physics: PhysicsWorld;

  constructor(physics: PhysicsWorld, initialPosition?: THREE.Vector3) {
    this.physics = physics;
    this.position = initialPosition?.clone() ?? new THREE.Vector3(0, 0, 5);
  }

  onTrigger(callback: TriggerCallback): () => void {
    this.triggerCallbacks.push(callback);
    return () => {
      const idx = this.triggerCallbacks.indexOf(callback);
      if (idx >= 0) this.triggerCallbacks.splice(idx, 1);
    };
  }

  update(frame: Readonly<InputFrame>, delta: number): void {
    this.yaw -= frame.look.yaw;
    this.pitch -= frame.look.pitch;
    this.pitch = clamp(this.pitch, -PITCH_LIMIT, PITCH_LIMIT);

    _yawQuat.setFromAxisAngle(_yAxis, this.yaw);
    _forward.set(0, 0, -1).applyQuaternion(_yawQuat);
    _right.set(1, 0, 0).applyQuaternion(_yawQuat);

    _wishDir.set(0, 0, 0);
    _wishDir.addScaledVector(_forward, frame.move.z);
    _wishDir.addScaledVector(_right, frame.move.x);

    const isMoving = _wishDir.lengthSq() > 0.001;
    if (isMoving) _wishDir.normalize();

    this.sprinting = frame.sprint && isMoving;
    const crouching = frame.crouch && !this.sprinting;
    const speed = this.sprinting ? SPRINT_SPEED : crouching ? CROUCH_SPEED : WALK_SPEED;

    this.velocity.x = isMoving ? _wishDir.x * speed : 0;
    this.velocity.z = isMoving ? _wishDir.z * speed : 0;

    if (this.grounded) { this.airborneTimer = 0; } else { this.airborneTimer += delta; }

    const canJump = this.grounded || this.airborneTimer < COYOTE_TIME;
    if (frame.jump && canJump && !this.jumpConsumed) {
      this.velocity.y = JUMP_VELOCITY;
      this.grounded = false;
      this.jumpConsumed = true;
      this.airborneTimer = COYOTE_TIME;
    }
    if (!frame.jump) this.jumpConsumed = false;

    this.physics.applyGravity(this.velocity, delta, this.grounded);

    const result = this.physics.movePlayer(
      this.position, this.velocity, PLAYER_RADIUS, PLAYER_HEIGHT, delta,
    );

    if (this.grounded && isMoving) {
      const blocked = isHorizontallyBlocked(result.position, this.position, this.velocity);
      if (blocked) {
        _testPos.copy(this.position);
        _testPos.y += STEP_UP_THRESHOLD;
        const stepResult = this.physics.movePlayer(
          _testPos, this.velocity, PLAYER_RADIUS, PLAYER_HEIGHT, delta,
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

    const dx = result.position.x - this.position.x;
    const dz = result.position.z - this.position.z;
    this.lastHorizontalSpeed = Math.sqrt(dx * dx + dz * dz) / Math.max(delta, 0.001);

    this.position.copy(result.position);
    this.grounded = result.grounded;

    if (this.grounded && this.lastHorizontalSpeed > 0.5) {
      const bobSpeed = this.sprinting
        ? BOB_FREQUENCY * 1.3
        : crouching ? BOB_FREQUENCY * 0.7 : BOB_FREQUENCY;
      this.bobPhase += delta * bobSpeed;
    } else {
      this.bobPhase *= 0.9;
    }

    this.updateTriggers();
  }

  getEyePosition(out: THREE.Vector3): THREE.Vector3 {
    const bob = Math.sin(this.bobPhase) * BOB_AMPLITUDE;
    return out.set(this.position.x, this.position.y + EYE_OFFSET + bob, this.position.z);
  }

  getCameraQuaternion(out: THREE.Quaternion): THREE.Quaternion {
    const yawQ = _scratchQuat1.setFromAxisAngle(_yAxis, this.yaw);
    const pitchQ = _scratchQuat2.setFromAxisAngle(_xAxis, this.pitch);
    return out.copy(yawQ).multiply(pitchQ);
  }

  getForwardDirection(out: THREE.Vector3): THREE.Vector3 {
    this.getCameraQuaternion(_scratchQuat1);
    return out.set(0, 0, -1).applyQuaternion(_scratchQuat1);
  }

  getRightDirection(out: THREE.Vector3): THREE.Vector3 {
    _yawQuat.setFromAxisAngle(_yAxis, this.yaw);
    return out.set(1, 0, 0).applyQuaternion(_yawQuat);
  }

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

  teleport(position: THREE.Vector3): void {
    this.position.copy(position);
    this.velocity.set(0, 0, 0);
    this.grounded = false;
    this.airborneTimer = 0;
    this.jumpConsumed = false;
    this.bobPhase = 0;
    this.activeTriggers.clear();
  }

  static get PLAYER_HEIGHT(): number { return PLAYER_HEIGHT; }
  static get PLAYER_RADIUS(): number { return PLAYER_RADIUS; }
  static get EYE_OFFSET(): number { return EYE_OFFSET; }
  static get STEP_UP_THRESHOLD(): number { return STEP_UP_THRESHOLD; }

  private updateTriggers(): void {
    if (this.triggerCallbacks.length === 0) return;

    const currentOverlaps = this.physics.queryTriggerOverlaps(
      this.position, PLAYER_RADIUS, PLAYER_HEIGHT,
    );

    const currentIds = new Set(currentOverlaps.map((t) => t.id));

    for (const trigger of currentOverlaps) {
      if (!this.activeTriggers.has(trigger.id)) {
        const event: TriggerEvent = { type: "enter", colliderId: trigger.id, tag: trigger.tag };
        for (const cb of this.triggerCallbacks) cb(event);
      }
    }

    for (const prevId of this.activeTriggers) {
      if (!currentIds.has(prevId)) {
        const event: TriggerEvent = { type: "exit", colliderId: prevId };
        for (const cb of this.triggerCallbacks) cb(event);
      }
    }

    this.activeTriggers = currentIds;
  }
}
