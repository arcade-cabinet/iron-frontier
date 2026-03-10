export type PipeType =
  | 'straight'
  | 'corner'
  | 'tee'
  | 'cross'
  | 'cap'
  | 'empty'
  | 'source'
  | 'sink';

export type Direction = 0 | 1 | 2 | 3; // 0: N, 1: E, 2: S, 3: W

export interface PipeCell {
  x: number;
  y: number;
  type: PipeType;
  rotation: Direction;
  fixed: boolean; // If true, cannot be rotated
  active: boolean; // Is flow reaching this cell?
  locked: boolean; // If true, cell is locked and cannot be interacted with
}

/** Lock difficulty levels that map to puzzle complexity. */
export type LockLevel = 1 | 2 | 3 | 4 | 5;

/** Puzzle difficulty configuration derived from lock level. */
export interface PuzzleDifficulty {
  /** Grid width */
  width: number;
  /** Grid height */
  height: number;
  /** Number of locked (non-rotatable) noise cells */
  lockedCells: number;
  /** Lockpick cost to force the lock open */
  forceLockCost: number;
  /** Label for the difficulty (e.g., "Novice", "Master") */
  label: string;
}

/** Maps lock levels to puzzle difficulty configurations. */
export const LOCK_DIFFICULTY: Record<LockLevel, PuzzleDifficulty> = {
  1: { width: 4, height: 4, lockedCells: 0, forceLockCost: 2, label: 'Novice' },
  2: { width: 5, height: 4, lockedCells: 1, forceLockCost: 3, label: 'Advanced' },
  3: { width: 5, height: 5, lockedCells: 2, forceLockCost: 4, label: 'Expert' },
  4: { width: 6, height: 5, lockedCells: 3, forceLockCost: 5, label: 'Master' },
  5: { width: 6, height: 6, lockedCells: 4, forceLockCost: 7, label: 'Impossible' },
};

/** Context describing what the puzzle is being used to unlock. */
export interface PuzzleContext {
  /** The entity ID of the locked container/door */
  targetEntityId: string;
  /** Display name (e.g., "Locked Chest", "Security Door") */
  targetName: string;
  /** Lock difficulty level */
  lockLevel: LockLevel;
}

export interface PipePuzzleState {
  width: number;
  height: number;
  grid: PipeCell[][];
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  solved: boolean;
  /** Lock/interaction context, null for generic puzzles */
  context: PuzzleContext | null;
  /** Number of failed attempts on this puzzle */
  failedAttempts: number;
}
