/**
 * Combat status effect calculations
 *
 * Pure functions for calculating status effect damage and stat modifiers.
 */

import type { CombatStats, StatusEffect } from './types';
import { MINIMUM_DAMAGE } from './damage';

// ============================================================================
// STATUS EFFECT DAMAGE
// ============================================================================

/**
 * Calculate damage from a status effect (DoT)
 *
 * @param effect - The status effect
 * @param maxHP - The target's maximum HP (for percentage-based effects)
 * @returns Damage to apply
 */
export function calculateStatusEffectDamage(effect: StatusEffect, maxHP: number): number {
  switch (effect.type) {
    case 'poisoned':
      // Poison deals flat damage based on effect value
      return effect.value;

    case 'burning':
      // Burning deals higher flat damage
      return Math.floor(effect.value * 1.5);

    case 'bleeding':
      // Bleeding deals percentage of max HP
      return Math.max(MINIMUM_DAMAGE, Math.floor(maxHP * (effect.value / 100)));

    default:
      return 0;
  }
}

// ============================================================================
// HEAL CALCULATION
// ============================================================================

/**
 * Calculate healing amount (capped at max HP)
 *
 * @param currentHP - Current HP
 * @param maxHP - Maximum HP
 * @param healAmount - Base heal amount
 * @returns Actual HP to heal (won't exceed max)
 */
export function calculateHeal(currentHP: number, maxHP: number, healAmount: number): number {
  const maxHeal = maxHP - currentHP;
  return Math.max(0, Math.min(maxHeal, healAmount));
}

// ============================================================================
// STAT MODIFIERS FROM EFFECTS
// ============================================================================

/**
 * Calculate stat modifiers from active status effects
 *
 * @param baseStats - The combatant's base stats
 * @param effects - Active status effects
 * @returns Modified stats
 */
export function applyStatusEffectModifiers(
  baseStats: CombatStats,
  effects: StatusEffect[]
): CombatStats {
  const modifiedStats = { ...baseStats };

  for (const effect of effects) {
    switch (effect.type) {
      case 'buffed':
        // Buff increases attack and defense by the effect value percentage
        modifiedStats.attack = Math.floor(modifiedStats.attack * (1 + effect.value / 100));
        modifiedStats.defense = Math.floor(modifiedStats.defense * (1 + effect.value / 100));
        break;

      case 'debuffed':
        // Debuff decreases attack and accuracy
        modifiedStats.attack = Math.floor(modifiedStats.attack * (1 - effect.value / 100));
        modifiedStats.accuracy = Math.floor(modifiedStats.accuracy * (1 - effect.value / 100));
        break;

      case 'stunned':
        // Stunned reduces speed to 0 (skip turn)
        modifiedStats.speed = 0;
        break;

      case 'defending':
        // Defending increases defense temporarily
        modifiedStats.defense = Math.floor(modifiedStats.defense * 1.5);
        break;
    }
  }

  return modifiedStats;
}
