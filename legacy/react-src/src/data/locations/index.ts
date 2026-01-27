/**
 * Location Library - All hand-crafted locations
 *
 * Locations are spatial definitions that can be loaded into the game.
 * Each location references assemblages from the assemblage library.
 */

// ============================================================================
// INDUSTRIAL
// ============================================================================
export { CopperMine } from './copper_mine';
export { Coppertown } from './coppertown';
// ============================================================================
// WAYSTATIONS
// ============================================================================
export { DesertWaystation } from './desert_waystation';
export { DustySprings } from './dusty_springs';
// ============================================================================
// CAMPS & SETTLEMENTS
// ============================================================================
export { FreeminerHollow } from './freeminer_hollow';
export { JunctionCity } from './junction_city';
// ============================================================================
// DUNGEONS
// ============================================================================
export { OldWorks } from './old_works';
export { Prospect } from './prospect';
// ============================================================================
// DANGEROUS LOCATIONS
// ============================================================================
export { RattlesnakeCanyon } from './rattlesnake_canyon';
export { SignalRock } from './signal_rock';
// ============================================================================
// RANCHES & FARMS
// ============================================================================
export { SunsetRanch } from './sunset_ranch';
// ============================================================================
// TOWNS
// ============================================================================
export { TestTown } from './test_town';
export { ThornwoodStation } from './thornwood_station';

// ============================================================================
// LOCATION REGISTRY
// ============================================================================

import type { Location } from '../schemas/spatial';
import { CopperMine } from './copper_mine';
import { Coppertown } from './coppertown';
import { DesertWaystation } from './desert_waystation';
import { DustySprings } from './dusty_springs';
import { FreeminerHollow } from './freeminer_hollow';
import { JunctionCity } from './junction_city';
import { OldWorks } from './old_works';
import { Prospect } from './prospect';
import { RattlesnakeCanyon } from './rattlesnake_canyon';
import { SignalRock } from './signal_rock';
import { SunsetRanch } from './sunset_ranch';
import { TestTown } from './test_town';
import { ThornwoodStation } from './thornwood_station';

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
  return Array.from(LOCATIONS_BY_ID.values()).filter((loc) => loc.type === type);
}

/** Get locations by tag */
export function getLocationsByTag(tag: string): Location[] {
  return Array.from(LOCATIONS_BY_ID.values()).filter((loc) => loc.tags.includes(tag));
}
