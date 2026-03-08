// WorldManager — Central open world state manager.
//
// Tracks the player position, determines which chunks are active, detects
// town boundary crossings, and provides the set of visible entities.
// Pure logic — no rendering or React dependencies.

import { CHUNK_SIZE, type BiomeId } from '@/engine/renderers/TerrainConfig';
import type { Location } from '@/src/game/data/schemas/spatial';
import type { Connection, LocationRef, Region, World } from '@/src/game/data/schemas/world';
import { getLocationById } from '@/src/game/data/locations/index';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** World-coord -> 3-D multiplier. Each wx/wy grid cell is this many metres. */
export const WORLD_CELL_SIZE = 200;

/** Default radius (in world units) around a town center that counts as "in town". */
export const TOWN_BOUNDARY_RADIUS = 80;

/** Size-based town radii: larger locations have bigger boundaries. */
const SIZE_RADIUS: Record<string, number> = {
  tiny: 50,
  small: 80,
  medium: 120,
  large: 160,
  huge: 250,
};

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface WorldEntity {
  id: string;
  type: 'building' | 'npc' | 'prop' | 'landmark';
  position: [number, number, number];
  rotation: number;
  /** Archetype key for buildings, chibi config seed for NPCs, etc. */
  data: Record<string, unknown>;
}

export interface TownInfo {
  ref: LocationRef;
  location: Location | null;
  worldPosition: [number, number, number];
  radius: number;
}

export type WorldEvent =
  | { kind: 'enterTown'; town: TownInfo }
  | { kind: 'leaveTown'; town: TownInfo }
  | { kind: 'chunkLoad'; key: string; cx: number; cz: number }
  | { kind: 'chunkUnload'; key: string; cx: number; cz: number };

export type WorldEventListener = (event: WorldEvent) => void;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a world-grid coordinate to a 3-D world position. */
export function worldCoordToPosition(
  wx: number,
  wy: number,
): [number, number, number] {
  return [wx * WORLD_CELL_SIZE, 0, wy * WORLD_CELL_SIZE];
}

function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

function distSq2D(ax: number, az: number, bx: number, bz: number): number {
  return (ax - bx) ** 2 + (az - bz) ** 2;
}

// ---------------------------------------------------------------------------
// WorldManager
// ---------------------------------------------------------------------------

export class WorldManager {
  readonly world: World;
  private readonly towns: TownInfo[] = [];
  private activeTown: TownInfo | null = null;
  private readonly listeners: WorldEventListener[] = [];

  /** Currently loaded chunk keys. */
  readonly loadedChunks = new Set<string>();

  constructor(world: World) {
    this.world = world;

    // Pre-compute town info with size-based radii
    for (const ref of world.locations) {
      const pos = worldCoordToPosition(ref.coord.wx, ref.coord.wy);
      const location = ref.locationDataId
        ? getLocationById(ref.locationDataId) ?? null
        : null;
      const radius = SIZE_RADIUS[ref.size] ?? TOWN_BOUNDARY_RADIUS;
      this.towns.push({
        ref,
        location,
        worldPosition: pos,
        radius,
      });
    }
  }

  // -----------------------------------------------------------------------
  // Event system
  // -----------------------------------------------------------------------

