/**
 * NPC Library - Iron Frontier
 *
 * This module exports all NPC definitions and their associated dialogue trees.
 * NPCs are defined separately from their dialogues for modularity.
 */

import type { NPCDefinition, DialogueTree } from '../schemas/npc';

// Import dialogue trees
import { SheriffColeDialogues } from './dialogues/sheriff_cole';
import { DocChenDialogues } from './dialogues/doc_chen';
import { DiamondbackDialogues } from './dialogues/diamondback';

// ============================================================================
// NPC DEFINITIONS
// ============================================================================

export const SheriffMarcusCole: NPCDefinition = {
  id: 'sheriff_cole',
  name: 'Marcus Cole',
  title: 'Sheriff',
  role: 'sheriff',
  faction: 'neutral',
  locationId: 'dusty_springs',
  spawnCoord: { q: 3, r: -1 },
  personality: {
    aggression: 0.4,
    friendliness: 0.6,
    curiosity: 0.5,
    greed: 0.1,
    honesty: 0.9,
    lawfulness: 0.8,
  },
  description: 'A weathered man in his forties with a star pinned to his dusty vest. His eyes carry the weight of too many hard decisions.',
  portraitId: 'sheriff_cole',
  dialogueTreeIds: ['sheriff_cole_main'],
  primaryDialogueId: 'sheriff_cole_main',
  essential: true,
  questGiver: true,
  questIds: ['investigate_origins', 'investigate_disappearances'],
  backstory: 'A Union veteran who came west looking for peace. Found duty instead. Struggles between his sworn oath and his conscience as IVRC tightens its grip.',
  relationships: [
    { npcId: 'mayor_holt', type: 'rival', notes: 'Clashes over IVRC influence' },
    { npcId: 'doc_chen', type: 'ally', notes: 'Mutual respect for integrity' },
    { npcId: 'diamondback', type: 'enemy', notes: 'Duty demands he oppose her' },
  ],
  tags: ['authority', 'ally_potential', 'main_quest'],
};

export const MayorJosephineHolt: NPCDefinition = {
  id: 'mayor_holt',
  name: 'Josephine Holt',
  title: 'Mayor',
  role: 'mayor',
  faction: 'ivrc',
  locationId: 'dusty_springs',
  spawnCoord: { q: 0, r: 2 },
  personality: {
    aggression: 0.2,
    friendliness: 0.7,
    curiosity: 0.4,
    greed: 0.5,
    honesty: 0.4,
    lawfulness: 0.6,
  },
  description: 'An elegant woman in her fifties, dressed in fine eastern clothes that seem out of place on the frontier. Her smile never quite reaches her eyes.',
  portraitId: 'mayor_holt',
  dialogueTreeIds: ['mayor_holt_main'],
  primaryDialogueId: 'mayor_holt_main',
  essential: true,
  questGiver: true,
  questIds: [],
  backstory: 'Born to wealth, married into power. Came west with her husband to build an empire. Now a widow, she maintains control by serving IVRC interests while protecting what little independence remains.',
  relationships: [
    { npcId: 'sheriff_cole', type: 'rival', notes: 'His morality frustrates her pragmatism' },
    { npcId: 'cornelius_thorne', type: 'ally', notes: 'She owes her position to him' },
  ],
  tags: ['authority', 'ivrc_connected', 'morally_grey'],
};

export const DocChenWei: NPCDefinition = {
  id: 'doc_chen',
  name: 'Chen Wei',
  title: 'Doc',
  role: 'doctor',
  faction: 'neutral',
  locationId: 'dusty_springs',
  spawnCoord: { q: -2, r: 3 },
  personality: {
    aggression: 0.1,
    friendliness: 0.7,
    curiosity: 0.8,
    greed: 0.1,
    honesty: 0.8,
    lawfulness: 0.5,
  },
  description: 'An older Chinese man with thoughtful eyes and steady hands. His small office is filled with both western medicine and traditional remedies.',
  portraitId: 'doc_chen',
  dialogueTreeIds: ['doc_chen_main'],
  primaryDialogueId: 'doc_chen_main',
  essential: true,
  questGiver: true,
  questIds: ['underground_railroad'],
  shopId: 'doc_chen_shop',
  backstory: 'Came to America seeking opportunity, found discrimination. Built a practice serving those others ignored. Quietly runs an underground network helping workers escape IVRC debt bondage.',
  relationships: [
    { npcId: 'sheriff_cole', type: 'ally', notes: 'Sheriff turns a blind eye to certain activities' },
    { npcId: 'father_miguel', type: 'ally', notes: 'Partners in the underground' },
    { npcId: 'diamondback', type: 'neutral', notes: 'Heals her people without judgment' },
  ],
  tags: ['healer', 'information', 'underground', 'ally_potential'],
};

