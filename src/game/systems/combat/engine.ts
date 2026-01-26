/**
 * Iron Frontier - Combat Engine
 *
 * Core combat logic for turn-based battles.
 * All functions are pure where possible for testability.
 */

import type { CombatEncounter, EnemyDefinition } from '../../data/schemas/combat';
import {
  calculateDamage,
  calculateHitChance,
  calculateStatusEffectDamage,
  calculateHeal,
  rollCritical,
  rollHit,
  applyStatusEffectModifiers,
} from './damage';
import type {
  Combatant,
  CombatAction,
  CombatActionType,
  CombatInitContext,
  CombatLootDrop,
  CombatPhase,
  CombatResult,
  CombatRewards,
  CombatState,
  CombatStats,
  StatusEffect,
} from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum combat log entries */
export const MAX_LOG_ENTRIES = 50;

/** Base flee chance (modified by speed comparison) */
export const BASE_FLEE_CHANCE = 40;

/** Flee chance bonus per speed point difference */
export const FLEE_SPEED_BONUS = 2;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Generate a unique ID for a combatant instance
 */
function generateCombatantId(prefix: string, index: number): string {
  return `${prefix}_${index}_${Date.now()}`;
}

/**
 * Create a player combatant from player stats
 */
export function createPlayerCombatant(
  playerName: string,
  playerStats: CombatStats,
  weaponId: string | null
): Combatant {
  return {
    id: 'player',
    definitionId: 'player',
    name: playerName,
    type: 'player',
    isPlayer: true,
    stats: { ...playerStats },
    statusEffects: [],
    position: { q: 0, r: 0 },
    weaponId,
    ammoInClip: 6, // Default ammo
    isAlive: true,
    hasActedThisTurn: false,
  };
}

/**
 * Create an enemy combatant from an enemy definition
 */
export function createEnemyCombatant(enemy: EnemyDefinition, index: number): Combatant {
  const stats: CombatStats = {
    hp: enemy.maxHealth,
    maxHP: enemy.maxHealth,
    attack: enemy.baseDamage,
    defense: enemy.armor,
    speed: enemy.actionPoints, // Use AP as speed proxy
    accuracy: 70 + enemy.accuracyMod,
    evasion: enemy.evasion,
    critChance: 5,
    critMultiplier: 1.5,
  };

  return {
    id: generateCombatantId(enemy.id, index),
    definitionId: enemy.id,
    name: index > 0 ? `${enemy.name} ${String.fromCharCode(65 + index)}` : enemy.name,
    type: 'enemy',
    isPlayer: false,
    stats,
    statusEffects: [],
    position: { q: 1 + index, r: 0 },
    weaponId: enemy.weaponId || null,
    ammoInClip: 6,
    isAlive: true,
    hasActedThisTurn: false,
    behavior: enemy.behavior,
    spriteId: enemy.spriteId,
    xpReward: enemy.xpReward,
    goldReward: enemy.goldReward,
    lootTableId: enemy.lootTableId,
  };
}

/**
 * Initialize combat from an encounter and player context
 */
export function initializeCombat(
  encounter: CombatEncounter,
  context: CombatInitContext,
  getEnemyById: (id: string) => EnemyDefinition | undefined
): CombatState {
  const combatants: Combatant[] = [];

  // Add player
  const player = createPlayerCombatant(
    context.playerName,
    context.playerStats,
    context.playerWeaponId
  );
  combatants.push(player);

  // Add allies if any
  if (context.allies) {
    combatants.push(...context.allies);
  }

  // Add enemies from encounter
  let enemyIndex = 0;
  for (const enemyEntry of encounter.enemies) {
    const enemyDef = getEnemyById(enemyEntry.enemyId);
    if (!enemyDef) continue;

    for (let i = 0; i < enemyEntry.count; i++) {
      combatants.push(createEnemyCombatant(enemyDef, enemyIndex));
      enemyIndex++;
    }
  }

  // Calculate turn order based on speed
  const turnOrder = calculateTurnOrder(combatants);

  return {
    id: `combat_${Date.now()}`,
    encounterId: encounter.id,
    phase: 'initializing',
    combatants,
    turnOrder,
    currentTurnIndex: 0,
    round: 1,
    log: [],
    maxLogEntries: MAX_LOG_ENTRIES,
    startedAt: Date.now(),
    canFlee: encounter.canFlee,
    isBoss: encounter.isBoss,
  };
}

