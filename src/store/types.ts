/**
 * Game Store Types - Platform-agnostic type definitions
 *
 * These types define the shape of the game state and are used by both
 * the web and mobile apps.
 */

import type { ActiveQuest, DialogueCondition, DialogueEffect, NPCDefinition, Quest } from '../game/data';
import type { PipePuzzleState } from '../game/puzzles/pipe-fitter';

// ============================================================================
// COMMON TYPES
// ============================================================================

/**
 * Item rarity levels
 */
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * World position in 3D space
 */
export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * Camera state configuration
 */
export interface CameraState {
  focusPoint: { x: number; y: number; z: number };
  distance: number;
  azimuth: number;
  elevation: number;
  minDistance: number;
  maxDistance: number;
  minElevation: number;
  maxElevation: number;
  followTarget?: string;
  followLag: number;
  isInCutscene: boolean;
}

/**
 * Audio state
 */
export interface AudioState {
  currentTrack: string | null;
  isPlaying: boolean;
}

/**
 * Time state in the game world
 */
export interface TimeState {
  hour: number;
  dayOfYear: number;
  year: number;
}

/**
 * Weather state
 */
export type WeatherType = 'clear' | 'cloudy' | 'dusty' | 'stormy';

export interface WeatherState {
  type: WeatherType;
  intensity: number;
  windDirection: number;
  windSpeed: number;
}

/**
 * Character appearance for player and NPCs
 */
export interface CharacterAppearance {
  bodyType: 'slim' | 'average' | 'stocky';
  height: number;
  skinTone: string;
  faceShape: number;
  hasBeard: boolean;
  beardStyle?: 'stubble' | 'full' | 'mustache' | 'goatee';
  hasScar: boolean;
  scarPosition?: 'cheek' | 'eye' | 'chin';
  hatStyle: 'cowboy' | 'bowler' | 'flat_cap' | 'none';
  hatColor: string;
  shirtStyle: 'work' | 'fancy' | 'vest';
  shirtColor: string;
  pantsStyle: 'jeans' | 'chaps' | 'slacks';
  pantsColor: string;
  bootsStyle: 'work' | 'fancy' | 'spurs';
  hasBandana: boolean;
  bandanaColor?: string;
  hasGunbelt: boolean;
  hasPoncho: boolean;
  ponchoColor?: string;
}

// ============================================================================
// INVENTORY TYPES
// ============================================================================

/**
 * An item instance in the player's inventory
 */
export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  rarity: ItemRarity;
  quantity: number;
  description?: string;
  usable?: boolean;
  condition: number;
  weight: number;
  type: string;
  droppable: boolean;
}

/**
 * Equipment slot types
 */
export type EquipmentSlot = 'weapon' | 'offhand' | 'head' | 'body' | 'accessory';

/**
 * Current equipment state
 */
export interface EquipmentState {
  weapon: string | null;
  offhand: string | null;
  head: string | null;
  body: string | null;
  accessory: string | null;
}

// ============================================================================
// PLAYER TYPES
// ============================================================================

/**
 * Player statistics
 */
export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  xp: number;
  xpToNext: number;
  level: number;
  gold: number;
  ivrcScript: number;
  reputation: number;
}

// ============================================================================
// NPC TYPES
// ============================================================================

export type NPCRole =
  | 'sheriff'
  | 'deputy'
  | 'merchant'
  | 'bartender'
  | 'blacksmith'
  | 'doctor'
  | 'banker'
  | 'rancher'
  | 'miner'
  | 'prospector'
  | 'outlaw'
  | 'drifter'
  | 'preacher'
  | 'gambler'
  | 'undertaker';

export interface NPCPersonality {
  aggression: number;
  friendliness: number;
  curiosity: number;
  greed: number;
  honesty: number;
}

/**
 * NPC instance in the game world
 */
export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  appearance: CharacterAppearance;
  personality: NPCPersonality;
  position: WorldPosition;
  rotation: number;
  homeStructureId?: string;
  disposition: number;
  isAlive: boolean;
  questGiver: boolean;
  questIds: string[];
}

// ============================================================================
// STRUCTURE TYPES
// ============================================================================

export type StructureType =
  | 'saloon'
  | 'sheriff_office'
  | 'general_store'
  | 'bank'
  | 'hotel'
  | 'stable'
  | 'water_tower'
  | 'windmill'
  | 'mine_entrance'
  | 'train_station'
  | 'house_small'
  | 'house_large'
  | 'outhouse'
  | 'well'
  | 'fence'
  | 'hitching_post';

export interface Structure {
  id: string;
  type: StructureType;
  position: WorldPosition;
  rotation: number;
  scale: number;
  footprint: { x: number; z: number }[];
  condition: number;
  ownerNpcId?: string;
  status?: 'functional' | 'broken' | 'locked';
}

