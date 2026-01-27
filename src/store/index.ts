/**
 * Game Store - Platform-agnostic state management
 *
 * This module provides the core game store with configurable storage adapters
 * for persistence across different platforms (web, mobile native).
 */

// Store factory
export {
  createGameStore,
  type DataAccess,
  type DatabaseManager,
  type GameStore,
  type GameStoreConfig,
} from './createGameStore';
// Default values
export {
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
// Persist storage utilities
export {
  AsyncStateStorage,
  createStateStorage,
  preloadStorage,
} from './persistStorage';
// Storage adapters
export {
  MemoryStorageAdapter,
  NativeStorageAdapter,
  NoopStorageAdapter,
  type StorageAdapter,
  WebStorageAdapter,
} from './StorageAdapter';
// Store types
export type {
  BiomeType,
  CameraState,
  CharacterAppearance,
  ChunkCoord,
  ChunkData,
  CombatAction,
  // Combat types
  CombatActionType,
  Combatant,
  CombatPhase,
  CombatResult,
  CombatState,
  // Dialogue types
  DialogueState,
  EquipmentSlot,
  EquipmentState,
  // UI types
  GamePhase,
  // Settings types
  GameSettings,
  GameState,
  GameStateActions,
  // State types
  GameStateData,
  // Inventory types
  InventoryItem,
  // Common types
  ItemRarity,
  Notification,
  NPC,
  NPCPersonality,
  // NPC types
  NPCRole,
  PanelType,
  PersistedGameState,
  // Player types
  PlayerStats,
  Structure,
  // Structure types
  StructureType,
  TimeState,
  // Travel types
  TravelState,
  WeatherState,
  WeatherType,
  // World types
  WorldItem,
  WorldPosition,
} from './types';
