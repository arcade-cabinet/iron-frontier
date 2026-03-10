/**
 * Quest Validation & Utility Functions
 */

import type { ActiveQuest, Objective, Quest, QuestStage } from './schemas.ts';
import { ActiveQuestSchema, ObjectiveSchema, QuestSchema, QuestStageSchema } from './schemas.ts';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateObjective(data: unknown): Objective {
  return ObjectiveSchema.parse(data);
}

export function validateQuestStage(data: unknown): QuestStage {
  return QuestStageSchema.parse(data);
}

export function validateQuest(data: unknown): Quest {
  return QuestSchema.parse(data);
}

export function validateActiveQuest(data: unknown): ActiveQuest {
  return ActiveQuestSchema.parse(data);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function isStageComplete(stage: QuestStage, progress: Record<string, number>): boolean {
  return stage.objectives
    .filter((obj) => !obj.optional)
    .every((obj) => (progress[obj.id] ?? 0) >= obj.count);
}

export function isCurrentStageComplete(quest: Quest, activeQuest: ActiveQuest): boolean {
  const currentStage = quest.stages[activeQuest.currentStageIndex];
  if (!currentStage) return false;
  return isStageComplete(currentStage, activeQuest.objectiveProgress);
}

export function isQuestComplete(quest: Quest, activeQuest: ActiveQuest): boolean {
  const isLastStage = activeQuest.currentStageIndex === quest.stages.length - 1;
  return isLastStage && isCurrentStageComplete(quest, activeQuest);
}

export function getCurrentStage(quest: Quest, activeQuest: ActiveQuest): QuestStage | null {
  return quest.stages[activeQuest.currentStageIndex] ?? null;
}

export function createActiveQuest(questId: string): ActiveQuest {
  return {
    questId,
    status: 'active',
    currentStageIndex: 0,
    objectiveProgress: {},
    startedAt: Date.now(),
    completedAt: null,
    timeRemainingHours: null,
  };
}

export const QUEST_SCHEMA_VERSION = '1.0.0';