// ============================================================================
// WORLD ITEM TYPES
// ============================================================================

export interface WorldItem {
  id: string;
  itemId: string;
  position: WorldPosition;
  quantity: number;
}

// ============================================================================
// CHUNK DATA TYPES
// ============================================================================

export interface ChunkCoord {
  cx: number;
  cz: number;
}

export type BiomeType =
  | 'desert'
  | 'grassland'
  | 'badlands'
  | 'riverside'
  | 'town'
  | 'railyard'
  | 'mine';

export interface ChunkData {
  coord: ChunkCoord;
  seed: number;
  generatedAt: number;
  heightmap: Float32Array;
  biomeWeights: Map<BiomeType, Float32Array>;
  structures: Structure[];
  props: any[];
  npcs: NPC[];
  items: WorldItem[];
  overlays: any[];
}

// ============================================================================
// UI TYPES
// ============================================================================

/**
 * Game phases
 */
export type GamePhase =
  | 'title'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'dialogue'
  | 'inventory'
  | 'combat'
  | 'game_over'
  | 'puzzle';

/**
 * Panel types
 */
export type PanelType = 'inventory' | 'quests' | 'settings' | 'menu' | 'character';

/**
 * Notification types
 */
export interface Notification {
  id: string;
  type: 'item' | 'xp' | 'quest' | 'level' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

// ============================================================================
// DIALOGUE TYPES
// ============================================================================

/**
 * Enhanced dialogue state for branching conversations
 */
export interface DialogueState {
  npcId: string;
  npcName: string;
  npcTitle?: string;
  npcPortraitId?: string;
  npcExpression?: string;
  treeId: string;
  currentNodeId: string;
  text: string;
  speaker?: string;
  choices: {
    text: string;
    nextNodeId: string | null;
    effects: DialogueEffect[];
    tags: string[];
    hint?: string;
  }[];
  autoAdvanceNodeId: string | null;
  history: string[];
  conversationFlags: Record<string, boolean>;
  startedAt: number;
}

// ============================================================================
// COMBAT TYPES
// ============================================================================

export type CombatActionType = 'attack' | 'aimed_shot' | 'defend' | 'reload' | 'use_item' | 'flee';

export interface Combatant {
  definitionId: string;
  name: string;
  isPlayer: boolean;
  health: number;
  maxHealth: number;
  actionPoints: number;
  maxActionPoints: number;
  position: { q: number; r: number };
  statusEffects: any[];
  weaponId: string;
  ammoInClip: number;
  isActive: boolean;
  hasActed: boolean;
  isDead: boolean;
}

export interface CombatAction {
  type: CombatActionType;
  actorId: string;
  targetId?: string;
  itemId?: string;
  apCost: number;
  timestamp: number;
}

export interface CombatResult {
  action: CombatAction;
  success: boolean;
  damage?: number;
  isCritical?: boolean;
  wasDodged?: boolean;
  message: string;
  targetHealthRemaining?: number;
}

export type CombatPhase = 'player_turn' | 'enemy_turn' | 'victory' | 'defeat' | 'fled';

export interface CombatState {
  encounterId: string;
  phase: CombatPhase;
  combatants: Combatant[];
  turnOrder: string[];
  currentTurnIndex: number;
  round: number;
  log: CombatResult[];
  startedAt: number;
  selectedAction?: CombatActionType;
  selectedTargetId?: string;
}

// ============================================================================
// TRAVEL TYPES
// ============================================================================

export interface TravelState {
  fromLocationId: string;
  toLocationId: string;
  method: string;
  travelTime: number;
  progress: number;
  dangerLevel: string;
  startedAt: number;
  encounterId: string | null;
}

// ============================================================================
// SETTINGS TYPES
// ============================================================================

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
// GAME STATE
// ============================================================================

/**
 * Complete game state (data only, no actions)
 */
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
  /** Runtime-loaded world data (not persisted) */
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

  // Settings
  settings: GameSettings;

  // Save metadata
  saveVersion: number;
  lastSaved: number;
  playTime: number;
}

/**
 * Game state actions (methods)
 */
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
  updatePuzzle: (newGrid: PipePuzzleState['grid']) => void;
  closePuzzle: (success: boolean) => void;

  // Shop
  openShop: (shopId: string) => void;
  closeShop: () => void;
  buyItem: (itemId: string) => void;
  sellItem: (inventoryId: string) => void;
}

/**
 * Complete game state with data and actions
 */
export type GameState = GameStateData & GameStateActions;

/**
 * Persisted state subset (what gets saved to storage)
 */
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