/**
 * UI Panel Tests
 * Tests for Inventory, Quest Log, Settings, and Menu panels
 */
import { act, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockNPC, customRender, getStoreState } from './test-utils';
import type { Quest } from '@/data/schemas/quest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

// Mock the quest registry for GameHUD tests
vi.mock('@/data/quests/index', () => ({
  getQuestById: (id: string): Quest | undefined => {
    const mockQuests: Record<string, Quest> = {
      test_hud_quest: {
        id: 'test_hud_quest',
        title: 'Find the Lost Gear',
        description: 'Search for the missing gear',
        type: 'side',
        giverNpcId: 'npc1',
        startLocationId: 'test_location',
        recommendedLevel: 1,
        tags: ['test'],
        repeatable: false,
        timeLimitHours: null,
        prerequisites: { completedQuests: [], factionReputation: {}, requiredItems: [] },
        stages: [
          {
            id: 'stage_1',
            title: 'Search the Workshop',
            description: 'Look around',
            objectives: [
              { id: 'obj_1', description: 'Search the workshop', type: 'interact', target: 'workshop', count: 1, current: 0, optional: false, hidden: false },
            ],
            stageRewards: { xp: 10, gold: 0, items: [], reputation: {} },
          },
        ],
        rewards: { xp: 100, gold: 50, items: [], reputation: {}, unlocksQuests: [] },
      },
    };
    return mockQuests[id];
  },
}));

// Import components after mocks
import { ActionBar } from '@/game/ui/ActionBar';
import { DialogueBox } from '@/game/ui/DialogueBox';
import { GameHUD } from '@/game/ui/GameHUD';
import { InventoryPanel } from '@/game/ui/InventoryPanel';
import { MenuPanel } from '@/game/ui/MenuPanel';
import { NotificationFeed } from '@/game/ui/NotificationFeed';

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
    // New HUD uses "Lv.5" format
    expect(screen.getByText('Lv.5')).toBeInTheDocument();
  });

  it('should display current health', () => {
    customRender(<GameHUD />, {
      initialState: {
        phase: 'playing',
        playerName: 'TestPlayer',
        playerStats: { health: 75, maxHealth: 100, level: 1, xp: 0, xpToNext: 100, gold: 0, stamina: 100, maxStamina: 100, reputation: 0 }
      } as any,
    });
    // New HUD shows just the health value
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('should display active quest when present', () => {
    customRender(<GameHUD />, {
      initialState: {
        phase: 'playing',
        playerName: 'TestPlayer',
        playerStats: { level: 1, health: 100, maxHealth: 100, xp: 0, xpToNext: 100, gold: 0, stamina: 100, maxStamina: 100, reputation: 0 },
        activeQuests: [{
          questId: 'test_hud_quest',
          status: 'active',
          currentStageIndex: 0,
          objectiveProgress: {},
          startedAt: Date.now(),
          completedAt: null,
          timeRemainingHours: null,
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

    // Updated labels: Outlaw (character), Territory (map), Saddlebag (inventory), Journal (quests), Menu
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Saddlebag')).toBeInTheDocument();
    expect(screen.getByText('Journal')).toBeInTheDocument();
    expect(screen.getByText('Outlaw')).toBeInTheDocument();
  });

  it('should toggle inventory when clicking Saddlebag', async () => {
    const { user } = customRender(<ActionBar />, {
      initialState: {
        phase: 'playing',
      } as any,
    });

    const itemsButton = screen.getByText('Saddlebag').closest('button');
    await user.click(itemsButton!);

    expect(getStoreState().activePanel).toBe('inventory');
  });

  it('should toggle quest log when clicking Journal', async () => {
    const { user } = customRender(<ActionBar />, {
      initialState: {
        phase: 'playing',
      } as any,
    });

    const questsButton = screen.getByText('Journal').closest('button');
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
        playerStats: { gold: 150, ivrcScript: 0 }
      } as any,
    });
    // New UI shows "$150" format
    expect(screen.getByText('$150')).toBeInTheDocument();
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
          { id: 'item1', itemId: 'health_tonic', name: 'Health Tonic', rarity: 'uncommon', quantity: 3, usable: true, type: 'consumable', condition: 100, weight: 0.3, droppable: true },
          { id: 'item2', itemId: 'brass_gear', name: 'Brass Gear', rarity: 'common', quantity: 5, usable: false, type: 'junk', condition: 100, weight: 0.1, droppable: true },
        ],
      } as any,
    });

    expect(screen.getByText('Health Tonic')).toBeInTheDocument();
    expect(screen.getByText('Brass Gear')).toBeInTheDocument();
  });

  it('should show Drop button when item is selected', async () => {
    const { user } = customRender(<InventoryPanel />, {
      initialState: {
        activePanel: 'inventory',
        inventory: [
          { id: 'item1', itemId: 'junk', name: 'Junk Item', rarity: 'common', quantity: 1, usable: false, type: 'junk', condition: 100, weight: 0.1, droppable: true },
        ],
      } as any,
    });

    // Select item first (new UI requires selecting)
    await user.click(screen.getByText('Junk Item'));

    // Drop button should now be visible
    expect(screen.getByRole('button', { name: 'Drop' })).toBeInTheDocument();
  });
});

describe('MenuPanel (includes Settings)', () => {
  const menuInitialState = {
    activePanel: 'menu',
    playerName: 'TestPlayer',
    playerStats: { level: 5, health: 100, maxHealth: 100, xp: 50, xpToNext: 100, gold: 250, reputation: 10 },
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

  it('should render Menu panel title', () => {
    customRender(<MenuPanel />, { initialState: menuInitialState as any });
    expect(screen.getByText('Iron Frontier')).toBeInTheDocument();
  });

  it('should display Settings tab', () => {
    customRender(<MenuPanel />, { initialState: menuInitialState as any });
    // Menu now has Game and Settings tabs
    expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument();
  });

  it('should toggle control mode in settings tab', async () => {
    const { user } = customRender(<MenuPanel />, { initialState: menuInitialState as any });

    // Click Settings tab
    const settingsTab = screen.getByRole('tab', { name: 'Settings' });
    await user.click(settingsTab);

    // Now click Joystick button
    const joystickButton = screen.getByRole('button', { name: 'Joystick' });
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
        dialogueState: {
          npcId: 'npc_1',
          npcName: 'Sheriff Brass',
          text: 'Hello there.',
          treeId: 'test_tree',
          currentNodeId: 'test_node',
          choices: [],
          autoAdvanceNodeId: null,
          history: [],
          conversationFlags: {},
          startedAt: Date.now(),
        },
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

  it('should display NPC expression badge', () => {
    const mockNPC = createMockNPC({ id: 'npc_1', name: 'Test NPC', role: 'sheriff' });
    customRender(<DialogueBox />, {
      initialState: {
        phase: 'dialogue',
        dialogueState: {
          npcId: 'npc_1',
          npcName: 'Test NPC',
          text: 'Hello.',
          npcExpression: 'suspicious',
          treeId: 'test_tree',
          currentNodeId: 'test_node',
          choices: [],
          autoAdvanceNodeId: null,
          history: [],
          conversationFlags: {},
          startedAt: Date.now(),
        },
        npcs: { 'npc_1': mockNPC },
        settings: { reducedMotion: true },
      } as any,
    });

    expect(screen.getByText('suspicious')).toBeInTheDocument();
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
