// Game Store - Modern diorama-based world state
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  CameraState,
  CharacterAppearance,
  ChunkData,
  DEFAULT_CAMERA_STATE,
  ItemRarity,
  NPC,
  Quest,
  Structure,
  TimeState,
  WeatherState,
  WorldItem,
  WorldPosition
} from '../../engine/types';

// ============================================================================
// TYPES
// ============================================================================

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  rarity: ItemRarity;
  quantity: number;
  description?: string;
  usable?: boolean;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  xp: number;
  xpToNext: number;
  level: number;
  gold: number;
  reputation: number;
}

export interface Notification {
  id: string;
  type: 'item' | 'xp' | 'quest' | 'level' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

export interface DialogueState {
  npcId: string;
  npcName: string;
  text: string;
  choices?: { text: string; action: string }[];
}

export type GamePhase = 'title' | 'loading' | 'playing' | 'paused' | 'dialogue' | 'inventory';
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

  // Player
  playerId: string;
  playerName: string;
  playerAppearance: CharacterAppearance | null;
  playerPosition: WorldPosition;
  playerRotation: number;
  playerStats: PlayerStats;
  inventory: InventoryItem[];
  maxInventorySlots: number;

  // Quests
  activeQuests: Quest[];
  completedQuestIds: string[];

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
  removeItem: (itemId: string, quantity?: number) => void;
  useItem: (id: string) => void;
  dropItem: (id: string) => void;

  // Quests
  acceptQuest: (quest: Quest) => void;
  updateQuestProgress: (questId: string, objectiveId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
  failQuest: (questId: string) => void;

  // NPCs
  updateNPC: (npcId: string, updates: Partial<NPC>) => void;
  talkToNPC: (npcId: string) => void;
  markNPCTalked: (npcId: string) => void;

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
  reputation: 0,
};

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
      playerId: '',
      playerName: 'Stranger',
      playerAppearance: null,
      playerPosition: { x: 32, y: 0, z: 32 },
      playerRotation: 0,
      playerStats: { ...DEFAULT_PLAYER_STATS },
      inventory: [],
      maxInventorySlots: 20,
      activeQuests: [],
      completedQuestIds: [],
      npcs: {},
      talkedNPCIds: [],
      structures: {},
      worldItems: {},
      collectedItemIds: [],
      camera: { ...DEFAULT_CAMERA_STATE },
      activePanel: null,
      dialogueState: null,
      notifications: [],
      settings: { ...DEFAULT_SETTINGS },
      saveVersion: 2,
      lastSaved: Date.now(),
      playTime: 0,

      // Actions
      initGame: (playerName, seed) => {
        const worldSeed = seed ?? Math.floor(Math.random() * 1000000);
        set({
          phase: 'playing',
          initialized: true,
          worldSeed,
          playerName,
          playerId: `player_${Date.now()}`,
          playerPosition: { x: 32, y: 0, z: 32 },
          playerStats: { ...DEFAULT_PLAYER_STATS },
          inventory: [],
          activeQuests: [],
          completedQuestIds: [],
          collectedItemIds: [],
          talkedNPCIds: [],
          notifications: [],
        });
        get().addNotification('info', `Welcome to the frontier, ${playerName}!`);
      },

      setPhase: (phase) => set({ phase }),

      resetGame: () => set({
        phase: 'title',
        initialized: false,
        playerName: 'Stranger',
        playerAppearance: null,
        playerPosition: { x: 32, y: 0, z: 32 },
        playerStats: { ...DEFAULT_PLAYER_STATS },
        inventory: [],
        activeQuests: [],
        completedQuestIds: [],
        collectedItemIds: [],
        talkedNPCIds: [],
        notifications: [],
        activePanel: null,
        dialogueState: null,
        playTime: 0,
      }),

      setPlayerPosition: (pos) => set({ playerPosition: pos }),
      setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
      updatePlayerStats: (stats) => set((state) => ({ playerStats: { ...state.playerStats, ...stats } })),

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

      takeDamage: (amount) => set((state) => ({
        playerStats: { ...state.playerStats, health: Math.max(0, state.playerStats.health - amount) }
      })),

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
        const existing = inventory.find((i) => i.itemId === item.itemId);
        if (existing) {
          set({
            inventory: inventory.map((i) =>
              i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ inventory: [...inventory, item] });
        }
        addNotification('item', `Found: ${item.name}`);
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
      },

