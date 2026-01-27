/**
 * HexMapGenerator - Procedural hex grid map generator for Iron Frontier
 *
 * Generates western-themed hex maps using simplex noise for biome distribution,
 * with procedural path/river placement and building site designation.
 */

import Alea from 'alea';
import { createNoise2D, type NoiseFunction2D } from 'simplex-noise';

// ============================================================================
// TILE TYPES (Kenney Hexagon Kit)
// ============================================================================

/** Base terrain tile types */
export type TerrainTile =
  | 'grass'
  | 'grass-forest'
  | 'grass-hill'
  | 'dirt'
  | 'dirt-lumber'
  | 'sand'
  | 'sand-desert'
  | 'sand-rocks'
  | 'stone'
  | 'stone-hill'
  | 'stone-mountain'
  | 'stone-rocks'
  | 'water'
  | 'water-island'
  | 'water-rocks';

/** Path tile types with connection configurations */
export type PathTile =
  | 'path-straight'
  | 'path-corner'
  | 'path-crossing'
  | 'path-intersectionA'
  | 'path-intersectionB'
  | 'path-intersectionC'
  | 'path-intersectionD'
  | 'path-intersectionE'
  | 'path-intersectionF'
  | 'path-intersectionG'
  | 'path-intersectionH';

/** River tile types with connection configurations */
export type RiverTile =
  | 'river-straight'
  | 'river-corner'
  | 'river-crossing'
  | 'river-intersectionA'
  | 'river-intersectionB'
  | 'river-intersectionC'
  | 'river-intersectionD'
  | 'river-intersectionE'
  | 'river-intersectionF'
  | 'river-intersectionG'
  | 'river-intersectionH';

/** Building tile types */
export type BuildingTile =
  | 'building-cabin'
  | 'building-farm'
  | 'building-mine'
  | 'building-mill'
  | 'building-market'
  | 'building-tower'
  | 'building-village';

/** Western biome types */
export type HexBiome = 'desert' | 'grassland' | 'badlands' | 'riverside';

// ============================================================================
// HEX COORDINATE SYSTEM (Axial Coordinates)
// ============================================================================

/**
 * Axial hex coordinates (q = column, r = row)
 * Uses "pointy-top" hex orientation
 */
export interface HexCoord {
  q: number;
  r: number;
}

/** Convert axial to cube coordinates for distance calculations */
export interface CubeCoord {
  x: number;
  y: number;
  z: number;
}

/** Create a string key from hex coordinates for Map storage */
export function hexKey(coord: HexCoord): string {
  return `${coord.q},${coord.r}`;
}

