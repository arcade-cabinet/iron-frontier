/**
 * Controllers Module - High-level game coordination
 *
 * Controllers orchestrate between systems and provide
 * clean interfaces for game flow management.
 */

// Combat Controller
export {
  CombatController,
  getCombatController,
  type CombatEvent,
  type CombatRewards,
  type CombatControllerState,
  type CombatControllerDataAccess,
} from './CombatController';

// Game Controller
export {
  GameController,
  getGameController,
  type GameEvent,
  type GameControllerConfig,
} from './GameController';

// Player Controller
export {
  PlayerController,
  createPlayerController,
  type PlayerMovementConfig,
  type PlayerControllerState,
  type CollisionCallback,
  type ZoneCallback,
  type InteractionCallback,
} from './PlayerController';

// Dialogue Controller
export {
  DialogueController,
  getDialogueController,
  type DialogueNode,
  type DialogueChoice,
  type DialogueCondition,
  type DialogueAction,
  type DialogueNPC,
  type DialogueEvent,
  type DialogueControllerState,
  type DialogueControllerDataAccess,
} from './DialogueController';

// Shop Controller
export {
  ShopController,
  createShopController,
  type ShopItem,
  type ShopInfo,
  type TransactionResult,
  type ShopEvent,
  type ShopControllerState,
  type ShopControllerDataAccess,
} from './ShopController';

// Inventory Controller
export {
  InventoryController,
  createInventoryController,
  type ItemCategory,
  type EquipmentSlot,
  type InventoryItem,
  type ItemEffect,
  type Equipment,
  type InventoryEvent,
  type InventoryControllerState,
  type InventoryControllerDataAccess,
} from './InventoryController';

// Quest Controller
export {
  QuestController,
  createQuestController,
  type QuestStatus,
  type ObjectiveStatus,
  type QuestObjective,
  type ActiveQuest,
  type QuestRewards,
  type QuestEvent,
  type QuestControllerState,
  type QuestControllerDataAccess,
} from './QuestController';