/**
 * Calculate turn order based on combatant speed stats
 * Higher speed goes first
 */
export function calculateTurnOrder(combatants: Combatant[]): string[] {
  return combatants
    .filter((c) => c.isAlive)
    .sort((a, b) => {
      // Apply status effect modifiers to get effective speed
      const aStats = applyStatusEffectModifiers(a.stats, a.statusEffects);
      const bStats = applyStatusEffectModifiers(b.stats, b.statusEffects);
      // Higher speed goes first, break ties with random
      if (bStats.speed !== aStats.speed) {
        return bStats.speed - aStats.speed;
      }
      // Player wins ties
      if (a.isPlayer) return -1;
      if (b.isPlayer) return 1;
      return 0;
    })
    .map((c) => c.id);
}

// ============================================================================
// TURN MANAGEMENT
// ============================================================================

/**
 * Get the current active combatant
 */
export function getCurrentCombatant(state: CombatState): Combatant | undefined {
  const currentId = state.turnOrder[state.currentTurnIndex];
  return state.combatants.find((c) => c.id === currentId);
}

/**
 * Advance to the next turn
 */
export function advanceTurn(state: CombatState): CombatState {
  // Find next alive combatant
  let nextIndex = (state.currentTurnIndex + 1) % state.turnOrder.length;
  let round = state.round;
  let loopCount = 0;

  // Skip dead combatants
  while (loopCount < state.turnOrder.length) {
    const combatantId = state.turnOrder[nextIndex];
    const combatant = state.combatants.find((c) => c.id === combatantId);

    if (combatant && combatant.isAlive) {
      break;
    }

    nextIndex = (nextIndex + 1) % state.turnOrder.length;
    loopCount++;
  }

  // Check if we wrapped around (new round)
  if (nextIndex <= state.currentTurnIndex || loopCount >= state.turnOrder.length) {
    round++;
  }

  // Reset hasActedThisTurn for the new combatant
  const updatedCombatants = state.combatants.map((c) => {
    if (c.id === state.turnOrder[nextIndex]) {
      return { ...c, hasActedThisTurn: false };
    }
    return c;
  });

  // Determine new phase
  const nextCombatant = updatedCombatants.find((c) => c.id === state.turnOrder[nextIndex]);
  let phase: CombatPhase = 'enemy_turn';
  if (nextCombatant) {
    if (nextCombatant.isPlayer) {
      phase = 'player_turn';
    } else if (nextCombatant.type === 'ally') {
      phase = 'ally_turn';
    }
  }

  return {
    ...state,
    currentTurnIndex: nextIndex,
    round,
    phase,
    combatants: updatedCombatants,
    selectedAction: undefined,
    selectedTargetId: undefined,
  };
}

/**
 * Start a new round (recalculate turn order, apply start-of-round effects)
 */
export function startNewRound(state: CombatState): CombatState {
  // Recalculate turn order (in case speeds changed)
  const newTurnOrder = calculateTurnOrder(state.combatants);

  // Apply status effects at start of round
  const { combatants: updatedCombatants, results } = applyStatusEffects(state.combatants);

  // Add results to log
  const newLog = [...state.log, ...results].slice(-state.maxLogEntries);

  return {
    ...state,
    turnOrder: newTurnOrder,
    currentTurnIndex: 0,
    combatants: updatedCombatants,
    log: newLog,
  };
}

// ============================================================================
// ACTION PROCESSING
// ============================================================================

/**
 * Process a combat action
 */
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
      return processSkill(state, action, actor);
    default:
      return {
        state,
        result: createFailureResult(action, 'Unknown action type'),
      };
  }
}

/**
 * Process an attack action
 */
