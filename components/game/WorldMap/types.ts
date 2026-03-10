/**
 * WorldMap shared types, constants, and coordinate helpers.
 */

import type { Connection, LocationRef, Region, World } from "@/src/game/data/schemas/world";
import { FrontierTerritory } from "@/src/game/data/worlds/frontier_territory";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Logical coordinate space for the map canvas */
export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 600;
export const PADDING = 40;

export const BIOME_COLORS: Record<string, string> = {
  desert: "#d4a574",
  badlands: "#b87333",
  grassland: "#8fbc8f",
  scrubland: "#c2b280",
  mountain: "#708090",
  riverside: "#5f9ea0",
  salt_flat: "#e8e4c9",
};

export const DANGER_COLORS: Record<string, string> = {
  safe: "#22c55e",
  low: "#84cc16",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

// =============================================================================
// TYPES
// =============================================================================

export type WorldMapProps = {
  isOpen: boolean;
  onClose: () => void;
  onTravelTo?: (locationId: string) => void;
};

export type TooltipData = {
  location: LocationRef;
  travelInfo?: {
    travelTime: number;
    danger: string;
    method: string;
  } | null;
};

// =============================================================================
// WORLD DATA
// =============================================================================

export const world: World = FrontierTerritory;

// =============================================================================
// COORDINATE HELPERS
// =============================================================================

/**
 * Compute responsive render dimensions based on screen size.
 * Fills ~90% of the narrower axis while maintaining the map aspect ratio.
 */
export function computeRenderSize(screenWidth: number, screenHeight: number) {
  const availableWidth = screenWidth * 0.9;
  const availableHeight = (screenHeight - 140) * 0.9;
  const aspect = MAP_WIDTH / MAP_HEIGHT;

  let renderWidth: number;
  if (availableWidth / aspect <= availableHeight) {
    renderWidth = availableWidth;
  } else {
    renderWidth = availableHeight * aspect;
  }

  renderWidth = Math.min(renderWidth, 900);
  renderWidth = Math.max(renderWidth, 300);

  return {
    renderWidth,
    renderHeight: renderWidth / aspect,
  };
}

/** Mutable render dimensions updated by the main component */
export let _renderWidth = 380;
export let _renderHeight = (380 / MAP_WIDTH) * MAP_HEIGHT;

export function setRenderDimensions(w: number, h: number) {
  _renderWidth = w;
  _renderHeight = h;
}

function scaleX(wx: number): number {
  return PADDING + (wx / world.dimensions.width) * (MAP_WIDTH - 2 * PADDING);
}

function scaleY(wy: number): number {
  return PADDING + (wy / world.dimensions.height) * (MAP_HEIGHT - 2 * PADDING);
}

/** Convert logical map coords to render coords */
export function toRenderX(wx: number): number {
  return (scaleX(wx) / MAP_WIDTH) * _renderWidth;
}

export function toRenderY(wy: number): number {
  return (scaleY(wy) / MAP_HEIGHT) * _renderHeight;
}

export function getLocationById(id: string): LocationRef | undefined {
  return world.locations.find((loc) => loc.id === id);
}
