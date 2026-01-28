/**
 * SpatialHash.test.ts - Comprehensive tests for spatial partitioning
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import {
    aabbCenter,
    aabbCircleIntersects,
    aabbContainsPoint,
    aabbExpand,
    aabbFromCenter,
    aabbFromRadius,
    aabbIntersects,
    circleContainsPoint,
    circleIntersects,
    circleToAABB,
    SpatialHash,
    type AABB,
    type Circle,
} from '../SpatialHash';

// Test item type
interface TestItem {
  id: string;
  position: { x: number; z: number };
}

describe('SpatialHash', () => {
  let spatialHash: SpatialHash<TestItem>;
  const cellSize = 50;

  beforeEach(() => {
    spatialHash = new SpatialHash<TestItem>(cellSize);
  });

  describe('constructor', () => {
    it('should create a spatial hash with valid cell size', () => {
      const hash = new SpatialHash<TestItem>(100);
      expect(hash).toBeDefined();
      expect(hash.size).toBe(0);
    });

    it('should throw error for invalid cell size', () => {
      expect(() => new SpatialHash<TestItem>(0)).toThrow('Cell size must be positive');
      expect(() => new SpatialHash<TestItem>(-10)).toThrow('Cell size must be positive');
    });
  });

  describe('insert', () => {
    it('should insert an item into the spatial hash', () => {
      const item: TestItem = { id: 'item1', position: { x: 25, z: 25 } };
      const bounds: AABB = { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } };

      spatialHash.insert(item, bounds);

      expect(spatialHash.size).toBe(1);
      expect(spatialHash.has(item)).toBe(true);
    });

    it('should insert multiple items', () => {
      const items: TestItem[] = [
        { id: 'item1', position: { x: 25, z: 25 } },
        { id: 'item2', position: { x: 75, z: 75 } },
        { id: 'item3', position: { x: 125, z: 125 } },
      ];

      items.forEach((item, i) => {
        const bounds: AABB = {
          min: { x: item.position.x - 5, z: item.position.z - 5 },
          max: { x: item.position.x + 5, z: item.position.z + 5 },
        };
        spatialHash.insert(item, bounds);
      });

      expect(spatialHash.size).toBe(3);
      items.forEach((item) => {
        expect(spatialHash.has(item)).toBe(true);
      });
    });

    it('should replace existing item when inserting with same reference', () => {
      const item: TestItem = { id: 'item1', position: { x: 25, z: 25 } };
      const bounds1: AABB = { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } };
      const bounds2: AABB = { min: { x: 70, z: 70 }, max: { x: 80, z: 80 } };

      spatialHash.insert(item, bounds1);
      spatialHash.insert(item, bounds2);

      expect(spatialHash.size).toBe(1);
      expect(spatialHash.getBounds(item)).toEqual(bounds2);
    });

    it('should handle items spanning multiple cells', () => {
      const item: TestItem = { id: 'large', position: { x: 50, z: 50 } };
      const bounds: AABB = { min: { x: 0, z: 0 }, max: { x: 100, z: 100 } };

      spatialHash.insert(item, bounds);

      expect(spatialHash.size).toBe(1);
      const debugInfo = spatialHash.getDebugInfo();
      expect(debugInfo.cellCount).toBeGreaterThan(1);
    });
  });

  describe('remove', () => {
    it('should remove an item from the spatial hash', () => {
      const item: TestItem = { id: 'item1', position: { x: 25, z: 25 } };
      const bounds: AABB = { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } };

      spatialHash.insert(item, bounds);
      spatialHash.remove(item);

      expect(spatialHash.size).toBe(0);
      expect(spatialHash.has(item)).toBe(false);
    });

    it('should handle removing non-existent item', () => {
      const item: TestItem = { id: 'item1', position: { x: 25, z: 25 } };

      expect(() => spatialHash.remove(item)).not.toThrow();
      expect(spatialHash.size).toBe(0);
    });

    it('should clean up empty cells after removal', () => {
      const item: TestItem = { id: 'item1', position: { x: 25, z: 25 } };
      const bounds: AABB = { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } };

      spatialHash.insert(item, bounds);
      const cellCountBefore = spatialHash.getDebugInfo().cellCount;

      spatialHash.remove(item);
      const cellCountAfter = spatialHash.getDebugInfo().cellCount;

      expect(cellCountAfter).toBe(0);
    });
  });

  describe('update', () => {
    it('should update an item position', () => {
      const item: TestItem = { id: 'item1', position: { x: 25, z: 25 } };
      const bounds1: AABB = { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } };
      const bounds2: AABB = { min: { x: 70, z: 70 }, max: { x: 80, z: 80 } };

      spatialHash.insert(item, bounds1);
      spatialHash.update(item, bounds2);

      expect(spatialHash.size).toBe(1);
      expect(spatialHash.getBounds(item)).toEqual(bounds2);
    });

    it('should insert item if not present during update', () => {
      const item: TestItem = { id: 'item1', position: { x: 25, z: 25 } };
      const bounds: AABB = { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } };

      spatialHash.update(item, bounds);

      expect(spatialHash.size).toBe(1);
      expect(spatialHash.has(item)).toBe(true);
    });

    it('should efficiently update when moving within same cell', () => {
      const item: TestItem = { id: 'item1', position: { x: 25, z: 25 } };
      const bounds1: AABB = { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } };
      const bounds2: AABB = { min: { x: 22, z: 22 }, max: { x: 32, z: 32 } };

      spatialHash.insert(item, bounds1);
      const cellCountBefore = spatialHash.getDebugInfo().cellCount;

      spatialHash.update(item, bounds2);
      const cellCountAfter = spatialHash.getDebugInfo().cellCount;

      expect(spatialHash.size).toBe(1);
      expect(cellCountAfter).toBe(cellCountBefore);
    });

    it('should update cells when moving across cell boundaries', () => {
      const item: TestItem = { id: 'item1', position: { x: 25, z: 25 } };
      const bounds1: AABB = { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } };
      const bounds2: AABB = { min: { x: 120, z: 120 }, max: { x: 130, z: 130 } };

      spatialHash.insert(item, bounds1);
      spatialHash.update(item, bounds2);

      const results = spatialHash.query(bounds2);
      expect(results).toContain(item);

      const oldResults = spatialHash.query(bounds1);
      expect(oldResults).not.toContain(item);
    });
  });

  describe('query', () => {
    beforeEach(() => {
      // Insert test items in a grid pattern
      for (let x = 0; x < 200; x += 50) {
        for (let z = 0; z < 200; z += 50) {
          const item: TestItem = { id: `item_${x}_${z}`, position: { x, z } };
          const bounds: AABB = {
            min: { x: x - 5, z: z - 5 },
            max: { x: x + 5, z: z + 5 },
          };
          spatialHash.insert(item, bounds);
        }
      }
    });

    it('should query items in a specific region', () => {
      const queryBounds: AABB = { min: { x: 0, z: 0 }, max: { x: 60, z: 60 } };
      const results = spatialHash.query(queryBounds);

      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(9); // Max 3x3 grid
    });

    it('should return empty array for empty region', () => {
      const queryBounds: AABB = { min: { x: 500, z: 500 }, max: { x: 600, z: 600 } };
      const results = spatialHash.query(queryBounds);

      expect(results).toEqual([]);
    });

    it('should not return duplicate items', () => {
      const queryBounds: AABB = { min: { x: 0, z: 0 }, max: { x: 100, z: 100 } };
      const results = spatialHash.query(queryBounds);

      const uniqueIds = new Set(results.map((item) => item.id));
      expect(results.length).toBe(uniqueIds.size);
    });
  });

  describe('queryRadius', () => {
    beforeEach(() => {
      // Insert items in a circle pattern
      const center = { x: 100, z: 100 };
      const radius = 50;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const x = center.x + Math.cos(angle) * radius;
        const z = center.z + Math.sin(angle) * radius;
        const item: TestItem = { id: `item_${angle}`, position: { x, z } };
        const bounds: AABB = {
          min: { x: x - 5, z: z - 5 },
          max: { x: x + 5, z: z + 5 },
        };
        spatialHash.insert(item, bounds);
      }
    });

    it('should query items within radius', () => {
      const results = spatialHash.queryRadius({ x: 100, z: 100 }, 60);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for radius with no items', () => {
      const results = spatialHash.queryRadius({ x: 500, z: 500 }, 10);
      expect(results).toEqual([]);
    });

    it('should handle zero radius', () => {
      const results = spatialHash.queryRadius({ x: 100, z: 100 }, 0);
      expect(results).toBeDefined();
    });

    it('should handle large radius', () => {
      const results = spatialHash.queryRadius({ x: 100, z: 100 }, 1000);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('queryPoint', () => {
    it('should find items containing a point', () => {
      const item: TestItem = { id: 'item1', position: { x: 50, z: 50 } };
      const bounds: AABB = { min: { x: 40, z: 40 }, max: { x: 60, z: 60 } };

      spatialHash.insert(item, bounds);

      const results = spatialHash.queryPoint({ x: 50, z: 50 });
      expect(results).toContain(item);
    });

    it('should return empty array for point outside all bounds', () => {
      const item: TestItem = { id: 'item1', position: { x: 50, z: 50 } };
      const bounds: AABB = { min: { x: 40, z: 40 }, max: { x: 60, z: 60 } };

      spatialHash.insert(item, bounds);

      const results = spatialHash.queryPoint({ x: 100, z: 100 });
      expect(results).toEqual([]);
    });

    it('should handle point on boundary', () => {
      const item: TestItem = { id: 'item1', position: { x: 50, z: 50 } };
      const bounds: AABB = { min: { x: 40, z: 40 }, max: { x: 60, z: 60 } };

      spatialHash.insert(item, bounds);

      const results = spatialHash.queryPoint({ x: 40, z: 40 });
      expect(results).toContain(item);
    });

    it('should return multiple items if point is in multiple bounds', () => {
      const item1: TestItem = { id: 'item1', position: { x: 50, z: 50 } };
      const item2: TestItem = { id: 'item2', position: { x: 55, z: 55 } };
      const bounds1: AABB = { min: { x: 40, z: 40 }, max: { x: 60, z: 60 } };
      const bounds2: AABB = { min: { x: 45, z: 45 }, max: { x: 65, z: 65 } };

      spatialHash.insert(item1, bounds1);
      spatialHash.insert(item2, bounds2);

      const results = spatialHash.queryPoint({ x: 50, z: 50 });
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getBounds', () => {
    it('should return bounds for existing item', () => {
      const item: TestItem = { id: 'item1', position: { x: 50, z: 50 } };
      const bounds: AABB = { min: { x: 40, z: 40 }, max: { x: 60, z: 60 } };

      spatialHash.insert(item, bounds);

      expect(spatialHash.getBounds(item)).toEqual(bounds);
    });

    it('should return undefined for non-existent item', () => {
      const item: TestItem = { id: 'item1', position: { x: 50, z: 50 } };

      expect(spatialHash.getBounds(item)).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      const items: TestItem[] = [
        { id: 'item1', position: { x: 25, z: 25 } },
        { id: 'item2', position: { x: 75, z: 75 } },
      ];

      items.forEach((item) => {
        const bounds: AABB = {
          min: { x: item.position.x - 5, z: item.position.z - 5 },
          max: { x: item.position.x + 5, z: item.position.z + 5 },
        };
        spatialHash.insert(item, bounds);
      });

      spatialHash.clear();

      expect(spatialHash.size).toBe(0);
      expect(spatialHash.getDebugInfo().cellCount).toBe(0);
    });
  });

  describe('getAll', () => {
    it('should return all items', () => {
      const items: TestItem[] = [
        { id: 'item1', position: { x: 25, z: 25 } },
        { id: 'item2', position: { x: 75, z: 75 } },
        { id: 'item3', position: { x: 125, z: 125 } },
      ];

      items.forEach((item) => {
        const bounds: AABB = {
          min: { x: item.position.x - 5, z: item.position.z - 5 },
          max: { x: item.position.x + 5, z: item.position.z + 5 },
        };
        spatialHash.insert(item, bounds);
      });

      const allItems = spatialHash.getAll();
      expect(allItems.length).toBe(3);
      items.forEach((item) => {
        expect(allItems).toContain(item);
      });
    });

    it('should return empty array when empty', () => {
      expect(spatialHash.getAll()).toEqual([]);
    });
  });

  describe('performance edge cases', () => {
    it('should handle many items efficiently', () => {
      const itemCount = 1000;
      const startTime = Date.now();

      // Insert many items
      for (let i = 0; i < itemCount; i++) {
        const x = Math.random() * 1000;
        const z = Math.random() * 1000;
        const item: TestItem = { id: `item_${i}`, position: { x, z } };
        const bounds: AABB = {
          min: { x: x - 5, z: z - 5 },
          max: { x: x + 5, z: z + 5 },
        };
        spatialHash.insert(item, bounds);
      }

      const insertTime = Date.now() - startTime;

      // Query should be fast
      const queryStart = Date.now();
      const results = spatialHash.queryRadius({ x: 500, z: 500 }, 100);
      const queryTime = Date.now() - queryStart;

      expect(spatialHash.size).toBe(itemCount);
      expect(insertTime).toBeLessThan(1000); // Should insert 1000 items in < 1s
      expect(queryTime).toBeLessThan(100); // Query should be very fast
    });

    it('should handle items at extreme coordinates', () => {
      const item1: TestItem = { id: 'item1', position: { x: -10000, z: -10000 } };
      const item2: TestItem = { id: 'item2', position: { x: 10000, z: 10000 } };

      const bounds1: AABB = {
        min: { x: -10005, z: -10005 },
        max: { x: -9995, z: -9995 },
      };
      const bounds2: AABB = {
        min: { x: 9995, z: 9995 },
        max: { x: 10005, z: 10005 },
      };

      spatialHash.insert(item1, bounds1);
      spatialHash.insert(item2, bounds2);

      expect(spatialHash.size).toBe(2);
      expect(spatialHash.queryPoint({ x: -10000, z: -10000 })).toContain(item1);
      expect(spatialHash.queryPoint({ x: 10000, z: 10000 })).toContain(item2);
    });

    it('should handle very small items', () => {
      const item: TestItem = { id: 'tiny', position: { x: 50, z: 50 } };
      const bounds: AABB = {
        min: { x: 49.99, z: 49.99 },
        max: { x: 50.01, z: 50.01 },
      };

      spatialHash.insert(item, bounds);

      expect(spatialHash.has(item)).toBe(true);
      expect(spatialHash.queryPoint({ x: 50, z: 50 })).toContain(item);
    });

    it('should handle very large items', () => {
      const item: TestItem = { id: 'huge', position: { x: 500, z: 500 } };
      const bounds: AABB = {
        min: { x: 0, z: 0 },
        max: { x: 1000, z: 1000 },
      };

      spatialHash.insert(item, bounds);

      expect(spatialHash.has(item)).toBe(true);
      const debugInfo = spatialHash.getDebugInfo();
      expect(debugInfo.cellCount).toBeGreaterThan(10); // Should span many cells
    });
  });

  describe('getDebugInfo', () => {
    it('should return correct debug information', () => {
      const items: TestItem[] = [
        { id: 'item1', position: { x: 25, z: 25 } },
        { id: 'item2', position: { x: 75, z: 75 } },
      ];

      items.forEach((item) => {
        const bounds: AABB = {
          min: { x: item.position.x - 5, z: item.position.z - 5 },
          max: { x: item.position.x + 5, z: item.position.z + 5 },
        };
        spatialHash.insert(item, bounds);
      });

      const debugInfo = spatialHash.getDebugInfo();

      expect(debugInfo.itemCount).toBe(2);
      expect(debugInfo.cellSize).toBe(cellSize);
      expect(debugInfo.cellCount).toBeGreaterThan(0);
      expect(debugInfo.averageItemsPerCell).toBeGreaterThan(0);
    });

    it('should return zero averages when empty', () => {
      const debugInfo = spatialHash.getDebugInfo();

      expect(debugInfo.itemCount).toBe(0);
      expect(debugInfo.cellCount).toBe(0);
      expect(debugInfo.averageItemsPerCell).toBe(0);
    });
  });
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('Utility Functions', () => {
  describe('aabbIntersects', () => {
    it('should detect intersecting AABBs', () => {
      const a: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const b: AABB = { min: { x: 5, z: 5 }, max: { x: 15, z: 15 } };

      expect(aabbIntersects(a, b)).toBe(true);
      expect(aabbIntersects(b, a)).toBe(true);
    });

    it('should detect non-intersecting AABBs', () => {
      const a: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const b: AABB = { min: { x: 20, z: 20 }, max: { x: 30, z: 30 } };

      expect(aabbIntersects(a, b)).toBe(false);
      expect(aabbIntersects(b, a)).toBe(false);
    });

    it('should detect edge-touching AABBs as intersecting', () => {
      const a: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const b: AABB = { min: { x: 10, z: 0 }, max: { x: 20, z: 10 } };

      expect(aabbIntersects(a, b)).toBe(true);
    });

    it('should handle contained AABBs', () => {
      const a: AABB = { min: { x: 0, z: 0 }, max: { x: 20, z: 20 } };
      const b: AABB = { min: { x: 5, z: 5 }, max: { x: 15, z: 15 } };

      expect(aabbIntersects(a, b)).toBe(true);
      expect(aabbIntersects(b, a)).toBe(true);
    });
  });

  describe('aabbContainsPoint', () => {
    const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };

    it('should detect point inside AABB', () => {
      expect(aabbContainsPoint(aabb, { x: 5, z: 5 })).toBe(true);
    });

    it('should detect point outside AABB', () => {
      expect(aabbContainsPoint(aabb, { x: 15, z: 15 })).toBe(false);
      expect(aabbContainsPoint(aabb, { x: -5, z: 5 })).toBe(false);
    });

    it('should detect point on boundary as inside', () => {
      expect(aabbContainsPoint(aabb, { x: 0, z: 0 })).toBe(true);
      expect(aabbContainsPoint(aabb, { x: 10, z: 10 })).toBe(true);
      expect(aabbContainsPoint(aabb, { x: 5, z: 0 })).toBe(true);
    });
  });

  describe('circleToAABB', () => {
    it('should convert circle to bounding AABB', () => {
      const circle: Circle = { center: { x: 50, z: 50 }, radius: 10 };
      const aabb = circleToAABB(circle);

      expect(aabb.min.x).toBe(40);
      expect(aabb.min.z).toBe(40);
      expect(aabb.max.x).toBe(60);
      expect(aabb.max.z).toBe(60);
    });

    it('should handle zero radius', () => {
      const circle: Circle = { center: { x: 50, z: 50 }, radius: 0 };
      const aabb = circleToAABB(circle);

      expect(aabb.min.x).toBe(50);
      expect(aabb.min.z).toBe(50);
      expect(aabb.max.x).toBe(50);
      expect(aabb.max.z).toBe(50);
    });
  });

  describe('aabbCircleIntersects', () => {
    it('should detect circle intersecting AABB', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const circle: Circle = { center: { x: 15, z: 5 }, radius: 6 };

      expect(aabbCircleIntersects(aabb, circle)).toBe(true);
    });

    it('should detect circle not intersecting AABB', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const circle: Circle = { center: { x: 20, z: 20 }, radius: 5 };

      expect(aabbCircleIntersects(aabb, circle)).toBe(false);
    });

    it('should detect circle inside AABB', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 20, z: 20 } };
      const circle: Circle = { center: { x: 10, z: 10 }, radius: 3 };

      expect(aabbCircleIntersects(aabb, circle)).toBe(true);
    });

    it('should detect AABB inside circle', () => {
      const aabb: AABB = { min: { x: 9, z: 9 }, max: { x: 11, z: 11 } };
      const circle: Circle = { center: { x: 10, z: 10 }, radius: 10 };

      expect(aabbCircleIntersects(aabb, circle)).toBe(true);
    });

    it('should handle circle touching AABB corner', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
      const circle: Circle = { center: { x: 15, z: 15 }, radius: Math.sqrt(50) };

      expect(aabbCircleIntersects(aabb, circle)).toBe(true);
    });
  });

  describe('circleIntersects', () => {
    it('should detect intersecting circles', () => {
      const a: Circle = { center: { x: 0, z: 0 }, radius: 10 };
      const b: Circle = { center: { x: 15, z: 0 }, radius: 10 };

      expect(circleIntersects(a, b)).toBe(true);
      expect(circleIntersects(b, a)).toBe(true);
    });

    it('should detect non-intersecting circles', () => {
      const a: Circle = { center: { x: 0, z: 0 }, radius: 5 };
      const b: Circle = { center: { x: 20, z: 0 }, radius: 5 };

      expect(circleIntersects(a, b)).toBe(false);
      expect(circleIntersects(b, a)).toBe(false);
    });

    it('should detect touching circles as intersecting', () => {
      const a: Circle = { center: { x: 0, z: 0 }, radius: 10 };
      const b: Circle = { center: { x: 20, z: 0 }, radius: 10 };

      expect(circleIntersects(a, b)).toBe(true);
    });

    it('should handle contained circles', () => {
      const a: Circle = { center: { x: 0, z: 0 }, radius: 20 };
      const b: Circle = { center: { x: 5, z: 5 }, radius: 5 };

      expect(circleIntersects(a, b)).toBe(true);
      expect(circleIntersects(b, a)).toBe(true);
    });
  });

  describe('circleContainsPoint', () => {
    const circle: Circle = { center: { x: 50, z: 50 }, radius: 10 };

    it('should detect point inside circle', () => {
      expect(circleContainsPoint(circle, { x: 50, z: 50 })).toBe(true);
      expect(circleContainsPoint(circle, { x: 55, z: 55 })).toBe(true);
    });

    it('should detect point outside circle', () => {
      expect(circleContainsPoint(circle, { x: 70, z: 70 })).toBe(false);
      expect(circleContainsPoint(circle, { x: 100, z: 50 })).toBe(false);
    });

    it('should detect point on boundary as inside', () => {
      expect(circleContainsPoint(circle, { x: 60, z: 50 })).toBe(true);
      expect(circleContainsPoint(circle, { x: 40, z: 50 })).toBe(true);
    });
  });

  describe('aabbCenter', () => {
    it('should calculate center of AABB', () => {
      const aabb: AABB = { min: { x: 0, z: 0 }, max: { x: 10, z: 20 } };
      const center = aabbCenter(aabb);

      expect(center.x).toBe(5);
      expect(center.z).toBe(10);
    });

    it('should handle negative coordinates', () => {
      const aabb: AABB = { min: { x: -10, z: -20 }, max: { x: 10, z: 20 } };
      const center = aabbCenter(aabb);

      expect(center.x).toBe(0);
      expect(center.z).toBe(0);
    });
  });

  describe('aabbExpand', () => {
    it('should expand AABB by amount', () => {
      const aabb: AABB = { min: { x: 10, z: 10 }, max: { x: 20, z: 20 } };
      const expanded = aabbExpand(aabb, 5);

      expect(expanded.min.x).toBe(5);
      expect(expanded.min.z).toBe(5);
      expect(expanded.max.x).toBe(25);
      expect(expanded.max.z).toBe(25);
    });

    it('should handle negative expansion (shrink)', () => {
      const aabb: AABB = { min: { x: 10, z: 10 }, max: { x: 20, z: 20 } };
      const shrunk = aabbExpand(aabb, -2);

      expect(shrunk.min.x).toBe(12);
      expect(shrunk.min.z).toBe(12);
      expect(shrunk.max.x).toBe(18);
      expect(shrunk.max.z).toBe(18);
    });
  });

  describe('aabbFromCenter', () => {
    it('should create AABB from center and half-extents', () => {
      const center = { x: 50, z: 50 };
      const aabb = aabbFromCenter(center, 10, 20);

      expect(aabb.min.x).toBe(40);
      expect(aabb.min.z).toBe(30);
      expect(aabb.max.x).toBe(60);
      expect(aabb.max.z).toBe(70);
    });
  });

  describe('aabbFromRadius', () => {
    it('should create square AABB from center and radius', () => {
      const center = { x: 50, z: 50 };
      const aabb = aabbFromRadius(center, 10);

      expect(aabb.min.x).toBe(40);
      expect(aabb.min.z).toBe(40);
      expect(aabb.max.x).toBe(60);
      expect(aabb.max.z).toBe(60);
    });
  });
});