export const FatherMiguel: NPCDefinition = {
  id: 'father_miguel',
  name: 'Miguel Santos',
  title: 'Father',
  role: 'preacher',
  faction: 'neutral',
  locationId: 'dusty_springs',
  spawnCoord: { q: 4, r: 0 },
  personality: {
    aggression: 0.0,
    friendliness: 0.9,
    curiosity: 0.6,
    greed: 0.0,
    honesty: 0.7, // Hides the underground railroad
    lawfulness: 0.4, // Follows higher law
  },
  description: 'A gentle man in simple priest\'s robes, his hands calloused from work alongside his flock. His Spanish accent thickens when speaking of injustice.',
  portraitId: 'father_miguel',
  dialogueTreeIds: ['father_miguel_main'],
  primaryDialogueId: 'father_miguel_main',
  essential: true,
  questGiver: true,
  questIds: ['sanctuary'],
  backstory: 'A former missionary who lost his faith in the Church but not in God. Came to the frontier to serve the forgotten. Runs an underground railroad for escaped workers, hiding them in the church basement.',
  relationships: [
    { npcId: 'doc_chen', type: 'ally', notes: 'Partners in saving lives' },
    { npcId: 'samuel_ironpick', type: 'ally', notes: 'Old friends from the resistance days' },
  ],
  tags: ['spiritual', 'underground', 'sanctuary', 'ally_potential'],
};

export const DiamondbackDolores: NPCDefinition = {
  id: 'diamondback',
  name: 'Dolores Vega',
  title: 'Diamondback',
  role: 'gang_leader',
  faction: 'copperhead',
  locationId: 'rattlesnake_canyon',
  spawnCoord: { q: 0, r: 0 },
  personality: {
    aggression: 0.7,
    friendliness: 0.3,
    curiosity: 0.5,
    greed: 0.2, // Steals for cause, not self
    honesty: 0.6,
    lawfulness: 0.0,
  },
  description: 'A striking woman with sun-darkened skin and cold, calculating eyes. A coiled rattlesnake tattoo winds up her neck. Her presence commands immediate attention.',
  portraitId: 'diamondback',
  dialogueTreeIds: ['diamondback_main'],
  primaryDialogueId: 'diamondback_main',
  essential: true,
  questGiver: true,
  questIds: ['copperhead_alliance', 'strike_ivrc'],
  backstory: 'Former IVRC telegraph operator who saw too much. When she tried to expose the company\'s crimes, they tried to silence her permanently. She survived and vowed revenge.',
  relationships: [
    { npcId: 'sheriff_cole', type: 'enemy', notes: 'Respects him but cannot cooperate' },
    { npcId: 'samuel_ironpick', type: 'neutral', notes: 'Disagrees on methods but shares goals' },
    { npcId: 'cornelius_thorne', type: 'enemy', notes: 'Sworn enemy' },
  ],
  tags: ['outlaw', 'faction_leader', 'ally_potential', 'copperhead'],
};

