/**
 * Enemy Library - Iron Frontier
 *
 * Exports all enemy definitions and combat encounters.
 * The complete enemy database is in enemies.ts.
 */

import type { CombatEncounter } from '../schemas/combat';

// Re-export all enemies from the complete database
export {
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
  DesertWolf,
  // Bandits
  LoneBandit,
  BanditGunner,
  BanditBrute,
  BanditLeader,
  BanditThug,
  BanditGunman,
  BanditSharpshooter,
  // Outlaws (Copperhead)
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
  // Steampunk/Corrupted
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
  // Registry
  ALL_ENEMIES,
  ENEMIES_BY_ID,
  // Utility functions
  getEnemyById,
  getEnemiesByFaction,
  getEnemiesByTag,
  getEnemiesByType,
  getEnemiesByDifficulty,
  getRandomEnemy,
} from './enemies';

// ============================================================================
// COMBAT ENCOUNTERS
// ============================================================================

// --- WILDLIFE ENCOUNTERS ---

export const CoyotePack: CombatEncounter = {
  id: 'coyote_pack',
  name: 'Coyote Pack',
  description: 'A pack of scrappy desert coyotes circles around you.',
  enemies: [{ enemyId: 'coyote', count: 3 }],
  minLevel: 1,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 30,
    gold: 0,
    items: [{ itemId: 'coyote_pelt', quantity: 1, chance: 0.5 }],
  },
  tags: ['random', 'wildlife', 'easy'],
};

export const SnakeNest: CombatEncounter = {
  id: 'snake_nest',
  name: 'Snake Nest',
  description: 'You stumbled upon a nest of rattlesnakes!',
  enemies: [{ enemyId: 'rattlesnake', count: 2 }],
  minLevel: 1,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 20,
    gold: 0,
    items: [{ itemId: 'snake_venom', quantity: 1, chance: 0.6 }],
  },
  tags: ['random', 'wildlife', 'easy', 'poison'],
};

export const WolfPack: CombatEncounter = {
  id: 'wolf_pack',
  name: 'Wolf Pack',
  description: 'A pack of hungry wolves has caught your scent.',
  enemies: [{ enemyId: 'wolf', count: 3 }],
  minLevel: 2,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 60,
    gold: 0,
    items: [{ itemId: 'wolf_pelt', quantity: 1, chance: 0.4 }],
  },
  tags: ['random', 'wildlife', 'medium'],
};

export const MountainPredator: CombatEncounter = {
  id: 'mountain_predator',
  name: 'Mountain Predator',
  description: 'A mountain lion stalks you from the rocks above.',
  enemies: [{ enemyId: 'mountain_lion', count: 1 }],
  minLevel: 3,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 40,
    gold: 0,
    items: [{ itemId: 'mountain_lion_claw', quantity: 2, chance: 0.5 }],
  },
  tags: ['random', 'wildlife', 'medium'],
};

export const GrizzlyAttack: CombatEncounter = {
  id: 'grizzly_attack',
  name: 'Grizzly Attack',
  description: 'A massive grizzly bear charges out of the brush!',
  enemies: [{ enemyId: 'bear', count: 1 }],
  minLevel: 4,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 60,
    gold: 0,
    items: [{ itemId: 'bear_pelt', quantity: 1, chance: 0.7 }],
  },
  tags: ['random', 'wildlife', 'hard'],
};

// --- BANDIT ENCOUNTERS ---

export const RoadsideBandits: CombatEncounter = {
  id: 'roadside_bandits',
  name: 'Roadside Ambush',
  description: 'Bandits have set up an ambush on the trail.',
  enemies: [
    { enemyId: 'lone_bandit', count: 2 },
    { enemyId: 'bandit_gunner', count: 1 },
  ],
  minLevel: 1,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 50,
    gold: 20,
    items: [
      { itemId: 'bandages', quantity: 1, chance: 0.5 },
      { itemId: 'pistol_ammo', quantity: 6, chance: 0.7 },
    ],
  },
  tags: ['random', 'roadside', 'bandit'],
};

