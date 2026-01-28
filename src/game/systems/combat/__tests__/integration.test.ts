/**
 * Integration tests for the complete combat system
 *
 * These tests verify that all combat components work together correctly
 * in realistic combat scenarios.
 */

import { describe, expect, it } from '@jest/globals';
import type { CombatEncounter, EnemyDefinition } from '../../../data/schemas/combat';
import {
    advanceTurn,
    calculateRewards,
    createQuickCombat,
    executeAttack,
    getCombatOutcome,
    initializeCombat,
    processAction,
    runAITurn,
    updateCombatPhase,
} from '../index';
import type {
    CombatInitContext,
    CombatStats,
    Combatant
} from '../types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const mockPlayerStats: CombatStats = {
  hp: 100,
  maxHP: 100,
  attack: 20,
  defense: 8,
  speed: 12,
  accuracy: 80,
  evasion: 15,
  critChance: 15,
  critMultiplier: 1.5,
};

const weakEnemy: EnemyDefinition = {
  id: 'weak_bandit',
  name: 'Weak Bandit',
  type: 'bandit',
  faction: 'raiders',
  maxHealth: 20,
  actionPoints: 4,
  baseDamage: 5,
  armor: 2,
  accuracyMod: 0,
  evasion: 5,
  xpReward: 10,
  goldReward: 5,
  behavior: 'aggressive',
  tags: ['test'],
};

const strongEnemy: EnemyDefinition = {
  id: 'strong_bandit',
  name: 'Strong Bandit',
  type: 'bandit',
  faction: 'raiders',
  maxHealth: 50,
  actionPoints: 8,
  baseDamage: 15,
  armor: 10,
  accuracyMod: 5,
  evasion: 10,
  xpReward: 30,
  goldReward: 15,
  behavior: 'defensive',
  tags: ['test'],
};

const supportEnemy: EnemyDefinition = {
  id: 'support_bandit',
  name: 'Support Bandit',
  type: 'bandit',
  faction: 'raiders',
  maxHealth: 30,
  actionPoints: 6,
  baseDamage: 8,
  armor: 5,
  accuracyMod: 0,
  evasion: 8,
  xpReward: 15,
  goldReward: 8,
  behavior: 'support',
  tags: ['test'],
};

const easyEncounter: CombatEncounter = {
  id: 'easy_encounter',
  name: 'Easy Fight',
  enemies: [{ enemyId: 'weak_bandit', count: 1 }],
  minLevel: 1,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 20,
    gold: 10,
    items: [],
  },
  tags: ['test'],
};

const hardEncounter: CombatEncounter = {
  id: 'hard_encounter',
  name: 'Hard Fight',
  enemies: [
    { enemyId: 'strong_bandit', count: 1 },
    { enemyId: 'weak_bandit', count: 2 },
  ],
  minLevel: 3,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 100,
    gold: 50,
    items: [{ itemId: 'rare_item', quantity: 1, chance: 0.5 }],
  },
  tags: ['test'],
};

const bossEncounter: CombatEncounter = {
  id: 'boss_encounter',
  name: 'Boss Fight',
  enemies: [{ enemyId: 'strong_bandit', count: 1 }],
  minLevel: 5,
  isBoss: true,
  canFlee: false,
  rewards: {
    xp: 200,
    gold: 100,
    items: [{ itemId: 'legendary_item', quantity: 1, chance: 1.0 }],
  },
  tags: ['test', 'boss'],
};

function getEnemyById(id: string): EnemyDefinition | undefined {
  const enemies: Record<string, EnemyDefinition> = {
    weak_bandit: weakEnemy,
    strong_bandit: strongEnemy,
    support_bandit: supportEnemy,
  };
  return enemies[id];
}

// ============================================================================
// TESTS
// ============================================================================

