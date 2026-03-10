/**
 * Shop Templates - Specialty
 */

import type { ShopInventoryTemplate } from '../../../schemas/generation.ts';

/**
 * Trading Post - Everything, remote premium
 * Remote location with diverse but limited stock at higher prices.
 */
export const tradingPostTemplate: ShopInventoryTemplate = {
  id: 'trading_post',
  shopType: 'trading_post',
  itemPools: [
    {
      tags: ['consumable', 'food', 'supply'],
      countRange: [2, 4],
      rarityWeights: { common: 70, uncommon: 25, rare: 5, legendary: 0 },
    },
    {
      tags: ['ammunition', 'ammo'],
      countRange: [1, 3],
      rarityWeights: { common: 65, uncommon: 28, rare: 6, legendary: 1 },
    },
    {
      tags: ['tool', 'hand_tool'],
      countRange: [1, 3],
      rarityWeights: { common: 65, uncommon: 28, rare: 6, legendary: 1 },
    },
    {
      tags: ['medicine', 'healing'],
      countRange: [1, 2],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['clothing', 'apparel'],
      countRange: [1, 2],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['trade_goods', 'pelts', 'furs'],
      countRange: [2, 4],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
  ],
  restockHours: 72,
  buyMultiplier: 1.5,
  sellMultiplier: 0.6,
  tags: ['remote', 'frontier', 'trade'],
};


/**
 * Specialty Steam Shop - Steampunk tech
 * High-tech steam gadgets and automaton components.
 */
export const specialtySteamTemplate: ShopInventoryTemplate = {
  id: 'specialty_steam',
  shopType: 'specialty',
  itemPools: [
    {
      tags: ['steam_part', 'steam_component', 'gear'],
      countRange: [2, 4],
      rarityWeights: { common: 35, uncommon: 40, rare: 18, legendary: 7 },
    },
    {
      tags: ['gadget', 'device', 'contraption'],
      countRange: [1, 3],
      rarityWeights: { common: 30, uncommon: 40, rare: 22, legendary: 8 },
    },
    {
      tags: ['automaton_part', 'mechanical', 'clockwork'],
      countRange: [1, 3],
      rarityWeights: { common: 25, uncommon: 42, rare: 25, legendary: 8 },
    },
    {
      tags: ['fuel', 'coal', 'steam_core'],
      countRange: [1, 2],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
  ],
  restockHours: 96,
  buyMultiplier: 1.6,
  sellMultiplier: 0.65,
  tags: ['steampunk', 'tech', 'specialty', 'rare'],
};


/**
 * Stable - Animal goods
 * Horse tack, feed, and animal medicine.
 * Uses 'general_store' shopType with stable-specific tags.
 */
export const stableTemplate: ShopInventoryTemplate = {
  id: 'stable',
  shopType: 'general_store',
  itemPools: [
    {
      tags: ['horse_tack', 'saddle', 'bridle'],
      countRange: [2, 4],
      rarityWeights: { common: 55, uncommon: 32, rare: 10, legendary: 3 },
    },
    {
      tags: ['feed', 'hay', 'oats'],
      countRange: [2, 4],
      rarityWeights: { common: 85, uncommon: 13, rare: 2, legendary: 0 },
    },
    {
      tags: ['animal_medicine', 'veterinary'],
      countRange: [1, 2],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['horseshoe', 'farrier'],
      countRange: [1, 2],
      rarityWeights: { common: 75, uncommon: 22, rare: 3, legendary: 0 },
    },
    {
      tags: ['grooming', 'brush', 'care'],
      countRange: [1, 2],
      rarityWeights: { common: 80, uncommon: 18, rare: 2, legendary: 0 },
    },
  ],
  restockHours: 24,
  buyMultiplier: 1.15,
  sellMultiplier: 0.45,
  tags: ['stable', 'animal', 'horse', 'town'],
};


/**
 * Assay Office - Mining supplies
 * Mining tools, explosives, and ore samples.
 * Uses 'specialty' shopType with mining-specific tags.
 */
export const assayOfficeTemplate: ShopInventoryTemplate = {
  id: 'assay_office',
  shopType: 'specialty',
  itemPools: [
    {
      tags: ['mining_tool', 'pickaxe', 'shovel'],
      countRange: [2, 4],
      rarityWeights: { common: 60, uncommon: 30, rare: 8, legendary: 2 },
    },
    {
      tags: ['explosive', 'dynamite', 'blasting_cap'],
      countRange: [1, 3],
      rarityWeights: { common: 50, uncommon: 35, rare: 12, legendary: 3 },
    },
    {
      tags: ['ore_sample', 'mineral', 'specimen'],
      countRange: [1, 2],
      rarityWeights: { common: 40, uncommon: 40, rare: 15, legendary: 5 },
    },
    {
      tags: ['lantern', 'lamp', 'light'],
      countRange: [1, 2],
      rarityWeights: { common: 70, uncommon: 25, rare: 5, legendary: 0 },
    },
    {
      tags: ['scale', 'assay_equipment'],
      countRange: [1, 2],
      rarityWeights: { common: 55, uncommon: 32, rare: 10, legendary: 3 },
    },
  ],
  restockHours: 48,
  buyMultiplier: 1.25,
  sellMultiplier: 0.55,
  tags: ['mining', 'assay', 'specialty', 'industrial'],
};


/**
 * Traveling Merchant - Random selection
 * Rare wandering trader with best chance for unique items.
 * Uses 'trading_post' shopType with traveling-specific tags.
 */
export const travelingMerchantTemplate: ShopInventoryTemplate = {
  id: 'traveling_merchant',
  shopType: 'trading_post',
  itemPools: [
    {
      tags: ['rare_goods', 'exotic', 'curio'],
      countRange: [1, 2],
      rarityWeights: { common: 20, uncommon: 40, rare: 28, legendary: 12 },
    },
    {
      tags: ['consumable', 'tonic', 'elixir'],
      countRange: [1, 2],
      rarityWeights: { common: 30, uncommon: 40, rare: 22, legendary: 8 },
    },
    {
      tags: ['weapon', 'unique'],
      countRange: [0, 2],
      rarityWeights: { common: 15, uncommon: 35, rare: 35, legendary: 15 },
    },
    {
      tags: ['gadget', 'device'],
      countRange: [0, 2],
      rarityWeights: { common: 25, uncommon: 38, rare: 27, legendary: 10 },
    },
    {
      tags: ['map', 'treasure_map', 'clue'],
      countRange: [0, 1],
      rarityWeights: { common: 20, uncommon: 35, rare: 30, legendary: 15 },
    },
  ],
  restockHours: 168, // Weekly restock (rare visits)
  buyMultiplier: 1.4,
  sellMultiplier: 0.7,
  tags: ['traveling', 'rare', 'wandering', 'unique'],
};
