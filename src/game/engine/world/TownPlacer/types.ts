// TownPlacer types — Public interfaces for building, NPC, prop, and road placements.

import type { FlattenZone } from '../ChunkManager.ts';

export interface BuildingPlacement {
  /** Unique ID within the town. */
  id: string;
  /** Slot type (tavern, general_store, etc.). */
  slotType: string;
  /** Human-readable name. */
  name: string;
  /** World-space position [x, y, z]. */
  position: [number, number, number];
  /** Y rotation in radians. */
  rotation: number;
  /** Visual structure type for archetype lookup. */
  structureType: string;
  /** Tags for filtering. */
  tags: string[];
  /** Importance level 1-5. */
  importance: number;
}

export interface NPCPlacement {
  /** Marker name from the slot definition. */
  id: string;
  /** Parent building ID. */
  buildingId: string;
  /** World-space position. */
  position: [number, number, number];
  /** Facing rotation in radians. */
  rotation: number;
  /** Tags from the marker. */
  tags: string[];
}

export interface PropPlacement {
  /** Feature type (barrel, bench, signpost, etc.). */
  featureType: string;
  /** World-space position. */
  position: [number, number, number];
  /** Y rotation in radians. */
  rotation: number;
}

export interface InternalRoad {
  /** Start position in world space. */
  from: [number, number, number];
  /** End position in world space. */
  to: [number, number, number];
  /** Width of the road strip. */
  width: number;
}

export interface TownPlacement {
  locationId: string;
  name: string;
  buildings: BuildingPlacement[];
  npcs: NPCPlacement[];
  props: PropPlacement[];
  /** Flatten zones for every building footprint. */
  flattenZones: FlattenZone[];
  /** Internal road connections between buildings. */
  internalRoads: InternalRoad[];
}
