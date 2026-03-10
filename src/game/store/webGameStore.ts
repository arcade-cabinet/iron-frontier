/**
 * Web Game Store - Platform-specific game store for the web app
 *
 * This file creates the game store using the shared factory and wires up
 * the web-specific data access layer and storage adapter.
 */

import { Platform } from 'react-native';
import { getEncounterById, getEnemyById } from '../data/enemies';
import {
  generateRandomEncounter,
  initEncounterTemplates,
  shouldTriggerEncounter,
} from '../data/generation/generators/encounterGenerator';
import { ProceduralLocationManager } from '../data/generation/ProceduralLocationManager';
import { combineSeeds, hashString, SeededRandom } from '../data/generation/seededRandom';
import { ENCOUNTER_TEMPLATES } from '../data/generation/templates/encounterTemplates';
// Import data access functions from the shared data layer
import { getItem, STARTER_INVENTORY } from '../data/items';
import { getWorldItemsForLocation } from '../data/items/worldItems';
import { getDialogueTreeById, getNPCById, getNPCsByLocation, getPrimaryDialogueTree } from '../data/npcs';
import { getQuestById } from '../data/quests';
import {
  AP_COSTS,
  calculateDamage,
  calculateHitChance,
  rollCritical,
  rollHit,
} from '../data/schemas/combat';
import { getAvailableChoices, getDialogueEntryNode } from '../data/schemas/npc';
import { createActiveQuest, isCurrentStageComplete as isStageComplete } from '../data/schemas/quest';
import { getConnectionsFrom } from '../data/schemas/world';
import {
  calculateBuyPrice,
  calculateSellPrice,
  canSellItemToShop,
  getShopById,
} from '../data/shops';
import { getWorldById, loadWorld } from '../data/worlds';
import {
  createGameStore,
  type DataAccess,
  type GameState,
} from './createGameStore';
import { NativeStorageAdapter, WebStorageAdapter } from './StorageAdapter';
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
  getNPCsByLocation: (locationId: string) => getNPCsByLocation(locationId),
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
  calculateHitChance: (attacker: any, target: any, action: any) => {
    const accuracy = attacker?.accuracy ?? 75;
    const evasion = target?.evasion ?? 10;
    const range = 1;
    const isAimedShot = action?.type === 'aimed_shot';
    return calculateHitChance(accuracy, evasion, range, isAimedShot);
  },
  calculateDamage: (attacker: any, target: any, _action: any, isCrit: boolean) => {
    const baseDamage = attacker?.baseDamage ?? 10;
    const attackerLevel = attacker?.level ?? 1;
    const defenderArmor = target?.armor ?? 0;
    return calculateDamage(baseDamage, attackerLevel, defenderArmor, isCrit);
  },
  rollHit: (chance: number) => rollHit(chance),
  rollCritical: (_attacker: any) => rollCritical(),
  AP_COSTS,

  // Shops
  getShopById: (shopId: string) => getShopById(shopId),
  calculateBuyPrice: (shop: any, item: any) => calculateBuyPrice(shop, item),
  calculateSellPrice: (shop: any, itemDef: any) => calculateSellPrice(shop, itemDef),
  canSellItemToShop,

  // Generation
  initEncounterTemplates: () => {
    // Wrapper function that matches DataAccess interface
    initEncounterTemplates(ENCOUNTER_TEMPLATES);
  },
  generateRandomEncounter,
  shouldTriggerEncounter,
  ENCOUNTER_TEMPLATES,

  // Procedural
  ProceduralLocationManager: {
    initialize: (seed: number) => ProceduralLocationManager.initialize(seed),
    isInitialized: () => ProceduralLocationManager.isInitialized(),
    generateLocationContent: (resolved: any, options?: any) =>
      ProceduralLocationManager.generateLocationContent(resolved, options),
    hasGeneratedContent: (locationId: string) =>
      ProceduralLocationManager.hasGeneratedContent(locationId),
    getOrGenerateNPCs: (locationId: string, resolved?: any) =>
      ProceduralLocationManager.getOrGenerateNPCs(locationId, resolved),
  },

  // World resolution
  getResolvedLocation: (loadedWorld: any, locationId: string) => {
    // loadedWorld is a LoadedWorld object with a getLocation method
    if (loadedWorld?.getLocation) {
      return loadedWorld.getLocation(locationId);
    }
    // loadedWorld doesn't have getLocation method — unexpected shape
    console.error(`[webGameStore] loadedWorld missing getLocation() — falling back to Map lookup`);
    if (loadedWorld?.locations?.get) {
      return loadedWorld.locations.get(locationId);
    }
    console.error(`[webGameStore] Could not resolve location "${locationId}" from loadedWorld`);
    return undefined;
  },
  getRegionForLocation: (world: any, locationId: string) => {
    // Find which region contains this location based on world coordinates
    if (!world?.regions || !world?.locations) return 'unknown';
    const locRef = world.locations.find?.((l: any) => l.id === locationId);
    if (!locRef?.coord) return 'unknown';
    const { wx, wy } = locRef.coord;
    for (const region of world.regions) {
      const b = region.bounds;
      if (b && wx >= b.minX && wx <= b.maxX && wy >= b.minY && wy <= b.maxY) {
        return region.id;
      }
    }
    return 'unknown';
  },

  // Seeded random
  SeededRandom,
  hashString,
  combineSeeds,
};

/**
 * Create the web game store with platform-appropriate persistence
 */
// Debug: expose store on window for playtesting (remove before release)
if (typeof window !== 'undefined') {
  (window as any).__IRON_FRONTIER_STORE__ = null; // placeholder, set below
}

export const gameStore = createGameStore({
  storageAdapter: Platform.OS !== 'web'
    ? new NativeStorageAdapter()
    : new WebStorageAdapter(),
  storageKey: 'iron-frontier-save',
  databaseManager: dbManager,
  dataAccess: webDataAccess,
});

// Assign the actual store reference for debug access
if (typeof window !== 'undefined') {
  (window as any).__IRON_FRONTIER_STORE__ = gameStore;
}

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
} from './types';
