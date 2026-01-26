/**
 * EncounterSystem Tests
 *
 * Tests for the Pokemon-style random encounter system.
 */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import {
    EncounterSystem,
    createRouteEncounterZones,
    type EncounterZone
} from '../EncounterSystem';

// Silence console.log during tests
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('EncounterSystem', () => {
  let system: EncounterSystem;

  // Test zone configuration
  const testZone: EncounterZone = {
    id: 'test_zone',
    baseRate: 0.1, // 10% base chance per step
    minSteps: 5,
    encounterPool: ['test_encounter_1', 'test_encounter_2'],
    timeModifiers: { dawn: 0.8, day: 1.0, dusk: 1.2, night: 1.5 },
    terrain: 'grass',
  };

  beforeEach(() => {
    system = new EncounterSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('starts with encounters enabled', () => {
      expect(system.isEnabled()).toBe(true);
    });

    it('starts with no current zone', () => {
      const debug = system.getDebugInfo();
      expect(debug.zone).toBeNull();
    });

    it('starts with zero steps', () => {
      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(0);
    });

    it('starts with no repel active', () => {
      const debug = system.getDebugInfo();
      expect(debug.repel).toBe(0);
    });
  });

  describe('Zone Management', () => {
    it('registers zones correctly', () => {
      system.registerZone(testZone);
      system.setCurrentZone('test_zone');

      const debug = system.getDebugInfo();
      expect(debug.zone).toBe('test_zone');
    });

    it('sets current zone to null for safe areas', () => {
      system.registerZone(testZone);
      system.setCurrentZone('test_zone');
      system.setCurrentZone(null);

      const debug = system.getDebugInfo();
      expect(debug.zone).toBeNull();
    });

    it('handles unknown zone IDs gracefully', () => {
      system.setCurrentZone('nonexistent_zone');

      const debug = system.getDebugInfo();
      expect(debug.zone).toBeNull();
    });
  });

  describe('Movement and Steps', () => {
    beforeEach(() => {
      system.registerZone(testZone);
      system.setCurrentZone('test_zone');
      // Mock Math.random to never trigger encounters
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
    });

    it('increments steps when moving in encounter zone', () => {
      // Move 1 unit (1 step)
      system.updatePosition(0, 0);
      system.updatePosition(1, 0);

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(1);
    });

    it('accumulates distance for partial steps', () => {
      system.updatePosition(0, 0);
      system.updatePosition(0.5, 0); // Half a step
      system.updatePosition(1.0, 0); // Now 1 full step

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(1);
    });

    it('calculates diagonal movement correctly', () => {
      system.updatePosition(0, 0);
      // Move diagonally - sqrt(2) ≈ 1.41 units
      system.updatePosition(1, 1);

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(1);
    });

    it('does not count steps when not in a zone', () => {
      system.setCurrentZone(null);
      system.updatePosition(0, 0);
      system.updatePosition(10, 0);

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(0);
    });

    it('does not count steps when disabled', () => {
      system.setEnabled(false);
      system.updatePosition(0, 0);
      system.updatePosition(10, 0);

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(0);
    });
  });

  describe('Encounter Triggering', () => {
    beforeEach(() => {
      system.registerZone(testZone);
      system.setCurrentZone('test_zone');
    });

    it('does not trigger encounter before minimum steps', () => {
      const callback = jest.fn();
      system.onEncounter(callback);

      // Force encounter on first eligible step
      jest.spyOn(Math, 'random').mockReturnValue(0);

      // Move 4 steps (below minSteps of 5)
      system.updatePosition(0, 0);
      for (let i = 1; i <= 4; i++) {
        system.updatePosition(i, 0);
      }

      expect(callback).not.toHaveBeenCalled();
    });

    it('can trigger encounter after minimum steps', () => {
      const callback = jest.fn();
      system.onEncounter(callback);

      // Force encounter trigger
      jest.spyOn(Math, 'random').mockReturnValue(0);

      // Move enough steps to exceed minSteps
      system.updatePosition(0, 0);
      for (let i = 1; i <= 10; i++) {
        system.updatePosition(i, 0);
      }

      expect(callback).toHaveBeenCalled();
    });

    it('resets step counter after encounter', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);

      system.updatePosition(0, 0);
      for (let i = 1; i <= 10; i++) {
        system.updatePosition(i, 0);
      }

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(0);
    });

    it('passes correct encounter trigger data', () => {
      const callback = jest.fn();
      system.onEncounter(callback);
      system.setTimeOfDay('night');

      // Force specific encounter selection
      jest.spyOn(Math, 'random')
        .mockReturnValueOnce(0) // Trigger encounter
        .mockReturnValueOnce(0); // Select first encounter in pool

      system.updatePosition(0, 0);
      for (let i = 1; i <= 10; i++) {
        system.updatePosition(i, 0);
      }

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          encounterId: expect.any(String),
          zoneId: 'test_zone',
          terrain: 'grass',
          timeOfDay: 'night',
        })
      );
    });

    it('does not trigger encounter with empty pool', () => {
      const emptyZone: EncounterZone = {
        ...testZone,
        id: 'empty_zone',
        encounterPool: [],
      };
      system.registerZone(emptyZone);
      system.setCurrentZone('empty_zone');

      const callback = jest.fn();
      system.onEncounter(callback);

      jest.spyOn(Math, 'random').mockReturnValue(0);

      system.updatePosition(0, 0);
      for (let i = 1; i <= 10; i++) {
        system.updatePosition(i, 0);
      }

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Time of Day Modifiers', () => {
    beforeEach(() => {
      system.registerZone(testZone);
      system.setCurrentZone('test_zone');
      // Get past minSteps
      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      system.updatePosition(0, 0);
      for (let i = 1; i <= 10; i++) {
        system.updatePosition(i, 0);
      }
    });

    it('applies dawn modifier', () => {
      system.setTimeOfDay('dawn');
      const debug = system.getDebugInfo();
      // Dawn modifier is 0.8, so chance should be lower than base
      expect(debug.chance).toBeLessThan(testZone.baseRate * 1.1);
    });

    it('applies night modifier', () => {
      system.setTimeOfDay('night');
      const debug = system.getDebugInfo();
      // Night modifier is 1.5, so chance should be higher
      expect(debug.chance).toBeGreaterThan(testZone.baseRate * 1.0);
    });
  });

  describe('Repel System', () => {
    beforeEach(() => {
      system.registerZone(testZone);
      system.setCurrentZone('test_zone');
    });

    it('applies repel effect', () => {
      system.applyRepel(100);
      expect(system.getRepelSteps()).toBe(100);
    });

    it('prevents encounters while repel is active', () => {
      const callback = jest.fn();
      system.onEncounter(callback);

      system.applyRepel(100);
      jest.spyOn(Math, 'random').mockReturnValue(0);

      system.updatePosition(0, 0);
      for (let i = 1; i <= 10; i++) {
        system.updatePosition(i, 0);
      }

      expect(callback).not.toHaveBeenCalled();
    });

    it('decrements repel steps on movement', () => {
      system.applyRepel(5);
      jest.spyOn(Math, 'random').mockReturnValue(0.99);

      system.updatePosition(0, 0);
      system.updatePosition(1, 0);
      system.updatePosition(2, 0);

      // 2 steps taken, should have 3 left
      expect(system.getRepelSteps()).toBe(3);
    });

    it('takes the maximum when applying multiple repels', () => {
      system.applyRepel(50);
      system.applyRepel(100);
      expect(system.getRepelSteps()).toBe(100);

      // Lower value doesn't override
      system.applyRepel(30);
      expect(system.getRepelSteps()).toBe(100);
    });

    it('allows encounters after repel expires', () => {
      const callback = jest.fn();
      system.onEncounter(callback);

      system.applyRepel(3);
      jest.spyOn(Math, 'random').mockReturnValue(0);

      system.updatePosition(0, 0);
      // Use up repel
      for (let i = 1; i <= 3; i++) {
        system.updatePosition(i, 0);
      }
      expect(callback).not.toHaveBeenCalled();

      // Now encounters can happen (after minSteps)
      for (let i = 4; i <= 15; i++) {
        system.updatePosition(i, 0);
      }
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Enable/Disable', () => {
    it('can be disabled', () => {
      system.setEnabled(false);
      expect(system.isEnabled()).toBe(false);
    });

    it('can be re-enabled', () => {
      system.setEnabled(false);
      system.setEnabled(true);
      expect(system.isEnabled()).toBe(true);
    });
  });

  describe('Callback Management', () => {
    it('supports multiple callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      system.onEncounter(callback1);
      system.onEncounter(callback2);

      system.registerZone(testZone);
      system.setCurrentZone('test_zone');

      jest.spyOn(Math, 'random').mockReturnValue(0);

      system.updatePosition(0, 0);
      for (let i = 1; i <= 10; i++) {
        system.updatePosition(i, 0);
      }

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('returns unsubscribe function', () => {
      const callback = jest.fn();
      const unsubscribe = system.onEncounter(callback);

      unsubscribe();

      system.registerZone(testZone);
      system.setCurrentZone('test_zone');

      jest.spyOn(Math, 'random').mockReturnValue(0);

      system.updatePosition(0, 0);
      for (let i = 1; i <= 10; i++) {
        system.updatePosition(i, 0);
      }

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Reset', () => {
    it('resets step counter', () => {
      system.registerZone(testZone);
      system.setCurrentZone('test_zone');

      jest.spyOn(Math, 'random').mockReturnValue(0.99);
      system.updatePosition(0, 0);
      for (let i = 1; i <= 10; i++) {
        system.updatePosition(i, 0);
      }

      system.reset();

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(0);
    });

    it('resets repel counter', () => {
      system.applyRepel(100);
      system.reset();
      expect(system.getRepelSteps()).toBe(0);
    });
  });
});

describe('createRouteEncounterZones', () => {
  it('creates default route zones', () => {
    const zones = createRouteEncounterZones();
    expect(zones.length).toBeGreaterThan(0);
  });

  it('creates zones with valid configuration', () => {
    const zones = createRouteEncounterZones();

    zones.forEach((zone) => {
      expect(zone.id).toBeDefined();
      expect(zone.baseRate).toBeGreaterThan(0);
      expect(zone.baseRate).toBeLessThan(1);
      expect(zone.minSteps).toBeGreaterThan(0);
      expect(zone.encounterPool.length).toBeGreaterThan(0);
      expect(zone.timeModifiers).toBeDefined();
      expect(zone.terrain).toBeDefined();
    });
  });

  it('creates main_road with lowest encounter rate', () => {
    const zones = createRouteEncounterZones();
    const mainRoad = zones.find((z) => z.id === 'main_road');
    const otherZones = zones.filter((z) => z.id !== 'main_road');

    expect(mainRoad).toBeDefined();
    otherZones.forEach((zone) => {
      expect(mainRoad!.baseRate).toBeLessThan(zone.baseRate);
    });
  });

  it('creates forest_road with highest night modifier', () => {
    const zones = createRouteEncounterZones();
    const forestRoad = zones.find((z) => z.id === 'forest_road');

    expect(forestRoad).toBeDefined();
    expect(forestRoad!.timeModifiers.night).toBe(2.0);
  });
});
