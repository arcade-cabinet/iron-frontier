/**
 * SpatialHash.ts - Efficient spatial partitioning for Iron Frontier
 *
 * Provides O(1) average-case spatial queries for collision detection
 * and zone lookups. Uses a grid-based hash where each cell contains
 * references to items whose bounds intersect that cell.
 *
 * Features:
 * - Fast insertion and removal
 * - Efficient range queries
 * - Radius-based queries
 * - Memory-efficient for sparse worlds
 */

/**
 * Axis-Aligned Bounding Box for 2D collision (x/z plane)
 */
export interface AABB {
  min: { x: number; z: number };
  max: { x: number; z: number };
}

/**
 * Circle collider for NPCs and point-based entities
 */
export interface Circle {
  center: { x: number; z: number };
  radius: number;
}

/**
 * Internal entry for tracking items in the spatial hash
 */
interface SpatialEntry<T> {
  item: T;
  bounds: AABB;
  cells: Set<string>;
}

/**
 * Efficient spatial partitioning for collision queries.
 *
 * @template T The type of items stored in the hash
 *
 * @example
 * ```typescript
 * const hash = new SpatialHash<Collider>(50); // 50 unit cells
 * hash.insert(collider, collider.bounds);
 * const nearby = hash.queryRadius({ x: 100, z: 100 }, 25);
 * ```
 */
export class SpatialHash<T> {
  private cellSize: number;
  private cells: Map<string, Set<T>> = new Map();
  private entries: Map<T, SpatialEntry<T>> = new Map();

  /**
   * Create a new spatial hash.
   * @param cellSize Size of each grid cell in world units
   */
  constructor(cellSize: number) {
    if (cellSize <= 0) {
      throw new Error('Cell size must be positive');
    }
    this.cellSize = cellSize;
  }

  /**
   * Get the cell key for a world position.
   */
  private getCellKey(x: number, z: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return `${cellX},${cellZ}`;
  }

  /**
   * Get all cell keys that an AABB overlaps.
   */
  private getCellsForBounds(bounds: AABB): string[] {
    const cells: string[] = [];
    const minCellX = Math.floor(bounds.min.x / this.cellSize);
    const maxCellX = Math.floor(bounds.max.x / this.cellSize);
    const minCellZ = Math.floor(bounds.min.z / this.cellSize);
    const maxCellZ = Math.floor(bounds.max.z / this.cellSize);

    for (let x = minCellX; x <= maxCellX; x++) {
      for (let z = minCellZ; z <= maxCellZ; z++) {
        cells.push(`${x},${z}`);
      }
    }

    return cells;
  }

  /**
   * Insert an item into the spatial hash.
   * @param item The item to insert
   * @param bounds The AABB of the item
   */
  insert(item: T, bounds: AABB): void {
    // Remove existing entry if present
    if (this.entries.has(item)) {
      this.remove(item);
    }

    const cellKeys = this.getCellsForBounds(bounds);
    const cellSet = new Set(cellKeys);

    // Store the entry
    this.entries.set(item, { item, bounds, cells: cellSet });

    // Add to each cell
    for (const key of cellKeys) {
      let cell = this.cells.get(key);
      if (!cell) {
        cell = new Set();
        this.cells.set(key, cell);
      }
      cell.add(item);
    }
  }

  /**
   * Remove an item from the spatial hash.
   * @param item The item to remove
   */
  remove(item: T): void {
    const entry = this.entries.get(item);
    if (!entry) return;

    // Remove from all cells
    for (const key of entry.cells) {
      const cell = this.cells.get(key);
      if (cell) {
        cell.delete(item);
        // Clean up empty cells
        if (cell.size === 0) {
          this.cells.delete(key);
        }
      }
    }

    this.entries.delete(item);
  }

  /**
   * Update an item's position in the spatial hash.
   * More efficient than remove+insert if bounds only changed slightly.
   * @param item The item to update
   * @param newBounds The new AABB of the item
   */
  update(item: T, newBounds: AABB): void {
    const entry = this.entries.get(item);
    if (!entry) {
      this.insert(item, newBounds);
      return;
    }

    const newCellKeys = this.getCellsForBounds(newBounds);
    const newCellSet = new Set(newCellKeys);

    // Find cells to remove from and add to
    const toRemove: string[] = [];
    const toAdd: string[] = [];

    for (const key of entry.cells) {
      if (!newCellSet.has(key)) {
        toRemove.push(key);
      }
    }

    for (const key of newCellKeys) {
      if (!entry.cells.has(key)) {
        toAdd.push(key);
      }
    }

    // Remove from old cells
    for (const key of toRemove) {
      const cell = this.cells.get(key);
      if (cell) {
        cell.delete(item);
        if (cell.size === 0) {
          this.cells.delete(key);
        }
      }
    }

    // Add to new cells
    for (const key of toAdd) {
      let cell = this.cells.get(key);
      if (!cell) {
        cell = new Set();
        this.cells.set(key, cell);
      }
      cell.add(item);
    }

    // Update entry
    entry.bounds = newBounds;
    entry.cells = newCellSet;
  }

  /**
   * Query all items that potentially intersect the given bounds.
   * @param bounds The AABB to query
   * @returns Array of items that may intersect (broad phase)
   */
  query(bounds: AABB): T[] {
    const result = new Set<T>();
    const cellKeys = this.getCellsForBounds(bounds);

    for (const key of cellKeys) {
      const cell = this.cells.get(key);
      if (cell) {
        for (const item of cell) {
          result.add(item);
        }
      }
    }

    return Array.from(result);
  }

