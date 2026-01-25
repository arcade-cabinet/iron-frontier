/**
 * Location Library - All hand-crafted locations
 *
 * Locations are spatial definitions that can be loaded into the game.
 * Each location references assemblages from the assemblage library.
 */

// ============================================================================
// TOWNS
// ============================================================================
export { TestTown } from './test_town';
export { DustySprings } from './dusty_springs';
export { JunctionCity } from './junction_city';
export { Coppertown } from './coppertown';
export { Prospect } from './prospect';

// ============================================================================
// INDUSTRIAL
// ============================================================================
export { CopperMine } from './copper_mine';

// ============================================================================
// WAYSTATIONS
// ============================================================================
export { DesertWaystation } from './desert_waystation';
export { ThornwoodStation } from './thornwood_station';

// ============================================================================
// RANCHES & FARMS
// ============================================================================
export { SunsetRanch } from './sunset_ranch';

// ============================================================================
// DANGEROUS LOCATIONS
// ============================================================================
export { RattlesnakeCanyon } from './rattlesnake_canyon';
export { SignalRock } from './signal_rock';

// ============================================================================
// CAMPS & SETTLEMENTS
// ============================================================================
export { FreeminerHollow } from './freeminer_hollow';

// ============================================================================
// DUNGEONS
// ============================================================================
export { OldWorks } from './old_works';

// ============================================================================
// LOCATION REGISTRY
// ============================================================================

import { TestTown } from './test_town';
import { DustySprings } from './dusty_springs';
import { JunctionCity } from './junction_city';
import { Coppertown } from './coppertown';
import { Prospect } from './prospect';
import { CopperMine } from './copper_mine';
import { DesertWaystation } from './desert_waystation';
import { ThornwoodStation } from './thornwood_station';
import { SunsetRanch } from './sunset_ranch';
import { RattlesnakeCanyon } from './rattlesnake_canyon';
import { SignalRock } from './signal_rock';
import { FreeminerHollow } from './freeminer_hollow';
import { OldWorks } from './old_works';
import type { Location } from '../schemas/spatial';

/** All hand-crafted locations indexed by ID */
export const LOCATIONS_BY_ID = new Map<string, Location>([
  // Towns
  ['test_town', TestTown],
  ['dusty_springs', DustySprings],
  ['junction_city', JunctionCity],
  ['coppertown', Coppertown],
  ['prospect', Prospect],

  // Industrial
  ['copper_mine', CopperMine],

  // Waystations
  ['desert_waystation', DesertWaystation],
  ['thornwood_station', ThornwoodStation],

  // Ranches
  ['sunset_ranch', SunsetRanch],

  // Dangerous
  ['rattlesnake_canyon', RattlesnakeCanyon],
  ['signal_rock', SignalRock],

  // Camps
  ['freeminer_hollow', FreeminerHollow],

  // Dungeons
  ['old_works', OldWorks],
]);

/** Get a location by its data ID */
export function getLocationById(id: string): Location | undefined {
  return LOCATIONS_BY_ID.get(id);
}

/** Get all location IDs */
export function getAllLocationIds(): string[] {
  return Array.from(LOCATIONS_BY_ID.keys());
}

/** Get locations by type */
export function getLocationsByType(type: string): Location[] {
  return Array.from(LOCATIONS_BY_ID.values()).filter(loc => loc.type === type);
}

/** Get locations by tag */
export function getLocationsByTag(tag: string): Location[] {
  return Array.from(LOCATIONS_BY_ID.values()).filter(loc => loc.tags.includes(tag));
}
