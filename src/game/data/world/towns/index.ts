/**
 * Iron Frontier - Towns Library
 *
 * Complete town data for the authored world.
 * Each town includes NPCs, dialogues, shops, quests, and building definitions.
 *
 * Town Progression:
 * 1. Frontier's Edge - Tutorial/starter town
 * 2. Dusty Springs - Transition hub, main quest begins
 * 3. Iron Gulch - Main hub, Act 1
 * 4. Mesa Point - Outlaw den, Act 2
 * 5. Coldwater - Ranch town, respite
 * 6. Salvation - Endgame, final confrontation
 */

// ============================================================================
// TOWN IMPORTS
// ============================================================================

// Frontier's Edge - Starting Town
export {
  FrontiersEdgeTown,
  FRONTIERS_EDGE_NPCS,
  FRONTIERS_EDGE_DIALOGUES,
  FRONTIERS_EDGE_SHOPS,
  FRONTIERS_EDGE_QUESTS,
  SheriffJake,
  MarthaHawkins,
  OldTimerGus,
  SheriffJakeMainDialogue,
  MarthaHawkinsDialogue,
  OldTimerGusDialogue,
  FrontiersEdgeGeneralStore,
  FirstStepsQuest,
  MissingProspectorQuest,
} from './frontiers_edge';

// Dusty Springs - Transition Hub
export {
  DustySpringsTown,
  DUSTY_SPRINGS_NPCS,
  DUSTY_SPRINGS_DIALOGUES,
  DUSTY_SPRINGS_SHOPS,
  DUSTY_SPRINGS_QUESTS,
  DeputyMarshall,
  StablehandJim,
  TelegraphOperatorPenny,
  DeputyMarshallDialogue,
  StablehandJimDialogue,
  TelegraphPennyDialogue,
  DustySpringsGeneralStore,
  DustySpringsStable,
  DustySpringsGunsmith,
  InvestigateOriginsQuest,
} from './dusty_springs';

// Iron Gulch - Main Hub
export {
  IronGulchTown,
  IRON_GULCH_NPCS,
  IRON_GULCH_DIALOGUES,
  IRON_GULCH_SHOPS,
  IRON_GULCH_QUESTS,
  ForemanBurke,
  EngineerClara,
  SilasCrane,
  DocHolloway,
  BartenderMolly,
  ForemanBurkeDialogue,
  EngineerClaraDialogue,
  SilasCraneDialogue,
  DocHollowayDialogue,
  BartenderMollyDialogue,
  IronGulchMiningSupply,
  IronGulchSaloon,
  IronGulchApothecary,
  DeepTroubleQuest,
  EngineersRequestQuest,
  SaloonBrawlQuest,
} from './iron_gulch';

// Mesa Point - Outlaw Den
export {
  MesaPointTown,
  MESA_POINT_NPCS,
  MESA_POINT_DIALOGUES,
  MESA_POINT_SHOPS,
  MESA_POINT_QUESTS,
  RedEyeReyna,
  Whisper,
  BountyHunterCole,
  TheFence,
  RedEyeReynaDialogue,
  WhisperDialogue,
  BountyHunterColeDialogue,
  TheFenceDialogue,
  MesaPointBlackMarket,
  MesaPointFence,
  HonorAmongThievesQuest,
  InformantsPriceQuest,
} from './mesa_point';

// Coldwater - Ranch Town
export {
  ColdwaterTown,
  COLDWATER_NPCS,
  COLDWATER_DIALOGUES,
  COLDWATER_SHOPS,
  COLDWATER_QUESTS,
  RancherMcGraw,
  VetNell,
  TheWanderer,
  InnkeeperRose,
  RancherMcGrawDialogue,
  VetNellDialogue,
  TheWandererDialogue,
  InnkeeperRoseDialogue,
  ColdwaterRanchSupply,
  ColdwaterInn,
  ColdwaterVet,
  CattleRustlersQuest,
  WanderersTaleQuest,
} from './coldwater';

