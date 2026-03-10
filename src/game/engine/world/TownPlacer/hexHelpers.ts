// TownPlacer hex helpers — Convert hex-grid coordinates to world space
// and map slot/assemblage types to structure types.

import type { SlotInstance, TileDef } from '@/src/game/data/schemas/spatial.ts';

import { HEX_CELL_SIZE } from '../WorldConfig.ts';

// ---------------------------------------------------------------------------
// Hex -> world helpers
// ---------------------------------------------------------------------------

/** Convert hex-grid offset to a local XZ position relative to the town anchor. */
export function hexToLocal(q: number, r: number): [number, number] {
  const x = q * HEX_CELL_SIZE + (r % 2 === 0 ? 0 : HEX_CELL_SIZE * 0.5);
  const z = r * HEX_CELL_SIZE * 0.866; // sqrt(3)/2
  return [x, z];
}

/** Derive the visual structure type from a slot's tiles. */
export function deriveStructureType(slot: SlotInstance): string {
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
export function mapAssemblageToStructure(assemblageId: string): string {
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
