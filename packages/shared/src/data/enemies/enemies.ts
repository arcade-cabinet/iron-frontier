/**
 * Iron Frontier - Complete Enemy Database
 *
 * All enemy types organized by category:
 * - Wildlife (Easy & Medium)
 * - Bandits (Easy-Medium)
 * - Outlaws (Medium-Hard)
 * - Steampunk/Corrupted (Hard)
 * - Bosses
 */

import type { EnemyDefinition } from '../schemas/combat';

// ============================================================================
// WILDLIFE - EASY
// ============================================================================

export const Coyote: EnemyDefinition = {
  id: 'coyote',
  name: 'Coyote',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 20,
  actionPoints: 5,
  baseDamage: 8,
  armor: 2,
  accuracyMod: 0,
  evasion: 12,
  xpReward: 10,
  goldReward: 0,
  lootTableId: 'wildlife_common',
  behavior: 'aggressive',
  description: 'A scrappy desert predator that hunts in packs of 2-3. Fast and persistent.',
  spriteId: 'coyote',
  tags: ['melee', 'common', 'animal', 'pack'],
};

export const Rattlesnake: EnemyDefinition = {
  id: 'rattlesnake',
  name: 'Rattlesnake',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 10,
  actionPoints: 6,
  baseDamage: 12,
  armor: 1,
  accuracyMod: 5,
  evasion: 15,
  xpReward: 8,
  goldReward: 0,
  lootTableId: 'wildlife_venom',
  behavior: 'defensive',
  description:
    'A venomous serpent coiled in the rocks. Low health but delivers a poisonous bite.',
  spriteId: 'rattlesnake',
  tags: ['melee', 'common', 'animal', 'poison'],
};

export const Scorpion: EnemyDefinition = {
  id: 'scorpion',
  name: 'Scorpion',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 15,
  actionPoints: 4,
  baseDamage: 10,
  armor: 5,
  accuracyMod: 0,
  evasion: 8,
  xpReward: 10,
  goldReward: 0,
  lootTableId: 'wildlife_venom',
  behavior: 'defensive',
  description:
    'A desert scorpion with a thick carapace. High defense for its size, venomous sting.',
  spriteId: 'scorpion',
  tags: ['melee', 'common', 'animal', 'poison', 'armored'],
};

export const Buzzard: EnemyDefinition = {
  id: 'buzzard',
  name: 'Buzzard',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 12,
  actionPoints: 5,
  baseDamage: 6,
  armor: 1,
  accuracyMod: 5,
  evasion: 14,
  xpReward: 6,
  goldReward: 0,
  lootTableId: 'wildlife_common',
  behavior: 'aggressive',
  description:
    'A scavenging bird that swoops down on travelers. Steals provisions when it strikes.',
  spriteId: 'buzzard',
  tags: ['melee', 'common', 'animal', 'flying', 'steals'],
};

// ============================================================================
// WILDLIFE - MEDIUM
// ============================================================================

export const Wolf: EnemyDefinition = {
  id: 'wolf',
  name: 'Wolf',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 35,
  actionPoints: 5,
  baseDamage: 14,
  armor: 4,
  accuracyMod: 5,
  evasion: 13,
  xpReward: 20,
  goldReward: 0,
  lootTableId: 'wildlife_pelts',
  behavior: 'aggressive',
  description: 'A fierce pack hunter. Coordinates attacks with other wolves for devastating ambushes.',
  spriteId: 'wolf',
  tags: ['melee', 'uncommon', 'animal', 'pack'],
};

export const MountainLion: EnemyDefinition = {
  id: 'mountain_lion',
  name: 'Mountain Lion',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 45,
  actionPoints: 6,
  baseDamage: 18,
  armor: 3,
  accuracyMod: 10,
  evasion: 16,
  xpReward: 30,
  goldReward: 0,
  lootTableId: 'wildlife_pelts',
  behavior: 'aggressive',
  description: 'A powerful feline ambush predator. Fast and hits hard with razor-sharp claws.',
  spriteId: 'mountain_lion',
  tags: ['melee', 'uncommon', 'animal', 'fast'],
};

