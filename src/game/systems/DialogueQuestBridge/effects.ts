/**
 * DialogueQuestBridge effects - Apply dialogue effects to store/quest bus
 *
 * @module systems/DialogueQuestBridge/effects
 */

import type { DialogueChoice, DialogueEffect } from '../../data/schemas/npc';
import { questEvents } from '../QuestEvents';
import type { BridgeStore } from './types';

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
      store.updatePlayerStats({ reputation: store.playerStats.reputation + value });
      store.addNotification('info', `Reputation ${value >= 0 ? '+' : ''}${value}`);
      break;

    case 'set_flag':
      store.setDialogueFlag(target, true);
      break;

    case 'clear_flag':
      store.setDialogueFlag(target, false);
      break;

    case 'unlock_location':
      store.discoverLocation(target);
      store.addNotification('info', `Discovered: ${effect.stringValue ?? target}`);
      break;

    case 'change_npc_state':
      break;

    case 'trigger_event':
      break;

    case 'open_shop':
      if (target) {
        store.openShop(target);
      }
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
