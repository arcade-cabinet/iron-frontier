/**
 * Iron Frontier - Combat Store
 *
 * Zustand store slice for managing combat state.
 * Designed to be integrated with the main game store.
 */

import type { StateCreator } from 'zustand';
import type { CombatEncounter, EnemyDefinition } from '../../data/schemas/combat';
import { getAIAction } from './ai';
import {
  initializeCombat,
  processAction,
  advanceTurn,
  updateCombatPhase,
  calculateRewards,
  getCurrentCombatant,
  getValidTargets,
  isActionValid,
  applyStatusEffects,
  startNewRound,
} from './engine';
import type {
  CombatAction,
  CombatActionType,
  CombatInitContext,
  CombatPhase,
  CombatResult,
  CombatRewards,
  CombatState,
  CombatStats,
  Combatant,
} from './types';

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

// ============================================================================
// STORE CREATOR
// ============================================================================

/**
 * Create the combat store slice
 *
 * @param dataAccess - Data access functions for encounters and enemies
 * @param onCombatEnd - Callback when combat ends (for integration with main store)
 */
export function createCombatSlice(
  dataAccess: CombatDataAccess,
  onCombatEnd?: (result: CombatPhase, rewards?: CombatRewards) => void
): StateCreator<CombatStore> {
  return (set, get) => ({
    // Initial state
    combatState: null,

    // Actions
    startCombat: (context: CombatInitContext) => {
      const encounter = dataAccess.getEncounterById(context.encounterId);
      if (!encounter) {
        console.error(`Encounter not found: ${context.encounterId}`);
        return;
      }

      const state = initializeCombat(encounter, context, dataAccess.getEnemyById);

      // Set initial phase based on first combatant
      const firstCombatant = state.combatants.find((c) => c.id === state.turnOrder[0]);
      const initialPhase: CombatPhase = firstCombatant?.isPlayer ? 'player_turn' : 'enemy_turn';

      set({
        combatState: {
          ...state,
          phase: initialPhase,
        },
      });
    },

    selectAction: (action: CombatActionType) => {
      const { combatState } = get();
      if (!combatState) return;

      set({
        combatState: {
          ...combatState,
          selectedAction: action,
        },
      });
    },

    selectTarget: (targetId: string) => {
      const { combatState } = get();
      if (!combatState) return;

      set({
        combatState: {
          ...combatState,
          selectedTargetId: targetId,
        },
      });
    },

    executeAction: (): CombatResult | null => {
      const { combatState } = get();
      if (!combatState || !combatState.selectedAction) {
        return null;
      }

      const currentCombatant = getCurrentCombatant(combatState);
      if (!currentCombatant) return null;

      const action: CombatAction = {
        type: combatState.selectedAction,
        actorId: currentCombatant.id,
        targetId: combatState.selectedTargetId,
      };

      // Validate action
      const validation = isActionValid(combatState, action, currentCombatant);
      if (!validation.valid) {
        console.warn(`Invalid action: ${validation.reason}`);
        return null;
      }

      // Process action
      const { state: newState, result } = processAction(combatState, action);

      // Check for combat end
      const finalState = updateCombatPhase(newState);

      set({ combatState: finalState });

      // Handle combat end
      if (finalState.phase === 'victory' || finalState.phase === 'defeat') {
        const rewards =
          finalState.phase === 'victory'
            ? calculateRewards(finalState, dataAccess.getEncounterById(finalState.encounterId)!)
            : null;

        if (onCombatEnd) {
          onCombatEnd(finalState.phase, rewards ?? undefined);
        }
      }

      return result;
    },

    endTurn: () => {
      const { combatState } = get();
      if (!combatState) return;

      // Apply status effects at turn end
      const { combatants: updatedCombatants } = applyStatusEffects(combatState.combatants);

      // Advance to next turn
      let newState = advanceTurn({
        ...combatState,
        combatants: updatedCombatants,
      });

      // Check if starting a new round
      if (newState.currentTurnIndex === 0 && newState.round > combatState.round) {
        newState = startNewRound(newState);
      }

      // Check for combat end
      const finalState = updateCombatPhase(newState);

      set({ combatState: finalState });

      // Trigger AI turn if needed
      if (finalState.phase === 'enemy_turn' || finalState.phase === 'ally_turn') {
        // Use setTimeout to allow state to update before AI processes
        setTimeout(() => get().processAITurn(), 500);
      }
    },

    attemptFlee: (): CombatResult | null => {
      const { combatState } = get();
      if (!combatState) return null;

      const currentCombatant = getCurrentCombatant(combatState);
      if (!currentCombatant || !currentCombatant.isPlayer) return null;

      const action: CombatAction = {
        type: 'flee',
        actorId: currentCombatant.id,
      };

      const { state: newState, result } = processAction(combatState, action);

      set({ combatState: newState });

      if (result.fleeSuccess && onCombatEnd) {
        onCombatEnd('fled');
      }

      return result;
    },

    endCombat: (): CombatRewards | null => {
      const { combatState } = get();
      if (!combatState) return null;

      let rewards: CombatRewards | null = null;

      if (combatState.phase === 'victory') {
        const encounter = dataAccess.getEncounterById(combatState.encounterId);
        if (encounter) {
          rewards = calculateRewards(combatState, encounter);
        }
      }

      set({ combatState: null });

      return rewards;
    },

    getCurrentCombatant: (): Combatant | null => {
      const { combatState } = get();
      if (!combatState) return null;
      return getCurrentCombatant(combatState) || null;
    },

    getValidTargets: (): Combatant[] => {
      const { combatState } = get();
      if (!combatState) return [];

      const currentCombatant = getCurrentCombatant(combatState);
      if (!currentCombatant) return [];

      return getValidTargets(combatState, currentCombatant.id);
    },

    processAITurn: () => {
      const { combatState } = get();
      if (!combatState) return;

      const currentCombatant = getCurrentCombatant(combatState);
      if (!currentCombatant || currentCombatant.isPlayer) return;

      // Get AI decision
      const action = getAIAction(combatState, currentCombatant.id);
      if (!action) {
        get().endTurn();
        return;
      }

      // Set the action and target
      set({
        combatState: {
          ...combatState,
          selectedAction: action.type,
          selectedTargetId: action.targetId,
        },
      });

      // Execute after a short delay for visual feedback
      setTimeout(() => {
        get().executeAction();

        // End turn after action
        setTimeout(() => {
          const currentState = get().combatState;
          if (
            currentState &&
            (currentState.phase === 'enemy_turn' || currentState.phase === 'ally_turn')
          ) {
            get().endTurn();
          }
        }, 500);
      }, 500);
    },

    isPlayerTurn: (): boolean => {
      const { combatState } = get();
      if (!combatState) return false;
      return combatState.phase === 'player_turn';
    },

    getCombatLog: (): CombatResult[] => {
      const { combatState } = get();
      if (!combatState) return [];
      return combatState.log;
    },

    getLivingEnemies: (): Combatant[] => {
      const { combatState } = get();
      if (!combatState) return [];
      return combatState.combatants.filter((c) => c.type === 'enemy' && c.isAlive);
    },

    getPlayerCombatant: (): Combatant | null => {
      const { combatState } = get();
      if (!combatState) return null;
      return combatState.combatants.find((c) => c.isPlayer) || null;
    },
  });
}

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Selector: Get combat phase
 */
