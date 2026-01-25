/**
 * Web Game Store - Platform-specific game store for the web app
 *
 * This file creates the game store using the shared factory and wires up
 * the web-specific data access layer and storage adapter.
 */

import {
  createGameStore,
  WebStorageAdapter,
  type DataAccess,
  type GameState,
} from '@iron-frontier/shared/store';

// Import data access functions from the shared data layer
import { getItem, STARTER_INVENTORY, type BaseItem } from '@iron-frontier/shared/data/items';
import {
  getNPCById,
  getDialogueTreeById,
  getPrimaryDialogueTree,
} from '@iron-frontier/shared/data/npcs';
import {
  type DialogueNode,
  getDialogueEntryNode,
  getAvailableChoices,
} from '@iron-frontier/shared/data/schemas/npc';
import { getQuestById } from '@iron-frontier/shared/data/quests';
import {
  createActiveQuest,
  isCurrentStageComplete as isStageComplete,
} from '@iron-frontier/shared/data/schemas/quest';
import { getWorldById, loadWorld } from '@iron-frontier/shared/data/worlds';
import { getConnectionsFrom } from '@iron-frontier/shared/data/schemas/world';
import { getWorldItemsForLocation } from '@iron-frontier/shared/data/items/worldItems';
import { getEnemyById, getEncounterById } from '@iron-frontier/shared/data/enemies';
import {
  calculateHitChance,
  calculateDamage,
  rollHit,
  rollCritical,
  AP_COSTS,
} from '@iron-frontier/shared/data/schemas/combat';
import {
  getShopById,
  calculateBuyPrice,
  calculateSellPrice,
  canSellItemToShop,
} from '@iron-frontier/shared/data/shops';
import {
  initEncounterTemplates,
  generateRandomEncounter,
  shouldTriggerEncounter,
} from '@iron-frontier/shared/data/generation/generators/encounterGenerator';
import { ENCOUNTER_TEMPLATES } from '@iron-frontier/shared/data/generation/templates/encounterTemplates';
import { ProceduralLocationManager } from '@iron-frontier/shared/data/generation/ProceduralLocationManager';
import { SeededRandom, hashString, combineSeeds } from '@iron-frontier/shared/data/generation/seededRandom';
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
  isCurrentStageComplete: (quest: any, activeQuest: any) =>
    isStageComplete(quest, activeQuest),

  // World
  getWorldById: (worldId: string) => getWorldById(worldId),
  loadWorld: (world: any) => loadWorld(world),
  getConnectionsFrom: (world: any, locationId: string) =>
    getConnectionsFrom(world, locationId),
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
  InventoryItem,
  EquipmentSlot,
  GamePhase,
  PanelType,
  DialogueState,
  TravelState,
  Notification,
  PlayerStats,
  GameSettings,
  CombatState,
  Combatant,
  CombatActionType,
  CombatResult,
  CombatPhase,
  CharacterAppearance,
  WorldPosition,
  TimeState,
  WeatherState,
  NPC,
  Structure,
  WorldItem,
} from '@iron-frontier/shared/store';
