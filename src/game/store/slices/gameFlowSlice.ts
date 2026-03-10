/**
 * Game Flow Slice - Cross-cutting game lifecycle actions
 *
 * Manages game initialization, reset, time updates, and cleanup.
 * These actions coordinate across multiple slices and cannot
 * be assigned to a single domain slice.
 *
 * @module game/store/slices/gameFlowSlice
 */

import type { StateCreator } from 'zustand';
import { questEvents } from '../../systems/QuestEvents';
import type { DataAccess } from '../dataAccess';
import {
  DEFAULT_AUDIO_STATE,
  DEFAULT_CAMERA_STATE,
  DEFAULT_EQUIPMENT,
  DEFAULT_PLAYER_STATS,
  DEFAULT_SETTINGS,
  DEFAULT_TIME,
  DEFAULT_WEATHER,
  DEFAULT_WORLD_POSITION,
  SAVE_VERSION,
} from '../defaults';
import type {
  AudioState,
  CameraState,
  EquipmentState,
  GamePhase,
  GameSettings,
  InventoryItem,
  Notification,
  PlayerStats,
  TimeState,
  WeatherState,
  WorldPosition,
} from '../types';
import { scopedRNG, rngTick } from '../../lib/prng';

// ============================================================================
// TYPES
// ============================================================================

/**
 * World-level state managed by the game flow slice.
 */
export interface GameFlowState {
  /** World generation seed */
  worldSeed: number;
  /** In-game time */
  time: TimeState;
  /** Weather state */
  weather: WeatherState;
  /** Loaded chunk data */
  loadedChunks: Record<string, any>;
}

/**
 * Game flow actions.
 */
export interface GameFlowActions {
  /** Initialize a new game */
  initGame: (playerName: string, seed?: number) => void;
  /** Reset to title screen */
  resetGame: () => void;
  /** Update in-game time */
  updateTime: (hours: number) => void;
  /** Clean up timers and resources */
  destroyStore: () => void;
}

/**
 * Dependencies from other slices needed by game flow.
 */
export interface GameFlowSliceDeps {
  // State
  phase: GamePhase;
  clockState: any;

  // Actions from other slices
  setPhase: (phase: GamePhase) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  initWorld: (worldId: string) => void;
  resetSurvival: () => void;
  startClock: () => void;
  advanceTime: (hours: number) => void;
  saveGame: () => void;
  saveToSlot: (slotId: string) => Promise<void>;
}

/**
 * Complete game flow slice type.
 */
export type GameFlowSlice = GameFlowState & GameFlowActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default game flow state.
 */
export const DEFAULT_GAME_FLOW_STATE: GameFlowState = {
  worldSeed: Date.now(),
  time: DEFAULT_TIME,
  weather: DEFAULT_WEATHER,
  loadedChunks: {},
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the game flow Zustand slice.
 *
 * @param dataAccess - Data access interface for initialization
 */
export const createGameFlowSlice = (
  dataAccess: DataAccess
): StateCreator<GameFlowSlice & GameFlowSliceDeps, [], [], GameFlowSlice> => {
  return (set, get) => ({
    // State
    ...DEFAULT_GAME_FLOW_STATE,

    // Actions
    initGame: async (playerName: string, seed?: number) => {
      const worldSeed = seed ?? Date.now();

      // Initialize procedural generation
      await dataAccess.ProceduralLocationManager.initialize(worldSeed);

      // Get starting items
      const starterItems = dataAccess.getStarterInventory().map((def) => ({
        id: `starter_${def.id}_${Date.now()}_${scopedRNG('store', 42, rngTick())}`,
        itemId: def.id,
        name: def.name,
        rarity: def.rarity,
        quantity: 1,
        description: def.description,
        usable: def.usable,
        condition: 100,
        weight: def.weight ?? 0.1,
        type: def.category,
        droppable: true,
      }));

      set({
        phase: 'playing' as GamePhase,
        initialized: true,
        playerName,
        worldSeed,
        playerStats: {
          ...DEFAULT_PLAYER_STATS,
          level: 1,
          xp: 0,
          health: 100,
        },
        inventory: starterItems,
        // Reset world state
        currentWorldId: 'frontier_territory',
        currentLocationId: 'dusty_springs',
        discoveredLocationIds: ['dusty_springs'],
        time: DEFAULT_TIME,
        // Reset quest state
        activeQuests: [],
        completedQuests: [],
        // Reset notifications
        notifications: [],
      } as any);

      get().initWorld('frontier_territory');
      get().resetSurvival();
      get().startClock();
    },

    resetGame: () => {
      set({
        phase: 'title' as GamePhase,
        initialized: false,
        activeQuests: [],
        inventory: [],
        notifications: [],
      } as any);
      get().resetSurvival();
    },

    updateTime: (hours: number) => {
      get().advanceTime(hours);
      const { clockState } = get();
      set((s) => ({
        time: {
          ...s.time,
          hour: clockState.hour,
          dayOfYear: clockState.day,
        },
      }));
    },

    destroyStore: () => {
      // Cleanup is handled by travel slice timer cleanup
      // This is a noop now that travel timer is managed by travelSlice
    },
  });
};
