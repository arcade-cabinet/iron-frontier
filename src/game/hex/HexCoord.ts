/**
 * HexCoord.ts - Hex coordinate utilities and math
 *
 * Provides functions for working with axial hex coordinates:
 * - Coordinate conversions (axial <-> cube <-> world)
 * - Neighbor calculations
 * - Distance and range queries
 * - Line drawing
 * - Ring and spiral iterators
 *
 * Reference: https://www.redblobgames.com/grids/hexagons/
 */

import {
  DEFAULT_HEX_CHUNK_CONFIG,
  DEFAULT_HEX_LAYOUT,
  type FractionalHexCoord,
  HEX_DIRECTIONS,
  type HexChunkConfig,
  type HexChunkCoord,
  type HexCoord,
  type HexCubeCoord,
  HexDirection,
  type HexLayout,
  HexOrientation,
  hexKey,
  type WorldPosition,
} from './HexTypes';

// ============================================================================
// COORDINATE CREATION
// ============================================================================

/**
 * Create an axial hex coordinate.
 */
export function hex(q: number, r: number): HexCoord {
  return { q, r };
}

/**
 * Create a cube hex coordinate.
 */
export function hexCube(q: number, r: number, s: number): HexCubeCoord {
  if (Math.round(q + r + s) !== 0) {
    throw new Error(`Invalid cube coordinates: q + r + s must equal 0 (got ${q + r + s})`);
  }
  return { q, r, s };
}

/**
 * Create a hex coordinate from cube coordinates.
 */
export function hexFromCube(cube: HexCubeCoord): HexCoord {
  return { q: cube.q, r: cube.r };
}

// ============================================================================
// COORDINATE CONVERSIONS
// ============================================================================

/**
 * Convert axial to cube coordinates.
 */
export function axialToCube(coord: HexCoord): HexCubeCoord {
  return {
    q: coord.q,
    r: coord.r,
    s: -coord.q - coord.r,
  };
}

/**
 * Convert cube to axial coordinates.
 */
export function cubeToAxial(cube: HexCubeCoord): HexCoord {
  return { q: cube.q, r: cube.r };
}

/**
 * Round fractional hex coordinates to the nearest hex.
 * Uses cube coordinate rounding for accuracy.
 */
export function hexRound(frac: FractionalHexCoord): HexCoord {
  const s = -frac.q - frac.r;

  let q = Math.round(frac.q);
  let r = Math.round(frac.r);
  const roundedS = Math.round(s);

  const qDiff = Math.abs(q - frac.q);
  const rDiff = Math.abs(r - frac.r);
  const sDiff = Math.abs(roundedS - s);

  // Reset the component with the largest rounding error
  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - roundedS;
  } else if (rDiff > sDiff) {
    r = -q - roundedS;
  }
  // s is derived, no need to set it

  return { q, r };
}

// ============================================================================
// WORLD <-> HEX CONVERSIONS
// ============================================================================

// Precomputed orientation matrices for flat-top and pointy-top hexes
const FLAT_TOP_MATRIX = {
  f0: 3 / 2,
  f1: 0,
  f2: Math.sqrt(3) / 2,
  f3: Math.sqrt(3),
  b0: 2 / 3,
  b1: 0,
  b2: -1 / 3,
  b3: Math.sqrt(3) / 3,
  startAngle: 0,
};

const POINTY_TOP_MATRIX = {
  f0: Math.sqrt(3),
  f1: Math.sqrt(3) / 2,
  f2: 0,
  f3: 3 / 2,
  b0: Math.sqrt(3) / 3,
  b1: -1 / 3,
  b2: 0,
  b3: 2 / 3,
  startAngle: 0.5,
};

function getOrientationMatrix(orientation: HexOrientation) {
  return orientation === HexOrientation.FlatTop ? FLAT_TOP_MATRIX : POINTY_TOP_MATRIX;
}

/**
 * Convert hex coordinate to world position (center of hex).
 * Y coordinate is set to 0; elevation should be applied separately.
 */
export function hexToWorld(coord: HexCoord, layout: HexLayout = DEFAULT_HEX_LAYOUT): WorldPosition {
  const m = getOrientationMatrix(layout.orientation);
  const size = layout.size + layout.spacing;

  const x = (m.f0 * coord.q + m.f1 * coord.r) * size;
  const z = (m.f2 * coord.q + m.f3 * coord.r) * size;

  return {
    x: x + layout.origin.x,
    y: layout.origin.y,
    z: z + layout.origin.z,
  };
}

/**
 * Convert world position to fractional hex coordinate.
 */
