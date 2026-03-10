/**
 * Audio Slice - Audio playback state
 *
 * Manages background music and audio state tracking.
 *
 * @module game/store/slices/audioSlice
 */

import type { StateCreator } from 'zustand';
import type { AudioState, CameraState } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Audio slice state.
 */
export interface AudioSliceState {
  /** Current audio state */
  audio: AudioState;
  /** Camera state */
  camera: CameraState;
}

/**
 * Audio actions.
 */
export interface AudioActions {
  /** Start playing a music track */
  playMusic: (trackId: string) => void;
  /** Stop the current music */
  stopMusic: () => void;
}

/**
 * Complete audio slice type.
 */
export type AudioSlice = AudioSliceState & AudioActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default audio state.
 */
export const DEFAULT_AUDIO_STATE: AudioState = {
  currentTrack: null,
  isPlaying: false,
};

/**
 * Default camera state.
 */
export const DEFAULT_CAMERA_STATE: CameraState = {
  focusPoint: { x: 32, y: 5, z: 32 },
  distance: 30,
  azimuth: Math.PI * 0.75,
  elevation: 0.4,
  minDistance: 15,
  maxDistance: 80,
  minElevation: 0.2,
  maxElevation: 1.4,
  followLag: 0.1,
  isInCutscene: false,
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the audio Zustand slice.
 */
export const createAudioSlice: StateCreator<AudioSlice, [], [], AudioSlice> = (
  set
) => ({
  // State
  audio: DEFAULT_AUDIO_STATE,
  camera: DEFAULT_CAMERA_STATE,

  // Actions
  playMusic: (trackId: string) => {
    set((state) => ({
      audio: {
        ...state.audio,
        currentTrack: trackId,
        isPlaying: true,
      },
    }));
  },

  stopMusic: () => {
    set((state) => ({
      audio: {
        ...state.audio,
        isPlaying: false,
      },
    }));
  },
});
