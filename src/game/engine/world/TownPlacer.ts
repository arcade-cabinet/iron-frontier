// TownPlacer — Places town buildings on terrain using Location definitions.
//
// Reads Location data from src/game/data/locations/, converts hex-grid
// positions to 3-D world space, produces flatten zones for each building
// footprint, and creates road connection geometry between buildings.
//
// The output is consumed by OpenWorld.tsx which forwards flatten zones to
// ChunkManager and renders building groups as Three.js primitives.

import Alea from 'alea';

import type { Location, SlotInstance, TileDef } from '@/src/game/data/schemas/spatial';

import {
  BUILDING_FLATTEN_RADIUS,
  HEX_CELL_SIZE,
  HEX_ROTATION_STEP,
} from './WorldConfig';

import type { FlattenZone } from './ChunkManager';

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

// ---------------------------------------------------------------------------
// Hex -> world helpers
// ---------------------------------------------------------------------------

/** Convert hex-grid offset to a local XZ position relative to the town anchor. */
function hexToLocal(q: number, r: number): [number, number] {
  const x = q * HEX_CELL_SIZE + (r % 2 === 0 ? 0 : HEX_CELL_SIZE * 0.5);
  const z = r * HEX_CELL_SIZE * 0.866; // sqrt(3)/2
  return [x, z];
}

/** Derive the visual structure type from a slot's tiles. */
function deriveStructureType(slot: SlotInstance): string {
  for (const tile of slot.tiles) {
    if (tile.structure && tile.structure !== 'none') {
      return tile.structure;
    }
  }
  const slotDefaults: Record<string, string> = {
    tavern: 'saloon_building',
    general_store: 'store_building',
    gunsmith: 'store_building',
    doctor: 'office_building',
    bank: 'bank_building',
    hotel: 'hotel_building',
    stable: 'stable',
    law_office: 'office_building',
    church: 'church_building',
    telegraph: 'telegraph_building',
    train_station: 'station_building',
    workshop: 'workshop_building',
    mine: 'mine_building',
    residence: 'house',
    residence_wealthy: 'mansion',
    residence_poor: 'cabin',
    landmark: 'water_tower',
    waystation: 'cabin',
  };
  return slotDefaults[slot.type] ?? 'cabin';
}

/** Map an assemblage ID prefix to a structure type. */
function mapAssemblageToStructure(assemblageId: string): string {
  const mapping: Record<string, string> = {
    asm_saloon: 'saloon_building',
    asm_general_store: 'store_building',
    asm_sheriff: 'office_building',
    asm_well: 'well',
    asm_gunsmith: 'store_building',
    asm_church: 'church_building',
    asm_train_station: 'station_building',
    asm_telegraph: 'telegraph_building',
    asm_stable: 'stable',
    asm_mansion: 'mansion',
    asm_house: 'house',
    asm_cabin: 'cabin',
    asm_hotel: 'hotel_building',
    asm_bank: 'bank_building',
    asm_mine: 'mine_building',
    asm_workshop: 'workshop_building',
    asm_warehouse: 'warehouse',
    asm_watch_tower: 'watch_tower',
    asm_rocks: 'none',
    asm_ruins_cabin: 'cabin',
  };
  for (const [prefix, structure] of Object.entries(mapping)) {
    if (assemblageId.startsWith(prefix)) return structure;
  }
  return 'cabin';
}

// ---------------------------------------------------------------------------
// Main placement function
// ---------------------------------------------------------------------------

/**
 * Place a town's buildings, NPCs, and props into world space.
 *
 * Also generates:
 *  - `flattenZones` for each building so ChunkManager can depress terrain
 *  - `internalRoads` between buildings that share road-edge tiles
 *
 * @param location   - The Location definition with slots and assemblages.
 * @param townOrigin - The world-space origin [x, y, z] of the town center.
 * @returns Full placement data for the renderer and ChunkManager.
 */
