/**
 * Game Store - Platform-agnostic state management
 *
 * This module provides the core game store with configurable storage adapters
 * for persistence across different platforms (web, mobile native).
 */

// Storage adapters
export {
  type StorageAdapter,
  WebStorageAdapter,
  MemoryStorageAdapter,
  NativeStorageAdapter,
  NoopStorageAdapter,
} from './StorageAdapter';

// Persist storage utilities
export {
  createStateStorage,
  preloadStorage,
  AsyncStateStorage,
} from './persistStorage';

// Store types
export type {
  // Common types
  ItemRarity,
  WorldPosition,
  CameraState,
  TimeState,
  WeatherType,
  WeatherState,
  CharacterAppearance,

  // Inventory types
  InventoryItem,
  EquipmentSlot,
  EquipmentState,

  // Player types
  PlayerStats,

  // NPC types
  NPCRole,
  NPCPersonality,
  NPC,

  // Structure types
  StructureType,
  Structure,

  // World types
  WorldItem,
  ChunkCoord,
  BiomeType,
  ChunkData,

  // UI types
  GamePhase,
  PanelType,
  Notification,

  // Dialogue types
  DialogueState,

  // Combat types
  CombatActionType,
  Combatant,
  CombatAction,
  CombatResult,
  CombatPhase,
  CombatState,

  // Travel types
  TravelState,

  // Settings types
  GameSettings,

  // State types
  GameStateData,
  GameStateActions,
  GameState,
  PersistedGameState,
} from './types';

// Default values
export {
  DEFAULT_PLAYER_STATS,
  DEFAULT_EQUIPMENT,
  DEFAULT_SETTINGS,
  DEFAULT_TIME,
  DEFAULT_WEATHER,
  DEFAULT_CAMERA_STATE,
  DEFAULT_WORLD_POSITION,
  SAVE_VERSION,
  STORAGE_KEY,
} from './defaults';

// Store factory
export {
  createGameStore,
  type GameStoreConfig,
  type DatabaseManager,
  type DataAccess,
  type GameStore,
} from './createGameStore';