export function worldToFractionalHex(
  pos: WorldPosition,
  layout: HexLayout = DEFAULT_HEX_LAYOUT
): FractionalHexCoord {
  const m = getOrientationMatrix(layout.orientation);
  const size = layout.size + layout.spacing;

  const px = (pos.x - layout.origin.x) / size;
  const pz = (pos.z - layout.origin.z) / size;

  const q = m.b0 * px + m.b1 * pz;
  const r = m.b2 * px + m.b3 * pz;

  return { q, r };
}

/**
 * Convert world position to the nearest hex coordinate.
 */
export function worldToHex(pos: WorldPosition, layout: HexLayout = DEFAULT_HEX_LAYOUT): HexCoord {
  return hexRound(worldToFractionalHex(pos, layout));
}

/**
 * Get the 6 corner positions of a hex in world coordinates.
 * Corners are ordered starting from the east corner, going clockwise.
 */
export function hexCorners(
  coord: HexCoord,
  layout: HexLayout = DEFAULT_HEX_LAYOUT
): WorldPosition[] {
  const center = hexToWorld(coord, layout);
  const m = getOrientationMatrix(layout.orientation);
  const corners: WorldPosition[] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (2 * Math.PI * (i + m.startAngle)) / 6;
    corners.push({
      x: center.x + layout.size * Math.cos(angle),
      y: center.y,
      z: center.z + layout.size * Math.sin(angle),
    });
  }

  return corners;
}

// ============================================================================
// NEIGHBOR CALCULATIONS
// ============================================================================

/**
 * Direction vectors for flat-top hex neighbors.
 * Indexed by HexDirection enum.
 */
const DIRECTION_VECTORS: readonly HexCoord[] = [
  { q: 1, r: 0 }, // E
  { q: 0, r: 1 }, // SE
  { q: -1, r: 1 }, // SW
  { q: -1, r: 0 }, // W
  { q: 0, r: -1 }, // NW
  { q: 1, r: -1 }, // NE
] as const;

/**
 * Get the direction vector for a given direction.
 */
export function directionVector(direction: HexDirection): HexCoord {
  return DIRECTION_VECTORS[direction];
}

/**
 * Get the neighbor hex in a given direction.
 */
export function hexNeighbor(coord: HexCoord, direction: HexDirection): HexCoord {
  const delta = DIRECTION_VECTORS[direction];
  return {
    q: coord.q + delta.q,
    r: coord.r + delta.r,
  };
}

/**
 * Get all 6 neighbors of a hex.
 */
export function hexNeighbors(coord: HexCoord): HexCoord[] {
  return HEX_DIRECTIONS.map((dir) => hexNeighbor(coord, dir));
}

/**
 * Get the opposite direction.
 */
export function oppositeDirection(direction: HexDirection): HexDirection {
  return ((direction + 3) % 6) as HexDirection;
}

/**
 * Rotate a direction clockwise by the given number of steps.
 */
export function rotateDirection(direction: HexDirection, steps: number): HexDirection {
  return ((((direction + steps) % 6) + 6) % 6) as HexDirection;
}

/**
 * Get the direction from one hex to an adjacent hex.
 * Returns undefined if hexes are not adjacent.
 */
export function getDirection(from: HexCoord, to: HexCoord): HexDirection | undefined {
  const dq = to.q - from.q;
  const dr = to.r - from.r;

  for (let i = 0; i < 6; i++) {
    const vec = DIRECTION_VECTORS[i];
    if (vec.q === dq && vec.r === dr) {
      return i as HexDirection;
    }
  }

  return undefined;
}

// ============================================================================
// DISTANCE AND RANGE
// ============================================================================

/**
 * Calculate the distance between two hex coordinates (in hex steps).
 */
export function hexDistance(a: HexCoord, b: HexCoord): number {
  const ac = axialToCube(a);
  const bc = axialToCube(b);

  return (Math.abs(ac.q - bc.q) + Math.abs(ac.r - bc.r) + Math.abs(ac.s - bc.s)) / 2;
}

/**
 * Get all hexes within a given radius of a center hex.
 * Radius 0 returns just the center hex.
 */
export function hexesInRange(center: HexCoord, radius: number): HexCoord[] {
  const results: HexCoord[] = [];

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);

    for (let r = r1; r <= r2; r++) {
      results.push({
        q: center.q + q,
        r: center.r + r,
      });
    }
  }

  return results;
}

/**
 * Get all hexes exactly at a given radius from center (a ring).
 */
export function hexRing(center: HexCoord, radius: number): HexCoord[] {
  if (radius === 0) {
    return [center];
  }

  const results: HexCoord[] = [];

  // Start at the hex in direction 4 (NW) scaled by radius
  let current: HexCoord = {
    q: center.q + DIRECTION_VECTORS[4].q * radius,
    r: center.r + DIRECTION_VECTORS[4].r * radius,
  };

  // Walk around the ring
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push(current);
      current = hexNeighbor(current, i as HexDirection);
    }
  }

  return results;
}

