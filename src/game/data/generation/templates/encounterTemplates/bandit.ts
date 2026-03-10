/**
 * Encounter Templates - Bandit
 */

import type { EncounterTemplate } from '../../../schemas/generation.ts';

export const LoneBandit: EncounterTemplate = {
  id: 'lone_bandit',
  name: 'Lone Bandit',
  descriptionTemplate:
    'A desperate {{adjective}} outlaw blocks the {{terrain}}. They demand your valuables or your life.',
  enemies: [
    {
      enemyIdOrTag: 'bandit_gunman',
      countRange: [1, 1],
      levelScale: 0.8,
    },
  ],
  difficultyRange: [1, 2],
  validBiomes: ['desert', 'badlands', 'grassland', 'scrubland', 'mountain'],
  validLocationTypes: ['wilderness', 'trail', 'road'],
  validTimeOfDay: ['morning', 'afternoon', 'evening', 'night'],
  factionTags: ['raiders'],
  lootTableId: 'bandit_basic',
  xpRange: [15, 25],
  goldRange: [5, 15],
  tags: ['bandit', 'easy', 'common', 'roadside'],
};

export const BanditAmbush: EncounterTemplate = {
  id: 'bandit_ambush',
  name: 'Bandit Ambush',
  descriptionTemplate:
    'Bandits spring from behind {{cover}}! "Drop your guns and nobody gets hurt!"',
  enemies: [
    {
      enemyIdOrTag: 'bandit_thug',
      countRange: [1, 2],
      levelScale: 0.9,
    },
    {
      enemyIdOrTag: 'bandit_gunman',
      countRange: [1, 2],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [2, 4],
  validBiomes: ['desert', 'badlands', 'scrubland', 'mountain'],
  validLocationTypes: ['wilderness', 'trail', 'road', 'waystation'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['raiders'],
  lootTableId: 'bandit_standard',
  xpRange: [40, 70],
  goldRange: [15, 35],
  tags: ['bandit', 'medium', 'common', 'ambush'],
};

export const GangRaid: EncounterTemplate = {
  id: 'gang_raid',
  name: 'Gang Raid',
  descriptionTemplate:
    'A well-armed gang surrounds you. Their leader, a {{adjective}} figure in a {{clothing}}, signals the attack.',
  enemies: [
    {
      enemyIdOrTag: 'bandit_thug',
      countRange: [2, 4],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'bandit_gunman',
      countRange: [2, 3],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'bandit_sharpshooter',
      countRange: [1, 1],
      levelScale: 1.2,
    },
  ],
  difficultyRange: [5, 7],
  validBiomes: ['desert', 'badlands', 'scrubland'],
  validLocationTypes: ['wilderness', 'hideout', 'camp', 'ruins'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['raiders'],
  lootTableId: 'bandit_elite',
  xpRange: [100, 150],
  goldRange: [40, 80],
  tags: ['bandit', 'hard', 'uncommon', 'gang'],
};

export const StagecoachRobbery: EncounterTemplate = {
  id: 'stagecoach_robbery',
  name: 'Stagecoach Robbery',
  descriptionTemplate:
    'A stagecoach lies overturned on the road. Bandits are rifling through the luggage while passengers cower nearby.',
  enemies: [
    {
      enemyIdOrTag: 'bandit_thug',
      countRange: [2, 3],
      levelScale: 0.9,
    },
    {
      enemyIdOrTag: 'bandit_gunman',
      countRange: [1, 2],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [3, 5],
  validBiomes: ['desert', 'grassland', 'scrubland'],
  validLocationTypes: ['wilderness', 'trail', 'road'],
  validTimeOfDay: ['morning', 'afternoon'],
  factionTags: ['raiders'],
  lootTableId: 'bandit_stagecoach',
  xpRange: [60, 90],
  goldRange: [30, 60],
  tags: ['bandit', 'medium', 'event', 'rescue'],
};

export const BanditCampAssault: EncounterTemplate = {
  id: 'bandit_camp_assault',
  name: 'Bandit Camp',
  descriptionTemplate:
    "You've found their camp. Tents, a smoldering fire, and {{count}} bandits who don't take kindly to visitors.",
  enemies: [
    {
      enemyIdOrTag: 'bandit_thug',
      countRange: [3, 5],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'bandit_gunman',
      countRange: [2, 4],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'bandit_sharpshooter',
      countRange: [1, 2],
      levelScale: 1.1,
    },
  ],
  difficultyRange: [6, 8],
  validBiomes: ['desert', 'badlands', 'scrubland', 'mountain'],
  validLocationTypes: ['camp', 'hideout', 'ruins'],
  validTimeOfDay: ['morning', 'afternoon', 'evening', 'night'],
  factionTags: ['raiders'],
  lootTableId: 'bandit_cache',
  xpRange: [150, 220],
  goldRange: [60, 120],
  tags: ['bandit', 'hard', 'location', 'clearable'],
};

export const WantedOutlaw: EncounterTemplate = {
  id: 'wanted_outlaw',
  name: 'Wanted Outlaw',
  descriptionTemplate:
    '"{{outlaw_name}}" - you recognize the face from the wanted posters. A ${{bounty}} reward awaits if you can bring them in.',
  enemies: [
    {
      enemyIdOrTag: 'bandit_sharpshooter',
      countRange: [1, 1],
      levelScale: 1.5,
    },
    {
      enemyIdOrTag: 'bandit_gunman',
      countRange: [0, 2],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [4, 7],
  validBiomes: ['desert', 'badlands', 'scrubland', 'grassland'],
  validLocationTypes: ['wilderness', 'hideout', 'camp', 'hamlet', 'waystation'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['raiders'],
  lootTableId: 'bounty_target',
  xpRange: [80, 130],
  goldRange: [50, 100],
  tags: ['bandit', 'medium', 'bounty', 'named'],
};
