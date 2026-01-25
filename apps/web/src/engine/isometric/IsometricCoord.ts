/**
 * IsometricCoord.ts - Coordinate conversion utilities
 *
 * Handles transformation between grid coordinates (x, y) and
 * world coordinates (x, y, z) for isometric rendering.
 *
 * Uses standard 2:1 isometric projection where tiles appear as diamonds.
 */

import {
  DEFAULT_ISOMETRIC_LAYOUT,
  type GridCoord,
  type IsometricLayout,
  type WorldPosition,
} from './IsometricTypes';

// ============================================================================
// COORDINATE CONVERSION
// ============================================================================

/**
 * Convert grid coordinate to world position.
 * Isometric projection: tiles are diamonds on the XZ plane.
 */
export function gridToWorld(
  coord: GridCoord,
  elevation: number = 0,
  layout: IsometricLayout = DEFAULT_ISOMETRIC_LAYOUT
): WorldPosition {
  const { tileSize, origin } = layout;

  // Standard 2:1 isometric projection
  // World X = (gridX - gridY) * tileSize
  // World Z = (gridX + gridY) * tileSize / 2
  const worldX = (coord.x - coord.y) * tileSize + origin.x;
  const worldZ = (coord.x + coord.y) * (tileSize / 2) + origin.z;
  const worldY = elevation * tileSize + origin.y;

  return { x: worldX, y: worldY, z: worldZ };
}

/**
 * Convert world position to the nearest grid coordinate.
 */
export function worldToGrid(
  worldX: number,
  worldZ: number,
  layout: IsometricLayout = DEFAULT_ISOMETRIC_LAYOUT
): GridCoord {
  const { tileSize, origin } = layout;

  // Adjust for origin
  const px = worldX - origin.x;
  const pz = worldZ - origin.z;

  // Inverse transformation
  const halfWidth = tileSize;
  const halfHeight = tileSize / 2;

  const fracX = (px / halfWidth + pz / halfHeight) / 2;
  const fracY = (pz / halfHeight - px / halfWidth) / 2;

  return {
    x: Math.round(fracX),
    y: Math.round(fracY),
  };
}

/**
 * Get fractional grid position (for smooth movement/picking).
 */
export function worldToFractionalGrid(
  worldX: number,
  worldZ: number,
  layout: IsometricLayout = DEFAULT_ISOMETRIC_LAYOUT
): { x: number; y: number } {
  const { tileSize, origin } = layout;

  const px = worldX - origin.x;
  const pz = worldZ - origin.z;

  const halfWidth = tileSize;
  const halfHeight = tileSize / 2;

  const fracX = (px / halfWidth + pz / halfHeight) / 2;
  const fracY = (pz / halfHeight - px / halfWidth) / 2;

  return { x: fracX, y: fracY };
}

// ============================================================================
// NEIGHBORS AND DIRECTIONS
// ============================================================================

export enum Direction {
  N = 0,
  NE = 1,
  E = 2,
  SE = 3,
  S = 4,
  SW = 5,
  W = 6,
  NW = 7,
}

export const DIRECTION_OFFSETS: readonly {
  dx: number;
  dy: number;
  cost: number;
}[] = [
  { dx: 0, dy: -1, cost: 1.0 }, // N
  { dx: 1, dy: -1, cost: 1.41 }, // NE (diagonal)
  { dx: 1, dy: 0, cost: 1.0 }, // E
  { dx: 1, dy: 1, cost: 1.41 }, // SE (diagonal)
  { dx: 0, dy: 1, cost: 1.0 }, // S
  { dx: -1, dy: 1, cost: 1.41 }, // SW (diagonal)
  { dx: -1, dy: 0, cost: 1.0 }, // W
  { dx: -1, dy: -1, cost: 1.41 }, // NW (diagonal)
];

/**
 * Get neighbor coordinate in a direction.
 */
