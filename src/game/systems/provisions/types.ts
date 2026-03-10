export type TerrainType =
  | 'desert'
  | 'plains'
  | 'grassland'
  | 'forest'
  | 'mountains'
  | 'badlands'
  | 'riverside'
  | 'town';

export type ProvisionStatus = 'abundant' | 'adequate' | 'low' | 'critical' | 'depleted';

export interface HuntingResult {
  success: boolean;
  foodGained: number;
  waterGained: number;
  fatigueCost: number;
  timeSpent: number;
  description: string;
}

export interface ForagingResult {
  success: boolean;
  foodFound: number;
  waterFound: number;
  timeSpent: number;
  foundItems: string[];
}

export interface ProvisionsConfig {
  maxFood: number;
  maxWater: number;

  consumption: {
    food: number;
    water: number;
  };

  depletionEffects: {
    noFood: number;
    noWater: number;
  };

  dehydrationDamage: number;

  foragingChances: Record<TerrainType, number>;

  hunting: {
    baseChance: number;
    duration: number;
    fatigueCost: number;
    foodYield: [number, number];
    waterChance: number;
    waterYield: [number, number];
  };
}

export interface ProvisionsState {
  food: number;
  water: number;
  hoursSinceFood: number;
  hoursSinceWater: number;
}
