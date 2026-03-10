import type { StateCreator } from 'zustand';
import type { GameClockState, TimePhase } from '../time';
import type { FatigueState, FatigueLevel, FatigueEffects } from '../fatigue';
import type { ProvisionsState, ProvisionStatus, TerrainType, HuntingResult, ForagingResult } from '../provisions';
import type { CampingState, RestDuration, CampingResult, CampEncounter } from '../camping';
import { DEFAULT_CLOCK_STATE } from '../time';
import { DEFAULT_FATIGUE_STATE } from '../fatigue';
import { DEFAULT_PROVISIONS_STATE } from '../provisions';
import { DEFAULT_CAMPING_STATE } from '../camping';

export interface SurvivalState {
  clockState: GameClockState;
  isClockRunning: boolean;
  fatigueState: FatigueState;
  provisionsState: ProvisionsState;
  campingState: CampingState;
  currentTerrain: TerrainType;
}

export interface SurvivalActions {
  startClock: () => void;
  pauseClock: () => void;
  toggleClock: () => void;
  advanceTime: (hours: number) => void;
  setTime: (hour: number, minute?: number) => void;
  tickClock: () => void;

  applyTravelFatigue: (hours: number) => void;
  applyCombatFatigue: (realMinutes?: number) => void;
  applyItemRest: (amount?: number) => void;
  setFatigue: (value: number) => void;
  fullRest: () => void;

  consumeProvisions: (hours: number) => {
    foodConsumed: number;
    waterConsumed: number;
    ranOutOfFood: boolean;
    ranOutOfWater: boolean;
  };
  addFood: (amount: number) => void;
  addWater: (amount: number) => void;
  addProvisions: (food: number, water: number) => void;
  refillProvisions: () => void;
  attemptHunt: (skillModifier?: number) => HuntingResult;
  attemptForage: () => ForagingResult;

  setTerrain: (terrain: TerrainType) => void;
  setupCamp: (withFire: boolean, fuelAmount?: number) => void;
  breakCamp: () => void;
  restAtCamp: (duration: RestDuration) => CampingResult;
  addFuel: (amount: number) => void;

  performTravel: (hours: number) => {
    hoursElapsed: number;
    fatigueGained: number;
    provisionsConsumed: { food: number; water: number };
    ranOutOfProvisions: boolean;
    healthDamage: number;
  };
  restAtInn: (hours: number) => {
    hoursRested: number;
    fatigueRecovered: number;
    goldSpent: number;
  };

  getTimePhase: () => TimePhase;
  getFormattedTime: () => string;
  getCurrentDay: () => number;
  isNight: () => boolean;
  getAmbientLight: () => number;
  getFatigueLevel: () => FatigueLevel;
  getFatigueEffects: () => FatigueEffects;
  canAct: () => boolean;
  getFoodStatus: () => ProvisionStatus;
  getWaterStatus: () => ProvisionStatus;
  getProvisionStatus: () => ProvisionStatus;
  getFatigueMultiplier: () => number;
  canCamp: () => boolean;
  isCamping: () => boolean;
  getCampEncounters: () => CampEncounter[];

  getSurvivalState: () => SurvivalState;
  loadSurvivalState: (state: Partial<SurvivalState>) => void;
  resetSurvival: () => void;
}

export type SurvivalSlice = SurvivalState & SurvivalActions;

export const DEFAULT_SURVIVAL_STATE: SurvivalState = {
  clockState: { ...DEFAULT_CLOCK_STATE },
  isClockRunning: false,
  fatigueState: { ...DEFAULT_FATIGUE_STATE },
  provisionsState: { ...DEFAULT_PROVISIONS_STATE },
  campingState: { ...DEFAULT_CAMPING_STATE },
  currentTerrain: 'plains',
};

export type SurvivalSliceCreator = StateCreator<
  SurvivalSlice,
  [],
  [],
  SurvivalSlice
>;

export interface SurvivalSystems {
  clock: import('../time').GameClock;
  fatigue: import('../fatigue').FatigueSystem;
  provisions: import('../provisions').ProvisionsSystem;
  camping: import('../camping').CampingSystem;
}

export interface SurvivalContext {
  systems: SurvivalSystems;
  set: {
    (partial: Partial<SurvivalSlice> | ((state: SurvivalSlice) => Partial<SurvivalSlice>)): void;
    (state: SurvivalSlice | ((state: SurvivalSlice) => SurvivalSlice), replace: true): void;
  };
  get: () => SurvivalSlice;
  syncSystems: () => void;
  gameHoursToRealMinutes: (gameHours: number) => number;
}
