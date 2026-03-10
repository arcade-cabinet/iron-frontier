/**
 * DialogueQuestBridge quest helpers - Quest prerequisite and NPC quest helpers
 *
 * @module systems/DialogueQuestBridge/questHelpers
 */

import type { Quest } from '../../data/schemas/quest';
import { questEvents } from '../QuestEvents';
import type { BridgeStore, BridgeStoreReader } from './types';

/** Check whether a quest's prerequisites are satisfied. */
export function canStartQuest(
  quest: Quest,
  state: BridgeStoreReader,
): boolean {
  const prereqs = quest.prerequisites;

  // Already active or completed?
  if (state.activeQuests.some((q) => q.questId === quest.id)) return false;
  if (state.completedQuestIds.includes(quest.id)) return false;

  // Completed quest prerequisites
  if (!prereqs.completedQuests.every((qid) => state.completedQuestIds.includes(qid))) {
    return false;
  }

  // Level check
  if (prereqs.minLevel && state.playerStats.level < prereqs.minLevel) {
    return false;
  }

  // Required items
  if (prereqs.requiredItems && prereqs.requiredItems.length > 0) {
    for (const itemId of prereqs.requiredItems) {
      if (!state.inventory.some((i) => i.itemId === itemId)) return false;
    }
  }

  return true;
}

/** Return which quests an NPC can currently offer (prereqs met, not active/done). */
export function getAvailableNpcQuests(
  questIds: string[],
  state: BridgeStoreReader,
  getQuestDef: (id: string) => Quest | undefined,
): Quest[] {
  const available: Quest[] = [];
  for (const qid of questIds) {
    const def = getQuestDef(qid);
    if (def && canStartQuest(def, state)) {
      available.push(def);
    }
  }
  return available;
}

/** Emit npcTalkedTo when dialogue ends. Call from endDialogue handler. */
export function onDialogueEnd(npcId: string, store: BridgeStore): void {
  store.markNPCTalked(npcId);
  questEvents.emit('npcTalkedTo', { npcId });
}
