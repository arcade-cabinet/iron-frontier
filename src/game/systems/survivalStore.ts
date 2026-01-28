/**
 * SurvivalStore - Zustand slice for survival system state management
 *
 * Provides a Zustand-compatible state slice for managing survival systems
 * (time, fatigue, provisions, camping) that can be integrated with the
 * main game store.
 *
 * @module systems/survivalStore
 */

import type { StateCreator } from 'zustand';
import {
  GameClock,
  DEFAULT_CLOCK_STATE,
  type GameClockState,
  type TimePhase,
} from './time';
import {
  FatigueSystem,
  DEFAULT_FATIGUE_STATE,
  type FatigueState,
  type FatigueLevel,
  type FatigueEffects,
} from './fatigue';
import {
  ProvisionsSystem,
  DEFAULT_PROVISIONS_STATE,
  type ProvisionsState,
  type ProvisionStatus,
  type TerrainType,
  type HuntingResult,
  type ForagingResult,
} from './provisions';
import {
  CampingSystem,
  DEFAULT_CAMPING_STATE,
  type CampingState,
  type RestDuration,
  type CampingResult,
  type CampEncounter,
} from './camping';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Survival state data (serializable for save/load).
 */
export interface SurvivalState {
  // Time state
  clockState: GameClockState;
  isClockRunning: boolean;

  // Fatigue state
  fatigueState: FatigueState;

  // Provisions state
  provisionsState: ProvisionsState;

  // Camping state
  campingState: CampingState;
  currentTerrain: TerrainType;
}

/**
 * Survival system actions.
 */
export interface SurvivalActions {
  // --------------------------------------------------------------------------
  // TIME ACTIONS
  // --------------------------------------------------------------------------

  /**
   * Starts the game clock.
   */
  startClock: () => void;

  /**
   * Pauses the game clock.
   */
  pauseClock: () => void;

  /**
   * Toggles the game clock pause state.
   */
  toggleClock: () => void;

  /**
   * Advances game time by a number of hours.
   *
   * @param hours - Hours to advance
   */
  advanceTime: (hours: number) => void;

  /**
   * Sets the game time to a specific hour.
   *
   * @param hour - Hour to set (0-23)
   * @param minute - Minute to set (0-59)
   */
  setTime: (hour: number, minute?: number) => void;

  /**
   * Updates the clock state (called each frame/tick).
   */
  tickClock: () => void;

  // --------------------------------------------------------------------------
  // FATIGUE ACTIONS
  // --------------------------------------------------------------------------

  /**
   * Applies fatigue from traveling.
   *
   * @param hours - Hours of travel
   */
  applyTravelFatigue: (hours: number) => void;

  /**
   * Applies fatigue from combat.
   *
   * @param intensity - Combat intensity multiplier
   */
  applyCombatFatigue: (intensity?: number) => void;

  /**
   * Applies rest recovery (from items).
   *
   * @param amount - Recovery amount
   */
  applyItemRest: (amount?: number) => void;

  /**
   * Sets fatigue to a specific value.
   *
   * @param value - Fatigue value (0-100)
   */
  setFatigue: (value: number) => void;

  /**
   * Fully rests the player (fatigue to 0).
   */
  fullRest: () => void;

  // --------------------------------------------------------------------------
  // PROVISIONS ACTIONS
  // --------------------------------------------------------------------------

  /**
   * Consumes provisions for travel.
   *
   * @param hours - Hours of travel
   * @returns Consumption details
   */
  consumeProvisions: (hours: number) => {
    foodConsumed: number;
    waterConsumed: number;
    ranOutOfFood: boolean;
    ranOutOfWater: boolean;
  };

  /**
   * Adds food to inventory.
   *
   * @param amount - Food to add
   */
  addFood: (amount: number) => void;

  /**
   * Adds water to inventory.
   *
   * @param amount - Water to add
   */
  addWater: (amount: number) => void;

