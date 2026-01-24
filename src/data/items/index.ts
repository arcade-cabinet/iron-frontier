/**
 * Iron Frontier - Item Library
 *
 * Western RPG themed items for the inventory system.
 * All items are defined here and referenced by ID throughout the game.
 */

import type { BaseItem } from '../schemas/item';

// ============================================================================
// WEAPONS
// ============================================================================

const WEAPONS: BaseItem[] = [
  {
    id: 'revolver_basic',
    name: 'Colt Peacemaker',
    description: 'A reliable six-shooter. The standard sidearm of the frontier.',
    type: 'weapon',
    rarity: 'common',
    value: 25,
    weight: 2.5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'revolver',
    tags: ['weapon', 'firearm', 'pistol'],
    effects: [],
    weaponStats: {
      weaponType: 'revolver',
      damage: 15,
      range: 30,
      accuracy: 70,
      fireRate: 1.5,
      ammoType: 'pistol',
      clipSize: 6,
      reloadTime: 3,
    },
  },
  {
    id: 'revolver_fancy',
    name: 'Engraved Colt',
    description: 'A finely crafted revolver with silver inlay. Shoots as good as it looks.',
    type: 'weapon',
    rarity: 'rare',
    value: 150,
    weight: 2.5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'revolver_fancy',
    tags: ['weapon', 'firearm', 'pistol', 'fancy'],
    effects: [],
    weaponStats: {
      weaponType: 'revolver',
      damage: 20,
      range: 35,
      accuracy: 80,
      fireRate: 1.8,
      ammoType: 'pistol',
      clipSize: 6,
      reloadTime: 2.5,
    },
  },
  {
    id: 'rifle_winchester',
    name: 'Winchester Repeater',
    description: 'The gun that won the West. Accurate at long range.',
    type: 'weapon',
    rarity: 'uncommon',
    value: 75,
    weight: 4.5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'rifle',
    tags: ['weapon', 'firearm', 'rifle', 'long_gun'],
    effects: [],
    weaponStats: {
      weaponType: 'rifle',
      damage: 25,
      range: 100,
      accuracy: 85,
      fireRate: 0.8,
      ammoType: 'rifle',
      clipSize: 15,
      reloadTime: 4,
    },
  },
  {
    id: 'shotgun_coach',
    name: 'Coach Gun',
    description: 'A double-barrel shotgun. Devastating at close range.',
    type: 'weapon',
    rarity: 'uncommon',
    value: 60,
    weight: 3.5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'shotgun',
    tags: ['weapon', 'firearm', 'shotgun', 'close_range'],
    effects: [],
    weaponStats: {
      weaponType: 'shotgun',
      damage: 40,
      range: 15,
      accuracy: 60,
      fireRate: 0.5,
      ammoType: 'shotgun',
      clipSize: 2,
      reloadTime: 3,
    },
  },
  {
    id: 'knife_bowie',
    name: 'Bowie Knife',
    description: 'A large hunting knife. Good for close encounters and skinning game.',
    type: 'weapon',
    rarity: 'common',
    value: 10,
    weight: 0.8,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'knife',
    tags: ['weapon', 'melee', 'blade'],
    effects: [],
    weaponStats: {
      weaponType: 'knife',
      damage: 10,
      range: 0,
      accuracy: 90,
      fireRate: 2,
      ammoType: 'none',
      clipSize: 0,
      reloadTime: 0,
    },
  },
  {
    id: 'dynamite',
    name: 'Dynamite',
    description: 'Nobel\'s invention. Handle with care.',
    type: 'weapon',
    rarity: 'uncommon',
    value: 15,
    weight: 0.5,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'dynamite',
    tags: ['weapon', 'explosive', 'thrown'],
    effects: [{ type: 'damage', value: 50 }],
    weaponStats: {
      weaponType: 'explosive',
      damage: 50,
      range: 20,
      accuracy: 65,
      fireRate: 0.3,
      ammoType: 'none',
      clipSize: 0,
      reloadTime: 0,
    },
  },
];

// ============================================================================
// CONSUMABLES
// ============================================================================

