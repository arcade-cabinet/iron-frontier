/**
 * Iron Frontier - Enemy Archetype Templates
 *
 * Daggerfall-style procedural enemy generation templates.
 * Each template defines an enemy type with base stats, scaling factors,
 * name pools, loot tables, and behavior tags.
 *
 * Used by encounterGenerator.ts to spawn enemies with proper stat scaling.
 */

import { z } from 'zod';

// ============================================================================
// ENEMY TEMPLATE SCHEMA
// ============================================================================

/**
 * Base combat stats for an enemy
 */
export const EnemyStatsSchema = z.object({
  /** Base health pool */
  health: z.number().int().min(1),
  /** Base damage per hit */
  damage: z.number().int().min(0),
  /** Base armor/damage reduction */
  armor: z.number().int().min(0),
  /** Base accuracy (0-100) */
  accuracy: z.number().int().min(0).max(100).default(70),
  /** Base evasion (0-100) */
  evasion: z.number().int().min(0).max(100).default(10),
});
export type EnemyStats = z.infer<typeof EnemyStatsSchema>;

/**
 * Scaling factors for level-based stat progression
 */
export const LevelScalingSchema = z.object({
  /** Health multiplier per level (1.0 = base, 1.15 = +15% per level) */
  healthPerLevel: z.number().min(1).max(2).default(1.15),
  /** Damage multiplier per level */
  damagePerLevel: z.number().min(1).max(2).default(1.12),
  /** Armor multiplier per level */
  armorPerLevel: z.number().min(1).max(1.5).default(1.08),
  /** Accuracy bonus per level */
  accuracyPerLevel: z.number().min(0).max(5).default(2),
  /** Evasion bonus per level */
  evasionPerLevel: z.number().min(0).max(5).default(1),
});
export type LevelScaling = z.infer<typeof LevelScalingSchema>;

/**
 * Name generation pools for enemy variety
 */
export const EnemyNamePoolSchema = z.object({
  /** Prefix adjectives (e.g., "Dusty", "Scarred", "Mean") */
  prefixes: z.array(z.string()).default([]),
  /** Title variants (e.g., "Boss", "Captain") */
  titles: z.array(z.string()).default([]),
  /** Name suffixes or epithets */
  suffixes: z.array(z.string()).default([]),
});
export type EnemyNamePool = z.infer<typeof EnemyNamePoolSchema>;

/**
 * Behavior tags for AI and combat style
 */
export const BehaviorTagSchema = z.enum([
  // Combat style
  'aggressive',     // Attacks on sight, pursues
  'defensive',      // Waits for player to engage
  'ranged',         // Prefers ranged attacks
  'melee',          // Prefers close combat
  'ambusher',       // Sets up ambushes, surprise attacks
  'flanker',        // Tries to get behind targets

  // Movement
  'mobile',         // Frequently repositions
  'stationary',     // Holds position
  'charges',        // Rushes toward target
  'retreats',       // Falls back when hurt

  // Special behaviors
  'pack_tactics',   // Coordinates with allies
  'berserker',      // More dangerous when wounded
  'coward',         // Flees when outmatched
  'leader',         // Buffs nearby allies
  'healer',         // Can heal allies

  // Condition effects
  'poisonous',      // Applies poison
  'bleeding',       // Causes bleed
  'stunning',       // Can stun targets

  // AI traits
  'smart',          // Uses cover, tactical positioning
  'dumb',           // Predictable behavior
  'erratic',        // Random actions
]);
export type BehaviorTag = z.infer<typeof BehaviorTagSchema>;

/**
 * Enemy template definition
 */
export const EnemyTemplateSchema = z.object({
  /** Template identifier - matches enemyIdOrTag in encounters */
  id: z.string(),
  /** Display name */
  name: z.string(),
  /** Description for bestiary/tooltips */
  description: z.string(),
  /** Base stats before scaling */
  baseStats: EnemyStatsSchema,
  /** Level scaling configuration */
  scaling: LevelScalingSchema.default({}),
  /** Name generation pools */
  namePool: EnemyNamePoolSchema.default({}),
  /** Loot table ID reference */
  lootTableId: z.string().optional(),
  /** Behavior tags for AI */
  behaviorTags: z.array(BehaviorTagSchema).default([]),
  /** Faction associations */
  factions: z.array(z.string()).default([]),
  /** Combat tags for encounter filtering */
  combatTags: z.array(z.string()).default([]),
  /** XP value modifier (1.0 = standard) */
  xpModifier: z.number().min(0.1).max(5).default(1),
  /** Minimum level this enemy spawns */
  minLevel: z.number().int().min(1).default(1),
  /** Maximum level for this enemy */
  maxLevel: z.number().int().min(1).max(10).default(10),
});
export type EnemyTemplate = z.infer<typeof EnemyTemplateSchema>;

// ============================================================================
// BANDIT ENEMIES
// ============================================================================

