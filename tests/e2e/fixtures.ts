/**
 * E2E Test Fixtures - Iron Frontier
 *
 * Mock data and test constants for comprehensive E2E testing.
 * These fixtures provide consistent, reproducible test data that matches
 * the game's actual data structures and schemas.
 *
 * Requirements: All (provides test data for all E2E test suites)
 */

import type {
    CharacterAppearance,
    CombatState,
    Combatant,
    DialogueState,
    EquipmentState,
    GameSettings,
    InventoryItem,
    Notification,
    PlayerStats,
    TimeState,
    TravelState,
    WorldPosition,
} from '../../src/game/store/types';

// ============================================================================
// TEST CONSTANTS
// ============================================================================

/** Default player name for tests */
export const TEST_PLAYER_NAME = 'TestOutlaw';

/** Default world seed for deterministic generation */
export const TEST_SEED = 12345;

/** Alternative seeds for testing procedural generation determinism */
export const ALTERNATIVE_SEEDS = {
  seed1: 54321,
  seed2: 98765,
  seed3: 11111,
} as const;

/** Maximum character name length */
export const MAX_NAME_LENGTH = 20;

/** Minimum character name length */
export const MIN_NAME_LENGTH = 1;

// ============================================================================
// PLAYER STATS
// ============================================================================

/** Default player stats for a new game */
export const MOCK_PLAYER_STATS: PlayerStats = {
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
  attributes: {
    grit: 5,
    perception: 5,
    endurance: 5,
    charisma: 5,
    intelligence: 5,
    agility: 5,
    luck: 5,
  },
  skills: {
    guns: 15,
    melee: 15,
    lockpick: 15,
    speech: 15,
    repair: 15,
    medicine: 15,
    survival: 15,
    barter: 15,
  },
};

/** Player stats with low health for testing edge cases */
export const LOW_HEALTH_PLAYER_STATS: PlayerStats = {
  ...MOCK_PLAYER_STATS,
  health: 10,
};

/** Player stats with high level for testing progression */
export const HIGH_LEVEL_PLAYER_STATS: PlayerStats = {
  ...MOCK_PLAYER_STATS,
  level: 10,
  xp: 500,
  xpToNext: 1000,
  maxHealth: 150,
  health: 150,
  maxStamina: 150,
  stamina: 150,
  gold: 500,
  reputation: 50,
};

/** Player stats with zero gold for testing shop edge cases */
export const BROKE_PLAYER_STATS: PlayerStats = {
  ...MOCK_PLAYER_STATS,
  gold: 0,
};

// ============================================================================
// INVENTORY ITEMS
// ============================================================================

/** Mock inventory items for testing */
export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'inv_bandages_1',
    itemId: 'bandages',
    name: 'Bandages',
    rarity: 'common',
    quantity: 5,
    description: 'Clean cloth strips for binding wounds.',
    usable: true,
    condition: 100,
    weight: 0.1,
    type: 'consumable',
    droppable: true,
  },
  {
    id: 'inv_revolver_1',
    itemId: 'revolver',
    name: 'Colt Peacemaker',
    rarity: 'common',
    quantity: 1,
    description: 'A reliable six-shooter. The standard sidearm of the frontier.',
    usable: false,
    condition: 100,
    weight: 2.5,
    type: 'weapon',
    droppable: true,
  },
  {
    id: 'inv_whiskey_1',
    itemId: 'whiskey',
    name: 'Bottle of Whiskey',
    rarity: 'common',
    quantity: 3,
    description: 'Frontier medicine. Takes the edge off and numbs the pain.',
    usable: true,
    condition: 100,
    weight: 0.5,
    type: 'consumable',
    droppable: true,
  },
  {
    id: 'inv_coffee_1',
    itemId: 'coffee',
    name: 'Strong Coffee',
    rarity: 'common',
    quantity: 2,
    description: 'Black as midnight, hot as hell. Keeps you sharp on the trail.',
    usable: true,
    condition: 100,
    weight: 0.2,
    type: 'consumable',
    droppable: true,
  },
];

