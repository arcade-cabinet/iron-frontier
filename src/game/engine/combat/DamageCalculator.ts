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
  range: number;
  accuracy: number;
  fireRate: number;
  reloadTime: number;
  spread: number;
  ammoCapacity: number;
  ammoType: string;
  value: number;
  weight: number;
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
 * For melee weapons (range === 0) we use a fixed 2-unit effective range.
 */
export function distanceFalloff(
  distance: number,
  weaponRange: number,
): number {
  // Melee weapons: full damage within 2 units, drops to 0 at 3
  if (weaponRange <= 0) {
    const meleeEffective = 2;
    const meleeMax = 3;
    if (distance <= meleeEffective) return 1;
    if (distance >= meleeMax) return 0;
    return 1 - (distance - meleeEffective) / (meleeMax - meleeEffective);
  }

  // Ranged: effective range = weapon.range, max range = 1.5x weapon.range
  const effectiveRange = weaponRange;
  const maxRange = weaponRange * 1.5;

  if (distance <= effectiveRange) return 1;
  if (distance >= maxRange) return 0;
  return 1 - (distance - effectiveRange) / (maxRange - effectiveRange);
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
 * @param distance - Distance from player to target in world units
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

  // Distance falloff
  const falloff = distanceFalloff(distance, weapon.range);
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
 * @param distance - Distance from enemy to player (for ranged falloff)
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
      dmg *= distanceFalloff(distance, weapon.range);
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
