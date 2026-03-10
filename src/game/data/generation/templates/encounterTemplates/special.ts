/**
 * Encounter Templates - Special
 */

import type { EncounterTemplate } from '../../../schemas/generation.ts';

export const AutomatonMalfunction: EncounterTemplate = {
  id: 'automaton_malfunction',
  name: 'Rogue Automaton',
  descriptionTemplate:
    'A {{model}} automaton sparks and whirs erratically. Its targeting lens locks onto you with a menacing red glow.',
  enemies: [
    {
      enemyIdOrTag: 'remnant_sentry',
      countRange: [1, 2],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'remnant_scout',
      countRange: [0, 1],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [4, 6],
  validBiomes: ['badlands', 'desert', 'mountain'],
  validLocationTypes: ['ruins', 'mine', 'wilderness'],
  validTimeOfDay: ['morning', 'afternoon', 'evening', 'night'],
  factionTags: ['remnant'],
  lootTableId: 'automaton_scrap',
  xpRange: [80, 130],
  goldRange: [10, 30],
  tags: ['special', 'automaton', 'medium', 'tech'],
};

export const SteamWagonBandits: EncounterTemplate = {
  id: 'steam_wagon_bandits',
  name: 'Steam Wagon Heist',
  descriptionTemplate:
    'Bandits on a stolen steam-wagon barrel toward you, guns blazing from the armored chassis!',
  enemies: [
    {
      enemyIdOrTag: 'copperhead_gunslinger',
      countRange: [2, 3],
      levelScale: 1.1,
    },
    {
      enemyIdOrTag: 'copperhead_dynamiter',
      countRange: [1, 1],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [5, 8],
  validBiomes: ['desert', 'grassland', 'scrubland'],
  validLocationTypes: ['road', 'wilderness'],
  validTimeOfDay: ['morning', 'afternoon'],
  factionTags: ['copperhead'],
  lootTableId: 'vehicle_loot',
  xpRange: [120, 180],
  goldRange: [60, 110],
  tags: ['special', 'copperhead', 'hard', 'vehicle', 'chase'],
};

export const DynamiteAmbush: EncounterTemplate = {
  id: 'dynamite_ambush',
  name: 'Dynamite Ambush',
  descriptionTemplate:
    'Click. The fuse ignites. Dynamite has been rigged along the {{terrain}}. Outlaws emerge as explosions rock the ground!',
  enemies: [
    {
      enemyIdOrTag: 'copperhead_dynamiter',
      countRange: [1, 2],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'copperhead_gunslinger',
      countRange: [2, 3],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [5, 7],
  validBiomes: ['mountain', 'badlands', 'desert'],
  validLocationTypes: ['wilderness', 'mine', 'trail'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['copperhead'],
  lootTableId: 'explosives_cache',
  xpRange: [100, 155],
  goldRange: [45, 85],
  tags: ['special', 'copperhead', 'hard', 'explosive', 'trap'],
};

export const DuelChallenge: EncounterTemplate = {
  id: 'duel_challenge',
  name: 'Duel at High Noon',
  descriptionTemplate:
    'A {{adjective}} stranger in a {{clothing}} steps into the street. "You and me. Right here. Right now."',
  enemies: [
    {
      enemyIdOrTag: 'copperhead_gunslinger',
      countRange: [1, 1],
      levelScale: 1.3,
    },
  ],
  difficultyRange: [4, 6],
  validBiomes: ['desert', 'grassland', 'scrubland', 'badlands'],
  validLocationTypes: ['town', 'village', 'hamlet', 'outpost'],
  validTimeOfDay: ['afternoon'],
  factionTags: ['copperhead', 'raiders'],
  lootTableId: 'duelist_loot',
  xpRange: [70, 110],
  goldRange: [30, 60],
  tags: ['special', 'duel', 'medium', 'honorable', 'one_on_one'],
};

export const CaveCreatures: EncounterTemplate = {
  id: 'cave_creatures',
  name: 'Cave Dwellers',
  descriptionTemplate:
    "The darkness stirs. {{creature}} eyes gleam in the torchlight as the cave's inhabitants defend their territory.",
  enemies: [
    {
      enemyIdOrTag: 'rattlesnake',
      countRange: [2, 4],
      levelScale: 0.9,
    },
    {
      enemyIdOrTag: 'mountain_lion',
      countRange: [1, 2],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [3, 5],
  validBiomes: ['mountain', 'badlands'],
  validLocationTypes: ['cave', 'mine', 'ruins'],
  validTimeOfDay: ['morning', 'afternoon', 'evening', 'night'],
  factionTags: ['wildlife'],
  lootTableId: 'cave_treasure',
  xpRange: [55, 85],
  goldRange: [5, 25],
  tags: ['environmental', 'wildlife', 'medium', 'underground'],
};

export const DesertSurvival: EncounterTemplate = {
  id: 'desert_survival',
  name: 'Desert Predators',
  descriptionTemplate:
    'The merciless sun beats down. Desperate predators, driven by thirst, see you as their next meal.',
  enemies: [
    {
      enemyIdOrTag: 'desert_wolf',
      countRange: [2, 3],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'rattlesnake',
      countRange: [1, 2],
      levelScale: 0.8,
    },
  ],
  difficultyRange: [3, 5],
  validBiomes: ['desert', 'salt_flat', 'badlands'],
  validLocationTypes: ['wilderness'],
  validTimeOfDay: ['morning', 'afternoon'],
  factionTags: ['wildlife'],
  lootTableId: 'wildlife_desert',
  xpRange: [45, 75],
  goldRange: [0, 0],
  tags: ['environmental', 'wildlife', 'medium', 'survival'],
};

export const StormDanger: EncounterTemplate = {
  id: 'storm_danger',
  name: 'Storm Stalkers',
  descriptionTemplate:
    "Lightning cracks overhead. Something has been driven from shelter by the storm - and it's heading your way.",
  enemies: [
    {
      enemyIdOrTag: 'desert_wolf',
      countRange: [3, 5],
      levelScale: 0.9,
    },
  ],
  difficultyRange: [3, 5],
  validBiomes: ['grassland', 'scrubland', 'desert'],
  validLocationTypes: ['wilderness', 'trail'],
  validTimeOfDay: ['afternoon', 'evening', 'night'],
  factionTags: ['wildlife'],
  lootTableId: 'wildlife_canine',
  xpRange: [50, 80],
  goldRange: [0, 0],
  tags: ['environmental', 'wildlife', 'medium', 'weather'],
};

export const QuicksandTrap: EncounterTemplate = {
  id: 'quicksand_trap',
  name: 'Quicksand Ambush',
  descriptionTemplate:
    'The ground gives way beneath your feet! As you struggle, {{enemies}} close in on their trapped prey.',
  enemies: [
    {
      enemyIdOrTag: 'bandit_gunman',
      countRange: [2, 3],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'bandit_thug',
      countRange: [1, 2],
      levelScale: 0.9,
    },
  ],
  difficultyRange: [4, 6],
  validBiomes: ['riverside', 'salt_flat', 'desert'],
  validLocationTypes: ['wilderness', 'trail'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['raiders'],
  lootTableId: 'bandit_trap',
  xpRange: [65, 100],
  goldRange: [20, 45],
  tags: ['environmental', 'bandit', 'medium', 'trap', 'debuff'],
};
