/**
 * QuestWiring.ts - Quest event system that connects game events to store actions
 *
 * Subscribes to the QuestEvents bus and drives objective progress in the
 * Zustand store. Each objective type has a dedicated handler that matches
 * incoming events against active quest objectives.
 *
 * Usage:
 *   import { initQuestSystem, teardownQuestSystem } from './QuestWiring';
 *   initQuestSystem(gameStore);
 *
 * @module systems/QuestWiring
 */

import type { GameState } from '../store/types';
import { questEvents, type QuestEventMap, type QuestEventName } from './QuestEvents';

// ============================================================================
// TYPES
// ============================================================================

type StoreApi = {
  getState: () => GameState;
  subscribe: (listener: (state: GameState, prev: GameState) => void) => () => void;
};

/** Unsubscribe handle returned by initQuestSystem. */
export interface QuestSystemHandle {
  teardown: () => void;
}

// ============================================================================
// OBJECTIVE MATCHERS
// ============================================================================

/**
 * For each objective type, check if the given event satisfies it and return
 * the progress delta (0 = no match, >0 = how much to advance).
 */
function matchKill(
  objective: { type: string; target: string },
  data: QuestEventMap['enemyKilled'],
): number {
  if (objective.type !== 'kill') return 0;
  if (objective.target === data.enemyType || objective.target === data.enemyId) return 1;
  return 0;
}

function matchCollect(
  objective: { type: string; target: string },
  data: QuestEventMap['itemPickedUp'],
): number {
  if (objective.type !== 'collect') return 0;
  if (objective.target === data.itemId) return data.quantity;
  return 0;
}

function matchTalk(
  objective: { type: string; target: string },
  data: QuestEventMap['npcTalkedTo'],
): number {
  if (objective.type !== 'talk') return 0;
  if (objective.target === data.npcId) return 1;
  return 0;
}

function matchVisit(
  objective: { type: string; target: string },
  data: QuestEventMap['locationVisited'],
): number {
  if (objective.type !== 'visit') return 0;
  if (objective.target === data.locationId) return 1;
  return 0;
}

function matchDeliver(
  objective: { type: string; target: string; deliverTo?: string },
  data: QuestEventMap['itemDelivered'],
): number {
  if (objective.type !== 'deliver') return 0;
  if (objective.target === data.itemId && objective.deliverTo === data.npcId) return 1;
  return 0;
}

function matchInteract(
  objective: { type: string; target: string },
  data: QuestEventMap['objectInteracted'],
): number {
  if (objective.type !== 'interact') return 0;
  if (objective.target === data.targetId) return 1;
  return 0;
}

// ============================================================================
// PROGRESS UPDATER
// ============================================================================

/**
 * Scan all active quests for objectives matching the event and push progress.
 */
function processEvent<T extends QuestEventName>(
  store: StoreApi,
  eventName: T,
  data: QuestEventMap[T],
): void {
  const state = store.getState();
  const { activeQuests } = state;

  for (const aq of activeQuests) {
    const questDef = state.getQuestDefinition(aq.questId);
    if (!questDef) continue;

    const stage = questDef.stages[aq.currentStageIndex];
    if (!stage) continue;

    for (const obj of stage.objectives) {
      const current = aq.objectiveProgress[obj.id] ?? 0;
      if (current >= obj.count) continue; // already done

      let delta = 0;
      switch (eventName) {
        case 'enemyKilled':
          delta = matchKill(obj, data as QuestEventMap['enemyKilled']);
          break;
        case 'itemPickedUp':
          delta = matchCollect(obj, data as QuestEventMap['itemPickedUp']);
          break;
        case 'npcTalkedTo':
          delta = matchTalk(obj, data as QuestEventMap['npcTalkedTo']);
          break;
        case 'locationVisited':
          delta = matchVisit(obj, data as QuestEventMap['locationVisited']);
          break;
        case 'itemDelivered':
          delta = matchDeliver(
            obj as { type: string; target: string; deliverTo?: string },
            data as QuestEventMap['itemDelivered'],
          );
          break;
        case 'objectInteracted':
          delta = matchInteract(obj, data as QuestEventMap['objectInteracted']);
          break;
        default:
          break;
      }

      if (delta > 0) {
        const next = Math.min(obj.count, current + delta);
        state.updateObjective(aq.questId, obj.id, next);
      }
    }
  }
}

// ============================================================================
// INIT / TEARDOWN
// ============================================================================

/**
 * Wire the quest event bus to the Zustand store. Returns a handle whose
 * `teardown()` removes all listeners.
 *
 * Call once during app bootstrap (e.g. in a React effect or game init).
 */
export function initQuestSystem(store: StoreApi): QuestSystemHandle {
  // Handler references so we can unsubscribe later
  const onEnemyKilled = (d: QuestEventMap['enemyKilled']) =>
    processEvent(store, 'enemyKilled', d);
  const onItemPickedUp = (d: QuestEventMap['itemPickedUp']) =>
    processEvent(store, 'itemPickedUp', d);
  const onNpcTalkedTo = (d: QuestEventMap['npcTalkedTo']) =>
    processEvent(store, 'npcTalkedTo', d);
  const onLocationVisited = (d: QuestEventMap['locationVisited']) =>
    processEvent(store, 'locationVisited', d);
  const onItemDelivered = (d: QuestEventMap['itemDelivered']) =>
    processEvent(store, 'itemDelivered', d);
  const onObjectInteracted = (d: QuestEventMap['objectInteracted']) =>
    processEvent(store, 'objectInteracted', d);

  questEvents.on('enemyKilled', onEnemyKilled);
  questEvents.on('itemPickedUp', onItemPickedUp);
  questEvents.on('npcTalkedTo', onNpcTalkedTo);
  questEvents.on('locationVisited', onLocationVisited);
  questEvents.on('itemDelivered', onItemDelivered);
  questEvents.on('objectInteracted', onObjectInteracted);

  return {
    teardown() {
      questEvents.off('enemyKilled', onEnemyKilled);
      questEvents.off('itemPickedUp', onItemPickedUp);
      questEvents.off('npcTalkedTo', onNpcTalkedTo);
      questEvents.off('locationVisited', onLocationVisited);
      questEvents.off('itemDelivered', onItemDelivered);
      questEvents.off('objectInteracted', onObjectInteracted);
    },
  };
}

/**
 * Convenience: tear down a previously initialised quest system.
 */
export function teardownQuestSystem(handle: QuestSystemHandle): void {
  handle.teardown();
}