  /**
   * Adds both food and water.
   *
   * @param food - Food to add
   * @param water - Water to add
   */
  addProvisions: (food: number, water: number) => void;

  /**
   * Refills all provisions to maximum.
   */
  refillProvisions: () => void;

  /**
   * Attempts to hunt for food.
   *
   * @param skillModifier - Player hunting skill bonus
   * @returns Hunting result
   */
  attemptHunt: (skillModifier?: number) => HuntingResult;

  /**
   * Attempts to forage for provisions.
   *
   * @returns Foraging result
   */
  attemptForage: () => ForagingResult;

  // --------------------------------------------------------------------------
  // CAMPING ACTIONS
  // --------------------------------------------------------------------------

  /**
   * Sets the current terrain type.
   *
   * @param terrain - Terrain type
   */
  setTerrain: (terrain: TerrainType) => void;

  /**
   * Sets up a camp.
   *
   * @param withFire - Whether to start a fire
   * @param fuelAmount - Fuel for the fire
   */
  setupCamp: (withFire: boolean, fuelAmount?: number) => void;

  /**
   * Breaks camp and cleans up.
   */
  breakCamp: () => void;

  /**
   * Rests at camp for a duration.
   *
   * @param duration - Rest duration (2, 4, or 8 hours)
   * @returns Camping result
   */
  restAtCamp: (duration: RestDuration) => CampingResult;

  /**
   * Adds fuel to the campfire.
   *
   * @param amount - Fuel to add
   */
  addFuel: (amount: number) => void;

  // --------------------------------------------------------------------------
  // COMBINED ACTIONS
  // --------------------------------------------------------------------------

  /**
   * Performs a travel action with all survival effects.
   * Advances time, consumes provisions, applies fatigue.
   *
   * @param hours - Hours of travel
   * @returns Travel effects summary
   */
  performTravel: (hours: number) => {
    hoursElapsed: number;
    fatigueGained: number;
    provisionsConsumed: { food: number; water: number };
    ranOutOfProvisions: boolean;
    healthDamage: number;
  };

  /**
   * Rests at an inn for the night.
   * Advances time, recovers fatigue, does not consume provisions.
   *
   * @param hours - Hours of rest
   * @returns Inn rest summary
   */
  restAtInn: (hours: number) => {
    hoursRested: number;
    fatigueRecovered: number;
    goldSpent: number;
  };

  // --------------------------------------------------------------------------
  // SELECTORS (computed values)
  // --------------------------------------------------------------------------

  /**
   * Gets the current time phase.
   */
  getTimePhase: () => TimePhase;

  /**
   * Gets the formatted time string.
   */
  getFormattedTime: () => string;

  /**
   * Gets the current day number.
   */
  getCurrentDay: () => number;

  /**
   * Checks if it's currently night.
   */
  isNight: () => boolean;

  /**
   * Gets the ambient light level (0-1).
   */
  getAmbientLight: () => number;

  /**
   * Gets the current fatigue level.
   */
  getFatigueLevel: () => FatigueLevel;

  /**
   * Gets the current fatigue effects.
   */
  getFatigueEffects: () => FatigueEffects;

  /**
   * Checks if the player can take actions.
   */
  canAct: () => boolean;

  /**
   * Gets the food provision status.
   */
  getFoodStatus: () => ProvisionStatus;

  /**
   * Gets the water provision status.
   */
  getWaterStatus: () => ProvisionStatus;

  /**
   * Gets the overall provision status.
   */
  getProvisionStatus: () => ProvisionStatus;

  /**
   * Gets the fatigue multiplier from provisions.
   */
  getFatigueMultiplier: () => number;

  /**
   * Checks if camping is possible.
   */
  canCamp: () => boolean;

  /**
   * Gets the current camping state.
   */
  isCamping: () => boolean;

  /**
   * Gets recent camp encounters.
   */
  getCampEncounters: () => CampEncounter[];

