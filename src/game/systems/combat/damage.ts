/**
 * Iron Frontier - Damage Calculator
 *
 * Pure functions for calculating combat damage.
 * All functions are deterministic given the same inputs for testability.
 */

import type {
  CombatStats,
  DamageCalculationInput,
  DamageCalculationResult,
  StatusEffect,
} from './types';
import { scopedRNG, rngTick } from '../../lib/prng';

// Re-export from statusEffects for backwards compatibility
export {
  calculateStatusEffectDamage,
  calculateHeal,
  applyStatusEffectModifiers,
} from './statusEffects';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default damage variance (+/- 10%) */
export const DEFAULT_VARIANCE = 0.1;

/** Default critical hit multiplier */
export const DEFAULT_CRIT_MULTIPLIER = 1.5;

/** Minimum damage that can be dealt */
export const MINIMUM_DAMAGE = 1;

/** Defense stance damage reduction (50%) */
export const DEFEND_DAMAGE_REDUCTION = 0.5;

/** Maximum fatigue penalty (at 100% fatigue) */
export const MAX_FATIGUE_PENALTY = 0.3;

// ============================================================================
// BASE DAMAGE CALCULATION
// ============================================================================

/**
 * Calculate base damage before any modifiers
 *
 * Formula: attackPower - (defenderDefense * 0.5)
 * Ensures minimum damage of 1
 */
export function calculateBaseDamage(attackPower: number, defenderDefense: number): number {
  const rawDamage = attackPower - defenderDefense * 0.5;
  return Math.max(MINIMUM_DAMAGE, Math.floor(rawDamage));
}

/**
 * Apply variance to damage
 *
 * @param baseDamage - The base damage to apply variance to
 * @param varianceFactor - The variance factor (0.1 = +/-10%)
 * @param randomValue - A value between 0 and 1 (for deterministic testing)
 * @returns The damage with variance applied
 */
export function applyVariance(
  baseDamage: number,
  varianceFactor: number,
  randomValue: number
): number {
  // Convert 0-1 random to -1 to 1 range
  const varianceMultiplier = 1 + (randomValue * 2 - 1) * varianceFactor;
  return Math.max(MINIMUM_DAMAGE, Math.floor(baseDamage * varianceMultiplier));
}

/**
 * Apply critical hit multiplier
 */
export function applyCriticalMultiplier(
  damage: number,
  isCritical: boolean,
  critMultiplier: number = DEFAULT_CRIT_MULTIPLIER
): number {
  if (!isCritical) return damage;
  return Math.floor(damage * critMultiplier);
}

/**
 * Apply defensive stance reduction
 */
export function applyDefenseReduction(damage: number, isDefending: boolean): number {
  if (!isDefending) return damage;
  return Math.max(MINIMUM_DAMAGE, Math.floor(damage * (1 - DEFEND_DAMAGE_REDUCTION)));
}

/**
 * Apply fatigue penalty to damage output
 *
 * @param damage - The damage to reduce
 * @param fatigue - Fatigue level 0-100
 * @returns Damage reduced by fatigue penalty
 */
export function applyFatiguePenalty(damage: number, fatigue: number): number {
  // Normalize fatigue to 0-1 range
  const normalizedFatigue = Math.max(0, Math.min(100, fatigue)) / 100;
  // Calculate penalty (up to 30% reduction at max fatigue)
  const penalty = normalizedFatigue * MAX_FATIGUE_PENALTY;
  return Math.max(MINIMUM_DAMAGE, Math.floor(damage * (1 - penalty)));
}

/**
 * Apply type effectiveness multiplier
 */
export function applyTypeEffectiveness(damage: number, effectiveness: number): number {
  return Math.max(MINIMUM_DAMAGE, Math.floor(damage * effectiveness));
}

// ============================================================================
// COMPLETE DAMAGE CALCULATION
// ============================================================================

/**
 * Calculate final damage using the complete damage formula
 *
 * @param input - All inputs for damage calculation
 * @param randomValue - A value between 0 and 1 for variance
 * @returns Complete damage calculation result with breakdown
 */
export function calculateDamage(
  input: DamageCalculationInput,
  randomValue: number = scopedRNG('combat', 42, rngTick())
): DamageCalculationResult {
  const {
    attackPower,
    defenderDefense,
    isDefenderDefending,
    varianceFactor = DEFAULT_VARIANCE,
    isCritical,
    critMultiplier = DEFAULT_CRIT_MULTIPLIER,
    fatiguePenalty = 0,
    typeEffectiveness = 1.0,
  } = input;

  const baseDamage = calculateBaseDamage(attackPower, defenderDefense);
  const damageAfterVariance = applyVariance(baseDamage, varianceFactor, randomValue);
  const damageAfterCrit = applyCriticalMultiplier(damageAfterVariance, isCritical, critMultiplier);
  const damageAfterFatigue = applyFatiguePenalty(damageAfterCrit, fatiguePenalty);
  const damageAfterType = applyTypeEffectiveness(damageAfterFatigue, typeEffectiveness);
  const finalDamage = applyDefenseReduction(damageAfterType, isDefenderDefending);

  return {
    finalDamage,
    baseDamage,
    damageReduction: defenderDefense,
    varianceApplied: damageAfterVariance - baseDamage,
    critMultiplierApplied: isCritical ? critMultiplier : 1.0,
    fatiguePenaltyApplied: fatiguePenalty,
  };
}

// ============================================================================
// HIT/MISS CALCULATION
// ============================================================================

/**
 * Calculate hit chance between attacker and defender
 *
 * @param attackerAccuracy - Attacker's accuracy stat (0-100)
 * @param defenderEvasion - Defender's evasion stat (0-100)
 * @param modifiers - Additional hit chance modifiers
 * @returns Hit chance as a percentage (5-95)
 */
export function calculateHitChance(
  attackerAccuracy: number,
  defenderEvasion: number,
  modifiers: number = 0
): number {
  const rawChance = attackerAccuracy - defenderEvasion + modifiers;
  return Math.max(5, Math.min(95, rawChance));
}

/**
 * Determine if an attack hits
 *
 * @param hitChance - The hit chance (0-100)
 * @param randomValue - A value between 0 and 1
 * @returns True if the attack hits
 */
export function rollHit(
  hitChance: number,
  randomValue: number = scopedRNG('combat', 42, rngTick())
): boolean {
  return randomValue * 100 < hitChance;
}

// ============================================================================
// CRITICAL HIT CALCULATION
// ============================================================================

/**
 * Determine if an attack is a critical hit
 *
 * @param critChance - The critical hit chance (0-100)
 * @param randomValue - A value between 0 and 1
 * @returns True if the attack is a critical hit
 */
export function rollCritical(
  critChance: number,
  randomValue: number = scopedRNG('combat', 42, rngTick())
): boolean {
  return randomValue * 100 < critChance;
}
