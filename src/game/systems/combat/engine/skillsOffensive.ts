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

export function processAimedShot(
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

  const actorStats = applyStatusEffectModifiers(actor.stats, actor.statusEffects);
  const targetStats = applyStatusEffectModifiers(target.stats, target.statusEffects);

  // Aimed shot: -15% hit chance (careful shot trades reliability for power)
  const hitChance = calculateHitChance(actorStats.accuracy - 15, targetStats.evasion);
  const hitRoll = randomValues?.hitRoll ?? scopedRNG('combat', 42, rngTick());
  const didHit = rollHit(hitChance, hitRoll);

  if (!didHit) {
    const result: CombatResult = {
      action,
      success: false,
      wasDodged: true,
      message: `${actor.name} lines up an aimed shot at ${target.name} but misses!`,
      timestamp: Date.now(),
    };
    return { state: markActorActed(state, actor.id, result), result };
  }

  // Aimed shots have higher crit chance
  const critRoll = randomValues?.critRoll ?? scopedRNG('combat', 42, rngTick());
  const isCritical = rollCritical(actorStats.critChance + 15, critRoll);
  const isDefending = target.statusEffects.some((e) => e.type === 'defending');

  // 50% more damage
  const damageResult = calculateDamage(
    {
      attackPower: Math.floor(actorStats.attack * 1.5),
      defenderDefense: targetStats.defense,
      isDefenderDefending: isDefending,
      isCritical,
      critMultiplier: actorStats.critMultiplier,
    },
    randomValues?.damageVariance ?? scopedRNG('combat', 42, rngTick())
  );

  const newTargetHP = Math.max(0, target.stats.hp - damageResult.finalDamage);
  const targetKilled = newTargetHP === 0;

  const updatedCombatants = state.combatants.map((c) => {
    if (c.id === target.id) {
      return { ...c, stats: { ...c.stats, hp: newTargetHP }, isAlive: !targetKilled };
    }
    if (c.id === actor.id) {
      return { ...c, hasActedThisTurn: true };
    }
    return c;
  });

  let message = `${actor.name} takes an aimed shot at ${target.name}`;
  if (isCritical) message += ' with a CRITICAL HIT';
  message += ` for ${damageResult.finalDamage} damage!`;
  if (targetKilled) message += ` ${target.name} is defeated!`;

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

  return {
    state: { ...state, combatants: updatedCombatants, log: [...state.log, result].slice(-state.maxLogEntries) },
    result,
  };
}

export function processQuickDraw(
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

  const actorStats = applyStatusEffectModifiers(actor.stats, actor.statusEffects);
  const targetStats = applyStatusEffectModifiers(target.stats, target.statusEffects);

  // Quick draw: +15% hit chance
  const hitChance = calculateHitChance(actorStats.accuracy + 15, targetStats.evasion);
  const hitRoll = randomValues?.hitRoll ?? scopedRNG('combat', 42, rngTick());
  const didHit = rollHit(hitChance, hitRoll);

  if (!didHit) {
    const result: CombatResult = {
      action,
      success: false,
      wasDodged: true,
      message: `${actor.name} snaps off a quick shot at ${target.name} but misses!`,
      timestamp: Date.now(),
    };
    return { state: markActorActed(state, actor.id, result), result };
  }

  const critRoll = randomValues?.critRoll ?? scopedRNG('combat', 42, rngTick());
  const isCritical = rollCritical(actorStats.critChance, critRoll);
  const isDefending = target.statusEffects.some((e) => e.type === 'defending');

  // 60% of normal damage
  const damageResult = calculateDamage(
    {
      attackPower: Math.floor(actorStats.attack * 0.6),
      defenderDefense: targetStats.defense,
      isDefenderDefending: isDefending,
      isCritical,
      critMultiplier: actorStats.critMultiplier,
    },
    randomValues?.damageVariance ?? scopedRNG('combat', 42, rngTick())
  );

  const newTargetHP = Math.max(0, target.stats.hp - damageResult.finalDamage);
  const targetKilled = newTargetHP === 0;

  const updatedCombatants = state.combatants.map((c) => {
    if (c.id === target.id) {
      return { ...c, stats: { ...c.stats, hp: newTargetHP }, isAlive: !targetKilled };
    }
    if (c.id === actor.id) {
      return { ...c, hasActedThisTurn: true };
    }
    return c;
  });

  let message = `${actor.name} quick-draws on ${target.name}`;
  if (isCritical) message += ' with a CRITICAL HIT';
  message += ` for ${damageResult.finalDamage} damage!`;
  if (targetKilled) message += ` ${target.name} is defeated!`;

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

  return {
    state: { ...state, combatants: updatedCombatants, log: [...state.log, result].slice(-state.maxLogEntries) },
    result,
  };
}
