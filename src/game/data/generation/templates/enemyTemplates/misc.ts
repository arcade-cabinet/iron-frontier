/**
 * Enemy Templates - Misc
 */

import type { EnemyTemplate } from './schemas.ts';

export const RustlerTemplate: EnemyTemplate = {
  id: 'rustler',
  name: 'Rustler',
  description: 'A cattle thief who knows the land and how to disappear into it.',
  baseStats: {
    health: 25,
    damage: 7,
    armor: 2,
    accuracy: 68,
    evasion: 15,
  },
  scaling: {
    healthPerLevel: 1.12,
    damagePerLevel: 1.1,
    armorPerLevel: 1.05,
    accuracyPerLevel: 2,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['Slippery', 'Quick', 'Sneaky', 'Crafty'],
    titles: ['Rustler', 'Thief', 'Wrangler'],
    suffixes: [],
  },
  lootTableId: 'rustler_loot',
  behaviorTags: ['defensive', 'ranged', 'retreats', 'coward', 'mobile'],
  factions: ['raiders'],
  combatTags: ['humanoid', 'outlaw', 'common', 'thief'],
  xpModifier: 0.9,
  minLevel: 1,
  maxLevel: 6,
};

export const MercenaryTemplate: EnemyTemplate = {
  id: 'mercenary',
  name: 'Mercenary',
  description: 'A professional soldier-for-hire with no loyalty but to coin.',
  baseStats: {
    health: 40,
    damage: 10,
    armor: 4,
    accuracy: 75,
    evasion: 10,
  },
  scaling: {
    healthPerLevel: 1.15,
    damagePerLevel: 1.12,
    armorPerLevel: 1.1,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Hired', 'Cold', 'Professional', 'Silent', 'Veteran'],
    titles: ['Mercenary', 'Gun-for-Hire', 'Soldier'],
    suffixes: [],
  },
  lootTableId: 'mercenary_elite',
  behaviorTags: ['aggressive', 'ranged', 'smart', 'pack_tactics', 'mobile'],
  factions: ['neutral'],
  combatTags: ['humanoid', 'professional', 'uncommon', 'armored'],
  xpModifier: 1.3,
  minLevel: 2,
  maxLevel: 9,
};

export const CorruptDeputyTemplate: EnemyTemplate = {
  id: 'corrupt_deputy',
  name: 'Corrupt Deputy',
  description: 'A lawman who sold his badge for gold and does the bidding of darker powers.',
  baseStats: {
    health: 35,
    damage: 9,
    armor: 3,
    accuracy: 72,
    evasion: 10,
  },
  scaling: {
    healthPerLevel: 1.15,
    damagePerLevel: 1.12,
    armorPerLevel: 1.08,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Crooked', 'Dirty', 'Bought'],
    titles: ['Deputy', 'Lawman', 'Marshal'],
    suffixes: ['the Traitor', 'Two-Face'],
  },
  lootTableId: 'lawman_corrupt',
  behaviorTags: ['aggressive', 'ranged', 'smart', 'pack_tactics'],
  factions: ['ivrc_guards', 'copperhead'],
  combatTags: ['humanoid', 'lawman', 'uncommon', 'traitor'],
  xpModifier: 1.2,
  minLevel: 2,
  maxLevel: 8,
};

export const HostileProspectorTemplate: EnemyTemplate = {
  id: 'prospector_hostile',
  name: 'Hostile Prospector',
  description: 'A prospector driven mad by gold fever who sees everyone as a threat to his claim.',
  baseStats: {
    health: 20,
    damage: 6,
    armor: 1,
    accuracy: 60,
    evasion: 8,
  },
  scaling: {
    healthPerLevel: 1.1,
    damagePerLevel: 1.1,
    armorPerLevel: 1.05,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Crazy', 'Mad', 'Wild-Eyed', 'Paranoid'],
    titles: ['Prospector', 'Miner', 'Digger'],
    suffixes: ['the Mad', 'Gold-Crazy'],
  },
  lootTableId: 'prospector_loot',
  behaviorTags: ['aggressive', 'melee', 'erratic', 'berserker', 'dumb'],
  factions: ['neutral'],
  combatTags: ['humanoid', 'civilian', 'common', 'crazy'],
  xpModifier: 0.7,
  minLevel: 1,
  maxLevel: 5,
};

export const DesperadoTemplate: EnemyTemplate = {
  id: 'desperado',
  name: 'Desperado',
  description: 'A wanted outlaw with nothing left to lose and everything to prove.',
  baseStats: {
    health: 38,
    damage: 11,
    armor: 3,
    accuracy: 78,
    evasion: 18,
  },
  scaling: {
    healthPerLevel: 1.15,
    damagePerLevel: 1.14,
    armorPerLevel: 1.08,
    accuracyPerLevel: 2,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['Wanted', 'Desperate', 'Notorious', 'Infamous'],
    titles: ['Desperado', 'Outlaw', 'Fugitive'],
    suffixes: ['the Deadly', 'No-Good', 'Dead-or-Alive'],
  },
  lootTableId: 'bounty_target',
  behaviorTags: ['aggressive', 'ranged', 'mobile', 'berserker', 'smart'],
  factions: ['raiders', 'copperhead'],
  combatTags: ['humanoid', 'outlaw', 'uncommon', 'dangerous', 'bounty'],
  xpModifier: 1.4,
  minLevel: 2,
  maxLevel: 9,
};

export const GhostTownDwellerTemplate: EnemyTemplate = {
  id: 'ghost_town_dweller',
  name: 'Ghost Town Dweller',
  description: 'A desperate soul squatting in abandoned ruins, hostile to all outsiders.',
  baseStats: {
    health: 22,
    damage: 7,
    armor: 1,
    accuracy: 62,
    evasion: 12,
  },
  scaling: {
    healthPerLevel: 1.1,
    damagePerLevel: 1.1,
    armorPerLevel: 1.05,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Haggard', 'Gaunt', 'Wild', 'Desperate'],
    titles: ['Squatter', 'Dweller', 'Vagrant'],
    suffixes: [],
  },
  lootTableId: 'scavenger_loot',
  behaviorTags: ['defensive', 'ranged', 'ambusher', 'retreats', 'coward'],
  factions: ['neutral'],
  combatTags: ['humanoid', 'civilian', 'common', 'desperate'],
  xpModifier: 0.8,
  minLevel: 1,
  maxLevel: 5,
};

export const TombRaiderTemplate: EnemyTemplate = {
  id: 'tomb_raider',
  name: 'Tomb Raider',
  description: 'A treasure hunter who desecrates ancient sites for profit.',
  baseStats: {
    health: 32,
    damage: 9,
    armor: 2,
    accuracy: 72,
    evasion: 14,
  },
  scaling: {
    healthPerLevel: 1.12,
    damagePerLevel: 1.12,
    armorPerLevel: 1.08,
    accuracyPerLevel: 2,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['Grave', 'Relic', 'Greedy', 'Shadow'],
    titles: ['Raider', 'Hunter', 'Digger'],
    suffixes: ['the Looter', 'Grave-Robber'],
  },
  lootTableId: 'raider_loot',
  behaviorTags: ['aggressive', 'ranged', 'smart', 'ambusher', 'mobile'],
  factions: ['raiders'],
  combatTags: ['humanoid', 'outlaw', 'uncommon', 'explorer'],
  xpModifier: 1.2,
  minLevel: 2,
  maxLevel: 8,
};
