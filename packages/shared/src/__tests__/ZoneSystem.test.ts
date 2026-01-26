/**
 * Tests for ZoneSystem
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ZoneSystem,
  getZoneSystem,
  resetZoneSystem,
  TOWN_POSITIONS,
  type Zone,
  type ZoneTransition,
} from '../systems/ZoneSystem';
import { aabbFromRadius, type AABB } from '../systems/SpatialHash';

describe('ZoneSystem', () => {
  let zoneSystem: ZoneSystem;

  beforeEach(() => {
    resetZoneSystem();
    zoneSystem = new ZoneSystem(50);
  });

  afterEach(() => {
    zoneSystem.dispose();
  });

  describe('zone registration', () => {
    it('should register a zone', () => {
      const zone: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      zoneSystem.registerZone(zone);

      expect(zoneSystem.getZone('test_zone')).toBeDefined();
      expect(zoneSystem.getZone('test_zone')?.id).toBe('test_zone');
    });

    it('should replace existing zone with same ID', () => {
      const zone1: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      const zone2: Zone = {
        id: 'test_zone',
        type: 'route',
        bounds: aabbFromRadius({ x: 100, z: 100 }, 50),
        transitions: [],
      };

      zoneSystem.registerZone(zone1);
      zoneSystem.registerZone(zone2);

      expect(zoneSystem.getZone('test_zone')?.type).toBe('route');
    });

    it('should throw error for zone without ID', () => {
      const zone = {
        id: '',
        type: 'town' as const,
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      expect(() => zoneSystem.registerZone(zone)).toThrow();
    });

    it('should unregister a zone', () => {
      const zone: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      zoneSystem.registerZone(zone);
      zoneSystem.unregisterZone('test_zone');

      expect(zoneSystem.getZone('test_zone')).toBeUndefined();
    });

    it('should register multiple zones', () => {
      const zones: Zone[] = [
        {
          id: 'zone1',
          type: 'town',
          bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
          transitions: [],
        },
        {
          id: 'zone2',
          type: 'route',
          bounds: aabbFromRadius({ x: 200, z: 200 }, 50),
          transitions: [],
        },
      ];

      zoneSystem.registerZones(zones);

      expect(zoneSystem.getAllZones()).toHaveLength(2);
    });
  });

  describe('position checking', () => {
    it('should find zone containing position', () => {
      const zone: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      zoneSystem.registerZone(zone);

      const result = zoneSystem.checkPlayerPosition({ x: 50, z: 50 });
      expect(result?.id).toBe('test_zone');
    });

    it('should return null for position outside all zones', () => {
      const zone: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      zoneSystem.registerZone(zone);

      const result = zoneSystem.checkPlayerPosition({ x: 500, z: 500 });
      expect(result).toBeNull();
    });

    it('should return highest priority zone when overlapping', () => {
      const lowPriorityZone: Zone = {
        id: 'low_priority',
        type: 'route',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 200),
        transitions: [],
        priority: 1,
      };

      const highPriorityZone: Zone = {
        id: 'high_priority',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
        priority: 10,
      };

      zoneSystem.registerZone(lowPriorityZone);
      zoneSystem.registerZone(highPriorityZone);

      const result = zoneSystem.checkPlayerPosition({ x: 50, z: 50 });
      expect(result?.id).toBe('high_priority');
    });
  });

  describe('zone updates', () => {
    it('should update current zone when position changes', () => {
      const zone1: Zone = {
        id: 'zone1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      const zone2: Zone = {
        id: 'zone2',
        type: 'route',
        bounds: aabbFromRadius({ x: 300, z: 300 }, 100),
        transitions: [],
      };

      zoneSystem.registerZone(zone1);
      zoneSystem.registerZone(zone2);

      // Move into zone1
      zoneSystem.updatePlayerPosition({ x: 50, z: 50 });
      expect(zoneSystem.getCurrentZone()?.id).toBe('zone1');

      // Move into zone2
      zoneSystem.updatePlayerPosition({ x: 300, z: 300 });
      expect(zoneSystem.getCurrentZone()?.id).toBe('zone2');
    });

    it('should trigger zone change callback', () => {
      const callback = vi.fn();
      const zone: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      zoneSystem.registerZone(zone);
      zoneSystem.onZoneChange(callback);

      zoneSystem.updatePlayerPosition({ x: 50, z: 50 });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test_zone' }),
        null
      );
    });

    it('should allow unsubscribing from zone change', () => {
      const callback = vi.fn();
      const zone: Zone = {
        id: 'test_zone',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      zoneSystem.registerZone(zone);
      const unsubscribe = zoneSystem.onZoneChange(callback);

      unsubscribe();
      zoneSystem.updatePlayerPosition({ x: 50, z: 50 });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('transitions', () => {
    it('should detect transition when inside trigger bounds', () => {
      const transition: ZoneTransition = {
        targetZoneId: 'zone2',
        triggerBounds: { min: { x: 80, z: 80 }, max: { x: 100, z: 100 } },
        spawnPosition: { x: 0, z: 0 },
      };

      const zone: Zone = {
        id: 'zone1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [transition],
      };

      zoneSystem.registerZone(zone);
      zoneSystem.updatePlayerPosition({ x: 50, z: 50 }); // Enter zone

      const result = zoneSystem.checkTransition({ x: 90, z: 90 });
      expect(result?.targetZoneId).toBe('zone2');
    });

    it('should return null when not inside any transition', () => {
      const zone: Zone = {
        id: 'zone1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      zoneSystem.registerZone(zone);
      zoneSystem.updatePlayerPosition({ x: 50, z: 50 });

      const result = zoneSystem.checkTransition({ x: 50, z: 50 });
      expect(result).toBeNull();
    });
  });

  describe('spatial queries', () => {
    it('should get zones in radius', () => {
      const zone1: Zone = {
        id: 'zone1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      const zone2: Zone = {
        id: 'zone2',
        type: 'town',
        bounds: aabbFromRadius({ x: 50, z: 50 }, 50),
        transitions: [],
      };

      const zone3: Zone = {
        id: 'zone3',
        type: 'town',
        bounds: aabbFromRadius({ x: 500, z: 500 }, 50),
        transitions: [],
      };

      zoneSystem.registerZone(zone1);
      zoneSystem.registerZone(zone2);
      zoneSystem.registerZone(zone3);

      const result = zoneSystem.getZonesInRadius({ x: 0, z: 0 }, 200);
      expect(result.map((z) => z.id)).toContain('zone1');
      expect(result.map((z) => z.id)).toContain('zone2');
      expect(result.map((z) => z.id)).not.toContain('zone3');
    });

    it('should get zones by type', () => {
      const townZone: Zone = {
        id: 'town1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      const routeZone: Zone = {
        id: 'route1',
        type: 'route',
        bounds: aabbFromRadius({ x: 200, z: 200 }, 50),
        transitions: [],
      };

      zoneSystem.registerZone(townZone);
      zoneSystem.registerZone(routeZone);

      const towns = zoneSystem.getZonesByType('town');
      expect(towns).toHaveLength(1);
      expect(towns[0].id).toBe('town1');

      const routes = zoneSystem.getZonesByType('route');
      expect(routes).toHaveLength(1);
      expect(routes[0].id).toBe('route1');
    });

    it('should find nearest zone', () => {
      const zone1: Zone = {
        id: 'zone1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      };

      const zone2: Zone = {
        id: 'zone2',
        type: 'town',
        bounds: aabbFromRadius({ x: 500, z: 500 }, 100),
        transitions: [],
      };

      zoneSystem.registerZone(zone1);
      zoneSystem.registerZone(zone2);

      const nearest = zoneSystem.getNearestZone({ x: 100, z: 100 });
      expect(nearest?.id).toBe('zone1');
    });
  });

  describe('factory methods', () => {
    it('should create town zones from TOWN_POSITIONS', () => {
      const townZones = ZoneSystem.createTownZones();

      expect(townZones.length).toBe(Object.keys(TOWN_POSITIONS).length);

      for (const zone of townZones) {
        expect(zone.type).toBe('town');
        expect(zone.townId).toBeDefined();
        expect(zone.encountersEnabled).toBe(false);
      }
    });

    it('should create route zone between positions', () => {
      const routeZone = ZoneSystem.createRouteZone(
        'test_route',
        { x: 0, z: 0 },
        { x: 100, z: 100 },
        50,
        'test_encounter_zone'
      );

      expect(routeZone.type).toBe('route');
      expect(routeZone.routeId).toBe('test_route');
      expect(routeZone.encounterZoneId).toBe('test_encounter_zone');
      expect(routeZone.encountersEnabled).toBe(true);
    });
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const instance1 = getZoneSystem();
      const instance2 = getZoneSystem();
      expect(instance1).toBe(instance2);
    });

    it('should reset singleton', () => {
      const instance1 = getZoneSystem();
      instance1.registerZone({
        id: 'test',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      });

      resetZoneSystem();

      const instance2 = getZoneSystem();
      expect(instance2.getZone('test')).toBeUndefined();
    });
  });

  describe('clear and dispose', () => {
    it('should clear all zones', () => {
      zoneSystem.registerZone({
        id: 'zone1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      });
      zoneSystem.registerZone({
        id: 'zone2',
        type: 'route',
        bounds: aabbFromRadius({ x: 200, z: 200 }, 50),
        transitions: [],
      });

      zoneSystem.clear();

      expect(zoneSystem.getAllZones()).toHaveLength(0);
      expect(zoneSystem.getCurrentZone()).toBeNull();
    });
  });

  describe('debug info', () => {
    it('should return debug info', () => {
      zoneSystem.registerZone({
        id: 'town1',
        type: 'town',
        bounds: aabbFromRadius({ x: 0, z: 0 }, 100),
        transitions: [],
      });
      zoneSystem.registerZone({
        id: 'route1',
        type: 'route',
        bounds: aabbFromRadius({ x: 200, z: 200 }, 50),
        transitions: [],
      });

      const debug = zoneSystem.getDebugInfo();

      expect(debug.zoneCount).toBe(2);
      expect(debug.zonesByType.town).toBe(1);
      expect(debug.zonesByType.route).toBe(1);
    });
  });
});
