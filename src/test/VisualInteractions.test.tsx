/**
 * Visual and Interaction Tests
 * Comprehensive tests for visual elements and user interactions across the game
 */
import { useGameStore } from '@/game/store/gameStore';
import { ActionBar } from '@/game/ui/ActionBar';
import { InventoryPanel } from '@/game/ui/InventoryPanel';
import { act, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockItem, customRender, getStoreState, resetGameStore, setupGameStore } from './test-utils';

// Mocks
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    h1: ({ children, className, ...props }: any) => <h1 className={className} {...props}>{children}</h1>,
    p: ({ children, className, ...props }: any) => <p className={className} {...props}>{children}</p>,
    button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>,
    span: ({ children, className, ...props }: any) => <span className={className} {...props}>{children}</span>,
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
        } as any
      });

      // Open Menu
      await user.click(screen.getByText('Menu').closest('button')!);
      expect(getStoreState().activePanel).toBe('menu');

      // Open Inventory (should close Menu)
      await user.click(screen.getByText('Items').closest('button')!);
      expect(getStoreState().activePanel).toBe('inventory');

      // Open Quests (should close Inventory)
      await user.click(screen.getByText('Quests').closest('button')!);
      expect(getStoreState().activePanel).toBe('quests');

      // Open Settings (should close Quests)
      await user.click(screen.getByText('Settings').closest('button')!);
      expect(getStoreState().activePanel).toBe('settings');
    });

    it('should toggle panel on second click', async () => {
      const { user } = customRender(<ActionBar />, {
        initialState: {
          phase: 'playing',
          initialized: true,
        } as any
      });

      const itemsButton = screen.getByText('Items').closest('button')!;

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
      expect(state.playerStats.maxHealth).toBe(110); // +10 per level
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

  it('ERROR_CHECK: inventory should not exceed maxInventorySlots', () => {
    const maxSlots = getStoreState().maxInventorySlots;

    // Try to add many items
    act(() => {
      for (let i = 0; i < 30; i++) {
        const item = createMockItem({ id: `item_${i}`, itemId: `unique_${i}`, usable: false });
        useGameStore.getState().addItem(item);
      }
    });

    expect(getStoreState().inventory.length).toBeLessThanOrEqual(maxSlots);
  });
});
