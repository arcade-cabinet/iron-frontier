/**
 * UI Panel Tests
 * Tests for Inventory, Quest Log, Settings, and Menu panels
 */
import { act, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockNPC, customRender, getStoreState } from './test-utils';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

// Import components after mocks
import { ActionBar } from '@/game/ui/ActionBar';
import { DialogueBox } from '@/game/ui/DialogueBox';
import { GameHUD } from '@/game/ui/GameHUD';
import { InventoryPanel } from '@/game/ui/InventoryPanel';
import { NotificationFeed } from '@/game/ui/NotificationFeed';
import { SettingsPanel } from '@/game/ui/SettingsPanel';

describe('GameHUD', () => {
  it('should display player name', () => {
    customRender(<GameHUD />, {
      initialState: {
        phase: 'playing',
        initialized: true,
        playerName: 'TestPlayer',
        playerStats: { health: 75, maxHealth: 100, xp: 45, xpToNext: 150, level: 5, gold: 250, stamina: 100, maxStamina: 100, reputation: 0 }
      } as any,
    });
    expect(screen.getByText('TestPlayer')).toBeInTheDocument();
  });

  it('should display player level', () => {
    customRender(<GameHUD />, {
      initialState: {
        phase: 'playing',
        playerName: 'TestPlayer',
        playerStats: { level: 5, health: 100, maxHealth: 100, xp: 0, xpToNext: 100, gold: 0, stamina: 100, maxStamina: 100, reputation: 0 }
      } as any,
    });
    expect(screen.getByText('Level 5')).toBeInTheDocument();
  });

  it('should display current health', () => {
    customRender(<GameHUD />, {
      initialState: {
        phase: 'playing',
        playerName: 'TestPlayer',
        playerStats: { health: 75, maxHealth: 100, level: 1, xp: 0, xpToNext: 100, gold: 0, stamina: 100, maxStamina: 100, reputation: 0 }
      } as any,
    });
    expect(screen.getByText(/75\/100 HP/)).toBeInTheDocument();
  });

  it('should display active quest when present', () => {
    customRender(<GameHUD />, {
      initialState: {
        phase: 'playing',
        playerName: 'TestPlayer',
        playerStats: { level: 1, health: 100, maxHealth: 100, xp: 0, xpToNext: 100, gold: 0, stamina: 100, maxStamina: 100, reputation: 0 },
        activeQuests: [{
          id: 'quest1',
          title: 'Find the Lost Gear',
          description: 'Search for the missing gear',
          giverNpcId: 'npc1',
          status: 'active',
          objectives: [{ id: 'step1', description: 'Search the workshop', type: 'collect', required: 1, current: 0, completed: false }],
          rewards: { xp: 100, gold: 50 },
        }],
      } as any,
    });

    expect(screen.getByText('Find the Lost Gear')).toBeInTheDocument();
    expect(screen.getByText('Search the workshop')).toBeInTheDocument();
  });
});