  // --------------------------------------------------------------------------
  // SERIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Gets the complete survival state for saving.
   */
  getSurvivalState: () => SurvivalState;

  /**
   * Loads survival state from a save.
   *
   * @param state - Saved state to load
   */
  loadSurvivalState: (state: Partial<SurvivalState>) => void;

  /**
   * Resets all survival systems to defaults.
   */
  resetSurvival: () => void;
}

/**
 * Complete survival slice type for Zustand.
 */
export type SurvivalSlice = SurvivalState & SurvivalActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default survival state.
 */
export const DEFAULT_SURVIVAL_STATE: SurvivalState = {
  clockState: { ...DEFAULT_CLOCK_STATE },
  isClockRunning: false,
  fatigueState: { ...DEFAULT_FATIGUE_STATE },
  provisionsState: { ...DEFAULT_PROVISIONS_STATE },
  campingState: { ...DEFAULT_CAMPING_STATE },
  currentTerrain: 'plains',
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the survival system Zustand slice.
 *
 * This is designed to be used with Zustand's slice pattern:
 *
 * @example
 * ```typescript
 * const useGameStore = create<GameState & SurvivalSlice>()((...a) => ({
 *   ...createGameSlice(...a),
 *   ...createSurvivalSlice(...a),
 * }));
 * ```
 *
 * @param set - Zustand set function
 * @param get - Zustand get function
 * @returns Survival slice
 */
export const createSurvivalSlice: StateCreator<
  SurvivalSlice,
  [],
  [],
  SurvivalSlice
> = (set, get) => {
  // Create system instances (these hold no state, just logic)
  const clock = new GameClock();
  const fatigue = new FatigueSystem();
  const provisions = new ProvisionsSystem();
  const camping = new CampingSystem();

  // Sync system state from store state
  const syncSystems = () => {
    const state = get();
    clock.loadState(state.clockState);
    fatigue.loadState(state.fatigueState);
    provisions.loadState(state.provisionsState);
    camping.loadState(state.campingState);
  };

  return {
    // State
    ...DEFAULT_SURVIVAL_STATE,

    // --------------------------------------------------------------------------
    // TIME ACTIONS
    // --------------------------------------------------------------------------

    startClock: () => {
      syncSystems();
      clock.start();
      set({ isClockRunning: true });
    },

    pauseClock: () => {
      clock.pause();
      set({ isClockRunning: false, clockState: clock.getState() });
    },

    toggleClock: () => {
      syncSystems();
      clock.toggle();
      set({
        isClockRunning: !clock.isPaused(),
        clockState: clock.getState(),
      });
    },

    advanceTime: (hours: number) => {
      syncSystems();
      clock.advanceHours(hours);

      // Apply night fatigue if awake at night
      const isNight = clock.isNight();
      if (isNight) {
        fatigue.applyNightFatigue(hours);
      }

      set({
        clockState: clock.getState(),
        fatigueState: fatigue.getState(),
      });
    },

    setTime: (hour: number, minute = 0) => {
      syncSystems();
      clock.setTime(hour, minute);
      set({ clockState: clock.getState() });
    },

    tickClock: () => {
      if (!get().isClockRunning) return;

      // This is called externally (e.g., in a useEffect)
      // The clock handles its own timing internally
      syncSystems();
      set({ clockState: clock.getState() });
    },

    // --------------------------------------------------------------------------
    // FATIGUE ACTIONS
    // --------------------------------------------------------------------------

    applyTravelFatigue: (hours: number) => {
      syncSystems();
      const isNight = clock.isNight();
      const provisionMultiplier = provisions.getFatigueMultiplier();

      fatigue.applyTravelFatigue(hours, isNight);

      // Apply provision penalty
      if (provisionMultiplier > 1) {
        const extraFatigue = hours * 8 * (provisionMultiplier - 1);
        fatigue.addFatigue(extraFatigue);
      }

      set({ fatigueState: fatigue.getState() });
    },

    applyCombatFatigue: (intensity = 1) => {
      syncSystems();
      fatigue.applyCombatFatigue(intensity);
      set({ fatigueState: fatigue.getState() });
    },

    applyItemRest: (amount = 1) => {
      syncSystems();
      fatigue.applyItemRest(amount);
      set({ fatigueState: fatigue.getState() });
    },

    setFatigue: (value: number) => {
      syncSystems();
      fatigue.setFatigue(value);
      set({ fatigueState: fatigue.getState() });
    },

    fullRest: () => {
      syncSystems();
      fatigue.fullRest();
      set({ fatigueState: fatigue.getState() });
    },

    // --------------------------------------------------------------------------
    // PROVISIONS ACTIONS
    // --------------------------------------------------------------------------

    consumeProvisions: (hours: number) => {
      syncSystems();
      const result = provisions.consumeForTravel(hours);
      set({ provisionsState: provisions.getState() });
      return result;
    },

    addFood: (amount: number) => {
      syncSystems();
      provisions.addFood(amount);
      set({ provisionsState: provisions.getState() });
    },

    addWater: (amount: number) => {
      syncSystems();
      provisions.addWater(amount);
      set({ provisionsState: provisions.getState() });
    },

    addProvisions: (food: number, water: number) => {
      syncSystems();
      provisions.addProvisions(food, water);
      set({ provisionsState: provisions.getState() });
    },

    refillProvisions: () => {
      syncSystems();
      provisions.refillAll();
      set({ provisionsState: provisions.getState() });
    },

    attemptHunt: (skillModifier = 0) => {
      syncSystems();
      const result = provisions.attemptHunt(skillModifier);

      // Apply hunting fatigue
      fatigue.addFatigue(result.fatigueCost);

      // Advance time
      clock.advanceHours(result.timeSpent);

      set({
        provisionsState: provisions.getState(),
        fatigueState: fatigue.getState(),
        clockState: clock.getState(),
      });

      return result;
    },

    attemptForage: () => {
      syncSystems();
      const terrain = get().currentTerrain;
      const result = provisions.attemptForage(terrain);

      // Advance time
      clock.advanceHours(result.timeSpent);

      set({
        provisionsState: provisions.getState(),
        clockState: clock.getState(),
      });

      return result;
    },

    // --------------------------------------------------------------------------
    // CAMPING ACTIONS
    // --------------------------------------------------------------------------

    setTerrain: (terrain: TerrainType) => {
      set({ currentTerrain: terrain });
    },

    setupCamp: (withFire: boolean, fuelAmount = 5) => {
      syncSystems();
      const currentTime = clock.getTotalMinutes();
      camping.setupCamp(withFire, fuelAmount, currentTime);
      set({ campingState: camping.getState() });
    },

    breakCamp: () => {
      syncSystems();
      camping.breakCamp();
      set({ campingState: camping.getState() });
    },

    restAtCamp: (duration: RestDuration) => {
      syncSystems();
      const terrain = get().currentTerrain;

      const result = camping.rest(
        duration,
        fatigue,
        provisions,
        clock,
        terrain
      );

      set({
        campingState: camping.getState(),
        fatigueState: fatigue.getState(),
        provisionsState: provisions.getState(),
        clockState: clock.getState(),
      });

      return result;
    },

    addFuel: (amount: number) => {
      syncSystems();
      camping.addFuel(amount);
      set({ campingState: camping.getState() });
    },

    // --------------------------------------------------------------------------
    // COMBINED ACTIONS
    // --------------------------------------------------------------------------

    performTravel: (hours: number) => {
      syncSystems();
      const isNight = clock.isNight();

      // Advance time
      clock.advanceHours(hours);

      // Consume provisions
      const consumed = provisions.consumeForTravel(hours);

      // Apply fatigue with provision multiplier
      const provisionMultiplier = provisions.getFatigueMultiplier();
      fatigue.applyTravelFatigue(hours, isNight);

      if (provisionMultiplier > 1) {
        const extraFatigue = hours * 8 * (provisionMultiplier - 1);
        fatigue.addFatigue(extraFatigue);
      }

      // Calculate health damage from dehydration
      const dehydrationDamage = provisions.getDehydrationDamage() * hours;

      set({
        clockState: clock.getState(),
        provisionsState: provisions.getState(),
        fatigueState: fatigue.getState(),
      });

      return {
        hoursElapsed: hours,
        fatigueGained: hours * 8 * provisionMultiplier + (isNight ? hours * 5 : 0),
        provisionsConsumed: {
          food: consumed.foodConsumed,
          water: consumed.waterConsumed,
        },
        ranOutOfProvisions: consumed.ranOutOfFood || consumed.ranOutOfWater,
        healthDamage: dehydrationDamage,
      };
    },

    restAtInn: (hours: number) => {
      syncSystems();

      // Advance time
      clock.advanceHours(hours);

      // Apply inn rest
      fatigue.applyInnRest(hours);

      // Calculate cost (10 gold per hour is a placeholder)
      const goldSpent = hours * 10;

      set({
        clockState: clock.getState(),
        fatigueState: fatigue.getState(),
      });

      return {
        hoursRested: hours,
        fatigueRecovered: hours * 25, // Inn recovery rate
        goldSpent,
      };
    },

    // --------------------------------------------------------------------------
    // SELECTORS
    // --------------------------------------------------------------------------

    getTimePhase: () => {
      syncSystems();
      return clock.getPhase();
    },

    getFormattedTime: () => {
      syncSystems();
      return clock.getFormattedTime();
    },

    getCurrentDay: () => {
      return get().clockState.day;
    },

    isNight: () => {
      syncSystems();
      return clock.isNight();
    },

    getAmbientLight: () => {
      syncSystems();
      return clock.getAmbientLight();
    },

    getFatigueLevel: () => {
      syncSystems();
      return fatigue.getLevel();
    },

    getFatigueEffects: () => {
      syncSystems();
      return fatigue.getEffects();
    },

    canAct: () => {
      syncSystems();
      return fatigue.canAct();
    },

    getFoodStatus: () => {
      syncSystems();
      return provisions.getFoodStatus();
    },

    getWaterStatus: () => {
      syncSystems();
      return provisions.getWaterStatus();
    },

    getProvisionStatus: () => {
      syncSystems();
      return provisions.getOverallStatus();
    },

    getFatigueMultiplier: () => {
      syncSystems();
      return provisions.getFatigueMultiplier();
    },

    canCamp: () => {
      const terrain = get().currentTerrain;
      return camping.canCamp(terrain);
    },

    isCamping: () => {
      return get().campingState.isCamping;
    },

    getCampEncounters: () => {
      return get().campingState.encounters;
    },

    // --------------------------------------------------------------------------
    // SERIALIZATION
    // --------------------------------------------------------------------------

    getSurvivalState: () => {
      const state = get();
      return {
        clockState: state.clockState,
        isClockRunning: state.isClockRunning,
        fatigueState: state.fatigueState,
        provisionsState: state.provisionsState,
        campingState: state.campingState,
        currentTerrain: state.currentTerrain,
      };
    },

    loadSurvivalState: (state: Partial<SurvivalState>) => {
      set((current) => ({
        ...current,
        clockState: state.clockState ?? current.clockState,
        isClockRunning: state.isClockRunning ?? current.isClockRunning,
        fatigueState: state.fatigueState ?? current.fatigueState,
        provisionsState: state.provisionsState ?? current.provisionsState,
        campingState: state.campingState ?? current.campingState,
        currentTerrain: state.currentTerrain ?? current.currentTerrain,
      }));
    },

    resetSurvival: () => {
      clock.reset();
      fatigue.reset();
      provisions.reset();
      camping.reset();

      set({
        ...DEFAULT_SURVIVAL_STATE,
      });
    },
  };
};
