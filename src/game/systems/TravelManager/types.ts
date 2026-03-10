/**
 * TravelManager types — Interfaces for routes, checkpoints, and tick results.
 *
 * @module systems/TravelManager/types
 */

import type { Connection, DangerLevel, TravelMethod } from '../../data/schemas/world.ts';

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

/**
 * Callback for resolving encounters procedurally.
 * Called at each checkpoint; returns a registered CombatEncounter ID or null.
 *
 * Parameters:
 * - danger: the route's danger level
 * - method: the travel method (road, trail, wilderness, etc.)
 * - fromLocationId: origin location
 * - toLocationId: destination location
 */
export type ProceduralEncounterResolver = (
  danger: DangerLevel,
  method: TravelMethod,
  fromLocationId: string,
  toLocationId: string,
) => string | null;
