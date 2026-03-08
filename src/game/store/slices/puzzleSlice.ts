/**
 * Puzzle Slice - Puzzle state and actions
 *
 * Manages puzzle minigames including pipe-fitter puzzles.
 *
 * @module game/store/slices/puzzleSlice
 */

import type { StateCreator } from 'zustand';
import { PipeLogic, PuzzleGenerator } from '../../puzzles/pipe-fitter';
import type { Direction, PipeCell, PipePuzzleState } from '../../puzzles/pipe-fitter/types';
import type { GamePhase, Notification } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Puzzle state.
 */
export interface PuzzleState {
  /** Active puzzle state, null if no puzzle active */
  activePuzzle: PipePuzzleState | null;
}

/**
 * Puzzle actions.
 */
export interface PuzzleActions {
  /** Start a new puzzle */
  startPuzzle: (width: number, height: number) => void;
  /** Update the puzzle grid */
  updatePuzzle: (newGrid: PipeCell[][]) => void;
  /** Rotate a pipe at coordinates */
  rotatePipe: (row: number, col: number) => void;
  /** Close the puzzle with result */
  closePuzzle: (success: boolean) => void;
  /** Check if puzzle is solved */
  isPuzzleSolved: () => boolean;
  /** Reset puzzle state */
  resetPuzzle: () => void;
}

/**
 * Dependencies from other slices.
 */
export interface PuzzleSliceDeps {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  gainXP: (amount: number) => void;
  addGold: (amount: number) => void;
}

/**
 * Complete puzzle slice type.
 */
export type PuzzleSlice = PuzzleState & PuzzleActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default puzzle state.
 */
export const DEFAULT_PUZZLE_STATE: PuzzleState = {
  activePuzzle: null,
};

// ============================================================================
// CONSTANTS
// ============================================================================

/** XP reward for completing a puzzle */
const PUZZLE_XP_REWARD = 50;

/** Gold reward for completing a puzzle */
const PUZZLE_GOLD_REWARD = 10;

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the puzzle Zustand slice.
 */
export const createPuzzleSlice: StateCreator<
  PuzzleSlice & PuzzleSliceDeps,
  [],
  [],
  PuzzleSlice
> = (set, get) => ({
  // State
  ...DEFAULT_PUZZLE_STATE,

  // Actions
  startPuzzle: (width: number, height: number) => {
    const puzzle = PuzzleGenerator.generate(width, height);
    const state = get();
    set({ activePuzzle: puzzle });
    state.setPhase('puzzle');
  },

  updatePuzzle: (newGrid: PipeCell[][]) => {
    const state = get();
    if (!state.activePuzzle) return;

    const newState = {
      ...state.activePuzzle,
      grid: newGrid,
    };

    // Check for solution
    const { solved, newGrid: checkedGrid } = PipeLogic.checkFlow(newState);

    set({
      activePuzzle: {
        ...newState,
        grid: checkedGrid,
        solved,
      },
    });
  },

  rotatePipe: (row: number, col: number) => {
    const state = get();
    if (!state.activePuzzle) return;

    const grid = state.activePuzzle.grid;
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) return;

    const cell = grid[row][col];
    if (cell.locked) return;

    // Create new grid with rotated cell
    const newGrid = grid.map((r, ri) =>
      r.map((c, ci) => {
        if (ri === row && ci === col) {
          return {
            ...c,
            rotation: ((c.rotation + 1) % 4) as Direction,
          };
        }
        return c;
      })
    );

    state.updatePuzzle(newGrid);
  },

  closePuzzle: (success: boolean) => {
    const state = get();
    set({ activePuzzle: null });
    state.setPhase('playing');

    if (success) {
      state.addNotification('info', 'Systems restored!');
      state.gainXP(PUZZLE_XP_REWARD);
      state.addGold(PUZZLE_GOLD_REWARD);
    } else {
      state.addNotification('warning', 'Repair failed.');
    }
  },

  isPuzzleSolved: () => {
    return get().activePuzzle?.solved ?? false;
  },

  resetPuzzle: () => set({ activePuzzle: null }),
});