// Salvation - Endgame
export {
  SalvationTown,
  SALVATION_NPCS,
  SALVATION_DIALOGUES,
  SALVATION_SHOPS,
  SALVATION_QUESTS,
  PreacherSolomon,
  SisterHope,
  BrotherCain,
  FinalAlly,
  PreacherSolomonDialogue,
  SisterHopeDialogue,
  BrotherCainDialogue,
  FinalAllyDialogue,
  SalvationProvisions,
  ReckoningQuest,
  RedemptionQuest,
} from './salvation';

// Re-export types
export type { Town } from '../townSchema';

import type { DialogueTree, NPCDefinition } from '../../schemas/npc';
import type { Quest } from '../../schemas/quest';
import type { ShopDefinition } from '../../shops/index';
import type { Town } from '../townSchema';

import {
  FrontiersEdgeTown,
  FRONTIERS_EDGE_NPCS,
  FRONTIERS_EDGE_DIALOGUES,
  FRONTIERS_EDGE_SHOPS,
  FRONTIERS_EDGE_QUESTS,
} from './frontiers_edge';

import {
  DustySpringsTown,
  DUSTY_SPRINGS_NPCS,
  DUSTY_SPRINGS_DIALOGUES,
  DUSTY_SPRINGS_SHOPS,
  DUSTY_SPRINGS_QUESTS,
} from './dusty_springs';

import {
  IronGulchTown,
  IRON_GULCH_NPCS,
  IRON_GULCH_DIALOGUES,
  IRON_GULCH_SHOPS,
  IRON_GULCH_QUESTS,
} from './iron_gulch';

import {
  MesaPointTown,
  MESA_POINT_NPCS,
  MESA_POINT_DIALOGUES,
  MESA_POINT_SHOPS,
  MESA_POINT_QUESTS,
} from './mesa_point';

import {
  ColdwaterTown,
  COLDWATER_NPCS,
  COLDWATER_DIALOGUES,
  COLDWATER_SHOPS,
  COLDWATER_QUESTS,
} from './coldwater';

import {
  SalvationTown,
  SALVATION_NPCS,
  SALVATION_DIALOGUES,
  SALVATION_SHOPS,
  SALVATION_QUESTS,
} from './salvation';

// ============================================================================
// AGGREGATED EXPORTS
// ============================================================================

/**
 * All towns in the game.
 */
export const ALL_TOWNS: Town[] = [
  FrontiersEdgeTown,
  DustySpringsTown,
  IronGulchTown,
  MesaPointTown,
  ColdwaterTown,
  SalvationTown,
];

/**
 * Towns indexed by ID.
 */
export const TOWNS_BY_ID: Record<string, Town> = Object.fromEntries(
  ALL_TOWNS.map((town) => [town.id, town])
);

/**
 * All town NPCs (new NPCs defined in town files, not including existing NPCs).
 */
export const ALL_TOWN_NPCS: NPCDefinition[] = [
  ...FRONTIERS_EDGE_NPCS,
  ...DUSTY_SPRINGS_NPCS,
  ...IRON_GULCH_NPCS,
  ...MESA_POINT_NPCS,
  ...COLDWATER_NPCS,
  ...SALVATION_NPCS,
];

/**
 * Town NPCs indexed by ID.
 */
export const TOWN_NPCS_BY_ID: Record<string, NPCDefinition> = Object.fromEntries(
  ALL_TOWN_NPCS.map((npc) => [npc.id, npc])
);

/**
 * All town dialogues.
 */
export const ALL_TOWN_DIALOGUES: DialogueTree[] = [
  ...FRONTIERS_EDGE_DIALOGUES,
  ...DUSTY_SPRINGS_DIALOGUES,
  ...IRON_GULCH_DIALOGUES,
  ...MESA_POINT_DIALOGUES,
  ...COLDWATER_DIALOGUES,
  ...SALVATION_DIALOGUES,
];

/**
 * Town dialogues indexed by ID.
 */
export const TOWN_DIALOGUES_BY_ID: Record<string, DialogueTree> = Object.fromEntries(
  ALL_TOWN_DIALOGUES.map((dialogue) => [dialogue.id, dialogue])
);

