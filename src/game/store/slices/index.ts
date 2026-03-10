/**
 * Game Store Slices - Modular state management
 *
 * This module exports all Zustand slices for the game store.
 * Each slice manages a specific domain of game state.
 *
 * @module game/store/slices
 */

// Core slice - game phase and initialization
export {
  createCoreSlice,
  DEFAULT_CORE_STATE,
  SAVE_VERSION,
  type CoreActions,
  type CoreSlice,
  type CoreState,
} from './coreSlice';

// Player slice - player position, stats, appearance
export {
  createPlayerSlice,
  DEFAULT_PLAYER_STATE,
  DEFAULT_PLAYER_STATS,
  DEFAULT_WORLD_POSITION,
  type PlayerActions,
  type PlayerSlice,
  type PlayerSliceDeps,
  type PlayerState,
} from './playerSlice';

// Inventory slice - inventory and equipment
export {
  createInventorySlice,
  DEFAULT_EQUIPMENT,
  DEFAULT_INVENTORY_STATE,
  type InventoryActions,
  type InventoryDataAccess,
  type InventorySlice,
  type InventorySliceDeps,
  type InventoryState,
} from './inventorySlice';

// Quest slice - quests and objectives
export {
  createQuestSlice,
  DEFAULT_QUEST_STATE,
  type QuestActions,
  type QuestDataAccess,
  type QuestSlice,
  type QuestSliceDeps,
  type QuestState,
} from './questSlice';

// Dialogue slice - NPC dialogue
export {
  createDialogueSlice,
  DEFAULT_DIALOGUE_SLICE_STATE,
  type DialogueActions,
  type DialogueDataAccess,
  type DialogueSlice,
  type DialogueSliceDeps,
  type DialogueSliceState,
} from './dialogueSlice';

// Combat slice - turn-based combat
export {
  createCombatSlice,
  DEFAULT_COMBAT_SLICE_STATE,
  type CombatActions,
  type CombatDataAccess,
  type CombatSlice,
  type CombatSliceDeps,
  type CombatSliceState,
} from './combatSlice';

// Travel slice - world navigation
export {
  createTravelSlice,
  DEFAULT_TRAVEL_SLICE_STATE,
  type TravelActions,
  type TravelDataAccess,
  type TravelSlice,
  type TravelSliceDeps,
  type TravelSliceState,
} from './travelSlice';

// Shop slice - buying/selling
export {
  createShopSlice,
  DEFAULT_SHOP_STATE,
  type ShopActions,
  type ShopDataAccess,
  type ShopSlice,
  type ShopSliceDeps,
  type ShopState,
} from './shopSlice';

// Puzzle slice - minigames
export {
  createPuzzleSlice,
  DEFAULT_PUZZLE_STATE,
  type PuzzleActions,
  type PuzzleSlice,
  type PuzzleSliceDeps,
  type PuzzleState,
} from './puzzleSlice';

// UI slice - panels and notifications
export {
  createUISlice,
  DEFAULT_UI_STATE,
  type UIActions,
  type UISlice,
  type UISliceDeps,
  type UIState,
} from './uiSlice';

// Settings slice - user preferences
export {
  createSettingsSlice,
  DEFAULT_SETTINGS,
  DEFAULT_SETTINGS_STATE,
  type SettingsActions,
  type SettingsSlice,
  type SettingsState,
} from './settingsSlice';

// Audio slice - music playback
export {
  createAudioSlice,
  DEFAULT_AUDIO_STATE,
  DEFAULT_CAMERA_STATE,
  type AudioActions,
  type AudioSlice,
  type AudioSliceState,
} from './audioSlice';

// Save slice - save/load operations
export {
  createSaveSlice,
  DEFAULT_SAVE_STATE,
  type SaveActions,
  type SaveSlice,
  type SaveSliceDeps,
  type SaveState,
} from './saveSlice';

// Game flow slice - lifecycle and cross-cutting actions
export {
  createGameFlowSlice,
  DEFAULT_GAME_FLOW_STATE,
  type GameFlowActions,
  type GameFlowSlice,
  type GameFlowSliceDeps,
  type GameFlowState,
} from './gameFlowSlice';
