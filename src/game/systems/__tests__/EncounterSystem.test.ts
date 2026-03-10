/**
 * EncounterSystem.test.ts - Comprehensive tests for EncounterSystem
 *
 * Tests cover:
 * - Encounter zone registration and management
 * - Distance-based encounter triggering (meters traveled in 3D space)
 * - Time of day modifiers
 * - Terrain-based rate modifiers
 * - Repel effects (distance-based)
 * - Town safe radius
 * - Movement tracking and distance calculation
 * - Edge cases (no encounters, empty pools, etc.)
 */

import {
    createRouteEncounterZones,
    EncounterSystem,
    getEncounterSystem,
    type EncounterTrigger,
    type EncounterZone,
} from '../EncounterSystem';
import * as prng from '../../lib/prng';

// Helper: move the player in 10m increments along the X axis
function movePlayer(system: EncounterSystem, meters: number, startX = 0): number {
  const steps = Math.ceil(meters / 10);
  let x = startX;
  for (let i = 0; i < steps; i++) {
    x += 10;
    system.updatePosition(x, 0);
  }
  return x;
}

describe('EncounterSystem', () => {
  let system: EncounterSystem;
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    system = new EncounterSystem();
  });

  afterEach(() => {
    system.dispose?.();
    if (mathRandomSpy) {
      mathRandomSpy.mockRestore();
    }
  });

  describe('initialization', () => {
    it('should create with default state', () => {
      expect(system).toBeDefined();
      expect(system.isEnabled()).toBe(true);
      expect(system.getRepelSteps()).toBe(0);
    });

    it('should have empty debug info initially', () => {
      const debug = system.getDebugInfo();
      expect(debug.zone).toBeNull();
      expect(debug.steps).toBe(0);
      expect(debug.repel).toBe(0);
      expect(debug.chance).toBe(0);
    });
  });

  describe('zone registration', () => {
    const testZone: EncounterZone = {
      id: 'test_zone',
      baseRate: 0.1,
      minDistance: 50,
      encounterPool: ['enemy_1', 'enemy_2'],
      timeModifiers: { dawn: 0.8, day: 1.0, dusk: 1.2, night: 1.5 },
      terrain: 'grass',
    };

    it('should register a zone', () => {
      system.registerZone(testZone);
      system.setCurrentZone('test_zone');

      const debug = system.getDebugInfo();
      expect(debug.zone).toBe('test_zone');
    });

    it('should set current zone to null', () => {
      system.registerZone(testZone);
      system.setCurrentZone('test_zone');
      system.setCurrentZone(null);

      const debug = system.getDebugInfo();
      expect(debug.zone).toBeNull();
    });

    it('should handle setting non-existent zone', () => {
      system.setCurrentZone('non_existent');

      const debug = system.getDebugInfo();
      expect(debug.zone).toBeNull();
    });

    it('should register multiple zones', () => {
      const zone1: EncounterZone = { ...testZone, id: 'zone_1' };
      const zone2: EncounterZone = { ...testZone, id: 'zone_2' };

      system.registerZone(zone1);
      system.registerZone(zone2);

      system.setCurrentZone('zone_1');
      expect(system.getDebugInfo().zone).toBe('zone_1');

      system.setCurrentZone('zone_2');
      expect(system.getDebugInfo().zone).toBe('zone_2');
    });

    it('should convert legacy minSteps to minDistance', () => {
      const legacyZone: EncounterZone = {
        id: 'legacy_zone',
        baseRate: 0.1,
        minDistance: undefined as any,
        minSteps: 10, // should become minDistance: 100
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      system.registerZone(legacyZone);
      system.setCurrentZone('legacy_zone');

      // Move 50m — should NOT trigger (minDistance would be 100)
      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));
      movePlayer(system, 50);
      expect(encounters.length).toBe(0);
    });
  });

  describe('time of day', () => {
    it('should set time of day', () => {
      system.setTimeOfDay('night');
      expect(() => system.setTimeOfDay('dawn')).not.toThrow();
      expect(() => system.setTimeOfDay('day')).not.toThrow();
      expect(() => system.setTimeOfDay('dusk')).not.toThrow();
    });

    it('should affect encounter chance calculation', () => {
      // Suppress encounters so distance state is predictable
      mathRandomSpy = jest.spyOn(prng, 'scopedRNG').mockReturnValue(0.99);

      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 0.1,
        minDistance: 30,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 0.5, day: 1.0, dusk: 1.5, night: 2.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      // Move enough to pass minDistance
      movePlayer(system, 100);

      const dayChance = system.getDebugInfo().chance;

      system.setTimeOfDay('night');
      // Move more to update
      system.updatePosition(200, 0);

      const nightChance = system.getDebugInfo().chance;

      // Night should have higher chance (2x modifier vs 1x)
      expect(nightChance).toBeGreaterThan(dayChance);
    });
  });

  describe('movement tracking', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 0.1,
      minDistance: 50,
      encounterPool: ['enemy_1'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should track position updates', () => {
      // Suppress encounters so distance counter is not reset
      mathRandomSpy = jest.spyOn(prng, 'scopedRNG').mockReturnValue(0.99);

      system.updatePosition(0, 0);
      system.updatePosition(10, 0);
      system.updatePosition(20, 0);

      const debug = system.getDebugInfo();
      expect(debug.steps).toBeGreaterThan(0);
    });

    it('should accumulate distance in meters', () => {
      // Suppress encounters so distance counter is not reset
      mathRandomSpy = jest.spyOn(prng, 'scopedRNG').mockReturnValue(0.99);

      // Move 10m at a time (check interval is 10m)
      movePlayer(system, 100);

      const debug = system.getDebugInfo();
      // steps field now represents meters traveled since last encounter
      expect(debug.steps).toBeGreaterThanOrEqual(50);
    });

    it('should not track distance when disabled', () => {
      system.setEnabled(false);

      movePlayer(system, 100);

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(0);
    });

    it('should not track distance when no zone is set', () => {
      system.setCurrentZone(null);

      movePlayer(system, 100);

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(0);
    });

    it('should calculate diagonal movement correctly', () => {
      // Suppress encounters so distance counter is not reset
      mathRandomSpy = jest.spyOn(prng, 'scopedRNG').mockReturnValue(0.99);

      // Move diagonally (sqrt(2) distance per step)
      for (let i = 0; i < 20; i++) {
        system.updatePosition(i * 10, i * 10);
      }

      const debug = system.getDebugInfo();
      expect(debug.steps).toBeGreaterThan(0);
    });
  });

  describe('encounter triggering', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 1.0, // 100% chance for testing
      minDistance: 50,
      encounterPool: ['enemy_1', 'enemy_2', 'enemy_3'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should trigger encounter after minimum distance', () => {
      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Move 200m (well past minDistance of 50m)
      movePlayer(system, 200);

      expect(encounters.length).toBeGreaterThan(0);
    });

    it('should not trigger before minimum distance', () => {
      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Move only 30m (less than minDistance of 50m)
      movePlayer(system, 30);

      expect(encounters.length).toBe(0);
    });

    it('should include correct encounter data', () => {
      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      movePlayer(system, 200);

      if (encounters.length > 0) {
        const trigger = encounters[0];
        expect(trigger.encounterId).toBeDefined();
        expect(zone.encounterPool).toContain(trigger.encounterId);
        expect(trigger.zoneId).toBe('test_zone');
        expect(trigger.terrain).toBe('grass');
        expect(trigger.timeOfDay).toBe('day');
      }
    });

    it('should reset distance counter after encounter', () => {
      // Force encounters to always trigger once past minDistance
      mathRandomSpy = jest.spyOn(prng, 'scopedRNG').mockReturnValue(0);

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      movePlayer(system, 200);

      expect(encounters.length).toBeGreaterThan(0);
      const distAfterEncounter = system.getDebugInfo().steps;
      // Distance resets after each encounter, so it should be small
      expect(distAfterEncounter).toBeLessThan(100);
    });

    it('should select random encounter from pool', () => {
      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Move a long distance to trigger multiple encounters
      movePlayer(system, 1000);

      const encounterIds = new Set(encounters.map((e) => e.encounterId));
      expect(encounterIds.size).toBeGreaterThan(0);
      encounterIds.forEach((id) => {
        expect(zone.encounterPool).toContain(id);
      });
    });

    it('should not trigger with empty encounter pool', () => {
      const emptyZone: EncounterZone = {
        ...zone,
        id: 'empty_zone',
        encounterPool: [],
      };

      system.registerZone(emptyZone);
      system.setCurrentZone('empty_zone');

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      movePlayer(system, 200);

      expect(encounters.length).toBe(0);
    });
  });

  describe('town safe radius', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 1.0,
      minDistance: 10,
      encounterPool: ['enemy_1'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should suppress encounters within 50m of town', () => {
      system.setDistanceToTown(30); // within safe radius

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      movePlayer(system, 200);

      expect(encounters.length).toBe(0);
    });

    it('should allow encounters beyond 50m from town', () => {
      system.setDistanceToTown(100); // outside safe radius

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      movePlayer(system, 200);

      expect(encounters.length).toBeGreaterThan(0);
    });
  });

  describe('repel effect', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 1.0,
      minDistance: 50,
      encounterPool: ['enemy_1'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should apply repel effect', () => {
      system.applyRepel(500);
      expect(system.getRepelSteps()).toBe(500);
      expect(system.getRepelDistance()).toBe(500);
    });

    it('should prevent encounters during repel', () => {
      system.applyRepel(1000); // 1000m repel

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      movePlayer(system, 500);

      expect(encounters.length).toBe(0);
    });

    it('should decrement repel distance on movement', () => {
      system.applyRepel(100); // 100m repel

      movePlayer(system, 150);

      expect(system.getRepelDistance()).toBeLessThan(100);
    });

    it('should allow encounters after repel expires', () => {
      system.applyRepel(50); // 50m repel

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Move 300m — repel expires after 50m, then minDistance + checks
      movePlayer(system, 300);

      expect(encounters.length).toBeGreaterThan(0);
    });

    it('should use maximum repel value when applied multiple times', () => {
      system.applyRepel(100);
      system.applyRepel(200);

      expect(system.getRepelDistance()).toBe(200);

      system.applyRepel(150);
      expect(system.getRepelDistance()).toBe(200); // Should stay at 200
    });
  });

  describe('enable/disable', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 1.0,
      minDistance: 50,
      encounterPool: ['enemy_1'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should disable encounter system', () => {
      system.setEnabled(false);
      expect(system.isEnabled()).toBe(false);
    });

    it('should enable encounter system', () => {
      system.setEnabled(false);
      system.setEnabled(true);
      expect(system.isEnabled()).toBe(true);
    });

    it('should not trigger encounters when disabled', () => {
      system.setEnabled(false);

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      movePlayer(system, 200);

      expect(encounters.length).toBe(0);
    });

    it('should resume encounters when re-enabled', () => {
      system.setEnabled(false);
      system.setEnabled(true);

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      movePlayer(system, 200);

      expect(encounters.length).toBeGreaterThan(0);
    });
  });

  describe('event subscription', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 1.0,
      minDistance: 50,
      encounterPool: ['enemy_1'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should subscribe to encounter events', () => {
      const callback = jest.fn();
      const unsubscribe = system.onEncounter(callback);

      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('should notify subscribers on encounter', () => {
      const callback = jest.fn();
      system.onEncounter(callback);

      movePlayer(system, 200);

      expect(callback).toHaveBeenCalled();
    });

    it('should unsubscribe from events', () => {
      const callback = jest.fn();
      const unsubscribe = system.onEncounter(callback);

      unsubscribe();

      movePlayer(system, 200);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      system.onEncounter(callback1);
      system.onEncounter(callback2);

      movePlayer(system, 200);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle multiple subscribers independently', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      system.onEncounter(callback1);
      system.onEncounter(callback2);
      system.onEncounter(callback3);

      movePlayer(system, 200);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 0.1,
      minDistance: 50,
      encounterPool: ['enemy_1'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should reset encounter state', () => {
      system.applyRepel(500);
      movePlayer(system, 100);

      system.reset();

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(0);
      expect(debug.repel).toBe(0);
    });

    it('should preserve zone and enabled state', () => {
      system.setEnabled(false);
      system.reset();

      expect(system.isEnabled()).toBe(false);
      expect(system.getDebugInfo().zone).toBe('test_zone');
    });
  });

  describe('terrain modifiers', () => {
    it('should apply terrain modifiers to encounter rate', () => {
      // Suppress encounters so distance state is predictable
      mathRandomSpy = jest.spyOn(prng, 'scopedRNG').mockReturnValue(0.99);

      const roadZone: EncounterZone = {
        id: 'road_zone',
        baseRate: 0.1,
        minDistance: 50,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'road',
      };

      const forestZone: EncounterZone = {
        id: 'forest_zone',
        baseRate: 0.1,
        minDistance: 50,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'forest',
      };

      system.registerZone(roadZone);
      system.setCurrentZone('road_zone');

      movePlayer(system, 100);
      const roadChance = system.getDebugInfo().chance;

      system.registerZone(forestZone);
      system.setCurrentZone('forest_zone');
      system.reset();

      movePlayer(system, 100);
      const forestChance = system.getDebugInfo().chance;

      // Forest should have higher encounter rate than road
      expect(forestChance).toBeGreaterThan(roadChance);
    });
  });

  describe('distance bonus', () => {
    it('should increase chance with more distance since last encounter', () => {
      // Suppress encounters so distance keeps accumulating
      mathRandomSpy = jest.spyOn(prng, 'scopedRNG').mockReturnValue(0.99);

      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 0.01, // Very low base rate
        minDistance: 50,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      // Travel just past minDistance
      movePlayer(system, 100);
      const earlyChance = system.getDebugInfo().chance;

      // Travel much further without encounter
      movePlayer(system, 1000, 100);
      const lateChance = system.getDebugInfo().chance;

      // Chance should increase with distance
      expect(lateChance).toBeGreaterThan(earlyChance);
    });

    it('should cap encounter chance at maximum', () => {
      // Suppress encounters so distance keeps accumulating
      mathRandomSpy = jest.spyOn(prng, 'scopedRNG').mockReturnValue(0.99);

      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 0.5,
        minDistance: 50,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      movePlayer(system, 10000);

      const chance = system.getDebugInfo().chance;
      expect(chance).toBeLessThanOrEqual(0.25); // Max cap
    });
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const instance1 = getEncounterSystem();
      const instance2 = getEncounterSystem();

      expect(instance1).toBe(instance2);
    });
  });

  describe('createRouteEncounterZones', () => {
    it('should create default route zones with minDistance', () => {
      const zones = createRouteEncounterZones();

      expect(zones.length).toBeGreaterThan(0);
      zones.forEach((zone) => {
        expect(zone.id).toBeDefined();
        expect(zone.baseRate).toBeGreaterThan(0);
        expect(zone.minDistance).toBeGreaterThan(0);
        expect(zone.encounterPool.length).toBeGreaterThan(0);
        expect(zone.timeModifiers).toBeDefined();
        expect(zone.terrain).toBeDefined();
      });
    });

    it('should create zones with valid terrain types', () => {
      const zones = createRouteEncounterZones();
      const validTerrains = ['grass', 'desert', 'mountain', 'road', 'forest'];

      zones.forEach((zone) => {
        expect(validTerrains).toContain(zone.terrain);
      });
    });

    it('should create zones with time modifiers', () => {
      const zones = createRouteEncounterZones();

      zones.forEach((zone) => {
        expect(zone.timeModifiers.dawn).toBeDefined();
        expect(zone.timeModifiers.day).toBeDefined();
        expect(zone.timeModifiers.dusk).toBeDefined();
        expect(zone.timeModifiers.night).toBeDefined();
      });
    });

    it('should have minDistance values in the 100-400m range', () => {
      const zones = createRouteEncounterZones();

      zones.forEach((zone) => {
        expect(zone.minDistance).toBeGreaterThanOrEqual(100);
        expect(zone.minDistance).toBeLessThanOrEqual(400);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle zero movement', () => {
      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 1.0,
        minDistance: 50,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Update position to same location
      system.updatePosition(0, 0);
      system.updatePosition(0, 0);
      system.updatePosition(0, 0);

      expect(encounters.length).toBe(0);
    });

    it('should handle very small movements', () => {
      // Suppress encounters so distance counter is not reset
      mathRandomSpy = jest.spyOn(prng, 'scopedRNG').mockReturnValue(0.99);

      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 1.0,
        minDistance: 10,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      // Move in tiny increments that accumulate past the check interval
      for (let i = 0; i < 2000; i++) {
        system.updatePosition(i * 0.1, 0);
      }

      const debug = system.getDebugInfo();
      expect(debug.steps).toBeGreaterThan(0);
    });

    it('should handle negative coordinates', () => {
      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 0.1,
        minDistance: 50,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      expect(() => {
        for (let i = 0; i < 20; i++) {
          system.updatePosition(-i * 10, -i * 10);
        }
      }).not.toThrow();
    });

    it('should handle rapid zone switching', () => {
      const zone1: EncounterZone = {
        id: 'zone_1',
        baseRate: 0.1,
        minDistance: 50,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      const zone2: EncounterZone = {
        id: 'zone_2',
        baseRate: 0.1,
        minDistance: 50,
        encounterPool: ['enemy_2'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'desert',
      };

      system.registerZone(zone1);
      system.registerZone(zone2);

      expect(() => {
        system.setCurrentZone('zone_1');
        system.setCurrentZone('zone_2');
        system.setCurrentZone('zone_1');
        system.setCurrentZone(null);
        system.setCurrentZone('zone_2');
      }).not.toThrow();
    });
  });
});
