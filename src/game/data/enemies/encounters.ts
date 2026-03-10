import type { CombatEncounter } from '../schemas/combat.ts';

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
