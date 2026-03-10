import type { Direction, LockLevel, PipeCell, PipePuzzleState, PipeType, PuzzleContext } from './types';
import { LOCK_DIFFICULTY } from './types';
import { scopedRNG, rngTick } from '../../lib/prng';

/**
 * Generates guaranteed-solvable pipe puzzles.
 *
 * Algorithm:
 * 1. Place source on the left edge and sink on the right edge.
 * 2. Carve a valid path from source to sink using a random walk
 *    with backtracking (recursive backtracker / DFS maze style).
 * 3. Assign the correct pipe type and rotation to each path cell
 *    based on the directions it connects.
 * 4. Fill remaining empty cells with random pipe types.
 * 5. Randomly rotate ALL non-fixed cells to scramble the puzzle.
 *
 * This guarantees solvability because a valid solution exists
 * (the original path), and the player just needs to find it.
 */
export class PuzzleGenerator {
  /**
   * Generate a solvable pipe puzzle for a given lock level.
   */
  static generateForLock(lockLevel: LockLevel, context: PuzzleContext): PipePuzzleState {
    const diff = LOCK_DIFFICULTY[lockLevel];
    return PuzzleGenerator.generate(diff.width, diff.height, context);
  }

  /**
   * Generate a solvable pipe puzzle of the given dimensions.
   */
  static generate(
    width: number,
    height: number,
    context: PuzzleContext | null = null,
  ): PipePuzzleState {
    const grid: PipeCell[][] = [];

    // Initialize empty grid
    for (let y = 0; y < height; y++) {
      const row: PipeCell[] = [];
      for (let x = 0; x < width; x++) {
        row.push({
          x,
          y,
          type: 'empty',
          rotation: 0,
          fixed: false,
          active: false,
          locked: false,
        });
      }
      grid.push(row);
    }

    // Place source on left edge, sink on right edge
    const startY = Math.floor(scopedRNG('puzzle', 42, rngTick()) * height);
    const endY = Math.floor(scopedRNG('puzzle', 42, rngTick()) * height);
    const startPos = { x: 0, y: startY };
    const endPos = { x: width - 1, y: endY };

    // Carve a path from source to sink using random walk with backtracking
    const path = PuzzleGenerator.carvePath(width, height, startPos, endPos);

    // Assign pipe types along the path based on connectivity
    PuzzleGenerator.assignPathPipes(grid, path, startPos, endPos);

    // Set source and sink as fixed
    grid[startPos.y][startPos.x].fixed = true;
    grid[endPos.y][endPos.x].fixed = true;

    // Fill empty cells with random pipe types (noise)
    const fillTypes: PipeType[] = ['straight', 'corner', 'tee', 'cross'];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y][x].type === 'empty') {
          grid[y][x] = {
            ...grid[y][x],
            type: fillTypes[Math.floor(scopedRNG('puzzle', 42, rngTick()) * fillTypes.length)],
            rotation: Math.floor(scopedRNG('puzzle', 42, rngTick()) * 4) as Direction,
          };
        }
      }
    }

    // Lock some noise cells based on difficulty
    if (context) {
      const diff = LOCK_DIFFICULTY[context.lockLevel];
      PuzzleGenerator.lockRandomCells(grid, path, diff.lockedCells);
    }

    // Store the solved rotations, then scramble
    // We need to scramble all non-fixed cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[y][x];
        if (!cell.fixed) {
          // Rotate by a random amount (1-3 turns so it's never already solved)
          const turns = 1 + Math.floor(scopedRNG('puzzle', 42, rngTick()) * 3);
          grid[y][x] = {
            ...cell,
            rotation: ((cell.rotation + turns) % 4) as Direction,
          };
        }
      }
    }

    return {
      width,
      height,
      grid,
      startPos,
      endPos,
      solved: false,
      context,
      failedAttempts: 0,
    };
  }

  /**
   * Carve a path from start to end using DFS with random neighbor ordering.
   * Returns an array of {x, y} positions forming the path.
   */
  private static carvePath(
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

      // Shuffle neighbors but bias toward the end position
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
        // 50% random, 50% goal-directed
        if (scopedRNG('puzzle', 42, rngTick()) < 0.5) return scopedRNG('puzzle', 42, rngTick()) - 0.5;
        return 0;
      });

      // Additionally, prefer neighbors closer to the goal
      neighbors.sort((a, b) => {
        const distA = Math.abs(a.x - end.x) + Math.abs(a.y - end.y);
        const distB = Math.abs(b.x - end.x) + Math.abs(b.y - end.y);
        // Weak bias: only sort if random agrees
        if (scopedRNG('puzzle', 42, rngTick()) < 0.4) return distA - distB;
        return 0;
      });

      for (const neighbor of neighbors) {
        if (dfs(neighbor.x, neighbor.y)) return true;
      }

      // Backtrack
      path.pop();
      return false;
    }

    dfs(start.x, start.y);
    return path;
  }

  /**
   * Assign pipe types and rotations along the carved path.
   * Each path cell's type is determined by which directions it connects to.
   */
  private static assignPathPipes(
    grid: PipeCell[][],
    path: { x: number; y: number }[],
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
  ): void {
    for (let i = 0; i < path.length; i++) {
      const curr = path[i];
      const connections: boolean[] = [false, false, false, false]; // N, E, S, W

      // Connect to previous cell
      if (i > 0) {
        const prev = path[i - 1];
        const dir = PuzzleGenerator.getDirection(curr, prev);
        if (dir !== -1) connections[dir] = true;
      }

      // Connect to next cell
      if (i < path.length - 1) {
        const next = path[i + 1];
        const dir = PuzzleGenerator.getDirection(curr, next);
        if (dir !== -1) connections[dir] = true;
      }

      // Determine pipe type and rotation from connection pattern
      const { type, rotation } = PuzzleGenerator.pipeFromConnections(connections);

      // Source and sink are special types
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
   * Get the direction from `from` to `to` (adjacent cells).
   * Returns 0=N, 1=E, 2=S, 3=W, or -1 if not adjacent.
   */
  private static getDirection(
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
   *
   * Connection patterns for each pipe type at rotation 0:
   * - straight: [N, S] (2 opposite)
   * - corner:   [N, E] (2 adjacent)
   * - tee:      [N, E, S] (3 connections)
   * - cross:    [N, E, S, W] (4 connections)
   * - cap:      [N] (1 connection)
   */
  private static pipeFromConnections(
    connections: boolean[],
  ): { type: PipeType; rotation: Direction } {
    const count = connections.filter(Boolean).length;

    if (count === 4) {
      return { type: 'cross', rotation: 0 };
    }

    if (count === 3) {
      // Tee: base is [N, E, S] -> missing W (index 3)
      // Find the missing direction
      const missing = connections.indexOf(false);
      // Rotation = missing direction index (rotate tee so open side faces the missing direction)
      // Base tee at rot 0: N(0), E(1), S(2) connected, W(3) open
      // So rotation = (missing - 3 + 4) % 4 ... but let's think about it differently:
      // At rotation 0, connections are at indices 0,1,2 (N,E,S) - the gap is at 3 (W)
      // At rotation 1, connections are at indices 1,2,3 (E,S,W) - the gap is at 0 (N)
      // At rotation 2, connections are at indices 2,3,0 (S,W,N) - the gap is at 1 (E)
      // At rotation 3, connections are at indices 3,0,1 (W,N,E) - the gap is at 2 (S)
      // Gap direction at rotation R = (3 + R) % 4 = (R + 3) % 4
      // So R = (missing - 3 + 4) % 4 = (missing + 1) % 4
      const rotation = ((missing + 1) % 4) as Direction;
      return { type: 'tee', rotation };
    }

    if (count === 2) {
      const dirs = connections
        .map((c, i) => (c ? i : -1))
        .filter((i) => i !== -1);
      const [a, b] = dirs;

      // Check if opposite (straight) or adjacent (corner)
      if ((a + 2) % 4 === b) {
        // Straight pipe: base is N-S [0,2]
        // If connected N-S (0,2): rotation 0
        // If connected E-W (1,3): rotation 1
        const rotation = (Math.min(a, b) % 2) as Direction;
        return { type: 'straight', rotation };
      }

      // Corner pipe: base is N-E [0,1]
      // Find which pair of adjacent directions we have
      // Base at rot 0: N(0), E(1)
      // Base at rot 1: E(1), S(2)
      // Base at rot 2: S(2), W(3)
      // Base at rot 3: W(3), N(0)
      // The lower index of the pair = the rotation (with wraparound for 3,0)
      let rotation: number;
      if ((a === 3 && b === 0) || (a === 0 && b === 3)) {
        rotation = 3;
      } else {
        rotation = Math.min(a, b);
      }
      return { type: 'corner', rotation: rotation as Direction };
    }

    if (count === 1) {
      // Cap: base points N (index 0)
      const dir = connections.indexOf(true);
      return { type: 'cap', rotation: dir as Direction };
    }

    // Fallback (shouldn't happen on a valid path)
    return { type: 'cross', rotation: 0 };
  }

  /**
   * Lock random non-path cells to increase difficulty.
   */
  private static lockRandomCells(
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

    // Shuffle and pick
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
}
