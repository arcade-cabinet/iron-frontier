// AIProvider — Autoplay AI governor for testing and attract mode
//
// Simple state machine:
//   IDLE → WANDER → ENGAGE → IDLE
//
// WANDER: Random direction changes every 2-5 seconds
// ENGAGE: Aim toward enemy and fire
// IDLE:   Brief pause between actions
//
// Uses alea PRNG for reproducible behavior when given a seed.
// Priority 1 (lowest) — any human input overrides.

import Alea from 'alea';
import type { IInputProvider } from '../IInputProvider';
import type { InputFrame } from '../InputFrame';

export type AIState = 'IDLE' | 'WANDER' | 'ENGAGE';

export interface AITarget {
  /** Relative angle to target in radians (positive = right) */
  yaw: number;
  /** Relative pitch to target in radians (positive = up) */
  pitch: number;
  /** Distance to target */
  distance: number;
}

export interface AIConfig {
  /** PRNG seed for reproducible behavior (default 'iron-frontier') */
  seed: string;
  /** Minimum wander duration in seconds (default 2) */
  wanderMinDuration: number;
  /** Maximum wander duration in seconds (default 5) */
  wanderMaxDuration: number;
  /** Idle duration in seconds (default 1) */
  idleDuration: number;
  /** Engage range — only engage targets closer than this (default 30) */
  engageRange: number;
  /** Look speed in radians per second while tracking (default 2) */
  trackingSpeed: number;
  /** Probability of interacting each wander cycle (default 0.2) */
  interactChance: number;
  /** Whether to sprint while wandering (default false) */
  sprintWhileWander: boolean;
}

const DEFAULT_CONFIG: AIConfig = {
  seed: 'iron-frontier',
  wanderMinDuration: 2,
  wanderMaxDuration: 5,
  idleDuration: 1,
  engageRange: 30,
  trackingSpeed: 2,
  interactChance: 0.2,
  sprintWhileWander: false,
};

export class AIProvider implements IInputProvider {
  readonly name = 'ai-autoplay';
  readonly priority = 1;

  private config: AIConfig;
  private rng: ReturnType<typeof Alea>;
  private isEnabled = false;

  // State machine
  private state: AIState = 'IDLE';
  private stateTimer = 0; // seconds remaining in current state
  private lastTimestamp = 0; // for computing dt

  // Wander state
  private wanderDir = { x: 0, z: 0 };
  private wanderInteract = false;
  private wanderInteractFired = false;

  // Engage state — caller must supply target via setTarget()
  private target: AITarget | null = null;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rng = Alea(this.config.seed);
  }

  // ---------------------------------------------------------------------------
  // IInputProvider
  // ---------------------------------------------------------------------------

  poll(): Partial<InputFrame> {
    if (!this.isEnabled) return {};

    const now = performance.now() / 1000;
    const dt = this.lastTimestamp > 0 ? Math.min(now - this.lastTimestamp, 0.1) : 0;
    this.lastTimestamp = now;

    this.stateTimer -= dt;
    if (this.stateTimer <= 0) {
      this.transition();
    }

    switch (this.state) {
      case 'IDLE':
        return this.pollIdle();
      case 'WANDER':
        return this.pollWander();
      case 'ENGAGE':
        return this.pollEngage(dt);
    }
  }

  enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;
    this.lastTimestamp = 0;
    this.enterIdle();
  }

  disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    this.lastTimestamp = 0;
    this.state = 'IDLE';
    this.stateTimer = 0;
    this.target = null;
  }

  dispose(): void {
    this.disable();
  }

  // ---------------------------------------------------------------------------
  // Target management (called by game systems)
  // ---------------------------------------------------------------------------

  /** Set the current engage target. Pass null to clear. */
  setTarget(target: AITarget | null): void {
    this.target = target;
  }

  /** Get current AI state for debugging / UI */
  getState(): AIState {
    return this.state;
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  /** Reset the PRNG with a new seed */
  setSeed(seed: string): void {
    this.config.seed = seed;
    this.rng = Alea(seed);
  }

  /** Update config values at runtime */
  setConfig(partial: Partial<AIConfig>): void {
    Object.assign(this.config, partial);
    if (partial.seed !== undefined) {
      this.rng = Alea(partial.seed);
    }
  }

  // ---------------------------------------------------------------------------
  // State machine
  // ---------------------------------------------------------------------------

  private transition(): void {
    switch (this.state) {
      case 'IDLE':
        // If a target is in range, engage; otherwise wander
        if (this.target && this.target.distance <= this.config.engageRange) {
          this.enterEngage();
        } else {
          this.enterWander();
        }
        break;

      case 'WANDER':
        // After wandering, go idle briefly
        this.enterIdle();
        break;

      case 'ENGAGE':
        // After engage cycle, go idle
        this.enterIdle();
        break;
    }
  }

  private enterIdle(): void {
    this.state = 'IDLE';
    this.stateTimer = this.config.idleDuration;
  }

  private enterWander(): void {
    this.state = 'WANDER';
    const range = this.config.wanderMaxDuration - this.config.wanderMinDuration;
    this.stateTimer = this.config.wanderMinDuration + this.rng() * range;

    // Pick a random normalized direction
    const angle = this.rng() * Math.PI * 2;
    this.wanderDir = {
      x: Math.cos(angle),
      z: Math.sin(angle),
    };

    // Decide whether to interact during this wander cycle
    this.wanderInteract = this.rng() < this.config.interactChance;
    this.wanderInteractFired = false;
  }

  private enterEngage(): void {
    this.state = 'ENGAGE';
    // Engage for 2-4 seconds
    this.stateTimer = 2 + this.rng() * 2;
  }

  // ---------------------------------------------------------------------------
  // Per-state poll
  // ---------------------------------------------------------------------------

  private pollIdle(): Partial<InputFrame> {
    return {
      move: { x: 0, z: 0 },
      look: { yaw: 0, pitch: 0 },
    };
  }

  private pollWander(): Partial<InputFrame> {
    // Fire interact once partway through the wander cycle
    let interact = false;
    if (this.wanderInteract && !this.wanderInteractFired && this.stateTimer < 1) {
      interact = true;
      this.wanderInteractFired = true;
    }

    return {
      move: { x: this.wanderDir.x, z: this.wanderDir.z },
      look: { yaw: 0, pitch: 0 },
      sprint: this.config.sprintWhileWander,
      interact,
    };
  }

  private pollEngage(dt: number): Partial<InputFrame> {
    if (!this.target) {
      // Lost target, go idle next tick
      this.stateTimer = 0;
      return this.pollIdle();
    }

    // Compute look deltas to track the target
    const maxStep = this.config.trackingSpeed * dt;

    const yawStep = clampMagnitude(this.target.yaw, maxStep);
    const pitchStep = clampMagnitude(this.target.pitch, maxStep);

    // Fire when roughly on target (within ~5 degrees)
    const onTarget = Math.abs(this.target.yaw) < 0.09 && Math.abs(this.target.pitch) < 0.09;

    return {
      move: { x: 0, z: 0 },
      look: { yaw: yawStep, pitch: pitchStep },
      fire: onTarget,
      aim: true,
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampMagnitude(value: number, max: number): number {
  if (value > max) return max;
  if (value < -max) return -max;
  return value;
}