/** Single consumable item for use testing */
export const SINGLE_CONSUMABLE_ITEM: InventoryItem = {
  id: 'inv_single_bandage',
  itemId: 'bandages',
  name: 'Bandages',
  rarity: 'common',
  quantity: 1,
  description: 'Clean cloth strips for binding wounds.',
  usable: true,
  condition: 100,
  weight: 0.1,
  type: 'consumable',
  droppable: true,
};

/** Weapon item for equipment testing */
export const WEAPON_ITEM: InventoryItem = {
  id: 'inv_test_weapon',
  itemId: 'hunting_rifle',
  name: 'Hunting Rifle',
  rarity: 'common',
  quantity: 1,
  description: 'A bolt-action rifle for hunting game. Accurate but slow.',
  usable: false,
  condition: 100,
  weight: 4.0,
  type: 'weapon',
  droppable: true,
};

/** Key item that cannot be dropped */
export const KEY_ITEM: InventoryItem = {
  id: 'inv_mysterious_letter',
  itemId: 'mysterious_letter',
  name: 'Mysterious Letter',
  rarity: 'rare',
  quantity: 1,
  description: "A weathered letter summoning you to claim what's rightfully yours.",
  usable: true,
  condition: 100,
  weight: 0,
  type: 'key_item',
  droppable: false,
};

// ============================================================================
// COMBAT ENCOUNTERS
// ============================================================================

/** Combat encounter IDs for testing different difficulty levels */
export const COMBAT_ENCOUNTERS = {
  /** Easy encounter - roadside bandits */
  easy: 'roadside_bandits',
  /** Medium encounter - wolf pack */
  medium: 'wolf_pack',
  /** Hard encounter - Copperhead patrol */
  hard: 'copperhead_patrol',
  /** Boss encounter - cannot flee */
  boss: 'juggernaut_boss',
  /** IVRC checkpoint encounter */
  ivrc: 'ivrc_checkpoint',
  /** Remnant automaton encounter */
  remnant: 'remnant_awakening',
} as const;

/** Mock combatant for player in combat */
export const MOCK_PLAYER_COMBATANT: Combatant = {
  definitionId: 'player',
  name: TEST_PLAYER_NAME,
  isPlayer: true,
  health: 100,
  maxHealth: 100,
  actionPoints: 4,
  maxActionPoints: 4,
  position: { q: 0, r: 0 },
  statusEffects: [],
  weaponId: 'revolver',
  ammoInClip: 6,
  baseDamage: 15,
  armor: 0,
  accuracy: 70,
  evasion: 10,
  level: 1,
  isActive: true,
  hasActed: false,
  isDead: false,
};

/** Mock enemy combatant for combat testing */
export const MOCK_ENEMY_COMBATANT: Combatant = {
  definitionId: 'bandit_thug',
  name: 'Bandit Thug',
  isPlayer: false,
  health: 30,
  maxHealth: 30,
  actionPoints: 4,
  maxActionPoints: 4,
  position: { q: 2, r: 0 },
  statusEffects: [],
  weaponId: 'rusty_knife',
  ammoInClip: 0,
  baseDamage: 8,
  armor: 0,
  accuracy: 60,
  evasion: 5,
  level: 1,
  isActive: false,
  hasActed: false,
  isDead: false,
};

/** Mock combat state for testing */
export const MOCK_COMBAT_STATE: CombatState = {
  encounterId: COMBAT_ENCOUNTERS.easy,
  phase: 'player_turn',
  combatants: [MOCK_PLAYER_COMBATANT, MOCK_ENEMY_COMBATANT],
  turnOrder: ['player', 'bandit_thug'],
  currentTurnIndex: 0,
  round: 1,
  log: [],
  startedAt: Date.now(),
  selectedAction: undefined,
  selectedTargetId: undefined,
};

