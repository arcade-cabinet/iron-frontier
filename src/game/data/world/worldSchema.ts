/**
 * Iron Frontier - World Schema Definitions
 *
 * Zod-backed schemas for the complete game world configuration.
 * Combines towns and routes into a cohesive world definition with
 * global configuration and game rules.
 *
 * Architecture:
 * - World is the top-level container for all game content
 * - Towns and routes are referenced by ID
 * - Global config affects time, difficulty, and mechanics
 * - Starting conditions define new game setup
 *
 * Design principles:
 * - World is authored, not procedurally generated
 * - All content is validated at build time
 * - Configuration can be adjusted without code changes
 * - Save/load compatibility via version tracking
 */

import { z } from 'zod';
import { RouteSchema, type Route } from './routeSchema';
import { TownSchema, type Town } from './townSchema';

// ============================================================================
// TIME CONFIGURATION
// ============================================================================

/**
 * Time scale configuration for the game world.
 * Controls how real time translates to game time.
 */
export const TimeConfigSchema = z.object({
  /**
   * Game minutes per real second.
   * Default: 0.5 (1 game hour = 2 real minutes, 1 game day = 48 real minutes)
   */
  gameMinutesPerRealSecond: z.number().min(0.1).max(10).default(0.5),

  /**
   * Starting time of day for new games (0-23 hours).
   */
  startingHour: z.number().int().min(0).max(23).default(8),

  /**
   * Starting day number for new games.
   */
  startingDay: z.number().int().min(1).default(1),

  /**
   * Day boundaries for time-of-day calculations.
   */
  dayBoundaries: z
    .object({
      morningStart: z.number().int().min(0).max(23).default(6),
      afternoonStart: z.number().int().min(0).max(23).default(12),
      eveningStart: z.number().int().min(0).max(23).default(17),
      nightStart: z.number().int().min(0).max(23).default(21),
    })
    .default({
      morningStart: 6,
      afternoonStart: 12,
      eveningStart: 17,
      nightStart: 21,
    }),

  /**
   * Does time pause when in menus/dialogue?
   */
  pauseInMenus: z.boolean().default(true),

  /**
   * Does time pause during combat?
   */
  pauseInCombat: z.boolean().default(true),
});
export type TimeConfig = z.infer<typeof TimeConfigSchema>;

// ============================================================================
// DIFFICULTY CONFIGURATION
// ============================================================================

/**
 * Difficulty presets.
 */
export const DifficultyPresetSchema = z.enum(['easy', 'normal', 'hard', 'brutal']);
export type DifficultyPreset = z.infer<typeof DifficultyPresetSchema>;

/**
 * Detailed difficulty configuration.
 */
export const DifficultyConfigSchema = z.object({
  /** Preset name (or 'custom' for manual settings) */
  preset: DifficultyPresetSchema.or(z.literal('custom')).default('normal'),

  /**
   * Combat damage multiplier for player.
   * 1.0 = normal, 0.5 = half damage taken, 2.0 = double damage taken
   */
  playerDamageMultiplier: z.number().min(0.25).max(4).default(1),

  /**
   * Combat damage multiplier for enemies.
   * 1.0 = normal, 0.5 = enemies deal half damage
   */
  enemyDamageMultiplier: z.number().min(0.25).max(4).default(1),

  /**
   * Encounter frequency multiplier.
   * 1.0 = normal, 0.5 = half as many encounters
   */
  encounterFrequency: z.number().min(0).max(3).default(1),

  /**
   * Resource consumption rate (fatigue, provisions).
   * 1.0 = normal, 2.0 = resources deplete twice as fast
   */
  resourceConsumption: z.number().min(0.25).max(4).default(1),

  /**
   * Price modifier for shops.
   * 1.0 = normal prices, 1.5 = 50% more expensive
   */
  shopPriceModifier: z.number().min(0.5).max(3).default(1),

  /**
   * Experience gain modifier.
   * 1.0 = normal, 2.0 = double XP
   */
  xpMultiplier: z.number().min(0.25).max(4).default(1),

  /**
   * Does permadeath apply? (game over on death)
   */
  permadeath: z.boolean().default(false),

  /**
   * Can the player flee from all combat?
   */
  alwaysCanFlee: z.boolean().default(true),
});
export type DifficultyConfig = z.infer<typeof DifficultyConfigSchema>;