/** Parse a hex key back to coordinates */
export function parseHexKey(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

/** Convert axial to cube coordinates */
export function axialToCube(hex: HexCoord): CubeCoord {
  const x = hex.q;
  const z = hex.r;
  const y = -x - z;
  return { x, y, z };
}

/** Convert cube to axial coordinates */
export function cubeToAxial(cube: CubeCoord): HexCoord {
  return { q: cube.x, r: cube.z };
}

/** Calculate distance between two hex cells */
export function hexDistance(a: HexCoord, b: HexCoord): number {
  const ac = axialToCube(a);
  const bc = axialToCube(b);
  return Math.max(Math.abs(ac.x - bc.x), Math.abs(ac.y - bc.y), Math.abs(ac.z - bc.z));
}

/** Get all 6 neighboring hex coordinates */
export function hexNeighbors(hex: HexCoord): HexCoord[] {
  const directions: HexCoord[] = [
    { q: 1, r: 0 }, // East
    { q: 1, r: -1 }, // Northeast
    { q: 0, r: -1 }, // Northwest
    { q: -1, r: 0 }, // West
    { q: -1, r: 1 }, // Southwest
    { q: 0, r: 1 }, // Southeast
  ];
  return directions.map((d) => ({ q: hex.q + d.q, r: hex.r + d.r }));
}

/** Get neighbor in a specific direction (0-5, starting East, going counter-clockwise) */
export function hexNeighborInDirection(hex: HexCoord, direction: number): HexCoord {
  const directions: HexCoord[] = [
    { q: 1, r: 0 }, // 0: East
    { q: 1, r: -1 }, // 1: Northeast
    { q: 0, r: -1 }, // 2: Northwest
    { q: -1, r: 0 }, // 3: West
    { q: -1, r: 1 }, // 4: Southwest
    { q: 0, r: 1 }, // 5: Southeast
  ];
  const d = directions[direction % 6];
  return { q: hex.q + d.q, r: hex.r + d.r };
}

/** Convert hex coordinates to world position (pointy-top orientation) */
export function hexToWorld(hex: HexCoord, hexSize: number = 1): { x: number; z: number } {
  const x = hexSize * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
  const z = hexSize * ((3 / 2) * hex.r);
  return { x, z };
}

/** Convert world position to hex coordinates */
export function worldToHex(worldX: number, worldZ: number, hexSize: number = 1): HexCoord {
  const q = ((Math.sqrt(3) / 3) * worldX - (1 / 3) * worldZ) / hexSize;
  const r = ((2 / 3) * worldZ) / hexSize;
  return hexRound({ q, r });
}

/** Round fractional hex coordinates to nearest hex */
export function hexRound(hex: HexCoord): HexCoord {
  const cube = axialToCube(hex);
  let rx = Math.round(cube.x);
  let ry = Math.round(cube.y);
  let rz = Math.round(cube.z);

  const xDiff = Math.abs(rx - cube.x);
  const yDiff = Math.abs(ry - cube.y);
  const zDiff = Math.abs(rz - cube.z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return cubeToAxial({ x: rx, y: ry, z: rz });
}

// ============================================================================
// HEX TILE DATA
// ============================================================================

/** Building site designation */
export type BuildingSiteType = 'town' | 'mine' | 'farm' | 'outpost' | 'crossing';

/** Data for a single hex tile */
export interface HexTileData {
  coord: HexCoord;
  biome: HexBiome;
  baseTile: TerrainTile;
  pathTile?: PathTile;
  riverTile?: RiverTile;
  building?: BuildingTile;
  buildingSite?: BuildingSiteType;
  rotation: number; // 0-5 for 60-degree increments
  elevation: number;
  moisture: number;
}

// ============================================================================
// GENERATOR CONFIGURATION
// ============================================================================

export interface HexMapConfig {
  seed: number;
  width: number; // Map width in hex cells
  height: number; // Map height in hex cells
  hexSize: number; // Size of each hex in world units

  // Noise scales
  biomeScale: number;
  moistureScale: number;
  elevationScale: number;

  // Feature density
  riverCount: number;
  pathDensity: number;
  buildingSiteDensity: number;

  // Biome thresholds
  desertThreshold: number;
  grasslandThreshold: number;
  badlandsElevation: number;
  riversideMoisture: number;
}

export const DEFAULT_HEX_MAP_CONFIG: HexMapConfig = {
  seed: 42,
  width: 32,
  height: 32,
  hexSize: 1,

  biomeScale: 0.08,
  moistureScale: 0.05,
  elevationScale: 0.03,

  riverCount: 3,
  pathDensity: 0.15,
  buildingSiteDensity: 0.02,

  desertThreshold: 0.3,
  grasslandThreshold: 0.5,
  badlandsElevation: 0.7,
  riversideMoisture: 0.75,
};

// ============================================================================
// HEX MAP GENERATOR
// ============================================================================

export class HexMapGenerator {
  private config: HexMapConfig;
  private biomeNoise: NoiseFunction2D;
  private moistureNoise: NoiseFunction2D;
  private elevationNoise: NoiseFunction2D;
  private variationNoise: NoiseFunction2D;
  private prng: () => number;

  constructor(config: Partial<HexMapConfig> = {}) {
    this.config = { ...DEFAULT_HEX_MAP_CONFIG, ...config };

    // Create seeded PRNG and noise functions
    this.prng = Alea(this.config.seed);
    this.biomeNoise = createNoise2D(Alea(this.config.seed));
    this.moistureNoise = createNoise2D(Alea(this.config.seed + 1));
    this.elevationNoise = createNoise2D(Alea(this.config.seed + 2));
    this.variationNoise = createNoise2D(Alea(this.config.seed + 3));
  }

  /**
   * Generate a complete hex map
   */
  generate(): Map<string, HexTileData> {
    const tiles = new Map<string, HexTileData>();

    // Phase 1: Generate base terrain for all tiles
    this.generateBaseTerrain(tiles);

    // Phase 2: Place rivers flowing through the map
    this.generateRivers(tiles);

    // Phase 3: Designate building sites at key locations
    this.generateBuildingSites(tiles);

    // Phase 4: Generate paths connecting key locations
    this.generatePaths(tiles);

    // Phase 5: Place buildings at designated sites
    this.placeBuildings(tiles);

    return tiles;
  }

  /**
   * Phase 1: Generate base terrain with biomes
   */
  private generateBaseTerrain(tiles: Map<string, HexTileData>): void {
    const { width, height } = this.config;

    for (let r = 0; r < height; r++) {
      const rOffset = Math.floor(r / 2);
      for (let q = -rOffset; q < width - rOffset; q++) {
        const coord: HexCoord = { q, r };
        const worldPos = hexToWorld(coord, this.config.hexSize);

        // Sample noise values
        const biomeValue = this.sampleNoise(
          this.biomeNoise,
          worldPos.x,
          worldPos.z,
          this.config.biomeScale
        );
        const moisture = this.sampleNoise(
          this.moistureNoise,
          worldPos.x,
          worldPos.z,
          this.config.moistureScale
        );
        const elevation = this.sampleNoise(
          this.elevationNoise,
          worldPos.x,
          worldPos.z,
          this.config.elevationScale
        );

        // Determine biome
        const biome = this.determineBiome(biomeValue, moisture, elevation);

        // Select appropriate terrain tile
        const baseTile = this.selectTerrainTile(biome, elevation, moisture);

        tiles.set(hexKey(coord), {
          coord,
          biome,
          baseTile,
          rotation: 0,
          elevation,
          moisture,
        });
      }
    }
  }

  /**
   * Determine biome based on noise values
   */
  private determineBiome(biomeValue: number, moisture: number, elevation: number): HexBiome {
    const { desertThreshold, grasslandThreshold, badlandsElevation, riversideMoisture } =
      this.config;

    // High moisture areas near water sources
    if (moisture > riversideMoisture) {
      return 'riverside';
    }

    // High elevation rocky areas
    if (elevation > badlandsElevation) {
      return 'badlands';
    }

    // Dry, hot areas
    if (biomeValue < desertThreshold && moisture < 0.4) {
      return 'desert';
    }

    // Moderate conditions
    if (biomeValue < grasslandThreshold || moisture > 0.4) {
      return 'grassland';
    }

    // Default to desert in remaining cases
    return 'desert';
  }

  /**
   * Select terrain tile based on biome and environmental factors
   */
  private selectTerrainTile(biome: HexBiome, elevation: number, moisture: number): TerrainTile {
    const variation = this.prng();

    switch (biome) {
      case 'desert':
        if (variation < 0.3) return 'sand';
        if (variation < 0.6) return 'sand-desert';
        return 'sand-rocks';

      case 'grassland':
        if (elevation > 0.5 && variation < 0.3) return 'grass-hill';
        if (variation < 0.2) return 'grass-forest';
        return 'grass';

      case 'badlands':
        if (elevation > 0.8) return 'stone-mountain';
        if (variation < 0.3) return 'stone-hill';
        if (variation < 0.6) return 'stone-rocks';
        return 'stone';

      case 'riverside':
        if (variation < 0.2) return 'water-rocks';
        if (variation < 0.1) return 'water-island';
        if (moisture > 0.9) return 'water';
        if (variation < 0.5) return 'grass';
        return 'dirt';

      default:
        return 'dirt';
    }
  }

  /**
   * Phase 2: Generate rivers flowing through the map
   */
  private generateRivers(tiles: Map<string, HexTileData>): void {
    const { riverCount, width, height } = this.config;
    const riverPaths: HexCoord[][] = [];

    for (let i = 0; i < riverCount; i++) {
      const riverPath = this.generateRiverPath(tiles, riverPaths);
      if (riverPath.length > 0) {
        riverPaths.push(riverPath);
        this.applyRiverToTiles(tiles, riverPath);
      }
    }
  }

  /**
   * Generate a single river path using a flow simulation
   */
  private generateRiverPath(
    tiles: Map<string, HexTileData>,
    existingRivers: HexCoord[][]
  ): HexCoord[] {
    const { width, height } = this.config;
    const path: HexCoord[] = [];

    // Start from a high elevation point on one edge
    const startEdge = Math.floor(this.prng() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let current = this.getEdgeStartPoint(startEdge, width, height);

    // Find a high elevation starting point near the edge
    let bestStart = current;
    let bestElevation = 0;
    for (let i = 0; i < 5; i++) {
      const testCoord = this.getEdgeStartPoint(startEdge, width, height);
      const tile = tiles.get(hexKey(testCoord));
      if (tile && tile.elevation > bestElevation) {
        bestElevation = tile.elevation;
        bestStart = testCoord;
      }
    }
    current = bestStart;

    const visited = new Set<string>();
    const maxLength = Math.max(width, height) * 2;

    while (path.length < maxLength) {
      const key = hexKey(current);
      if (visited.has(key)) break;

      visited.add(key);
      path.push(current);

      // Check if we've reached an edge (river exits the map)
      if (this.isOnMapEdge(current, width, height) && path.length > 5) {
        break;
      }

      // Flow downhill - find lowest neighbor
      const neighbors = hexNeighbors(current);
      let lowestNeighbor: HexCoord | null = null;
      let lowestElevation = Infinity;

      for (const neighbor of neighbors) {
        const neighborKey = hexKey(neighbor);
        if (visited.has(neighborKey)) continue;

        const tile = tiles.get(neighborKey);
        if (!tile) continue;

        // Add slight randomness to flow direction
        const effectiveElevation = tile.elevation - this.prng() * 0.1;
        if (effectiveElevation < lowestElevation) {
          lowestElevation = effectiveElevation;
          lowestNeighbor = neighbor;
        }
      }

      if (!lowestNeighbor) break;
      current = lowestNeighbor;
    }

    return path;
  }

  /**
   * Get a starting point on a map edge
   */
  private getEdgeStartPoint(edge: number, width: number, height: number): HexCoord {
    const pos =
      Math.floor(this.prng() * Math.max(width, height) * 0.6) +
      Math.floor(Math.max(width, height) * 0.2);

    switch (edge) {
      case 0: // Top edge
        return { q: pos - Math.floor(0 / 2), r: 0 };
      case 1: // Right edge
        return { q: width - 1 - Math.floor(pos / 2), r: pos };
      case 2: // Bottom edge
        return { q: pos - Math.floor(height / 2), r: height - 1 };
      case 3: // Left edge
        return { q: -Math.floor(pos / 2), r: pos };
      default:
        return { q: 0, r: 0 };
    }
  }

  /**
   * Check if a hex is on the map edge
   */
  private isOnMapEdge(coord: HexCoord, width: number, height: number): boolean {
    const rOffset = Math.floor(coord.r / 2);
    return (
      coord.r === 0 ||
      coord.r === height - 1 ||
      coord.q === -rOffset ||
      coord.q === width - 1 - rOffset
    );
  }

  /**
   * Apply river tiles to the path
   */
  private applyRiverToTiles(tiles: Map<string, HexTileData>, path: HexCoord[]): void {
    for (let i = 0; i < path.length; i++) {
      const current = path[i];
      const tile = tiles.get(hexKey(current));
      if (!tile) continue;

      const prev = i > 0 ? path[i - 1] : null;
      const next = i < path.length - 1 ? path[i + 1] : null;

      // Determine river tile type and rotation based on connections
      const { riverTile, rotation } = this.determineRiverTile(current, prev, next);

      tile.riverTile = riverTile;
      tile.rotation = rotation;
      tile.biome = 'riverside';
      tile.moisture = Math.max(tile.moisture, 0.8);

      // Update adjacent tiles to riverside biome with falloff
      for (const neighbor of hexNeighbors(current)) {
        const neighborTile = tiles.get(hexKey(neighbor));
        if (neighborTile && neighborTile.biome !== 'riverside') {
          neighborTile.moisture = Math.max(neighborTile.moisture, 0.6);
          if (neighborTile.moisture > 0.75 && !neighborTile.riverTile) {
            neighborTile.biome = 'riverside';
            neighborTile.baseTile = this.prng() < 0.5 ? 'grass' : 'dirt';
          }
        }
      }
    }
  }

  /**
   * Determine river tile type and rotation
   */
  private determineRiverTile(
    current: HexCoord,
    prev: HexCoord | null,
    next: HexCoord | null
  ): { riverTile: RiverTile; rotation: number } {
    const prevDir = prev ? this.getDirection(current, prev) : -1;
    const nextDir = next ? this.getDirection(current, next) : -1;

    // End of river or start
    if (prevDir === -1 || nextDir === -1) {
      return { riverTile: 'river-straight', rotation: nextDir !== -1 ? nextDir : prevDir };
    }

    // Check if it's a straight line (opposite directions)
    const angleDiff = Math.abs(nextDir - prevDir);
    if (angleDiff === 3) {
      return { riverTile: 'river-straight', rotation: Math.min(prevDir, nextDir) };
    }

    // It's a corner - rotation based on the turn direction
    return { riverTile: 'river-corner', rotation: prevDir };
  }

  /**
   * Get direction index from one hex to another (0-5)
   */
  private getDirection(from: HexCoord, to: HexCoord): number {
    const dq = to.q - from.q;
    const dr = to.r - from.r;

    const directions = [
      { q: 1, r: 0 }, // 0: East
      { q: 1, r: -1 }, // 1: Northeast
      { q: 0, r: -1 }, // 2: Northwest
      { q: -1, r: 0 }, // 3: West
      { q: -1, r: 1 }, // 4: Southwest
      { q: 0, r: 1 }, // 5: Southeast
    ];

    for (let i = 0; i < directions.length; i++) {
      if (directions[i].q === dq && directions[i].r === dr) {
        return i;
      }
    }

    return 0;
  }

  /**
   * Phase 3: Designate building sites
   */
  private generateBuildingSites(tiles: Map<string, HexTileData>): void {
    const { buildingSiteDensity, width, height } = this.config;
    const siteCount = Math.floor(width * height * buildingSiteDensity);

    // Categorize potential sites by type
    const potentialTowns: HexCoord[] = [];
    const potentialMines: HexCoord[] = [];
    const potentialFarms: HexCoord[] = [];

    tiles.forEach((tile, key) => {
      // Towns: near rivers, flat terrain, not too rocky
      if (tile.biome === 'riverside' && tile.elevation < 0.5 && !tile.riverTile) {
        potentialTowns.push(tile.coord);
      }

      // Mines: badlands/rocky areas with high elevation
      if (
        (tile.biome === 'badlands' || tile.baseTile.startsWith('stone')) &&
        tile.elevation > 0.5
      ) {
        potentialMines.push(tile.coord);
      }

      // Farms: grassland with moderate moisture
      if (tile.biome === 'grassland' && tile.moisture > 0.3 && tile.moisture < 0.7) {
        potentialFarms.push(tile.coord);
      }
    });

    // Place sites with minimum spacing
    const placedSites: HexCoord[] = [];
    const minSpacing = 5;

    // Place towns first (most important)
    this.placeSitesOfType(
      tiles,
      potentialTowns,
      'town',
      Math.ceil(siteCount * 0.3),
      placedSites,
      minSpacing
    );

    // Place mines
    this.placeSitesOfType(
      tiles,
      potentialMines,
      'mine',
      Math.ceil(siteCount * 0.3),
      placedSites,
      minSpacing
    );

    // Place farms
    this.placeSitesOfType(
      tiles,
      potentialFarms,
      'farm',
      Math.ceil(siteCount * 0.4),
      placedSites,
      minSpacing
    );

    // Place a few outposts at crossings or strategic points
    this.placeCrossingOutposts(tiles, placedSites);
  }

  /**
   * Place building sites of a specific type
   */
  private placeSitesOfType(
    tiles: Map<string, HexTileData>,
    candidates: HexCoord[],
    siteType: BuildingSiteType,
    count: number,
    placedSites: HexCoord[],
    minSpacing: number
  ): void {
    // Shuffle candidates
    const shuffled = [...candidates].sort(() => this.prng() - 0.5);

    let placed = 0;
    for (const coord of shuffled) {
      if (placed >= count) break;

      // Check spacing from other sites
      const tooClose = placedSites.some((site) => hexDistance(coord, site) < minSpacing);
      if (tooClose) continue;

      const tile = tiles.get(hexKey(coord));
      if (tile && !tile.buildingSite) {
        tile.buildingSite = siteType;
        placedSites.push(coord);
        placed++;
      }
    }
  }

  /**
   * Place outposts at river crossings or strategic points
   */
  private placeCrossingOutposts(tiles: Map<string, HexTileData>, placedSites: HexCoord[]): void {
    tiles.forEach((tile) => {
      if (tile.riverTile && !tile.buildingSite) {
        // Check if this could be a crossing point (near paths or other interest points)
        const neighbors = hexNeighbors(tile.coord);
        const hasNearbyPath = neighbors.some((n) => {
          const neighborTile = tiles.get(hexKey(n));
          return neighborTile?.pathTile !== undefined;
        });

        if (hasNearbyPath || this.prng() < 0.05) {
          const tooClose = placedSites.some((site) => hexDistance(tile.coord, site) < 3);
          if (!tooClose) {
            tile.buildingSite = 'crossing';
            placedSites.push(tile.coord);
          }
        }
      }
    });
  }

  /**
   * Phase 4: Generate paths connecting key locations
   */
  private generatePaths(tiles: Map<string, HexTileData>): void {
    // Collect all building sites
    const sites: HexCoord[] = [];
    tiles.forEach((tile) => {
      if (tile.buildingSite) {
        sites.push(tile.coord);
      }
    });

    if (sites.length < 2) return;

    // Create a minimum spanning tree of connections
    const connections = this.createMinimalConnections(sites);

    // Generate paths along connections
    for (const [from, to] of connections) {
      const path = this.findPath(tiles, from, to);
      this.applyPathToTiles(tiles, path);
    }
  }

  /**
   * Create minimal connections between sites (approximate MST using greedy approach)
   */
  private createMinimalConnections(sites: HexCoord[]): [HexCoord, HexCoord][] {
    if (sites.length < 2) return [];

    const connections: [HexCoord, HexCoord][] = [];
    const connected = new Set<string>([hexKey(sites[0])]);
    const remaining = new Set<string>(sites.slice(1).map(hexKey));

    while (remaining.size > 0) {
      let bestFrom: HexCoord | null = null;
      let bestTo: HexCoord | null = null;
      let bestDistance = Infinity;

      // Find shortest edge from connected to remaining
      const connectedArr = Array.from(connected);
      const remainingArr = Array.from(remaining);
      for (const connectedKey of connectedArr) {
        const connectedCoord = parseHexKey(connectedKey);
        for (const remainingKey of remainingArr) {
          const remainingCoord = parseHexKey(remainingKey);
          const dist = hexDistance(connectedCoord, remainingCoord);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestFrom = connectedCoord;
            bestTo = remainingCoord;
          }
        }
      }

      if (bestFrom && bestTo) {
        connections.push([bestFrom, bestTo]);
        connected.add(hexKey(bestTo));
        remaining.delete(hexKey(bestTo));
      } else {
        break;
      }
    }

    // Add a few extra connections for variety
    const extraConnections = Math.floor(sites.length * 0.3);
    for (let i = 0; i < extraConnections; i++) {
      const from = sites[Math.floor(this.prng() * sites.length)];
      const to = sites[Math.floor(this.prng() * sites.length)];
      if (hexKey(from) !== hexKey(to) && hexDistance(from, to) < 15) {
        connections.push([from, to]);
      }
    }

    return connections;
  }

  /**
   * Find a path between two hexes (A* pathfinding)
   */
  private findPath(tiles: Map<string, HexTileData>, from: HexCoord, to: HexCoord): HexCoord[] {
    interface PathNode {
      coord: HexCoord;
      f: number;
      g: number;
      parent: string | null;
    }

    const openSet = new Map<string, PathNode>();
    const closedSet = new Map<string, PathNode>();

    const startKey = hexKey(from);
    openSet.set(startKey, {
      coord: from,
      f: hexDistance(from, to),
      g: 0,
      parent: null,
    });

    while (openSet.size > 0) {
      // Find node with lowest f score
      let currentKey = '';
      let lowestF = Infinity;
      const openEntries = Array.from(openSet.entries());
      for (const [key, node] of openEntries) {
        if (node.f < lowestF) {
          lowestF = node.f;
          currentKey = key;
        }
      }

      const current = openSet.get(currentKey)!;
      openSet.delete(currentKey);
      closedSet.set(currentKey, current);

      // Check if we reached the goal
      if (currentKey === hexKey(to)) {
        // Reconstruct path by following parent pointers
        const path: HexCoord[] = [];
        let traceKey: string | null = currentKey;
        while (traceKey !== null) {
          path.unshift(parseHexKey(traceKey));
          const node = closedSet.get(traceKey);
          traceKey = node?.parent ?? null;
        }
        return path.length > 0 ? path : [from, to];
      }

      // Explore neighbors
      for (const neighbor of hexNeighbors(current.coord)) {
        const neighborKey = hexKey(neighbor);
        if (closedSet.has(neighborKey)) continue;

        const tile = tiles.get(neighborKey);
        if (!tile) continue;

        // Calculate movement cost (higher for difficult terrain)
        let moveCost = 1;
        if (tile.baseTile.includes('water')) moveCost = 5;
        if (tile.baseTile.includes('stone-mountain')) moveCost = 3;
        if (tile.riverTile) moveCost = 2;

        const g = current.g + moveCost;
        const h = hexDistance(neighbor, to);
        const f = g + h;

        const existing = openSet.get(neighborKey);
        if (!existing || g < existing.g) {
          openSet.set(neighborKey, { coord: neighbor, f, g, parent: currentKey });
        }
      }
    }

    // No path found - return direct line
    return this.getHexLine(from, to);
  }

  /**
   * Get a straight line of hexes between two points
   */
  private getHexLine(from: HexCoord, to: HexCoord): HexCoord[] {
    const distance = hexDistance(from, to);
    if (distance === 0) return [from];

    const path: HexCoord[] = [];
    for (let i = 0; i <= distance; i++) {
      const t = i / distance;
      const q = from.q + (to.q - from.q) * t;
      const r = from.r + (to.r - from.r) * t;
      path.push(hexRound({ q, r }));
    }
    return path;
  }

  /**
   * Apply path tiles along a route
   */
  private applyPathToTiles(tiles: Map<string, HexTileData>, path: HexCoord[]): void {
    for (let i = 0; i < path.length; i++) {
      const current = path[i];
      const tile = tiles.get(hexKey(current));
      if (!tile) continue;

      // Don't overwrite river tiles, but can cross them
      if (tile.riverTile) {
        tile.pathTile = 'path-crossing';
        continue;
      }

      const prev = i > 0 ? path[i - 1] : null;
      const next = i < path.length - 1 ? path[i + 1] : null;

      const { pathTile, rotation } = this.determinePathTile(current, prev, next, tile);
      tile.pathTile = pathTile;
      if (!tile.riverTile) {
        tile.rotation = rotation;
      }

      // Change base tile to dirt for paths
      if (!tile.baseTile.includes('water') && !tile.baseTile.includes('stone')) {
        tile.baseTile = 'dirt';
      }
    }
  }

  /**
   * Determine path tile type and rotation
   */
  private determinePathTile(
    current: HexCoord,
    prev: HexCoord | null,
    next: HexCoord | null,
    tile: HexTileData
  ): { pathTile: PathTile; rotation: number } {
    // Check for existing path connections
    const existingConnections = this.countPathConnections(current, tile);

    const prevDir = prev ? this.getDirection(current, prev) : -1;
    const nextDir = next ? this.getDirection(current, next) : -1;

    // Multiple connections = intersection
    if (
      existingConnections > 1 ||
      (existingConnections > 0 && (prevDir !== -1 || nextDir !== -1))
    ) {
      return { pathTile: 'path-crossing', rotation: 0 };
    }

    // End of path
    if (prevDir === -1 || nextDir === -1) {
      return {
        pathTile: 'path-straight',
        rotation: nextDir !== -1 ? nextDir : prevDir !== -1 ? prevDir : 0,
      };
    }

    // Check if straight
    const angleDiff = Math.abs(nextDir - prevDir);
    if (angleDiff === 3) {
      return { pathTile: 'path-straight', rotation: Math.min(prevDir, nextDir) };
    }

    // Corner
    return { pathTile: 'path-corner', rotation: prevDir };
  }

  /**
   * Count existing path connections to a tile
   */
  private countPathConnections(coord: HexCoord, tile: HexTileData): number {
    // For now, return 0 as we're building paths sequentially
    // In a more complex system, we'd check neighboring tiles
    return tile.pathTile ? 1 : 0;
  }

  /**
   * Phase 5: Place buildings at designated sites
   */
  private placeBuildings(tiles: Map<string, HexTileData>): void {
    tiles.forEach((tile) => {
      if (!tile.buildingSite) return;

      switch (tile.buildingSite) {
        case 'town':
          tile.building = this.prng() < 0.5 ? 'building-village' : 'building-market';
          break;
        case 'mine':
          tile.building = 'building-mine';
          break;
        case 'farm':
          tile.building = this.prng() < 0.5 ? 'building-farm' : 'building-cabin';
          break;
        case 'outpost':
          tile.building = this.prng() < 0.5 ? 'building-tower' : 'building-cabin';
          break;
        case 'crossing':
          tile.building = this.prng() < 0.3 ? 'building-mill' : undefined;
          break;
      }
    });
  }

  /**
   * Sample noise and normalize to 0-1 range
   */
  private sampleNoise(noise: NoiseFunction2D, x: number, z: number, scale: number): number {
    return (noise(x * scale, z * scale) + 1) / 2;
  }

  /**
   * Get the configuration
   */
  getConfig(): Readonly<HexMapConfig> {
    return this.config;
  }

  /**
   * Regenerate with a new seed
   */
  reseed(seed: number): void {
    this.config.seed = seed;
    this.prng = Alea(seed);
    this.biomeNoise = createNoise2D(Alea(seed));
    this.moistureNoise = createNoise2D(Alea(seed + 1));
    this.elevationNoise = createNoise2D(Alea(seed + 2));
    this.variationNoise = createNoise2D(Alea(seed + 3));
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a hex map with the given configuration
 */
export function generateHexMap(config: Partial<HexMapConfig> = {}): Map<string, HexTileData> {
  const generator = new HexMapGenerator(config);
  return generator.generate();
}

/**
 * Create a hex map generator instance for incremental generation
 */
export function createHexMapGenerator(config: Partial<HexMapConfig> = {}): HexMapGenerator {
  return new HexMapGenerator(config);
}
