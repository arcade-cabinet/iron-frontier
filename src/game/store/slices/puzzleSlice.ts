/**
 * Puzzle Slice - Puzzle state and actions
 *
 * Manages puzzle minigames including pipe-fitter puzzles used for
 * lockpicking containers, doors, and hacking terminals.
 *
 * @module game/store/slices/puzzleSlice
 */

import type { StateCreator } from 'zustand';
import { PipeLogic, PuzzleGenerator } from '../../puzzles/pipe-fitter';
import type { Direction, LockLevel, PipeCell, PipePuzzleState, PuzzleContext } from '../../puzzles/pipe-fitter/types';
import { LOCK_DIFFICULTY } from '../../puzzles/pipe-fitter/types';
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
  /** Start a new puzzle (generic, no lock context) */
  startPuzzle: (width: number, height: number) => void;
  /** Start a lockpick puzzle for a locked entity */
  startLockpickPuzzle: (
    targetEntityId: string,
    targetName: string,
    lockLevel: LockLevel,
  ) => void;
  /** Update the puzzle grid */
  updatePuzzle: (newGrid: PipeCell[][]) => void;
  /** Rotate a pipe at coordinates */
  rotatePipe: (row: number, col: number) => void;
  /** Close the puzzle with result */
  closePuzzle: (success: boolean) => void;
  /** Force a lock open (costs multiple lockpicks) */
  forceLock: () => void;
  /** Give up on the puzzle (consumes a lockpick on failure) */
  abandonPuzzle: () => void;
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
  getItemCount: (itemId: string) => number;
  removeItem: (itemId: string, quantity?: number) => void;
  addItemById: (itemId: string, quantity?: number) => void;
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

/** Base XP reward for completing a puzzle (scaled by lock level) */
const PUZZLE_BASE_XP = 25;

/** Base gold reward for completing a puzzle (scaled by lock level) */
const PUZZLE_BASE_GOLD = 5;

/** Lockpick item ID */
const LOCKPICK_ITEM_ID = 'lockpick';

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
    set({ activePuzzle: puzzle });
    get().setPhase('puzzle');
  },

  startLockpickPuzzle: (
    targetEntityId: string,
    targetName: string,
    lockLevel: LockLevel,
  ) => {
    const state = get();
    const lockpickCount = state.getItemCount(LOCKPICK_ITEM_ID);

    if (lockpickCount < 1) {
      state.addNotification('warning', 'You need a lockpick to attempt this lock.');
      return;
    }

    const context: PuzzleContext = {
      targetEntityId,
      targetName,
      lockLevel,
    };

    const puzzle = PuzzleGenerator.generateForLock(lockLevel, context);
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
    if (cell.locked || cell.fixed) return;

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
    const puzzle = state.activePuzzle;
    set({ activePuzzle: null });
    state.setPhase('playing');

    if (success) {
      const lockLevel = puzzle?.context?.lockLevel ?? 1;
      const xpReward = PUZZLE_BASE_XP * lockLevel;
      const goldReward = PUZZLE_BASE_GOLD * lockLevel;

      if (puzzle?.context) {
        state.addNotification('info', `Lock opened! Gained ${xpReward} XP.`);
      } else {
        state.addNotification('info', 'Systems restored!');
      }
      state.gainXP(xpReward);
      state.addGold(goldReward);
    }
    // Failure handled by abandonPuzzle, not closePuzzle
  },

  forceLock: () => {
    const state = get();
    const puzzle = state.activePuzzle;
    if (!puzzle?.context) return;

    const diff = LOCK_DIFFICULTY[puzzle.context.lockLevel];
    const lockpickCount = state.getItemCount(LOCKPICK_ITEM_ID);

    if (lockpickCount < diff.forceLockCost) {
      state.addNotification(
        'warning',
        `Need ${diff.forceLockCost} lockpicks to force this lock. You have ${lockpickCount}.`,
      );
      return;
    }

    // Consume lockpicks
    state.removeItem(LOCKPICK_ITEM_ID, diff.forceLockCost);

    // Mark as solved and close
    set({
      activePuzzle: {
        ...puzzle,
        solved: true,
      },
    });

    const xpReward = Math.floor(PUZZLE_BASE_XP * puzzle.context.lockLevel * 0.5);
    state.addNotification(
      'info',
      `Forced the lock open! Used ${diff.forceLockCost} lockpicks.`,
    );
    state.gainXP(xpReward);

    // Close after a brief moment (caller should handle)
    set({ activePuzzle: null });
    state.setPhase('playing');
  },

  abandonPuzzle: () => {
    const state = get();
    const puzzle = state.activePuzzle;

    if (puzzle?.context) {
      // Consume one lockpick on failure
      const lockpickCount = state.getItemCount(LOCKPICK_ITEM_ID);
      if (lockpickCount > 0) {
        state.removeItem(LOCKPICK_ITEM_ID, 1);
        state.addNotification('warning', 'Lockpick broken. The lock resets.');
      } else {
        state.addNotification('warning', 'Failed. No lockpicks remaining.');
      }
    } else {
      state.addNotification('warning', 'Repair abandoned.');
    }

    set({ activePuzzle: null });
    state.setPhase('playing');
  },

  isPuzzleSolved: () => {
    return get().activePuzzle?.solved ?? false;
  },

  resetPuzzle: () => set({ activePuzzle: null }),
});
