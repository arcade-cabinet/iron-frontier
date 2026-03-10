import type { DangerLevel, TravelMethod } from '../schemas/world.ts';

export interface WorldMapNode {
  /** Location ID (matches FrontierTerritory.locations[].id) */
  id: string;
  /** Display name */
  name: string;
  /** World-space position in metres [x, z] */
  worldPos: [number, number];
  /** Town boundary radius in metres (small=100, medium=150, large=200) */
  radius: number;
  /** Location type */
  type: string;
  /** Whether the player starts knowing about this location */
  startDiscovered: boolean;
}

export interface WorldMapEdge {
  /** Source location ID */
  fromId: string;
  /** Destination location ID */
  toId: string;
  /** Straight-line distance in metres (computed from positions) */
  distance: number;
  /** Travel method determines road surface and speed */
  terrainType: TravelMethod;
  /** Danger level (0-1 scale mapped from DangerLevel enum) */
  dangerLevel: number;
  /** Danger enum for UI display */
  danger: DangerLevel;
  /** Travel time in game hours */
  travelTimeHours: number;
  /** Whether travel is available in both directions */
  bidirectional: boolean;
}

export interface WorldMap {
  nodes: Map<string, WorldMapNode>;
  edges: WorldMapEdge[];
}

/** Metres per world-grid cell. Must match WorldConfig.WORLD_CELL_SIZE. */
export const WORLD_CELL_SIZE = 256;

export const DANGER_NUMERIC: Record<DangerLevel, number> = {
  safe: 0,
  low: 0.15,
  moderate: 0.35,
  high: 0.6,
  extreme: 0.85,
};

export const SIZE_RADIUS: Record<string, number> = {
  tiny: 60,
  small: 100,
  medium: 150,
  large: 200,
  huge: 300,
};
