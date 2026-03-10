// DamageCalculator — Barrel re-export preserving the original import path.

export type {
  WeaponConfig,
  FpsAccuracyConfig,
  EnemyConfig,
  DifficultyConfig,
  DifficultyLevel,
  DamageResult,
  EnemyDamageResult,
  ScaledEnemyStats,
} from './damageTypes';

export {
  getWeaponConfig,
  getEnemyConfig,
  getDifficultyConfig,
} from './configLookup';

export {
  getEnemyAccuracyAtDistance,
  getEnemyReactionTime,
  getEnemyFireRate,
} from './accuracyFps';

export {
  distanceFalloff,
  calculateDamage,
  calculateEnemyDamage,
  getScaledEnemyStats,
} from './damageCalc';
