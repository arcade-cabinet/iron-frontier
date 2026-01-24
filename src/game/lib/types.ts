// Core game types for Cogsworth Station - A Steampunk Airship Dock RPG

export const SAVE_VERSION = 1;

// Position in world space
export interface Position {
  x: number;
  y: number;
  z: number;
}

// Grid position for navigation
export interface GridPos {
  x: number;
  y: number;
}

// Item rarity tiers
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

// Item categories
export type ItemCategory = 'consumable' | 'key' | 'gear' | 'material' | 'currency';

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  stackable: boolean;
  maxStack: number;
  value: number;
  effects?: ItemEffect[];
  icon: string; // emoji or icon key
}

export interface ItemEffect {
  type: 'heal' | 'buff' | 'unlock' | 'damage';
  value: number;
  duration?: number;
}

export interface InventorySlot {
  item: Item;
  quantity: number;
}

// NPC types
export type NPCRole = 'merchant' | 'quest_giver' | 'guard' | 'civilian' | 'mechanic' | 'captain';

export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  position: GridPos;
  dialogue: string[];
  portrait: string;
  faction?: string;
  questIds?: string[];
}

// Quest system
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';

export interface QuestObjective {
  id: string;
  description: string;
  type: 'talk' | 'collect' | 'deliver' | 'explore' | 'defeat';
  target: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards: { item?: Item; xp: number; currency: number };
  prerequisiteQuests?: string[];
  npcId: string;
}

// Sector/Zone types
export type SectorType = 'docks' | 'market' | 'workshop' | 'quarters' | 'bridge' | 'engine';

export interface SectorTile {
  walkable: boolean;
  type: 'floor' | 'wall' | 'prop' | 'hazard' | 'door';
  elevation: number;
  propId?: string;
}

export interface PropDefinition {
  id: string;
  name: string;
  blocking: boolean;
  interactable: boolean;
  category: 'furniture' | 'machine' | 'container' | 'decoration' | 'door';
}

export interface Sector {
  id: string;
  name: string;
  type: SectorType;
  seed: number;
  width: number;
  height: number;
  grid: SectorTile[][];
  npcs: NPC[];
  items: { item: Item; position: GridPos }[];
  connections: { targetSectorId: string; position: GridPos; targetPosition: GridPos }[];
  discovered: boolean;
}

// Player state
export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface PlayerState {
  position: GridPos;
  currentSectorId: string;
  stats: PlayerStats;
  inventory: InventorySlot[];
  equipment: {
    head?: Item;
    body?: Item;
    tool?: Item;
    accessory?: Item;
  };
  currency: number;
  questFlags: Record<string, boolean>;
  completedQuests: string[];
  activeQuests: string[];
  discoveredSectors: string[];
}

// Full game save state
export interface GameSave {
  id: string;
  version: number;
  timestamp: number;
  playerName: string;
  playTime: number;
  player: PlayerState;
  sectors: Record<string, { seed: number; discovered: boolean; collectedItems: string[] }>;
  dialogueCache: Record<string, string>;
  settings: GameSettings;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  haptics: boolean;
  reducedMotion: boolean;
  controlMode: 'tap' | 'joystick';
  lowPowerMode: boolean;
}

// Encounter system
export type EncounterType = 'puzzle' | 'stealth' | 'repair' | 'chase';

export interface Encounter {
  id: string;
  type: EncounterType;
  difficulty: number;
  rewards: { xp: number; items?: Item[] };
  completed: boolean;
}

// UI State
export interface DialogueState {
  active: boolean;
  npcId: string | null;
  currentLine: number;
  lines: string[];
  choices?: { text: string; action: string }[];
}

// Action types for game events
export type GameAction =
  | { type: 'MOVE'; payload: GridPos }
  | { type: 'INTERACT'; payload: { targetId: string } }
  | { type: 'USE_ITEM'; payload: { itemId: string } }
  | { type: 'START_DIALOGUE'; payload: { npcId: string } }
  | { type: 'END_DIALOGUE' }
  | { type: 'ACCEPT_QUEST'; payload: { questId: string } }
  | { type: 'COMPLETE_OBJECTIVE'; payload: { questId: string; objectiveId: string } }
  | { type: 'SECTOR_TRANSITION'; payload: { sectorId: string; position: GridPos } }
  | { type: 'PICK_UP_ITEM'; payload: { itemId: string; position: GridPos } }
  | { type: 'SAVE_GAME' }
  | { type: 'LOAD_GAME'; payload: { saveId: string } };
