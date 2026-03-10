/**
 * Item Validation, Type Guards & Utility Functions
 */

import type {
  ArmorItem,
  BaseItem,
  ConsumableItem,
  InventoryItemInstance,
  ItemType,
  LootTable,
  WeaponItem,
} from './schemas.ts';
import {
  BaseItemSchema,
  ConsumableItemSchema,
  InventoryItemInstanceSchema,
  LootTableSchema,
  WeaponItemSchema,
} from './schemas.ts';

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

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return '#FFD700';
    case 'epic':
      return '#E67E22';
    case 'rare':
      return '#9B59B6';
    case 'uncommon':
      return '#27AE60';
    default:
      return '#95A5A6';
  }
}

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
