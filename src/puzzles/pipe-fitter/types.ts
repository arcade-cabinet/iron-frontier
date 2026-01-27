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
}

export interface PipePuzzleState {
  width: number;
  height: number;
  grid: PipeCell[][];
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  solved: boolean;
}
