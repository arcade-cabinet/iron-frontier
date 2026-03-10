// pathCarver — DFS path carving and pipe type assignment for puzzle generation.

import type { Direction, PipeCell, PipeType } from './types';
import { scopedRNG, rngTick } from '../../lib/prng';

/**
 * Carve a path from start to end using DFS with random neighbor ordering.
 * Returns an array of {x, y} positions forming the path.
 */
export function carvePath(
  width: number,
  height: number,
  start: { x: number; y: number },
  end: { x: number; y: number },
): { x: number; y: number }[] {
  const visited = new Set<string>();
  const path: { x: number; y: number }[] = [];

  const key = (x: number, y: number) => `${x},${y}`;
  const deltas = [
    { dx: 0, dy: -1 }, // N
    { dx: 1, dy: 0 },  // E
    { dx: 0, dy: 1 },  // S
    { dx: -1, dy: 0 }, // W
  ];

  function dfs(x: number, y: number): boolean {
    visited.add(key(x, y));
    path.push({ x, y });

    if (x === end.x && y === end.y) return true;

    const neighbors = deltas
      .map((d) => ({ x: x + d.dx, y: y + d.dy }))
      .filter(
        (n) =>
          n.x >= 0 &&
          n.x < width &&
          n.y >= 0 &&
          n.y < height &&
          !visited.has(key(n.x, n.y)),
      );

    // Sort with some randomness but bias toward the goal
    neighbors.sort(() => {
      if (scopedRNG('puzzle', 42, rngTick()) < 0.5) return scopedRNG('puzzle', 42, rngTick()) - 0.5;
      return 0;
    });

    neighbors.sort((a, b) => {
      const distA = Math.abs(a.x - end.x) + Math.abs(a.y - end.y);
      const distB = Math.abs(b.x - end.x) + Math.abs(b.y - end.y);
      if (scopedRNG('puzzle', 42, rngTick()) < 0.4) return distA - distB;
      return 0;
    });

    for (const neighbor of neighbors) {
      if (dfs(neighbor.x, neighbor.y)) return true;
    }

    path.pop();
    return false;
  }

  dfs(start.x, start.y);
  return path;
}

/**
 * Get the direction from `from` to `to` (adjacent cells).
 * Returns 0=N, 1=E, 2=S, 3=W, or -1 if not adjacent.
 */
function getDirection(
  from: { x: number; y: number },
  to: { x: number; y: number },
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === -1) return 0; // N
  if (dx === 1 && dy === 0) return 1;  // E
  if (dx === 0 && dy === 1) return 2;  // S
  if (dx === -1 && dy === 0) return 3; // W
  return -1;
}

/**
 * Determine pipe type and rotation from a boolean connection pattern [N, E, S, W].
 */
function pipeFromConnections(
  connections: boolean[],
): { type: PipeType; rotation: Direction } {
  const count = connections.filter(Boolean).length;

  if (count === 4) {
    return { type: 'cross', rotation: 0 };
  }

  if (count === 3) {
    const missing = connections.indexOf(false);
    const rotation = ((missing + 1) % 4) as Direction;
    return { type: 'tee', rotation };
  }

  if (count === 2) {
    const dirs = connections
      .map((c, i) => (c ? i : -1))
      .filter((i) => i !== -1);
    const [a, b] = dirs;

    if ((a + 2) % 4 === b) {
      const rotation = (Math.min(a, b) % 2) as Direction;
      return { type: 'straight', rotation };
    }

    let rotation: number;
    if ((a === 3 && b === 0) || (a === 0 && b === 3)) {
      rotation = 3;
    } else {
      rotation = Math.min(a, b);
    }
    return { type: 'corner', rotation: rotation as Direction };
  }

  if (count === 1) {
    const dir = connections.indexOf(true);
    return { type: 'cap', rotation: dir as Direction };
  }

  return { type: 'cross', rotation: 0 };
}

/**
 * Assign pipe types and rotations along the carved path.
 */
export function assignPathPipes(
  grid: PipeCell[][],
  path: { x: number; y: number }[],
  startPos: { x: number; y: number },
  endPos: { x: number; y: number },
): void {
  for (let i = 0; i < path.length; i++) {
    const curr = path[i];
    const connections: boolean[] = [false, false, false, false]; // N, E, S, W

    if (i > 0) {
      const prev = path[i - 1];
      const dir = getDirection(curr, prev);
      if (dir !== -1) connections[dir] = true;
    }

    if (i < path.length - 1) {
      const next = path[i + 1];
      const dir = getDirection(curr, next);
      if (dir !== -1) connections[dir] = true;
    }

    const { type, rotation } = pipeFromConnections(connections);

    let pipeType: PipeType = type;
    if (curr.x === startPos.x && curr.y === startPos.y) {
      pipeType = 'source';
    } else if (curr.x === endPos.x && curr.y === endPos.y) {
      pipeType = 'sink';
    }

    grid[curr.y][curr.x] = {
      ...grid[curr.y][curr.x],
      type: pipeType,
      rotation,
    };
  }
}

/**
 * Lock random non-path cells to increase difficulty.
 */
export function lockRandomCells(
  grid: PipeCell[][],
  path: { x: number; y: number }[],
  count: number,
): void {
  const pathSet = new Set(path.map((p) => `${p.x},${p.y}`));
  const candidates: { x: number; y: number }[] = [];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (!pathSet.has(`${x},${y}`) && !grid[y][x].fixed) {
        candidates.push({ x, y });
      }
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(scopedRNG('puzzle', 42, rngTick()) * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const toLock = candidates.slice(0, Math.min(count, candidates.length));
  for (const pos of toLock) {
    grid[pos.y][pos.x] = {
      ...grid[pos.y][pos.x],
      locked: true,
      fixed: true,
    };
  }
}