export function placeTown(
  location: Location,
  townOrigin: [number, number, number],
): TownPlacement {
  const buildings: BuildingPlacement[] = [];
  const npcs: NPCPlacement[] = [];
  const props: PropPlacement[] = [];
  const flattenZones: FlattenZone[] = [];

  // Center offset: the location grid is width x height hex cells.
  const centerOffsetX = (location.width * HEX_CELL_SIZE) / 2;
  const centerOffsetZ = (location.height * HEX_CELL_SIZE * 0.866) / 2;

  // ------- Process inline slots -------
  for (const slot of location.slots) {
    processSlot(
      slot,
      townOrigin,
      centerOffsetX,
      centerOffsetZ,
      buildings,
      npcs,
      flattenZones,
    );
  }

  // ------- Process assemblage references as simplified slots -------
  for (const asmRef of location.assemblages) {
    const syntheticSlot: SlotInstance = {
      id: asmRef.instanceId,
      type: asmRef.slotTypeOverride ?? 'residence',
      name: asmRef.instanceId.replace(/_/g, ' '),
      anchor: asmRef.anchor,
      rotation: asmRef.rotation,
      tiles: [
        {
          coord: { q: 0, r: 0 },
          terrain: 'dirt',
          structure: mapAssemblageToStructure(asmRef.assemblageId) as TileDef['structure'],
        },
      ],
      markers: [],
      zones: [],
      tags: asmRef.tags,
      importance: asmRef.importance ?? 3,
    };
    processSlot(
      syntheticSlot,
      townOrigin,
      centerOffsetX,
      centerOffsetZ,
      buildings,
      npcs,
      flattenZones,
    );
  }

  // ------- Process base tiles for props -------
  for (const tile of location.baseTiles) {
    if (tile.feature && tile.feature !== 'none') {
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

  // ------- Build internal roads between buildings with road-edge tiles -------
  const internalRoads = buildInternalRoads(
    location,
    buildings,
    townOrigin,
    centerOffsetX,
    centerOffsetZ,
  );

  return {
    locationId: location.id,
    name: location.name,
    buildings,
    npcs,
    props,
    flattenZones,
    internalRoads,
  };
}

// ---------------------------------------------------------------------------
// Slot processing
// ---------------------------------------------------------------------------

function processSlot(
  slot: SlotInstance,
  townOrigin: [number, number, number],
  centerOffsetX: number,
  centerOffsetZ: number,
  buildings: BuildingPlacement[],
  npcs: NPCPlacement[],
  flattenZones: FlattenZone[],
): void {
  const [lx, lz] = hexToLocal(slot.anchor.q, slot.anchor.r);
  const wx = townOrigin[0] + lx - centerOffsetX;
  const wz = townOrigin[2] + lz - centerOffsetZ;
  const rotation = slot.rotation * HEX_ROTATION_STEP;

  const structureType = deriveStructureType(slot);

  buildings.push({
    id: slot.id,
    slotType: slot.type,
    name: slot.name ?? slot.id,
    position: [wx, townOrigin[1], wz],
    rotation,
    structureType,
    tags: slot.tags,
    importance: slot.importance,
  });

  // Create a flatten zone for this building
  // Scale radius by importance so larger buildings get more clearance
  const radius = BUILDING_FLATTEN_RADIUS + (slot.importance - 1) * 1.5;
  flattenZones.push({
    wx,
    wz,
    radius,
    targetY: townOrigin[1],
  });

  // Place NPCs from spawn_point markers
  for (const marker of slot.markers) {
    if (marker.type === 'spawn_point') {
      const [mx, mz] = hexToLocal(
        slot.anchor.q + marker.offset.q,
        slot.anchor.r + marker.offset.r,
      );
      const npcWx = townOrigin[0] + mx - centerOffsetX;
      const npcWz = townOrigin[2] + mz - centerOffsetZ;
      const facing =
        marker.facing !== undefined
          ? marker.facing * HEX_ROTATION_STEP
          : rotation;

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

// ---------------------------------------------------------------------------
// Internal road generation
// ---------------------------------------------------------------------------

/**
 * Scan the location's baseTiles for tiles with road-type edges.
 * For every pair of adjacent road tiles, create a road segment
 * connecting them in world space.
 *
 * Additionally creates roads between every pair of buildings that
 * have `importance >= 3` and are within 60 metres of each other
 * (main-street connectivity).
 */
function buildInternalRoads(
  location: Location,
  buildings: BuildingPlacement[],
  townOrigin: [number, number, number],
  centerOffsetX: number,
  centerOffsetZ: number,
): InternalRoad[] {
  const roads: InternalRoad[] = [];

  // Road tiles from baseTiles
  const roadTiles: Array<{ wx: number; wz: number }> = [];
  for (const tile of location.baseTiles) {
    const hasRoad = tile.edges?.some((e) => e === 'road' || e === 'railroad');
    if (hasRoad) {
      const [lx, lz] = hexToLocal(tile.coord.q, tile.coord.r);
      roadTiles.push({
        wx: townOrigin[0] + lx - centerOffsetX,
        wz: townOrigin[2] + lz - centerOffsetZ,
      });
    }
  }

  // Connect sequential road tiles as road segments
  for (let i = 0; i < roadTiles.length - 1; i++) {
    const a = roadTiles[i];
    const b = roadTiles[i + 1];
    const dx = b.wx - a.wx;
    const dz = b.wz - a.wz;
    const dist = Math.sqrt(dx * dx + dz * dz);
    // Only connect adjacent tiles (within ~6 hex cells)
    if (dist < HEX_CELL_SIZE * 6) {
      roads.push({
        from: [a.wx, townOrigin[1] + 0.1, a.wz],
        to: [b.wx, townOrigin[1] + 0.1, b.wz],
        width: 2,
      });
    }
  }

  // Auto-connect important buildings (main street)
  const importantBuildings = buildings.filter((b) => b.importance >= 3);
  const connected = new Set<string>();

  for (let i = 0; i < importantBuildings.length; i++) {
    for (let j = i + 1; j < importantBuildings.length; j++) {
      const a = importantBuildings[i];
      const b = importantBuildings[j];
      const key = [a.id, b.id].sort().join('|');
      if (connected.has(key)) continue;

      const dx = b.position[0] - a.position[0];
      const dz = b.position[2] - a.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Only auto-connect buildings within 60m
      if (dist < 60) {
        roads.push({
          from: [a.position[0], townOrigin[1] + 0.1, a.position[2]],
          to: [b.position[0], townOrigin[1] + 0.1, b.position[2]],
          width: 1.5,
        });
        connected.add(key);
      }
    }
  }

  return roads;
}
