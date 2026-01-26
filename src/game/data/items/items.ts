/**
 * Iron Frontier - Complete Item Database
 *
 * All items organized by category:
 * - Consumables (healing, food, buffs)
 * - Weapons (melee, ranged, explosives)
 * - Armor (body, head, accessories)
 * - Key Items (quest items)
 * - Loot (materials, crafting, valuables)
 * - Ammunition
 */

import type { BaseItem } from '../schemas/item';

// ============================================================================
// CONSUMABLES - HEALING
// ============================================================================

export const HEALING_ITEMS: BaseItem[] = [
  {
    id: 'bandages_basic',
    name: 'Bandages',
    description: 'Clean cloth strips for binding wounds. Basic but effective.',
    type: 'consumable',
    rarity: 'common',
    value: 5,
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
    id: 'health_potion',
    name: 'Health Tonic',
    description: "Dr. Thornton's patent medicine. Restores 30 health points.",
    type: 'consumable',
    rarity: 'common',
    value: 10,
    weight: 0.3,
    stackable: true,
    maxStack: 15,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'potion_red',
    tags: ['consumable', 'medical', 'healing'],
    effects: [{ type: 'heal', value: 30 }],
    consumableStats: {
      healAmount: 30,
      staminaAmount: 0,
      buffType: 'none',
      buffDuration: 0,
      buffStrength: 0,
    },
  },
  {
    id: 'health_potion_greater',
    name: 'Greater Health Tonic',
    description: 'A potent medicinal brew. Restores 75 health points.',
    type: 'consumable',
    rarity: 'uncommon',
    value: 25,
    weight: 0.4,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'potion_red_large',
    tags: ['consumable', 'medical', 'healing'],
    effects: [{ type: 'heal', value: 75 }],
    consumableStats: {
      healAmount: 75,
      staminaAmount: 0,
      buffType: 'health_regen',
      buffDuration: 30,
      buffStrength: 2,
    },
  },
  {
    id: 'antidote',
    name: 'Antidote',
    description: 'Extract to cure poison from snake and scorpion venom.',
    type: 'consumable',
    rarity: 'common',
    value: 8,
    weight: 0.2,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'potion_green',
    tags: ['consumable', 'medical', 'cure'],
    effects: [
      { type: 'cure', value: 1 },
      { type: 'heal', value: 10 },
    ],
    consumableStats: {
      healAmount: 10,
      staminaAmount: 0,
      buffType: 'poison_resist',
      buffDuration: 120,
      buffStrength: 50,
    },
  },
];

// ============================================================================
// CONSUMABLES - FOOD & PROVISIONS
// ============================================================================

export const FOOD_ITEMS: BaseItem[] = [
  {
    id: 'rations',
    name: 'Trail Rations',
    description: 'Dried meat and hardtack. One meal for the road.',
    type: 'consumable',
    rarity: 'common',
    value: 3,
    weight: 0.3,
    stackable: true,
    maxStack: 20,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'food_rations',
    tags: ['consumable', 'food', 'provisions'],
    effects: [
      { type: 'heal', value: 5 },
      { type: 'stamina', value: 20 },
    ],
    consumableStats: {
      healAmount: 5,
      staminaAmount: 20,
      buffType: 'none',
      buffDuration: 0,
      buffStrength: 0,
    },
  },
  {
    id: 'canteen_refill',
    name: 'Canteen Water',
    description: 'Fresh water. Essential for desert travel.',
    type: 'consumable',
    rarity: 'common',
    value: 5,
    weight: 0.5,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'canteen',
    tags: ['consumable', 'drink', 'provisions'],
    effects: [{ type: 'stamina', value: 30 }],
    consumableStats: {
      healAmount: 5,
      staminaAmount: 30,
      buffType: 'heat_resist',
      buffDuration: 180,
      buffStrength: 25,
    },
  },
  {
    id: 'coffee_hot',
    name: 'Hot Coffee',
    description: 'Black as midnight, hot as hell. Reduces fatigue and boosts speed.',
    type: 'consumable',
    rarity: 'common',
    value: 4,
    weight: 0.2,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'coffee',
    tags: ['consumable', 'drink', 'stamina', 'buff'],
    effects: [
      { type: 'stamina', value: 25 },
      { type: 'buff', value: 10, buffType: 'speed_boost', duration: 120 },
    ],
    consumableStats: {
      healAmount: 0,
      staminaAmount: 25,
      buffType: 'speed_boost',
      buffDuration: 120,
      buffStrength: 10,
    },
  },
  {
    id: 'stimulant_tonic',
    name: 'Stimulant',
    description: 'A powerful pick-me-up. Reduces fatigue by 25% temporarily.',
    type: 'consumable',
    rarity: 'uncommon',
    value: 15,
    weight: 0.2,
    stackable: true,
    maxStack: 5,
    usable: true,
    droppable: true,
    sellable: true,
    icon: 'potion_yellow',
    tags: ['consumable', 'medical', 'buff'],
    effects: [{ type: 'buff', value: 25, buffType: 'stamina_regen', duration: 180 }],
    consumableStats: {
      healAmount: 0,
      staminaAmount: 50,
      buffType: 'stamina_regen',
      buffDuration: 180,
      buffStrength: 25,
    },
  },
];

