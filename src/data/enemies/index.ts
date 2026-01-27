/**
 * Enemy Library - Iron Frontier
 *
 * Defines all enemy types and combat encounters in the game.
 */

import type { CombatEncounter, EnemyDefinition } from '../schemas/combat';

// ============================================================================
// ENEMY DEFINITIONS
// ============================================================================

// --- BANDITS / RAIDERS ---

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
  behavior: 'aggressive',
  description: 'A desperate criminal with little to lose.',
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
  behavior: 'ranged',
  description: 'A pistol-wielding outlaw.',
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
  behavior: 'ranged',
  description: 'A deadly accurate rifleman who prefers to keep distance.',
  tags: ['ranged', 'uncommon'],
};

// --- COPPERHEAD GANG ---

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
  behavior: 'aggressive',
  description: 'A tough gang member who does the dirty work.',
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
  behavior: 'ranged',
  description: 'A quick-draw artist loyal to the gang.',
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
  behavior: 'ranged',
  description: 'A demolitions expert who loves making things go boom.',
  tags: ['explosives', 'rare', 'copperhead'],
};

// --- IVRC GUARDS ---

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
  behavior: 'defensive',
  description: 'A company security guard protecting IVRC interests.',
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
  behavior: 'ranged',
  description: 'An elite company sniper.',
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
  behavior: 'defensive',
  description: 'A seasoned commander of IVRC security forces.',
  tags: ['ranged', 'rare', 'ivrc', 'mini_boss'],
};

// --- WILDLIFE ---

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
  behavior: 'aggressive',
  description: 'A lean, hungry predator of the wastes.',
  tags: ['melee', 'common', 'animal'],
};

export const Rattlesnake: EnemyDefinition = {
  id: 'rattlesnake',
  name: 'Rattlesnake',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 10,
  actionPoints: 6,
  baseDamage: 6,
  armor: 0,
  accuracyMod: 10,
  evasion: 30,
  xpReward: 8,
  goldReward: 0,
  behavior: 'defensive',
  description: 'A venomous serpent that strikes without warning.',
  tags: ['melee', 'common', 'animal', 'poison'],
};

export const MountainLion: EnemyDefinition = {
  id: 'mountain_lion',
  name: 'Mountain Lion',
  type: 'animal',
  faction: 'wildlife',
  maxHealth: 35,
  actionPoints: 5,
  baseDamage: 15,
  armor: 2,
  accuracyMod: 5,
  evasion: 25,
  xpReward: 25,
  goldReward: 0,
  behavior: 'aggressive',
  description: 'A powerful feline ambush predator.',
  tags: ['melee', 'uncommon', 'animal'],
};

// --- THE REMNANT (Automatons) ---

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
  tags: ['melee', 'rare', 'automaton', 'mini_boss'],
};

// ============================================================================
// ENEMY REGISTRY
// ============================================================================

export const ALL_ENEMIES: EnemyDefinition[] = [
  // Bandits
  BanditThug,
  BanditGunman,
  BanditSharpshooter,
  // Copperhead
  CopperheadEnforcer,
  CopperheadGunslinger,
  CopperheadDynamiter,
  // IVRC
  IVRCGuard,
  IVRCMarksman,
  IVRCCaptain,
  // Wildlife
  DesertWolf,
  Rattlesnake,
  MountainLion,
  // Remnant
  RemnantSentry,
  RemnantScout,
  RemnantJuggernaut,
];

export const ENEMIES_BY_ID: Record<string, EnemyDefinition> = Object.fromEntries(
  ALL_ENEMIES.map((e) => [e.id, e])
);

// ============================================================================
// COMBAT ENCOUNTERS
// ============================================================================

export const RoadsideBandits: CombatEncounter = {
  id: 'roadside_bandits',
  name: 'Roadside Ambush',
  description: 'Bandits have set up an ambush on the trail.',
  enemies: [
    { enemyId: 'bandit_thug', count: 2 },
    { enemyId: 'bandit_gunman', count: 1 },
  ],
  minLevel: 1,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 50,
    gold: 20,
    items: [
      { itemId: 'bandages', quantity: 1, chance: 0.5 },
      { itemId: 'revolver_ammo', quantity: 6, chance: 0.7 },
    ],
  },
  tags: ['random', 'roadside'],
};

