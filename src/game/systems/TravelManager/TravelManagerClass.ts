/**
 * TravelManager class — State machine for travel between locations.
 *
 * Handles duration calculation, progress ticking, encounter checkpoint
 * rolling, pause/resume, cancellation, and completion.
 *
 * @module systems/TravelManager/TravelManagerClass
 */

import type { DangerLevel } from '../../data/schemas/world.ts';
import type { TravelState } from '../../store/types/index.ts';

import type {
  TravelRoute,
  EncounterCheckpoint,
  TravelTickResult,
  TravelManagerState,
  ProceduralEncounterResolver,
} from './types.ts';

import {
  getCheckpointCount,
  MS_PER_GAME_HOUR_BASE,
  MIN_TRAVEL_MS,
  MAX_TRAVEL_MS,
} from './constants.ts';

// ============================================================================
// TRAVEL MANAGER
// ============================================================================

export class TravelManager {
  private state: TravelManagerState | null = null;
  private encounterResolver: ProceduralEncounterResolver | null = null;

  /**
   * Set the procedural encounter resolver.
   * When set, checkpoints use this instead of hardcoded encounter pools.
   */
  setEncounterResolver(resolver: ProceduralEncounterResolver): void {
    this.encounterResolver = resolver;
  }

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
   * If a procedural encounter resolver is set, delegates to it.
   * Otherwise falls back to hardcoded encounter pools.
   *
   * @returns encounter ID if triggered, null otherwise.
   */
  private rollEncounter(danger: DangerLevel): string | null {
    // Use procedural resolver if available
    if (this.encounterResolver && this.state) {
      const route = this.state.route;
      return this.encounterResolver(
        danger,
        route.method,
        route.fromLocationId,
        route.toLocationId,
      );
    }

    // No resolver set — this is a configuration error
    console.error('[TravelManager] No encounter resolver set — cannot roll encounter. Call setEncounterResolver() during init.');
    return null;
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
