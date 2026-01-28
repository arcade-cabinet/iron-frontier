import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PipeLogic, PuzzleGenerator } from '../puzzles/pipe-fitter';
import {
  DEFAULT_AUDIO_STATE,
  DEFAULT_CAMERA_STATE,
  DEFAULT_EQUIPMENT,
  DEFAULT_PLAYER_STATS,
  DEFAULT_SETTINGS,
  DEFAULT_TIME,
  DEFAULT_WEATHER,
  DEFAULT_WORLD_POSITION,
  SAVE_VERSION,
} from './defaults';
import { persistStorage } from './persistStorage';
import type { StorageAdapter } from './StorageAdapter';
import { createSurvivalSlice } from '../systems/survivalStore';
import type { DangerLevel, TravelMethod } from '../data/schemas/world';
import type {
  DialogueCondition,
  DialogueEffect,
  EquipmentSlot,
  GamePhase,
  GameSettings,
  GameState,
  InventoryItem,
  Notification,
  NPC,
  PanelType,
  PlayerStats,
  WorldPosition,
} from './types';

/**
 * Data Access Interface - Platform specific data fetching
 */
export interface DataAccess {
  // Items
  getItem: (itemId: string) => any;
  getStarterInventory: () => any[];

  // NPCs
  getNPCById: (npcId: string) => any;
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
  getEncounterById: (encounterId: string) => any;
  calculateHitChance: (attacker: any, target: any, action: any) => number;
  calculateDamage: (attacker: any, target: any, action: any, isCrit: boolean) => number;
  rollHit: (chance: number) => boolean;
  rollCritical: (attacker: any) => boolean;
  AP_COSTS: Record<string, number>;

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
    initialize: (seed: number) => Promise<any>;
    generateLocationContent: (location: any) => Promise<any>;
    hasGeneratedContent: (locationId: string) => boolean;
  };

  // Seeded random
  SeededRandom: new (
    seed: number
  ) => any;
  hashString: (str: string) => number;
  combineSeeds: (...seeds: number[]) => number;
}

/**
 * Store creation options
 */
export interface CreateGameStoreOptions {
  storageAdapter: StorageAdapter;
  storageKey: string;
  databaseManager?: any; // Platform specific DB manager
  dataAccess: DataAccess;
}

/**
 * Create a game store instance
 */
