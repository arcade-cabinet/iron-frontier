/**
 * Title Screen Tests
 * Tests for visual elements and interactions on the title/splash screens
 */
import { TitleScreen } from '@/game/screens/TitleScreen';
import { act, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { customRender, getStoreState, resetGameStore } from './test-utils';

// Mock framer-motion to avoid animation issues
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
  },
}));

describe('TitleScreen', () => {
  beforeEach(() => {
    resetGameStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const skipSplash = () => {
    act(() => {
      vi.advanceTimersByTime(3000);
    });
  };

  describe('Splash Screen', () => {
    it('should render splash screen initially', () => {
      customRender(<TitleScreen />);
      expect(screen.getByText('IRON FRONTIER')).toBeInTheDocument();
      expect(screen.getByText('Loading Steam...')).toBeInTheDocument();
    });

    it('should transition to main menu after splash timeout', async () => {
      customRender(<TitleScreen />);
      skipSplash();
      expect(screen.getByText('Tales of the Steam Frontier')).toBeInTheDocument();
    });
  });

  describe('Main Menu Visual Elements', () => {
    beforeEach(() => {
      customRender(<TitleScreen />);
      skipSplash();
    });

    it('should display game title', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('IRON FRONTIER');
    });

    it('should display subtitle', () => {
      expect(screen.getByText('Tales of the Steam Frontier')).toBeInTheDocument();
    });

    it('should display Begin Adventure button for new players', () => {
      expect(screen.getByRole('button', { name: /Begin Adventure/i })).toBeInTheDocument();
    });
  });

  describe('New Game Flow', () => {
    beforeEach(() => {
      customRender(<TitleScreen />);
      skipSplash();
    });

    it('should show name input when clicking Begin Adventure', () => {
      const beginButton = screen.getByRole('button', { name: /Begin Adventure/i });
      fireEvent.click(beginButton);

      expect(screen.getByPlaceholderText(/Enter your name/i)).toBeInTheDocument();
    });

    it('should show Back and Start buttons in name input mode', () => {
      fireEvent.click(screen.getByRole('button', { name: /Begin Adventure/i }));

      expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start/i })).toBeInTheDocument();
    });

    it('should start game with entered name when clicking Start', () => {
      fireEvent.click(screen.getByRole('button', { name: /Begin Adventure/i }));

      const input = screen.getByPlaceholderText(/Enter your name/i);
      fireEvent.change(input, { target: { value: 'NewPlayer' } });

      fireEvent.click(screen.getByRole('button', { name: /Start/i }));

      const state = getStoreState();
      expect(state.phase).toBe('playing');
      expect(state.playerName).toBe('NewPlayer');
    });
  });

  describe('Main Menu with Saved Data', () => {
    beforeEach(() => {
      customRender(<TitleScreen />, {
        initialState: {
          initialized: true,
          playerName: 'SavedPlayer',
          playerStats: { level: 5, gold: 100 }
        } as any,
      });
      skipSplash();
    });

    it('should display Continue button when save exists', () => {
      expect(screen.getByRole('button', { name: /Continue as SavedPlayer/i })).toBeInTheDocument();
    });

    it('should display New Game button when save exists', () => {
      expect(screen.getByRole('button', { name: /New Game/i })).toBeInTheDocument();
    });
  });
});
