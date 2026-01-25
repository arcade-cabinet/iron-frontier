/**
 * Encounter Templates - Procedural Combat Generation
 *
 * Defines encounter archetypes for procedural combat system.
 * Each template specifies enemy composition, valid conditions,
 * and reward ranges for the Daggerfall-style generation system.
 *
 * Uses EncounterTemplateSchema from generation.ts
 */

import type { EncounterTemplate } from '../../schemas/generation';

// ============================================================================
// BANDIT ENCOUNTERS
// ============================================================================

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
    'You\'ve found their camp. Tents, a smoldering fire, and {{count}} bandits who don\'t take kindly to visitors.',
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

// ============================================================================
// WILDLIFE ENCOUNTERS
// ============================================================================

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
      enemyIdOrTag: 'mountain_lion',
      countRange: [1, 1],
      levelScale: 1.5,
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
      enemyIdOrTag: 'mountain_lion',
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
      enemyIdOrTag: 'rattlesnake',
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

// ============================================================================
// FACTION ENCOUNTERS
// ============================================================================

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
    'Prospectors with more guns than picks have set up on someone else\'s claim. They don\'t plan on sharing.',
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

// ============================================================================
// SPECIAL ENCOUNTERS
// ============================================================================

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

// ============================================================================
// ENVIRONMENTAL ENCOUNTERS
// ============================================================================

export const CaveCreatures: EncounterTemplate = {
  id: 'cave_creatures',
  name: 'Cave Dwellers',
  descriptionTemplate:
    'The darkness stirs. {{creature}} eyes gleam in the torchlight as the cave\'s inhabitants defend their territory.',
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
    'Lightning cracks overhead. Something has been driven from shelter by the storm - and it\'s heading your way.',
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

// ============================================================================
// COPPERHEAD GANG ENCOUNTERS
// ============================================================================

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

// ============================================================================
// REMNANT ENCOUNTERS
// ============================================================================

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

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

export const ENCOUNTER_TEMPLATES: EncounterTemplate[] = [
  // Bandit Encounters
  LoneBandit,
  BanditAmbush,
  GangRaid,
  StagecoachRobbery,
  BanditCampAssault,
  WantedOutlaw,

  // Wildlife Encounters
  CoyotePack,
  RattlesnakeNest,
  BearEncounter,
  Stampede,
  ScorpionSwarm,

  // Faction Encounters
  RailroadThugs,
  MineGuards,
  CattleRustlers,
  ClaimJumpers,
  CorruptDeputies,
  MercenaryGroup,

  // Special Encounters
  AutomatonMalfunction,
  SteamWagonBandits,
  DynamiteAmbush,
  DuelChallenge,

  // Environmental Encounters
  CaveCreatures,
  DesertSurvival,
  StormDanger,
  QuicksandTrap,

  // Copperhead Gang
  CopperheadPatrolEncounter,
  CopperheadRaid,

  // Remnant
  RemnantAwakeningEncounter,
  JuggernautEncounter,
];

const TEMPLATES_BY_ID: Map<string, EncounterTemplate> = new Map(
  ENCOUNTER_TEMPLATES.map(t => [t.id, t])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get an encounter template by its unique ID
 */
export function getEncounterTemplate(id: string): EncounterTemplate | undefined {
  return TEMPLATES_BY_ID.get(id);
}

/**
 * Get all encounter templates valid for a specific biome
 */
export function getEncountersForBiome(biome: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    t => t.validBiomes.length === 0 || t.validBiomes.includes(biome)
  );
}

/**
 * Get all encounter templates within a difficulty range
 */
export function getEncountersForDifficulty(
  minDiff: number,
  maxDiff: number
): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(
    t => t.difficultyRange[0] <= maxDiff && t.difficultyRange[1] >= minDiff
  );
}

/**
 * Get encounter templates matching all specified criteria
 */
export function getEncountersMatching(criteria: {
  biome?: string;
  locationType?: string;
  timeOfDay?: string;
  minDifficulty?: number;
  maxDifficulty?: number;
  factionTag?: string;
  tags?: string[];
}): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(t => {
    // Check biome
    if (criteria.biome && t.validBiomes.length > 0) {
      if (!t.validBiomes.includes(criteria.biome)) return false;
    }

    // Check location type
    if (criteria.locationType && t.validLocationTypes.length > 0) {
      if (!t.validLocationTypes.includes(criteria.locationType)) return false;
    }

    // Check time of day
    if (criteria.timeOfDay && t.validTimeOfDay.length > 0) {
      if (!t.validTimeOfDay.includes(criteria.timeOfDay)) return false;
    }

    // Check difficulty range
    if (criteria.minDifficulty !== undefined) {
      if (t.difficultyRange[1] < criteria.minDifficulty) return false;
    }
    if (criteria.maxDifficulty !== undefined) {
      if (t.difficultyRange[0] > criteria.maxDifficulty) return false;
    }

    // Check faction
    if (criteria.factionTag && t.factionTags.length > 0) {
      if (!t.factionTags.includes(criteria.factionTag)) return false;
    }

    // Check tags (must match ALL specified tags)
    if (criteria.tags && criteria.tags.length > 0) {
      if (!criteria.tags.every(tag => t.tags.includes(tag))) return false;
    }

    return true;
  });
}

/**
 * Get encounter templates by tag
 */
export function getEncountersByTag(tag: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(t => t.tags.includes(tag));
}

/**
 * Get encounter templates by faction
 */
export function getEncountersByFaction(faction: string): EncounterTemplate[] {
  return ENCOUNTER_TEMPLATES.filter(t => t.factionTags.includes(faction));
}

/**
 * Get a random encounter template matching criteria
 */
export function getRandomEncounterTemplate(criteria: {
  biome?: string;
  locationType?: string;
  timeOfDay?: string;
  minDifficulty?: number;
  maxDifficulty?: number;
  factionTag?: string;
  tags?: string[];
}): EncounterTemplate | undefined {
  const matches = getEncountersMatching(criteria);
  if (matches.length === 0) return undefined;
  return matches[Math.floor(Math.random() * matches.length)];
}
