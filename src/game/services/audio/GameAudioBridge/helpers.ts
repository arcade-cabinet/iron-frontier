/**
 * Helper functions for the GameAudioBridge module.
 *
 * @module services/audio/GameAudioBridge/helpers
 */

import type { TimeOfDay } from '../../../ddl/types';

/**
 * Map game hour (0-23) to TimeOfDay enum.
 */
export function hourToTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}
