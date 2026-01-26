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
// ELITE VARIANTS
// ============================================================================

/**
 * IVRC Elite Captain - Elite version of IVRC Guard
 * Found: IVRC headquarters, high-security areas, escorting VIPs
 * AI: Defensive, uses cover, calls for reinforcements, buffs nearby guards
 */
export const IVRCEliteCaptain: EnemyDefinition = {
  id: 'ivrc_elite_captain',
  name: 'IVRC Elite Captain',
  type: 'gunslinger',
  faction: 'ivrc_guards',
  maxHealth: 90,
  actionPoints: 6,
  baseDamage: 20,
  armor: 8,
  accuracyMod: 18,
  evasion: 14,
  weaponId: 'navy_revolver',
  xpReward: 100,
  goldReward: 50,
  lootTableId: 'ivrc_elite',
  behavior: 'defensive',
  description:
    'A decorated IVRC security captain with elite training. Commands guards and carries company-issued gear. Ability: Commanding Presence (nearby IVRC units deal +25% damage).',
  spriteId: 'ivrc_elite_captain',
  tags: ['ranged', 'rare', 'ivrc', 'elite', 'leader', 'buffs'],
};

/**
 * Copperhead Viper - Elite gang member
 * Found: Copperhead hideouts, assassination missions, VIP protection
 * AI: Aggressive, dual-wields, applies poison on attacks
 */
export const CopperheadViper: EnemyDefinition = {
  id: 'copperhead_viper',
  name: 'Copperhead Viper',
  type: 'gunslinger',
  faction: 'copperhead',
  maxHealth: 55,
  actionPoints: 7,
  baseDamage: 16,
  armor: 4,
  accuracyMod: 20,
  evasion: 18,
  weaponId: 'dual_revolvers',
  xpReward: 85,
  goldReward: 40,
  lootTableId: 'outlaw_elite',
  behavior: 'aggressive',
  description:
    'An elite Copperhead assassin who dual-wields poisoned revolvers. Strikes fast and vanishes. Ability: Venom Rounds (attacks apply poison DoT for 3 turns).',
  spriteId: 'copperhead_viper',
  tags: ['ranged', 'rare', 'copperhead', 'elite', 'fast', 'poison', 'dual_wield'],
};

/**
 * Armored Prospector - Elite bandit with mining equipment
 * Found: Abandoned mines, claim disputes, bandit strongholds
 * AI: Aggressive tank, charges into melee, high damage absorption
 */
export const ArmoredProspector: EnemyDefinition = {
  id: 'armored_prospector',
  name: 'Armored Prospector',
  type: 'brute',
  faction: 'raiders',
  maxHealth: 85,
  actionPoints: 3,
  baseDamage: 22,
  armor: 14,
  accuracyMod: -5,
  evasion: 4,
  weaponId: 'reinforced_pickaxe',
  xpReward: 70,
  goldReward: 35,
  lootTableId: 'bandit_elite',
  behavior: 'aggressive',
  description:
    'A bandit who has fashioned mining equipment into makeshift armor. Slow but nearly impenetrable. Ability: Ore Plating (first hit each turn deals 50% reduced damage).',
  spriteId: 'armored_prospector',
  tags: ['melee', 'rare', 'elite', 'tank', 'armored', 'slow'],
};

/**
 * Freeminer Defender - Elite Freeminer fighter (hostile path)
 * Found: Freeminer camps (if player opposed them), defensive positions
 * AI: Defensive, uses terrain, protects allies
 */
export const FreeminerDefender: EnemyDefinition = {
  id: 'freeminer_defender',
  name: 'Freeminer Defender',
  type: 'brute',
  faction: 'raiders', // Uses raiders since no freeminer faction
  maxHealth: 75,
  actionPoints: 5,
  baseDamage: 18,
  armor: 10,
  accuracyMod: 5,
  evasion: 8,
  weaponId: 'war_pickaxe',
  xpReward: 80,
  goldReward: 30,
  lootTableId: 'freeminer_elite',
  behavior: 'defensive',
  description:
    'A hardened Freeminer warrior fighting for their claim. Expert with a pickaxe and fiercely protective of allies. Ability: Stand Your Ground (reduces damage to nearby allies by 30%).',
  spriteId: 'freeminer_defender',
  tags: ['melee', 'rare', 'elite', 'tank', 'freeminer', 'protector'],
};

/**
 * Steam Automaton - Elite mechanical enemy
 * Found: Old Works, IVRC facilities, ancient ruins
 * AI: Ranged preference, self-repairs when damaged, methodical
 */
