/**
 * GameAudioBridge.ts - Connects game events to audio playback
 *
 * Central wiring layer that subscribes to the game's various event sources
 * (QuestEvents, Zustand store changes, ZoneSystem callbacks) and triggers
 * the appropriate audio through the existing AudioService infrastructure
 * (SoundManager, MusicManager) and the new SFX catalog / AmbientManager.
 *
 * All subscriptions are collected into a single teardown function for
 * clean unmounting.
 *
 * @module services/audio/GameAudioBridge
 */

import * as Tone from 'tone';
import type { StoreApi } from 'zustand';
import { questEvents } from '../../systems/QuestEvents';
import { getZoneSystem, type Zone } from '../../systems/ZoneSystem';
import type { TimeOfDay } from '../../ddl/types';
import { SFX_CATALOG, getWeaponSounds, randomDetune, type SFXEntry } from './SFXCatalog';
import { AmbientManager, type AmbientZone } from './AmbientManager';
import type { MusicManager } from './MusicManager';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Minimal shape of the Zustand game store that the bridge reads from.
 * Avoids importing the full GameState to keep coupling loose.
 */
export interface AudioBridgeStoreShape {
  // Settings
  settings: {
    sfxVolume: number;
    musicVolume: number;
  };

  // UI
  activePanel: string | null;
  dialogueState: { currentNodeId: string } | null;

  // Shop
  shopState: { shopId: string } | null;

  // Combat (turn-based)
  combatState: {
    phase: string;
    log: Array<{
      success: boolean;
      damage?: number;
      isCritical: boolean;
      message: string;
    }>;
  } | null;

  // Time
  time: { hour: number };

  // Player
  playerStats: { level: number; health: number };
  inventory: Array<{ id: string; itemId: string; quantity: number }>;
}

export interface GameAudioBridgeOptions {
  /** The Zustand store to subscribe to. */
  store: StoreApi<AudioBridgeStoreShape>;
  /** Optional existing MusicManager to drive state changes. */
  musicManager?: MusicManager;
}

// ============================================================================
// SFX NODE CACHE
// ============================================================================

/**
 * Lazily creates and caches Tone.js synth nodes so we do not re-allocate
 * on every trigger. Nodes are disposed during teardown.
 */
class SFXNodeCache {
  private cache = new Map<string, Tone.ToneAudioNode>();
  private volumeNode: Tone.Volume;

  constructor(initialVolume: number) {
    this.volumeNode = new Tone.Volume(Tone.gainToDb(initialVolume)).toDestination();
  }

  /** Get or create the synth node for a given SFX id. */
  get(sfxId: string): { node: Tone.ToneAudioNode; entry: SFXEntry } | null {
    const entry = SFX_CATALOG[sfxId];
    if (!entry) return null;

    let node = this.cache.get(sfxId);
    if (!node) {
      node = entry.create();
      node.connect(this.volumeNode);
      this.cache.set(sfxId, node);
    }

    return { node, entry };
  }

  /** Play a sound effect by catalog ID. */
  play(sfxId: string, time?: number): void {
    const result = this.get(sfxId);
    if (!result) return;
    result.entry.trigger(result.node, time);
  }

  /** Update the master SFX volume (0-1 gain). */
  setVolume(gain: number): void {
    this.volumeNode.volume.rampTo(Tone.gainToDb(gain), 0.1);
  }

  /** Dispose all cached nodes. */
  dispose(): void {
    for (const node of this.cache.values()) {
      node.dispose();
    }
    this.cache.clear();
    this.volumeNode.dispose();
  }
}