      useItem: (id) => {
        const { inventory, heal, addNotification } = get();
        const item = inventory.find((i) => i.id === id);
        if (!item || !item.usable) return;
        if (item.name.toLowerCase().includes('tonic')) heal(25);
        if (item.quantity > 1) {
          set({ inventory: inventory.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i) });
        } else {
          set({ inventory: inventory.filter(i => i.id !== id) });
        }
        addNotification('info', `Used ${item.name}`);
      },

      dropItem: (id) => {
        const { inventory, addNotification } = get();
        const item = inventory.find((i) => i.id === id);
        if (!item) return;
        set({ inventory: inventory.filter(i => i.id !== id) });
        addNotification('info', `Dropped ${item.name}`);
      },

      acceptQuest: (quest) => {
        set((state) => ({ activeQuests: [...state.activeQuests, { ...quest, status: 'active' }] }));
        get().addNotification('quest', `Quest accepted: ${quest.title}`);
      },

      updateQuestProgress: (questId, objectiveId, progress) => {
        set((state) => ({
          activeQuests: state.activeQuests.map((q) =>
            q.id === questId
              ? {
                ...q,
                objectives: q.objectives.map((o) =>
                  o.id === objectiveId ? { ...o, current: progress, completed: progress >= o.required } : o
                ),
              }
              : q
          ),
        }));
      },

      completeQuest: (questId) => {
        const quest = get().activeQuests.find((q) => q.id === questId);
        if (!quest) return;
        set((state) => ({
          activeQuests: state.activeQuests.filter((q) => q.id !== questId),
          completedQuestIds: [...state.completedQuestIds, questId],
        }));
        get().gainXP(quest.rewards.xp);
        get().addGold(quest.rewards.gold);
        get().addNotification('quest', `Quest completed: ${quest.title}`);
      },

      failQuest: (questId) => {
        set((state) => ({
          activeQuests: state.activeQuests.map((q) => q.id === questId ? { ...q, status: 'failed' } : q),
        }));
        get().addNotification('warning', 'Quest failed');
      },

      updateNPC: (npcId, updates) => {
        set((state) => ({ npcs: { ...state.npcs, [npcId]: { ...state.npcs[npcId], ...updates } } }));
      },

      talkToNPC: (npcId) => {
        const npc = get().npcs[npcId];
        if (!npc) return;
        set({
          phase: 'dialogue',
          dialogueState: {
            npcId,
            npcName: npc.name,
            text: `Howdy, stranger. Name's ${npc.name}.`,
            choices: npc.questGiver ? [{ text: 'Work?', action: 'quest' }, { text: 'Bye', action: 'close' }] : [{ text: 'Bye', action: 'close' }],
          },
        });
        get().gainXP(5);
      },

      markNPCTalked: (npcId) => {
        const { talkedNPCIds } = get();
        if (!talkedNPCIds.includes(npcId)) set({ talkedNPCIds: [...talkedNPCIds, npcId] });
      },

      collectWorldItem: (itemId) => {
        const { worldItems, collectedItemIds, addItem } = get();
        const worldItem = worldItems[itemId];
        if (!worldItem || collectedItemIds.includes(itemId)) return;
        set({ collectedItemIds: [...collectedItemIds, itemId] });
        addItem({
          id: `inv_${Date.now()}`,
          itemId: worldItem.itemId,
          name: worldItem.itemId.replace(/_/g, ' '),
          rarity: 'common',
          quantity: worldItem.quantity,
        });
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
      saveGame: () => { set({ lastSaved: Date.now() }); get().addNotification('info', 'Game saved'); },
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
        inventory: state.inventory,
        activeQuests: state.activeQuests,
        completedQuestIds: state.completedQuestIds,
        collectedItemIds: state.collectedItemIds,
        talkedNPCIds: state.talkedNPCIds,
        settings: state.settings,
        time: state.time,
        saveVersion: state.saveVersion,
        lastSaved: state.lastSaved,
        playTime: state.playTime,
      }),
    }
  )
);