/**
 * All town shops.
 */
export const ALL_TOWN_SHOPS: ShopDefinition[] = [
  ...FRONTIERS_EDGE_SHOPS,
  ...DUSTY_SPRINGS_SHOPS,
  ...IRON_GULCH_SHOPS,
  ...MESA_POINT_SHOPS,
  ...COLDWATER_SHOPS,
  ...SALVATION_SHOPS,
];

/**
 * Town shops indexed by ID.
 */
export const TOWN_SHOPS_BY_ID: Record<string, ShopDefinition> = Object.fromEntries(
  ALL_TOWN_SHOPS.map((shop) => [shop.id, shop])
);

/**
 * All town quests.
 */
export const ALL_TOWN_QUESTS: Quest[] = [
  ...FRONTIERS_EDGE_QUESTS,
  ...DUSTY_SPRINGS_QUESTS,
  ...IRON_GULCH_QUESTS,
  ...MESA_POINT_QUESTS,
  ...COLDWATER_QUESTS,
  ...SALVATION_QUESTS,
];

/**
 * Town quests indexed by ID.
 */
export const TOWN_QUESTS_BY_ID: Record<string, Quest> = Object.fromEntries(
  ALL_TOWN_QUESTS.map((quest) => [quest.id, quest])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a town by ID.
 */
export function getTownById(townId: string): Town | undefined {
  return TOWNS_BY_ID[townId];
}

/**
 * Get all towns of a specific theme.
 */
export function getTownsByTheme(theme: Town['theme']): Town[] {
  return ALL_TOWNS.filter((town) => town.theme === theme);
}

/**
 * Get all towns of a specific size.
 */
export function getTownsBySize(size: Town['size']): Town[] {
  return ALL_TOWNS.filter((town) => town.size === size);
}

/**
 * Get all towns controlled by a specific faction.
 */
export function getTownsByFaction(factionId: string): Town[] {
  return ALL_TOWNS.filter((town) => town.controllingFaction === factionId);
}

/**
 * Get all quests that start in a specific town.
 */
export function getQuestsInTown(townId: string): Quest[] {
  return ALL_TOWN_QUESTS.filter((quest) => quest.startLocationId === townId);
}

/**
 * Get all NPCs in a specific town.
 */
export function getNPCsInTown(townId: string): NPCDefinition[] {
  return ALL_TOWN_NPCS.filter((npc) => npc.locationId === townId);
}

/**
 * Get all shops in a specific town.
 */
export function getShopsInTown(townId: string): ShopDefinition[] {
  const town = TOWNS_BY_ID[townId];
  if (!town) return [];
  return town.shops.map((shopRef) => TOWN_SHOPS_BY_ID[shopRef.id]).filter(Boolean);
}

/**
 * Get starting town (discovered by default).
 */
export function getStartingTown(): Town | undefined {
  return ALL_TOWNS.find((town) => town.startDiscovered);
}

/**
 * Get towns sorted by danger level.
 */
export function getTownsByDangerLevel(ascending = true): Town[] {
  return [...ALL_TOWNS].sort((a, b) =>
    ascending ? a.dangerLevel - b.dangerLevel : b.dangerLevel - a.dangerLevel
  );
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Total statistics about the town content.
 */
export const TOWN_STATS = {
  totalTowns: ALL_TOWNS.length,
  totalNPCs: ALL_TOWN_NPCS.length,
  totalDialogues: ALL_TOWN_DIALOGUES.length,
  totalShops: ALL_TOWN_SHOPS.length,
  totalQuests: ALL_TOWN_QUESTS.length,
  townsByTheme: {
    frontier: getTownsByTheme('frontier').length,
    mining: getTownsByTheme('mining').length,
    ranching: getTownsByTheme('ranching').length,
    outlaw: getTownsByTheme('outlaw').length,
    religious: getTownsByTheme('religious').length,
  },
  townsBySize: {
    small: getTownsBySize('small').length,
    medium: getTownsBySize('medium').length,
    large: getTownsBySize('large').length,
  },
};