// ============================================================================
// SURVIVAL CONFIGURATION
// ============================================================================

/**
 * Survival mechanics configuration.
 */
export const SurvivalConfigSchema = z.object({
  /**
   * Is the fatigue system enabled?
   */
  fatigueEnabled: z.boolean().default(true),

  /**
   * Fatigue gain rate per game hour of travel.
   */
  fatigueGainRate: z.number().min(0).max(100).default(5),

  /**
   * Maximum fatigue before severe penalties.
   */
  maxFatigue: z.number().int().min(1).max(1000).default(100),

  /**
   * Fatigue recovery rate per hour of rest.
   */
  fatigueRecoveryRate: z.number().min(0).max(100).default(15),

  /**
   * Is the provisions system enabled?
   */
  provisionsEnabled: z.boolean().default(true),

  /**
   * Provisions consumed per game hour.
   */
  provisionsConsumeRate: z.number().min(0).max(10).default(0.5),

  /**
   * Maximum provisions capacity (without upgrades).
   */
  maxProvisions: z.number().int().min(1).max(1000).default(50),

  /**
   * Penalty when out of provisions.
   */
  noProvisionsEffect: z
    .object({
      fatigueMultiplier: z.number().min(1).max(10).default(2),
      healthDrainPerHour: z.number().min(0).max(50).default(5),
    })
    .default({
      fatigueMultiplier: 2,
      healthDrainPerHour: 5,
    }),
});
export type SurvivalConfig = z.infer<typeof SurvivalConfigSchema>;

// ============================================================================
// FACTION DEFINITION
// ============================================================================

/**
 * Faction definition for reputation tracking.
 */
