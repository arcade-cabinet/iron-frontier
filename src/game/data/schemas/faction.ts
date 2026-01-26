/**
 * Iron Frontier - Faction Reputation Schema Definitions
 *
 * Comprehensive faction system with reputation tracking, tiered benefits,
 * opposing dynamics, and reputation decay.
 *
 * Design principles:
 * - Reputation is faction-specific (-100 to +100 scale)
 * - Actions have ripple effects across allied/opposing factions
 * - Reputation affects prices, access, quest availability, and NPC behavior
 * - Gradual decay toward neutral over time
 */

import { z } from 'zod';

// ============================================================================
// REPUTATION TIERS
// ============================================================================

/**
 * Reputation tier names from worst to best
 */
export const ReputationTierSchema = z.enum([
  'hated', // -100 to -61
  'hostile', // -60 to -31
  'unfriendly', // -30 to -11
  'neutral', // -10 to +10
  'friendly', // +11 to +30
  'honored', // +31 to +60
  'revered', // +61 to +100
]);
export type ReputationTier = z.infer<typeof ReputationTierSchema>;

/**
 * Reputation tier boundaries and names
 */
export const REPUTATION_TIER_BOUNDARIES = {
  hated: { min: -100, max: -61 },
  hostile: { min: -60, max: -31 },
  unfriendly: { min: -30, max: -11 },
  neutral: { min: -10, max: 10 },
  friendly: { min: 11, max: 30 },
  honored: { min: 31, max: 60 },
  revered: { min: 61, max: 100 },
} as const;

// ============================================================================
// FACTION ACTION TYPES
// ============================================================================

/**
 * Categories of actions that can affect reputation
 */
export const FactionActionCategorySchema = z.enum([
  'quest', // Completing quests for/against faction
  'combat', // Killing faction members or enemies
  'trade', // Trading with faction merchants
  'dialogue', // Conversation choices
  'crime', // Theft, assault, trespassing
  'assistance', // Helping faction members
  'betrayal', // Breaking trust, revealing secrets
  'donation', // Giving money/items to faction
  'discovery', // Finding important locations/info
  'sabotage', // Damaging faction property/operations
]);
export type FactionActionCategory = z.infer<typeof FactionActionCategorySchema>;

/**
 * An action that affects faction reputation
 */
export const FactionActionSchema = z.object({
  /** Unique action identifier */
  id: z.string(),

  /** Human-readable name */
  name: z.string(),

  /** Description of the action */
  description: z.string(),

  /** Action category */
  category: FactionActionCategorySchema,

  /** Base reputation change for primary faction */
  reputationDelta: z.number().int().min(-100).max(100),

  /** Can this action only be done once? (default: false) */
  oneTime: z.boolean().optional(),

  /** Cooldown in game hours if repeatable */
  cooldownHours: z.number().int().min(0).optional(),

  /** Tags for filtering */
  tags: z.array(z.string()).optional(),
});
export type FactionAction = z.infer<typeof FactionActionSchema>;

// ============================================================================
// FACTION TIER EFFECTS
// ============================================================================

/**
 * Effects granted at each reputation tier
 */
export const FactionTierEffectsSchema = z.object({
  /** Tier name */
  tier: ReputationTierSchema,

  /** Price modifier for faction shops (1.0 = normal) */
  priceModifier: z.number().min(0.5).max(2.0),

  /** Quest availability modifier (0-1) */
  questAvailability: z.number().min(0).max(1),

  /** Can access faction-controlled areas? */
  areaAccess: z.boolean(),

  /** Are faction members hostile on sight? */
  attackOnSight: z.boolean(),

  /** Can trade with faction merchants? */
  canTrade: z.boolean(),

  /** Greeting dialogue snippets */
  greetingSnippets: z.array(z.string()).default([]),

  /** Special perks/abilities unlocked */
  perks: z.array(z.string()).default([]),

  /** Description of tier benefits/penalties */
  description: z.string(),
});
export type FactionTierEffects = z.infer<typeof FactionTierEffectsSchema>;

// ============================================================================
// FACTION RELATIONSHIP
// ============================================================================

/**
 * Relationship between two factions
 * Determines how actions affecting one faction ripple to another
 */
export const FactionRelationshipSchema = z.object({
  /** The other faction ID */
  factionId: z.string(),

  /** Relationship type */
  relationship: z.enum(['allied', 'friendly', 'neutral', 'rival', 'hostile']),

  /** Reputation ripple multiplier (-1.0 to 1.0)
   * Positive: helping faction A helps faction B
   * Negative: helping faction A hurts faction B
   */
  rippleMultiplier: z.number().min(-1).max(1),

  /** Notes on the relationship */
  notes: z.string().optional(),
});
export type FactionRelationship = z.infer<typeof FactionRelationshipSchema>;

// ============================================================================
// FACTION DEFINITION
// ============================================================================

/**
 * Complete faction definition
 */
