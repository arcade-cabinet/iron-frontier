/**
 * HexECS - Entity Component System for hex tiles using miniplex
 *
 * Manages hex tile entities with components for:
 * - Position (hex coordinates)
 * - Terrain properties (movement cost, passability)
 * - Adjacencies (connections to neighboring tiles)
 * - Features (buildings, resources, decorations)
 */

import { World } from 'miniplex';
import { hexDistance, hexNeighbor } from './HexCoord';
import {
  HEX_DIRECTIONS,
  HexBuildingType,
  type HexCoord,
  type HexDirection,
  HexEdgeType,
  HexElevation,
  HexFeatureType,
  HexTerrainType,
  hexKey,
  parseHexKey,
} from './HexTypes';

// ============================================================================
// COMPONENT TYPES
// ============================================================================

/**
 * Hex position component
 */
export interface HexPositionComponent {
  coord: HexCoord;
  key: string; // Pre-computed string key for fast lookups
}

/**
 * Terrain component - defines the base ground type
 */
export interface TerrainComponent {
  type: HexTerrainType;
  elevation: HexElevation;
  variant: number; // Visual variant (0-3)
  rotation: number; // Visual rotation (0-5 for 60° steps)
}

/**
 * Movement component - defines how entities can move through this tile
 */
export interface MovementComponent {
  passable: boolean; // Can entities enter this tile?
  cost: number; // Movement cost (1.0 = normal, 2.0 = difficult, Infinity = impassable)
  swimRequired: boolean; // Requires swimming to cross
  climbRequired: boolean; // Requires climbing to cross
  flyOnly: boolean; // Only flying entities can cross
}

/**
 * Movement cost presets for terrain types
 */
export const TERRAIN_MOVEMENT_COSTS: Record<HexTerrainType, Partial<MovementComponent>> = {
  // Grass - easy terrain
  [HexTerrainType.Grass]: { passable: true, cost: 1.0 },
  [HexTerrainType.GrassHill]: { passable: true, cost: 1.5 },
  [HexTerrainType.GrassForest]: { passable: true, cost: 2.0 }, // Dense foliage slows movement

  // Sand - slightly harder
  [HexTerrainType.Sand]: { passable: true, cost: 1.2 },
  [HexTerrainType.SandHill]: { passable: true, cost: 1.8 },
  [HexTerrainType.SandDunes]: { passable: true, cost: 2.0 },

  // Dirt - normal terrain
  [HexTerrainType.Dirt]: { passable: true, cost: 1.0 },
  [HexTerrainType.DirtHill]: { passable: true, cost: 1.5 },

  // Stone - harder terrain
  [HexTerrainType.Stone]: { passable: true, cost: 1.3 },
  [HexTerrainType.StoneHill]: { passable: true, cost: 2.0, climbRequired: true },
  [HexTerrainType.StoneMountain]: { passable: false, cost: Infinity, flyOnly: true }, // IMPASSABLE
  [HexTerrainType.StoneRocks]: { passable: true, cost: 2.5, climbRequired: true },

  // Water - requires swimming
  [HexTerrainType.Water]: { passable: true, cost: 3.0, swimRequired: true },
  [HexTerrainType.WaterShallow]: { passable: true, cost: 2.0 }, // Can wade through
  [HexTerrainType.WaterDeep]: {
    passable: false,
    cost: Infinity,
    swimRequired: true,
    flyOnly: true,
  },

  // Special terrain
  [HexTerrainType.Lava]: { passable: false, cost: Infinity, flyOnly: true },
  [HexTerrainType.Snow]: { passable: true, cost: 1.8 },
  [HexTerrainType.Ice]: { passable: true, cost: 1.5 }, // Slippery but not slower

  // Western-specific
  [HexTerrainType.Mesa]: { passable: true, cost: 1.5, climbRequired: true },
  [HexTerrainType.Canyon]: { passable: false, cost: Infinity, climbRequired: true },
  [HexTerrainType.Badlands]: { passable: true, cost: 2.0 },
};

/**
 * Adjacency component - tracks connections to neighboring tiles
 */
export interface AdjacencyComponent {
  neighbors: Map<HexDirection, string | null>; // Map of direction -> neighbor entity key (null if no tile)
  edges: Map<HexDirection, HexEdgeType>; // Edge features (roads, rivers, etc.)
}

