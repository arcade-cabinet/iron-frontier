/**
 * Iron Frontier - Quest Schema Definitions
 *
 * Zod-backed schemas for the quest system.
 * Quests are multi-stage journeys with objectives, rewards, and narrative.
 *
 * Architecture:
 * - Quest: Top-level container with metadata and stages
 * - QuestStage: A phase of the quest with its own objectives
 * - Objective: A trackable goal (kill, collect, talk, visit)
 *
 * Design principles:
 * - Quests are data-driven and declarative
 * - Stage progression is explicit (not automatic)
 * - Objectives can be completed in any order within a stage
 * - Rewards are granted per-stage and on quest completion
 */

import { z } from 'zod';

// ============================================================================
// OBJECTIVE TYPES
// ============================================================================

/**
 * Objective types define what the player must do.
 *
 * - kill: Defeat specific enemies or enemy types
 * - collect: Gather items (loot, pickup, craft)
 * - talk: Speak to specific NPCs
 * - visit: Reach a location or marker
 * - interact: Use/activate something in the world
 * - deliver: Bring item to NPC/location
 */
export const ObjectiveTypeSchema = z.enum([
  'kill',
  'collect',
  'talk',
  'visit',
  'interact',
  'deliver',
]);
export type ObjectiveType = z.infer<typeof ObjectiveTypeSchema>;

// ============================================================================
// OBJECTIVE SCHEMA
// ============================================================================

/**
 * A single trackable objective within a quest stage.
 */
export const ObjectiveSchema = z.object({
  /** Unique ID within the quest */
  id: z.string(),

  /** Human-readable description shown to player */
  description: z.string(),

  /** Type of objective */
  type: ObjectiveTypeSchema,

  /**
   * Target identifier - meaning depends on type:
   * - kill: enemy ID or enemy type
   * - collect: item ID
   * - talk: NPC ID
   * - visit: location ID or marker ID
   * - interact: interactable ID
   * - deliver: item ID (deliverTo specifies recipient)
   */
  target: z.string(),

  /**
   * Delivery destination (for 'deliver' type)
   * Can be NPC ID or location marker ID
   */
  deliverTo: z.string().optional(),

  /** Required count to complete (default: 1) */
  count: z.number().int().min(1).default(1),

  /** Current progress (runtime state, starts at 0) */
  current: z.number().int().min(0).default(0),

  /** Is this objective optional? */
  optional: z.boolean().default(false),

  /** Is this objective hidden until discovered? */
  hidden: z.boolean().default(false),

  /** Hint text shown when objective is active */
  hint: z.string().optional(),

  /**
   * Map marker information for this objective.
   * If provided, shows on minimap/world map when objective is active.
   */
  mapMarker: z.object({
    locationId: z.string(),
    markerLabel: z.string().optional(),
  }).optional(),
});
export type Objective = z.infer<typeof ObjectiveSchema>;

// ============================================================================
// QUEST STAGE SCHEMA
// ============================================================================

/**
 * A stage represents a phase of the quest.
 * Each stage has its own objectives that must be completed to advance.
 */
export const QuestStageSchema = z.object({
  /** Unique ID within the quest */
  id: z.string(),

  /** Stage title (e.g., "Find the Address") */
  title: z.string(),

  /** Narrative description for this stage */
  description: z.string(),

  /** Objectives for this stage */
  objectives: z.array(ObjectiveSchema).min(1),

  /**
   * Dialogue or journal entry shown when stage begins.
   * This is the "quest update" text.
   */
  onStartText: z.string().optional(),

  /**
   * Dialogue or journal entry shown when stage completes.
   */
  onCompleteText: z.string().optional(),

  /**
   * Rewards granted when this stage completes.
   * Main quest reward is granted on final stage.
   */
  stageRewards: z.object({
    xp: z.number().int().min(0).default(0),
    gold: z.number().int().min(0).default(0),
    items: z.array(z.object({
      itemId: z.string(),
      quantity: z.number().int().min(1).default(1),
    })).default([]),
    reputation: z.record(z.string(), z.number().int()).default({}),
  }).default({}),
});
export type QuestStage = z.infer<typeof QuestStageSchema>;

// ============================================================================
// QUEST STATUS
// ============================================================================

export const QuestStatusSchema = z.enum([
  'available',    // Can be started
  'active',       // Currently in progress
  'completed',    // Successfully finished
  'failed',       // Failed (time limit, wrong choice, etc.)
  'abandoned',    // Player dropped it
]);
export type QuestStatus = z.infer<typeof QuestStatusSchema>;

// ============================================================================
// QUEST TYPE
// ============================================================================

export const QuestTypeSchema = z.enum([
  'main',         // Main storyline quest
  'side',         // Optional side quest
  'faction',      // Faction reputation quest
  'bounty',       // Kill target for reward
  'delivery',     // Fetch/deliver quest
  'exploration',  // Discover locations
]);
export type QuestType = z.infer<typeof QuestTypeSchema>;