// ============================================================================
// SHOP IDS
// ============================================================================

/** Shop IDs for testing shop interactions */
export const SHOP_IDS = {
  /** General store - sells various supplies */
  general: 'general_store',
  /** Blacksmith - sells weapons and tools */
  blacksmith: 'blacksmith_shop',
  /** Gunsmith - sells firearms and ammo */
  gunsmith: 'gunsmith_shop',
  /** Doctor - sells medical supplies */
  doctor: 'doc_chen_shop',
  /** Saloon - sells drinks and food */
  saloon: 'saloon_shop',
} as const;

/** Item IDs available in shops for purchase testing */
export const SHOP_ITEM_IDS = {
  cheap: 'trail_biscuits', // 1 gold
  medium: 'bandages', // 2 gold
  expensive: 'medical_kit', // 15 gold
  weapon: 'hunting_knife', // 5 gold
} as const;

// ============================================================================
// NPC IDS
// ============================================================================

/** NPC IDs for dialogue and interaction testing */
export const NPC_IDS = {
  /** Doctor NPC with shop */
  doctor: 'doc_chen',
  /** Bartender NPC */
  bartender: 'bartender',
  /** Sheriff NPC */
  sheriff: 'sheriff',
  /** Generic shop keeper */
  shopKeeper: 'shop_keeper',
  /** Blacksmith NPC */
  blacksmith: 'blacksmith',
} as const;

// ============================================================================
// QUEST IDS
// ============================================================================

/** Quest IDs for quest system testing */
export const QUEST_IDS = {
  /** Main story quest */
  mainStory: 'main_quest_1',
  /** Side quest */
  sideQuest: 'side_quest_1',
  /** Fetch quest */
  fetchQuest: 'fetch_quest_1',
} as const;

// ============================================================================
// LOCATION IDS
// ============================================================================

/** Location IDs for travel and zone testing */
export const LOCATION_IDS = {
  /** Starting town */
  dustySprings: 'dusty_springs',
  /** Mine location */
  oldMine: 'old_mine',
  /** Ranch location */
  ranch: 'ranch',
  /** Outpost location */
  outpost: 'outpost',
} as const;

// ============================================================================
// POSITIONS
// ============================================================================

/** Default player spawn position */
export const DEFAULT_PLAYER_POSITION: WorldPosition = {
  x: 0,
  y: 0,
  z: 0,
};

/** Position near a building for collision testing */
export const NEAR_BUILDING_POSITION: WorldPosition = {
  x: 10,
  y: 0,
  z: 10,
};

/** Position at world boundary for boundary testing */
export const BOUNDARY_POSITION: WorldPosition = {
  x: 999,
  y: 0,
  z: 999,
};

/** Negative position for boundary testing */
export const NEGATIVE_POSITION: WorldPosition = {
  x: -10,
  y: 0,
  z: -10,
};

// ============================================================================
// TIME AND SURVIVAL
// ============================================================================

/** Default time state (morning) */
export const MORNING_TIME: TimeState = {
  hour: 8,
  dayOfYear: 1,
  year: 1885,
};

/** Noon time state */
export const NOON_TIME: TimeState = {
  hour: 12,
  dayOfYear: 1,
  year: 1885,
};

/** Evening time state */
export const EVENING_TIME: TimeState = {
  hour: 18,
  dayOfYear: 1,
  year: 1885,
};

/** Night time state */
export const NIGHT_TIME: TimeState = {
  hour: 23,
  dayOfYear: 1,
  year: 1885,
};

/** Midnight time state */
export const MIDNIGHT_TIME: TimeState = {
  hour: 0,
  dayOfYear: 2,
  year: 1885,
};

/** Fatigue levels for testing */
export const FATIGUE_LEVELS = {
  rested: 0,
  tired: 50,
  exhausted: 90,
  max: 100,
} as const;

