/**
 * Travel Helpers - Encounter pools and travel timer management
 *
 * Pure data and utility functions for the travel system,
 * extracted from travelSlice to keep it under 300 lines.
 *
 * @module game/store/slices/travelHelpers
 */

import type { DangerLevel } from '../../data/schemas/world';
import { scopedRNG, rngTick } from '../../lib/prng';

/**
 * Encounter pools keyed by danger level.
 * Each pool lists encounter IDs that can trigger during travel.
 */
export const ENCOUNTER_POOLS: Record<DangerLevel, string[]> = {
  safe: [],
  low: ['wolf_pack'],
  moderate: ['roadside_bandits', 'wolf_pack'],
  high: ['copperhead_patrol', 'ivrc_checkpoint'],
  extreme: ['remnant_awakening'],
};

/**
 * Base encounter chance per danger level (0-1).
 */
export const ENCOUNTER_CHANCES: Record<DangerLevel, number> = {
  safe: 0,
  low: 0.15,
  moderate: 0.25,
  high: 0.4,
  extreme: 0.6,
};

/**
 * Roll for a random encounter during travel.
 *
 * @returns encounter ID or null if no encounter triggers
 */
export function rollTravelEncounter(
  dangerLevel: DangerLevel,
  getEncounterById: (id: string) => any
): string | null {
  const pool = ENCOUNTER_POOLS[dangerLevel] ?? [];
  const encounterRoll = scopedRNG('store', 42, rngTick());
  const encounterId =
    pool.length > 0 && encounterRoll <= (ENCOUNTER_CHANCES[dangerLevel] ?? 0)
      ? pool[Math.floor(scopedRNG('store', 42, rngTick()) * pool.length)]
      : null;

  if (!encounterId) return null;
  return getEncounterById(encounterId) ? encounterId : null;
}

/**
 * Travel timer manager.
 *
 * Encapsulates the setInterval-based travel progress ticker
 * so the slice doesn't need to manage raw timer handles.
 */
export class TravelTimerManager {
  private timer: ReturnType<typeof setInterval> | null = null;

  start(callback: () => void, intervalMs = 250): void {
    this.clear();
    this.timer = setInterval(callback, intervalMs);
  }

  clear(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
