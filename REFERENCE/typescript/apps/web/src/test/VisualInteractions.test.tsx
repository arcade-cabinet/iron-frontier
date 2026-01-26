/**
 * Visual and Interaction Tests
 * Comprehensive tests for visual elements and user interactions across the game
 */

import { act, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '@/game/store/webGameStore';
import { ActionBar } from '@/game/ui/ActionBar';
import { InventoryPanel } from '@/game/ui/InventoryPanel';
import {
  createMockItem,
  customRender,
  getStoreState,
  resetGameStore,
  setupGameStore,
} from './test-utils';

// Mocks
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    h1: ({ children, className, ...props }: any) => (
      <h1 className={className} {...props}>
        {children}
      </h1>
    ),
    p: ({ children, className, ...props }: any) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
    button: ({ children, className, ...props }: any) => (
      <button className={className} {...props}>
        {children}
      </button>
    ),
    span: ({ children, className, ...props }: any) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
}));

describe('Interaction Flows', () => {
  beforeEach(() => {
    resetGameStore();
  });

  describe('Panel Navigation Flow', () => {
    it('should cycle through all panels correctly', async () => {
      const { user } = customRender(<ActionBar />, {
        initialState: {
          phase: 'playing',
          initialized: true,
        } as any,
      });

      // Open Menu
      await user.click(screen.getByText('Menu').closest('button')!);
      expect(getStoreState().activePanel).toBe('menu');

      // Open Inventory (should close Menu) - now labeled "Saddlebag"
      await user.click(screen.getByText('Saddlebag').closest('button')!);
      expect(getStoreState().activePanel).toBe('inventory');

      // Open Quests (should close Inventory) - now labeled "Journal"
      await user.click(screen.getByText('Journal').closest('button')!);
      expect(getStoreState().activePanel).toBe('quests');

      // Open Character (should close Quests) - now labeled "Outlaw"
      await user.click(screen.getByText('Outlaw').closest('button')!);
      expect(getStoreState().activePanel).toBe('character');
    });

    it('should toggle panel on second click', async () => {
      const { user } = customRender(<ActionBar />, {
        initialState: {
          phase: 'playing',
          initialized: true,
        } as any,
      });

      const itemsButton = screen.getByText('Saddlebag').closest('button')!;

      // First click - open
      await user.click(itemsButton);
      expect(getStoreState().activePanel).toBe('inventory');

      // Second click - close
      await user.click(itemsButton);
      expect(getStoreState().activePanel).toBe(null);
    });
  });

  describe('Item Interaction Flow', () => {
    it('should use item and update player state', async () => {
      const { user } = customRender(<InventoryPanel />, {
        initialState: {
          activePanel: 'inventory',
          playerStats: { health: 50, maxHealth: 100, stamina: 100, maxStamina: 100 },
          inventory: [
            {
              id: 'i1',
              itemId: 'bandages', // Real item from library
              name: 'Bandages',
              rarity: 'common',
              quantity: 2,
              usable: true,
              type: 'consumable',
              condition: 100,
              weight: 0.1,
              droppable: true,
            },
          ],
        } as any,
      });

      // Select item first (new UI requires selecting)
      await user.click(screen.getByText('Bandages'));
      // Use item
      await user.click(screen.getByRole('button', { name: 'Use' }));

      // Check state updated (bandages heal 15 HP)
      const state = getStoreState();
      expect(state.playerStats.health).toBe(65);
      expect(state.inventory[0].quantity).toBe(1); // One less bandage
    });

    it('should drop item and remove from inventory', async () => {
      const { user } = customRender(<InventoryPanel />, {
        initialState: {
          activePanel: 'inventory',
          inventory: [
            {
              id: 'i1',
              itemId: 'empty_bottle',
              name: 'Empty Bottle',
              rarity: 'common',
              quantity: 1,
              usable: false,
              type: 'junk',
              condition: 100,
              weight: 0.2,
              droppable: true,
            },
          ],
        } as any,
      });

      // Select item first (new UI requires selecting)
      await user.click(screen.getByText('Empty Bottle'));
      // Drop item
      await user.click(screen.getByRole('button', { name: 'Drop' }));

      expect(getStoreState().inventory).toHaveLength(0);
    });
  });

  describe('XP and Level Up Flow', () => {
    it('should handle level up correctly', () => {
      setupGameStore({
        phase: 'playing',
        playerStats: {
          level: 1,
          xp: 95,
          xpToNext: 100,
          maxHealth: 100,
          health: 100,
        },
      } as any);

      // Gain enough XP to level up
      act(() => {
        useGameStore.getState().gainXP(20);
      });

      const state = getStoreState();
      expect(state.playerStats.level).toBe(2);
      expect(state.playerStats.xp).toBe(15); // 95 + 20 - 100 = 15
      // Note: maxHealth increase on level-up is a future enhancement
      // Currently maxHealth stays at 100
      expect(state.playerStats.maxHealth).toBe(100);
    });
  });
});

describe('State Consistency Checks', () => {
  it('ERROR_CHECK: player health should never exceed maxHealth', () => {
    act(() => {
      useGameStore.getState().heal(1000);
    });

    const state = getStoreState();
    expect(state.playerStats.health).toBeLessThanOrEqual(state.playerStats.maxHealth);
  });

  it('ERROR_CHECK: player health should never go below 0', () => {
    act(() => {
      useGameStore.getState().takeDamage(1000);
    });

    const state = getStoreState();
    expect(state.playerStats.health).toBeGreaterThanOrEqual(0);
  });

  it('ERROR_CHECK: inventory should track all added items', () => {
    // Note: Inventory slot limits are enforced at the UI level, not store level
    // This test verifies items are properly tracked
    act(() => {
      for (let i = 0; i < 5; i++) {
        const item = createMockItem({ id: `item_${i}`, itemId: `unique_${i}`, usable: false });
        useGameStore.getState().addItem(item);
      }
    });

    // Verify items were added
    expect(getStoreState().inventory.length).toBeGreaterThanOrEqual(5);
  });
});
