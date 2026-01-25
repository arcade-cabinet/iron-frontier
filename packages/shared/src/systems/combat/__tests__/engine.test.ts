/**
 * Tests for the combat engine
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  createPlayerCombatant,
  createEnemyCombatant,
  initializeCombat,
  calculateTurnOrder,
  getCurrentCombatant,
  advanceTurn,
  processAction,
  applyStatusEffects,
  checkCombatEnd,
  updateCombatPhase,
  calculateRewards,
  getValidTargets,
  isActionValid,
} from '../engine';
import type {
  Combatant,
  CombatAction,
  CombatInitContext,
  CombatState,
  CombatStats,
  StatusEffect,
} from '../types';
import type { CombatEncounter, EnemyDefinition } from '../../../data/schemas/combat';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const mockEnemy: EnemyDefinition = {
  id: 'test_bandit',
  name: 'Test Bandit',
  type: 'bandit',
  faction: 'raiders',
  maxHealth: 30,
  actionPoints: 4,
  baseDamage: 10,
  armor: 5,
  accuracyMod: 0,
  evasion: 10,
  xpReward: 20,
  goldReward: 10,
  behavior: 'aggressive',
  tags: ['test'],
};

const mockEncounter: CombatEncounter = {
  id: 'test_encounter',
  name: 'Test Encounter',
  enemies: [{ enemyId: 'test_bandit', count: 2 }],
  minLevel: 1,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 50,
    gold: 20,
    items: [{ itemId: 'test_item', quantity: 1, chance: 1.0 }],
  },
  tags: ['test'],
};

const mockPlayerStats: CombatStats = {
  hp: 100,
  maxHP: 100,
  attack: 15,
  defense: 8,
  speed: 12,
  accuracy: 80,
  evasion: 15,
  critChance: 10,
  critMultiplier: 1.5,
};

const mockContext: CombatInitContext = {
  encounterId: 'test_encounter',
  playerStats: mockPlayerStats,
  playerName: 'Test Player',
  playerWeaponId: 'revolver',
};

function getEnemyById(id: string): EnemyDefinition | undefined {
  if (id === 'test_bandit') return mockEnemy;
  return undefined;
}

// ============================================================================
// TESTS
// ============================================================================

describe('Combat Engine', () => {
  describe('createPlayerCombatant', () => {
    it('should create a player combatant with correct stats', () => {
      const player = createPlayerCombatant('Hero', mockPlayerStats, 'revolver');

      expect(player.id).toBe('player');
      expect(player.name).toBe('Hero');
      expect(player.isPlayer).toBe(true);
      expect(player.type).toBe('player');
      expect(player.stats.hp).toBe(100);
      expect(player.weaponId).toBe('revolver');
      expect(player.isAlive).toBe(true);
    });
  });

  describe('createEnemyCombatant', () => {
    it('should create an enemy combatant from definition', () => {
      const enemy = createEnemyCombatant(mockEnemy, 0);

      expect(enemy.definitionId).toBe('test_bandit');
      expect(enemy.name).toBe('Test Bandit');
      expect(enemy.isPlayer).toBe(false);
      expect(enemy.type).toBe('enemy');
      expect(enemy.stats.hp).toBe(30);
      expect(enemy.stats.maxHP).toBe(30);
      expect(enemy.stats.attack).toBe(10);
      expect(enemy.stats.defense).toBe(5);
      expect(enemy.behavior).toBe('aggressive');
      expect(enemy.xpReward).toBe(20);
      expect(enemy.goldReward).toBe(10);
    });

    it('should label multiple enemies with letters', () => {
      const enemy0 = createEnemyCombatant(mockEnemy, 0);
      const enemy1 = createEnemyCombatant(mockEnemy, 1);
      const enemy2 = createEnemyCombatant(mockEnemy, 2);

      expect(enemy0.name).toBe('Test Bandit');
      expect(enemy1.name).toBe('Test Bandit B');
      expect(enemy2.name).toBe('Test Bandit C');
    });
  });

  describe('initializeCombat', () => {
    it('should initialize combat with all combatants', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);

      expect(state.combatants).toHaveLength(3); // 1 player + 2 enemies
      expect(state.combatants[0].isPlayer).toBe(true);
      expect(state.combatants.filter((c) => c.type === 'enemy')).toHaveLength(2);
    });

    it('should calculate turn order based on speed', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);

      expect(state.turnOrder).toHaveLength(3);
      // Player has speed 12, enemies have speed 4 (from actionPoints)
      // Player should go first
      expect(state.turnOrder[0]).toBe('player');
    });

    it('should set initial combat state correctly', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);

      expect(state.phase).toBe('initializing');
      expect(state.round).toBe(1);
      expect(state.currentTurnIndex).toBe(0);
      expect(state.canFlee).toBe(true);
      expect(state.isBoss).toBe(false);
      expect(state.log).toHaveLength(0);
    });
  });

  describe('calculateTurnOrder', () => {
    it('should order combatants by speed (descending)', () => {
      const combatants: Combatant[] = [
        createPlayerCombatant('Slow', { ...mockPlayerStats, speed: 5 }, null),
        { ...createEnemyCombatant(mockEnemy, 0), stats: { ...createEnemyCombatant(mockEnemy, 0).stats, speed: 15 } },
        { ...createEnemyCombatant(mockEnemy, 1), stats: { ...createEnemyCombatant(mockEnemy, 1).stats, speed: 10 } },
      ];
      combatants[0].id = 'slow_player';
      combatants[1].id = 'fast_enemy';
      combatants[2].id = 'medium_enemy';

      const order = calculateTurnOrder(combatants);

      expect(order[0]).toBe('fast_enemy');
      expect(order[1]).toBe('medium_enemy');
      expect(order[2]).toBe('slow_player');
    });

    it('should exclude dead combatants', () => {
      const combatants: Combatant[] = [
        createPlayerCombatant('Player', mockPlayerStats, null),
        { ...createEnemyCombatant(mockEnemy, 0), isAlive: false },
        createEnemyCombatant(mockEnemy, 1),
      ];
      combatants[1].id = 'dead_enemy';

      const order = calculateTurnOrder(combatants);

      expect(order).not.toContain('dead_enemy');
      expect(order).toHaveLength(2);
    });

    it('should give player priority on speed ties', () => {
      const playerStats = { ...mockPlayerStats, speed: 10 };
      const combatants: Combatant[] = [
        createPlayerCombatant('Player', playerStats, null),
        { ...createEnemyCombatant(mockEnemy, 0), stats: { ...createEnemyCombatant(mockEnemy, 0).stats, speed: 10 } },
      ];

      const order = calculateTurnOrder(combatants);

      expect(order[0]).toBe('player');
    });
  });

  describe('getCurrentCombatant', () => {
    it('should return the current combatant', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      const current = getCurrentCombatant(state);

      expect(current).toBeDefined();
      expect(current?.id).toBe(state.turnOrder[0]);
    });
  });

  describe('advanceTurn', () => {
    it('should move to the next combatant', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      const newState = advanceTurn(state);

      expect(newState.currentTurnIndex).toBe(1);
    });

    it('should increment round when wrapping', () => {
      let state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      state = { ...state, currentTurnIndex: state.turnOrder.length - 1 };

      const newState = advanceTurn(state);

      expect(newState.round).toBeGreaterThan(state.round);
    });

    it('should skip dead combatants', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      // Kill the second combatant
      const deadId = state.turnOrder[1];
      const updatedCombatants = state.combatants.map((c) =>
        c.id === deadId ? { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } } : c
      );

      const newState = advanceTurn({ ...state, combatants: updatedCombatants });

      expect(newState.turnOrder[newState.currentTurnIndex]).not.toBe(deadId);
    });
  });

  describe('processAction - Attack', () => {
    let state: CombatState;

    beforeEach(() => {
      state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      state = { ...state, phase: 'player_turn' };
    });

    it('should process a successful attack', () => {
      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const action: CombatAction = {
        type: 'attack',
        actorId: 'player',
        targetId: enemyId,
      };

      // Force a hit with deterministic random values
      const { state: newState, result } = processAction(state, action, {
        hitRoll: 0.1,
        critRoll: 0.9, // No crit
        damageVariance: 0.5,
      });

      expect(result.success).toBe(true);
      expect(result.damage).toBeGreaterThan(0);
      expect(result.message).toContain('attacks');
    });

    it('should process a missed attack', () => {
      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const action: CombatAction = {
        type: 'attack',
        actorId: 'player',
        targetId: enemyId,
      };

      // Force a miss
      const { result } = processAction(state, action, {
        hitRoll: 0.99,
      });

      expect(result.success).toBe(false);
      expect(result.wasDodged).toBe(true);
      expect(result.message).toContain('misses');
    });

    it('should process a critical hit', () => {
      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const action: CombatAction = {
        type: 'attack',
        actorId: 'player',
        targetId: enemyId,
      };

      // Force hit + crit
      const { result } = processAction(state, action, {
        hitRoll: 0.1,
        critRoll: 0.01,
        damageVariance: 0.5,
      });

      expect(result.success).toBe(true);
      expect(result.isCritical).toBe(true);
      expect(result.message).toContain('CRITICAL');
    });

    it('should handle killing a target', () => {
      const enemy = state.combatants.find((c) => c.type === 'enemy');
      if (!enemy) throw new Error('No enemy found');

      // Set enemy HP low
      const lowHPEnemy = { ...enemy, stats: { ...enemy.stats, hp: 1, defense: 0 } };
      const updatedCombatants = state.combatants.map((c) =>
        c.id === enemy.id ? lowHPEnemy : c
      );

      const action: CombatAction = {
        type: 'attack',
        actorId: 'player',
        targetId: enemy.id,
      };

      const { state: newState, result } = processAction(
        { ...state, combatants: updatedCombatants },
        action,
        { hitRoll: 0.1, critRoll: 0.9, damageVariance: 0.5 }
      );

      expect(result.targetKilled).toBe(true);
      expect(result.message).toContain('defeated');

      const deadEnemy = newState.combatants.find((c) => c.id === enemy.id);
      expect(deadEnemy?.isAlive).toBe(false);
    });

    it('should fail without a target', () => {
      const action: CombatAction = {
        type: 'attack',
        actorId: 'player',
      };

      const { result } = processAction(state, action);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No target');
    });
  });

  describe('processAction - Defend', () => {
    it('should apply defending status effect', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      const action: CombatAction = {
        type: 'defend',
        actorId: 'player',
      };

      const { state: newState, result } = processAction(state, action);

      expect(result.success).toBe(true);
      expect(result.statusEffectApplied?.type).toBe('defending');

      const player = newState.combatants.find((c) => c.isPlayer);
      expect(player?.statusEffects.some((e) => e.type === 'defending')).toBe(true);
    });
  });

  describe('processAction - Flee', () => {
    it('should succeed with high roll', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      const action: CombatAction = {
        type: 'flee',
        actorId: 'player',
      };

      const { state: newState, result } = processAction(state, action, { hitRoll: 0.01 });

      expect(result.success).toBe(true);
      expect(result.fleeSuccess).toBe(true);
      expect(newState.phase).toBe('fled');
    });

    it('should fail with low roll', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      const action: CombatAction = {
        type: 'flee',
        actorId: 'player',
      };

      const { result } = processAction(state, action, { hitRoll: 0.99 });

      expect(result.success).toBe(false);
      expect(result.fleeSuccess).toBe(false);
    });

    it('should fail in boss fights', () => {
      let state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      state = { ...state, canFlee: false };

      const action: CombatAction = {
        type: 'flee',
        actorId: 'player',
      };

      const { result } = processAction(state, action);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot flee');
    });
  });

  describe('applyStatusEffects', () => {
    it('should apply poison damage', () => {
      const combatants: Combatant[] = [
        {
          ...createPlayerCombatant('Player', mockPlayerStats, null),
          statusEffects: [{ type: 'poisoned', turnsRemaining: 3, value: 5 }],
        },
      ];

      const { combatants: updated, results } = applyStatusEffects(combatants);

      expect(updated[0].stats.hp).toBe(95); // 100 - 5
      expect(results).toHaveLength(1);
      expect(results[0].damage).toBe(5);
    });

    it('should decrement effect duration', () => {
      const combatants: Combatant[] = [
        {
          ...createPlayerCombatant('Player', mockPlayerStats, null),
          statusEffects: [{ type: 'buffed', turnsRemaining: 2, value: 10 }],
        },
      ];

      const { combatants: updated } = applyStatusEffects(combatants);

      expect(updated[0].statusEffects[0].turnsRemaining).toBe(1);
    });

    it('should remove expired effects', () => {
      const combatants: Combatant[] = [
        {
          ...createPlayerCombatant('Player', mockPlayerStats, null),
          statusEffects: [{ type: 'buffed', turnsRemaining: 1, value: 10 }],
        },
      ];

      const { combatants: updated } = applyStatusEffects(combatants);

      expect(updated[0].statusEffects).toHaveLength(0);
    });

    it('should kill combatants at 0 HP', () => {
      const combatants: Combatant[] = [
        {
          ...createPlayerCombatant('Player', { ...mockPlayerStats, hp: 3 }, null),
          statusEffects: [{ type: 'poisoned', turnsRemaining: 3, value: 5 }],
        },
      ];

      const { combatants: updated } = applyStatusEffects(combatants);

      expect(updated[0].stats.hp).toBe(0);
      expect(updated[0].isAlive).toBe(false);
    });
  });

  describe('checkCombatEnd', () => {
    it('should return defeat when player dies', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      const updatedCombatants = state.combatants.map((c) =>
        c.isPlayer ? { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } } : c
      );

      const result = checkCombatEnd({ ...state, combatants: updatedCombatants });

      expect(result).toBe('defeat');
    });

    it('should return victory when all enemies die', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      const updatedCombatants = state.combatants.map((c) =>
        c.type === 'enemy' ? { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } } : c
      );

      const result = checkCombatEnd({ ...state, combatants: updatedCombatants });

      expect(result).toBe('victory');
    });

    it('should return null when combat continues', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);

      const result = checkCombatEnd(state);

      expect(result).toBeNull();
    });
  });

  describe('calculateRewards', () => {
    it('should calculate total rewards', () => {
      let state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      // Kill all enemies
      const updatedCombatants = state.combatants.map((c) =>
        c.type === 'enemy' ? { ...c, isAlive: false } : c
      );
      state = { ...state, combatants: updatedCombatants };

      const rewards = calculateRewards(state, mockEncounter);

      // Base 50 XP + 20 per enemy (2 enemies) = 90
      expect(rewards.xp).toBe(90);
      // Base 20 gold + 10 per enemy (2 enemies) = 40
      expect(rewards.gold).toBe(40);
    });
  });

  describe('getValidTargets', () => {
    it('should return enemies for player', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);

      const targets = getValidTargets(state, 'player');

      expect(targets.every((t) => t.type === 'enemy')).toBe(true);
      expect(targets).toHaveLength(2);
    });

    it('should return player for enemies', () => {
      const state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;

      const targets = getValidTargets(state, enemyId!);

      expect(targets.some((t) => t.isPlayer)).toBe(true);
    });

    it('should exclude dead combatants', () => {
      let state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      const deadEnemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const updatedCombatants = state.combatants.map((c) =>
        c.id === deadEnemyId ? { ...c, isAlive: false } : c
      );
      state = { ...state, combatants: updatedCombatants };

      const targets = getValidTargets(state, 'player');

      expect(targets.find((t) => t.id === deadEnemyId)).toBeUndefined();
    });
  });

  describe('isActionValid', () => {
    let state: CombatState;
    let player: Combatant;

    beforeEach(() => {
      state = initializeCombat(mockEncounter, mockContext, getEnemyById);
      player = state.combatants.find((c) => c.isPlayer)!;
    });

    it('should allow valid attack', () => {
      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const action: CombatAction = { type: 'attack', actorId: 'player', targetId: enemyId };

      const result = isActionValid(state, action, player);

      expect(result.valid).toBe(true);
    });

    it('should reject attack without target', () => {
      const action: CombatAction = { type: 'attack', actorId: 'player' };

      const result = isActionValid(state, action, player);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('target');
    });

    it('should reject flee when not allowed', () => {
      state = { ...state, canFlee: false };
      const action: CombatAction = { type: 'flee', actorId: 'player' };

      const result = isActionValid(state, action, player);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('flee');
    });

    it('should reject action from dead combatant', () => {
      const deadPlayer = { ...player, isAlive: false };
      const action: CombatAction = { type: 'defend', actorId: 'player' };

      const result = isActionValid(state, action, deadPlayer);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('dead');
    });

    it('should reject action from stunned combatant', () => {
      const stunnedPlayer = {
        ...player,
        statusEffects: [{ type: 'stunned' as const, turnsRemaining: 1, value: 0 }],
      };
      const action: CombatAction = { type: 'defend', actorId: 'player' };

      const result = isActionValid(state, action, stunnedPlayer);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('stunned');
    });
  });
});
