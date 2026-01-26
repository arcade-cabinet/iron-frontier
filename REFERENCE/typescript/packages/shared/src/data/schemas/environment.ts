/**
 * Iron Frontier - Environment Schema Definitions
 *
 * Zod-backed schemas for weather systems, environmental hazards,
 * and time-based effects. These systems affect gameplay through
 * movement penalties, combat modifiers, and survival mechanics.
 *
 * Weather state machine:
 * - Each biome has weighted probabilities for weather types
 * - Weather transitions occur at configurable intervals
 * - Extreme weather has gameplay consequences
 *
 * Environmental hazards:
 * - Location-specific dangers
 * - Require skill checks or items to navigate
 * - Can cause damage, status effects, or death
 *
 * Time effects:
 * - Day/night cycle affects visibility and encounters
 * - Seasons modify base weather probabilities
 * - Dawn/dusk transitions provide gameplay opportunities
 */

import { z } from 'zod';

// ============================================================================
// WEATHER TYPES
// ============================================================================

/**
 * Weather type enumeration.
 * Each type has associated gameplay effects.
 */
export const WeatherTypeSchema = z.enum([
  'clear', // Default, no effects
  'cloudy', // Reduced visibility at distance
  'rain', // Movement penalty, tracking easier, fire weapons less effective
  'thunderstorm', // Heavy penalties, lightning danger, must seek shelter
  'dust_storm', // Severe visibility reduction, damage over time outdoors
  'heat_wave', // Increased water consumption, stamina drain
  'cold_snap', // Need warm clothing, stamina penalty
  'fog', // Greatly reduced visibility, ambush chance increased
]);
export type WeatherType = z.infer<typeof WeatherTypeSchema>;

/**
 * Weather severity levels.
 */
export const WeatherSeveritySchema = z.enum([
  'mild', // Minor effects
  'moderate', // Standard effects
  'severe', // Enhanced effects
  'extreme', // Maximum effects, potential danger
]);
export type WeatherSeverity = z.infer<typeof WeatherSeveritySchema>;

// ============================================================================
// WEATHER EFFECTS
// ============================================================================

/**
 * Gameplay effects caused by weather conditions.
 */
export const WeatherEffectsSchema = z.object({
  /** Movement speed multiplier (1.0 = normal) */
  movementMultiplier: z.number().min(0.1).max(2).default(1),

  /** Visibility range multiplier (1.0 = normal) */
  visibilityMultiplier: z.number().min(0.1).max(2).default(1),

  /** Combat accuracy modifier (-50 to +50) */
  accuracyModifier: z.number().min(-50).max(50).default(0),

  /** Fire weapon effectiveness multiplier (guns, fire magic) */
  fireWeaponMultiplier: z.number().min(0).max(2).default(1),

  /** Tracking/hunting skill modifier */
  trackingModifier: z.number().min(-50).max(50).default(0),

  /** Ambush chance modifier (percentage points) */
  ambushChanceModifier: z.number().min(-50).max(50).default(0),

  /** Water consumption multiplier */
  waterConsumptionMultiplier: z.number().min(0.5).max(5).default(1),

  /** Stamina drain multiplier */
  staminaDrainMultiplier: z.number().min(0.5).max(5).default(1),

  /** Health damage per hour outdoors (0 = none) */
  outdoorDamagePerHour: z.number().min(0).max(50).default(0),

  /** Requires shelter (must rest at camp/building) */
  requiresShelter: z.boolean().default(false),

  /** Requires specific equipment (warm clothes, etc.) */
  requiredEquipment: z.array(z.string()).default([]),

  /** Encounter rate modifier multiplier */
  encounterRateModifier: z.number().min(0).max(3).default(1),

  /** Can start fires outdoors */
  canStartFire: z.boolean().default(true),

  /** Lightning strike chance per hour (0-1) */
  lightningChance: z.number().min(0).max(1).default(0),
});
export type WeatherEffects = z.infer<typeof WeatherEffectsSchema>;

