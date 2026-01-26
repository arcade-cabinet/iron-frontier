/**
 * Iron Frontier - Town Schema Definitions
 *
 * Zod-backed schemas for town definitions in the authored world.
 * Towns are the primary locations where players interact with NPCs,
 * shops, and quest givers. Each town has a distinct theme and purpose
 * in the narrative.
 *
 * Architecture:
 * - Towns reference NPCs, shops, quests, and buildings by ID
 * - Position is specified in world coordinates (x, z on overworld)
 * - Size affects available services and NPC count
 * - Unlock conditions gate access to certain towns
 *
 * Design principles:
 * - Towns are hand-crafted, not procedurally generated
 * - All references are validated at load time
 * - Shops and services are defined inline for simplicity
 */

import { z } from 'zod';

// ============================================================================
// TOWN SIZE
// ============================================================================

/**
 * Town size determines available facilities and NPC population.
 *
 * - small: 1-3 buildings, basic services (waystation, outpost)
 * - medium: 4-8 buildings, standard services (village, small town)
 * - large: 9+ buildings, full services (major town, city)
 */
export const TownSizeSchema = z.enum(['small', 'medium', 'large']);
export type TownSize = z.infer<typeof TownSizeSchema>;

// ============================================================================
// TOWN THEME
// ============================================================================

/**
 * Town themes define the visual and narrative character of a settlement.
 * Themes affect building styles, NPC types, and available quests.
 */
export const TownThemeSchema = z.enum([
  'frontier', // Starting area, tutorial town
  'mining', // Industrial, ore extraction focus
  'ranching', // Agricultural, pastoral setting
  'outlaw', // Lawless hideout, black market
  'religious', // Church-centered, sanctuary
  'railroad', // Transit hub, commerce
  'abandoned', // Ghost town, ruins
  'military', // Fort, law enforcement
]);
export type TownTheme = z.infer<typeof TownThemeSchema>;

// ============================================================================
// BUILDING TYPE
// ============================================================================

/**
 * Building types available in towns.
 * Each building type may provide specific services or house NPCs.
 */
export const TownBuildingTypeSchema = z.enum([
  // Residential
  'cabin',
  'house',
  'mansion',

  // Commercial
  'saloon',
  'general_store',
  'gunsmith',
  'bank',
  'hotel',

  // Industrial
  'mine_office',
  'smelter',
  'workshop',
  'stable',
  'warehouse',

  // Civic
  'sheriff_office',
  'church',
  'train_station',
  'telegraph_office',
  'town_hall',

  // Medical
  'doctor_office',

  // Infrastructure
  'well',
  'water_tower',
  'windmill',

  // Defensive
  'watch_tower',
  'fort',
  'jail',
]);
export type TownBuildingType = z.infer<typeof TownBuildingTypeSchema>;

// ============================================================================
// TOWN POSITION
// ============================================================================

/**
 * World position for a town on the overworld map.
 * Uses x/z coordinates (y is reserved for elevation if needed).
 */
export const TownPositionSchema = z.object({
  /** X coordinate on overworld (east-west) */
  x: z.number(),
  /** Z coordinate on overworld (north-south) */
  z: z.number(),
});
export type TownPosition = z.infer<typeof TownPositionSchema>;

// ============================================================================
// SHOP DEFINITION (inline for towns)
// ============================================================================

/**
 * Shop definition within a town.
 * Shops are tied to specific NPCs who operate them.
 */
export const TownShopSchema = z.object({
  /** Unique shop ID within the town */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Shop type for categorization */
  type: z.enum([
    'general_store',
    'gunsmith',
    'blacksmith',
    'doctor',
    'saloon',
    'stable',
    'black_market',
    'trading_post',
  ]),

  /** NPC who operates this shop (reference to NPC ID) */
  operatorNpcId: z.string(),

  /** Reference to shop inventory definition */
  shopInventoryId: z.string().optional(),

  /** Business hours (24h format, null = always open) */
  hours: z
    .object({
      open: z.number().int().min(0).max(23),
      close: z.number().int().min(0).max(23),
    })
    .nullable()
    .default(null),

  /** Price modifier (1.0 = normal, 1.2 = 20% markup) */
  priceModifier: z.number().min(0.1).max(5).default(1.0),

  /** Description for UI */
  description: z.string().optional(),
});
export type TownShop = z.infer<typeof TownShopSchema>;