  on(listener: WorldEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  private emit(event: WorldEvent): void {
    for (const fn of this.listeners) fn(event);
  }

  // -----------------------------------------------------------------------
  // Per-frame tick
  // -----------------------------------------------------------------------

  /**
   * Call once per frame with the player's world-space position.
   * Returns the set of chunk keys that should be loaded.
   */
  tick(
    px: number,
    _py: number,
    pz: number,
    loadRadius: number,
  ): Set<string> {
    const centerCx = Math.floor(px / CHUNK_SIZE);
    const centerCz = Math.floor(pz / CHUNK_SIZE);
    const desired = new Set<string>();

    for (let dz = -loadRadius; dz <= loadRadius; dz++) {
      for (let dx = -loadRadius; dx <= loadRadius; dx++) {
        const cx = centerCx + dx;
        const cz = centerCz + dz;
        desired.add(chunkKey(cx, cz));
      }
    }

    // Unload chunks no longer needed
    for (const key of this.loadedChunks) {
      if (!desired.has(key)) {
        this.loadedChunks.delete(key);
        const [cxStr, czStr] = key.split(',');
        this.emit({
          kind: 'chunkUnload',
          key,
          cx: Number(cxStr),
          cz: Number(czStr),
        });
      }
    }

    // Load new chunks
    for (const key of desired) {
      if (!this.loadedChunks.has(key)) {
        this.loadedChunks.add(key);
        const [cxStr, czStr] = key.split(',');
        this.emit({
          kind: 'chunkLoad',
          key,
          cx: Number(cxStr),
          cz: Number(czStr),
        });
      }
    }

    // Town transition detection
    this.detectTownTransition(px, pz);

    return desired;
  }

  // -----------------------------------------------------------------------
  // Town queries
  // -----------------------------------------------------------------------

  getCurrentTown(px: number, pz: number): TownInfo | null {
    for (const town of this.towns) {
      const d = distSq2D(
        px,
        pz,
        town.worldPosition[0],
        town.worldPosition[2],
      );
      if (d <= town.radius * town.radius) return town;
    }
    return null;
  }

  getActiveTown(): TownInfo | null {
    return this.activeTown;
  }

  getAllTowns(): readonly TownInfo[] {
    return this.towns;
  }

  // -----------------------------------------------------------------------
  // Entity visibility
  // -----------------------------------------------------------------------

  getVisibleTowns(
    px: number,
    pz: number,
    viewDistance: number,
  ): TownInfo[] {
    const vdSq = viewDistance * viewDistance;
    return this.towns.filter((t) => {
      const d = distSq2D(px, pz, t.worldPosition[0], t.worldPosition[2]);
      return d <= vdSq;
    });
  }

  // -----------------------------------------------------------------------
  // Distance queries
  // -----------------------------------------------------------------------

  /**
   * Get the distance from a position to the nearest town boundary edge.
   * Returns 0 if inside a town, positive distance if outside.
   * Used by EncounterSystem to suppress encounters near towns.
   */
  getDistanceToNearestTown(px: number, pz: number): number {
    let minDist = Infinity;
    for (const town of this.towns) {
      const dist = Math.sqrt(
        distSq2D(px, pz, town.worldPosition[0], town.worldPosition[2]),
      );
      const distToBoundary = dist - town.radius;
      if (distToBoundary < minDist) {
        minDist = distToBoundary;
      }
    }
    return Math.max(0, minDist);
  }

  /**
   * Get the town the player is closest to, along with distance to its center.
   */
  getNearestTown(px: number, pz: number): { town: TownInfo; distance: number } | null {
    let nearest: TownInfo | null = null;
    let minDist = Infinity;
    for (const town of this.towns) {
      const dist = Math.sqrt(
        distSq2D(px, pz, town.worldPosition[0], town.worldPosition[2]),
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = town;
      }
    }
    return nearest ? { town: nearest, distance: minDist } : null;
  }

  // -----------------------------------------------------------------------
  // Region / biome lookup
  // -----------------------------------------------------------------------

  getRegionAt(wx: number, wy: number): Region | undefined {
    return this.world.regions.find(
      (r) =>
        wx >= r.bounds.minX &&
        wx <= r.bounds.maxX &&
        wy >= r.bounds.minY &&
        wy <= r.bounds.maxY,
    );
  }

  getBiomeAt(px: number, pz: number): BiomeId {
    const wx = Math.round(px / WORLD_CELL_SIZE);
    const wy = Math.round(pz / WORLD_CELL_SIZE);
    const region = this.getRegionAt(wx, wy);
    if (!region) return 'desert';

    const biomeMap: Record<string, BiomeId> = {
      desert: 'desert',
      badlands: 'canyon',
      scrubland: 'desert',
      grassland: 'grassland',
      mountain: 'mountain',
      riverside: 'grassland',
      salt_flat: 'desert',
    };
    return biomeMap[region.biome] ?? 'desert';
  }

  // -----------------------------------------------------------------------
  // Route data
  // -----------------------------------------------------------------------

  getConnections(): Connection[] {
    return this.world.connections;
  }

  getLocationPosition(locationId: string): [number, number, number] | null {
    const ref = this.world.locations.find((l) => l.id === locationId);
    if (!ref) return null;
    return worldCoordToPosition(ref.coord.wx, ref.coord.wy);
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private detectTownTransition(px: number, pz: number): void {
    const current = this.getCurrentTown(px, pz);

    if (current && !this.activeTown) {
      this.activeTown = current;
      this.emit({ kind: 'enterTown', town: current });
    } else if (!current && this.activeTown) {
      const prev = this.activeTown;
      this.activeTown = null;
      this.emit({ kind: 'leaveTown', town: prev });
    } else if (current && this.activeTown && current.ref.id !== this.activeTown.ref.id) {
      const prev = this.activeTown;
      this.activeTown = current;
      this.emit({ kind: 'leaveTown', town: prev });
      this.emit({ kind: 'enterTown', town: current });
    }
  }
}
