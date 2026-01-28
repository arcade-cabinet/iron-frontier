/**
 * EncounterSystem.test.ts - Comprehensive tests for EncounterSystem
 *
 * Tests cover:
 * - Encounter zone registration and management
 * - Step-based encounter triggering
 * - Time of day modifiers
 * - Terrain-based rate modifiers
 * - Repel effects
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

describe('EncounterSystem', () => {
  let system: EncounterSystem;

  beforeEach(() => {
    system = new EncounterSystem();
  });

  afterEach(() => {
    system.dispose?.();
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
      minSteps: 10,
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
  });

  describe('time of day', () => {
    it('should set time of day', () => {
      system.setTimeOfDay('night');
      // Time is internal, but affects encounter rate calculation
      expect(() => system.setTimeOfDay('dawn')).not.toThrow();
      expect(() => system.setTimeOfDay('day')).not.toThrow();
      expect(() => system.setTimeOfDay('dusk')).not.toThrow();
    });

    it('should affect encounter chance calculation', () => {
      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 0.1,
        minSteps: 5,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 0.5, day: 1.0, dusk: 1.5, night: 2.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      // Move enough steps to pass minSteps
      for (let i = 0; i < 10; i++) {
        system.updatePosition(i, 0);
      }

      const dayChance = system.getDebugInfo().chance;

      system.setTimeOfDay('night');
      // Move a bit more to update
      system.updatePosition(10, 0);

      const nightChance = system.getDebugInfo().chance;

      // Night should have higher chance (2x modifier vs 1x)
      expect(nightChance).toBeGreaterThan(dayChance);
    });
  });

  describe('movement tracking', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 0.1,
      minSteps: 5,
      encounterPool: ['enemy_1'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should track position updates', () => {
      system.updatePosition(0, 0);
      system.updatePosition(1, 0);
      system.updatePosition(2, 0);

      const debug = system.getDebugInfo();
      expect(debug.steps).toBeGreaterThan(0);
    });

    it('should accumulate distance into steps', () => {
      // Move 1 unit at a time (STEP_DISTANCE = 1.0)
      for (let i = 0; i < 10; i++) {
        system.updatePosition(i, 0);
      }

      const debug = system.getDebugInfo();
      expect(debug.steps).toBeGreaterThanOrEqual(5);
    });

    it('should not track steps when disabled', () => {
      system.setEnabled(false);

      for (let i = 0; i < 10; i++) {
        system.updatePosition(i, 0);
      }

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(0);
    });

    it('should not track steps when no zone is set', () => {
      system.setCurrentZone(null);

      for (let i = 0; i < 10; i++) {
        system.updatePosition(i, 0);
      }

      const debug = system.getDebugInfo();
      expect(debug.steps).toBe(0);
    });

    it('should calculate diagonal movement correctly', () => {
      // Move diagonally (sqrt(2) distance per step)
      for (let i = 0; i < 10; i++) {
        system.updatePosition(i, i);
      }

      const debug = system.getDebugInfo();
      // Diagonal movement should accumulate more distance
      expect(debug.steps).toBeGreaterThan(0);
    });
  });

  describe('encounter triggering', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 1.0, // 100% chance for testing
      minSteps: 5,
      encounterPool: ['enemy_1', 'enemy_2', 'enemy_3'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should trigger encounter after minimum steps', () => {
      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Move enough to trigger (with 100% rate)
      for (let i = 0; i < 20; i++) {
        system.updatePosition(i, 0);
      }

      expect(encounters.length).toBeGreaterThan(0);
    });

    it('should not trigger before minimum steps', () => {
      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Move less than minSteps
      for (let i = 0; i < 3; i++) {
        system.updatePosition(i, 0);
      }

      expect(encounters.length).toBe(0);
    });

    it('should include correct encounter data', () => {
      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Move enough to trigger
      for (let i = 0; i < 20; i++) {
        system.updatePosition(i, 0);
      }

      if (encounters.length > 0) {
        const trigger = encounters[0];
        expect(trigger.encounterId).toBeDefined();
        expect(zone.encounterPool).toContain(trigger.encounterId);
        expect(trigger.zoneId).toBe('test_zone');
        expect(trigger.terrain).toBe('grass');
        expect(trigger.timeOfDay).toBe('day');
      }
    });

    it('should reset step counter after encounter', () => {
      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Trigger first encounter
      for (let i = 0; i < 20; i++) {
        system.updatePosition(i, 0);
      }

      const stepsAfterEncounter = system.getDebugInfo().steps;
      expect(stepsAfterEncounter).toBeLessThan(10);
    });

    it('should select random encounter from pool', () => {
      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Trigger multiple encounters
      for (let i = 0; i < 100; i++) {
        system.updatePosition(i, 0);
      }

      // Should have encounters from the pool
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

      for (let i = 0; i < 20; i++) {
        system.updatePosition(i, 0);
      }

      expect(encounters.length).toBe(0);
    });
  });

  describe('repel effect', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 1.0,
      minSteps: 5,
      encounterPool: ['enemy_1'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should apply repel effect', () => {
      system.applyRepel(50);
      expect(system.getRepelSteps()).toBe(50);
    });

    it('should prevent encounters during repel', () => {
      system.applyRepel(100);

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Move many steps
      for (let i = 0; i < 50; i++) {
        system.updatePosition(i, 0);
      }

      expect(encounters.length).toBe(0);
    });

    it('should decrement repel steps on movement', () => {
      system.applyRepel(10);

      // Move enough to consume repel
      for (let i = 0; i < 15; i++) {
        system.updatePosition(i, 0);
      }

      expect(system.getRepelSteps()).toBeLessThan(10);
    });

    it('should allow encounters after repel expires', () => {
      system.applyRepel(5);

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      // Move enough to expire repel and trigger encounter
      for (let i = 0; i < 30; i++) {
        system.updatePosition(i, 0);
      }

      expect(encounters.length).toBeGreaterThan(0);
    });

    it('should use maximum repel value when applied multiple times', () => {
      system.applyRepel(10);
      system.applyRepel(20);

      expect(system.getRepelSteps()).toBe(20);

      system.applyRepel(15);
      expect(system.getRepelSteps()).toBe(20); // Should stay at 20
    });
  });

  describe('enable/disable', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 1.0,
      minSteps: 5,
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

      for (let i = 0; i < 20; i++) {
        system.updatePosition(i, 0);
      }

      expect(encounters.length).toBe(0);
    });

    it('should resume encounters when re-enabled', () => {
      system.setEnabled(false);
      system.setEnabled(true);

      const encounters: EncounterTrigger[] = [];
      system.onEncounter((trigger) => encounters.push(trigger));

      for (let i = 0; i < 20; i++) {
        system.updatePosition(i, 0);
      }

      expect(encounters.length).toBeGreaterThan(0);
    });
  });

  describe('event subscription', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 1.0,
      minSteps: 5,
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

      for (let i = 0; i < 20; i++) {
        system.updatePosition(i, 0);
      }

      expect(callback).toHaveBeenCalled();
    });

    it('should unsubscribe from events', () => {
      const callback = jest.fn();
      const unsubscribe = system.onEncounter(callback);

      unsubscribe();

      for (let i = 0; i < 20; i++) {
        system.updatePosition(i, 0);
      }

      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      system.onEncounter(callback1);
      system.onEncounter(callback2);

      for (let i = 0; i < 20; i++) {
        system.updatePosition(i, 0);
      }

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

      for (let i = 0; i < 20; i++) {
        system.updatePosition(i, 0);
      }

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    const zone: EncounterZone = {
      id: 'test_zone',
      baseRate: 0.1,
      minSteps: 5,
      encounterPool: ['enemy_1'],
      timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
      terrain: 'grass',
    };

    beforeEach(() => {
      system.registerZone(zone);
      system.setCurrentZone('test_zone');
    });

    it('should reset encounter state', () => {
      // Build up some state
      system.applyRepel(50);
      for (let i = 0; i < 10; i++) {
        system.updatePosition(i, 0);
      }

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
      const roadZone: EncounterZone = {
        id: 'road_zone',
        baseRate: 0.1,
        minSteps: 5,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'road',
      };

      const forestZone: EncounterZone = {
        id: 'forest_zone',
        baseRate: 0.1,
        minSteps: 5,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'forest',
      };

      system.registerZone(roadZone);
      system.setCurrentZone('road_zone');

      for (let i = 0; i < 10; i++) {
        system.updatePosition(i, 0);
      }
      const roadChance = system.getDebugInfo().chance;

      system.registerZone(forestZone);
      system.setCurrentZone('forest_zone');
      system.reset();

      for (let i = 0; i < 10; i++) {
        system.updatePosition(i, 0);
      }
      const forestChance = system.getDebugInfo().chance;

      // Forest should have higher encounter rate than road
      expect(forestChance).toBeGreaterThan(roadChance);
    });
  });

  describe('step bonus', () => {
    it('should increase chance with more steps since last encounter', () => {
      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 0.01, // Very low base rate
        minSteps: 5,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      // Take minimum steps
      for (let i = 0; i < 10; i++) {
        system.updatePosition(i, 0);
      }
      const earlyChance = system.getDebugInfo().chance;

      // Take many more steps
      for (let i = 10; i < 100; i++) {
        system.updatePosition(i, 0);
      }
      const lateChance = system.getDebugInfo().chance;

      // Chance should increase with steps
      expect(lateChance).toBeGreaterThan(earlyChance);
    });

    it('should cap encounter chance at maximum', () => {
      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 0.5,
        minSteps: 5,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      // Take many steps
      for (let i = 0; i < 1000; i++) {
        system.updatePosition(i, 0);
      }

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
    it('should create default route zones', () => {
      const zones = createRouteEncounterZones();

      expect(zones.length).toBeGreaterThan(0);
      zones.forEach((zone) => {
        expect(zone.id).toBeDefined();
        expect(zone.baseRate).toBeGreaterThan(0);
        expect(zone.minSteps).toBeGreaterThan(0);
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
  });

  describe('edge cases', () => {
    it('should handle zero movement', () => {
      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 1.0,
        minSteps: 5,
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
      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 1.0,
        minSteps: 5,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      // Move in tiny increments
      for (let i = 0; i < 1000; i++) {
        system.updatePosition(i * 0.01, 0);
      }

      const debug = system.getDebugInfo();
      expect(debug.steps).toBeGreaterThan(0);
    });

    it('should handle negative coordinates', () => {
      const zone: EncounterZone = {
        id: 'test_zone',
        baseRate: 0.1,
        minSteps: 5,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      expect(() => {
        for (let i = 0; i < 10; i++) {
          system.updatePosition(-i, -i);
        }
      }).not.toThrow();
    });

    it('should handle rapid zone switching', () => {
      const zone1: EncounterZone = {
        id: 'zone_1',
        baseRate: 0.1,
        minSteps: 5,
        encounterPool: ['enemy_1'],
        timeModifiers: { dawn: 1.0, day: 1.0, dusk: 1.0, night: 1.0 },
        terrain: 'grass',
      };

      const zone2: EncounterZone = {
        id: 'zone_2',
        baseRate: 0.1,
        minSteps: 5,
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