// ============================================================================
// WEAPONS - MELEE
// ============================================================================

export const MELEE_WEAPONS: BaseItem[] = [
  {
    id: 'rusty_knife',
    name: 'Rusty Knife',
    description: 'A worn blade with notched edges. Better than nothing.',
    type: 'weapon',
    rarity: 'common',
    value: 15,
    weight: 0.4,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'knife_rusty',
    tags: ['weapon', 'melee', 'blade', 'starter'],
    effects: [],
    weaponStats: {
      weaponType: 'knife',
      damage: 2,
      range: 0,
      accuracy: 80,
      fireRate: 2.5,
      ammoType: 'none',
      clipSize: 0,
      reloadTime: 0,
    },
  },
  {
    id: 'hunting_knife_new',
    name: 'Hunting Knife',
    description: 'A sharp knife for skinning game and self-defense.',
    type: 'weapon',
    rarity: 'common',
    value: 40,
    weight: 0.5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'knife',
    tags: ['weapon', 'melee', 'blade', 'tool'],
    effects: [],
    weaponStats: {
      weaponType: 'knife',
      damage: 5,
      range: 0,
      accuracy: 85,
      fireRate: 2,
      ammoType: 'none',
      clipSize: 0,
      reloadTime: 0,
    },
  },
  {
    id: 'brass_knuckles',
    name: 'Brass Knuckles',
    description: 'Weighted knuckle dusters. Fast strikes for close combat.',
    type: 'weapon',
    rarity: 'common',
    value: 30,
    weight: 0.3,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'brass_knuckles',
    tags: ['weapon', 'melee', 'fist'],
    effects: [],
    weaponStats: {
      weaponType: 'melee',
      damage: 4,
      range: 0,
      accuracy: 90,
      fireRate: 3,
      ammoType: 'none',
      clipSize: 0,
      reloadTime: 0,
    },
  },
  {
    id: 'steampunk_blade',
    name: 'Steampunk Blade',
    description: 'A mechanically-enhanced blade from the Old Works. Hums with power.',
    type: 'weapon',
    rarity: 'rare',
    value: 200,
    weight: 1.2,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'blade_steampunk',
    tags: ['weapon', 'melee', 'blade', 'late_game', 'steampunk'],
    effects: [],
    weaponStats: {
      weaponType: 'knife',
      damage: 18,
      range: 0,
      accuracy: 88,
      fireRate: 2,
      ammoType: 'none',
      clipSize: 0,
      reloadTime: 0,
    },
  },
];

// ============================================================================
// WEAPONS - RANGED
// ============================================================================

export const RANGED_WEAPONS: BaseItem[] = [
  {
    id: 'revolver_standard',
    name: 'Revolver',
    description: 'A reliable six-shooter. Standard sidearm of the frontier.',
    type: 'weapon',
    rarity: 'common',
    value: 80,
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
      damage: 8,
      range: 30,
      accuracy: 70,
      fireRate: 1.5,
      ammoType: 'pistol',
      clipSize: 6,
      reloadTime: 3,
    },
  },
  {
    id: 'rifle_standard',
    name: 'Rifle',
    description: 'A bolt-action rifle. Accurate at long range but slow to fire.',
    type: 'weapon',
    rarity: 'uncommon',
    value: 150,
    weight: 4.0,
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
      damage: 12,
      range: 120,
      accuracy: 85,
      fireRate: 0.5,
      ammoType: 'rifle',
      clipSize: 5,
      reloadTime: 5,
    },
  },
  {
    id: 'shotgun_standard',
    name: 'Shotgun',
    description: 'A double-barrel shotgun. Devastating up close.',
    type: 'weapon',
    rarity: 'uncommon',
    value: 120,
    weight: 3.8,
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
      damage: 15,
      range: 15,
      accuracy: 55,
      fireRate: 0.5,
      ammoType: 'shotgun',
      clipSize: 2,
      reloadTime: 3,
    },
  },
];

