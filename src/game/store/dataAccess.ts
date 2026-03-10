/**
 * Data Access Interface - Platform-specific data fetching
 *
 * Defines the contract for accessing game data (items, NPCs, quests, etc.)
 * that must be implemented by each platform (web, mobile).
 *
 * @module game/store/dataAccess
 */

import type { CombatEncounter } from '../data/schemas/combat';
import type { CombatActionType } from './types';

/**
 * Platform-agnostic data access interface.
 *
 * Each platform (web, mobile) must provide an implementation
 * that resolves game data from its specific data layer.
 */
export interface DataAccess {
  // Items
  getItem: (itemId: string) => any;
  getStarterInventory: () => any[];

  // NPCs
  getNPCById: (npcId: string) => any;
  getNPCsByLocation: (locationId: string) => any[];
  getDialogueTreeById: (treeId: string) => any;
  getPrimaryDialogueTree: (npcId: string) => any;
  getDialogueEntryNode: (tree: any, checkCondition: (c: any) => boolean) => any;
  getAvailableChoices: (node: any, checkCondition: (c: any) => boolean) => any[];

  // Quests
  getQuestById: (questId: string) => any;
  createActiveQuest: (questId: string) => any;
  isCurrentStageComplete: (quest: any, activeQuest: any) => boolean;

  // World
  getWorldById: (worldId: string) => any;
  loadWorld: (world: any) => any;
  getConnectionsFrom: (world: any, locationId: string) => any[];
  getWorldItemsForLocation: (locationId: string) => any[];

  // Combat
  getEnemyById: (enemyId: string) => any;
  getEncounterById: (encounterId: string) => CombatEncounter | undefined;
  calculateHitChance: (attacker: any, target: any, action: any) => number;
  calculateDamage: (attacker: any, target: any, action: any, isCrit: boolean) => number;
  rollHit: (chance: number) => boolean;
  rollCritical: (attacker: any) => boolean;
  AP_COSTS: Record<CombatActionType, number>;

  // Shops
  getShopById: (shopId: string) => any;
  calculateBuyPrice: (shop: any, item: any) => number;
  calculateSellPrice: (shop: any, itemDef: any) => number;
  canSellItemToShop: (shop: any, itemType: string) => boolean;

  // Generation
  initEncounterTemplates: () => void;
  generateRandomEncounter: (rng: any, context: any, options: any) => any;
  shouldTriggerEncounter: (rng: any, context: any, baseChance?: number) => boolean;
  ENCOUNTER_TEMPLATES: any;

  // Procedural
  ProceduralLocationManager: {
    initialize: (seed: number) => void;
    isInitialized: () => boolean;
    generateLocationContent: (location: any, options?: any) => any;
    hasGeneratedContent: (locationId: string) => boolean;
    getOrGenerateNPCs: (locationId: string, resolved?: any) => any;
  };

  // World resolution
  getResolvedLocation: (loadedWorld: any, locationId: string) => any;
  getRegionForLocation: (world: any, locationId: string) => string;

  // Seeded random
  SeededRandom: new (
    seed: number
  ) => any;
  hashString: (str: string) => number;
  combineSeeds: (...seeds: number[]) => number;
}

/**
 * Store creation options.
 */
export interface CreateGameStoreOptions {
  storageAdapter: import('./StorageAdapter').StorageAdapter;
  storageKey: string;
  databaseManager?: any;
  dataAccess: DataAccess;
}