describe('Combat System Integration', () => {
  describe('Complete Combat Flow', () => {
    it('should run a complete easy combat to victory', () => {
      const context: CombatInitContext = {
        encounterId: 'easy_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: 'revolver',
      };

      let state = initializeCombat(easyEncounter, context, getEnemyById);

      // Player turn - attack
      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const attackAction = {
        type: 'attack' as const,
        actorId: 'player',
        targetId: enemyId,
      };

      // Execute multiple attacks until enemy dies
      let turnCount = 0;
      const maxTurns = 20;

      while (getCombatOutcome(state) === 'ongoing' && turnCount < maxTurns) {
        const currentCombatant = state.combatants.find(
          (c) => c.id === state.turnOrder[state.currentTurnIndex]
        );

        if (currentCombatant?.isPlayer) {
          // Player attacks
          const { state: newState } = processAction(state, attackAction, {
            hitRoll: 0.5,
            critRoll: 0.5,
            damageVariance: 0.5,
          });
          state = newState;
        } else if (currentCombatant) {
          // AI turn
          const aiResult = runAITurn(state, currentCombatant.id, {
            targetRoll: 0.5,
            actionRoll: 0.5,
            hitRoll: 0.5,
            critRoll: 0.9,
            damageVariance: 0.5,
          });

          if (aiResult) {
            state = aiResult.state;
          }
        }

        state = updateCombatPhase(state);

        if (getCombatOutcome(state) === 'ongoing') {
          state = advanceTurn(state);
        }

        turnCount++;
      }

      expect(getCombatOutcome(state)).toBe('player_wins');
      expect(state.phase).toBe('victory');

      const rewards = calculateRewards(state, easyEncounter);
      expect(rewards.xp).toBeGreaterThan(0);
      expect(rewards.gold).toBeGreaterThan(0);
    });

    it('should handle player defeat', () => {
      // Create a combat where player is very weak
      const weakPlayerStats: CombatStats = {
        ...mockPlayerStats,
        hp: 10,
        maxHP: 10,
        attack: 1,
        defense: 0,
      };

      const context: CombatInitContext = {
        encounterId: 'hard_encounter',
        playerStats: weakPlayerStats,
        playerName: 'Weak Hero',
        playerWeaponId: null,
      };

      let state = initializeCombat(hardEncounter, context, getEnemyById);

      // Run combat until player dies
      let turnCount = 0;
      const maxTurns = 20;

      while (getCombatOutcome(state) === 'ongoing' && turnCount < maxTurns) {
        const currentCombatant = state.combatants.find(
          (c) => c.id === state.turnOrder[state.currentTurnIndex]
        );

        if (currentCombatant?.isPlayer) {
          // Player defends
          const { state: newState } = processAction(
            state,
            { type: 'defend', actorId: 'player' }
          );
          state = newState;
        } else if (currentCombatant) {
          // AI attacks
          const aiResult = runAITurn(state, currentCombatant.id, {
            targetRoll: 0.5,
            actionRoll: 0.5,
            hitRoll: 0.1, // Force hit
            critRoll: 0.9,
            damageVariance: 0.5,
          });

          if (aiResult) {
            state = aiResult.state;
          }
        }

        state = updateCombatPhase(state);

        if (getCombatOutcome(state) === 'ongoing') {
          state = advanceTurn(state);
        }

        turnCount++;
      }

      expect(getCombatOutcome(state)).toBe('enemy_wins');
      expect(state.phase).toBe('defeat');
    });

    it('should handle successful flee', () => {
      const context: CombatInitContext = {
        encounterId: 'easy_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: null,
      };

      let state = initializeCombat(easyEncounter, context, getEnemyById);

      // Attempt to flee
      const { state: newState } = processAction(
        state,
        { type: 'flee', actorId: 'player' },
        { hitRoll: 0.01 } // Force success
      );

      expect(newState.phase).toBe('fled');
      expect(getCombatOutcome(newState)).toBe('fled');
    });

    it('should prevent flee in boss fights', () => {
      const context: CombatInitContext = {
        encounterId: 'boss_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: null,
      };

      const state = initializeCombat(bossEncounter, context, getEnemyById);

      // Attempt to flee
      const { result } = processAction(
        state,
        { type: 'flee', actorId: 'player' }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot flee');
    });
  });

  describe('Multi-Enemy Combat', () => {
    it('should handle combat with multiple enemies', () => {
      const context: CombatInitContext = {
        encounterId: 'hard_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: 'revolver',
      };

      const state = initializeCombat(hardEncounter, context, getEnemyById);

      expect(state.combatants.filter((c) => c.type === 'enemy')).toHaveLength(3);
      expect(state.turnOrder.length).toBe(4); // 1 player + 3 enemies
    });

    it('should update turn order when enemies die', () => {
      const context: CombatInitContext = {
        encounterId: 'hard_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: null,
      };

      let state = initializeCombat(hardEncounter, context, getEnemyById);

      // Kill one enemy
      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const updatedCombatants = state.combatants.map((c) => {
        if (c.id === enemyId) {
          return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
        }
        return c;
      });

      state = { ...state, combatants: updatedCombatants };
      
      // Advance turn will skip dead combatants
      const initialIndex = state.currentTurnIndex;
      state = advanceTurn(state);

      // Verify the turn advanced
      expect(state.currentTurnIndex).not.toBe(initialIndex);
      
      // Verify current combatant is alive
      const currentCombatant = state.combatants.find(
        (c) => c.id === state.turnOrder[state.currentTurnIndex]
      );
      expect(currentCombatant?.isAlive).toBe(true);
    });
  });

  describe('Status Effects in Combat', () => {
    it('should apply poison damage over time', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: weakEnemy, count: 1 }],
        true
      );

      // Apply poison to player
      const poisonedCombatants = state.combatants.map((c) => {
        if (c.isPlayer) {
          return {
            ...c,
            statusEffects: [
              {
                type: 'poisoned' as const,
                turnsRemaining: 3,
                value: 5,
              },
            ],
          };
        }
        return c;
      });

      const stateWithPoison = { ...state, combatants: poisonedCombatants };
      const player = stateWithPoison.combatants.find((c) => c.isPlayer);
      const initialHP = player?.stats.hp || 0;

      // Apply status effects manually (this is what happens at turn/round start)
      const { combatants: updatedCombatants } = require('../engine').applyStatusEffects(
        stateWithPoison.combatants
      );

      const updatedPlayer = updatedCombatants.find((c: Combatant) => c.isPlayer);
      expect(updatedPlayer?.stats.hp).toBeLessThan(initialHP);
      expect(updatedPlayer?.stats.hp).toBe(initialHP - 5); // Poison deals 5 damage
    });

    it('should remove expired status effects', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: weakEnemy, count: 1 }],
        true
      );

      // Apply short-duration buff
      const buffedCombatants = state.combatants.map((c) => {
        if (c.isPlayer) {
          return {
            ...c,
            statusEffects: [
              {
                type: 'buffed' as const,
                turnsRemaining: 1,
                value: 20,
              },
            ],
          };
        }
        return c;
      });

      const stateWithBuff = { ...state, combatants: buffedCombatants };
      const player = stateWithBuff.combatants.find((c) => c.isPlayer);
      expect(player?.statusEffects).toHaveLength(1);

      // Apply status effects (this decrements and removes expired effects)
      const { combatants: updatedCombatants } = require('../engine').applyStatusEffects(
        stateWithBuff.combatants
      );

      const updatedPlayer = updatedCombatants.find((c: Combatant) => c.isPlayer);
      expect(updatedPlayer?.statusEffects).toHaveLength(0);
    });

    it('should apply defending status correctly', () => {
      const context: CombatInitContext = {
        encounterId: 'easy_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: null,
      };

      let state = initializeCombat(easyEncounter, context, getEnemyById);

      // Player defends
      const { state: newState } = processAction(state, {
        type: 'defend',
        actorId: 'player',
      });

      const player = newState.combatants.find((c) => c.isPlayer);
      expect(player?.statusEffects.some((e) => e.type === 'defending')).toBe(true);
    });
  });

  describe('AI Behavior Patterns', () => {
    it('should have aggressive enemies always attack', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: weakEnemy, count: 1 }],
        true
      );

      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const aiResult = runAITurn(state, enemyId!, {
        targetRoll: 0.5,
        actionRoll: 0.5,
        hitRoll: 0.5,
        critRoll: 0.9,
        damageVariance: 0.5,
      });

      expect(aiResult).not.toBeNull();
      expect(aiResult?.result.action.type).toBe('attack');
    });

    it('should have defensive enemies defend when low HP', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: strongEnemy, count: 1 }],
        true
      );

      // Damage the enemy
      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const updatedCombatants = state.combatants.map((c) => {
        if (c.id === enemyId) {
          return { ...c, stats: { ...c.stats, hp: 10 } }; // Low HP
        }
        return c;
      });

      const updatedState = { ...state, combatants: updatedCombatants };

      const aiResult = runAITurn(updatedState, enemyId!, {
        targetRoll: 0.5,
        actionRoll: 0.5,
      });

      expect(aiResult?.result.action.type).toBe('defend');
    });

    it('should have support enemies target threats', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: supportEnemy, count: 1 }],
        true
      );

      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const aiResult = runAITurn(state, enemyId!, {
        targetRoll: 0.5,
        actionRoll: 0.5,
        hitRoll: 0.5,
        critRoll: 0.9,
        damageVariance: 0.5,
      });

      expect(aiResult).not.toBeNull();
      expect(aiResult?.result.action.targetId).toBe('player');
    });
  });

  describe('Damage Calculation Edge Cases', () => {
    it('should handle zero damage attacks', () => {
      const weakPlayerStats: CombatStats = {
        ...mockPlayerStats,
        attack: 1,
      };

      const state = createQuickCombat(
        weakPlayerStats,
        [{ definition: strongEnemy, count: 1 }],
        true
      );

      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const { result } = processAction(
        state,
        { type: 'attack', actorId: 'player', targetId: enemyId },
        { hitRoll: 0.1, critRoll: 0.9, damageVariance: 0.5 }
      );

      // Should deal at least minimum damage
      expect(result.damage).toBeGreaterThanOrEqual(1);
    });

    it('should handle critical hits correctly', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: weakEnemy, count: 1 }],
        true
      );

      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const { result } = processAction(
        state,
        { type: 'attack', actorId: 'player', targetId: enemyId },
        { hitRoll: 0.1, critRoll: 0.01, damageVariance: 0.5 } // Force crit
      );

      expect(result.isCritical).toBe(true);
      expect(result.damage).toBeGreaterThan(10);
    });

    it('should handle misses correctly', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: weakEnemy, count: 1 }],
        true
      );

      const enemyId = state.combatants.find((c) => c.type === 'enemy')?.id;
      const { result } = processAction(
        state,
        { type: 'attack', actorId: 'player', targetId: enemyId },
        { hitRoll: 0.99 } // Force miss
      );

      expect(result.success).toBe(false);
      expect(result.wasDodged).toBe(true);
      expect(result.damage).toBeUndefined();
    });
  });

  describe('Reward Calculation', () => {
    it('should calculate rewards correctly', () => {
      const context: CombatInitContext = {
        encounterId: 'hard_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: null,
      };

      let state = initializeCombat(hardEncounter, context, getEnemyById);

      // Kill all enemies
      const updatedCombatants = state.combatants.map((c) => {
        if (c.type === 'enemy') {
          return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
        }
        return c;
      });

      state = { ...state, combatants: updatedCombatants, phase: 'victory' };

      const rewards = calculateRewards(state, hardEncounter);

      // Base 100 XP + enemy rewards (30 + 10 + 10)
      expect(rewards.xp).toBe(150);
      // Base 50 gold + enemy rewards (15 + 5 + 5)
      expect(rewards.gold).toBe(75);
    });

    it('should roll for loot drops', () => {
      const context: CombatInitContext = {
        encounterId: 'boss_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: null,
      };

      let state = initializeCombat(bossEncounter, context, getEnemyById);

      // Kill boss
      const updatedCombatants = state.combatants.map((c) => {
        if (c.type === 'enemy') {
          return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
        }
        return c;
      });

      state = { ...state, combatants: updatedCombatants, phase: 'victory' };

      const rewards = calculateRewards(state, bossEncounter);

      // Boss has 100% drop chance
      expect(rewards.loot.length).toBeGreaterThan(0);
      expect(rewards.loot[0].itemId).toBe('legendary_item');
    });
  });

  describe('Convenience Functions', () => {
    describe('executeAttack', () => {
      it('should execute a complete attack', () => {
        const attacker = {
          id: 'attacker',
          name: 'Attacker',
          stats: mockPlayerStats,
          statusEffects: [],
        } as Combatant;

        const defender = {
          id: 'defender',
          name: 'Defender',
          stats: { ...mockPlayerStats, hp: 50 },
          statusEffects: [],
        } as Combatant;

        const result = executeAttack(attacker, defender, {
          hitRoll: 0.5,
          critRoll: 0.9,
          damageVariance: 0.5,
        });

        expect(result.hit).toBe(true);
        expect(result.damage).toBeGreaterThan(0);
        expect(result.message).toContain('hits');
      });

      it('should handle misses', () => {
        const attacker = {
          id: 'attacker',
          name: 'Attacker',
          stats: mockPlayerStats,
          statusEffects: [],
        } as Combatant;

        const defender = {
          id: 'defender',
          name: 'Defender',
          stats: mockPlayerStats,
          statusEffects: [],
        } as Combatant;

        const result = executeAttack(attacker, defender, {
          hitRoll: 0.99,
        });

        expect(result.hit).toBe(false);
        expect(result.damage).toBe(0);
        expect(result.message).toContain('misses');
      });
    });

    describe('createQuickCombat', () => {
      it('should create a quick combat setup', () => {
        const state = createQuickCombat(
          mockPlayerStats,
          [
            { definition: weakEnemy, count: 2 },
            { definition: strongEnemy, count: 1 },
          ],
          true
        );

        expect(state.combatants).toHaveLength(4); // 1 player + 3 enemies
        expect(state.canFlee).toBe(true);
      });

      it('should set canFlee correctly', () => {
        const state = createQuickCombat(
          mockPlayerStats,
          [{ definition: weakEnemy, count: 1 }],
          false
        );

        expect(state.canFlee).toBe(false);
      });
    });
  });

  describe('Round Management', () => {
    it('should track rounds correctly', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: weakEnemy, count: 1 }],
        true
      );

      expect(state.round).toBe(1);

      // Advance through all combatants
      let newState = state;
      const turnCount = newState.turnOrder.length;

      for (let i = 0; i < turnCount; i++) {
        newState = advanceTurn(newState);
      }

      expect(newState.round).toBeGreaterThan(1);
    });

    it('should apply status effects at round start', () => {
      let state = createQuickCombat(
        mockPlayerStats,
        [{ definition: weakEnemy, count: 1 }],
        true
      );

      // Add poison to player
      const poisonedCombatants = state.combatants.map((c) => {
        if (c.isPlayer) {
          return {
            ...c,
            statusEffects: [
              {
                type: 'poisoned' as const,
                turnsRemaining: 3,
                value: 5,
              },
            ],
          };
        }
        return c;
      });

      state = { ...state, combatants: poisonedCombatants };
      const player = state.combatants.find((c) => c.isPlayer);
      const initialHP = player?.stats.hp || 0;

      // Apply status effects manually
      const { combatants: updatedCombatants } = require('../engine').applyStatusEffects(
        state.combatants
      );

      const updatedPlayer = updatedCombatants.find((c: Combatant) => c.isPlayer);
      expect(updatedPlayer?.stats.hp).toBeLessThan(initialHP);
      expect(updatedPlayer?.stats.hp).toBe(initialHP - 5);
    });
  });
});