// ============================================================================
// ARMOR - BODY
// ============================================================================

export const BODY_ARMOR: BaseItem[] = [
  {
    id: 'leather_vest',
    name: 'Leather Vest',
    description: 'A worn leather vest. Provides basic protection.',
    type: 'armor',
    rarity: 'common',
    value: 20,
    weight: 2.0,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'vest_leather',
    tags: ['armor', 'body', 'light'],
    effects: [],
    armorStats: {
      defense: 2,
      slot: 'body',
      movementPenalty: 0,
      resistances: {},
    },
  },
  {
    id: 'reinforced_leather',
    name: 'Reinforced Leather',
    description: 'Leather armor with metal studs. Better protection without sacrificing mobility.',
    type: 'armor',
    rarity: 'uncommon',
    value: 60,
    weight: 3.5,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'vest_reinforced',
    tags: ['armor', 'body', 'medium'],
    effects: [],
    armorStats: {
      defense: 5,
      slot: 'body',
      movementPenalty: 0.05,
      resistances: {},
    },
  },
  {
    id: 'chain_shirt',
    name: 'Chain Shirt',
    description: 'A shirt of interlocking metal rings. Solid protection against blades.',
    type: 'armor',
    rarity: 'uncommon',
    value: 120,
    weight: 8.0,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'chainmail',
    tags: ['armor', 'body', 'medium'],
    effects: [],
    armorStats: {
      defense: 8,
      slot: 'body',
      movementPenalty: 0.1,
      resistances: { slashing: 20 },
    },
  },
  {
    id: 'steam_plated_armor',
    name: 'Steam-Plated Armor',
    description:
      'Heavy armor with brass plates and steam vents. Maximum protection for the late game.',
    type: 'armor',
    rarity: 'rare',
    value: 250,
    weight: 15.0,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'armor_steampunk',
    tags: ['armor', 'body', 'heavy', 'steampunk', 'late_game'],
    effects: [],
    armorStats: {
      defense: 12,
      slot: 'body',
      movementPenalty: 0.2,
      resistances: { fire: 15, slashing: 25 },
    },
  },
];

// ============================================================================
// KEY ITEMS
// ============================================================================

export const KEY_ITEMS: BaseItem[] = [
  {
    id: 'mine_key',
    name: 'Mine Key',
    description: 'A rusted iron key with a pickaxe symbol. Opens the abandoned mine.',
    type: 'key_item',
    rarity: 'uncommon',
    value: 0,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'key_iron',
    tags: ['key_item', 'key', 'unlock', 'quest'],
    effects: [],
  },
  {
    id: 'town_pass',
    name: 'Town Pass',
    description: 'Official documentation granting access to restricted areas.',
    type: 'key_item',
    rarity: 'uncommon',
    value: 0,
    weight: 0,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: false,
    sellable: false,
    icon: 'document',
    tags: ['key_item', 'access', 'quest'],
    effects: [],
  },
  {
    id: 'evidence_documents',
    name: 'Evidence Documents',
    description: 'Incriminating papers that prove the conspiracy.',
    type: 'key_item',
    rarity: 'rare',
    value: 0,
    weight: 0.1,
    stackable: false,
    maxStack: 1,
    usable: true,
    droppable: false,
    sellable: false,
    icon: 'documents',
    tags: ['key_item', 'quest', 'story'],
    effects: [],
  },
  {
    id: 'wanted_poster',
    name: 'Wanted Poster',
    description: 'A bounty notice for a known outlaw. Worth money if captured.',
    type: 'key_item',
    rarity: 'common',
    value: 0,
    weight: 0,
    stackable: true,
    maxStack: 10,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'poster',
    tags: ['key_item', 'bounty', 'quest'],
    effects: [],
  },
  {
    id: 'automaton_core',
    name: 'Automaton Power Core',
    description: 'A strange glowing core from a destroyed automaton. Valuable to collectors.',
    type: 'key_item',
    rarity: 'rare',
    value: 100,
    weight: 2.0,
    stackable: false,
    maxStack: 1,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'core_glowing',
    tags: ['key_item', 'valuable', 'steampunk', 'quest'],
    effects: [],
  },
];

