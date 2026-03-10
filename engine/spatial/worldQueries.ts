// worldQueries — Spatial query helpers for WorldManager.
//
// Distance calculations, biome lookups, route data access.

import type { BiomeId } from "@/engine/renderers/TerrainConfig";
import type { Connection, Region } from "@/src/game/data/schemas/world";
import type { TownInfo } from "./worldTypes.ts";
import { WORLD_CELL_SIZE, worldCoordToPosition } from "./worldTypes.ts";

function distSq2D(ax: number, az: number, bx: number, bz: number): number {
  return (ax - bx) ** 2 + (az - bz) ** 2;
}

/**
 * Get the distance from a position to the nearest town boundary edge.
 * Returns 0 if inside a town, positive distance if outside.
 * Used by EncounterSystem to suppress encounters near towns.
 */
export function getDistanceToNearestTown(
  px: number,
  pz: number,
  towns: readonly TownInfo[],
): number {
  let minDist = Infinity;
  for (const town of towns) {
    const dist = Math.sqrt(distSq2D(px, pz, town.worldPosition[0], town.worldPosition[2]));
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
export function getNearestTown(
  px: number,
  pz: number,
  towns: readonly TownInfo[],
): { town: TownInfo; distance: number } | null {
  let nearest: TownInfo | null = null;
  let minDist = Infinity;
  for (const town of towns) {
    const dist = Math.sqrt(distSq2D(px, pz, town.worldPosition[0], town.worldPosition[2]));
    if (dist < minDist) {
      minDist = dist;
      nearest = town;
    }
  }
  return nearest ? { town: nearest, distance: minDist } : null;
}

/** Get towns visible within a given view distance. */
export function getVisibleTowns(
  px: number,
  pz: number,
  viewDistance: number,
  towns: readonly TownInfo[],
): TownInfo[] {
  const vdSq = viewDistance * viewDistance;
  return towns.filter((t) => {
    const d = distSq2D(px, pz, t.worldPosition[0], t.worldPosition[2]);
    return d <= vdSq;
  });
}

/** Find which region contains the given world-grid coordinate. */
export function getRegionAt(
  wx: number,
  wy: number,
  regions: readonly Region[],
): Region | undefined {
  return regions.find(
    (r) => wx >= r.bounds.minX && wx <= r.bounds.maxX && wy >= r.bounds.minY && wy <= r.bounds.maxY,
  );
}

/** Get the biome at a world-space position. */
export function getBiomeAt(px: number, pz: number, regions: readonly Region[]): BiomeId {
  const wx = Math.round(px / WORLD_CELL_SIZE);
  const wy = Math.round(pz / WORLD_CELL_SIZE);
  const region = getRegionAt(wx, wy, regions);
  if (!region) return "desert";

  const biomeMap: Record<string, BiomeId> = {
    desert: "desert",
    badlands: "canyon",
    scrubland: "desert",
    grassland: "grassland",
    mountain: "mountain",
    riverside: "grassland",
    salt_flat: "desert",
  };
  return biomeMap[region.biome] ?? "desert";
}
