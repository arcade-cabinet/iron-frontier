/**
 * Iron Frontier - Ending Schema Definitions
 *
 * Zod-backed schemas for the multiple endings system.
 * Endings are determined by player choices throughout the game.
 *
 * Architecture:
 * - Ending: Definition of a game ending with conditions and content
 * - EndingCondition: Requirements to trigger an ending
 * - CharacterFate: What happens to NPCs in each ending
 * - Epilogue: Narrative slides shown after completion
 *
 * Design principles:
 * - Endings are earned through consistent choices, not single decisions
 * - Multiple endings can be "unlocked" but only one is shown
 * - Character fates depend on player relationships and choices
 * - Statistics track meaningful decisions throughout the game
 */

import { z } from 'zod';

// ============================================================================
// ENDING PATH
// ============================================================================

/**
 * The primary faction/path that leads to this ending
 */
export const EndingPathSchema = z.enum([
  'ivrc', // Sided with IVRC/Thorne - Corporate Victory
  'copperhead', // Sided with Diamondback - Revolution
  'freeminer', // Sided with Samuel - Peaceful Reform
  'law', // Sided with Sheriff Cole - Lawman's Justice
  'underground', // Helped workers escape - Exodus
  'independent', // Rejected all factions - Lone Wolf
]);
export type EndingPath = z.infer<typeof EndingPathSchema>;

// ============================================================================
// ENDING CONDITIONS
// ============================================================================

/**
 * Condition types for determining ending eligibility
 */
export const EndingConditionTypeSchema = z.enum([
  'quest_completed', // Specific quest was completed
  'quest_failed', // Specific quest was failed
  'reputation_gte', // Faction reputation >= threshold
  'reputation_lte', // Faction reputation <= threshold
  'flag_set', // Game flag is true
  'flag_not_set', // Game flag is false
  'npc_alive', // NPC is still alive
  'npc_dead', // NPC was killed
  'choice_made', // Specific dialogue/quest choice was made
  'items_collected', // Player collected specific items
  'people_saved_gte', // Number of people saved >= threshold
  'people_killed_gte', // Number of people killed >= threshold
]);
export type EndingConditionType = z.infer<typeof EndingConditionTypeSchema>;

/**
 * A single condition that must be met for an ending
 */
export const EndingConditionSchema = z.object({
  /** Type of condition */
  type: EndingConditionTypeSchema,

  /** Target identifier (quest ID, flag name, NPC ID, etc.) */
  target: z.string().optional(),

  /** Numeric value for thresholds */
  value: z.number().optional(),

  /** Whether this condition is required (vs. contributing to score) */
  required: z.boolean().default(true),

  /** Weight for scoring (higher = more important for ending selection) */
  weight: z.number().min(0).max(100).default(10),

  /** Description of this condition (for debugging/dev tools) */
  description: z.string().optional(),
});
export type EndingCondition = z.infer<typeof EndingConditionSchema>;

// ============================================================================
// CHARACTER FATE
// ============================================================================

/**
 * Possible fates for characters in endings
 */
export const FateTypeSchema = z.enum([
  'alive_happy', // Character survives and thrives
  'alive_neutral', // Character survives but unchanged
  'alive_struggling', // Character survives but faces hardship
  'alive_villain', // Character survives but turns villainous
  'dead_heroic', // Character died heroically
  'dead_tragic', // Character died tragically
  'dead_justice', // Character died as justice was served
  'departed', // Character left the region
  'unknown', // Character's fate is unclear
  'imprisoned', // Character was imprisoned
  'redeemed', // Character was redeemed from villainy
]);
export type FateType = z.infer<typeof FateTypeSchema>;

/**
 * What happens to a specific character in an ending
 */
export const CharacterFateSchema = z.object({
  /** NPC ID */
  npcId: z.string(),

  /** Character's display name (for epilogue slides) */
  displayName: z.string(),

  /** What happens to them */
  fate: FateTypeSchema,

  /** Narrative description of their fate */
  description: z.string(),

  /** Conditions for this specific fate (if different from default) */
  conditions: z.array(EndingConditionSchema).optional(),

  /** Priority when multiple fates match (higher wins) */
  priority: z.number().int().min(0).default(0),
});
export type CharacterFate = z.infer<typeof CharacterFateSchema>;

// ============================================================================
// EPILOGUE SLIDE
// ============================================================================

/**
 * A single narrative slide shown during the ending sequence
 */
export const EpilogueSlideSchema = z.object({
  /** Unique ID for this slide */
  id: z.string(),

  /** Slide title (optional, shown as header) */
  title: z.string().optional(),

  /** Main narrative text */
  text: z.string(),

  /** Image/scene key for visual background */
  imageKey: z.string().optional(),

  /** Character this slide is about (for portrait) */
  characterId: z.string().optional(),

  /** Duration in seconds before auto-advance (null = wait for input) */
  duration: z.number().min(0).nullable().optional(),

  /** Tags for categorization */
  tags: z.array(z.string()).default([]),
});
export type EpilogueSlide = z.infer<typeof EpilogueSlideSchema>;

