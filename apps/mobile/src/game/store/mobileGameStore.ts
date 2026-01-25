/**
 * Mobile Game Store - Platform-specific game store for the mobile app
 *
 * This file creates the game store using the shared factory and wires up
 * the mobile-specific data access layer and storage adapter.
 */

import { getEncounterById, getEnemyById } from '@iron-frontier/shared/data/enemies';
import {
  generateRandomEncounter,
  initEncounterTemplates,
  shouldTriggerEncounter,
} from '@iron-frontier/shared/data/generation/generators/encounterGenerator';
import { ProceduralLocationManager } from '@iron-frontier/shared/data/generation/ProceduralLocationManager';
import {
  combineSeeds,
  hashString,
  SeededRandom,
} from '@iron-frontier/shared/data/generation/seededRandom';
import { ENCOUNTER_TEMPLATES } from '@iron-frontier/shared/data/generation/templates/encounterTemplates';
// Import data access functions from the shared data layer
import { getItem, STARTER_INVENTORY } from '@iron-frontier/shared/data/items';
import { getWorldItemsForLocation } from '@iron-frontier/shared/data/items/worldItems';
import {
  getDialogueTreeById,
  getNPCById,
  getPrimaryDialogueTree,
} from '@iron-frontier/shared/data/npcs';
import { getQuestById } from '@iron-frontier/shared/data/quests';
import {
  AP_COSTS,
  calculateDamage,
  calculateHitChance,
  rollCritical,
  rollHit,
} from '@iron-frontier/shared/data/schemas/combat';
import {
  getAvailableChoices,
  getDialogueEntryNode,
} from '@iron-frontier/shared/data/schemas/npc';
import {
  createActiveQuest,
  isCurrentStageComplete as isStageComplete,
} from '@iron-frontier/shared/data/schemas/quest';
import { getConnectionsFrom } from '@iron-frontier/shared/data/schemas/world';
import {
  calculateBuyPrice,
  calculateSellPrice,
  canSellItemToShop,
  getShopById,
} from '@iron-frontier/shared/data/shops';
import { getWorldById, loadWorld } from '@iron-frontier/shared/data/worlds';
import {
  createGameStore,
  type DataAccess,
  MemoryStorageAdapter,
} from '@iron-frontier/shared/store';

/**
 * Mobile-specific data access implementation
 * (Identical to web for now, but allows future divergence)
 */
const mobileDataAccess: DataAccess = {
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
 * Create the mobile game store using memory storage for now
 * (TODO: Implement AsyncStorage adapter)
 */
export const useMobileGameStore = createGameStore({
  storageAdapter: new MemoryStorageAdapter(),
  storageKey: 'iron-frontier-mobile-save',
  dataAccess: mobileDataAccess,
});