// ============================================================================
// GAME AUDIO BRIDGE
// ============================================================================

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

    this.wireQuestEvents();
    this.wireStoreEvents();
    this.wireZoneEvents();

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

  /**
   * Play an enemy hit sound.
   */
  public playEnemyHit(): void {
    this.sfxCache?.play('enemy_hit');
  }

  /**
   * Play an enemy death sound.
   */
  public playEnemyDeath(): void {
    this.sfxCache?.play('enemy_death');
  }

  /**
   * Play a player hurt sound.
   */
  public playPlayerHurt(): void {
    this.sfxCache?.play('player_hurt');
  }

  /**
   * Play a bullet impact (environment hit).
   */
  public playBulletImpact(): void {
    this.sfxCache?.play('bullet_impact');
  }

  /**
   * Play a bullet whiz-by sound.
   */
  public playBulletWhiz(): void {
    this.sfxCache?.play('bullet_whiz');
  }

  // -----------------------------------------------------------------------
  // PUBLIC - AMBIENT
  // -----------------------------------------------------------------------

  /** Get the ambient manager for direct control (e.g. from weather system). */
  public getAmbientManager(): AmbientManager | null {
    return this.ambientManager;
  }

  // -----------------------------------------------------------------------
  // PRIVATE - QUEST EVENT WIRING
  // -----------------------------------------------------------------------

  private wireQuestEvents(): void {
    const onQuestStarted = () => {
      this.sfxCache?.play('quest_start');
    };

    const onStageAdvanced = () => {
      this.sfxCache?.play('stage_advance');
    };

    const onQuestCompleted = () => {
      this.sfxCache?.play('quest_complete');
    };

    const onEnemyKilled = () => {
      this.sfxCache?.play('enemy_death');
    };

    const onItemPickedUp = () => {
      this.sfxCache?.play('item_pickup');
    };

    questEvents.on('questStarted', onQuestStarted);
    questEvents.on('stageAdvanced', onStageAdvanced);
    questEvents.on('questCompleted', onQuestCompleted);
    questEvents.on('enemyKilled', onEnemyKilled);
    questEvents.on('itemPickedUp', onItemPickedUp);

    this.cleanups.push(() => {
      questEvents.off('questStarted', onQuestStarted);
      questEvents.off('stageAdvanced', onStageAdvanced);
      questEvents.off('questCompleted', onQuestCompleted);
      questEvents.off('enemyKilled', onEnemyKilled);
      questEvents.off('itemPickedUp', onItemPickedUp);
    });
  }

  // -----------------------------------------------------------------------
  // PRIVATE - ZUSTAND STORE WIRING
  // -----------------------------------------------------------------------

  private wireStoreEvents(): void {
    if (!this.store) return;

    const unsubscribe = this.store.subscribe((state, prevState) => {
      // -- SFX Volume change --
      if (state.settings.sfxVolume !== prevState.settings.sfxVolume) {
        this.sfxCache?.setVolume(state.settings.sfxVolume);
      }

      // -- Music Volume change --
      if (state.settings.musicVolume !== prevState.settings.musicVolume) {
        Tone.Destination.volume.rampTo(
          Tone.gainToDb(state.settings.musicVolume),
          0.1,
        );
      }

      // -- Panel open/close (UI sounds) --
      if (state.activePanel !== prevState.activePanel) {
        if (state.activePanel && !prevState.activePanel) {
          this.sfxCache?.play('menu_open');
        } else if (!state.activePanel && prevState.activePanel) {
          this.sfxCache?.play('menu_close');
        }
      }

      // -- Dialogue advance --
      if (
        state.dialogueState &&
        prevState.dialogueState &&
        state.dialogueState.currentNodeId !== prevState.dialogueState.currentNodeId
      ) {
        this.sfxCache?.play('dialogue_advance');
      }

      // -- Dialogue start / end --
      if (state.dialogueState && !prevState.dialogueState) {
        this.sfxCache?.play('dialogue_advance');
      }

      // -- Shop open / close --
      if (state.shopState && !prevState.shopState) {
        this.sfxCache?.play('door_open');
      } else if (!state.shopState && prevState.shopState) {
        this.sfxCache?.play('door_close');
      }

      // -- Inventory changes (item pickup detection) --
      if (state.inventory.length > prevState.inventory.length) {
        this.sfxCache?.play('item_pickup');
      }

      // -- Gold changes (purchase / sale detection) --
      if (state.playerStats.level > prevState.playerStats.level) {
        this.sfxCache?.play('level_up');
      }

      // -- Turn-based combat log (new entries = combat sounds) --
      if (
        state.combatState &&
        prevState.combatState &&
        state.combatState.log.length > prevState.combatState.log.length
      ) {
        const newEntries = state.combatState.log.slice(prevState.combatState.log.length);
        for (const entry of newEntries) {
          if (entry.success && entry.damage) {
            this.sfxCache?.play('enemy_hit');
            if (entry.isCritical) {
              // Extra impact for critical
              setTimeout(() => this.sfxCache?.play('bullet_impact'), 60);
            }
          } else if (!entry.success) {
            this.sfxCache?.play('bullet_whiz');
          }
        }
      }

      // -- Combat phase transitions --
      if (state.combatState?.phase !== prevState.combatState?.phase) {
        if (state.combatState?.phase === 'victory') {
          this.sfxCache?.play('quest_complete');
          this.musicManager?.setState('exploration_day');
        } else if (state.combatState?.phase === 'defeat') {
          this.sfxCache?.play('player_death');
        } else if (
          state.combatState?.phase === 'player_turn' &&
          !prevState.combatState
        ) {
          // Combat just started
          this.musicManager?.setState('combat');
        }
      }

      // -- Time of day changes --
      if (state.time.hour !== prevState.time.hour) {
        const tod = this.hourToTimeOfDay(state.time.hour);
        const prevTod = this.hourToTimeOfDay(prevState.time.hour);
        if (tod !== prevTod) {
          this.ambientManager?.setTimeOfDay(tod);
          // Drive music state from time of day
          if (tod === 'night' || tod === 'dusk') {
            this.musicManager?.setState('exploration_night');
          } else if (!state.combatState) {
            this.musicManager?.setState('exploration_day');
          }
        }
      }

      // -- Player death --
      if (
        state.playerStats.health <= 0 &&
        prevState.playerStats.health > 0
      ) {
        this.sfxCache?.play('player_death');
      }
    });

    this.cleanups.push(unsubscribe);
  }

  // -----------------------------------------------------------------------
  // PRIVATE - ZONE SYSTEM WIRING
  // -----------------------------------------------------------------------

  private wireZoneEvents(): void {
    const zoneSystem = getZoneSystem();

    const unsubZoneChange = zoneSystem.onZoneChange(
      (newZone: Zone | null, _previousZone: Zone | null) => {
        if (!newZone) {
          this.ambientManager?.setZone('wilderness');
          this.musicManager?.setState('exploration_day');
          return;
        }

        let ambientZone: AmbientZone = 'wilderness';
        if (newZone.type === 'town') {
          ambientZone = 'town';
          this.musicManager?.setState('town');
        } else if (newZone.type === 'building') {
          ambientZone = 'interior';
          this.sfxCache?.play('door_open');
        } else if (newZone.type === 'route') {
          ambientZone = 'wilderness';
        }

        this.ambientManager?.setZone(ambientZone);
      },
    );

    this.cleanups.push(unsubZoneChange);
  }

  // -----------------------------------------------------------------------
  // HELPERS
  // -----------------------------------------------------------------------

  /**
   * Map game hour (0-23) to TimeOfDay enum.
   */
  private hourToTimeOfDay(hour: number): TimeOfDay {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 14) return 'noon';
    if (hour >= 14 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

/** Singleton instance for app-wide access. */
export const gameAudioBridge = new GameAudioBridge();
