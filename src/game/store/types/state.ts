import type { ActiveQuest, DialogueCondition, DialogueEffect, NPCDefinition, Quest } from '../../data';
import type { LockLevel, PipePuzzleState } from '../../puzzles/pipe-fitter';
import type { SurvivalSlice } from '../../systems/survivalStore';
import type { AudioState, CameraState, CharacterAppearance, TimeState, WeatherState, WorldPosition } from './common';
import type { CombatActionType, CombatState } from './combat';
import type { DialogueState } from './dialogue';
import type { EquipmentSlot, EquipmentState, InventoryItem } from './inventory';
import type { NPC } from './npc';
import type { PlayerStats } from './player';
import type { GameSettings } from './settings';
import type { StealthState } from './stealth';
import type { TravelState } from './travel';
import type { GamePhase, Notification, PanelType } from './ui';
import type { ChunkData, Structure, WorldItem } from './world';

export interface GameStateData {
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
  loadedWorld: any | null;

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
  maxCarryWeight: number;

  // Quests
  activeQuests: ActiveQuest[];
  completedQuests: Quest[];
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

  // Audio
  audio: AudioState;

  // UI
  activePanel: PanelType | null;
  dialogueState: DialogueState | null;
  dialogueHistory: string[];
  notifications: Notification[];

  // Combat
  combatState: CombatState | null;

  // Puzzle
  activePuzzle: PipePuzzleState | null;

  // Shop
  shopState: { shopId: string; ownerId: string } | null;

  // Travel
  travelState: TravelState | null;

  // Stealth
  stealthState: StealthState;

  // Settings
  settings: GameSettings;

  // Save metadata
  saveVersion: number;
  lastSaved: number;
  playTime: number;
}

export interface GameStateActions {
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

  // Equipment
  equipItem: (inventoryItemId: string, slot?: EquipmentSlot) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  getEquippedItem: (slot: EquipmentSlot) => InventoryItem | null;
  getEquipmentBonuses: () => { damage: number; defense: number; accuracy: number };

  // Quests
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

  // Dialogue
  startDialogue: (npcId: string, treeId?: string) => void;
  selectChoice: (choiceIndex: number) => void;
  advanceDialogue: () => void;
  endDialogue: () => void;
  setDialogueFlag: (flag: string, value: boolean) => void;
  checkDialogueCondition: (condition: DialogueCondition) => boolean;
  applyDialogueEffect: (effect: DialogueEffect) => void;
  getActiveNPC: () => NPCDefinition | undefined;

  // World
  collectWorldItem: (itemId: string) => void;
  updateTime: (hours: number) => void;

  // Audio
  playMusic: (trackId: string) => void;
  stopMusic: () => void;

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
  saveToSlot: (slotId: string) => Promise<void>;
  loadFromSlot: (slotId: string) => Promise<boolean>;
  getSaveSlots: () => Promise<import('../../systems/SaveSystem').SaveSlotMeta[]>;
  hydrateFromSave: (data: Record<string, unknown>) => void;

  // Travel
  initWorld: (worldId: string) => void;
  travelTo: (locationId: string) => void;
  completeTravel: () => void;
  cancelTravel: () => void;
  discoverLocation: (locationId: string) => void;
  getConnectedLocations: () => string[];

  // Combat
  startCombat: (encounterId: string) => void;
  selectCombatAction: (action: CombatActionType) => void;
  selectCombatTarget: (targetId: string) => void;
  executeCombatAction: () => void;
  endCombatTurn: () => void;
  attemptFlee: () => void;
  endCombat: () => void;

  // Puzzles
  startPuzzle: (width: number, height: number) => void;
  startLockpickPuzzle: (targetEntityId: string, targetName: string, lockLevel: LockLevel) => void;
  updatePuzzle: (newGrid: PipePuzzleState['grid']) => void;
  closePuzzle: (success: boolean) => void;
  forceLock: () => void;
  abandonPuzzle: () => void;

  // Shop
  openShop: (shopId: string) => void;
  closeShop: () => void;
  buyItem: (itemId: string) => void;
  sellItem: (inventoryId: string) => void;

  // Stealth
  setCrouching: (crouching: boolean) => void;
  toggleCrouch: () => void;
  updateStealthDetection: (detectionLevel: number, nearestDistance: number) => void;

  // Lifecycle
  destroyStore: () => void;
}

export type GameState = GameStateData & GameStateActions & SurvivalSlice;

export interface PersistedGameState {
  initialized: boolean;
  worldSeed: number;
  playerName: string;
  playerAppearance: CharacterAppearance | null;
  playerPosition: WorldPosition;
  playerStats: PlayerStats;
  equipment: EquipmentState;
  inventory: InventoryItem[];
  activeQuests: ActiveQuest[];
  completedQuests: Quest[];
  completedQuestIds: string[];
  collectedItemIds: string[];
  talkedNPCIds: string[];
  settings: GameSettings;
  time: TimeState;
  saveVersion: number;
  lastSaved: number;
  playTime: number;
  currentWorldId: string | null;
  currentLocationId: string | null;
  discoveredLocationIds: string[];
}
