/**
 * Enemy Templates - Remnants
 */

import type { EnemyTemplate } from './schemas.ts';

export const RemnantScoutTemplate: EnemyTemplate = {
  id: 'remnant_scout',
  name: 'Remnant Scout',
  description: 'A fast, lightly-armored automaton designed for reconnaissance.',
  baseStats: {
    health: 25,
    damage: 8,
    armor: 4,
    accuracy: 80,
    evasion: 20,
  },
  scaling: {
    healthPerLevel: 1.12,
    damagePerLevel: 1.1,
    armorPerLevel: 1.08,
    accuracyPerLevel: 1,
    evasionPerLevel: 2,
  },
  namePool: {
    prefixes: ['MK-I', 'MK-II', 'Unit', 'Model'],
    titles: ['Scout', 'Seeker', 'Tracker'],
    suffixes: [],
  },
  lootTableId: 'automaton_scrap',
  behaviorTags: ['aggressive', 'ranged', 'mobile', 'smart', 'flanker'],
  factions: ['remnant'],
  combatTags: ['automaton', 'tech', 'common', 'fast'],
  xpModifier: 1.1,
  minLevel: 2,
  maxLevel: 8,
};

export const RemnantSentryTemplate: EnemyTemplate = {
  id: 'remnant_sentry',
  name: 'Remnant Sentry',
  description: 'A heavily-armored automaton built for area defense.',
  baseStats: {
    health: 60,
    damage: 12,
    armor: 8,
    accuracy: 75,
    evasion: 5,
  },
  scaling: {
    healthPerLevel: 1.18,
    damagePerLevel: 1.12,
    armorPerLevel: 1.12,
    accuracyPerLevel: 2,
    evasionPerLevel: 0,
  },
  namePool: {
    prefixes: ['MK-III', 'MK-IV', 'Heavy', 'Unit'],
    titles: ['Sentry', 'Guardian', 'Defender'],
    suffixes: [],
  },
  lootTableId: 'automaton_standard',
  behaviorTags: ['defensive', 'ranged', 'stationary', 'smart'],
  factions: ['remnant'],
  combatTags: ['automaton', 'tech', 'uncommon', 'armored'],
  xpModifier: 1.5,
  minLevel: 3,
  maxLevel: 9,
};

export const RemnantJuggernautTemplate: EnemyTemplate = {
  id: 'remnant_juggernaut',
  name: 'Remnant Juggernaut',
  description: 'A massive war machine bristling with weapons - a relic of a more dangerous age.',
  baseStats: {
    health: 150,
    damage: 20,
    armor: 12,
    accuracy: 70,
    evasion: 0,
  },
  scaling: {
    healthPerLevel: 1.2,
    damagePerLevel: 1.15,
    armorPerLevel: 1.15,
    accuracyPerLevel: 2,
    evasionPerLevel: 0,
  },
  namePool: {
    prefixes: ['Titan', 'Colossus', 'Omega'],
    titles: ['Juggernaut', 'Destroyer', 'Annihilator'],
    suffixes: ['Prime', 'Alpha', 'Omega'],
  },
  lootTableId: 'automaton_rare',
  behaviorTags: ['aggressive', 'ranged', 'melee', 'stationary', 'berserker'],
  factions: ['remnant'],
  combatTags: ['automaton', 'tech', 'rare', 'boss', 'armored', 'dangerous'],
  xpModifier: 3.0,
  minLevel: 5,
  maxLevel: 10,
};
