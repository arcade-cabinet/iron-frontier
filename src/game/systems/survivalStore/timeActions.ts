import type { SurvivalContext, SurvivalSlice } from './types';

export const createTimeActions = (ctx: SurvivalContext) => ({
  startClock: () => {
    ctx.syncSystems();
    ctx.systems.clock.start();
    ctx.set({ isClockRunning: true });
  },

  pauseClock: () => {
    ctx.systems.clock.pause();
    ctx.set({ isClockRunning: false, clockState: ctx.systems.clock.getState() });
  },

  toggleClock: () => {
    ctx.syncSystems();
    ctx.systems.clock.toggle();
    ctx.set({
      isClockRunning: !ctx.systems.clock.isPaused(),
      clockState: ctx.systems.clock.getState(),
    });
  },

  advanceTime: (hours: number) => {
    ctx.syncSystems();
    ctx.systems.clock.advanceHours(hours);

    const isNight = ctx.systems.clock.isNight();
    if (isNight) {
      ctx.systems.fatigue.applyNightFatigue(ctx.gameHoursToRealMinutes(hours));
    }

    ctx.set({
      clockState: ctx.systems.clock.getState(),
      fatigueState: ctx.systems.fatigue.getState(),
    });
  },

  setTime: (hour: number, minute = 0) => {
    ctx.syncSystems();
    ctx.systems.clock.setTime(hour, minute);
    ctx.set({ clockState: ctx.systems.clock.getState() });
  },

  tickClock: () => {
    if (!ctx.get().isClockRunning) return;

    // Read the clock's current state -- it advances via its own internal
    // interval (clock.start()). We must NOT call syncSystems() here because
    // that overwrites the clock's internally-advanced totalMinutes with the
    // stale store value, preventing time from ever progressing.
    const nextClock = ctx.systems.clock.getState();
    ctx.set((state) => {
      const timeState = (state as { time?: { hour: number; dayOfYear: number } }).time;
      return {
        clockState: nextClock,
        ...(timeState && {
          time: {
            ...timeState,
            hour: nextClock.hour,
            dayOfYear: nextClock.day,
          },
        }),
      } as Partial<SurvivalSlice>;
    });
  },
});