export const Bear: EnemyDefinition = {
  id: 'bear',
  name: 'Grizzly Bear',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 80,
  actionPoints: 3,
  baseDamage: 22,
  armor: 8,
  accuracyMod: -5,
  evasion: 6,
  xpReward: 50,
  goldReward: 0,
  lootTableId: 'wildlife_rare',
  behavior: 'aggressive',
  description: 'A massive grizzly bear. Slow but devastating when it connects. Tough hide reduces damage.',
  spriteId: 'bear',
  tags: ['melee', 'rare', 'animal', 'slow', 'tank'],
};

export const GiantScorpion: EnemyDefinition = {
  id: 'giant_scorpion',
  name: 'Giant Scorpion',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 50,
  actionPoints: 3,
  baseDamage: 16,
  armor: 12,
  accuracyMod: 0,
  evasion: 5,
  xpReward: 40,
  goldReward: 0,
  lootTableId: 'wildlife_venom',
  behavior: 'aggressive',
  description:
    'A monstrous scorpion the size of a dog. Heavily armored carapace and deadly venom.',
  spriteId: 'giant_scorpion',
  tags: ['melee', 'uncommon', 'animal', 'poison', 'armored', 'slow'],
};

// ============================================================================
// BANDITS - EASY TO MEDIUM
// ============================================================================

export const LoneBandit: EnemyDefinition = {
  id: 'lone_bandit',
  name: 'Lone Bandit',
  type: 'bandit',
  faction: 'raiders',
  maxHealth: 30,
  actionPoints: 4,
  baseDamage: 10,
  armor: 4,
  accuracyMod: -5,
  evasion: 10,
  weaponId: 'hunting_knife',
  xpReward: 15,
  goldReward: 8,
  lootTableId: 'bandit_common',
  behavior: 'aggressive',
  description: 'A desperate criminal surviving on the frontier. Basic equipment but dangerous in numbers.',
  spriteId: 'bandit_thug',
  tags: ['melee', 'common', 'human'],
};

export const BanditGunner: EnemyDefinition = {
  id: 'bandit_gunner',
  name: 'Bandit Gunner',
  type: 'gunslinger',
  faction: 'raiders',
  maxHealth: 25,
  actionPoints: 4,
  baseDamage: 15,
  armor: 3,
  accuracyMod: 5,
  evasion: 11,
  weaponId: 'revolver',
  xpReward: 20,
  goldReward: 12,
  lootTableId: 'bandit_common',
  behavior: 'ranged',
  description: 'A pistol-wielding outlaw who prefers to fight from range.',
  spriteId: 'bandit_gunman',
  tags: ['ranged', 'common', 'human'],
};

export const BanditBrute: EnemyDefinition = {
  id: 'bandit_brute',
  name: 'Bandit Brute',
  type: 'brute',
  faction: 'raiders',
  maxHealth: 50,
  actionPoints: 3,
  baseDamage: 14,
  armor: 6,
  accuracyMod: -10,
  evasion: 7,
  weaponId: 'pickaxe',
  xpReward: 25,
  goldReward: 15,
  lootTableId: 'bandit_common',
  behavior: 'aggressive',
  description: 'A hulking enforcer who relies on brute strength. Slow but can take a beating.',
  spriteId: 'bandit_brute',
  tags: ['melee', 'uncommon', 'human', 'tank'],
};

export const BanditLeader: EnemyDefinition = {
  id: 'bandit_leader',
  name: 'Bandit Leader',
  type: 'gunslinger',
  faction: 'raiders',
  maxHealth: 60,
  actionPoints: 5,
  baseDamage: 16,
  armor: 5,
  accuracyMod: 10,
  evasion: 12,
  weaponId: 'navy_revolver',
  xpReward: 40,
  goldReward: 30,
  lootTableId: 'bandit_leader',
  behavior: 'defensive',
  description: 'The leader of a bandit gang. Commands respect and buffs nearby allies.',
  spriteId: 'bandit_leader',
  tags: ['ranged', 'uncommon', 'human', 'leader', 'buffs'],
};

