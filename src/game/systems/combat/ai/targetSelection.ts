/**
 * Target selection strategies for combat AI.
 *
 * @module combat/ai/targetSelection
 */

import type {
  Combatant,
  CombatState,
  TargetSelectionStrategy,
} from '../types';
import { applyStatusEffectModifiers } from '../damage';
import { scopedRNG, rngTick } from '../../../lib/prng';

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
