// Game Store - Modern diorama-based world state
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  CameraState,
  CharacterAppearance,
  ChunkData,
  DEFAULT_CAMERA_STATE,
  NPC,
  Structure,
  TimeState,
  WeatherState,
  WorldItem,
  WorldPosition
} from '../../engine/types';
import { dbManager } from './DatabaseManager';
import { saveGameBinary as persistBinary } from './saveManager';
import { loadWorld, getWorldById, type LoadedWorld, type ResolvedLocation } from '../../data/worlds/index';
import { ProceduralLocationManager } from '../../data/generation/ProceduralLocationManager';
import {
  type DialogueNode,
  type DialogueChoice,
  type DialogueCondition,
  type DialogueEffect,
  getDialogueEntryNode,
  getAvailableChoices,
} from '../../data/schemas/npc';
import {
  getNPCById,
  getDialogueTreeById,
  getPrimaryDialogueTree,
  type NPCDefinition,
} from '../../data/npcs/index';
import { getItem, STARTER_INVENTORY, type BaseItem } from '../../data/items/index';
import type { ItemRarity } from '../../data/schemas/item';
import {
  type Quest,
  type ActiveQuest,
  createActiveQuest,
  isCurrentStageComplete,
  isQuestComplete,
  getCurrentStage,
} from '../../data/schemas/quest';
import { getQuestById, QUESTS_BY_ID } from '../../data/quests/index';
import { getWorldItemsForLocation, type WorldItemSpawn } from '../../data/items/worldItems';
import {
  type CombatState,
  type Combatant,
  type CombatActionType,
  type CombatResult,
  AP_COSTS,
  calculateHitChance,
  calculateDamage,
  rollCritical,
  rollHit,
} from '../../data/schemas/combat';
import { getEnemyById, getEncounterById } from '../../data/enemies/index';
import {
  getShopById,
  calculateBuyPrice,
  calculateSellPrice,
  getAvailableShopItems,
  canSellItemToShop,
  type ShopDefinition,
} from '../../data/shops/index';

// ============================================================================
// TYPES
// ============================================================================

export interface InventoryItem {
  id: string;           // Unique instance ID
  itemId: string;       // Reference to item definition
  name: string;
  rarity: ItemRarity;
  quantity: number;
  description?: string;
  usable?: boolean;
  condition: number;    // 0-100, for weapons/armor durability
  weight: number;       // Weight per unit
  type: string;         // Item type from schema
  droppable: boolean;   // Can be dropped
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  xp: number;
  xpToNext: number;
  level: number;
  gold: number;          // Dollars
  ivrcScript: number;    // Company scrip
  reputation: number;
}

// Equipment slot types
export type EquipmentSlot = 'weapon' | 'offhand' | 'head' | 'body' | 'accessory';

export interface EquipmentState {
  weapon: string | null;      // Inventory item ID
  offhand: string | null;     // Inventory item ID (pistol, knife, etc.)
  head: string | null;        // Inventory item ID (hat, helmet)
  body: string | null;        // Inventory item ID (armor, vest)
  accessory: string | null;   // Inventory item ID (holster, charm, etc.)
}

export interface Notification {
  id: string;
  type: 'item' | 'xp' | 'quest' | 'level' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

/** Legacy dialogue state - kept for simple dialogues */
export interface LegacyDialogueState {
  npcId: string;
  npcName: string;
  text: string;
  choices?: { text: string; action: string }[];
}

/** Enhanced dialogue state for branching conversations */
export interface DialogueState {
  // NPC info
  npcId: string;
  npcName: string;
  npcTitle?: string;
  npcPortraitId?: string;
  npcExpression?: string;

  // Current dialogue
  treeId: string;
  currentNodeId: string;
  text: string;
  speaker?: string;  // For multi-speaker scenes

  // Available choices (filtered by conditions)
  choices: {
    text: string;
    nextNodeId: string | null;
    effects: DialogueEffect[];
    tags: string[];
    hint?: string;
  }[];

  // Auto-advance (for monologues)
  autoAdvanceNodeId: string | null;

  // History for back navigation
  history: string[];

  // Conversation flags (temporary, reset on conversation end)
  conversationFlags: Record<string, boolean>;

  // When dialogue started
  startedAt: number;
}

export type GamePhase = 'title' | 'loading' | 'playing' | 'paused' | 'dialogue' | 'inventory' | 'combat' | 'game_over';
export type PanelType = 'inventory' | 'quests' | 'settings' | 'menu' | 'character';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  haptics: boolean;
  controlMode: 'tap' | 'joystick';
  reducedMotion: boolean;
  showMinimap: boolean;
  lowPowerMode: boolean;
  cameraDistance: number;
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

export interface GameState {
  // Core
  phase: GamePhase;
  initialized: boolean;

  // World
  worldSeed: number;
  time: TimeState;
  weather: WeatherState;
  loadedChunks: Record<string, ChunkData>;

  // Travel System
  currentWorldId: string | null;
  currentLocationId: string | null;
  discoveredLocationIds: string[];
  loadedWorld: LoadedWorld | null;

  // Player
  playerId: string;
  playerName: string;
  playerAppearance: CharacterAppearance | null;
  playerPosition: WorldPosition;
  playerRotation: number;
  playerStats: PlayerStats;
  equipment: EquipmentState;
  inventory: InventoryItem[];
  maxInventorySlots: number;

  // Quests (new stage-based system)
  activeQuests: ActiveQuest[];
  completedQuests: Quest[];  // Full quest data for completed quests
  completedQuestIds: string[];  // Kept for backwards compatibility

  // NPCs
  npcs: Record<string, NPC>;
  talkedNPCIds: string[];

  // Structures
  structures: Record<string, Structure>;

  // World Items
  worldItems: Record<string, WorldItem>;
  collectedItemIds: string[];

  // Camera
  camera: CameraState;

  // UI
  activePanel: PanelType | null;
  dialogueState: DialogueState | null;
  notifications: Notification[];

  // Combat
  combatState: CombatState | null;

  // Shop
  shopState: { shopId: string; ownerId: string } | null;

  // Settings
  settings: GameSettings;

  // Save metadata
  saveVersion: number;
  lastSaved: number;
  playTime: number;

  // ========== ACTIONS ==========

  // Game flow
  initGame: (playerName: string, seed?: number) => void;
  setPhase: (phase: GamePhase) => void;
  resetGame: () => void;

