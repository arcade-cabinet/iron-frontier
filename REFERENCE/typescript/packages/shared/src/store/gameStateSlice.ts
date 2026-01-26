/**
 * gameStateSlice.ts - Core game state for Iron Frontier v2
 *
 * Manages high-level game state:
 * - Current location (overworld position or town)
 * - Game mode (exploring, in-town, combat, camping)
 * - Party state (members, formation)
 * - Save/load state
 */

import type { StateCreator } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export type GameMode = 'title' | 'overworld' | 'town' | 'combat' | 'camp' | 'dialogue' | 'menu';

export interface WorldPosition {
  x: number;
  z: number;
}

export interface TownLocation {
  townId: string;
  buildingId?: string; // Inside a specific building
}

export interface PartyMember {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  xp: number;
  statusEffects: string[];
}

export interface GameStateSlice {
  // Current mode
  gameMode: GameMode;
  previousMode: GameMode | null;

  // Location
  overworldPosition: WorldPosition;
  currentTown: TownLocation | null;
  currentRoute: string | null; // Route ID if on a route

  // Party
  party: PartyMember[];
  money: number;

  // Progress
  currentDay: number;
  totalPlayTime: number; // In seconds
  questFlags: Record<string, boolean>;
  visitedTowns: string[];
  completedQuests: string[];

  // Actions
  setGameMode: (mode: GameMode) => void;
  setOverworldPosition: (pos: WorldPosition) => void;
  enterTown: (townId: string) => void;
  exitTown: () => void;
  enterBuilding: (buildingId: string) => void;
  exitBuilding: () => void;
  setCurrentRoute: (routeId: string | null) => void;

  // Party management
  addPartyMember: (member: PartyMember) => void;
  removePartyMember: (memberId: string) => void;
  updatePartyMember: (memberId: string, updates: Partial<PartyMember>) => void;
  healParty: (amount: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;

  // Progress tracking
  setQuestFlag: (flag: string, value: boolean) => void;
  getQuestFlag: (flag: string) => boolean;
  markTownVisited: (townId: string) => void;
  markQuestCompleted: (questId: string) => void;
  incrementPlayTime: (seconds: number) => void;
  advanceDay: () => void;

  // Save/Load
  getSaveData: () => GameSaveData;
  loadSaveData: (data: GameSaveData) => void;
  resetGame: () => void;
}

export interface GameSaveData {
  version: number;
  timestamp: number;
  gameMode: GameMode;
  overworldPosition: WorldPosition;
  currentTown: TownLocation | null;
  currentRoute: string | null;
  party: PartyMember[];
  money: number;
  currentDay: number;
  totalPlayTime: number;
  questFlags: Record<string, boolean>;
  visitedTowns: string[];
  completedQuests: string[];
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const INITIAL_PARTY_MEMBER: PartyMember = {
  id: 'player',
  name: 'Stranger',
  hp: 100,
  maxHp: 100,
  attack: 10,
  defense: 5,
  speed: 10,
  level: 1,
  xp: 0,
  statusEffects: [],
};

const INITIAL_STATE = {
  gameMode: 'title' as GameMode,
  previousMode: null as GameMode | null,
  overworldPosition: { x: 0, z: 0 },
  currentTown: null as TownLocation | null,
  currentRoute: null as string | null,
  party: [INITIAL_PARTY_MEMBER],
  money: 50,
  currentDay: 1,
  totalPlayTime: 0,
  questFlags: {} as Record<string, boolean>,
  visitedTowns: [] as string[],
  completedQuests: [] as string[],
};

// ============================================================================
// SLICE CREATOR
// ============================================================================

export const createGameStateSlice: StateCreator<GameStateSlice> = (set, get) => ({
  ...INITIAL_STATE,

  // Mode management
  setGameMode: (mode) =>
    set((state) => ({
      previousMode: state.gameMode,
      gameMode: mode,
    })),

  // Location management
  setOverworldPosition: (pos) => set({ overworldPosition: pos }),

  enterTown: (townId) =>
    set((state) => ({
      currentTown: { townId },
      gameMode: 'town',
      previousMode: state.gameMode,
      visitedTowns: state.visitedTowns.includes(townId)
        ? state.visitedTowns
        : [...state.visitedTowns, townId],
    })),

  exitTown: () =>
    set((state) => ({
      currentTown: null,
      gameMode: 'overworld',
      previousMode: state.gameMode,
    })),

  enterBuilding: (buildingId) =>
    set((state) => ({
      currentTown: state.currentTown
        ? { ...state.currentTown, buildingId }
        : null,
    })),

  exitBuilding: () =>
    set((state) => ({
      currentTown: state.currentTown
        ? { townId: state.currentTown.townId, buildingId: undefined }
        : null,
    })),

  setCurrentRoute: (routeId) => set({ currentRoute: routeId }),

  // Party management
  addPartyMember: (member) =>
    set((state) => ({
      party: [...state.party, member],
    })),

  removePartyMember: (memberId) =>
    set((state) => ({
      party: state.party.filter((m) => m.id !== memberId),
    })),

  updatePartyMember: (memberId, updates) =>
    set((state) => ({
      party: state.party.map((m) =>
        m.id === memberId ? { ...m, ...updates } : m
      ),
    })),

  healParty: (amount) =>
    set((state) => ({
      party: state.party.map((m) => ({
        ...m,
        hp: Math.min(m.maxHp, m.hp + amount),
      })),
    })),

  addMoney: (amount) =>
    set((state) => ({
      money: state.money + amount,
    })),

  spendMoney: (amount) => {
    const state = get();
    if (state.money >= amount) {
      set({ money: state.money - amount });
      return true;
    }
    return false;
  },

  // Progress tracking
  setQuestFlag: (flag, value) =>
    set((state) => ({
      questFlags: { ...state.questFlags, [flag]: value },
    })),

  getQuestFlag: (flag) => get().questFlags[flag] ?? false,

  markTownVisited: (townId) =>
    set((state) => ({
      visitedTowns: state.visitedTowns.includes(townId)
        ? state.visitedTowns
        : [...state.visitedTowns, townId],
    })),

  markQuestCompleted: (questId) =>
    set((state) => ({
      completedQuests: state.completedQuests.includes(questId)
        ? state.completedQuests
        : [...state.completedQuests, questId],
    })),

  incrementPlayTime: (seconds) =>
    set((state) => ({
      totalPlayTime: state.totalPlayTime + seconds,
    })),

  advanceDay: () =>
    set((state) => ({
      currentDay: state.currentDay + 1,
    })),

  // Save/Load
  getSaveData: () => {
    const state = get();
    return {
      version: 1,
      timestamp: Date.now(),
      gameMode: state.gameMode,
      overworldPosition: state.overworldPosition,
      currentTown: state.currentTown,
      currentRoute: state.currentRoute,
      party: state.party,
      money: state.money,
      currentDay: state.currentDay,
      totalPlayTime: state.totalPlayTime,
      questFlags: state.questFlags,
      visitedTowns: state.visitedTowns,
      completedQuests: state.completedQuests,
    };
  },

  loadSaveData: (data) =>
    set({
      gameMode: data.gameMode,
      overworldPosition: data.overworldPosition,
      currentTown: data.currentTown,
      currentRoute: data.currentRoute,
      party: data.party,
      money: data.money,
      currentDay: data.currentDay,
      totalPlayTime: data.totalPlayTime,
      questFlags: data.questFlags,
      visitedTowns: data.visitedTowns,
      completedQuests: data.completedQuests,
    }),

  resetGame: () => set(INITIAL_STATE),
});
