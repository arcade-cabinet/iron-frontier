/**
 * Enemy Templates - Bandits
 */

import type { EnemyTemplate } from './schemas.ts';

export const BanditThugTemplate: EnemyTemplate = {
  id: 'bandit_thug',
  name: 'Bandit Thug',
  description: 'A rough-and-tumble outlaw who relies on brute force over finesse.',
  baseStats: {
    health: 25,
    damage: 6,
    armor: 1,
    accuracy: 60,
    evasion: 5,
  },
  scaling: {
    healthPerLevel: 1.15,
    damagePerLevel: 1.1,
    armorPerLevel: 1.05,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Dirty', 'Mean', 'Ugly', 'Scarred', 'One-Eyed', 'Drunk'],
    titles: [],
    suffixes: [],
  },
  lootTableId: 'bandit_basic',
  behaviorTags: ['aggressive', 'melee', 'charges', 'dumb'],
  factions: ['raiders', 'copperhead'],
  combatTags: ['humanoid', 'outlaw', 'common'],
  xpModifier: 0.9,
  minLevel: 1,
  maxLevel: 6,
};

export const BanditGunmanTemplate: EnemyTemplate = {
  id: 'bandit_gunman',
  name: 'Bandit Gunman',
  description: 'An outlaw with quick hands and a quicker trigger finger.',
  baseStats: {
    health: 30,
    damage: 8,
    armor: 2,
    accuracy: 70,
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
    prefixes: ['Quick-Draw', 'Dusty', 'Cold', 'Dead-Eye', 'Lucky', 'Mean'],
    titles: [],
    suffixes: ['the Kid', 'Two-Guns'],
  },
  lootTableId: 'bandit_standard',
  behaviorTags: ['aggressive', 'ranged', 'mobile', 'smart'],
  factions: ['raiders', 'copperhead'],
  combatTags: ['humanoid', 'outlaw', 'common', 'shooter'],
  xpModifier: 1.0,
  minLevel: 1,
  maxLevel: 8,
};

export const BanditSharpshooterTemplate: EnemyTemplate = {
  id: 'bandit_sharpshooter',
  name: 'Bandit Sharpshooter',
  description: 'A deadly marksman who picks off targets from a distance.',
  baseStats: {
    health: 25,
    damage: 14,
    armor: 1,
    accuracy: 85,
    evasion: 15,
  },
  scaling: {
    healthPerLevel: 1.1,
    damagePerLevel: 1.15,
    armorPerLevel: 1.05,
    accuracyPerLevel: 1,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['Dead-Eye', 'Hawk-Eye', 'Silent', 'Patient', 'Cold'],
    titles: ['Sniper'],
    suffixes: ['the Ghost', 'Long-Shot'],
  },
  lootTableId: 'bandit_elite',
  behaviorTags: ['defensive', 'ranged', 'stationary', 'smart', 'ambusher'],
  factions: ['raiders', 'copperhead'],
  combatTags: ['humanoid', 'outlaw', 'uncommon', 'sniper'],
  xpModifier: 1.3,
  minLevel: 2,
  maxLevel: 10,
};

export const BanditLeaderTemplate: EnemyTemplate = {
  id: 'bandit_leader',
  name: 'Bandit Leader',
  description: 'A hardened criminal who commands respect through fear and violence.',
  baseStats: {
    health: 50,
    damage: 12,
    armor: 5,
    accuracy: 75,
    evasion: 12,
  },
  scaling: {
    healthPerLevel: 1.18,
    damagePerLevel: 1.12,
    armorPerLevel: 1.1,
    accuracyPerLevel: 2,
    evasionPerLevel: 1,
  },
  namePool: {
    prefixes: ['Boss', 'Big', 'Captain', 'Chief'],
    titles: ['Boss', 'Captain', 'Chief'],
    suffixes: ['the Cruel', 'the Butcher', 'Blood-Hand'],
  },
  lootTableId: 'bandit_leader',
  behaviorTags: ['aggressive', 'ranged', 'mobile', 'leader', 'smart'],
  factions: ['raiders', 'copperhead'],
  combatTags: ['humanoid', 'outlaw', 'rare', 'leader', 'mini_boss'],
  xpModifier: 2.0,
  minLevel: 3,
  maxLevel: 10,
};
