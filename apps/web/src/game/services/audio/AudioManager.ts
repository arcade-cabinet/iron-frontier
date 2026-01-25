/**
 * AudioManager.ts - Central audio coordination for Iron Frontier
 *
 * Coordinates music, sound effects, and ambient audio.
 * Provides unified API for game systems to trigger audio.
 * Integrates with game state for context-aware audio.
 */

import * as Tone from 'tone';
import { MusicManager, type MusicState } from './MusicManager';
import { getSoundEffects, type SFXCategory } from './SoundEffects';

export type GameLocation = 'overworld' | 'town' | 'combat' | 'camp' | 'menu' | 'shop';
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface AudioSettings {
  masterVolume: number; // 0-100
  musicVolume: number; // 0-100
  sfxVolume: number; // 0-100
  ambientVolume: number; // 0-100
  enabled: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 80,
  musicVolume: 70,
  sfxVolume: 80,
  ambientVolume: 60,
  enabled: true,
};

export class AudioManager {
  private musicManager: MusicManager;
  private settings: AudioSettings;
  private currentLocation: GameLocation = 'menu';
  private currentTimeOfDay: TimeOfDay = 'day';
  private isInitialized = false;

  constructor() {
    this.musicManager = new MusicManager();
    this.settings = { ...DEFAULT_SETTINGS };
  }

