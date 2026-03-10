import type { WorldPosition } from './common';
import type { NPC } from './npc';

export type StructureType =
  | 'saloon'
  | 'sheriff_office'
  | 'general_store'
  | 'bank'
  | 'hotel'
  | 'stable'
  | 'water_tower'
  | 'windmill'
  | 'mine_entrance'
  | 'train_station'
  | 'house_small'
  | 'house_large'
  | 'outhouse'
  | 'well'
  | 'fence'
  | 'hitching_post';

export interface Structure {
  id: string;
  type: StructureType;
  position: WorldPosition;
  rotation: number;
  scale: number;
  footprint: { x: number; z: number }[];
  condition: number;
  ownerNpcId?: string;
  status?: 'functional' | 'broken' | 'locked';
}

export interface WorldItem {
  id: string;
  itemId: string;
  position: WorldPosition;
  quantity: number;
}

export interface ChunkCoord {
  cx: number;
  cz: number;
}

export type BiomeType =
  | 'desert'
  | 'grassland'
  | 'badlands'
  | 'riverside'
  | 'town'
  | 'railyard'
  | 'mine';

export interface ChunkData {
  coord: ChunkCoord;
  seed: number;
  generatedAt: number;
  heightmap: Float32Array;
  biomeWeights: Map<BiomeType, Float32Array>;
  structures: Structure[];
  props: any[];
  npcs: NPC[];
  items: WorldItem[];
  overlays: any[];
}
