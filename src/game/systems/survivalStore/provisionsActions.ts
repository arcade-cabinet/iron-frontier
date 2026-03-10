import type { SurvivalContext } from './types';

export const createProvisionsActions = (ctx: SurvivalContext) => ({
  consumeProvisions: (hours: number) => {
    ctx.syncSystems();
    const result = ctx.systems.provisions.consumeForTravel(hours);
    ctx.set({ provisionsState: ctx.systems.provisions.getState() });
    return result;
  },

  addFood: (amount: number) => {
    ctx.syncSystems();
    ctx.systems.provisions.addFood(amount);
    ctx.set({ provisionsState: ctx.systems.provisions.getState() });
  },

  addWater: (amount: number) => {
    ctx.syncSystems();
    ctx.systems.provisions.addWater(amount);
    ctx.set({ provisionsState: ctx.systems.provisions.getState() });
  },

  addProvisions: (food: number, water: number) => {
    ctx.syncSystems();
    ctx.systems.provisions.addProvisions(food, water);
    ctx.set({ provisionsState: ctx.systems.provisions.getState() });
  },

  refillProvisions: () => {
    ctx.syncSystems();
    ctx.systems.provisions.refillAll();
    ctx.set({ provisionsState: ctx.systems.provisions.getState() });
  },

  attemptHunt: (skillModifier = 0) => {
    ctx.syncSystems();
    const result = ctx.systems.provisions.attemptHunt(skillModifier);

    ctx.systems.fatigue.addFatigue(result.fatigueCost);
    ctx.systems.clock.advanceHours(result.timeSpent);

    ctx.set({
      provisionsState: ctx.systems.provisions.getState(),
      fatigueState: ctx.systems.fatigue.getState(),
      clockState: ctx.systems.clock.getState(),
    });

    return result;
  },

  attemptForage: () => {
    ctx.syncSystems();
    const terrain = ctx.get().currentTerrain;
    const result = ctx.systems.provisions.attemptForage(terrain);

    ctx.systems.clock.advanceHours(result.timeSpent);

    ctx.set({
      provisionsState: ctx.systems.provisions.getState(),
      clockState: ctx.systems.clock.getState(),
    });

    return result;
  },
});