// ============================================================================
// QUEST SCHEMA
// ============================================================================

/**
 * A complete quest definition.
 * Quests are multi-stage, with tracked objectives and rewards.
 */
export const QuestSchema = z.object({
  /** Unique quest identifier */
  id: z.string(),

  /** Display title */
  title: z.string(),

  /** Brief description shown in quest log */
  description: z.string(),

  /** Quest type (main, side, etc.) */
  type: QuestTypeSchema,

  /** Quest giver NPC ID (null for auto-triggered quests) */
  giverNpcId: z.string().nullable(),

  /** Location where quest can be started */
  startLocationId: z.string().optional(),

  /** Level recommendation */
  recommendedLevel: z.number().int().min(1).max(10).default(1),

  /** Ordered stages of the quest */
  stages: z.array(QuestStageSchema).min(1),

  /**
   * Prerequisites to start this quest.
   * All must be satisfied.
   */
  prerequisites: z.object({
    /** Quests that must be completed first */
    completedQuests: z.array(z.string()).default([]),
    /** Minimum player level */
    minLevel: z.number().int().min(1).optional(),
    /** Required faction reputation (factionId -> min rep) */
    factionReputation: z.record(z.string(), z.number().int()).default({}),
    /** Required items in inventory */
    requiredItems: z.array(z.string()).default([]),
  }).default({}),

  /**
   * Final rewards granted on quest completion.
   * These are IN ADDITION to any stage rewards.
   */
  rewards: z.object({
    xp: z.number().int().min(0).default(0),
    gold: z.number().int().min(0).default(0),
    items: z.array(z.object({
      itemId: z.string(),
      quantity: z.number().int().min(1).default(1),
    })).default([]),
    reputation: z.record(z.string(), z.number().int()).default({}),
    /** Unlocks new quests */
    unlocksQuests: z.array(z.string()).default([]),
  }),

  /**
   * Tags for categorization and filtering.
   * Examples: ["combat", "investigation", "ivrc", "copperhead"]
   */
  tags: z.array(z.string()).default([]),

  /** Is this quest repeatable? */
  repeatable: z.boolean().default(false),

  /** Time limit in game-hours (null = no limit) */
  timeLimitHours: z.number().int().min(1).nullable().default(null),
});
export type Quest = z.infer<typeof QuestSchema>;

// ============================================================================
// ACTIVE QUEST (Runtime State)
// ============================================================================

/**
 * Runtime state for an active quest instance.
 * This extends the quest definition with player progress.
 */
export const ActiveQuestSchema = z.object({
  /** Reference to quest definition */
  questId: z.string(),

  /** Current status */
  status: QuestStatusSchema,

  /** Index of current stage (0-based) */
  currentStageIndex: z.number().int().min(0),

  /**
   * Objective progress for current stage.
   * Maps objective ID to current count.
   */
  objectiveProgress: z.record(z.string(), z.number().int().min(0)),

  /** When the quest was started (timestamp) */
  startedAt: z.number().int(),

  /** When the quest was completed (timestamp, null if not done) */
  completedAt: z.number().int().nullable().default(null),

  /** Game-time remaining if time-limited (null if no limit) */
  timeRemainingHours: z.number().nullable().default(null),
});
export type ActiveQuest = z.infer<typeof ActiveQuestSchema>;

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

/**
 * Check if all required objectives in a stage are complete.
 */
export function isStageComplete(
  stage: QuestStage,
  progress: Record<string, number>
): boolean {
  return stage.objectives
    .filter(obj => !obj.optional)
    .every(obj => (progress[obj.id] ?? 0) >= obj.count);
}

/**
 * Check if a quest's current stage is complete.
 */
export function isCurrentStageComplete(
  quest: Quest,
  activeQuest: ActiveQuest
): boolean {
  const currentStage = quest.stages[activeQuest.currentStageIndex];
  if (!currentStage) return false;
  return isStageComplete(currentStage, activeQuest.objectiveProgress);
}

/**
 * Check if the entire quest is complete.
 */
export function isQuestComplete(
  quest: Quest,
  activeQuest: ActiveQuest
): boolean {
  // Must be on the last stage and that stage must be complete
  const isLastStage = activeQuest.currentStageIndex === quest.stages.length - 1;
  return isLastStage && isCurrentStageComplete(quest, activeQuest);
}

/**
 * Get the current stage of an active quest.
 */
export function getCurrentStage(
  quest: Quest,
  activeQuest: ActiveQuest
): QuestStage | null {
  return quest.stages[activeQuest.currentStageIndex] ?? null;
}

/**
 * Create initial ActiveQuest state from a Quest definition.
 */
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
