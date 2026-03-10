// damageCalc — Pure-function damage math for player->enemy and enemy->player hits.

import type {
  DamageResult,
  DifficultyLevel,
  EnemyDamageResult,
  ScaledEnemyStats,
} from './damageTypes';
import { getDifficultyConfig, getEnemyConfig, getWeaponConfig } from './configLookup';

/** Base headshot multiplier before difficulty adjustments. */
const HEADSHOT_MULTIPLIER = 2.5;

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