describe('ActionBar', () => {
  it('should render all action buttons', () => {
    customRender(<ActionBar />, {
      initialState: {
        phase: 'playing',
      } as any,
    });

    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Quests')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should toggle inventory when clicking Items', async () => {
    const { user } = customRender(<ActionBar />, {
      initialState: {
        phase: 'playing',
      } as any,
    });

    const itemsButton = screen.getByText('Items').closest('button');
    await user.click(itemsButton!);

    expect(getStoreState().activePanel).toBe('inventory');
  });

  it('should toggle quest log when clicking Quests', async () => {
    const { user } = customRender(<ActionBar />, {
      initialState: {
        phase: 'playing',
      } as any,
    });

    const questsButton = screen.getByText('Quests').closest('button');
    await user.click(questsButton!);

    expect(getStoreState().activePanel).toBe('quests');
  });
});

describe('InventoryPanel', () => {
  it('should render panel title', () => {
    customRender(<InventoryPanel />, {
      initialState: {
        activePanel: 'inventory',
        playerStats: { gold: 150 }
      } as any,
    });
    expect(screen.getByText('Saddlebag')).toBeInTheDocument();
  });

  it('should display player gold', () => {
    customRender(<InventoryPanel />, {
      initialState: {
        activePanel: 'inventory',
        playerStats: { gold: 150 }
      } as any,
    });
    expect(screen.getByText('150 Gold')).toBeInTheDocument();
  });

  it('should show empty state when inventory is empty', () => {
    customRender(<InventoryPanel />, {
      initialState: {
        activePanel: 'inventory',
        inventory: [],
      } as any,
    });

    expect(screen.getByText('Your saddlebag is empty')).toBeInTheDocument();
    expect(screen.getByText('Explore to find items!')).toBeInTheDocument();
  });

  it('should display inventory items', () => {
    customRender(<InventoryPanel />, {
      initialState: {
        activePanel: 'inventory',
        inventory: [
          { id: 'item1', itemId: 'health_tonic', name: 'Health Tonic', rarity: 'uncommon', quantity: 3, usable: true },
          { id: 'item2', itemId: 'brass_gear', name: 'Brass Gear', rarity: 'common', quantity: 5 },
        ],
      } as any,
    });

    expect(screen.getByText('Health Tonic')).toBeInTheDocument();
    expect(screen.getByText('Brass Gear')).toBeInTheDocument();
  });

  it('should show Drop button for all items', () => {
    customRender(<InventoryPanel />, {
      initialState: {
        activePanel: 'inventory',
        inventory: [
          { id: 'item1', itemId: 'junk', name: 'Junk', rarity: 'common', quantity: 1 },
        ],
      } as any,
    });

    expect(screen.getByRole('button', { name: 'Drop' })).toBeInTheDocument();
  });
});

describe('SettingsPanel', () => {
  const settingsInitialState = {
    activePanel: 'settings',
    settings: {
      musicVolume: 0.7,
      sfxVolume: 0.8,
      haptics: true,
      controlMode: 'tap' as const,
      reducedMotion: false,
      showMinimap: true,
      lowPowerMode: false,
    },
  };

  it('should render Settings title', () => {
    customRender(<SettingsPanel />, { initialState: settingsInitialState as any });
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should display audio section', () => {
    customRender(<SettingsPanel />, { initialState: settingsInitialState as any });
    expect(screen.getByText('Audio')).toBeInTheDocument();
  });

  it('should toggle control mode', async () => {
    const { user } = customRender(<SettingsPanel />, { initialState: settingsInitialState as any });

    const joystickButton = screen.getByRole('button', { name: 'Virtual Joystick' });
    await user.click(joystickButton);

    expect(getStoreState().settings.controlMode).toBe('joystick');
  });
});

describe('DialogueBox', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when dialogue is closed', () => {
    const { container } = customRender(<DialogueBox />, {
      initialState: {
        phase: 'playing',
        dialogueState: null,
      } as any,
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('should render when dialogue is open with NPC', async () => {
    const mockNPC = createMockNPC({ id: 'npc_1', name: 'Sheriff Brass' });
    customRender(<DialogueBox />, {
      initialState: {
        phase: 'dialogue',
        dialogueState: { npcId: 'npc_1', npcName: 'Sheriff Brass', text: 'Hello there.' },
        npcs: { 'npc_1': mockNPC },
        settings: { reducedMotion: true },
      } as any,
    });

    expect(screen.getByText('Sheriff Brass')).toBeInTheDocument();

    // Advance timers for typewriter
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Hello there.')).toBeInTheDocument();
  });

  it('should display NPC role', () => {
    const mockNPC = createMockNPC({ id: 'npc_1', name: 'Test NPC', role: 'sheriff' });
    customRender(<DialogueBox />, {
      initialState: {
        phase: 'dialogue',
        dialogueState: { npcId: 'npc_1', npcName: 'Test NPC', text: 'Hello.' },
        npcs: { 'npc_1': mockNPC },
        settings: { reducedMotion: true },
      } as any,
    });

    expect(screen.getByText('sheriff')).toBeInTheDocument();
  });
});

describe('NotificationFeed', () => {
  it('should render notifications', () => {
    customRender(<NotificationFeed />, {
      initialState: {
        notifications: [
          { id: 'n1', type: 'item', message: 'Found: Golden Gear', timestamp: Date.now() },
          { id: 'n2', type: 'xp', message: '+50 XP', timestamp: Date.now() },
        ],
      } as any,
    });

    expect(screen.getByText('Found: Golden Gear')).toBeInTheDocument();
    expect(screen.getByText('+50 XP')).toBeInTheDocument();
  });
});