export const OldSamuelIronpick: NPCDefinition = {
  id: 'samuel_ironpick',
  name: 'Samuel Ironpick',
  title: 'Old',
  role: 'miner',
  faction: 'freeminer',
  locationId: 'freeminer_hollow',
  spawnCoord: { q: 0, r: 0 },
  personality: {
    aggression: 0.3,
    friendliness: 0.4,
    curiosity: 0.3,
    greed: 0.1,
    honesty: 0.9,
    lawfulness: 0.6,
  },
  description: 'A grizzled old miner with a silver beard and hands like leather. His eyes hold both wisdom and deep sorrow. He carries himself with quiet dignity despite his worn clothes.',
  portraitId: 'samuel_ironpick',
  dialogueTreeIds: ['samuel_ironpick_main'],
  primaryDialogueId: 'samuel_ironpick_main',
  essential: true,
  questGiver: true,
  questIds: ['freeminer_trust', 'find_documents'],
  backstory: 'Lost his son to a preventable mine collapse. Became leader of the Freeminer resistance, advocating peaceful resistance. Holds the key to documents that could destroy IVRC - if he can be convinced to use them.',
  relationships: [
    { npcId: 'diamondback', type: 'neutral', notes: 'Disapproves of violence but understands her pain' },
    { npcId: 'father_miguel', type: 'ally', notes: 'Old friends from better days' },
    { npcId: 'maggie_ironpick', type: 'family', notes: 'His granddaughter' },
  ],
  tags: ['faction_leader', 'ally_potential', 'freeminer', 'documents'],
};

// ============================================================================
// NPC REGISTRY
// ============================================================================

export const ALL_NPCS: NPCDefinition[] = [
  SheriffMarcusCole,
  MayorJosephineHolt,
  DocChenWei,
  FatherMiguel,
  DiamondbackDolores,
  OldSamuelIronpick,
];

export const NPCS_BY_ID: Record<string, NPCDefinition> = Object.fromEntries(
  ALL_NPCS.map(npc => [npc.id, npc])
);

export const NPCS_BY_LOCATION: Record<string, NPCDefinition[]> = ALL_NPCS.reduce(
  (acc, npc) => {
    if (!acc[npc.locationId]) {
      acc[npc.locationId] = [];
    }
    acc[npc.locationId].push(npc);
    return acc;
  },
  {} as Record<string, NPCDefinition[]>
);

// ============================================================================
// DIALOGUE REGISTRY
// ============================================================================

export const ALL_DIALOGUE_TREES: DialogueTree[] = [
  ...SheriffColeDialogues,
  ...DocChenDialogues,
  ...DiamondbackDialogues,
];

export const DIALOGUE_TREES_BY_ID: Record<string, DialogueTree> = Object.fromEntries(
  ALL_DIALOGUE_TREES.map(tree => [tree.id, tree])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get an NPC by their ID
 */
export function getNPCById(id: string): NPCDefinition | undefined {
  return NPCS_BY_ID[id];
}

/**
 * Get all NPCs in a location
 */
export function getNPCsByLocation(locationId: string): NPCDefinition[] {
  return NPCS_BY_LOCATION[locationId] || [];
}

/**
 * Get NPCs by faction
 */
export function getNPCsByFaction(faction: string): NPCDefinition[] {
  return ALL_NPCS.filter(npc => npc.faction === faction);
}

/**
 * Get NPCs with a specific tag
 */
export function getNPCsByTag(tag: string): NPCDefinition[] {
  return ALL_NPCS.filter(npc => npc.tags.includes(tag));
}

/**
 * Get a dialogue tree by ID
 */
export function getDialogueTreeById(id: string): DialogueTree | undefined {
  return DIALOGUE_TREES_BY_ID[id];
}

/**
 * Get all dialogue trees for an NPC
 */
export function getDialogueTreesForNPC(npcId: string): DialogueTree[] {
  const npc = NPCS_BY_ID[npcId];
  if (!npc) return [];

  return npc.dialogueTreeIds
    .map(id => DIALOGUE_TREES_BY_ID[id])
    .filter((tree): tree is DialogueTree => tree !== undefined);
}

/**
 * Get the primary dialogue tree for an NPC
 */
export function getPrimaryDialogueTree(npcId: string): DialogueTree | undefined {
  const npc = NPCS_BY_ID[npcId];
  if (!npc || !npc.primaryDialogueId) return undefined;

  return DIALOGUE_TREES_BY_ID[npc.primaryDialogueId];
}

/**
 * Get quest-giving NPCs
 */
export function getQuestGivers(): NPCDefinition[] {
  return ALL_NPCS.filter(npc => npc.questGiver);
}

/**
 * Get essential NPCs (cannot die)
 */
export function getEssentialNPCs(): NPCDefinition[] {
  return ALL_NPCS.filter(npc => npc.essential);
}