export const BanditCamp: CombatEncounter = {
  id: 'bandit_camp',
  name: 'Bandit Camp',
  description: 'You found a bandit hideout.',
  enemies: [
    { enemyId: 'lone_bandit', count: 2 },
    { enemyId: 'bandit_gunner', count: 2 },
    { enemyId: 'bandit_brute', count: 1 },
  ],
  minLevel: 2,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 100,
    gold: 40,
    items: [
      { itemId: 'bandits_pouch', quantity: 2, chance: 0.8 },
      { itemId: 'pistol_ammo', quantity: 12, chance: 0.9 },
    ],
  },
  tags: ['bandit', 'camp'],
};

export const BanditBoss: CombatEncounter = {
  id: 'bandit_boss',
  name: 'Bandit Leader Showdown',
  description: 'The local bandit leader has come to deal with you personally.',
  enemies: [
    { enemyId: 'bandit_leader', count: 1 },
    { enemyId: 'bandit_gunner', count: 2 },
    { enemyId: 'bandit_brute', count: 1 },
  ],
  minLevel: 3,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 150,
    gold: 60,
    items: [
      { itemId: 'bandits_pouch', quantity: 3, chance: 1.0 },
      { itemId: 'health_potion', quantity: 2, chance: 0.8 },
    ],
  },
  tags: ['bandit', 'mini_boss'],
};

// --- OUTLAW (COPPERHEAD) ENCOUNTERS ---

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
    xp: 120,
    gold: 50,
    items: [
      { itemId: 'whiskey', quantity: 1, chance: 0.4 },
      { itemId: 'pistol_ammo', quantity: 12, chance: 0.8 },
      { itemId: 'outlaw_badge', quantity: 1, chance: 0.5 },
    ],
  },
  tags: ['copperhead', 'patrol', 'outlaw'],
};

export const OutlawAmbush: CombatEncounter = {
  id: 'outlaw_ambush',
  name: 'Outlaw Ambush',
  description: 'Copperhead outlaws have sprung a trap!',
  enemies: [
    { enemyId: 'outlaw_gunslinger', count: 2 },
    { enemyId: 'outlaw_enforcer', count: 1 },
  ],
  minLevel: 4,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 150,
    gold: 70,
    items: [
      { itemId: 'bandits_pouch', quantity: 2, chance: 0.9 },
      { itemId: 'shotgun_ammo', quantity: 8, chance: 0.7 },
    ],
  },
  tags: ['copperhead', 'ambush', 'outlaw'],
};

export const LieutenantShowdown: CombatEncounter = {
  id: 'lieutenant_showdown',
  name: "Red Eye's Lieutenant",
  description: "One of Red Eye's trusted lieutenants blocks your path.",
  enemies: [
    { enemyId: 'red_eyes_lieutenant', count: 1 },
    { enemyId: 'outlaw_gunslinger', count: 2 },
  ],
  minLevel: 5,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 200,
    gold: 100,
    items: [
      { itemId: 'health_potion_greater', quantity: 1, chance: 0.8 },
      { itemId: 'outlaw_badge', quantity: 2, chance: 1.0 },
    ],
  },
  tags: ['copperhead', 'mini_boss', 'outlaw'],
};

// --- IVRC ENCOUNTERS ---

export const IVRCCheckpoint: CombatEncounter = {
  id: 'ivrc_checkpoint',
  name: 'IVRC Checkpoint',
  description: 'Company guards blocking the way.',
  enemies: [{ enemyId: 'ivrc_guard', count: 3 }],
  minLevel: 2,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 90,
    gold: 30,
    items: [{ itemId: 'ivrc_scrip', quantity: 15, chance: 0.6 }],
  },
  tags: ['ivrc', 'checkpoint'],
};