export const SteamAutomaton: EnemyDefinition = {
  id: 'steam_automaton',
  name: 'Steam Automaton',
  type: 'automaton',
  faction: 'remnant',
  maxHealth: 80,
  actionPoints: 4,
  baseDamage: 20,
  armor: 12,
  accuracyMod: 10,
  evasion: 6,
  xpReward: 90,
  goldReward: 20,
  lootTableId: 'automaton_elite',
  behavior: 'ranged',
  description:
    'An advanced steam-powered automaton with self-repair protocols. Fires pressurized steam at range. Ability: Self-Repair (heals 15 HP at end of turn if not attacked).',
  spriteId: 'steam_automaton',
  tags: ['ranged', 'rare', 'automaton', 'elite', 'armored', 'self_heal'],
};

/**
 * Canyon Stalker - Elite predator
 * Found: Canyons, wilderness, night encounters
 * AI: Ambush tactics, pack coordination, hits hard from stealth
 */
export const CanyonStalker: EnemyDefinition = {
  id: 'canyon_stalker',
  name: 'Canyon Stalker',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 60,
  actionPoints: 6,
  baseDamage: 24,
  armor: 5,
  accuracyMod: 15,
  evasion: 20,
  xpReward: 65,
  goldReward: 0,
  lootTableId: 'wildlife_rare',
  behavior: 'aggressive',
  description:
    'A terrifying apex predator of the canyon system. Coordinates with pack members for devastating ambushes. Ability: Pack Tactics (+50% damage when other stalkers are present), Ambush (+30% damage on first attack).',
  spriteId: 'canyon_stalker',
  tags: ['melee', 'rare', 'animal', 'elite', 'fast', 'pack', 'ambush'],
};

// ============================================================================
// BOSSES
// ============================================================================

/**
 * CORNELIUS THORNE - IVRC Director (Final Boss Potential)
 * Found: IVRC Headquarters, final confrontation
 * AI: Stays protected, summons guards, uses powerful single-target abilities
 *
 * Abilities:
 * - Executive Order: Buffs all IVRC guards, increasing damage and accuracy
 * - Iron Grip: Stuns a target for 1 turn, preventing action
 * - Corporate Might: Devastating single-target attack with bonus damage
 *
 * Encounter Context: Final boss of IVRC storyline. Found in his office at
 * IVRC HQ, protected by elite guards. Multiple phases as he calls reinforcements.
 */
export const CorneliusThorne: EnemyDefinition = {
  id: 'cornelius_thorne',
  name: 'Cornelius Thorne',
  type: 'gunslinger',
  faction: 'ivrc_guards',
  maxHealth: 200,
  actionPoints: 7,
  baseDamage: 28,
  armor: 12,
  accuracyMod: 20,
  evasion: 15,
  weaponId: 'executive_revolver',
  xpReward: 400,
  goldReward: 300,
  lootTableId: 'boss_thorne',
  behavior: 'defensive',
  description:
    'Director of the Iron Valley Railroad Company. A ruthless businessman who will stop at nothing to maintain his grip on the frontier. Commands absolute loyalty from his guards. ABILITIES: Executive Order (buff guards), Iron Grip (stun), Corporate Might (heavy damage).',
  spriteId: 'cornelius_thorne',
  tags: ['ranged', 'legendary', 'human', 'boss', 'ivrc', 'final_boss', 'summons'],
};

/**
 * THE RATTLESNAKE KING - Giant Mutated Rattlesnake
 * Found: Deep canyons, Snake's Hollow, ancient nesting grounds
 * AI: Aggressive, area attacks, applies poison liberally
 *
 * Abilities:
 * - Venomous Strike: Powerful bite that applies stacking poison DoT
 * - Coil Crush: Constricts target, disabling them for 1 turn and dealing damage
 * - Rattling Fear: Intimidating rattle that debuffs entire party (reduced accuracy)
 *
 * Encounter Context: Optional boss in the canyon region. Guards a valuable
 * treasure hoard. Can be bypassed with enough Snake Venom or Reptile Lore.
 */
export const RattlesnakeKing: EnemyDefinition = {
  id: 'rattlesnake_king',
  name: 'The Rattlesnake King',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 180,
  actionPoints: 5,
  baseDamage: 32,
  armor: 10,
  accuracyMod: 15,
  evasion: 12,
  xpReward: 350,
  goldReward: 0,
  lootTableId: 'boss_rattlesnake_king',
  behavior: 'aggressive',
  description:
    'A monstrous rattlesnake of impossible size, mutated by exposure to strange minerals in the deep canyons. Its venom can kill a horse in seconds. ABILITIES: Venomous Strike (poison DoT), Coil Crush (disable), Rattling Fear (party debuff).',
  spriteId: 'rattlesnake_king',
  tags: ['melee', 'legendary', 'animal', 'boss', 'poison', 'aoe', 'debuff'],
};

/**
 * IRON GOLEM - IVRC Steam-Powered Enforcer
 * Found: IVRC industrial facilities, Thorne's inner sanctum, prototype lab
 * AI: Aggressive tank, uses AoE, reflects damage when overheated
 *
 * Abilities:
 * - Steam Blast: Cone AoE attack that damages all targets in front
 * - Iron Fist: Massive melee strike that knocks target back
 * - Overheat: Enters overheated state, reflecting 50% damage for 2 turns
 *
 * Encounter Context: IVRC's ultimate weapon, a steam-powered war machine.
 * Found protecting critical IVRC assets or as Thorne's last line of defense.
 */
