/**
 * Iron Frontier - Enemy AI
 *
 * Simple AI system for enemy turns in combat.
 * Supports multiple behavior types for varied enemy tactics.
 */

import type {
  AIDecision,
  Combatant,
  CombatAction,
  CombatState,
  TargetSelectionStrategy,
} from './types';
import { applyStatusEffectModifiers } from './damage';
import { scopedRNG, rngTick } from '../../lib/prng';

// ============================================================================
// TARGET SELECTION
// ============================================================================

/**
 * Select a target based on the given strategy
 */
export function selectTarget(
  state: CombatState,
  actorId: string,
  strategy: TargetSelectionStrategy,
  randomValue: number = scopedRNG('combat', 42, rngTick())
): Combatant | null {
  const actor = state.combatants.find((c) => c.id === actorId);
  if (!actor) return null;

  // Get valid targets (enemies for player/ally, player/allies for enemy)
  const targets = state.combatants.filter((c) => {
    if (!c.isAlive) return false;
    if (actor.type === 'enemy') {
      return c.isPlayer || c.type === 'ally';
    }
    return c.type === 'enemy';
  });

  if (targets.length === 0) return null;

  switch (strategy) {
    case 'lowest_hp':
      return selectLowestHP(targets);

    case 'highest_threat':
      return selectHighestThreat(targets);

    case 'player_first':
      return selectPlayerFirst(targets);

    case 'random':
    default:
      return selectRandom(targets, randomValue);
  }
}

/**
 * Select the target with the lowest HP
 */
function selectLowestHP(targets: Combatant[]): Combatant {
  return targets.reduce((lowest, current) =>
    current.stats.hp < lowest.stats.hp ? current : lowest
  );
}

/**
 * Select the target with the highest attack (perceived threat)
 */
function selectHighestThreat(targets: Combatant[]): Combatant {
  return targets.reduce((highest, current) => {
    const currentStats = applyStatusEffectModifiers(current.stats, current.statusEffects);
    const highestStats = applyStatusEffectModifiers(highest.stats, highest.statusEffects);
    return currentStats.attack > highestStats.attack ? current : highest;
  });
}

/**
 * Select the player if available, otherwise random
 */
function selectPlayerFirst(targets: Combatant[]): Combatant {
  const player = targets.find((t) => t.isPlayer);
  if (player) return player;
  return targets[0];
}

/**
 * Select a random target
 */
function selectRandom(targets: Combatant[], randomValue: number): Combatant {
  const index = Math.floor(randomValue * targets.length);
  return targets[index];
}

// ============================================================================
// AI DECISION MAKING
// ============================================================================

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
    // Use first_aid skill targeting self (support AI heals itself or would need
    // target healing - for simplicity use defend to reduce damage on the team)
    // Since the engine skill system targets self for first_aid, the support AI
    // defends to absorb damage for the team when an ally is hurt
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

  // Focus fire: find the enemy that most recently attacked an ally
  // (approximation: target whoever has the highest attack stat among enemies)
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

// ============================================================================
// AI UTILITIES
// ============================================================================

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

/**
 * Check if a combatant should use an item (if available)
 * Returns the item ID to use, or null if no item should be used
 */
export function shouldUseItem(
  actor: Combatant,
  availableItems?: string[]
): string | null {
  if (!availableItems || availableItems.length === 0) {
    return null;
  }

  const hpPercent = actor.stats.hp / actor.stats.maxHP;

  // Use healing item if HP is below 25%
  if (hpPercent < 0.25) {
    // Return first available item (assuming it's a healing item)
    // In a full implementation, this would check item types
    return availableItems[0];
  }

  return null;
}

/**
 * Evaluate the current combat situation for an AI
 */
export function evaluateSituation(state: CombatState, actorId: string): {
  isWinning: boolean;
  enemyCount: number;
  allyCount: number;
  hpPercentage: number;
  averageEnemyHP: number;
} {
  const actor = state.combatants.find((c) => c.id === actorId);
  if (!actor) {
    return {
      isWinning: false,
      enemyCount: 0,
      allyCount: 0,
      hpPercentage: 0,
      averageEnemyHP: 0,
    };
  }

  // From the AI's perspective
  const allies = state.combatants.filter((c) => {
    if (!c.isAlive) return false;
    if (actor.type === 'enemy') {
      return c.type === 'enemy' && c.id !== actor.id;
    }
    return (c.isPlayer || c.type === 'ally') && c.id !== actor.id;
  });

  const enemies = state.combatants.filter((c) => {
    if (!c.isAlive) return false;
    if (actor.type === 'enemy') {
      return c.isPlayer || c.type === 'ally';
    }
    return c.type === 'enemy';
  });

  const hpPercentage = actor.stats.hp / actor.stats.maxHP;

  const averageEnemyHP =
    enemies.length > 0
      ? enemies.reduce((sum, e) => sum + e.stats.hp / e.stats.maxHP, 0) / enemies.length
      : 1;

  // Consider winning if: more allies, or enemies are low HP, or actor is high HP
  const allyAdvantage = allies.length + 1 > enemies.length;
  const hpAdvantage = hpPercentage > averageEnemyHP;
  const isWinning = allyAdvantage || hpAdvantage;

  return {
    isWinning,
    enemyCount: enemies.length,
    allyCount: allies.length,
    hpPercentage,
    averageEnemyHP,
  };
}
