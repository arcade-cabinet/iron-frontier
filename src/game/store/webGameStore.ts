/**
 * Web Game Store - Platform-specific game store for the web app
 *
 * This file creates the game store using the shared factory and wires up
 * the web-specific data access layer and storage adapter.
 */

import { getEncounterById, getEnemyById } from '@/data/enemies';
import {
  generateRandomEncounter,
  initEncounterTemplates,
  shouldTriggerEncounter,
} from '@/data/generation/generators/encounterGenerator';
import { ProceduralLocationManager } from '@/data/generation/ProceduralLocationManager';
import { combineSeeds, hashString, SeededRandom } from '@/data/generation/seededRandom';
import { ENCOUNTER_TEMPLATES } from '@/data/generation/templates/encounterTemplates';
// Import data access functions from the shared data layer
import { type BaseItem, getItem, STARTER_INVENTORY } from '@/data/items';
import { getWorldItemsForLocation } from '@/data/items/worldItems';
import { getDialogueTreeById, getNPCById, getPrimaryDialogueTree } from '@/data/npcs';
import { getQuestById } from '@/data/quests';
import {
  AP_COSTS,
  calculateDamage,
  calculateHitChance,
  rollCritical,
  rollHit,
} from '@/data/schemas/combat';
import { type DialogueNode, getAvailableChoices, getDialogueEntryNode } from '@/data/schemas/npc';
import { createActiveQuest, isCurrentStageComplete as isStageComplete } from '@/data/schemas/quest';
import { getConnectionsFrom } from '@/data/schemas/world';
import {
  calculateBuyPrice,
  calculateSellPrice,
  canSellItemToShop,
  getShopById,
} from '@/data/shops';
import { getWorldById, loadWorld } from '@/data/worlds';
import { createGameStore, type DataAccess, type GameState, WebStorageAdapter } from '@/store';
import { dbManager } from './DatabaseManager';

/**
 * Web-specific data access implementation
 */
const webDataAccess: DataAccess = {
  // Items
  getItem: (itemId: string) => getItem(itemId),
  getStarterInventory: () => STARTER_INVENTORY,

  // NPCs
  getNPCById: (npcId: string) => getNPCById(npcId),
  getDialogueTreeById: (treeId: string) => getDialogueTreeById(treeId),
  getPrimaryDialogueTree: (npcId: string) => getPrimaryDialogueTree(npcId),
  getDialogueEntryNode: (tree: any, checkCondition: (c: any) => boolean) =>
    getDialogueEntryNode(tree, checkCondition),
  getAvailableChoices: (node: any, checkCondition: (c: any) => boolean) =>
    getAvailableChoices(node, checkCondition),

  // Quests
  getQuestById: (questId: string) => getQuestById(questId),
  createActiveQuest: (questId: string) => createActiveQuest(questId),
  isCurrentStageComplete: (quest: any, activeQuest: any) => isStageComplete(quest, activeQuest),

  // World
  getWorldById: (worldId: string) => getWorldById(worldId),
  loadWorld: (world: any) => loadWorld(world),
  getConnectionsFrom: (world: any, locationId: string) => getConnectionsFrom(world, locationId),
  getWorldItemsForLocation: (locationId: string) => getWorldItemsForLocation(locationId),

  // Combat
  getEnemyById: (enemyId: string) => getEnemyById(enemyId),
  getEncounterById: (encounterId: string) => getEncounterById(encounterId),
  calculateHitChance,
  calculateDamage,
  rollHit,
  rollCritical,
  AP_COSTS,

  // Shops
  getShopById: (shopId: string) => getShopById(shopId),
  calculateBuyPrice,
  calculateSellPrice,
  canSellItemToShop,

  // Generation
  initEncounterTemplates,
  generateRandomEncounter,
  shouldTriggerEncounter,
  ENCOUNTER_TEMPLATES,

  // Procedural
  ProceduralLocationManager: {
    initialize: (seed: number) => ProceduralLocationManager.initialize(seed),
    generateLocationContent: (location: any) =>
      ProceduralLocationManager.generateLocationContent(location),
    hasGeneratedContent: (locationId: string) =>
      ProceduralLocationManager.hasGeneratedContent(locationId),
  },

  // Seeded random
  SeededRandom,
  hashString,
  combineSeeds,
};

/**
 * Create the web game store with localStorage persistence
 */
export const useGameStore = createGameStore({
  storageAdapter: new WebStorageAdapter(),
  storageKey: 'iron-frontier-save',
  databaseManager: dbManager,
  dataAccess: webDataAccess,
});

// Re-export types for convenience
export type { GameState };
export type {
  CharacterAppearance,
  CombatActionType,
  Combatant,
  CombatPhase,
  CombatResult,
  CombatState,
  DialogueState,
  EquipmentSlot,
  GamePhase,
  GameSettings,
  InventoryItem,
  Notification,
  NPC,
  PanelType,
  PlayerStats,
  Structure,
  TimeState,
  TravelState,
  WeatherState,
  WorldItem,
  WorldPosition,
} from '@/store';
