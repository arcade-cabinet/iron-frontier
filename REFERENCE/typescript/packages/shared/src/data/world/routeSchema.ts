/**
 * Iron Frontier - Route Schema Definitions
 *
 * Zod-backed schemas for travel routes between towns.
 * Routes are the connective tissue of the world, providing:
 * - Travel time and distance
 * - Random encounter tables
 * - Scripted events and landmarks
 * - Terrain and atmospheric details
 *
 * Architecture:
 * - Routes connect two towns via fromTown/toTown references
 * - Encounters are weighted for random selection
 * - Events trigger at specific points or conditions
 * - Landmarks are discoverable points of interest
 *
 * Design principles:
 * - Routes are bidirectional by default
 * - Travel time is in game-minutes (1 real minute = 30 game minutes default)
 * - Encounters scale with player level and route danger
 */

import { z } from 'zod';

// ============================================================================
// TERRAIN TYPE
// ============================================================================

/**
 * Terrain types that define a route's environment.
 * Affects visuals, encounter types, and travel speed.
 */
export const RouteTerrainSchema = z.enum([
  'desert', // Hot, sandy, sparse vegetation
  'plains', // Flat grassland, occasional trees
  'mountains', // Rocky terrain, elevation changes
  'badlands', // Canyons, mesas, harsh environment
  'riverside', // Along water, fertile ground
  'forest', // Dense tree cover
  'scrubland', // Dry brush, rocky soil
  'salt_flat', // Barren mineral deposits
]);
export type RouteTerrain = z.infer<typeof RouteTerrainSchema>;

// ============================================================================
// ROUTE CONDITION
// ============================================================================

/**
 * Current condition of a route affecting travel.
 */
export const RouteConditionSchema = z.enum([
  'clear', // Normal travel
  'rough', // Slower travel, minor hazards
  'dangerous', // Increased encounters
  'blocked', // Impassable without special action
  'flooded', // Water hazard, very slow
  'snowed_in', // Winter conditions
]);
export type RouteCondition = z.infer<typeof RouteConditionSchema>;

// ============================================================================
// ENCOUNTER DEFINITION
// ============================================================================

/**
 * Encounter trigger conditions.
 * Determines when an encounter can occur.
 */
export const EncounterTriggerSchema = z.object({
  /** Time of day restriction */
  timeOfDay: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])).optional(),

  /** Minimum player level */
  minLevel: z.number().int().min(1).optional(),

  /** Maximum player level */
  maxLevel: z.number().int().min(1).optional(),

  /** Required game flag */
  requiresFlag: z.string().optional(),

  /** Excluded if flag is set */
  excludeIfFlag: z.string().optional(),

  /** Weather condition */
  weather: z.array(z.enum(['clear', 'rain', 'storm', 'sandstorm', 'fog'])).optional(),
});
export type EncounterTrigger = z.infer<typeof EncounterTriggerSchema>;

/**
 * Route encounter definition.
 * Encounters can be combat, dialogue, or environmental events.
 */
export const RouteEncounterSchema = z.object({
  /** Unique encounter ID within the route */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Encounter type */
  type: z.enum([
    'combat', // Hostile encounter, triggers combat
    'trader', // Traveling merchant
    'traveler', // Non-hostile NPC
    'event', // Environmental or scripted event
    'ambush', // Surprise combat encounter
    'wildlife', // Animal encounter (may be hostile)
  ]),

  /**
   * Probability weight for random selection.
   * Higher weight = more likely to occur.
   */
  weight: z.number().min(0),

  /**
   * Reference to encounter template or combat encounter ID.
   * Used to spawn the actual encounter content.
   */
  templateId: z.string().optional(),

  /**
   * Enemy composition for combat encounters.
   * Can reference enemy IDs directly for simple encounters.
   */
  enemies: z
    .array(
      z.object({
        enemyId: z.string(),
        count: z.number().int().min(1).max(10),
        levelScale: z.number().min(0.5).max(2),
      })
    )
    .optional(),

  /**
   * Trigger conditions for this encounter.
   * All conditions must be met for encounter to be eligible.
   */
  conditions: EncounterTriggerSchema.optional(),

  /**
   * Description shown when encounter begins.
   */
  description: z.string().optional(),

  /**
   * Can this encounter repeat on subsequent trips?
   * Defaults to true if not specified.
   */
  repeatable: z.boolean().optional(),

  /**
   * Rewards for completing this encounter (if applicable).
   */
  rewards: z
    .object({
      xp: z.number().int().min(0),
      gold: z.number().int().min(0),
      items: z
        .array(
          z.object({
            itemId: z.string(),
            quantity: z.number().int().min(1),
            chance: z.number().min(0).max(1),
          })
        )
        .optional(),
    })
    .optional(),

  /**
   * Tags for filtering and categorization.
   */
  tags: z.array(z.string()).optional(),
});
export type RouteEncounter = z.infer<typeof RouteEncounterSchema>;