// ============================================================================
// OUTLAWS - MEDIUM TO HARD
// ============================================================================

export const OutlawGunslinger: EnemyDefinition = {
  id: 'outlaw_gunslinger',
  name: 'Outlaw Gunslinger',
  type: 'gunslinger',
  faction: 'copperhead',
  maxHealth: 40,
  actionPoints: 5,
  baseDamage: 20,
  armor: 4,
  accuracyMod: 15,
  evasion: 14,
  weaponId: 'schofield',
  xpReward: 45,
  goldReward: 25,
  lootTableId: 'outlaw_common',
  behavior: 'ranged',
  description: 'A quick-draw artist with a mean streak. High damage and deadly accurate.',
  spriteId: 'outlaw_gunslinger',
  tags: ['ranged', 'uncommon', 'human', 'fast', 'copperhead'],
};

export const OutlawEnforcer: EnemyDefinition = {
  id: 'outlaw_enforcer',
  name: 'Outlaw Enforcer',
  type: 'brute',
  faction: 'copperhead',
  maxHealth: 70,
  actionPoints: 4,
  baseDamage: 18,
  armor: 10,
  accuracyMod: 0,
  evasion: 8,
  weaponId: 'shotgun',
  xpReward: 55,
  goldReward: 35,
  lootTableId: 'outlaw_common',
  behavior: 'aggressive',
  description: 'A heavily armored gang enforcer. Tough as nails and armed with a shotgun.',
  spriteId: 'outlaw_enforcer',
  tags: ['ranged', 'uncommon', 'human', 'tank', 'copperhead'],
};

export const RedEyesLieutenant: EnemyDefinition = {
  id: 'red_eyes_lieutenant',
  name: "Red Eye's Lieutenant",
  type: 'gunslinger',
  faction: 'copperhead',
  maxHealth: 80,
  actionPoints: 5,
  baseDamage: 22,
  armor: 8,
  accuracyMod: 15,
  evasion: 11,
  weaponId: 'revolver_fancy',
  xpReward: 80,
  goldReward: 50,
  lootTableId: 'outlaw_leader',
  behavior: 'defensive',
  description:
    "A trusted lieutenant of the infamous Red Eye. Mini-boss level threat with gang backing.",
  spriteId: 'outlaw_lieutenant',
  tags: ['ranged', 'rare', 'human', 'mini_boss', 'copperhead'],
};

// ============================================================================
// STEAMPUNK / CORRUPTED - HARD
// ============================================================================

export const ClockworkDrone: EnemyDefinition = {
  id: 'clockwork_drone',
  name: 'Clockwork Drone',
  type: 'automaton',
  faction: 'remnant',
  maxHealth: 45,
  actionPoints: 4,
  baseDamage: 14,
  armor: 15,
  accuracyMod: 5,
  evasion: 10,
  xpReward: 40,
  goldReward: 5,
  lootTableId: 'automaton_scrap',
  behavior: 'defensive',
  description:
    'A small mechanical drone that patrols ancient ruins. High armor but limited offense.',
  spriteId: 'clockwork_drone',
  tags: ['ranged', 'uncommon', 'automaton', 'armored'],
};

export const SteamGolem: EnemyDefinition = {
  id: 'steam_golem',
  name: 'Steam Golem',
  type: 'automaton',
  faction: 'remnant',
  maxHealth: 100,
  actionPoints: 2,
  baseDamage: 25,
  armor: 12,
  accuracyMod: -10,
  evasion: 4,
  xpReward: 75,
  goldReward: 15,
  lootTableId: 'automaton_rare',
  behavior: 'aggressive',
  description:
    'A massive steam-powered construct. Extremely slow but hits like a locomotive.',
  spriteId: 'steam_golem',
  tags: ['melee', 'rare', 'automaton', 'slow', 'tank'],
};