// ============================================================================
// ENDING DEFINITION
// ============================================================================

/**
 * Complete definition of a game ending
 */
export const EndingSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name shown to player */
  title: z.string(),

  /** Short tagline summarizing the ending */
  tagline: z.string(),

  /** Full description of the ending's narrative */
  description: z.string(),

  /** Primary path/faction this ending represents */
  path: EndingPathSchema,

  /** Is this considered a "good" ending? Affects achievement */
  isGoodEnding: z.boolean().default(false),

  /** Is this a secret/hidden ending? */
  isSecret: z.boolean().default(false),

  /** Conditions required to unlock this ending */
  conditions: z.array(EndingConditionSchema).min(1),

  /** Minimum score from weighted conditions to qualify (0-100) */
  minimumScore: z.number().min(0).max(100).default(50),

  /** Priority when multiple endings qualify (higher = preferred) */
  priority: z.number().int().min(0).default(0),

  /** Character fates specific to this ending */
  characterFates: z.array(CharacterFateSchema).default([]),

  /** Epilogue slides shown in sequence */
  epilogueSlides: z.array(EpilogueSlideSchema).min(1),

  /** Final statistics message (uses placeholders like {peopleSaved}) */
  statisticsTemplate: z.string().optional(),

  /** Unlocks for completing this ending (achievements, new game+, etc.) */
  unlocks: z
    .array(
      z.object({
        type: z.enum(['achievement', 'new_game_plus', 'gallery', 'music', 'custom']),
        id: z.string(),
        name: z.string(),
      })
    )
    .default([]),

  /** Tags for categorization */
  tags: z.array(z.string()).default([]),
});
export type Ending = z.infer<typeof EndingSchema>;

// ============================================================================
// PLAYER STATISTICS
// ============================================================================

/**
 * Statistics tracked throughout the game for ending display
 */
export const PlayerStatisticsSchema = z.object({
  /** Number of people directly saved by player actions */
  peopleSaved: z.number().int().min(0).default(0),

  /** Number of people killed by player (combat or choice) */
  peopleKilled: z.number().int().min(0).default(0),

  /** Number of quests completed */
  questsCompleted: z.number().int().min(0).default(0),

  /** Number of quests failed */
  questsFailed: z.number().int().min(0).default(0),

  /** Major choices made (key decision points) */
  majorChoices: z.array(z.string()).default([]),

  /** NPCs befriended (high reputation) */
  npcsBefriended: z.array(z.string()).default([]),

  /** NPCs alienated (low reputation) */
  npcsAlienated: z.array(z.string()).default([]),

  /** Gold earned total */
  goldEarned: z.number().int().min(0).default(0),

  /** Gold spent total */
  goldSpent: z.number().int().min(0).default(0),

  /** Days survived */
  daysSurvived: z.number().int().min(0).default(0),

  /** Combats won */
  combatsWon: z.number().int().min(0).default(0),

  /** Combats fled */
  combatsFled: z.number().int().min(0).default(0),

  /** Times knocked unconscious */
  timesKnockedOut: z.number().int().min(0).default(0),

  /** Highest faction reputation achieved */
  highestReputation: z
    .object({
      factionId: z.string(),
      value: z.number().int(),
    })
    .optional(),

  /** Lowest faction reputation */
  lowestReputation: z
    .object({
      factionId: z.string(),
      value: z.number().int(),
    })
    .optional(),
});
export type PlayerStatistics = z.infer<typeof PlayerStatisticsSchema>;

// ============================================================================
// ENDING STATE (Runtime)
// ============================================================================

/**
 * Runtime state for ending evaluation and display
 */
export const EndingStateSchema = z.object({
  /** The selected ending ID */
  selectedEndingId: z.string(),

  /** Score that qualified this ending */
  qualificationScore: z.number().min(0).max(100),

  /** All endings that were available (for debug/achievements) */
  availableEndingIds: z.array(z.string()),

  /** Resolved character fates */
  characterFates: z.array(CharacterFateSchema),

  /** Current slide index during epilogue */
  currentSlideIndex: z.number().int().min(0).default(0),

  /** Player's final statistics */
  statistics: PlayerStatisticsSchema,

  /** When ending sequence started */
  startedAt: z.number().int(),

  /** When ending sequence completed */
  completedAt: z.number().int().nullable().default(null),
});
export type EndingState = z.infer<typeof EndingStateSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateEndingCondition(data: unknown): EndingCondition {
  return EndingConditionSchema.parse(data);
}

export function validateCharacterFate(data: unknown): CharacterFate {
  return CharacterFateSchema.parse(data);
}

export function validateEpilogueSlide(data: unknown): EpilogueSlide {
  return EpilogueSlideSchema.parse(data);
}