function processAttack(
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
  const hitRoll = randomValues?.hitRoll ?? Math.random();
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
  const critRoll = randomValues?.critRoll ?? Math.random();
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
    randomValues?.damageVariance ?? Math.random()
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

/**
 * Process a defend action
 */
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

/**
 * Process an item use action
 */
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

/**
 * Process a flee action
 */
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

  const roll = randomValue ?? Math.random();
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

/**
 * Process a skill action (placeholder for future expansion)
 */
function processSkill(
  state: CombatState,
  action: CombatAction,
  actor: Combatant
): { state: CombatState; result: CombatResult } {
  // Placeholder - skills not yet implemented
  const result: CombatResult = {
    action,
    success: false,
    message: 'Skills are not yet implemented',
    timestamp: Date.now(),
  };

  return { state, result };
}

// ============================================================================
// STATUS EFFECTS
// ============================================================================

/**
 * Apply status effects at the start of a turn/round
 */
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

// ============================================================================
// VICTORY/DEFEAT DETECTION
// ============================================================================

/**
 * Check if combat has ended and determine the outcome
 */
export function checkCombatEnd(state: CombatState): CombatPhase | null {
  const player = state.combatants.find((c) => c.isPlayer);
  const allies = state.combatants.filter((c) => c.type === 'ally');
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

/**
 * Update combat state phase based on victory/defeat check
 */
export function updateCombatPhase(state: CombatState): CombatState {
  const endPhase = checkCombatEnd(state);
  if (endPhase) {
    return { ...state, phase: endPhase };
  }
  return state;
}

// ============================================================================
// REWARDS
// ============================================================================

/**
 * Calculate rewards from a won combat
 */
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
    if (Math.random() <= itemDrop.chance) {
      loot.push({
        itemId: itemDrop.itemId,
        quantity: itemDrop.quantity,
      });
    }
  }

  return { xp, gold, loot };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Create a failure result
 */
function createFailureResult(action: CombatAction, message: string): CombatResult {
  return {
    action,
    success: false,
    message,
    timestamp: Date.now(),
  };
}

/**
 * Mark an actor as having acted and add result to log
 */
function markActorActed(state: CombatState, actorId: string, result: CombatResult): CombatState {
  const updatedCombatants = state.combatants.map((c) => {
    if (c.id === actorId) {
      return { ...c, hasActedThisTurn: true };
    }
    return c;
  });

  const newLog = [...state.log, result].slice(-state.maxLogEntries);

  return {
    ...state,
    combatants: updatedCombatants,
    log: newLog,
  };
}

/**
 * Get valid targets for an action
 */
export function getValidTargets(state: CombatState, actorId: string): Combatant[] {
  const actor = state.combatants.find((c) => c.id === actorId);
  if (!actor) return [];

  // For attacks, target enemies if actor is player/ally, or player/allies if actor is enemy
  if (actor.type === 'enemy') {
    return state.combatants.filter((c) => (c.isPlayer || c.type === 'ally') && c.isAlive);
  }

  return state.combatants.filter((c) => c.type === 'enemy' && c.isAlive);
}

/**
 * Check if an action is valid
 */
export function isActionValid(
  state: CombatState,
  action: CombatAction,
  actor: Combatant
): { valid: boolean; reason?: string } {
  if (!actor.isAlive) {
    return { valid: false, reason: 'Actor is dead' };
  }

  if (actor.hasActedThisTurn) {
    return { valid: false, reason: 'Actor has already acted this turn' };
  }

  if (action.type === 'attack' && !action.targetId) {
    return { valid: false, reason: 'Attack requires a target' };
  }

  if (action.type === 'item' && !action.itemId) {
    return { valid: false, reason: 'Item use requires an item' };
  }

  if (action.type === 'flee' && !state.canFlee) {
    return { valid: false, reason: 'Cannot flee from this battle' };
  }

  // Check if actor is stunned
  if (actor.statusEffects.some((e) => e.type === 'stunned')) {
    return { valid: false, reason: 'Actor is stunned' };
  }

  return { valid: true };
}
