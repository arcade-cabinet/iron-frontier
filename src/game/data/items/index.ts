/**
 * Iron Frontier - Item Library
 *
 * Western RPG themed items for the inventory system.
 * All items are defined here and referenced by ID throughout the game.
 */

import type { BaseItem } from '../schemas/item.ts';

// Re-export types for external use
export type { ArmorItem, BaseItem, ConsumableItem, WeaponItem } from '../schemas/item.ts';

import { WEAPONS_0 } from './weapons0.ts';
import { WEAPONS_1 } from './weapons1.ts';
import { CONSUMABLES_0 } from './consumables0.ts';
import { CONSUMABLES_1 } from './consumables1.ts';
import { KEY_ITEMS } from './keyItems.ts';
import { CURRENCY } from './currency.ts';
import { SUPPLIES } from './supplies.ts';
import { JUNK } from './junk.ts';
import { AMMO } from './ammo.ts';

const WEAPONS = [...WEAPONS_0, ...WEAPONS_1];
const CONSUMABLES = [...CONSUMABLES_0, ...CONSUMABLES_1];

/** All items in the game, indexed by ID */
export const ITEM_LIBRARY: Record<string, BaseItem> = {};

// Populate the library
[...WEAPONS, ...CONSUMABLES, ...KEY_ITEMS, ...CURRENCY, ...SUPPLIES, ...JUNK, ...AMMO].forEach(
  (item) => {
    ITEM_LIBRARY[item.id] = item;
  }
);

/**
 * Get an item definition by ID
 */
export function getItem(itemId: string): BaseItem | undefined {
  return ITEM_LIBRARY[itemId];
}

/**
 * Get all items of a specific type
 */
export function getItemsByType(type: BaseItem['type']): BaseItem[] {
  return Object.values(ITEM_LIBRARY).filter((item) => item.type === type);
}

/**
 * Get all items with a specific tag
 */
export function getItemsByTag(tag: string): BaseItem[] {
  return Object.values(ITEM_LIBRARY).filter((item) => item.tags.includes(tag));
}

/**
 * Get all weapon items
 */
export function getWeapons(): BaseItem[] {
  return getItemsByType('weapon');
}

/**
 * Get all consumable items
 */
export function getConsumables(): BaseItem[] {
  return getItemsByType('consumable');
}

/**
 * Check if an item exists
 */
export function itemExists(itemId: string): boolean {
  return itemId in ITEM_LIBRARY;
}

// Export categorized arrays for convenience
export const ALL_WEAPONS = WEAPONS;
export const ALL_CONSUMABLES = CONSUMABLES;
export const ALL_KEY_ITEMS = KEY_ITEMS;
export const ALL_CURRENCY = CURRENCY;
export const ALL_SUPPLIES = SUPPLIES;
export const ALL_JUNK = JUNK;
export const ALL_AMMO = AMMO;

// Default starter inventory for new games
export const STARTER_INVENTORY = [
  { itemId: 'revolver_basic', quantity: 1 },
  { itemId: 'knife_bowie', quantity: 1 },
  { itemId: 'bandages', quantity: 3 },
  { itemId: 'coffee', quantity: 2 },
  { itemId: 'ammo_pistol', quantity: 24 },
  { itemId: 'mysterious_letter', quantity: 1 },
  { itemId: 'train_ticket', quantity: 1 },
];