export function validateEnding(data: unknown): Ending {
  return EndingSchema.parse(data);
}

export function validatePlayerStatistics(data: unknown): PlayerStatistics {
  return PlayerStatisticsSchema.parse(data);
}

export function validateEndingState(data: unknown): EndingState {
  return EndingStateSchema.parse(data);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate the qualification score for an ending based on conditions met
 */
export function calculateEndingScore(
  ending: Ending,
  checkCondition: (condition: EndingCondition) => boolean
): number {
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const condition of ending.conditions) {
    totalWeight += condition.weight;
    if (checkCondition(condition)) {
      earnedWeight += condition.weight;
    } else if (condition.required) {
      // If a required condition is not met, score is 0
      return 0;
    }
  }

  // Avoid division by zero
  if (totalWeight === 0) {
    return 100;
  }

  return Math.round((earnedWeight / totalWeight) * 100);
}

/**
 * Check if all required conditions for an ending are met
 */
export function areRequiredConditionsMet(
  ending: Ending,
  checkCondition: (condition: EndingCondition) => boolean
): boolean {
  return ending.conditions.filter((c) => c.required).every(checkCondition);
}

/**
 * Select the best ending from available endings based on score and priority
 */
export function selectBestEnding(
  endings: Ending[],
  checkCondition: (condition: EndingCondition) => boolean
): { ending: Ending; score: number } | null {
  const qualified: { ending: Ending; score: number }[] = [];

  for (const ending of endings) {
    const score = calculateEndingScore(ending, checkCondition);
    if (score >= ending.minimumScore) {
      qualified.push({ ending, score });
    }
  }

  if (qualified.length === 0) {
    return null;
  }

  // Sort by priority (desc), then by score (desc)
  qualified.sort((a, b) => {
    const priorityDiff = b.ending.priority - a.ending.priority;
    if (priorityDiff !== 0) return priorityDiff;
    return b.score - a.score;
  });

  return qualified[0];
}

/**
 * Get all available endings based on current game state
 */
export function getAvailableEndings(
  endings: Ending[],
  checkCondition: (condition: EndingCondition) => boolean
): { ending: Ending; score: number }[] {
  const available: { ending: Ending; score: number }[] = [];

  for (const ending of endings) {
    const score = calculateEndingScore(ending, checkCondition);
    if (score >= ending.minimumScore) {
      available.push({ ending, score });
    }
  }

  return available.sort((a, b) => b.score - a.score);
}

/**
 * Resolve character fates for an ending based on conditions
 */
export function resolveCharacterFates(
  ending: Ending,
  checkCondition: (condition: EndingCondition) => boolean
): CharacterFate[] {
  const resolved: CharacterFate[] = [];

  for (const fate of ending.characterFates) {
    // Check if this fate's conditions are met (if any)
    if (fate.conditions && fate.conditions.length > 0) {
      const conditionsMet = fate.conditions.every(checkCondition);
      if (!conditionsMet) continue;
    }

    // Check if we already have a fate for this character
    const existingIndex = resolved.findIndex((f) => f.npcId === fate.npcId);
    if (existingIndex >= 0) {
      // Replace if higher priority
      if (fate.priority > resolved[existingIndex].priority) {
        resolved[existingIndex] = fate;
      }
    } else {
      resolved.push(fate);
    }
  }

  return resolved;
}

/**
 * Format statistics template with actual values
 */
export function formatStatisticsMessage(
  template: string,
  statistics: PlayerStatistics
): string {
  return template
    .replace(/{peopleSaved}/g, statistics.peopleSaved.toString())
    .replace(/{peopleKilled}/g, statistics.peopleKilled.toString())
    .replace(/{questsCompleted}/g, statistics.questsCompleted.toString())
    .replace(/{questsFailed}/g, statistics.questsFailed.toString())
    .replace(/{daysSurvived}/g, statistics.daysSurvived.toString())
    .replace(/{combatsWon}/g, statistics.combatsWon.toString())
    .replace(/{goldEarned}/g, statistics.goldEarned.toString())
    .replace(/{goldSpent}/g, statistics.goldSpent.toString())
    .replace(/{npcsBefriended}/g, statistics.npcsBefriended.length.toString())
    .replace(/{npcsAlienated}/g, statistics.npcsAlienated.length.toString());
}

/**
 * Create initial player statistics
 */
export function createInitialStatistics(): PlayerStatistics {
  return {
    peopleSaved: 0,
    peopleKilled: 0,
    questsCompleted: 0,
    questsFailed: 0,
    majorChoices: [],
    npcsBefriended: [],
    npcsAlienated: [],
    goldEarned: 0,
    goldSpent: 0,
    daysSurvived: 0,
    combatsWon: 0,
    combatsFled: 0,
    timesKnockedOut: 0,
  };
}

export const ENDING_SCHEMA_VERSION = '1.0.0';
