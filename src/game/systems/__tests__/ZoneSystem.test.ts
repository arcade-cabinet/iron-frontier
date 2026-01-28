/**
 * ZoneSystem.test.ts - Comprehensive tests for ZoneSystem
 *
 * Tests cover:
 * - Zone registration and management
 * - Position checking and zone detection
 * - Zone transitions
 * - Spatial queries (radius, bounds, type)
 * - Integration with EncounterSystem
 * - Factory methods for creating zones
 * - Edge cases and error handling
 */

import type { EncounterSystem } from '../EncounterSystem';
import { aabbFromRadius, type AABB } from '../SpatialHash';
import {
    getZoneSystem,
    resetZoneSystem,
    TOWN_POSITIONS,
    ZoneSystem,
    type Zone,
    type ZoneTransition,
    type ZoneType,
} from '../ZoneSystem';

describe('ZoneSystem', () => {
  let system: ZoneSystem;

  beforeEach(() => {
    system = new ZoneSystem(100);
  });

  afterEach(() => {
    system.dispose();
  });

  describe('initialization', () => {
    it('should create with default cell size', () => {
      const sys = new ZoneSystem();
      expect(sys).toBeDefined();
      sys.dispose();
    });

    it('should create with custom cell size', () => {
      const sys = new ZoneSystem(50);
      expect(sys).toBeDefined();
      sys.dispose();
    });

    it('should have no zones initially', () => {
      expect(system.getAllZones()).toEqual([]);
    });

    it('should have no current zone initially', () => {
      expect(system.getCurrentZone()).toBeNull();
    });
  });

  describe('zone registration', () => {
    const testZone: Zone = {
      id: 'test_zone',
      type: 'town',
      name: 'Test Town',
      bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
      transitions: [],
    };

    it('should register a zone', () => {
      system.registerZone(testZone);
      expect(system.getZone('test_zone')).toBeDefined();
    });

    it('should throw error for zone without id', () => {
      const invalidZone = { ...testZone, id: '' } as Zone;
      expect(() => system.registerZone(invalidZone)).toThrow('Zone must have an id');
    });

    it('should throw error for zone without bounds', () => {
      const invalidZone = { ...testZone, bounds: undefined as any };
      expect(() => system.registerZone(invalidZone)).toThrow('must have bounds');
    });

    it('should replace existing zone with same id', () => {
      system.registerZone(testZone);
      const updatedZone = { ...testZone, name: 'Updated Town' };
      system.registerZone(updatedZone);

      const zone = system.getZone('test_zone');
      expect(zone?.name).toBe('Updated Town');
    });

    it('should register multiple zones', () => {
      const zone1: Zone = { ...testZone, id: 'zone_1' };
      const zone2: Zone = { ...testZone, id: 'zone_2' };
      const zone3: Zone = { ...testZone, id: 'zone_3' };

      system.registerZones([zone1, zone2, zone3]);

      expect(system.getAllZones().length).toBe(3);
    });

    it('should unregister a zone', () => {
      system.registerZone(testZone);
      system.unregisterZone('test_zone');

      expect(system.getZone('test_zone')).toBeUndefined();
    });

    it('should handle unregistering non-existent zone', () => {
      expect(() => system.unregisterZone('non_existent')).not.toThrow();
    });

    it('should clear current zone when unregistered', () => {
      system.registerZone(testZone);
      system.setCurrentZone('test_zone');
      system.unregisterZone('test_zone');

      expect(system.getCurrentZone()).toBeNull();
    });

    it('should get all registered zones', () => {
      const zone1: Zone = { ...testZone, id: 'zone_1' };
      const zone2: Zone = { ...testZone, id: 'zone_2' };

      system.registerZone(zone1);
      system.registerZone(zone2);

      const zones = system.getAllZones();
      expect(zones.length).toBe(2);
      expect(zones.map((z) => z.id)).toContain('zone_1');
      expect(zones.map((z) => z.id)).toContain('zone_2');
    });
  });

  describe('position checking', () => {
    const townZone: Zone = {
      id: 'town_1',
      type: 'town',
      bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
      transitions: [],
    };

    const routeZone: Zone = {
      id: 'route_1',
      type: 'route',
      bounds: aabbFromRadius({ x: 100, z: 100 }, 30),
      transitions: [],
    };

    beforeEach(() => {
      system.registerZone(townZone);
      system.registerZone(routeZone);
    });

    it('should detect position in zone', () => {
      const zone = system.checkPlayerPosition({ x: 0, z: 0 });
      expect(zone?.id).toBe('town_1');
    });

    it('should return null for position outside zones', () => {
      const zone = system.checkPlayerPosition({ x: 500, z: 500 });
      expect(zone).toBeNull();
    });

    it('should detect position in different zones', () => {
      const zone1 = system.checkPlayerPosition({ x: 0, z: 0 });
      const zone2 = system.checkPlayerPosition({ x: 100, z: 100 });

      expect(zone1?.id).toBe('town_1');
      expect(zone2?.id).toBe('route_1');
    });

    it('should handle position at zone boundary', () => {
      const zone = system.checkPlayerPosition({ x: 50, z: 0 });
      expect(zone?.id).toBe('town_1');
    });

    it('should prioritize higher priority zones', () => {
      const highPriorityZone: Zone = {
        id: 'high_priority',
        type: 'building',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 25),
        transitions: [],
        priority: 20,
      };

      system.registerZone(highPriorityZone);

      const zone = system.checkPlayerPosition({ x: 0, z: 0 });
      expect(zone?.id).toBe('high_priority');
    });

    it('should update current zone on position update', () => {
      system.updatePlayerPosition({ x: 0, z: 0 });
      expect(system.getCurrentZone()?.id).toBe('town_1');

      system.updatePlayerPosition({ x: 100, z: 100 });
      expect(system.getCurrentZone()?.id).toBe('route_1');
    });

    it('should trigger callback on zone change', () => {
      const callback = jest.fn();
      system.onZoneChange(callback);

      system.updatePlayerPosition({ x: 0, z: 0 });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'town_1' }),
        null
      );

      callback.mockClear();
      system.updatePlayerPosition({ x: 100, z: 100 });
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'route_1' }),
        expect.objectContaining({ id: 'town_1' })
      );
    });

    it('should not trigger callback when staying in same zone', () => {
      const callback = jest.fn();
      system.onZoneChange(callback);

      system.updatePlayerPosition({ x: 0, z: 0 });
      callback.mockClear();

      system.updatePlayerPosition({ x: 5, z: 5 });
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('zone transitions', () => {
    const transition: ZoneTransition = {
      targetZoneId: 'zone_2',
      triggerBounds: {
        min: { x: 45, z: -5 },
        max: { x: 55, z: 5 },
      },
      spawnPosition: { x: -45, z: 0 },
      transitionText: 'Entering Zone 2',
    };

    const zone1: Zone = {
      id: 'zone_1',
      type: 'town',
      bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
      transitions: [transition],
    };

    beforeEach(() => {
      system.registerZone(zone1);
      system.setCurrentZone('zone_1');
    });

    it('should detect transition trigger', () => {
      const trans = system.checkTransition({ x: 50, z: 0 });
      expect(trans).toBeDefined();
      expect(trans?.targetZoneId).toBe('zone_2');
    });

    it('should return null when not in transition area', () => {
      const trans = system.checkTransition({ x: 0, z: 0 });
      expect(trans).toBeNull();
    });

    it('should return null when no current zone', () => {
      system.setCurrentZone(null);
      const trans = system.checkTransition({ x: 50, z: 0 });
      expect(trans).toBeNull();
    });

    it('should include transition metadata', () => {
      const trans = system.checkTransition({ x: 50, z: 0 });
      expect(trans?.transitionText).toBe('Entering Zone 2');
      expect(trans?.spawnPosition).toEqual({ x: -45, z: 0 });
    });
  });

  describe('spatial queries', () => {
    beforeEach(() => {
      const zones: Zone[] = [
        {
          id: 'town_1',
          type: 'town',
          bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
          transitions: [],
        },
        {
          id: 'town_2',
          type: 'town',
          bounds: aabbFromRadius({ x: 200, z: 0 }, 50),
          transitions: [],
        },
        {
          id: 'route_1',
          type: 'route',
          bounds: aabbFromRadius({ x: 100, z: 100 }, 30),
          transitions: [],
        },
        {
          id: 'building_1',
          type: 'building',
          bounds: aabbFromRadius({ x: 10, z: 10 }, 10),
          transitions: [],
        },
      ];

      system.registerZones(zones);
    });

    it('should get zones in radius', () => {
      const zones = system.getZonesInRadius({ x: 0, z: 0 }, 100);
      expect(zones.length).toBeGreaterThan(0);
      expect(zones.some((z) => z.id === 'town_1')).toBe(true);
    });

    it('should get zones by type', () => {
      const towns = system.getZonesByType('town');
      expect(towns.length).toBe(2);
      expect(towns.every((z) => z.type === 'town')).toBe(true);
    });

    it('should get nearest zone', () => {
      const nearest = system.getNearestZone({ x: 0, z: 0 });
      expect(nearest?.id).toBe('town_1');
    });

    it('should get nearest zone of specific type', () => {
      const nearestRoute = system.getNearestZone({ x: 0, z: 0 }, 'route');
      expect(nearestRoute?.id).toBe('route_1');
    });

    it('should return null when no zones exist', () => {
      system.clear();
      const nearest = system.getNearestZone({ x: 0, z: 0 });
      expect(nearest).toBeNull();
    });

    it('should get zones in bounds', () => {
      const bounds: AABB = {
        min: { x: -60, z: -60 },
        max: { x: 60, z: 60 },
      };
      const zones = system.getZonesInBounds(bounds);
      expect(zones.length).toBeGreaterThan(0);
    });
  });

  describe('encounter system integration', () => {
    const mockEncounterSystem: jest.Mocked<EncounterSystem> = {
      setCurrentZone: jest.fn(),
    } as any;

    beforeEach(() => {
      system.setEncounterSystem(mockEncounterSystem);
      mockEncounterSystem.setCurrentZone.mockClear();
    });

    it('should set encounter zone when entering route', () => {
      const routeZone: Zone = {
        id: 'route_1',
        type: 'route',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
        encounterZoneId: 'encounter_route_1',
      };

      system.registerZone(routeZone);
      system.updatePlayerPosition({ x: 0, z: 0 });

      expect(mockEncounterSystem.setCurrentZone).toHaveBeenCalledWith('encounter_route_1');
    });

    it('should disable encounters when entering town', () => {
      const townZone: Zone = {
        id: 'town_1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
      };

      system.registerZone(townZone);
      system.updatePlayerPosition({ x: 0, z: 0 });

      expect(mockEncounterSystem.setCurrentZone).toHaveBeenCalledWith(null);
    });

    it('should not update encounter system when not integrated', () => {
      const sys = new ZoneSystem();
      const routeZone: Zone = {
        id: 'route_1',
        type: 'route',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
        encounterZoneId: 'encounter_route_1',
      };

      sys.registerZone(routeZone);
      expect(() => sys.updatePlayerPosition({ x: 0, z: 0 })).not.toThrow();
      sys.dispose();
    });
  });

  describe('callbacks', () => {
    const testZone: Zone = {
      id: 'test_zone',
      type: 'town',
      bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
      transitions: [],
    };

    beforeEach(() => {
      system.registerZone(testZone);
    });

    it('should subscribe to zone change events', () => {
      const callback = jest.fn();
      const unsubscribe = system.onZoneChange(callback);

      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('should unsubscribe from zone change events', () => {
      const callback = jest.fn();
      const unsubscribe = system.onZoneChange(callback);

      unsubscribe();
      system.updatePlayerPosition({ x: 0, z: 0 });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple zone change subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      system.onZoneChange(callback1);
      system.onZoneChange(callback2);

      system.updatePlayerPosition({ x: 0, z: 0 });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should subscribe to transition events', () => {
      const callback = jest.fn();
      const unsubscribe = system.onTransition(callback);

      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('should unsubscribe from transition events', () => {
      const callback = jest.fn();
      const unsubscribe = system.onTransition(callback);

      unsubscribe();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('factory methods', () => {
    describe('createTownZones', () => {
      it('should create zones for all towns', () => {
        const zones = ZoneSystem.createTownZones();
        expect(zones.length).toBe(Object.keys(TOWN_POSITIONS).length);
      });

      it('should create zones with correct properties', () => {
        const zones = ZoneSystem.createTownZones();

        zones.forEach((zone) => {
          expect(zone.id).toMatch(/^town_/);
          expect(zone.type).toBe('town');
          expect(zone.townId).toBeDefined();
          expect(zone.bounds).toBeDefined();
          expect(zone.encountersEnabled).toBe(false);
          expect(zone.priority).toBe(10);
        });
      });

      it('should create zones at correct positions', () => {
        const zones = ZoneSystem.createTownZones();

        zones.forEach((zone) => {
          const townId = zone.townId!;
          const townPos = TOWN_POSITIONS[townId];
          expect(townPos).toBeDefined();

          const centerX = (zone.bounds.min.x + zone.bounds.max.x) / 2;
          const centerZ = (zone.bounds.min.z + zone.bounds.max.z) / 2;

          expect(centerX).toBeCloseTo(townPos.x, 1);
          expect(centerZ).toBeCloseTo(townPos.z, 1);
        });
      });

      it('should format town names correctly', () => {
        const zones = ZoneSystem.createTownZones();

        zones.forEach((zone) => {
          expect(zone.name).toBeDefined();
          // Should be title case with spaces
          expect(zone.name).toMatch(/^[A-Z]/);
          expect(zone.name).not.toContain('_');
        });
      });
    });

    describe('createRouteZone', () => {
      it('should create route zone between two points', () => {
        const zone = ZoneSystem.createRouteZone(
          'test_route',
          { x: 0, z: 0 },
          { x: 100, z: 100 },
          50
        );

        expect(zone.id).toBe('route_test_route');
        expect(zone.type).toBe('route');
        expect(zone.routeId).toBe('test_route');
        expect(zone.encountersEnabled).toBe(true);
        expect(zone.priority).toBe(5);
      });

      it('should create bounds encompassing both points', () => {
        const zone = ZoneSystem.createRouteZone(
          'test_route',
          { x: 0, z: 0 },
          { x: 100, z: 100 },
          50
        );

        expect(zone.bounds.min.x).toBeLessThanOrEqual(0);
        expect(zone.bounds.min.z).toBeLessThanOrEqual(0);
        expect(zone.bounds.max.x).toBeGreaterThanOrEqual(100);
        expect(zone.bounds.max.z).toBeGreaterThanOrEqual(100);
      });

      it('should include encounter zone id when provided', () => {
        const zone = ZoneSystem.createRouteZone(
          'test_route',
          { x: 0, z: 0 },
          { x: 100, z: 100 },
          50,
          'encounter_test'
        );

        expect(zone.encounterZoneId).toBe('encounter_test');
      });

      it('should handle negative coordinates', () => {
        const zone = ZoneSystem.createRouteZone(
          'test_route',
          { x: -100, z: -100 },
          { x: 0, z: 0 },
          50
        );

        expect(zone.bounds.min.x).toBeLessThanOrEqual(-100);
        expect(zone.bounds.min.z).toBeLessThanOrEqual(-100);
      });

      it('should format route name correctly', () => {
        const zone = ZoneSystem.createRouteZone(
          'dusty_trail',
          { x: 0, z: 0 },
          { x: 100, z: 100 },
          50
        );

        expect(zone.name).toBe('Dusty Trail');
      });
    });
  });

  describe('current zone management', () => {
    const testZone: Zone = {
      id: 'test_zone',
      type: 'town',
      bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
      transitions: [],
    };

    beforeEach(() => {
      system.registerZone(testZone);
    });

    it('should set current zone by id', () => {
      system.setCurrentZone('test_zone');
      expect(system.getCurrentZone()?.id).toBe('test_zone');
    });

    it('should set current zone to null', () => {
      system.setCurrentZone('test_zone');
      system.setCurrentZone(null);
      expect(system.getCurrentZone()).toBeNull();
    });

    it('should handle setting non-existent zone', () => {
      system.setCurrentZone('non_existent');
      expect(system.getCurrentZone()).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should clear all zones', () => {
      const zone1: Zone = {
        id: 'zone_1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
      };

      system.registerZone(zone1);
      system.clear();

      expect(system.getAllZones()).toEqual([]);
      expect(system.getCurrentZone()).toBeNull();
    });

    it('should dispose of system', () => {
      const zone1: Zone = {
        id: 'zone_1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
      };

      const callback = jest.fn();
      system.registerZone(zone1);
      system.onZoneChange(callback);

      system.dispose();

      expect(system.getAllZones()).toEqual([]);
      expect(system.getCurrentZone()).toBeNull();
    });

    it('should clear callbacks on dispose', () => {
      const callback = jest.fn();
      system.onZoneChange(callback);

      system.dispose();

      // Callbacks should not be called after disposal
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('debug info', () => {
    it('should provide debug information', () => {
      const debug = system.getDebugInfo();

      expect(debug).toHaveProperty('zoneCount');
      expect(debug).toHaveProperty('currentZone');
      expect(debug).toHaveProperty('zonesByType');
      expect(debug).toHaveProperty('spatialHashInfo');
    });

    it('should count zones correctly', () => {
      const zones: Zone[] = [
        {
          id: 'town_1',
          type: 'town',
          bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
          transitions: [],
        },
        {
          id: 'route_1',
          type: 'route',
          bounds: aabbFromRadius({ x: 100, z: 100 }, 30),
          transitions: [],
        },
      ];

      system.registerZones(zones);

      const debug = system.getDebugInfo();
      expect(debug.zoneCount).toBe(2);
      expect(debug.zonesByType.town).toBe(1);
      expect(debug.zonesByType.route).toBe(1);
    });

    it('should track current zone in debug info', () => {
      const zone: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
      };

      system.registerZone(zone);
      system.setCurrentZone('test_zone');

      const debug = system.getDebugInfo();
      expect(debug.currentZone).toBe('test_zone');
    });
  });

  describe('edge cases', () => {
    it('should handle overlapping zones with same priority', () => {
      const zone1: Zone = {
        id: 'zone_1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
        priority: 5,
      };

      const zone2: Zone = {
        id: 'zone_2',
        type: 'route',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 40),
        transitions: [],
        priority: 5,
      };

      system.registerZone(zone1);
      system.registerZone(zone2);

      const zone = system.checkPlayerPosition({ x: 0, z: 0 });
      expect(zone).toBeDefined();
      expect(['zone_1', 'zone_2']).toContain(zone?.id);
    });

    it('should handle zones with no priority', () => {
      const zone1: Zone = {
        id: 'zone_1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
      };

      const zone2: Zone = {
        id: 'zone_2',
        type: 'route',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 40),
        transitions: [],
      };

      system.registerZone(zone1);
      system.registerZone(zone2);

      const zone = system.checkPlayerPosition({ x: 0, z: 0 });
      expect(zone).toBeDefined();
    });

    it('should handle very large zones', () => {
      const largeZone: Zone = {
        id: 'large_zone',
        type: 'overworld',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 10000),
        transitions: [],
      };

      expect(() => system.registerZone(largeZone)).not.toThrow();

      const zone = system.checkPlayerPosition({ x: 5000, z: 5000 });
      expect(zone?.id).toBe('large_zone');
    });

    it('should handle very small zones', () => {
      const smallZone: Zone = {
        id: 'small_zone',
        type: 'building',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 0.1),
        transitions: [],
      };

      expect(() => system.registerZone(smallZone)).not.toThrow();

      const zone = system.checkPlayerPosition({ x: 0, z: 0 });
      expect(zone?.id).toBe('small_zone');
    });

    it('should handle negative coordinates', () => {
      const zone: Zone = {
        id: 'negative_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: -100, z: -100 }, 50),
        transitions: [],
      };

      system.registerZone(zone);

      const result = system.checkPlayerPosition({ x: -100, z: -100 });
      expect(result?.id).toBe('negative_zone');
    });

    it('should handle zones with empty transitions', () => {
      const zone: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
      };

      expect(() => system.registerZone(zone)).not.toThrow();
    });

    it('should handle multiple transitions in one zone', () => {
      const transitions: ZoneTransition[] = [
        {
          targetZoneId: 'zone_2',
          triggerBounds: {
            min: { x: 45, z: -5 },
            max: { x: 55, z: 5 },
          },
          spawnPosition: { x: -45, z: 0 },
        },
        {
          targetZoneId: 'zone_3',
          triggerBounds: {
            min: { x: -5, z: 45 },
            max: { x: 5, z: 55 },
          },
          spawnPosition: { x: 0, z: -45 },
        },
      ];

      const zone: Zone = {
        id: 'zone_1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions,
      };

      system.registerZone(zone);
      system.setCurrentZone('zone_1');

      const trans1 = system.checkTransition({ x: 50, z: 0 });
      expect(trans1?.targetZoneId).toBe('zone_2');

      const trans2 = system.checkTransition({ x: 0, z: 50 });
      expect(trans2?.targetZoneId).toBe('zone_3');
    });

    it('should handle rapid position updates', () => {
      const zone: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
      };

      system.registerZone(zone);

      expect(() => {
        for (let i = 0; i < 1000; i++) {
          system.updatePlayerPosition({ x: i % 100, z: i % 100 });
        }
      }).not.toThrow();
    });

    it('should handle zone with metadata', () => {
      const zone: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 50),
        transitions: [],
        data: {
          population: 1000,
          hasShop: true,
          customField: 'test',
        },
      };

      system.registerZone(zone);
      const retrieved = system.getZone('test_zone');

      expect(retrieved?.data).toEqual(zone.data);
    });
  });

  describe('singleton', () => {
    afterEach(() => {
      resetZoneSystem();
    });

    it('should return same instance', () => {
      const instance1 = getZoneSystem();
      const instance2 = getZoneSystem();

      expect(instance1).toBe(instance2);
    });

    it('should reset singleton instance', () => {
      const instance1 = getZoneSystem();
      resetZoneSystem();
      const instance2 = getZoneSystem();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('zone types', () => {
    it('should support all zone types', () => {
      const types: ZoneType[] = ['overworld', 'town', 'building', 'route'];

      types.forEach((type, index) => {
        const zone: Zone = {
          id: `zone_${index}`,
          type,
          bounds: aabbFromRadius({ x: index * 100, z: 0 }, 50),
          transitions: [],
        };

        expect(() => system.registerZone(zone)).not.toThrow();
      });

      expect(system.getAllZones().length).toBe(types.length);
    });
  });
});