export const CorruptedProspector: EnemyDefinition = {
  id: 'corrupted_prospector',
  name: 'Corrupted Prospector',
  type: 'bandit',
  faction: 'remnant',
  maxHealth: 55,
  actionPoints: 4,
  baseDamage: 18,
  armor: 6,
  accuracyMod: 0,
  evasion: 9,
  weaponId: 'pickaxe',
  xpReward: 45,
  goldReward: 20,
  lootTableId: 'corrupted_human',
  behavior: 'aggressive',
  description:
    'A miner twisted by exposure to strange machinery. Once human, now something else.',
  spriteId: 'corrupted_prospector',
  tags: ['melee', 'uncommon', 'corrupted', 'human'],
};

export const MechanicalHorror: EnemyDefinition = {
  id: 'mechanical_horror',
  name: 'Mechanical Horror',
  type: 'automaton',
  faction: 'remnant',
  maxHealth: 120,
  actionPoints: 4,
  baseDamage: 28,
  armor: 10,
  accuracyMod: 5,
  evasion: 7,
  xpReward: 100,
  goldReward: 30,
  lootTableId: 'automaton_rare',
  behavior: 'aggressive',
  description:
    'A nightmarish fusion of machine and something organic. Late-game threat with multiple attack types.',
  spriteId: 'mechanical_horror',
  tags: ['melee', 'rare', 'automaton', 'late_game'],
};

// ============================================================================
// BOSSES
// ============================================================================

export const BanditKing: EnemyDefinition = {
  id: 'bandit_king',
  name: 'The Bandit King',
  type: 'gunslinger',
  faction: 'raiders',
  maxHealth: 150,
  actionPoints: 6,
  baseDamage: 24,
  armor: 10,
  accuracyMod: 15,
  evasion: 12,
  weaponId: 'revolver_fancy',
  xpReward: 200,
  goldReward: 100,
  lootTableId: 'boss_bandit_king',
  behavior: 'defensive',
  description:
    'The ruthless ruler of the frontier bandits. Act 1 boss with loyal guards.',
  spriteId: 'bandit_king',
  tags: ['ranged', 'legendary', 'human', 'boss', 'act1'],
};

export const TheSaboteur: EnemyDefinition = {
  id: 'the_saboteur',
  name: 'The Saboteur',
  type: 'dynamiter',
  faction: 'copperhead',
  maxHealth: 100,
  actionPoints: 6,
  baseDamage: 30,
  armor: 6,
  accuracyMod: 10,
  evasion: 15,
  weaponId: 'dynamite',
  xpReward: 250,
  goldReward: 75,
  lootTableId: 'boss_saboteur',
  behavior: 'ranged',
  description:
    'A master of explosives and gadgets. Uses traps, smoke bombs, and dynamite in combat.',
  spriteId: 'saboteur',
  tags: ['ranged', 'legendary', 'human', 'boss', 'explosives', 'act2'],
};

export const IronTyrant: EnemyDefinition = {
  id: 'iron_tyrant',
  name: 'The Iron Tyrant',
  type: 'automaton',
  faction: 'remnant',
  maxHealth: 250,
  actionPoints: 5,
  baseDamage: 35,
  armor: 15,
  accuracyMod: 10,
  evasion: 10,
  xpReward: 500,
  goldReward: 200,
  lootTableId: 'boss_final',
  behavior: 'aggressive',
  description:
    'The final boss. A massive war machine awakened from the depths. Multiple combat phases.',
  spriteId: 'iron_tyrant',
  tags: ['melee', 'legendary', 'automaton', 'boss', 'final', 'phases'],
};

// ============================================================================
// ADDITIONAL ENEMIES (from original file, enhanced)
// ============================================================================

