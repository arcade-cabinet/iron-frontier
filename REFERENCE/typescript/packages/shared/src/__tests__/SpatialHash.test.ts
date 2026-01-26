/**
 * Tests for SpatialHash spatial partitioning system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SpatialHash,
  aabbIntersects,
  aabbContainsPoint,
  circleToAABB,
  aabbCircleIntersects,
  circleIntersects,
  circleContainsPoint,
  aabbFromRadius,
  aabbFromCenter,
  type AABB,
  type Circle,
} from '../systems/SpatialHash';

describe('SpatialHash', () => {
  let spatialHash: SpatialHash<string>;

  beforeEach(() => {
    spatialHash = new SpatialHash<string>(50);
  });

  describe('insert and query', () => {
    it('should insert and query items', () => {
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      spatialHash.insert('item1', bounds);

      const result = spatialHash.query(bounds);
      expect(result).toContain('item1');
    });

    it('should return empty array when no items match', () => {
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      spatialHash.insert('item1', bounds);

      const farBounds: AABB = { min: { x: 1000, z: 1000 }, max: { x: 1010, z: 1010 } };
      const result = spatialHash.query(farBounds);
      expect(result).toHaveLength(0);
    });

    it('should handle items spanning multiple cells', () => {
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 100, z: 100 } };
      spatialHash.insert('large_item', bounds);

      // Query at different parts of the item
      expect(spatialHash.query({ min: { x: 0, z: 0 }, max: { x: 10, z: 10 } })).toContain(
        'large_item'
      );
      expect(spatialHash.query({ min: { x: 50, z: 50 }, max: { x: 60, z: 60 } })).toContain(
        'large_item'
      );
      expect(spatialHash.query({ min: { x: 90, z: 90 }, max: { x: 100, z: 100 } })).toContain(
        'large_item'
      );
    });
  });

  describe('remove', () => {
    it('should remove items', () => {
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      spatialHash.insert('item1', bounds);
      spatialHash.remove('item1');

      const result = spatialHash.query(bounds);
      expect(result).not.toContain('item1');
    });

    it('should handle removing non-existent items', () => {
      expect(() => spatialHash.remove('nonexistent')).not.toThrow();
    });
  });

  describe('update', () => {
    it('should update item position', () => {
      const bounds1: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const bounds2: AABB = { min: { x: 100, z: 100 }, max: { x: 110, z: 110 } };

      spatialHash.insert('item1', bounds1);
      spatialHash.update('item1', bounds2);

      expect(spatialHash.query(bounds1)).not.toContain('item1');
      expect(spatialHash.query(bounds2)).toContain('item1');
    });
  });

  describe('queryRadius', () => {
    it('should find items within radius', () => {
      const bounds: AABB = { min: { x: 10, z: 10 }, max: { x: 20, z: 20 } };
      spatialHash.insert('item1', bounds);

      const result = spatialHash.queryRadius({ x: 15, z: 15 }, 50);
      expect(result).toContain('item1');
    });

    it('should not find items outside radius', () => {
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      spatialHash.insert('item1', bounds);

      const result = spatialHash.queryRadius({ x: 1000, z: 1000 }, 10);
      expect(result).not.toContain('item1');
    });
  });

  describe('queryPoint', () => {
    it('should find items containing a point', () => {
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 100, z: 100 } };
      spatialHash.insert('item1', bounds);

      const result = spatialHash.queryPoint({ x: 50, z: 50 });
      expect(result).toContain('item1');
    });

    it('should not find items not containing the point', () => {
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      spatialHash.insert('item1', bounds);

      const result = spatialHash.queryPoint({ x: 50, z: 50 });
      expect(result).not.toContain('item1');
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      spatialHash.insert('item1', { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } });
      spatialHash.insert('item2', { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } });

      spatialHash.clear();

      expect(spatialHash.size).toBe(0);
    });
  });

  describe('size', () => {
    it('should track number of items', () => {
      expect(spatialHash.size).toBe(0);

      spatialHash.insert('item1', { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } });
      expect(spatialHash.size).toBe(1);

      spatialHash.insert('item2', { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } });
      expect(spatialHash.size).toBe(2);

      spatialHash.remove('item1');
      expect(spatialHash.size).toBe(1);
    });
  });
});

describe('AABB utility functions', () => {
  describe('aabbIntersects', () => {
    it('should return true for overlapping AABBs', () => {
      const a: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const b: AABB = { min: { x: 5, z: 5 }, max: { x: 15, z: 15 } };
      expect(aabbIntersects(a, b)).toBe(true);
    });

    it('should return true for touching AABBs', () => {
      const a: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const b: AABB = { min: { x: 10, z: 10 }, max: { x: 20, z: 20 } };
      expect(aabbIntersects(a, b)).toBe(true);
    });

    it('should return false for non-overlapping AABBs', () => {
      const a: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const b: AABB = { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } };
      expect(aabbIntersects(a, b)).toBe(false);
    });
  });

  describe('aabbContainsPoint', () => {
    it('should return true for point inside AABB', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      expect(aabbContainsPoint(aabb, { x: 5, z: 5 })).toBe(true);
    });

    it('should return true for point on AABB boundary', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      expect(aabbContainsPoint(aabb, { x: 0, z: 0 })).toBe(true);
      expect(aabbContainsPoint(aabb, { x: 10, z: 10 })).toBe(true);
    });

    it('should return false for point outside AABB', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      expect(aabbContainsPoint(aabb, { x: 15, z: 5 })).toBe(false);
    });
  });

  describe('aabbFromRadius', () => {
    it('should create AABB from center and radius', () => {
      const aabb = aabbFromRadius({ x: 100, z: 100 }, 50);
      expect(aabb.min).toEqual({ x: 50, z: 50 });
      expect(aabb.max).toEqual({ x: 150, z: 150 });
    });
  });

  describe('aabbFromCenter', () => {
    it('should create AABB from center and half extents', () => {
      const aabb = aabbFromCenter({ x: 100, z: 100 }, 30, 20);
      expect(aabb.min).toEqual({ x: 70, z: 80 });
      expect(aabb.max).toEqual({ x: 130, z: 120 });
    });
  });
});

describe('Circle utility functions', () => {
  describe('circleToAABB', () => {
    it('should convert circle to AABB', () => {
      const circle: Circle = { center: { x: 100, z: 100 }, radius: 25 };
      const aabb = circleToAABB(circle);
      expect(aabb.min).toEqual({ x: 75, z: 75 });
      expect(aabb.max).toEqual({ x: 125, z: 125 });
    });
  });

  describe('circleIntersects', () => {
    it('should return true for overlapping circles', () => {
      const a: Circle = { center: { x: 0, z: 0 }, radius: 10 };
      const b: Circle = { center: { x: 15, z: 0 }, radius: 10 };
      expect(circleIntersects(a, b)).toBe(true);
    });

    it('should return true for touching circles', () => {
      const a: Circle = { center: { x: 0, z: 0 }, radius: 10 };
      const b: Circle = { center: { x: 20, z: 0 }, radius: 10 };
      expect(circleIntersects(a, b)).toBe(true);
    });

    it('should return false for non-overlapping circles', () => {
      const a: Circle = { center: { x: 0, z: 0 }, radius: 10 };
      const b: Circle = { center: { x: 30, z: 0 }, radius: 10 };
      expect(circleIntersects(a, b)).toBe(false);
    });
  });

  describe('circleContainsPoint', () => {
    it('should return true for point inside circle', () => {
      const circle: Circle = { center: { x: 0, z: 0 }, radius: 10 };
      expect(circleContainsPoint(circle, { x: 5, z: 5 })).toBe(true);
    });

    it('should return true for point on circle boundary', () => {
      const circle: Circle = { center: { x: 0, z: 0 }, radius: 10 };
      expect(circleContainsPoint(circle, { x: 10, z: 0 })).toBe(true);
    });

    it('should return false for point outside circle', () => {
      const circle: Circle = { center: { x: 0, z: 0 }, radius: 10 };
      expect(circleContainsPoint(circle, { x: 15, z: 0 })).toBe(false);
    });
  });

  describe('aabbCircleIntersects', () => {
    it('should return true for overlapping AABB and circle', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const circle: Circle = { center: { x: 15, z: 5 }, radius: 10 };
      expect(aabbCircleIntersects(aabb, circle)).toBe(true);
    });

    it('should return true for circle inside AABB', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 100, z: 100 } };
      const circle: Circle = { center: { x: 50, z: 50 }, radius: 10 };
      expect(aabbCircleIntersects(aabb, circle)).toBe(true);
    });

    it('should return false for non-overlapping AABB and circle', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const circle: Circle = { center: { x: 50, z: 50 }, radius: 10 };
      expect(aabbCircleIntersects(aabb, circle)).toBe(false);
    });
  });
});
