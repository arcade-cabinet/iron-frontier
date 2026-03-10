import type {
  Combatant,
  CombatPhase,
  CombatState,
} from '../types';
import { calculateTurnOrder } from './init';
import { applyStatusEffects } from './effects';

export function getCurrentCombatant(state: CombatState): Combatant | undefined {
  const currentId = state.turnOrder[state.currentTurnIndex];
  return state.combatants.find((c) => c.id === currentId);
}

export function advanceTurn(state: CombatState): CombatState {
  // Find next alive combatant
  let nextIndex = (state.currentTurnIndex + 1) % state.turnOrder.length;
  let round = state.round;
  let loopCount = 0;

  // Skip dead combatants
  while (loopCount < state.turnOrder.length) {
    const combatantId = state.turnOrder[nextIndex];
    const combatant = state.combatants.find((c) => c.id === combatantId);

    if (combatant && combatant.isAlive) {
      break;
    }

    nextIndex = (nextIndex + 1) % state.turnOrder.length;
    loopCount++;
  }

  // Check if we wrapped around (new round)
  if (nextIndex <= state.currentTurnIndex || loopCount >= state.turnOrder.length) {
    round++;
  }

  // Reset hasActedThisTurn for the new combatant
  const updatedCombatants = state.combatants.map((c) => {
    if (c.id === state.turnOrder[nextIndex]) {
      return { ...c, hasActedThisTurn: false };
    }
    return c;
  });

  // Determine new phase
  const nextCombatant = updatedCombatants.find((c) => c.id === state.turnOrder[nextIndex]);
  let phase: CombatPhase = 'enemy_turn';
  if (nextCombatant) {
    if (nextCombatant.isPlayer) {
      phase = 'player_turn';
    } else if (nextCombatant.type === 'ally') {
      phase = 'ally_turn';
    }
  }

  return {
    ...state,
    currentTurnIndex: nextIndex,
    round,
    phase,
    combatants: updatedCombatants,
    selectedAction: undefined,
    selectedTargetId: undefined,
  };
}

export function startNewRound(state: CombatState): CombatState {
  // Recalculate turn order (in case speeds changed)
  const newTurnOrder = calculateTurnOrder(state.combatants);

  // Apply status effects at start of round
  const { combatants: updatedCombatants, results } = applyStatusEffects(state.combatants);

  // Add results to log
  const newLog = [...state.log, ...results].slice(-state.maxLogEntries);

  return {
    ...state,
    turnOrder: newTurnOrder,
    currentTurnIndex: 0,
    combatants: updatedCombatants,
    log: newLog,
  };
}