/** Provision levels for testing */
export const PROVISION_LEVELS = {
  full: { food: 100, water: 100 },
  half: { food: 50, water: 50 },
  low: { food: 10, water: 10 },
  empty: { food: 0, water: 0 },
} as const;

// ============================================================================
// EQUIPMENT
// ============================================================================

/** Default equipment state (nothing equipped) */
export const EMPTY_EQUIPMENT: EquipmentState = {
  weapon: null,
  offhand: null,
  head: null,
  body: null,
  accessory: null,
};

/** Equipment state with weapon equipped */
export const WEAPON_EQUIPPED: EquipmentState = {
  weapon: 'inv_revolver_1',
  offhand: null,
  head: null,
  body: null,
  accessory: null,
};

// ============================================================================
// CHARACTER APPEARANCE
// ============================================================================

/** Default character appearance for testing */
export const DEFAULT_APPEARANCE: CharacterAppearance = {
  bodyType: 'average',
  height: 1.75,
  skinTone: '#D4A574',
  faceShape: 1,
  hasBeard: false,
  hasScar: false,
  hatStyle: 'cowboy',
  hatColor: '#4A3728',
  shirtStyle: 'work',
  shirtColor: '#8B7355',
  pantsStyle: 'jeans',
  pantsColor: '#4A5568',
  bootsStyle: 'work',
  hasBandana: false,
  hasGunbelt: true,
  hasPoncho: false,
};

// ============================================================================
// GAME SETTINGS
// ============================================================================

/** Default game settings */
export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 1.0,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
  haptics: true,
  controlMode: 'tap',
  reducedMotion: false,
  showMinimap: true,
  lowPowerMode: false,
  cameraDistance: 15,
};

/** Settings with reduced motion enabled */
export const ACCESSIBILITY_SETTINGS: GameSettings = {
  ...DEFAULT_SETTINGS,
  reducedMotion: true,
  haptics: false,
};

// ============================================================================
// DIALOGUE
// ============================================================================

/** Mock dialogue state for testing */
export const MOCK_DIALOGUE_STATE: DialogueState = {
  npcId: NPC_IDS.doctor,
  npcName: 'Doc Chen',
  npcTitle: 'Town Doctor',
  npcPortraitId: 'doc_chen_portrait',
  npcExpression: 'neutral',
  treeId: 'doc_chen_greeting',
  currentNodeId: 'greeting_1',
  text: 'Howdy, stranger. What brings you to my clinic?',
  speaker: 'Doc Chen',
  choices: [
    {
      text: "I'm looking for medical supplies.",
      nextNodeId: 'shop_intro',
      effects: [],
      tags: ['shop'],
      hint: 'Opens the shop',
    },
    {
      text: 'Just passing through.',
      nextNodeId: null,
      effects: [],
      tags: ['exit'],
      hint: 'End conversation',
    },
  ],
  autoAdvanceNodeId: null,
  history: [],
  conversationFlags: {},
  startedAt: Date.now(),
};

// ============================================================================
// TRAVEL
// ============================================================================

/** Mock travel state for testing */
export const MOCK_TRAVEL_STATE: TravelState = {
  fromLocationId: LOCATION_IDS.dustySprings,
  toLocationId: LOCATION_IDS.oldMine,
  method: 'trail',
  travelTime: 60,
  progress: 0,
  dangerLevel: 'moderate',
  startedAt: Date.now(),
  encounterId: null,
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/** Mock notifications for testing */
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    type: 'item',
    message: 'Picked up Bandages x3',
    timestamp: Date.now(),
  },
  {
    id: 'notif_2',
    type: 'xp',
    message: 'Gained 50 XP',
    timestamp: Date.now(),
  },
  {
    id: 'notif_3',
    type: 'quest',
    message: 'Quest Updated: Find the Mine Key',
    timestamp: Date.now(),
  },
];

