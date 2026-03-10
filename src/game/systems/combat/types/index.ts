/**
 * Combat Types - Barrel export
 */

export type { CombatStats, StatusEffect, StatusEffectType } from './stats.ts';
export { DEFAULT_PLAYER_COMBAT_STATS } from './stats.ts';

export type {
  CombatAction,
  CombatActionType,
  Combatant,
  CombatantType,
} from './combatant.ts';

export type {
  AIDecision,
  CombatInitContext,
  CombatLootDrop,
  CombatPhase,
  CombatResult,
  CombatRewards,
  CombatState,
  DamageCalculationInput,
  DamageCalculationResult,
  TargetSelectionStrategy,
} from './results.ts';
