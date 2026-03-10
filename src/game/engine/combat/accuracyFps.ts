// accuracyFps — FPS-specific enemy accuracy, reaction time, and fire rate calculations.

import type { DifficultyLevel } from './damageTypes';
import { getEnemyConfig, getDifficultyConfig, getWeaponConfig } from './configLookup';

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
