/**
 * GameClock Unit Tests
 *
 * @module systems/__tests__/time
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GameClock,
  createGameClock,
  realMsToGameMinutes,
  gameMinutesToRealMs,
  realMsToGameHours,
  DEFAULT_CLOCK_CONFIG,
  DEFAULT_CLOCK_STATE,
  type TimePhase,
} from '../time';

describe('GameClock', () => {
  let clock: GameClock;

  beforeEach(() => {
    clock = new GameClock();
    vi.useFakeTimers();
  });

  afterEach(() => {
    clock.dispose();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should create with default state', () => {
      expect(clock.getHour()).toBe(DEFAULT_CLOCK_STATE.hour);
      expect(clock.getMinute()).toBe(DEFAULT_CLOCK_STATE.minute);
      expect(clock.getDay()).toBe(DEFAULT_CLOCK_STATE.day);
      expect(clock.isPaused()).toBe(true);
    });

    it('should create with custom initial state', () => {
      const customClock = new GameClock(undefined, {
        hour: 14,
        minute: 30,
        day: 5,
      });
      expect(customClock.getHour()).toBe(14);
      expect(customClock.getMinute()).toBe(30);
      expect(customClock.getDay()).toBe(5);
      customClock.dispose();
    });

    it('should create with custom config', () => {
      const customClock = new GameClock({
        msPerGameMinute: 1000,
      });
      expect(customClock).toBeDefined();
      customClock.dispose();
    });
  });

  describe('time queries', () => {
    it('should return formatted time', () => {
      clock.setTime(9, 5);
      expect(clock.getFormattedTime()).toBe('09:05');

      clock.setTime(14, 30);
      expect(clock.getFormattedTime()).toBe('14:30');
    });

    it('should return formatted date time', () => {
      clock.setTime(10, 0);
      expect(clock.getFormattedDateTime()).toBe('Day 1, 10:00');
    });

    it('should calculate total minutes correctly', () => {
      const customClock = new GameClock(undefined, {
        hour: 2,
        minute: 30,
        day: 1,
        isPaused: true,
        totalMinutes: 2 * 60 + 30,
      });
      expect(customClock.getTotalMinutes()).toBe(150);
      customClock.dispose();
    });

    it('should calculate total hours correctly', () => {
      const customClock = new GameClock(undefined, {
        hour: 3,
        minute: 0,
        day: 1,
        isPaused: true,
        totalMinutes: 180,
      });
      expect(customClock.getTotalHours()).toBe(3);
      customClock.dispose();
    });
  });

  describe('time phases', () => {
    it('should detect dawn phase (5-7)', () => {
      clock.setTime(5, 0);
      expect(clock.getPhase()).toBe('dawn');

      clock.setTime(6, 30);
      expect(clock.getPhase()).toBe('dawn');
    });

    it('should detect day phase (7-18)', () => {
      clock.setTime(7, 0);
      expect(clock.getPhase()).toBe('day');

      clock.setTime(12, 0);
      expect(clock.getPhase()).toBe('day');

      clock.setTime(17, 59);
      expect(clock.getPhase()).toBe('day');
    });

    it('should detect dusk phase (18-20)', () => {
      clock.setTime(18, 0);
      expect(clock.getPhase()).toBe('dusk');

      clock.setTime(19, 30);
      expect(clock.getPhase()).toBe('dusk');
    });

    it('should detect night phase (20-5)', () => {
      clock.setTime(20, 0);
      expect(clock.getPhase()).toBe('night');

      clock.setTime(23, 0);
      expect(clock.getPhase()).toBe('night');

      clock.setTime(2, 0);
      expect(clock.getPhase()).toBe('night');

      clock.setTime(4, 59);
      expect(clock.getPhase()).toBe('night');
    });

    it('should identify night correctly', () => {
      clock.setTime(22, 0);
      expect(clock.isNight()).toBe(true);

      clock.setTime(12, 0);
      expect(clock.isNight()).toBe(false);
    });

    it('should identify day correctly', () => {
      clock.setTime(12, 0);
      expect(clock.isDay()).toBe(true);

      clock.setTime(22, 0);
      expect(clock.isDay()).toBe(false);
    });
  });

  describe('ambient light', () => {
    it('should return low light at night', () => {
      clock.setTime(2, 0);
      expect(clock.getAmbientLight()).toBe(0.2);
    });

    it('should return full light during day', () => {
      clock.setTime(12, 0);
      expect(clock.getAmbientLight()).toBe(1.0);
    });

    it('should return transitional light during dawn', () => {
      clock.setTime(6, 0);
      const light = clock.getAmbientLight();
      expect(light).toBeGreaterThan(0.2);
      expect(light).toBeLessThan(1.0);
    });

    it('should return transitional light during dusk', () => {
      clock.setTime(19, 0);
      const light = clock.getAmbientLight();
      expect(light).toBeGreaterThan(0.2);
      expect(light).toBeLessThan(1.0);
    });
  });

  describe('time control', () => {
    it('should start and pause clock', () => {
      expect(clock.isPaused()).toBe(true);

      clock.start();
      expect(clock.isPaused()).toBe(false);

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

    it('should advance time by minutes', () => {
      clock.setTime(10, 0);
      clock.advanceTime(90); // 90 minutes
      expect(clock.getHour()).toBe(11);
      expect(clock.getMinute()).toBe(30);
    });

    it('should advance time by hours', () => {
      clock.setTime(10, 0);
      clock.advanceHours(5);
      expect(clock.getHour()).toBe(15);
    });

    it('should wrap to next day', () => {
      clock.setTime(22, 0);
      clock.advanceHours(4);
      expect(clock.getHour()).toBe(2);
      expect(clock.getDay()).toBe(2);
    });

    it('should advance to specific hour (future)', () => {
      clock.setTime(10, 0);
      clock.advanceToHour(14);
      expect(clock.getHour()).toBe(14);
      expect(clock.getDay()).toBe(1);
    });

    it('should advance to specific hour (past - next day)', () => {
      clock.setTime(14, 0);
      clock.advanceToHour(10);
      expect(clock.getHour()).toBe(10);
      expect(clock.getDay()).toBe(2);
    });

    it('should set time directly', () => {
      clock.setTime(15, 45);
      expect(clock.getHour()).toBe(15);
      expect(clock.getMinute()).toBe(45);
    });

    it('should clamp time values', () => {
      clock.setTime(25, 70);
      expect(clock.getHour()).toBe(23);
      expect(clock.getMinute()).toBe(59);

      clock.setTime(-5, -10);
      expect(clock.getHour()).toBe(0);
      expect(clock.getMinute()).toBe(0);
    });
  });

  describe('event system', () => {
    it('should emit hourChanged events', () => {
      const callback = vi.fn();
      clock.on('hourChanged', callback);

      clock.setTime(10, 0);
      clock.advanceHours(1);

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0].hour).toBe(11);
    });

    it('should emit phaseChanged events', () => {
      // Start fresh at a time in dusk phase
      clock.setTime(18, 0); // Dusk starts at 18

      const callback = vi.fn();
      clock.on('phaseChanged', callback);

      clock.advanceTime(125); // 125 minutes = 2 hours 5 min, should cross into night at 20:05

      expect(callback).toHaveBeenCalled();
      // Find the call that has night phase
      const nightCall = callback.mock.calls.find((call: any) => call[0].phase === 'night');
      expect(nightCall).toBeDefined();
      if (nightCall) {
        expect(nightCall[0].previousPhase).toBe('dusk');
      }
    });

    it('should emit dayChanged events', () => {
      const callback = vi.fn();
      clock.on('dayChanged', callback);

      clock.setTime(23, 30);
      clock.advanceHours(1);

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0].day).toBe(2);
    });

    it('should remove listeners', () => {
      const callback = vi.fn();
      const unsubscribe = clock.on('hourChanged', callback);

      clock.advanceHours(1);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      clock.advanceHours(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should remove all listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      clock.on('hourChanged', callback1);
      clock.on('phaseChanged', callback2);

      clock.removeAllListeners();

      clock.advanceHours(10);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('serialization', () => {
    it('should get state for saving', () => {
      clock.setTime(14, 30);
      const state = clock.getState();

      expect(state.hour).toBe(14);
      expect(state.minute).toBe(30);
      expect(state.isPaused).toBe(true);
    });

    it('should load state', () => {
      clock.loadState({
        hour: 18,
        minute: 15,
        day: 3,
      });

      expect(clock.getHour()).toBe(18);
      expect(clock.getMinute()).toBe(15);
      expect(clock.getDay()).toBe(3);
    });

    it('should reset to defaults', () => {
      clock.setTime(20, 45);
      clock.advanceHours(100);

      clock.reset();

      expect(clock.getHour()).toBe(DEFAULT_CLOCK_STATE.hour);
      expect(clock.getDay()).toBe(DEFAULT_CLOCK_STATE.day);
      expect(clock.isPaused()).toBe(true);
    });
  });
});

describe('utility functions', () => {
  describe('realMsToGameMinutes', () => {
    it('should convert real ms to game minutes', () => {
      // Default: 2000ms = 1 game minute
      expect(realMsToGameMinutes(2000)).toBe(1);
      expect(realMsToGameMinutes(120000)).toBe(60); // 2 real minutes = 1 game hour
    });
  });

  describe('gameMinutesToRealMs', () => {
    it('should convert game minutes to real ms', () => {
      expect(gameMinutesToRealMs(1)).toBe(2000);
      expect(gameMinutesToRealMs(60)).toBe(120000);
    });
  });

  describe('realMsToGameHours', () => {
    it('should convert real ms to game hours', () => {
      expect(realMsToGameHours(120000)).toBe(1); // 2 real minutes = 1 game hour
      expect(realMsToGameHours(240000)).toBe(2);
    });
  });

  describe('createGameClock', () => {
    it('should create a clock with defaults', () => {
      const clock = createGameClock();
      expect(clock.getHour()).toBe(DEFAULT_CLOCK_STATE.hour);
      clock.dispose();
    });

    it('should create a clock with initial state', () => {
      const clock = createGameClock({ hour: 15, minute: 30 });
      expect(clock.getHour()).toBe(15);
      expect(clock.getMinute()).toBe(30);
      clock.dispose();
    });
  });
});
