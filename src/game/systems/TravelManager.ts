/**
 * TravelManager - Pure logic manager for travel between locations
 *
 * Handles travel state machine: duration calculation, progress ticking,
 * encounter checkpoint rolling, cancellation, and completion.
 *
 * This is a stateless utility -- the actual state lives in the Zustand store.
 * TravelManager computes derived values and determines when encounters fire.
 *
 * @module systems/TravelManager
 */

import type { Connection, DangerLevel, TravelMethod } from '../data/schemas/world';
import type { TravelState } from '../store/types';

// ============================================================================
// TYPES
// ============================================================================

export interface TravelRoute {
  fromLocationId: string;
  toLocationId: string;
  method: TravelMethod;
  travelTime: number;
  danger: DangerLevel;
  connection: Connection;
}

export interface EncounterCheckpoint {
  /** Progress percentage (0-100) at which this checkpoint fires */
  progressThreshold: number;
  /** Whether this checkpoint has already been evaluated */
  evaluated: boolean;
  /** Whether an encounter was triggered at this checkpoint */
  triggered: boolean;
}

export interface TravelTickResult {
  /** Updated progress (0-100) */
  progress: number;
  /** Whether travel is complete */
  completed: boolean;
  /** Whether an encounter should fire right now */
  encounterTriggered: boolean;
  /** The encounter ID to use, if triggered */
  encounterId: string | null;
}

export interface TravelManagerState {
  route: TravelRoute;
  startedAt: number;
  /** Total real-time duration in ms for the travel animation */
  durationMs: number;
  /** Encounter checkpoints along the route */
  checkpoints: EncounterCheckpoint[];
  /** Current progress (0-100) */
  progress: number;
  /** Whether travel is paused (e.g., during encounter) */
  paused: boolean;
  /** Accumulated pause time in ms */
  pausedTimeMs: number;
  /** Timestamp when pause started (0 if not paused) */
  pauseStartedAt: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Encounter pools indexed by danger level */
const ENCOUNTER_POOLS: Record<DangerLevel, string[]> = {
  safe: [],
  low: ['wolf_pack'],
  moderate: ['roadside_bandits', 'wolf_pack', 'coyote_pack'],
  high: ['copperhead_patrol', 'ivrc_checkpoint', 'roadside_bandits'],
  extreme: ['remnant_awakening', 'copperhead_patrol'],
};

/** Base encounter chance per checkpoint, indexed by danger level */
const ENCOUNTER_CHANCE: Record<DangerLevel, number> = {
  safe: 0,
  low: 0.15,
  moderate: 0.25,
  high: 0.4,
  extreme: 0.6,
};

/** How many encounter checkpoints to create based on travel time */
function getCheckpointCount(travelTimeHours: number): number {
  if (travelTimeHours <= 2) return 1;
  if (travelTimeHours <= 6) return 2;
  if (travelTimeHours <= 15) return 3;
  return 4;
}

/**
 * Minimum real-time duration per game-hour of travel (ms).
 * Shorter routes feel snappier; longer routes scale sub-linearly.
 */
const MS_PER_GAME_HOUR_BASE = 400;
const MIN_TRAVEL_MS = 2000;
const MAX_TRAVEL_MS = 12000;

// ============================================================================
// TRAVEL MANAGER
// ============================================================================

export class TravelManager {
  private state: TravelManagerState | null = null;

  // --------------------------------------------------------------------------
  // LIFECYCLE
  // --------------------------------------------------------------------------

  /**
   * Begin a new travel sequence.
   *
   * @returns The initial TravelState for the store, or null if route is invalid.
   */
  startTravel(route: TravelRoute): TravelState {
    const durationMs = this.calculateDurationMs(route.travelTime);
    const checkpoints = this.createCheckpoints(route);

    this.state = {
      route,
      startedAt: Date.now(),
      durationMs,
      checkpoints,
      progress: 0,
      paused: false,
      pausedTimeMs: 0,
      pauseStartedAt: 0,
    };

    return {
      fromLocationId: route.fromLocationId,
      toLocationId: route.toLocationId,
      method: route.method,
      travelTime: route.travelTime,
      progress: 0,
      dangerLevel: route.danger,
      startedAt: this.state.startedAt,
      encounterId: null,
    };
  }

  /**
   * Advance travel progress based on elapsed real time.
   *
   * Called on an interval (e.g., every 250ms) by the store or a React effect.
   * Returns a result describing what happened this tick.
   */
  tick(): TravelTickResult | null {
    if (!this.state || this.state.paused) {
      return null;
    }

    const now = Date.now();
    const elapsed = now - this.state.startedAt - this.state.pausedTimeMs;
    const progress = Math.min(100, Math.round((elapsed / this.state.durationMs) * 100));
    this.state.progress = progress;

    // Check encounter checkpoints
    let encounterTriggered = false;
    let encounterId: string | null = null;

    for (const checkpoint of this.state.checkpoints) {
      if (checkpoint.evaluated) continue;
      if (progress >= checkpoint.progressThreshold) {
        checkpoint.evaluated = true;
        const result = this.rollEncounter(this.state.route.danger);
        if (result) {
          checkpoint.triggered = true;
          encounterTriggered = true;
          encounterId = result;
          // Pause travel for encounter
          this.pause();
          break; // Only one encounter per tick
        }
      }
    }

    return {
      progress,
      completed: progress >= 100 && !encounterTriggered,
      encounterTriggered,
      encounterId,
    };
  }

