// TownPlacer main placement function — Orchestrates slot processing,
// assemblage handling, prop extraction, and road generation.

import type { Location, SlotInstance, TileDef } from '@/src/game/data/schemas/spatial.ts';

import { HEX_CELL_SIZE } from '../WorldConfig.ts';

import type { FlattenZone } from '../ChunkManager.ts';
import type {
  BuildingPlacement,
  NPCPlacement,
  PropPlacement,
  TownPlacement,
} from './types.ts';
import { hexToLocal, mapAssemblageToStructure } from './hexHelpers.ts';
import { processSlot } from './slotProcessing.ts';
import { buildInternalRoads } from './roadGeneration.ts';

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
