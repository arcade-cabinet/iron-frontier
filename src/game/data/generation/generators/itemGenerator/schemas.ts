/**
 * Item Generation Schemas and Types
 *
 * Zod schemas for item templates, loot tables, and pool types.
 */

import { z } from 'zod';
import { AmmoTypeSchema, type ItemRarity, WeaponTypeSchema } from '../../../schemas/item';

// ============================================================================
// ITEM TEMPLATE SCHEMAS
// ============================================================================

/**
 * Rarity weight configuration
 */
export const RarityWeightsSchema = z.object({
  common: z.number().min(0).default(70),
  uncommon: z.number().min(0).default(25),
  rare: z.number().min(0).default(4),
  legendary: z.number().min(0).default(1),
});
export type RarityWeights = z.infer<typeof RarityWeightsSchema>;

/**
 * Stat range for procedural variation
 */
export const StatRangeSchema = z.tuple([z.number(), z.number()]);
export type StatRange = z.infer<typeof StatRangeSchema>;

/**
 * Item template for procedural generation
 */
export const ItemTemplateSchema = z.object({
  /** Template identifier */
  id: z.string(),
  /** Human-readable name */
  name: z.string(),
  /** Item type being generated */
  itemType: z.enum(['weapon', 'armor', 'consumable', 'material', 'tool', 'key']),
  /** Rarity weights for generation */
  rarityWeights: RarityWeightsSchema.default(() => ({
    common: 70,
    uncommon: 25,
    rare: 4,
    legendary: 1,
  })),
  /** Name patterns with {{material}}, {{style}}, {{quality}} slots */
  namePatterns: z.array(z.string()).min(1),
  /** Description templates with {{variables}} */
  descriptionTemplates: z.array(z.string()).min(1),
  /** Base value range [min, max] */
  valueRange: StatRangeSchema.default([1, 100]),
  /** Weight range in pounds */
  weightRange: StatRangeSchema.default([0.1, 5.0]),
  /** Tags for filtering and categorization */
  tags: z.array(z.string()).default([]),
  /** Level range for scaling */
  levelRange: StatRangeSchema.default([1, 10]),

  // Weapon-specific
  /** Weapon type (if weapon) */
  weaponType: WeaponTypeSchema.optional(),
  /** Base damage range */
  damageRange: StatRangeSchema.optional(),
  /** Accuracy range (0-100) */
  accuracyRange: StatRangeSchema.optional(),
  /** Range (0 = melee) */
  rangeRange: StatRangeSchema.optional(),
  /** Fire rate range */
  fireRateRange: StatRangeSchema.optional(),
  /** Ammo type */
  ammoType: AmmoTypeSchema.optional(),
  /** Clip size range */
  clipSizeRange: StatRangeSchema.optional(),

  // Armor-specific
  /** Defense range */
  defenseRange: StatRangeSchema.optional(),
  /** Armor slot */
  armorSlot: z.enum(['head', 'body', 'legs', 'accessory']).optional(),
  /** Movement penalty range (0-1) */
  movementPenaltyRange: StatRangeSchema.optional(),

  // Consumable-specific
  /** Heal amount range */
  healRange: StatRangeSchema.optional(),
  /** Stamina restore range */
  staminaRange: StatRangeSchema.optional(),
  /** Buff type */
  buffType: z.string().optional(),
  /** Buff duration range (seconds) */
  buffDurationRange: StatRangeSchema.optional(),
  /** Buff strength range */
  buffStrengthRange: StatRangeSchema.optional(),

  // Materials this template can use
  allowedMaterials: z.array(z.string()).default([]),
  /** Styles this template can use */
  allowedStyles: z.array(z.string()).default([]),
});
export type ItemTemplate = z.infer<typeof ItemTemplateSchema>;

/**
 * Loot table entry
 */
export const LootTableEntrySchema = z.object({
  /** Template ID or item ID */
  templateOrItemId: z.string(),
  /** Is this a template (true) or direct item reference (false) */
  isTemplate: z.boolean().default(true),
  /** Weight for random selection */
  weight: z.number().min(0).default(1),
  /** Quantity range */
  quantityRange: StatRangeSchema.default([1, 1]),
  /** Level requirement range */
  levelRange: StatRangeSchema.default([1, 10]),
  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type LootTableEntry = z.infer<typeof LootTableEntrySchema>;

/**
 * Loot table for procedural drops
 */
export const ProceduralLootTableSchema = z.object({
  /** Table identifier */
  id: z.string(),
  /** Human-readable name */
  name: z.string(),
  /** Entries in this table */
  entries: z.array(LootTableEntrySchema).min(1),
  /** Number of rolls on this table */
  rolls: z.number().int().min(1).default(1),
  /** Chance for table to produce nothing (0-1) */
  emptyChance: z.number().min(0).max(1).default(0),
  /** Tags for categorization */
  tags: z.array(z.string()).default([]),
});
export type ProceduralLootTable = z.infer<typeof ProceduralLootTableSchema>;

// ============================================================================
// ITEM POOLS
// ============================================================================

/**
 * Material pool - defines materials for item generation
 */
export interface MaterialPool {
  id: string;
  name: string;
  /** Value multiplier */
  valueMultiplier: number;
  /** Stat multiplier (affects damage, defense, etc.) */
  statMultiplier: number;
  /** Minimum rarity for this material */
  minRarity: ItemRarity;
  /** Tags for filtering (e.g., 'metal', 'organic', 'precious') */
  tags: string[];
}

/**
 * Quality pool - defines quality tiers
 */
export interface QualityPool {
  id: string;
  name: string;
  /** Adjective used in names */
  adjective: string;
  /** Value multiplier */
  valueMultiplier: number;
  /** Stat multiplier */
  statMultiplier: number;
  /** Associated rarity */
  rarity: ItemRarity;
  /** Weight for random selection */
  weight: number;
}

/**
 * Style pool - defines item styles/aesthetics
 */
export interface StylePool {
  id: string;
  name: string;
  /** Description modifier */
  descriptionSuffix: string;
  /** Value multiplier */
  valueMultiplier: number;
  /** Tags */
  tags: string[];
}

/**
 * Generated item result
 */
export interface GeneratedItem {
  item: import('../../../schemas/item').BaseItem;
  templateId: string;
  material: MaterialPool;
  quality: QualityPool;
  style: StylePool;
  seed: number;
}

/**
 * Shop inventory item with price
 */
export interface ShopInventoryItem {
  item: import('../../../schemas/item').BaseItem;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  generated: GeneratedItem;
}
