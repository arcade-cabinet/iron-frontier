/**
 * TravelManager utility functions — Human-readable descriptions for
 * danger levels and travel methods.
 *
 * @module systems/TravelManager/utilities
 */

import type { DangerLevel, TravelMethod } from '../../data/schemas/world.ts';

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