export const FactionDefinitionSchema = z.object({
  /** Unique faction identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Full name/title */
  fullName: z.string(),

  /** Short description */
  description: z.string(),

  /** Detailed lore/backstory */
  lore: z.string(),

  /** Faction type */
  type: z.enum([
    'corporation', // Business/industry
    'outlaw', // Criminal organization
    'resistance', // Underground movement
    'authority', // Law enforcement
    'civilian', // General population
    'religious', // Religious organization
    'guild', // Trade guild
    'military', // Armed forces
  ]),

  /** Primary color (hex) for UI */
  primaryColor: z.string(),

  /** Secondary color (hex) for UI */
  secondaryColor: z.string(),

  /** Icon identifier */
  iconId: z.string().optional(),

  /** Headquarters location ID */
  headquartersId: z.string().optional(),

  /** Controlled location IDs */
  controlledLocations: z.array(z.string()).default([]),

  /** Key NPCs (leaders, merchants, etc.) */
  keyNpcIds: z.array(z.string()).default([]),

  /** Starting reputation for new players */
  defaultReputation: z.number().int().min(-100).max(100).default(0),

  /** Tier effects at each reputation level */
  tierEffects: z.array(FactionTierEffectsSchema).length(7),

  /** Relationships with other factions */
  relationships: z.array(FactionRelationshipSchema).default([]),

  /** Actions that affect this faction's reputation */
  actions: z.array(FactionActionSchema).default([]),

  /** Reputation decay rate per game day toward neutral (0 = no decay) */
  decayRatePerDay: z.number().min(0).max(5).default(1),

  /** Minimum reputation before decay stops (absolute value) */
  decayThreshold: z.number().int().min(0).max(100).default(5),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type FactionDefinition = z.infer<typeof FactionDefinitionSchema>;

// ============================================================================
// PLAYER FACTION STATE (Runtime)
// ============================================================================

/**
 * Player's standing with a faction
 */
export const PlayerFactionStandingSchema = z.object({
  /** Faction ID */
  factionId: z.string(),

  /** Current reputation (-100 to 100) */
  reputation: z.number().int().min(-100).max(100),

  /** Current tier */
  currentTier: ReputationTierSchema,

  /** Actions completed (for one-time tracking) */
  completedActionIds: z.array(z.string()).default([]),

  /** Action cooldowns (actionId -> game hour when available) */
  actionCooldowns: z.record(z.string(), z.number()).default({}),

  /** Last game hour when decay was applied */
  lastDecayHour: z.number().default(0),

  /** Highest reputation ever achieved */
  peakReputation: z.number().int().min(-100).max(100),

  /** Lowest reputation ever reached */
  lowestReputation: z.number().int().min(-100).max(100),
});
export type PlayerFactionStanding = z.infer<typeof PlayerFactionStandingSchema>;

/**
 * Complete player faction state
 */
export const PlayerFactionStateSchema = z.object({
  /** Standings with each faction */
  standings: z.record(z.string(), PlayerFactionStandingSchema),

  /** Total reputation changes made */
  totalReputationChanges: z.number().int().default(0),

  /** Last time factions were updated */
  lastUpdated: z.number().default(0),
});
export type PlayerFactionState = z.infer<typeof PlayerFactionStateSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateFactionDefinition(data: unknown): FactionDefinition {
  return FactionDefinitionSchema.parse(data);
}

export function validateFactionAction(data: unknown): FactionAction {
  return FactionActionSchema.parse(data);
}

export function validatePlayerFactionStanding(data: unknown): PlayerFactionStanding {
  return PlayerFactionStandingSchema.parse(data);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the reputation tier for a given reputation value
 */
export function getReputationTier(reputation: number): ReputationTier {
  const clamped = Math.max(-100, Math.min(100, reputation));

  if (clamped <= -61) return 'hated';
  if (clamped <= -31) return 'hostile';
  if (clamped <= -11) return 'unfriendly';
  if (clamped <= 10) return 'neutral';
  if (clamped <= 30) return 'friendly';
  if (clamped <= 60) return 'honored';
  return 'revered';
}

/**
 * Get the numeric index of a tier (0-6)
 */
export function getTierIndex(tier: ReputationTier): number {
  const tiers: ReputationTier[] = [
    'hated',
    'hostile',
    'unfriendly',
    'neutral',
    'friendly',
    'honored',
    'revered',
  ];
  return tiers.indexOf(tier);
}

/**
 * Get reputation value needed to reach a tier
 */
export function getReputationForTier(tier: ReputationTier): number {
  switch (tier) {
    case 'hated':
      return -100;
    case 'hostile':
      return -60;
    case 'unfriendly':
      return -30;
    case 'neutral':
      return 0;
    case 'friendly':
      return 11;
    case 'honored':
      return 31;
    case 'revered':
      return 61;
  }
}

/**
 * Calculate reputation change with modifiers
 */
export function calculateReputationChange(
  baseDelta: number,
  currentReputation: number,
  options?: {
    /** Bonus multiplier (e.g., from perks) */
    bonusMultiplier?: number;
    /** Cap the change to stay within current tier */
    capToTier?: boolean;
  }
): number {
  let delta = baseDelta;

  // Apply bonus multiplier
  if (options?.bonusMultiplier) {
    delta = Math.round(delta * options.bonusMultiplier);
  }

  // Calculate new reputation
  let newReputation = currentReputation + delta;
  newReputation = Math.max(-100, Math.min(100, newReputation));

  // Cap to tier if requested
  if (options?.capToTier) {
    const currentTier = getReputationTier(currentReputation);
    const boundaries = REPUTATION_TIER_BOUNDARIES[currentTier];
    newReputation = Math.max(boundaries.min, Math.min(boundaries.max, newReputation));
  }

  return newReputation - currentReputation;
}

/**
 * Apply reputation decay toward neutral
 */
export function applyReputationDecay(
  currentReputation: number,
  decayRate: number,
  decayThreshold: number,
  hoursElapsed: number
): number {
  // No decay if within threshold of neutral
  if (Math.abs(currentReputation) <= decayThreshold) {
    return currentReputation;
  }

  // Calculate total decay
  const totalDecay = decayRate * (hoursElapsed / 24);

  // Decay toward zero
  if (currentReputation > 0) {
    return Math.max(decayThreshold, Math.round(currentReputation - totalDecay));
  } else {
    return Math.min(-decayThreshold, Math.round(currentReputation + totalDecay));
  }
}

export const FACTION_SCHEMA_VERSION = '1.0.0';
