/**
 * Game Flow Tests
 * Tests for page-to-page transitions and overall game flow
 */
import { Game } from '@/game/Game';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customRender, getStoreState, resetGameStore } from './test-utils';

// Mocks
vi.mock('@/engine/rendering/SceneManager', () => ({
  SceneManager: vi.fn().mockImplementation(function () {
    return {
      setPlayerPosition: vi.fn(),
      setGroundClickHandler: vi.fn(),
      movePlayerTo: vi.fn(),
      start: vi.fn(),
      dispose: vi.fn(),
      getHeightAt: vi.fn().mockReturnValue(0),
    };
  }),
}));

vi.mock('reactylon/web', () => ({
  Engine: ({ children }: { children: React.ReactNode }) => <div data-testid="babylon-engine">{children}</div>,
}));

vi.mock('reactylon/core', () => ({
  Scene: ({ children }: { children: React.ReactNode }) => <div data-testid="babylon-scene">{children}</div>,
  useScene: () => null,
}));

vi.mock('@babylonjs/core/Maths/math', () => ({
  Vector3: class { constructor(public x = 0, public y = 0, public z = 0) { } },
  Color3: class {
    constructor(public r = 0, public g = 0, public b = 0) { }
    static FromHexString() { return new this(); }
    scale() { return new (this.constructor as any)(); }
  },
  Color4: class { constructor(public r = 0, public g = 0, public b = 0, public a = 1) { } },
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('Game Flow', () => {
  beforeEach(() => {
    resetGameStore();
  });

  // Use longer timeout for integration tests
  describe('Title to Game Transition', () => {
    it('should show title screen then transition to name input', async () => {
      customRender(<Game />);

      // Wait for splash to finish (2500ms)
      const btn = await screen.findByRole('button', { name: /Begin Adventure/i }, { timeout: 5000 });
      fireEvent.click(btn);

      expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
    });

    it('should transition to game after entering name', async () => {
      customRender(<Game />);

      const beginBtn = await screen.findByRole('button', { name: /Begin Adventure/i }, { timeout: 5000 });
      fireEvent.click(beginBtn);

      fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), { target: { value: 'Tester' } });
      fireEvent.click(screen.getByRole('button', { name: /Start/i }));

      await waitFor(() => {
        expect(getStoreState().phase).toBe('playing');
        expect(screen.getByText('Tester')).toBeInTheDocument();
      });
    });
  });

  describe('In-Game HUD and Panels', () => {
    it('should render game HUD when initialized in playing state', async () => {
      customRender(<Game />, {
        initialState: {
          phase: 'playing',
          initialized: true,
          playerName: 'Tester',
          playerStats: { health: 90, maxHealth: 100, level: 3, gold: 50 }
        } as any
      });

      expect(screen.getByText('Tester')).toBeInTheDocument();
      // New HUD format: "Lv.3" instead of "Level 3"
      expect(screen.getByText('Lv.3')).toBeInTheDocument();
      // New HUD shows just the health value
      expect(screen.getByText('90')).toBeInTheDocument();
    });
  });
});
