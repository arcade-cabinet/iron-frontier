/**
 * Iron Frontier - Item Schema Definitions
 *
 * Zod-backed schemas for the inventory and items system.
 * Western RPG themed items: weapons, consumables, key items, etc.
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const ItemTypeSchema = z.enum([
  'weapon',
  'armor',
  'consumable',
  'key_item',
  'junk',
  'currency',
]);
export type ItemType = z.infer<typeof ItemTypeSchema>;

export const ItemRaritySchema = z.enum(['common', 'uncommon', 'rare', 'legendary']);
export type ItemRarity = z.infer<typeof ItemRaritySchema>;

export const WeaponTypeSchema = z.enum([
  'revolver',
  'rifle',
  'shotgun',
  'knife',
  'explosive',
  'melee',
]);
export type WeaponType = z.infer<typeof WeaponTypeSchema>;

export const AmmoTypeSchema = z.enum(['pistol', 'rifle', 'shotgun', 'none']);
export type AmmoType = z.infer<typeof AmmoTypeSchema>;

export const BuffTypeSchema = z.enum([
  'health_regen',
  'stamina_regen',
  'damage_boost',
  'defense_boost',
  'speed_boost',
  'damage_resist',
  'poison_resist',
  'heat_resist',
  'cold_resist',
  'none',
]);
export type BuffType = z.infer<typeof BuffTypeSchema>;

export const EffectTypeSchema = z.enum([
  'heal',
  'stamina',
  'buff',
  'damage',
  'unlock',
  'cure',
  'none',
]);
export type EffectType = z.infer<typeof EffectTypeSchema>;

// ============================================================================
// EFFECT SCHEMAS
// ============================================================================

export const ItemEffectSchema = z.object({
  type: EffectTypeSchema,
  value: z.number().default(0),
  duration: z.number().optional(), // seconds, undefined = instant
  buffType: BuffTypeSchema.optional(),
});
export type ItemEffect = z.infer<typeof ItemEffectSchema>;

// ============================================================================
// WEAPON STATS
// ============================================================================

export const WeaponStatsSchema = z.object({
  weaponType: WeaponTypeSchema,
  damage: z.number().int().min(1),
  range: z.number().min(0), // 0 = melee
  accuracy: z.number().min(0).max(100).default(75),
  fireRate: z.number().min(0).default(1), // shots per second
  ammoType: AmmoTypeSchema.default('none'),
  clipSize: z.number().int().min(0).default(0), // 0 = no clip
  reloadTime: z.number().min(0).default(0), // seconds
});
export type WeaponStats = z.infer<typeof WeaponStatsSchema>;

// ============================================================================
// ARMOR STATS
// ============================================================================

export const ArmorStatsSchema = z.object({
  defense: z.number().int().min(0),
  slot: z.enum(['head', 'body', 'legs', 'accessory']),
  movementPenalty: z.number().min(0).max(1).default(0), // 0-1 speed reduction
  resistances: z.record(z.string(), z.number()).optional(), // Elemental/type resistances
});
export type ArmorStats = z.infer<typeof ArmorStatsSchema>;

// ============================================================================
// CONSUMABLE STATS
// ============================================================================

export const ConsumableStatsSchema = z.object({
  healAmount: z.number().int().min(0).default(0),
  staminaAmount: z.number().int().min(0).default(0),
  buffType: BuffTypeSchema.default('none'),
  buffDuration: z.number().min(0).default(0), // seconds
  buffStrength: z.number().min(0).default(0),
});
export type ConsumableStats = z.infer<typeof ConsumableStatsSchema>;

// ============================================================================
// BASE ITEM SCHEMA
// ============================================================================

export const BaseItemSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Flavor description */
  description: z.string(),

  /** Item category */
  type: ItemTypeSchema,

  /** Rarity level */
  rarity: ItemRaritySchema.default('common'),

  /** Base value in dollars */
  value: z.number().int().min(0).default(0),

  /** Weight in pounds */
  weight: z.number().min(0).default(0.1),

  /** Can be stacked */
  stackable: z.boolean().default(true),

  /** Maximum stack size */
  maxStack: z.number().int().min(1).default(99),

  /** Can be used from inventory */
  usable: z.boolean().default(false),

  /** Can be dropped */
  droppable: z.boolean().default(true),

  /** Can be sold to merchants */
  sellable: z.boolean().default(true),

  /** Icon identifier for UI */
  icon: z.string().optional(),

  /** Tags for filtering/categorization */
  tags: z.array(z.string()).default([]),

  /** Effects when used */
  effects: z.array(ItemEffectSchema).default([]),

  /** Weapon stats (if weapon) */
  weaponStats: WeaponStatsSchema.optional(),

  /** Armor stats (if armor) */
  armorStats: ArmorStatsSchema.optional(),

  /** Consumable stats (if consumable) */
  consumableStats: ConsumableStatsSchema.optional(),
});
export type BaseItem = z.infer<typeof BaseItemSchema>;

