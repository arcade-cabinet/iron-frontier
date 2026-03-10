import type { CombatEncounter } from '../../../data/schemas/combat';
import type {
  Combatant,
  CombatLootDrop,
  CombatPhase,
  CombatResult,
  CombatRewards,
  CombatState,
  StatusEffect,
} from '../types';
import { calculateStatusEffectDamage } from '../damage';
import { scopedRNG, rngTick } from '../../../lib/prng';

export function applyStatusEffects(combatants: Combatant[]): {
  combatants: Combatant[];
  results: CombatResult[];
} {
  const results: CombatResult[] = [];
  const updatedCombatants = combatants.map((combatant) => {
    if (!combatant.isAlive || combatant.statusEffects.length === 0) {
      return combatant;
    }

    let newHP = combatant.stats.hp;
    const newEffects: StatusEffect[] = [];

    for (const effect of combatant.statusEffects) {
      // Apply DoT effects
      if (['poisoned', 'burning', 'bleeding'].includes(effect.type)) {
        const damage = calculateStatusEffectDamage(effect, combatant.stats.maxHP);
        newHP = Math.max(0, newHP - damage);

        results.push({
          action: { type: 'attack', actorId: 'status_effect' },
          success: true,
          damage,
          message: `${combatant.name} takes ${damage} damage from ${effect.type}!`,
          targetKilled: newHP === 0,
          timestamp: Date.now(),
        });
      }

      // Decrement duration
      if (effect.turnsRemaining > 1) {
        newEffects.push({
          ...effect,
          turnsRemaining: effect.turnsRemaining - 1,
        });
      }
      // Effects with turnsRemaining <= 1 are removed
    }

    return {
      ...combatant,
      stats: { ...combatant.stats, hp: newHP },
      statusEffects: newEffects,
      isAlive: newHP > 0,
    };
  });

  return { combatants: updatedCombatants, results };
}

export function checkCombatEnd(state: CombatState): CombatPhase | null {
  const player = state.combatants.find((c) => c.isPlayer);
  const enemies = state.combatants.filter((c) => c.type === 'enemy');

  // Check defeat - player dead
  if (!player || !player.isAlive) {
    return 'defeat';
  }

  // Check victory - all enemies dead
  const allEnemiesDead = enemies.every((e) => !e.isAlive);
  if (allEnemiesDead) {
    return 'victory';
  }

  // Combat continues
  return null;
}

export function updateCombatPhase(state: CombatState): CombatState {
  const endPhase = checkCombatEnd(state);
  if (endPhase) {
    return { ...state, phase: endPhase };
  }
  return state;
}

export function calculateRewards(
  state: CombatState,
  encounter: CombatEncounter
): CombatRewards {
  // Base rewards from encounter
  let xp = encounter.rewards.xp;
  let gold = encounter.rewards.gold;
  const loot: CombatLootDrop[] = [];

  // Add per-enemy rewards
  for (const combatant of state.combatants) {
    if (combatant.type === 'enemy' && !combatant.isAlive) {
      xp += combatant.xpReward || 0;
      gold += combatant.goldReward || 0;
    }
  }

  // Roll for loot drops
  for (const itemDrop of encounter.rewards.items) {
    if (scopedRNG('combat', 42, rngTick()) <= itemDrop.chance) {
      loot.push({
        itemId: itemDrop.itemId,
        quantity: itemDrop.quantity,
      });
    }
  }

  return { xp, gold, loot };
}
