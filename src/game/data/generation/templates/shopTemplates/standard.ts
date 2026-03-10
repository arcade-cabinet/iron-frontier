/**
 * Shop Templates - Standard
 */

import type { ShopInventoryTemplate } from '../../../schemas/generation.ts';

// ============================================================================
// SHOP INVENTORY TEMPLATES
// ============================================================================

/**
 * General Store - Wide variety, common items
 * The frontier's one-stop shop for everyday needs.
 */
export const generalStoreTemplate: ShopInventoryTemplate = {
  id: 'general_store',
  shopType: 'general_store',
  itemPools: [
    {
      tags: ['consumable', 'food'],
      countRange: [3, 6],
      rarityWeights: { common: 80, uncommon: 18, rare: 2, legendary: 0 },
    },
    {
      tags: ['tool', 'hand_tool'],
      countRange: [2, 5],
      rarityWeights: { common: 75, uncommon: 22, rare: 3, legendary: 0 },
    },
    {
      tags: ['clothing', 'apparel'],
      countRange: [3, 5],
      rarityWeights: { common: 70, uncommon: 25, rare: 5, legendary: 0 },
    },
    {
      tags: ['ammunition', 'ammo'],
      countRange: [2, 4],
      rarityWeights: { common: 85, uncommon: 13, rare: 2, legendary: 0 },
    },
    {
      tags: ['supply', 'rope', 'lantern'],
      countRange: [3, 5],
      rarityWeights: { common: 80, uncommon: 18, rare: 2, legendary: 0 },
    },
    {
      tags: ['tobacco', 'luxury'],
      countRange: [1, 2],
      rarityWeights: { common: 60, uncommon: 30, rare: 10, legendary: 0 },
    },
  ],
  restockHours: 24,
  buyMultiplier: 1.15,
  sellMultiplier: 0.45,
  tags: ['general', 'civilian', 'town'],
};


/**
 * Gunsmith - Weapons focus
 * Specializes in firearms, ammunition, and weapon parts.
 */
export const gunsmithTemplate: ShopInventoryTemplate = {
  id: 'gunsmith',
  shopType: 'gunsmith',
  itemPools: [
    {
      tags: ['weapon', 'pistol', 'revolver'],
      countRange: [3, 5],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
    {
      tags: ['weapon', 'rifle'],
      countRange: [2, 4],
      rarityWeights: { common: 45, uncommon: 38, rare: 14, legendary: 3 },
    },
    {
      tags: ['weapon', 'shotgun'],
      countRange: [1, 3],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
    {
      tags: ['ammunition', 'ammo'],
      countRange: [4, 6],
      rarityWeights: { common: 70, uncommon: 25, rare: 5, legendary: 0 },
    },
    {
      tags: ['weapon_part', 'gun_parts', 'modification'],
      countRange: [2, 4],
      rarityWeights: { common: 40, uncommon: 40, rare: 15, legendary: 5 },
    },
    {
      tags: ['cleaning_kit', 'maintenance'],
      countRange: [1, 2],
      rarityWeights: { common: 80, uncommon: 18, rare: 2, legendary: 0 },
    },
  ],
  restockHours: 48,
  buyMultiplier: 1.25,
  sellMultiplier: 0.55,
  tags: ['weapons', 'combat', 'town'],
};


/**
 * Apothecary - Medical supplies
 * Frontier medicine, tonics, and healing supplies.
 */
export const apothecaryTemplate: ShopInventoryTemplate = {
  id: 'apothecary',
  shopType: 'apothecary',
  itemPools: [
    {
      tags: ['medicine', 'healing'],
      countRange: [2, 4],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['tonic', 'elixir', 'potion'],
      countRange: [2, 4],
      rarityWeights: { common: 55, uncommon: 32, rare: 10, legendary: 3 },
    },
    {
      tags: ['bandage', 'medical_supply'],
      countRange: [2, 4],
      rarityWeights: { common: 75, uncommon: 22, rare: 3, legendary: 0 },
    },
    {
      tags: ['antidote', 'cure'],
      countRange: [1, 2],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
    {
      tags: ['herb', 'ingredient'],
      countRange: [1, 3],
      rarityWeights: { common: 65, uncommon: 28, rare: 6, legendary: 1 },
    },
  ],
  restockHours: 36,
  buyMultiplier: 1.3,
  sellMultiplier: 0.5,
  tags: ['medical', 'healing', 'town'],
};


/**
 * Blacksmith - Metal goods
 * Forged tools, horseshoes, and basic melee weapons.
 */
export const blacksmithTemplate: ShopInventoryTemplate = {
  id: 'blacksmith',
  shopType: 'blacksmith',
  itemPools: [
    {
      tags: ['tool', 'metal_tool', 'hand_tool'],
      countRange: [3, 5],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['horseshoe', 'farrier'],
      countRange: [2, 4],
      rarityWeights: { common: 80, uncommon: 18, rare: 2, legendary: 0 },
    },
    {
      tags: ['metal_part', 'component'],
      countRange: [2, 4],
      rarityWeights: { common: 65, uncommon: 28, rare: 6, legendary: 1 },
    },
    {
      tags: ['weapon', 'melee', 'knife', 'axe'],
      countRange: [2, 4],
      rarityWeights: { common: 55, uncommon: 32, rare: 10, legendary: 3 },
    },
    {
      tags: ['chain', 'hardware'],
      countRange: [1, 3],
      rarityWeights: { common: 75, uncommon: 22, rare: 3, legendary: 0 },
    },
  ],
  restockHours: 48,
  buyMultiplier: 1.2,
  sellMultiplier: 0.5,
  tags: ['crafting', 'metal', 'town'],
};


/**
 * Saloon - Drinks and food
 * Cheap goods, alcohol, and frontier fare.
 */
export const saloonTemplate: ShopInventoryTemplate = {
  id: 'saloon',
  shopType: 'saloon',
  itemPools: [
    {
      tags: ['alcohol', 'drink', 'whiskey', 'beer'],
      countRange: [3, 6],
      rarityWeights: { common: 75, uncommon: 20, rare: 4, legendary: 1 },
    },
    {
      tags: ['food', 'meal', 'snack'],
      countRange: [2, 4],
      rarityWeights: { common: 85, uncommon: 13, rare: 2, legendary: 0 },
    },
    {
      tags: ['tobacco', 'cigar', 'cigarette'],
      countRange: [1, 3],
      rarityWeights: { common: 70, uncommon: 25, rare: 5, legendary: 0 },
    },
  ],
  restockHours: 12,
  buyMultiplier: 1.1,
  sellMultiplier: 0.35,
  tags: ['food', 'drink', 'social', 'town'],
};
