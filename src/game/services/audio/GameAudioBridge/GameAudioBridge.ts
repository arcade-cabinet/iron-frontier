/**
 * GameAudioBridge - Connects game events to audio playback.
 *
 * Central wiring layer that subscribes to the game's various event sources
 * (QuestEvents, Zustand store changes, ZoneSystem callbacks) and triggers
 * the appropriate audio through the existing AudioService infrastructure
 * (SoundManager, MusicManager) and the new SFX catalog / AmbientManager.
 *
 * @module services/audio/GameAudioBridge/GameAudioBridge
 */

import { AmbientManager } from '../AmbientManager';
import { getWeaponSounds } from '../SFXCatalog';
import type { MusicManager } from '../MusicManager';
import type { StoreApi } from 'zustand';
import type { AudioBridgeStoreShape, GameAudioBridgeOptions } from './types';
import { SFXNodeCache } from './SFXNodeCache';
import { wireQuestEvents } from './wireQuestEvents';
import { wireStoreEvents } from './wireStoreEvents';
import { wireZoneEvents } from './wireZoneEvents';

export class GameAudioBridge {
  private sfxCache: SFXNodeCache | null = null;
  private ambientManager: AmbientManager | null = null;
  private musicManager: MusicManager | null = null;
  private store: StoreApi<AudioBridgeStoreShape> | null = null;

  /** Collected unsubscribe / cleanup functions. */
  private cleanups: Array<() => void> = [];
  private initialized = false;

  // -----------------------------------------------------------------------
  // INIT / TEARDOWN
  // -----------------------------------------------------------------------

  /**
   * Initialize the bridge: subscribe to all event sources.
   * Must be called after Tone.start() (i.e. after user interaction).
   */
  public init(options: GameAudioBridgeOptions): void {
    if (this.initialized) return;
    this.initialized = true;

    this.store = options.store;
    this.musicManager = options.musicManager ?? null;

    const sfxVolume = options.store.getState().settings.sfxVolume;
    this.sfxCache = new SFXNodeCache(sfxVolume);
    this.ambientManager = new AmbientManager();
    this.ambientManager.start();

    this.cleanups.push(wireQuestEvents(this.sfxCache));
    this.cleanups.push(wireStoreEvents(
      this.store,
      this.sfxCache,
      this.ambientManager,
      this.musicManager,
    ));
    this.cleanups.push(wireZoneEvents(
      this.sfxCache,
      this.ambientManager,
      this.musicManager,
    ));

    console.log('[GameAudioBridge] Initialized - all event subscriptions active');
  }

  /**
   * Tear down all subscriptions and dispose audio nodes.
   */
  public teardown(): void {
    for (const cleanup of this.cleanups) {
      try {
        cleanup();
      } catch {
        // Ignore errors during teardown
      }
    }
    this.cleanups = [];

    this.sfxCache?.dispose();
    this.sfxCache = null;

    this.ambientManager?.dispose();
    this.ambientManager = null;

    this.store = null;
    this.musicManager = null;
    this.initialized = false;

    console.log('[GameAudioBridge] Torn down');
  }

  // -----------------------------------------------------------------------
  // PUBLIC - DIRECT COMBAT AUDIO (called from FPS combat tick)
  // -----------------------------------------------------------------------

  /**
   * Play the appropriate weapon fire sound for a given weapon ID.
   * Called by the combat rendering loop when `CombatTickResult.playerFired`.
   */
  public playWeaponFire(weaponId: string): void {
    const sounds = getWeaponSounds(weaponId);
    this.sfxCache?.play(sounds.fire);
  }

  /**
   * Play a reload sound for a given weapon ID.
   */
  public playWeaponReload(weaponId: string): void {
    const sounds = getWeaponSounds(weaponId);
    this.sfxCache?.play(sounds.reload);
  }

  /** Play an enemy hit sound. */
  public playEnemyHit(): void {
    this.sfxCache?.play('enemy_hit');
  }

  /** Play an enemy death sound. */
  public playEnemyDeath(): void {
    this.sfxCache?.play('enemy_death');
  }

  /** Play a player hurt sound. */
  public playPlayerHurt(): void {
    this.sfxCache?.play('player_hurt');
  }

  /** Play a bullet impact (environment hit). */
  public playBulletImpact(): void {
    this.sfxCache?.play('bullet_impact');
  }

  /** Play a bullet whiz-by sound. */
  public playBulletWhiz(): void {
    this.sfxCache?.play('bullet_whiz');
  }

  /**
   * Play any SFX by catalog ID. Useful for UI components that need
   * direct access to a specific sound effect.
   */
  public playSFX(sfxId: string): void {
    this.sfxCache?.play(sfxId);
  }

  // -----------------------------------------------------------------------
  // PUBLIC - AMBIENT
  // -----------------------------------------------------------------------

  /** Get the ambient manager for direct control (e.g. from weather system). */
  public getAmbientManager(): AmbientManager | null {
    return this.ambientManager;
  }
}
