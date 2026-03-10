/**
 * Iron Frontier - Combat System
 *
 * Turn-based combat system for the steampunk western RPG.
 *
 * @module combat
 *
 * @example
 * ```typescript
 * import {
 *   initializeCombat,
 *   processAction,
 *   calculateDamage,
 *   getAIAction,
 *   createCombatSlice,
 * } from '@iron-frontier/shared/systems/combat';
 *
 * // Initialize combat from an encounter
 * const combatState = initializeCombat(encounter, {
 *   encounterId: 'roadside_bandits',
 *   playerStats: playerStats,
 *   playerName: 'Marshal',
 *   playerWeaponId: 'revolver',
 * }, getEnemyById);
 *
 * // Process a player attack
 * const { state, result } = processAction(combatState, {
 *   type: 'attack',
 *   actorId: 'player',
 *   targetId: 'bandit_0',
 * });
 *
 * // Get AI decision for enemy turn
 * const aiAction = getAIAction(state, 'bandit_0');
 * ```
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  StatusEffectType,
  StatusEffect,
  CombatStats,
  CombatantType,
  Combatant,
  CombatActionType,
  CombatAction,
  CombatResult,
  DamageCalculationInput,
  DamageCalculationResult,
  CombatPhase,
  CombatState,
  CombatLootDrop,
  CombatRewards,
  CombatInitContext,
  TargetSelectionStrategy,
  AIDecision,
} from './types';

export { DEFAULT_PLAYER_COMBAT_STATS } from './types';

// ============================================================================
// DAMAGE CALCULATOR EXPORTS
// ============================================================================

export {
  DEFAULT_VARIANCE,
  DEFAULT_CRIT_MULTIPLIER,
  MINIMUM_DAMAGE,
  DEFEND_DAMAGE_REDUCTION,
  MAX_FATIGUE_PENALTY,
  calculateBaseDamage,
  applyVariance,
  applyCriticalMultiplier,
  applyDefenseReduction,
  applyFatiguePenalty,
  applyTypeEffectiveness,
  calculateDamage,
  calculateHitChance,
  rollHit,
  rollCritical,
  calculateStatusEffectDamage,
  calculateHeal,
  applyStatusEffectModifiers,
} from './damage';

// ============================================================================
// COMBAT ENGINE EXPORTS
// ============================================================================

export {
  MAX_LOG_ENTRIES,
  BASE_FLEE_CHANCE,
  FLEE_SPEED_BONUS,
  createPlayerCombatant,
  createEnemyCombatant,
  initializeCombat,
  calculateTurnOrder,
  getCurrentCombatant,
  advanceTurn,
  startNewRound,
  processAction,
  applyStatusEffects,
  checkCombatEnd,
  updateCombatPhase,
  calculateRewards,
  getValidTargets,
  isActionValid,
} from './engine';

// ============================================================================
// AI EXPORTS
// ============================================================================

export {
  selectTarget,
  decideAction,
  getAIAction,
  shouldUseItem,
  evaluateSituation,
} from './ai';

// ============================================================================
// STORE EXPORTS
// ============================================================================

export type {
  CombatStoreState,
  CombatStoreActions,
  CombatStore,
  CombatDataAccess,
} from './store';

export {
  createCombatSlice,
  selectCombatPhase,
  selectIsCombatActive,
  selectCurrentRound,
  selectSelectedAction,
  selectSelectedTarget,
  selectAllCombatants,
  selectTurnOrder,
  selectCanFlee,
  selectIsBossFight,
  selectLatestLogEntry,
  selectPlayerHPPercentage,
  selectEnemyHPPercentages,
} from './store';

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export {
  executeAttack,
  runAITurn,
  getCombatOutcome,
  createQuickCombat,
} from './convenience';
