// DamageCalculator — Pure-function damage math for Iron Frontier FPS combat.
//
// No side effects, no state. Every function is deterministic given inputs.
// Reads weapon/enemy/difficulty config at import time and provides typed
// lookup helpers so callers don't need to parse JSON themselves.

import weaponsData from '@/config/game/weapons.json';
import enemiesData from '@/config/game/enemies.json';
import difficultyData from '@/config/game/difficulty.json';

// ---------------------------------------------------------------------------
// Config types (derived from JSON shape)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Typed config maps
// ---------------------------------------------------------------------------

const weaponsByIdMap = new Map<string, WeaponConfig>();
for (const w of weaponsData as WeaponConfig[]) {
  weaponsByIdMap.set(w.id, w);
}

const enemiesByIdMap = new Map<string, EnemyConfig>();
for (const e of enemiesData as EnemyConfig[]) {
  enemiesByIdMap.set(e.id, e);
}

const difficultyMap = difficultyData as Record<DifficultyLevel, DifficultyConfig>;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getWeaponConfig(weaponId: string): WeaponConfig | undefined {
  return weaponsByIdMap.get(weaponId);
}

export function getEnemyConfig(enemyId: string): EnemyConfig | undefined {
  return enemiesByIdMap.get(enemyId);
}

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return difficultyMap[level];
}

// ---------------------------------------------------------------------------
// Headshot multiplier
// ---------------------------------------------------------------------------

/** Base headshot multiplier before difficulty adjustments. */
const HEADSHOT_MULTIPLIER = 2.5;

// ---------------------------------------------------------------------------
// Distance falloff
// ---------------------------------------------------------------------------

/**
 * Compute a distance-based damage falloff factor in [0, 1].
 *
 * - Within `effectiveRange`: full damage (1.0)
 * - Between `effectiveRange` and `maxRange`: linear falloff to 0
 * - Beyond `maxRange`: 0 damage
 *
 * For melee weapons (range <= 2) we use the weapon's own range/maxRange.
 */
export function distanceFalloff(
  distance: number,
  weaponRange: number,
  weaponMaxRange?: number,
): number {
  // Melee weapons: use range directly (typically 2m effective, 2.5m max)
  if (weaponRange <= 0) {
    const meleeEffective = 2;
    const meleeMax = 3;
    if (distance <= meleeEffective) return 1;
    if (distance >= meleeMax) return 0;
    return 1 - (distance - meleeEffective) / (meleeMax - meleeEffective);
  }

  const effectiveRange = weaponRange;
  const maxRange = weaponMaxRange ?? weaponRange * 1.5;

  if (distance <= effectiveRange) return 1;
  if (distance >= maxRange) return 0;
  return 1 - (distance - effectiveRange) / (maxRange - effectiveRange);
}

// ---------------------------------------------------------------------------
// Enemy accuracy falloff (FPS)
// ---------------------------------------------------------------------------

/**
 * Compute an enemy's effective accuracy at a given distance.
 *
 * Uses the enemy's fpsAccuracy config to interpolate between baseAccuracy
 * and minAccuracy based on distance falloff bands. Applies difficulty
 * modifier and optional cover penalty (reduces enemy hit chance when
 * player is behind cover).
 *
 * @param enemyId - Enemy definition ID
 * @param level - Enemy level
 * @param distance - Distance to target in meters
 * @param difficulty - Current difficulty level
 * @param playerBehindCover - Whether the player is currently behind cover
 * @returns Effective accuracy percentage (0-100)
 */
export function getEnemyAccuracyAtDistance(
  enemyId: string,
  level: number,
  distance: number,
  difficulty: DifficultyLevel,
  playerBehindCover: boolean = false,
): number {
  const enemy = getEnemyConfig(enemyId);
  if (!enemy) return 30;

  const diff = getDifficultyConfig(difficulty);
  const fps = enemy.fpsAccuracy;

  if (!fps) {
    // Legacy fallback: flat accuracy + level scaling + difficulty mod
    return Math.max(
      5,
      Math.min(
        95,
        enemy.baseStats.accuracy +
          enemy.scaling.accuracyPerLevel * (level - 1) +
          diff.enemyAccuracyMod,
      ),
    );
  }

  // Base accuracy with level scaling
  let accuracy = fps.baseAccuracy + enemy.scaling.accuracyPerLevel * (level - 1);

  // Distance falloff
  if (distance > fps.falloffStartDistance) {
    if (distance >= fps.falloffEndDistance) {
      accuracy = fps.minAccuracy;
    } else {
      const t =
        (distance - fps.falloffStartDistance) /
        (fps.falloffEndDistance - fps.falloffStartDistance);
      accuracy = accuracy - t * (accuracy - fps.minAccuracy);
    }
  }

  // Player behind cover reduces enemy accuracy
  if (playerBehindCover) {
    accuracy -= fps.coverBonus;
  }

  // Difficulty modifier
  accuracy += diff.enemyAccuracyMod;

  return Math.max(5, Math.min(95, accuracy));
}

/**
 * Get the reaction time for an enemy before they fire their first shot.
 *
 * @param enemyId - Enemy definition ID
 * @param alertness - 0 (idle/surprised) to 1 (fully alert/already in combat)
 * @returns Reaction delay in seconds
 */
export function getEnemyReactionTime(
  enemyId: string,
  alertness: number = 0,
): number {
  const enemy = getEnemyConfig(enemyId);
  if (!enemy?.fpsAccuracy) return 1.0;

  const fps = enemy.fpsAccuracy;
  // Higher alertness = closer to minimum reaction time
  const t = Math.max(0, Math.min(1, alertness));
  return fps.reactionTimeMax - t * (fps.reactionTimeMax - fps.reactionTimeMin);
}