  /**
   * Query all items within a radius of a point.
   * @param pos Center position
   * @param radius Search radius
   * @returns Array of items that may be within radius (broad phase)
   */
  queryRadius(pos: { x: number; z: number }, radius: number): T[] {
    // Convert radius to AABB for broad phase
    const bounds: AABB = {
      min: { x: pos.x - radius, z: pos.z - radius },
      max: { x: pos.x + radius, z: pos.z + radius },
    };

    return this.query(bounds);
  }

  /**
   * Check if a point is inside any tracked bounds.
   * @param pos The point to check
   * @returns Items whose bounds contain the point
   */
  queryPoint(pos: { x: number; z: number }): T[] {
    const key = this.getCellKey(pos.x, pos.z);
    const cell = this.cells.get(key);
    if (!cell) return [];

    const result: T[] = [];
    for (const item of cell) {
      const entry = this.entries.get(item);
      if (entry && this.aabbContainsPoint(entry.bounds, pos)) {
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Get the bounds of an item if it exists.
   * @param item The item to look up
   * @returns The bounds or undefined
   */
  getBounds(item: T): AABB | undefined {
    return this.entries.get(item)?.bounds;
  }

  /**
   * Check if an item exists in the hash.
   * @param item The item to check
   */
  has(item: T): boolean {
    return this.entries.has(item);
  }

  /**
   * Clear all items from the spatial hash.
   */
  clear(): void {
    this.cells.clear();
    this.entries.clear();
  }

  /**
   * Get the number of items in the hash.
   */
  get size(): number {
    return this.entries.size;
  }

  /**
   * Get all items in the hash.
   */
  getAll(): T[] {
    return Array.from(this.entries.keys());
  }

  /**
   * Check if an AABB contains a point.
   */
  private aabbContainsPoint(aabb: AABB, point: { x: number; z: number }): boolean {
    return (
      point.x >= aabb.min.x &&
      point.x <= aabb.max.x &&
      point.z >= aabb.min.z &&
      point.z <= aabb.max.z
    );
  }

  /**
   * Get debug information about the spatial hash.
   */
  getDebugInfo(): {
    itemCount: number;
    cellCount: number;
    cellSize: number;
    averageItemsPerCell: number;
  } {
    const cellCount = this.cells.size;
    let totalItems = 0;
    for (const cell of this.cells.values()) {
      totalItems += cell.size;
    }

    return {
      itemCount: this.entries.size,
      cellCount,
      cellSize: this.cellSize,
      averageItemsPerCell: cellCount > 0 ? totalItems / cellCount : 0,
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if two AABBs intersect.
 */
export function aabbIntersects(a: AABB, b: AABB): boolean {
  return a.min.x <= b.max.x && a.max.x >= b.min.x && a.min.z <= b.max.z && a.max.z >= b.min.z;
}

/**
 * Check if an AABB contains a point.
 */
export function aabbContainsPoint(aabb: AABB, point: { x: number; z: number }): boolean {
  return (
    point.x >= aabb.min.x &&
    point.x <= aabb.max.x &&
    point.z >= aabb.min.z &&
    point.z <= aabb.max.z
  );
}

/**
 * Convert a circle to an AABB (bounding box).
 */
export function circleToAABB(circle: Circle): AABB {
  return {
    min: {
      x: circle.center.x - circle.radius,
      z: circle.center.z - circle.radius,
    },
    max: {
      x: circle.center.x + circle.radius,
      z: circle.center.z + circle.radius,
    },
  };
}

/**
 * Check if an AABB and circle intersect.
 */
export function aabbCircleIntersects(aabb: AABB, circle: Circle): boolean {
  // Find the closest point on the AABB to the circle center
  const closestX = Math.max(aabb.min.x, Math.min(circle.center.x, aabb.max.x));
  const closestZ = Math.max(aabb.min.z, Math.min(circle.center.z, aabb.max.z));

  // Calculate distance from closest point to circle center
  const dx = closestX - circle.center.x;
  const dz = closestZ - circle.center.z;
  const distanceSquared = dx * dx + dz * dz;

  return distanceSquared <= circle.radius * circle.radius;
}

/**
 * Check if two circles intersect.
 */
export function circleIntersects(a: Circle, b: Circle): boolean {
  const dx = a.center.x - b.center.x;
  const dz = a.center.z - b.center.z;
  const distanceSquared = dx * dx + dz * dz;
  const radiusSum = a.radius + b.radius;
  return distanceSquared <= radiusSum * radiusSum;
}

/**
 * Check if a circle contains a point.
 */
export function circleContainsPoint(circle: Circle, point: { x: number; z: number }): boolean {
  const dx = point.x - circle.center.x;
  const dz = point.z - circle.center.z;
  const distanceSquared = dx * dx + dz * dz;
  return distanceSquared <= circle.radius * circle.radius;
}

/**
 * Calculate the center of an AABB.
 */
export function aabbCenter(aabb: AABB): { x: number; z: number } {
  return {
    x: (aabb.min.x + aabb.max.x) / 2,
    z: (aabb.min.z + aabb.max.z) / 2,
  };
}

/**
 * Expand an AABB by a given amount in all directions.
 */
export function aabbExpand(aabb: AABB, amount: number): AABB {
  return {
    min: { x: aabb.min.x - amount, z: aabb.min.z - amount },
    max: { x: aabb.max.x + amount, z: aabb.max.z + amount },
  };
}

/**
 * Create an AABB from a center point and half-extents.
 */
export function aabbFromCenter(
  center: { x: number; z: number },
  halfWidth: number,
  halfDepth: number
): AABB {
  return {
    min: { x: center.x - halfWidth, z: center.z - halfDepth },
    max: { x: center.x + halfWidth, z: center.z + halfDepth },
  };
}

/**
 * Create an AABB from a center point and radius (square bounds).
 */
export function aabbFromRadius(center: { x: number; z: number }, radius: number): AABB {
  return aabbFromCenter(center, radius, radius);
}
