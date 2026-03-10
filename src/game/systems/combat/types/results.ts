/**
 * Combat Results, Damage, State, and AI Types
 */

import type { CombatAction, CombatActionType, Combatant } from './combatant.ts';
import type { CombatStats, StatusEffect } from './stats.ts';

// ============================================================================
// COMBAT RESULTS
// ============================================================================

/**
 * Result of executing a combat action
 */
export interface CombatResult {
  /** The action that was executed */
  action: CombatAction;
  /** Did the action succeed? */
  success: boolean;
  /** Damage dealt (if attack) */
  damage?: number;
  /** Was it a critical hit? */
  isCritical?: boolean;
  /** Was the attack dodged? */
  wasDodged?: boolean;
  /** Was the attack blocked/defended? */
  wasBlocked?: boolean;
  /** Status effect applied (if any) */
  statusEffectApplied?: StatusEffect;
  /** HP healed (if item/skill) */
  healAmount?: number;
  /** Did the target die? */
  targetKilled?: boolean;
  /** Did the flee attempt succeed? */
  fleeSuccess?: boolean;
  /** Human-readable message describing the result */
  message: string;
  /** Timestamp of the result */
  timestamp: number;
}

// ============================================================================
// DAMAGE CALCULATION
// ============================================================================

/**
 * Input for damage calculation
 */
export interface DamageCalculationInput {
  /** Base attack power of the attacker */
  attackPower: number;
  /** Defense of the defender */
  defenderDefense: number;
  /** Is the defender in defensive stance? */
  isDefenderDefending: boolean;
  /** Variance factor (typically 0.1 for +/-10%) */
  varianceFactor?: number;
  /** Is this a critical hit? */
  isCritical: boolean;
  /** Critical multiplier (default 1.5) */
  critMultiplier?: number;
  /** Fatigue penalty (0-1, where 1 is fully fatigued) */
  fatiguePenalty?: number;
  /** Elemental/type effectiveness multiplier */
  typeEffectiveness?: number;
}

/**
 * Output from damage calculation
 */
export interface DamageCalculationResult {
  /** Final damage to apply */
  finalDamage: number;
  /** Base damage before modifiers */
  baseDamage: number;
  /** Damage reduced by defense */
  damageReduction: number;
  /** Variance applied */
  varianceApplied: number;
  /** Critical multiplier applied */
  critMultiplierApplied: number;
  /** Fatigue penalty applied */
  fatiguePenaltyApplied: number;
}

// ============================================================================
// COMBAT STATE
// ============================================================================

/**
 * Phase of combat
 */
export type CombatPhase =
  | 'initializing' // Setting up combat
  | 'player_turn' // Player's turn to act
  | 'enemy_turn' // Enemy's turn to act
  | 'ally_turn' // Ally's turn to act
  | 'processing' // Processing an action
  | 'victory' // Player won
  | 'defeat' // Player lost
  | 'fled'; // Player escaped

/**
 * Complete state of an ongoing combat
 */
export interface CombatState {
  /** Unique identifier for this combat instance */
  id: string;
  /** Reference to the encounter definition */
  encounterId: string;
  /** Current phase of combat */
  phase: CombatPhase;
  /** All combatants in this fight */
  combatants: Combatant[];
  /** Turn order (combatant IDs sorted by speed) */
  turnOrder: string[];
  /** Index of the current turn in turnOrder */
  currentTurnIndex: number;
  /** Current round number (starts at 1) */
  round: number;
  /** Combat log (last N results) */
  log: CombatResult[];
  /** Maximum log entries to keep */
  maxLogEntries: number;
  /** When combat started */
  startedAt: number;
  /** Currently selected action (for UI) */
  selectedAction?: CombatActionType;
  /** Currently selected target (for UI) */
  selectedTargetId?: string;
  /** Can the player flee from this combat? */
  canFlee: boolean;
  /** Is this a boss fight? */
  isBoss: boolean;
}

// ============================================================================
// COMBAT REWARDS
// ============================================================================

/**
 * Item drop from combat
 */
export interface CombatLootDrop {
  /** Item ID */
  itemId: string;
  /** Quantity dropped */
  quantity: number;
}

/**
 * Rewards earned from winning combat
 */
export interface CombatRewards {
  /** Experience points earned */
  xp: number;
  /** Gold earned */
  gold: number;
  /** Items dropped */
  loot: CombatLootDrop[];
}

// ============================================================================
// COMBAT ENCOUNTER CONTEXT
// ============================================================================

/**
 * Context for initializing combat
 */
export interface CombatInitContext {
  /** Encounter ID to start */
  encounterId: string;
  /** Player's current stats */
  playerStats: CombatStats;
  /** Player's name */
  playerName: string;
  /** Player's equipped weapon ID */
  playerWeaponId: string | null;
  /** Player's current fatigue (0-100) */
  playerFatigue?: number;
  /** Allies joining the fight */
  allies?: Combatant[];
}

// ============================================================================
// AI TYPES
// ============================================================================

/**
 * Target selection strategy for AI
 */
export type TargetSelectionStrategy =
  | 'lowest_hp' // Target the combatant with lowest HP
  | 'highest_threat' // Target the combatant dealing most damage
  | 'random' // Random target
  | 'player_first'; // Always target player if possible

/**
 * AI decision result
 */
export interface AIDecision {
  /** Action to take */
  action: CombatAction;
  /** Priority/weight of this decision */
  priority: number;
  /** Reasoning for this decision */
  reasoning: string;
}