/**
 * Get the fire rate for an enemy using a specific weapon.
 * Enemies fire slightly slower than the player to give the player an edge.
 *
 * @param weaponId - Weapon config ID
 * @returns Fire rate in shots per second
 */
export function getEnemyFireRate(weaponId: string): number {
  const weapon = getWeaponConfig(weaponId);
  if (!weapon) return 0.8;
  const multiplier = weapon.enemyFireRateMultiplier ?? 0.8;
  return weapon.fireRate * multiplier;
}

// ---------------------------------------------------------------------------
// Player -> Enemy damage
// ---------------------------------------------------------------------------

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

/**
 * Calculate damage dealt by the player to an enemy.
 *
 * @param weaponId - ID of the weapon being fired (from weapons.json)
 * @param distance - Distance from player to target in meters
 * @param isHeadshot - Whether the ray hit the headshot zone
 * @param difficulty - Current difficulty level
 * @param enemyArmor - Target's armor value (flat damage reduction)
 * @returns Full damage breakdown
 */
export function calculateDamage(
  weaponId: string,
  distance: number,
  isHeadshot: boolean,
  difficulty: DifficultyLevel,
  enemyArmor: number = 0,
): DamageResult {
  const weapon = getWeaponConfig(weaponId);
  if (!weapon) {
    return {
      damage: 0,
      isHeadshot,
      isCritical: false,
      falloff: 0,
      difficultyMultiplier: 1,
    };
  }

  const diff = getDifficultyConfig(difficulty);

  // Base damage
  let dmg = weapon.damage;

  // Distance falloff (uses maxRange from config)
  const falloff = distanceFalloff(distance, weapon.range, weapon.maxRange);
  dmg *= falloff;

  // Headshot multiplier
  const isCritical = isHeadshot;
  if (isHeadshot) {
    dmg *= HEADSHOT_MULTIPLIER;
  }

  // Difficulty: player damage multiplier
  dmg *= diff.playerDamageMultiplier;

  // Armor reduction (flat, minimum 1 damage if we hit at all)
  dmg = Math.max(1, dmg - enemyArmor);

  // Floor to integer
  dmg = Math.floor(dmg);

  return {
    damage: dmg,
    isHeadshot,
    isCritical,
    falloff,
    difficultyMultiplier: diff.playerDamageMultiplier,
  };
}

// ---------------------------------------------------------------------------
// Enemy -> Player damage
// ---------------------------------------------------------------------------

export interface EnemyDamageResult {
  damage: number;
  difficultyMultiplier: number;
}

/**
 * Calculate damage dealt by an enemy to the player.
 *
 * @param enemyId - ID of the enemy (from enemies.json)
 * @param enemyLevel - Current level of the enemy instance
 * @param playerArmor - Player's current armor value
 * @param difficulty - Current difficulty level
 * @param distance - Distance from enemy to player in meters (for ranged falloff)
 * @returns Damage result
 */
export function calculateEnemyDamage(
  enemyId: string,
  enemyLevel: number,
  playerArmor: number,
  difficulty: DifficultyLevel,
  distance: number = 0,
): EnemyDamageResult {
  const enemy = getEnemyConfig(enemyId);
  if (!enemy) {
    return { damage: 0, difficultyMultiplier: 1 };
  }

  const diff = getDifficultyConfig(difficulty);

  // Base damage scaled by level
  const levelScale = Math.pow(enemy.scaling.damagePerLevel, enemyLevel - 1);
  let dmg = enemy.baseStats.damage * levelScale;

  // Ranged enemies get falloff based on their weapon range
  if (enemy.weaponId) {
    const weapon = getWeaponConfig(enemy.weaponId);
    if (weapon && weapon.range > 0) {
      dmg *= distanceFalloff(distance, weapon.range, weapon.maxRange);
    }
  }

  // Difficulty: enemy damage multiplier
  dmg *= diff.enemyDamageMultiplier;

  // Player armor (flat reduction, minimum 1)
  dmg = Math.max(1, dmg - playerArmor);

  dmg = Math.floor(dmg);

  return {
    damage: dmg,
    difficultyMultiplier: diff.enemyDamageMultiplier,
  };
}

// ---------------------------------------------------------------------------
// Scaled enemy stats (for spawning)
// ---------------------------------------------------------------------------

export interface ScaledEnemyStats {
  health: number;
  damage: number;
  armor: number;
  accuracy: number;
  evasion: number;
}

/**
 * Compute enemy stats scaled to a specific level and difficulty.
 */
export function getScaledEnemyStats(
  enemyId: string,
  level: number,
  difficulty: DifficultyLevel,
): ScaledEnemyStats {
  const enemy = getEnemyConfig(enemyId);
  if (!enemy) {
    return { health: 1, damage: 1, armor: 0, accuracy: 50, evasion: 0 };
  }

  const diff = getDifficultyConfig(difficulty);
  const s = enemy.scaling;
  const b = enemy.baseStats;

  return {
    health: Math.floor(b.health * Math.pow(s.healthPerLevel, level - 1) * diff.enemyHealthMultiplier),
    damage: Math.floor(b.damage * Math.pow(s.damagePerLevel, level - 1)),
    armor: Math.floor(b.armor * Math.pow(s.armorPerLevel, level - 1)),
    accuracy: Math.floor(b.accuracy + s.accuracyPerLevel * (level - 1) + diff.enemyAccuracyMod),
    evasion: Math.floor(b.evasion + s.evasionPerLevel * (level - 1)),
  };
}
