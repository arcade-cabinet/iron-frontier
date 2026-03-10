/**
 * Tests for the combat AI system
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import type { CombatEncounter, EnemyDefinition } from '../../../data/schemas/combat';
import {
    decideAction,
    evaluateSituation,
    getAIAction,
    selectTarget,
    shouldUseItem,
} from '../ai';
import {
    createPlayerCombatant,
    initializeCombat
} from '../engine';
import type {
    Combatant,
    CombatInitContext,
    CombatState,
    CombatStats
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
    items: [],
  },
  tags: ['test'],
};

function getEnemyById(id: string): EnemyDefinition | undefined {
  if (id === 'test_bandit') return mockEnemy;
  return undefined;
}

function createTestCombatState(): CombatState {
  const context: CombatInitContext = {
    encounterId: 'test_encounter',
    playerStats: mockPlayerStats,
    playerName: 'Test Player',
    playerWeaponId: 'revolver',
  };

  return initializeCombat(mockEncounter, context, getEnemyById);
}

// ============================================================================
// TESTS
// ============================================================================

describe('Combat AI', () => {
  describe('selectTarget', () => {
    let state: CombatState;
    let enemyId: string;

    beforeEach(() => {
      state = createTestCombatState();
      enemyId = state.combatants.find((c) => c.type === 'enemy')?.id || '';
    });

    describe('lowest_hp strategy', () => {
      it('should select target with lowest HP', () => {
        // Set different HP values
        const updatedCombatants = state.combatants.map((c) => {
          if (c.isPlayer) {
            return { ...c, stats: { ...c.stats, hp: 50 } };
          }
          return c;
        });

        const target = selectTarget(
          { ...state, combatants: updatedCombatants },
          enemyId,
          'lowest_hp',
          0.5
        );

        expect(target).toBeDefined();
        expect(target?.isPlayer).toBe(true);
        expect(target?.stats.hp).toBe(50);
      });

      it('should handle multiple targets with same HP', () => {
        const target = selectTarget(state, enemyId, 'lowest_hp', 0.5);

        expect(target).toBeDefined();
        expect(target?.isPlayer || target?.type === 'ally').toBe(true);
      });
    });

    describe('highest_threat strategy', () => {
      it('should select target with highest attack', () => {
        // Add an ally with lower attack
        const ally: Combatant = {
          ...createPlayerCombatant('Ally', mockPlayerStats, null),
          id: 'ally_1',
          type: 'ally',
          isPlayer: false,
          stats: { ...mockPlayerStats, attack: 5 },
        };

        const updatedCombatants = [...state.combatants, ally];

        const target = selectTarget(
          { ...state, combatants: updatedCombatants },
          enemyId,
          'highest_threat',
          0.5
        );

        expect(target).toBeDefined();
        expect(target?.stats.attack).toBeGreaterThanOrEqual(15);
      });

      it('should consider status effect modifiers', () => {
        // Debuff the player
        const updatedCombatants = state.combatants.map((c) => {
          if (c.isPlayer) {
            return {
              ...c,
              statusEffects: [{ type: 'debuffed' as const, turnsRemaining: 2, value: 50 }],
            };
          }
          return c;
        });

        const target = selectTarget(
          { ...state, combatants: updatedCombatants },
          enemyId,
          'highest_threat',
          0.5
        );

        expect(target).toBeDefined();
      });
    });

    describe('player_first strategy', () => {
      it('should always select player if available', () => {
        const target = selectTarget(state, enemyId, 'player_first', 0.5);

        expect(target).toBeDefined();
        expect(target?.isPlayer).toBe(true);
      });

      it('should select first available if no player', () => {
        // Remove player
        const updatedCombatants = state.combatants.filter((c) => !c.isPlayer);

        const target = selectTarget(
          { ...state, combatants: updatedCombatants },
          enemyId,
          'player_first',
          0.5
        );

        expect(target).toBeDefined();
      });
    });

    describe('random strategy', () => {
      it('should select first target with random value 0', () => {
        const target = selectTarget(state, enemyId, 'random', 0.0);

        expect(target).toBeDefined();
      });

      it('should select last target with random value near 1', () => {
        const target = selectTarget(state, enemyId, 'random', 0.99);

        expect(target).toBeDefined();
      });

      it('should select middle target with random value 0.5', () => {
        const target = selectTarget(state, enemyId, 'random', 0.5);

        expect(target).toBeDefined();
      });
    });

    it('should return null if no valid targets', () => {
      // Kill all valid targets
      const updatedCombatants = state.combatants.map((c) => {
        if (c.isPlayer || c.type === 'ally') {
          return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
        }
        return c;
      });

      const target = selectTarget(
        { ...state, combatants: updatedCombatants },
        enemyId,
        'random',
        0.5
      );

      expect(target).toBeNull();
    });

    it('should return null if actor not found', () => {
      const target = selectTarget(state, 'invalid_id', 'random', 0.5);

      expect(target).toBeNull();
    });
  });

  describe('decideAction', () => {
    let state: CombatState;
    let enemyId: string;

    beforeEach(() => {
      state = createTestCombatState();
      enemyId = state.combatants.find((c) => c.type === 'enemy')?.id || '';
    });

    describe('aggressive behavior', () => {
      it('should always attack', () => {
        const decision = decideAction(state, enemyId, {
          targetRoll: 0.5,
          actionRoll: 0.5,
        });

        expect(decision).toBeDefined();
        expect(decision?.action.type).toBe('attack');
        expect(decision?.action.targetId).toBeDefined();
        expect(decision?.priority).toBe(100);
      });

      it('should target lowest HP enemy', () => {
        // Set player to low HP
        const updatedCombatants = state.combatants.map((c) => {
          if (c.isPlayer) {
            return { ...c, stats: { ...c.stats, hp: 10 } };
          }
          return c;
        });

        const decision = decideAction(
          { ...state, combatants: updatedCombatants },
          enemyId,
          { targetRoll: 0.5, actionRoll: 0.5 }
        );

        expect(decision?.action.targetId).toBe('player');
      });

      it('should defend if no targets available', () => {
        // Kill all valid targets
        const updatedCombatants = state.combatants.map((c) => {
          if (c.isPlayer || c.type === 'ally') {
            return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
          }
          return c;
        });

        const decision = decideAction(
          { ...state, combatants: updatedCombatants },
          enemyId,
          { targetRoll: 0.5, actionRoll: 0.5 }
        );

        expect(decision?.action.type).toBe('defend');
      });
    });

    describe('defensive behavior', () => {
      beforeEach(() => {
        // Set enemy to defensive behavior
        state = {
          ...state,
          combatants: state.combatants.map((c) => {
            if (c.id === enemyId) {
              return { ...c, behavior: 'defensive' as const };
            }
            return c;
          }),
        };
      });

      it('should defend when HP below 30%', () => {
        // Set enemy HP low
        const updatedCombatants = state.combatants.map((c) => {
          if (c.id === enemyId) {
            return { ...c, stats: { ...c.stats, hp: 8, maxHP: 30 } };
          }
          return c;
        });

        const decision = decideAction(
          { ...state, combatants: updatedCombatants },
          enemyId,
          { targetRoll: 0.5, actionRoll: 0.5 }
        );

        expect(decision?.action.type).toBe('defend');
      });

      it('should sometimes defend when HP below 50%', () => {
        // Set enemy HP medium
        const updatedCombatants = state.combatants.map((c) => {
          if (c.id === enemyId) {
            return { ...c, stats: { ...c.stats, hp: 14, maxHP: 30 } };
          }
          return c;
        });

        // Low action roll = defend
        const decision = decideAction(
          { ...state, combatants: updatedCombatants },
          enemyId,
          { targetRoll: 0.5, actionRoll: 0.3 }
        );

        expect(decision?.action.type).toBe('defend');
      });

      it('should attack when HP is stable', () => {
        const decision = decideAction(state, enemyId, {
          targetRoll: 0.5,
          actionRoll: 0.5,
        });

        expect(decision?.action.type).toBe('attack');
        expect(decision?.priority).toBe(80);
      });
    });

    describe('support behavior', () => {
      beforeEach(() => {
        state = {
          ...state,
          combatants: state.combatants.map((c) => {
            if (c.id === enemyId) {
              return { ...c, behavior: 'support' as const };
            }
            return c;
          }),
        };
      });

      it('should target highest threat', () => {
        const decision = decideAction(state, enemyId, {
          targetRoll: 0.5,
          actionRoll: 0.5,
        });

        expect(decision?.action.type).toBe('attack');
        expect(decision?.priority).toBe(70);
      });
    });

    describe('random behavior', () => {
      beforeEach(() => {
        state = {
          ...state,
          combatants: state.combatants.map((c) => {
            if (c.id === enemyId) {
              return { ...c, behavior: 'random' as const };
            }
            return c;
          }),
        };
      });

      it('should sometimes defend', () => {
        const decision = decideAction(state, enemyId, {
          targetRoll: 0.5,
          actionRoll: 0.1, // Low roll = defend
        });

        expect(decision?.action.type).toBe('defend');
        expect(decision?.priority).toBe(60);
      });

      it('should usually attack', () => {
        const decision = decideAction(state, enemyId, {
          targetRoll: 0.5,
          actionRoll: 0.5, // High roll = attack
        });

        expect(decision?.action.type).toBe('attack');
        expect(decision?.priority).toBe(50);
      });
    });

    describe('ranged behavior', () => {
      beforeEach(() => {
        state = {
          ...state,
          combatants: state.combatants.map((c) => {
            if (c.id === enemyId) {
              return { ...c, behavior: 'ranged' as const };
            }
            return c;
          }),
        };
      });

      it('should attack like aggressive', () => {
        const decision = decideAction(state, enemyId, {
          targetRoll: 0.5,
          actionRoll: 0.5,
        });

        expect(decision?.action.type).toBe('attack');
      });
    });

    it('should return null for invalid actor', () => {
      const decision = decideAction(state, 'invalid_id', {
        targetRoll: 0.5,
        actionRoll: 0.5,
      });

      expect(decision).toBeNull();
    });

    it('should return null for dead actor', () => {
      const updatedCombatants = state.combatants.map((c) => {
        if (c.id === enemyId) {
          return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
        }
        return c;
      });

      const decision = decideAction(
        { ...state, combatants: updatedCombatants },
        enemyId,
        { targetRoll: 0.5, actionRoll: 0.5 }
      );

      expect(decision).toBeNull();
    });

    it('should return null for player', () => {
      const decision = decideAction(state, 'player', {
        targetRoll: 0.5,
        actionRoll: 0.5,
      });

      expect(decision).toBeNull();
    });
  });

  describe('getAIAction', () => {
    let state: CombatState;
    let enemyId: string;

    beforeEach(() => {
      state = createTestCombatState();
      enemyId = state.combatants.find((c) => c.type === 'enemy')?.id || '';
    });

    it('should return action from decision', () => {
      const action = getAIAction(state, enemyId, {
        targetRoll: 0.5,
        actionRoll: 0.5,
      });

      expect(action).toBeDefined();
      expect(action?.type).toBe('attack');
      expect(action?.actorId).toBe(enemyId);
    });

    it('should return null if no decision', () => {
      const action = getAIAction(state, 'invalid_id', {
        targetRoll: 0.5,
        actionRoll: 0.5,
      });

      expect(action).toBeNull();
    });

    it('should use default random values', () => {
      const action = getAIAction(state, enemyId);

      expect(action).toBeDefined();
    });
  });

  describe('shouldUseItem', () => {
    let actor: Combatant;

    beforeEach(() => {
      actor = createPlayerCombatant('Test', mockPlayerStats, null);
    });

    it('should return null if no items available', () => {
      const result = shouldUseItem(actor, []);

      expect(result).toBeNull();
    });

    it('should return null if no items provided', () => {
      const result = shouldUseItem(actor);

      expect(result).toBeNull();
    });

    it('should return item when HP below 25%', () => {
      const lowHPActor = { ...actor, stats: { ...actor.stats, hp: 20 } };
      const result = shouldUseItem(lowHPActor, ['potion_001', 'potion_002']);

      expect(result).toBe('potion_001');
    });

    it('should return null when HP above 25%', () => {
      const result = shouldUseItem(actor, ['potion_001']);

      expect(result).toBeNull();
    });

    it('should return null at exactly 25% HP', () => {
      const actor25HP = { ...actor, stats: { ...actor.stats, hp: 25 } };
      const result = shouldUseItem(actor25HP, ['potion_001']);

      expect(result).toBeNull();
    });

    it('should return item at 24% HP', () => {
      const actor24HP = { ...actor, stats: { ...actor.stats, hp: 24 } };
      const result = shouldUseItem(actor24HP, ['potion_001']);

      expect(result).toBe('potion_001');
    });
  });

  describe('evaluateSituation', () => {
    let state: CombatState;
    let enemyId: string;

    beforeEach(() => {
      state = createTestCombatState();
      enemyId = state.combatants.find((c) => c.type === 'enemy')?.id || '';
    });

    it('should evaluate situation for enemy', () => {
      const situation = evaluateSituation(state, enemyId);

      expect(situation).toBeDefined();
      expect(situation.enemyCount).toBe(1); // Player
      expect(situation.allyCount).toBe(1); // Other enemy
      expect(situation.hpPercentage).toBe(1.0); // Full HP
    });

    it('should evaluate situation for player', () => {
      const situation = evaluateSituation(state, 'player');

      expect(situation).toBeDefined();
      expect(situation.enemyCount).toBe(2); // Two enemies
      expect(situation.allyCount).toBe(0); // No allies
      expect(situation.hpPercentage).toBe(1.0);
    });

    it('should detect winning situation with ally advantage', () => {
      // Add more allies
      const ally1: Combatant = {
        ...createPlayerCombatant('Ally1', mockPlayerStats, null),
        id: 'ally_1',
        type: 'ally',
        isPlayer: false,
      };
      const ally2: Combatant = {
        ...createPlayerCombatant('Ally2', mockPlayerStats, null),
        id: 'ally_2',
        type: 'ally',
        isPlayer: false,
      };

      const updatedCombatants = [...state.combatants, ally1, ally2];

      const situation = evaluateSituation(
        { ...state, combatants: updatedCombatants },
        enemyId
      );

      expect(situation.isWinning).toBe(false); // Enemy is outnumbered
      expect(situation.allyCount).toBe(1); // Other enemy
      expect(situation.enemyCount).toBe(3); // Player + 2 allies
    });

    it('should detect winning situation with HP advantage', () => {
      // Damage the player
      const updatedCombatants = state.combatants.map((c) => {
        if (c.isPlayer) {
          return { ...c, stats: { ...c.stats, hp: 20 } };
        }
        return c;
      });

      const situation = evaluateSituation(
        { ...state, combatants: updatedCombatants },
        enemyId
      );

      expect(situation.isWinning).toBe(true); // Enemy has HP advantage
      expect(situation.averageEnemyHP).toBe(0.2); // Player at 20%
    });

    it('should calculate average enemy HP correctly', () => {
      // Set different HP values
      const updatedCombatants = state.combatants.map((c) => {
        if (c.isPlayer) {
          return { ...c, stats: { ...c.stats, hp: 50 } }; // 50%
        }
        return c;
      });

      const situation = evaluateSituation(
        { ...state, combatants: updatedCombatants },
        enemyId
      );

      expect(situation.averageEnemyHP).toBe(0.5);
    });

    it('should exclude dead combatants', () => {
      // Kill one enemy
      const deadEnemyId = state.combatants.find(
        (c) => c.type === 'enemy' && c.id !== enemyId
      )?.id;

      const updatedCombatants = state.combatants.map((c) => {
        if (c.id === deadEnemyId) {
          return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
        }
        return c;
      });

      const situation = evaluateSituation(
        { ...state, combatants: updatedCombatants },
        enemyId
      );

      expect(situation.allyCount).toBe(0); // No living allies
    });

    it('should return default values for invalid actor', () => {
      const situation = evaluateSituation(state, 'invalid_id');

      expect(situation.isWinning).toBe(false);
      expect(situation.enemyCount).toBe(0);
      expect(situation.allyCount).toBe(0);
      expect(situation.hpPercentage).toBe(0);
      expect(situation.averageEnemyHP).toBe(0);
    });

    it('should handle no enemies', () => {
      // Kill all enemies
      const updatedCombatants = state.combatants.map((c) => {
        if (c.type === 'enemy') {
          return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
        }
        return c;
      });

      const situation = evaluateSituation(
        { ...state, combatants: updatedCombatants },
        'player'
      );

      expect(situation.enemyCount).toBe(0);
      expect(situation.averageEnemyHP).toBe(1); // Default when no enemies
    });
  });
});
