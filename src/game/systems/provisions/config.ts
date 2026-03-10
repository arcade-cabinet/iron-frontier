import type { ProvisionsConfig, ProvisionsState, TerrainType } from './types';

/**
 * Default provisions configuration.
 *
 * Consumption rates are per game hour. With msPerGameMinute = 4000:
 *   1 game hour = 4 real minutes
 *   food  = 2/game-hr -> starting 75 lasts ~37.5 game-hours (~2.5 real hours) of travel
 *   water = 2.5/game-hr -> starting 75 lasts ~30 game-hours (~2 real hours) of travel
 * Idle consumption (25% of travel) extends this to 3+ real hours of mixed play.
 */
export const DEFAULT_PROVISIONS_CONFIG: ProvisionsConfig = {
  maxFood: 100,
  maxWater: 100,

  consumption: {
    food: 2,
    water: 2.5,
  },

  depletionEffects: {
    noFood: 2.0,
    noWater: 3.0,
  },

  dehydrationDamage: 5,

  foragingChances: {
    desert: 0.05,
    plains: 0.25,
    grassland: 0.35,
    forest: 0.50,
    mountains: 0.15,
    badlands: 0.10,
    riverside: 0.60,
    town: 0,
  },

  hunting: {
    baseChance: 0.6,
    duration: 2,
    fatigueCost: 15,
    foodYield: [15, 30],
    waterChance: 0.3,
    waterYield: [5, 15],
  },
};

export const DEFAULT_PROVISIONS_STATE: ProvisionsState = {
  food: 75,
  water: 75,
  hoursSinceFood: 0,
  hoursSinceWater: 0,
};

export const STATUS_THRESHOLDS = {
  abundant: 0.75,
  adequate: 0.50,
  low: 0.25,
  critical: 0.10,
  depleted: 0,
};

export const FORAGING_YIELDS: Record<TerrainType, { food: [number, number]; water: [number, number] }> = {
  desert: { food: [1, 3], water: [0, 1] },
  plains: { food: [2, 6], water: [1, 3] },
  grassland: { food: [3, 8], water: [2, 5] },
  forest: { food: [5, 12], water: [3, 8] },
  mountains: { food: [2, 5], water: [2, 6] },
  badlands: { food: [1, 4], water: [0, 2] },
  riverside: { food: [4, 10], water: [8, 15] },
  town: { food: [0, 0], water: [0, 0] },
};

export const FORAGING_ITEMS: Record<TerrainType, string[]> = {
  desert: ['cactus fruit', 'desert roots', 'lizard eggs'],
  plains: ['wild berries', 'prairie herbs', 'small game'],
  grassland: ['wild vegetables', 'bird eggs', 'edible flowers'],
  forest: ['mushrooms', 'nuts', 'wild berries', 'herbs'],
  mountains: ['mountain berries', 'pine nuts', 'spring water'],
  badlands: ['tough roots', 'snake eggs', 'bitter herbs'],
  riverside: ['fish', 'crawfish', 'watercress', 'fresh water'],
  town: [],
};
