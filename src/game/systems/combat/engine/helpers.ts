import type { CombatAction, CombatResult, CombatState } from '../types';

export const MAX_LOG_ENTRIES = 50;
export const BASE_FLEE_CHANCE = 40;
export const FLEE_SPEED_BONUS = 2;

export function generateCombatantId(prefix: string, index: number): string {
  return `${prefix}_${index}_${Date.now()}`;
}

export function createFailureResult(action: CombatAction, message: string): CombatResult {
  return {
    action,
    success: false,
    message,
    timestamp: Date.now(),
  };
}

export function markActorActed(state: CombatState, actorId: string, result: CombatResult): CombatState {
  const updatedCombatants = state.combatants.map((c) => {
    if (c.id === actorId) {
      return { ...c, hasActedThisTurn: true };
    }
    return c;
  });

  const newLog = [...state.log, result].slice(-state.maxLogEntries);

  return {
    ...state,
    combatants: updatedCombatants,
    log: newLog,
  };
}