const CONSUMABLES: BaseItem[] = [
  {
    id: 'whiskey',
    name: 'Bottle of Whiskey',
    description: 'Frontier medicine. Takes the edge off and numbs the pain.',
    type: 'consumable',
    rarity: 'common',
    value: 3,
    weight: 0.5,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'bottle',
    tags: ['consumable', 'alcohol', 'healing'],
    effects: [{ type: 'heal', value: 20 }],
    consumableStats: {
      healAmount: 20,
      staminaAmount: 0,
      buffType: 'damage_boost',
      buffDuration: 30,
      buffStrength: 5,
    },
  },
  {
    id: 'bandages',
    name: 'Bandages',
    description: 'Clean cloth strips for binding wounds.',
    type: 'consumable',
    rarity: 'common',
    value: 2,
    weight: 0.1,
    stackable: true,
    maxStack: 20,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'bandage',
    tags: ['consumable', 'medical', 'healing'],
    effects: [{ type: 'heal', value: 15 }],
    consumableStats: {
      healAmount: 15,
      staminaAmount: 0,
      buffType: 'none',
      buffDuration: 0,
      buffStrength: 0,
    },
  },
  {
    id: 'medicine',
    name: 'Dr. Thornton\'s Tonic',
    description: 'Patent medicine. Cures what ails you, or so the label claims.',
    type: 'consumable',
    rarity: 'uncommon',
    value: 8,
    weight: 0.3,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'medicine',
    tags: ['consumable', 'medical', 'healing'],
    effects: [{ type: 'heal', value: 40 }],
    consumableStats: {
      healAmount: 40,
      staminaAmount: 10,
      buffType: 'health_regen',
      buffDuration: 60,
      buffStrength: 2,
    },
  },
  {
    id: 'coffee',
    name: 'Strong Coffee',
    description: 'Black as midnight, hot as hell. Keeps you sharp on the trail.',
    type: 'consumable',
    rarity: 'common',
    value: 1,
    weight: 0.2,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'coffee',
    tags: ['consumable', 'drink', 'stamina'],
    effects: [{ type: 'stamina', value: 30 }],
    consumableStats: {
      healAmount: 0,
      staminaAmount: 30,
      buffType: 'stamina_regen',
      buffDuration: 120,
      buffStrength: 3,
    },
  },
  {
    id: 'beans',
    name: 'Can of Beans',
    description: 'Trail food. Fills the belly, if not the soul.',
    type: 'consumable',
    rarity: 'common',
    value: 1,
    weight: 0.3,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'food',
    tags: ['consumable', 'food', 'stamina'],
    effects: [{ type: 'heal', value: 5 }, { type: 'stamina', value: 20 }],
    consumableStats: {
      healAmount: 5,
      staminaAmount: 20,
      buffType: 'none',
      buffDuration: 0,
      buffStrength: 0,
    },
  },
  {
    id: 'snake_oil',
    name: 'Snake Oil',
    description: 'Dubious elixir sold by traveling salesmen. Might work, might not.',
    type: 'consumable',
    rarity: 'rare',
    value: 20,
    weight: 0.2,
    stackable: true,
    maxStack: 5,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'potion',
    tags: ['consumable', 'medical', 'buff'],
    effects: [{ type: 'buff', value: 10, buffType: 'damage_boost', duration: 180 }],
    consumableStats: {
      healAmount: 10,
      staminaAmount: 10,
      buffType: 'damage_boost',
      buffDuration: 180,
      buffStrength: 10,
    },
  },
];

// ============================================================================
// KEY ITEMS
// ============================================================================

const KEY_ITEMS: BaseItem[] = [
  {
    id: 'mysterious_letter',
    name: 'Mysterious Letter',
    description: 'A weathered letter summoning you to claim what\'s rightfully yours. Signed only with a gear symbol.',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'letter',
    tags: ['key_item', 'quest', 'story'],
    effects: [],
  },
  {
    id: 'train_ticket',
    name: 'Train Ticket',
    description: 'A one-way ticket to Dusty Springs. The paper is still crisp.',
    type: 'key_item',
    rarity: 'common',
    value: 5,
    weight: 0,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'ticket',
    tags: ['key_item', 'travel'],
    effects: [],
  },
  {
    id: 'sheriff_badge',
    name: 'Deputy Badge',
    description: 'A tin star that carries the weight of law on the frontier.',
    type: 'key_item',
    rarity: 'uncommon',
    value: 0,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'badge',
    tags: ['key_item', 'authority', 'faction'],
    effects: [],
  },
  {
    id: 'mine_key',
    name: 'Old Mine Key',
    description: 'A rusted iron key. The head is shaped like a pickaxe.',
    type: 'key_item',
    rarity: 'uncommon',
    value: 0,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'key',
    tags: ['key_item', 'key', 'unlock'],
    effects: [],
  },
  {
    id: 'ivrc_pass',
    name: 'IVRC Employee Pass',
    description: 'Official identification for Iron Valley Railroad Company employees. Opens many doors.',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'pass',
    tags: ['key_item', 'access', 'faction', 'ivrc'],
    effects: [],
  },
];

// ============================================================================
// CURRENCY
// ============================================================================

