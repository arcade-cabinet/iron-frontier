import { scopedRNG, rngTick } from '../../lib/prng';
/**
 * Iron Frontier - Loot Tables
 *
 * Defines drop tables for enemies. Each enemy definition references a lootTableId,
 * which maps to an array of possible drops with per-item drop chance and quantity range.
 *
 * Gold drops are handled separately via a goldMin/goldMax range on the table.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface LootEntry {
  /** Item ID from the item library */
  itemId: string;
  /** Probability of this item dropping (0-1) */
  chance: number;
  /** Minimum quantity if dropped */
  minQty: number;
  /** Maximum quantity if dropped */
  maxQty: number;
}

export interface LootTable {
  /** Unique identifier matching EnemyDefinition.lootTableId */
  id: string;
  /** Minimum gold dropped */
  goldMin: number;
  /** Maximum gold dropped */
  goldMax: number;
  /** Possible item drops */
  entries: LootEntry[];
}

export interface LootDrop {
  /** Items to add to inventory */
  items: { itemId: string; quantity: number }[];
  /** Gold to add directly */
  gold: number;
}

// ============================================================================
// LOOT TABLE DEFINITIONS
// ============================================================================

const LOOT_TABLES: LootTable[] = [
  // --- BANDITS ---
  {
    id: 'bandit_common',
    goldMin: 2,
    goldMax: 8,
    entries: [
      { itemId: 'ammo_pistol', chance: 0.6, minQty: 3, maxQty: 8 },
      { itemId: 'bandages', chance: 0.3, minQty: 1, maxQty: 2 },
      { itemId: 'tobacco_pouch', chance: 0.2, minQty: 1, maxQty: 1 },
      { itemId: 'whiskey', chance: 0.15, minQty: 1, maxQty: 1 },
      { itemId: 'playing_cards', chance: 0.1, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'bandit_uncommon',
    goldMin: 5,
    goldMax: 18,
    entries: [
      { itemId: 'ammo_pistol', chance: 0.7, minQty: 6, maxQty: 12 },
      { itemId: 'ammo_rifle', chance: 0.5, minQty: 3, maxQty: 8 },
      { itemId: 'bandages', chance: 0.4, minQty: 1, maxQty: 3 },
      { itemId: 'whiskey', chance: 0.3, minQty: 1, maxQty: 2 },
      { itemId: 'hunting_knife', chance: 0.15, minQty: 1, maxQty: 1 },
      { itemId: 'lockpick', chance: 0.2, minQty: 1, maxQty: 3 },
      { itemId: 'pocket_watch', chance: 0.1, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'bandit_rare',
    goldMin: 15,
    goldMax: 40,
    entries: [
      { itemId: 'ammo_pistol', chance: 0.8, minQty: 8, maxQty: 18 },
      { itemId: 'ammo_rifle', chance: 0.6, minQty: 5, maxQty: 12 },
      { itemId: 'navy_revolver', chance: 0.2, minQty: 1, maxQty: 1 },
      { itemId: 'repeater', chance: 0.15, minQty: 1, maxQty: 1 },
      { itemId: 'medical_kit', chance: 0.25, minQty: 1, maxQty: 1 },
      { itemId: 'lockpick', chance: 0.35, minQty: 2, maxQty: 5 },
      { itemId: 'quickdraw_holster', chance: 0.08, minQty: 1, maxQty: 1 },
      { itemId: 'moonshine', chance: 0.2, minQty: 1, maxQty: 2 },
    ],
  },

  // --- COPPERHEAD GANG ---
  {
    id: 'copperhead_common',
    goldMin: 5,
    goldMax: 15,
    entries: [
      { itemId: 'ammo_pistol', chance: 0.7, minQty: 4, maxQty: 10 },
      { itemId: 'ammo_shotgun', chance: 0.3, minQty: 2, maxQty: 5 },
      { itemId: 'snake_oil', chance: 0.15, minQty: 1, maxQty: 1 },
      { itemId: 'dynamite', chance: 0.1, minQty: 1, maxQty: 2 },
      { itemId: 'whiskey', chance: 0.25, minQty: 1, maxQty: 2 },
      { itemId: 'bandages', chance: 0.35, minQty: 1, maxQty: 2 },
    ],
  },
  {
    id: 'copperhead_uncommon',
    goldMin: 10,
    goldMax: 30,
    entries: [
      { itemId: 'ammo_pistol', chance: 0.8, minQty: 6, maxQty: 14 },
      { itemId: 'ammo_shotgun', chance: 0.5, minQty: 3, maxQty: 8 },
      { itemId: 'dynamite', chance: 0.3, minQty: 1, maxQty: 3 },
      { itemId: 'shotgun', chance: 0.12, minQty: 1, maxQty: 1 },
      { itemId: 'navy_revolver', chance: 0.1, minQty: 1, maxQty: 1 },
      { itemId: 'snake_oil', chance: 0.2, minQty: 1, maxQty: 2 },
      { itemId: 'medical_kit', chance: 0.2, minQty: 1, maxQty: 1 },
      { itemId: 'moonshine', chance: 0.25, minQty: 1, maxQty: 1 },
    ],
  },

  // --- IVRC GUARDS ---
  {
    id: 'ivrc_common',
    goldMin: 3,
    goldMax: 10,
    entries: [
      { itemId: 'ammo_pistol', chance: 0.7, minQty: 6, maxQty: 12 },
      { itemId: 'ammo_rifle', chance: 0.4, minQty: 3, maxQty: 6 },
      { itemId: 'dried_jerky', chance: 0.3, minQty: 1, maxQty: 3 },
      { itemId: 'trail_biscuits', chance: 0.25, minQty: 1, maxQty: 3 },
      { itemId: 'bandages', chance: 0.35, minQty: 1, maxQty: 2 },
      { itemId: 'water_canteen', chance: 0.15, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'ivrc_uncommon',
    goldMin: 8,
    goldMax: 20,
    entries: [
      { itemId: 'ammo_pistol', chance: 0.8, minQty: 8, maxQty: 16 },
      { itemId: 'ammo_rifle', chance: 0.6, minQty: 5, maxQty: 10 },
      { itemId: 'rifle_winchester', chance: 0.1, minQty: 1, maxQty: 1 },
      { itemId: 'medical_kit', chance: 0.2, minQty: 1, maxQty: 1 },
      { itemId: 'bandages', chance: 0.4, minQty: 1, maxQty: 3 },
      { itemId: 'oil_can', chance: 0.2, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'ivrc_rare',
    goldMin: 15,
    goldMax: 40,
    entries: [
      { itemId: 'ammo_pistol', chance: 0.9, minQty: 10, maxQty: 20 },
      { itemId: 'ammo_rifle', chance: 0.8, minQty: 8, maxQty: 16 },
      { itemId: 'schofield', chance: 0.15, minQty: 1, maxQty: 1 },
      { itemId: 'rifle_winchester', chance: 0.2, minQty: 1, maxQty: 1 },
      { itemId: 'medical_kit', chance: 0.35, minQty: 1, maxQty: 2 },
      { itemId: 'ivrc_pass', chance: 0.1, minQty: 1, maxQty: 1 },
      { itemId: 'stimulant', chance: 0.15, minQty: 1, maxQty: 1 },
      { itemId: 'laudanum', chance: 0.2, minQty: 1, maxQty: 1 },
    ],
  },

  // --- WILDLIFE ---
  {
    id: 'wildlife_common',
    goldMin: 0,
    goldMax: 0,
    entries: [
      { itemId: 'dried_jerky', chance: 0.4, minQty: 1, maxQty: 2 },
      { itemId: 'herbal_remedy', chance: 0.15, minQty: 1, maxQty: 1 },
      { itemId: 'antivenom', chance: 0.1, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'wildlife_uncommon',
    goldMin: 0,
    goldMax: 0,
    entries: [
      { itemId: 'dried_jerky', chance: 0.5, minQty: 1, maxQty: 3 },
      { itemId: 'herbal_remedy', chance: 0.25, minQty: 1, maxQty: 2 },
      { itemId: 'antivenom', chance: 0.15, minQty: 1, maxQty: 1 },
      { itemId: 'lucky_charm', chance: 0.05, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: 'wildlife_bear',
    goldMin: 0,
    goldMax: 0,
    entries: [
      { itemId: 'dried_jerky', chance: 0.7, minQty: 2, maxQty: 5 },
      { itemId: 'herbal_remedy', chance: 0.3, minQty: 1, maxQty: 2 },
      { itemId: 'lucky_charm', chance: 0.1, minQty: 1, maxQty: 1 },
    ],
  },

  // --- REMNANT AUTOMATONS ---
  {
    id: 'automaton_scrap',
    goldMin: 2,
    goldMax: 8,
    entries: [
      { itemId: 'scrap_metal', chance: 0.8, minQty: 1, maxQty: 4 },
      { itemId: 'oil_can', chance: 0.4, minQty: 1, maxQty: 2 },
      { itemId: 'rusty_nail', chance: 0.3, minQty: 2, maxQty: 6 },
    ],
  },
  {
    id: 'automaton_rare',
    goldMin: 8,
    goldMax: 25,
    entries: [
      { itemId: 'scrap_metal', chance: 0.9, minQty: 3, maxQty: 8 },
      { itemId: 'oil_can', chance: 0.6, minQty: 1, maxQty: 3 },
      { itemId: 'stimulant', chance: 0.15, minQty: 1, maxQty: 1 },
      { itemId: 'reinforced_knife', chance: 0.1, minQty: 1, maxQty: 1 },
    ],
  },
];

// ============================================================================
// REGISTRY
// ============================================================================

const LOOT_TABLES_BY_ID: Record<string, LootTable> = Object.fromEntries(
  LOOT_TABLES.map((t) => [t.id, t])
);

/**
 * Look up a loot table by its ID.
 */
export function getLootTable(lootTableId: string): LootTable | undefined {
  return LOOT_TABLES_BY_ID[lootTableId];
}

// ============================================================================
// ROLLING
// ============================================================================

/**
 * Roll a random integer between min and max (inclusive).
 */
function randInt(min: number, max: number): number {
  return min + Math.floor(scopedRNG('loot', 42, rngTick()) * (max - min + 1));
}

/**
 * Roll on a loot table and return the resulting drops.
 * Each entry is independently rolled against its chance.
 */
export function rollLootTable(lootTableId: string): LootDrop {
  const table = getLootTable(lootTableId);
  if (!table) return { items: [], gold: 0 };

  const gold = table.goldMax > 0 ? randInt(table.goldMin, table.goldMax) : 0;

  const items: { itemId: string; quantity: number }[] = [];
  for (const entry of table.entries) {
    if (scopedRNG('loot', 42, rngTick()) <= entry.chance) {
      const qty = randInt(entry.minQty, entry.maxQty);
      items.push({ itemId: entry.itemId, quantity: qty });
    }
  }

  return { items, gold };
}

/**
 * Roll loot for multiple enemies killed in an encounter.
 * Aggregates gold and items across all enemy loot table rolls.
 */
export function rollEncounterLoot(
  enemyLootTableIds: string[]
): LootDrop {
  let totalGold = 0;
  const allItems: { itemId: string; quantity: number }[] = [];

  for (const lootTableId of enemyLootTableIds) {
    const drop = rollLootTable(lootTableId);
    totalGold += drop.gold;
    allItems.push(...drop.items);
  }

  // Merge duplicate item drops
  const merged = new Map<string, number>();
  for (const item of allItems) {
    merged.set(item.itemId, (merged.get(item.itemId) ?? 0) + item.quantity);
  }

  return {
    items: Array.from(merged.entries()).map(([itemId, quantity]) => ({ itemId, quantity })),
    gold: totalGold,
  };
}
