/**
 * Example Assemblages - Validated prefabs for town generation
 *
 * These serve as both examples and functional building blocks.
 * All coordinates are relative to anchor at (0,0).
 *
 * Split into submodules by category:
 *   - exampleSingleBuildings.ts: Individual buildings (cabin, saloon, sheriff, church, store)
 *   - exampleFunctionalGroups.ts: Multi-building compounds (ranch, mine, train depot)
 *   - exampleTownFeatures.ts: Town infrastructure (square, street, lot, graveyard)
 */

import type { Assemblage } from '../schemas';

// Re-export all individual assemblages
export {
  SingleCabin,
  SingleSaloon,
  SingleSheriff,
  SingleChurch,
  SingleGeneralStore,
} from './exampleSingleBuildings';

export { Ranch, MineEntrance, TrainDepot } from './exampleFunctionalGroups';

export {
  TownSquare,
  MainStreetSegment,
  EmptyLot,
  Graveyard,
} from './exampleTownFeatures';

// Import for aggregate collections
import {
  SingleCabin,
  SingleSaloon,
  SingleSheriff,
  SingleChurch,
  SingleGeneralStore,
} from './exampleSingleBuildings';

import { Ranch, MineEntrance, TrainDepot } from './exampleFunctionalGroups';

import {
  TownSquare,
  MainStreetSegment,
  EmptyLot,
  Graveyard,
} from './exampleTownFeatures';

// ============================================================================
// AGGREGATE EXPORTS
// ============================================================================

export const ALL_ASSEMBLAGES: Assemblage[] = [
  SingleCabin,
  SingleSaloon,
  SingleSheriff,
  SingleChurch,
  SingleGeneralStore,
  Ranch,
  MineEntrance,
  TrainDepot,
  TownSquare,
  MainStreetSegment,
  EmptyLot,
  Graveyard,
];

/** Lookup by ID */
export const ASSEMBLAGES_BY_ID = new Map<string, Assemblage>(ALL_ASSEMBLAGES.map((a) => [a.id, a]));

/** Lookup by type */
export function getAssemblagesByType(type: string): Assemblage[] {
  return ALL_ASSEMBLAGES.filter((a) => a.type === type);
}

/** Lookup by tag */
export function getAssemblagesByTag(tag: string): Assemblage[] {
  return ALL_ASSEMBLAGES.filter((a) => a.tags.includes(tag));
}
