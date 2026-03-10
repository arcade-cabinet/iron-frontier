// TownPlacer slot processing — Converts a slot definition into building,
// NPC, and flatten-zone placements in world space.

import type { SlotInstance } from '@/src/game/data/schemas/spatial.ts';

import {
  BUILDING_FLATTEN_RADIUS,
  HEX_ROTATION_STEP,
} from '../WorldConfig.ts';

import type { FlattenZone } from '../ChunkManager.ts';
import type { BuildingPlacement, NPCPlacement } from './types.ts';
import { hexToLocal, deriveStructureType } from './hexHelpers.ts';

// ---------------------------------------------------------------------------
// Slot processing
// ---------------------------------------------------------------------------

export function processSlot(
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
