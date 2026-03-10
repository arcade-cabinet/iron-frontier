/**
 * Iron Frontier - Enemy Archetype Templates
 *
 * Daggerfall-style procedural enemy generation templates.
 * Each template defines an enemy type with base stats, scaling factors,
 * name pools, loot tables, and behavior tags.
 *
 * Used by encounterGenerator.ts to spawn enemies with proper stat scaling.
 */

import { z } from 'zod';

// ============================================================================
// ENEMY TEMPLATE SCHEMA
// ============================================================================

/**
 * Base combat stats for an enemy
 */
export const EnemyStatsSchema = z.object({
  /** Base health pool */
  health: z.number().int().min(1),
  /** Base damage per hit */
  damage: z.number().int().min(0),
  /** Base armor/damage reduction */
  armor: z.number().int().min(0),
  /** Base accuracy (0-100) */
  accuracy: z.number().int().min(0).max(100).default(70),
  /** Base evasion (0-100) */
  evasion: z.number().int().min(0).max(100).default(10),
});
export type EnemyStats = z.infer<typeof EnemyStatsSchema>;

/**
 * Scaling factors for level-based stat progression
 */
export const LevelScalingSchema = z.object({
  /** Health multiplier per level (1.0 = base, 1.15 = +15% per level) */
  healthPerLevel: z.number().min(1).max(2).default(1.15),
  /** Damage multiplier per level */
  damagePerLevel: z.number().min(1).max(2).default(1.12),
  /** Armor multiplier per level */
  armorPerLevel: z.number().min(1).max(1.5).default(1.08),
  /** Accuracy bonus per level */
  accuracyPerLevel: z.number().min(0).max(5).default(2),
  /** Evasion bonus per level */
  evasionPerLevel: z.number().min(0).max(5).default(1),
});
export type LevelScaling = z.infer<typeof LevelScalingSchema>;

/**
 * Name generation pools for enemy variety
 */
export const EnemyNamePoolSchema = z.object({
  /** Prefix adjectives (e.g., "Dusty", "Scarred", "Mean") */
  prefixes: z.array(z.string()).default([]),
  /** Title variants (e.g., "Boss", "Captain") */
  titles: z.array(z.string()).default([]),
  /** Name suffixes or epithets */
  suffixes: z.array(z.string()).default([]),
});
export type EnemyNamePool = z.infer<typeof EnemyNamePoolSchema>;

/**
 * Behavior tags for AI and combat style
 */
export const BehaviorTagSchema = z.enum([
  // Combat style
  'aggressive', // Attacks on sight, pursues
  'defensive', // Waits for player to engage
  'ranged', // Prefers ranged attacks
  'melee', // Prefers close combat
  'ambusher', // Sets up ambushes, surprise attacks
  'flanker', // Tries to get behind targets

  // Movement
  'mobile', // Frequently repositions
  'stationary', // Holds position
  'charges', // Rushes toward target
  'retreats', // Falls back when hurt

  // Special behaviors
  'pack_tactics', // Coordinates with allies
  'berserker', // More dangerous when wounded
  'coward', // Flees when outmatched
  'leader', // Buffs nearby allies
  'healer', // Can heal allies

  // Condition effects
  'poisonous', // Applies poison
  'bleeding', // Causes bleed
  'stunning', // Can stun targets

  // AI traits
  'smart', // Uses cover, tactical positioning
  'dumb', // Predictable behavior
  'erratic', // Random actions
]);
export type BehaviorTag = z.infer<typeof BehaviorTagSchema>;

/**
 * Enemy template definition
 */
export const EnemyTemplateSchema = z.object({
  /** Template identifier - matches enemyIdOrTag in encounters */
  id: z.string(),
  /** Display name */
  name: z.string(),
  /** Description for bestiary/tooltips */
  description: z.string(),
  /** Base stats before scaling */
  baseStats: EnemyStatsSchema,
  /** Level scaling configuration */
  scaling: LevelScalingSchema.default(() => ({
    healthPerLevel: 1.15,
    damagePerLevel: 1.12,
    armorPerLevel: 1.08,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  })),
  /** Name generation pools */
  namePool: EnemyNamePoolSchema.default(() => ({
    prefixes: [],
    titles: [],
    suffixes: [],
  })),
  /** Loot table ID reference */
  lootTableId: z.string().optional(),
  /** Behavior tags for AI */
  behaviorTags: z.array(BehaviorTagSchema).default([]),
  /** Faction associations */
  factions: z.array(z.string()).default([]),
  /** Combat tags for encounter filtering */
  combatTags: z.array(z.string()).default([]),
  /** XP value modifier (1.0 = standard) */
  xpModifier: z.number().min(0.1).max(5).default(1),
  /** Minimum level this enemy spawns */
  minLevel: z.number().int().min(1).default(1),
  /** Maximum level for this enemy */
  maxLevel: z.number().int().min(1).max(10).default(10),
});
export type EnemyTemplate = z.infer<typeof EnemyTemplateSchema>;