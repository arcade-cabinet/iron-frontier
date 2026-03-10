/**
 * Quest Schema Definitions - Objectives, stages, quests, and active quests
 */

import { z } from 'zod';

// ============================================================================
// OBJECTIVE TYPES
// ============================================================================

export const ObjectiveTypeSchema = z.enum([
  'kill', 'collect', 'talk', 'visit', 'interact', 'deliver',
]);
export type ObjectiveType = z.infer<typeof ObjectiveTypeSchema>;

// ============================================================================
// OBJECTIVE SCHEMA
// ============================================================================

export const ObjectiveSchema = z.object({
  id: z.string(),
  description: z.string(),
  type: ObjectiveTypeSchema,
  target: z.string(),
  deliverTo: z.string().optional(),
  count: z.number().int().min(1).default(1),
  current: z.number().int().min(0).default(0),
  optional: z.boolean().default(false),
  hidden: z.boolean().default(false),
  hint: z.string().optional(),
  mapMarker: z
    .object({ locationId: z.string(), markerLabel: z.string().optional() })
    .optional(),
  markerTarget: z
    .discriminatedUnion('type', [
      z.object({ type: z.literal('npc'), npcId: z.string() }),
      z.object({ type: z.literal('building'), buildingId: z.string(), locationId: z.string().optional() }),
      z.object({ type: z.literal('location'), locationId: z.string() }),
      z.object({ type: z.literal('marker'), markerId: z.string(), locationId: z.string().optional() }),
    ])
    .optional(),
  completionRadius: z.number().positive().optional(),
});
export type Objective = z.infer<typeof ObjectiveSchema>;

// ============================================================================
// QUEST STAGE SCHEMA
// ============================================================================

export const QuestStageSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  objectives: z.array(ObjectiveSchema).min(1),
  onStartText: z.string().optional(),
  onCompleteText: z.string().optional(),
  stageRewards: z
    .object({
      xp: z.number().int().min(0).default(0),
      gold: z.number().int().min(0).default(0),
      items: z
        .array(z.object({ itemId: z.string(), quantity: z.number().int().min(1).default(1) }))
        .default([]),
      reputation: z.record(z.string(), z.number().int()).default({}),
    })
    .default(() => ({ xp: 0, gold: 0, items: [], reputation: {} })),
});
export type QuestStage = z.infer<typeof QuestStageSchema>;

// ============================================================================
// QUEST STATUS & TYPE
// ============================================================================

export const QuestStatusSchema = z.enum([
  'available', 'active', 'completed', 'failed', 'abandoned',
]);
export type QuestStatus = z.infer<typeof QuestStatusSchema>;

export const QuestTypeSchema = z.enum([
  'main', 'side', 'faction', 'bounty', 'delivery', 'exploration',
]);
export type QuestType = z.infer<typeof QuestTypeSchema>;

// ============================================================================
// QUEST SCHEMA
// ============================================================================

export const QuestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: QuestTypeSchema,
  giverNpcId: z.string().nullable(),
  startLocationId: z.string().optional(),
  recommendedLevel: z.number().int().min(1).max(10).default(1),
  stages: z.array(QuestStageSchema).min(1),
  prerequisites: z
    .object({
      completedQuests: z.array(z.string()).default([]),
      minLevel: z.number().int().min(1).optional(),
      factionReputation: z.record(z.string(), z.number().int()).default({}),
      requiredItems: z.array(z.string()).default([]),
    })
    .default(() => ({ completedQuests: [], factionReputation: {}, requiredItems: [] })),
  rewards: z
    .object({
      xp: z.number().int().min(0).default(0),
      gold: z.number().int().min(0).default(0),
      items: z
        .array(z.object({ itemId: z.string(), quantity: z.number().int().min(1).default(1) }))
        .default([]),
      reputation: z.record(z.string(), z.number().int()).default({}),
      unlocksQuests: z.array(z.string()).default([]),
    })
    .default(() => ({ xp: 0, gold: 0, items: [], reputation: {}, unlocksQuests: [] })),
  tags: z.array(z.string()).default([]),
  repeatable: z.boolean().default(false),
  timeLimitHours: z.number().int().min(1).nullable().default(null),
});
export type Quest = z.infer<typeof QuestSchema>;

// ============================================================================
// ACTIVE QUEST (Runtime State)
// ============================================================================

export const ActiveQuestSchema = z.object({
  questId: z.string(),
  status: QuestStatusSchema,
  currentStageIndex: z.number().int().min(0),
  objectiveProgress: z.record(z.string(), z.number().int().min(0)),
  startedAt: z.number().int(),
  completedAt: z.number().int().nullable().default(null),
  timeRemainingHours: z.number().nullable().default(null),
});
export type ActiveQuest = z.infer<typeof ActiveQuestSchema>;
