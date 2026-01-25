import type { PipeCell, PipePuzzleState, Direction, PipeType } from './types';

// Map of pipe types to their connections at rotation 0 (North, East, South, West)
// 1 = connected, 0 = not connected
const CONNECTIONS: Record<PipeType, [number, number, number, number]> = {
  straight: [1, 0, 1, 0], // N-S
  corner: [1, 1, 0, 0],   // N-E
  tee: [1, 1, 1, 0],      // N-E-S
  cross: [1, 1, 1, 1],    // All
  cap: [1, 0, 0, 0],      // N
  empty: [0, 0, 0, 0],
  source: [1, 0, 0, 0],   // Treated effectively as a cap that provides flow
  sink: [1, 0, 0, 0],     // Treated effectively as a cap that accepts flow
};

/**
 * Utility class containing the core logic for the pipe fitting puzzle.
 * Handles connectivity checks, cell rotations, and flow calculations.
 */
export class PipeLogic {
  /**
   * Get connections for a specific pipe type and rotation.
   * 
   * @param type - The type of pipe (straight, corner, etc.)
   * @param rotation - The clockwise rotation (0-3)
   * @returns A tuple of booleans [North, East, South, West] indicating if that side has a connection.
   */
  static getConnections(type: PipeType, rotation: Direction): [boolean, boolean, boolean, boolean] {
    const base = CONNECTIONS[type];
    // Rotate the array right by `rotation` steps
    // e.g. rot 1 (East) means index 0 moves to index 1
    // Physically: If a pipe points N (index 0) and we rotate it 90deg CW (rot 1):
    // The connection that WAS North is now East.
    
    const rotated: [number, number, number, number] = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      rotated[(i + rotation) % 4] = base[i];
    }
    
    return [
      rotated[0] === 1,
      rotated[1] === 1,
      rotated[2] === 1,
      rotated[3] === 1,
    ];
  }

  /**
   * Rotates a cell 90 degrees clockwise.
   * 
   * @param cell - The pipe cell to rotate.
   * @returns A new cell object with the updated rotation, or the same cell if it is fixed.
   */
  static rotateCell(cell: PipeCell): PipeCell {
    if (cell.fixed) return cell;
    return {
      ...cell,
      rotation: ((cell.rotation + 1) % 4) as Direction,
    };
  }

  /**
   * Checks flow connectivity starting from the source point.
   * Performs a breadth-first search to find all reachable pipes and checks if the sink is reached.
   * 
   * @param state - The current state of the pipe puzzle grid.
   * @returns An object containing the solved status and the updated grid with 'active' flags set on reachable pipes.
   */
  static checkFlow(state: PipePuzzleState): { solved: boolean; newGrid: PipeCell[][] } {
    const width = state.width;
    const height = state.height;
    
    // Deep copy grid to update active status
    const newGrid = state.grid.map(row => row.map(cell => ({ ...cell, active: false })));
    
    // Start DFS/BFS from source
    const queue: { x: number; y: number }[] = [state.startPos];
    newGrid[state.startPos.y][state.startPos.x].active = true;
    
    const visited = new Set<string>();
    visited.add(`${state.startPos.x},${state.startPos.y}`);
    
    let solved = false;

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currCell = newGrid[current.y][current.x];
      const currConns = this.getConnections(currCell.type, currCell.rotation); // [N, E, S, W]
      
      // Directions: N(0), E(1), S(2), W(3)
      // Delta: N(0,-1), E(1,0), S(0,1), W(-1,0)
      const deltas = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      
      for (let dir = 0; dir < 4; dir++) {
        // If current cell has a connection in this direction
        if (currConns[dir]) {
          const nx = current.x + deltas[dir][0];
          const ny = current.y + deltas[dir][1];
          
          // Check bounds
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nextCell = newGrid[ny][nx];
            const nextConns = this.getConnections(nextCell.type, nextCell.rotation);
            
            // Check if neighbor connects BACK to us
            // N(0) needs neighbor to connect S(2)
            // E(1) needs neighbor to connect W(3)
            // etc. -> (dir + 2) % 4
            if (nextConns[(dir + 2) % 4]) {
              const key = `${nx},${ny}`;
              if (!visited.has(key)) {
                visited.add(key);
                nextCell.active = true;
                queue.push({ x: nx, y: ny });
                
                // Check if we hit the sink
                if (nx === state.endPos.x && ny === state.endPos.y) {
                  solved = true;
                }
              }
            }
          }
        }
      }
    }

    return { solved, newGrid };
  }
}