  /**
   * Pause travel (e.g., when an encounter interrupts).
   */
  pause(): void {
    if (!this.state || this.state.paused) return;
    this.state.paused = true;
    this.state.pauseStartedAt = Date.now();
  }

  /**
   * Resume travel after an encounter or pause.
   */
  resume(): void {
    if (!this.state || !this.state.paused) return;
    const pauseDuration = Date.now() - this.state.pauseStartedAt;
    this.state.pausedTimeMs += pauseDuration;
    this.state.paused = false;
    this.state.pauseStartedAt = 0;
  }

  /**
   * Cancel travel (returns to origin).
   */
  cancelTravel(): void {
    this.state = null;
  }

  /**
   * Complete travel (arrived at destination).
   */
  completeTravel(): void {
    this.state = null;
  }

  /**
   * Check if travel is currently active.
   */
  isActive(): boolean {
    return this.state !== null;
  }

  /**
   * Check if travel is currently paused.
   */
  isPaused(): boolean {
    return this.state?.paused ?? false;
  }

  /**
   * Get current internal state (for debugging).
   */
  getState(): TravelManagerState | null {
    return this.state;
  }

  /**
   * Get the current route info.
   */
  getRoute(): TravelRoute | null {
    return this.state?.route ?? null;
  }

  // --------------------------------------------------------------------------
  // INTERNAL HELPERS
  // --------------------------------------------------------------------------

  /**
   * Calculate real-time duration in ms for a given travel-time in game hours.
   * Uses a sub-linear scale so 30-hour journeys don't take forever in real time.
   */
  private calculateDurationMs(travelTimeHours: number): number {
    // sqrt scaling: sqrt(hours) * base_ms_per_hour
    const raw = Math.sqrt(travelTimeHours) * MS_PER_GAME_HOUR_BASE;
    return Math.max(MIN_TRAVEL_MS, Math.min(MAX_TRAVEL_MS, Math.round(raw)));
  }

  /**
   * Create encounter checkpoints evenly distributed along the route.
   * E.g., for 3 checkpoints: 25%, 50%, 75%.
   */
  private createCheckpoints(route: TravelRoute): EncounterCheckpoint[] {
    const count = getCheckpointCount(route.travelTime);
    const checkpoints: EncounterCheckpoint[] = [];

    for (let i = 1; i <= count; i++) {
      const threshold = Math.round((i / (count + 1)) * 100);
      checkpoints.push({
        progressThreshold: threshold,
        evaluated: false,
        triggered: false,
      });
    }

    return checkpoints;
  }

  /**
   * Roll for an encounter at a checkpoint.
   *
   * @returns encounter ID if triggered, null otherwise.
   */
  private rollEncounter(danger: DangerLevel): string | null {
    const pool = ENCOUNTER_POOLS[danger];
    if (!pool || pool.length === 0) return null;

    const chance = ENCOUNTER_CHANCE[danger] ?? 0;
    if (Math.random() > chance) return null;

    return pool[Math.floor(Math.random() * pool.length)];
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let instance: TravelManager | null = null;

export function getTravelManager(): TravelManager {
  if (!instance) {
    instance = new TravelManager();
  }
  return instance;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a human-readable description of the danger level.
 */
export function dangerDescription(danger: DangerLevel): string {
  switch (danger) {
    case 'safe':
      return 'Patrolled and secure. No encounters expected.';
    case 'low':
      return 'Generally safe, but wildlife may be a concern.';
    case 'moderate':
      return 'Frontier territory. Bandits and predators roam.';
    case 'high':
      return 'Dangerous ground. Gang patrols and hostile wildlife.';
    case 'extreme':
      return 'Lawless wasteland. Deadly encounters are likely.';
    default:
      return 'Unknown danger level.';
  }
}

/**
 * Get a human-readable travel method description.
 */
export function methodDescription(method: TravelMethod): string {
  switch (method) {
    case 'road':
      return 'Well-maintained road. Fastest overland travel.';
    case 'trail':
      return 'Rough trail through the frontier. Moderate speed.';
    case 'railroad':
      return 'Iron horse. The fastest way to travel.';
    case 'wilderness':
      return 'No path. Slow and dangerous cross-country travel.';
    case 'river':
      return 'By boat along the waterways.';
    default:
      return 'Unknown travel method.';
  }
}
