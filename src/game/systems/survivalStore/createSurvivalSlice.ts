import { GameClock } from '../time';
import { FatigueSystem } from '../fatigue';
import { ProvisionsSystem } from '../provisions';
import { CampingSystem } from '../camping';
import type { SurvivalSliceCreator, SurvivalState, SurvivalSlice, SurvivalContext } from './types';
import { DEFAULT_SURVIVAL_STATE } from './types';
import { createTimeActions } from './timeActions';
import { createFatigueActions } from './fatigueActions';
import { createProvisionsActions } from './provisionsActions';
import { createCampingActions } from './campingActions';

export const createSurvivalSlice: SurvivalSliceCreator = (set, get, _api) => {
  const clock = new GameClock();
  const fatigue = new FatigueSystem();
  const provisions = new ProvisionsSystem();
  const camping = new CampingSystem();

  const gameHoursToRealMinutes = (gameHours: number): number => {
    const msPerGameMinute = clock['config']?.msPerGameMinute ?? 4000;
    return (gameHours * 60 * msPerGameMinute) / 60_000;
  };

  const syncSystems = () => {
    const state = get();
    clock.loadState(state.clockState);
    fatigue.loadState(state.fatigueState);
    provisions.loadState(state.provisionsState);
    camping.loadState(state.campingState);
  };

  const ctx: SurvivalContext = {
    systems: { clock, fatigue, provisions, camping },
    set,
    get,
    syncSystems,
    gameHoursToRealMinutes,
  };

  return {
    ...DEFAULT_SURVIVAL_STATE,

    ...createTimeActions(ctx),
    ...createFatigueActions(ctx),
    ...createProvisionsActions(ctx),
    ...createCampingActions(ctx),

    // Combined actions

    performTravel: (hours: number) => {
      syncSystems();
      const isNight = clock.isNight();
      const realMinutes = gameHoursToRealMinutes(hours);

      clock.advanceHours(hours);

      const consumed = provisions.consumeForTravel(hours);

      const provisionMultiplier = provisions.getFatigueMultiplier();
      fatigue.applyTravelFatigue(realMinutes, isNight);

      if (provisionMultiplier > 1) {
        const baseFatiguePerRealMin = 2;
        const extraFatigue = realMinutes * baseFatiguePerRealMin * (provisionMultiplier - 1);
        fatigue.addFatigue(extraFatigue);
      }

      const dehydrationDamage = provisions.getDehydrationDamage() * hours;

      set({
        clockState: clock.getState(),
        provisionsState: provisions.getState(),
        fatigueState: fatigue.getState(),
      });

      const baseFatigue = realMinutes * 2;
      const nightExtra = isNight ? realMinutes * 1.5 : 0;
      return {
        hoursElapsed: hours,
        fatigueGained: (baseFatigue + nightExtra) * provisionMultiplier,
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

      clock.advanceHours(hours);
      fatigue.applyInnRest(hours);

      const goldSpent = hours * 10;

      set({
        clockState: clock.getState(),
        fatigueState: fatigue.getState(),
      });

      const healAmount = hours * 10;
      if (healAmount > 0) {
        const store = get() as SurvivalSlice & { heal?: (amount: number) => void };
        store.heal?.(healAmount);
      }

      return {
        hoursRested: hours,
        fatigueRecovered: hours * 25,
        goldSpent,
      };
    },

    // Selectors

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

    // Serialization

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
      syncSystems();
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