  /**
   * Initialize audio (must be called after user interaction)
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Tone.start();
      this.isInitialized = true;
      this.applySettings();
      console.log('[AudioManager] Initialized');
    } catch (err) {
      console.error('[AudioManager] Failed to initialize:', err);
    }
  }

  /**
   * Start playing audio for current location
   */
  public async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (this.settings.enabled) {
      await this.musicManager.start();
    }
  }

  /**
   * Stop all audio
   */
  public stop(): void {
    this.musicManager.stop();
  }

  /**
   * Set current game location - affects music
   */
  public setLocation(location: GameLocation): void {
    this.currentLocation = location;
    this.updateMusicState();
  }

  /**
   * Set current time of day - affects music mood
   */
  public setTimeOfDay(time: TimeOfDay): void {
    this.currentTimeOfDay = time;
    this.updateMusicState();
  }

  /**
   * Update music state based on location and time
   */
  private updateMusicState(): void {
    let musicState: MusicState;

    switch (this.currentLocation) {
      case 'combat':
        musicState = 'combat';
        break;
      case 'town':
        musicState = 'town';
        break;
      case 'shop':
        musicState = 'shop';
        break;
      case 'camp':
        musicState = 'camp';
        break;
      case 'menu':
        musicState = 'menu';
        break;
      case 'overworld':
      default:
        // Time-based exploration music
        if (this.currentTimeOfDay === 'night' || this.currentTimeOfDay === 'dusk') {
          musicState = 'exploration_night';
        } else {
          musicState = 'exploration_day';
        }
        break;
    }

    this.musicManager.setState(musicState);
  }

  // =========================================================================
  // SOUND EFFECTS
  // =========================================================================

  /**
   * Play a UI sound effect
   */
  public playUI(
    sfx: 'click' | 'hover' | 'open' | 'close' | 'error' | 'success' | 'select' | 'confirm' | 'cancel'
  ): void {
    if (!this.settings.enabled) return;
    getSoundEffects().play(`ui_${sfx}`);
  }

  /**
   * Play a combat sound effect
   */
  public playCombat(
    sfx:
      | 'hit'
      | 'miss'
      | 'crit'
      | 'death'
      | 'heal'
      | 'defend'
      | 'flee'
      | 'start'
      | 'victory'
      | 'defeat'
      | 'gunshot'
      | 'reload'
      | 'ability'
  ): void {
    if (!this.settings.enabled) return;
    getSoundEffects().play(`combat_${sfx}`);
  }

  /**
   * Play a movement/world sound effect
   */
  public playMovement(
    sfx:
      | 'footstep_dirt'
      | 'footstep_stone'
      | 'footstep_sand'
      | 'footstep_wood'
      | 'door_open'
      | 'door_close'
      | 'chest_open'
      | 'item_pickup'
  ): void {
    if (!this.settings.enabled) return;
    getSoundEffects().play(sfx);
  }

  /**
   * Play an ambient one-shot
   */
  public playAmbient(sfx: 'wind_gust' | 'bird' | 'coyote' | 'crow' | 'thunder'): void {
    if (!this.settings.enabled) return;
    getSoundEffects().play(`ambient_${sfx}`);
  }

  /**
   * Play a shop sound effect
   */
  public playShop(sfx: 'buy' | 'sell' | 'browse' | 'error' | 'coins'): void {
    if (!this.settings.enabled) return;
    const id = sfx === 'coins' ? 'coins_jingle' : `shop_${sfx}`;
    getSoundEffects().play(id);
  }

  /**
   * Play a musical stinger
   */
  public playStinger(sfx: 'victory' | 'defeat' | 'quest_complete' | 'level_up' | 'discovery'): void {
    if (!this.settings.enabled) return;
    getSoundEffects().play(`stinger_${sfx}`);

    // Also trigger music manager stinger for victory/defeat
    if (sfx === 'victory' || sfx === 'defeat') {
      this.musicManager.playStinger(sfx);
    }
  }

  // =========================================================================
  // GAME EVENT INTEGRATION
  // =========================================================================

  /**
   * Handle combat start event
   */
  public onCombatStart(): void {
    this.setLocation('combat');
    this.playCombat('start');
  }

  /**
   * Handle combat end event
   */
  public onCombatEnd(result: 'victory' | 'defeat' | 'fled'): void {
    if (result === 'victory') {
      this.playStinger('victory');
    } else if (result === 'defeat') {
      this.playStinger('defeat');
    }
    // Location will be restored by game state change
  }

  /**
   * Handle shop open event
   */
  public onShopOpen(): void {
    this.setLocation('shop');
    this.playUI('open');
  }

  /**
   * Handle shop close event
   */
  public onShopClose(): void {
    this.playUI('close');
    // Location will be restored by game state change
  }

  /**
   * Handle quest completion event
   */
  public onQuestComplete(): void {
    this.playStinger('quest_complete');
  }

  /**
   * Handle level up event
   */
  public onLevelUp(): void {
    this.playStinger('level_up');
  }

  /**
   * Handle item pickup event
   */
  public onItemPickup(): void {
    this.playMovement('item_pickup');
  }

  /**
   * Handle dialogue start event
   */
  public onDialogueStart(): void {
    this.playUI('open');
  }

  /**
   * Handle dialogue end event
   */
  public onDialogueEnd(): void {
    this.playUI('close');
  }

  // =========================================================================
  // SETTINGS
  // =========================================================================

  /**
   * Get current audio settings
   */
  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Update audio settings
   */
  public setSettings(settings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.applySettings();
  }

  /**
   * Apply current settings to audio systems
   */
  private applySettings(): void {
    // Convert 0-100 to dB (-60 to 0)
    const volumeToDb = (vol: number) => {
      if (vol === 0) return -60;
      return (vol / 100) * 60 - 60; // 0 -> -60dB, 100 -> 0dB
    };

    // Master affects Tone.js destination
    Tone.Destination.volume.value = volumeToDb(this.settings.masterVolume);

    // Music volume
    this.musicManager.setVolume(volumeToDb(this.settings.musicVolume));

    // SFX volumes
    const sfx = getSoundEffects();
    sfx.setMasterVolume(volumeToDb(this.settings.sfxVolume));
    sfx.setCategoryVolume('ambient', volumeToDb(this.settings.ambientVolume));
    sfx.setEnabled(this.settings.enabled);
  }

  /**
   * Toggle audio on/off
   */
  public toggle(): void {
    this.settings.enabled = !this.settings.enabled;
    this.applySettings();

    if (this.settings.enabled) {
      this.musicManager.start();
    } else {
      this.musicManager.stop();
    }
  }

  /**
   * Check if audio is enabled
   */
  public isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Check if audio is initialized
   */
  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  /**
   * Dispose all audio resources
   */
  public dispose(): void {
    this.stop();
    this.musicManager.dispose();
    getSoundEffects().dispose();
    console.log('[AudioManager] Disposed');
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

/**
 * Reset singleton (for testing)
 */
export function resetAudioManager(): void {
  if (audioManagerInstance) {
    audioManagerInstance.dispose();
    audioManagerInstance = null;
  }
}