// ============================================================================
// SPECIALIZED ITEM SCHEMAS
// ============================================================================

export const WeaponItemSchema = BaseItemSchema.extend({
  type: z.literal('weapon'),
  weaponStats: WeaponStatsSchema,
  usable: z.literal(false).default(false), // Weapons equipped, not "used"
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
  /** Quest or unlock this key item relates to */
  questId: z.string().optional(),
  /** What this key unlocks */
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
  /** Exchange rate to base currency (dollars) */
  exchangeRate: z.number().min(0).default(1),
});
export type CurrencyItem = z.infer<typeof CurrencyItemSchema>;

// ============================================================================
// INVENTORY ITEM (instance in player inventory)
// ============================================================================

export const InventoryItemInstanceSchema = z.object({
  /** Unique instance ID */
  instanceId: z.string(),

  /** Reference to item definition */
  itemId: z.string(),

  /** Stack quantity */
  quantity: z.number().int().min(1).default(1),

  /** Condition (for weapons/armor) 0-100 */
  condition: z.number().min(0).max(100).default(100),

  /** Is this item equipped */
  equipped: z.boolean().default(false),

  /** Custom data (quest flags, etc) */
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type InventoryItemInstance = z.infer<typeof InventoryItemInstanceSchema>;

// ============================================================================
// LOOT TABLE
// ============================================================================

export const LootEntrySchema = z.object({
  itemId: z.string(),
  weight: z.number().min(0).default(1), // probability weight
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
  /** Number of rolls on this table */
  rolls: z.number().int().min(1).default(1),
  /** Chance for table to produce nothing (0-1) */
  emptyChance: z.number().min(0).max(1).default(0),
});
export type LootTable = z.infer<typeof LootTableSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateItem(data: unknown): BaseItem {
  return BaseItemSchema.parse(data);
}

export function validateWeaponItem(data: unknown): WeaponItem {
  return WeaponItemSchema.parse(data);
}

export function validateConsumableItem(data: unknown): ConsumableItem {
  return ConsumableItemSchema.parse(data);
}

export function validateInventoryItem(data: unknown): InventoryItemInstance {
  return InventoryItemInstanceSchema.parse(data);
}

export function validateLootTable(data: unknown): LootTable {
  return LootTableSchema.parse(data);
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isWeapon(item: BaseItem): item is WeaponItem {
  return item.type === 'weapon' && item.weaponStats !== undefined;
}

export function isArmor(item: BaseItem): item is ArmorItem {
  return item.type === 'armor' && item.armorStats !== undefined;
}

export function isConsumable(item: BaseItem): item is ConsumableItem {
  return item.type === 'consumable';
}

export function isKeyItem(item: BaseItem): boolean {
  return item.type === 'key_item';
}

export function isCurrency(item: BaseItem): boolean {
  return item.type === 'currency';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the display color for item rarity
 */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return '#FFD700'; // gold
    case 'epic':
      return '#E67E22'; // orange
    case 'rare':
      return '#9B59B6'; // purple
    case 'uncommon':
      return '#27AE60'; // green
    default:
      return '#95A5A6'; // gray
  }
}

/**
 * Get item type display name
 */
export function getItemTypeName(type: ItemType): string {
  switch (type) {
    case 'weapon':
      return 'Weapon';
    case 'armor':
      return 'Armor';
    case 'consumable':
      return 'Consumable';
    case 'key_item':
      return 'Key Item';
    case 'junk':
      return 'Junk';
    case 'currency':
      return 'Currency';
  }
}

export const ITEM_SCHEMA_VERSION = '1.0.0';
