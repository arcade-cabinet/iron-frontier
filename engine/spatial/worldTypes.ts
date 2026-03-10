// worldTypes — Shared types and constants for the WorldManager subsystem.

import type { Location } from "@/src/game/data/schemas/spatial";
import type { LocationRef } from "@/src/game/data/schemas/world";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** World-coord -> 3-D multiplier. Each wx/wy grid cell is this many metres. */
export const WORLD_CELL_SIZE = 200;

/** Default radius (in world units) around a town center that counts as "in town". */
export const TOWN_BOUNDARY_RADIUS = 80;

/** Size-based town radii: larger locations have bigger boundaries. */
export const SIZE_RADIUS: Record<string, number> = {
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
  type: "building" | "npc" | "prop" | "landmark";
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
  | { kind: "enterTown"; town: TownInfo }
  | { kind: "leaveTown"; town: TownInfo }
  | { kind: "chunkLoad"; key: string; cx: number; cz: number }
  | { kind: "chunkUnload"; key: string; cx: number; cz: number };

export type WorldEventListener = (event: WorldEvent) => void;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a world-grid coordinate to a 3-D world position. */
export function worldCoordToPosition(wx: number, wy: number): [number, number, number] {
  return [wx * WORLD_CELL_SIZE, 0, wy * WORLD_CELL_SIZE];
}