/**
 * Generate a spiral of hexes starting from center, expanding outward.
 * Useful for iterating hexes in order of distance.
 */
export function* hexSpiral(center: HexCoord, maxRadius: number): Generator<HexCoord> {
  yield center;

  for (let radius = 1; radius <= maxRadius; radius++) {
    for (const coord of hexRing(center, radius)) {
      yield coord;
    }
  }
}

// ============================================================================
// LINE DRAWING
// ============================================================================

/**
 * Linear interpolation between two fractional hex coordinates.
 */
function hexLerp(a: FractionalHexCoord, b: FractionalHexCoord, t: number): FractionalHexCoord {
  return {
    q: a.q + (b.q - a.q) * t,
    r: a.r + (b.r - a.r) * t,
  };
}

/**
 * Draw a line between two hex coordinates.
 * Returns all hexes the line passes through.
 */
export function hexLine(a: HexCoord, b: HexCoord): HexCoord[] {
  const n = hexDistance(a, b);

  if (n === 0) {
    return [a];
  }

  const results: HexCoord[] = [];

  // Add small offset to avoid edge cases at exactly integer coordinates
  const aFrac: FractionalHexCoord = { q: a.q + 1e-6, r: a.r + 1e-6 };
  const bFrac: FractionalHexCoord = { q: b.q + 1e-6, r: b.r + 1e-6 };

  for (let i = 0; i <= n; i++) {
    const t = i / n;
    results.push(hexRound(hexLerp(aFrac, bFrac, t)));
  }

  return results;
}

/**
 * Check if a hex coordinate is valid (finite integers).
 */
export function isValidHexCoord(coord: HexCoord): boolean {
  return (
    Number.isFinite(coord.q) &&
    Number.isFinite(coord.r) &&
    Number.isInteger(coord.q) &&
    Number.isInteger(coord.r)
  );
}

// ============================================================================
// ARITHMETIC OPERATIONS
// ============================================================================

/**
 * Add two hex coordinates.
 */
export function hexAdd(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r };
}

/**
 * Subtract hex coordinate b from a.
 */
export function hexSubtract(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q - b.q, r: a.r - b.r };
}

/**
 * Scale a hex coordinate by a factor.
 */
export function hexScale(coord: HexCoord, factor: number): HexCoord {
  return { q: coord.q * factor, r: coord.r * factor };
}

/**
 * Check if two hex coordinates are equal.
 */
export function hexEquals(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}

/**
 * Rotate a hex coordinate around the origin by 60-degree increments.
 * Positive steps = clockwise rotation.
 */
export function hexRotate(coord: HexCoord, steps: number): HexCoord {
  const cube = axialToCube(coord);
  const normalizedSteps = ((steps % 6) + 6) % 6;

  let { q, r, s } = cube;

  for (let i = 0; i < normalizedSteps; i++) {
    // Rotate clockwise: (q, r, s) -> (-r, -s, -q)
    [q, r, s] = [-r, -s, -q];
  }

  return { q, r };
}

/**
 * Rotate a hex coordinate around a center point.
 */
export function hexRotateAround(coord: HexCoord, center: HexCoord, steps: number): HexCoord {
  const relative = hexSubtract(coord, center);
  const rotated = hexRotate(relative, steps);
  return hexAdd(rotated, center);
}

// ============================================================================
// CHUNK CALCULATIONS
// ============================================================================

/**
 * Calculate which chunk a hex coordinate belongs to.
 */
export function hexToChunk(
  coord: HexCoord,
  config: HexChunkConfig = DEFAULT_HEX_CHUNK_CONFIG
): HexChunkCoord {
  // Use a simple rectangular chunk system based on world position
  const worldPos = hexToWorld(coord);
  const chunkSize = config.chunkRadius * 2 * DEFAULT_HEX_LAYOUT.size * Math.sqrt(3);

  return {
    cx: Math.floor(worldPos.x / chunkSize),
    cy: Math.floor(worldPos.z / chunkSize),
  };
}

/**
 * Get all hex coordinates within a chunk.
 */
export function hexesInChunk(
  chunkCoord: HexChunkCoord,
  config: HexChunkConfig = DEFAULT_HEX_CHUNK_CONFIG
): HexCoord[] {
  const chunkSize = config.chunkRadius * 2 * DEFAULT_HEX_LAYOUT.size * Math.sqrt(3);

  // Calculate the world center of the chunk
  const centerWorld: WorldPosition = {
    x: (chunkCoord.cx + 0.5) * chunkSize,
    y: 0,
    z: (chunkCoord.cy + 0.5) * chunkSize,
  };

  // Get the center hex
  const centerHex = worldToHex(centerWorld);

  // Get all hexes in range and filter to those actually in this chunk
  const hexes = hexesInRange(centerHex, config.chunkRadius + 2);

  return hexes.filter((h) => {
    const hChunk = hexToChunk(h, config);
    return hChunk.cx === chunkCoord.cx && hChunk.cy === chunkCoord.cy;
  });
}