/** Level up notification */
export const LEVEL_UP_NOTIFICATION: Notification = {
  id: 'notif_level_up',
  type: 'level',
  message: 'Level Up! You are now level 2',
  timestamp: Date.now(),
};

// ============================================================================
// VIEWPORT SIZES
// ============================================================================

/** Viewport sizes for responsive testing */
export const VIEWPORTS = {
  /** Mobile portrait (< 480px) */
  mobilePortrait: { width: 375, height: 667 },
  /** Mobile landscape (480-767px) */
  mobileLandscape: { width: 667, height: 375 },
  /** Tablet (768-1023px) */
  tablet: { width: 768, height: 1024 },
  /** Desktop (1024px+) */
  desktop: { width: 1280, height: 800 },
  /** Large desktop */
  largeDesktop: { width: 1920, height: 1080 },
} as const;

/** Minimum touch target size (iOS HIG) */
export const MIN_TOUCH_TARGET_SIZE = 44;

// ============================================================================
// PERFORMANCE THRESHOLDS
// ============================================================================

/** Performance thresholds for testing */
export const PERFORMANCE_THRESHOLDS = {
  /** Maximum initial load time in ms */
  initialLoad: 10000,
  /** Maximum panel open time in ms */
  panelOpen: 500,
  /** Maximum combat action time in ms */
  combatAction: 200,
  /** Maximum phase transition time in ms */
  phaseTransition: 1000,
} as const;

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

/**
 * Generate a unique inventory item ID
 */
export function generateInventoryItemId(itemId: string): string {
  return `inv_${itemId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a mock inventory item with custom properties
 */
export function createMockInventoryItem(
  itemId: string,
  overrides: Partial<InventoryItem> = {}
): InventoryItem {
  return {
    id: generateInventoryItemId(itemId),
    itemId,
    name: itemId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    rarity: 'common',
    quantity: 1,
    description: `A ${itemId} item for testing.`,
    usable: false,
    condition: 100,
    weight: 1.0,
    type: 'junk',
    droppable: true,
    ...overrides,
  };
}

/**
 * Create mock player stats with custom values
 */
export function createMockPlayerStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return {
    ...MOCK_PLAYER_STATS,
    ...overrides,
  };
}

/**
 * Generate valid character names for property testing
 */
export function generateValidCharacterName(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < Math.min(length, MAX_NAME_LENGTH); i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result || 'A'; // Ensure at least 1 character
}

/**
 * Generate a time state for a specific hour
 */
export function createTimeState(hour: number, dayOfYear: number = 1, year: number = 1885): TimeState {
  return {
    hour: Math.max(0, Math.min(23, hour)),
    dayOfYear,
    year,
  };
}

// ============================================================================
// COLLISION TEST DATA
// ============================================================================

/** Collision test cases */
export const COLLISION_TEST_CASES = [
  {
    name: 'Open space movement',
    from: { x: 0, z: 0 },
    to: { x: 5, z: 5 },
    expectedCollision: false,
  },
  {
    name: 'Building collision',
    from: { x: 10, z: 10 },
    to: { x: 10, z: 15 },
    expectedCollision: true,
    colliderType: 'building' as const,
  },
  {
    name: 'Boundary collision',
    from: { x: 990, z: 990 },
    to: { x: 1010, z: 1010 },
    expectedCollision: true,
    colliderType: 'terrain' as const,
  },
] as const;

// ============================================================================
// ZONE TEST DATA
// ============================================================================

/** Zone test cases */
export const ZONE_TEST_CASES = [
  {
    name: 'Town zone - encounters disabled',
    position: { x: 0, z: 0 },
    expectedZoneType: 'town' as const,
    expectedEncountersEnabled: false,
  },
  {
    name: 'Route zone - encounters enabled',
    position: { x: 100, z: 100 },
    expectedZoneType: 'route' as const,
    expectedEncountersEnabled: true,
  },
] as const;