export const DesertWolf: EnemyDefinition = {
  id: 'desert_wolf',
  name: 'Desert Wolf',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 20,
  actionPoints: 5,
  baseDamage: 10,
  armor: 0,
  accuracyMod: 0,
  evasion: 20,
  xpReward: 12,
  goldReward: 0,
  lootTableId: 'wildlife_common',
  behavior: 'aggressive',
  description: 'A lean, hungry predator of the wastes.',
  spriteId: 'desert_wolf',
  tags: ['melee', 'common', 'animal'],
};

export const BanditThug: EnemyDefinition = {
  id: 'bandit_thug',
  name: 'Bandit Thug',
  type: 'bandit',
  faction: 'raiders',
  maxHealth: 30,
  actionPoints: 4,
  baseDamage: 8,
  armor: 0,
  accuracyMod: -10,
  evasion: 5,
  weaponId: 'rusty_knife',
  xpReward: 15,
  goldReward: 5,
  lootTableId: 'bandit_common',
  behavior: 'aggressive',
  description: 'A desperate criminal with little to lose.',
  spriteId: 'bandit_thug',
  tags: ['melee', 'common'],
};

export const BanditGunman: EnemyDefinition = {
  id: 'bandit_gunman',
  name: 'Bandit Gunman',
  type: 'gunslinger',
  faction: 'raiders',
  maxHealth: 25,
  actionPoints: 4,
  baseDamage: 12,
  armor: 0,
  accuracyMod: 0,
  evasion: 10,
  weaponId: 'worn_revolver',
  xpReward: 20,
  goldReward: 8,
  lootTableId: 'bandit_common',
  behavior: 'ranged',
  description: 'A pistol-wielding outlaw.',
  spriteId: 'bandit_gunman',
  tags: ['ranged', 'common'],
};

export const BanditSharpshooter: EnemyDefinition = {
  id: 'bandit_sharpshooter',
  name: 'Bandit Sharpshooter',
  type: 'sharpshooter',
  faction: 'raiders',
  maxHealth: 20,
  actionPoints: 3,
  baseDamage: 18,
  armor: 0,
  accuracyMod: 15,
  evasion: 5,
  weaponId: 'hunting_rifle',
  xpReward: 30,
  goldReward: 12,
  lootTableId: 'bandit_common',
  behavior: 'ranged',
  description: 'A deadly accurate rifleman who prefers to keep distance.',
  spriteId: 'bandit_sharpshooter',
  tags: ['ranged', 'uncommon'],
};

export const CopperheadEnforcer: EnemyDefinition = {
  id: 'copperhead_enforcer',
  name: 'Copperhead Enforcer',
  type: 'brute',
  faction: 'copperhead',
  maxHealth: 50,
  actionPoints: 3,
  baseDamage: 15,
  armor: 5,
  accuracyMod: -5,
  evasion: 5,
  weaponId: 'shotgun',
  xpReward: 40,
  goldReward: 15,
  lootTableId: 'outlaw_common',
  behavior: 'aggressive',
  description: 'A tough gang member who does the dirty work.',
  spriteId: 'copperhead_enforcer',
  tags: ['melee', 'uncommon', 'copperhead'],
};

export const CopperheadGunslinger: EnemyDefinition = {
  id: 'copperhead_gunslinger',
  name: 'Copperhead Gunslinger',
  type: 'gunslinger',
  faction: 'copperhead',
  maxHealth: 35,
  actionPoints: 5,
  baseDamage: 14,
  armor: 2,
  accuracyMod: 10,
  evasion: 15,
  weaponId: 'revolver',
  xpReward: 45,
  goldReward: 20,
  lootTableId: 'outlaw_common',
  behavior: 'ranged',
  description: 'A quick-draw artist loyal to the gang.',
  spriteId: 'copperhead_gunslinger',
  tags: ['ranged', 'uncommon', 'copperhead'],
};