const CURRENCY: BaseItem[] = [
  {
    id: 'dollars',
    name: 'Dollars',
    description: 'United States currency. Accepted everywhere civilization reaches.',
    type: 'currency',
    rarity: 'common',
    value: 1,
    weight: 0,
    stackable: true,
    maxStack: 9999,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'coin_gold',
    tags: ['currency', 'money'],
    effects: [],
  },
  {
    id: 'ivrc_script',
    name: 'IVRC Script',
    description: 'Company scrip issued by the Iron Valley Railroad Company. Only good at company stores.',
    type: 'currency',
    rarity: 'common',
    value: 0,
    weight: 0,
    stackable: true,
    maxStack: 9999,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'coin_copper',
    tags: ['currency', 'company_store', 'ivrc'],
    effects: [],
  },
  {
    id: 'gold_nugget',
    name: 'Gold Nugget',
    description: 'A small nugget of placer gold. The reason folks come to the frontier.',
    type: 'currency',
    rarity: 'rare',
    value: 50,
    weight: 0.1,
    stackable: true,
    maxStack: 99,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'nugget',
    tags: ['currency', 'valuable', 'gold'],
    effects: [],
  },
];

// ============================================================================
// JUNK / MISC
// ============================================================================

const JUNK: BaseItem[] = [
  {
    id: 'empty_bottle',
    name: 'Empty Bottle',
    description: 'An empty glass bottle. Might be useful for something.',
    type: 'junk',
    rarity: 'common',
    value: 0,
    weight: 0.2,
    stackable: true,
    maxStack: 20,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'bottle_empty',
    tags: ['junk', 'glass', 'container'],
    effects: [],
  },
  {
    id: 'old_newspaper',
    name: 'Old Newspaper',
    description: 'A copy of the Dusty Springs Gazette. The headlines speak of railroad expansion.',
    type: 'junk',
    rarity: 'common',
    value: 0,
    weight: 0,
    stackable: true,
    maxStack: 10,
    usable: true, // Can read it
    droppable: true,
    sellable: false,
    icon: 'paper',
    tags: ['junk', 'readable', 'lore'],
    effects: [],
  },
  {
    id: 'rusty_nail',
    name: 'Rusty Nails',
    description: 'A handful of bent, rusty nails. Scrap metal at best.',
    type: 'junk',
    rarity: 'common',
    value: 0,
    weight: 0.1,
    stackable: true,
    maxStack: 50,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'scrap',
    tags: ['junk', 'metal', 'scrap'],
    effects: [],
  },
  {
    id: 'pocket_watch',
    name: 'Pocket Watch',
    description: 'A brass pocket watch. The hands are frozen at 3:10.',
    type: 'junk',
    rarity: 'uncommon',
    value: 5,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'watch',
    tags: ['junk', 'valuable', 'trinket'],
    effects: [],
  },
  {
    id: 'playing_cards',
    name: 'Deck of Cards',
    description: 'A worn deck of playing cards. Missing the ace of spades.',
    type: 'junk',
    rarity: 'common',
    value: 1,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'cards',
    tags: ['junk', 'gambling', 'entertainment'],
    effects: [],
  },
  {
    id: 'tobacco_pouch',
    name: 'Tobacco Pouch',
    description: 'A leather pouch containing dried tobacco. Smells earthy.',
    type: 'junk',
    rarity: 'common',
    value: 2,
    weight: 0.1,
    stackable: true,
    maxStack: 10,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'pouch',
    tags: ['junk', 'trade_good'],
    effects: [],
  },
];

// ============================================================================
// AMMO
// ============================================================================

const AMMO: BaseItem[] = [
  {
    id: 'ammo_pistol',
    name: 'Pistol Rounds',
    description: 'Standard .45 caliber rounds for revolvers.',
    type: 'junk', // Using junk type for ammo
    rarity: 'common',
    value: 1,
    weight: 0.02,
    stackable: true,
    maxStack: 100,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'ammo_pistol',
    tags: ['ammo', 'pistol'],
    effects: [],
  },
  {
    id: 'ammo_rifle',
    name: 'Rifle Rounds',
    description: 'Long cartridges for repeating rifles.',
    type: 'junk',
    rarity: 'common',
    value: 2,
    weight: 0.03,
    stackable: true,
    maxStack: 100,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'ammo_rifle',
    tags: ['ammo', 'rifle'],
    effects: [],
  },
  {
    id: 'ammo_shotgun',
    name: 'Shotgun Shells',
    description: 'Buckshot shells for double-barrel shotguns.',
    type: 'junk',
    rarity: 'common',
    value: 2,
    weight: 0.05,
    stackable: true,
    maxStack: 50,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'ammo_shotgun',
    tags: ['ammo', 'shotgun'],
    effects: [],
  },
];

// ============================================================================
// ITEM LIBRARY
// ============================================================================

/** All items in the game, indexed by ID */
export const ITEM_LIBRARY: Record<string, BaseItem> = {};

// Populate the library
[...WEAPONS, ...CONSUMABLES, ...KEY_ITEMS, ...CURRENCY, ...JUNK, ...AMMO].forEach((item) => {
  ITEM_LIBRARY[item.id] = item;
});

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
