/**
 * Enemy Templates - Factions
 */

import type { EnemyTemplate } from './schemas.ts';

export const IVRCGuardTemplate: EnemyTemplate = {
  id: 'ivrc_guard',
  name: 'IVRC Guard',
  description: 'A company security officer armed and trained to protect corporate interests.',
  baseStats: {
    health: 35,
    damage: 9,
    armor: 4,
    accuracy: 72,
    evasion: 8,
  },
  scaling: {
    healthPerLevel: 1.15,
    damagePerLevel: 1.12,
    armorPerLevel: 1.1,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Company', 'Corporate', 'Hired'],
    titles: ['Guard', 'Watchman', 'Sentry'],
    suffixes: [],
  },
  lootTableId: 'ivrc_standard',
  behaviorTags: ['defensive', 'ranged', 'smart', 'pack_tactics', 'stationary'],
  factions: ['ivrc_guards'],
  combatTags: ['humanoid', 'faction', 'common', 'armored'],
  xpModifier: 1.1,
  minLevel: 1,
  maxLevel: 8,
};

export const IVRCMarksmanTemplate: EnemyTemplate = {
  id: 'ivrc_marksman',
  name: 'IVRC Marksman',
  description: 'A skilled company sharpshooter who eliminates threats from a distance.',
  baseStats: {
    health: 28,
    damage: 13,
    armor: 2,
    accuracy: 85,
    evasion: 12,
  },
  scaling: {
    healthPerLevel: 1.12,
    damagePerLevel: 1.15,
    armorPerLevel: 1.05,
    accuracyPerLevel: 1,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['Sharp', 'Silent', 'Company'],
    titles: ['Marksman', 'Sniper', 'Rifleman'],
    suffixes: [],
  },
  lootTableId: 'ivrc_elite',
  behaviorTags: ['defensive', 'ranged', 'smart', 'ambusher', 'stationary'],
  factions: ['ivrc_guards'],
  combatTags: ['humanoid', 'faction', 'uncommon', 'sniper'],
  xpModifier: 1.4,
  minLevel: 2,
  maxLevel: 9,
};

export const IVRCCaptainTemplate: EnemyTemplate = {
  id: 'ivrc_captain',
  name: 'IVRC Captain',
  description: 'A seasoned company officer who commands security operations.',
  baseStats: {
    health: 55,
    damage: 11,
    armor: 6,
    accuracy: 78,
    evasion: 10,
  },
  scaling: {
    healthPerLevel: 1.18,
    damagePerLevel: 1.12,
    armorPerLevel: 1.12,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Captain', 'Commander', 'Chief'],
    titles: ['Captain', 'Commander', 'Sergeant'],
    suffixes: [],
  },
  lootTableId: 'ivrc_officer',
  behaviorTags: ['aggressive', 'ranged', 'leader', 'smart', 'mobile'],
  factions: ['ivrc_guards'],
  combatTags: ['humanoid', 'faction', 'rare', 'leader', 'armored'],
  xpModifier: 1.8,
  minLevel: 3,
  maxLevel: 10,
};

export const CopperheadGunslingerTemplate: EnemyTemplate = {
  id: 'copperhead_gunslinger',
  name: 'Copperhead Gunslinger',
  description: 'A ruthless gang member with a deadly reputation.',
  baseStats: {
    health: 35,
    damage: 10,
    armor: 3,
    accuracy: 75,
    evasion: 15,
  },
  scaling: {
    healthPerLevel: 1.15,
    damagePerLevel: 1.13,
    armorPerLevel: 1.08,
    accuracyPerLevel: 2,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['Copper', 'Snake', 'Viper', 'Deadly', 'Quick'],
    titles: ['Gunslinger', 'Shooter', 'Pistolero'],
    suffixes: ['the Snake', 'Copperhead'],
  },
  lootTableId: 'copperhead_standard',
  behaviorTags: ['aggressive', 'ranged', 'mobile', 'smart', 'flanker'],
  factions: ['copperhead'],
  combatTags: ['humanoid', 'faction', 'common', 'shooter', 'gang'],
  xpModifier: 1.2,
  minLevel: 2,
  maxLevel: 9,
};

export const CopperheadEnforcerTemplate: EnemyTemplate = {
  id: 'copperhead_enforcer',
  name: 'Copperhead Enforcer',
  description: 'A brutal gang enforcer who specializes in intimidation and violence.',
  baseStats: {
    health: 45,
    damage: 12,
    armor: 5,
    accuracy: 68,
    evasion: 8,
  },
  scaling: {
    healthPerLevel: 1.18,
    damagePerLevel: 1.12,
    armorPerLevel: 1.1,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Big', 'Heavy', 'Brutal', 'Mean'],
    titles: ['Enforcer', 'Breaker', 'Crusher'],
    suffixes: ['the Hammer', 'Iron-Fist'],
  },
  lootTableId: 'copperhead_heavy',
  behaviorTags: ['aggressive', 'melee', 'charges', 'berserker', 'dumb'],
  factions: ['copperhead'],
  combatTags: ['humanoid', 'faction', 'uncommon', 'heavy', 'gang'],
  xpModifier: 1.4,
  minLevel: 2,
  maxLevel: 9,
};

export const CopperheadDynamiterTemplate: EnemyTemplate = {
  id: 'copperhead_dynamiter',
  name: 'Copperhead Dynamiter',
  description: 'A demolitions expert who loves to make things go boom.',
  baseStats: {
    health: 28,
    damage: 16,
    armor: 2,
    accuracy: 65,
    evasion: 12,
  },
  scaling: {
    healthPerLevel: 1.1,
    damagePerLevel: 1.18,
    armorPerLevel: 1.05,
    accuracyPerLevel: 2,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['Boom', 'Blast', 'Powder', 'Fuse'],
    titles: ['Dynamiter', 'Blaster', 'Demo-Man'],
    suffixes: ['Kaboom', 'the Bomber'],
  },
  lootTableId: 'copperhead_explosives',
  behaviorTags: ['aggressive', 'ranged', 'erratic', 'retreats'],
  factions: ['copperhead'],
  combatTags: ['humanoid', 'faction', 'rare', 'explosive', 'gang'],
  xpModifier: 1.5,
  minLevel: 3,
  maxLevel: 10,
};
