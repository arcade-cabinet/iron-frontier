/**
 * AI decision-making logic for enemy turns in combat.
 *
 * Supports multiple behavior types for varied enemy tactics.
 *
 * @module combat/ai/decisions
 */

import type {
  AIDecision,
  Combatant,
  CombatAction,
  CombatState,
} from '../types';
import { scopedRNG, rngTick } from '../../../lib/prng';
import { selectTarget } from './targetSelection';

/**
 * Decide what action an enemy should take
 */
export function decideAction(
  state: CombatState,
  actorId: string,
  randomValues?: { targetRoll?: number; actionRoll?: number }
): AIDecision | null {
  const actor = state.combatants.find((c) => c.id === actorId);
  if (!actor || !actor.isAlive || actor.isPlayer) {
    return null;
  }

  const behavior = actor.behavior || 'aggressive';
  const actionRoll = randomValues?.actionRoll ?? scopedRNG('combat', 42, rngTick());
  const targetRoll = randomValues?.targetRoll ?? scopedRNG('combat', 42, rngTick());

  switch (behavior) {
    case 'aggressive':
      return decideAggressive(state, actor, targetRoll);

    case 'defensive':
      return decideDefensive(state, actor, targetRoll, actionRoll);

    case 'ranged':
      // Ranged behavior: prefer attacking from distance, similar to aggressive but targets player
      return decideAggressive(state, actor, targetRoll);

    case 'support':
      return decideSupport(state, actor, targetRoll, actionRoll);

    case 'random':
    default:
      return decideRandom(state, actor, targetRoll, actionRoll);
  }
}

/**
 * Get the best action for an AI-controlled combatant
 */
export function getAIAction(
  state: CombatState,
  actorId: string,
  randomValues?: { targetRoll?: number; actionRoll?: number }
): CombatAction | null {
  const decision = decideAction(state, actorId, randomValues);
  return decision?.action ?? null;
}

// ============================================================================
// BEHAVIOR STRATEGIES
// ============================================================================

/**
 * Aggressive AI: Always attack, prefer low HP targets
 */
function decideAggressive(
  state: CombatState,
  actor: Combatant,
  targetRoll: number
): AIDecision {
  const target = selectTarget(state, actor.id, 'lowest_hp', targetRoll);

  if (!target) {
    return createDefendDecision(actor);
  }

  return {
    action: {
      type: 'attack',
      actorId: actor.id,
      targetId: target.id,
    },
    priority: 100,
    reasoning: 'Aggressive behavior: Attack the weakest enemy',
  };
}

/**
 * Defensive AI: Defend when low HP, otherwise attack
 */
function decideDefensive(
  state: CombatState,
  actor: Combatant,
  targetRoll: number,
  actionRoll: number
): AIDecision {
  const hpPercent = actor.stats.hp / actor.stats.maxHP;

  // If HP is below 30%, defend
  if (hpPercent < 0.3) {
    return createDefendDecision(actor);
  }

  // If HP is below 50%, 50% chance to defend
  if (hpPercent < 0.5 && actionRoll < 0.5) {
    return createDefendDecision(actor);
  }

  // Otherwise attack
  const target = selectTarget(state, actor.id, 'random', targetRoll);

  if (!target) {
    return createDefendDecision(actor);
  }

  return {
    action: {
      type: 'attack',
      actorId: actor.id,
      targetId: target.id,
    },
    priority: 80,
    reasoning: 'Defensive behavior: Attack when HP is stable',
  };
}

/**
 * Support AI: Heal wounded allies when below 30% HP, otherwise focus fire
 * on the enemy attacking an ally.
 */
function decideSupport(
  state: CombatState,
  actor: Combatant,
  targetRoll: number,
  _actionRoll: number
): AIDecision {
  // Check if any ally (same team) is below 30% HP and needs healing
  const alliesOnTeam = state.combatants.filter((c) => {
    if (!c.isAlive || c.id === actor.id) return false;
    // Support enemies heal other enemies; support allies heal player/allies
    if (actor.type === 'enemy') return c.type === 'enemy';
    return c.isPlayer || c.type === 'ally';
  });

  const woundedAlly = alliesOnTeam.find(
    (c) => c.stats.hp / c.stats.maxHP < 0.3
  );

  if (woundedAlly) {
    return {
      action: {
        type: 'skill',
        actorId: actor.id,
        skillId: 'first_aid',
      },
      priority: 90,
      reasoning: 'Support behavior: Healing self to stay alive and protect wounded ally',
    };
  }

  // Check own health - heal self if below 30%
  const selfHpPercent = actor.stats.hp / actor.stats.maxHP;
  if (selfHpPercent < 0.3) {
    return {
      action: {
        type: 'skill',
        actorId: actor.id,
        skillId: 'first_aid',
      },
      priority: 95,
      reasoning: 'Support behavior: Self-healing when critically wounded',
    };
  }

  // Focus fire: target whoever has the highest attack stat among enemies
  const target = selectTarget(state, actor.id, 'highest_threat', targetRoll);

  if (!target) {
    return createDefendDecision(actor);
  }

  return {
    action: {
      type: 'attack',
      actorId: actor.id,
      targetId: target.id,
    },
    priority: 70,
    reasoning: 'Support behavior: Focus fire on highest threat to protect allies',
  };
}

/**
 * Random AI: Randomly choose actions
 */
function decideRandom(
  state: CombatState,
  actor: Combatant,
  targetRoll: number,
  actionRoll: number
): AIDecision {
  // 20% chance to defend, 80% chance to attack
  if (actionRoll < 0.2) {
    return createDefendDecision(actor);
  }

  const target = selectTarget(state, actor.id, 'random', targetRoll);

  if (!target) {
    return createDefendDecision(actor);
  }

  return {
    action: {
      type: 'attack',
      actorId: actor.id,
      targetId: target.id,
    },
    priority: 50,
    reasoning: 'Random behavior: Randomly attacking',
  };
}

/**
 * Create a defend decision
 */
function createDefendDecision(actor: Combatant): AIDecision {
  return {
    action: {
      type: 'defend',
      actorId: actor.id,
    },
    priority: 60,
    reasoning: 'Defending to reduce incoming damage',
  };
}
