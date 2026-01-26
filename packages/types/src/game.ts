/**
 * Game Types - Core gameplay type definitions
 *
 * This module contains PURE TYPE DEFINITIONS for game state and mechanics.
 */

// ============================================================================
// GAME PHASES
// ============================================================================

export type GamePhase =
  | 'title'
  | 'character_creation'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'inventory'
  | 'dialogue'
  | 'combat'
  | 'shop'
  | 'game_over';

export type SceneType =
  | 'overworld'
  | 'town'
  | 'interior'
  | 'combat'
  | 'cutscene';

// ============================================================================
// COMBAT
// ============================================================================

export type CombatState =
  | 'not_in_combat'
  | 'player_turn'
  | 'enemy_turn'
  | 'victory'
  | 'defeat'
  | 'fled';

export type CombatActionType =
  | 'attack'
  | 'defend'
  | 'skill'
  | 'item'
  | 'flee';

export interface CombatAction {
  type: CombatActionType;
  targetId?: string;
  skillId?: string;
  itemId?: string;
}

export interface CombatParticipant {
  id: string;
  name: string;
  isPlayer: boolean;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  position: number; // Position in formation
}

export interface CombatResult {
  victory: boolean;
  fled: boolean;
  experienceGained: number;
  goldGained: number;
  itemsGained: string[];
  participantResults: {
    id: string;
    damageDealt: number;
    damageTaken: number;
    defeated: boolean;
  }[];
}

// ============================================================================
// DIALOGUE
// ============================================================================

export interface DialogueOption {
  id: string;
  text: string;
  nextNodeId?: string;
  condition?: DialogueCondition;
  effect?: DialogueEffect;
}

export interface DialogueCondition {
  type: 'quest_state' | 'item_owned' | 'reputation' | 'stat';
  target: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: string | number | boolean;
}

export interface DialogueEffect {
  type: 'give_item' | 'take_item' | 'start_quest' | 'complete_quest' | 'change_reputation' | 'trigger_combat';
  target: string;
  value?: string | number;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  options: DialogueOption[];
  isTerminal: boolean;
}

export interface DialogueTree {
  id: string;
  npcId: string;
  rootNodeId: string;
  nodes: Record<string, DialogueNode>;
}

// ============================================================================
// QUESTS
// ============================================================================

export type QuestState =
  | 'not_started'
  | 'active'
  | 'completed'
  | 'failed';

export type QuestObjectiveType =
  | 'kill'
  | 'collect'
  | 'deliver'
  | 'talk_to'
  | 'reach_location'
  | 'survive'
  | 'escort';

export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  description: string;
  target: string;
  targetCount: number;
  currentCount: number;
  optional: boolean;
  completed: boolean;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  state: QuestState;
  objectives: QuestObjective[];
  rewards: QuestReward;
  prerequisites: string[];
  timeLimit?: number;
  isMainQuest: boolean;
}

export interface QuestReward {
  experience: number;
  gold: number;
  items: string[];
  reputation?: Record<string, number>;
}

// ============================================================================
// INVENTORY & EQUIPMENT
// ============================================================================

export type EquipmentSlot =
  | 'weapon'
  | 'offhand'
  | 'head'
  | 'body'
  | 'legs'
  | 'feet'
  | 'accessory1'
  | 'accessory2';

export interface InventoryItem {
  itemId: string;
  quantity: number;
  slot?: EquipmentSlot;
}

export interface PlayerInventory {
  items: InventoryItem[];
  maxSlots: number;
  gold: number;
}

export interface Equipment {
  weapon?: string;
  offhand?: string;
  head?: string;
  body?: string;
  legs?: string;
  feet?: string;
  accessory1?: string;
  accessory2?: string;
}

// ============================================================================
// PLAYER STATE
// ============================================================================

export interface PlayerStats {
  level: number;
  experience: number;
  experienceToNextLevel: number;

  maxHp: number;
  currentHp: number;
  maxStamina: number;
  currentStamina: number;

  attack: number;
  defense: number;
  speed: number;
  luck: number;
}

export interface PlayerState {
  id: string;
  name: string;
  stats: PlayerStats;
  inventory: PlayerInventory;
  equipment: Equipment;
  activeQuests: string[];
  completedQuests: string[];
  knownLocations: string[];
  reputation: Record<string, number>;
}

// ============================================================================
// SAVE DATA
// ============================================================================

export interface SaveMetadata {
  slot: number;
  timestamp: number;
  playerName: string;
  playerLevel: number;
  playTime: number;
  location: string;
  screenshot?: string;
}

export interface SaveData {
  metadata: SaveMetadata;
  player: PlayerState;
  world: WorldState;
  quests: Record<string, Quest>;
  flags: Record<string, boolean | number | string>;
}

export interface WorldState {
  currentLocationId: string;
  currentSceneType: SceneType;
  time: {
    hour: number;
    day: number;
    year: number;
  };
  weather: string;
  discoveredLocations: string[];
  npcStates: Record<string, { disposition: number; isAlive: boolean }>;
}

// ============================================================================
// INPUT
// ============================================================================

export type InputAction =
  | 'move_up'
  | 'move_down'
  | 'move_left'
  | 'move_right'
  | 'interact'
  | 'cancel'
  | 'menu'
  | 'inventory'
  | 'journal'
  | 'map'
  | 'sprint'
  | 'attack'
  | 'defend';

export interface InputState {
  movement: { x: number; y: number };
  actions: Set<InputAction>;
  pointerPosition?: { x: number; y: number };
  pointerDown: boolean;
}
