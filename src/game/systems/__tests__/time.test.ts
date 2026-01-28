/**
 * time.test.ts - Tests for GameClock time system
 */

import {
    DEFAULT_CLOCK_STATE,
    GameClock,
    createGameClock,
    gameMinutesToRealMs,
    realMsToGameHours,
    realMsToGameMinutes
} from '../time';

describe('GameClock', () => {
  let clock: GameClock;

  beforeEach(() => {
    clock = new GameClock();
  });

  afterEach(() => {
    clock.dispose();
  });

  describe('initialization', () => {
    it('should create with default config', () => {
      expect(clock).toBeDefined();
      expect(clock.getHour()).toBe(DEFAULT_CLOCK_STATE.hour);
      expect(clock.getMinute()).toBe(DEFAULT_CLOCK_STATE.minute);
      expect(clock.getDay()).toBe(DEFAULT_CLOCK_STATE.day);
    });

    it('should create with custom initial state', () => {
      const customClock = new GameClock(undefined, {
        hour: 15,
        minute: 30,
        day: 5,
      });

      expect(customClock.getHour()).toBe(15);
      expect(customClock.getMinute()).toBe(30);
      expect(customClock.getDay()).toBe(5);

      customClock.dispose();
    });

    it('should start paused by default', () => {
      expect(clock.isPaused()).toBe(true);
    });

    it('should have correct initial phase', () => {
      // Default starts at 10 AM, which is day phase
      expect(clock.getPhase()).toBe('day');
    });
  });

  describe('time queries', () => {
    it('should get current hour', () => {
      expect(clock.getHour()).toBe(10);
    });

    it('should get current minute', () => {
      expect(clock.getMinute()).toBe(0);
    });

    it('should get current day', () => {
      expect(clock.getDay()).toBe(1);
    });

    it('should get total minutes', () => {
      expect(clock.getTotalMinutes()).toBe(10 * 60);
    });

    it('should get total hours', () => {
      expect(clock.getTotalHours()).toBe(10);
    });

    it('should get formatted time', () => {
      expect(clock.getFormattedTime()).toBe('10:00');
    });

    it('should get formatted date time', () => {
      expect(clock.getFormattedDateTime()).toBe('Day 1, 10:00');
    });

    it('should format time with leading zeros', () => {
      clock.setTime(5, 5);
      expect(clock.getFormattedTime()).toBe('05:05');
    });
  });

  describe('time phases', () => {
    it('should detect dawn phase (5-7)', () => {
      clock.setTime(6, 0);
      expect(clock.getPhase()).toBe('dawn');
    });

    it('should detect day phase (7-18)', () => {
      clock.setTime(12, 0);
      expect(clock.getPhase()).toBe('day');
    });

    it('should detect dusk phase (18-20)', () => {
      clock.setTime(19, 0);
      expect(clock.getPhase()).toBe('dusk');
    });

    it('should detect night phase (20-5)', () => {
      clock.setTime(22, 0);
      expect(clock.getPhase()).toBe('night');
    });

    it('should detect night phase before dawn', () => {
      clock.setTime(3, 0);
      expect(clock.getPhase()).toBe('night');
    });

    it('should check if night', () => {
      clock.setTime(22, 0);
      expect(clock.isNight()).toBe(true);
      expect(clock.isDay()).toBe(false);
    });

    it('should check if day', () => {
      clock.setTime(12, 0);
      expect(clock.isDay()).toBe(true);
      expect(clock.isNight()).toBe(false);
    });
  });

  describe('ambient light', () => {
    it('should return low light at night', () => {
      clock.setTime(22, 0);
      const light = clock.getAmbientLight();
      expect(light).toBeLessThan(0.5);
    });

    it('should return full light during day', () => {
      clock.setTime(12, 0);
      const light = clock.getAmbientLight();
      expect(light).toBe(1.0);
    });

    it('should return transitional light at dawn', () => {
      clock.setTime(6, 0);
      const light = clock.getAmbientLight();
      expect(light).toBeGreaterThan(0.2);
      expect(light).toBeLessThan(1.0);
    });

    it('should return transitional light at dusk', () => {
      clock.setTime(19, 0);
      const light = clock.getAmbientLight();
      expect(light).toBeGreaterThan(0.2);
      expect(light).toBeLessThan(1.0);
    });
  });

  describe('time advancement', () => {
    it('should advance time by minutes', () => {
      clock.advanceTime(30);
      expect(clock.getHour()).toBe(10);
      expect(clock.getMinute()).toBe(30);
    });

    it('should advance time by hours', () => {
      clock.advanceHours(2);
      expect(clock.getHour()).toBe(12);
      expect(clock.getMinute()).toBe(0);
    });

    it('should roll over to next hour', () => {
      clock.advanceTime(90); // 1.5 hours
      expect(clock.getHour()).toBe(11);
      expect(clock.getMinute()).toBe(30);
    });

    it('should roll over to next day', () => {
      clock.setTime(23, 0);
      clock.advanceHours(2);
      expect(clock.getDay()).toBe(2);
      expect(clock.getHour()).toBe(1);
    });

    it('should handle multiple day advancement', () => {
      clock.advanceHours(48);
      expect(clock.getDay()).toBe(3);
      expect(clock.getHour()).toBe(10);
    });

    it('should update total minutes', () => {
      const initialTotal = clock.getTotalMinutes();
      clock.advanceTime(120);
      expect(clock.getTotalMinutes()).toBe(initialTotal + 120);
    });

    it('should not advance negative time', () => {
      const initialHour = clock.getHour();
      clock.advanceTime(-10);
      expect(clock.getHour()).toBe(initialHour);
    });
  });

  describe('time setting', () => {
    it('should set time to specific hour', () => {
      clock.setTime(15, 45);
      expect(clock.getHour()).toBe(15);
      expect(clock.getMinute()).toBe(45);
    });

    it('should clamp hour to valid range', () => {
      clock.setTime(25, 0);
      expect(clock.getHour()).toBe(23);
    });

    it('should clamp minute to valid range', () => {
      clock.setTime(12, 70);
      expect(clock.getMinute()).toBe(59);
    });

    it('should handle negative values', () => {
      clock.setTime(-5, -10);
      expect(clock.getHour()).toBe(0);
      expect(clock.getMinute()).toBe(0);
    });

    it('should advance to specific hour in future', () => {
      clock.setTime(10, 0);
      clock.advanceToHour(15);
      expect(clock.getHour()).toBe(15);
    });

    it('should advance to next day if hour is in past', () => {
      clock.setTime(15, 0);
      clock.advanceToHour(10);
      expect(clock.getDay()).toBe(2);
      expect(clock.getHour()).toBe(10);
    });
  });

  describe('clock control', () => {
    it('should start clock', () => {
      clock.start();
      expect(clock.isPaused()).toBe(false);
    });

    it('should pause clock', () => {
      clock.start();
      clock.pause();
      expect(clock.isPaused()).toBe(true);
    });

    it('should resume clock', () => {
      clock.start();
      clock.pause();
      clock.resume();
      expect(clock.isPaused()).toBe(false);
    });

    it('should toggle clock', () => {
      expect(clock.isPaused()).toBe(true);
      clock.toggle();
      expect(clock.isPaused()).toBe(false);
      clock.toggle();
      expect(clock.isPaused()).toBe(true);
    });

    it('should not start if already running', () => {
      clock.start();
      const firstStart = clock.isPaused();
      clock.start();
      expect(clock.isPaused()).toBe(firstStart);
    });

    it('should not pause if already paused', () => {
      expect(clock.isPaused()).toBe(true);
      clock.pause();
      expect(clock.isPaused()).toBe(true);
    });
  });

  describe('event system', () => {
    it('should emit tick events', () => {
      const listener = jest.fn();
      clock.on('tick', listener);

      clock.advanceTime(1);

      expect(listener).toHaveBeenCalled();
    });

    it('should emit hourChanged events', () => {
      const listener = jest.fn();
      clock.on('hourChanged', listener);

      clock.advanceHours(1);

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          hour: 11,
          minute: 0,
          day: 1,
        })
      );
    });

    it('should emit phaseChanged events', () => {
      const listener = jest.fn();
      clock.on('phaseChanged', listener);

      clock.setTime(6, 0); // Dawn
      clock.advanceHours(2); // To day

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: 'day',
          previousPhase: 'dawn',
        })
      );
    });

    it('should emit dayChanged events', () => {
      const listener = jest.fn();
      clock.on('dayChanged', listener);

      clock.setTime(23, 0);
      clock.advanceHours(2);

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          day: 2,
        })
      );
    });

    it('should unsubscribe from events', () => {
      const listener = jest.fn();
      const unsubscribe = clock.on('tick', listener);

      unsubscribe();
      clock.advanceTime(1);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should remove specific event listeners', () => {
      const listener = jest.fn();
      clock.on('tick', listener);
      clock.off('tick', listener);

      clock.advanceTime(1);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should remove all listeners for event type', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      clock.on('tick', listener1);
      clock.on('tick', listener2);

      clock.removeAllListeners('tick');
      clock.advanceTime(1);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should remove all listeners', () => {
      const tickListener = jest.fn();
      const hourListener = jest.fn();
      clock.on('tick', tickListener);
      clock.on('hourChanged', hourListener);

      clock.removeAllListeners();
      clock.advanceHours(1);

      expect(tickListener).not.toHaveBeenCalled();
      expect(hourListener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = jest.fn(() => {
        throw new Error('Test error');
      });
      const normalListener = jest.fn();

      clock.on('tick', errorListener);
      clock.on('tick', normalListener);

      expect(() => {
        clock.advanceTime(1);
      }).not.toThrow();

      expect(normalListener).toHaveBeenCalled();
    });

    it('should not emit events when disabled', () => {
      const listener = jest.fn();
      clock.on('tick', listener);

      clock.advanceTime(60, false);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('serialization', () => {
    it('should get state', () => {
      const state = clock.getState();

      expect(state).toHaveProperty('hour');
      expect(state).toHaveProperty('minute');
      expect(state).toHaveProperty('day');
      expect(state).toHaveProperty('isPaused');
      expect(state).toHaveProperty('totalMinutes');
    });

    it('should load state', () => {
      const newState = {
        hour: 15,
        minute: 30,
        day: 5,
        isPaused: false,
        totalMinutes: 1000,
      };

      clock.loadState(newState);

      expect(clock.getHour()).toBe(15);
      expect(clock.getMinute()).toBe(30);
      expect(clock.getDay()).toBe(5);
    });

    it('should reset to default state', () => {
      clock.advanceHours(10);
      clock.reset();

      expect(clock.getHour()).toBe(DEFAULT_CLOCK_STATE.hour);
      expect(clock.getMinute()).toBe(DEFAULT_CLOCK_STATE.minute);
      expect(clock.getDay()).toBe(DEFAULT_CLOCK_STATE.day);
      expect(clock.isPaused()).toBe(true);
    });
  });

  describe('disposal', () => {
    it('should clean up resources', () => {
      const listener = jest.fn();
      clock.on('tick', listener);
      clock.start();

      clock.dispose();

      expect(clock.isPaused()).toBe(true);
    });

    it('should remove all listeners on dispose', () => {
      const listener = jest.fn();
      clock.on('tick', listener);

      clock.dispose();
      clock.advanceTime(1);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});

describe('utility functions', () => {
  describe('createGameClock', () => {
    it('should create clock with default state', () => {
      const clock = createGameClock();
      expect(clock.getHour()).toBe(DEFAULT_CLOCK_STATE.hour);
      clock.dispose();
    });

    it('should create clock with custom state', () => {
      const clock = createGameClock({ hour: 20, minute: 30 });
      expect(clock.getHour()).toBe(20);
      expect(clock.getMinute()).toBe(30);
      clock.dispose();
    });
  });

  describe('time conversion', () => {
    it('should convert real ms to game minutes', () => {
      const gameMinutes = realMsToGameMinutes(2000);
      expect(gameMinutes).toBe(1);
    });

    it('should convert game minutes to real ms', () => {
      const realMs = gameMinutesToRealMs(1);
      expect(realMs).toBe(2000);
    });

    it('should convert real ms to game hours', () => {
      const gameHours = realMsToGameHours(120000);
      expect(gameHours).toBe(1);
    });

    it('should handle fractional conversions', () => {
      const gameMinutes = realMsToGameMinutes(1000);
      expect(gameMinutes).toBe(0.5);
    });
  });
});
