/**
 * Quest Schemas - Barrel export
 */

export {
  ActiveQuestSchema,
  ObjectiveSchema,
  ObjectiveTypeSchema,
  QuestSchema,
  QuestStageSchema,
  QuestStatusSchema,
  QuestTypeSchema,
} from './schemas.ts';
export type {
  ActiveQuest,
  Objective,
  ObjectiveType,
  Quest,
  QuestStage,
  QuestStatus,
  QuestType,
} from './schemas.ts';

export {
  createActiveQuest,
  getCurrentStage,
  isCurrentStageComplete,
  isQuestComplete,
  isStageComplete,
  QUEST_SCHEMA_VERSION,
  validateActiveQuest,
  validateObjective,
  validateQuest,
  validateQuestStage,
} from './utilities.ts';
