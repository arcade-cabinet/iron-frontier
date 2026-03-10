import type {
  Combatant,
  CombatAction,
  CombatResult,
  CombatState,
  StatusEffect,
} from '../types';
import {
  applyStatusEffectModifiers,
} from '../damage';
import { scopedRNG, rngTick } from '../../../lib/prng';
import { createFailureResult, markActorActed, BASE_FLEE_CHANCE, FLEE_SPEED_BONUS } from './helpers';
import { processAttack } from './attack';
import { processSkill } from './skills';

export function processAction(
  state: CombatState,
  action: CombatAction,
  randomValues?: { hitRoll?: number; critRoll?: number; damageVariance?: number }
): { state: CombatState; result: CombatResult } {
  const actor = state.combatants.find((c) => c.id === action.actorId);
  if (!actor || !actor.isAlive) {
    return {
      state,
      result: createFailureResult(action, 'Actor is not available'),
    };
  }

  switch (action.type) {
    case 'attack':
      return processAttack(state, action, actor, randomValues);
    case 'defend':
      return processDefend(state, action, actor);
    case 'item':
      return processItem(state, action, actor);
    case 'flee':
      return processFlee(state, action, actor, randomValues?.hitRoll);
    case 'skill':
      return processSkill(state, action, actor, randomValues);
    default:
      return {
        state,
        result: createFailureResult(action, 'Unknown action type'),
      };
  }
}

function processDefend(
  state: CombatState,
  action: CombatAction,
  actor: Combatant
): { state: CombatState; result: CombatResult } {
  // Add defending status effect
  const defendEffect: StatusEffect = {
    type: 'defending',
    turnsRemaining: 1,
    value: 50, // 50% damage reduction
  };

  const updatedCombatants = state.combatants.map((c) => {
    if (c.id === actor.id) {
      return {
        ...c,
        statusEffects: [...c.statusEffects, defendEffect],
        hasActedThisTurn: true,
      };
    }
    return c;
  });

  const result: CombatResult = {
    action,
    success: true,
    statusEffectApplied: defendEffect,
    message: `${actor.name} takes a defensive stance!`,
    timestamp: Date.now(),
  };

  const newLog = [...state.log, result].slice(-state.maxLogEntries);

  return {
    state: {
      ...state,
      combatants: updatedCombatants,
      log: newLog,
    },
    result,
  };
}

function processItem(
  state: CombatState,
  action: CombatAction,
  actor: Combatant
): { state: CombatState; result: CombatResult } {
  if (!action.itemId) {
    return { state, result: createFailureResult(action, 'No item specified') };
  }

  // For now, assume all items are healing potions
  // In a full implementation, this would look up the item effect
  const healAmount = 30; // Placeholder

  const newHP = Math.min(actor.stats.maxHP, actor.stats.hp + healAmount);
  const actualHeal = newHP - actor.stats.hp;

  const updatedCombatants = state.combatants.map((c) => {
    if (c.id === actor.id) {
      return {
        ...c,
        stats: { ...c.stats, hp: newHP },
        hasActedThisTurn: true,
      };
    }
    return c;
  });

  const result: CombatResult = {
    action,
    success: true,
    healAmount: actualHeal,
    message: `${actor.name} uses an item and recovers ${actualHeal} HP!`,
    timestamp: Date.now(),
  };

  const newLog = [...state.log, result].slice(-state.maxLogEntries);

  return {
    state: {
      ...state,
      combatants: updatedCombatants,
      log: newLog,
    },
    result,
  };
}

function processFlee(
  state: CombatState,
  action: CombatAction,
  actor: Combatant,
  randomValue?: number
): { state: CombatState; result: CombatResult } {
  if (!state.canFlee) {
    return {
      state,
      result: createFailureResult(action, 'Cannot flee from this battle!'),
    };
  }

  // Calculate flee chance based on speed comparison
  const actorStats = applyStatusEffectModifiers(actor.stats, actor.statusEffects);
  const enemies = state.combatants.filter((c) => c.type === 'enemy' && c.isAlive);
  const avgEnemySpeed =
    enemies.length > 0
      ? enemies.reduce((sum, e) => sum + e.stats.speed, 0) / enemies.length
      : actorStats.speed;

  const speedDiff = actorStats.speed - avgEnemySpeed;
  const fleeChance = BASE_FLEE_CHANCE + speedDiff * FLEE_SPEED_BONUS;
  const clampedFleeChance = Math.max(10, Math.min(90, fleeChance));

  const roll = randomValue ?? scopedRNG('combat', 42, rngTick());
  const fleeSuccess = roll * 100 < clampedFleeChance;

  if (fleeSuccess) {
    const result: CombatResult = {
      action,
      success: true,
      fleeSuccess: true,
      message: `${actor.name} successfully escapes!`,
      timestamp: Date.now(),
    };

    const newLog = [...state.log, result].slice(-state.maxLogEntries);

    return {
      state: {
        ...state,
        phase: 'fled',
        log: newLog,
      },
      result,
    };
  }

  // Failed to flee
  const result: CombatResult = {
    action,
    success: false,
    fleeSuccess: false,
    message: `${actor.name} failed to escape!`,
    timestamp: Date.now(),
  };

  return {
    state: markActorActed(state, actor.id, result),
    result,
  };
}
