/**
 * Settings Slice - Game settings state
 *
 * Manages user preferences and game configuration.
 *
 * @module game/store/slices/settingsSlice
 */

import type { StateCreator } from 'zustand';
import type { GameSettings } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Settings state.
 */
export interface SettingsState {
  /** Current game settings */
  settings: GameSettings;
}

/**
 * Settings actions.
 */
export interface SettingsActions {
  /** Update settings (partial) */
  updateSettings: (settings: Partial<GameSettings>) => void;
  /** Set master volume (0-1) */
  setMasterVolume: (volume: number) => void;
  /** Set music volume */
  setMusicVolume: (volume: number) => void;
  /** Set SFX volume */
  setSfxVolume: (volume: number) => void;
  /** Toggle mute on/off */
  toggleMute: () => void;
  /** Toggle haptics */
  toggleHaptics: () => void;
  /** Set control mode */
  setControlMode: (mode: 'tap' | 'joystick') => void;
  /** Toggle reduced motion */
  toggleReducedMotion: () => void;
  /** Toggle minimap */
  toggleMinimap: () => void;
  /** Toggle low power mode */
  toggleLowPowerMode: () => void;
  /** Set camera distance */
  setCameraDistance: (distance: number) => void;
  /** Reset settings to defaults */
  resetSettings: () => void;
}

/**
 * Complete settings slice type.
 */
export type SettingsSlice = SettingsState & SettingsActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default game settings.
 */
export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 1.0,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
  haptics: true,
  controlMode: 'tap',
  reducedMotion: false,
  showMinimap: true,
  lowPowerMode: false,
  cameraDistance: 15,
};

/**
 * Default settings state.
 */
export const DEFAULT_SETTINGS_STATE: SettingsState = {
  settings: DEFAULT_SETTINGS,
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the settings Zustand slice.
 */
export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (
  set,
  get
) => ({
  // State
  ...DEFAULT_SETTINGS_STATE,

  // Actions
  updateSettings: (settings: Partial<GameSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...settings },
    }));
  },

  setMasterVolume: (volume: number) => {
    set((state) => ({
      settings: { ...state.settings, masterVolume: Math.max(0, Math.min(1, volume)) },
    }));
  },

  setMusicVolume: (volume: number) => {
    set((state) => ({
      settings: { ...state.settings, musicVolume: Math.max(0, Math.min(1, volume)) },
    }));
  },

  setSfxVolume: (volume: number) => {
    set((state) => ({
      settings: { ...state.settings, sfxVolume: Math.max(0, Math.min(1, volume)) },
    }));
  },

  toggleMute: () => {
    set((state) => ({
      settings: { ...state.settings, muted: !state.settings.muted },
    }));
  },

  toggleHaptics: () => {
    set((state) => ({
      settings: { ...state.settings, haptics: !state.settings.haptics },
    }));
  },

  setControlMode: (mode: 'tap' | 'joystick') => {
    set((state) => ({
      settings: { ...state.settings, controlMode: mode },
    }));
  },

  toggleReducedMotion: () => {
    set((state) => ({
      settings: { ...state.settings, reducedMotion: !state.settings.reducedMotion },
    }));
  },

  toggleMinimap: () => {
    set((state) => ({
      settings: { ...state.settings, showMinimap: !state.settings.showMinimap },
    }));
  },

  toggleLowPowerMode: () => {
    set((state) => ({
      settings: { ...state.settings, lowPowerMode: !state.settings.lowPowerMode },
    }));
  },

  setCameraDistance: (distance: number) => {
    set((state) => ({
      settings: { ...state.settings, cameraDistance: Math.max(5, Math.min(30, distance)) },
    }));
  },

  resetSettings: () =>
    set({
      settings: { ...DEFAULT_SETTINGS },
    }),
});
