import type { Direction, LockLevel, PipeCell, PipePuzzleState, PipeType, PuzzleContext } from './types';
import { LOCK_DIFFICULTY } from './types';
import { scopedRNG, rngTick } from '../../lib/prng';
import { carvePath, assignPathPipes, lockRandomCells } from './pathCarver';

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
 */
export class PuzzleGenerator {
  /** Generate a solvable pipe puzzle for a given lock level. */
  static generateForLock(lockLevel: LockLevel, context: PuzzleContext): PipePuzzleState {
    const diff = LOCK_DIFFICULTY[lockLevel];
    return PuzzleGenerator.generate(diff.width, diff.height, context);
  }

  /** Generate a solvable pipe puzzle of the given dimensions. */
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

    // Carve a path from source to sink
    const path = carvePath(width, height, startPos, endPos);

    // Assign pipe types along the path
    assignPathPipes(grid, path, startPos, endPos);

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
      lockRandomCells(grid, path, diff.lockedCells);
    }

    // Scramble all non-fixed cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[y][x];
        if (!cell.fixed) {
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
}
