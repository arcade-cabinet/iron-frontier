/**
 * Combat store types and interfaces.
 *
 * @module combat/store/types
 */

import type { CombatEncounter, EnemyDefinition } from '../../../data/schemas/combat';
import type {
  CombatActionType,
  CombatInitContext,
  CombatPhase,
  CombatResult,
  CombatRewards,
  CombatState,
  Combatant,
} from '../types';

// ============================================================================
// COMBAT STORE STATE
// ============================================================================

/**
 * Combat state slice data
 */
export interface CombatStoreState {
  /** Current combat state, or null if not in combat */
  combatState: CombatState | null;
}

/**
 * Combat store actions
 */
export interface CombatStoreActions {
  /** Start a new combat encounter */
  startCombat: (context: CombatInitContext) => void;

  /** Select an action for the current turn */
  selectAction: (action: CombatActionType) => void;

  /** Select a target for the current action */
  selectTarget: (targetId: string) => void;

  /** Execute the selected action */
  executeAction: () => CombatResult | null;

  /** End the current combatant's turn */
  endTurn: () => void;

  /** Attempt to flee from combat */
  attemptFlee: () => CombatResult | null;

  /** End combat and return rewards (if victorious) */
  endCombat: () => CombatRewards | null;

  /** Get the current active combatant */
  getCurrentCombatant: () => Combatant | null;

  /** Get valid targets for the current action */
  getValidTargets: () => Combatant[];

  /** Process AI turn */
  processAITurn: () => void;

  /** Check if it's the player's turn */
  isPlayerTurn: () => boolean;

  /** Get combat log */
  getCombatLog: () => CombatResult[];

  /** Get all living enemies */
  getLivingEnemies: () => Combatant[];

  /** Get the player combatant */
  getPlayerCombatant: () => Combatant | null;
}

/**
 * Combined combat store type
 */
export type CombatStore = CombatStoreState & CombatStoreActions;

// ============================================================================
// DATA ACCESS INTERFACE
// ============================================================================

/**
 * Data access functions needed by the combat store
 */
export interface CombatDataAccess {
  getEncounterById: (id: string) => CombatEncounter | undefined;
  getEnemyById: (id: string) => EnemyDefinition | undefined;
}