export const FactionSchema = z.object({
  /** Unique faction identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Description */
  description: z.string(),

  /**
   * Starting reputation with this faction.
   * Range: -100 (hostile) to +100 (allied)
   */
  startingReputation: z.number().int().min(-100).max(100).default(0),

  /**
   * Reputation thresholds for relationship states.
   */
  reputationThresholds: z
    .object({
      hostile: z.number().int().default(-50),
      unfriendly: z.number().int().default(-20),
      neutral: z.number().int().default(0),
      friendly: z.number().int().default(20),
      allied: z.number().int().default(50),
    })
    .default({
      hostile: -50,
      unfriendly: -20,
      neutral: 0,
      friendly: 20,
      allied: 50,
    }),

  /**
   * Relations with other factions.
   * Key: faction ID, Value: relationship modifier (-100 to +100)
   * Positive = allied, Negative = hostile
   */
  factionRelations: z.record(z.string(), z.number().int().min(-100).max(100)).default({}),

  /** Color for UI display */
  color: z.string().optional(),

  /** Icon identifier */
  icon: z.string().optional(),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type Faction = z.infer<typeof FactionSchema>;

// ============================================================================
// STARTING CONDITION
// ============================================================================

/**
 * Starting conditions for a new game.
 */
export const StartingConditionsSchema = z.object({
  /**
   * Starting town ID.
   */
  townId: z.string(),

  /**
   * Entry point ID within the starting town.
   */
  entryPointId: z.string().optional(),

  /**
   * Starting gold amount.
   */
  gold: z.number().int().min(0).default(50),

  /**
   * Starting provisions amount.
   */
  provisions: z.number().int().min(0).default(20),

  /**
   * Starting player level.
   */
  level: z.number().int().min(1).max(10).default(1),

  /**
   * Starting health percentage (0-100).
   */
  healthPercent: z.number().int().min(1).max(100).default(100),

  /**
   * Starting fatigue level.
   */
  fatigue: z.number().int().min(0).max(100).default(0),

  /**
   * Starting inventory items.
   */
  inventory: z
    .array(
      z.object({
        itemId: z.string(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .default([]),

  /**
   * Starting equipment (weapon, armor slots).
   */
  equipment: z
    .object({
      weapon: z.string().optional(),
      armor: z.string().optional(),
      accessory: z.string().optional(),
    })
    .default({}),

  /**
   * Starting quests (auto-activated on new game).
   */
  activeQuests: z.array(z.string()).default([]),

  /**
   * Starting game flags.
   */
  flags: z.record(z.string(), z.boolean()).default({}),

  /**
   * Discovered towns at game start.
   */
  discoveredTowns: z.array(z.string()).default([]),

  /**
   * Discovered routes at game start.
   */
  discoveredRoutes: z.array(z.string()).default([]),
});
export type StartingConditions = z.infer<typeof StartingConditionsSchema>;

// ============================================================================
// WORLD CONFIGURATION
// ============================================================================

/**
 * Global world configuration settings.
 */
export const WorldConfigSchema = z.object({
  /** Time system configuration */
  time: TimeConfigSchema.optional(),

  /** Difficulty configuration */
  difficulty: DifficultyConfigSchema.optional(),

  /** Survival mechanics configuration */
  survival: SurvivalConfigSchema.optional(),

  /**
   * Maximum save slots.
   */
  maxSaveSlots: z.number().int().min(1).max(100).default(10),

  /**
   * Autosave interval in real minutes (0 = disabled).
   */
  autosaveIntervalMinutes: z.number().int().min(0).max(60).default(5),

  /**
   * Show tutorial prompts?
   */
  showTutorials: z.boolean().default(true),

  /**
   * Enable combat animations?
   */
  combatAnimations: z.boolean().default(true),

  /**
   * Game speed multiplier (for speedrunning).
   */
  gameSpeedMultiplier: z.number().min(0.5).max(4).default(1),
});
export type WorldConfig = z.infer<typeof WorldConfigSchema>;

// ============================================================================
// WORLD SCHEMA
// ============================================================================

/**
 * Complete game world definition.
 *
 * The World is the top-level container that combines:
 * - All towns in the game
 * - All routes connecting towns
 * - Faction definitions
 * - Global configuration
 * - Starting conditions
 *
 * This is the primary data structure for the authored world content.
 */
export const WorldDefinitionSchema = z.object({
  /** Unique world identifier */
  id: z.string(),

  /** Display name for the world */
  name: z.string(),

  /** World description */
  description: z.string(),

  /**
   * Schema version for save compatibility.
   * Increment when making breaking changes.
   */
  version: z.string(),

  /**
   * All towns in the world.
   * Can be inline definitions or references to external files.
   */
  towns: z.array(TownSchema),

  /**
   * All routes connecting towns.
   */
  routes: z.array(RouteSchema),

  /**
   * Faction definitions.
   */
  factions: z.array(FactionSchema).default([]),

  /**
   * Reference to the starting town ID.
   * Must exist in the towns array.
   */
  startingTownId: z.string(),

  /**
   * Starting conditions for new games.
   */
  startingConditions: StartingConditionsSchema,

  /**
   * Global world configuration.
   */
  config: WorldConfigSchema.optional(),

  /**
   * World map dimensions (for rendering).
   */
  mapDimensions: z
    .object({
      width: z.number().int().min(100).max(10000).default(1000),
      height: z.number().int().min(100).max(10000).default(1000),
    })
    .default({ width: 1000, height: 1000 }),

  /**
   * Main quest ID (for tracking progression).
   */
  mainQuestId: z.string().optional(),

  /**
   * Global timeline events.
   * Events that trigger based on game day/time.
   */
  timelineEvents: z
    .array(
      z.object({
        id: z.string(),
        day: z.number().int().min(1),
        hour: z.number().int().min(0).max(23).optional(),
        eventType: z.enum(['quest_start', 'dialogue', 'world_change', 'custom']),
        target: z.string().optional(),
        description: z.string().optional(),
        repeatable: z.boolean().default(false),
      })
    )
    .default([]),

  /**
   * World lore/backstory.
   */
  lore: z.string().optional(),

  /**
   * Author/credit information.
   */
  author: z.string().optional(),

  /**
   * Creation timestamp.
   */
  createdAt: z.number().int().optional(),

  /**
   * Last modification timestamp.
   */
  modifiedAt: z.number().int().optional(),

  /**
   * Tags for filtering and categorization.
   */
  tags: z.array(z.string()).default([]),
});
export type WorldDefinition = z.infer<typeof WorldDefinitionSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Parse and validate a world definition.
 * @throws ZodError if validation fails
 */
export function validateWorld(data: unknown): WorldDefinition {
  return WorldDefinitionSchema.parse(data);
}

/**
 * Safely parse a world definition, returning null on failure.
 */
export function safeParseWorld(data: unknown): WorldDefinition | null {
  const result = WorldDefinitionSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate world references and internal consistency.
 * Checks that all IDs reference valid objects.
 */
export function validateWorldIntegrity(world: WorldDefinition): string[] {
  const errors: string[] = [];

  // Build lookup sets
  const townIds = new Set(world.towns.map((t) => t.id));
  const routeIds = new Set(world.routes.map((r) => r.id));
  const factionIds = new Set(world.factions.map((f) => f.id));

  // Validate starting town exists
  if (!townIds.has(world.startingTownId)) {
    errors.push(`Starting town "${world.startingTownId}" not found in towns list`);
  }

  // Validate starting conditions reference valid entities
  if (!townIds.has(world.startingConditions.townId)) {
    errors.push(
      `Starting conditions town "${world.startingConditions.townId}" not found`
    );
  }

  for (const townId of world.startingConditions.discoveredTowns) {
    if (!townIds.has(townId)) {
      errors.push(`Discovered town "${townId}" in starting conditions not found`);
    }
  }

  for (const routeId of world.startingConditions.discoveredRoutes) {
    if (!routeIds.has(routeId)) {
      errors.push(`Discovered route "${routeId}" in starting conditions not found`);
    }
  }

  // Validate route references
  for (const route of world.routes) {
    if (!townIds.has(route.fromTown)) {
      errors.push(`Route "${route.id}" references unknown fromTown "${route.fromTown}"`);
    }
    if (!townIds.has(route.toTown)) {
      errors.push(`Route "${route.id}" references unknown toTown "${route.toTown}"`);
    }
  }

  // Validate town entry points reference valid routes
  for (const town of world.towns) {
    for (const entry of town.entryPoints) {
      if (entry.routeId && !routeIds.has(entry.routeId)) {
        errors.push(
          `Town "${town.id}" entry point "${entry.id}" references unknown route "${entry.routeId}"`
        );
      }
    }

    // Validate controlling faction
    if (town.controllingFaction && !factionIds.has(town.controllingFaction)) {
      errors.push(
        `Town "${town.id}" references unknown faction "${town.controllingFaction}"`
      );
    }
  }

  // Validate faction relations reference valid factions
  for (const faction of world.factions) {
    for (const relatedId of Object.keys(faction.factionRelations)) {
      if (!factionIds.has(relatedId)) {
        errors.push(
          `Faction "${faction.id}" has relation with unknown faction "${relatedId}"`
        );
      }
    }
  }

  // Validate timeline events
  for (const event of world.timelineEvents) {
    if (event.eventType === 'quest_start' && !event.target) {
      errors.push(`Timeline event "${event.id}" is quest_start but has no target`);
    }
  }

  return errors;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a town by ID from a world definition.
 */
export function getTownById(world: WorldDefinition, townId: string): Town | undefined {
  return world.towns.find((t) => t.id === townId);
}

/**
 * Get a route by ID from a world definition.
 */
export function getRouteById(world: WorldDefinition, routeId: string): Route | undefined {
  return world.routes.find((r) => r.id === routeId);
}

/**
 * Get a faction by ID from a world definition.
 */
export function getFactionById(
  world: WorldDefinition,
  factionId: string
): Faction | undefined {
  return world.factions.find((f) => f.id === factionId);
}

/**
 * Get all routes connected to a town.
 */
export function getRoutesForTown(world: WorldDefinition, townId: string): Route[] {
  return world.routes.filter(
    (r) =>
      r.fromTown === townId || (r.bidirectional && r.toTown === townId)
  );
}

/**
 * Get all towns directly connected to a given town via routes.
 */
export function getConnectedTowns(world: WorldDefinition, townId: string): Town[] {
  const connectedIds = new Set<string>();

  for (const route of world.routes) {
    if (route.fromTown === townId) {
      connectedIds.add(route.toTown);
    } else if (route.bidirectional && route.toTown === townId) {
      connectedIds.add(route.fromTown);
    }
  }

  return world.towns.filter((t) => connectedIds.has(t.id));
}

/**
 * Find a route between two towns.
 */
export function findRoute(
  world: WorldDefinition,
  fromTownId: string,
  toTownId: string
): Route | undefined {
  return world.routes.find(
    (r) =>
      (r.fromTown === fromTownId && r.toTown === toTownId) ||
      (r.bidirectional && r.fromTown === toTownId && r.toTown === fromTownId)
  );
}

/**
 * Calculate total travel time between two towns.
 * Returns Infinity if no route exists.
 */
export function calculateRouteTravelTime(
  world: WorldDefinition,
  fromTownId: string,
  toTownId: string,
  method: 'walk' | 'horse' | 'stagecoach' | 'train' = 'walk'
): number {
  const route = findRoute(world, fromTownId, toTownId);
  if (!route) return Infinity;

  const travelMethods = route.travelMethods ?? [];

  // Find travel method config
  const methodConfig = travelMethods.find((m) => m.method === method);
  if (!methodConfig?.available) {
    // Fall back to walking
    const walkConfig = travelMethods.find((m) => m.method === 'walk');
    if (!walkConfig?.available) return Infinity;
    return route.length;
  }

  return Math.ceil(route.length / methodConfig.speedModifier);
}

/**
 * Get the current time of day from game hours.
 */
export function getTimeOfDay(
  hour: number,
  config: TimeConfig
): 'morning' | 'afternoon' | 'evening' | 'night' {
  const { morningStart, afternoonStart, eveningStart, nightStart } = config.dayBoundaries;

  if (hour >= nightStart || hour < morningStart) return 'night';
  if (hour >= eveningStart) return 'evening';
  if (hour >= afternoonStart) return 'afternoon';
  return 'morning';
}

/**
 * Get difficulty modifier values from preset.
 */
export function getDifficultyModifiers(preset: DifficultyPreset): Partial<DifficultyConfig> {
  const presets: Record<DifficultyPreset, Partial<DifficultyConfig>> = {
    easy: {
      playerDamageMultiplier: 0.75,
      enemyDamageMultiplier: 0.75,
      encounterFrequency: 0.7,
      resourceConsumption: 0.75,
      shopPriceModifier: 0.85,
      xpMultiplier: 1.25,
      alwaysCanFlee: true,
    },
    normal: {
      playerDamageMultiplier: 1,
      enemyDamageMultiplier: 1,
      encounterFrequency: 1,
      resourceConsumption: 1,
      shopPriceModifier: 1,
      xpMultiplier: 1,
      alwaysCanFlee: true,
    },
    hard: {
      playerDamageMultiplier: 1.25,
      enemyDamageMultiplier: 1.25,
      encounterFrequency: 1.3,
      resourceConsumption: 1.25,
      shopPriceModifier: 1.2,
      xpMultiplier: 0.85,
      alwaysCanFlee: false,
    },
    brutal: {
      playerDamageMultiplier: 1.5,
      enemyDamageMultiplier: 1.5,
      encounterFrequency: 1.5,
      resourceConsumption: 1.5,
      shopPriceModifier: 1.5,
      xpMultiplier: 0.5,
      alwaysCanFlee: false,
      permadeath: true,
    },
  };

  return presets[preset];
}

// ============================================================================
// SCHEMA VERSION
// ============================================================================

export const WORLD_SCHEMA_VERSION = '1.0.0';
