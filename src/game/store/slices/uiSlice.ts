/**
 * UI Slice - User interface state
 *
 * Manages UI-specific state including panels, notifications,
 * and dialogue display.
 *
 * @module game/store/slices/uiSlice
 */

import type { StateCreator } from 'zustand';
import type {
  DialogueState,
  GamePhase,
  Notification,
  PanelType,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * UI state data (serializable).
 */
export interface UIState {
  /** Currently active panel (inventory, quests, etc.) */
  activePanel: PanelType | null;
  /** Active notifications */
  notifications: Notification[];
  /** Current dialogue state if in dialogue */
  dialogueState: DialogueState | null;
  /** History of dialogue node IDs visited */
  dialogueHistory: string[];
}

/**
 * UI actions.
 */
export interface UIActions {
  /** Toggle a panel open/closed */
  togglePanel: (panel: PanelType) => void;
  /** Open a specific panel */
  openPanel: (panel: PanelType) => void;
  /** Close the current panel */
  closePanel: () => void;
  /** Set the dialogue state directly */
  setDialogue: (dialogue: DialogueState | null) => void;
  /** Add a notification */
  addNotification: (type: Notification['type'], message: string) => void;
  /** Remove a notification by ID */
  removeNotification: (id: string) => void;
  /** Clear all notifications */
  clearNotifications: () => void;
  /** Reset UI state */
  resetUI: () => void;
}

/**
 * Dependencies from other slices.
 */
export interface UISliceDeps {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
}

/**
 * Complete UI slice type.
 */
export type UISlice = UIState & UIActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default UI state.
 */
export const DEFAULT_UI_STATE: UIState = {
  activePanel: null,
  notifications: [],
  dialogueState: null,
  dialogueHistory: [],
};

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum number of notifications to display */
const MAX_NOTIFICATIONS = 5;

/** Auto-dismiss time for notifications in milliseconds */
const NOTIFICATION_TIMEOUT = 3000;

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the UI Zustand slice.
 *
 * @example
 * ```typescript
 * const useGameStore = create<GameState>()((...a) => ({
 *   ...createCoreSlice(...a),
 *   ...createUISlice(...a),
 *   // ... other slices
 * }));
 * ```
 */
export const createUISlice: StateCreator<UISlice & UISliceDeps, [], [], UISlice> = (
  set,
  get
) => ({
  // State
  ...DEFAULT_UI_STATE,

  // Actions
  togglePanel: (panel: PanelType) => {
    const state = get();
    if (state.activePanel === panel) {
      state.closePanel();
    } else {
      state.openPanel(panel);
    }
  },

  openPanel: (panel: PanelType) => {
    const state = get();
    set({
      activePanel: panel,
    });
    // Pause game if in playing phase
    if (state.phase === 'playing') {
      state.setPhase('paused');
    }
  },

  closePanel: () => {
    const state = get();
    set({
      activePanel: null,
    });
    // Resume game if was paused
    if (state.phase === 'paused') {
      state.setPhase('playing');
    }
  },

  setDialogue: (dialogue: DialogueState | null) => set({ dialogueState: dialogue }),

  addNotification: (type: Notification['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      type,
      message,
      timestamp: Date.now(),
    };

    set((s) => ({
      notifications: [notification, ...s.notifications].slice(0, MAX_NOTIFICATIONS),
    }));

    // Auto remove after timeout
    setTimeout(() => {
      get().removeNotification(id);
    }, NOTIFICATION_TIMEOUT);
  },

  removeNotification: (id: string) => {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => set({ notifications: [] }),

  resetUI: () =>
    set({
      ...DEFAULT_UI_STATE,
    }),
});
