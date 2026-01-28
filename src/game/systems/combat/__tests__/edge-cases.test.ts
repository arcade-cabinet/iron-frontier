/**
 * Edge case tests for combat system
 *
 * Tests unusual scenarios, boundary conditions, and error handling
 */

import { describe, expect, it } from '@jest/globals';
import type { CombatEncounter, EnemyDefinition } from '../../../data/schemas/combat';
import {
    applyStatusEffectModifiers,
    calculateDamage,
    calculateHitChance,
    calculateStatusEffectDamage,
    createQuickCombat,
    executeAttack,
    getValidTargets,
    initializeCombat,
    isActionValid,
    processAction,
} from '../index';
import type {
    Combatant,
    CombatInitContext,
    CombatStats,
    StatusEffect,
} from '../types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

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

const mockEnemy: EnemyDefinition = {
  id: 'test_enemy',
  name: 'Test Enemy',
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
  enemies: [{ enemyId: 'test_enemy', count: 1 }],
  minLevel: 1,
  isBoss: false,
  canFlee: true,
  rewards: {
    xp: 50,
    gold: 20,
    items: [],
  },
  tags: ['test'],
};

function getEnemyById(id: string): EnemyDefinition | undefined {
  if (id === 'test_enemy') return mockEnemy;
  return undefined;
}

// ============================================================================
// TESTS
// ============================================================================