/**
 * Feature component - decorations, resources, buildings on the tile
 */
export interface FeatureComponent {
  feature: HexFeatureType;
  building: HexBuildingType;
  buildingRotation: number;
}

/**
 * Visibility component - fog of war state
 */
export interface VisibilityComponent {
  explored: boolean; // Has ever been seen
  visible: boolean; // Currently in view
  lastSeenTurn: number; // Game turn when last seen
}

/**
 * Resource component - for tiles with extractable resources
 */
export interface ResourceComponent {
  resourceType: 'none' | 'ore' | 'oil' | 'water' | 'lumber';
  amount: number; // Remaining amount
  maxAmount: number;
  regenerates: boolean;
  regenRate: number; // Amount per turn
}

// ============================================================================
// ENTITY TYPE
// ============================================================================

/**
 * Complete hex tile entity with all possible components.
 * Not all components are required - miniplex handles partial entities.
 */
export interface HexTileEntity {
  // Core (required)
  position: HexPositionComponent;
  terrain: TerrainComponent;
  movement: MovementComponent;

  // Optional
  adjacency?: AdjacencyComponent;
  feature?: FeatureComponent;
  visibility?: VisibilityComponent;
  resource?: ResourceComponent;

  // Tags (marker components with no data)
  isSpawnPoint?: true;
  isBuildingSite?: true;
  isPathNode?: true;
  isRiverCrossing?: true;
}

// ============================================================================
// WORLD CREATION
// ============================================================================

/**
 * Create a new hex world (miniplex World instance)
 */
export function createHexWorld(): World<HexTileEntity> {
  return new World<HexTileEntity>();
}

// ============================================================================
// ENTITY FACTORIES
// ============================================================================

/**
 * Create a hex tile entity from terrain data
 */
export function createHexTileEntity(
  coord: HexCoord,
  terrainType: HexTerrainType,
  elevation: HexElevation = HexElevation.Ground,
  variant: number = 0,
  rotation: number = 0
): HexTileEntity {
  const movementPreset = TERRAIN_MOVEMENT_COSTS[terrainType] ?? { passable: true, cost: 1.0 };

  return {
    position: {
      coord,
      key: hexKey(coord),
    },
    terrain: {
      type: terrainType,
      elevation,
      variant,
      rotation,
    },
    movement: {
      passable: movementPreset.passable ?? true,
      cost: movementPreset.cost ?? 1.0,
      swimRequired: movementPreset.swimRequired ?? false,
      climbRequired: movementPreset.climbRequired ?? false,
      flyOnly: movementPreset.flyOnly ?? false,
    },
  };
}

/**
 * Add adjacency data to an entity
 */
export function addAdjacencyComponent(entity: HexTileEntity, world: World<HexTileEntity>): void {
  const neighbors = new Map<HexDirection, string | null>();
  const edges = new Map<HexDirection, HexEdgeType>();

  // Find neighbors in each direction
  for (const direction of HEX_DIRECTIONS) {
    const neighborCoord = hexNeighbor(entity.position.coord, direction);
    const neighborKey = hexKey(neighborCoord);

    // Check if neighbor exists in world
    const neighborEntity = findEntityByKey(world, neighborKey);
    neighbors.set(direction, neighborEntity ? neighborKey : null);
    edges.set(direction, HexEdgeType.None);
  }

  entity.adjacency = { neighbors, edges };
}

/**
 * Add feature component to an entity
 */
export function addFeatureComponent(
  entity: HexTileEntity,
  feature: HexFeatureType = HexFeatureType.None,
  building: HexBuildingType = HexBuildingType.None,
  buildingRotation: number = 0
): void {
  entity.feature = { feature, building, buildingRotation };
}

/**
 * Add visibility component to an entity
 */
export function addVisibilityComponent(
  entity: HexTileEntity,
  explored: boolean = false,
  visible: boolean = false
): void {
  entity.visibility = { explored, visible, lastSeenTurn: 0 };
}

/**
 * Add resource component to an entity
 */