export const CopperheadDynamiter: EnemyDefinition = {
  id: 'copperhead_dynamiter',
  name: 'Copperhead Dynamiter',
  type: 'dynamiter',
  faction: 'copperhead',
  maxHealth: 25,
  actionPoints: 4,
  baseDamage: 25,
  armor: 0,
  accuracyMod: -15,
  evasion: 10,
  weaponId: 'dynamite',
  xpReward: 50,
  goldReward: 25,
  lootTableId: 'outlaw_common',
  behavior: 'ranged',
  description: 'A demolitions expert who loves making things go boom.',
  spriteId: 'copperhead_dynamiter',
  tags: ['explosives', 'rare', 'copperhead'],
};

export const IVRCGuard: EnemyDefinition = {
  id: 'ivrc_guard',
  name: 'IVRC Guard',
  type: 'gunslinger',
  faction: 'ivrc_guards',
  maxHealth: 40,
  actionPoints: 4,
  baseDamage: 12,
  armor: 3,
  accuracyMod: 5,
  evasion: 8,
  weaponId: 'revolver',
  xpReward: 35,
  goldReward: 10,
  lootTableId: 'ivrc_common',
  behavior: 'defensive',
  description: 'A company security guard protecting IVRC interests.',
  spriteId: 'ivrc_guard',
  tags: ['ranged', 'common', 'ivrc'],
};

export const IVRCMarksman: EnemyDefinition = {
  id: 'ivrc_marksman',
  name: 'IVRC Marksman',
  type: 'sharpshooter',
  faction: 'ivrc_guards',
  maxHealth: 30,
  actionPoints: 4,
  baseDamage: 20,
  armor: 2,
  accuracyMod: 20,
  evasion: 5,
  weaponId: 'rifle',
  xpReward: 50,
  goldReward: 15,
  lootTableId: 'ivrc_common',
  behavior: 'ranged',
  description: 'An elite company sniper.',
  spriteId: 'ivrc_marksman',
  tags: ['ranged', 'uncommon', 'ivrc'],
};

export const IVRCCaptain: EnemyDefinition = {
  id: 'ivrc_captain',
  name: 'IVRC Captain',
  type: 'gunslinger',
  faction: 'ivrc_guards',
  maxHealth: 60,
  actionPoints: 5,
  baseDamage: 16,
  armor: 5,
  accuracyMod: 15,
  evasion: 12,
  weaponId: 'revolver',
  xpReward: 75,
  goldReward: 30,
  lootTableId: 'ivrc_leader',
  behavior: 'defensive',
  description: 'A seasoned commander of IVRC security forces.',
  spriteId: 'ivrc_captain',
  tags: ['ranged', 'rare', 'ivrc', 'mini_boss'],
};

export const RemnantSentry: EnemyDefinition = {
  id: 'remnant_sentry',
  name: 'Sentry Automaton',
  type: 'automaton',
  faction: 'remnant',
  maxHealth: 50,
  actionPoints: 3,
  baseDamage: 12,
  armor: 8,
  accuracyMod: 0,
  evasion: 0,
  xpReward: 40,
  goldReward: 5,
  lootTableId: 'automaton_scrap',
  behavior: 'defensive',
  description: 'A mechanical guardian from a forgotten age.',
  spriteId: 'remnant_sentry',
  tags: ['ranged', 'uncommon', 'automaton'],
};

export const RemnantScout: EnemyDefinition = {
  id: 'remnant_scout',
  name: 'Scout Automaton',
  type: 'automaton',
  faction: 'remnant',
  maxHealth: 30,
  actionPoints: 5,
  baseDamage: 10,
  armor: 4,
  accuracyMod: 10,
  evasion: 15,
  xpReward: 35,
  goldReward: 5,
  lootTableId: 'automaton_scrap',
  behavior: 'ranged',
  description: 'A fast, agile reconnaissance machine.',
  spriteId: 'remnant_scout',
  tags: ['ranged', 'uncommon', 'automaton'],
};

