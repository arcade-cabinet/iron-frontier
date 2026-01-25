/**
 * Iron Frontier - Crafting Schema Definitions
 *
 * Zod-backed schemas for the crafting and cooking system.
 * Western RPG themed crafting: ammunition, medicine, equipment, survival items, and cooking.
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const CraftingCategorySchema = z.enum([
  'ammunition',
  'medicine',
  'equipment_upgrade',
  'survival',
  'cooking',
]);
export type CraftingCategory = z.infer<typeof CraftingCategorySchema>;

export const CraftingStationSchema = z.enum([
  'campfire',
  'workbench',
  'kitchen',
  'forge',
  'alchemy_table',
  'none', // Can craft anywhere
]);
export type CraftingStation = z.infer<typeof CraftingStationSchema>;

export const SkillTypeSchema = z.enum([
  'gunsmith',
  'medicine',
  'cooking',
  'survival',
  'engineering',
  'alchemy',
  'none',
]);
export type SkillType = z.infer<typeof SkillTypeSchema>;

export const UnlockConditionTypeSchema = z.enum([
  'quest_complete',
  'reputation',
  'skill_level',
  'item_owned',
  'npc_taught',
  'discovered',
  'none',
]);
export type UnlockConditionType = z.infer<typeof UnlockConditionTypeSchema>;

// ============================================================================
// INGREDIENT SCHEMA
// ============================================================================

export const CraftingIngredientSchema = z.object({
  /** Item ID of the ingredient */
  itemId: z.string(),

  /** Quantity required */
  quantity: z.number().int().min(1),

  /** Whether this ingredient is consumed (default: true) */
  consumed: z.boolean().default(true),
});
export type CraftingIngredient = z.infer<typeof CraftingIngredientSchema>;

// ============================================================================
// OUTPUT SCHEMA
// ============================================================================

export const CraftingOutputSchema = z.object({
  /** Item ID of the output */
  itemId: z.string(),

  /** Quantity produced */
  quantity: z.number().int().min(1),

  /** Chance to produce (0-1, default: 1) */
  chance: z.number().min(0).max(1).default(1),
});
export type CraftingOutput = z.infer<typeof CraftingOutputSchema>;

// ============================================================================
// UNLOCK CONDITION SCHEMA
// ============================================================================

export const UnlockConditionSchema = z.object({
  /** Type of unlock condition */
  type: UnlockConditionTypeSchema,

  /** Associated ID (quest ID, NPC ID, item ID, etc.) */
  targetId: z.string().optional(),

  /** Associated value (reputation level, skill level, etc.) */
  value: z.number().optional(),

  /** Human-readable description of how to unlock */
  description: z.string().optional(),
});
export type UnlockCondition = z.infer<typeof UnlockConditionSchema>;

// ============================================================================
// RECIPE SCHEMA
// ============================================================================

export const CraftingRecipeSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Flavor description */
  description: z.string(),

  /** Crafting category */
  category: CraftingCategorySchema,

  /** Required crafting station */
  station: CraftingStationSchema,

  /** Required ingredients */
  ingredients: z.array(CraftingIngredientSchema).min(1),

  /** Output item(s) */
  outputs: z.array(CraftingOutputSchema).min(1),

  /** Crafting time in seconds */
  craftingTime: z.number().min(0).default(5),

  /** Required skill type (if any) */
  requiredSkill: SkillTypeSchema.default('none'),

  /** Minimum skill level required (0-100) */
  skillLevel: z.number().int().min(0).max(100).default(0),

  /** Skill XP gained on successful craft */
  skillXpGain: z.number().int().min(0).default(5),

  /** Unlock condition */
  unlockCondition: UnlockConditionSchema.optional(),

  /** Whether recipe is unlocked by default */
  unlockedByDefault: z.boolean().default(true),

  /** Tags for filtering/categorization */
  tags: z.array(z.string()).default([]),

  /** Icon identifier for UI */
  icon: z.string().optional(),

  /** Special notes or lore */
  lore: z.string().optional(),
});
export type CraftingRecipe = z.infer<typeof CraftingRecipeSchema>;

// ============================================================================
// PLAYER CRAFTING STATE
// ============================================================================