// ============================================================================
// LOOT - ANIMAL MATERIALS
// ============================================================================

export const ANIMAL_LOOT: BaseItem[] = [
  {
    id: 'coyote_pelt',
    name: 'Coyote Pelt',
    description: 'A scraggly desert coyote pelt. Worth a few dollars.',
    type: 'junk',
    rarity: 'common',
    value: 5,
    weight: 0.5,
    stackable: true,
    maxStack: 20,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'pelt_coyote',
    tags: ['loot', 'animal', 'pelt', 'trade_good'],
    effects: [],
  },
  {
    id: 'wolf_pelt',
    name: 'Wolf Pelt',
    description: 'A thick wolf pelt. Good for warm clothing or trade.',
    type: 'junk',
    rarity: 'uncommon',
    value: 12,
    weight: 1.0,
    stackable: true,
    maxStack: 15,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'pelt_wolf',
    tags: ['loot', 'animal', 'pelt', 'trade_good'],
    effects: [],
  },
  {
    id: 'bear_pelt',
    name: 'Bear Pelt',
    description: 'A massive grizzly bear pelt. Very valuable.',
    type: 'junk',
    rarity: 'rare',
    value: 35,
    weight: 3.0,
    stackable: true,
    maxStack: 5,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'pelt_bear',
    tags: ['loot', 'animal', 'pelt', 'trade_good', 'valuable'],
    effects: [],
  },
  {
    id: 'snake_venom',
    name: 'Snake Venom',
    description: 'Extracted rattlesnake venom. Used in crafting antidotes.',
    type: 'junk',
    rarity: 'common',
    value: 8,
    weight: 0.1,
    stackable: true,
    maxStack: 20,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'vial_green',
    tags: ['loot', 'animal', 'crafting', 'poison'],
    effects: [],
  },
  {
    id: 'scorpion_stinger',
    name: 'Scorpion Stinger',
    description: 'A venomous scorpion stinger. Alchemists pay well for these.',
    type: 'junk',
    rarity: 'common',
    value: 6,
    weight: 0.05,
    stackable: true,
    maxStack: 30,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'stinger',
    tags: ['loot', 'animal', 'crafting', 'poison'],
    effects: [],
  },
  {
    id: 'mountain_lion_claw',
    name: 'Mountain Lion Claw',
    description: 'A razor-sharp claw from a mountain lion. Trophy hunters prize these.',
    type: 'junk',
    rarity: 'uncommon',
    value: 15,
    weight: 0.1,
    stackable: true,
    maxStack: 20,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'claw',
    tags: ['loot', 'animal', 'trophy'],
    effects: [],
  },
];

// ============================================================================
// LOOT - BANDIT SPOILS
// ============================================================================

export const BANDIT_LOOT: BaseItem[] = [
  {
    id: 'bandits_pouch',
    name: "Bandit's Pouch",
    description: 'A small leather pouch with stolen coins. Contains $10-20.',
    type: 'junk',
    rarity: 'common',
    value: 15,
    weight: 0.2,
    stackable: true,
    maxStack: 20,
    usable: true,
    droppable: true,
    sellable: false,
    icon: 'pouch_coins',
    tags: ['loot', 'bandit', 'money', 'container'],
    effects: [],
  },
  {
    id: 'stolen_goods',
    name: 'Stolen Goods',
    description: 'A bundle of pilfered merchandise. Can be sold discreetly.',
    type: 'junk',
    rarity: 'common',
    value: 20,
    weight: 1.0,
    stackable: true,
    maxStack: 10,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'bundle',
    tags: ['loot', 'bandit', 'trade_good', 'stolen'],
    effects: [],
  },
  {
    id: 'outlaw_badge',
    name: 'Outlaw Gang Badge',
    description: 'A copper badge worn by gang members. Proof of a kill for bounties.',
    type: 'junk',
    rarity: 'uncommon',
    value: 25,
    weight: 0.1,
    stackable: true,
    maxStack: 20,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'badge_outlaw',
    tags: ['loot', 'bandit', 'bounty', 'proof'],
    effects: [],
  },
];

// ============================================================================
// LOOT - MECHANICAL PARTS
// ============================================================================

