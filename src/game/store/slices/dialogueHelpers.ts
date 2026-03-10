/**
 * Dialogue Helpers - Condition evaluation and effect application
 *
 * Pure functions for dialogue condition checking and effect handling,
 * extracted from dialogueSlice to keep it under 300 lines.
 *
 * @module game/store/slices/dialogueHelpers
 */

import type { DialogueCondition, DialogueEffect } from '../../data';
import type { DialogueState } from '../types';

/**
 * State shape needed for condition evaluation.
 */
interface ConditionContext {
  inventory: { itemId: string; quantity: number }[];
  completedQuestIds: string[];
  playerStats: Record<string, number>;
  dialogueState: DialogueState | null;
}

/**
 * Evaluate a dialogue condition against the current state.
 */
export function evaluateDialogueCondition(
  condition: DialogueCondition,
  state: ConditionContext
): boolean {
  switch (condition.type) {
    case 'has_item':
      return state.inventory.some(
        (item) =>
          item.itemId === condition.target &&
          item.quantity >= (condition.value ?? 1)
      );

    case 'quest_complete':
      return condition.target
        ? state.completedQuestIds.includes(condition.target)
        : false;

    case 'quest_active':
      return true;

    case 'gold_gte':
      if (condition.target && condition.value !== undefined) {
        const statValue = state.playerStats[condition.target];
        return typeof statValue === 'number' && statValue >= condition.value;
      }
      return false;

    case 'flag_set':
      if (state.dialogueState && condition.target) {
        return state.dialogueState.conversationFlags[condition.target] === true;
      }
      return false;

    case 'flag_not_set':
      if (state.dialogueState && condition.target) {
        return state.dialogueState.conversationFlags[condition.target] !== true;
      }
      return true;

    default:
      return true;
  }
}

/**
 * State actions needed for applying dialogue effects.
 */
interface EffectContext {
  addItemById: (itemId: string, quantity?: number) => void;
  startQuest: (questId: string) => void;
  setDialogueFlag: (flag: string, value: boolean) => void;
}

/**
 * Apply a dialogue effect to the game state.
 */
export function applyDialogueEffectHelper(
  effect: DialogueEffect,
  state: EffectContext
): void {
  switch (effect.type) {
    case 'give_item':
      if (effect.target) state.addItemById(effect.target, effect.value || 1);
      break;
    case 'start_quest':
      if (effect.target) state.startQuest(effect.target);
      break;
    case 'set_flag':
      if (effect.target) state.setDialogueFlag(effect.target, true);
      break;
    case 'clear_flag':
      if (effect.target) state.setDialogueFlag(effect.target, false);
      break;
    default:
      break;
  }
}
