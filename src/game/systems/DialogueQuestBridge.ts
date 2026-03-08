/**
 * DialogueQuestBridge.ts - Connects dialogue effects to the quest event bus
 *
 * Translates dialogue choice effects into QuestEvents emissions and store
 * actions. Provides helpers for prerequisite checking and choice filtering.
 *
 * @module systems/DialogueQuestBridge
 */

import type { DialogueChoice, DialogueCondition, DialogueEffect } from '../data/schemas/npc';
import type { ActiveQuest, Quest } from '../data/schemas/quest';
import { questEvents } from './QuestEvents';

// ============================================================================
// TYPES
// ============================================================================
export interface BridgeStoreReader {
  activeQuests: ActiveQuest[];
  completedQuestIds: string[];
  playerStats: { level: number; gold: number; reputation: number };
  inventory: { itemId: string; quantity: number }[];
  talkedNPCIds: string[];
  dialogueState: { conversationFlags: Record<string, boolean> } | null;
}

/** Minimal store actions needed by the bridge. */
export interface BridgeStoreActions {
  startQuest: (questId: string) => void;
  updateObjective: (questId: string, objectiveId: string, progress: number) => void;
  addItemById: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  addGold: (amount: number) => void;
  addNotification: (type: 'item' | 'xp' | 'quest' | 'level' | 'info' | 'warning', message: string) => void;
  getQuestDefinition: (questId: string) => Quest | undefined;
  getActiveQuest: (questId: string) => ActiveQuest | undefined;
  markNPCTalked: (npcId: string) => void;
  setDialogueFlag: (flag: string, value: boolean) => void;
}

export type BridgeStore = BridgeStoreReader & BridgeStoreActions;

// ============================================================================
// CONDITION CHECKING
// ============================================================================

/** Evaluate a single DialogueCondition against the current game state. */
export function evaluateCondition(
  condition: DialogueCondition,
  state: BridgeStoreReader,
): boolean {
  const target = condition.target ?? '';
  const value = condition.value ?? 0;

  switch (condition.type) {
    case 'quest_active':
      return state.activeQuests.some((q) => q.questId === target);

    case 'quest_complete':
      return state.completedQuestIds.includes(target);

    case 'quest_not_started':
      return (
        !state.activeQuests.some((q) => q.questId === target) &&
        !state.completedQuestIds.includes(target)
      );

    case 'has_item':
      return state.inventory.some(
        (i) => i.itemId === target && i.quantity >= (value || 1),
      );

    case 'lacks_item':
      return !state.inventory.some(
        (i) => i.itemId === target && i.quantity >= (value || 1),
      );

    case 'reputation_gte':
      return state.playerStats.reputation >= value;

    case 'reputation_lte':
      return state.playerStats.reputation <= value;

    case 'gold_gte':
      return state.playerStats.gold >= value;

    case 'talked_to':
      return state.talkedNPCIds.includes(target);

    case 'not_talked_to':
      return !state.talkedNPCIds.includes(target);

    case 'flag_set':
      return state.dialogueState?.conversationFlags[target] === true;

    case 'flag_not_set':
      return state.dialogueState?.conversationFlags[target] !== true;

    case 'first_meeting':
      return !state.talkedNPCIds.includes(target);

    case 'return_visit':
      return state.talkedNPCIds.includes(target);

    case 'time_of_day':
      // Time checks require clock state which varies; treat as pass-through
      return true;

    default:
      return true;
  }
}

/** Check all conditions on a dialogue choice. */
export function areChoiceConditionsMet(
  choice: DialogueChoice,
  state: BridgeStoreReader,
): boolean {
  if (!choice.conditions || choice.conditions.length === 0) return true;
  return choice.conditions.every((c) => evaluateCondition(c, state));
}

/** Filter choices to those whose conditions pass. */
export function filterAvailableChoices(
  choices: DialogueChoice[],
  state: BridgeStoreReader,
): DialogueChoice[] {
  return choices.filter((c) => areChoiceConditionsMet(c, state));
}

// ============================================================================
// EFFECT APPLICATION
// ============================================================================

/** Apply a single DialogueEffect, dispatching to store and quest events. */
export function applyDialogueEffect(
  effect: DialogueEffect,
  store: BridgeStore,
  npcId: string,
): void {
  const target = effect.target ?? '';
  const value = effect.value ?? 0;

  switch (effect.type) {
    case 'start_quest': {
      store.startQuest(target);
      questEvents.emit('questStarted', { questId: target });
      break;
    }

    case 'advance_quest': {
      const activeQuest = store.getActiveQuest(target);
      if (activeQuest) {
        const questDef = store.getQuestDefinition(target);
        if (questDef) {
          const stage = questDef.stages[activeQuest.currentStageIndex];
          if (stage && effect.stringValue) {
            const current = activeQuest.objectiveProgress[effect.stringValue] ?? 0;
            const obj = stage.objectives.find((o) => o.id === effect.stringValue);
            if (obj) {
              store.updateObjective(target, effect.stringValue, Math.min(obj.count, current + 1));
            }
          }
        }
      }
      break;
    }

    case 'complete_quest': {
      const aq = store.getActiveQuest(target);
      if (aq) {
        const def = store.getQuestDefinition(target);
        if (def) {
          const stage = def.stages[aq.currentStageIndex];
          if (stage) {
            for (const obj of stage.objectives) {
              if (!obj.optional) {
                store.updateObjective(target, obj.id, obj.count);
              }
            }
          }
        }
      }
      break;
    }

    case 'give_item':
      store.addItemById(target, value || 1);
      questEvents.emit('itemPickedUp', { itemId: target, quantity: value || 1 });
      break;

    case 'take_item':
      store.removeItem(target, value || 1);
      break;

    case 'give_gold':
      store.addGold(value);
      break;

    case 'take_gold':
      store.addGold(-value);
      break;

    case 'change_reputation':
      store.addNotification('info', `Reputation ${value >= 0 ? '+' : ''}${value}`);
      break;

    case 'set_flag':
      store.setDialogueFlag(target, true);
      break;

    case 'clear_flag':
      store.setDialogueFlag(target, false);
      break;

    case 'unlock_location':
      store.addNotification('info', `Discovered: ${effect.stringValue ?? target}`);
      break;

    case 'change_npc_state':
      break;

    case 'trigger_event':
      break;

    case 'open_shop':
      break;

    default:
      break;
  }
}

/** Apply all effects from a dialogue choice in order. */
export function applyChoiceEffects(
  choice: DialogueChoice,
  store: BridgeStore,
  npcId: string,
): void {
  if (!choice.effects) return;
  for (const effect of choice.effects) {
    applyDialogueEffect(effect, store, npcId);
  }
}

// ============================================================================
// NPC QUEST HELPERS
// ============================================================================

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