export const IVRCPatrol: CombatEncounter = {
  id: 'ivrc_patrol',
  name: 'IVRC Patrol',
  description: 'A heavily armed company patrol.',
  enemies: [
    { enemyId: 'ivrc_guard', count: 2 },
    { enemyId: 'ivrc_marksman', count: 1 },
  ],
  minLevel: 3,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 120,
    gold: 40,
    items: [
      { itemId: 'rifle_rounds', quantity: 10, chance: 0.7 },
      { itemId: 'ivrc_scrip', quantity: 25, chance: 0.8 },
    ],
  },
  tags: ['ivrc', 'patrol'],
};

export const IVRCCaptainEncounter: CombatEncounter = {
  id: 'ivrc_captain_encounter',
  name: 'IVRC Captain',
  description: 'An IVRC security captain with his elite guards.',
  enemies: [
    { enemyId: 'ivrc_captain', count: 1 },
    { enemyId: 'ivrc_marksman', count: 2 },
  ],
  minLevel: 5,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 180,
    gold: 60,
    items: [
      { itemId: 'ivrc_scrip', quantity: 50, chance: 1.0 },
      { itemId: 'health_potion', quantity: 2, chance: 0.8 },
    ],
  },
  tags: ['ivrc', 'mini_boss'],
};

// --- AUTOMATON ENCOUNTERS ---

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
    xp: 130,
    gold: 15,
    items: [
      { itemId: 'mechanical_parts', quantity: 3, chance: 0.8 },
      { itemId: 'oil_can', quantity: 1, chance: 0.5 },
    ],
  },
  tags: ['remnant', 'old_works', 'automaton'],
};

export const ClockworkSwarm: CombatEncounter = {
  id: 'clockwork_swarm',
  name: 'Clockwork Swarm',
  description: 'A swarm of clockwork drones attacks!',
  enemies: [{ enemyId: 'clockwork_drone', count: 4 }],
  minLevel: 4,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 160,
    gold: 20,
    items: [
      { itemId: 'mechanical_parts', quantity: 5, chance: 0.9 },
      { itemId: 'copper_wire', quantity: 3, chance: 0.7 },
    ],
  },
  tags: ['remnant', 'automaton'],
};

export const SteamGolemEncounter: CombatEncounter = {
  id: 'steam_golem_encounter',
  name: 'Steam Golem',
  description: 'A massive steam-powered golem blocks the passage.',
  enemies: [
    { enemyId: 'steam_golem', count: 1 },
    { enemyId: 'clockwork_drone', count: 2 },
  ],
  minLevel: 5,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 180,
    gold: 30,
    items: [
      { itemId: 'steam_valve', quantity: 1, chance: 0.6 },
      { itemId: 'mechanical_parts', quantity: 5, chance: 1.0 },
    ],
  },
  tags: ['remnant', 'automaton', 'hard'],
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
    xp: 300,
    gold: 50,
    items: [
      { itemId: 'automaton_core', quantity: 1, chance: 1.0 },
      { itemId: 'automaton_plating', quantity: 2, chance: 0.8 },
    ],
  },
  tags: ['boss', 'remnant', 'old_works', 'automaton'],
};

// --- BOSS ENCOUNTERS ---

export const BanditKingBattle: CombatEncounter = {
  id: 'bandit_king_battle',
  name: 'The Bandit King',
  description: 'The ruthless Bandit King awaits in his throne room.',
  enemies: [
    { enemyId: 'bandit_king', count: 1 },
    { enemyId: 'bandit_leader', count: 2 },
    { enemyId: 'bandit_brute', count: 2 },
  ],
  minLevel: 5,
  isBoss: true,
  canFlee: false,
  musicId: 'boss_bandit',
  rewards: {
    xp: 400,
    gold: 150,
    items: [
      { itemId: 'revolver_fancy', quantity: 1, chance: 1.0 },
      { itemId: 'health_potion_greater', quantity: 3, chance: 1.0 },
      { itemId: 'gold_nugget', quantity: 2, chance: 0.8 },
    ],
  },
  tags: ['boss', 'act1', 'bandit'],
};