// ============================================================================
// BUILDING DEFINITION
// ============================================================================

/**
 * Building instance within a town.
 * Buildings provide the physical structure for shops, services, and NPCs.
 */
export const TownBuildingSchema = z.object({
  /** Unique building ID within the town */
  id: z.string(),

  /** Building type (visual and functional) */
  type: TownBuildingTypeSchema,

  /** Display name (optional override) */
  name: z.string().optional(),

  /** Position within the town (local coordinates) */
  localPosition: z
    .object({
      x: z.number(),
      z: z.number(),
    })
    .optional(),

  /** Is this building enterable by the player? */
  enterable: z.boolean().default(true),

  /** Interior map ID (if enterable) */
  interiorMapId: z.string().optional(),

  /** NPCs who reside/work in this building (references) */
  residentNpcIds: z.array(z.string()).default([]),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type TownBuilding = z.infer<typeof TownBuildingSchema>;

// ============================================================================
// UNLOCK CONDITION
// ============================================================================

/**
 * Conditions that must be met to access or discover a town.
 * Used for gating content progression.
 */
export const TownUnlockConditionSchema = z.object({
  /** Type of unlock condition */
  type: z.enum([
    'quest_complete', // Must complete a specific quest
    'quest_stage', // Must reach a specific quest stage
    'reputation', // Must have minimum faction reputation
    'item', // Must possess a specific item
    'level', // Must reach minimum player level
    'flag', // Must have a game flag set
    'always', // Always unlocked (default)
  ]),

  /** Target reference (quest ID, item ID, flag name, faction ID) */
  target: z.string().optional(),

  /** Numeric value (for reputation/level thresholds) */
  value: z.number().optional(),

  /** Quest stage ID (for quest_stage type) */
  stageId: z.string().optional(),
});
export type TownUnlockCondition = z.infer<typeof TownUnlockConditionSchema>;

// ============================================================================
// TOWN SCHEMA
// ============================================================================

/**
 * Complete town definition for the authored world.
 *
 * Towns are the primary hubs of activity where players:
 * - Meet and interact with NPCs
 * - Buy and sell items at shops
 * - Accept and turn in quests
 * - Rest and recover
 *
 * Each town has a distinct theme and role in the narrative.
 */
export const TownSchema = z.object({
  /** Unique town identifier */
  id: z.string(),

  /** Display name shown to player */
  name: z.string(),

  /** Flavor description for the town */
  description: z.string(),

  /** Thematic category */
  theme: TownThemeSchema,

  /**
   * Position on the overworld map.
   * Coordinates are in world units.
   */
  position: TownPositionSchema,

  /** Size category (affects services and population) */
  size: TownSizeSchema,

  /**
   * NPC references - IDs of NPCs present in this town.
   * NPCs are defined separately and linked here.
   */
  npcs: z.array(z.string()).default([]),

  /**
   * Shops available in this town.
   * Defined inline for authoring convenience.
   */
  shops: z.array(TownShopSchema).default([]),

  /**
   * Quest references - IDs of quests that originate in this town.
   * Includes both main and side quests.
   */
  quests: z.array(z.string()).default([]),

  /**
   * Buildings in this town.
   * Defines the physical layout and available structures.
   */
  buildings: z.array(TownBuildingSchema).default([]),

  /**
   * Unlock condition - when can the player access this town?
   * If null/undefined, town is always accessible.
   */
  unlockCondition: TownUnlockConditionSchema.optional(),

  /**
   * Is this town discovered by default at game start?
   * Used for starting towns and major landmarks.
   */
  startDiscovered: z.boolean().default(false),

  /**
   * Danger level in and around the town.
   * 0 = safe haven, 10 = extremely dangerous.
   */
  dangerLevel: z.number().int().min(0).max(10).default(0),

  /**
   * Economic prosperity level.
   * Affects prices, item availability, and NPC wealth.
   */
  economyLevel: z.number().int().min(1).max(10).default(5),

  /**
   * Law enforcement level.
   * Affects crime consequences and patrol frequency.
   */
  lawLevel: z.enum(['lawless', 'frontier', 'orderly', 'strict']).default('frontier'),

  /**
   * Faction that controls this town (if any).
   * Affects NPC attitudes and available services.
   */
  controllingFaction: z.string().optional(),

  /**
   * Lore/history text for world-building.
   * Displayed in journal or discovery notifications.
   */
  lore: z.string().optional(),

  /**
   * Icon identifier for world map display.
   */
  mapIcon: z
    .enum(['town', 'village', 'outpost', 'fort', 'camp', 'ruins', 'special'])
    .default('town'),

  /**
   * Entry points for arriving at this town from routes.
   */
  entryPoints: z
    .array(
      z.object({
        id: z.string(),
        direction: z.enum(['north', 'south', 'east', 'west']),
        /** Connected route ID */
        routeId: z.string().optional(),
      })
    )
    .default([]),

  /**
   * Tags for filtering and categorization.
   */
  tags: z.array(z.string()).default([]),
});
export type Town = z.infer<typeof TownSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Parse and validate a town definition.
 * @throws ZodError if validation fails
 */
export function validateTown(data: unknown): Town {
  return TownSchema.parse(data);
}

/**
 * Safely parse a town definition, returning null on failure.
 */
export function safeParseTown(data: unknown): Town | null {
  const result = TownSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate town references are internally consistent.
 * Checks that NPC IDs in shops match those in npcs array, etc.
 */
export function validateTownIntegrity(town: Town): string[] {
  const errors: string[] = [];
  const npcSet = new Set(town.npcs);

  // Check shop operators are listed as town NPCs
  for (const shop of town.shops) {
    if (!npcSet.has(shop.operatorNpcId)) {
      errors.push(
        `Shop "${shop.name}" references NPC "${shop.operatorNpcId}" not in town's NPC list`
      );
    }
  }

  // Check building residents are listed as town NPCs
  for (const building of town.buildings) {
    for (const residentId of building.residentNpcIds) {
      if (!npcSet.has(residentId)) {
        errors.push(
          `Building "${building.id}" references NPC "${residentId}" not in town's NPC list`
        );
      }
    }
  }

  // Check entry points have unique IDs
  const entryIds = new Set<string>();
  for (const entry of town.entryPoints) {
    if (entryIds.has(entry.id)) {
      errors.push(`Duplicate entry point ID: "${entry.id}"`);
    }
    entryIds.add(entry.id);
  }

  return errors;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a town is accessible based on game state.
 */
export function isTownUnlocked(
  town: Town,
  gameState: {
    completedQuests?: string[];
    activeQuests?: Record<string, { currentStageIndex: number; stages: { id: string }[] }>;
    reputation?: Record<string, number>;
    inventory?: string[];
    level?: number;
    flags?: Record<string, boolean>;
  }
): boolean {
  const condition = town.unlockCondition;
  if (!condition) return true;

  switch (condition.type) {
    case 'always':
      return true;

    case 'quest_complete':
      return condition.target ? (gameState.completedQuests ?? []).includes(condition.target) : true;

    case 'quest_stage': {
      if (!condition.target || !condition.stageId) return false;
      const quest = gameState.activeQuests?.[condition.target];
      if (!quest) return false;
      const currentStage = quest.stages[quest.currentStageIndex];
      return currentStage?.id === condition.stageId;
    }

    case 'reputation':
      if (!condition.target || condition.value === undefined) return false;
      return (gameState.reputation?.[condition.target] ?? 0) >= condition.value;

    case 'item':
      return condition.target ? (gameState.inventory ?? []).includes(condition.target) : true;

    case 'level':
      return (gameState.level ?? 1) >= (condition.value ?? 1);

    case 'flag':
      return condition.target ? gameState.flags?.[condition.target] === true : true;

    default:
      return true;
  }
}

/**
 * Get shops of a specific type from a town.
 */
export function getShopsByType(town: Town, type: TownShop['type']): TownShop[] {
  return town.shops.filter((shop) => shop.type === type);
}

/**
 * Get buildings of a specific type from a town.
 */
export function getBuildingsByType(town: Town, type: TownBuildingType): TownBuilding[] {
  return town.buildings.filter((building) => building.type === type);
}

/**
 * Calculate distance between two town positions.
 */
export function calculateTownDistance(a: TownPosition, b: TownPosition): number {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dz * dz);
}

// ============================================================================
// SCHEMA VERSION
// ============================================================================

export const TOWN_SCHEMA_VERSION = '1.0.0';
