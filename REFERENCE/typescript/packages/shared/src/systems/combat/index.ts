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
  // Status Effects
  StatusEffectType,
  StatusEffect,
  // Combat Stats
  CombatStats,
  // Combatant
  CombatantType,
  Combatant,
  // Actions
  CombatActionType,
  CombatAction,
  // Results
  CombatResult,
  // Damage
  DamageCalculationInput,
  DamageCalculationResult,
  // State
  CombatPhase,
  CombatState,
  // Rewards
  CombatLootDrop,
  CombatRewards,
  // Context
  CombatInitContext,
  // AI
  TargetSelectionStrategy,
  AIDecision,
} from './types';

export { DEFAULT_PLAYER_COMBAT_STATS } from './types';

// ============================================================================
// DAMAGE CALCULATOR EXPORTS
// ============================================================================

export {
  // Constants
  DEFAULT_VARIANCE,
  DEFAULT_CRIT_MULTIPLIER,
  MINIMUM_DAMAGE,
  DEFEND_DAMAGE_REDUCTION,
  MAX_FATIGUE_PENALTY,
  // Functions
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
  // Constants
  MAX_LOG_ENTRIES,
  BASE_FLEE_CHANCE,
  FLEE_SPEED_BONUS,
  // Initialization
  createPlayerCombatant,
  createEnemyCombatant,
  initializeCombat,
  calculateTurnOrder,
  // Turn Management
  getCurrentCombatant,
  advanceTurn,
  startNewRound,
  // Action Processing
  processAction,
  // Status Effects
  applyStatusEffects,
  // Victory/Defeat
  checkCombatEnd,
  updateCombatPhase,
  // Rewards
  calculateRewards,
  // Helpers
  getValidTargets,
  isActionValid,
} from './engine';

// ============================================================================
// AI EXPORTS
// ============================================================================

export {
  // Target Selection
  selectTarget,
  // Decision Making
  decideAction,
  getAIAction,
  // Utilities
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
  // Selectors
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

import { calculateDamage, calculateHitChance, rollCritical, rollHit } from './damage';
import { processAction, initializeCombat, getCurrentCombatant, updateCombatPhase } from './engine';
import { getAIAction } from './ai';
import type {
  CombatAction,
  CombatInitContext,
  CombatResult,
  CombatState,
  Combatant,
} from './types';
import type { CombatEncounter, EnemyDefinition } from '../../data/schemas/combat';

/**
 * Execute a full attack action with all calculations
 *
 * Convenience function that handles hit check, crit check, and damage calculation
 * in a single call.
 *
 * @param attacker - The attacking combatant
 * @param defender - The defending combatant
 * @param randomValues - Optional random values for deterministic testing
 * @returns Attack result with all details
 */
export function executeAttack(
  attacker: Combatant,
  defender: Combatant,
  randomValues?: { hitRoll?: number; critRoll?: number; damageVariance?: number }
): {
  hit: boolean;
  critical: boolean;
  damage: number;
  message: string;
} {
  const hitChance = calculateHitChance(attacker.stats.accuracy, defender.stats.evasion);
  const hit = rollHit(hitChance, randomValues?.hitRoll);

  if (!hit) {
    return {
      hit: false,
      critical: false,
      damage: 0,
      message: `${attacker.name} misses ${defender.name}!`,
    };
  }

  const critical = rollCritical(attacker.stats.critChance, randomValues?.critRoll);

  const { finalDamage } = calculateDamage(
    {
      attackPower: attacker.stats.attack,
      defenderDefense: defender.stats.defense,
      isDefenderDefending: defender.statusEffects.some((e) => e.type === 'defending'),
      isCritical: critical,
      critMultiplier: attacker.stats.critMultiplier,
    },
    randomValues?.damageVariance
  );

  let message = `${attacker.name} hits ${defender.name}`;
  if (critical) {
    message += ' with a CRITICAL HIT';
  }
  message += ` for ${finalDamage} damage!`;

  return {
    hit: true,
    critical,
    damage: finalDamage,
    message,
  };
}

/**
 * Run a complete combat turn for the AI
 *
 * Convenience function that gets AI decision and executes the action.
 *
 * @param state - Current combat state
 * @param actorId - ID of the AI-controlled combatant
 * @param randomValues - Optional random values for deterministic testing
 * @returns New state and result, or null if no action was taken
 */
export function runAITurn(
  state: CombatState,
  actorId: string,
  randomValues?: {
    targetRoll?: number;
    actionRoll?: number;
    hitRoll?: number;
    critRoll?: number;
    damageVariance?: number;
  }
): { state: CombatState; result: CombatResult } | null {
  const action = getAIAction(state, actorId, {
    targetRoll: randomValues?.targetRoll,
    actionRoll: randomValues?.actionRoll,
  });

  if (!action) {
    return null;
  }

  return processAction(state, action, {
    hitRoll: randomValues?.hitRoll,
    critRoll: randomValues?.critRoll,
    damageVariance: randomValues?.damageVariance,
  });
}

/**
 * Check if combat should end and determine the winner
 *
 * @param state - Current combat state
 * @returns 'player_wins', 'enemy_wins', or 'ongoing'
 */
export function getCombatOutcome(
  state: CombatState
): 'player_wins' | 'enemy_wins' | 'fled' | 'ongoing' {
  if (state.phase === 'victory') return 'player_wins';
  if (state.phase === 'defeat') return 'enemy_wins';
  if (state.phase === 'fled') return 'fled';
  return 'ongoing';
}

/**
 * Create a quick combat for testing or scripted sequences
 *
 * @param playerStats - Player's combat stats
 * @param enemies - Array of enemy definitions to fight
 * @param canFlee - Whether the player can flee
 * @returns Initialized combat state
 */
export function createQuickCombat(
  playerStats: Combatant['stats'],
  enemies: Array<{ definition: EnemyDefinition; count: number }>,
  canFlee: boolean = true
): CombatState {
  // Create a synthetic encounter
  const encounter: CombatEncounter = {
    id: `quick_combat_${Date.now()}`,
    name: 'Quick Combat',
    enemies: enemies.map((e) => ({ enemyId: e.definition.id, count: e.count })),
    minLevel: 1,
    isBoss: false,
    canFlee,
    rewards: {
      xp: enemies.reduce((sum, e) => sum + (e.definition.xpReward || 0) * e.count, 0),
      gold: enemies.reduce((sum, e) => sum + (e.definition.goldReward || 0) * e.count, 0),
      items: [],
    },
    tags: ['quick_combat'],
  };

  // Create enemy lookup
  const enemyMap = new Map(enemies.map((e) => [e.definition.id, e.definition]));

  const context: CombatInitContext = {
    encounterId: encounter.id,
    playerStats,
    playerName: 'Player',
    playerWeaponId: null,
  };

  return initializeCombat(encounter, context, (id) => enemyMap.get(id));
}
