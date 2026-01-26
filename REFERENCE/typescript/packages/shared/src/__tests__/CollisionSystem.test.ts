/**
 * Tests for CollisionSystem
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CollisionSystem,
  getCollisionSystem,
  resetCollisionSystem,
  createBuildingCollider,
  createNPCCollider,
  createTriggerCollider,
  createTerrainCollider,
  isCircle,
  isAABB,
  type Collider,
} from '../systems/CollisionSystem';
import { aabbFromRadius, type AABB, type Circle } from '../systems/SpatialHash';

describe('CollisionSystem', () => {
  let collisionSystem: CollisionSystem;

  beforeEach(() => {
    resetCollisionSystem();
    collisionSystem = new CollisionSystem(50);
  });

  afterEach(() => {
    collisionSystem.dispose();
  });

  describe('collider management', () => {
    it('should add a collider', () => {
      const collider: Collider = {
        id: 'test_collider',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };

      collisionSystem.addCollider(collider);

      expect(collisionSystem.getCollider('test_collider')).toBeDefined();
    });

    it('should remove a collider', () => {
      const collider: Collider = {
        id: 'test_collider',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };

      collisionSystem.addCollider(collider);
      collisionSystem.removeCollider('test_collider');

      expect(collisionSystem.getCollider('test_collider')).toBeUndefined();
    });

    it('should update a collider position', () => {
      const collider: Collider = {
        id: 'test_collider',
        layer: 'npc',
        bounds: { center: { x: 0, z: 0 }, radius: 5 } as Circle,
      };

      collisionSystem.addCollider(collider);
      collisionSystem.updateCollider('test_collider', {
        center: { x: 100, z: 100 },
        radius: 5,
      } as Circle);

      const updated = collisionSystem.getCollider('test_collider');
      expect((updated?.bounds as Circle).center).toEqual({ x: 100, z: 100 });
    });

    it('should enable/disable a collider', () => {
      const collider: Collider = {
        id: 'test_collider',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };

      collisionSystem.addCollider(collider);
      collisionSystem.setColliderEnabled('test_collider', false);

      expect(collisionSystem.getCollider('test_collider')?.enabled).toBe(false);
    });

    it('should throw error for collider without ID', () => {
      const collider = {
        id: '',
        layer: 'building' as const,
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      };

      expect(() => collisionSystem.addCollider(collider)).toThrow();
    });
  });

  describe('movement collision detection', () => {
    it('should detect collision with AABB', () => {
      const collider: Collider = {
        id: 'building',
        layer: 'building',
        bounds: { min: { x: 10, z: 10 }, max: { x: 20, z: 20 } },
      };

      collisionSystem.addCollider(collider);

      const result = collisionSystem.checkMovement(
        { x: 5, z: 15 },
        { x: 15, z: 15 },
        1
      );

      expect(result.collided).toBe(true);
      expect(result.collider?.id).toBe('building');
    });

    it('should not collide when target is clear', () => {
      const collider: Collider = {
        id: 'building',
        layer: 'building',
        bounds: { min: { x: 100, z: 100 }, max: { x: 110, z: 110 } },
      };

      collisionSystem.addCollider(collider);

      const result = collisionSystem.checkMovement(
        { x: 0, z: 0 },
        { x: 10, z: 10 },
        1
      );

      expect(result.collided).toBe(false);
    });

    it('should skip disabled colliders', () => {
      const collider: Collider = {
        id: 'building',
        layer: 'building',
        bounds: { min: { x: 10, z: 10 }, max: { x: 20, z: 20 } },
        enabled: false,
      };

      collisionSystem.addCollider(collider);

      const result = collisionSystem.checkMovement(
        { x: 5, z: 15 },
        { x: 15, z: 15 },
        1
      );

      expect(result.collided).toBe(false);
    });

    it('should skip trigger colliders', () => {
      const collider: Collider = {
        id: 'trigger',
        layer: 'trigger',
        bounds: { min: { x: 10, z: 10 }, max: { x: 20, z: 20 } },
        isTrigger: true,
      };

      collisionSystem.addCollider(collider);

      const result = collisionSystem.checkMovement(
        { x: 5, z: 15 },
        { x: 15, z: 15 },
        1
      );

      expect(result.collided).toBe(false);
    });

    it('should respect layer filtering', () => {
      const buildingCollider: Collider = {
        id: 'building',
        layer: 'building',
        bounds: { min: { x: 10, z: 10 }, max: { x: 20, z: 20 } },
      };

      collisionSystem.addCollider(buildingCollider);

      // Should collide when including building layer
      const result1 = collisionSystem.checkMovement(
        { x: 5, z: 15 },
        { x: 15, z: 15 },
        1,
        ['building']
      );
      expect(result1.collided).toBe(true);

      // Should not collide when excluding building layer
      const result2 = collisionSystem.checkMovement(
        { x: 5, z: 15 },
        { x: 15, z: 15 },
        1,
        ['terrain']
      );
      expect(result2.collided).toBe(false);
    });

    it('should detect collision with circle collider', () => {
      const npcCollider: Collider = {
        id: 'npc',
        layer: 'npc',
        bounds: { center: { x: 15, z: 15 }, radius: 5 } as Circle,
      };

      collisionSystem.addCollider(npcCollider);

      const result = collisionSystem.checkMovement(
        { x: 5, z: 15 },
        { x: 15, z: 15 },
        1
      );

      expect(result.collided).toBe(true);
      expect(result.collider?.id).toBe('npc');
    });
  });

  describe('spatial queries', () => {
    it('should query colliders nearby', () => {
      collisionSystem.addCollider({
        id: 'collider1',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      });

      collisionSystem.addCollider({
        id: 'collider2',
        layer: 'npc',
        bounds: { center: { x: 50, z: 50 }, radius: 5 } as Circle,
      });

      collisionSystem.addCollider({
        id: 'collider3',
        layer: 'building',
        bounds: { min: { x: 500, z: 500 }, max: { x: 510, z: 510 } },
      });

      const nearby = collisionSystem.queryNearby({ x: 25, z: 25 }, 50);

      expect(nearby.map((c) => c.id)).toContain('collider1');
      expect(nearby.map((c) => c.id)).toContain('collider2');
      expect(nearby.map((c) => c.id)).not.toContain('collider3');
    });

    it('should query with layer filter', () => {
      collisionSystem.addCollider({
        id: 'building',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      });

      collisionSystem.addCollider({
        id: 'npc',
        layer: 'npc',
        bounds: { center: { x: 5, z: 5 }, radius: 5 } as Circle,
      });

      const buildings = collisionSystem.queryNearby({ x: 5, z: 5 }, 50, ['building']);
      expect(buildings).toHaveLength(1);
      expect(buildings[0].id).toBe('building');
    });

    it('should find nearest collider', () => {
      collisionSystem.addCollider({
        id: 'npc1',
        layer: 'npc',
        bounds: { center: { x: 10, z: 10 }, radius: 5 } as Circle,
      });

      collisionSystem.addCollider({
        id: 'npc2',
        layer: 'npc',
        bounds: { center: { x: 50, z: 50 }, radius: 5 } as Circle,
      });

      const nearest = collisionSystem.queryNearest({ x: 15, z: 15 }, 100, 'npc');
      expect(nearest?.id).toBe('npc1');
    });

    it('should query colliders at point', () => {
      collisionSystem.addCollider({
        id: 'collider1',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 100, z: 100 } },
      });

      collisionSystem.addCollider({
        id: 'collider2',
        layer: 'building',
        bounds: { min: { x: 200, z: 200 }, max: { x: 300, z: 300 } },
      });

      const atPoint = collisionSystem.queryPoint({ x: 50, z: 50 });
      expect(atPoint).toHaveLength(1);
      expect(atPoint[0].id).toBe('collider1');
    });
  });

  describe('trigger handling', () => {
    it('should fire trigger enter callback', () => {
      const callback = vi.fn();
      collisionSystem.onTriggerEnter(callback);

      collisionSystem.addCollider({
        id: 'trigger',
        layer: 'trigger',
        bounds: { min: { x: 0, z: 0 }, max: { x: 100, z: 100 } },
        isTrigger: true,
      });

      collisionSystem.updateTriggers({ x: 50, z: 50 }, 5);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'trigger' })
      );
    });

    it('should fire trigger exit callback', () => {
      const enterCallback = vi.fn();
      const exitCallback = vi.fn();
      collisionSystem.onTriggerEnter(enterCallback);
      collisionSystem.onTriggerExit(exitCallback);

      collisionSystem.addCollider({
        id: 'trigger',
        layer: 'trigger',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
        isTrigger: true,
      });

      // Enter trigger
      collisionSystem.updateTriggers({ x: 5, z: 5 }, 1);
      expect(enterCallback).toHaveBeenCalledTimes(1);

      // Exit trigger
      collisionSystem.updateTriggers({ x: 100, z: 100 }, 1);
      expect(exitCallback).toHaveBeenCalledTimes(1);
    });

    it('should not fire callback twice while in trigger', () => {
      const callback = vi.fn();
      collisionSystem.onTriggerEnter(callback);

      collisionSystem.addCollider({
        id: 'trigger',
        layer: 'trigger',
        bounds: { min: { x: 0, z: 0 }, max: { x: 100, z: 100 } },
        isTrigger: true,
      });

      collisionSystem.updateTriggers({ x: 50, z: 50 }, 5);
      collisionSystem.updateTriggers({ x: 60, z: 60 }, 5);
      collisionSystem.updateTriggers({ x: 70, z: 70 }, 5);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should allow unsubscribing from triggers', () => {
      const callback = vi.fn();
      const unsubscribe = collisionSystem.onTriggerEnter(callback);

      collisionSystem.addCollider({
        id: 'trigger',
        layer: 'trigger',
        bounds: { min: { x: 0, z: 0 }, max: { x: 100, z: 100 } },
        isTrigger: true,
      });

      unsubscribe();
      collisionSystem.updateTriggers({ x: 50, z: 50 }, 5);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('PlayerController integration', () => {
    it('should create collision callback', () => {
      collisionSystem.addCollider({
        id: 'building',
        layer: 'building',
        bounds: { min: { x: 10, z: 10 }, max: { x: 20, z: 20 } },
      });

      const callback = collisionSystem.createCollisionCallback(1);

      const result = callback({ x: 5, z: 15 }, { x: 15, z: 15 });

      expect(result.blocked).toBe(true);
      expect(result.correctedPosition).toBeDefined();
    });
  });

  describe('factory functions', () => {
    it('should create building collider', () => {
      const collider = createBuildingCollider(
        'building1',
        { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
        { buildingId: 'general_store' }
      );

      expect(collider.id).toBe('building1');
      expect(collider.layer).toBe('building');
      expect(collider.isTrigger).toBe(false);
      expect(collider.data).toEqual({ buildingId: 'general_store' });
    });

    it('should create NPC collider', () => {
      const collider = createNPCCollider(
        'npc1',
        { x: 50, z: 50 },
        5,
        { npcId: 'sheriff_jake' }
      );

      expect(collider.id).toBe('npc1');
      expect(collider.layer).toBe('npc');
      expect((collider.bounds as Circle).center).toEqual({ x: 50, z: 50 });
      expect((collider.bounds as Circle).radius).toBe(5);
    });

    it('should create trigger collider', () => {
      const collider = createTriggerCollider(
        'trigger1',
        { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
        { eventId: 'quest_start' }
      );

      expect(collider.id).toBe('trigger1');
      expect(collider.layer).toBe('trigger');
      expect(collider.isTrigger).toBe(true);
    });

    it('should create terrain collider', () => {
      const collider = createTerrainCollider(
        'terrain1',
        { min: { x: 0, z: 0 }, max: { x: 1000, z: 1000 } }
      );

      expect(collider.id).toBe('terrain1');
      expect(collider.layer).toBe('terrain');
    });
  });

  describe('shape type guards', () => {
    it('should identify circle shape', () => {
      const circle: Circle = { center: { x: 0, z: 0 }, radius: 5 };
      expect(isCircle(circle)).toBe(true);
      expect(isAABB(circle)).toBe(false);
    });

    it('should identify AABB shape', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      expect(isAABB(aabb)).toBe(true);
      expect(isCircle(aabb)).toBe(false);
    });
  });

  describe('singleton', () => {
    it('should return same instance', () => {
      const instance1 = getCollisionSystem();
      const instance2 = getCollisionSystem();
      expect(instance1).toBe(instance2);
    });

    it('should reset singleton', () => {
      const instance1 = getCollisionSystem();
      instance1.addCollider({
        id: 'test',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      });

      resetCollisionSystem();

      const instance2 = getCollisionSystem();
      expect(instance2.getCollider('test')).toBeUndefined();
    });
  });

  describe('debug info', () => {
    it('should return debug info', () => {
      collisionSystem.addCollider({
        id: 'building1',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      });

      collisionSystem.addCollider({
        id: 'npc1',
        layer: 'npc',
        bounds: { center: { x: 50, z: 50 }, radius: 5 } as Circle,
      });

      const debug = collisionSystem.getDebugInfo();

      expect(debug.colliderCount).toBe(2);
      expect(debug.collidersByLayer.building).toBe(1);
      expect(debug.collidersByLayer.npc).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all colliders', () => {
      collisionSystem.addCollider({
        id: 'collider1',
        layer: 'building',
        bounds: { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } },
      });

      collisionSystem.addCollider({
        id: 'collider2',
        layer: 'npc',
        bounds: { center: { x: 50, z: 50 }, radius: 5 } as Circle,
      });

      collisionSystem.clear();

      expect(collisionSystem.getAllColliders()).toHaveLength(0);
    });
  });
});
