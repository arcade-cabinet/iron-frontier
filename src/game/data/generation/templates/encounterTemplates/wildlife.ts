/**
 * Encounter Templates - Wildlife
 */

import type { EncounterTemplate } from '../../../schemas/generation.ts';

export const CoyotePack: EncounterTemplate = {
  id: 'coyote_pack',
  name: 'Coyote Pack',
  descriptionTemplate:
    'A pack of hungry {{adjective}} coyotes circles you, drawn by the scent of your provisions.',
  enemies: [
    {
      enemyIdOrTag: 'desert_wolf',
      countRange: [2, 4],
      levelScale: 0.9,
    },
  ],
  difficultyRange: [1, 3],
  validBiomes: ['desert', 'badlands', 'scrubland', 'grassland'],
  validLocationTypes: ['wilderness', 'trail', 'camp'],
  validTimeOfDay: ['evening', 'night'],
  factionTags: ['wildlife'],
  lootTableId: 'wildlife_canine',
  xpRange: [25, 45],
  goldRange: [0, 0],
  tags: ['wildlife', 'easy', 'common', 'animal'],
};

export const RattlesnakeNest: EncounterTemplate = {
  id: 'rattlesnake_nest',
  name: 'Rattlesnake Nest',
  descriptionTemplate:
    'The warning rattle comes too late. Serpents emerge from beneath the {{terrain}} around your feet!',
  enemies: [
    {
      enemyIdOrTag: 'rattlesnake',
      countRange: [3, 6],
      levelScale: 0.8,
    },
  ],
  difficultyRange: [2, 4],
  validBiomes: ['desert', 'badlands', 'scrubland'],
  validLocationTypes: ['wilderness', 'ruins', 'cave'],
  validTimeOfDay: ['morning', 'afternoon'],
  factionTags: ['wildlife'],
  lootTableId: 'wildlife_snake',
  xpRange: [30, 50],
  goldRange: [0, 0],
  tags: ['wildlife', 'medium', 'common', 'poison', 'surprise'],
};

export const BearEncounter: EncounterTemplate = {
  id: 'bear_encounter',
  name: 'Grizzly Bear',
  descriptionTemplate:
    'A massive grizzly rises on its hind legs, blocking the {{terrain}}. It bellows a thunderous warning.',
  enemies: [
    {
      enemyIdOrTag: 'grizzly_bear',
      countRange: [1, 1],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [4, 6],
  validBiomes: ['mountain', 'grassland', 'riverside'],
  validLocationTypes: ['wilderness', 'cave', 'camp'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['wildlife'],
  lootTableId: 'wildlife_bear',
  xpRange: [60, 90],
  goldRange: [0, 0],
  tags: ['wildlife', 'medium', 'uncommon', 'animal', 'dangerous'],
};

export const Stampede: EncounterTemplate = {
  id: 'stampede',
  name: 'Stampede',
  descriptionTemplate:
    'The ground trembles. A herd of {{animal}} charges toward you in blind panic, driven by {{cause}}!',
  enemies: [
    {
      enemyIdOrTag: 'desert_wolf',
      countRange: [3, 5],
      levelScale: 0.7,
    },
  ],
  difficultyRange: [3, 5],
  validBiomes: ['grassland', 'scrubland', 'desert'],
  validLocationTypes: ['wilderness', 'ranch', 'farm'],
  validTimeOfDay: ['morning', 'afternoon'],
  factionTags: ['wildlife'],
  lootTableId: 'wildlife_herd',
  xpRange: [40, 70],
  goldRange: [0, 5],
  tags: ['wildlife', 'medium', 'event', 'environmental'],
};

export const ScorpionSwarm: EncounterTemplate = {
  id: 'scorpion_swarm',
  name: 'Scorpion Swarm',
  descriptionTemplate:
    'Disturbed from their hiding places, a swarm of {{adjective}} scorpions scuttles toward you.',
  enemies: [
    {
      enemyIdOrTag: 'scorpion',
      countRange: [4, 8],
      levelScale: 0.6,
    },
  ],
  difficultyRange: [2, 4],
  validBiomes: ['desert', 'badlands', 'salt_flat'],
  validLocationTypes: ['wilderness', 'ruins', 'cave', 'mine'],
  validTimeOfDay: ['night'],
  factionTags: ['wildlife'],
  lootTableId: 'wildlife_insect',
  xpRange: [35, 55],
  goldRange: [0, 0],
  tags: ['wildlife', 'medium', 'common', 'poison', 'swarm'],
};
