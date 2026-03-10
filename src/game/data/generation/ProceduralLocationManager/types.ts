/**
 * ProceduralLocationManager Types
 */

import type { WorldItemSpawn } from '../../items/worldItems';
import type { DialogueTree, NPCDefinition } from '../../schemas/npc';
import type { HexCoord } from '../../schemas/spatial';
import type { GeneratedNPC } from '../generators/npcGenerator';
import type { GeneratedQuest } from '../generators/questGenerator';
import type { ShopInventoryItem } from '../generators/itemGenerator';

/**
 * Generated content for a procedural location
 */
export interface ProceduralLocationContent {
  locationId: string;
  seed: number;
  generatedAt: number;

  /** Generated NPCs with positions */
  npcs: ProceduralNPC[];

  /** Generated world items with positions */
  worldItems: WorldItemSpawn[];

  /** Generated dialogue trees keyed by NPC ID */
  dialogueTrees: Map<string, DialogueTree>;

  /** Generated shop inventories keyed by NPC ID */
  shopInventories: Map<string, ShopInventory>;

  /** Generated quests for this location */
  quests: GeneratedQuest[];

  /** Structure states (broken/locked) keyed by hex coordinate key */
  structureStates: Map<string, 'functional' | 'broken' | 'locked'>;
}

/**
 * Procedural NPC with spawn position (extends NPCDefinition)
 */
export interface ProceduralNPC extends Omit<NPCDefinition, 'spawnCoord'> {
  /** Indicates this is a procedural NPC */
  isProcedural: true;
  /** Generation data */
  generated: GeneratedNPC;
  /** Spawn coordinate */
  spawnCoord: HexCoord;
}

/**
 * Shop inventory for procedural merchants
 */
export interface ShopInventory {
  npcId: string;
  shopType: string;
  items: ShopItem[];
  priceModifier: number;
  canBuy: boolean;
  canSell: boolean;
}

export interface ShopItem {
  itemId: string;
  stock: number;
  basePrice: number;
}

// Re-export types for external use
export type { GeneratedNPC, GeneratedQuest, ShopInventoryItem };
