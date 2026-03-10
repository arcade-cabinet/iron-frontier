/**
 * Travel Slice - World navigation and travel state
 * @module game/store/slices/travelSlice
 */
import type { StateCreator } from 'zustand';
import type { CombatEncounter } from '../../data/schemas/combat';
import type { DangerLevel, TravelMethod } from '../../data/schemas/world';
import { FrontierTerritory } from '../../data/worlds/frontier_territory';
import type { GamePhase, Notification, TravelState, WorldItem, WorldPosition } from '../types';
import { rollTravelEncounter, TravelTimerManager } from './travelHelpers';

export interface TravelDataAccess {
  getWorldById: (worldId: string) => any;
  loadWorld: (world: any) => any;
  getConnectionsFrom: (world: any, locationId: string) => any[];
  getWorldItemsForLocation: (locationId: string) => any[];
  getEncounterById: (encounterId: string) => CombatEncounter | undefined;
  ProceduralLocationManager: {
    initialize: (seed: number) => void;
    generateLocationContent: (location: any, options?: any) => any;
    hasGeneratedContent: (locationId: string) => boolean;
    getOrGenerateNPCs: (locationId: string, resolved?: any) => any;
  };
}

export interface TravelSliceState {
  currentWorldId: string | null;
  currentLocationId: string | null;
  discoveredLocationIds: string[];
  loadedWorld: any | null;
  travelState: TravelState | null;
  worldItems: Record<string, WorldItem>;
  collectedItemIds: string[];
}

export interface TravelActions {
  initWorld: (worldId: string) => void;
  travelTo: (locationId: string) => void;
  completeTravel: () => void;
  cancelTravel: () => void;
  discoverLocation: (locationId: string) => void;
  getConnectedLocations: () => string[];
  collectWorldItem: (itemId: string) => void;
  addWorldItem: (item: WorldItem) => void;
  resetTravel: () => void;
}

export interface TravelSliceDeps {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  addItemById: (itemId: string, quantity?: number) => void;
  advanceTime: (hours: number) => void;
  applyTravelFatigue: (hours: number) => void;
  consumeProvisions: (hours: number) => { foodConsumed: number; waterConsumed: number; ranOutOfFood: boolean; ranOutOfWater: boolean };
  startCombat: (encounterId: string) => void;
  playerPosition: WorldPosition;
  activeQuests: any[];
  updateObjective: (questId: string, objectiveId: string, progress: number) => void;
}

export type TravelSlice = TravelSliceState & TravelActions;

export const DEFAULT_TRAVEL_SLICE_STATE: TravelSliceState = {
  currentWorldId: null, currentLocationId: null, discoveredLocationIds: [],
  loadedWorld: null, travelState: null, worldItems: {}, collectedItemIds: [],
};

export const createTravelSlice = (
  dataAccess: TravelDataAccess
): StateCreator<TravelSlice & TravelSliceDeps, [], [], TravelSlice> => {
  const timer = new TravelTimerManager();

  return (set, get) => ({
    ...DEFAULT_TRAVEL_SLICE_STATE,

    initWorld: (worldId: string) => {
      const world = dataAccess.getWorldById(worldId);
      set({ currentWorldId: worldId, loadedWorld: world ? dataAccess.loadWorld(world) : null });
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

      timer.clear();
      const encounterId = rollTravelEncounter(dangerLevel, dataAccess.getEncounterById);

      set({
        travelState: {
          fromLocationId: currentLocationId, toLocationId: locationId, method, travelTime,
          progress: 0, dangerLevel, startedAt, encounterId,
        },
      });
      state.setPhase('travel');

      if (encounterId) return;

      const totalMs = Math.max(2000, travelTime * 1000);
      timer.start(() => {
        const cs = get();
        if (!cs.travelState) { timer.clear(); return; }
        const elapsed = Date.now() - startedAt;
        const progress = Math.min(100, Math.round((elapsed / totalMs) * 100));
        set({ travelState: { ...cs.travelState, progress } });
        if (progress >= 100) { timer.clear(); get().completeTravel(); }
      });
    },

    completeTravel: () => {
      const state = get();
      const { travelState } = state;
      if (!travelState) return;
      timer.clear();

      const destinationId = travelState.toLocationId;
      const travelHours = travelState.travelTime;

      set({ currentLocationId: destinationId, travelState: null });
      state.setPhase('playing');
      state.discoverLocation(destinationId);
      state.advanceTime(travelHours);
      state.applyTravelFatigue(travelHours);

      const consumption = state.consumeProvisions(travelHours);
      if (consumption.ranOutOfFood) state.addNotification('warning', 'You ran out of food during the journey.');
      if (consumption.ranOutOfWater) state.addNotification('warning', 'You ran out of water during the journey.');
    },

    cancelTravel: () => {
      timer.clear();
      get().setPhase('playing');
      set({ travelState: null });
    },

    discoverLocation: (locationId: string) => {
      const state = get();
      if (!state.discoveredLocationIds.includes(locationId)) {
        const locRef = FrontierTerritory.locations.find((l) => l.id === locationId);
        set({ discoveredLocationIds: [...state.discoveredLocationIds, locationId] });
        state.addNotification('info', `Discovered: ${locRef?.name ?? locationId}`);
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
      set({ worldItems: newItems, collectedItemIds: [...state.collectedItemIds, itemId] });
    },

    addWorldItem: (item: WorldItem) => {
      set((s) => ({ worldItems: { ...s.worldItems, [item.id]: item } }));
    },

    resetTravel: () => { timer.clear(); set({ ...DEFAULT_TRAVEL_SLICE_STATE }); },
  });
};
