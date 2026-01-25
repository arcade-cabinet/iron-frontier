/**
 * Game Store Factory - Creates platform-agnostic game stores
 *
 * This factory creates Zustand stores with configurable storage adapters,
 * allowing the same game logic to work across web and native platforms.
 */

import { create } from 'zustand';
import type { StateStorage } from 'zustand/middleware';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  DEFAULT_CAMERA_STATE,
  DEFAULT_EQUIPMENT,
  DEFAULT_PLAYER_STATS,
  DEFAULT_SETTINGS,
  DEFAULT_TIME,
  DEFAULT_WEATHER,
  DEFAULT_WORLD_POSITION,
  SAVE_VERSION,
  STORAGE_KEY,
} from './defaults';
import { createStateStorage } from './persistStorage';

import type { StorageAdapter } from './StorageAdapter';
import { NoopStorageAdapter } from './StorageAdapter';
import type {
  CombatActionType,
  DialogueState,
  EquipmentSlot,
  GamePhase,
  GameState,
  GameStateData,
  InventoryItem,
  Notification,
  NPC,
  PanelType,
  PersistedGameState,
  PlayerStats,
  WorldPosition,
} from './types';

// ============================================================================
// STORE CONFIGURATION
// ============================================================================

export interface GameStoreConfig {
  /**
   * Storage adapter for persistence
   * Defaults to NoopStorageAdapter (no persistence)
   */
  storageAdapter?: StorageAdapter;

  /**
   * Custom storage key
   * Defaults to 'iron-frontier-save'
   */
  storageKey?: string;

  /**
   * Database manager for SQLite persistence (web only)
   * This is optional and only used for binary saves
   */
  databaseManager?: DatabaseManager;

  /**
   * Data access functions (required)
   * These provide access to game data (items, NPCs, quests, etc.)
   */
  dataAccess: DataAccess;
}

/**
 * Database manager interface for SQLite persistence
 */
export interface DatabaseManager {
  init(binaryData?: Uint8Array): Promise<void>;
  dispose(): void;
  export(): Uint8Array | null;
  run(sql: string, params?: any[]): void;
  exec(sql: string, params?: any[]): any[];
  savePlayer(state: any): void;
  saveInventory(items: any[]): void;
  loadGameState(): any;
}

/**
 * Data access interface for game data lookups
 * This abstracts the data layer so the store doesn't depend on specific implementations
 */
export interface DataAccess {
  // Items
  getItem: (itemId: string) => any | undefined;
  getStarterInventory: () => Array<{ itemId: string; quantity: number }>;

  // NPCs
  getNPCById: (npcId: string) => any | undefined;
  getDialogueTreeById: (treeId: string) => any | undefined;
  getPrimaryDialogueTree: (npcId: string) => any | undefined;
  getDialogueEntryNode: (tree: any, checkCondition: (c: any) => boolean) => any | null;
  getAvailableChoices: (node: any, checkCondition: (c: any) => boolean) => any[];

  // Quests
  getQuestById: (questId: string) => any | undefined;
  createActiveQuest: (questId: string) => any;
  isCurrentStageComplete: (quest: any, activeQuest: any) => boolean;

  // World
  getWorldById: (worldId: string) => any | undefined;
  loadWorld: (world: any) => any;
  getConnectionsFrom: (world: any, locationId: string) => any[];
  getWorldItemsForLocation: (locationId: string) => any[];

  // Combat
  getEnemyById: (enemyId: string) => any | undefined;
  getEncounterById: (encounterId: string) => any | undefined;
  calculateHitChance: (accuracy: number, evasion: number, range: number, aimed?: boolean) => number;
  calculateDamage: (
    baseDamage: number,
    level: number,
    armor: number,
    isCritical?: boolean
  ) => number;
  rollHit: (chance: number) => boolean;
  rollCritical: () => boolean;
  AP_COSTS: Record<string, number>;

  // Shops
  getShopById: (shopId: string) => any | undefined;
  calculateBuyPrice: (shop: any, item: any) => number;
  calculateSellPrice: (shop: any, item: any) => number;
  canSellItemToShop: (shop: any, itemType: string) => boolean;

  // Generation
  initEncounterTemplates: (templates: any) => void;
  generateRandomEncounter: (rng: any, context: any) => any | null;
  shouldTriggerEncounter: (rng: any, context: any, baseChance: number) => boolean;
  ENCOUNTER_TEMPLATES: any;

  // Procedural
  ProceduralLocationManager: {
    initialize: (seed: number) => void;
    generateLocationContent: (location: any) => void;
    hasGeneratedContent: (locationId: string) => boolean;
  };