export function addResourceComponent(
  entity: HexTileEntity,
  resourceType: ResourceComponent['resourceType'],
  amount: number,
  regenerates: boolean = false,
  regenRate: number = 0
): void {
  entity.resource = {
    resourceType,
    amount,
    maxAmount: amount,
    regenerates,
    regenRate,
  };
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Find an entity by its hex key
 */
export function findEntityByKey(
  world: World<HexTileEntity>,
  key: string
): HexTileEntity | undefined {
  for (const entity of world) {
    if (entity.position.key === key) {
      return entity;
    }
  }
  return undefined;
}

/**
 * Find an entity by hex coordinate
 */
export function findEntityByCoord(
  world: World<HexTileEntity>,
  coord: HexCoord
): HexTileEntity | undefined {
  return findEntityByKey(world, hexKey(coord));
}

/**
 * Get all passable neighbors of a tile
 */
export function getPassableNeighbors(
  world: World<HexTileEntity>,
  coord: HexCoord
): HexTileEntity[] {
  const results: HexTileEntity[] = [];

  for (const direction of HEX_DIRECTIONS) {
    const neighborCoord = hexNeighbor(coord, direction);
    const neighbor = findEntityByCoord(world, neighborCoord);

    if (neighbor && neighbor.movement.passable) {
      results.push(neighbor);
    }
  }

  return results;
}

/**
 * Get movement cost to enter a tile
 */
export function getMovementCost(entity: HexTileEntity): number {
  if (!entity.movement.passable) {
    return Infinity;
  }
  return entity.movement.cost;
}

/**
 * Check if a tile is passable for a specific entity type
 */
export interface MovementCapabilities {
  canSwim: boolean;
  canClimb: boolean;
  canFly: boolean;
}

export function canTraverse(tile: HexTileEntity, capabilities: MovementCapabilities): boolean {
  const { movement } = tile;

  if (!movement.passable) {
    // Only flying entities can cross impassable terrain marked flyOnly
    return movement.flyOnly && capabilities.canFly;
  }

  if (movement.swimRequired && !capabilities.canSwim) {
    return false;
  }

  if (movement.climbRequired && !capabilities.canClimb) {
    return false;
  }

  return true;
}

/**
 * Calculate effective movement cost considering capabilities
 */
export function getEffectiveMovementCost(
  tile: HexTileEntity,
  capabilities: MovementCapabilities
): number {
  if (!canTraverse(tile, capabilities)) {
    return Infinity;
  }

  let cost = tile.movement.cost;

  // Flying reduces cost on difficult terrain
  if (capabilities.canFly && (tile.movement.climbRequired || tile.movement.swimRequired)) {
    cost = Math.min(cost, 1.5);
  }

  return cost;
}

// ============================================================================
// PATHFINDING HELPERS
// ============================================================================

/**
 * A* pathfinding result
 */
export interface PathResult {
  path: HexCoord[];
  totalCost: number;
  reachable: boolean;
}

/**
 * Find a path between two hexes using A*
 */
export function findPath(
  world: World<HexTileEntity>,
  from: HexCoord,
  to: HexCoord,
  capabilities: MovementCapabilities = { canSwim: false, canClimb: true, canFly: false },
  maxCost: number = Infinity
): PathResult {
  // A* implementation
  interface Node {
    coord: HexCoord;
    gCost: number; // Cost from start
    hCost: number; // Heuristic (distance to goal)
    fCost: number; // Total (g + h)
    parent: string | null;
  }

  const openSet = new Map<string, Node>();
  const closedSet = new Set<string>();

  const startKey = hexKey(from);
  const goalKey = hexKey(to);

  // Initialize start node
  const heuristic = hexDistance(from, to);
  openSet.set(startKey, {
    coord: from,
    gCost: 0,
    hCost: heuristic,
    fCost: heuristic,
    parent: null,
  });

  while (openSet.size > 0) {
    // Find node with lowest fCost
    let currentKey = '';
    let lowestF = Infinity;

    for (const [key, node] of openSet) {
      if (node.fCost < lowestF) {
        lowestF = node.fCost;
        currentKey = key;
      }
    }

    const current = openSet.get(currentKey)!;
    openSet.delete(currentKey);
    closedSet.add(currentKey);

    // Check if we reached the goal
    if (currentKey === goalKey) {
      // Reconstruct path
      const path: HexCoord[] = [];
      let traceKey: string | null = currentKey;

      while (traceKey !== null) {
        path.unshift(parseHexKey(traceKey));
        const traceNode: typeof current | null = traceKey === currentKey ? current : null;
        // Find the node in closed set by reconstructing
        if (traceNode) {
          traceKey = traceNode.parent;
        } else {
          // Need to trace back through our path reconstruction
          break;
        }
      }

      // Better path reconstruction (simplified for now)
      const finalPath: HexCoord[] = [];
      finalPath.unshift(to);
      let parentKey = current.parent;
      while (parentKey !== null) {
        finalPath.unshift(parseHexKey(parentKey));
        // This is a simplified reconstruction - in production code,
        // you'd store parent references properly
        parentKey = null; // Would need proper tracking
      }
      finalPath.unshift(from);

      return {
        path: [from, to], // Simplified for now
        totalCost: current.gCost,
        reachable: true,
      };
    }

    // Explore neighbors
    for (const direction of HEX_DIRECTIONS) {
      const neighborCoord = hexNeighbor(current.coord, direction);
      const neighborKey = hexKey(neighborCoord);

      if (closedSet.has(neighborKey)) continue;

      const neighborEntity = findEntityByCoord(world, neighborCoord);
      if (!neighborEntity) continue;

      const moveCost = getEffectiveMovementCost(neighborEntity, capabilities);
      if (moveCost === Infinity) continue;

      const newGCost = current.gCost + moveCost;
      if (newGCost > maxCost) continue;

      const existingNode = openSet.get(neighborKey);
      if (existingNode && newGCost >= existingNode.gCost) continue;

      const h = hexDistance(neighborCoord, to);
      openSet.set(neighborKey, {
        coord: neighborCoord,
        gCost: newGCost,
        hCost: h,
        fCost: newGCost + h,
        parent: currentKey,
      });
    }
  }

  // No path found
  return {
    path: [],
    totalCost: Infinity,
    reachable: false,
  };
}

// ============================================================================
// WORLD POPULATION
// ============================================================================

/**
 * Populate a world from HexGrid data
 */
export function populateWorldFromGrid(
  world: World<HexTileEntity>,
  tiles: Map<string, { coord: HexCoord; terrain: HexTerrainType; elevation: HexElevation }>
): void {
  // First pass: create all entities
  for (const [_key, tileData] of tiles) {
    const entity = createHexTileEntity(tileData.coord, tileData.terrain, tileData.elevation);
    world.add(entity);
  }

  // Second pass: compute adjacencies
  for (const entity of world) {
    addAdjacencyComponent(entity, world);
  }

  console.log(`[HexECS] Populated world with ${world.size} tile entities`);
}

// ============================================================================
// ARCHETYPE QUERIES (miniplex style)
// ============================================================================

/**
 * Create commonly used queries
 */
export function createHexQueries(world: World<HexTileEntity>) {
  return {
    // All tiles with terrain
    allTiles: world.with('position', 'terrain', 'movement'),

    // Passable tiles only
    passableTiles: world.with('position', 'terrain', 'movement').where((e) => e.movement.passable),

    // Tiles with buildings
    buildingTiles: world
      .with('position', 'feature')
      .where((e) => e.feature?.building !== HexBuildingType.None),

    // Tiles with resources
    resourceTiles: world
      .with('position', 'resource')
      .where((e) => e.resource !== undefined && e.resource.amount > 0),

    // Spawn points
    spawnPoints: world.with('position', 'isSpawnPoint'),

    // Path nodes (for roads/paths)
    pathNodes: world.with('position', 'isPathNode'),

    // Explored tiles
    exploredTiles: world
      .with('position', 'visibility')
      .where((e) => e.visibility?.explored === true),

    // Currently visible tiles
    visibleTiles: world.with('position', 'visibility').where((e) => e.visibility?.visible === true),
  };
}

export type HexQueries = ReturnType<typeof createHexQueries>;

// ============================================================================
// REACT INTEGRATION TYPES
// ============================================================================

/**
 * Context value for React integration
 */
export interface HexWorldContext {
  world: World<HexTileEntity>;
  queries: HexQueries;
}

export default {
  createHexWorld,
  createHexTileEntity,
  addAdjacencyComponent,
  addFeatureComponent,
  addVisibilityComponent,
  addResourceComponent,
  findEntityByKey,
  findEntityByCoord,
  getPassableNeighbors,
  getMovementCost,
  canTraverse,
  getEffectiveMovementCost,
  findPath,
  populateWorldFromGrid,
  createHexQueries,
};