export const MECHANICAL_LOOT: BaseItem[] = [
  {
    id: 'mechanical_parts',
    name: 'Mechanical Parts',
    description: 'Gears, springs, and cogs salvaged from machines. Used in crafting.',
    type: 'junk',
    rarity: 'common',
    value: 15,
    weight: 0.5,
    stackable: true,
    maxStack: 50,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'gears',
    tags: ['loot', 'mechanical', 'crafting', 'steampunk'],
    effects: [],
  },
  {
    id: 'copper_wire',
    name: 'Copper Wire',
    description: 'Spools of thin copper wire. Useful for repairs and tinkering.',
    type: 'junk',
    rarity: 'common',
    value: 8,
    weight: 0.3,
    stackable: true,
    maxStack: 50,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'wire_copper',
    tags: ['loot', 'mechanical', 'crafting'],
    effects: [],
  },
  {
    id: 'steam_valve',
    name: 'Steam Valve',
    description: 'A precision-machined valve from steam machinery. Valuable.',
    type: 'junk',
    rarity: 'uncommon',
    value: 30,
    weight: 1.0,
    stackable: true,
    maxStack: 20,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'valve',
    tags: ['loot', 'mechanical', 'crafting', 'steampunk', 'valuable'],
    effects: [],
  },
  {
    id: 'automaton_plating',
    name: 'Automaton Plating',
    description: 'Salvaged armor plating from an automaton. Incredibly durable.',
    type: 'junk',
    rarity: 'rare',
    value: 50,
    weight: 2.0,
    stackable: true,
    maxStack: 10,
    usable: false,
    droppable: true,
    sellable: true,
    icon: 'plating',
    tags: ['loot', 'mechanical', 'crafting', 'steampunk', 'valuable'],
    effects: [],
  },
];

// ============================================================================
// AMMUNITION
// ============================================================================

export const AMMUNITION: BaseItem[] = [
  {
    id: 'pistol_ammo',
    name: 'Pistol Rounds',
    description: 'Standard .45 caliber rounds for revolvers.',
    type: 'junk',
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
    id: 'rifle_rounds',
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
    id: 'shotgun_ammo',
    name: 'Shotgun Shells',
    description: 'Buckshot shells for shotguns.',
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
// ALL ITEMS COMBINED
// ============================================================================

export const ALL_NEW_ITEMS: BaseItem[] = [
  ...HEALING_ITEMS,
  ...FOOD_ITEMS,
  ...MELEE_WEAPONS,
  ...RANGED_WEAPONS,
  ...BODY_ARMOR,
  ...KEY_ITEMS,
  ...ANIMAL_LOOT,
  ...BANDIT_LOOT,
  ...MECHANICAL_LOOT,
  ...AMMUNITION,
];

/** Item library indexed by ID */
export const NEW_ITEMS_BY_ID: Record<string, BaseItem> = Object.fromEntries(
  ALL_NEW_ITEMS.map((item) => [item.id, item])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getNewItemById(itemId: string): BaseItem | undefined {
  return NEW_ITEMS_BY_ID[itemId];
}

export function getNewItemsByType(type: BaseItem['type']): BaseItem[] {
  return ALL_NEW_ITEMS.filter((item) => item.type === type);
}

export function getNewItemsByTag(tag: string): BaseItem[] {
  return ALL_NEW_ITEMS.filter((item) => item.tags.includes(tag));
}

export function getNewItemsByRarity(rarity: string): BaseItem[] {
  return ALL_NEW_ITEMS.filter((item) => item.rarity === rarity);
}

export function getHealingItems(): BaseItem[] {
  return ALL_NEW_ITEMS.filter(
    (item) => item.type === 'consumable' && item.tags.includes('healing')
  );
}

export function getWeaponsByType(
  weaponType: 'melee' | 'revolver' | 'rifle' | 'shotgun' | 'explosive'
): BaseItem[] {
  return ALL_NEW_ITEMS.filter(
    (item) =>
      item.type === 'weapon' &&
      item.weaponStats?.weaponType === weaponType
  );
}

export function getArmorBySlot(slot: 'body' | 'head' | 'legs' | 'accessory'): BaseItem[] {
  return ALL_NEW_ITEMS.filter(
    (item) => item.type === 'armor' && item.armorStats?.slot === slot
  );
}

export function getLootItems(): BaseItem[] {
  return ALL_NEW_ITEMS.filter((item) => item.tags.includes('loot'));
}
