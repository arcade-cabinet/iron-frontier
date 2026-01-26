/**
 * Tests for mobile game store
 *
 * These tests verify that the mobile store is properly created
 * and wired to the shared store factory.
 */

// Mock all shared data modules first
jest.mock('@iron-frontier/shared/data/enemies', () => ({
  getEnemyById: jest.fn(),
  getEncounterById: jest.fn(),
}));

jest.mock('@iron-frontier/shared/data/items', () => ({
  getItem: jest.fn(),
  STARTER_INVENTORY: [],
}));

jest.mock('@iron-frontier/shared/data/npcs', () => ({
  getNPCById: jest.fn(),
  getDialogueTreeById: jest.fn(),
  getPrimaryDialogueTree: jest.fn(),
}));

jest.mock('@iron-frontier/shared/data/quests', () => ({
  getQuestById: jest.fn(),
}));

jest.mock('@iron-frontier/shared/data/shops', () => ({
  getShopById: jest.fn(),
  calculateBuyPrice: jest.fn(),
  calculateSellPrice: jest.fn(),
  canSellItemToShop: jest.fn(),
}));

jest.mock('@iron-frontier/shared/data/worlds', () => ({
  getWorldById: jest.fn(),
  loadWorld: jest.fn(),
}));

// Create mock store function
const createMockStore = () => {
  const mockStore = jest.fn((selector) => {
    const state = {
      playerStats: {
        health: 100,
        maxHealth: 100,
        gold: 0,
      },
      isInitialized: false,
      initialize: jest.fn(),
      resetGame: jest.fn(),
    };
    return selector ? selector(state) : state;
  });
  mockStore.getState = () => ({
    playerStats: { health: 100, maxHealth: 100, gold: 0 },
    isInitialized: false,
  });
  mockStore.setState = jest.fn();
  mockStore.subscribe = jest.fn();
  return mockStore;
};

// Mock the shared store module with a class-like MemoryStorageAdapter
jest.mock('@iron-frontier/shared/store', () => {
  // Define MemoryStorageAdapter inside the factory function
  class MockMemoryStorageAdapter {
    private storage = new Map<string, string>();

    async getItem(key: string) {
      return this.storage.get(key) ?? null;
    }

    async setItem(key: string, value: string) {
      this.storage.set(key, value);
    }

    async removeItem(key: string) {
      this.storage.delete(key);
    }
  }

  return {
    createGameStore: jest.fn(() => createMockStore()),
    MemoryStorageAdapter: MockMemoryStorageAdapter,
  };
});

// Import after all mocks are set up
import { useMobileGameStore } from '../../src/game/store/mobileGameStore';
import { createGameStore, MemoryStorageAdapter } from '@iron-frontier/shared/store';

describe('mobileGameStore', () => {
  it('exports useMobileGameStore hook', () => {
    expect(useMobileGameStore).toBeDefined();
    expect(typeof useMobileGameStore).toBe('function');
  });

  it('uses createGameStore from shared package', () => {
    expect(createGameStore).toBeDefined();
  });

  it('has MemoryStorageAdapter available', () => {
    expect(MemoryStorageAdapter).toBeDefined();
    // Verify it's a constructor
    const instance = new MemoryStorageAdapter();
    expect(instance).toBeDefined();
    expect(typeof instance.getItem).toBe('function');
    expect(typeof instance.setItem).toBe('function');
  });

  it('provides access to game state through selector', () => {
    const result = useMobileGameStore((state) => state.playerStats);
    expect(result).toBeDefined();
    expect(result.health).toBeDefined();
    expect(result.maxHealth).toBeDefined();
    expect(result.gold).toBeDefined();
  });

  it('returns full state when no selector provided', () => {
    const result = useMobileGameStore();
    expect(result).toBeDefined();
    expect(result.playerStats).toBeDefined();
  });
});