export function createGameStore({
  storageAdapter,
  storageKey,
  databaseManager,
  dataAccess,
}: CreateGameStoreOptions) {
  // Initialize data
  dataAccess.initEncounterTemplates();

  let travelTimer: ReturnType<typeof setInterval> | null = null;

  const clearTravelTimer = () => {
    if (travelTimer) {
      clearInterval(travelTimer);
      travelTimer = null;
    }
  };

  return create<GameState>()(
    persist(
      (set, get, api) => {
        const grantEncounterRewards = (encounter: any) => {
          if (!encounter?.rewards) return;
          const rewards = encounter.rewards;
          if (rewards.xp) get().gainXP(rewards.xp);
          if (rewards.gold) get().addGold(rewards.gold);
          rewards.items?.forEach((item: { itemId: string; quantity: number; chance: number }) => {
            const roll = Math.random();
            if (roll <= (item.chance ?? 1)) {
              get().addItemById(item.itemId, item.quantity ?? 1);
            }
          });
        };

        return ({
        // Core State
        phase: 'title',
        initialized: false,

        // World State
        worldSeed: Date.now(),
        time: DEFAULT_TIME,
        weather: DEFAULT_WEATHER,
        loadedChunks: {},

        // Travel State
        currentWorldId: null,
        currentLocationId: null,
        discoveredLocationIds: [],
        loadedWorld: null,

        // Player State
        playerId: 'player',
        playerName: 'Stranger',
        playerAppearance: null,
        playerPosition: DEFAULT_WORLD_POSITION,
        playerRotation: 0,
        playerStats: DEFAULT_PLAYER_STATS,
        equipment: DEFAULT_EQUIPMENT,
        inventory: [],
        maxInventorySlots: 20,
        maxCarryWeight: 50,

        // Content State
        activeQuests: [],
        completedQuests: [],
        completedQuestIds: [],
        npcs: {},
        talkedNPCIds: [],
        structures: {},
        worldItems: {},
        collectedItemIds: [],

        // Camera
        camera: DEFAULT_CAMERA_STATE,

        // Audio
        audio: DEFAULT_AUDIO_STATE,

        // UI
        activePanel: null,
        dialogueState: null,
        dialogueHistory: [],
        notifications: [],

        // Combat
        combatState: null,

        // Puzzle
        activePuzzle: null,

        // Shop
        shopState: null,

        // Travel
        travelState: null,

        // Settings
        settings: DEFAULT_SETTINGS,

        // Save metadata
        saveVersion: SAVE_VERSION,
        lastSaved: 0,
        playTime: 0,

        // ====================================================================
        // ACTIONS
        // ====================================================================

        // Game Flow
        initGame: async (playerName: string, seed?: number) => {
          const worldSeed = seed ?? Date.now();

          // Initialize procedural generation
          await dataAccess.ProceduralLocationManager.initialize(worldSeed);

          // Get starting items
          const starterItems = dataAccess.getStarterInventory().map((def) => ({
            id: `starter_${def.id}_${Date.now()}_${Math.random()}`,
            itemId: def.id,
            name: def.name,
            rarity: def.rarity,
            quantity: 1,
            description: def.description,
            usable: def.usable,
            condition: 100,
            weight: def.weight ?? 0.1,
            type: def.category,
            droppable: true,
          }));

          set({
            phase: 'playing', // Skip loading for now or set 'loading' then 'playing'
            initialized: true,
            playerName,
            worldSeed,
            playerStats: {
              ...DEFAULT_PLAYER_STATS,
              level: 1,
              xp: 0,
              health: 100,
            },
            inventory: starterItems,
            // Reset world state
            currentWorldId: 'frontier_territory',
            currentLocationId: 'dusty_springs',
            discoveredLocationIds: ['dusty_springs'],
            time: DEFAULT_TIME,
            // Reset quest state
            activeQuests: [],
            completedQuests: [],
            // Reset notifications
            notifications: [],
          });

          get().initWorld('frontier_territory');
          get().resetSurvival();
          get().startClock();
        },

        setPhase: (phase: GamePhase) => set({ phase }),

        resetGame: () => {
          set({
            phase: 'title',
            initialized: false,
            activeQuests: [],
            inventory: [],
            notifications: [],
            // ... reset other critical state
          });
          get().resetSurvival();
        },

        // Player Actions
        setPlayerPosition: (pos: WorldPosition) => set({ playerPosition: pos }),
        setPlayerRotation: (rotation: number) => set({ playerRotation: rotation }),

        updatePlayerStats: (stats: Partial<PlayerStats>) =>
          set((state) => ({
            playerStats: { ...state.playerStats, ...stats },
          })),

        gainXP: (amount: number) => {
          const state = get();
          const { xp, xpToNext, level } = state.playerStats;
          let newXp = xp + amount;
          let newLevel = level;
          let newXpToNext = xpToNext;

          // Level up logic
          if (newXp >= xpToNext) {
            newXp -= xpToNext;
            newLevel++;
            newXpToNext = Math.floor(xpToNext * 1.5);
            state.addNotification('level', `Level Up! You are now level ${newLevel}`);
            // Heal on level up
            state.heal(state.playerStats.maxHealth);
          } else {
            state.addNotification('xp', `Gained ${amount} XP`);
          }

          set((s) => ({
            playerStats: {
              ...s.playerStats,
              xp: newXp,
              level: newLevel,
              xpToNext: newXpToNext,
            },
          }));
        },

        takeDamage: (amount: number) => {
          set((state) => {
            const currentHealth = state.playerStats.health;
            const newHealth = Math.max(0, currentHealth - amount);

            if (newHealth === 0 && currentHealth > 0) {
              // Player died
              setTimeout(() => get().setPhase('game_over'), 1000);
            }

            return {
              playerStats: { ...state.playerStats, health: newHealth },
            };
          });
        },

        heal: (amount: number) => {
          set((state) => ({
            playerStats: {
              ...state.playerStats,
              health: Math.min(state.playerStats.maxHealth, state.playerStats.health + amount),
            },
          }));
        },

        addGold: (amount: number) => {
          set((state) => ({
            playerStats: {
              ...state.playerStats,
              gold: state.playerStats.gold + amount,
            },
          }));
          get().addNotification('item', `Received ${amount} gold`); // Use 'item' type for loot
        },

        // Inventory Actions
        addItem: (item: InventoryItem) => {
          const currentWeight = get().getTotalWeight();
          const projectedWeight = currentWeight + item.weight * item.quantity;
          const maxWeight = get().maxCarryWeight;
          const state = get();
          const itemDef = dataAccess.getItem(item.itemId);
          const canStack = itemDef?.stackable ?? true;
          const existingItem = canStack
            ? state.inventory.find(
                (i) => i.itemId === item.itemId && i.condition === item.condition
              )
            : undefined;

          if (!existingItem && state.inventory.length >= state.maxInventorySlots) {
            get().addNotification('warning', 'Inventory full.');
            return;
          }

          set((state) => {
            // Check stackability
            if (existingItem) {
              return {
                inventory: state.inventory.map((i) =>
                  i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i
                ),
              };
            }

            return {
              inventory: [...state.inventory, item],
            };
          });
          get().addNotification('item', `Added ${item.quantity}x ${item.name}`);
          if (projectedWeight > maxWeight) {
            get().addNotification('warning', 'Over-encumbered: movement slowed.');
          }
        },

        addItemById: (itemId: string, quantity = 1) => {
          const def = dataAccess.getItem(itemId);
          if (!def) return;

          const maxStack = def.maxStack ?? 99;
          const stackable = def.stackable ?? true;
          const makeItem = (stackQty: number) => ({
            id: `item_${itemId}_${Date.now()}_${Math.random()}`,
            itemId: def.id,
            name: def.name,
            rarity: def.rarity,
            quantity: stackQty,
            description: def.description,
            usable: def.usable,
            condition: 100,
            weight: def.weight ?? 0.1,
            type: def.category,
            droppable: def.droppable ?? true,
          });

          if (!stackable) {
            for (let i = 0; i < quantity; i += 1) {
              get().addItem(makeItem(1));
            }
            return;
          }

          let remaining = quantity;
          while (remaining > 0) {
            const stackQty = Math.min(remaining, maxStack);
            get().addItem(makeItem(stackQty));
            remaining -= stackQty;
          }
        },

        removeItem: (itemId: string, quantity = 1) => {
          set((state) => {
            const itemIndex = state.inventory.findIndex((i) => i.itemId === itemId);
            if (itemIndex === -1) return state;

            const item = state.inventory[itemIndex];
            if (item.quantity > quantity) {
              const newInventory = [...state.inventory];
              newInventory[itemIndex] = { ...item, quantity: item.quantity - quantity };
              return { inventory: newInventory };
            }

            return {
              inventory: state.inventory.filter((_, index) => index !== itemIndex),
            };
          });
        },

        useItem: (id: string) => {
          const state = get();
          const item = state.inventory.find((i) => i.id === id);
          if (!item || !item.usable) return;

          const def = dataAccess.getItem(item.itemId);
          if (!def || !def.effects || def.effects.length === 0) return;

          // Apply effects
          def.effects.forEach((effect) => {
            switch (effect.type) {
              case 'heal':
                state.heal(effect.value);
                break;
              case 'stamina':
                state.updatePlayerStats({
                  stamina: Math.min(
                    state.playerStats.maxStamina,
                    state.playerStats.stamina + effect.value
                  ),
                });
                break;
              case 'damage':
                state.takeDamage(effect.value);
                break;
              case 'buff':
                state.addNotification(
                  'info',
                  `Buff applied: ${effect.buffType ?? 'unknown'}`
                );
                break;
              case 'unlock':
              case 'cure':
              case 'none':
              default:
                break;
            }
          });

          // Consume item
          set((s) => {
            if (item.quantity > 1) {
              return {
                inventory: s.inventory.map((i) =>
                  i.id === id ? { ...i, quantity: i.quantity - 1 } : i
                ),
              };
            }
            return {
              inventory: s.inventory.filter((i) => i.id !== id),
            };
          });

          state.addNotification('info', `Used ${item.name}`);
        },

        dropItem: (id: string) => {
          const state = get();
          const item = state.inventory.find((i) => i.id === id);
          if (!item) return;
          if (!item.droppable) {
            state.addNotification('warning', "You can't drop that.");
            return;
          }

          // Remove from inventory
          set((s) => ({
            inventory: s.inventory.filter((i) => i.id !== id),
          }));

          // Add to world
          const worldItem: any = {
            id: `world_item_${Date.now()}`,
            itemId: item.itemId,
            position: state.playerPosition,
            quantity: item.quantity,
          };

          set((s) => ({
            worldItems: { ...s.worldItems, [worldItem.id]: worldItem },
          }));

          state.addNotification('info', `Dropped ${item.name}`);
        },

        getItemCount: (itemId: string) => {
          return get().inventory.reduce(
            (total, item) => (item.itemId === itemId ? total + item.quantity : total),
            0
          );
        },

        getTotalWeight: () => {
          return get().inventory.reduce((total, item) => total + item.weight * item.quantity, 0);
        },

        // Equipment Actions
        equipItem: (inventoryItemId: string, slot?: EquipmentSlot) => {
          const state = get();
          const item = state.inventory.find((i) => i.id === inventoryItemId);
          if (!item) return;

          const def = dataAccess.getItem(item.itemId);
          let targetSlot: EquipmentSlot | undefined = slot;
          if (!targetSlot) {
            if (def?.weaponStats || item.type === 'weapon') {
              targetSlot = 'weapon';
            } else if (def?.armorStats) {
              switch (def.armorStats.slot) {
                case 'head':
                  targetSlot = 'head';
                  break;
                case 'accessory':
                  targetSlot = 'accessory';
                  break;
                case 'legs':
                  targetSlot = 'body';
                  break;
                case 'body':
                default:
                  targetSlot = 'body';
                  break;
              }
            } else {
              targetSlot = 'accessory';
            }
          }

          if (!targetSlot) return;

          // Unequip current item in slot
          const currentEquippedId = state.equipment[targetSlot];
          if (currentEquippedId) {
            // It remains in inventory, just unlinked
          }

          set((s) => ({
            equipment: { ...s.equipment, [targetSlot]: inventoryItemId },
          }));
        },

        unequipItem: (slot: EquipmentSlot) => {
          set((s) => ({
            equipment: { ...s.equipment, [slot]: null },
          }));
        },

        getEquippedItem: (slot: EquipmentSlot) => {
          const state = get();
          const id = state.equipment[slot];
          if (!id) return null;
          return state.inventory.find((i) => i.id === id) || null;
        },

        getEquipmentBonuses: () => {
          const state = get();
          const bonuses = { damage: 0, defense: 0, accuracy: 0 };

          Object.values(state.equipment).forEach((equippedId) => {
            if (!equippedId) return;
            const item = state.inventory.find((inv) => inv.id === equippedId);
            if (!item) return;
            const def = dataAccess.getItem(item.itemId);
            if (!def) return;

            if (def.weaponStats) {
              bonuses.damage += def.weaponStats.damage;
              bonuses.accuracy += def.weaponStats.accuracy;
            }
            if (def.armorStats) {
              bonuses.defense += def.armorStats.defense;
            }
          });

          return bonuses;
        },

        // Quest Actions
        startQuest: (questId: string) => {
          const def = dataAccess.getQuestById(questId);
          if (!def) return;

          const active = dataAccess.createActiveQuest(questId);
          set((s) => ({
            activeQuests: [...s.activeQuests, active],
          }));
          get().addNotification('quest', `Started: ${def.title}`);
        },

        updateObjective: (questId: string, _objectiveId: string, _progress: number) => {
          const state = get();
          const questDef = dataAccess.getQuestById(questId);
          const activeQuest = state.activeQuests.find((q) => q.questId === questId);
          if (!questDef || !activeQuest) return;

          const currentStage = questDef.stages[activeQuest.currentStageIndex];
          if (!currentStage) return;

          const objective = currentStage.objectives.find(
            (obj: { id: string; count: number }) => obj.id === _objectiveId
          );
          if (!objective) return;

          const wasComplete = dataAccess.isCurrentStageComplete(questDef, activeQuest);
          const nextProgress = Math.min(objective.count, Math.max(0, _progress));
          const updatedQuest = {
            ...activeQuest,
            objectiveProgress: {
              ...activeQuest.objectiveProgress,
              [_objectiveId]: nextProgress,
            },
          };

          set((state) => ({
            activeQuests: state.activeQuests.map((q) =>
              q.questId === questId ? updatedQuest : q
            ),
          }));

          const isComplete = dataAccess.isCurrentStageComplete(questDef, updatedQuest);
          if (!wasComplete && isComplete) {
            get().advanceQuestStage(questId);
          }
        },

        advanceQuestStage: (_questId: string) => {
          const state = get();
          const questDef = dataAccess.getQuestById(_questId);
          const activeQuest = state.activeQuests.find((q) => q.questId === _questId);
          if (!questDef || !activeQuest) return;

          const currentStage = questDef.stages[activeQuest.currentStageIndex];
          if (!currentStage) return;

          // Stage rewards
          if (currentStage.stageRewards.xp) state.gainXP(currentStage.stageRewards.xp);
          if (currentStage.stageRewards.gold) state.addGold(currentStage.stageRewards.gold);
          if (currentStage.stageRewards.items?.length) {
            currentStage.stageRewards.items.forEach((item: { itemId: string; quantity: number }) =>
              state.addItemById(item.itemId, item.quantity)
            );
          }
          if (currentStage.onCompleteText) {
            state.addNotification('quest', currentStage.onCompleteText);
          } else {
            state.addNotification('quest', `Stage complete: ${currentStage.title}`);
          }

          const isLastStage = activeQuest.currentStageIndex >= questDef.stages.length - 1;
          if (isLastStage) {
            get().completeQuest(_questId);
            return;
          }

          const nextStageIndex = activeQuest.currentStageIndex + 1;
          const nextStage = questDef.stages[nextStageIndex];

          set((state) => ({
            activeQuests: state.activeQuests.map((q) =>
              q.questId === _questId
                ? {
                    ...q,
                    currentStageIndex: nextStageIndex,
                    objectiveProgress: {},
                  }
                : q
            ),
          }));

          if (nextStage?.onStartText) {
            state.addNotification('quest', nextStage.onStartText);
          }
        },

        completeQuest: (questId: string) => {
          const state = get();
          const quest = state.activeQuests.find((q) => q.questId === questId);
          if (!quest) return;

          const def = dataAccess.getQuestById(questId);

          set((s) => ({
            activeQuests: s.activeQuests.filter((q) => q.questId !== questId),
            completedQuests: [...s.completedQuests, def],
            completedQuestIds: [...s.completedQuestIds, questId],
          }));

          // Give rewards
          if (def.rewards.xp) state.gainXP(def.rewards.xp);
          if (def.rewards.gold) state.addGold(def.rewards.gold);
          if (def.rewards.items?.length) {
            def.rewards.items.forEach((item: { itemId: string; quantity: number }) =>
              state.addItemById(item.itemId, item.quantity)
            );
          }

          state.addNotification('quest', `Completed: ${def.title}`);
        },

        failQuest: (_questId: string) => {},
        abandonQuest: (_questId: string) => {},

        getActiveQuest: (questId: string) => get().activeQuests.find((q) => q.questId === questId),
        getQuestDefinition: (questId: string) => dataAccess.getQuestById(questId),

        // NPC Actions
        updateNPC: (npcId: string, updates: Partial<NPC>) => {
          set((s) => ({
            npcs: {
              ...s.npcs,
              [npcId]: { ...s.npcs[npcId], ...updates },
            },
          }));
        },

        talkToNPC: (npcId: string) => {
          const npc = get().npcs[npcId];
          if (!npc) return;

          get().startDialogue(npcId);
        },

        markNPCTalked: (npcId: string) => {
          if (!get().talkedNPCIds.includes(npcId)) {
            set((s) => ({ talkedNPCIds: [...s.talkedNPCIds, npcId] }));
          }
        },

        // Dialogue Actions
        startDialogue: (npcId: string, treeId?: string) => {
          const npc = dataAccess.getNPCById(npcId);
          if (!npc) return;

          const tree = treeId
            ? dataAccess.getDialogueTreeById(treeId)
            : dataAccess.getPrimaryDialogueTree(npcId);

          if (!tree) {
            get().addNotification('warning', `${npc.name} has nothing to say.`);
            return;
          }

          // Check conditions for root nodes?
          // For now assume entry point 0
          // const _entry = tree.entryPoints[0];
          const node = dataAccess.getDialogueEntryNode(tree, (c) =>
            get().checkDialogueCondition(c)
          );

          if (!node) return;

          set({
            phase: 'dialogue',
            dialogueState: {
              npcId,
              npcName: npc.name,
              treeId: tree.id,
              currentNodeId: node.id,
              text: node.text,
              speaker: node.speaker || npc.name,
              choices: dataAccess.getAvailableChoices(node, (c) => get().checkDialogueCondition(c)),
              autoAdvanceNodeId: node.nextNodeId || null,
              history: [],
              conversationFlags: {},
              startedAt: Date.now(),
            },
          });
        },

        selectChoice: (choiceIndex: number) => {
          const { dialogueState } = get();
          if (!dialogueState) return;

          const choice = dialogueState.choices[choiceIndex];
          if (!choice) return;

          // Apply effects
          if (choice.effects) {
            choice.effects.forEach((e) => get().applyDialogueEffect(e));
          }

          // Move to next node
          if (choice.nextNodeId) {
            // Find next node in current tree
            // Need tree definition
            const tree = dataAccess.getDialogueTreeById(dialogueState.treeId);
            const nextNode = tree.nodes.find((n: any) => n.id === choice.nextNodeId);

            if (nextNode) {
              set({
                dialogueState: {
                  ...dialogueState,
                  currentNodeId: nextNode.id,
                  text: nextNode.text,
                  speaker: nextNode.speaker || dialogueState.npcName,
                  choices: dataAccess.getAvailableChoices(nextNode, (c) =>
                    get().checkDialogueCondition(c)
                  ),
                  history: [...dialogueState.history, choice.text],
                },
              });
            } else {
              get().endDialogue();
            }
          } else {
            get().endDialogue();
          }
        },

        advanceDialogue: () => {
          const { dialogueState } = get();
          if (dialogueState?.autoAdvanceNodeId) {
            // Similar logic to selectChoice but automatic
          } else {
            get().endDialogue();
          }
        },

        endDialogue: () => {
          set({
            phase: 'playing',
            dialogueState: null,
          });
        },

        setDialogueFlag: (flag: string, value: boolean) => {
          const ds = get().dialogueState;
          if (ds) {
            set({
              dialogueState: {
                ...ds,
                conversationFlags: { ...ds.conversationFlags, [flag]: value },
              },
            });
          }
        },

        checkDialogueCondition: (_condition: DialogueCondition) => {
          // Implement condition checking against game state
          return true;
        },

        applyDialogueEffect: (effect: DialogueEffect) => {
          // Implement effects
          switch (effect.type) {
            case 'give_item':
              if (effect.target) {
                get().addItemById(effect.target, effect.value || 1);
              }
              break;
            case 'start_quest':
              if (effect.target) {
                get().startQuest(effect.target);
              }
              break;
            // ... others
          }
        },

        getActiveNPC: () => {
          const ds = get().dialogueState;
          if (!ds) return undefined;
          return dataAccess.getNPCById(ds.npcId);
        },

        // World Actions
        collectWorldItem: (itemId: string) => {
          const state = get();
          const item = state.worldItems[itemId];
          if (!item) return;

          get().addItemById(item.itemId, item.quantity);

          // Remove from world
          const newItems = { ...state.worldItems };
          delete newItems[itemId];

          set({
            worldItems: newItems,
            collectedItemIds: [...state.collectedItemIds, itemId],
          });
        },

        updateTime: (hours: number) => {
          get().advanceTime(hours);
          const { clockState } = get();
          set((s) => ({
            time: {
              ...s.time,
              hour: clockState.hour,
              dayOfYear: clockState.day,
            },
          }));
        },

        // Audio Actions
        playMusic: (trackId: string) => {
          set((state) => ({
            audio: {
              ...state.audio,
              currentTrack: trackId,
              isPlaying: true,
            },
          }));
        },

        stopMusic: () => {
          set((state) => ({
            audio: {
              ...state.audio,
              isPlaying: false,
            },
          }));
        },

        // UI Actions
        togglePanel: (panel: PanelType) => {
          const state = get();
          if (state.activePanel === panel) {
            state.closePanel();
          } else {
            state.openPanel(panel);
          }
        },

        openPanel: (panel: PanelType) => {
          const state = get();
          // Don't pause if already in a non-playing state that should persist (like combat)
          // But for now, simple implementation:
          set({
            activePanel: panel,
            phase: state.phase === 'playing' ? 'paused' : state.phase,
          });
        },

        closePanel: () => {
          const state = get();
          set({
            activePanel: null,
            phase: state.phase === 'paused' ? 'playing' : state.phase,
          });
        },
        setDialogue: (dialogue: any) => set({ dialogueState: dialogue }),

        addNotification: (type: Notification['type'], message: string) => {
          const id = Math.random().toString(36).substr(2, 9);
          const notification: Notification = {
            id,
            type,
            message,
            timestamp: Date.now(),
          };

          set((s) => ({
            notifications: [notification, ...s.notifications].slice(0, 5),
          }));

          // Auto remove
          setTimeout(() => {
            get().removeNotification(id);
          }, 3000);
        },

        removeNotification: (id: string) => {
          set((s) => ({
            notifications: s.notifications.filter((n) => n.id !== id),
          }));
        },

        // Settings Actions
        updateSettings: (settings: Partial<GameSettings>) => {
          set((s) => ({
            settings: { ...s.settings, ...settings },
          }));
        },

        // Save Actions
        saveGame: () => {
          // Implementation depends on storage adapter
          // Usually handled by persist middleware automatically
          set({ lastSaved: Date.now() });
        },

        saveGameBinary: async (saveId: string) => {
          if (databaseManager) {
            const binary = databaseManager.export();
            await storageAdapter.setItem(`save_${saveId}_bin`, binary);
          }
        },

        // Travel Actions
        initWorld: (worldId: string) => {
          const world = dataAccess.getWorldById(worldId);
          const loadedWorld = world ? dataAccess.loadWorld(world) : null;
          set({
            currentWorldId: worldId,
            loadedWorld,
          });
        },

        travelTo: (locationId: string) => {
          const { currentLocationId, loadedWorld } = get();
          if (!currentLocationId || !loadedWorld) return;

          const connection = dataAccess
            .getConnectionsFrom(loadedWorld.world ?? loadedWorld, currentLocationId)
            .find(
              (conn) =>
                conn.to === locationId || (conn.bidirectional && conn.from === locationId)
            );

          const travelTime = connection?.travelTime ?? 8;
          const dangerLevel: DangerLevel = connection?.danger ?? 'moderate';
          const method: TravelMethod = connection?.method ?? 'trail';
          const startedAt = Date.now();

          clearTravelTimer();

          const encounterPools: Record<DangerLevel, string[]> = {
            safe: [],
            low: ['wolf_pack'],
            moderate: ['roadside_bandits', 'wolf_pack'],
            high: ['copperhead_patrol', 'ivrc_checkpoint'],
            extreme: ['remnant_awakening'],
          };
          const encounterChances: Record<DangerLevel, number> = {
            safe: 0,
            low: 0.15,
            moderate: 0.25,
            high: 0.4,
            extreme: 0.6,
          };
          const pool = encounterPools[dangerLevel] ?? [];
          const encounterRoll = Math.random();
          const encounterId =
            pool.length > 0 && encounterRoll <= (encounterChances[dangerLevel] ?? 0)
              ? pool[Math.floor(Math.random() * pool.length)]
              : null;
          const resolvedEncounterId =
            encounterId && dataAccess.getEncounterById(encounterId) ? encounterId : null;

          // Start travel sequence
          set({
            travelState: {
              fromLocationId: currentLocationId,
              toLocationId: locationId,
              method,
              travelTime,
              progress: 0,
              dangerLevel,
              startedAt,
              encounterId: resolvedEncounterId,
            },
            phase: 'travel',
          });

          if (resolvedEncounterId) {
            return;
          }

          const totalMs = Math.max(2000, travelTime * 1000);
          travelTimer = setInterval(() => {
            const state = get();
            if (!state.travelState) {
              clearTravelTimer();
              return;
            }

            const elapsed = Date.now() - startedAt;
            const progress = Math.min(100, Math.round((elapsed / totalMs) * 100));

            set({
              travelState: {
                ...state.travelState,
                progress,
              },
            });

            if (progress >= 100) {
              clearTravelTimer();
              get().completeTravel();
            }
          }, 250);
        },

        completeTravel: () => {
          const { travelState, activeQuests } = get();
          if (!travelState) return;
          clearTravelTimer();

          const destinationId = travelState.toLocationId;
          const travelHours = travelState.travelTime;

          set({
            currentLocationId: destinationId,
            travelState: null,
            phase: 'playing',
          });
          get().discoverLocation(destinationId);
          get().advanceTime(travelHours);
          get().applyTravelFatigue(travelHours);
          const consumption = get().consumeProvisions(travelHours);
          if (consumption.ranOutOfFood) {
            get().addNotification('warning', 'You ran out of food during the journey.');
          }
          if (consumption.ranOutOfWater) {
            get().addNotification('warning', 'You ran out of water during the journey.');
          }

          // Update Quest Objectives (Visit)
          activeQuests.forEach((quest) => {
            const def = dataAccess.getQuestById(quest.questId);
            if (!def) return;

            const stage = def.stages[quest.currentStageIndex];
            stage.objectives.forEach((obj: { type: string; target?: string; id: string }) => {
              if (obj.type === 'visit' && obj.target === destinationId) {
                get().updateObjective(quest.questId, obj.id, 1);
              }
            });
          });
        },

        cancelTravel: () => {
          clearTravelTimer();
          set({ travelState: null, phase: 'playing' });
        },

        discoverLocation: (locationId: string) => {
          const { discoveredLocationIds } = get();
          if (!discoveredLocationIds.includes(locationId)) {
            set({
              discoveredLocationIds: [...discoveredLocationIds, locationId],
            });
            get().addNotification('info', 'Discovered new location!');
          }
        },

        getConnectedLocations: () => {
          const { loadedWorld, currentLocationId } = get();
          if (!loadedWorld || !currentLocationId) return [];
          const worldRef = (loadedWorld as any).world ?? loadedWorld;
          return dataAccess.getConnectionsFrom(worldRef, currentLocationId).map((c) => c.to);
        },

        // Combat Actions (Placeholder)
        startCombat: (encounterId: string) => {
          const state = get();
          const encounter = dataAccess.getEncounterById(encounterId);
          if (!encounter) {
            state.addNotification('warning', 'Encounter not found.');
            return;
          }

          const equippedWeaponId = state.equipment.weapon
            ? state.inventory.find((item) => item.id === state.equipment.weapon)?.itemId ?? null
            : null;
          const weaponDef = equippedWeaponId ? dataAccess.getItem(equippedWeaponId) : null;
          const playerAccuracy = weaponDef?.weaponStats?.accuracy ?? 75;
          const playerBaseDamage = weaponDef?.weaponStats?.damage ?? 10;
          const playerArmor = Object.values(state.equipment)
            .map((equippedId) =>
              equippedId ? state.inventory.find((item) => item.id === equippedId) : null
            )
            .filter(Boolean)
            .reduce((total, item) => {
              const def = item ? dataAccess.getItem(item.itemId) : null;
              return total + (def?.armorStats?.defense ?? 0);
            }, 0);
          const playerAp = Math.max(4, Math.min(10, Math.round(state.playerStats.stamina / 25)));
          const playerAmmo = weaponDef?.weaponStats?.clipSize ?? 0;

          const combatants: Combatant[] = [
            {
              definitionId: `player_${Date.now()}`,
              name: state.playerName || 'Stranger',
              isPlayer: true,
              health: state.playerStats.health,
              maxHealth: state.playerStats.maxHealth,
              actionPoints: playerAp,
              maxActionPoints: playerAp,
              position: { q: 0, r: 0 },
              statusEffects: [],
              weaponId: equippedWeaponId ?? '',
              ammoInClip: playerAmmo,
              baseDamage: playerBaseDamage,
              armor: playerArmor,
              accuracy: playerAccuracy,
              evasion: 10,
              level: state.playerStats.level ?? 1,
              isActive: true,
              hasActed: false,
              isDead: state.playerStats.health <= 0,
            },
          ];

          encounter.enemies.forEach((enemyGroup) => {
            const enemyDef = dataAccess.getEnemyById(enemyGroup.enemyId);
            if (!enemyDef) return;
            const enemyWeapon = enemyDef.weaponId ? dataAccess.getItem(enemyDef.weaponId) : null;
            const enemyAmmo = enemyWeapon?.weaponStats?.clipSize ?? 0;
            const enemyAccuracy = Math.min(95, Math.max(5, 70 + (enemyDef.accuracyMod ?? 0)));

            for (let i = 0; i < enemyGroup.count; i += 1) {
              const instanceId = `${enemyGroup.enemyId}_${i + 1}_${Date.now()}`;
              combatants.push({
                definitionId: instanceId,
                name: enemyGroup.count > 1 ? `${enemyDef.name} ${i + 1}` : enemyDef.name,
                isPlayer: false,
                health: enemyDef.maxHealth,
                maxHealth: enemyDef.maxHealth,
                actionPoints: enemyDef.actionPoints,
                maxActionPoints: enemyDef.actionPoints,
                position: { q: i + 1, r: 1 },
                statusEffects: [],
                weaponId: enemyDef.weaponId ?? '',
                ammoInClip: enemyAmmo,
                baseDamage: enemyDef.baseDamage,
                armor: enemyDef.armor,
                accuracy: enemyAccuracy,
                evasion: enemyDef.evasion ?? 10,
                level: Math.max(1, encounter.minLevel ?? 1),
                isActive: false,
                hasActed: false,
                isDead: false,
              });
            }
          });

          set({
            phase: 'combat',
            combatState: {
              encounterId,
              phase: 'player_turn',
              combatants,
              turnOrder: combatants.map((c) => c.definitionId),
              currentTurnIndex: 0,
              round: 1,
              log: [],
              startedAt: Date.now(),
            },
          });
        },

        selectCombatAction: (action) => {
          const cs = get().combatState;
          if (cs) set({ combatState: { ...cs, selectedAction: action } });
        },

        selectCombatTarget: (targetId) => {
          const cs = get().combatState;
          if (cs) set({ combatState: { ...cs, selectedTargetId: targetId } });
        },

        executeCombatAction: () => {
          const state = get();
          const { combatState } = state;
          if (!combatState || !combatState.selectedAction) return;

          // const _actorId = combatState.combatants[combatState.currentTurnIndex].definitionId; // combatants array holds state, but definitionId is unique ID for entity?
          // Actually combatant.definitionId might not be unique if multiple same enemies.
          // Combatant interface doesn't have a unique instance ID in the schema I saw?
          // Let's assume index is the source of truth for now.
          const actorIndex = combatState.currentTurnIndex;
          const actor = combatState.combatants[actorIndex];

          // Determine target
          const targetId = combatState.selectedTargetId;
          const targetIndex = combatState.combatants.findIndex((c) => c.definitionId === targetId);
          const target = combatState.combatants[targetIndex];

          const actionType = combatState.selectedAction;
          const apCost = dataAccess.AP_COSTS[actionType];

          // Check AP
          if (actor.actionPoints < apCost) {
            state.addNotification('warning', 'Not enough Action Points!');
            return;
          }

          // Deduct AP
          const newCombatants = [...combatState.combatants];
          newCombatants[actorIndex] = {
            ...actor,
            actionPoints: actor.actionPoints - apCost,
            hasActed: true,
          };

          let resultMessage = '';
          let success = true;
          let damage = 0;
          let isCritical = false;

          // Process Action
          if (actionType === 'attack' || actionType === 'aimed_shot') {
            if (!target) return;

            const hitChance = dataAccess.calculateHitChance(actor, target, { type: actionType });
            const hit = dataAccess.rollHit(hitChance);

            if (hit) {
              isCritical = dataAccess.rollCritical(actor);
              damage = dataAccess.calculateDamage(actor, target, { type: actionType }, isCritical);

              // Apply Damage
              const newHealth = Math.max(0, target.health - damage);
              newCombatants[targetIndex] = {
                ...target,
                health: newHealth,
                isDead: newHealth === 0,
              };

              resultMessage = `${actor.name} hit ${target.name} for ${damage} damage!${isCritical ? ' (Critical!)' : ''}`;

              // Check Death
              if (newHealth === 0) {
                resultMessage += ` ${target.name} was defeated!`;
                if (target.isPlayer) {
                  // Player died
                  setTimeout(() => get().setPhase('game_over'), 1500);
                }
              }
            } else {
              success = false;
              resultMessage = `${actor.name} missed ${target.name}!`;
            }
          } else if (actionType === 'defend') {
            // Add buff? For now just message
            resultMessage = `${actor.name} takes a defensive stance.`;
          } else if (actionType === 'use_item') {
            // Placeholder
            resultMessage = `${actor.name} used an item.`;
          }

          // Update State
          const result: any = {
            action: {
              type: actionType,
              actorId: actor.definitionId,
              targetId,
              apCost,
              timestamp: Date.now(),
            },
            success,
            damage: damage > 0 ? damage : undefined,
            isCritical,
            message: resultMessage,
          };
          const playerAlive = newCombatants.some((c) => c.isPlayer && !c.isDead);
          const enemiesAlive = newCombatants.some((c) => !c.isPlayer && !c.isDead);

          const nextPhase = !playerAlive
            ? 'defeat'
            : !enemiesAlive
              ? 'victory'
              : combatState.phase;

          set({
            combatState: {
              ...combatState,
              combatants: newCombatants,
              log: [...combatState.log, result],
              selectedAction: undefined,
              selectedTargetId: undefined,
              phase: nextPhase as any,
            },
          });

          if (nextPhase === 'victory') {
            const encounter = dataAccess.getEncounterById(combatState.encounterId);
            grantEncounterRewards(encounter);
            return;
          }

          if (nextPhase === 'defeat') {
            setTimeout(() => get().setPhase('game_over'), 1500);
            return;
          }

          // If AI turn, continue acting if possible
          if (!actor.isPlayer && !newCombatants[actorIndex].isDead) {
            // Delay next action for pacing
            setTimeout(() => {
              const currentState = get().combatState;
              if (!currentState) return;
              if (currentState.currentTurnIndex !== actorIndex) return;
              if (currentState.phase !== 'enemy_turn') return;

              const currentActor = currentState.combatants[actorIndex];
              const apNeeded = dataAccess.AP_COSTS.attack ?? 2;
              const playerTarget = currentState.combatants.find(
                (c) => c.isPlayer && !c.isDead
              );

              if (currentActor.actionPoints >= apNeeded && playerTarget) {
                set((s) => ({
                  combatState: {
                    ...s.combatState!,
                    selectedAction: 'attack',
                    selectedTargetId: playerTarget.definitionId,
                  },
                }));
                get().executeCombatAction();
              } else {
                get().endCombatTurn();
              }
            }, 800);
          }
        },

        endCombatTurn: () => {
          const state = get();
          const { combatState } = state;
          if (!combatState) return;

          // Check Victory/Defeat conditions
          const playerAlive = combatState.combatants.some((c) => c.isPlayer && !c.isDead);
          const enemiesAlive = combatState.combatants.some((c) => !c.isPlayer && !c.isDead);

          if (!playerAlive) {
            set({ combatState: { ...combatState, phase: 'defeat' } });
            return;
          }
          if (!enemiesAlive) {
            set({ combatState: { ...combatState, phase: 'victory' } });
            // Grant Rewards
            const encounter = dataAccess.getEncounterById(combatState.encounterId);
            grantEncounterRewards(encounter);
            return;
          }

          // Cycle Turn
          let nextIndex = (combatState.currentTurnIndex + 1) % combatState.combatants.length;
          let round = combatState.round;

          if (nextIndex === 0) round++;

          // Skip dead combatants
          let loopCount = 0;
          while (
            combatState.combatants[nextIndex].isDead &&
            loopCount < combatState.combatants.length
          ) {
            nextIndex = (nextIndex + 1) % combatState.combatants.length;
            if (nextIndex === 0) round++;
            loopCount++;
          }

          // Reset AP for the new active combatant
          const newCombatants = [...combatState.combatants];
          const nextCombatant = newCombatants[nextIndex];
          newCombatants[nextIndex] = {
            ...nextCombatant,
            actionPoints: nextCombatant.maxActionPoints,
            hasActed: false,
          };

          const nextPhase = nextCombatant.isPlayer ? 'player_turn' : 'enemy_turn';

          set({
            combatState: {
              ...combatState,
              currentTurnIndex: nextIndex,
              round,
              phase: nextPhase as any,
              combatants: newCombatants,
            },
          });

          // Trigger AI if Enemy Turn
          if (!nextCombatant.isPlayer) {
            setTimeout(() => {
              // AI Logic: Attack Player
              const playerDef = newCombatants.find((c) => c.isPlayer);
              if (playerDef && !playerDef.isDead) {
                set((s) => ({
                  combatState: {
                    ...s.combatState!,
                    selectedAction: 'attack',
                    selectedTargetId: playerDef.definitionId,
                  },
                }));
                get().executeCombatAction();
              } else {
                get().endCombatTurn();
              }
            }, 1000);
          }
        },

        attemptFlee: () => {
          const state = get();
          const encounter = state.combatState
            ? dataAccess.getEncounterById(state.combatState.encounterId)
            : null;
          if (encounter && !encounter.canFlee) {
            state.addNotification('warning', "You can't escape this fight!");
            return;
          }

          // 50% chance
          if (Math.random() > 0.5) {
            set((s) => ({ combatState: { ...s.combatState!, phase: 'fled' } }));
          } else {
            get().addNotification('warning', 'Failed to escape!');
            get().endCombatTurn();
          }
        },

        endCombat: () => {
          const state = get();
          const combatState = state.combatState;
          const travelState = state.travelState;

          if (
            combatState &&
            travelState?.encounterId &&
            travelState.encounterId === combatState.encounterId
          ) {
            if (combatState.phase === 'victory') {
              set({ combatState: null });
              get().completeTravel();
              return;
            }
            if (combatState.phase === 'fled') {
              set({ combatState: null });
              get().cancelTravel();
              return;
            }
          }

          set({
            phase: 'playing',
            combatState: null,
          });
          get().applyCombatFatigue(1);
        },

        // Puzzle Actions
        startPuzzle: (width: number, height: number) => {
          const puzzle = PuzzleGenerator.generate(width, height);
          set({
            phase: 'puzzle',
            activePuzzle: puzzle,
          });
        },

        updatePuzzle: (newGrid) => {
          const state = get();
          if (!state.activePuzzle) return;

          const newState = {
            ...state.activePuzzle,
            grid: newGrid,
          };

          // Check for solution
          const { solved, newGrid: checkedGrid } = PipeLogic.checkFlow(newState);

          set({
            activePuzzle: {
              ...newState,
              grid: checkedGrid,
              solved,
            },
          });
        },

        closePuzzle: (success: boolean) => {
          const state = get();
          set({
            phase: 'playing',
            activePuzzle: null,
          });

          if (success) {
            state.addNotification('info', 'Systems restored!');
            state.gainXP(50);
            state.addGold(10); // Payment for services
          } else {
            state.addNotification('warning', 'Repair failed.');
          }
        },

        // Shop Actions
        openShop: (shopId: string) => {
          // In a real implementation, we'd load the shop's specific inventory from a persistent source
          // For now, we generate/load it via the ProceduralLocationManager if possible, or just open the UI
          // The UI (ShopPanel) will likely handle fetching the actual items via a selector or hook

          // But we need to track *who* we are trading with for reputation/price modifiers
          const shop = dataAccess.getShopById(shopId);
          set({ shopState: { shopId, ownerId: shop?.ownerId ?? 'unknown' } });
        },

        closeShop: () => set({ shopState: null }),

        buyItem: (itemId: string) => {
          const state = get();
          const { shopState, playerStats } = state;
          if (!shopState) return;

          const shop = dataAccess.getShopById(shopState.shopId);
          if (!shop) return;

          const shopItem = shop.inventory.find((item: any) => item.itemId === itemId);
          if (!shopItem) {
            state.addNotification('warning', "That item isn't available here.");
            return;
          }

          if ((shopItem.minReputation ?? -100) > playerStats.reputation) {
            state.addNotification('warning', 'Your reputation is too low.');
            return;
          }

          if (shopItem.stock === 0) {
            state.addNotification('warning', 'That item is sold out.');
            return;
          }

          const itemDef = dataAccess.getItem(itemId);
          if (!itemDef) return;

          const price = dataAccess.calculateBuyPrice(shop, shopItem);

          if (playerStats.gold < price) {
            state.addNotification('warning', "Can't afford that.");
            return;
          }

          // Transaction
          set((s) => ({
            playerStats: { ...s.playerStats, gold: s.playerStats.gold - price },
          }));

          state.addItemById(itemId, 1);
          state.addNotification('item', `Bought ${itemDef.name} for ${price}g`);

          // Audio
          // state.playSfx('ui_buy'); // If we had this in actions
        },

        sellItem: (inventoryId: string) => {
          const state = get();
          const { shopState, playerStats, inventory } = state;
          if (!shopState) return;

          const shop = dataAccess.getShopById(shopState.shopId);
          if (!shop) return;

          const item = inventory.find((i) => i.id === inventoryId);
          if (!item) return;

          const itemDef = dataAccess.getItem(item.itemId);
          if (!itemDef) return;

          if (!dataAccess.canSellItemToShop(shop, item.type)) {
            state.addNotification('warning', 'This merchant will not buy that.');
            return;
          }

          if (!itemDef.sellable) {
            state.addNotification('warning', "You can't sell that.");
            return;
          }

          const price = dataAccess.calculateSellPrice(shop, itemDef);

          // Transaction
          state.removeItem(item.itemId, 1); // Remove 1 quantity

          set((s) => ({
            playerStats: { ...s.playerStats, gold: s.playerStats.gold + price },
          }));

          state.addNotification('item', `Sold ${item.name} for ${price}g`);
        },

        ...createSurvivalSlice(set, get, api),
      }),
      {
        name: storageKey,
        storage: persistStorage(storageAdapter) as any,
        partialize: (state) =>
          ({
            // Select fields to persist
            initialized: state.initialized,
            worldSeed: state.worldSeed,
            playerName: state.playerName,
            playerStats: state.playerStats,
            inventory: state.inventory,
            equipment: state.equipment,
            activeQuests: state.activeQuests,
            completedQuests: state.completedQuests,
            collectedItemIds: state.collectedItemIds,
            settings: state.settings,
            saveVersion: state.saveVersion,
            lastSaved: state.lastSaved,
            playTime: state.playTime,
            clockState: state.clockState,
            isClockRunning: state.isClockRunning,
            fatigueState: state.fatigueState,
            provisionsState: state.provisionsState,
            campingState: state.campingState,
            currentTerrain: state.currentTerrain,
            // Don't persist large derived data or UI state
          }) as any,
      }
    )
  );
}
