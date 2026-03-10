import type { FatigueConfig, FatigueEffects, FatigueLevel, FatigueState } from './types';

export const DEFAULT_FATIGUE_CONFIG: FatigueConfig = {
  maxFatigue: 100,
  thresholds: {
    tired: 25,
    weary: 50,
    exhausted: 75,
    collapsed: 100,
  },
  rates: {
    travel: 2,
    combat: 5,
    nightPenalty: 1.5,
    idle: 0.5,
  },
  recovery: {
    inn: 25,
    camp: 15,
    item: 20,
  },
};

export const DEFAULT_FATIGUE_STATE: FatigueState = {
  current: 0,
  lastUpdateTime: 0,
  pendingStumble: false,
};

export const FATIGUE_EFFECTS: Record<FatigueLevel, FatigueEffects> = {
  rested: {
    accuracyModifier: 1.0,
    damageModifier: 1.0,
    speedModifier: 1.0,
    stumbleChance: 0,
    canAct: true,
    isVulnerable: false,
  },
  tired: {
    accuracyModifier: 0.95,
    damageModifier: 0.95,
    speedModifier: 1.0,
    stumbleChance: 0,
    canAct: true,
    isVulnerable: false,
  },
  weary: {
    accuracyModifier: 0.85,
    damageModifier: 0.90,
    speedModifier: 0.8,
    stumbleChance: 0.05,
    canAct: true,
    isVulnerable: false,
  },
  exhausted: {
    accuracyModifier: 0.7,
    damageModifier: 0.75,
    speedModifier: 0.6,
    stumbleChance: 0.15,
    canAct: true,
    isVulnerable: false,
  },
  collapsed: {
    accuracyModifier: 0,
    damageModifier: 0,
    speedModifier: 0,
    stumbleChance: 1.0,
    canAct: false,
    isVulnerable: true,
  },
};
