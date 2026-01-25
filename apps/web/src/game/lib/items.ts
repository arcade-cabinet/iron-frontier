// Steampunk item definitions for Cogsworth Station

import type { Item } from './types';

export const ITEMS: Record<string, Item> = {
  // Consumables
  steam_tonic: {
    id: 'steam_tonic',
    name: 'Steam Tonic',
    description: 'A fizzing brass bottle of pressurized healing vapors. Restores 25 health.',
    category: 'consumable',
    rarity: 'common',
    stackable: true,
    maxStack: 10,
    value: 15,
    icon: '🧪',
    effects: [{ type: 'heal', value: 25 }],
  },
  
  cogwheel_cookie: {
    id: 'cogwheel_cookie',
    name: 'Cogwheel Cookie',
    description: 'A gear-shaped biscuit popular among dock workers. Restores 10 health.',
    category: 'consumable',
    rarity: 'common',
    stackable: true,
    maxStack: 20,
    value: 5,
    icon: '🍪',
    effects: [{ type: 'heal', value: 10 }],
  },
  
  aether_elixir: {
    id: 'aether_elixir',
    name: 'Aether Elixir',
    description: 'Glowing blue liquid that enhances reflexes. +20% speed for 60 seconds.',
    category: 'consumable',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 5,
    value: 50,
    icon: '✨',
    effects: [{ type: 'buff', value: 20, duration: 60 }],
  },
  
  ironclad_brew: {
    id: 'ironclad_brew',
    name: 'Ironclad Brew',
    description: 'Thick metallic drink that hardens the skin temporarily. +30 defense for 45 seconds.',
    category: 'consumable',
    rarity: 'rare',
    stackable: true,
    maxStack: 3,
    value: 120,
    icon: '🛡️',
    effects: [{ type: 'buff', value: 30, duration: 45 }],
  },

  // Key Items
  dock_manifest: {
    id: 'dock_manifest',
    name: 'Dock Manifest',
    description: 'Official shipping records for Berth 7. Someone might want to see this.',
    category: 'key',
    rarity: 'uncommon',
    stackable: false,
    maxStack: 1,
    value: 0,
    icon: '📜',
  },
  
  master_key: {
    id: 'master_key',
    name: 'Dockmaster\'s Key',
    description: 'An ornate brass key that opens most doors in the docking sector.',
    category: 'key',
    rarity: 'rare',
    stackable: false,
    maxStack: 1,
    value: 0,
    icon: '🔑',
  },
  
  broken_compass: {
    id: 'broken_compass',
    name: 'Broken Compass',
    description: 'A beautiful brass compass with a cracked face. The needle spins wildly.',
    category: 'key',
    rarity: 'rare',
    stackable: false,
    maxStack: 1,
    value: 0,
    icon: '🧭',
  },
  
  captains_seal: {
    id: 'captains_seal',
    name: 'Captain\'s Seal',
    description: 'Wax seal bearing the emblem of the Ironwind. Grants passage on official business.',
    category: 'key',
    rarity: 'legendary',
    stackable: false,
    maxStack: 1,
    value: 0,
    icon: '⚓',
  },

  // Gear
  brass_goggles: {
    id: 'brass_goggles',
    name: 'Brass Goggles',
    description: 'Standard-issue eye protection with magnifying lenses. +5% loot visibility.',
    category: 'gear',
    rarity: 'common',
    stackable: false,
    maxStack: 1,
    value: 30,
    icon: '🥽',
  },
  
  engineers_wrench: {
    id: 'engineers_wrench',
    name: 'Engineer\'s Wrench',
    description: 'A well-worn adjustable wrench. Essential for repair puzzles.',
    category: 'gear',
    rarity: 'common',
    stackable: false,
    maxStack: 1,
    value: 25,
    icon: '🔧',
  },
  
  clockwork_gauntlet: {
    id: 'clockwork_gauntlet',
    name: 'Clockwork Gauntlet',
    description: 'A mechanical glove with enhanced grip. +10 interaction speed.',
    category: 'gear',
    rarity: 'uncommon',
    stackable: false,
    maxStack: 1,
    value: 85,
    icon: '🦾',
  },
  
  aetheric_lantern: {
    id: 'aetheric_lantern',
    name: 'Aetheric Lantern',
    description: 'A lantern that glows with captured aether. Reveals hidden passages.',
    category: 'gear',
    rarity: 'rare',
    stackable: false,
    maxStack: 1,
    value: 200,
    icon: '🏮',
  },

  // Materials
  copper_gear: {
    id: 'copper_gear',
    name: 'Copper Gear',
    description: 'A small but precision-crafted gear. Common crafting material.',
    category: 'material',
    rarity: 'common',
    stackable: true,
    maxStack: 50,
    value: 3,
    icon: '⚙️',
  },
  
  brass_fitting: {
    id: 'brass_fitting',
    name: 'Brass Fitting',
    description: 'A polished brass pipe connector. Used in many repairs.',
    category: 'material',
    rarity: 'common',
    stackable: true,
    maxStack: 50,
    value: 5,
    icon: '🔩',
  },
  
  aether_crystal: {
    id: 'aether_crystal',
    name: 'Aether Crystal',
    description: 'A glowing crystallized chunk of pure aether. Highly valuable.',
    category: 'material',
    rarity: 'rare',
    stackable: true,
    maxStack: 10,
    value: 75,
    icon: '💎',
  },
  
  clockwork_spring: {
    id: 'clockwork_spring',
    name: 'Clockwork Spring',
    description: 'A tightly wound spring of exceptional quality. Powers complex mechanisms.',
    category: 'material',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 20,
    value: 15,
    icon: '🌀',
  },

  // Currency items
  brass_coin: {
    id: 'brass_coin',
    name: 'Brass Cog',
    description: 'Standard currency of Cogsworth Station. Accepted everywhere.',
    category: 'currency',
    rarity: 'common',
    stackable: true,
    maxStack: 9999,
    value: 1,
    icon: '🪙',
  },
};

// Loot tables by rarity weights
export const LOOT_TABLES = {
  common_container: [
    { itemId: 'cogwheel_cookie', weight: 30, minQty: 1, maxQty: 3 },
    { itemId: 'copper_gear', weight: 25, minQty: 1, maxQty: 5 },
    { itemId: 'brass_fitting', weight: 20, minQty: 1, maxQty: 3 },
    { itemId: 'steam_tonic', weight: 15, minQty: 1, maxQty: 2 },
    { itemId: 'brass_coin', weight: 10, minQty: 5, maxQty: 20 },
  ],
  
  uncommon_container: [
    { itemId: 'steam_tonic', weight: 25, minQty: 1, maxQty: 3 },
    { itemId: 'clockwork_spring', weight: 20, minQty: 1, maxQty: 3 },
    { itemId: 'aether_elixir', weight: 15, minQty: 1, maxQty: 2 },
    { itemId: 'brass_goggles', weight: 10, minQty: 1, maxQty: 1 },
    { itemId: 'brass_coin', weight: 30, minQty: 15, maxQty: 50 },
  ],
  
  rare_container: [
    { itemId: 'aether_crystal', weight: 20, minQty: 1, maxQty: 2 },
    { itemId: 'ironclad_brew', weight: 15, minQty: 1, maxQty: 1 },
    { itemId: 'clockwork_gauntlet', weight: 10, minQty: 1, maxQty: 1 },
    { itemId: 'aetheric_lantern', weight: 5, minQty: 1, maxQty: 1 },
    { itemId: 'brass_coin', weight: 50, minQty: 30, maxQty: 100 },
  ],
};

export function getItem(id: string): Item | undefined {
  return ITEMS[id];
}