  // Player
  setPlayerPosition: (pos: WorldPosition) => void;
  setPlayerRotation: (rotation: number) => void;
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  gainXP: (amount: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  addGold: (amount: number) => void;

  // Inventory
  addItem: (item: InventoryItem) => void;
  addItemById: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  useItem: (id: string) => void;
  dropItem: (id: string) => void;
  getItemCount: (itemId: string) => number;
  getTotalWeight: () => number;
  maxCarryWeight: number;

  // Equipment
  equipItem: (inventoryItemId: string, slot?: EquipmentSlot) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  getEquippedItem: (slot: EquipmentSlot) => InventoryItem | null;
  getEquipmentBonuses: () => { damage: number; defense: number; accuracy: number };

  // Quests (enhanced stage-based system)
  startQuest: (questId: string) => void;
  updateObjective: (questId: string, objectiveId: string, progress: number) => void;
  advanceQuestStage: (questId: string) => void;
  completeQuest: (questId: string) => void;
  failQuest: (questId: string) => void;
  abandonQuest: (questId: string) => void;
  getActiveQuest: (questId: string) => ActiveQuest | undefined;
  getQuestDefinition: (questId: string) => Quest | undefined;

  // NPCs
  updateNPC: (npcId: string, updates: Partial<NPC>) => void;
  talkToNPC: (npcId: string) => void;
  markNPCTalked: (npcId: string) => void;

  // Dialogue System (Enhanced)
  startDialogue: (npcId: string, treeId?: string) => void;
  selectChoice: (choiceIndex: number) => void;
  advanceDialogue: () => void;
  endDialogue: () => void;
  setDialogueFlag: (flag: string, value: boolean) => void;
  checkDialogueCondition: (condition: DialogueCondition) => boolean;
  applyDialogueEffect: (effect: DialogueEffect) => void;
  getActiveNPC: () => NPCDefinition | undefined;
  dialogueHistory: string[];

  // World
  collectWorldItem: (itemId: string) => void;
  updateTime: (hours: number) => void;

  // UI
  togglePanel: (panel: PanelType) => void;
  openPanel: (panel: PanelType) => void;
  closePanel: () => void;
  setDialogue: (dialogue: DialogueState | null) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;

  // Settings
  updateSettings: (settings: Partial<GameSettings>) => void;

  // Save
  saveGame: () => void;
  saveGameBinary: (saveId: string) => Promise<void>;

  // Travel System
  initWorld: (worldId: string) => void;
  travelTo: (locationId: string) => void;
  discoverLocation: (locationId: string) => void;
  getConnectedLocations: () => string[];

  // Combat System
  startCombat: (encounterId: string) => void;
  selectCombatAction: (action: CombatActionType) => void;
  selectCombatTarget: (targetId: string) => void;
  executeCombatAction: () => void;
  endCombatTurn: () => void;
  attemptFlee: () => void;
  endCombat: () => void;

  // Shop System
  openShop: (shopId: string) => void;
  closeShop: () => void;
  buyItem: (itemId: string) => void;
  sellItem: (inventoryId: string) => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_PLAYER_STATS: PlayerStats = {
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  xp: 0,
  xpToNext: 100,
  level: 1,
  gold: 50,
  ivrcScript: 0,
  reputation: 0,
};

const DEFAULT_EQUIPMENT: EquipmentState = {
  weapon: null,
  offhand: null,
  head: null,
  body: null,
  accessory: null,
};

/**
 * Create an inventory item from an item definition
 */
function createInventoryItem(itemDef: BaseItem, quantity: number = 1): InventoryItem {
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

/**
 * Create starter inventory from item library
 */
function createStarterInventory(): InventoryItem[] {
  const items: InventoryItem[] = [];
  for (const starter of STARTER_INVENTORY) {
    const itemDef = getItem(starter.itemId);
    if (itemDef) {
      items.push(createInventoryItem(itemDef, starter.quantity));
    }
  }
  return items;
}

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  haptics: true,
  controlMode: 'tap',
  reducedMotion: false,
  showMinimap: true,
  lowPowerMode: false,
  cameraDistance: 25,
};

const DEFAULT_TIME: TimeState = {
  hour: 10,
  dayOfYear: 150,
  year: 1887,
};

const DEFAULT_WEATHER: WeatherState = {
  type: 'clear',
  intensity: 0,
  windDirection: 0,
  windSpeed: 5,
};

// ============================================================================
// STORE
// ============================================================================

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // State
      phase: 'title',
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
      playerPosition: { x: 128, y: 0, z: 128 },  // WORLD_CENTER for diorama
      playerRotation: 0,
      playerStats: { ...DEFAULT_PLAYER_STATS },
      equipment: { ...DEFAULT_EQUIPMENT },
      inventory: [],
      maxInventorySlots: 20,
      maxCarryWeight: 50, // 50 lbs default carry capacity
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
      settings: { ...DEFAULT_SETTINGS },
      saveVersion: 2,
      lastSaved: Date.now(),
      playTime: 0,

      // Actions
      initGame: (playerName, seed) => {
        const worldSeed = seed ?? Math.floor(Math.random() * 1000000);
        const starterItems = createStarterInventory();
        set({
          phase: 'playing',
          initialized: true,
          worldSeed,
          playerName,
          playerId: `player_${Date.now()}`,
          playerPosition: { x: 128, y: 0, z: 128 },  // WORLD_CENTER for diorama
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
        const startingWeapon = starterItems.find(item => item.type === 'weapon');
        if (startingWeapon) {
          get().equipItem(startingWeapon.id, 'weapon');
        }

        // Initialize SQLite DB
        dbManager.init().then(() => {
          dbManager.savePlayer(get());
          dbManager.saveInventory(get().inventory);
        });

        get().addNotification('info', `Welcome to the frontier, ${playerName}!`);
      },

      setPhase: (phase) => set({ phase }),

      resetGame: () => set({
        phase: 'title',
        initialized: false,
        playerName: 'Stranger',
        playerAppearance: null,
        playerPosition: { x: 128, y: 0, z: 128 },  // WORLD_CENTER for diorama
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
        // Travel System reset
        currentWorldId: null,
        currentLocationId: null,
        discoveredLocationIds: [],
        loadedWorld: null,
      }),

      setPlayerPosition: (pos) => {
        set({ playerPosition: pos });
        dbManager.savePlayer(get());
      },
      setPlayerRotation: (rotation) => {
        set({ playerRotation: rotation });
        dbManager.savePlayer(get());
      },
      updatePlayerStats: (stats) => {
        set((state) => ({ playerStats: { ...state.playerStats, ...stats } }));
        dbManager.savePlayer(get());
      },

      gainXP: (amount) => {
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

      takeDamage: (amount) => {
        const newHealth = Math.max(0, get().playerStats.health - amount);
        set((state) => ({
          playerStats: { ...state.playerStats, health: newHealth }
        }));
        // Check for death (only outside combat - combat has its own defeat handling)
        if (newHealth <= 0 && get().phase !== 'combat') {
          set({ phase: 'game_over' });
          get().addNotification('warning', 'You have died...');
        }
      },

      heal: (amount) => set((state) => ({
        playerStats: { ...state.playerStats, health: Math.min(state.playerStats.maxHealth, state.playerStats.health + amount) }
      })),

      addGold: (amount) => {
        set((state) => ({ playerStats: { ...state.playerStats, gold: state.playerStats.gold + amount } }));
        if (amount > 0) get().addNotification('item', `+${amount} gold`);
      },

      addItem: (item) => {
        const { inventory, maxInventorySlots, addNotification } = get();
        if (inventory.length >= maxInventorySlots) {
          addNotification('warning', 'Inventory full!');
          return;
        }
        // Check if item can stack
        const itemDef = getItem(item.itemId);
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
            dbManager.saveInventory(get().inventory);
            addNotification('item', `Found: ${item.name} x${item.quantity}`);
            return;
          }
        }
        set({ inventory: [...inventory, item] });
        dbManager.saveInventory(get().inventory);
        addNotification('item', `Found: ${item.name}`);
      },

      addItemById: (itemId, quantity = 1) => {
        const itemDef = getItem(itemId);
        if (!itemDef) {
          console.warn(`[GameStore] Unknown item: ${itemId}`);
          return;
        }
        const newItem = createInventoryItem(itemDef, quantity);
        get().addItem(newItem);
      },

      removeItem: (itemId, quantity = 1) => {
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
        dbManager.saveInventory(get().inventory);
      },

      useItem: (id) => {
        const { inventory, heal, addNotification, updatePlayerStats, playerStats } = get();
        const invItem = inventory.find((i) => i.id === id);
        if (!invItem || !invItem.usable) return;

        // Get the item definition for effects
        const itemDef = getItem(invItem.itemId);
        if (itemDef?.consumableStats) {
          const stats = itemDef.consumableStats;
          // Apply healing
          if (stats.healAmount > 0) {
            heal(stats.healAmount);
          }
          // Apply stamina
          if (stats.staminaAmount > 0) {
            updatePlayerStats({
              stamina: Math.min(playerStats.maxStamina, playerStats.stamina + stats.staminaAmount)
            });
          }
        } else if (itemDef?.effects) {
          // Fallback to basic effects
          for (const effect of itemDef.effects) {
            if (effect.type === 'heal' && effect.value) {
              heal(effect.value);
            }
            if (effect.type === 'stamina' && effect.value) {
              updatePlayerStats({
                stamina: Math.min(playerStats.maxStamina, playerStats.stamina + effect.value)
              });
            }
          }
        }

        // Consume the item
        if (invItem.quantity > 1) {
          set({ inventory: inventory.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i) });
        } else {
          set({ inventory: inventory.filter(i => i.id !== id) });
        }
        dbManager.saveInventory(get().inventory);
        addNotification('info', `Used ${invItem.name}`);
      },

      dropItem: (id) => {
        const { inventory, addNotification } = get();
        const item = inventory.find((i) => i.id === id);
        if (!item) return;
        if (!item.droppable) {
          addNotification('warning', `Cannot drop ${item.name}`);
          return;
        }
        set({ inventory: inventory.filter(i => i.id !== id) });
        dbManager.saveInventory(get().inventory);
        addNotification('info', `Dropped ${item.name}`);
      },

      getItemCount: (itemId) => {
        const { inventory } = get();
        const item = inventory.find((i) => i.itemId === itemId);
        return item?.quantity ?? 0;
      },

      getTotalWeight: () => {
        const { inventory } = get();
        return inventory.reduce((total, item) => total + (item.weight * item.quantity), 0);
      },

      // ========== EQUIPMENT SYSTEM ==========

      equipItem: (inventoryItemId: string, slot?: EquipmentSlot) => {
        const { inventory, equipment, addNotification } = get();

        // Find the item in inventory
        const invItem = inventory.find(i => i.id === inventoryItemId);
        if (!invItem) {
          addNotification('warning', 'Item not found');
          return;
        }

        // Get item definition for type info
        const itemDef = getItem(invItem.itemId);
        if (!itemDef) return;

        // Determine slot based on item type if not specified
        let targetSlot: EquipmentSlot | null = slot || null;
        if (!targetSlot) {
          if (itemDef.type === 'weapon') {
            // Weapons go to weapon slot, or offhand if weapon is occupied
            targetSlot = equipment.weapon ? 'offhand' : 'weapon';
          } else if (itemDef.type === 'armor') {
            // Check armor slot from armorStats
            if (itemDef.armorStats?.slot === 'head') targetSlot = 'head';
            else if (itemDef.armorStats?.slot === 'body') targetSlot = 'body';
            else if (itemDef.armorStats?.slot === 'accessory') targetSlot = 'accessory';
            else targetSlot = 'body'; // Default to body
          }
        }

        if (!targetSlot) {
          addNotification('warning', 'Cannot equip this item');
          return;
        }

        // Unequip current item in slot if any
        if (equipment[targetSlot]) {
          get().unequipItem(targetSlot);
        }

        // Equip the new item
        set((state) => ({
          equipment: { ...state.equipment, [targetSlot!]: inventoryItemId },
        }));

        addNotification('info', `Equipped ${invItem.name}`);
        console.log(`[Equipment] Equipped ${invItem.name} to ${targetSlot}`);
      },

      unequipItem: (slot: EquipmentSlot) => {
        const { equipment, addNotification, inventory } = get();

        const itemId = equipment[slot];
        if (!itemId) {
          return; // Nothing equipped in this slot
        }

        const invItem = inventory.find(i => i.id === itemId);

        set((state) => ({
          equipment: { ...state.equipment, [slot]: null },
        }));

        if (invItem) {
          addNotification('info', `Unequipped ${invItem.name}`);
        }
        console.log(`[Equipment] Unequipped item from ${slot}`);
      },

      getEquippedItem: (slot: EquipmentSlot) => {
        const { equipment, inventory } = get();
        const itemId = equipment[slot];
        if (!itemId) return null;
        return inventory.find(i => i.id === itemId) || null;
      },

      getEquipmentBonuses: () => {
        const { equipment, inventory } = get();
        let damage = 0;
        let defense = 0;
        let accuracy = 0;

        // Check each equipment slot
        for (const slot of Object.keys(equipment) as EquipmentSlot[]) {
          const itemId = equipment[slot];
          if (!itemId) continue;

          const invItem = inventory.find(i => i.id === itemId);
          if (!invItem) continue;

          const itemDef = getItem(invItem.itemId);
          if (!itemDef) continue;

          // Add weapon stats
          if (itemDef.weaponStats) {
            damage += itemDef.weaponStats.damage || 0;
            accuracy += itemDef.weaponStats.accuracy || 0;
          }

          // Add armor stats
          if (itemDef.armorStats) {
            defense += itemDef.armorStats.defense || 0;
          }
        }

        return { damage, defense, accuracy };
      },

      // ========== QUEST SYSTEM (Enhanced Stage-Based) ==========

      startQuest: (questId: string) => {
        const { activeQuests, completedQuestIds, addNotification } = get();

        // Check if already active or completed
        if (activeQuests.some(q => q.questId === questId)) {
          addNotification('warning', 'Quest already active');
          return;
        }
        if (completedQuestIds.includes(questId)) {
          const quest = getQuestById(questId);
          if (!quest?.repeatable) {
            addNotification('warning', 'Quest already completed');
            return;
          }
        }

        // Get quest definition
        const quest = getQuestById(questId);
        if (!quest) {
          console.error(`[GameStore] Quest not found: ${questId}`);
          addNotification('warning', 'Quest not found');
          return;
        }

        // Create active quest instance
        const activeQuest = createActiveQuest(questId);

        // Set time limit if applicable
        if (quest.timeLimitHours) {
          activeQuest.timeRemainingHours = quest.timeLimitHours;
        }

        set((state) => ({
          activeQuests: [...state.activeQuests, activeQuest],
        }));

        // Show stage start text if available
        const firstStage = quest.stages[0];
        if (firstStage?.onStartText) {
          addNotification('quest', firstStage.onStartText);
        } else {
          addNotification('quest', `Quest accepted: ${quest.title}`);
        }

        console.log(`[GameStore] Started quest: ${quest.title}`);
      },

      updateObjective: (questId: string, objectiveId: string, progress: number) => {
        const { activeQuests, addNotification } = get();
        const activeQuest = activeQuests.find(q => q.questId === questId);
        if (!activeQuest) return;

        const quest = getQuestById(questId);
        if (!quest) return;

        const currentStage = quest.stages[activeQuest.currentStageIndex];
        if (!currentStage) return;

        const objective = currentStage.objectives.find(o => o.id === objectiveId);
        if (!objective) return;

        // Update progress
        const newProgress = Math.min(progress, objective.count);
        const wasComplete = (activeQuest.objectiveProgress[objectiveId] ?? 0) >= objective.count;
        const isNowComplete = newProgress >= objective.count;

        set((state) => ({
          activeQuests: state.activeQuests.map(q =>
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

        // Notify if objective just completed
        if (!wasComplete && isNowComplete) {
          addNotification('quest', `Objective complete: ${objective.description}`);
        }

        // Check if stage is now complete
        const updatedActiveQuest = get().activeQuests.find(q => q.questId === questId);
        if (updatedActiveQuest && isCurrentStageComplete(quest, updatedActiveQuest)) {
          addNotification('info', 'Stage objectives complete!');
        }
      },

      advanceQuestStage: (questId: string) => {
        const { activeQuests, addNotification, gainXP, addGold } = get();
        const activeQuest = activeQuests.find(q => q.questId === questId);
        if (!activeQuest) return;

        const quest = getQuestById(questId);
        if (!quest) return;

        const currentStage = quest.stages[activeQuest.currentStageIndex];
        if (!currentStage) return;

        // Verify current stage is complete
        if (!isCurrentStageComplete(quest, activeQuest)) {
          addNotification('warning', 'Stage objectives not complete');
          return;
        }

        // Grant stage rewards
        const rewards = currentStage.stageRewards;
        if (rewards.xp > 0) gainXP(rewards.xp);
        if (rewards.gold > 0) addGold(rewards.gold);

        // Show completion text
        if (currentStage.onCompleteText) {
          addNotification('quest', currentStage.onCompleteText);
        }

        // Check if this was the last stage
        const isLastStage = activeQuest.currentStageIndex === quest.stages.length - 1;

        if (isLastStage) {
          get().completeQuest(questId);
        } else {
          // Advance to next stage
          const nextStageIndex = activeQuest.currentStageIndex + 1;
          const nextStage = quest.stages[nextStageIndex];

          set((state) => ({
            activeQuests: state.activeQuests.map(q =>
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

          console.log(`[GameStore] Advanced to stage: ${nextStage.title}`);
        }
      },

      completeQuest: (questId: string) => {
        const { activeQuests, addNotification, gainXP, addGold } = get();
        const activeQuest = activeQuests.find(q => q.questId === questId);
        if (!activeQuest) return;

        const quest = getQuestById(questId);
        if (!quest) return;

        // Grant final rewards
        const rewards = quest.rewards;
        if (rewards.xp > 0) gainXP(rewards.xp);
        if (rewards.gold > 0) addGold(rewards.gold);

        set((state) => ({
          activeQuests: state.activeQuests.filter(q => q.questId !== questId),
          completedQuests: [...state.completedQuests, quest],
          completedQuestIds: [...state.completedQuestIds, questId],
        }));

        addNotification('quest', `Quest completed: ${quest.title}`);
        console.log(`[GameStore] Completed quest: ${quest.title}`);
      },

      failQuest: (questId: string) => {
        const { addNotification } = get();
        const quest = getQuestById(questId);

        set((state) => ({
          activeQuests: state.activeQuests.map(q =>
            q.questId === questId ? { ...q, status: 'failed' as const } : q
          ),
        }));

        addNotification('warning', `Quest failed: ${quest?.title ?? questId}`);
      },

      abandonQuest: (questId: string) => {
        const { addNotification } = get();
        const quest = getQuestById(questId);

        set((state) => ({
          activeQuests: state.activeQuests.filter(q => q.questId !== questId),
        }));

        addNotification('info', `Quest abandoned: ${quest?.title ?? questId}`);
      },

      getActiveQuest: (questId: string) => {
        return get().activeQuests.find(q => q.questId === questId);
      },

      getQuestDefinition: (questId: string) => {
        return getQuestById(questId);
      },

      updateNPC: (npcId, updates) => {
        set((state) => ({ npcs: { ...state.npcs, [npcId]: { ...state.npcs[npcId], ...updates } } }));
      },

      talkToNPC: (npcId) => {
        // Use the enhanced dialogue system
        get().startDialogue(npcId);
      },

      markNPCTalked: (npcId) => {
        const { talkedNPCIds } = get();
        if (!talkedNPCIds.includes(npcId)) set({ talkedNPCIds: [...talkedNPCIds, npcId] });
      },

      // ========== ENHANCED DIALOGUE SYSTEM ==========

      startDialogue: (npcId: string, treeId?: string) => {
        const npcDef = getNPCById(npcId);
        if (!npcDef) {
          console.warn(`[Dialogue] NPC not found in library: ${npcId}`);
          // Fall back to basic dialogue with engine NPC
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

        // Get the dialogue tree
        const dialogueTreeId = treeId || npcDef.primaryDialogueId;
        if (!dialogueTreeId) {
          console.warn(`[Dialogue] No dialogue tree for NPC: ${npcId}`);
          return;
        }

        const tree = getDialogueTreeById(dialogueTreeId);
        if (!tree) {
          console.warn(`[Dialogue] Dialogue tree not found: ${dialogueTreeId}`);
          return;
        }

        // Get the entry node based on conditions
        const checkCondition = get().checkDialogueCondition;
        const entryNode = getDialogueEntryNode(tree, checkCondition);
        if (!entryNode) {
          console.warn(`[Dialogue] No valid entry node for tree: ${dialogueTreeId}`);
          return;
        }

        // Apply any onEnter effects
        for (const effect of entryNode.onEnterEffects || []) {
          get().applyDialogueEffect(effect);
        }

        // Get available choices filtered by conditions
        const availableChoices = getAvailableChoices(entryNode, checkCondition);

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
            choices: availableChoices.map(c => ({
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

        // Mark NPC as talked to (first meeting detection)
        get().markNPCTalked(npcId);
      },

      selectChoice: (choiceIndex: number) => {
        const { dialogueState } = get();
        if (!dialogueState) return;

        const choice = dialogueState.choices[choiceIndex];
        if (!choice) return;

        // Apply choice effects
        for (const effect of choice.effects) {
          get().applyDialogueEffect(effect);
        }

        // If no next node, end dialogue
        if (!choice.nextNodeId) {
          get().endDialogue();
          return;
        }

        // Navigate to next node
        const tree = getDialogueTreeById(dialogueState.treeId);
        if (!tree) {
          get().endDialogue();
          return;
        }

        const nextNode = tree.nodes.find(n => n.id === choice.nextNodeId);
        if (!nextNode) {
          console.warn(`[Dialogue] Next node not found: ${choice.nextNodeId}`);
          get().endDialogue();
          return;
        }

        // Apply onEnter effects for new node
        for (const effect of nextNode.onEnterEffects || []) {
          get().applyDialogueEffect(effect);
        }

        // Get available choices for new node
        const checkCondition = get().checkDialogueCondition;
        const availableChoices = getAvailableChoices(nextNode, checkCondition);

        set({
          dialogueState: {
            ...dialogueState,
            currentNodeId: nextNode.id,
            text: nextNode.text,
            speaker: nextNode.speaker,
            npcExpression: nextNode.expression,
            choices: availableChoices.map(c => ({
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

        // Navigate to auto-advance node
        const tree = getDialogueTreeById(dialogueState.treeId);
        if (!tree) {
          get().endDialogue();
          return;
        }

        const nextNode = tree.nodes.find(n => n.id === dialogueState.autoAdvanceNodeId);
        if (!nextNode) {
          get().endDialogue();
          return;
        }

        // Apply onEnter effects
        for (const effect of nextNode.onEnterEffects || []) {
          get().applyDialogueEffect(effect);
        }

        const checkCondition = get().checkDialogueCondition;
        const availableChoices = getAvailableChoices(nextNode, checkCondition);

        set({
          dialogueState: {
            ...dialogueState,
            currentNodeId: nextNode.id,
            text: nextNode.text,
            speaker: nextNode.speaker,
            npcExpression: nextNode.expression,
            choices: availableChoices.map(c => ({
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

        // Add to global dialogue history if we had a conversation
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

      checkDialogueCondition: (condition: DialogueCondition): boolean => {
        const state = get();
        const { playerStats, talkedNPCIds, activeQuests, completedQuestIds, inventory, time, dialogueState } = state;

        switch (condition.type) {
          case 'quest_active':
            return activeQuests.some(q => q.questId === condition.target);
          case 'quest_complete':
            return completedQuestIds.includes(condition.target || '');
          case 'quest_not_started':
            return !activeQuests.some(q => q.questId === condition.target) &&
                   !completedQuestIds.includes(condition.target || '');
          case 'has_item':
            return inventory.some(i => i.itemId === condition.target && i.quantity > 0);
          case 'lacks_item':
            return !inventory.some(i => i.itemId === condition.target && i.quantity > 0);
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
          case 'time_of_day':
            const hour = time.hour;
            const timeOfDay = condition.stringValue;
            if (timeOfDay === 'morning') return hour >= 6 && hour < 12;
            if (timeOfDay === 'afternoon') return hour >= 12 && hour < 18;
            if (timeOfDay === 'evening') return hour >= 18 && hour < 22;
            if (timeOfDay === 'night') return hour >= 22 || hour < 6;
            return true;
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

      applyDialogueEffect: (effect: DialogueEffect) => {
        const { playerStats, updatePlayerStats, addNotification, addItemById, removeItem, discoverLocation, startQuest, setDialogueFlag, advanceQuestStage, completeQuest } = get();

        switch (effect.type) {
          case 'start_quest':
            if (effect.target) {
              startQuest(effect.target);
            }
            break;
          case 'complete_quest':
            if (effect.target) {
              completeQuest(effect.target);
            }
            break;
          case 'advance_quest':
            if (effect.target) {
              advanceQuestStage(effect.target);
            }
            break;
          case 'give_item':
            if (effect.target) {
              addItemById(effect.target, effect.value || 1);
            }
            break;
          case 'take_item':
            if (effect.target) {
              removeItem(effect.target, effect.value || 1);
            }
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
                addNotification('info', `Reputation increased`);
              } else {
                addNotification('warning', `Reputation decreased`);
              }
            }
            break;
          case 'set_flag':
            if (effect.target) {
              setDialogueFlag(effect.target, true);
            }
            break;
          case 'clear_flag':
            if (effect.target) {
              setDialogueFlag(effect.target, false);
            }
            break;
          case 'unlock_location':
            if (effect.target) {
              discoverLocation(effect.target);
            }
            break;
          case 'change_npc_state':
            // Future: modify NPC disposition or state
            break;
          case 'trigger_event':
            // Future: trigger world events
            addNotification('info', `Event: ${effect.target}`);
            break;
          case 'open_shop':
            if (effect.target) {
              // Close dialogue and open shop
              set({ dialogueState: null, phase: 'playing' });
              get().openShop(effect.target);
            }
            break;
        }
      },

      getActiveNPC: (): NPCDefinition | undefined => {
        const { dialogueState } = get();
        if (!dialogueState) return undefined;
        return getNPCById(dialogueState.npcId);
      },

      collectWorldItem: (worldItemId) => {
        const { currentLocationId, collectedItemIds, addItemById, addNotification } = get();

        // Check if already collected
        if (collectedItemIds.includes(worldItemId)) return;

        // Look up the world item from location data
        if (currentLocationId) {
          const locationItems = getWorldItemsForLocation(currentLocationId);
          const worldItem = locationItems.find(item => item.id === worldItemId);

          if (worldItem) {
            // Mark as collected
            set({ collectedItemIds: [...collectedItemIds, worldItemId] });
            // Add item to inventory
            addItemById(worldItem.itemId, worldItem.quantity);
            return;
          }
        }

        // Fallback to checking worldItems state (for backwards compatibility)
        const { worldItems } = get();
        const worldItem = worldItems[worldItemId];
        if (worldItem) {
          set({ collectedItemIds: [...collectedItemIds, worldItemId] });
          addItemById(worldItem.itemId, worldItem.quantity);
        }
      },

      updateTime: (hours) => {
        set((state) => {
          let { hour, dayOfYear, year } = state.time;
          hour += hours;
          while (hour >= 24) { hour -= 24; dayOfYear++; }
          while (dayOfYear > 365) { dayOfYear -= 365; year++; }
          return { time: { hour, dayOfYear, year } };
        });
      },

      togglePanel: (panel) => set((state) => ({ activePanel: state.activePanel === panel ? null : panel })),
      openPanel: (panel) => set({ activePanel: panel, phase: 'paused' }),
      closePanel: () => set({ activePanel: null, phase: 'playing' }),
      setDialogue: (dialogue) => set({ dialogueState: dialogue, phase: dialogue ? 'dialogue' : 'playing' }),

      addNotification: (type, message) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          notifications: [...state.notifications.slice(-4), { id, type, message, timestamp: Date.now() }],
        }));
        setTimeout(() => get().removeNotification(id), 3000);
      },

      removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
      updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
      saveGame: () => {
        set({ lastSaved: Date.now() });
        get().addNotification('info', 'Game saved');
      },
      saveGameBinary: async (saveId: string) => {
        const success = await persistBinary(saveId);
        if (success) {
          get().addNotification('info', 'Binary save successful');
        } else {
          get().addNotification('warning', 'Binary save failed');
        }
      },

      // Travel System Actions
      initWorld: (worldId: string) => {
        const world = getWorldById(worldId);
        if (!world) {
          console.error(`[GameStore] World not found: ${worldId}`);
          get().addNotification('warning', `World not found: ${worldId}`);
          return;
        }

        const loaded = loadWorld(world);
        const startingLocationId = loaded.world.startingLocationId;
        const { worldSeed } = get();

        // Initialize the procedural content manager with world seed
        ProceduralLocationManager.initialize(worldSeed);

        // Get initially discovered locations from world definition
        const discoveredIds = loaded.world.locations
          .filter(loc => loc.discovered)
          .map(loc => loc.id);

        set({
          currentWorldId: worldId,
          loadedWorld: loaded,
          currentLocationId: startingLocationId,
          discoveredLocationIds: discoveredIds,
        });

        // Generate procedural content for starting location if needed
        const startingLocation = loaded.getLocation(startingLocationId);
        if (startingLocation?.isProcedural) {
          console.log(`[GameStore] Generating procedural content for starting location: ${startingLocationId}`);
          ProceduralLocationManager.generateLocationContent(startingLocation);
        }

        console.log(`[GameStore] World initialized: ${loaded.world.name}, starting at ${startingLocationId}`);
        get().addNotification('info', `Entered ${loaded.world.name}`);

        // Auto-start the main quest if this is a new game (no active quests)
        const { activeQuests, completedQuestIds, startQuest } = get();
        const mainQuestId = 'main_the_inheritance';
        const hasMainQuest = activeQuests.some(q => q.questId === mainQuestId) ||
                            completedQuestIds.includes(mainQuestId);

        if (!hasMainQuest) {
          console.log('[GameStore] Auto-starting main quest: The Inheritance');
          startQuest(mainQuestId);
        }
      },

      travelTo: (locationId: string) => {
        const { loadedWorld, currentLocationId, addNotification, discoverLocation } = get();

        if (!loadedWorld) {
          console.error('[GameStore] No world loaded');
          addNotification('warning', 'No world loaded');
          return;
        }

        if (!currentLocationId) {
          console.error('[GameStore] No current location');
          return;
        }

        // Check if travel is possible
        if (!loadedWorld.canTravelTo(currentLocationId, locationId)) {
          const targetLoc = loadedWorld.getLocation(locationId);
          addNotification('warning', `Cannot travel to ${targetLoc?.ref.name ?? locationId}`);
          return;
        }

        const targetLocation = loadedWorld.getLocation(locationId);
        if (!targetLocation) {
          console.error(`[GameStore] Location not found: ${locationId}`);
          return;
        }

        // Generate procedural content for the destination if needed
        if (targetLocation.isProcedural && !ProceduralLocationManager.hasGeneratedContent(locationId)) {
          console.log(`[GameStore] Generating procedural content for: ${locationId}`);
          ProceduralLocationManager.generateLocationContent(targetLocation);
        }

        // Discover the location if not already discovered
        discoverLocation(locationId);

        // Update current location
        set({ currentLocationId: locationId });

        console.log(`[GameStore] Traveled to ${targetLocation.ref.name}`);
        addNotification('info', `Arrived at ${targetLocation.ref.name}`);
      },

      discoverLocation: (locationId: string) => {
        const { discoveredLocationIds, loadedWorld } = get();

        if (discoveredLocationIds.includes(locationId)) {
          return; // Already discovered
        }

        const location = loadedWorld?.getLocation(locationId);
        if (!location) {
          return;
        }

        set({ discoveredLocationIds: [...discoveredLocationIds, locationId] });
        get().addNotification('info', `Discovered: ${location.ref.name}`);
        console.log(`[GameStore] Discovered location: ${location.ref.name}`);
      },

      getConnectedLocations: () => {
        const { loadedWorld, currentLocationId } = get();

        if (!loadedWorld || !currentLocationId) {
          return [];
        }

        const connections = loadedWorld.getConnectionsFrom(currentLocationId);
        return connections.map(loc => loc.id);
      },

      // ========== COMBAT SYSTEM ==========

      startCombat: (encounterId: string) => {
        const encounter = getEncounterById(encounterId);
        if (!encounter) {
          console.error(`[Combat] Encounter not found: ${encounterId}`);
          return;
        }

        const { playerStats, playerName, addNotification } = get();

        // Create player combatant
        const playerCombatant: Combatant = {
          definitionId: 'player',
          name: playerName,
          isPlayer: true,
          health: playerStats.health,
          maxHealth: playerStats.maxHealth,
          actionPoints: 4,
          maxActionPoints: 4,
          position: { q: 0, r: 0 },
          statusEffects: [],
          weaponId: 'revolver', // TODO: get from equipped weapon
          ammoInClip: 6,
          isActive: true,
          hasActed: false,
          isDead: false,
        };

        // Create enemy combatants
        const enemyCombatants: Combatant[] = [];
        let enemyIndex = 0;
        for (const enemySpec of encounter.enemies) {
          const enemyDef = getEnemyById(enemySpec.enemyId);
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

        // Create turn order (player first)
        const allCombatants = [playerCombatant, ...enemyCombatants];
        const turnOrder = allCombatants.map(c => c.definitionId);

        const combatState: CombatState = {
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
        };

        set({ combatState, phase: 'combat' });
        addNotification('warning', `Combat! ${encounter.name}`);
        console.log(`[Combat] Started: ${encounter.name}`);
      },

      selectCombatAction: (action: CombatActionType) => {
        const { combatState } = get();
        if (!combatState) return;

        set({
          combatState: {
            ...combatState,
            selectedAction: action,
          },
        });
      },

      selectCombatTarget: (targetId: string) => {
        const { combatState } = get();
        if (!combatState) return;

        set({
          combatState: {
            ...combatState,
            selectedTargetId: targetId,
          },
        });
      },

      executeCombatAction: () => {
        const { combatState, playerStats } = get();
        if (!combatState || !combatState.selectedAction) return;

        const player = combatState.combatants.find(c => c.isPlayer);
        if (!player) return;

        const action = combatState.selectedAction;
        const apCost = AP_COSTS[action];

        // Check if player has enough AP
        if (player.actionPoints < apCost) {
          get().addNotification('warning', 'Not enough action points!');
          return;
        }

        let result: CombatResult;

        if (action === 'attack' || action === 'aimed_shot') {
          // Attack action
          const targetId = combatState.selectedTargetId;
          if (!targetId) {
            get().addNotification('warning', 'Select a target first!');
            return;
          }

          const target = combatState.combatants.find(c => c.definitionId === targetId);
          if (!target || target.isDead) {
            get().addNotification('warning', 'Invalid target!');
            return;
          }

          const enemyDef = getEnemyById(target.definitionId);
          const accuracy = 75 + (action === 'aimed_shot' ? 25 : 0);
          const evasion = enemyDef?.evasion ?? 10;
          const hitChance = calculateHitChance(accuracy, evasion, 1, action === 'aimed_shot');

          if (rollHit(hitChance)) {
            const isCritical = rollCritical();
            const baseDamage = 15; // TODO: get from weapon
            const damage = calculateDamage(baseDamage, playerStats.level, enemyDef?.armor ?? 0, isCritical);

            const newHealth = Math.max(0, target.health - damage);
            const isDead = newHealth <= 0;

            result = {
              action: {
                type: action,
                actorId: 'player',
                targetId,
                apCost,
                timestamp: Date.now(),
              },
              success: true,
              damage,
              isCritical,
              wasDodged: false,
              message: isCritical
                ? `Critical hit! You deal ${damage} damage to ${target.name}!`
                : `You hit ${target.name} for ${damage} damage.`,
              targetHealthRemaining: newHealth,
            };

            // Update target health
            const updatedCombatants = combatState.combatants.map(c =>
              c.definitionId === targetId
                ? { ...c, health: newHealth, isDead }
                : c
            );

            // Update player AP
            const updatedPlayer = updatedCombatants.find(c => c.isPlayer);
            if (updatedPlayer) {
              updatedPlayer.actionPoints -= apCost;
            }

            // Check for victory
            const allEnemiesDead = updatedCombatants
              .filter(c => !c.isPlayer)
              .every(c => c.isDead);

            set({
              combatState: {
                ...combatState,
                combatants: updatedCombatants,
                log: [...combatState.log, result],
                selectedAction: undefined,
                selectedTargetId: undefined,
                phase: allEnemiesDead ? 'victory' : 'player_turn',
              },
            });

            if (isDead) {
              get().addNotification('info', `${target.name} defeated!`);
            }
          } else {
            // Missed
            result = {
              action: {
                type: action,
                actorId: 'player',
                targetId,
                apCost,
                timestamp: Date.now(),
              },
              success: false,
              wasDodged: true,
              message: `Your attack missed ${target.name}!`,
            };

            // Update player AP
            const updatedCombatants = combatState.combatants.map(c =>
              c.isPlayer ? { ...c, actionPoints: c.actionPoints - apCost } : c
            );

            set({
              combatState: {
                ...combatState,
                combatants: updatedCombatants,
                log: [...combatState.log, result],
                selectedAction: undefined,
                selectedTargetId: undefined,
              },
            });
          }
        } else if (action === 'defend') {
          // Defend - reduces incoming damage (simplified: just end turn with AP bonus next round)
          result = {
            action: {
              type: 'defend',
              actorId: 'player',
              apCost,
              timestamp: Date.now(),
            },
            success: true,
            message: 'You take a defensive stance.',
          };

          const updatedCombatants = combatState.combatants.map(c =>
            c.isPlayer ? { ...c, actionPoints: c.actionPoints - apCost } : c
          );

          set({
            combatState: {
              ...combatState,
              combatants: updatedCombatants,
              log: [...combatState.log, result],
              selectedAction: undefined,
            },
          });
        }
      },

      endCombatTurn: () => {
        const { combatState } = get();
        if (!combatState) return;

        // Process enemy turns
        const updatedCombatants = [...combatState.combatants];
        const newLogs = [...combatState.log];
        const player = updatedCombatants.find(c => c.isPlayer);

        if (!player) return;

        // Simple enemy AI: each living enemy attacks the player
        for (const enemy of updatedCombatants.filter(c => !c.isPlayer && !c.isDead)) {
          const enemyDef = getEnemyById(enemy.definitionId);
          if (!enemyDef) continue;

          // Reset enemy AP
          enemy.actionPoints = enemy.maxActionPoints;

          // Enemy attacks if they have AP
          while (enemy.actionPoints >= AP_COSTS.attack && !player.isDead) {
            const accuracy = 75 + (enemyDef.accuracyMod ?? 0);
            const playerEvasion = 10; // TODO: get from player stats
            const hitChance = calculateHitChance(accuracy, playerEvasion, 1);

            enemy.actionPoints -= AP_COSTS.attack;

            if (rollHit(hitChance)) {
              const isCritical = rollCritical();
              const damage = calculateDamage(enemyDef.baseDamage, 1, 0, isCritical);
              player.health = Math.max(0, player.health - damage);
              player.isDead = player.health <= 0;

              newLogs.push({
                action: {
                  type: 'attack',
                  actorId: enemy.definitionId,
                  targetId: 'player',
                  apCost: AP_COSTS.attack,
                  timestamp: Date.now(),
                },
                success: true,
                damage,
                isCritical,
                wasDodged: false,
                message: isCritical
                  ? `Critical! ${enemy.name} hits you for ${damage} damage!`
                  : `${enemy.name} hits you for ${damage} damage.`,
                targetHealthRemaining: player.health,
              });

              // Update player stats
              get().updatePlayerStats({ health: player.health });
            } else {
              newLogs.push({
                action: {
                  type: 'attack',
                  actorId: enemy.definitionId,
                  targetId: 'player',
                  apCost: AP_COSTS.attack,
                  timestamp: Date.now(),
                },
                success: false,
                wasDodged: true,
                message: `${enemy.name}'s attack missed!`,
              });
            }
          }
        }

        // Reset player AP for next turn
        player.actionPoints = player.maxActionPoints;

        // Check for defeat
        const isDefeated = player.isDead;

        set({
          combatState: {
            ...combatState,
            combatants: updatedCombatants,
            log: newLogs,
            round: combatState.round + 1,
            phase: isDefeated ? 'defeat' : 'player_turn',
            selectedAction: undefined,
            selectedTargetId: undefined,
          },
        });

        if (isDefeated) {
          get().addNotification('warning', 'You have been defeated!');
        }
      },

      attemptFlee: () => {
        const { combatState } = get();
        if (!combatState) return;

        const encounter = getEncounterById(combatState.encounterId);
        if (!encounter?.canFlee) {
          get().addNotification('warning', 'You cannot flee from this battle!');
          return;
        }

        // 50% chance to flee
        if (Math.random() < 0.5) {
          set({
            combatState: {
              ...combatState,
              phase: 'fled',
              log: [...combatState.log, {
                action: {
                  type: 'flee',
                  actorId: 'player',
                  apCost: AP_COSTS.flee,
                  timestamp: Date.now(),
                },
                success: true,
                message: 'You escaped from combat!',
              }],
            },
          });
        } else {
          // Failed to flee - enemy gets free attacks
          get().addNotification('warning', 'Failed to escape!');
          get().endCombatTurn();
        }
      },

      endCombat: () => {
        const { combatState, gainXP, addGold, addItemById, addNotification } = get();
        if (!combatState) return;

        // Award rewards if victory
        if (combatState.phase === 'victory') {
          const encounter = getEncounterById(combatState.encounterId);
          if (encounter) {
            if (encounter.rewards.xp > 0) {
              gainXP(encounter.rewards.xp);
            }
            if (encounter.rewards.gold > 0) {
              addGold(encounter.rewards.gold);
            }
            for (const itemReward of encounter.rewards.items) {
              if (Math.random() < itemReward.chance) {
                addItemById(itemReward.itemId, itemReward.quantity);
              }
            }
          }
        }

        // Check if player was defeated (health is 0)
        const { playerStats } = get();
        if (combatState.phase === 'defeat' || playerStats.health <= 0) {
          set({ combatState: null, phase: 'game_over' });
          console.log('[Combat] Player defeated - Game Over');
        } else {
          set({ combatState: null, phase: 'playing' });
          console.log('[Combat] Ended');
        }
      },

      // ========== SHOP SYSTEM ==========

      openShop: (shopId: string) => {
        const shop = getShopById(shopId);
        if (!shop) {
          console.error(`[Shop] Shop not found: ${shopId}`);
          return;
        }

        set({
          shopState: { shopId, ownerId: shop.ownerId },
          phase: 'paused', // Pause game while shopping
        });
        console.log(`[Shop] Opened: ${shop.name}`);
      },

      closeShop: () => {
        set({ shopState: null, phase: 'playing' });
        console.log('[Shop] Closed');
      },

      buyItem: (itemId: string) => {
        const { shopState, playerStats, addItemById, addNotification, updatePlayerStats } = get();
        if (!shopState) return;

        const shop = getShopById(shopState.shopId);
        if (!shop) return;

        const shopItem = shop.inventory.find(i => i.itemId === itemId);
        if (!shopItem) {
          addNotification('warning', 'Item not available');
          return;
        }

        // Check stock
        if (shopItem.stock === 0) {
          addNotification('warning', 'Item out of stock');
          return;
        }

        // Calculate price
        const price = calculateBuyPrice(shop, shopItem);

        // Check if player can afford
        if (playerStats.gold < price) {
          addNotification('warning', 'Not enough gold!');
          return;
        }

        // Deduct gold and add item
        updatePlayerStats({ gold: playerStats.gold - price });
        addItemById(itemId, 1);

        // Update stock (if not infinite)
        if (shopItem.stock > 0) {
          shopItem.stock -= 1;
        }

        console.log(`[Shop] Bought: ${itemId} for $${price}`);
      },

      sellItem: (inventoryId: string) => {
        const { shopState, inventory, playerStats, removeItem, addNotification, updatePlayerStats } = get();
        if (!shopState) return;

        const shop = getShopById(shopState.shopId);
        if (!shop || !shop.canSell) {
          addNotification('warning', 'Cannot sell items here');
          return;
        }

        const invItem = inventory.find(i => i.id === inventoryId);
        if (!invItem) return;

        // Check if shop accepts this item type
        if (!canSellItemToShop(shop, invItem.type)) {
          addNotification('warning', 'Shop does not buy this type of item');
          return;
        }

        const itemDef = getItem(invItem.itemId);
        if (!itemDef || !itemDef.sellable) {
          addNotification('warning', 'Cannot sell this item');
          return;
        }

        // Calculate sell price
        const price = calculateSellPrice(shop, itemDef);

        // Remove item and add gold
        removeItem(invItem.itemId, 1);
        updatePlayerStats({ gold: playerStats.gold + price });

        addNotification('item', `Sold ${invItem.name} for $${price}`);
        console.log(`[Shop] Sold: ${invItem.itemId} for $${price}`);
      },
    }),
    {
      name: 'iron-frontier-save',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
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
        // Travel state (note: loadedWorld is reconstructed on load via initWorld)
        currentWorldId: state.currentWorldId,
        currentLocationId: state.currentLocationId,
        discoveredLocationIds: state.discoveredLocationIds,
      }),
    }
  )
);
