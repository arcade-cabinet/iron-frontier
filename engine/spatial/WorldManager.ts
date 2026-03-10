// WorldManager — Central open world state manager.
//
// Tracks the player position, determines which chunks are active, detects
// town boundary crossings, and provides the set of visible entities.
// Pure logic — no rendering or React dependencies.

import { type BiomeId, CHUNK_SIZE } from "@/engine/renderers/TerrainConfig";
import { getLocationById } from "@/src/game/data/locations/index";
import type { Connection, Region, World } from "@/src/game/data/schemas/world";

// Re-export types and constants for backwards compatibility
export {
  TOWN_BOUNDARY_RADIUS,
  type TownInfo,
  WORLD_CELL_SIZE,
  type WorldEntity,
  type WorldEvent,
  type WorldEventListener,
  worldCoordToPosition,
} from "./worldTypes.ts";

import {
  getBiomeAt as getBiomeAtHelper,
  getDistanceToNearestTown as getDistanceHelper,
  getNearestTown as getNearestHelper,
  getRegionAt as getRegionAtHelper,
  getVisibleTowns as getVisibleHelper,
} from "./worldQueries.ts";
import {
  SIZE_RADIUS,
  TOWN_BOUNDARY_RADIUS,
  type TownInfo,
  type WorldEvent,
  type WorldEventListener,
  worldCoordToPosition,
} from "./worldTypes.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
      const location = ref.locationDataId ? (getLocationById(ref.locationDataId) ?? null) : null;
      const radius = SIZE_RADIUS[ref.size] ?? TOWN_BOUNDARY_RADIUS;
      this.towns.push({ ref, location, worldPosition: pos, radius });
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

  tick(px: number, _py: number, pz: number, loadRadius: number): Set<string> {
    const centerCx = Math.floor(px / CHUNK_SIZE);
    const centerCz = Math.floor(pz / CHUNK_SIZE);
    const desired = new Set<string>();

    for (let dz = -loadRadius; dz <= loadRadius; dz++) {
      for (let dx = -loadRadius; dx <= loadRadius; dx++) {
        desired.add(chunkKey(centerCx + dx, centerCz + dz));
      }
    }

    // Unload chunks no longer needed
    for (const key of this.loadedChunks) {
      if (!desired.has(key)) {
        this.loadedChunks.delete(key);
        const [cxStr, czStr] = key.split(",");
        this.emit({ kind: "chunkUnload", key, cx: Number(cxStr), cz: Number(czStr) });
      }
    }

    // Load new chunks
    for (const key of desired) {
      if (!this.loadedChunks.has(key)) {
        this.loadedChunks.add(key);
        const [cxStr, czStr] = key.split(",");
        this.emit({ kind: "chunkLoad", key, cx: Number(cxStr), cz: Number(czStr) });
      }
    }

    this.detectTownTransition(px, pz);
    return desired;
  }

  // -----------------------------------------------------------------------
  // Town queries
  // -----------------------------------------------------------------------

  getCurrentTown(px: number, pz: number): TownInfo | null {
    for (const town of this.towns) {
      const d = distSq2D(px, pz, town.worldPosition[0], town.worldPosition[2]);
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

  getVisibleTowns(px: number, pz: number, viewDistance: number): TownInfo[] {
    return getVisibleHelper(px, pz, viewDistance, this.towns);
  }

  getDistanceToNearestTown(px: number, pz: number): number {
    return getDistanceHelper(px, pz, this.towns);
  }

  getNearestTown(px: number, pz: number): { town: TownInfo; distance: number } | null {
    return getNearestHelper(px, pz, this.towns);
  }

  // -----------------------------------------------------------------------
  // Region / biome lookup
  // -----------------------------------------------------------------------

  getRegionAt(wx: number, wy: number): Region | undefined {
    return getRegionAtHelper(wx, wy, this.world.regions);
  }

  getBiomeAt(px: number, pz: number): BiomeId {
    return getBiomeAtHelper(px, pz, this.world.regions);
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
      this.emit({ kind: "enterTown", town: current });
    } else if (!current && this.activeTown) {
      const prev = this.activeTown;
      this.activeTown = null;
      this.emit({ kind: "leaveTown", town: prev });
    } else if (current && this.activeTown && current.ref.id !== this.activeTown.ref.id) {
      const prev = this.activeTown;
      this.activeTown = current;
      this.emit({ kind: "leaveTown", town: prev });
      this.emit({ kind: "enterTown", town: current });
    }
  }
}
