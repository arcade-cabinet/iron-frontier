/**
 * Game Flow Tests
 * Tests for page-to-page transitions and overall game flow
 */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Game } from '@/game/Game';
import { customRender, getStoreState, resetGameStore } from './test-utils';

// Mock React Three Fiber Canvas
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: {},
    gl: {},
    scene: {},
  })),
}));

// Mock drei components
vi.mock('@react-three/drei', () => ({
  Sky: () => null,
  Cloud: () => null,
  OrbitControls: () => null,
  useTexture: vi.fn(() => null),
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Instances: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Instance: () => null,
}));

// Mock postprocessing
vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Bloom: () => null,
  Vignette: () => null,
}));

// Mock framer-motion
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
      const btn = await screen.findByRole(
        'button',
        { name: /Begin Adventure/i },
        { timeout: 5000 }
      );
      fireEvent.click(btn);

      expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
    });

    it('should transition to game after entering name', async () => {
      customRender(<Game />);

      const beginBtn = await screen.findByRole(
        'button',
        { name: /Begin Adventure/i },
        { timeout: 5000 }
      );
      fireEvent.click(beginBtn);

      fireEvent.change(screen.getByPlaceholderText(/Enter your name/i), {
        target: { value: 'Tester' },
      });
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
          playerStats: { health: 90, maxHealth: 100, level: 3, gold: 50 },
        } as any,
      });

      expect(screen.getByText('Tester')).toBeInTheDocument();
      // New HUD format: "Lv.3" instead of "Level 3"
      expect(screen.getByText('Lv.3')).toBeInTheDocument();
      // New HUD shows just the health value
      expect(screen.getByText('90')).toBeInTheDocument();
    });
  });
});
