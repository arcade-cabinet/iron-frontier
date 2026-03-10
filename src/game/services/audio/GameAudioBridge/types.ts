/**
 * Types for the GameAudioBridge module.
 *
 * @module services/audio/GameAudioBridge/types
 */

import type { StoreApi } from 'zustand';
import type { MusicManager } from '../MusicManager';

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