const BanditThugTemplate: EnemyTemplate = {
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
    damagePerLevel: 1.10,
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

const BanditGunmanTemplate: EnemyTemplate = {
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

const BanditSharpshooterTemplate: EnemyTemplate = {
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
    healthPerLevel: 1.10,
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

const BanditLeaderTemplate: EnemyTemplate = {
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
    armorPerLevel: 1.10,
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

// ============================================================================
// WILDLIFE ENEMIES
// ============================================================================

const DesertWolfTemplate: EnemyTemplate = {
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
    damagePerLevel: 1.10,
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

const RattlesnakeTemplate: EnemyTemplate = {
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

const MountainLionTemplate: EnemyTemplate = {
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

const GrizzlyBearTemplate: EnemyTemplate = {
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

const ScorpionTemplate: EnemyTemplate = {
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
    healthPerLevel: 1.10,
    damagePerLevel: 1.10,
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

const VultureTemplate: EnemyTemplate = {
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

// ============================================================================
// IVRC FACTION ENEMIES
// ============================================================================

const IVRCGuardTemplate: EnemyTemplate = {
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
    armorPerLevel: 1.10,
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

const IVRCMarksmanTemplate: EnemyTemplate = {
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

const IVRCCaptainTemplate: EnemyTemplate = {
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

// ============================================================================
// COPPERHEAD GANG ENEMIES
// ============================================================================

const CopperheadGunslingerTemplate: EnemyTemplate = {
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

const CopperheadEnforcerTemplate: EnemyTemplate = {
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
    armorPerLevel: 1.10,
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

const CopperheadDynamiterTemplate: EnemyTemplate = {
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
    healthPerLevel: 1.10,
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

// ============================================================================
// REMNANT (AUTOMATON) ENEMIES
// ============================================================================

const RemnantScoutTemplate: EnemyTemplate = {
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
    damagePerLevel: 1.10,
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

const RemnantSentryTemplate: EnemyTemplate = {
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

const RemnantJuggernautTemplate: EnemyTemplate = {
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
    healthPerLevel: 1.20,
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

// ============================================================================
// MISCELLANEOUS ENEMIES
// ============================================================================

const RustlerTemplate: EnemyTemplate = {
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
    damagePerLevel: 1.10,
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

const MercenaryTemplate: EnemyTemplate = {
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
    armorPerLevel: 1.10,
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

const CorruptDeputyTemplate: EnemyTemplate = {
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

const HostileProspectorTemplate: EnemyTemplate = {
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
    healthPerLevel: 1.10,
    damagePerLevel: 1.10,
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

const DesperadoTemplate: EnemyTemplate = {
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

const GhostTownDwellerTemplate: EnemyTemplate = {
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
    healthPerLevel: 1.10,
    damagePerLevel: 1.10,
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

const TombRaiderTemplate: EnemyTemplate = {
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

// ============================================================================
// TEMPLATE COLLECTION
// ============================================================================

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  // Bandits
  BanditThugTemplate,
  BanditGunmanTemplate,
  BanditSharpshooterTemplate,
  BanditLeaderTemplate,

  // Wildlife
  DesertWolfTemplate,
  RattlesnakeTemplate,
  MountainLionTemplate,
  GrizzlyBearTemplate,
  ScorpionTemplate,
  VultureTemplate,

  // IVRC Faction
  IVRCGuardTemplate,
  IVRCMarksmanTemplate,
  IVRCCaptainTemplate,

  // Copperhead Gang
  CopperheadGunslingerTemplate,
  CopperheadEnforcerTemplate,
  CopperheadDynamiterTemplate,

  // Remnant Automatons
  RemnantScoutTemplate,
  RemnantSentryTemplate,
  RemnantJuggernautTemplate,

  // Miscellaneous
  RustlerTemplate,
  MercenaryTemplate,
  CorruptDeputyTemplate,
  HostileProspectorTemplate,
  DesperadoTemplate,
  GhostTownDwellerTemplate,
  TombRaiderTemplate,
];

// ============================================================================
// LOOKUP MAPS
// ============================================================================

/** Map of template ID to template for quick lookup */
const TEMPLATES_BY_ID = new Map<string, EnemyTemplate>(
  ENEMY_TEMPLATES.map((t) => [t.id, t])
);

/** Map of faction to templates */
const TEMPLATES_BY_FACTION = new Map<string, EnemyTemplate[]>();
for (const template of ENEMY_TEMPLATES) {
  for (const faction of template.factions) {
    const existing = TEMPLATES_BY_FACTION.get(faction) || [];
    existing.push(template);
    TEMPLATES_BY_FACTION.set(faction, existing);
  }
}

/** Map of combat tag to templates */
const TEMPLATES_BY_COMBAT_TAG = new Map<string, EnemyTemplate[]>();
for (const template of ENEMY_TEMPLATES) {
  for (const tag of template.combatTags) {
    const existing = TEMPLATES_BY_COMBAT_TAG.get(tag) || [];
    existing.push(template);
    TEMPLATES_BY_COMBAT_TAG.set(tag, existing);
  }
}

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get an enemy template by its unique ID
 */
export function getEnemyTemplate(id: string): EnemyTemplate | undefined {
  return TEMPLATES_BY_ID.get(id);
}

/**
 * Get all enemy templates for a given faction
 */
export function getEnemyTemplatesByFaction(faction: string): EnemyTemplate[] {
  return TEMPLATES_BY_FACTION.get(faction) || [];
}

/**
 * Get enemy templates by combat tag
 */
export function getEnemyTemplatesByCombatTag(tag: string): EnemyTemplate[] {
  return TEMPLATES_BY_COMBAT_TAG.get(tag) || [];
}

/**
 * Get enemy templates by behavior tag
 */
export function getEnemyTemplatesByBehavior(behavior: BehaviorTag): EnemyTemplate[] {
  return ENEMY_TEMPLATES.filter((t) => t.behaviorTags.includes(behavior));
}

/**
 * Get enemy templates valid for a given level
 */
export function getEnemyTemplatesForLevel(level: number): EnemyTemplate[] {
  return ENEMY_TEMPLATES.filter(
    (t) => t.minLevel <= level && t.maxLevel >= level
  );
}

/**
 * Get all enemy templates matching given criteria
 */
export function getEnemyTemplatesMatching(criteria: {
  faction?: string;
  combatTag?: string;
  behaviorTag?: BehaviorTag;
  minLevel?: number;
  maxLevel?: number;
}): EnemyTemplate[] {
  return ENEMY_TEMPLATES.filter((t) => {
    if (criteria.faction && !t.factions.includes(criteria.faction)) {
      return false;
    }
    if (criteria.combatTag && !t.combatTags.includes(criteria.combatTag)) {
      return false;
    }
    if (criteria.behaviorTag && !t.behaviorTags.includes(criteria.behaviorTag)) {
      return false;
    }
    if (criteria.minLevel !== undefined && t.maxLevel < criteria.minLevel) {
      return false;
    }
    if (criteria.maxLevel !== undefined && t.minLevel > criteria.maxLevel) {
      return false;
    }
    return true;
  });
}

// ============================================================================
// STAT CALCULATION HELPERS
// ============================================================================

/**
 * Calculate scaled stats for an enemy at a given level
 */
export function calculateScaledStats(
  template: EnemyTemplate,
  level: number
): EnemyStats {
  const levelDelta = Math.max(0, level - 1);
  const scaling = template.scaling;

  return {
    health: Math.round(
      template.baseStats.health * Math.pow(scaling.healthPerLevel, levelDelta)
    ),
    damage: Math.round(
      template.baseStats.damage * Math.pow(scaling.damagePerLevel, levelDelta)
    ),
    armor: Math.round(
      template.baseStats.armor * Math.pow(scaling.armorPerLevel, levelDelta)
    ),
    accuracy: Math.min(
      100,
      Math.round(template.baseStats.accuracy + scaling.accuracyPerLevel * levelDelta)
    ),
    evasion: Math.min(
      100,
      Math.round(template.baseStats.evasion + scaling.evasionPerLevel * levelDelta)
    ),
  };
}

/**
 * Default fallback template for unknown enemy types
 */
export const DEFAULT_ENEMY_TEMPLATE: EnemyTemplate = {
  id: 'default',
  name: 'Unknown Hostile',
  description: 'An unidentified threat.',
  baseStats: {
    health: 25,
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
    prefixes: ['Hostile', 'Aggressive', 'Wild'],
    titles: [],
    suffixes: [],
  },
  lootTableId: 'generic_loot',
  behaviorTags: ['aggressive', 'melee'],
  factions: ['neutral'],
  combatTags: ['unknown'],
  xpModifier: 1.0,
  minLevel: 1,
  maxLevel: 10,
};

// ============================================================================
// INDIVIDUAL EXPORTS
// ============================================================================

export {
  // Bandits
  BanditThugTemplate,
  BanditGunmanTemplate,
  BanditSharpshooterTemplate,
  BanditLeaderTemplate,

  // Wildlife
  DesertWolfTemplate,
  RattlesnakeTemplate,
  MountainLionTemplate,
  GrizzlyBearTemplate,
  ScorpionTemplate,
  VultureTemplate,

  // IVRC
  IVRCGuardTemplate,
  IVRCMarksmanTemplate,
  IVRCCaptainTemplate,

  // Copperhead
  CopperheadGunslingerTemplate,
  CopperheadEnforcerTemplate,
  CopperheadDynamiterTemplate,

  // Remnant
  RemnantScoutTemplate,
  RemnantSentryTemplate,
  RemnantJuggernautTemplate,

  // Misc
  RustlerTemplate,
  MercenaryTemplate,
  CorruptDeputyTemplate,
  HostileProspectorTemplate,
  DesperadoTemplate,
  GhostTownDwellerTemplate,
  TombRaiderTemplate,
};
