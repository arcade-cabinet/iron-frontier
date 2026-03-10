import type { TerrainType } from '../provisions';
import type { RestDuration } from '../camping';
import type { SurvivalContext, SurvivalSlice } from './types';

export const createCampingActions = (ctx: SurvivalContext) => ({
  setTerrain: (terrain: TerrainType) => {
    ctx.set({ currentTerrain: terrain });
  },

  setupCamp: (withFire: boolean, fuelAmount = 5) => {
    ctx.syncSystems();
    const currentTime = ctx.systems.clock.getTotalMinutes();
    ctx.systems.camping.setupCamp(withFire, fuelAmount, currentTime);
    ctx.set({ campingState: ctx.systems.camping.getState() });
  },

  breakCamp: () => {
    ctx.syncSystems();
    ctx.systems.camping.breakCamp();
    ctx.set({ campingState: ctx.systems.camping.getState() });
  },

  restAtCamp: (duration: RestDuration) => {
    ctx.syncSystems();
    const terrain = ctx.get().currentTerrain;

    const result = ctx.systems.camping.rest(
      duration,
      ctx.systems.fatigue,
      ctx.systems.provisions,
      ctx.systems.clock,
      terrain
    );

    ctx.set({
      campingState: ctx.systems.camping.getState(),
      fatigueState: ctx.systems.fatigue.getState(),
      provisionsState: ctx.systems.provisions.getState(),
      clockState: ctx.systems.clock.getState(),
    });

    // Heal some HP while camping (5 HP per hour rested)
    const healAmount = result.hoursRested * 5;
    if (healAmount > 0) {
      const store = ctx.get() as SurvivalSlice & { heal?: (amount: number) => void };
      store.heal?.(healAmount);
    }

    return result;
  },

  addFuel: (amount: number) => {
    ctx.syncSystems();
    ctx.systems.camping.addFuel(amount);
    ctx.set({ campingState: ctx.systems.camping.getState() });
  },
});
