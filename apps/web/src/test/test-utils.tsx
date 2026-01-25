import {
  ChunkData,
  NPC
} from '@/engine/types';
import { GameState, useGameStore, type InventoryItem } from '@/game/store/webGameStore';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { Children, cloneElement, isValidElement, ReactElement, useState } from 'react';
import { expect, vi } from 'vitest';

// Mock Sheet components for testing - needs to be before imports
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="sheet">{children}</div> : null,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SheetClose: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SheetContent: ({ children, className }: { children: React.ReactNode; className?: string; side?: string }) =>
    <div className={className} data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <div className={className} data-testid="sheet-header">{children}</div>,
  SheetFooter: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <div className={className}>{children}</div>,
  SheetTitle: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <h2 className={className}>{children}</h2>,
  SheetDescription: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <p className={className}>{children}</p>,
}));

// Mock Tabs for testing with proper state handling
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, className }: { children: React.ReactNode; defaultValue?: string; className?: string }) => {
    const [activeTab, setActiveTab] = useState(defaultValue || 'active');
    return (
      <div data-testid="tabs" data-active={activeTab} className={className}>
        {Children.map(children, child => {
          if (isValidElement(child)) {
            return cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
          }
          return child;
        })}
      </div>
    );
  },
  TabsList: ({ children, className, activeTab, setActiveTab }: any) => (
    <div role="tablist" className={className}>
      {Children.map(children, child => {
        if (isValidElement(child)) {
          return cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  ),
  TabsTrigger: ({ children, value, className, activeTab, setActiveTab }: any) => (
    <button
      role="tab"
      className={className}
      data-state={activeTab === value ? 'active' : 'inactive'}
      onClick={() => setActiveTab?.(value)}
    >
      {children}
    </button>
  ),
  TabsContent: ({ children, value, className, activeTab }: any) =>
    activeTab === value ? <div role="tabpanel" className={className}>{children}</div> : null,
}));

// Type for partial state override
type PartialGameState = Partial<GameState>;

// Reset store to initial state
export function resetGameStore() {
  useGameStore.getState().resetGame();
}

// Set up store with specific state
export function setupGameStore(state: PartialGameState) {
  resetGameStore();

  const currentState = useGameStore.getState();

  const newState: any = {
    ...currentState,
    ...state,
  };

  // Ensure playerStats is merged properly if provided in state
  if (state.playerStats) {
    newState.playerStats = { ...currentState.playerStats, ...state.playerStats };
  }

  // Deep merge settings
  if (state.settings) {
    newState.settings = { ...currentState.settings, ...state.settings };
  }

  useGameStore.setState(newState);
}

// Create mock sector/chunk data for testing
export function createMockSector(overrides: Partial<ChunkData> = {}): ChunkData {
  const size = 64 * 64;
  return {
    coord: { cx: 0, cz: 0 },
    seed: 12345,
    generatedAt: Date.now(),
    heightmap: new Float32Array(size),
    biomeWeights: new Map(),
    structures: [],
    props: [],
    npcs: [],
    items: [],
    overlays: [],
    ...overrides,
  } as ChunkData;
}

// Create mock NPC
export function createMockNPC(overrides: Partial<NPC> = {}): NPC {
  return {
    id: 'test_npc_1',
    name: 'Test Merchant',
    role: 'merchant',
    appearance: {
      bodyType: 'average',
      height: 1,
      skinTone: '#ffffff',
      faceShape: 0,
      hasBeard: false,
      hatStyle: 'cowboy',
      hatColor: '#333333',
      shirtStyle: 'work',
      shirtColor: '#ffffff',
      pantsStyle: 'jeans',
      pantsColor: '#333333',
      bootsStyle: 'work',
      hasBandana: false,
      hasGunbelt: false,
      hasPoncho: false,
      hasScar: false,
    },
    personality: {
      aggression: 0,
      friendliness: 1,
      curiosity: 0,
      greed: 0,
      honesty: 1,
    },
    position: { x: 32, y: 0, z: 32 },
    rotation: 0,
    disposition: 0,
    isAlive: true,
    questGiver: false,
    questIds: [],
    ...overrides,
  };
}

// Create mock item
export function createMockItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item_1',
    itemId: 'brass_gear',
    name: 'Brass Gear',
    rarity: 'common',
    quantity: 1,
    usable: false,
    condition: 100,
    weight: 0.1,
    type: 'junk',
    droppable: true,
    ...overrides,
  };
}

// Custom render with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: PartialGameState;
}

export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialState, ...renderOptions } = options;

  if (initialState) {
    setupGameStore(initialState);
  } else {
    resetGameStore();
  }

  return {
    user: userEvent.setup(),
    ...render(ui, renderOptions),
  };
}

// Helper for waiting
export const waitForTimeout = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Helper to get current store state
export const getStoreState = () => useGameStore.getState();

// Helper to assert store state
export function assertStoreState(expected: PartialGameState) {
  const state = useGameStore.getState();

  for (const [key, value] of Object.entries(expected)) {
    if (key === 'playerStats' && value) {
      for (const [statsKey, statsValue] of Object.entries(value)) {
        expect(state.playerStats[statsKey as keyof typeof state.playerStats]).toEqual(statsValue);
      }
    } else if (key === 'settings' && value) {
      for (const [settingKey, settingValue] of Object.entries(value)) {
        expect(state.settings[settingKey as keyof typeof state.settings]).toEqual(settingValue);
      }
    } else {
      // @ts-ignore
      expect(state[key as keyof typeof state]).toEqual(value);
    }
  }
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { userEvent };

