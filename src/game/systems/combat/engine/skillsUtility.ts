import type {
  Combatant,
  CombatAction,
  CombatResult,
  CombatState,
  StatusEffect,
} from '../types';
import {
  calculateHeal,
  applyStatusEffectModifiers,
} from '../damage';
import { scopedRNG, rngTick } from '../../../lib/prng';
import { createFailureResult, markActorActed } from './helpers';

export function processOverwatch(
  state: CombatState,
  action: CombatAction,
  actor: Combatant
): { state: CombatState; result: CombatResult } {
  const overwatchEffect: StatusEffect = {
    type: 'buffed',
    turnsRemaining: 2, // Lasts until next round
    value: 0, // No stat buff, used as a marker
    sourceId: 'overwatch',
  };

  const updatedCombatants = state.combatants.map((c) => {
    if (c.id === actor.id) {
      return {
        ...c,
        statusEffects: [...c.statusEffects, overwatchEffect],
        hasActedThisTurn: true,
      };
    }
    return c;
  });

  const result: CombatResult = {
    action,
    success: true,
    statusEffectApplied: overwatchEffect,
    message: `${actor.name} sets up overwatch, ready to fire on the next enemy that acts!`,
    timestamp: Date.now(),
  };

  return {
    state: { ...state, combatants: updatedCombatants, log: [...state.log, result].slice(-state.maxLogEntries) },
    result,
  };
}

export function processFirstAid(
  state: CombatState,
  action: CombatAction,
  actor: Combatant
): { state: CombatState; result: CombatResult } {
  // Base heal: 30% of max HP
  const baseHeal = Math.floor(actor.stats.maxHP * 0.3);
  const actualHeal = calculateHeal(actor.stats.hp, actor.stats.maxHP, baseHeal);
  const newHP = actor.stats.hp + actualHeal;

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
    message: actualHeal > 0
      ? `${actor.name} applies first aid and recovers ${actualHeal} HP!`
      : `${actor.name} applies first aid but is already at full health.`,
    timestamp: Date.now(),
  };

  return {
    state: { ...state, combatants: updatedCombatants, log: [...state.log, result].slice(-state.maxLogEntries) },
    result,
  };
}

export function processIntimidate(
  state: CombatState,
  action: CombatAction,
  actor: Combatant,
  randomValue?: number
): { state: CombatState; result: CombatResult } {
  if (!action.targetId) {
    return { state, result: createFailureResult(action, 'No target specified') };
  }

  const target = state.combatants.find((c) => c.id === action.targetId);
  if (!target || !target.isAlive) {
    return { state, result: createFailureResult(action, 'Target is not available') };
  }

  // Intimidation chance: base 40%, modified by attack difference
  const actorStats = applyStatusEffectModifiers(actor.stats, actor.statusEffects);
  const targetStats = applyStatusEffectModifiers(target.stats, target.statusEffects);
  const attackDiff = actorStats.attack - targetStats.attack;
  const baseChance = 40 + attackDiff * 2;
  const clampedChance = Math.max(10, Math.min(80, baseChance));

  const roll = randomValue ?? scopedRNG('combat', 42, rngTick());
  const success = roll * 100 < clampedChance;

  if (success) {
    // Apply debuff: reduce target attack and accuracy by 30% for 2 turns
    const intimidateEffect: StatusEffect = {
      type: 'debuffed',
      turnsRemaining: 2,
      value: 30,
      sourceId: 'intimidate',
    };

    const updatedCombatants = state.combatants.map((c) => {
      if (c.id === target.id) {
        return { ...c, statusEffects: [...c.statusEffects, intimidateEffect] };
      }
      if (c.id === actor.id) {
        return { ...c, hasActedThisTurn: true };
      }
      return c;
    });

    const result: CombatResult = {
      action,
      success: true,
      statusEffectApplied: intimidateEffect,
      message: `${actor.name} intimidates ${target.name}! They cower in fear, losing attack power and accuracy!`,
      timestamp: Date.now(),
    };

    return {
      state: { ...state, combatants: updatedCombatants, log: [...state.log, result].slice(-state.maxLogEntries) },
      result,
    };
  }

  // Failed intimidation
  const result: CombatResult = {
    action,
    success: false,
    message: `${actor.name} tries to intimidate ${target.name}, but they stand their ground!`,
    timestamp: Date.now(),
  };

  return { state: markActorActed(state, actor.id, result), result };
}
