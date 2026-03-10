/**
 * Assemblage Library - Reusable building blocks for town generation
 *
 * Each assemblage is a validated, self-contained spatial unit that can be
 * placed in any location.
 */

import type { Assemblage } from '../schemas/spatial';
import { Saloon, SmallTavern } from './social';
import { GeneralStore, Gunsmith, Bank } from './commerce';
import { SheriffOffice, Church, TrainStation } from './civic';
import { Cabin, House, Mansion, Well, Stable } from './residential';
import { MineEntrance, Campfire, TentCamp, BanditCamp } from './camps';
import { SmallFarm, CattleRanch, AbandonedCabin, GhostTown } from './agricultural';
import { Oasis, RockFormation, CanyonPass, Waystation, TelegraphPost } from './natural';

// Re-export all assemblages
export {
  Saloon,
  SmallTavern,
  GeneralStore,
  Gunsmith,
  Bank,
  SheriffOffice,
  Church,
  TrainStation,
  Cabin,
  House,
  Mansion,
  Well,
  Stable,
  MineEntrance,
  Campfire,
  TentCamp,
  BanditCamp,
  SmallFarm,
  CattleRanch,
  AbandonedCabin,
  GhostTown,
  Oasis,
  RockFormation,
  CanyonPass,
  Waystation,
  TelegraphPost,
};

// ============================================================================
// LIBRARY EXPORTS
// ============================================================================

export const ASSEMBLAGE_LIBRARY: Assemblage[] = [
  // Taverns
  Saloon,
  SmallTavern,
  // Commerce
  GeneralStore,
  Gunsmith,
  Bank,
  // Civic
  SheriffOffice,
  Church,
  TrainStation,
  // Residential
  Cabin,
  House,
  Mansion,
  // Infrastructure
  Well,
  Stable,
  // Industrial
  MineEntrance,
  // Camps
  Campfire,
  TentCamp,
  BanditCamp,
  // Farms
  SmallFarm,
  CattleRanch,
  // Ruins
  AbandonedCabin,
  GhostTown,
  // Natural Features
  Oasis,
  RockFormation,
  CanyonPass,
  // Outposts
  Waystation,
  TelegraphPost,
];

/** Map for quick lookup by ID */
export const ASSEMBLAGES_BY_ID = new Map<string, Assemblage>(
  ASSEMBLAGE_LIBRARY.map((a) => [a.id, a])
);

/** Get assemblages by slot type */
export function getAssemblagesBySlot(slotType: string): Assemblage[] {
  return ASSEMBLAGE_LIBRARY.filter((a) => a.primarySlot === slotType);
}

/** Get assemblages by tag */
export function getAssemblagesByTag(tag: string): Assemblage[] {
  return ASSEMBLAGE_LIBRARY.filter((a) => a.tags.includes(tag));
}
