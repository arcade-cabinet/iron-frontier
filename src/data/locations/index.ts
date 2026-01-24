/**
 * Location Library - All hand-crafted locations
 *
 * Locations are spatial definitions that can be loaded into the game.
 * Each location references assemblages from the assemblage library.
 */

// Towns
export { TestTown } from './test_town';

// Industrial
export { CopperMine } from './copper_mine';

// Waystations
export { DesertWaystation } from './desert_waystation';

// Ranches & Farms
export { SunsetRanch } from './sunset_ranch';

// Dangerous Locations
export { RattlesnakeCanyon } from './rattlesnake_canyon';

// ============================================================================
// LOCATION REGISTRY
// ============================================================================

import { TestTown } from './test_town';
import { CopperMine } from './copper_mine';
import { DesertWaystation } from './desert_waystation';
import { SunsetRanch } from './sunset_ranch';
import { RattlesnakeCanyon } from './rattlesnake_canyon';
import type { Location } from '../schemas/spatial';

/** All hand-crafted locations indexed by ID */
export const LOCATIONS_BY_ID = new Map<string, Location>([
  ['test_town', TestTown],
  ['copper_mine', CopperMine],
  ['desert_waystation', DesertWaystation],
  ['sunset_ranch', SunsetRanch],
  ['rattlesnake_canyon', RattlesnakeCanyon],
]);

/** Get a location by its data ID */
export function getLocationById(id: string): Location | undefined {
  return LOCATIONS_BY_ID.get(id);
}

/** Get all location IDs */
export function getAllLocationIds(): string[] {
  return Array.from(LOCATIONS_BY_ID.keys());
}
