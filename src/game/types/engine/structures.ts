// Engine Types - Structures and Props

import type { WorldPosition } from './coordinates.ts';

// ============================================================================
// STRUCTURES
// ============================================================================

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
}

export interface StructureTemplate {
  type: StructureType;
  name: string;
  width: number;
  depth: number;
  height: number;
  hasInterior: boolean;
  entranceOffset: { x: number; z: number };
  modelPath: string | null;
}

// ============================================================================
// PROPS
// ============================================================================

export type PropType =
  | 'cactus_small'
  | 'cactus_large'
  | 'cactus_saguaro'
  | 'rock_small'
  | 'rock_medium'
  | 'rock_large'
  | 'boulder'
  | 'tumbleweed'
  | 'dead_tree'
  | 'grass_tuft'
  | 'barrel'
  | 'crate'
  | 'wagon_wheel'
  | 'skull'
  | 'campfire'
  | 'lantern'
  | 'sign_post';

export interface Prop {
  id: string;
  type: PropType;
  position: WorldPosition;
  rotation: number;
  scale: number;
}
