/**
 * Combat store slice creator with all action implementations.
 *
 * @module combat/store/actions
 */

import type { StateCreator } from 'zustand';
import { getAIAction } from '../ai';
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
} from '../engine';
import type {
  CombatAction,
  CombatInitContext,
  CombatPhase,
  CombatResult,
  CombatRewards,
} from '../types';
import type { CombatStore, CombatDataAccess } from './types';

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

    selectAction: (action) => {
      const { combatState } = get();
      if (!combatState) return;

      set({
        combatState: {
          ...combatState,
          selectedAction: action,
        },
      });
    },

    selectTarget: (targetId) => {
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

    getCurrentCombatant: () => {
      const { combatState } = get();
      if (!combatState) return null;
      return getCurrentCombatant(combatState) || null;
    },

    getValidTargets: () => {
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

    getLivingEnemies: () => {
      const { combatState } = get();
      if (!combatState) return [];
      return combatState.combatants.filter((c) => c.type === 'enemy' && c.isAlive);
    },

    getPlayerCombatant: () => {
      const { combatState } = get();
      if (!combatState) return null;
      return combatState.combatants.find((c) => c.isPlayer) || null;
    },
  });
}
