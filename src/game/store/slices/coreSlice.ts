/**
 * Core Slice - Game phase and initialization state
 *
 * Manages the core game flow state including phase transitions
 * and initialization status.
 *
 * @module game/store/slices/coreSlice
 */

import type { StateCreator } from 'zustand';
import type { GamePhase } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Core state data (serializable).
 */
export interface CoreState {
  /** Current game phase */
  phase: GamePhase;
  /** Whether game has been initialized */
  initialized: boolean;
  /** World generation seed */
  worldSeed: number;
  /** Save file version for migration */
  saveVersion: number;
  /** Timestamp of last save */
  lastSaved: number;
  /** Total play time in seconds */
  playTime: number;
}

/**
 * Core actions.
 */
export interface CoreActions {
  /** Set the current game phase */
  setPhase: (phase: GamePhase) => void;
  /** Mark game as initialized */
  setInitialized: (initialized: boolean) => void;
  /** Set the world seed */
  setWorldSeed: (seed: number) => void;
  /** Reset to initial state */
  resetCore: () => void;
  /** Update last saved timestamp */
  markSaved: () => void;
  /** Increment play time */
  incrementPlayTime: (seconds: number) => void;
}

/**
 * Complete core slice type.
 */
export type CoreSlice = CoreState & CoreActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/** Current save version */
export const SAVE_VERSION = 1;

/**
 * Default core state.
 */
export const DEFAULT_CORE_STATE: CoreState = {
  phase: 'title',
  initialized: false,
  worldSeed: Date.now(),
  saveVersion: SAVE_VERSION,
  lastSaved: 0,
  playTime: 0,
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the core Zustand slice.
 *
 * @example
 * ```typescript
 * const useGameStore = create<GameState>()((...a) => ({
 *   ...createCoreSlice(...a),
 *   ...createPlayerSlice(...a),
 *   // ... other slices
 * }));
 * ```
 */
export const createCoreSlice: StateCreator<CoreSlice, [], [], CoreSlice> = (set) => ({
  // State
  ...DEFAULT_CORE_STATE,

  // Actions
  setPhase: (phase: GamePhase) => set({ phase }),

  setInitialized: (initialized: boolean) => set({ initialized }),

  setWorldSeed: (seed: number) => set({ worldSeed: seed }),

  resetCore: () =>
    set({
      phase: 'title',
      initialized: false,
      worldSeed: Date.now(),
    }),

  markSaved: () => set({ lastSaved: Date.now() }),

  incrementPlayTime: (seconds: number) =>
    set((state) => ({ playTime: state.playTime + seconds })),
});
