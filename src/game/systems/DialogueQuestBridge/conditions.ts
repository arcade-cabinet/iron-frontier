/**
 * DialogueQuestBridge conditions - Condition evaluation for dialogue choices
 *
 * @module systems/DialogueQuestBridge/conditions
 */

import type { DialogueChoice, DialogueCondition } from '../../data/schemas/npc';
import type { BridgeStoreReader } from './types';

/** Evaluate a single DialogueCondition against the current game state. */
export function evaluateCondition(
  condition: DialogueCondition,
  state: BridgeStoreReader,
  /** Optional NPC ID context (used for first_meeting / return_visit when target is unset). */
  contextNpcId?: string,
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

    case 'first_meeting': {
      // When no explicit target, infer from the active dialogue or context param
      const fmNpc = target || contextNpcId || state.dialogueState?.npcId || '';
      return !state.talkedNPCIds.includes(fmNpc);
    }

    case 'return_visit': {
      const rvNpc = target || contextNpcId || state.dialogueState?.npcId || '';
      return state.talkedNPCIds.includes(rvNpc);
    }

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
