import type { ItemRarity } from './common';

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  rarity: ItemRarity;
  quantity: number;
  description?: string;
  usable?: boolean;
  condition: number;
  weight: number;
  type: string;
  droppable: boolean;
}

export type EquipmentSlot = 'weapon' | 'offhand' | 'head' | 'body' | 'accessory';

export interface EquipmentState {
  weapon: string | null;
  offhand: string | null;
  head: string | null;
  body: string | null;
  accessory: string | null;
}
