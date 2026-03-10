/**
 * AI utility functions for evaluating combat situations.
 *
 * @module combat/ai/utilities
 */

import type { Combatant, CombatState } from '../types';

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
