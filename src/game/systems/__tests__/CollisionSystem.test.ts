/**
 * CollisionSystem.test.ts - Comprehensive tests for collision detection
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
    CollisionSystem,
    createBuildingCollider,
    createNPCCollider,
    createTerrainCollider,
    createTriggerCollider,
    getCollisionSystem,
    isAABB,
    isCircle,
    resetCollisionSystem,
    type Collider,
    type CollisionLayer
} from '../CollisionSystem';
import type { AABB, Circle } from '../SpatialHash';

describe('CollisionSystem', () => {
  let collisionSystem: CollisionSystem;

  beforeEach(() => {
    collisionSystem = new CollisionSystem(50);
  });

  afterEach(() => {
    collisionSystem.dispose();
  });

  describe('constructor', () => {
    it('should create a collision system with default cell size', () => {
      const system = new CollisionSystem();
      expect(system).toBeDefined();
      expect(system.getAllColliders()).toEqual([]);
    });

    it('should create a collision system with custom cell size', () => {
      const system = new CollisionSystem(100);
      expect(system).toBeDefined();
      system.dispose();
    });
  });

  describe('addCollider', () => {
    it('should add a collider to the system', () => {
      const collider: Collider = {
        id: 'test1',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };

      collisionSystem.addCollider(collider);

      expect(collisionSystem.getCollider('test1')).toBeDefined();
      expect(collisionSystem.getAllColliders()).toHaveLength(1);
    });

    it('should set default values for collider properties', () => {
      const collider: Collider = {
        id: 'test1',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };

      collisionSystem.addCollider(collider);
      const added = collisionSystem.getCollider('test1');

      expect(added?.enabled).toBe(true);
      expect(added?.isTrigger).toBe(false);
    });

    it('should replace existing collider with same ID', () => {
      const collider1: Collider = {
        id: 'test1',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };
      const collider2: Collider = {
        id: 'test1',
        layer: 'npc',
        bounds: { center: { x: 50, z: 50 }, radius: 5 },
      };

      collisionSystem.addCollider(collider1);
      collisionSystem.addCollider(collider2);

      expect(collisionSystem.getAllColliders()).toHaveLength(1);
      expect(collisionSystem.getCollider('test1')?.layer).toBe('npc');
    });

    it('should throw error for collider without ID', () => {
      const collider = {
        id: '',
        layer: 'building' as CollisionLayer,
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };

      expect(() => collisionSystem.addCollider(collider)).toThrow('Collider must have an id');
    });

    it('should add colliders with different shapes', () => {
      const aabbCollider: Collider = {
        id: 'aabb',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };
      const circleCollider: Collider = {
        id: 'circle',
        layer: 'npc',
        bounds: { center: { x: 50, z: 50 }, radius: 5 },
      };

      collisionSystem.addCollider(aabbCollider);
      collisionSystem.addCollider(circleCollider);

      expect(collisionSystem.getAllColliders()).toHaveLength(2);
    });
  });

  describe('removeCollider', () => {
    it('should remove a collider from the system', () => {
      const collider: Collider = {
        id: 'test1',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };

      collisionSystem.addCollider(collider);
      collisionSystem.removeCollider('test1');

      expect(collisionSystem.getCollider('test1')).toBeUndefined();
      expect(collisionSystem.getAllColliders()).toHaveLength(0);
    });

    it('should handle removing non-existent collider', () => {
      expect(() => collisionSystem.removeCollider('nonexistent')).not.toThrow();
    });
  });

  describe('updateCollider', () => {
    it('should update collider bounds', () => {
      const collider: Collider = {
        id: 'test1',
        layer: 'npc',
        bounds: { center: { x: 10, z: 10 }, radius: 5 },
      };

      collisionSystem.addCollider(collider);
      collisionSystem.updateCollider('test1', { center: { x: 50, z: 50 }, radius: 5 });

      const updated = collisionSystem.getCollider('test1');
      expect(isCircle(updated!.bounds) && updated!.bounds.center.x).toBe(50);
    });

    it('should handle updating non-existent collider', () => {
      expect(() =>
        collisionSystem.updateCollider('nonexistent', { center: { x: 0, z: 0 }, radius: 5 })
      ).not.toThrow();
    });
  });

  describe('setColliderEnabled', () => {
    it('should enable/disable a collider', () => {
      const collider: Collider = {
        id: 'test1',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };

      collisionSystem.addCollider(collider);
      collisionSystem.setColliderEnabled('test1', false);

      expect(collisionSystem.getCollider('test1')?.enabled).toBe(false);

      collisionSystem.setColliderEnabled('test1', true);
      expect(collisionSystem.getCollider('test1')?.enabled).toBe(true);
    });

    it('should handle setting enabled on non-existent collider', () => {
      expect(() => collisionSystem.setColliderEnabled('nonexistent', true)).not.toThrow();
    });
  });

  describe('checkMovement', () => {
    beforeEach(() => {
      // Add a building collider
      const building: Collider = {
        id: 'building1',
        layer: 'building',
        bounds: { min: { x: 40, z: 40 }, max: { x: 60, z: 60 } },
      };
      collisionSystem.addCollider(building);
    });

    it('should detect collision when moving into a collider', () => {
      const from = { x: 10, z: 50 };
      const to = { x: 50, z: 50 };
      const radius = 5;

      const result = collisionSystem.checkMovement(from, to, radius);

      expect(result.collided).toBe(true);
      expect(result.collider).toBeDefined();
      expect(result.collider?.id).toBe('building1');
    });

    it('should not detect collision when moving away from collider', () => {
      const from = { x: 10, z: 50 };
      const to = { x: 5, z: 50 };
      const radius = 5;

      const result = collisionSystem.checkMovement(from, to, radius);

      expect(result.collided).toBe(false);
    });

    it('should provide corrected position on collision', () => {
      const from = { x: 10, z: 50 };
      const to = { x: 50, z: 50 };
      const radius = 5;

      const result = collisionSystem.checkMovement(from, to, radius);

      expect(result.collided).toBe(true);
      expect(result.correctedPosition).toBeDefined();
    });

    it('should provide collision normal', () => {
      const from = { x: 10, z: 50 };
      const to = { x: 50, z: 50 };
      const radius = 5;

      const result = collisionSystem.checkMovement(from, to, radius);

      expect(result.collided).toBe(true);
      expect(result.normal).toBeDefined();
      expect(result.normal?.x).toBeDefined();
      expect(result.normal?.z).toBeDefined();
    });

    it('should respect layer filtering', () => {
      const from = { x: 10, z: 50 };
      const to = { x: 50, z: 50 };
      const radius = 5;

      // Check only NPC layer (should not collide with building)
      const result = collisionSystem.checkMovement(from, to, radius, ['npc']);

      expect(result.collided).toBe(false);
    });

    it('should ignore disabled colliders', () => {
      collisionSystem.setColliderEnabled('building1', false);

      const from = { x: 10, z: 50 };
      const to = { x: 50, z: 50 };
      const radius = 5;

      const result = collisionSystem.checkMovement(from, to, radius);

      expect(result.collided).toBe(false);
    });

    it('should ignore trigger colliders', () => {
      const trigger: Collider = {
        id: 'trigger1',
        layer: 'trigger',
        bounds: { min: { x: 80, z: 80 }, max: { x: 100, z: 100 } },
        isTrigger: true,
      };
      collisionSystem.addCollider(trigger);

      const from = { x: 70, z: 90 };
      const to = { x: 90, z: 90 };
      const radius = 5;

      const result = collisionSystem.checkMovement(from, to, radius);

      expect(result.collided).toBe(false);
    });

    it('should handle collision with circle collider', () => {
      const npc: Collider = {
        id: 'npc1',
        layer: 'npc',
        bounds: { center: { x: 100, z: 100 }, radius: 10 },
      };
      collisionSystem.addCollider(npc);

      const from = { x: 80, z: 100 };
      const to = { x: 100, z: 100 };
      const radius = 5;

      const result = collisionSystem.checkMovement(from, to, radius);

      expect(result.collided).toBe(true);
      expect(result.collider?.id).toBe('npc1');
    });

    it('should handle movement with large player radius', () => {
      const from = { x: 10, z: 50 };
      const to = { x: 30, z: 50 };
      const radius = 15;

      const result = collisionSystem.checkMovement(from, to, radius);

      expect(result.collided).toBe(true);
    });
  });

  describe('queryNearby', () => {
    beforeEach(() => {
      // Add colliders in a grid
      for (let x = 0; x < 200; x += 50) {
        for (let z = 0; z < 200; z += 50) {
          const collider: Collider = {
            id: `collider_${x}_${z}`,
            layer: x % 100 === 0 ? 'building' : 'npc',
            bounds: { center: { x, z }, radius: 5 },
          };
          collisionSystem.addCollider(collider);
        }
      }
    });

    it('should find nearby colliders', () => {
      const results = collisionSystem.queryNearby({ x: 50, z: 50 }, 30);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by layer', () => {
      const results = collisionSystem.queryNearby({ x: 50, z: 50 }, 30, ['building']);
      expect(results.every((c) => c.layer === 'building')).toBe(true);
    });

    it('should return empty array for empty region', () => {
      const results = collisionSystem.queryNearby({ x: 1000, z: 1000 }, 10);
      expect(results).toEqual([]);
    });

    it('should not return disabled colliders', () => {
      collisionSystem.setColliderEnabled('collider_0_0', false);
      const results = collisionSystem.queryNearby({ x: 0, z: 0 }, 10);
      expect(results.find((c) => c.id === 'collider_0_0')).toBeUndefined();
    });

    it('should handle large radius', () => {
      const results = collisionSystem.queryNearby({ x: 100, z: 100 }, 200);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('queryNearest', () => {
    beforeEach(() => {
      const colliders: Collider[] = [
        {
          id: 'near',
          layer: 'building',
          bounds: { center: { x: 10, z: 10 }, radius: 5 },
        },
        {
          id: 'far',
          layer: 'building',
          bounds: { center: { x: 100, z: 100 }, radius: 5 },
        },
        {
          id: 'medium',
          layer: 'building',
          bounds: { center: { x: 50, z: 50 }, radius: 5 },
        },
      ];
      colliders.forEach((c) => collisionSystem.addCollider(c));
    });

    it('should find nearest collider', () => {
      const nearest = collisionSystem.queryNearest({ x: 0, z: 0 }, 200, 'building');
      expect(nearest?.id).toBe('near');
    });

    it('should return null if no colliders in range', () => {
      // Query far away from all colliders
      const nearest = collisionSystem.queryNearest({ x: 500, z: 500 }, 10, 'building');
      expect(nearest).toBeNull();
    });

    it('should filter by layer', () => {
      const nearest = collisionSystem.queryNearest({ x: 0, z: 0 }, 200, 'npc');
      expect(nearest).toBeNull();
    });

    it('should handle AABB colliders', () => {
      const aabbCollider: Collider = {
        id: 'aabb_near',
        layer: 'building',
        bounds: { min: { x: 2, z: 2 }, max: { x: 8, z: 8 } },
      };
      collisionSystem.addCollider(aabbCollider);

      const nearest = collisionSystem.queryNearest({ x: 0, z: 0 }, 200, 'building');
      expect(nearest?.id).toBe('aabb_near');
    });
  });

  describe('queryPoint', () => {
    beforeEach(() => {
      const colliders: Collider[] = [
        {
          id: 'aabb1',
          layer: 'building',
          bounds: { min: { x: 0, z: 0 }, max: { x: 20, z: 20 } },
        },
        {
          id: 'circle1',
          layer: 'npc',
          bounds: { center: { x: 50, z: 50 }, radius: 10 },
        },
      ];
      colliders.forEach((c) => collisionSystem.addCollider(c));
    });

    it('should find colliders containing a point', () => {
      const results = collisionSystem.queryPoint({ x: 10, z: 10 });
      expect(results.find((c) => c.id === 'aabb1')).toBeDefined();
    });

    it('should find circle colliders containing a point', () => {
      const results = collisionSystem.queryPoint({ x: 50, z: 50 });
      expect(results.find((c) => c.id === 'circle1')).toBeDefined();
    });

    it('should return empty array for point outside all colliders', () => {
      const results = collisionSystem.queryPoint({ x: 1000, z: 1000 });
      expect(results).toEqual([]);
    });

    it('should filter by layer', () => {
      const results = collisionSystem.queryPoint({ x: 10, z: 10 }, ['building']);
      expect(results.every((c) => c.layer === 'building')).toBe(true);
    });

    it('should not return disabled colliders', () => {
      collisionSystem.setColliderEnabled('aabb1', false);
      const results = collisionSystem.queryPoint({ x: 10, z: 10 });
      expect(results.find((c) => c.id === 'aabb1')).toBeUndefined();
    });
  });

  describe('trigger system', () => {
    let enterCallback: jest.Mock;
    let exitCallback: jest.Mock;

    beforeEach(() => {
      enterCallback = jest.fn();
      exitCallback = jest.fn();

      const trigger: Collider = {
        id: 'trigger1',
        layer: 'trigger',
        bounds: { center: { x: 50, z: 50 }, radius: 10 },
        isTrigger: true,
      };
      collisionSystem.addCollider(trigger);

      collisionSystem.onTriggerEnter(enterCallback);
      collisionSystem.onTriggerExit(exitCallback);
    });

    it('should call enter callback when entering trigger', () => {
      collisionSystem.updateTriggers({ x: 50, z: 50 }, 5);
      expect(enterCallback).toHaveBeenCalledTimes(1);
      expect(enterCallback).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'trigger1' })
      );
    });

    it('should call exit callback when leaving trigger', () => {
      // Enter trigger
      collisionSystem.updateTriggers({ x: 50, z: 50 }, 5);
      enterCallback.mockClear();

      // Exit trigger
      collisionSystem.updateTriggers({ x: 100, z: 100 }, 5);
      expect(exitCallback).toHaveBeenCalledTimes(1);
      expect(exitCallback).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'trigger1' })
      );
    });

    it('should not call callbacks when staying in trigger', () => {
      collisionSystem.updateTriggers({ x: 50, z: 50 }, 5);
      enterCallback.mockClear();
      exitCallback.mockClear();

      collisionSystem.updateTriggers({ x: 51, z: 51 }, 5);
      expect(enterCallback).not.toHaveBeenCalled();
      expect(exitCallback).not.toHaveBeenCalled();
    });

    it('should not call callbacks when staying outside trigger', () => {
      collisionSystem.updateTriggers({ x: 100, z: 100 }, 5);
      enterCallback.mockClear();
      exitCallback.mockClear();

      collisionSystem.updateTriggers({ x: 101, z: 101 }, 5);
      expect(enterCallback).not.toHaveBeenCalled();
      expect(exitCallback).not.toHaveBeenCalled();
    });

    it('should handle multiple triggers', () => {
      const trigger2: Collider = {
        id: 'trigger2',
        layer: 'trigger',
        bounds: { center: { x: 100, z: 100 }, radius: 10 },
        isTrigger: true,
      };
      collisionSystem.addCollider(trigger2);

      collisionSystem.updateTriggers({ x: 50, z: 50 }, 5);
      expect(enterCallback).toHaveBeenCalledTimes(1);

      enterCallback.mockClear();
      collisionSystem.updateTriggers({ x: 100, z: 100 }, 5);
      expect(exitCallback).toHaveBeenCalledTimes(1);
      expect(enterCallback).toHaveBeenCalledTimes(1);
    });

    it('should allow unsubscribing from callbacks', () => {
      const unsubscribe = collisionSystem.onTriggerEnter(enterCallback);
      unsubscribe();

      collisionSystem.updateTriggers({ x: 50, z: 50 }, 5);
      expect(enterCallback).not.toHaveBeenCalled();
    });

    it('should not trigger on disabled colliders', () => {
      collisionSystem.setColliderEnabled('trigger1', false);
      collisionSystem.updateTriggers({ x: 50, z: 50 }, 5);
      expect(enterCallback).not.toHaveBeenCalled();
    });

    it('should handle AABB triggers', () => {
      const aabbTrigger: Collider = {
        id: 'aabb_trigger',
        layer: 'trigger',
        bounds: { min: { x: 0, z: 0 }, max: { x: 20, z: 20 } },
        isTrigger: true,
      };
      collisionSystem.addCollider(aabbTrigger);

      collisionSystem.updateTriggers({ x: 10, z: 10 }, 5);
      expect(enterCallback).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'aabb_trigger' })
      );
    });
  });

  describe('createCollisionCallback', () => {
    beforeEach(() => {
      const building: Collider = {
        id: 'building1',
        layer: 'building',
        bounds: { min: { x: 40, z: 40 }, max: { x: 60, z: 60 } },
      };
      collisionSystem.addCollider(building);
    });

    it('should create a callback that detects collisions', () => {
      const callback = collisionSystem.createCollisionCallback(5);
      const result = callback({ x: 10, z: 50 }, { x: 50, z: 50 });

      expect(result.blocked).toBe(true);
      expect(result.correctedPosition).toBeDefined();
    });

    it('should create a callback that allows free movement', () => {
      const callback = collisionSystem.createCollisionCallback(5);
      const result = callback({ x: 10, z: 50 }, { x: 20, z: 50 });

      expect(result.blocked).toBe(false);
    });

    it('should respect layer filtering in callback', () => {
      const callback = collisionSystem.createCollisionCallback(5, ['npc']);
      const result = callback({ x: 10, z: 50 }, { x: 50, z: 50 });

      expect(result.blocked).toBe(false);
    });
  });

  describe('clear and dispose', () => {
    it('should clear all colliders', () => {
      const colliders: Collider[] = [
        {
          id: 'c1',
          layer: 'building',
          bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
        },
        {
          id: 'c2',
          layer: 'npc',
          bounds: { center: { x: 50, z: 50 }, radius: 5 },
        },
      ];
      colliders.forEach((c) => collisionSystem.addCollider(c));

      collisionSystem.clear();

      expect(collisionSystem.getAllColliders()).toEqual([]);
    });

    it('should dispose and clean up callbacks', () => {
      const callback = jest.fn();
      collisionSystem.onTriggerEnter(callback);

      collisionSystem.dispose();

      // Should not crash when trying to update triggers after dispose
      expect(() => collisionSystem.updateTriggers({ x: 0, z: 0 }, 5)).not.toThrow();
    });
  });

  describe('getDebugInfo', () => {
    it('should return debug information', () => {
      const colliders: Collider[] = [
        {
          id: 'building1',
          layer: 'building',
          bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
        },
        {
          id: 'npc1',
          layer: 'npc',
          bounds: { center: { x: 50, z: 50 }, radius: 5 },
        },
        {
          id: 'trigger1',
          layer: 'trigger',
          bounds: { center: { x: 100, z: 100 }, radius: 10 },
          isTrigger: true,
        },
      ];
      colliders.forEach((c) => collisionSystem.addCollider(c));

      // Activate a trigger
      collisionSystem.updateTriggers({ x: 100, z: 100 }, 5);

      const debugInfo = collisionSystem.getDebugInfo();

      expect(debugInfo.colliderCount).toBe(3);
      expect(debugInfo.activeTriggers).toBe(1);
      expect(debugInfo.collidersByLayer.building).toBe(1);
      expect(debugInfo.collidersByLayer.npc).toBe(1);
      expect(debugInfo.collidersByLayer.trigger).toBe(1);
      expect(debugInfo.spatialHashInfo).toBeDefined();
    });

    it('should return zero counts when empty', () => {
      const debugInfo = collisionSystem.getDebugInfo();

      expect(debugInfo.colliderCount).toBe(0);
      expect(debugInfo.activeTriggers).toBe(0);
      expect(debugInfo.collidersByLayer.building).toBe(0);
    });
  });

  describe('performance edge cases', () => {
    it('should handle many colliders efficiently', () => {
      const startTime = Date.now();

      // Add 500 colliders
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * 1000;
        const z = Math.random() * 1000;
        const collider: Collider = {
          id: `collider_${i}`,
          layer: i % 2 === 0 ? 'building' : 'npc',
          bounds: { center: { x, z }, radius: 5 },
        };
        collisionSystem.addCollider(collider);
      }

      const addTime = Date.now() - startTime;

      // Query should be fast
      const queryStart = Date.now();
      collisionSystem.queryNearby({ x: 500, z: 500 }, 50);
      const queryTime = Date.now() - queryStart;

      // Movement check should be fast
      const moveStart = Date.now();
      collisionSystem.checkMovement({ x: 0, z: 0 }, { x: 10, z: 10 }, 5);
      const moveTime = Date.now() - moveStart;

      expect(addTime).toBeLessThan(500);
      expect(queryTime).toBeLessThan(50);
      expect(moveTime).toBeLessThan(50);
    });

    it('should handle colliders at extreme coordinates', () => {
      const colliders: Collider[] = [
        {
          id: 'far_negative',
          layer: 'building',
          bounds: { center: { x: -10000, z: -10000 }, radius: 5 },
        },
        {
          id: 'far_positive',
          layer: 'building',
          bounds: { center: { x: 10000, z: 10000 }, radius: 5 },
        },
      ];
      colliders.forEach((c) => collisionSystem.addCollider(c));

      const result1 = collisionSystem.queryPoint({ x: -10000, z: -10000 });
      const result2 = collisionSystem.queryPoint({ x: 10000, z: 10000 });

      expect(result1.find((c) => c.id === 'far_negative')).toBeDefined();
      expect(result2.find((c) => c.id === 'far_positive')).toBeDefined();
    });

    it('should handle very small colliders', () => {
      const collider: Collider = {
        id: 'tiny',
        layer: 'npc',
        bounds: { center: { x: 50, z: 50 }, radius: 0.01 },
      };
      collisionSystem.addCollider(collider);

      const result = collisionSystem.queryPoint({ x: 50, z: 50 });
      expect(result.find((c) => c.id === 'tiny')).toBeDefined();
    });

    it('should handle very large colliders', () => {
      const collider: Collider = {
        id: 'huge',
        layer: 'terrain',
        bounds: { min: { x: -1000, z: -1000 }, max: { x: 1000, z: 1000 } },
      };
      collisionSystem.addCollider(collider);

      const result = collisionSystem.queryPoint({ x: 0, z: 0 });
      expect(result.find((c) => c.id === 'huge')).toBeDefined();
    });
  });

  describe('boundary conditions', () => {
    it('should handle zero radius movement check', () => {
      const collider: Collider = {
        id: 'building1',
        layer: 'building',
        bounds: { min: { x: 40, z: 40 }, max: { x: 60, z: 60 } },
      };
      collisionSystem.addCollider(collider);

      const result = collisionSystem.checkMovement({ x: 50, z: 50 }, { x: 50, z: 50 }, 0);
      expect(result.collided).toBe(true);
    });

    it('should handle movement with no distance', () => {
      const result = collisionSystem.checkMovement({ x: 10, z: 10 }, { x: 10, z: 10 }, 5);
      expect(result.collided).toBe(false);
    });

    it('should handle overlapping colliders', () => {
      const colliders: Collider[] = [
        {
          id: 'overlap1',
          layer: 'building',
          bounds: { min: { x: 0, z: 0 }, max: { x: 20, z: 20 } },
        },
        {
          id: 'overlap2',
          layer: 'building',
          bounds: { min: { x: 10, z: 10 }, max: { x: 30, z: 30 } },
        },
      ];
      colliders.forEach((c) => collisionSystem.addCollider(c));

      const results = collisionSystem.queryPoint({ x: 15, z: 15 });
      expect(results.length).toBe(2);
    });

    it('should handle collider at origin', () => {
      const collider: Collider = {
        id: 'origin',
        layer: 'building',
        bounds: { center: { x: 0, z: 0 }, radius: 5 },
      };
      collisionSystem.addCollider(collider);

      const result = collisionSystem.queryPoint({ x: 0, z: 0 });
      expect(result.find((c) => c.id === 'origin')).toBeDefined();
    });

    it('should handle negative coordinates', () => {
      const collider: Collider = {
        id: 'negative',
        layer: 'building',
        bounds: { min: { x: -20, z: -20 }, max: { x: -10, z: -10 } },
      };
      collisionSystem.addCollider(collider);

      const result = collisionSystem.queryPoint({ x: -15, z: -15 });
      expect(result.find((c) => c.id === 'negative')).toBeDefined();
    });
  });
});

// ============================================================================
// SINGLETON TESTS
// ============================================================================

describe('Singleton Functions', () => {
  afterEach(() => {
    resetCollisionSystem();
  });

  describe('getCollisionSystem', () => {
    it('should return singleton instance', () => {
      const system1 = getCollisionSystem();
      const system2 = getCollisionSystem();

      expect(system1).toBe(system2);
    });

    it('should persist data across calls', () => {
      const system1 = getCollisionSystem();
      const collider: Collider = {
        id: 'test',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };
      system1.addCollider(collider);

      const system2 = getCollisionSystem();
      expect(system2.getCollider('test')).toBeDefined();
    });
  });

  describe('resetCollisionSystem', () => {
    it('should reset singleton instance', () => {
      const system1 = getCollisionSystem();
      const collider: Collider = {
        id: 'test',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };
      system1.addCollider(collider);

      resetCollisionSystem();

      const system2 = getCollisionSystem();
      expect(system2.getCollider('test')).toBeUndefined();
    });
  });
});

// ============================================================================
// FACTORY FUNCTION TESTS
// ============================================================================

describe('Factory Functions', () => {
  describe('createBuildingCollider', () => {
    it('should create a building collider', () => {
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const collider = createBuildingCollider('building1', bounds, { buildingType: 'saloon' });

      expect(collider.id).toBe('building1');
      expect(collider.layer).toBe('building');
      expect(collider.bounds).toEqual(bounds);
      expect(collider.enabled).toBe(true);
      expect(collider.isTrigger).toBe(false);
      expect(collider.data).toEqual({ buildingType: 'saloon' });
    });
  });

  describe('createNPCCollider', () => {
    it('should create an NPC collider', () => {
      const center = { x: 50, z: 50 };
      const collider = createNPCCollider('npc1', center, 5, { npcName: 'Sheriff' });

      expect(collider.id).toBe('npc1');
      expect(collider.layer).toBe('npc');
      expect(isCircle(collider.bounds)).toBe(true);
      if (isCircle(collider.bounds)) {
        expect(collider.bounds.center).toEqual(center);
        expect(collider.bounds.radius).toBe(5);
      }
      expect(collider.enabled).toBe(true);
      expect(collider.isTrigger).toBe(false);
      expect(collider.data).toEqual({ npcName: 'Sheriff' });
    });
  });

  describe('createTriggerCollider', () => {
    it('should create a trigger collider with AABB', () => {
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const collider = createTriggerCollider('trigger1', bounds, { eventId: 'quest_start' });

      expect(collider.id).toBe('trigger1');
      expect(collider.layer).toBe('trigger');
      expect(collider.bounds).toEqual(bounds);
      expect(collider.enabled).toBe(true);
      expect(collider.isTrigger).toBe(true);
      expect(collider.data).toEqual({ eventId: 'quest_start' });
    });

    it('should create a trigger collider with Circle', () => {
      const bounds: Circle = { center: { x: 50, z: 50 }, radius: 10 };
      const collider = createTriggerCollider('trigger2', bounds);

      expect(collider.id).toBe('trigger2');
      expect(collider.layer).toBe('trigger');
      expect(collider.bounds).toEqual(bounds);
      expect(collider.isTrigger).toBe(true);
    });
  });

  describe('createTerrainCollider', () => {
    it('should create a terrain collider', () => {
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 100, z: 100 } };
      const collider = createTerrainCollider('terrain1', bounds);

      expect(collider.id).toBe('terrain1');
      expect(collider.layer).toBe('terrain');
      expect(collider.bounds).toEqual(bounds);
      expect(collider.enabled).toBe(true);
      expect(collider.isTrigger).toBe(false);
    });
  });
});

// ============================================================================
// TYPE GUARD TESTS
// ============================================================================

describe('Type Guards', () => {
  describe('isCircle', () => {
    it('should identify circle shapes', () => {
      const circle: Circle = { center: { x: 0, z: 0 }, radius: 5 };
      expect(isCircle(circle)).toBe(true);
    });

    it('should reject AABB shapes', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      expect(isCircle(aabb)).toBe(false);
    });
  });

  describe('isAABB', () => {
    it('should identify AABB shapes', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      expect(isAABB(aabb)).toBe(true);
    });

    it('should reject circle shapes', () => {
      const circle: Circle = { center: { x: 0, z: 0 }, radius: 5 };
      expect(isAABB(circle)).toBe(false);
    });
  });
});
