/**
 * Combat convenience functions
 *
 * Higher-level helpers that combine multiple combat subsystems
 * into single-call operations for common use cases.
 */

import { calculateDamage, calculateHitChance, rollCritical, rollHit } from './damage';
import { processAction, initializeCombat, getCurrentCombatant, updateCombatPhase } from './engine';
import { getAIAction } from './ai';
import type {
  CombatAction,
  CombatInitContext,
  CombatResult,
  CombatState,
  Combatant,
} from './types';
import type { CombatEncounter, EnemyDefinition } from '../../data/schemas/combat';

/**
 * Execute a full attack action with all calculations
 *
 * Convenience function that handles hit check, crit check, and damage calculation
 * in a single call.
 *
 * @param attacker - The attacking combatant
 * @param defender - The defending combatant
 * @param randomValues - Optional random values for deterministic testing
 * @returns Attack result with all details
 */
export function executeAttack(
  attacker: Combatant,
  defender: Combatant,
  randomValues?: { hitRoll?: number; critRoll?: number; damageVariance?: number }
): {
  hit: boolean;
  critical: boolean;
  damage: number;
  message: string;
} {
  const hitChance = calculateHitChance(attacker.stats.accuracy, defender.stats.evasion);
  const hit = rollHit(hitChance, randomValues?.hitRoll);

  if (!hit) {
    return {
      hit: false,
      critical: false,
      damage: 0,
      message: `${attacker.name} misses ${defender.name}!`,
    };
  }

  const critical = rollCritical(attacker.stats.critChance, randomValues?.critRoll);

  const { finalDamage } = calculateDamage(
    {
      attackPower: attacker.stats.attack,
      defenderDefense: defender.stats.defense,
      isDefenderDefending: defender.statusEffects.some((e) => e.type === 'defending'),
      isCritical: critical,
      critMultiplier: attacker.stats.critMultiplier,
    },
    randomValues?.damageVariance
  );

  let message = `${attacker.name} hits ${defender.name}`;
  if (critical) {
    message += ' with a CRITICAL HIT';
  }
  message += ` for ${finalDamage} damage!`;

  return {
    hit: true,
    critical,
    damage: finalDamage,
    message,
  };
}

/**
 * Run a complete combat turn for the AI
 *
 * Convenience function that gets AI decision and executes the action.
 *
 * @param state - Current combat state
 * @param actorId - ID of the AI-controlled combatant
 * @param randomValues - Optional random values for deterministic testing
 * @returns New state and result, or null if no action was taken
 */
export function runAITurn(
  state: CombatState,
  actorId: string,
  randomValues?: {
    targetRoll?: number;
    actionRoll?: number;
    hitRoll?: number;
    critRoll?: number;
    damageVariance?: number;
  }
): { state: CombatState; result: CombatResult } | null {
  const action = getAIAction(state, actorId, {
    targetRoll: randomValues?.targetRoll,
    actionRoll: randomValues?.actionRoll,
  });

  if (!action) {
    return null;
  }

  return processAction(state, action, {
    hitRoll: randomValues?.hitRoll,
    critRoll: randomValues?.critRoll,
    damageVariance: randomValues?.damageVariance,
  });
}

/**
 * Check if combat should end and determine the winner
 *
 * @param state - Current combat state
 * @returns 'player_wins', 'enemy_wins', or 'ongoing'
 */
export function getCombatOutcome(
  state: CombatState
): 'player_wins' | 'enemy_wins' | 'fled' | 'ongoing' {
  if (state.phase === 'victory') return 'player_wins';
  if (state.phase === 'defeat') return 'enemy_wins';
  if (state.phase === 'fled') return 'fled';
  return 'ongoing';
}

/**
 * Create a quick combat for testing or scripted sequences
 *
 * @param playerStats - Player's combat stats
 * @param enemies - Array of enemy definitions to fight
 * @param canFlee - Whether the player can flee
 * @returns Initialized combat state
 */
export function createQuickCombat(
  playerStats: Combatant['stats'],
  enemies: Array<{ definition: EnemyDefinition; count: number }>,
  canFlee: boolean = true
): CombatState {
  // Create a synthetic encounter
  const encounter: CombatEncounter = {
    id: `quick_combat_${Date.now()}`,
    name: 'Quick Combat',
    enemies: enemies.map((e) => ({ enemyId: e.definition.id, count: e.count })),
    minLevel: 1,
    isBoss: false,
    canFlee,
    rewards: {
      xp: enemies.reduce((sum, e) => sum + (e.definition.xpReward || 0) * e.count, 0),
      gold: enemies.reduce((sum, e) => sum + (e.definition.goldReward || 0) * e.count, 0),
      items: [],
    },
    tags: ['quick_combat'],
  };

  // Create enemy lookup
  const enemyMap = new Map(enemies.map((e) => [e.definition.id, e.definition]));

  const context: CombatInitContext = {
    encounterId: encounter.id,
    playerStats,
    playerName: 'Player',
    playerWeaponId: null,
  };

  return initializeCombat(encounter, context, (id) => enemyMap.get(id));
}
