/**
 * Game Store Factory - Composes all slices into a unified store
 *
 * This module creates the game store by composing modular slices
 * from the slices/ directory. Each slice owns its domain state
 * and actions. The factory wires them together with shared
 * dependencies and persistence.
 *
 * @module game/store/createGameStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSurvivalSlice } from '../systems/survivalStore';
import type { DataAccess, CreateGameStoreOptions } from './dataAccess';
import { persistStorage } from './persistStorage';
import {
  createAudioSlice,
  createCombatSlice,
  createCoreSlice,
  createDialogueSlice,
  createGameFlowSlice,
  createInventorySlice,
  createPlayerSlice,
  createPuzzleSlice,
  createQuestSlice,
  createSaveSlice,
  createSettingsSlice,
  createShopSlice,
  createTravelSlice,
  createUISlice,
} from './slices';
import type { GameState } from './types';

// Re-export for backwards compatibility
export type { GameState };
export type { DataAccess, CreateGameStoreOptions };

/**
 * Create a game store instance by composing all slices.
 *
 * Each slice manages its own domain state and actions.
 * The persist middleware handles selective state serialization.
 *
 * Note: Slice factories are cast to `any` at the composition boundary.
 * This is the standard Zustand pattern for multi-slice stores where
 * each slice is typed against its narrow interface but composed into
 * a wider store type. Runtime behavior is correct; the narrowing is
 * purely a TypeScript limitation with `StateCreator` generics.
 */
export function createGameStore({
  storageAdapter,
  storageKey,
  databaseManager,
  dataAccess,
}: CreateGameStoreOptions) {
  // Initialize encounter template data
  dataAccess.initEncounterTemplates();

  // Create slice factories that need dependency injection
  const combatSlice = createCombatSlice(dataAccess) as any;
  const dialogueSlice = createDialogueSlice(dataAccess) as any;
  const gameFlowSlice = createGameFlowSlice(dataAccess) as any;
  const inventorySlice = createInventorySlice(dataAccess) as any;
  const questSlice = createQuestSlice(dataAccess) as any;
  const saveSlice = createSaveSlice(storageAdapter, databaseManager) as any;
  const shopSlice = createShopSlice(dataAccess) as any;
  const travelSlice = createTravelSlice(dataAccess) as any;

  return create<GameState>()(
    persist(
      (set, get, api) => ({
        // Compose all slices into a single state object.
        // Slice order matters: later slices can override earlier ones.
        // Core state slices
        ...(createCoreSlice as any)(set, get, api),
        ...(createPlayerSlice as any)(set, get, api),
        ...inventorySlice(set, get, api),
        ...questSlice(set, get, api),

        // Interaction slices
        ...dialogueSlice(set, get, api),
        ...combatSlice(set, get, api),
        ...travelSlice(set, get, api),
        ...shopSlice(set, get, api),

        // Activity slices
        ...(createPuzzleSlice as any)(set, get, api),
        ...(createUISlice as any)(set, get, api),
        ...(createSettingsSlice as any)(set, get, api),
        ...(createAudioSlice as any)(set, get, api),

        // Persistence and lifecycle
        ...saveSlice(set, get, api),
        ...gameFlowSlice(set, get, api),

        // Survival system (time, fatigue, provisions, camping)
        ...createSurvivalSlice(set, get, api),
      }),
      {
        name: storageKey,
        storage: persistStorage(storageAdapter) as any,
        partialize: (state: GameState) =>
          ({
            initialized: state.initialized,
            worldSeed: state.worldSeed,
            playerName: state.playerName,
            playerStats: state.playerStats,
            inventory: state.inventory,
            equipment: state.equipment,
            activeQuests: state.activeQuests,
            completedQuests: state.completedQuests,
            collectedItemIds: state.collectedItemIds,
            settings: state.settings,
            saveVersion: state.saveVersion,
            lastSaved: state.lastSaved,
            playTime: state.playTime,
            clockState: state.clockState,
            isClockRunning: state.isClockRunning,
            fatigueState: state.fatigueState,
            provisionsState: state.provisionsState,
            campingState: state.campingState,
            currentTerrain: state.currentTerrain,
          }) as any,
      }
    )
  );
}