export function getNeighbor(coord: GridCoord, direction: Direction): GridCoord {
  const offset = DIRECTION_OFFSETS[direction];
  return {
    x: coord.x + offset.dx,
    y: coord.y + offset.dy,
  };
}

/**
 * Get all 8 neighbors of a tile.
 */
export function getNeighbors(coord: GridCoord): GridCoord[] {
  return DIRECTION_OFFSETS.map((offset) => ({
    x: coord.x + offset.dx,
    y: coord.y + offset.dy,
  }));
}

/**
 * Get cardinal neighbors only (4 directions).
 */
export function getCardinalNeighbors(coord: GridCoord): GridCoord[] {
  return [Direction.N, Direction.E, Direction.S, Direction.W].map((dir) =>
    getNeighbor(coord, dir)
  );
}

// ============================================================================
// DISTANCE CALCULATIONS
// ============================================================================

/**
 * Manhattan distance (for grid-based movement cost estimation).
 */
export function manhattanDistance(a: GridCoord, b: GridCoord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Chebyshev distance (8-directional movement - max of dx, dy).
 */
export function chebyshevDistance(a: GridCoord, b: GridCoord): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

/**
 * Euclidean distance.
 */
export function euclideanDistance(a: GridCoord, b: GridCoord): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Grid distance accounting for diagonal movement cost.
 * Diagonal moves cost sqrt(2), cardinal moves cost 1.
 */
export function gridDistance(a: GridCoord, b: GridCoord): number {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const diagonal = Math.min(dx, dy);
  const straight = Math.max(dx, dy) - diagonal;
  return diagonal * 1.41421356 + straight;
}

// ============================================================================
// LINE OF SIGHT
// ============================================================================

/**
 * Get all tiles along a line from start to end (Bresenham's algorithm).
 */
export function tilesInLine(start: GridCoord, end: GridCoord): GridCoord[] {
  const tiles: GridCoord[] = [];

  let x0 = start.x;
  let y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    tiles.push({ x: x0, y: y0 });

    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return tiles;
}

/**
 * Get tiles within a rectangular range.
 */
export function tilesInRange(center: GridCoord, range: number): GridCoord[] {
  const tiles: GridCoord[] = [];
  for (let x = center.x - range; x <= center.x + range; x++) {
    for (let y = center.y - range; y <= center.y + range; y++) {
      tiles.push({ x, y });
    }
  }
  return tiles;
}

/**
 * Get tiles within a circular range (Euclidean distance).
 */
export function tilesInRadius(center: GridCoord, radius: number): GridCoord[] {
  const tiles: GridCoord[] = [];
  const range = Math.ceil(radius);
  for (let x = center.x - range; x <= center.x + range; x++) {
    for (let y = center.y - range; y <= center.y + range; y++) {
      if (euclideanDistance(center, { x, y }) <= radius) {
        tiles.push({ x, y });
      }
    }
  }
  return tiles;
}

// ============================================================================
// COORDINATE UTILITIES
// ============================================================================

/**
 * Check if two coordinates are equal.
 */
export function coordsEqual(a: GridCoord, b: GridCoord): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Check if coordinates are adjacent (including diagonals).
 */
export function areAdjacent(a: GridCoord, b: GridCoord): boolean {
  return chebyshevDistance(a, b) === 1;
}

/**
 * Get the direction from one tile to an adjacent tile.
 */
export function getDirection(
  from: GridCoord,
  to: GridCoord
): Direction | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  for (let i = 0; i < 8; i++) {
    const offset = DIRECTION_OFFSETS[i];
    if (offset.dx === dx && offset.dy === dy) {
      return i as Direction;
    }
  }

  return null;
}

/**
 * Clamp a coordinate to grid bounds.
 */
export function clampToGrid(
  coord: GridCoord,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): GridCoord {
  return {
    x: Math.max(minX, Math.min(maxX, coord.x)),
    y: Math.max(minY, Math.min(maxY, coord.y)),
  };
}
