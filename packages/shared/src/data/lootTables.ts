/**
 * Iron Frontier - Loot Tables
 *
 * Defines drop chances per enemy type and area.
 * Uses weighted probability system with tiered drops.
 */

import type { LootTable, LootEntry } from './schemas/item';

// ============================================================================
// LOOT RARITY TIERS
// ============================================================================

export type LootRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export const LOOT_RARITY_WEIGHTS: Record<LootRarity, number> = {
  common: 100,
  uncommon: 30,
  rare: 10,
  legendary: 2,
};

// ============================================================================
// WILDLIFE LOOT TABLES
// ============================================================================

export const WildlifeCommonLoot: LootTable = {
  id: 'wildlife_common',
  name: 'Common Wildlife Drops',
  entries: [
    { itemId: 'coyote_pelt', weight: 40, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'dried_jerky', weight: 20, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'empty_bottle', weight: 15, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'feathers', weight: 25, minQuantity: 1, maxQuantity: 3 },
  ],
  rolls: 1,
  emptyChance: 0.3,
};

export const WildlifeVenomLoot: LootTable = {
  id: 'wildlife_venom',
  name: 'Venomous Wildlife Drops',
  entries: [
    { itemId: 'snake_venom', weight: 50, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'scorpion_stinger', weight: 40, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'antidote', weight: 10, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 1,
  emptyChance: 0.2,
};

export const WildlifePeltsLoot: LootTable = {
  id: 'wildlife_pelts',
  name: 'Medium Wildlife Pelts',
  entries: [
    { itemId: 'wolf_pelt', weight: 60, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'mountain_lion_claw', weight: 30, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'dried_jerky', weight: 10, minQuantity: 2, maxQuantity: 4 },
  ],
  rolls: 1,
  emptyChance: 0.1,
};

export const WildlifeRareLoot: LootTable = {
  id: 'wildlife_rare',
  name: 'Rare Wildlife Drops',
  entries: [
    { itemId: 'bear_pelt', weight: 50, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'mountain_lion_claw', weight: 30, minQuantity: 2, maxQuantity: 4 },
    { itemId: 'dried_jerky', weight: 15, minQuantity: 3, maxQuantity: 5 },
    { itemId: 'herbal_remedy', weight: 5, minQuantity: 1, maxQuantity: 2 },
  ],
  rolls: 2,
  emptyChance: 0,
};

// ============================================================================
// BANDIT LOOT TABLES
// ============================================================================

export const BanditCommonLoot: LootTable = {
  id: 'bandit_common',
  name: 'Common Bandit Drops',
  entries: [
    { itemId: 'bandits_pouch', weight: 40, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'pistol_ammo', weight: 25, minQuantity: 6, maxQuantity: 12 },
    { itemId: 'bandages', weight: 20, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'whiskey', weight: 10, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'tobacco_pouch', weight: 5, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 1,
  emptyChance: 0.2,
};

export const BanditLeaderLoot: LootTable = {
  id: 'bandit_leader',
  name: 'Bandit Leader Drops',
  entries: [
    { itemId: 'bandits_pouch', weight: 30, minQuantity: 2, maxQuantity: 3 },
    { itemId: 'pistol_ammo', weight: 20, minQuantity: 12, maxQuantity: 24 },
    { itemId: 'stolen_goods', weight: 20, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'health_potion', weight: 15, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'navy_revolver', weight: 10, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'outlaw_badge', weight: 5, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 2,
  emptyChance: 0,
};

// ============================================================================
// OUTLAW (COPPERHEAD) LOOT TABLES
// ============================================================================

export const OutlawCommonLoot: LootTable = {
  id: 'outlaw_common',
  name: 'Common Outlaw Drops',
  entries: [
    { itemId: 'bandits_pouch', weight: 30, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'pistol_ammo', weight: 25, minQuantity: 12, maxQuantity: 18 },
    { itemId: 'shotgun_ammo', weight: 15, minQuantity: 4, maxQuantity: 8 },
    { itemId: 'health_potion', weight: 15, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'outlaw_badge', weight: 10, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'moonshine', weight: 5, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 2,
  emptyChance: 0.1,
};

export const OutlawLeaderLoot: LootTable = {
  id: 'outlaw_leader',
  name: 'Outlaw Leader Drops',
  entries: [
    { itemId: 'bandits_pouch', weight: 25, minQuantity: 2, maxQuantity: 4 },
    { itemId: 'pistol_ammo', weight: 15, minQuantity: 18, maxQuantity: 30 },
    { itemId: 'health_potion_greater', weight: 15, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'stolen_goods', weight: 15, minQuantity: 2, maxQuantity: 3 },
    { itemId: 'schofield', weight: 10, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'outlaw_badge', weight: 10, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'reinforced_leather', weight: 5, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'stimulant_tonic', weight: 5, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 3,
  emptyChance: 0,
};

// ============================================================================
// IVRC GUARD LOOT TABLES
// ============================================================================

export const IVRCCommonLoot: LootTable = {
  id: 'ivrc_common',
  name: 'IVRC Guard Drops',
  entries: [
    { itemId: 'pistol_ammo', weight: 30, minQuantity: 12, maxQuantity: 18 },
    { itemId: 'rifle_rounds', weight: 25, minQuantity: 5, maxQuantity: 10 },
    { itemId: 'bandages', weight: 20, minQuantity: 2, maxQuantity: 3 },
    { itemId: 'ivrc_scrip', weight: 15, minQuantity: 10, maxQuantity: 25 },
    { itemId: 'coffee_hot', weight: 10, minQuantity: 1, maxQuantity: 2 },
  ],
  rolls: 1,
  emptyChance: 0.15,
};

export const IVRCLeaderLoot: LootTable = {
  id: 'ivrc_leader',
  name: 'IVRC Captain Drops',
  entries: [
    { itemId: 'pistol_ammo', weight: 20, minQuantity: 18, maxQuantity: 30 },
    { itemId: 'rifle_rounds', weight: 15, minQuantity: 10, maxQuantity: 20 },
    { itemId: 'ivrc_scrip', weight: 20, minQuantity: 25, maxQuantity: 50 },
    { itemId: 'health_potion', weight: 15, minQuantity: 2, maxQuantity: 3 },
    { itemId: 'ivrc_pass', weight: 10, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'revolver_fancy', weight: 10, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'chain_shirt', weight: 5, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'evidence_documents', weight: 5, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 2,
  emptyChance: 0,
};

// ============================================================================
// AUTOMATON LOOT TABLES
// ============================================================================

export const AutomatonScrapLoot: LootTable = {
  id: 'automaton_scrap',
  name: 'Automaton Scrap',
  entries: [
    { itemId: 'mechanical_parts', weight: 40, minQuantity: 2, maxQuantity: 5 },
    { itemId: 'scrap_metal', weight: 30, minQuantity: 3, maxQuantity: 6 },
    { itemId: 'copper_wire', weight: 20, minQuantity: 2, maxQuantity: 4 },
    { itemId: 'oil_can', weight: 10, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 2,
  emptyChance: 0.1,
};

export const AutomatonRareLoot: LootTable = {
  id: 'automaton_rare',
  name: 'Rare Automaton Drops',
  entries: [
    { itemId: 'mechanical_parts', weight: 25, minQuantity: 4, maxQuantity: 8 },
    { itemId: 'scrap_metal', weight: 20, minQuantity: 5, maxQuantity: 10 },
    { itemId: 'steam_valve', weight: 20, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'automaton_plating', weight: 15, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'copper_wire', weight: 10, minQuantity: 3, maxQuantity: 6 },
    { itemId: 'automaton_core', weight: 10, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 3,
  emptyChance: 0,
};

// ============================================================================
// CORRUPTED HUMAN LOOT TABLES
// ============================================================================

export const CorruptedHumanLoot: LootTable = {
  id: 'corrupted_human',
  name: 'Corrupted Human Drops',
  entries: [
    { itemId: 'mechanical_parts', weight: 30, minQuantity: 1, maxQuantity: 3 },
    { itemId: 'bandits_pouch', weight: 25, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'pickaxe', weight: 15, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'health_potion', weight: 15, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'copper_wire', weight: 10, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'gold_nugget', weight: 5, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 2,
  emptyChance: 0.1,
};

// ============================================================================
// BOSS LOOT TABLES
// ============================================================================

export const BossBanditKingLoot: LootTable = {
  id: 'boss_bandit_king',
  name: 'Bandit King Drops',
  entries: [
    { itemId: 'bandits_pouch', weight: 100, minQuantity: 5, maxQuantity: 8 },
    { itemId: 'revolver_fancy', weight: 100, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'health_potion_greater', weight: 80, minQuantity: 2, maxQuantity: 3 },
    { itemId: 'pistol_ammo', weight: 80, minQuantity: 24, maxQuantity: 36 },
    { itemId: 'stolen_goods', weight: 60, minQuantity: 3, maxQuantity: 5 },
    { itemId: 'reinforced_leather', weight: 50, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'gold_nugget', weight: 40, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'stimulant_tonic', weight: 30, minQuantity: 2, maxQuantity: 3 },
  ],
  rolls: 5,
  emptyChance: 0,
};

export const BossSaboteurLoot: LootTable = {
  id: 'boss_saboteur',
  name: 'Saboteur Drops',
  entries: [
    { itemId: 'dynamite', weight: 100, minQuantity: 5, maxQuantity: 10 },
    { itemId: 'mechanical_parts', weight: 80, minQuantity: 5, maxQuantity: 10 },
    { itemId: 'health_potion_greater', weight: 80, minQuantity: 2, maxQuantity: 3 },
    { itemId: 'bandits_pouch', weight: 60, minQuantity: 3, maxQuantity: 5 },
    { itemId: 'steam_valve', weight: 50, minQuantity: 2, maxQuantity: 3 },
    { itemId: 'stimulant_tonic', weight: 40, minQuantity: 2, maxQuantity: 3 },
    { itemId: 'quickdraw_holster', weight: 30, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'evidence_documents', weight: 100, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 5,
  emptyChance: 0,
};

export const BossFinalLoot: LootTable = {
  id: 'boss_final',
  name: 'Iron Tyrant Drops',
  entries: [
    { itemId: 'automaton_core', weight: 100, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'automaton_plating', weight: 100, minQuantity: 3, maxQuantity: 5 },
    { itemId: 'steam_valve', weight: 80, minQuantity: 3, maxQuantity: 5 },
    { itemId: 'mechanical_parts', weight: 80, minQuantity: 10, maxQuantity: 20 },
    { itemId: 'health_potion_greater', weight: 60, minQuantity: 3, maxQuantity: 5 },
    { itemId: 'steampunk_blade', weight: 50, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'steam_plated_armor', weight: 40, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'gold_nugget', weight: 60, minQuantity: 3, maxQuantity: 5 },
  ],
  rolls: 6,
  emptyChance: 0,
};

// ============================================================================
// CONTAINER LOOT TABLES
// ============================================================================

export const ChestCommonLoot: LootTable = {
  id: 'chest_common',
  name: 'Common Chest',
  entries: [
    { itemId: 'bandages', weight: 30, minQuantity: 1, maxQuantity: 3 },
    { itemId: 'pistol_ammo', weight: 25, minQuantity: 6, maxQuantity: 12 },
    { itemId: 'rations', weight: 20, minQuantity: 1, maxQuantity: 3 },
    { itemId: 'canteen_refill', weight: 15, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'empty_bottle', weight: 10, minQuantity: 1, maxQuantity: 2 },
  ],
  rolls: 2,
  emptyChance: 0.2,
};

export const ChestUncommonLoot: LootTable = {
  id: 'chest_uncommon',
  name: 'Uncommon Chest',
  entries: [
    { itemId: 'health_potion', weight: 25, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'pistol_ammo', weight: 20, minQuantity: 12, maxQuantity: 18 },
    { itemId: 'rifle_rounds', weight: 15, minQuantity: 5, maxQuantity: 10 },
    { itemId: 'bandits_pouch', weight: 15, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'herbal_remedy', weight: 15, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'hunting_knife', weight: 10, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 2,
  emptyChance: 0.1,
};

export const ChestRareLoot: LootTable = {
  id: 'chest_rare',
  name: 'Rare Chest',
  entries: [
    { itemId: 'health_potion_greater', weight: 20, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'pistol_ammo', weight: 15, minQuantity: 18, maxQuantity: 30 },
    { itemId: 'rifle_rounds', weight: 15, minQuantity: 10, maxQuantity: 20 },
    { itemId: 'shotgun_ammo', weight: 15, minQuantity: 8, maxQuantity: 16 },
    { itemId: 'gold_nugget', weight: 10, minQuantity: 1, maxQuantity: 2 },
    { itemId: 'navy_revolver', weight: 10, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'chain_shirt', weight: 8, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'stimulant_tonic', weight: 7, minQuantity: 1, maxQuantity: 2 },
  ],
  rolls: 3,
  emptyChance: 0,
};

export const SafeLoot: LootTable = {
  id: 'safe_loot',
  name: 'Safe Contents',
  entries: [
    { itemId: 'bandits_pouch', weight: 30, minQuantity: 3, maxQuantity: 5 },
    { itemId: 'gold_nugget', weight: 25, minQuantity: 1, maxQuantity: 3 },
    { itemId: 'stolen_goods', weight: 20, minQuantity: 2, maxQuantity: 4 },
    { itemId: 'evidence_documents', weight: 15, minQuantity: 1, maxQuantity: 1 },
    { itemId: 'schofield', weight: 10, minQuantity: 1, maxQuantity: 1 },
  ],
  rolls: 2,
  emptyChance: 0,
};

// ============================================================================
// MONEY RANGE TABLES
// ============================================================================

export interface MoneyDrop {
  minAmount: number;
  maxAmount: number;
  chance: number;
}

export const MONEY_DROPS: Record<string, MoneyDrop> = {
  wildlife: { minAmount: 0, maxAmount: 0, chance: 0 },
  bandit_common: { minAmount: 5, maxAmount: 15, chance: 0.8 },
  bandit_leader: { minAmount: 20, maxAmount: 40, chance: 1.0 },
  outlaw_common: { minAmount: 15, maxAmount: 30, chance: 0.9 },
  outlaw_leader: { minAmount: 40, maxAmount: 80, chance: 1.0 },
  ivrc_guard: { minAmount: 10, maxAmount: 20, chance: 0.7 },
  ivrc_leader: { minAmount: 30, maxAmount: 60, chance: 1.0 },
  automaton: { minAmount: 5, maxAmount: 15, chance: 0.3 },
  boss_act1: { minAmount: 100, maxAmount: 150, chance: 1.0 },
  boss_act2: { minAmount: 150, maxAmount: 200, chance: 1.0 },
  boss_final: { minAmount: 300, maxAmount: 500, chance: 1.0 },
};

// ============================================================================
// LOOT TABLE REGISTRY
// ============================================================================

export const ALL_LOOT_TABLES: LootTable[] = [
  // Wildlife
  WildlifeCommonLoot,
  WildlifeVenomLoot,
  WildlifePeltsLoot,
  WildlifeRareLoot,
  // Bandits
  BanditCommonLoot,
  BanditLeaderLoot,
  // Outlaws
  OutlawCommonLoot,
  OutlawLeaderLoot,
  // IVRC
  IVRCCommonLoot,
  IVRCLeaderLoot,
  // Automatons
  AutomatonScrapLoot,
  AutomatonRareLoot,
  // Corrupted
  CorruptedHumanLoot,
  // Bosses
  BossBanditKingLoot,
  BossSaboteurLoot,
  BossFinalLoot,
  // Containers
  ChestCommonLoot,
  ChestUncommonLoot,
  ChestRareLoot,
  SafeLoot,
];

export const LOOT_TABLES_BY_ID: Record<string, LootTable> = Object.fromEntries(
  ALL_LOOT_TABLES.map((table) => [table.id, table])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getLootTableById(id: string): LootTable | undefined {
  return LOOT_TABLES_BY_ID[id];
}

/**
 * Roll on a loot table and return the resulting items
 */
export function rollLootTable(
  tableId: string,
  playerLevel?: number
): Array<{ itemId: string; quantity: number }> {
  const table = getLootTableById(tableId);
  if (!table) return [];

  const results: Array<{ itemId: string; quantity: number }> = [];

  for (let roll = 0; roll < table.rolls; roll++) {
    // Check empty chance
    if (Math.random() < table.emptyChance) continue;

    // Calculate total weight
    const validEntries = table.entries.filter((entry) => {
      if (!entry.condition) return true;
      if (entry.condition.minPlayerLevel && playerLevel && playerLevel < entry.condition.minPlayerLevel) {
        return false;
      }
      if (entry.condition.maxPlayerLevel && playerLevel && playerLevel > entry.condition.maxPlayerLevel) {
        return false;
      }
      return true;
    });

    const totalWeight = validEntries.reduce((sum, entry) => sum + entry.weight, 0);
    if (totalWeight === 0) continue;

    // Roll for item
    let roll_value = Math.random() * totalWeight;
    for (const entry of validEntries) {
      roll_value -= entry.weight;
      if (roll_value <= 0) {
        const quantity =
          entry.minQuantity +
          Math.floor(Math.random() * (entry.maxQuantity - entry.minQuantity + 1));
        results.push({ itemId: entry.itemId, quantity });
        break;
      }
    }
  }

  // Combine stacks of same item
  const combined: Record<string, number> = {};
  for (const { itemId, quantity } of results) {
    combined[itemId] = (combined[itemId] || 0) + quantity;
  }

  return Object.entries(combined).map(([itemId, quantity]) => ({ itemId, quantity }));
}

/**
 * Roll money drop for an enemy type
 */
export function rollMoneyDrop(enemyType: string): number {
  const drop = MONEY_DROPS[enemyType];
  if (!drop) return 0;

  if (Math.random() > drop.chance) return 0;

  return drop.minAmount + Math.floor(Math.random() * (drop.maxAmount - drop.minAmount + 1));
}

/**
 * Get appropriate loot table for an enemy by tags
 */
export function getLootTableForEnemy(
  faction: string,
  tags: string[]
): string {
  // Check for boss
  if (tags.includes('boss')) {
    if (tags.includes('act1')) return 'boss_bandit_king';
    if (tags.includes('act2')) return 'boss_saboteur';
    if (tags.includes('final')) return 'boss_final';
  }

  // Check for mini-boss / leader
  if (tags.includes('mini_boss') || tags.includes('leader')) {
    if (faction === 'raiders') return 'bandit_leader';
    if (faction === 'copperhead') return 'outlaw_leader';
    if (faction === 'ivrc_guards') return 'ivrc_leader';
    if (faction === 'remnant') return 'automaton_rare';
  }

  // Regular enemies by faction
  switch (faction) {
    case 'wildlife':
      if (tags.includes('poison')) return 'wildlife_venom';
      if (tags.includes('rare')) return 'wildlife_rare';
      if (tags.includes('uncommon')) return 'wildlife_pelts';
      return 'wildlife_common';

    case 'raiders':
      return 'bandit_common';

    case 'copperhead':
      return 'outlaw_common';

    case 'ivrc_guards':
      return 'ivrc_common';

    case 'remnant':
      if (tags.includes('rare')) return 'automaton_rare';
      if (tags.includes('corrupted')) return 'corrupted_human';
      return 'automaton_scrap';

    default:
      return 'chest_common';
  }
}
