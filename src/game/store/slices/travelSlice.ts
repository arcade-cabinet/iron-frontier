/**
 * Travel Slice - Travel and world state
 *
 * Manages world navigation, location discovery, and travel mechanics.
 *
 * @module game/store/slices/travelSlice
 */

import type { StateCreator } from 'zustand';
import type { CombatEncounter } from '../../data/schemas/combat';
import type { DangerLevel, TravelMethod } from '../../data/schemas/world';
import { FrontierTerritory } from '../../data/worlds/frontier_territory';
import type {
  GamePhase,
  Notification,
  TravelState,
  WorldItem,
  WorldPosition,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Data access interface for travel operations.
 */
export interface TravelDataAccess {
  getWorldById: (worldId: string) => any;
  loadWorld: (world: any) => any;
  getConnectionsFrom: (world: any, locationId: string) => any[];
  getWorldItemsForLocation: (locationId: string) => any[];
  getEncounterById: (encounterId: string) => CombatEncounter | undefined;
  ProceduralLocationManager: {
    initialize: (seed: number) => Promise<any>;
    generateLocationContent: (location: any) => Promise<any>;
    hasGeneratedContent: (locationId: string) => boolean;
  };
}

/**
 * Travel-specific state.
 */
export interface TravelSliceState {
  /** Current world ID */
  currentWorldId: string | null;
  /** Current location ID within the world */
  currentLocationId: string | null;
  /** IDs of discovered locations */
  discoveredLocationIds: string[];
  /** Runtime-loaded world data (not persisted) */
  loadedWorld: any | null;
  /** Current travel state if traveling */
  travelState: TravelState | null;
  /** World items by ID */
  worldItems: Record<string, WorldItem>;
  /** IDs of collected world items */
  collectedItemIds: string[];
}

/**
 * Travel actions.
 */
export interface TravelActions {
  /** Initialize a world by ID */
  initWorld: (worldId: string) => void;
  /** Start traveling to a location */
  travelTo: (locationId: string) => void;
  /** Complete the current travel */
  completeTravel: () => void;
  /** Cancel the current travel */
  cancelTravel: () => void;
  /** Discover a new location */
  discoverLocation: (locationId: string) => void;
  /** Get connected location IDs from current position */
  getConnectedLocations: () => string[];
  /** Collect a world item */
  collectWorldItem: (itemId: string) => void;
  /** Add a world item */
  addWorldItem: (item: WorldItem) => void;
  /** Reset travel state */
  resetTravel: () => void;
}

/**
 * Dependencies from other slices.
 */
export interface TravelSliceDeps {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  addItemById: (itemId: string, quantity?: number) => void;
  advanceTime: (hours: number) => void;
  applyTravelFatigue: (hours: number) => void;
  consumeProvisions: (hours: number) => {
    foodConsumed: number;
    waterConsumed: number;
    ranOutOfFood: boolean;
    ranOutOfWater: boolean;
  };
  startCombat: (encounterId: string) => void;
  playerPosition: WorldPosition;
  // Quest updates
  activeQuests: any[];
  updateObjective: (questId: string, objectiveId: string, progress: number) => void;
}

/**
 * Complete travel slice type.
 */
export type TravelSlice = TravelSliceState & TravelActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default travel state.
 */
export const DEFAULT_TRAVEL_SLICE_STATE: TravelSliceState = {
  currentWorldId: null,
  currentLocationId: null,
  discoveredLocationIds: [],
  loadedWorld: null,
  travelState: null,
  worldItems: {},
  collectedItemIds: [],
};

// ============================================================================
// ENCOUNTER CONFIGURATION
// ============================================================================

const ENCOUNTER_POOLS: Record<DangerLevel, string[]> = {
  safe: [],
  low: ['wolf_pack'],
  moderate: ['roadside_bandits', 'wolf_pack'],
  high: ['copperhead_patrol', 'ivrc_checkpoint'],
  extreme: ['remnant_awakening'],
};

const ENCOUNTER_CHANCES: Record<DangerLevel, number> = {
  safe: 0,
  low: 0.15,
  moderate: 0.25,
  high: 0.4,
  extreme: 0.6,
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the travel Zustand slice.
 *
 * @param dataAccess - Data access interface for world data
 */
export const createTravelSlice = (
  dataAccess: TravelDataAccess
): StateCreator<TravelSlice & TravelSliceDeps, [], [], TravelSlice> => {
  let travelTimer: ReturnType<typeof setInterval> | null = null;

  const clearTravelTimer = () => {
    if (travelTimer) {
      clearInterval(travelTimer);
      travelTimer = null;
    }
  };

  return (set, get) => ({
    // State
    ...DEFAULT_TRAVEL_SLICE_STATE,

    // Actions
    initWorld: (worldId: string) => {
      const world = dataAccess.getWorldById(worldId);
      const loadedWorld = world ? dataAccess.loadWorld(world) : null;
      set({
        currentWorldId: worldId,
        loadedWorld,
      });
    },

    travelTo: (locationId: string) => {
      const state = get();
      const { currentLocationId, loadedWorld } = state;
      if (!currentLocationId || !loadedWorld) return;

      const worldRef = (loadedWorld as any).world ?? loadedWorld;
      const connection = dataAccess.getConnectionsFrom(worldRef, currentLocationId).find(
        (conn) => conn.to === locationId || (conn.bidirectional && conn.from === locationId)
      );

      const travelTime = connection?.travelTime ?? 8;
      const dangerLevel: DangerLevel = connection?.danger ?? 'moderate';
      const method: TravelMethod = connection?.method ?? 'trail';
      const startedAt = Date.now();

      clearTravelTimer();

      // Roll for encounter
      const pool = ENCOUNTER_POOLS[dangerLevel] ?? [];
      const encounterRoll = Math.random();
      const encounterId =
        pool.length > 0 && encounterRoll <= (ENCOUNTER_CHANCES[dangerLevel] ?? 0)
          ? pool[Math.floor(Math.random() * pool.length)]
          : null;
      const resolvedEncounterId =
        encounterId && dataAccess.getEncounterById(encounterId) ? encounterId : null;

      set({
        travelState: {
          fromLocationId: currentLocationId,
          toLocationId: locationId,
          method,
          travelTime,
          progress: 0,
          dangerLevel,
          startedAt,
          encounterId: resolvedEncounterId,
        },
      });
      state.setPhase('travel');

      // If encounter, don't start timer - combat will trigger
      if (resolvedEncounterId) {
        return;
      }

      // Start travel progress
      const totalMs = Math.max(2000, travelTime * 1000);
      travelTimer = setInterval(() => {
        const currentState = get();
        if (!currentState.travelState) {
          clearTravelTimer();
          return;
        }

        const elapsed = Date.now() - startedAt;
        const progress = Math.min(100, Math.round((elapsed / totalMs) * 100));

        set({
          travelState: {
            ...currentState.travelState,
            progress,
          },
        });

        if (progress >= 100) {
          clearTravelTimer();
          get().completeTravel();
        }
      }, 250);
    },

    completeTravel: () => {
      const state = get();
      const { travelState, activeQuests } = state;
      if (!travelState) return;
      clearTravelTimer();

      const destinationId = travelState.toLocationId;
      const travelHours = travelState.travelTime;

      set({
        currentLocationId: destinationId,
        travelState: null,
      });
      state.setPhase('playing');
      state.discoverLocation(destinationId);
      state.advanceTime(travelHours);
      state.applyTravelFatigue(travelHours);

      const consumption = state.consumeProvisions(travelHours);
      if (consumption.ranOutOfFood) {
        state.addNotification('warning', 'You ran out of food during the journey.');
      }
      if (consumption.ranOutOfWater) {
        state.addNotification('warning', 'You ran out of water during the journey.');
      }

      // Update quest objectives
      activeQuests.forEach((quest) => {
        // Note: Would need dataAccess for quest definitions
        // This is a simplified version
      });
    },

    cancelTravel: () => {
      clearTravelTimer();
      const state = get();
      set({ travelState: null });
      state.setPhase('playing');
    },

    discoverLocation: (locationId: string) => {
      const state = get();
      const { discoveredLocationIds } = state;
      if (!discoveredLocationIds.includes(locationId)) {
        // Look up location name for the notification
        const locRef = FrontierTerritory.locations.find((l) => l.id === locationId);
        const locationName = locRef?.name ?? locationId;

        set({
          discoveredLocationIds: [...discoveredLocationIds, locationId],
        });
        state.addNotification('info', `Discovered: ${locationName}`);
      }
    },

    getConnectedLocations: () => {
      const { loadedWorld, currentLocationId } = get();
      if (!loadedWorld || !currentLocationId) return [];
      const worldRef = (loadedWorld as any).world ?? loadedWorld;
      return dataAccess.getConnectionsFrom(worldRef, currentLocationId).map((c) => c.to);
    },

    collectWorldItem: (itemId: string) => {
      const state = get();
      const item = state.worldItems[itemId];
      if (!item) return;

      state.addItemById(item.itemId, item.quantity);

      const newItems = { ...state.worldItems };
      delete newItems[itemId];

      set({
        worldItems: newItems,
        collectedItemIds: [...state.collectedItemIds, itemId],
      });
    },

    addWorldItem: (item: WorldItem) => {
      set((s) => ({
        worldItems: { ...s.worldItems, [item.id]: item },
      }));
    },

    resetTravel: () => {
      clearTravelTimer();
      set({
        ...DEFAULT_TRAVEL_SLICE_STATE,
      });
    },
  });
};