describe('Combat Edge Cases', () => {
  describe('Extreme Stat Values', () => {
    it('should handle zero attack power', () => {
      const result = calculateDamage(
        {
          attackPower: 0,
          defenderDefense: 10,
          isDefenderDefending: false,
          isCritical: false,
        },
        0.5
      );

      expect(result.finalDamage).toBeGreaterThanOrEqual(1); // Minimum damage
    });

    it('should handle very high defense', () => {
      const result = calculateDamage(
        {
          attackPower: 10,
          defenderDefense: 1000,
          isDefenderDefending: false,
          isCritical: false,
        },
        0.5
      );

      expect(result.finalDamage).toBe(1); // Minimum damage
    });

    it('should handle zero defense', () => {
      const result = calculateDamage(
        {
          attackPower: 20,
          defenderDefense: 0,
          isDefenderDefending: false,
          isCritical: false,
        },
        0.5
      );

      expect(result.finalDamage).toBe(20);
    });

    it('should handle 100% fatigue penalty', () => {
      const result = calculateDamage(
        {
          attackPower: 100,
          defenderDefense: 0,
          isDefenderDefending: false,
          isCritical: false,
          fatiguePenalty: 100,
        },
        0.5
      );

      expect(result.finalDamage).toBe(70); // 30% penalty at max fatigue
    });

    it('should handle negative fatigue (clamped to 0)', () => {
      const result = calculateDamage(
        {
          attackPower: 100,
          defenderDefense: 0,
          isDefenderDefending: false,
          isCritical: false,
          fatiguePenalty: -50,
        },
        0.5
      );

      expect(result.finalDamage).toBe(100); // No penalty
    });

    it('should handle fatigue over 100 (clamped to 100)', () => {
      const result = calculateDamage(
        {
          attackPower: 100,
          defenderDefense: 0,
          isDefenderDefending: false,
          isCritical: false,
          fatiguePenalty: 150,
        },
        0.5
      );

      expect(result.finalDamage).toBe(70); // Max penalty
    });

    it('should handle zero type effectiveness', () => {
      const result = calculateDamage(
        {
          attackPower: 100,
          defenderDefense: 0,
          isDefenderDefending: false,
          isCritical: false,
          typeEffectiveness: 0,
        },
        0.5
      );

      expect(result.finalDamage).toBe(1); // Minimum damage
    });

    it('should handle very high type effectiveness', () => {
      const result = calculateDamage(
        {
          attackPower: 10,
          defenderDefense: 0,
          isDefenderDefending: false,
          isCritical: false,
          typeEffectiveness: 10.0,
        },
        0.5
      );

      expect(result.finalDamage).toBe(100);
    });
  });

  describe('Hit Chance Edge Cases', () => {
    it('should clamp hit chance to minimum 5%', () => {
      const hitChance = calculateHitChance(0, 100);
      expect(hitChance).toBe(5);
    });

    it('should clamp hit chance to maximum 95%', () => {
      const hitChance = calculateHitChance(200, 0);
      expect(hitChance).toBe(95);
    });

    it('should handle negative accuracy', () => {
      const hitChance = calculateHitChance(-50, 10);
      expect(hitChance).toBe(5); // Clamped to minimum
    });

    it('should handle negative evasion', () => {
      const hitChance = calculateHitChance(50, -10);
      expect(hitChance).toBe(60);
    });
  });

  describe('Status Effect Edge Cases', () => {
    it('should handle bleeding with 0 max HP', () => {
      const effect: StatusEffect = {
        type: 'bleeding',
        turnsRemaining: 3,
        value: 10,
      };

      const damage = calculateStatusEffectDamage(effect, 0);
      expect(damage).toBeGreaterThanOrEqual(1); // Minimum damage
    });

    it('should handle very high bleeding percentage', () => {
      const effect: StatusEffect = {
        type: 'bleeding',
        turnsRemaining: 3,
        value: 100, // 100% of max HP
      };

      const damage = calculateStatusEffectDamage(effect, 100);
      expect(damage).toBe(100);
    });

    it('should handle multiple status effects stacking', () => {
      const baseStats: CombatStats = {
        hp: 100,
        maxHP: 100,
        attack: 20,
        defense: 10,
        speed: 15,
        accuracy: 75,
        evasion: 10,
        critChance: 10,
        critMultiplier: 1.5,
      };

      const effects: StatusEffect[] = [
        { type: 'buffed', turnsRemaining: 2, value: 20 },
        { type: 'debuffed', turnsRemaining: 2, value: 10 },
      ];

      const modifiedStats = applyStatusEffectModifiers(baseStats, effects);

      // Buff increases attack by 20%, debuff decreases by 10%
      // 20 * 1.2 = 24, then 24 * 0.9 = 21.6 -> 21
      expect(modifiedStats.attack).toBe(21);
    });

    it('should handle stunned effect setting speed to 0', () => {
      const baseStats: CombatStats = {
        hp: 100,
        maxHP: 100,
        attack: 20,
        defense: 10,
        speed: 15,
        accuracy: 75,
        evasion: 10,
        critChance: 10,
        critMultiplier: 1.5,
      };

      const effects: StatusEffect[] = [
        { type: 'stunned', turnsRemaining: 1, value: 0 },
      ];

      const modifiedStats = applyStatusEffectModifiers(baseStats, effects);

      expect(modifiedStats.speed).toBe(0);
    });

    it('should handle defending effect increasing defense', () => {
      const baseStats: CombatStats = {
        hp: 100,
        maxHP: 100,
        attack: 20,
        defense: 10,
        speed: 15,
        accuracy: 75,
        evasion: 10,
        critChance: 10,
        critMultiplier: 1.5,
      };

      const effects: StatusEffect[] = [
        { type: 'defending', turnsRemaining: 1, value: 50 },
      ];

      const modifiedStats = applyStatusEffectModifiers(baseStats, effects);

      expect(modifiedStats.defense).toBe(15); // 10 * 1.5
    });
  });

  describe('Combat Action Edge Cases', () => {
    it('should handle attack with no valid targets', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: mockEnemy, count: 1 }],
        true
      );

      // Kill all enemies
      const updatedCombatants = state.combatants.map((c) => {
        if (c.type === 'enemy') {
          return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
        }
        return c;
      });

      const updatedState = { ...state, combatants: updatedCombatants };

      const { result } = processAction(updatedState, {
        type: 'attack',
        actorId: 'player',
        targetId: 'invalid_target',
      });

      expect(result.success).toBe(false);
    });

    it('should handle item action without item ID', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: mockEnemy, count: 1 }],
        true
      );

      const { result } = processAction(state, {
        type: 'item',
        actorId: 'player',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('No item');
    });

    it('should handle skill action (not implemented)', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: mockEnemy, count: 1 }],
        true
      );

      const { result } = processAction(state, {
        type: 'skill',
        actorId: 'player',
        skillId: 'fireball',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('not yet implemented');
    });

    it('should handle action from invalid actor', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: mockEnemy, count: 1 }],
        true
      );

      const { result } = processAction(state, {
        type: 'defend',
        actorId: 'invalid_actor',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('not available');
    });

    it('should validate action from combatant who already acted', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: mockEnemy, count: 1 }],
        true
      );

      const player = state.combatants.find((c) => c.isPlayer);
      if (player) {
        player.hasActedThisTurn = true;
      }

      const validation = isActionValid(
        state,
        { type: 'attack', actorId: 'player', targetId: 'enemy' },
        player!
      );

      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('already acted');
    });

    it('should validate item action without item ID', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: mockEnemy, count: 1 }],
        true
      );

      const player = state.combatants.find((c) => c.isPlayer);

      const validation = isActionValid(
        state,
        { type: 'item', actorId: 'player' },
        player!
      );

      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('item');
    });
  });

  describe('Combat Initialization Edge Cases', () => {
    it('should handle encounter with no enemies', () => {
      const emptyEncounter: CombatEncounter = {
        ...mockEncounter,
        enemies: [],
      };

      const context: CombatInitContext = {
        encounterId: 'empty_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: null,
      };

      const state = initializeCombat(emptyEncounter, context, getEnemyById);

      expect(state.combatants).toHaveLength(1); // Only player
    });

    it('should handle missing enemy definition', () => {
      const invalidEncounter: CombatEncounter = {
        ...mockEncounter,
        enemies: [{ enemyId: 'nonexistent_enemy', count: 2 }],
      };

      const context: CombatInitContext = {
        encounterId: 'invalid_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: null,
      };

      const state = initializeCombat(invalidEncounter, context, getEnemyById);

      expect(state.combatants).toHaveLength(1); // Only player, enemies skipped
    });

    it('should handle zero enemy count', () => {
      const zeroCountEncounter: CombatEncounter = {
        ...mockEncounter,
        enemies: [{ enemyId: 'test_enemy', count: 0 }],
      };

      const context: CombatInitContext = {
        encounterId: 'zero_count',
        playerStats: mockPlayerStats,
        playerName: 'Hero',
        playerWeaponId: null,
      };

      const state = initializeCombat(zeroCountEncounter, context, getEnemyById);

      expect(state.combatants).toHaveLength(1); // Only player
    });
  });

  describe('Convenience Function Edge Cases', () => {
    it('should handle executeAttack with defending target', () => {
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
        statusEffects: [
          { type: 'defending' as const, turnsRemaining: 1, value: 50 },
        ],
      } as Combatant;

      const result = executeAttack(attacker, defender, {
        hitRoll: 0.5,
        critRoll: 0.9,
        damageVariance: 0.5,
      });

      expect(result.hit).toBe(true);
      // Damage should be reduced due to defending
      expect(result.damage).toBeLessThan(15);
    });

    it('should handle getValidTargets with no combatants', () => {
      const state = createQuickCombat(
        mockPlayerStats,
        [{ definition: mockEnemy, count: 1 }],
        true
      );

      // Kill all combatants
      const updatedCombatants = state.combatants.map((c) => ({
        ...c,
        isAlive: false,
        stats: { ...c.stats, hp: 0 },
      }));

      const updatedState = { ...state, combatants: updatedCombatants };

      const targets = getValidTargets(updatedState, 'player');

      expect(targets).toHaveLength(0);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle exactly 1 HP remaining', () => {
      const state = createQuickCombat(
        { ...mockPlayerStats, hp: 1 },
        [{ definition: mockEnemy, count: 1 }],
        true
      );

      const player = state.combatants.find((c) => c.isPlayer);
      expect(player?.stats.hp).toBe(1);
      expect(player?.isAlive).toBe(true);
    });

    it('should handle exactly 0 HP', () => {
      const state = createQuickCombat(
        { ...mockPlayerStats, hp: 0 },
        [{ definition: mockEnemy, count: 1 }],
        true
      );

      // Player should still be created but with 0 HP
      const player = state.combatants.find((c) => c.isPlayer);
      expect(player?.stats.hp).toBe(0);
    });

    it('should handle 100% accuracy vs 0% evasion', () => {
      const hitChance = calculateHitChance(100, 0);
      expect(hitChance).toBe(95); // Capped at 95%
    });

    it('should handle 0% accuracy vs 100% evasion', () => {
      const hitChance = calculateHitChance(0, 100);
      expect(hitChance).toBe(5); // Capped at 5%
    });

    it('should handle critical hit with 0% crit chance', () => {
      const result = calculateDamage(
        {
          attackPower: 20,
          defenderDefense: 10,
          isDefenderDefending: false,
          isCritical: false,
          critMultiplier: 2.0,
        },
        0.5
      );

      expect(result.critMultiplierApplied).toBe(1.0);
    });

    it('should handle critical hit with 100% crit chance', () => {
      const result = calculateDamage(
        {
          attackPower: 20,
          defenderDefense: 10,
          isDefenderDefending: false,
          isCritical: true,
          critMultiplier: 2.0,
        },
        0.5
      );

      expect(result.critMultiplierApplied).toBe(2.0);
      expect(result.finalDamage).toBeGreaterThan(15);
    });
  });
});
