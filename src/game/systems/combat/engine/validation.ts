import type {
  Combatant,
  CombatAction,
  CombatState,
} from '../types';

export function getValidTargets(state: CombatState, actorId: string): Combatant[] {
  const actor = state.combatants.find((c) => c.id === actorId);
  if (!actor) return [];

  // For attacks, target enemies if actor is player/ally, or player/allies if actor is enemy
  if (actor.type === 'enemy') {
    return state.combatants.filter((c) => (c.isPlayer || c.type === 'ally') && c.isAlive);
  }

  return state.combatants.filter((c) => c.type === 'enemy' && c.isAlive);
}

export function isActionValid(
  state: CombatState,
  action: CombatAction,
  actor: Combatant
): { valid: boolean; reason?: string } {
  if (!actor.isAlive) {
    return { valid: false, reason: 'Actor is dead' };
  }

  if (actor.hasActedThisTurn) {
    return { valid: false, reason: 'Actor has already acted this turn' };
  }

  if (action.type === 'attack' && !action.targetId) {
    return { valid: false, reason: 'Attack requires a target' };
  }

  if (action.type === 'item' && !action.itemId) {
    return { valid: false, reason: 'Item use requires an item' };
  }

  if (action.type === 'flee' && !state.canFlee) {
    return { valid: false, reason: 'Cannot flee from this battle' };
  }

  // Check if actor is stunned
  if (actor.statusEffects.some((e) => e.type === 'stunned')) {
    return { valid: false, reason: 'Actor is stunned' };
  }

  return { valid: true };
}
