import type {
  Combatant,
  CombatAction,
  CombatResult,
  CombatState,
} from '../types';
import {
  calculateDamage,
  calculateHitChance,
  rollCritical,
  rollHit,
  applyStatusEffectModifiers,
} from '../damage';
import { scopedRNG, rngTick } from '../../../lib/prng';
import { createFailureResult, markActorActed } from './helpers';

export function processAttack(
  state: CombatState,
  action: CombatAction,
  actor: Combatant,
  randomValues?: { hitRoll?: number; critRoll?: number; damageVariance?: number }
): { state: CombatState; result: CombatResult } {
  if (!action.targetId) {
    return { state, result: createFailureResult(action, 'No target specified') };
  }

  const target = state.combatants.find((c) => c.id === action.targetId);
  if (!target || !target.isAlive) {
    return { state, result: createFailureResult(action, 'Target is not available') };
  }

  // Get effective stats with status effect modifiers
  const actorStats = applyStatusEffectModifiers(actor.stats, actor.statusEffects);
  const targetStats = applyStatusEffectModifiers(target.stats, target.statusEffects);

  // Calculate hit chance
  const hitChance = calculateHitChance(actorStats.accuracy, targetStats.evasion);
  const hitRoll = randomValues?.hitRoll ?? scopedRNG('combat', 42, rngTick());
  const didHit = rollHit(hitChance, hitRoll);

  if (!didHit) {
    // Miss
    const result: CombatResult = {
      action,
      success: false,
      wasDodged: true,
      message: `${actor.name} attacks ${target.name} but misses!`,
      timestamp: Date.now(),
    };

    return {
      state: markActorActed(state, actor.id, result),
      result,
    };
  }

  // Check for critical
  const critRoll = randomValues?.critRoll ?? scopedRNG('combat', 42, rngTick());
  const isCritical = rollCritical(actorStats.critChance, critRoll);

  // Check if target is defending
  const isDefending = target.statusEffects.some((e) => e.type === 'defending');

  // Calculate damage
  const damageResult = calculateDamage(
    {
      attackPower: actorStats.attack,
      defenderDefense: targetStats.defense,
      isDefenderDefending: isDefending,
      isCritical,
      critMultiplier: actorStats.critMultiplier,
    },
    randomValues?.damageVariance ?? scopedRNG('combat', 42, rngTick())
  );

  // Apply damage
  const newTargetHP = Math.max(0, target.stats.hp - damageResult.finalDamage);
  const targetKilled = newTargetHP === 0;

  // Update combatants
  const updatedCombatants = state.combatants.map((c) => {
    if (c.id === target.id) {
      return {
        ...c,
        stats: { ...c.stats, hp: newTargetHP },
        isAlive: !targetKilled,
      };
    }
    if (c.id === actor.id) {
      return { ...c, hasActedThisTurn: true };
    }
    return c;
  });

  // Build result message
  let message = `${actor.name} attacks ${target.name}`;
  if (isCritical) {
    message += ' with a CRITICAL HIT';
  }
  message += ` for ${damageResult.finalDamage} damage!`;
  if (targetKilled) {
    message += ` ${target.name} is defeated!`;
  }

  const result: CombatResult = {
    action,
    success: true,
    damage: damageResult.finalDamage,
    isCritical,
    wasBlocked: isDefending,
    targetKilled,
    message,
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