export const PlayerCraftingStateSchema = z.object({
  /** Unlocked recipe IDs */
  unlockedRecipes: z.array(z.string()).default([]),

  /** Recipe craft counts (for statistics) */
  craftCounts: z.record(z.string(), z.number().int()).default({}),

  /** Currently active crafting (if any) */
  activeCraft: z
    .object({
      recipeId: z.string(),
      startTime: z.number(),
      endTime: z.number(),
    })
    .optional(),

  /** Skill levels */
  skills: z
    .record(SkillTypeSchema, z.number().int().min(0).max(100))
    .optional(),
});
export type PlayerCraftingState = z.infer<typeof PlayerCraftingStateSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateCraftingRecipe(data: unknown): CraftingRecipe {
  return CraftingRecipeSchema.parse(data);
}

export function validateCraftingIngredient(data: unknown): CraftingIngredient {
  return CraftingIngredientSchema.parse(data);
}

export function validatePlayerCraftingState(
  data: unknown
): PlayerCraftingState {
  return PlayerCraftingStateSchema.parse(data);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if player has required ingredients for a recipe
 */
export function hasIngredients(
  recipe: CraftingRecipe,
  inventory: Record<string, number>
): boolean {
  return recipe.ingredients.every((ingredient) => {
    const owned = inventory[ingredient.itemId] ?? 0;
    return owned >= ingredient.quantity;
  });
}

/**
 * Check if player meets skill requirements for a recipe
 */
export function meetsSkillRequirement(
  recipe: CraftingRecipe,
  skills: Record<string, number>
): boolean {
  if (recipe.requiredSkill === 'none') return true;
  const playerSkill = skills[recipe.requiredSkill] ?? 0;
  return playerSkill >= recipe.skillLevel;
}

/**
 * Check if player has access to required crafting station
 */
export function hasStationAccess(
  recipe: CraftingRecipe,
  availableStations: CraftingStation[]
): boolean {
  if (recipe.station === 'none') return true;
  return availableStations.includes(recipe.station);
}

/**
 * Check if a recipe is unlocked
 */
export function isRecipeUnlocked(
  recipe: CraftingRecipe,
  unlockedRecipes: string[]
): boolean {
  if (recipe.unlockedByDefault) return true;
  return unlockedRecipes.includes(recipe.id);
}

/**
 * Calculate crafting success chance based on skill
 */
export function calculateSuccessChance(
  recipe: CraftingRecipe,
  playerSkillLevel: number
): number {
  if (recipe.requiredSkill === 'none') return 1;

  const skillDiff = playerSkillLevel - recipe.skillLevel;
  if (skillDiff >= 20) return 1; // 100% success if 20+ levels above requirement
  if (skillDiff >= 0) return 0.8 + skillDiff * 0.01; // 80-100% at requirement or above
  return Math.max(0.5, 0.8 + skillDiff * 0.02); // 50-80% below requirement
}

/**
 * Get display color for crafting category
 */
export function getCategoryColor(category: CraftingCategory): string {
  switch (category) {
    case 'ammunition':
      return '#C0392B'; // red
    case 'medicine':
      return '#27AE60'; // green
    case 'equipment_upgrade':
      return '#F39C12'; // orange
    case 'survival':
      return '#8E44AD'; // purple
    case 'cooking':
      return '#E67E22'; // brown-orange
  }
}

/**
 * Get display name for crafting category
 */
export function getCategoryName(category: CraftingCategory): string {
  switch (category) {
    case 'ammunition':
      return 'Ammunition';
    case 'medicine':
      return 'Medicine';
    case 'equipment_upgrade':
      return 'Equipment Upgrades';
    case 'survival':
      return 'Survival Items';
    case 'cooking':
      return 'Cooking';
  }
}

/**
 * Get display name for crafting station
 */
export function getStationName(station: CraftingStation): string {
  switch (station) {
    case 'campfire':
      return 'Campfire';
    case 'workbench':
      return 'Workbench';
    case 'kitchen':
      return 'Kitchen';
    case 'forge':
      return 'Forge';
    case 'alchemy_table':
      return 'Alchemy Table';
    case 'none':
      return 'Anywhere';
  }
}

export const CRAFTING_SCHEMA_VERSION = '1.0.0';
