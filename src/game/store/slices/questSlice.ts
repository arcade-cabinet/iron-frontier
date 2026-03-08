/**
 * Quest Slice - Quest state and actions
 *
 * Manages active, completed, and failed quests along with
 * objective tracking and quest rewards.
 *
 * @module game/store/slices/questSlice
 */

import type { StateCreator } from 'zustand';
import type { ActiveQuest, Quest } from '../../data';
import type { Notification } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Data access interface for quest operations.
 */
export interface QuestDataAccess {
  getQuestById: (questId: string) => Quest | undefined;
  createActiveQuest: (questId: string) => ActiveQuest;
  isCurrentStageComplete: (quest: Quest, activeQuest: ActiveQuest) => boolean;
}

/**
 * Quest state data (serializable).
 */
export interface QuestState {
  /** Currently active quests */
  activeQuests: ActiveQuest[];
  /** Completed quest definitions */
  completedQuests: Quest[];
  /** IDs of completed quests (for quick lookup) */
  completedQuestIds: string[];
}

/**
 * Quest actions.
 */
export interface QuestActions {
  /** Start a new quest by ID */
  startQuest: (questId: string) => void;
  /** Update progress on a specific objective */
  updateObjective: (questId: string, objectiveId: string, progress: number) => void;
  /** Advance to the next stage of a quest */
  advanceQuestStage: (questId: string) => void;
  /** Complete a quest */
  completeQuest: (questId: string) => void;
  /** Fail a quest */
  failQuest: (questId: string) => void;
  /** Abandon a quest */
  abandonQuest: (questId: string) => void;
  /** Get an active quest by ID */
  getActiveQuest: (questId: string) => ActiveQuest | undefined;
  /** Get quest definition by ID */
  getQuestDefinition: (questId: string) => Quest | undefined;
  /** Check if a quest is completed */
  isQuestCompleted: (questId: string) => boolean;
  /** Check if a quest is active */
  isQuestActive: (questId: string) => boolean;
  /** Reset all quests */
  resetQuests: () => void;
}

/**
 * Dependencies from other slices.
 */
export interface QuestSliceDeps {
  addNotification: (type: Notification['type'], message: string) => void;
  gainXP: (amount: number) => void;
  addGold: (amount: number) => void;
  addItemById: (itemId: string, quantity?: number) => void;
}

/**
 * Complete quest slice type.
 */
export type QuestSlice = QuestState & QuestActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default quest state.
 */