export const WolfPack: CombatEncounter = {
  id: 'wolf_pack',
  name: 'Wolf Pack',
  description: 'A pack of hungry desert wolves.',
  enemies: [{ enemyId: 'desert_wolf', count: 3 }],
  minLevel: 1,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 35,
    gold: 0,
    items: [{ itemId: 'wolf_pelt', quantity: 1, chance: 0.3 }],
  },
  tags: ['random', 'wildlife'],
};

export const CopperheadPatrol: CombatEncounter = {
  id: 'copperhead_patrol',
  name: 'Copperhead Patrol',
  description: 'A gang patrol checking the territory.',
  enemies: [
    { enemyId: 'copperhead_gunslinger', count: 2 },
    { enemyId: 'copperhead_enforcer', count: 1 },
  ],
  minLevel: 3,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 100,
    gold: 45,
    items: [
      { itemId: 'whiskey', quantity: 1, chance: 0.4 },
      { itemId: 'revolver_ammo', quantity: 12, chance: 0.8 },
    ],
  },
  tags: ['copperhead', 'patrol'],
};

export const IVRCCheckpoint: CombatEncounter = {
  id: 'ivrc_checkpoint',
  name: 'IVRC Checkpoint',
  description: 'Company guards blocking the way.',
  enemies: [{ enemyId: 'ivrc_guard', count: 3 }],
  minLevel: 2,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 80,
    gold: 30,
    items: [{ itemId: 'ivrc_scrip', quantity: 15, chance: 0.6 }],
  },
  tags: ['ivrc', 'checkpoint'],
};

export const RemnantAwakening: CombatEncounter = {
  id: 'remnant_awakening',
  name: 'Awakened Machines',
  description: 'Ancient automatons have detected intruders.',
  enemies: [
    { enemyId: 'remnant_sentry', count: 2 },
    { enemyId: 'remnant_scout', count: 1 },
  ],
  minLevel: 4,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 120,
    gold: 15,
    items: [
      { itemId: 'scrap_metal', quantity: 3, chance: 0.8 },
      { itemId: 'oil_can', quantity: 1, chance: 0.5 },
    ],
  },
  tags: ['remnant', 'old_works'],
};

export const JuggernautBoss: CombatEncounter = {
  id: 'juggernaut_boss',
  name: 'The Guardian',
  description: 'A massive war machine guards the inner sanctum.',
  enemies: [
    { enemyId: 'remnant_juggernaut', count: 1 },
    { enemyId: 'remnant_sentry', count: 2 },
  ],
  minLevel: 6,
  isBoss: true,
  canFlee: false,
  rewards: {
    xp: 250,
    gold: 50,
    items: [
      { itemId: 'automaton_core', quantity: 1, chance: 1.0 },
      { itemId: 'scrap_metal', quantity: 5, chance: 1.0 },
    ],
  },
  tags: ['boss', 'remnant', 'old_works'],
};

// ============================================================================
// ENCOUNTER REGISTRY
// ============================================================================

export const ALL_ENCOUNTERS: CombatEncounter[] = [
  RoadsideBandits,
  WolfPack,
  CopperheadPatrol,
  IVRCCheckpoint,
  RemnantAwakening,
  JuggernautBoss,
];

export const ENCOUNTERS_BY_ID: Record<string, CombatEncounter> = Object.fromEntries(
  ALL_ENCOUNTERS.map((e) => [e.id, e])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getEnemyById(id: string): EnemyDefinition | undefined {
  return ENEMIES_BY_ID[id];
}

export function getEncounterById(id: string): CombatEncounter | undefined {
  return ENCOUNTERS_BY_ID[id];
}

export function getEnemiesByFaction(faction: string): EnemyDefinition[] {
  return ALL_ENEMIES.filter((e) => e.faction === faction);
}

export function getEnemiesByTag(tag: string): EnemyDefinition[] {
  return ALL_ENEMIES.filter((e) => e.tags.includes(tag));
}

export function getEncountersByTag(tag: string): CombatEncounter[] {
  return ALL_ENCOUNTERS.filter((e) => e.tags.includes(tag));
}

export function getRandomEncounter(
  playerLevel: number,
  tags?: string[]
): CombatEncounter | undefined {
  let candidates = ALL_ENCOUNTERS.filter((e) => e.minLevel <= playerLevel && !e.isBoss);

  if (tags && tags.length > 0) {
    candidates = candidates.filter((e) => tags.some((tag) => e.tags.includes(tag)));
  }

  if (candidates.length === 0) return undefined;

  return candidates[Math.floor(Math.random() * candidates.length)];
}