export const IronGolem: EnemyDefinition = {
  id: 'iron_golem',
  name: 'Iron Golem',
  type: 'automaton',
  faction: 'ivrc_guards',
  maxHealth: 220,
  actionPoints: 4,
  baseDamage: 35,
  armor: 18,
  accuracyMod: 5,
  evasion: 3,
  xpReward: 380,
  goldReward: 100,
  lootTableId: 'boss_iron_golem',
  behavior: 'aggressive',
  description:
    'A massive steam-powered enforcer built by IVRC engineers. Belches smoke and steam as it lumbers toward its targets. Nearly impervious to small arms fire. ABILITIES: Steam Blast (AoE), Iron Fist (knockback), Overheat (damage reflection).',
  spriteId: 'iron_golem',
  tags: ['melee', 'legendary', 'automaton', 'boss', 'ivrc', 'tank', 'aoe', 'knockback'],
};

/**
 * GHOST OF THE GALLOWS - Spectral Outlaw
 * Found: Old Gallows Hill, abandoned execution site, haunted areas
 * AI: Phases in/out, uses pull attacks, silences casters
 *
 * Abilities:
 * - Phase Shift: Becomes incorporeal, immune to physical damage for 1 turn
 * - Hangman's Rope: Spectral noose pulls target adjacent and deals damage
 * - Wail of the Damned: Horrifying scream that silences all targets for 1 turn
 *
 * Encounter Context: The restless spirit of an outlaw executed decades ago.
 * Appears during certain story missions or can be sought out for unique loot.
 */
export const GhostOfTheGallows: EnemyDefinition = {
  id: 'ghost_of_the_gallows',
  name: 'Ghost of the Gallows',
  type: 'bandit', // Spectral outlaw, closest type
  faction: 'remnant', // Uses remnant as "otherworldly" faction
  maxHealth: 140,
  actionPoints: 6,
  baseDamage: 26,
  armor: 5,
  accuracyMod: 18,
  evasion: 25,
  xpReward: 320,
  goldReward: 50,
  lootTableId: 'boss_ghost',
  behavior: 'aggressive',
  description:
    'The vengeful spirit of a notorious outlaw, hanged at Gallows Hill a generation ago. Immune to conventional weapons during its phased state. ABILITIES: Phase Shift (damage immunity), Hangman\'s Rope (pull + damage), Wail (silence).',
  spriteId: 'ghost_of_the_gallows',
  tags: ['melee', 'legendary', 'undead', 'boss', 'spectral', 'phase', 'pull', 'silence'],
};

/**
 * DIAMONDBACK - Copperhead Leader (Hostile Path)
 * Found: Copperhead stronghold (if player opposes them)
 * AI: Fast, aggressive, uses interrupts and multi-hit attacks
 *
 * Abilities:
 * - Quick Draw: Interrupts enemy action, dealing damage and canceling their turn
 * - Viper's Kiss: Applies potent poison that stacks and spreads
 * - Serpent Strike: Rapid multi-hit attack (3 strikes at reduced damage)
 *
 * Encounter Context: Leader of the Copperhead Gang. Only fought if player
 * sides against the Copperheads. Master gunslinger and cunning tactician.
 */
export const Diamondback: EnemyDefinition = {
  id: 'diamondback',
  name: 'Diamondback',
  type: 'gunslinger',
  faction: 'copperhead',
  maxHealth: 160,
  actionPoints: 8,
  baseDamage: 24,
  armor: 8,
  accuracyMod: 25,
  evasion: 20,
  weaponId: 'diamondback_revolvers',
  xpReward: 400,
  goldReward: 200,
  lootTableId: 'boss_diamondback',
  behavior: 'aggressive',
  description:
    'The legendary leader of the Copperhead Gang, known for lightning-fast draws and deadly accuracy. Only becomes an enemy if the player opposes the Copperheads. ABILITIES: Quick Draw (interrupt), Viper\'s Kiss (poison), Serpent Strike (multi-hit).',
  spriteId: 'diamondback',
  tags: ['ranged', 'legendary', 'human', 'boss', 'copperhead', 'fast', 'poison', 'interrupt', 'conditional'],
};

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
  // Elite Variants
  IVRCEliteCaptain,
  CopperheadViper,
  ArmoredProspector,
  FreeminerDefender,
  SteamAutomaton,
  CanyonStalker,
  // Bosses
  BanditKing,
  TheSaboteur,
  IronTyrant,
  CorneliusThorne,
  RattlesnakeKing,
  IronGolem,
  GhostOfTheGallows,
  Diamondback,
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
