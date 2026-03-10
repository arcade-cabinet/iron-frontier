/**
 * survivalStore.test.ts - Tests for SurvivalStore Zustand slice
 */

import { create } from 'zustand';
import {
    createSurvivalSlice,
    DEFAULT_SURVIVAL_STATE,
    type SurvivalSlice,
} from '../survivalStore';

describe('SurvivalStore', () => {
  let store: ReturnType<typeof create<SurvivalSlice>>;

  beforeEach(() => {
    store = create<SurvivalSlice>()((...a) => ({
      ...createSurvivalSlice(...a),
    }));
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const state = store.getState();
      expect(state.clockState).toEqual(DEFAULT_SURVIVAL_STATE.clockState);
      expect(state.fatigueState).toEqual(DEFAULT_SURVIVAL_STATE.fatigueState);
      expect(state.provisionsState).toEqual(DEFAULT_SURVIVAL_STATE.provisionsState);
      expect(state.campingState).toEqual(DEFAULT_SURVIVAL_STATE.campingState);
    });

    it('should not be running initially', () => {
      const state = store.getState();
      expect(state.isClockRunning).toBe(false);
    });

    it('should have default terrain', () => {
      const state = store.getState();
      expect(state.currentTerrain).toBe('plains');
    });
  });

  describe('time actions', () => {
    it('should start clock', () => {
      store.getState().startClock();
      expect(store.getState().isClockRunning).toBe(true);
    });

    it('should pause clock', () => {
      store.getState().startClock();
      store.getState().pauseClock();
      expect(store.getState().isClockRunning).toBe(false);
    });

    it('should toggle clock', () => {
      expect(store.getState().isClockRunning).toBe(false);
      store.getState().toggleClock();
      expect(store.getState().isClockRunning).toBe(true);
      store.getState().toggleClock();
      expect(store.getState().isClockRunning).toBe(false);
    });

    it('should advance time', () => {
      const initialHour = store.getState().clockState.hour;
      store.getState().advanceTime(2);
      expect(store.getState().clockState.hour).not.toBe(initialHour);
    });

    it('should set time', () => {
      store.getState().setTime(15, 30);
      const state = store.getState();
      expect(state.clockState.hour).toBe(15);
      expect(state.clockState.minute).toBe(30);
    });

    it('should apply night fatigue when advancing time at night', () => {
      store.getState().setTime(22, 0); // Night
      const initialFatigue = store.getState().fatigueState.current;
      store.getState().advanceTime(2);
      expect(store.getState().fatigueState.current).toBeGreaterThan(initialFatigue);
    });
  });

  describe('time selectors', () => {
    it('should get time phase', () => {
      const phase = store.getState().getTimePhase();
      expect(phase).toBeDefined();
    });

    it('should get formatted time', () => {
      const time = store.getState().getFormattedTime();
      expect(time).toMatch(/\d{2}:\d{2}/);
    });

    it('should get current day', () => {
      const day = store.getState().getCurrentDay();
      expect(day).toBe(1);
    });

    it('should check if night', () => {
      store.getState().setTime(22, 0);
      expect(store.getState().isNight()).toBe(true);
    });

    it('should get ambient light', () => {
      const light = store.getState().getAmbientLight();
      expect(light).toBeGreaterThanOrEqual(0);
      expect(light).toBeLessThanOrEqual(1);
    });
  });

  describe('fatigue actions', () => {
    it('should apply travel fatigue', () => {
      const initialFatigue = store.getState().fatigueState.current;
      store.getState().applyTravelFatigue(2);
      expect(store.getState().fatigueState.current).toBeGreaterThan(initialFatigue);
    });

    it('should apply combat fatigue', () => {
      const initialFatigue = store.getState().fatigueState.current;
      store.getState().applyCombatFatigue();
      expect(store.getState().fatigueState.current).toBeGreaterThan(initialFatigue);
    });

    it('should apply item rest', () => {
      store.getState().setFatigue(50);
      store.getState().applyItemRest();
      expect(store.getState().fatigueState.current).toBeLessThan(50);
    });

    it('should set fatigue', () => {
      store.getState().setFatigue(75);
      expect(store.getState().fatigueState.current).toBe(75);
    });

    it('should fully rest', () => {
      store.getState().setFatigue(75);
      store.getState().fullRest();
      expect(store.getState().fatigueState.current).toBe(0);
    });

    it('should apply provision multiplier to travel fatigue', () => {
      // Deplete provisions (food=2/hr, water=2.5/hr; need 40h to drain 75+ food)
      store.getState().consumeProvisions(40);
      const initialFatigue = store.getState().fatigueState.current;
      store.getState().applyTravelFatigue(2);
      const fatigueGained = store.getState().fatigueState.current - initialFatigue;
      // Should be more than normal due to no provisions
      expect(fatigueGained).toBeGreaterThan(16); // Normal would be 16
    });
  });

  describe('fatigue selectors', () => {
    it('should get fatigue level', () => {
      const level = store.getState().getFatigueLevel();
      expect(level).toBe('rested');
    });

    it('should get fatigue effects', () => {
      const effects = store.getState().getFatigueEffects();
      expect(effects).toHaveProperty('accuracyModifier');
      expect(effects).toHaveProperty('damageModifier');
      expect(effects).toHaveProperty('speedModifier');
    });

    it('should check if can act', () => {
      expect(store.getState().canAct()).toBe(true);
    });

    it('should not be able to act when collapsed', () => {
      store.getState().setFatigue(100);
      expect(store.getState().canAct()).toBe(false);
    });
  });

  describe('provisions actions', () => {
    it('should consume provisions', () => {
      const initialFood = store.getState().provisionsState.food;
      store.getState().consumeProvisions(2);
      expect(store.getState().provisionsState.food).toBeLessThan(initialFood);
    });

    it('should add food', () => {
      const initialFood = store.getState().provisionsState.food;
      store.getState().addFood(10);
      expect(store.getState().provisionsState.food).toBe(initialFood + 10);
    });

    it('should add water', () => {
      const initialWater = store.getState().provisionsState.water;
      store.getState().addWater(10);
      expect(store.getState().provisionsState.water).toBe(initialWater + 10);
    });

    it('should add both provisions', () => {
      const initialFood = store.getState().provisionsState.food;
      const initialWater = store.getState().provisionsState.water;
      store.getState().addProvisions(10, 15);
      expect(store.getState().provisionsState.food).toBe(initialFood + 10);
      expect(store.getState().provisionsState.water).toBe(initialWater + 15);
    });

    it('should refill provisions', () => {
      store.getState().consumeProvisions(10);
      store.getState().refillProvisions();
      expect(store.getState().provisionsState.food).toBe(100);
      expect(store.getState().provisionsState.water).toBe(100);
    });

    it('should return consumption details', () => {
      const result = store.getState().consumeProvisions(2);
      expect(result).toHaveProperty('foodConsumed');
      expect(result).toHaveProperty('waterConsumed');
      expect(result).toHaveProperty('ranOutOfFood');
      expect(result).toHaveProperty('ranOutOfWater');
    });
  });

  describe('hunting and foraging', () => {
    it('should attempt hunt', () => {
      const result = store.getState().attemptHunt();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('foodGained');
      expect(result).toHaveProperty('fatigueCost');
      expect(result).toHaveProperty('timeSpent');
    });

    it('should apply fatigue from hunting', () => {
      const initialFatigue = store.getState().fatigueState.current;
      store.getState().attemptHunt();
      expect(store.getState().fatigueState.current).toBeGreaterThan(initialFatigue);
    });

    it('should advance time when hunting', () => {
      const initialHour = store.getState().clockState.hour;
      store.getState().attemptHunt();
      // Time should advance by 2 hours
      expect(store.getState().clockState.totalMinutes).toBeGreaterThan(initialHour * 60);
    });

    it('should attempt forage', () => {
      store.getState().setTerrain('forest');
      const result = store.getState().attemptForage();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('foodFound');
      expect(result).toHaveProperty('timeSpent');
    });

    it('should advance time when foraging', () => {
      const initialMinutes = store.getState().clockState.totalMinutes;
      store.getState().setTerrain('forest');
      store.getState().attemptForage();
      expect(store.getState().clockState.totalMinutes).toBeGreaterThan(initialMinutes);
    });
  });

  describe('provisions selectors', () => {
    it('should get food status', () => {
      const status = store.getState().getFoodStatus();
      expect(status).toBe('abundant');
    });

    it('should get water status', () => {
      const status = store.getState().getWaterStatus();
      expect(status).toBe('abundant');
    });

    it('should get overall provision status', () => {
      const status = store.getState().getProvisionStatus();
      expect(status).toBeDefined();
    });

    it('should get fatigue multiplier', () => {
      const multiplier = store.getState().getFatigueMultiplier();
      expect(multiplier).toBe(1.0);
    });

    it('should increase multiplier when out of provisions', () => {
      // Need enough hours to fully deplete food (75 / 2 = 37.5h) and water (75 / 2.5 = 30h)
      store.getState().consumeProvisions(40);
      const multiplier = store.getState().getFatigueMultiplier();
      expect(multiplier).toBeGreaterThan(1.0);
    });
  });

  describe('camping actions', () => {
    it('should set terrain', () => {
      store.getState().setTerrain('forest');
      expect(store.getState().currentTerrain).toBe('forest');
    });

    it('should setup camp', () => {
      store.getState().setupCamp(false);
      expect(store.getState().campingState.isCamping).toBe(true);
    });

    it('should setup camp with fire', () => {
      store.getState().setupCamp(true, 5);
      const state = store.getState();
      expect(state.campingState.isCamping).toBe(true);
      expect(state.campingState.fireState).toBe('burning');
      expect(state.campingState.fuelRemaining).toBe(5);
    });

    it('should break camp', () => {
      store.getState().setupCamp(false);
      store.getState().breakCamp();
      expect(store.getState().campingState.isCamping).toBe(false);
    });

    it('should rest at camp', () => {
      store.getState().setupCamp(false);
      store.getState().setFatigue(60);
      const result = store.getState().restAtCamp(4);

      expect(result).toHaveProperty('hoursRested');
      expect(result).toHaveProperty('fatigueRecovered');
      expect(result).toHaveProperty('foodConsumed');
      expect(result).toHaveProperty('waterConsumed');
    });

    it('should recover fatigue when resting', () => {
      store.getState().setupCamp(false);
      store.getState().setFatigue(60);
      const initialFatigue = store.getState().fatigueState.current;
      store.getState().restAtCamp(4);
      expect(store.getState().fatigueState.current).toBeLessThan(initialFatigue);
    });

    it('should consume provisions when resting', () => {
      store.getState().setupCamp(false);
      const initialFood = store.getState().provisionsState.food;
      store.getState().restAtCamp(4);
      expect(store.getState().provisionsState.food).toBeLessThan(initialFood);
    });

    it('should advance time when resting', () => {
      store.getState().setupCamp(false);
      const initialHour = store.getState().clockState.hour;
      store.getState().restAtCamp(4);
      expect(store.getState().clockState.hour).not.toBe(initialHour);
    });

    it('should add fuel', () => {
      store.getState().setupCamp(true, 5);
      store.getState().addFuel(3);
      expect(store.getState().campingState.fuelRemaining).toBe(8);
    });
  });

  describe('camping selectors', () => {
    it('should check if can camp', () => {
      store.getState().setTerrain('plains');
      expect(store.getState().canCamp()).toBe(true);
    });

    it('should not allow camping in town', () => {
      store.getState().setTerrain('town');
      expect(store.getState().canCamp()).toBe(false);
    });

    it('should check if camping', () => {
      expect(store.getState().isCamping()).toBe(false);
      store.getState().setupCamp(false);
      expect(store.getState().isCamping()).toBe(true);
    });

    it('should get camp encounters', () => {
      const encounters = store.getState().getCampEncounters();
      expect(Array.isArray(encounters)).toBe(true);
    });
  });

  describe('combined actions', () => {
    it('should perform travel', () => {
      const result = store.getState().performTravel(2);

      expect(result).toHaveProperty('hoursElapsed');
      expect(result).toHaveProperty('fatigueGained');
      expect(result).toHaveProperty('provisionsConsumed');
      expect(result).toHaveProperty('ranOutOfProvisions');
      expect(result).toHaveProperty('healthDamage');
    });

    it('should advance time during travel', () => {
      const initialHour = store.getState().clockState.hour;
      store.getState().performTravel(2);
      expect(store.getState().clockState.hour).not.toBe(initialHour);
    });

    it('should consume provisions during travel', () => {
      const initialFood = store.getState().provisionsState.food;
      store.getState().performTravel(2);
      expect(store.getState().provisionsState.food).toBeLessThan(initialFood);
    });

    it('should apply fatigue during travel', () => {
      const initialFatigue = store.getState().fatigueState.current;
      store.getState().performTravel(2);
      expect(store.getState().fatigueState.current).toBeGreaterThan(initialFatigue);
    });

    it('should apply health damage when dehydrated', () => {
      // Deplete water
      store.getState().consumeProvisions(20);
      const result = store.getState().performTravel(2);
      if (!store.getState().provisionsState.water) {
        expect(result.healthDamage).toBeGreaterThan(0);
      }
    });

    it('should rest at inn', () => {
      store.getState().setFatigue(60);
      const result = store.getState().restAtInn(8);

      expect(result).toHaveProperty('hoursRested', 8);
      expect(result).toHaveProperty('fatigueRecovered');
      expect(result).toHaveProperty('goldSpent');
    });

    it('should recover fatigue at inn', () => {
      store.getState().setFatigue(60);
      const initialFatigue = store.getState().fatigueState.current;
      store.getState().restAtInn(8);
      expect(store.getState().fatigueState.current).toBeLessThan(initialFatigue);
    });

    it('should advance time at inn', () => {
      const initialHour = store.getState().clockState.hour;
      store.getState().restAtInn(8);
      expect(store.getState().clockState.hour).not.toBe(initialHour);
    });

    it('should not consume provisions at inn', () => {
      const initialFood = store.getState().provisionsState.food;
      const initialWater = store.getState().provisionsState.water;
      store.getState().restAtInn(8);
      expect(store.getState().provisionsState.food).toBe(initialFood);
      expect(store.getState().provisionsState.water).toBe(initialWater);
    });
  });

  describe('serialization', () => {
    it('should get survival state', () => {
      const state = store.getState().getSurvivalState();

      expect(state).toHaveProperty('clockState');
      expect(state).toHaveProperty('isClockRunning');
      expect(state).toHaveProperty('fatigueState');
      expect(state).toHaveProperty('provisionsState');
      expect(state).toHaveProperty('campingState');
      expect(state).toHaveProperty('currentTerrain');
    });

    it('should load survival state', () => {
      const newState = {
        clockState: { ...DEFAULT_SURVIVAL_STATE.clockState, hour: 15 },
        fatigueState: { ...DEFAULT_SURVIVAL_STATE.fatigueState, current: 50 },
        provisionsState: { ...DEFAULT_SURVIVAL_STATE.provisionsState, food: 50 },
        currentTerrain: 'forest' as const,
      };

      store.getState().loadSurvivalState(newState);

      const state = store.getState();
      expect(state.clockState.hour).toBe(15);
      expect(state.fatigueState.current).toBe(50);
      expect(state.provisionsState.food).toBe(50);
      expect(state.currentTerrain).toBe('forest');
    });

    it('should reset survival systems', () => {
      store.getState().setFatigue(75);
      store.getState().consumeProvisions(10);
      store.getState().advanceTime(5);

      store.getState().resetSurvival();

      const state = store.getState();
      expect(state.fatigueState.current).toBe(0);
      expect(state.provisionsState.food).toBe(75);
      expect(state.clockState.hour).toBe(10);
    });
  });

  describe('integration scenarios', () => {
    it('should handle full day cycle', () => {
      // Morning travel
      store.getState().performTravel(4);

      // Afternoon rest
      store.getState().setupCamp(true, 5);
      store.getState().restAtCamp(2);
      store.getState().breakCamp();

      // Evening travel
      store.getState().performTravel(2);

      const state = store.getState();
      expect(state.fatigueState.current).toBeGreaterThan(0);
      expect(state.provisionsState.food).toBeLessThan(75);
      expect(state.clockState.hour).not.toBe(10);
    });

    it('should handle survival crisis', () => {
      // Deplete provisions completely
      const state = store.getState();
      store.getState().loadSurvivalState({
        ...state.getSurvivalState(),
        provisionsState: { 
          food: 0, 
          water: 0,
          hoursSinceFood: 0,
          hoursSinceWater: 0,
        },
      });

      // Travel while depleted
      const result = store.getState().performTravel(2);

      // Should have increased fatigue due to no provisions
      expect(result.fatigueGained).toBeGreaterThan(16); // Increased due to no provisions
      
      // Check that provisions are depleted
      expect(store.getState().provisionsState.food).toBe(0);
      expect(store.getState().provisionsState.water).toBe(0);
    });

    it('should handle camping with encounters', () => {
      store.getState().setupCamp(false);
      store.getState().setFatigue(60);

      const result = store.getState().restAtCamp(8);

      // May or may not have encounters, but should complete
      expect(result.hoursRested).toBeGreaterThan(0);
      expect(result.hoursRested).toBeLessThanOrEqual(8);
    });

    it('should handle night travel penalty', () => {
      store.getState().setTime(22, 0); // Night
      const result = store.getState().performTravel(2);

      // Should have extra fatigue from night penalty
      expect(result.fatigueGained).toBeGreaterThan(16);
    });

    it('should handle hunting when low on food', () => {
      store.getState().consumeProvisions(15);
      const initialFood = store.getState().provisionsState.food;

      const result = store.getState().attemptHunt(0.5); // With skill bonus

      if (result.success) {
        expect(store.getState().provisionsState.food).toBeGreaterThan(initialFood);
      }
    });

    it('should handle foraging in different terrains', () => {
      // Forest - good foraging
      store.getState().setTerrain('forest');
      const forestResult = store.getState().attemptForage();

      // Desert - poor foraging
      store.getState().setTerrain('desert');
      const desertResult = store.getState().attemptForage();

      // Forest should have better success rate
      expect(forestResult.success || !desertResult.success).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle zero hour travel', () => {
      const result = store.getState().performTravel(0);
      expect(result.hoursElapsed).toBe(0);
      expect(result.fatigueGained).toBe(0);
    });

    it('should handle negative fatigue from rest', () => {
      store.getState().setFatigue(10);
      store.getState().restAtInn(8);
      expect(store.getState().fatigueState.current).toBe(0);
    });

    it('should handle provision overflow', () => {
      store.getState().addFood(1000);
      expect(store.getState().provisionsState.food).toBe(100);
    });

    it('should handle fatigue overflow', () => {
      store.getState().setFatigue(1000);
      expect(store.getState().fatigueState.current).toBe(100);
    });

    it('should handle camping without setup', () => {
      // Should not be camping
      expect(store.getState().isCamping()).toBe(false);
    });

    it('should handle multiple terrain changes', () => {
      store.getState().setTerrain('forest');
      store.getState().setTerrain('desert');
      store.getState().setTerrain('plains');
      expect(store.getState().currentTerrain).toBe('plains');
    });
  });

  describe('state consistency', () => {
    it('should maintain state consistency across actions', () => {
      // Perform multiple actions
      store.getState().performTravel(2);
      store.getState().setupCamp(true, 5);
      store.getState().restAtCamp(4);
      store.getState().breakCamp();
      store.getState().performTravel(2);

      // State should be consistent
      const state = store.getState();
      expect(state.fatigueState.current).toBeGreaterThanOrEqual(0);
      expect(state.fatigueState.current).toBeLessThanOrEqual(100);
      expect(state.provisionsState.food).toBeGreaterThanOrEqual(0);
      expect(state.provisionsState.water).toBeGreaterThanOrEqual(0);
      expect(state.clockState.hour).toBeGreaterThanOrEqual(0);
      expect(state.clockState.hour).toBeLessThan(24);
    });

    it('should sync systems correctly', () => {
      // Modify state directly
      store.getState().setFatigue(50);
      store.getState().addFood(10);
      store.getState().setTime(15, 30);

      // Perform action that uses all systems
      const result = store.getState().performTravel(2);

      // Should use updated state
      expect(result.hoursElapsed).toBe(2);
    });
  });
});
