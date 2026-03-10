/**
 * Save Slice - Save/load state and actions
 *
 * Manages save game operations including slot-based saves,
 * binary exports, and state hydration.
 *
 * @module game/store/slices/saveSlice
 */

import type { StateCreator } from 'zustand';
import { getSaveSystem } from '../../systems/SaveSystem';
import type { SaveSlotMeta } from '../../systems/SaveSystem';
import type { StorageAdapter } from '../StorageAdapter';
import type {
  GamePhase,
  GameSettings,
  Notification,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Save state data.
 */
export interface SaveState {
  /** Save file version */
  saveVersion: number;
  /** Timestamp of last save */
  lastSaved: number;
  /** Total play time in seconds */
  playTime: number;
}

/**
 * Save actions.
 */
export interface SaveActions {
  /** Quick save (persist middleware) */
  saveGame: () => void;
  /** Save binary database export */
  saveGameBinary: (saveId: string) => Promise<void>;
  /** Save to a named slot */
  saveToSlot: (slotId: string) => Promise<void>;
  /** Load from a named slot */
  loadFromSlot: (slotId: string) => Promise<boolean>;
  /** List available save slots */
  getSaveSlots: () => Promise<SaveSlotMeta[]>;
  /** Hydrate store from loaded save data */
  hydrateFromSave: (data: Record<string, unknown>) => void;
}

/**
 * Dependencies from other slices.
 */
export interface SaveSliceDeps {
  // Read-only state needed for serialization
  playerName: string;
  playerStats: any;
  clockState: any;
  currentLocationId: string | null;
  initialized: boolean;
  worldSeed: number;
  inventory: any[];
  equipment: any;
  activeQuests: any[];
  completedQuests: any[];
  completedQuestIds: string[];
  collectedItemIds: string[];
  settings: GameSettings;
  fatigueState: any;
  provisionsState: any;
  campingState: any;
  currentTerrain: any;
  isClockRunning: boolean;
  currentWorldId: string | null;
  discoveredLocationIds: string[];
  talkedNPCIds: string[];
  loadedWorld: any;

  // Actions from other slices
  setPhase: (phase: GamePhase) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  initWorld: (worldId: string) => void;
}

/**
 * Complete save slice type.
 */
export type SaveSlice = SaveState & SaveActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default save state.
 */
export const DEFAULT_SAVE_STATE: SaveState = {
  saveVersion: 1,
  lastSaved: 0,
  playTime: 0,
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the save Zustand slice.
 *
 * @param storageAdapter - Platform storage adapter for binary saves
 * @param databaseManager - Optional database manager for binary exports
 */
export const createSaveSlice = (
  storageAdapter: StorageAdapter,
  databaseManager?: any
): StateCreator<SaveSlice & SaveSliceDeps, [], [], SaveSlice> => {
  return (set, get) => ({
    // State
    ...DEFAULT_SAVE_STATE,

    // Actions
    saveGame: () => {
      set({ lastSaved: Date.now() });
    },

    saveGameBinary: async (saveId: string) => {
      if (databaseManager) {
        const binary = databaseManager.export();
        await storageAdapter.setItem(`save_${saveId}_bin`, binary);
      }
    },

    saveToSlot: async (slotId: string) => {
      const state = get();
      const saveSystem = getSaveSystem();

      // Derive location name from current location
      const currentLocation = state.currentLocationId
        ? (state.loadedWorld as any)?.locations?.get?.(state.currentLocationId)
        : null;
      const locationName =
        currentLocation?.ref?.name ?? state.currentLocationId ?? 'Unknown';

      const saveData = {
        playerName: state.playerName,
        playTime: state.playTime,
        playerStats: state.playerStats,
        clockState: state.clockState,
        currentLocationId: state.currentLocationId,
        initialized: state.initialized,
        worldSeed: state.worldSeed,
        inventory: state.inventory,
        equipment: state.equipment,
        activeQuests: state.activeQuests,
        completedQuests: state.completedQuests,
        completedQuestIds: state.completedQuestIds,
        collectedItemIds: state.collectedItemIds,
        settings: state.settings,
        saveVersion: state.saveVersion,
        lastSaved: Date.now(),
        fatigueState: state.fatigueState,
        provisionsState: state.provisionsState,
        campingState: state.campingState,
        currentTerrain: state.currentTerrain,
        isClockRunning: state.isClockRunning,
        currentWorldId: state.currentWorldId,
        discoveredLocationIds: state.discoveredLocationIds,
        talkedNPCIds: state.talkedNPCIds,
      };

      await saveSystem.save(slotId, saveData, locationName);
      set({ lastSaved: Date.now() });
      state.addNotification('info', 'Game saved.');
    },

    loadFromSlot: async (slotId: string) => {
      const saveSystem = getSaveSystem();
      const data = await saveSystem.load(slotId);
      if (!data) return false;
      get().hydrateFromSave(data);
      return true;
    },

    getSaveSlots: async () => {
      const saveSystem = getSaveSystem();
      return saveSystem.getAllSlots();
    },

    hydrateFromSave: (data: Record<string, unknown>) => {
      const safe = (key: string) =>
        data[key] !== undefined ? data[key] : undefined;

      const patch: Record<string, unknown> = {};
      const keys = [
        'playerName', 'playTime', 'playerStats', 'clockState',
        'currentLocationId', 'initialized', 'worldSeed', 'inventory',
        'equipment', 'activeQuests', 'completedQuests', 'completedQuestIds',
        'collectedItemIds', 'settings', 'saveVersion', 'lastSaved',
        'fatigueState', 'provisionsState', 'campingState', 'currentTerrain',
        'isClockRunning', 'currentWorldId', 'discoveredLocationIds',
        'talkedNPCIds',
      ];

      for (const key of keys) {
        const val = safe(key);
        if (val !== undefined) {
          patch[key] = val;
        }
      }

      patch.phase = 'playing';
      set(patch as any);

      // Reinitialize world
      const worldId = (data.currentWorldId as string) ?? 'frontier_territory';
      get().initWorld(worldId);
      get().addNotification('info', 'Game loaded.');
    },
  });
};