// ============================================================================
// WEATHER STATE
// ============================================================================

/**
 * Current weather state with transition tracking.
 */
export const WeatherStateSchema = z.object({
  /** Current weather type */
  current: WeatherTypeSchema,

  /** Current severity */
  severity: WeatherSeveritySchema,

  /** Hours until weather changes */
  hoursUntilChange: z.number().min(0),

  /** Transitioning to this weather (if applicable) */
  transitioningTo: WeatherTypeSchema.optional(),

  /** Hours into current weather (for duration tracking) */
  hoursSinceCurrent: z.number().min(0).default(0),

  /** Daily high temperature (for heat effects) */
  temperature: z.number().int().min(-40).max(130).default(70),

  /** Wind speed (affects dust storms, fires) */
  windSpeed: z.number().min(0).max(100).default(10),

  /** Precipitation amount (0-100) */
  precipitation: z.number().min(0).max(100).default(0),
});
export type WeatherState = z.infer<typeof WeatherStateSchema>;

// ============================================================================
// BIOME WEATHER PATTERNS
// ============================================================================

/**
 * Weather probability weights for a biome.
 * Higher weight = more likely to occur.
 */
export const BiomeWeatherPatternSchema = z.object({
  /** Biome identifier */
  biome: z.enum(['desert', 'mountains', 'plains', 'canyon', 'badlands', 'riverside', 'forest']),

  /** Base weather probabilities (weights, not percentages) */
  baseWeights: z.object({
    clear: z.number().min(0).default(10),
    cloudy: z.number().min(0).default(5),
    rain: z.number().min(0).default(2),
    thunderstorm: z.number().min(0).default(1),
    dust_storm: z.number().min(0).default(0),
    heat_wave: z.number().min(0).default(1),
    cold_snap: z.number().min(0).default(1),
    fog: z.number().min(0).default(2),
  }),

  /** Seasonal modifiers (multiply base weights) - partial records allowed */
  seasonalModifiers: z.object({
    spring: z.record(z.string(), z.number().min(0).max(5)).optional(),
    summer: z.record(z.string(), z.number().min(0).max(5)).optional(),
    fall: z.record(z.string(), z.number().min(0).max(5)).optional(),
    winter: z.record(z.string(), z.number().min(0).max(5)).optional(),
  }).optional(),

  /** Temperature range for this biome */
  temperatureRange: z.object({
    min: z.number().int().min(-40).max(130),
    max: z.number().int().min(-40).max(130),
  }),

  /** Day/night temperature swing */
  temperatureSwing: z.number().min(0).max(60).default(20),

  /** Average weather duration in hours */
  averageWeatherDuration: z.number().min(1).max(48).default(8),
});
export type BiomeWeatherPattern = z.infer<typeof BiomeWeatherPatternSchema>;

// ============================================================================
// ENVIRONMENTAL HAZARDS
// ============================================================================

/**
 * Hazard type enumeration.
 */
export const HazardTypeSchema = z.enum([
  'quicksand', // Desert areas, escape check or damage
  'rockslide', // Mountain routes, dodge or damage
  'flash_flood', // Canyon areas during rain, flee or swept away
  'mine_gas', // Underground, suffocation damage
  'rattlesnake_nest', // Desert, poison risk
  'abandoned_mine_shaft', // Fall damage risk
  'cactus_field', // Movement damage
  'extreme_heat_zone', // Rapid dehydration
  'freezing_water', // Hypothermia risk
  'toxic_spring', // Poison if drunk
]);
export type HazardType = z.infer<typeof HazardTypeSchema>;

/**
 * Hazard check types - what skill/stat is tested.
 */
export const HazardCheckTypeSchema = z.enum([
  'agility', // Dodge, escape
  'strength', // Brute force
  'perception', // Notice danger
  'survival', // Wilderness knowledge
  'luck', // Random chance
  'none', // Automatic effect
]);
export type HazardCheckType = z.infer<typeof HazardCheckTypeSchema>;

