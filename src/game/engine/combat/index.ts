// Combat system barrel export

export {
  processCombatTick,
  createWeaponState,
  type CombatEnemy,
  type CombatTickResult,
  type KilledEnemyData,
  type WeaponRuntimeState,
  type ReloadPhase,
} from './CombatManager';

export {
  calculateDamage,
  calculateEnemyDamage,
  distanceFalloff,
  getWeaponConfig,
  getEnemyConfig,
  getDifficultyConfig,
  getScaledEnemyStats,
  type DamageResult,
  type EnemyDamageResult,
  type WeaponConfig,
  type EnemyConfig,
  type DifficultyConfig,
  type DifficultyLevel,
  type ScaledEnemyStats,
} from './DamageCalculator';

export {
  createEnemyAI,
  disposeEnemyAI,
  updateEnemyAI,
  applyAIMovement,
  updateAIEntityManager,
  type AIState,
  type AIAction,
  type AIActionType,
  type EnemyAIState,
} from './EnemyAI';

export {
  createDamageNumber,
  createHitMarker,
  createMuzzleFlash,
  createDeathEffect,
  createImpactSpark,
  type DamageNumberData,
  type HitMarkerData,
  type MuzzleFlashData,
  type DeathEffectData,
  type ImpactSparkData,
} from './HitEffects';