  // Seeded random
  SeededRandom: new (
    seed: number
  ) => any;
  hashString: (str: string) => number;
  combineSeeds: (a: number, b: number) => number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create an inventory item from an item definition
 */
function createInventoryItem(itemDef: any, quantity: number = 1): InventoryItem {
  return {
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    itemId: itemDef.id,
    name: itemDef.name,
    rarity: itemDef.rarity,
    quantity,
    description: itemDef.description,
    usable: itemDef.usable,
    condition: 100,
    weight: itemDef.weight,
    type: itemDef.type,
    droppable: itemDef.droppable,
  };
}

// ============================================================================
// STORE FACTORY
// ============================================================================

/**
 * Create a game store with the specified configuration
 *
 * @param config Store configuration including storage adapter and data access
 * @returns Zustand store with game state and actions
 */
export function createGameStore(config: GameStoreConfig) {
  const {
    storageAdapter = new NoopStorageAdapter(),
    storageKey = STORAGE_KEY,
    databaseManager,
    dataAccess,
  } = config;

  // Create Zustand-compatible storage
  const storage: StateStorage = createStateStorage(storageAdapter);

  /**
   * Create starter inventory from item library
   */
  function createStarterInventory(): InventoryItem[] {
    const items: InventoryItem[] = [];
    for (const starter of dataAccess.getStarterInventory()) {
      const itemDef = dataAccess.getItem(starter.itemId);
      if (itemDef) {
        items.push(createInventoryItem(itemDef, starter.quantity));
      }
    }
    return items;
  }

  // Create the store
  const useGameStore = create<GameState>()(
    persist(
      (set, get) => ({
        // =====================================================================
        // STATE
        // =====================================================================
        phase: 'title' as GamePhase,
        initialized: false,
        worldSeed: 12345,
        time: { ...DEFAULT_TIME },
        weather: { ...DEFAULT_WEATHER },
        loadedChunks: {},

        // Travel System State
        currentWorldId: null,
        currentLocationId: null,
        discoveredLocationIds: [],
        loadedWorld: null,
        playerId: '',
        playerName: 'Stranger',
        playerAppearance: null,
        playerPosition: { ...DEFAULT_WORLD_POSITION },
        playerRotation: 0,
        playerStats: { ...DEFAULT_PLAYER_STATS },
        equipment: { ...DEFAULT_EQUIPMENT },
        inventory: [],
        maxInventorySlots: 20,
        maxCarryWeight: 50,
        activeQuests: [],
        completedQuests: [],
        completedQuestIds: [],
        npcs: {},
        talkedNPCIds: [],
        structures: {},
        worldItems: {},
        collectedItemIds: [],
        camera: { ...DEFAULT_CAMERA_STATE },
        activePanel: null,
        dialogueState: null,
        dialogueHistory: [],
        notifications: [],
        combatState: null,
        shopState: null,
        travelState: null,
        settings: { ...DEFAULT_SETTINGS },
        saveVersion: SAVE_VERSION,
        lastSaved: Date.now(),
        playTime: 0,

        // =====================================================================
        // ACTIONS
        // =====================================================================

        initGame: (playerName: string, seed?: number) => {
          const worldSeed = seed ?? Math.floor(Math.random() * 1000000);
          const starterItems = createStarterInventory();
          set({
            phase: 'playing',
            initialized: true,
            worldSeed,
            playerName,
            playerId: `player_${Date.now()}`,
            playerPosition: { ...DEFAULT_WORLD_POSITION },
            playerStats: { ...DEFAULT_PLAYER_STATS },
            equipment: { ...DEFAULT_EQUIPMENT },
            inventory: starterItems,
            activeQuests: [],
            completedQuests: [],
            completedQuestIds: [],
            collectedItemIds: [],
            talkedNPCIds: [],
            notifications: [],
          });

          // Auto-equip starting weapon
          const startingWeapon = starterItems.find((item) => item.type === 'weapon');
          if (startingWeapon) {
            get().equipItem(startingWeapon.id, 'weapon');
          }

          // Initialize SQLite DB if available
          if (databaseManager) {
            databaseManager.init().then(() => {
              databaseManager.savePlayer(get());
              databaseManager.saveInventory(get().inventory);
            });
          }

          get().addNotification('info', `Welcome to the frontier, ${playerName}!`);
        },

        setPhase: (phase: GamePhase) => set({ phase }),

        resetGame: () =>
          set({
            phase: 'title',
            initialized: false,
            playerName: 'Stranger',
            playerAppearance: null,
            playerPosition: { ...DEFAULT_WORLD_POSITION },
            playerStats: { ...DEFAULT_PLAYER_STATS },
            equipment: { ...DEFAULT_EQUIPMENT },
            inventory: [],
            activeQuests: [],
            completedQuests: [],
            completedQuestIds: [],
            collectedItemIds: [],
            talkedNPCIds: [],
            notifications: [],
            activePanel: null,
            dialogueState: null,
            playTime: 0,
            currentWorldId: null,
            currentLocationId: null,
            discoveredLocationIds: [],
            loadedWorld: null,
          }),

        setPlayerPosition: (pos: WorldPosition) => {
          set({ playerPosition: pos });
          databaseManager?.savePlayer(get());
        },

        setPlayerRotation: (rotation: number) => {
          set({ playerRotation: rotation });
          databaseManager?.savePlayer(get());
        },

        updatePlayerStats: (stats: Partial<PlayerStats>) => {
          set((state) => ({ playerStats: { ...state.playerStats, ...stats } }));
          databaseManager?.savePlayer(get());
        },

        gainXP: (amount: number) => {
          const { playerStats, addNotification } = get();
          const newXP = playerStats.xp + amount;
          if (newXP >= playerStats.xpToNext) {
            const newLevel = playerStats.level + 1;
            const overflow = newXP - playerStats.xpToNext;
            set({
              playerStats: {
                ...playerStats,
                xp: overflow,
                level: newLevel,
                xpToNext: Math.floor(playerStats.xpToNext * 1.5),
                maxHealth: playerStats.maxHealth + 10,
                health: playerStats.maxHealth + 10,
              },
            });
            addNotification('level', `Level up! Now level ${newLevel}`);
          } else {
            set({ playerStats: { ...playerStats, xp: newXP } });
          }
          if (amount > 0) addNotification('xp', `+${amount} XP`);
        },

        takeDamage: (amount: number) => {
          const newHealth = Math.max(0, get().playerStats.health - amount);
          set((state) => ({
            playerStats: { ...state.playerStats, health: newHealth },
          }));
          if (newHealth <= 0 && get().phase !== 'combat') {
            set({ phase: 'game_over' });
            get().addNotification('warning', 'You have died...');
          }
        },

        heal: (amount: number) =>
          set((state) => ({
            playerStats: {
              ...state.playerStats,
              health: Math.min(state.playerStats.maxHealth, state.playerStats.health + amount),
            },
          })),

        addGold: (amount: number) => {
          set((state) => ({
            playerStats: { ...state.playerStats, gold: state.playerStats.gold + amount },
          }));
          if (amount > 0) get().addNotification('item', `+${amount} gold`);
        },

        addItem: (item: InventoryItem) => {
          const { inventory, maxInventorySlots, addNotification } = get();
          if (inventory.length >= maxInventorySlots) {
            addNotification('warning', 'Inventory full!');
            return;
          }
          const itemDef = dataAccess.getItem(item.itemId);
          const canStack = itemDef?.stackable ?? true;

          if (canStack) {
            const existing = inventory.find((i) => i.itemId === item.itemId);
            if (existing) {
              const maxStack = itemDef?.maxStack ?? 99;
              const newQuantity = Math.min(existing.quantity + item.quantity, maxStack);
              set({
                inventory: inventory.map((i) =>
                  i.itemId === item.itemId ? { ...i, quantity: newQuantity } : i
                ),
              });
              databaseManager?.saveInventory(get().inventory);
              addNotification('item', `Found: ${item.name} x${item.quantity}`);
              return;
            }
          }
          set({ inventory: [...inventory, item] });
          databaseManager?.saveInventory(get().inventory);
          addNotification('item', `Found: ${item.name}`);
        },

        addItemById: (itemId: string, quantity = 1) => {
          const itemDef = dataAccess.getItem(itemId);
          if (!itemDef) {
            // eslint-disable-next-line no-console
            if (typeof console !== 'undefined') console.warn(`[GameStore] Unknown item: ${itemId}`);
            return;
          }
          const newItem = createInventoryItem(itemDef, quantity);
          get().addItem(newItem);
        },

        removeItem: (itemId: string, quantity = 1) => {
          const { inventory } = get();
          const item = inventory.find((i) => i.itemId === itemId);
          if (!item) return;
          if (item.quantity <= quantity) {
            set({ inventory: inventory.filter((i) => i.itemId !== itemId) });
          } else {
            set({
              inventory: inventory.map((i) =>
                i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i
              ),
            });
          }
          databaseManager?.saveInventory(get().inventory);
        },

        useItem: (id: string) => {
          const { inventory, heal, addNotification, updatePlayerStats, playerStats } = get();
          const invItem = inventory.find((i) => i.id === id);
          if (!invItem || !invItem.usable) return;

          const itemDef = dataAccess.getItem(invItem.itemId);
          if (itemDef?.consumableStats) {
            const stats = itemDef.consumableStats;
            if (stats.healAmount > 0) {
              heal(stats.healAmount);
            }
            if (stats.staminaAmount > 0) {
              updatePlayerStats({
                stamina: Math.min(
                  playerStats.maxStamina,
                  playerStats.stamina + stats.staminaAmount
                ),
              });
            }
          } else if (itemDef?.effects) {
            for (const effect of itemDef.effects) {
              if (effect.type === 'heal' && effect.value) {
                heal(effect.value);
              }
              if (effect.type === 'stamina' && effect.value) {
                updatePlayerStats({
                  stamina: Math.min(playerStats.maxStamina, playerStats.stamina + effect.value),
                });
              }
            }
          }

          if (invItem.quantity > 1) {
            set({
              inventory: inventory.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity - 1 } : i
              ),
            });
          } else {
            set({ inventory: inventory.filter((i) => i.id !== id) });
          }
          databaseManager?.saveInventory(get().inventory);
          addNotification('info', `Used ${invItem.name}`);
        },

        dropItem: (id: string) => {
          const { inventory, addNotification } = get();
          const item = inventory.find((i) => i.id === id);
          if (!item) return;
          if (!item.droppable) {
            addNotification('warning', `Cannot drop ${item.name}`);
            return;
          }
          set({ inventory: inventory.filter((i) => i.id !== id) });
          databaseManager?.saveInventory(get().inventory);
          addNotification('info', `Dropped ${item.name}`);
        },

        getItemCount: (itemId: string) => {
          const { inventory } = get();
          const item = inventory.find((i) => i.itemId === itemId);
          return item?.quantity ?? 0;
        },

        getTotalWeight: () => {
          const { inventory } = get();
          return inventory.reduce((total, item) => total + item.weight * item.quantity, 0);
        },

        // Equipment
        equipItem: (inventoryItemId: string, slot?: EquipmentSlot) => {
          const { inventory, equipment, addNotification } = get();
          const invItem = inventory.find((i) => i.id === inventoryItemId);
          if (!invItem) {
            addNotification('warning', 'Item not found');
            return;
          }

          const itemDef = dataAccess.getItem(invItem.itemId);
          if (!itemDef) return;

          let targetSlot: EquipmentSlot | null = slot || null;
          if (!targetSlot) {
            if (itemDef.type === 'weapon') {
              targetSlot = equipment.weapon ? 'offhand' : 'weapon';
            } else if (itemDef.type === 'armor') {
              if (itemDef.armorStats?.slot === 'head') targetSlot = 'head';
              else if (itemDef.armorStats?.slot === 'body') targetSlot = 'body';
              else if (itemDef.armorStats?.slot === 'accessory') targetSlot = 'accessory';
              else targetSlot = 'body';
            }
          }

          if (!targetSlot) {
            addNotification('warning', 'Cannot equip this item');
            return;
          }

          if (equipment[targetSlot]) {
            get().unequipItem(targetSlot);
          }

          set((state) => ({
            equipment: { ...state.equipment, [targetSlot!]: inventoryItemId },
          }));

          addNotification('info', `Equipped ${invItem.name}`);
        },

        unequipItem: (slot: EquipmentSlot) => {
          const { equipment, addNotification, inventory } = get();
          const itemId = equipment[slot];
          if (!itemId) return;

          const invItem = inventory.find((i) => i.id === itemId);
          set((state) => ({
            equipment: { ...state.equipment, [slot]: null },
          }));

          if (invItem) {
            addNotification('info', `Unequipped ${invItem.name}`);
          }
        },

        getEquippedItem: (slot: EquipmentSlot) => {
          const { equipment, inventory } = get();
          const itemId = equipment[slot];
          if (!itemId) return null;
          return inventory.find((i) => i.id === itemId) || null;
        },

        getEquipmentBonuses: () => {
          const { equipment, inventory } = get();
          let damage = 0;
          let defense = 0;
          let accuracy = 0;

          for (const slot of Object.keys(equipment) as EquipmentSlot[]) {
            const itemId = equipment[slot];
            if (!itemId) continue;

            const invItem = inventory.find((i) => i.id === itemId);
            if (!invItem) continue;

            const itemDef = dataAccess.getItem(invItem.itemId);
            if (!itemDef) continue;

            if (itemDef.weaponStats) {
              damage += itemDef.weaponStats.damage || 0;
              accuracy += itemDef.weaponStats.accuracy || 0;
            }
            if (itemDef.armorStats) {
              defense += itemDef.armorStats.defense || 0;
            }
          }

          return { damage, defense, accuracy };
        },

        // Quests
        startQuest: (questId: string) => {
          const { activeQuests, completedQuestIds, addNotification } = get();

          if (activeQuests.some((q) => q.questId === questId)) {
            addNotification('warning', 'Quest already active');
            return;
          }
          if (completedQuestIds.includes(questId)) {
            const quest = dataAccess.getQuestById(questId);
            if (!quest?.repeatable) {
              addNotification('warning', 'Quest already completed');
              return;
            }
          }

          const quest = dataAccess.getQuestById(questId);
          if (!quest) {
            addNotification('warning', 'Quest not found');
            return;
          }

          const activeQuest = dataAccess.createActiveQuest(questId);
          if (quest.timeLimitHours) {
            activeQuest.timeRemainingHours = quest.timeLimitHours;
          }

          set((state) => ({
            activeQuests: [...state.activeQuests, activeQuest],
          }));

          const firstStage = quest.stages[0];
          if (firstStage?.onStartText) {
            addNotification('quest', firstStage.onStartText);
          } else {
            addNotification('quest', `Quest accepted: ${quest.title}`);
          }
        },

        updateObjective: (questId: string, objectiveId: string, progress: number) => {
          const { activeQuests, addNotification } = get();
          const activeQuest = activeQuests.find((q) => q.questId === questId);
          if (!activeQuest) return;

          const quest = dataAccess.getQuestById(questId);
          if (!quest) return;

          const currentStage = quest.stages[activeQuest.currentStageIndex];
          if (!currentStage) return;

          const objective = currentStage.objectives.find((o: any) => o.id === objectiveId);
          if (!objective) return;

          const newProgress = Math.min(progress, objective.count);
          const wasComplete = (activeQuest.objectiveProgress[objectiveId] ?? 0) >= objective.count;
          const isNowComplete = newProgress >= objective.count;

          set((state) => ({
            activeQuests: state.activeQuests.map((q) =>
              q.questId === questId
                ? {
                    ...q,
                    objectiveProgress: {
                      ...q.objectiveProgress,
                      [objectiveId]: newProgress,
                    },
                  }
                : q
            ),
          }));

          if (!wasComplete && isNowComplete) {
            addNotification('quest', `Objective complete: ${objective.description}`);
          }

          const updatedActiveQuest = get().activeQuests.find((q) => q.questId === questId);
          if (updatedActiveQuest && dataAccess.isCurrentStageComplete(quest, updatedActiveQuest)) {
            addNotification('info', 'Stage objectives complete!');
          }
        },

        advanceQuestStage: (questId: string) => {
          const { activeQuests, addNotification, gainXP, addGold } = get();
          const activeQuest = activeQuests.find((q) => q.questId === questId);
          if (!activeQuest) return;

          const quest = dataAccess.getQuestById(questId);
          if (!quest) return;

          const currentStage = quest.stages[activeQuest.currentStageIndex];
          if (!currentStage) return;

          if (!dataAccess.isCurrentStageComplete(quest, activeQuest)) {
            addNotification('warning', 'Stage objectives not complete');
            return;
          }

          const rewards = currentStage.stageRewards;
          if (rewards.xp > 0) gainXP(rewards.xp);
          if (rewards.gold > 0) addGold(rewards.gold);

          if (currentStage.onCompleteText) {
            addNotification('quest', currentStage.onCompleteText);
          }

          const isLastStage = activeQuest.currentStageIndex === quest.stages.length - 1;

          if (isLastStage) {
            get().completeQuest(questId);
          } else {
            const nextStageIndex = activeQuest.currentStageIndex + 1;
            const nextStage = quest.stages[nextStageIndex];

            set((state) => ({
              activeQuests: state.activeQuests.map((q) =>
                q.questId === questId
                  ? {
                      ...q,
                      currentStageIndex: nextStageIndex,
                      objectiveProgress: {},
                    }
                  : q
              ),
            }));

            if (nextStage?.onStartText) {
              addNotification('quest', nextStage.onStartText);
            } else {
              addNotification('quest', `New stage: ${nextStage.title}`);
            }
          }
        },

        completeQuest: (questId: string) => {
          const { activeQuests, addNotification, gainXP, addGold } = get();
          const activeQuest = activeQuests.find((q) => q.questId === questId);
          if (!activeQuest) return;

          const quest = dataAccess.getQuestById(questId);
          if (!quest) return;

          const rewards = quest.rewards;
          if (rewards.xp > 0) gainXP(rewards.xp);
          if (rewards.gold > 0) addGold(rewards.gold);

          set((state) => ({
            activeQuests: state.activeQuests.filter((q) => q.questId !== questId),
            completedQuests: [...state.completedQuests, quest],
            completedQuestIds: [...state.completedQuestIds, questId],
          }));

          addNotification('quest', `Quest completed: ${quest.title}`);
        },

        failQuest: (questId: string) => {
          const { addNotification } = get();
          const quest = dataAccess.getQuestById(questId);

          set((state) => ({
            activeQuests: state.activeQuests.map((q) =>
              q.questId === questId ? { ...q, status: 'failed' as const } : q
            ),
          }));

          addNotification('warning', `Quest failed: ${quest?.title ?? questId}`);
        },

        abandonQuest: (questId: string) => {
          const { addNotification } = get();
          const quest = dataAccess.getQuestById(questId);

          set((state) => ({
            activeQuests: state.activeQuests.filter((q) => q.questId !== questId),
          }));

          addNotification('info', `Quest abandoned: ${quest?.title ?? questId}`);
        },

        getActiveQuest: (questId: string) => {
          return get().activeQuests.find((q) => q.questId === questId);
        },

        getQuestDefinition: (questId: string) => {
          return dataAccess.getQuestById(questId);
        },

        // NPCs
        updateNPC: (npcId: string, updates: Partial<NPC>) => {
          set((state) => ({
            npcs: { ...state.npcs, [npcId]: { ...state.npcs[npcId], ...updates } },
          }));
        },

        talkToNPC: (npcId: string) => {
          get().startDialogue(npcId);
        },

        markNPCTalked: (npcId: string) => {
          const { talkedNPCIds } = get();
          if (!talkedNPCIds.includes(npcId)) {
            set({ talkedNPCIds: [...talkedNPCIds, npcId] });
          }
        },

        // Dialogue
        startDialogue: (npcId: string, treeId?: string) => {
          const npcDef = dataAccess.getNPCById(npcId);
          if (!npcDef) {
            const engineNpc = get().npcs[npcId];
            if (engineNpc) {
              set({
                phase: 'dialogue',
                dialogueState: {
                  npcId,
                  npcName: engineNpc.name,
                  text: `Howdy, stranger. Name's ${engineNpc.name}.`,
                  treeId: 'fallback',
                  currentNodeId: 'fallback',
                  choices: [{ text: 'Goodbye.', nextNodeId: null, effects: [], tags: [] }],
                  autoAdvanceNodeId: null,
                  history: [],
                  conversationFlags: {},
                  startedAt: Date.now(),
                },
              });
            }
            return;
          }

          const dialogueTreeId = treeId || npcDef.primaryDialogueId;
          if (!dialogueTreeId) return;

          const tree = dataAccess.getDialogueTreeById(dialogueTreeId);
          if (!tree) return;

          const checkCondition = get().checkDialogueCondition;
          const entryNode = dataAccess.getDialogueEntryNode(tree, checkCondition);
          if (!entryNode) return;

          for (const effect of entryNode.onEnterEffects || []) {
            get().applyDialogueEffect(effect);
          }

          const availableChoices = dataAccess.getAvailableChoices(entryNode, checkCondition);

          set({
            phase: 'dialogue',
            dialogueState: {
              npcId,
              npcName: npcDef.name,
              npcTitle: npcDef.title,
              npcPortraitId: npcDef.portraitId,
              npcExpression: entryNode.expression,
              treeId: dialogueTreeId,
              currentNodeId: entryNode.id,
              text: entryNode.text,
              speaker: entryNode.speaker,
              choices: availableChoices.map((c: any) => ({
                text: c.text,
                nextNodeId: c.nextNodeId,
                effects: c.effects,
                tags: c.tags,
                hint: c.hint,
              })),
              autoAdvanceNodeId: entryNode.nextNodeId,
              history: [],
              conversationFlags: {},
              startedAt: Date.now(),
            },
          });

          get().markNPCTalked(npcId);
        },

        selectChoice: (choiceIndex: number) => {
          const { dialogueState } = get();
          if (!dialogueState) return;

          const choice = dialogueState.choices[choiceIndex];
          if (!choice) return;

          for (const effect of choice.effects) {
            get().applyDialogueEffect(effect);
          }

          if (!choice.nextNodeId) {
            get().endDialogue();
            return;
          }

          const tree = dataAccess.getDialogueTreeById(dialogueState.treeId);
          if (!tree) {
            get().endDialogue();
            return;
          }

          const nextNode = tree.nodes.find((n: any) => n.id === choice.nextNodeId);
          if (!nextNode) {
            get().endDialogue();
            return;
          }

          for (const effect of nextNode.onEnterEffects || []) {
            get().applyDialogueEffect(effect);
          }

          const checkCondition = get().checkDialogueCondition;
          const availableChoices = dataAccess.getAvailableChoices(nextNode, checkCondition);

          set({
            dialogueState: {
              ...dialogueState,
              currentNodeId: nextNode.id,
              text: nextNode.text,
              speaker: nextNode.speaker,
              npcExpression: nextNode.expression,
              choices: availableChoices.map((c: any) => ({
                text: c.text,
                nextNodeId: c.nextNodeId,
                effects: c.effects,
                tags: c.tags,
                hint: c.hint,
              })),
              autoAdvanceNodeId: nextNode.nextNodeId,
              history: [...dialogueState.history, dialogueState.currentNodeId],
            },
          });
        },

        advanceDialogue: () => {
          const { dialogueState } = get();
          if (!dialogueState || !dialogueState.autoAdvanceNodeId) return;

          const tree = dataAccess.getDialogueTreeById(dialogueState.treeId);
          if (!tree) {
            get().endDialogue();
            return;
          }

          const nextNode = tree.nodes.find((n: any) => n.id === dialogueState.autoAdvanceNodeId);
          if (!nextNode) {
            get().endDialogue();
            return;
          }

          for (const effect of nextNode.onEnterEffects || []) {
            get().applyDialogueEffect(effect);
          }

          const checkCondition = get().checkDialogueCondition;
          const availableChoices = dataAccess.getAvailableChoices(nextNode, checkCondition);

          set({
            dialogueState: {
              ...dialogueState,
              currentNodeId: nextNode.id,
              text: nextNode.text,
              speaker: nextNode.speaker,
              npcExpression: nextNode.expression,
              choices: availableChoices.map((c: any) => ({
                text: c.text,
                nextNodeId: c.nextNodeId,
                effects: c.effects,
                tags: c.tags,
                hint: c.hint,
              })),
              autoAdvanceNodeId: nextNode.nextNodeId,
              history: [...dialogueState.history, dialogueState.currentNodeId],
            },
          });
        },

        endDialogue: () => {
          const { dialogueState, dialogueHistory } = get();

          if (dialogueState) {
            const entry = `${dialogueState.npcId}:${dialogueState.treeId}:${Date.now()}`;
            set({
              dialogueHistory: [...dialogueHistory.slice(-99), entry],
            });
          }

          set({
            dialogueState: null,
            phase: 'playing',
          });
        },

        setDialogueFlag: (flag: string, value: boolean) => {
          const { dialogueState } = get();
          if (!dialogueState) return;

          set({
            dialogueState: {
              ...dialogueState,
              conversationFlags: {
                ...dialogueState.conversationFlags,
                [flag]: value,
              },
            },
          });
        },

        checkDialogueCondition: (condition: any): boolean => {
          const state = get();
          const {
            playerStats,
            talkedNPCIds,
            activeQuests,
            completedQuestIds,
            inventory,
            time,
            dialogueState,
          } = state;

          switch (condition.type) {
            case 'quest_active':
              return activeQuests.some((q) => q.questId === condition.target);
            case 'quest_complete':
              return completedQuestIds.includes(condition.target || '');
            case 'quest_not_started':
              return (
                !activeQuests.some((q) => q.questId === condition.target) &&
                !completedQuestIds.includes(condition.target || '')
              );
            case 'has_item':
              return inventory.some((i) => i.itemId === condition.target && i.quantity > 0);
            case 'lacks_item':
              return !inventory.some((i) => i.itemId === condition.target && i.quantity > 0);
            case 'reputation_gte':
              return playerStats.reputation >= (condition.value || 0);
            case 'reputation_lte':
              return playerStats.reputation <= (condition.value || 0);
            case 'gold_gte':
              return playerStats.gold >= (condition.value || 0);
            case 'talked_to':
              return talkedNPCIds.includes(condition.target || '');
            case 'not_talked_to':
              return !talkedNPCIds.includes(condition.target || '');
            case 'time_of_day': {
              const hour = time.hour;
              const timeOfDay = condition.stringValue;
              if (timeOfDay === 'morning') return hour >= 6 && hour < 12;
              if (timeOfDay === 'afternoon') return hour >= 12 && hour < 18;
              if (timeOfDay === 'evening') return hour >= 18 && hour < 22;
              if (timeOfDay === 'night') return hour >= 22 || hour < 6;
              return true;
            }
            case 'flag_set':
              return dialogueState?.conversationFlags[condition.target || ''] === true;
            case 'flag_not_set':
              return dialogueState?.conversationFlags[condition.target || ''] !== true;
            case 'first_meeting':
              return dialogueState ? !talkedNPCIds.includes(dialogueState.npcId) : false;
            case 'return_visit':
              return dialogueState ? talkedNPCIds.includes(dialogueState.npcId) : false;
            default:
              return true;
          }
        },

        applyDialogueEffect: (effect: any) => {
          const {
            playerStats,
            updatePlayerStats,
            addNotification,
            addItemById,
            removeItem,
            discoverLocation,
            startQuest,
            setDialogueFlag,
            advanceQuestStage,
            completeQuest,
          } = get();

          switch (effect.type) {
            case 'start_quest':
              if (effect.target) startQuest(effect.target);
              break;
            case 'complete_quest':
              if (effect.target) completeQuest(effect.target);
              break;
            case 'advance_quest':
              if (effect.target) advanceQuestStage(effect.target);
              break;
            case 'give_item':
              if (effect.target) addItemById(effect.target, effect.value || 1);
              break;
            case 'take_item':
              if (effect.target) removeItem(effect.target, effect.value || 1);
              break;
            case 'give_gold':
              if (effect.value) {
                updatePlayerStats({ gold: playerStats.gold + effect.value });
                addNotification('item', `+${effect.value} gold`);
              }
              break;
            case 'take_gold':
              if (effect.value) {
                updatePlayerStats({ gold: Math.max(0, playerStats.gold - effect.value) });
                addNotification('info', `-${effect.value} gold`);
              }
              break;
            case 'change_reputation':
              if (effect.value) {
                updatePlayerStats({ reputation: playerStats.reputation + effect.value });
                if (effect.value > 0) {
                  addNotification('info', 'Reputation increased');
                } else {
                  addNotification('warning', 'Reputation decreased');
                }
              }
              break;
            case 'set_flag':
              if (effect.target) setDialogueFlag(effect.target, true);
              break;
            case 'clear_flag':
              if (effect.target) setDialogueFlag(effect.target, false);
              break;
            case 'unlock_location':
              if (effect.target) discoverLocation(effect.target);
              break;
            case 'trigger_event':
              addNotification('info', `Event: ${effect.target}`);
              break;
            case 'open_shop':
              if (effect.target) {
                set({ dialogueState: null, phase: 'playing' });
                get().openShop(effect.target);
              }
              break;
          }
        },

        getActiveNPC: () => {
          const { dialogueState } = get();
          if (!dialogueState) return undefined;
          return dataAccess.getNPCById(dialogueState.npcId);
        },

        // World
        collectWorldItem: (worldItemId: string) => {
          const { currentLocationId, collectedItemIds, addItemById } = get();

          if (collectedItemIds.includes(worldItemId)) return;

          if (currentLocationId) {
            const locationItems = dataAccess.getWorldItemsForLocation(currentLocationId);
            const worldItem = locationItems.find((item: any) => item.id === worldItemId);

            if (worldItem) {
              set({ collectedItemIds: [...collectedItemIds, worldItemId] });
              addItemById(worldItem.itemId, worldItem.quantity);
              return;
            }
          }

          const { worldItems } = get();
          const worldItem = worldItems[worldItemId];
          if (worldItem) {
            set({ collectedItemIds: [...collectedItemIds, worldItemId] });
            addItemById(worldItem.itemId, worldItem.quantity);
          }
        },

        updateTime: (hours: number) => {
          set((state) => {
            let { hour, dayOfYear, year } = state.time;
            hour += hours;
            while (hour >= 24) {
              hour -= 24;
              dayOfYear++;
            }
            while (dayOfYear > 365) {
              dayOfYear -= 365;
              year++;
            }
            return { time: { hour, dayOfYear, year } };
          });
        },

        // UI
        togglePanel: (panel: PanelType) =>
          set((state) => ({
            activePanel: state.activePanel === panel ? null : panel,
          })),

        openPanel: (panel: PanelType) => set({ activePanel: panel, phase: 'paused' }),

        closePanel: () => set({ activePanel: null, phase: 'playing' }),

        setDialogue: (dialogue: DialogueState | null) =>
          set({ dialogueState: dialogue, phase: dialogue ? 'dialogue' : 'playing' }),

        addNotification: (type: Notification['type'], message: string) => {
          const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          set((state) => ({
            notifications: [
              ...state.notifications.slice(-4),
              { id, type, message, timestamp: Date.now() },
            ],
          }));
          // Use globalThis.setTimeout for platform compatibility
          if (typeof globalThis !== 'undefined' && globalThis.setTimeout) {
            globalThis.setTimeout(() => get().removeNotification(id), 3000);
          }
        },

        removeNotification: (id: string) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),

        // Settings
        updateSettings: (settings) =>
          set((state) => ({
            settings: { ...state.settings, ...settings },
          })),

        // Save
        saveGame: () => {
          set({ lastSaved: Date.now() });
          get().addNotification('info', 'Game saved');
        },

        saveGameBinary: async (saveId: string) => {
          if (!databaseManager) {
            get().addNotification('warning', 'Binary save not available');
            return;
          }
          // Implementation would depend on platform-specific save manager
          get().addNotification('info', 'Binary save not implemented in shared store');
        },

        // Travel
        initWorld: (worldId: string) => {
          const world = dataAccess.getWorldById(worldId);
          if (!world) {
            get().addNotification('warning', `World not found: ${worldId}`);
            return;
          }

          const loaded = dataAccess.loadWorld(world);
          const startingLocationId = loaded.world.startingLocationId;
          const { worldSeed } = get();

          dataAccess.ProceduralLocationManager.initialize(worldSeed);

          const discoveredIds = loaded.world.locations
            .filter((loc: any) => loc.discovered)
            .map((loc: any) => loc.id);

          set({
            currentWorldId: worldId,
            loadedWorld: loaded,
            currentLocationId: startingLocationId,
            discoveredLocationIds: discoveredIds,
          });

          const startingLocation = loaded.getLocation(startingLocationId);
          if (startingLocation?.isProcedural) {
            dataAccess.ProceduralLocationManager.generateLocationContent(startingLocation);
          }

          get().addNotification('info', `Entered ${loaded.world.name}`);

          const { activeQuests, completedQuestIds, startQuest } = get();
          const mainQuestId = 'main_the_inheritance';
          const hasMainQuest =
            activeQuests.some((q) => q.questId === mainQuestId) ||
            completedQuestIds.includes(mainQuestId);

          if (!hasMainQuest) {
            startQuest(mainQuestId);
          }
        },

        travelTo: (locationId: string) => {
          const state = get() as any;
          const {
            loadedWorld,
            currentLocationId,
            worldSeed,
            playerStats,
            addNotification,
            discoverLocation,
            time,
          } = state;

          if (!loadedWorld) {
            addNotification('warning', 'No world loaded');
            return;
          }

          if (!currentLocationId) return;

          if (!loadedWorld.canTravelTo(currentLocationId, locationId)) {
            const targetLoc = loadedWorld.getLocation(locationId);
            addNotification('warning', `Cannot travel to ${targetLoc?.ref.name ?? locationId}`);
            return;
          }

          const targetLocation = loadedWorld.getLocation(locationId);
          if (!targetLocation) return;

          const connections = dataAccess.getConnectionsFrom(loadedWorld.world, currentLocationId);
          const connection = connections.find(
            (c: any) => c.to === locationId || (c.bidirectional && c.from === locationId)
          );

          if (!connection) {
            addNotification('warning', 'No route to destination');
            return;
          }

          if (
            targetLocation.isProcedural &&
            !dataAccess.ProceduralLocationManager.hasGeneratedContent(locationId)
          ) {
            dataAccess.ProceduralLocationManager.generateLocationContent(targetLocation);
          }

          discoverLocation(locationId);

          const travelState = {
            fromLocationId: currentLocationId,
            toLocationId: locationId,
            method: connection.method,
            travelTime: connection.travelTime,
            progress: 0,
            dangerLevel: connection.danger,
            startedAt: Date.now(),
            encounterId: null as string | null,
          };

          const dangerChances: Record<string, number> = {
            safe: 0.05,
            low: 0.15,
            moderate: 0.3,
            high: 0.5,
            extreme: 0.7,
          };
          const baseChance = dangerChances[connection.danger] ?? 0.15;

          const travelSeed = dataAccess.combineSeeds(
            worldSeed,
            dataAccess.hashString(`${currentLocationId}-${locationId}-${Date.now()}`)
          );
          const rng = new dataAccess.SeededRandom(travelSeed);

          dataAccess.initEncounterTemplates(dataAccess.ENCOUNTER_TEMPLATES);

          const context = {
            worldSeed,
            playerLevel: playerStats.level,
            gameHour: time.hour,
            factionTensions: {},
            activeEvents: [],
            contextTags: [connection.method, connection.danger],
          };

          const encounterTriggered = dataAccess.shouldTriggerEncounter(rng, context, baseChance);

          if (encounterTriggered) {
            const encounter = dataAccess.generateRandomEncounter(rng, context);
            if (encounter) {
              travelState.encounterId = encounter.id;
              set({ travelState, phase: 'playing' });
              addNotification('warning', `Encounter on the ${connection.method}!`);
              return;
            }
          }

          set({
            currentLocationId: locationId,
            travelState: null,
          });

          addNotification('info', `Arrived at ${targetLocation.ref.name}`);
        },

        completeTravel: () => {
          const state = get() as any;
          const { travelState, addNotification, loadedWorld } = state;

          if (!travelState) return;

          const targetLocation = loadedWorld?.getLocation(travelState.toLocationId);

          set({
            currentLocationId: travelState.toLocationId,
            travelState: null,
            phase: 'playing',
          });

          if (targetLocation) {
            addNotification('info', `Arrived at ${targetLocation.ref.name}`);
          }
        },

        cancelTravel: () => {
          const { travelState, addNotification } = get();
          if (!travelState) return;

          set({ travelState: null, phase: 'playing' });
          addNotification('info', 'Returned to safety');
        },

        discoverLocation: (locationId: string) => {
          const state = get() as any;
          const { discoveredLocationIds, loadedWorld } = state;

          if (discoveredLocationIds.includes(locationId)) return;

          const location = loadedWorld?.getLocation(locationId);
          if (!location) return;

          set({ discoveredLocationIds: [...discoveredLocationIds, locationId] });
          get().addNotification('info', `Discovered: ${location.ref.name}`);
        },

        getConnectedLocations: () => {
          const state = get() as any;
          const { loadedWorld, currentLocationId } = state;

          if (!loadedWorld || !currentLocationId) return [];

          const connections = loadedWorld.getConnectionsFrom(currentLocationId);
          return connections.map((loc: any) => loc.id);
        },

        // Combat - Simplified for now, full implementation in web app
        startCombat: (encounterId: string) => {
          const encounter = dataAccess.getEncounterById(encounterId);
          if (!encounter) return;

          const { playerStats, playerName, addNotification } = get();

          const playerCombatant = {
            definitionId: 'player',
            name: playerName,
            isPlayer: true,
            health: playerStats.health,
            maxHealth: playerStats.maxHealth,
            actionPoints: 4,
            maxActionPoints: 4,
            position: { q: 0, r: 0 },
            statusEffects: [],
            weaponId: 'revolver',
            ammoInClip: 6,
            isActive: true,
            hasActed: false,
            isDead: false,
          };

          const enemyCombatants: any[] = [];
          let enemyIndex = 0;
          for (const enemySpec of encounter.enemies) {
            const enemyDef = dataAccess.getEnemyById(enemySpec.enemyId);
            if (!enemyDef) continue;

            for (let i = 0; i < enemySpec.count; i++) {
              enemyCombatants.push({
                definitionId: enemyDef.id,
                name: enemySpec.count > 1 ? `${enemyDef.name} ${i + 1}` : enemyDef.name,
                isPlayer: false,
                health: enemyDef.maxHealth,
                maxHealth: enemyDef.maxHealth,
                actionPoints: enemyDef.actionPoints,
                maxActionPoints: enemyDef.actionPoints,
                position: { q: enemyIndex + 1, r: 0 },
                statusEffects: [],
                weaponId: enemyDef.weaponId,
                ammoInClip: 6,
                isActive: false,
                hasActed: false,
                isDead: false,
              });
              enemyIndex++;
            }
          }

          const allCombatants = [playerCombatant, ...enemyCombatants];
          const turnOrder = allCombatants.map((c) => c.definitionId);

          set({
            combatState: {
              encounterId,
              phase: 'player_turn',
              combatants: allCombatants,
              turnOrder,
              currentTurnIndex: 0,
              round: 1,
              log: [],
              startedAt: Date.now(),
              selectedAction: undefined,
              selectedTargetId: undefined,
            },
            phase: 'combat',
          });

          addNotification('warning', `Combat! ${encounter.name}`);
        },

        selectCombatAction: (action: CombatActionType) => {
          const { combatState } = get();
          if (!combatState) return;
          set({ combatState: { ...combatState, selectedAction: action } });
        },

        selectCombatTarget: (targetId: string) => {
          const { combatState } = get();
          if (!combatState) return;
          set({ combatState: { ...combatState, selectedTargetId: targetId } });
        },

        executeCombatAction: () => {
          // Simplified - full implementation in platform-specific code
          const { combatState } = get();
          if (!combatState || !combatState.selectedAction) return;
          // Implementation would go here
        },

        endCombatTurn: () => {
          // Simplified - full implementation in platform-specific code
        },

        attemptFlee: () => {
          const { combatState, addNotification } = get();
          if (!combatState) return;

          const encounter = dataAccess.getEncounterById(combatState.encounterId);
          if (!encounter?.canFlee) {
            addNotification('warning', 'You cannot flee from this battle!');
            return;
          }

          if (Math.random() < 0.5) {
            set({
              combatState: {
                ...combatState,
                phase: 'fled',
                log: [
                  ...combatState.log,
                  {
                    action: {
                      type: 'flee',
                      actorId: 'player',
                      apCost: dataAccess.AP_COSTS.flee || 2,
                      timestamp: Date.now(),
                    },
                    success: true,
                    message: 'You escaped from combat!',
                  },
                ],
              },
            });
          } else {
            addNotification('warning', 'Failed to escape!');
          }
        },

        endCombat: () => {
          const { combatState, gainXP, addGold, addItemById, playerStats } = get();
          if (!combatState) return;

          if (combatState.phase === 'victory') {
            const encounter = dataAccess.getEncounterById(combatState.encounterId);
            if (encounter) {
              if (encounter.rewards.xp > 0) gainXP(encounter.rewards.xp);
              if (encounter.rewards.gold > 0) addGold(encounter.rewards.gold);
              for (const itemReward of encounter.rewards.items) {
                if (Math.random() < itemReward.chance) {
                  addItemById(itemReward.itemId, itemReward.quantity);
                }
              }
            }
          }

          if (combatState.phase === 'defeat' || playerStats.health <= 0) {
            set({ combatState: null, phase: 'game_over' });
          } else {
            set({ combatState: null, phase: 'playing' });
          }
        },

        // Shop
        openShop: (shopId: string) => {
          const shop = dataAccess.getShopById(shopId);
          if (!shop) return;

          set({
            shopState: { shopId, ownerId: shop.ownerId },
            phase: 'paused',
          });
        },

        closeShop: () => {
          set({ shopState: null, phase: 'playing' });
        },

        buyItem: (itemId: string) => {
          const { shopState, playerStats, addItemById, addNotification, updatePlayerStats } = get();
          if (!shopState) return;

          const shop = dataAccess.getShopById(shopState.shopId);
          if (!shop) return;

          const shopItem = shop.inventory.find((i: any) => i.itemId === itemId);
          if (!shopItem) {
            addNotification('warning', 'Item not available');
            return;
          }

          if (shopItem.stock === 0) {
            addNotification('warning', 'Item out of stock');
            return;
          }

          const price = dataAccess.calculateBuyPrice(shop, shopItem);

          if (playerStats.gold < price) {
            addNotification('warning', 'Not enough gold!');
            return;
          }

          updatePlayerStats({ gold: playerStats.gold - price });
          addItemById(itemId, 1);

          if (shopItem.stock > 0) {
            shopItem.stock -= 1;
          }
        },

        sellItem: (inventoryId: string) => {
          const {
            shopState,
            inventory,
            playerStats,
            removeItem,
            addNotification,
            updatePlayerStats,
          } = get();
          if (!shopState) return;

          const shop = dataAccess.getShopById(shopState.shopId);
          if (!shop || !shop.canSell) {
            addNotification('warning', 'Cannot sell items here');
            return;
          }

          const invItem = inventory.find((i) => i.id === inventoryId);
          if (!invItem) return;

          if (!dataAccess.canSellItemToShop(shop, invItem.type)) {
            addNotification('warning', 'Shop does not buy this type of item');
            return;
          }

          const itemDef = dataAccess.getItem(invItem.itemId);
          if (!itemDef || !itemDef.sellable) {
            addNotification('warning', 'Cannot sell this item');
            return;
          }

          const price = dataAccess.calculateSellPrice(shop, itemDef);

          removeItem(invItem.itemId, 1);
          updatePlayerStats({ gold: playerStats.gold + price });

          addNotification('item', `Sold ${invItem.name} for $${price}`);
        },
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => storage),
        partialize: (state): PersistedGameState => ({
          initialized: state.initialized,
          worldSeed: state.worldSeed,
          playerName: state.playerName,
          playerAppearance: state.playerAppearance,
          playerPosition: state.playerPosition,
          playerStats: state.playerStats,
          equipment: state.equipment,
          inventory: state.inventory,
          activeQuests: state.activeQuests,
          completedQuests: state.completedQuests,
          completedQuestIds: state.completedQuestIds,
          collectedItemIds: state.collectedItemIds,
          talkedNPCIds: state.talkedNPCIds,
          settings: state.settings,
          time: state.time,
          saveVersion: state.saveVersion,
          lastSaved: state.lastSaved,
          playTime: state.playTime,
          currentWorldId: state.currentWorldId,
          currentLocationId: state.currentLocationId,
          discoveredLocationIds: state.discoveredLocationIds,
        }),
      }
    )
  );

  return useGameStore;
}

export type GameStore = ReturnType<typeof createGameStore>;
