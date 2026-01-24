/**
 * Game Store Tests
 * Tests for state management, actions, and data flow
 */
import { useGameStore } from '@/game/store/gameStore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockItem, createMockNPC, resetGameStore } from './test-utils';

describe('Game Store', () => {
  beforeEach(() => {
    resetGameStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useGameStore.getState();

      expect(state.phase).toBe('title');
      expect(state.initialized).toBe(false);
      expect(state.playerName).toBe('Stranger');
      expect(state.playerStats.level).toBe(1);
      expect(state.playerStats.gold).toBe(50);
      expect(state.inventory).toHaveLength(0);
      expect(state.activeQuests).toHaveLength(0);
    });
  });

  describe('Game Flow', () => {
    it('should initialize game with player name', () => {
      const { initGame } = useGameStore.getState();

      initGame('TestPlayer');

      const state = useGameStore.getState();
      expect(state.phase).toBe('playing');
      expect(state.initialized).toBe(true);
      expect(state.playerName).toBe('TestPlayer');
    });

    it('should reset game to initial state', () => {
      const { initGame, resetGame } = useGameStore.getState();
      initGame('TestPlayer');
      resetGame();

      const state = useGameStore.getState();
      expect(state.phase).toBe('title');
      expect(state.initialized).toBe(false);
    });
  });

  describe('Inventory Management', () => {
    it('should add items', () => {
      const mockItem = createMockItem();
      const { addItem } = useGameStore.getState();

      addItem(mockItem);

      const { inventory } = useGameStore.getState();
      expect(inventory).toHaveLength(1);
      expect(inventory[0].name).toBe('Brass Gear');
    });

    it('should stack identical items', () => {
      const { addItem } = useGameStore.getState();
      const item1 = createMockItem({ id: 'i1', itemId: 'screws', quantity: 5 });
      const item2 = createMockItem({ id: 'i2', itemId: 'screws', quantity: 3 });

      addItem(item1);
      addItem(item2);

      const { inventory } = useGameStore.getState();
      expect(inventory).toHaveLength(1);
      expect(inventory[0].quantity).toBe(8);
    });

    it('should use items (tonic heals)', () => {
      const { addItem, useItem, takeDamage } = useGameStore.getState();
      const item = createMockItem({ id: 't1', itemId: 'medicinal_tonic', name: 'Medicinal Tonic', usable: true });

      addItem(item);
      takeDamage(50);

      const healthBefore = useGameStore.getState().playerStats.health;
      useItem('t1');

      expect(useGameStore.getState().playerStats.health).toBeGreaterThan(healthBefore);
    });
  });

  describe('NPC Interaction', () => {
    it('should open dialogue when talking to NPC', () => {
      const mockNPC = createMockNPC({ id: 'n1', name: 'Sheriff' });
      useGameStore.setState({ npcs: { 'n1': mockNPC } });
      const { talkToNPC } = useGameStore.getState();

      talkToNPC('n1');

      const state = useGameStore.getState();
      expect(state.phase).toBe('dialogue');
      expect(state.dialogueState?.npcId).toBe('n1');
    });
  });

  describe('Player Stats', () => {
    it('should gain XP and level up', () => {
      const { gainXP } = useGameStore.getState();

      gainXP(150); // Threshold is 100

      const { playerStats } = useGameStore.getState();
      expect(playerStats.level).toBe(2);
      expect(playerStats.xp).toBe(50);
    });

    it('should take damage and heal', () => {
      const { takeDamage, heal } = useGameStore.getState();

      takeDamage(30);
      expect(useGameStore.getState().playerStats.health).toBe(70);

      heal(20);
      expect(useGameStore.getState().playerStats.health).toBe(90);
    });
  });

  describe('UI Panel Toggles', () => {
    it('should toggle panels', () => {
      const { togglePanel } = useGameStore.getState();

      togglePanel('inventory');
      expect(useGameStore.getState().activePanel).toBe('inventory');

      togglePanel('quests');
      expect(useGameStore.getState().activePanel).toBe('quests');

      togglePanel('quests');
      expect(useGameStore.getState().activePanel).toBe(null);
    });
  });

  describe('Notifications', () => {
    it('should add and limit notifications', () => {
      const { addNotification } = useGameStore.getState();

      for (let i = 0; i < 10; i++) {
        addNotification('info', `Notif ${i}`);
      }

      expect(useGameStore.getState().notifications).toHaveLength(5);
    });
  });
});
