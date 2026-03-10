/**
 * Encounter Templates - Faction
 */

import type { EncounterTemplate } from '../../../schemas/generation.ts';

export const RailroadThugs: EncounterTemplate = {
  id: 'railroad_thugs',
  name: 'Railroad Enforcers',
  descriptionTemplate:
    'IVRC company men in {{uniform}} step from the shadows. "This here\'s company property. You ain\'t welcome."',
  enemies: [
    {
      enemyIdOrTag: 'ivrc_guard',
      countRange: [2, 4],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'ivrc_marksman',
      countRange: [0, 1],
      levelScale: 1.1,
    },
  ],
  difficultyRange: [3, 5],
  validBiomes: ['grassland', 'scrubland', 'desert'],
  validLocationTypes: ['train_station', 'outpost', 'wilderness'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['ivrc_guards'],
  lootTableId: 'ivrc_standard',
  xpRange: [70, 110],
  goldRange: [20, 45],
  tags: ['faction', 'ivrc', 'medium', 'hostile'],
};

export const MineGuards: EncounterTemplate = {
  id: 'mine_guards',
  name: 'Mine Security',
  descriptionTemplate:
    'Armed guards patrol the mine entrance. "Turn around, stranger. No trespassers on company ground."',
  enemies: [
    {
      enemyIdOrTag: 'ivrc_guard',
      countRange: [3, 5],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'ivrc_marksman',
      countRange: [1, 2],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [4, 6],
  validBiomes: ['mountain', 'badlands'],
  validLocationTypes: ['mine', 'quarry'],
  validTimeOfDay: ['morning', 'afternoon', 'evening', 'night'],
  factionTags: ['ivrc_guards'],
  lootTableId: 'ivrc_mining',
  xpRange: [90, 140],
  goldRange: [30, 60],
  tags: ['faction', 'ivrc', 'medium', 'location'],
};

export const CattleRustlers: EncounterTemplate = {
  id: 'cattle_rustlers',
  name: 'Cattle Rustlers',
  descriptionTemplate:
    'You catch rustlers red-handed, driving stolen cattle toward the {{direction}}. They reach for their guns.',
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
  difficultyRange: [3, 5],
  validBiomes: ['grassland', 'scrubland'],
  validLocationTypes: ['ranch', 'farm', 'wilderness'],
  validTimeOfDay: ['night', 'evening'],
  factionTags: ['raiders'],
  lootTableId: 'bandit_rustler',
  xpRange: [60, 95],
  goldRange: [25, 50],
  tags: ['faction', 'raiders', 'medium', 'theft', 'event'],
};

export const ClaimJumpers: EncounterTemplate = {
  id: 'claim_jumpers',
  name: 'Claim Jumpers',
  descriptionTemplate:
    "Prospectors with more guns than picks have set up on someone else's claim. They don't plan on sharing.",
  enemies: [
    {
      enemyIdOrTag: 'bandit_gunman',
      countRange: [2, 4],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'bandit_sharpshooter',
      countRange: [1, 1],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [4, 6],
  validBiomes: ['mountain', 'badlands', 'riverside'],
  validLocationTypes: ['mine', 'quarry', 'wilderness'],
  validTimeOfDay: ['morning', 'afternoon'],
  factionTags: ['raiders'],
  lootTableId: 'prospector_loot',
  xpRange: [75, 115],
  goldRange: [40, 80],
  tags: ['faction', 'raiders', 'medium', 'mining'],
};

export const CorruptDeputies: EncounterTemplate = {
  id: 'corrupt_deputies',
  name: 'Corrupt Deputies',
  descriptionTemplate:
    'Men wearing {{worn}} deputy badges block your path. "Sheriff says you\'re under arrest. Dead or alive."',
  enemies: [
    {
      enemyIdOrTag: 'ivrc_guard',
      countRange: [2, 3],
      levelScale: 1.1,
    },
    {
      enemyIdOrTag: 'ivrc_captain',
      countRange: [0, 1],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [4, 7],
  validBiomes: ['grassland', 'scrubland', 'desert'],
  validLocationTypes: ['town', 'village', 'hamlet', 'road'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['ivrc_guards'],
  lootTableId: 'lawman_corrupt',
  xpRange: [85, 135],
  goldRange: [35, 70],
  tags: ['faction', 'ivrc', 'hard', 'lawless'],
};

export const MercenaryGroup: EncounterTemplate = {
  id: 'mercenary_group',
  name: 'Hired Guns',
  descriptionTemplate:
    'Professional killers in {{attire}} fan out to surround you. "Nothing personal, friend. Just business."',
  enemies: [
    {
      enemyIdOrTag: 'copperhead_gunslinger',
      countRange: [2, 3],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'copperhead_enforcer',
      countRange: [1, 2],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [5, 7],
  validBiomes: ['desert', 'badlands', 'grassland', 'scrubland'],
  validLocationTypes: ['wilderness', 'town', 'waystation', 'outpost'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['copperhead'],
  lootTableId: 'mercenary_elite',
  xpRange: [110, 160],
  goldRange: [50, 95],
  tags: ['faction', 'copperhead', 'hard', 'professional'],
};

export const CopperheadPatrolEncounter: EncounterTemplate = {
  id: 'copperhead_patrol',
  name: 'Copperhead Patrol',
  descriptionTemplate:
    'Gang members wearing the copper snake insignia block the {{terrain}}. "This is Copperhead territory, stranger."',
  enemies: [
    {
      enemyIdOrTag: 'copperhead_gunslinger',
      countRange: [2, 3],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'copperhead_enforcer',
      countRange: [1, 2],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [4, 6],
  validBiomes: ['desert', 'badlands', 'scrubland'],
  validLocationTypes: ['wilderness', 'trail', 'hideout'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['copperhead'],
  lootTableId: 'copperhead_standard',
  xpRange: [90, 140],
  goldRange: [40, 75],
  tags: ['faction', 'copperhead', 'medium', 'patrol'],
};

export const CopperheadRaid: EncounterTemplate = {
  id: 'copperhead_raid',
  name: 'Copperhead Raid',
  descriptionTemplate:
    'The Copperhead Gang descends on the {{target}} in force. Gunfire and dynamite fill the air!',
  enemies: [
    {
      enemyIdOrTag: 'copperhead_gunslinger',
      countRange: [3, 4],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'copperhead_enforcer',
      countRange: [2, 3],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'copperhead_dynamiter',
      countRange: [1, 2],
      levelScale: 1.1,
    },
  ],
  difficultyRange: [6, 9],
  validBiomes: ['desert', 'badlands', 'scrubland', 'grassland'],
  validLocationTypes: ['town', 'village', 'outpost', 'trading_post'],
  validTimeOfDay: ['morning', 'afternoon', 'evening'],
  factionTags: ['copperhead'],
  lootTableId: 'copperhead_elite',
  xpRange: [160, 240],
  goldRange: [80, 150],
  tags: ['faction', 'copperhead', 'hard', 'event', 'siege'],
};

export const RemnantAwakeningEncounter: EncounterTemplate = {
  id: 'remnant_awakening',
  name: 'Awakened Machines',
  descriptionTemplate:
    'Ancient mechanisms whir to life. Lights flicker in long-dormant eyes as automatons rise to defend the {{location}}.',
  enemies: [
    {
      enemyIdOrTag: 'remnant_sentry',
      countRange: [2, 3],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'remnant_scout',
      countRange: [1, 2],
      levelScale: 1.0,
    },
  ],
  difficultyRange: [5, 7],
  validBiomes: ['badlands', 'mountain', 'desert'],
  validLocationTypes: ['ruins', 'cave', 'mine'],
  validTimeOfDay: ['morning', 'afternoon', 'evening', 'night'],
  factionTags: ['remnant'],
  lootTableId: 'automaton_standard',
  xpRange: [100, 150],
  goldRange: [15, 40],
  tags: ['faction', 'remnant', 'hard', 'tech', 'exploration'],
};

export const JuggernautEncounter: EncounterTemplate = {
  id: 'juggernaut_encounter',
  name: 'The Juggernaut',
  descriptionTemplate:
    'The ground trembles. A massive war machine, bristling with weapons, emerges from the {{location}}. It has marked you as hostile.',
  enemies: [
    {
      enemyIdOrTag: 'remnant_juggernaut',
      countRange: [1, 1],
      levelScale: 1.0,
    },
    {
      enemyIdOrTag: 'remnant_sentry',
      countRange: [1, 2],
      levelScale: 0.9,
    },
  ],
  difficultyRange: [8, 10],
  validBiomes: ['badlands', 'mountain'],
  validLocationTypes: ['ruins', 'cave'],
  validTimeOfDay: ['morning', 'afternoon', 'evening', 'night'],
  factionTags: ['remnant'],
  lootTableId: 'automaton_rare',
  xpRange: [200, 300],
  goldRange: [40, 80],
  tags: ['faction', 'remnant', 'boss', 'tech', 'mini_boss'],
};