// ============================================================================
// SCRIPTED EVENT
// ============================================================================

/**
 * Event trigger types for scripted events.
 */
export const EventTriggerTypeSchema = z.enum([
  'distance', // Triggers at specific distance along route
  'first_visit', // Triggers only on first traversal
  'time', // Triggers at specific game time
  'random', // Random chance each traversal
  'quest', // Triggers when quest is active
  'flag', // Triggers when game flag is set
]);
export type EventTriggerType = z.infer<typeof EventTriggerTypeSchema>;

/**
 * Scripted event definition.
 * Unlike random encounters, scripted events have specific triggers
 * and may advance narrative or introduce story elements.
 */
export const RouteEventSchema = z.object({
  /** Unique event ID */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Event description/narration */
  description: z.string(),

  /** Trigger type */
  triggerType: EventTriggerTypeSchema,

  /**
   * Trigger configuration based on type:
   * - distance: value is 0-1 (percentage along route)
   * - time: value is game hour (0-23)
   * - random: value is probability (0-1)
   */
  triggerValue: z.number().optional(),

  /** Quest ID for quest-triggered events */
  questId: z.string().optional(),

  /** Flag name for flag-triggered events */
  flagName: z.string().optional(),

  /**
   * Effects when event triggers.
   */
  effects: z
    .array(
      z.object({
        type: z.enum([
          'set_flag', // Set a game flag
          'give_item', // Add item to inventory
          'take_item', // Remove item from inventory
          'start_combat', // Begin combat encounter
          'dialogue', // Show dialogue
          'discovery', // Discover a location
          'reputation', // Change faction reputation
        ]),
        target: z.string().optional(),
        value: z.number().optional(),
        stringValue: z.string().optional(),
      })
    )
    .default([]),

  /** Dialogue tree ID for dialogue events */
  dialogueTreeId: z.string().optional(),

  /** Combat encounter ID for combat events */
  combatEncounterId: z.string().optional(),

  /** Can this event trigger again after completing? */
  repeatable: z.boolean().default(false),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type RouteEvent = z.infer<typeof RouteEventSchema>;

// ============================================================================
// LANDMARK
// ============================================================================

/**
 * Landmark types found along routes.
 */
export const LandmarkTypeSchema = z.enum([
  'camp', // Resting spot
  'ruins', // Abandoned structures
  'oasis', // Water source in desert
  'cave', // Cave entrance
  'overlook', // Scenic viewpoint
  'waystation', // Rest stop with services
  'grave', // Burial site
  'wreckage', // Vehicle/wagon wreck
  'monument', // Statue or marker
  'mine_entrance', // Mine access point
  'spring', // Natural water source
  'crossroads', // Junction point
]);
export type LandmarkType = z.infer<typeof LandmarkTypeSchema>;

/**
 * Landmark definition - a point of interest along a route.
 * Landmarks can provide resources, lore, or side activities.
 */
export const RouteLandmarkSchema = z.object({
  /** Unique landmark ID */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Landmark type */
  type: LandmarkTypeSchema,

  /** Description for player */
  description: z.string(),

  /**
   * Position along the route (0-1, where 0 = fromTown, 1 = toTown).
   */
  position: z.number().min(0).max(1),

  /**
   * Is this landmark discovered by default?
   */
  startDiscovered: z.boolean().default(false),

  /**
   * Can player rest here?
   */
  canRest: z.boolean().default(false),

  /**
   * Rest quality (affects recovery rate).
   * 0.5 = poor, 1.0 = normal, 1.5 = good
   */
  restQuality: z.number().min(0.1).max(2).default(1),

  /**
   * Resources available at this landmark.
   */
  resources: z
    .array(
      z.object({
        type: z.enum(['water', 'food', 'ore', 'wood', 'herbs']),
        quantity: z.number().int().min(1),
        respawnHours: z.number().int().min(0).optional(),
      })
    )
    .default([]),

  /**
   * Loot containers at this landmark.
   */
  containers: z
    .array(
      z.object({
        id: z.string(),
        lootTableId: z.string(),
        locked: z.boolean().default(false),
        lockDifficulty: z.number().int().min(0).max(100).optional(),
      })
    )
    .default([]),

  /**
   * NPCs present at this landmark.
   */
  npcIds: z.array(z.string()).default([]),

  /**
   * Associated quest IDs.
   */
  questIds: z.array(z.string()).default([]),

  /**
   * Lore text for world-building.
   */
  lore: z.string().optional(),

  /**
   * Tags for filtering.
   */
  tags: z.array(z.string()).default([]),
});
export type RouteLandmark = z.infer<typeof RouteLandmarkSchema>;

// ============================================================================
// ROUTE SCHEMA
// ============================================================================

/**
 * Complete route definition connecting two towns.
 *
 * Routes represent the paths players travel between settlements.
 * They contain:
 * - Random encounter tables
 * - Scripted story events
 * - Discoverable landmarks
 * - Environmental hazards
 */
export const RouteSchema = z.object({
  /** Unique route identifier */
  id: z.string(),

  /** Display name shown on map and in UI */
  name: z.string(),

  /** Flavor description of the route */
  description: z.string(),

  /**
   * Origin town ID.
   * Route starts from this town.
   */
  fromTown: z.string(),

  /**
   * Destination town ID.
   * Route ends at this town.
   */
  toTown: z.string(),

  /**
   * Primary terrain type.
   * Affects visuals and encounter types.
   */
  terrain: RouteTerrainSchema,

  /**
   * Secondary terrain for variety (optional).
   */
  secondaryTerrain: RouteTerrainSchema.optional(),

  /**
   * Base travel time in game-minutes.
   * Default time scale: 1 game hour = 2 real minutes.
   * So 15 game-minutes = 30 real seconds.
   */
  length: z.number().int().min(1),

  /**
   * Current route condition.
   * Can be modified by events or weather. Defaults to 'clear'.
   */
  condition: RouteConditionSchema.optional(),

  /**
   * Base danger level (0-10).
   * Affects encounter frequency and difficulty. Defaults to 3.
   */
  dangerLevel: z.number().int().min(0).max(10).optional(),

  /**
   * Random encounters that can occur on this route.
   */
  encounters: z.array(RouteEncounterSchema).optional(),

  /**
   * Encounter frequency modifier.
   * 1.0 = normal, 0.5 = half as often, 2.0 = twice as often.
   */
  encounterFrequency: z.number().min(0).max(5).optional(),

  /**
   * Scripted events that can trigger on this route.
   */
  events: z.array(RouteEventSchema).optional(),

  /**
   * Landmarks and points of interest along the route.
   */
  landmarks: z.array(RouteLandmarkSchema).optional(),

  /**
   * Is this route bidirectional?
   * If false, can only travel fromTown -> toTown. Defaults to true.
   */
  bidirectional: z.boolean().optional(),

  /**
   * Is this route passable currently?
   * Can be blocked by story events. Defaults to true.
   */
  passable: z.boolean().optional(),

  /**
   * Reason for blocked state (if passable = false).
   */
  blockedReason: z.string().optional(),

  /**
   * Unlock condition for this route.
   * If set, route is hidden/blocked until condition is met.
   */
  unlockCondition: z
    .object({
      type: z.enum(['quest_complete', 'flag', 'item', 'always']),
      target: z.string().optional(),
    })
    .optional(),

  /**
   * Travel method available on this route.
   */
  travelMethods: z
    .array(
      z.object({
        method: z.enum(['walk', 'horse', 'stagecoach', 'train']),
        available: z.boolean(),
        speedModifier: z.number().min(0.5).max(5),
        cost: z.number().int().min(0),
      })
    )
    .optional(),

  /**
   * Weather patterns common on this route.
   */
  weatherPatterns: z
    .array(
      z.object({
        type: z.enum(['clear', 'rain', 'storm', 'sandstorm', 'fog', 'snow']),
        probability: z.number().min(0).max(1),
        seasonRestriction: z.array(z.enum(['spring', 'summer', 'fall', 'winter'])).optional(),
      })
    )
    .optional(),

  /**
   * Visual waypoints for rendering the route on the map.
   */
  waypoints: z
    .array(
      z.object({
        x: z.number(),
        z: z.number(),
      })
    )
    .optional(),

  /**
   * Lore/history for the route.
   */
  lore: z.string().optional(),

  /**
   * Tags for filtering and categorization.
   */
  tags: z.array(z.string()).optional(),
});
export type Route = z.infer<typeof RouteSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Parse and validate a route definition.
 * @throws ZodError if validation fails
 */
export function validateRoute(data: unknown): Route {
  return RouteSchema.parse(data);
}

/**
 * Safely parse a route definition, returning null on failure.
 */
export function safeParseRoute(data: unknown): Route | null {
  const result = RouteSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate route references and internal consistency.
 */
export function validateRouteIntegrity(route: Route): string[] {
  const errors: string[] = [];
  const landmarks = route.landmarks ?? [];
  const encounters = route.encounters ?? [];
  const events = route.events ?? [];

  // Check landmark positions are valid
  for (const landmark of landmarks) {
    if (landmark.position < 0 || landmark.position > 1) {
      errors.push(
        `Landmark "${landmark.name}" has invalid position ${landmark.position} (must be 0-1)`
      );
    }
  }

  // Check encounter weights are positive
  for (const encounter of encounters) {
    if (encounter.weight < 0) {
      errors.push(`Encounter "${encounter.name}" has negative weight`);
    }
  }

  // Check event trigger values are valid
  for (const event of events) {
    if (event.triggerType === 'distance') {
      if (
        event.triggerValue === undefined ||
        event.triggerValue < 0 ||
        event.triggerValue > 1
      ) {
        errors.push(`Event "${event.name}" has invalid distance trigger value`);
      }
    }
    if (event.triggerType === 'time') {
      if (
        event.triggerValue === undefined ||
        event.triggerValue < 0 ||
        event.triggerValue > 23
      ) {
        errors.push(`Event "${event.name}" has invalid time trigger value`);
      }
    }
    if (event.triggerType === 'random') {
      if (
        event.triggerValue === undefined ||
        event.triggerValue < 0 ||
        event.triggerValue > 1
      ) {
        errors.push(`Event "${event.name}" has invalid random trigger value`);
      }
    }
  }

  return errors;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Select a random encounter from a route based on weights.
 */
export function selectRandomEncounter(
  route: Route,
  filter?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    playerLevel?: number;
    flags?: Record<string, boolean>;
  }
): RouteEncounter | null {
  const encounters = route.encounters ?? [];
  if (encounters.length === 0) return null;

  // Filter eligible encounters
  const eligible = encounters.filter((enc) => {
    if (!enc.conditions) return true;

    const cond = enc.conditions;

    if (cond.timeOfDay && filter?.timeOfDay) {
      if (!cond.timeOfDay.includes(filter.timeOfDay)) return false;
    }

    if (cond.minLevel && filter?.playerLevel !== undefined) {
      if (filter.playerLevel < cond.minLevel) return false;
    }

    if (cond.maxLevel && filter?.playerLevel !== undefined) {
      if (filter.playerLevel > cond.maxLevel) return false;
    }

    if (cond.requiresFlag && filter?.flags) {
      if (!filter.flags[cond.requiresFlag]) return false;
    }

    if (cond.excludeIfFlag && filter?.flags) {
      if (filter.flags[cond.excludeIfFlag]) return false;
    }

    return true;
  });

  if (eligible.length === 0) return null;

  // Calculate total weight
  const totalWeight = eligible.reduce((sum, enc) => sum + enc.weight, 0);
  if (totalWeight <= 0) return null;

  // Random selection based on weight
  let random = Math.random() * totalWeight;
  for (const encounter of eligible) {
    random -= encounter.weight;
    if (random <= 0) return encounter;
  }

  return eligible[eligible.length - 1];
}

/**
 * Get landmarks within a distance range along the route.
 */
export function getLandmarksInRange(
  route: Route,
  startPosition: number,
  endPosition: number
): RouteLandmark[] {
  const landmarks = route.landmarks ?? [];
  const min = Math.min(startPosition, endPosition);
  const max = Math.max(startPosition, endPosition);
  return landmarks.filter((l) => l.position >= min && l.position <= max);
}

/**
 * Calculate actual travel time based on method and conditions.
 */
export function calculateTravelTime(
  route: Route,
  method: 'walk' | 'horse' | 'stagecoach' | 'train' = 'walk'
): number {
  // Base time
  let time = route.length;

  // Apply method modifier
  const travelMethods = route.travelMethods ?? [];
  const methodConfig = travelMethods.find((m) => m.method === method);
  if (methodConfig?.available) {
    time = Math.ceil(time / methodConfig.speedModifier);
  }

  // Apply condition modifier
  const conditionModifiers: Record<RouteCondition, number> = {
    clear: 1,
    rough: 1.3,
    dangerous: 1.1,
    blocked: Infinity,
    flooded: 2,
    snowed_in: 1.8,
  };
  const condition = route.condition ?? 'clear';
  time = Math.ceil(time * conditionModifiers[condition]);

  return time;
}

/**
 * Check if a route is passable.
 */
export function isRoutePassable(
  route: Route,
  gameState?: {
    completedQuests?: string[];
    flags?: Record<string, boolean>;
    inventory?: string[];
  }
): boolean {
  // Default passable to true if not specified
  if (route.passable === false) return false;
  if ((route.condition ?? 'clear') === 'blocked') return false;

  if (route.unlockCondition) {
    const cond = route.unlockCondition;
    switch (cond.type) {
      case 'always':
        return true;
      case 'quest_complete':
        return cond.target
          ? (gameState?.completedQuests ?? []).includes(cond.target)
          : true;
      case 'flag':
        return cond.target ? gameState?.flags?.[cond.target] === true : true;
      case 'item':
        return cond.target ? (gameState?.inventory ?? []).includes(cond.target) : true;
    }
  }

  return true;
}

// ============================================================================
// SCHEMA VERSION
// ============================================================================

export const ROUTE_SCHEMA_VERSION = '1.0.0';
