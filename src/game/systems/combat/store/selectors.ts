/**
 * Combat store selectors.
 *
 * @module combat/store/selectors
 */

import type {
  CombatActionType,
  CombatPhase,
  CombatResult,
  Combatant,
} from '../types';
import type { CombatStore } from './types';

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
