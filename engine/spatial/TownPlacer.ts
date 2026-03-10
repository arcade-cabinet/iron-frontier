// TownPlacer — Reads town Location data and produces building placements.
//
// Takes a Location definition (slots + assemblages) and converts the hex-grid
// positions into 3-D world-space placements suitable for the renderer.
// Returns arrays of building, NPC, and prop placements.

import type { Location, SlotInstance, TileDef } from "@/src/game/data/schemas/spatial";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

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

export interface TownPlacement {
  locationId: string;
  name: string;
  buildings: BuildingPlacement[];
  npcs: NPCPlacement[];
  props: PropPlacement[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Hex cell size in world units (metres). */
const HEX_CELL_SIZE = 2.5;

/** Rotation per hex-facing step (60 degrees). */
const HEX_ROTATION_STEP = Math.PI / 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert hex-grid offset to a local XZ position relative to the town anchor. */
function hexToLocal(q: number, r: number): [number, number] {
  // Offset coordinate (odd-r) to flat XZ
  const x = q * HEX_CELL_SIZE + (r % 2 === 0 ? 0 : HEX_CELL_SIZE * 0.5);
  const z = r * HEX_CELL_SIZE * 0.866; // sqrt(3)/2
  return [x, z];
}

/** Derive the visual structure type from a slot's tiles. */
function deriveStructureType(slot: SlotInstance): string {
  for (const tile of slot.tiles) {
    if (tile.structure && tile.structure !== "none") {
      return tile.structure;
    }
  }
  // Fallback: map slot type to a default structure
  const slotDefaults: Record<string, string> = {
    tavern: "saloon_building",
    general_store: "store_building",
    gunsmith: "store_building",
    doctor: "office_building",
    bank: "bank_building",
    hotel: "hotel_building",
    stable: "stable",
    law_office: "office_building",
    church: "church_building",
    telegraph: "telegraph_building",
    train_station: "station_building",
    workshop: "workshop_building",
    mine: "mine_building",
    residence: "house",
    residence_wealthy: "mansion",
    residence_poor: "cabin",
    landmark: "water_tower",
    waystation: "cabin",
  };
  return slotDefaults[slot.type] ?? "cabin";
}

// ---------------------------------------------------------------------------
// Main placement function
// ---------------------------------------------------------------------------

/**
 * Place a town's buildings, NPCs, and props into world space.
 *
 * @param location   - The Location definition with slots and assemblages.
 * @param townOrigin - The world-space origin [x, y, z] where the town center sits.
 * @returns Full placement data for the renderer.
 */
export function placeTown(location: Location, townOrigin: [number, number, number]): TownPlacement {
  const buildings: BuildingPlacement[] = [];
  const npcs: NPCPlacement[] = [];
  const props: PropPlacement[] = [];

  // Center offset: the location grid is width x height hex cells.
  // Center the grid around the town origin.
  const centerOffsetX = (location.width * HEX_CELL_SIZE) / 2;
  const centerOffsetZ = (location.height * HEX_CELL_SIZE * 0.866) / 2;

  // Process inline slots
  for (const slot of location.slots) {
    processSlot(slot, townOrigin, centerOffsetX, centerOffsetZ, buildings, npcs);
  }

  // Process assemblage references as simplified slots
  for (const asmRef of location.assemblages) {
    const syntheticSlot: SlotInstance = {
      id: asmRef.instanceId,
      type: asmRef.slotTypeOverride ?? "residence",
      name: asmRef.instanceId.replace(/_/g, " "),
      anchor: asmRef.anchor,
      rotation: asmRef.rotation,
      tiles: [
        {
          coord: { q: 0, r: 0 },
          terrain: "dirt",
          structure: mapAssemblageToStructure(asmRef.assemblageId) as TileDef["structure"],
        },
      ],
      markers: [],
      zones: [],
      tags: asmRef.tags,
      importance: asmRef.importance ?? 3,
    };
    processSlot(syntheticSlot, townOrigin, centerOffsetX, centerOffsetZ, buildings, npcs);
  }

  // Process base tiles for props (features like barrels, benches, etc.)
  for (const tile of location.baseTiles) {
    if (tile.feature && tile.feature !== "none") {
      const [lx, lz] = hexToLocal(tile.coord.q, tile.coord.r);
      const wx = townOrigin[0] + lx - centerOffsetX;
      const wz = townOrigin[2] + lz - centerOffsetZ;
      props.push({
        featureType: tile.feature,
        position: [wx, townOrigin[1], wz],
        rotation: 0,
      });
    }
  }

  return {
    locationId: location.id,
    name: location.name,
    buildings,
    npcs,
    props,
  };
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function processSlot(
  slot: SlotInstance,
  townOrigin: [number, number, number],
  centerOffsetX: number,
  centerOffsetZ: number,
  buildings: BuildingPlacement[],
  npcs: NPCPlacement[],
): void {
  const [lx, lz] = hexToLocal(slot.anchor.q, slot.anchor.r);
  const wx = townOrigin[0] + lx - centerOffsetX;
  const wz = townOrigin[2] + lz - centerOffsetZ;
  const rotation = slot.rotation * HEX_ROTATION_STEP;

  buildings.push({
    id: slot.id,
    slotType: slot.type,
    name: slot.name ?? slot.id,
    position: [wx, townOrigin[1], wz],
    rotation,
    structureType: deriveStructureType(slot),
    tags: slot.tags,
    importance: slot.importance,
  });

  // Place NPCs from spawn_point markers
  for (const marker of slot.markers) {
    if (marker.type === "spawn_point") {
      const [mx, mz] = hexToLocal(slot.anchor.q + marker.offset.q, slot.anchor.r + marker.offset.r);
      const npcWx = townOrigin[0] + mx - centerOffsetX;
      const npcWz = townOrigin[2] + mz - centerOffsetZ;
      const facing = marker.facing !== undefined ? marker.facing * HEX_ROTATION_STEP : rotation;

      npcs.push({
        id: marker.name,
        buildingId: slot.id,
        position: [npcWx, townOrigin[1], npcWz],
        rotation: facing,
        tags: marker.tags,
      });
    }
  }
}

/** Map an assemblage ID prefix to a structure type. */
function mapAssemblageToStructure(assemblageId: string): string {
  const mapping: Record<string, string> = {
    asm_saloon: "saloon_building",
    asm_general_store: "store_building",
    asm_sheriff: "office_building",
    asm_well: "well",
    asm_gunsmith: "store_building",
    asm_church: "church_building",
    asm_train_station: "station_building",
    asm_telegraph: "telegraph_building",
    asm_stable: "stable",
    asm_mansion: "mansion",
    asm_house: "house",
    asm_cabin: "cabin",
    asm_hotel: "hotel_building",
    asm_bank: "bank_building",
    asm_mine: "mine_building",
    asm_workshop: "workshop_building",
    asm_warehouse: "warehouse",
    asm_watch_tower: "watch_tower",
  };

  // Match by longest prefix
  for (const [prefix, structure] of Object.entries(mapping)) {
    if (assemblageId.startsWith(prefix)) return structure;
  }
  return "cabin";
}
