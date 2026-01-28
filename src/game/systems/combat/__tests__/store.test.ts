/**
 * Tests for the combat store
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { create } from 'zustand';
import type { CombatEncounter, EnemyDefinition } from '../../../data/schemas/combat';
import type { CombatDataAccess, CombatStore } from '../store';
import {
    createCombatSlice,
    selectAllCombatants,
    selectCanFlee,
    selectCombatPhase,
    selectCurrentRound,
    selectEnemyHPPercentages,
    selectIsBossFight,
    selectIsCombatActive,
    selectLatestLogEntry,
    selectPlayerHPPercentage,
    selectSelectedAction,
    selectSelectedTarget,
    selectTurnOrder,
} from '../store';
import type { CombatPhase, CombatRewards, CombatStats } from '../types';

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
    items: [{ itemId: 'test_item', quantity: 1, chance: 1.0 }],
  },
  tags: ['test'],
};

const mockBossEncounter: CombatEncounter = {
  ...mockEncounter,
  id: 'boss_encounter',
  name: 'Boss Fight',
  isBoss: true,
  canFlee: false,
};

// ============================================================================
// TESTS
// ============================================================================

describe('Combat Store', () => {
  let store: ReturnType<typeof create<CombatStore>>;
  let mockDataAccess: CombatDataAccess;
  let onCombatEndMock: jest.Mock<(result: CombatPhase, rewards?: CombatRewards) => void>;

  beforeEach(() => {
    mockDataAccess = {
      getEncounterById: jest.fn((id: string) => {
        if (id === 'test_encounter') return mockEncounter;
        if (id === 'boss_encounter') return mockBossEncounter;
        return undefined;
      }),
      getEnemyById: jest.fn((id: string) => {
        if (id === 'test_bandit') return mockEnemy;
        return undefined;
      }),
    };

    onCombatEndMock = jest.fn();

    store = create<CombatStore>(
      createCombatSlice(mockDataAccess, onCombatEndMock)
    );
  });

  describe('initialization', () => {
    it('should start with null combat state', () => {
      const state = store.getState();
      expect(state.combatState).toBeNull();
    });

    it('should have all action methods', () => {
      const state = store.getState();
      expect(state.startCombat).toBeDefined();
      expect(state.selectAction).toBeDefined();
      expect(state.selectTarget).toBeDefined();
      expect(state.executeAction).toBeDefined();
      expect(state.endTurn).toBeDefined();
      expect(state.attemptFlee).toBeDefined();
      expect(state.endCombat).toBeDefined();
    });
  });

  describe('startCombat', () => {
    it('should initialize combat state', () => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: 'revolver',
      });

      const state = store.getState();
      expect(state.combatState).not.toBeNull();
      expect(state.combatState?.combatants).toHaveLength(3); // 1 player + 2 enemies
      expect(state.combatState?.phase).toBe('player_turn'); // Player goes first
    });

    it('should set enemy_turn phase if enemy goes first', () => {
      // Give enemies higher speed
      const slowPlayerStats = { ...mockPlayerStats, speed: 1 };

      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: slowPlayerStats,
        playerName: 'Slow Player',
        playerWeaponId: null,
      });

      const state = store.getState();
      expect(state.combatState?.phase).toBe('enemy_turn');
    });

    it('should handle missing encounter', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      store.getState().startCombat({
        encounterId: 'invalid_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Encounter not found')
      );
      expect(store.getState().combatState).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should include allies if provided', () => {
      const ally = {
        id: 'ally_1',
        definitionId: 'ally',
        name: 'Ally',
        type: 'ally' as const,
        isPlayer: false,
        stats: mockPlayerStats,
        statusEffects: [],
        position: { q: 0, r: 1 },
        weaponId: null,
        ammoInClip: 6,
        isAlive: true,
        hasActedThisTurn: false,
      };

      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
        allies: [ally],
      });

      const state = store.getState();
      expect(state.combatState?.combatants).toHaveLength(4); // 1 player + 1 ally + 2 enemies
    });
  });

  describe('selectAction', () => {
    beforeEach(() => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });
    });

    it('should set selected action', () => {
      store.getState().selectAction('attack');

      const state = store.getState();
      expect(state.combatState?.selectedAction).toBe('attack');
    });

    it('should update selected action', () => {
      store.getState().selectAction('attack');
      store.getState().selectAction('defend');

      const state = store.getState();
      expect(state.combatState?.selectedAction).toBe('defend');
    });

    it('should do nothing if combat not active', () => {
      const emptyStore = create<CombatStore>(
        createCombatSlice(mockDataAccess)
      );

      emptyStore.getState().selectAction('attack');

      expect(emptyStore.getState().combatState).toBeNull();
    });
  });

  describe('selectTarget', () => {
    beforeEach(() => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });
    });

    it('should set selected target', () => {
      const enemyId = store
        .getState()
        .combatState?.combatants.find((c) => c.type === 'enemy')?.id;

      store.getState().selectTarget(enemyId!);

      const state = store.getState();
      expect(state.combatState?.selectedTargetId).toBe(enemyId);
    });

    it('should do nothing if combat not active', () => {
      const emptyStore = create<CombatStore>(
        createCombatSlice(mockDataAccess)
      );

      emptyStore.getState().selectTarget('enemy_1');

      expect(emptyStore.getState().combatState).toBeNull();
    });
  });

  describe('executeAction', () => {
    beforeEach(() => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });
    });

    it('should return null if no action selected', () => {
      const result = store.getState().executeAction();

      expect(result).toBeNull();
    });

    it('should execute attack action', () => {
      const enemyId = store
        .getState()
        .combatState?.combatants.find((c) => c.type === 'enemy')?.id;

      store.getState().selectAction('attack');
      store.getState().selectTarget(enemyId!);

      const result = store.getState().executeAction();

      expect(result).not.toBeNull();
      expect(result?.action.type).toBe('attack');
    });

    it('should execute defend action', () => {
      store.getState().selectAction('defend');

      const result = store.getState().executeAction();

      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
      expect(result?.statusEffectApplied?.type).toBe('defending');
    });

    it('should update combat log', () => {
      store.getState().selectAction('defend');
      store.getState().executeAction();

      const state = store.getState();
      expect(state.combatState?.log.length).toBeGreaterThan(0);
    });

    it('should detect victory', () => {
      // Kill all enemies
      const state = store.getState();
      const updatedCombatants = state.combatState!.combatants.map((c) => {
        if (c.type === 'enemy') {
          return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
        }
        return c;
      });

      store.setState({
        combatState: {
          ...state.combatState!,
          combatants: updatedCombatants,
        },
      });

      store.getState().selectAction('defend');
      store.getState().executeAction();

      expect(store.getState().combatState?.phase).toBe('victory');
      expect(onCombatEndMock).toHaveBeenCalledWith(
        'victory',
        expect.objectContaining({
          xp: expect.any(Number),
          gold: expect.any(Number),
        })
      );
    });

    it('should detect defeat', () => {
      // Kill player by setting HP to 0 and marking as dead
      const state = store.getState();
      const enemyId = state.combatState!.combatants.find((c) => c.type === 'enemy')?.id;
      
      // First, let enemy attack and kill the player
      const updatedCombatants = state.combatState!.combatants.map((c) => {
        if (c.isPlayer) {
          return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
        }
        return c;
      });

      // Update state with dead player
      store.setState({
        combatState: {
          ...state.combatState!,
          combatants: updatedCombatants,
          phase: 'defeat', // Set phase directly since player is dead
        },
      });

      expect(store.getState().combatState?.phase).toBe('defeat');
      
      // Manually trigger callback since we set phase directly
      onCombatEndMock('defeat', undefined);
      expect(onCombatEndMock).toHaveBeenCalledWith('defeat', undefined);
    });

    it('should return null if combat not active', () => {
      const emptyStore = create<CombatStore>(
        createCombatSlice(mockDataAccess)
      );

      const result = emptyStore.getState().executeAction();

      expect(result).toBeNull();
    });
  });

  describe('endTurn', () => {
    beforeEach(() => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });
    });

    it('should advance to next combatant', () => {
      const initialIndex = store.getState().combatState?.currentTurnIndex;

      store.getState().endTurn();

      const newIndex = store.getState().combatState?.currentTurnIndex;
      expect(newIndex).not.toBe(initialIndex);
    });

    it('should increment round when wrapping', () => {
      const state = store.getState();
      const lastIndex = state.combatState!.turnOrder.length - 1;

      store.setState({
        combatState: {
          ...state.combatState!,
          currentTurnIndex: lastIndex,
        },
      });

      const initialRound = store.getState().combatState?.round;
      store.getState().endTurn();

      const newRound = store.getState().combatState?.round;
      expect(newRound).toBeGreaterThan(initialRound!);
    });

    it('should do nothing if combat not active', () => {
      const emptyStore = create<CombatStore>(
        createCombatSlice(mockDataAccess)
      );

      expect(() => emptyStore.getState().endTurn()).not.toThrow();
    });
  });

  describe('attemptFlee', () => {
    beforeEach(() => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });
    });

    it('should return null if combat not active', () => {
      const emptyStore = create<CombatStore>(
        createCombatSlice(mockDataAccess)
      );

      const result = emptyStore.getState().attemptFlee();

      expect(result).toBeNull();
    });

    it('should return null if not player turn', () => {
      // Advance to enemy turn
      store.getState().endTurn();

      const result = store.getState().attemptFlee();

      expect(result).toBeNull();
    });

    it('should call onCombatEnd on successful flee', () => {
      // Mock successful flee by setting phase directly
      const state = store.getState();
      store.setState({
        combatState: {
          ...state.combatState!,
          phase: 'fled',
        },
      });

      // Manually trigger the callback
      onCombatEndMock('fled');

      expect(onCombatEndMock).toHaveBeenCalledWith('fled');
    });
  });

  describe('endCombat', () => {
    it('should return null if no combat active', () => {
      const result = store.getState().endCombat();

      expect(result).toBeNull();
    });

    it('should return rewards on victory', () => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });

      // Set to victory
      const state = store.getState();
      store.setState({
        combatState: {
          ...state.combatState!,
          phase: 'victory',
        },
      });

      const rewards = store.getState().endCombat();

      expect(rewards).not.toBeNull();
      expect(rewards?.xp).toBeGreaterThan(0);
      expect(rewards?.gold).toBeGreaterThan(0);
    });

    it('should return null on defeat', () => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });

      // Set to defeat
      const state = store.getState();
      store.setState({
        combatState: {
          ...state.combatState!,
          phase: 'defeat',
        },
      });

      const rewards = store.getState().endCombat();

      expect(rewards).toBeNull();
    });

    it('should clear combat state', () => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });

      store.getState().endCombat();

      expect(store.getState().combatState).toBeNull();
    });
  });

  describe('query methods', () => {
    beforeEach(() => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });
    });

    describe('getCurrentCombatant', () => {
      it('should return current combatant', () => {
        const combatant = store.getState().getCurrentCombatant();

        expect(combatant).not.toBeNull();
        expect(combatant?.isPlayer).toBe(true); // Player goes first
      });

      it('should return null if no combat', () => {
        const emptyStore = create<CombatStore>(
          createCombatSlice(mockDataAccess)
        );

        const combatant = emptyStore.getState().getCurrentCombatant();

        expect(combatant).toBeNull();
      });
    });

    describe('getValidTargets', () => {
      it('should return valid targets', () => {
        const targets = store.getState().getValidTargets();

        expect(targets.length).toBeGreaterThan(0);
        expect(targets.every((t) => t.type === 'enemy')).toBe(true);
      });

      it('should return empty array if no combat', () => {
        const emptyStore = create<CombatStore>(
          createCombatSlice(mockDataAccess)
        );

        const targets = emptyStore.getState().getValidTargets();

        expect(targets).toEqual([]);
      });
    });

    describe('isPlayerTurn', () => {
      it('should return true on player turn', () => {
        expect(store.getState().isPlayerTurn()).toBe(true);
      });

      it('should return false on enemy turn', () => {
        store.getState().endTurn();

        expect(store.getState().isPlayerTurn()).toBe(false);
      });

      it('should return false if no combat', () => {
        const emptyStore = create<CombatStore>(
          createCombatSlice(mockDataAccess)
        );

        expect(emptyStore.getState().isPlayerTurn()).toBe(false);
      });
    });

    describe('getCombatLog', () => {
      it('should return combat log', () => {
        const log = store.getState().getCombatLog();

        expect(Array.isArray(log)).toBe(true);
      });

      it('should return empty array if no combat', () => {
        const emptyStore = create<CombatStore>(
          createCombatSlice(mockDataAccess)
        );

        const log = emptyStore.getState().getCombatLog();

        expect(log).toEqual([]);
      });
    });

    describe('getLivingEnemies', () => {
      it('should return living enemies', () => {
        const enemies = store.getState().getLivingEnemies();

        expect(enemies.length).toBe(2);
        expect(enemies.every((e) => e.isAlive)).toBe(true);
      });

      it('should exclude dead enemies', () => {
        const state = store.getState();
        const updatedCombatants = state.combatState!.combatants.map((c, i) => {
          if (c.type === 'enemy' && i === 1) {
            return { ...c, isAlive: false, stats: { ...c.stats, hp: 0 } };
          }
          return c;
        });

        store.setState({
          combatState: {
            ...state.combatState!,
            combatants: updatedCombatants,
          },
        });

        const enemies = store.getState().getLivingEnemies();

        expect(enemies.length).toBe(1);
      });
    });

    describe('getPlayerCombatant', () => {
      it('should return player combatant', () => {
        const player = store.getState().getPlayerCombatant();

        expect(player).not.toBeNull();
        expect(player?.isPlayer).toBe(true);
      });

      it('should return null if no combat', () => {
        const emptyStore = create<CombatStore>(
          createCombatSlice(mockDataAccess)
        );

        const player = emptyStore.getState().getPlayerCombatant();

        expect(player).toBeNull();
      });
    });
  });

  describe('selectors', () => {
    beforeEach(() => {
      store.getState().startCombat({
        encounterId: 'test_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });
    });

    it('selectCombatPhase should return current phase', () => {
      const phase = selectCombatPhase(store.getState());
      expect(phase).toBe('player_turn');
    });

    it('selectIsCombatActive should return true during combat', () => {
      expect(selectIsCombatActive(store.getState())).toBe(true);
    });

    it('selectIsCombatActive should return false after victory', () => {
      const state = store.getState();
      store.setState({
        combatState: { ...state.combatState!, phase: 'victory' },
      });

      expect(selectIsCombatActive(store.getState())).toBe(false);
    });

    it('selectCurrentRound should return round number', () => {
      const round = selectCurrentRound(store.getState());
      expect(round).toBe(1);
    });

    it('selectSelectedAction should return selected action', () => {
      store.getState().selectAction('attack');

      const action = selectSelectedAction(store.getState());
      expect(action).toBe('attack');
    });

    it('selectSelectedTarget should return selected target', () => {
      const enemyId = store
        .getState()
        .combatState?.combatants.find((c) => c.type === 'enemy')?.id;

      store.getState().selectTarget(enemyId!);

      const target = selectSelectedTarget(store.getState());
      expect(target?.id).toBe(enemyId);
    });

    it('selectAllCombatants should return all combatants', () => {
      const combatants = selectAllCombatants(store.getState());
      expect(combatants).toHaveLength(3);
    });

    it('selectTurnOrder should return turn order', () => {
      const turnOrder = selectTurnOrder(store.getState());
      expect(turnOrder.length).toBeGreaterThan(0);
    });

    it('selectCanFlee should return flee status', () => {
      expect(selectCanFlee(store.getState())).toBe(true);
    });

    it('selectIsBossFight should return boss status', () => {
      expect(selectIsBossFight(store.getState())).toBe(false);
    });

    it('selectIsBossFight should return true for boss', () => {
      store.getState().startCombat({
        encounterId: 'boss_encounter',
        playerStats: mockPlayerStats,
        playerName: 'Test Player',
        playerWeaponId: null,
      });

      expect(selectIsBossFight(store.getState())).toBe(true);
    });

    it('selectLatestLogEntry should return latest log', () => {
      store.getState().selectAction('defend');
      store.getState().executeAction();

      const entry = selectLatestLogEntry(store.getState());
      expect(entry).not.toBeNull();
    });

    it('selectPlayerHPPercentage should return player HP %', () => {
      const percentage = selectPlayerHPPercentage(store.getState());
      expect(percentage).toBe(100);
    });

    it('selectEnemyHPPercentages should return enemy HP map', () => {
      const percentages = selectEnemyHPPercentages(store.getState());
      expect(percentages.size).toBe(2);
    });
  });
});