/**
 * Status effect from hazard.
 */
export const HazardStatusEffectSchema = z.enum([
  'poisoned', // Damage over time
  'bleeding', // Damage over time
  'hypothermia', // Stamina drain, eventual death
  'dehydrated', // Increased water consumption
  'stunned', // Can't act temporarily
  'slowed', // Movement penalty
  'none', // No status effect
]);
export type HazardStatusEffect = z.infer<typeof HazardStatusEffectSchema>;

/**
 * Environmental hazard definition.
 */
export const EnvironmentalHazardSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Hazard type */
  type: HazardTypeSchema,

  /** Description shown to player */
  description: z.string(),

  /** Biomes where this hazard can occur */
  biomes: z.array(z.enum(['desert', 'mountains', 'plains', 'canyon', 'badlands', 'riverside', 'forest', 'underground'])),

  /** Weather conditions that enable/enhance this hazard */
  weatherTriggers: z.array(WeatherTypeSchema).optional(),

  /** Check type to avoid/mitigate hazard */
  checkType: HazardCheckTypeSchema,

  /** Base difficulty (0-100) */
  baseDifficulty: z.number().int().min(0).max(100).default(50),

  /** Damage on failure (min-max) */
  damageRange: z.object({
    min: z.number().int().min(0),
    max: z.number().int().min(0),
  }),

  /** Status effect on failure */
  statusEffect: HazardStatusEffectSchema.default('none'),

  /** Status effect duration in hours */
  statusDuration: z.number().min(0).default(0),

  /** Instant death possible on critical failure */
  canBeLethal: z.boolean().default(false),

  /** Item that negates/reduces hazard */
  counterItem: z.string().optional(),

  /** Skill that helps avoid hazard */
  counterSkill: z.string().optional(),

  /** Detection difficulty (can player see it coming?) */
  detectionDifficulty: z.number().int().min(0).max(100).default(50),

  /** Message on success */
  successMessage: z.string(),

  /** Message on failure */
  failureMessage: z.string(),

  /** Message on detection */
  detectionMessage: z.string().optional(),

  /** Encounter weight for random occurrence */
  encounterWeight: z.number().min(0).default(1),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type EnvironmentalHazard = z.infer<typeof EnvironmentalHazardSchema>;

// ============================================================================
// HAZARD CHECK RESULT
// ============================================================================

/**
 * Result of a hazard check.
 */
export const HazardCheckResultSchema = z.object({
  /** Hazard that was encountered */
  hazardId: z.string(),

  /** Was the hazard detected beforehand? */
  detected: z.boolean(),

  /** Was the check successful? */
  success: z.boolean(),

  /** Was it a critical success/failure? */
  critical: z.boolean(),

  /** Damage taken (0 if success) */
  damageTaken: z.number().int().min(0),

  /** Status effect applied (if any) */
  statusApplied: HazardStatusEffectSchema.optional(),

  /** Duration of status effect */
  statusDuration: z.number().min(0).optional(),

  /** Result message to display */
  message: z.string(),
});
export type HazardCheckResult = z.infer<typeof HazardCheckResultSchema>;

// ============================================================================
// TIME OF DAY
// ============================================================================

/**
 * Time of day phases.
 */
export const TimeOfDaySchema = z.enum([
  'dawn', // 5-7am - Transition, good hunting
  'morning', // 7am-12pm - Full daylight
  'afternoon', // 12pm-5pm - Full daylight, heat peak
  'dusk', // 5-7pm - Transition, good hunting
  'evening', // 7-10pm - Fading light
  'night', // 10pm-5am - Dark, different encounters
]);
export type TimeOfDay = z.infer<typeof TimeOfDaySchema>;

/**
 * Time-based effects on gameplay.
 */