/**
 * Get chunk coordinates that should be loaded for a given player position.
 */
export function getVisibleChunks(
  playerWorld: WorldPosition,
  config: HexChunkConfig = DEFAULT_HEX_CHUNK_CONFIG
): HexChunkCoord[] {
  const playerHex = worldToHex(playerWorld);
  const playerChunk = hexToChunk(playerHex, config);
  const chunks: HexChunkCoord[] = [];

  const dist = config.viewDistance;

  for (let cx = playerChunk.cx - dist; cx <= playerChunk.cx + dist; cx++) {
    for (let cy = playerChunk.cy - dist; cy <= playerChunk.cy + dist; cy++) {
      chunks.push({ cx, cy });
    }
  }

  return chunks;
}

// ============================================================================
// PATHFINDING HELPERS
// ============================================================================

/**
 * Check if two hexes are adjacent (neighbors).
 */
export function areAdjacent(a: HexCoord, b: HexCoord): boolean {
  return hexDistance(a, b) === 1;
}

/**
 * Get the shared edge index between two adjacent hexes.
 * Returns [edgeIndexOnA, edgeIndexOnB] or undefined if not adjacent.
 */
export function getSharedEdge(a: HexCoord, b: HexCoord): [HexDirection, HexDirection] | undefined {
  const dir = getDirection(a, b);
  if (dir === undefined) {
    return undefined;
  }
  return [dir, oppositeDirection(dir)];
}

// ============================================================================
// AREA CALCULATIONS
// ============================================================================

/**
 * Calculate the world-space area of a single hex tile.
 */
export function hexArea(layout: HexLayout = DEFAULT_HEX_LAYOUT): number {
  // Area of regular hexagon = (3 * sqrt(3) / 2) * s^2
  return ((3 * Math.sqrt(3)) / 2) * layout.size * layout.size;
}

/**
 * Calculate the world-space width of a flat-top hex (point to point).
 */
export function hexWidth(layout: HexLayout = DEFAULT_HEX_LAYOUT): number {
  return layout.size * 2;
}

/**
 * Calculate the world-space height of a flat-top hex (flat edge to flat edge).
 */
export function hexHeight(layout: HexLayout = DEFAULT_HEX_LAYOUT): number {
  return layout.size * Math.sqrt(3);
}

// ============================================================================
// COORDINATE SET UTILITIES
// ============================================================================

/**
 * Create a Set of hex coordinates using string keys.
 */
export function createHexSet(coords: HexCoord[]): Set<string> {
  return new Set(coords.map(hexKey));
}

/**
 * Check if a hex coordinate is in a hex set.
 */
export function hexSetHas(set: Set<string>, coord: HexCoord): boolean {
  return set.has(hexKey(coord));
}

/**
 * Add a hex coordinate to a hex set.
 */
export function hexSetAdd(set: Set<string>, coord: HexCoord): void {
  set.add(hexKey(coord));
}

/**
 * Remove a hex coordinate from a hex set.
 */
export function hexSetDelete(set: Set<string>, coord: HexCoord): boolean {
  return set.delete(hexKey(coord));
}

// ============================================================================
// DIRECTION UTILITIES
// ============================================================================

/**
 * Get the approximate direction from one hex to another.
 * For non-adjacent hexes, returns the direction of the first step.
 */
export function getApproximateDirection(from: HexCoord, to: HexCoord): HexDirection {
  if (hexEquals(from, to)) {
    return HexDirection.E; // Default
  }

  // Get the first hex in the line
  const line = hexLine(from, to);
  if (line.length < 2) {
    return HexDirection.E;
  }

  const dir = getDirection(from, line[1]);
  return dir ?? HexDirection.E;
}

/**
 * Convert a world-space angle (radians) to the nearest hex direction.
 * Angle 0 = positive X axis (East).
 */
export function angleToDirection(angleRadians: number): HexDirection {
  // Normalize to 0-2PI
  const normalized = ((angleRadians % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Each direction spans 60 degrees (PI/3 radians)
  // Direction 0 (East) is centered at 0 radians
  const index = Math.round((normalized / (Math.PI / 3)) % 6);

  return index as HexDirection;
}

/**
 * Convert a hex direction to a world-space angle (radians).
 * Returns the angle pointing in that direction.
 */
export function directionToAngle(direction: HexDirection): number {
  // For flat-top hexes, direction 0 (East) points at 0 radians
  return (direction * Math.PI) / 3;
}
