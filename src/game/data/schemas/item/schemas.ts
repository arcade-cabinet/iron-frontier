/**
 * Item Schema Definitions - Enums, effects, stats, base and specialized items
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const ItemTypeSchema = z.enum([
  'weapon', 'armor', 'consumable', 'key_item', 'junk', 'currency',
]);
export type ItemType = z.infer<typeof ItemTypeSchema>;

export const ItemRaritySchema = z.enum(['common', 'uncommon', 'rare', 'legendary']);
export type ItemRarity = z.infer<typeof ItemRaritySchema>;

export const WeaponTypeSchema = z.enum([
  'revolver', 'rifle', 'shotgun', 'knife', 'explosive', 'melee',
]);
export type WeaponType = z.infer<typeof WeaponTypeSchema>;

export const AmmoTypeSchema = z.enum(['pistol', 'rifle', 'shotgun', 'none']);
export type AmmoType = z.infer<typeof AmmoTypeSchema>;

export const BuffTypeSchema = z.enum([
  'health_regen', 'stamina_regen', 'damage_boost', 'defense_boost',
  'speed_boost', 'damage_resist', 'poison_resist', 'heat_resist', 'cold_resist', 'none',
]);
export type BuffType = z.infer<typeof BuffTypeSchema>;

export const EffectTypeSchema = z.enum([
  'heal', 'stamina', 'buff', 'damage', 'unlock', 'cure', 'none',
]);
export type EffectType = z.infer<typeof EffectTypeSchema>;

// ============================================================================
// EFFECT & STATS SCHEMAS
// ============================================================================

export const ItemEffectSchema = z.object({
  type: EffectTypeSchema,
  value: z.number().default(0),
  duration: z.number().optional(),
  buffType: BuffTypeSchema.optional(),
});
export type ItemEffect = z.infer<typeof ItemEffectSchema>;

export const WeaponStatsSchema = z.object({
  weaponType: WeaponTypeSchema,
  damage: z.number().int().min(1),
  range: z.number().min(0),
  accuracy: z.number().min(0).max(100).default(75),
  fireRate: z.number().min(0).default(1),
  ammoType: AmmoTypeSchema.default('none'),
  clipSize: z.number().int().min(0).default(0),
  reloadTime: z.number().min(0).default(0),
});
export type WeaponStats = z.infer<typeof WeaponStatsSchema>;

export const ArmorStatsSchema = z.object({
  defense: z.number().int().min(0),
  slot: z.enum(['head', 'body', 'legs', 'accessory']),
  movementPenalty: z.number().min(0).max(1).default(0),
  resistances: z.record(z.string(), z.number()).optional(),
});
export type ArmorStats = z.infer<typeof ArmorStatsSchema>;

export const ConsumableStatsSchema = z.object({
  healAmount: z.number().int().min(0).default(0),
  staminaAmount: z.number().int().min(0).default(0),
  buffType: BuffTypeSchema.default('none'),
  buffDuration: z.number().min(0).default(0),
  buffStrength: z.number().min(0).default(0),
});
export type ConsumableStats = z.infer<typeof ConsumableStatsSchema>;

// ============================================================================
// BASE & SPECIALIZED ITEM SCHEMAS
// ============================================================================

export const BaseItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: ItemTypeSchema,
  rarity: ItemRaritySchema.default('common'),
  value: z.number().int().min(0).default(0),
  weight: z.number().min(0).default(0.1),
  stackable: z.boolean().default(true),
  maxStack: z.number().int().min(1).default(99),
  usable: z.boolean().default(false),
  droppable: z.boolean().default(true),
  sellable: z.boolean().default(true),
  icon: z.string().optional(),
  tags: z.array(z.string()).default([]),
  effects: z.array(ItemEffectSchema).default([]),
  weaponStats: WeaponStatsSchema.optional(),
  armorStats: ArmorStatsSchema.optional(),
  consumableStats: ConsumableStatsSchema.optional(),
});
export type BaseItem = z.infer<typeof BaseItemSchema>;

export const WeaponItemSchema = BaseItemSchema.extend({
  type: z.literal('weapon'),
  weaponStats: WeaponStatsSchema,
  usable: z.literal(false).default(false),
  stackable: z.literal(false).default(false),
  maxStack: z.literal(1).default(1),
});
export type WeaponItem = z.infer<typeof WeaponItemSchema>;

export const ArmorItemSchema = BaseItemSchema.extend({
  type: z.literal('armor'),
  armorStats: ArmorStatsSchema,
  usable: z.literal(false).default(false),
  stackable: z.literal(false).default(false),
  maxStack: z.literal(1).default(1),
});
export type ArmorItem = z.infer<typeof ArmorItemSchema>;

export const ConsumableItemSchema = BaseItemSchema.extend({
  type: z.literal('consumable'),
  consumableStats: ConsumableStatsSchema,
  usable: z.literal(true).default(true),
});
export type ConsumableItem = z.infer<typeof ConsumableItemSchema>;

export const KeyItemSchema = BaseItemSchema.extend({
  type: z.literal('key_item'),
  droppable: z.literal(false).default(false),
  sellable: z.literal(false).default(false),
  stackable: z.literal(false).default(false),
  maxStack: z.literal(1).default(1),
  questId: z.string().optional(),
  unlocksId: z.string().optional(),
});
export type KeyItem = z.infer<typeof KeyItemSchema>;

export const JunkItemSchema = BaseItemSchema.extend({
  type: z.literal('junk'),
  usable: z.literal(false).default(false),
});
export type JunkItem = z.infer<typeof JunkItemSchema>;

export const CurrencyItemSchema = BaseItemSchema.extend({
  type: z.literal('currency'),
  droppable: z.literal(false).default(false),
  usable: z.literal(false).default(false),
  weight: z.literal(0).default(0),
  exchangeRate: z.number().min(0).default(1),
});
export type CurrencyItem = z.infer<typeof CurrencyItemSchema>;

// ============================================================================
// INVENTORY ITEM & LOOT TABLE
// ============================================================================

export const InventoryItemInstanceSchema = z.object({
  instanceId: z.string(),
  itemId: z.string(),
  quantity: z.number().int().min(1).default(1),
  condition: z.number().min(0).max(100).default(100),
  equipped: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type InventoryItemInstance = z.infer<typeof InventoryItemInstanceSchema>;

export const LootEntrySchema = z.object({
  itemId: z.string(),
  weight: z.number().min(0).default(1),
  minQuantity: z.number().int().min(1).default(1),
  maxQuantity: z.number().int().min(1).default(1),
  condition: z
    .object({
      minPlayerLevel: z.number().int().min(0).optional(),
      maxPlayerLevel: z.number().int().min(0).optional(),
      requiredQuest: z.string().optional(),
    })
    .optional(),
});
export type LootEntry = z.infer<typeof LootEntrySchema>;

export const LootTableSchema = z.object({
  id: z.string(),
  name: z.string(),
  entries: z.array(LootEntrySchema).min(1),
  rolls: z.number().int().min(1).default(1),
  emptyChance: z.number().min(0).max(1).default(0),
});
export type LootTable = z.infer<typeof LootTableSchema>;
