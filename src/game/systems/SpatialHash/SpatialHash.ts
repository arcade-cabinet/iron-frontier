import type { AABB, SpatialEntry } from './types';

export class SpatialHash<T> {
  private cellSize: number;
  private cells: Map<string, Set<T>> = new Map();
  private entries: Map<T, SpatialEntry<T>> = new Map();

  constructor(cellSize: number) {
    if (cellSize <= 0) {
      throw new Error('Cell size must be positive');
    }
    this.cellSize = cellSize;
  }

  private getCellKey(x: number, z: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return `${cellX},${cellZ}`;
  }

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

  insert(item: T, bounds: AABB): void {
    if (this.entries.has(item)) {
      this.remove(item);
    }

    const cellKeys = this.getCellsForBounds(bounds);
    const cellSet = new Set(cellKeys);

    this.entries.set(item, { item, bounds, cells: cellSet });

    for (const key of cellKeys) {
      let cell = this.cells.get(key);
      if (!cell) {
        cell = new Set();
        this.cells.set(key, cell);
      }
      cell.add(item);
    }
  }

  remove(item: T): void {
    const entry = this.entries.get(item);
    if (!entry) return;

    for (const key of entry.cells) {
      const cell = this.cells.get(key);
      if (cell) {
        cell.delete(item);
        if (cell.size === 0) {
          this.cells.delete(key);
        }
      }
    }

    this.entries.delete(item);
  }

  update(item: T, newBounds: AABB): void {
    const entry = this.entries.get(item);
    if (!entry) {
      this.insert(item, newBounds);
      return;
    }

    const newCellKeys = this.getCellsForBounds(newBounds);
    const newCellSet = new Set(newCellKeys);

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

    for (const key of toRemove) {
      const cell = this.cells.get(key);
      if (cell) {
        cell.delete(item);
        if (cell.size === 0) {
          this.cells.delete(key);
        }
      }
    }

    for (const key of toAdd) {
      let cell = this.cells.get(key);
      if (!cell) {
        cell = new Set();
        this.cells.set(key, cell);
      }
      cell.add(item);
    }

    entry.bounds = newBounds;
    entry.cells = newCellSet;
  }

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

  queryRadius(pos: { x: number; z: number }, radius: number): T[] {
    const bounds: AABB = {
      min: { x: pos.x - radius, z: pos.z - radius },
      max: { x: pos.x + radius, z: pos.z + radius },
    };

    return this.query(bounds);
  }

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

  getBounds(item: T): AABB | undefined {
    return this.entries.get(item)?.bounds;
  }

  has(item: T): boolean {
    return this.entries.has(item);
  }

  clear(): void {
    this.cells.clear();
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }

  getAll(): T[] {
    return Array.from(this.entries.keys());
  }

  private aabbContainsPoint(aabb: AABB, point: { x: number; z: number }): boolean {
    return (
      point.x >= aabb.min.x &&
      point.x <= aabb.max.x &&
      point.z >= aabb.min.z &&
      point.z <= aabb.max.z
    );
  }

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
