/**
 * Combat Formulas, AP Costs, and Validation
 */

import { scopedRNG, rngTick } from '../../../lib/prng.ts';
import type { CombatActionType, CombatEncounter, CombatState, EnemyDefinition } from './schemas.ts';
import { CombatEncounterSchema, CombatStateSchema, EnemyDefinitionSchema } from './schemas.ts';

// ============================================================================
// ACTION POINT COSTS
// ============================================================================

export const AP_COSTS: Record<CombatActionType, number> = {
  attack: 2,
  aimed_shot: 4,
  move: 1,
  reload: 2,
  use_item: 2,
  defend: 2,
  flee: 3,
  end_turn: 0,
  quick_draw: 1,
  overwatch: 2,
  first_aid: 3,
  intimidate: 2,
};

// ============================================================================
// COMBAT FORMULAS
// ============================================================================

export function calculateHitChance(
  attackerAccuracy: number,
  defenderEvasion: number,
  range: number,
  isAimedShot: boolean = false
): number {
  let hitChance = attackerAccuracy;

  if (isAimedShot) {
    hitChance += 25;
  }

  const rangePenalty = Math.max(0, (range - 3) * 5);
  hitChance -= rangePenalty;
  hitChance -= defenderEvasion;

  return Math.max(5, Math.min(95, hitChance));
}

export function calculateDamage(
  baseDamage: number,
  attackerLevel: number,
  defenderArmor: number,
  isCritical: boolean = false
): number {
  let damage = baseDamage + Math.floor(attackerLevel / 2);

  if (isCritical) {
    damage *= 2;
  }

  damage = Math.max(1, damage - defenderArmor);

  return damage;
}

export function rollCritical(): boolean {
  return scopedRNG('combat', 42, rngTick()) < 0.1;
}

export function rollHit(hitChance: number): boolean {
  return scopedRNG('combat', 42, rngTick()) * 100 < hitChance;
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateEnemyDefinition(data: unknown): EnemyDefinition {
  return EnemyDefinitionSchema.parse(data);
}

export function validateCombatEncounter(data: unknown): CombatEncounter {
  return CombatEncounterSchema.parse(data);
}

export function validateCombatState(data: unknown): CombatState {
  return CombatStateSchema.parse(data);
}

export const COMBAT_SCHEMA_VERSION = '1.0.0';
