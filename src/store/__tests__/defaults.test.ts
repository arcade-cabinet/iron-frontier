/**
 * Tests for store defaults
 */

import { describe, expect, it } from '@jest/globals';
import {
  DEFAULT_CAMERA_STATE,
  DEFAULT_EQUIPMENT,
  DEFAULT_PLAYER_STATS,
  DEFAULT_SETTINGS,
  DEFAULT_TIME,
  DEFAULT_WEATHER,
  DEFAULT_WORLD_POSITION,
  SAVE_VERSION,
  STORAGE_KEY,
} from '../defaults';

describe('Store Defaults', () => {
  describe('DEFAULT_PLAYER_STATS', () => {
    it('should have health equal to maxHealth', () => {
      expect(DEFAULT_PLAYER_STATS.health).toBe(DEFAULT_PLAYER_STATS.maxHealth);
    });

    it('should have stamina equal to maxStamina', () => {
      expect(DEFAULT_PLAYER_STATS.stamina).toBe(DEFAULT_PLAYER_STATS.maxStamina);
    });

    it('should start at level 1', () => {
      expect(DEFAULT_PLAYER_STATS.level).toBe(1);
    });

    it('should have positive xpToNext', () => {
      expect(DEFAULT_PLAYER_STATS.xpToNext).toBeGreaterThan(0);
    });

    it('should have some starting gold', () => {
      expect(DEFAULT_PLAYER_STATS.gold).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_EQUIPMENT', () => {
    it('should have all slots empty', () => {
      expect(DEFAULT_EQUIPMENT.weapon).toBeNull();
      expect(DEFAULT_EQUIPMENT.offhand).toBeNull();
      expect(DEFAULT_EQUIPMENT.head).toBeNull();
      expect(DEFAULT_EQUIPMENT.body).toBeNull();
      expect(DEFAULT_EQUIPMENT.accessory).toBeNull();
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    it('should have reasonable volume defaults', () => {
      expect(DEFAULT_SETTINGS.musicVolume).toBeGreaterThan(0);
      expect(DEFAULT_SETTINGS.musicVolume).toBeLessThanOrEqual(1);
      expect(DEFAULT_SETTINGS.sfxVolume).toBeGreaterThan(0);
      expect(DEFAULT_SETTINGS.sfxVolume).toBeLessThanOrEqual(1);
    });

    it('should have default control mode', () => {
      expect(['tap', 'joystick']).toContain(DEFAULT_SETTINGS.controlMode);
    });
  });

  describe('DEFAULT_TIME', () => {
    it('should be a valid time of day', () => {
      expect(DEFAULT_TIME.hour).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_TIME.hour).toBeLessThan(24);
    });

    it('should be a valid day of year', () => {
      expect(DEFAULT_TIME.dayOfYear).toBeGreaterThanOrEqual(1);
      expect(DEFAULT_TIME.dayOfYear).toBeLessThanOrEqual(365);
    });

    it('should be in a reasonable year', () => {
      expect(DEFAULT_TIME.year).toBeGreaterThan(1800);
      expect(DEFAULT_TIME.year).toBeLessThan(1920);
    });
  });

  describe('DEFAULT_WEATHER', () => {
    it('should have a valid weather type', () => {
      expect(['clear', 'cloudy', 'dusty', 'stormy']).toContain(DEFAULT_WEATHER.type);
    });
  });

  describe('DEFAULT_CAMERA_STATE', () => {
    it('should have valid distance bounds', () => {
      expect(DEFAULT_CAMERA_STATE.distance).toBeGreaterThanOrEqual(
        DEFAULT_CAMERA_STATE.minDistance
      );
      expect(DEFAULT_CAMERA_STATE.distance).toBeLessThanOrEqual(DEFAULT_CAMERA_STATE.maxDistance);
    });

    it('should have valid elevation bounds', () => {
      expect(DEFAULT_CAMERA_STATE.elevation).toBeGreaterThanOrEqual(
        DEFAULT_CAMERA_STATE.minElevation
      );
      expect(DEFAULT_CAMERA_STATE.elevation).toBeLessThanOrEqual(DEFAULT_CAMERA_STATE.maxElevation);
    });

    it('should not be in cutscene by default', () => {
      expect(DEFAULT_CAMERA_STATE.isInCutscene).toBe(false);
    });
  });

  describe('DEFAULT_WORLD_POSITION', () => {
    it('should have valid coordinates', () => {
      expect(DEFAULT_WORLD_POSITION.x).toBeGreaterThan(0);
      expect(DEFAULT_WORLD_POSITION.z).toBeGreaterThan(0);
    });
  });

  describe('Constants', () => {
    it('should have a valid save version', () => {
      expect(SAVE_VERSION).toBeGreaterThan(0);
    });

    it('should have a non-empty storage key', () => {
      expect(STORAGE_KEY).toBeTruthy();
      expect(STORAGE_KEY.length).toBeGreaterThan(0);
    });
  });
});
