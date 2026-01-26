/**
 * Iron Frontier - Lore Codex Schema Definitions
 *
 * Zod-backed schemas for the discoverable lore codex system.
 * This is the player-facing collection of world lore that gets
 * unlocked through exploration, dialogue, and quest completion.
 *
 * Design principles:
 * - Lore entries are authored content (not procedural)
 * - Each entry has unlock conditions
 * - Categories organize entries for browsing
 * - Rich text supports multi-paragraph narrative
 */

import { z } from 'zod';

// ============================================================================
// LORE CATEGORIES
// ============================================================================

/**
 * Categories for organizing lore entries in the codex
 */
export const LoreCategorySchema = z.enum([
  'history', // Past events and timeline
  'factions', // Organizations and groups
  'locations', // Places in the world
  'technology', // Steam tech and innovations
  'characters', // Notable people and legends
]);
export type LoreCategory = z.infer<typeof LoreCategorySchema>;

// ============================================================================
// DISCOVERY CONDITIONS
// ============================================================================

/**
 * Types of conditions that can unlock a lore entry
 */
export const DiscoveryConditionTypeSchema = z.enum([
  'automatic', // Unlocked from game start
  'visit_location', // Visit a specific location
  'talk_to_npc', // Talk to a specific NPC
  'complete_quest', // Complete a specific quest
  'find_item', // Find or pick up a specific item
  'read_book', // Read an in-game book/document
  'reputation', // Reach reputation threshold with faction
  'progress', // Reach a certain point in the main story
]);
export type DiscoveryConditionType = z.infer<typeof DiscoveryConditionTypeSchema>;

/**
 * A condition that must be met to discover/unlock a lore entry
 */
export const DiscoveryConditionSchema = z.object({
  /** Type of condition */
  type: DiscoveryConditionTypeSchema,

  /** Target identifier (location ID, NPC ID, quest ID, item ID, etc.) */
  target: z.string().optional(),

  /** Numeric value for threshold conditions (reputation level, story progress) */
  value: z.number().optional(),

  /** Description of how to unlock (for hints) */
  hint: z.string().optional(),
});
export type DiscoveryCondition = z.infer<typeof DiscoveryConditionSchema>;

// ============================================================================
// LORE ENTRY
// ============================================================================

/**
 * A single lore entry in the codex
 */
export const LoreEntrySchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display title in the codex */
  title: z.string(),

  /** Category for organization */
  category: LoreCategorySchema,

  /** The lore text content (100-200 words of rich narrative) */
  text: z.string(),

  /** How this entry can be discovered */
  discoveryCondition: DiscoveryConditionSchema,

  /** Is this entry currently unlocked? (runtime state) */
  unlocked: z.boolean().default(false),

  /** Related entry IDs for cross-referencing */
  relatedEntries: z.array(z.string()).default([]),

  /** Tags for filtering and searching */
  tags: z.array(z.string()).default([]),

  /** Sort order within category (lower = earlier) */
  sortOrder: z.number().int().default(0),
});
export type LoreEntry = z.infer<typeof LoreEntrySchema>;

// ============================================================================
// LORE CODEX STATE
// ============================================================================

/**
 * Runtime state of the player's lore codex
 */
export const LoreCodexStateSchema = z.object({
  /** Set of unlocked lore entry IDs */
  unlockedEntries: z.array(z.string()).default([]),

  /** Timestamp when each entry was discovered */
  discoveryTimes: z.record(z.string(), z.number()).default({}),

  /** Total entries discovered (for stats) */
  totalDiscovered: z.number().int().default(0),
});
export type LoreCodexState = z.infer<typeof LoreCodexStateSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateLoreEntry(data: unknown): LoreEntry {
  return LoreEntrySchema.parse(data);
}

export function validateLoreCodexState(data: unknown): LoreCodexState {
  return LoreCodexStateSchema.parse(data);
}

export function validateDiscoveryCondition(data: unknown): DiscoveryCondition {
  return DiscoveryConditionSchema.parse(data);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a discovery condition is met based on game state
 */
export function isConditionMet(
  condition: DiscoveryCondition,
  gameState: {
    visitedLocations?: Set<string>;
    talkedToNpcs?: Set<string>;
    completedQuests?: Set<string>;
    inventory?: Set<string>;
    readBooks?: Set<string>;
    factionReputation?: Record<string, number>;
    storyProgress?: number;
  }
): boolean {
  switch (condition.type) {
    case 'automatic':
      return true;

    case 'visit_location':
      return condition.target ? gameState.visitedLocations?.has(condition.target) ?? false : false;

    case 'talk_to_npc':
      return condition.target ? gameState.talkedToNpcs?.has(condition.target) ?? false : false;

    case 'complete_quest':
      return condition.target ? gameState.completedQuests?.has(condition.target) ?? false : false;

    case 'find_item':
      return condition.target ? gameState.inventory?.has(condition.target) ?? false : false;

    case 'read_book':
      return condition.target ? gameState.readBooks?.has(condition.target) ?? false : false;

    case 'reputation':
      if (!condition.target || condition.value === undefined) return false;
      const rep = gameState.factionReputation?.[condition.target] ?? 0;
      return rep >= condition.value;

    case 'progress':
      if (condition.value === undefined) return false;
      return (gameState.storyProgress ?? 0) >= condition.value;

    default:
      return false;
  }
}

/**
 * Create initial codex state with automatic entries unlocked
 */
export function createInitialCodexState(entries: LoreEntry[]): LoreCodexState {
  const automaticEntries = entries
    .filter((e) => e.discoveryCondition.type === 'automatic')
    .map((e) => e.id);

  const now = Date.now();
  const discoveryTimes: Record<string, number> = {};
  automaticEntries.forEach((id) => {
    discoveryTimes[id] = now;
  });

  return {
    unlockedEntries: automaticEntries,
    discoveryTimes,
    totalDiscovered: automaticEntries.length,
  };
}

export const LORE_SCHEMA_VERSION = '1.0.0';
