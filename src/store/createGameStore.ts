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
  calculateBuyPrice: (baseValue: number, reputation: number) => number;
  calculateSellPrice: (baseValue: number, reputation: number) => number;
  canSellItemToShop: (item: any, shopType: string) => boolean;

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

  return create<GameState>()(
    persist(
      (set, get) => ({
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
            condition: 100,
            weight: 0.1,
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
          set((state) => {
            // Check stackability
            const existingItem = state.inventory.find(
              (i) => i.itemId === item.itemId && i.condition === item.condition
            );

            // TODO: Check weight limit

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
        },

        addItemById: (itemId: string, quantity = 1) => {
          const def = dataAccess.getItem(itemId);
          if (!def) return;

          const item: InventoryItem = {
            id: `item_${itemId}_${Date.now()}_${Math.random()}`,
            itemId: def.id,
            name: def.name,
            rarity: def.rarity,
            quantity,
            description: def.description,
            usable: def.usable,
            condition: 100,
            weight: 0.1, // Placeholder
            type: def.category,
            droppable: true,
          };

          get().addItem(item);
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
          if (!def || !def.effect) return;

          // Apply effect
          const { effect } = def;
          switch (effect.type) {
            case 'heal':
              state.heal(effect.value);
              break;
            case 'buff':
              // Not implemented
              break;
          }

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

          // Determine slot from item type if not provided
          const targetSlot = slot || (item.type === 'weapon' ? 'weapon' : 'body'); // Simplified logic

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
          return { damage: 0, defense: 0, accuracy: 0 }; // Placeholder
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
          set((state) => ({
            activeQuests: state.activeQuests.map((q) => {
              if (q.questId !== questId) return q;
              // Deep update objective
              // Implementation skipped for brevity, assumes immutable update structure
              return q;
            }),
          }));
        },

        advanceQuestStage: (_questId: string) => {
          // Logic to move to next stage
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
              get().addItemById(effect.target, effect.value || 1);
              break;
            case 'start_quest':
              get().startQuest(effect.target);
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
          set((s) => ({
            time: { ...s.time, hour: (s.time.hour + hours) % 24 },
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
          set({
            currentWorldId: worldId,
            loadedWorld: world,
          });
        },

        travelTo: (locationId: string) => {
          // Start travel sequence
          set({
            travelState: {
              fromLocationId: get().currentLocationId!,
              toLocationId: locationId,
              method: 'walk',
              travelTime: 10,
              progress: 0,
              dangerLevel: 'low',
              startedAt: Date.now(),
              encounterId: null,
            },
            phase: 'loading', // Or travel UI
          });

          // Simulate travel
          setTimeout(() => {
            get().completeTravel();
          }, 2000);
        },

        completeTravel: () => {
          const { travelState, activeQuests } = get();
          if (!travelState) return;

          const destinationId = travelState.toLocationId;

          set({
            currentLocationId: destinationId,
            travelState: null,
            phase: 'playing',
          });
          get().discoverLocation(destinationId);

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

        cancelTravel: () => set({ travelState: null, phase: 'playing' }),

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
          return dataAccess.getConnectionsFrom(loadedWorld, currentLocationId).map((c) => c.to);
        },

        // Combat Actions (Placeholder)
        startCombat: (encounterId: string) => {
          set({
            phase: 'combat',
            combatState: {
              encounterId,
              phase: 'player_turn',
              combatants: [],
              turnOrder: [],
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

          set({
            combatState: {
              ...combatState,
              combatants: newCombatants,
              log: [...combatState.log, result],
              selectedAction: undefined,
              selectedTargetId: undefined,
            },
          });

          // If AI turn, continue acting if possible
          if (!actor.isPlayer && !newCombatants[actorIndex].isDead) {
            // Delay next action for pacing
            setTimeout(() => {
              const currentState = get().combatState;
              // If turn hasn't changed (e.g. combat didn't end), continue AI
              if (currentState && currentState.currentTurnIndex === actorIndex) {
                get().endCombatTurn(); // Simple AI: One action per turn or just end for now
                // TODO: Improved AI loop to use all AP
              }
            }, 1000);
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
            if (encounter?.rewards) {
              if (encounter.rewards.xp) state.gainXP(encounter.rewards.xp);
              if (encounter.rewards.gold) state.addGold(encounter.rewards.gold);
            }
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
          // 50% chance
          if (Math.random() > 0.5) {
            set((s) => ({ combatState: { ...s.combatState!, phase: 'fled' } }));
          } else {
            get().addNotification('warning', 'Failed to escape!');
            get().endCombatTurn();
          }
        },

        endCombat: () => {
          set({
            phase: 'playing',
            combatState: null,
          });
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
          set({ shopState: { shopId, ownerId: 'unknown' } });
        },

        closeShop: () => set({ shopState: null }),

        buyItem: (itemId: string) => {
          const state = get();
          const { shopState, playerStats } = state;
          if (!shopState) return;

          // Resolve price
          const itemDef = dataAccess.getItem(itemId);
          if (!itemDef) return;

          // Calculate price (base * modifier)
          // For now, simple logic using DataAccess
          const price = dataAccess.calculateBuyPrice(itemDef.value, playerStats.reputation);

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

          const item = inventory.find((i) => i.id === inventoryId);
          if (!item) return;

          const itemDef = dataAccess.getItem(item.itemId);
          const price = dataAccess.calculateSellPrice(itemDef.value, playerStats.reputation);

          // Transaction
          state.removeItem(item.itemId, 1); // Remove 1 quantity

          set((s) => ({
            playerStats: { ...s.playerStats, gold: s.playerStats.gold + price },
          }));

          state.addNotification('item', `Sold ${item.name} for ${price}g`);
        },
      }),
      {
        name: storageKey,
        storage: persistStorage(storageAdapter),
        partialize: (state) => ({
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
          // Don't persist large derived data or UI state
        }),
      }
    )
  );
}
