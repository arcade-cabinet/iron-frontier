// A* Pathfinding for grid-based movement

import type { GridPos, SectorTile } from '../lib/types';

interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic (estimated cost to goal)
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

// Manhattan distance heuristic
function heuristic(a: GridPos, b: GridPos): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Get valid neighbors (4-directional movement)
function getNeighbors(
  pos: GridPos,
  grid: SectorTile[][],
  width: number,
  height: number
): GridPos[] {
  const neighbors: GridPos[] = [];
  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 0, y: 1 }, // Down
    { x: -1, y: 0 }, // Left
    { x: 1, y: 0 }, // Right
  ];

  for (const dir of directions) {
    const nx = pos.x + dir.x;
    const ny = pos.y + dir.y;

    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      if (grid[ny][nx].walkable) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }

  return neighbors;
}

// Find path using A* algorithm
export function findPath(
  start: GridPos,
  goal: GridPos,
  grid: SectorTile[][],
  width: number,
  height: number
): GridPos[] {
  // Validate start tile is walkable
  if (!grid[start.y]?.[start.x]?.walkable) {
    return [];
  }

  // Check if goal is valid
  if (!grid[goal.y]?.[goal.x]?.walkable) {
    return [];
  }

  // Check if start equals goal
  if (start.x === goal.x && start.y === goal.y) {
    return [start];
  }

  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();

  const startNode: PathNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, goal),
    f: heuristic(start, goal),
    parent: null,
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    // Find node with lowest f cost
    let lowestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIdx].f) {
        lowestIdx = i;
      }
    }

    const current = openSet[lowestIdx];

    // Check if we reached the goal
    if (current.x === goal.x && current.y === goal.y) {
      // Reconstruct path
      const path: GridPos[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    // Move current from open to closed
    openSet.splice(lowestIdx, 1);
    closedSet.add(`${current.x},${current.y}`);

    // Check neighbors
    const neighbors = getNeighbors({ x: current.x, y: current.y }, grid, width, height);

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;

      // Skip if already evaluated
      if (closedSet.has(key)) continue;

      const g = current.g + 1; // Cost is 1 per tile

      // Check if this path is better
      let neighborNode = openSet.find((n) => n.x === neighbor.x && n.y === neighbor.y);

      if (!neighborNode) {
        // New node
        neighborNode = {
          x: neighbor.x,
          y: neighbor.y,
          g,
          h: heuristic(neighbor, goal),
          f: g + heuristic(neighbor, goal),
          parent: current,
        };
        openSet.push(neighborNode);
      } else if (g < neighborNode.g) {
        // Better path found
        neighborNode.g = g;
        neighborNode.f = g + neighborNode.h;
        neighborNode.parent = current;
      }
    }
  }

  // No path found
  return [];
}

// Get the next step towards a goal (for real-time movement)
export function getNextStep(
  current: GridPos,
  goal: GridPos,
  grid: SectorTile[][],
  width: number,
  height: number
): GridPos | null {
  const path = findPath(current, goal, grid, width, height);

  if (path.length < 2) {
    return null; // No path or already at goal
  }

  return path[1]; // Return the next step (index 0 is current position)
}

// Check if two positions are adjacent
export function isAdjacent(a: GridPos, b: GridPos): boolean {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

// Get distance between two grid positions
export function gridDistance(a: GridPos, b: GridPos): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Find nearest walkable tile to a position
export function findNearestWalkable(
  pos: GridPos,
  grid: SectorTile[][],
  width: number,
  height: number,
  maxRadius: number = 5
): GridPos | null {
  // Check if current position is walkable
  if (grid[pos.y]?.[pos.x]?.walkable) {
    return pos;
  }

  // Spiral search outward
  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

        const nx = pos.x + dx;
        const ny = pos.y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (grid[ny][nx].walkable) {
            return { x: nx, y: ny };
          }
        }
      }
    }
  }

  return null;
}
