// damageTypes — Config and result types for the damage calculation system.

export interface WeaponConfig {
  id: string;
  name: string;
  description: string;
  weaponType: string;
  rarity: string;
  damage: number;
  /** Effective range in meters — full damage within this distance. */
  range: number;
  /** Maximum range in meters — damage drops to 0 beyond this. Falls back to range * 1.5 if absent. */
  maxRange?: number;
  accuracy: number;
  fireRate: number;
  reloadTime: number;
  spread: number;
  ammoCapacity: number;
  ammoType: string;
  value: number;
  weight: number;
  /** Multiplier applied to fire rate when an enemy uses this weapon (< 1 = slower). */
  enemyFireRateMultiplier?: number;
}

export interface FpsAccuracyConfig {
  /** Base accuracy percentage (0-100) at close range. */
  baseAccuracy: number;
  /** Distance (meters) at which accuracy starts to fall off. */
  falloffStartDistance: number;
  /** Distance (meters) at which accuracy reaches minAccuracy. */
  falloffEndDistance: number;
  /** Minimum accuracy percentage at or beyond falloffEndDistance. */
  minAccuracy: number;
  /** Accuracy bonus when the enemy is behind cover. */
  coverBonus: number;
  /** Minimum reaction delay (seconds) before first shot. */
  reactionTimeMin: number;
  /** Maximum reaction delay (seconds) before first shot. */
  reactionTimeMax: number;
}

export interface EnemyConfig {
  id: string;
  name: string;
  type: string;
  faction: string;
  description: string;
  maxHealth: number;
  actionPoints: number;
  baseDamage: number;
  armor: number;
  accuracyMod: number;
  evasion: number;
  weaponId?: string;
  xpReward: number;
  goldReward: number;
  behavior: string;
  tags: string[];
  baseStats: {
    health: number;
    damage: number;
    armor: number;
    accuracy: number;
    evasion: number;
  };
  scaling: {
    healthPerLevel: number;
    damagePerLevel: number;
    armorPerLevel: number;
    accuracyPerLevel: number;
    evasionPerLevel: number;
  };
  /** FPS-specific accuracy, reaction time, and cover modifiers. */
  fpsAccuracy?: FpsAccuracyConfig;
  behaviorTags: string[];
  minLevel: number;
  maxLevel: number;
  xpModifier: number;
  lootTable: {
    always: string[];
    common: string[];
    uncommon: string[];
    rare: string[];
  };
}

export interface DifficultyConfig {
  label: string;
  description: string;
  playerDamageMultiplier: number;
  enemyDamageMultiplier: number;
  enemyHealthMultiplier: number;
  enemyAccuracyMod: number;
  lootMultiplier: number;
  xpMultiplier: number;
  goldMultiplier: number;
  fatigueRateMultiplier: number;
  provisionConsumptionMultiplier: number;
  healingMultiplier: number;
  criticalHitChanceBonus: number;
  encounterFrequency: number;
}

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface DamageResult {
  /** Final damage after all modifiers. */
  damage: number;
  /** Whether this was a headshot. */
  isHeadshot: boolean;
  /** Whether the attack was a critical (headshot + difficulty bonus). */
  isCritical: boolean;
  /** Distance falloff factor applied. */
  falloff: number;
  /** Difficulty multiplier applied. */
  difficultyMultiplier: number;
}

export interface EnemyDamageResult {
  damage: number;
  difficultyMultiplier: number;
}

export interface ScaledEnemyStats {
  health: number;
  damage: number;
  armor: number;
  accuracy: number;
  evasion: number;
}
