/**
 * TravelManager constants — encounter chances and timing parameters.
 *
 * @module systems/TravelManager/constants
 */

import type { DangerLevel } from '../../data/schemas/world.ts';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Base encounter chance per checkpoint, indexed by danger level */
export const ENCOUNTER_CHANCE: Record<DangerLevel, number> = {
  safe: 0,
  low: 0.15,
  moderate: 0.25,
  high: 0.4,
  extreme: 0.6,
};

/** How many encounter checkpoints to create based on travel time */
export function getCheckpointCount(travelTimeHours: number): number {
  if (travelTimeHours <= 2) return 1;
  if (travelTimeHours <= 6) return 2;
  if (travelTimeHours <= 15) return 3;
  return 4;
}

/**
 * Minimum real-time duration per game-hour of travel (ms).
 * Shorter routes feel snappier; longer routes scale sub-linearly.
 */
export const MS_PER_GAME_HOUR_BASE = 400;
export const MIN_TRAVEL_MS = 2000;
export const MAX_TRAVEL_MS = 12000;
