/**
 * Zustand store event wiring for the GameAudioBridge.
 *
 * @module services/audio/GameAudioBridge/wireStoreEvents
 */

import * as Tone from 'tone';
import type { StoreApi } from 'zustand';
import type { MusicManager } from '../MusicManager';
import type { AmbientManager } from '../AmbientManager';
import type { AudioBridgeStoreShape } from './types';
import type { SFXNodeCache } from './SFXNodeCache';
import { hourToTimeOfDay } from './helpers';

/**
 * Subscribe to Zustand store changes and trigger audio accordingly.
 * Returns an unsubscribe function.
 */
export function wireStoreEvents(
  store: StoreApi<AudioBridgeStoreShape>,
  sfxCache: SFXNodeCache,
  ambientManager: AmbientManager | null,
  musicManager: MusicManager | null,
): () => void {
  const unsubscribe = store.subscribe((state, prevState) => {
    // -- SFX Volume change --
    if (state.settings.sfxVolume !== prevState.settings.sfxVolume) {
      sfxCache.setVolume(state.settings.sfxVolume);
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
        sfxCache.play('menu_open');
      } else if (!state.activePanel && prevState.activePanel) {
        sfxCache.play('menu_close');
      }
    }

    // -- Dialogue advance --
    if (
      state.dialogueState &&
      prevState.dialogueState &&
      state.dialogueState.currentNodeId !== prevState.dialogueState.currentNodeId
    ) {
      sfxCache.play('dialogue_advance');
    }

    // -- Dialogue start / end --
    if (state.dialogueState && !prevState.dialogueState) {
      sfxCache.play('dialogue_advance');
    }

    // -- Shop open / close --
    if (state.shopState && !prevState.shopState) {
      sfxCache.play('door_open');
    } else if (!state.shopState && prevState.shopState) {
      sfxCache.play('door_close');
    }

    // -- Inventory changes (item pickup detection) --
    if (state.inventory.length > prevState.inventory.length) {
      sfxCache.play('item_pickup');
    }

    // -- Level up --
    if (state.playerStats.level > prevState.playerStats.level) {
      sfxCache.play('level_up');
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
          sfxCache.play('enemy_hit');
          if (entry.isCritical) {
            // Extra impact for critical
            setTimeout(() => sfxCache.play('bullet_impact'), 60);
          }
        } else if (!entry.success) {
          sfxCache.play('bullet_whiz');
        }
      }
    }

    // -- Combat phase transitions --
    if (state.combatState?.phase !== prevState.combatState?.phase) {
      if (state.combatState?.phase === 'victory') {
        sfxCache.play('quest_complete');
        musicManager?.setState('exploration_day');
      } else if (state.combatState?.phase === 'defeat') {
        sfxCache.play('player_death');
      } else if (
        state.combatState?.phase === 'player_turn' &&
        !prevState.combatState
      ) {
        // Combat just started
        musicManager?.setState('combat');
      }
    }

    // -- Time of day changes --
    if (state.time.hour !== prevState.time.hour) {
      const tod = hourToTimeOfDay(state.time.hour);
      const prevTod = hourToTimeOfDay(prevState.time.hour);
      if (tod !== prevTod) {
        ambientManager?.setTimeOfDay(tod);
        // Drive music state from time of day
        if (tod === 'night' || tod === 'dusk') {
          musicManager?.setState('exploration_night');
        } else if (!state.combatState) {
          musicManager?.setState('exploration_day');
        }
      }
    }

    // -- Player death --
    if (
      state.playerStats.health <= 0 &&
      prevState.playerStats.health > 0
    ) {
      sfxCache.play('player_death');
    }
  });

  return unsubscribe;
}
