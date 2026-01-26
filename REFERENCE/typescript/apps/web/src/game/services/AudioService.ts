/**
 * AudioService.ts - Game store integration for audio system
 *
 * Connects the AudioManager to Zustand game store events.
 * Provides a singleton service that reacts to game state changes.
 */

import * as Tone from 'tone';
import { useGameStore } from '../store/webGameStore';
import {
  getAudioManager,
  type GameLocation,
  type TimeOfDay,
} from './audio';

/**
 * AudioService - Bridges game state and audio systems
 */
class AudioService {
  private initialized = false;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.setupStoreSubscription();
  }

  /**
   * Subscribe to game store changes and trigger appropriate audio
   */
  private setupStoreSubscription(): void {
    this.unsubscribe = useGameStore.subscribe((state, prevState) => {
      const audio = getAudioManager();

      // Volume changes
      if (state.settings.musicVolume !== prevState.settings.musicVolume) {
        Tone.Destination.volume.rampTo(Tone.gainToDb(state.settings.musicVolume), 0.1);
      }

      // Phase changes - map to audio locations
      if (state.phase !== prevState.phase) {
        this.handlePhaseChange(state.phase, prevState.phase);
      }

      // Combat state changes
      if (state.combatState !== prevState.combatState) {
        if (state.combatState && !prevState.combatState) {
          // Combat started
          audio.onCombatStart();
        } else if (!state.combatState && prevState.combatState) {
          // Combat ended - check result
          const result = prevState.combatState.phase;
          if (result === 'victory' || result === 'defeat' || result === 'fled') {
            audio.onCombatEnd(result);
          }
        }
      }

      // Shop state changes
      if (state.shopState !== prevState.shopState) {
        if (state.shopState && !prevState.shopState) {
          audio.onShopOpen();
        } else if (!state.shopState && prevState.shopState) {
          audio.onShopClose();
        }
      }

      // Dialogue state changes
      if (state.dialogueState !== prevState.dialogueState) {
        if (state.dialogueState && !prevState.dialogueState) {
          audio.onDialogueStart();
        } else if (!state.dialogueState && prevState.dialogueState) {
          audio.onDialogueEnd();
        }
      }

      // Time of day changes (calculate from hour)
      const prevTimeOfDay = this.getTimeOfDayFromHour(prevState.time.hour);
      const currentTimeOfDay = this.getTimeOfDayFromHour(state.time.hour);
      if (currentTimeOfDay !== prevTimeOfDay) {
        audio.setTimeOfDay(currentTimeOfDay);
      }

      // Audio track changes (for legacy compatibility)
      if (state.audio.currentTrack !== prevState.audio.currentTrack) {
        if (state.audio.currentTrack) {
          audio.start();
        } else {
          audio.stop();
        }
      }

      // Play/Pause state
      if (state.audio.isPlaying !== prevState.audio.isPlaying) {
        if (state.audio.isPlaying) {
          if (Tone.context.state === 'suspended') Tone.start();
          audio.start();
        } else {
          audio.stop();
        }
      }
    });
  }

  /**
   * Get time of day from hour (0-23)
   */
  private getTimeOfDayFromHour(hour: number): TimeOfDay {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 18) return 'day';
    if (hour >= 18 && hour < 20) return 'dusk';
    return 'night';
  }

  /**
   * Handle game phase changes
   */
  private handlePhaseChange(
    phase: string,
    _prevPhase: string
  ): void {
    const audio = getAudioManager();

    let location: GameLocation = 'overworld';

    switch (phase) {
      case 'title':
      case 'character_creation':
        location = 'menu';
        break;
      case 'combat':
        location = 'combat';
        break;
      case 'dialogue':
        // Keep current location during dialogue
        return;
      case 'playing':
      case 'paused':
        // Check if in town based on current location
        const state = useGameStore.getState();
        if (state.currentLocationId?.includes('town') || state.currentLocationId?.includes('city')) {
          location = 'town';
        } else {
          location = 'overworld';
        }
        break;
      default:
        location = 'overworld';
    }

    audio.setLocation(location);
  }

  /**
   * Initialize the audio system (call after user interaction)
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await Tone.start();
      await getAudioManager().init();

      // Set initial state from store
      const state = useGameStore.getState();
      const audio = getAudioManager();

      Tone.Destination.volume.value = Tone.gainToDb(state.settings.musicVolume);

      // Set initial time of day based on hour
      audio.setTimeOfDay(this.getTimeOfDayFromHour(state.time.hour));

      this.initialized = true;
      console.log('[AudioService] Initialized (Tone.js)');
    } catch (err) {
      console.error('[AudioService] Failed to initialize:', err);
    }
  }

  /**
   * Play background music (legacy compatibility)
   */
  public playMusic(_trackId: string): void {
    getAudioManager().start();
  }

  /**
   * Stop background music
   */
  public stopMusic(): void {
    getAudioManager().stop();
  }

  /**
   * Play a sound effect (legacy compatibility)
   */
  public playSfx(sfxId: string): void {
    const audio = getAudioManager();

    switch (sfxId) {
      case 'ui_click':
        audio.playUI('click');
        break;
      case 'ui_open':
        audio.playUI('open');
        break;
      case 'ui_close':
        audio.playUI('close');
        break;
      case 'footstep_dirt':
        audio.playMovement('footstep_dirt');
        break;
      case 'gunshot':
        audio.playCombat('gunshot');
        break;
      case 'item_pickup':
        audio.playMovement('item_pickup');
        break;
      default:
        // Fallback for unmapped sounds
        audio.playUI('click');
        break;
    }
  }

  /**
   * Play combat sounds (legacy compatibility)
   */
  public playCombatSound(type: 'attack' | 'reload' | 'hit' | 'miss'): void {
    const audio = getAudioManager();

    switch (type) {
      case 'attack':
        audio.playCombat('gunshot');
        break;
      case 'reload':
        audio.playCombat('reload');
        break;
      case 'hit':
        audio.playCombat('hit');
        break;
      case 'miss':
        audio.playCombat('miss');
        break;
    }
  }

  /**
   * Dispose and cleanup
   */
  public dispose(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    getAudioManager().dispose();
    this.initialized = false;
  }
}

// Singleton instance
export const audioService = new AudioService();
