/**
 * Enemy Templates - Wildlife
 */

import type { EnemyTemplate } from './schemas.ts';

export const DesertWolfTemplate: EnemyTemplate = {
  id: 'desert_wolf',
  name: 'Desert Wolf',
  description: 'A lean, hungry predator adapted to the harsh frontier lands.',
  baseStats: {
    health: 18,
    damage: 6,
    armor: 0,
    accuracy: 75,
    evasion: 20,
  },
  scaling: {
    healthPerLevel: 1.12,
    damagePerLevel: 1.1,
    armorPerLevel: 1.0,
    accuracyPerLevel: 1,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['Mangy', 'Hungry', 'Wild', 'Gray', 'Feral', 'Rabid'],
    titles: [],
    suffixes: [],
  },
  lootTableId: 'wildlife_canine',
  behaviorTags: ['aggressive', 'melee', 'charges', 'pack_tactics', 'mobile'],
  factions: ['wildlife'],
  combatTags: ['animal', 'predator', 'common', 'pack'],
  xpModifier: 0.8,
  minLevel: 1,
  maxLevel: 6,
};

export const RattlesnakeTemplate: EnemyTemplate = {
  id: 'rattlesnake',
  name: 'Rattlesnake',
  description: 'A venomous serpent whose bite can spell doom for the unwary.',
  baseStats: {
    health: 8,
    damage: 10,
    armor: 0,
    accuracy: 80,
    evasion: 25,
  },
  scaling: {
    healthPerLevel: 1.08,
    damagePerLevel: 1.12,
    armorPerLevel: 1.0,
    accuracyPerLevel: 2,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['Diamondback', 'Western', 'Sidewinder', 'Timber', 'Mojave'],
    titles: [],
    suffixes: [],
  },
  lootTableId: 'wildlife_snake',
  behaviorTags: ['defensive', 'melee', 'ambusher', 'poisonous', 'stationary'],
  factions: ['wildlife'],
  combatTags: ['animal', 'reptile', 'common', 'poison'],
  xpModifier: 0.7,
  minLevel: 1,
  maxLevel: 5,
};

export const MountainLionTemplate: EnemyTemplate = {
  id: 'mountain_lion',
  name: 'Mountain Lion',
  description: 'A powerful apex predator that stalks the frontier hills.',
  baseStats: {
    health: 45,
    damage: 12,
    armor: 2,
    accuracy: 80,
    evasion: 25,
  },
  scaling: {
    healthPerLevel: 1.15,
    damagePerLevel: 1.12,
    armorPerLevel: 1.05,
    accuracyPerLevel: 1,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['Scarred', 'Old', 'Massive', 'Hungry', 'Shadow'],
    titles: [],
    suffixes: [],
  },
  lootTableId: 'wildlife_predator',
  behaviorTags: ['aggressive', 'melee', 'charges', 'ambusher', 'flanker', 'smart'],
  factions: ['wildlife'],
  combatTags: ['animal', 'predator', 'uncommon', 'dangerous'],
  xpModifier: 1.4,
  minLevel: 2,
  maxLevel: 8,
};

export const GrizzlyBearTemplate: EnemyTemplate = {
  id: 'grizzly_bear',
  name: 'Grizzly Bear',
  description: 'A massive, terrifying creature that dominates the frontier wilderness.',
  baseStats: {
    health: 80,
    damage: 15,
    armor: 3,
    accuracy: 65,
    evasion: 5,
  },
  scaling: {
    healthPerLevel: 1.18,
    damagePerLevel: 1.12,
    armorPerLevel: 1.08,
    accuracyPerLevel: 2,
    evasionPerLevel: 0,
  },
  namePool: {
    prefixes: ['Grizzled', 'Massive', 'Angry', 'Old', 'Scarred', 'Raging'],
    titles: [],
    suffixes: [],
  },
  lootTableId: 'wildlife_bear',
  behaviorTags: ['aggressive', 'melee', 'charges', 'berserker', 'dumb'],
  factions: ['wildlife'],
  combatTags: ['animal', 'predator', 'rare', 'dangerous', 'mini_boss'],
  xpModifier: 2.0,
  minLevel: 3,
  maxLevel: 10,
};

export const ScorpionTemplate: EnemyTemplate = {
  id: 'scorpion',
  name: 'Giant Scorpion',
  description: 'An oversized arachnid with pincers and a venomous stinger.',
  baseStats: {
    health: 12,
    damage: 8,
    armor: 3,
    accuracy: 70,
    evasion: 15,
  },
  scaling: {
    healthPerLevel: 1.1,
    damagePerLevel: 1.1,
    armorPerLevel: 1.08,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Desert', 'Bark', 'Emperor', 'Giant', 'Venomous'],
    titles: [],
    suffixes: [],
  },
  lootTableId: 'wildlife_insect',
  behaviorTags: ['aggressive', 'melee', 'poisonous', 'stationary', 'pack_tactics'],
  factions: ['wildlife'],
  combatTags: ['animal', 'insect', 'common', 'poison', 'swarm'],
  xpModifier: 0.6,
  minLevel: 1,
  maxLevel: 5,
};

export const VultureTemplate: EnemyTemplate = {
  id: 'vulture',
  name: 'Vulture',
  description: 'A scavenging bird that becomes aggressive when defending carrion.',
  baseStats: {
    health: 10,
    damage: 4,
    armor: 0,
    accuracy: 70,
    evasion: 35,
  },
  scaling: {
    healthPerLevel: 1.08,
    damagePerLevel: 1.08,
    armorPerLevel: 1.0,
    accuracyPerLevel: 2,
    evasionPerLevel: 3,
  },
  namePool: {
    prefixes: ['Black', 'Hungry', 'Circling', 'Patient'],
    titles: [],
    suffixes: [],
  },
  lootTableId: 'wildlife_bird',
  behaviorTags: ['defensive', 'melee', 'mobile', 'coward', 'pack_tactics'],
  factions: ['wildlife'],
  combatTags: ['animal', 'bird', 'common', 'weak'],
  xpModifier: 0.4,
  minLevel: 1,
  maxLevel: 4,
};