export const RemnantJuggernaut: EnemyDefinition = {
  id: 'remnant_juggernaut',
  name: 'Juggernaut Automaton',
  type: 'automaton',
  faction: 'remnant',
  maxHealth: 100,
  actionPoints: 2,
  baseDamage: 25,
  armor: 15,
  accuracyMod: -10,
  evasion: 0,
  xpReward: 100,
  goldReward: 20,
  lootTableId: 'automaton_rare',
  behavior: 'aggressive',
  description: 'A massive, heavily armored war machine.',
  spriteId: 'remnant_juggernaut',
  tags: ['melee', 'rare', 'automaton', 'mini_boss'],
};

// ============================================================================
// ENEMY REGISTRY - ALL ENEMIES
// ============================================================================

export const ALL_ENEMIES: EnemyDefinition[] = [
  // Wildlife - Easy
  Coyote,
  Rattlesnake,
  Scorpion,
  Buzzard,
  // Wildlife - Medium
  Wolf,
  MountainLion,
  Bear,
  GiantScorpion,
  // Wildlife - Legacy
  DesertWolf,
  // Bandits - Easy to Medium
  LoneBandit,
  BanditGunner,
  BanditBrute,
  BanditLeader,
  // Bandits - Legacy
  BanditThug,
  BanditGunman,
  BanditSharpshooter,
  // Outlaws - Medium to Hard (Copperhead)
  OutlawGunslinger,
  OutlawEnforcer,
  RedEyesLieutenant,
  CopperheadEnforcer,
  CopperheadGunslinger,
  CopperheadDynamiter,
  // IVRC Guards
  IVRCGuard,
  IVRCMarksman,
  IVRCCaptain,
  // Steampunk/Corrupted - Hard
  ClockworkDrone,
  SteamGolem,
  CorruptedProspector,
  MechanicalHorror,
  // Remnant Automatons
  RemnantSentry,
  RemnantScout,
  RemnantJuggernaut,
  // Bosses
  BanditKing,
  TheSaboteur,
  IronTyrant,
];

export const ENEMIES_BY_ID: Record<string, EnemyDefinition> = Object.fromEntries(
  ALL_ENEMIES.map((e) => [e.id, e])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getEnemyById(id: string): EnemyDefinition | undefined {
  return ENEMIES_BY_ID[id];
}

export function getEnemiesByFaction(faction: string): EnemyDefinition[] {
  return ALL_ENEMIES.filter((e) => e.faction === faction);
}

export function getEnemiesByTag(tag: string): EnemyDefinition[] {
  return ALL_ENEMIES.filter((e) => e.tags.includes(tag));
}

export function getEnemiesByType(type: string): EnemyDefinition[] {
  return ALL_ENEMIES.filter((e) => e.type === type);
}

export function getEnemiesByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard' | 'boss'
): EnemyDefinition[] {
  switch (difficulty) {
    case 'easy':
      return ALL_ENEMIES.filter((e) => e.tags.includes('common'));
    case 'medium':
      return ALL_ENEMIES.filter((e) => e.tags.includes('uncommon'));
    case 'hard':
      return ALL_ENEMIES.filter(
        (e) => e.tags.includes('rare') && !e.tags.includes('boss')
      );
    case 'boss':
      return ALL_ENEMIES.filter((e) => e.tags.includes('boss'));
  }
}

export function getRandomEnemy(
  options?: {
    faction?: string;
    type?: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'boss';
    tags?: string[];
  }
): EnemyDefinition | undefined {
  let candidates = [...ALL_ENEMIES];

  if (options?.faction) {
    candidates = candidates.filter((e) => e.faction === options.faction);
  }
  if (options?.type) {
    candidates = candidates.filter((e) => e.type === options.type);
  }
  if (options?.difficulty) {
    candidates = getEnemiesByDifficulty(options.difficulty).filter((e) =>
      candidates.includes(e)
    );
  }
  if (options?.tags) {
    candidates = candidates.filter((e) =>
      options.tags!.some((tag) => e.tags.includes(tag))
    );
  }

  if (candidates.length === 0) return undefined;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
