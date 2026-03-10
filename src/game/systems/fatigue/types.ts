export type FatigueLevel = 'rested' | 'tired' | 'weary' | 'exhausted' | 'collapsed';

export interface FatigueEffects {
  accuracyModifier: number;
  damageModifier: number;
  speedModifier: number;
  stumbleChance: number;
  canAct: boolean;
  isVulnerable: boolean;
}

export interface FatigueConfig {
  maxFatigue: number;
  thresholds: {
    tired: number;
    weary: number;
    exhausted: number;
    collapsed: number;
  };
  rates: {
    travel: number;
    combat: number;
    nightPenalty: number;
    idle: number;
  };
  recovery: {
    inn: number;
    camp: number;
    item: number;
  };
}

export interface FatigueState {
  current: number;
  lastUpdateTime: number;
  pendingStumble: boolean;
}
