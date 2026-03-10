// Engine Types - Items & World Items

import type { WorldPosition } from './coordinates.ts';

// ============================================================================
// ITEMS
// ============================================================================

export type ItemCategory = 'weapon' | 'consumable' | 'material' | 'quest' | 'valuable';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  stackable: boolean;
  maxStack: number;
  value: number;
  usable: boolean;
  effect?: ItemEffect;
}

export interface ItemEffect {
  type: 'heal' | 'buff' | 'damage' | 'unlock';
  value: number;
  duration?: number;
}

export interface WorldItem {
  id: string;
  itemId: string;
  position: WorldPosition;
  quantity: number;
}
