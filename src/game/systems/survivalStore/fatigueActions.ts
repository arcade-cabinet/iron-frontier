import type { SurvivalContext } from './types';

export const createFatigueActions = (ctx: SurvivalContext) => ({
  applyTravelFatigue: (hours: number) => {
    ctx.syncSystems();
    const isNight = ctx.systems.clock.isNight();
    const provisionMultiplier = ctx.systems.provisions.getFatigueMultiplier();
    const realMinutes = ctx.gameHoursToRealMinutes(hours);

    ctx.systems.fatigue.applyTravelFatigue(realMinutes, isNight);

    if (provisionMultiplier > 1) {
      const baseFatiguePerRealMin = 2;
      const extraFatigue = realMinutes * baseFatiguePerRealMin * (provisionMultiplier - 1);
      ctx.systems.fatigue.addFatigue(extraFatigue);
    }

    ctx.set({ fatigueState: ctx.systems.fatigue.getState() });
  },

  applyCombatFatigue: (realMinutes = 1) => {
    ctx.syncSystems();
    ctx.systems.fatigue.applyCombatFatigue(realMinutes);
    ctx.set({ fatigueState: ctx.systems.fatigue.getState() });
  },

  applyItemRest: (amount = 1) => {
    ctx.syncSystems();
    ctx.systems.fatigue.applyItemRest(amount);
    ctx.set({ fatigueState: ctx.systems.fatigue.getState() });
  },

  setFatigue: (value: number) => {
    ctx.syncSystems();
    ctx.systems.fatigue.setFatigue(value);
    ctx.set({ fatigueState: ctx.systems.fatigue.getState() });
  },

  fullRest: () => {
    ctx.syncSystems();
    ctx.systems.fatigue.fullRest();
    ctx.set({ fatigueState: ctx.systems.fatigue.getState() });
  },
});