export const TimeEffectsSchema = z.object({
  /** Visibility multiplier (1.0 = full daylight) */
  visibilityMultiplier: z.number().min(0).max(1).default(1),

  /** Ambient light level (0-1) */
  ambientLight: z.number().min(0).max(1).default(1),

  /** Encounter type modifiers */
  encounterModifiers: z.object({
    wildlife: z.number().min(0).max(3).default(1),
    bandit: z.number().min(0).max(3).default(1),
    traveler: z.number().min(0).max(3).default(1),
    supernatural: z.number().min(0).max(3).default(0),
  }),

  /** NPC availability (shops, services) */
  npcAvailability: z.number().min(0).max(1).default(1),

  /** Stealth bonus (for ambushes, sneaking) */
  stealthBonus: z.number().min(0).max(50).default(0),

  /** Temperature modifier from baseline */
  temperatureModifier: z.number().min(-40).max(40).default(0),

  /** Can travel safely without light source */
  safeTravelWithoutLight: z.boolean().default(true),
});
export type TimeEffects = z.infer<typeof TimeEffectsSchema>;

// ============================================================================
// SEASON
// ============================================================================

/**
 * Season enumeration.
 */
export const SeasonSchema = z.enum(['spring', 'summer', 'fall', 'winter']);
export type Season = z.infer<typeof SeasonSchema>;

/**
 * Seasonal effects on gameplay.
 */
export const SeasonalEffectsSchema = z.object({
  /** Season identifier */
  season: SeasonSchema,

  /** Temperature modifier to biome baseline */
  temperatureModifier: z.number().min(-40).max(40),

  /** Day length modifier (hours of daylight, 0-24) */
  daylightHours: z.number().min(6).max(18).default(12),

  /** Weather probability modifiers - partial record, only override needed keys */
  weatherModifiers: z.record(z.string(), z.number().min(0).max(5)).optional(),

  /** Resource availability (hunting, foraging) */
  resourceModifier: z.number().min(0).max(2).default(1),

  /** Water source availability */
  waterAvailability: z.number().min(0).max(2).default(1),

  /** Description for UI */
  description: z.string(),
});
export type SeasonalEffects = z.infer<typeof SeasonalEffectsSchema>;

// ============================================================================
// ENVIRONMENT STATE
// ============================================================================

/**
 * Complete environment state for serialization.
 */
export const EnvironmentStateSchema = z.object({
  /** Current weather state */
  weather: WeatherStateSchema,

  /** Current biome (for weather patterns) */
  currentBiome: z.enum(['desert', 'mountains', 'plains', 'canyon', 'badlands', 'riverside', 'forest']),

  /** Current season */
  season: SeasonSchema,

  /** Day of the year (1-365) */
  dayOfYear: z.number().int().min(1).max(365),

  /** Active hazards in current location */
  activeHazards: z.array(z.string()).default([]),

  /** Hazards that have been triggered this session */
  triggeredHazards: z.array(z.string()).default([]),

  /** Weather history for patterns */
  weatherHistory: z.array(z.object({
    type: WeatherTypeSchema,
    startHour: z.number(),
    duration: z.number(),
  })).default([]),
});
export type EnvironmentState = z.infer<typeof EnvironmentStateSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate a weather state.
 */
export function validateWeatherState(data: unknown): WeatherState {
  return WeatherStateSchema.parse(data);
}

/**
 * Validate an environmental hazard definition.
 */
export function validateEnvironmentalHazard(data: unknown): EnvironmentalHazard {
  return EnvironmentalHazardSchema.parse(data);
}

/**
 * Validate a hazard check result.
 */
export function validateHazardCheckResult(data: unknown): HazardCheckResult {
  return HazardCheckResultSchema.parse(data);
}

/**
 * Validate environment state.
 */
export function validateEnvironmentState(data: unknown): EnvironmentState {
  return EnvironmentStateSchema.parse(data);
}

/**
 * Validate biome weather pattern.
 */
export function validateBiomeWeatherPattern(data: unknown): BiomeWeatherPattern {
  return BiomeWeatherPatternSchema.parse(data);
}

// ============================================================================
// SCHEMA VERSION
// ============================================================================

export const ENVIRONMENT_SCHEMA_VERSION = '1.0.0';
