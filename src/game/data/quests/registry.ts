/**
 * Iron Frontier - Quest Registry & Lookup Functions
 *
 * Central registry for all quests with query helpers.
 */

import type { Quest } from '../schemas/quest';
import { DocsDilemma } from './sideDocsDilemma.ts';
import { TheInheritance } from './mainInheritance.ts';
import { TheReclamation } from './mainReclamation.ts';
import { MissingCattle } from './sideMissingCattle.ts';

/**
 * All quests indexed by ID for quick lookup.
 */
export const QUESTS_BY_ID: Record<string, Quest> = {
  [TheInheritance.id]: TheInheritance,
  [TheReclamation.id]: TheReclamation,
  [MissingCattle.id]: MissingCattle,
  [DocsDilemma.id]: DocsDilemma,
};

/**
 * Quests organized by type.
 */
export const QUESTS_BY_TYPE: Record<string, Quest[]> = {
  main: [TheInheritance, TheReclamation],
  side: [MissingCattle, DocsDilemma],
  faction: [],
  bounty: [],
  delivery: [],
  exploration: [],
};

/**
 * All quest IDs.
 */
export const ALL_QUEST_IDS = Object.keys(QUESTS_BY_ID);

/**
 * Get a quest by its ID.
 */
export function getQuestById(questId: string): Quest | undefined {
  return QUESTS_BY_ID[questId];
}

/**
 * Get all quests of a specific type.
 */
export function getQuestsByType(type: string): Quest[] {
  return QUESTS_BY_TYPE[type] ?? [];
}

/**
 * Get all quests available at a specific location.
 */
export function getQuestsAtLocation(locationId: string): Quest[] {
  return Object.values(QUESTS_BY_ID).filter((quest) => quest.startLocationId === locationId);
}

/**
 * Get all quests given by a specific NPC.
 */
export function getQuestsByNPC(npcId: string): Quest[] {
  return Object.values(QUESTS_BY_ID).filter((quest) => quest.giverNpcId === npcId);
}

/**
 * Get all quests with a specific tag.
 */
export function getQuestsByTag(tag: string): Quest[] {
  return Object.values(QUESTS_BY_ID).filter((quest) => quest.tags.includes(tag));
}

/**
 * Check if a quest's prerequisites are met.
 */
export function arePrerequisitesMet(
  quest: Quest,
  completedQuestIds: string[],
  playerLevel: number,
  factionRep: Record<string, number>
): boolean {
  const prereqs = quest.prerequisites;

  // Check completed quests
  if (!prereqs.completedQuests.every((qid) => completedQuestIds.includes(qid))) {
    return false;
  }

  // Check player level
  if (prereqs.minLevel && playerLevel < prereqs.minLevel) {
    return false;
  }

  // Check faction reputation
  for (const [factionId, minRep] of Object.entries(prereqs.factionReputation)) {
    if ((factionRep[factionId] ?? 0) < minRep) {
      return false;
    }
  }

  return true;
}
