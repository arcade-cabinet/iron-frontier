/**
 * AudioProvider — Initializes the Tone.js audio context and wires
 * the GameAudioBridge to game events.
 *
 * Must wrap the game UI tree so that:
 *  1. Tone.start() is called on first user interaction (browser autoplay policy).
 *  2. GameAudioBridge.init() subscribes to all game events.
 *  3. Volume settings from the Zustand store are reflected in Tone.js.
 *  4. Everything tears down cleanly on unmount.
 *
 * Also exposes an AudioSettingsContext for child components that need to
 * read or modify audio settings (master volume, sfx volume, mute toggle).
 *
 * @module components/game/AudioProvider
 */

import * as React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as Tone from 'tone';
import { gameStore } from '@/src/game/store';
import { gameAudioBridge } from '@/src/game/services/audio/GameAudioBridge';
import { MusicManager } from '@/src/game/services/audio/MusicManager';
import type { AudioBridgeStoreShape } from '@/src/game/services/audio/GameAudioBridge';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface AudioSettings {
  /** Master volume (0-1). Currently maps to musicVolume in settings. */
  masterVolume: number;
  /** SFX volume (0-1). */
  sfxVolume: number;
  /** Music volume (0-1). */
  musicVolume: number;
  /** Whether all audio is muted. */
  muted: boolean;
  /** Whether the Tone.js audio context has been started. */
  audioReady: boolean;
}

export interface AudioSettingsAPI extends AudioSettings {
  /** Set the master volume (0-1). */
  setMasterVolume: (v: number) => void;
  /** Set the SFX volume (0-1). */
  setSfxVolume: (v: number) => void;
  /** Set the music volume (0-1). */
  setMusicVolume: (v: number) => void;
  /** Toggle mute on/off. */
  toggleMute: () => void;
  /** Resume the audio context (call from a user gesture handler). */
  resumeAudio: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AudioSettingsContext = createContext<AudioSettingsAPI | null>(null);

/**
 * Hook to access audio settings and controls from child components.
 * Must be used within an <AudioProvider>.
 */
export function useAudioSettings(): AudioSettingsAPI {
  const ctx = useContext(AudioSettingsContext);
  if (!ctx) {
    throw new Error('useAudioSettings must be used within an <AudioProvider>');
  }
  return ctx;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [audioReady, setAudioReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const musicManagerRef = useRef<MusicManager | null>(null);
  const previousMuteVolume = useRef<number>(-1);

  // Read initial settings from the store
  const settingsRef = useRef(gameStore.getState().settings);

  // Track the latest settings reactively
  useEffect(() => {
    const unsubscribe = gameStore.subscribe((state) => {
      settingsRef.current = state.settings;
    });
    return unsubscribe;
  }, []);

  // -----------------------------------------------------------------------
  // Resume / Init audio context
  // -----------------------------------------------------------------------

  const resumeAudio = useCallback(async () => {
    if (audioReady) return;

    try {
      await Tone.start();

      // Apply initial volume
      const settings = gameStore.getState().settings;
      Tone.Destination.volume.value = Tone.gainToDb(settings.musicVolume);

      // Create music manager
      if (!musicManagerRef.current) {
        musicManagerRef.current = new MusicManager();
      }

      // Initialize the bridge with the store and music manager
      gameAudioBridge.init({
        store: gameStore as unknown as import('zustand').StoreApi<AudioBridgeStoreShape>,
        musicManager: musicManagerRef.current,
      });

      setAudioReady(true);
      console.log('[AudioProvider] Audio context started, bridge initialized');
    } catch (err) {
      console.warn('[AudioProvider] Failed to start audio context:', err);
    }
  }, [audioReady]);

  // -----------------------------------------------------------------------
  // Auto-init on first user interaction
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (audioReady) return;

    const handleInteraction = () => {
      resumeAudio();
    };

    // Listen on both click and keydown for the first interaction
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [audioReady, resumeAudio]);

  // -----------------------------------------------------------------------
  // Teardown on unmount
  // -----------------------------------------------------------------------

  useEffect(() => {
    return () => {
      gameAudioBridge.teardown();
      musicManagerRef.current?.stop();
      musicManagerRef.current = null;
    };
  }, []);

  // -----------------------------------------------------------------------
  // Settings actions
  // -----------------------------------------------------------------------

  const setMasterVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    Tone.Destination.volume.rampTo(Tone.gainToDb(clamped), 0.1);
    gameStore.getState().updateSettings({ musicVolume: clamped });
  }, []);

  const setSfxVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    gameStore.getState().updateSettings({ sfxVolume: clamped });
  }, []);

  const setMusicVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    gameStore.getState().updateSettings({ musicVolume: clamped });
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const newMuted = !prev;
      if (newMuted) {
        previousMuteVolume.current = Tone.Destination.volume.value;
        Tone.Destination.volume.rampTo(-Infinity, 0.1);
      } else {
        const restoreDb =
          previousMuteVolume.current > -Infinity
            ? previousMuteVolume.current
            : Tone.gainToDb(settingsRef.current.musicVolume);
        Tone.Destination.volume.rampTo(restoreDb, 0.1);
      }
      return newMuted;
    });
  }, []);

  // -----------------------------------------------------------------------
  // Context value
  // -----------------------------------------------------------------------

  const value: AudioSettingsAPI = {
    masterVolume: settingsRef.current.musicVolume,
    sfxVolume: settingsRef.current.sfxVolume,
    musicVolume: settingsRef.current.musicVolume,
    muted,
    audioReady,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    toggleMute,
    resumeAudio,
  };

  return (
    <AudioSettingsContext.Provider value={value}>
      {children}
    </AudioSettingsContext.Provider>
  );
}