export function selectCombatPhase(state: CombatStore): CombatPhase | null {
  return state.combatState?.phase ?? null;
}

/**
 * Selector: Is combat active
 */
export function selectIsCombatActive(state: CombatStore): boolean {
  const phase = state.combatState?.phase;
  return (
    phase !== null &&
    phase !== undefined &&
    phase !== 'victory' &&
    phase !== 'defeat' &&
    phase !== 'fled'
  );
}

/**
 * Selector: Get current round
 */
export function selectCurrentRound(state: CombatStore): number {
  return state.combatState?.round ?? 0;
}

/**
 * Selector: Get selected action
 */
export function selectSelectedAction(state: CombatStore): CombatActionType | undefined {
  return state.combatState?.selectedAction;
}

/**
 * Selector: Get selected target
 */
export function selectSelectedTarget(state: CombatStore): Combatant | undefined {
  const targetId = state.combatState?.selectedTargetId;
  if (!targetId) return undefined;
  return state.combatState?.combatants.find((c) => c.id === targetId);
}

/**
 * Selector: Get all combatants
 */
export function selectAllCombatants(state: CombatStore): Combatant[] {
  return state.combatState?.combatants ?? [];
}

/**
 * Selector: Get turn order
 */
export function selectTurnOrder(state: CombatStore): string[] {
  return state.combatState?.turnOrder ?? [];
}

/**
 * Selector: Can flee
 */
export function selectCanFlee(state: CombatStore): boolean {
  return state.combatState?.canFlee ?? false;
}

/**
 * Selector: Is boss fight
 */
export function selectIsBossFight(state: CombatStore): boolean {
  return state.combatState?.isBoss ?? false;
}

/**
 * Selector: Get latest log entry
 */
export function selectLatestLogEntry(state: CombatStore): CombatResult | null {
  const log = state.combatState?.log;
  if (!log || log.length === 0) return null;
  return log[log.length - 1];
}

/**
 * Selector: Get player HP percentage
 */
export function selectPlayerHPPercentage(state: CombatStore): number {
  const player = state.combatState?.combatants.find((c) => c.isPlayer);
  if (!player) return 0;
  return (player.stats.hp / player.stats.maxHP) * 100;
}

/**
 * Selector: Get enemy HP percentages
 */
export function selectEnemyHPPercentages(state: CombatStore): Map<string, number> {
  const map = new Map<string, number>();
  const enemies = state.combatState?.combatants.filter((c) => c.type === 'enemy') ?? [];

  for (const enemy of enemies) {
    map.set(enemy.id, (enemy.stats.hp / enemy.stats.maxHP) * 100);
  }

  return map;
}