export const DEFAULT_QUEST_STATE: QuestState = {
  activeQuests: [],
  completedQuests: [],
  completedQuestIds: [],
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the quest Zustand slice.
 *
 * @param dataAccess - Data access interface for quest definitions
 */
export const createQuestSlice = (
  dataAccess: QuestDataAccess
): StateCreator<QuestSlice & QuestSliceDeps, [], [], QuestSlice> => {
  return (set, get) => ({
    // State
    ...DEFAULT_QUEST_STATE,

    // Actions
    startQuest: (questId: string) => {
      const def = dataAccess.getQuestById(questId);
      if (!def) return;

      // Check if already active or completed
      const state = get();
      if (state.activeQuests.some((q) => q.questId === questId)) return;
      if (state.completedQuestIds.includes(questId)) return;

      const active = dataAccess.createActiveQuest(questId);
      set((s) => ({
        activeQuests: [...s.activeQuests, active],
      }));
      state.addNotification('quest', `Started: ${def.title}`);
    },

    updateObjective: (questId: string, objectiveId: string, progress: number) => {
      const state = get();
      const questDef = dataAccess.getQuestById(questId);
      const activeQuest = state.activeQuests.find((q) => q.questId === questId);
      if (!questDef || !activeQuest) return;

      const currentStage = questDef.stages[activeQuest.currentStageIndex];
      if (!currentStage) return;

      const objective = currentStage.objectives.find(
        (obj: { id: string; count: number }) => obj.id === objectiveId
      );
      if (!objective) return;

      const wasComplete = dataAccess.isCurrentStageComplete(questDef, activeQuest);
      const nextProgress = Math.min(objective.count, Math.max(0, progress));
      const updatedQuest = {
        ...activeQuest,
        objectiveProgress: {
          ...activeQuest.objectiveProgress,
          [objectiveId]: nextProgress,
        },
      };

      set((s) => ({
        activeQuests: s.activeQuests.map((q) =>
          q.questId === questId ? updatedQuest : q
        ),
      }));

      const isComplete = dataAccess.isCurrentStageComplete(questDef, updatedQuest);
      if (!wasComplete && isComplete) {
        get().advanceQuestStage(questId);
      }
    },

    advanceQuestStage: (questId: string) => {
      const state = get();
      const questDef = dataAccess.getQuestById(questId);
      const activeQuest = state.activeQuests.find((q) => q.questId === questId);
      if (!questDef || !activeQuest) return;

      const currentStage = questDef.stages[activeQuest.currentStageIndex];
      if (!currentStage) return;

      // Stage rewards
      if (currentStage.stageRewards?.xp) state.gainXP(currentStage.stageRewards.xp);
      if (currentStage.stageRewards?.gold) state.addGold(currentStage.stageRewards.gold);
      if (currentStage.stageRewards?.items?.length) {
        currentStage.stageRewards.items.forEach(
          (item: { itemId: string; quantity: number }) =>
            state.addItemById(item.itemId, item.quantity)
        );
      }

      if (currentStage.onCompleteText) {
        state.addNotification('quest', currentStage.onCompleteText);
      } else {
        state.addNotification('quest', `Stage complete: ${currentStage.title}`);
      }

      const isLastStage = activeQuest.currentStageIndex >= questDef.stages.length - 1;
      if (isLastStage) {
        get().completeQuest(questId);
        return;
      }

      const nextStageIndex = activeQuest.currentStageIndex + 1;
      const nextStage = questDef.stages[nextStageIndex];

      set((s) => ({
        activeQuests: s.activeQuests.map((q) =>
          q.questId === questId
            ? {
                ...q,
                currentStageIndex: nextStageIndex,
                objectiveProgress: {},
              }
            : q
        ),
      }));

      if (nextStage?.onStartText) {
        state.addNotification('quest', nextStage.onStartText);
      }
    },

    completeQuest: (questId: string) => {
      const state = get();
      const quest = state.activeQuests.find((q) => q.questId === questId);
      if (!quest) return;

      const def = dataAccess.getQuestById(questId);
      if (!def) return;

      set((s) => ({
        activeQuests: s.activeQuests.filter((q) => q.questId !== questId),
        completedQuests: [...s.completedQuests, def],
        completedQuestIds: [...s.completedQuestIds, questId],
      }));

      // Give rewards
      if (def.rewards?.xp) state.gainXP(def.rewards.xp);
      if (def.rewards?.gold) state.addGold(def.rewards.gold);
      if (def.rewards?.items?.length) {
        def.rewards.items.forEach((item: { itemId: string; quantity: number }) =>
          state.addItemById(item.itemId, item.quantity)
        );
      }

      state.addNotification('quest', `Completed: ${def.title}`);
    },

    failQuest: (questId: string) => {
      set((s) => ({
        activeQuests: s.activeQuests.filter((q) => q.questId !== questId),
      }));
    },

    abandonQuest: (questId: string) => {
      set((s) => ({
        activeQuests: s.activeQuests.filter((q) => q.questId !== questId),
      }));
    },

    getActiveQuest: (questId: string) =>
      get().activeQuests.find((q) => q.questId === questId),

    getQuestDefinition: (questId: string) => dataAccess.getQuestById(questId),

    isQuestCompleted: (questId: string) => get().completedQuestIds.includes(questId),

    isQuestActive: (questId: string) =>
      get().activeQuests.some((q) => q.questId === questId),

    resetQuests: () =>
      set({
        ...DEFAULT_QUEST_STATE,
      }),
  });
};