export const SaboteurBattle: CombatEncounter = {
  id: 'saboteur_battle',
  name: 'The Saboteur',
  description: 'The master of explosives has rigged the entire room.',
  enemies: [
    { enemyId: 'the_saboteur', count: 1 },
    { enemyId: 'outlaw_gunslinger', count: 2 },
    { enemyId: 'copperhead_dynamiter', count: 1 },
  ],
  minLevel: 7,
  isBoss: true,
  canFlee: false,
  musicId: 'boss_saboteur',
  rewards: {
    xp: 500,
    gold: 200,
    items: [
      { itemId: 'dynamite', quantity: 10, chance: 1.0 },
      { itemId: 'quickdraw_holster', quantity: 1, chance: 0.7 },
      { itemId: 'evidence_documents', quantity: 1, chance: 1.0 },
    ],
  },
  tags: ['boss', 'act2', 'copperhead'],
};

export const IronTyrantBattle: CombatEncounter = {
  id: 'iron_tyrant_battle',
  name: 'The Iron Tyrant',
  description: 'The ancient war machine awakens for the final battle.',
  enemies: [
    { enemyId: 'iron_tyrant', count: 1 },
    { enemyId: 'steam_golem', count: 2 },
  ],
  minLevel: 10,
  isBoss: true,
  canFlee: false,
  musicId: 'boss_final',
  rewards: {
    xp: 1000,
    gold: 500,
    items: [
      { itemId: 'automaton_core', quantity: 1, chance: 1.0 },
      { itemId: 'steam_plated_armor', quantity: 1, chance: 1.0 },
      { itemId: 'steampunk_blade', quantity: 1, chance: 0.8 },
    ],
  },
  tags: ['boss', 'final', 'remnant', 'automaton'],
};

// ============================================================================
// ENCOUNTER REGISTRY
// ============================================================================

export const ALL_ENCOUNTERS: CombatEncounter[] = [
  // Wildlife
  CoyotePack,
  SnakeNest,
  WolfPack,
  MountainPredator,
  GrizzlyAttack,
  // Bandits
  RoadsideBandits,
  BanditCamp,
  BanditBoss,
  // Outlaws
  CopperheadPatrol,
  OutlawAmbush,
  LieutenantShowdown,
  // IVRC
  IVRCCheckpoint,
  IVRCPatrol,
  IVRCCaptainEncounter,
  // Automatons
  RemnantAwakening,
  ClockworkSwarm,
  SteamGolemEncounter,
  JuggernautBoss,
  // Bosses
  BanditKingBattle,
  SaboteurBattle,
  IronTyrantBattle,
];

export const ENCOUNTERS_BY_ID: Record<string, CombatEncounter> = Object.fromEntries(
  ALL_ENCOUNTERS.map((e) => [e.id, e])
);

// ============================================================================
// ENCOUNTER UTILITY FUNCTIONS
// ============================================================================

export function getEncounterById(id: string): CombatEncounter | undefined {
  return ENCOUNTERS_BY_ID[id];
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

export function getBossEncounters(): CombatEncounter[] {
  return ALL_ENCOUNTERS.filter((e) => e.isBoss);
}

export function getEncountersByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard' | 'boss'
): CombatEncounter[] {
  switch (difficulty) {
    case 'easy':
      return ALL_ENCOUNTERS.filter((e) => e.minLevel <= 2 && !e.isBoss);
    case 'medium':
      return ALL_ENCOUNTERS.filter((e) => e.minLevel > 2 && e.minLevel <= 5 && !e.isBoss);
    case 'hard':
      return ALL_ENCOUNTERS.filter((e) => e.minLevel > 5 && !e.isBoss);
    case 'boss':
      return ALL_ENCOUNTERS.filter((e) => e.isBoss);
  }
}
