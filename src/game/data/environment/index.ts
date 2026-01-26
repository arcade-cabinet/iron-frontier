/**
 * Iron Frontier - Environment System
 *
 * Complete weather and environmental effects system for gameplay.
 * Includes:
 * - Weather state machine with biome-specific patterns
 * - Environmental hazard definitions and check system
 * - Time-based effects (day/night, seasons)
 * - Location-specific weather modifications
 *
 * @module data/environment
 */

import { z } from 'zod';
import {
  type WeatherType,
  type WeatherSeverity,
  type WeatherEffects,
  type WeatherState,
  type BiomeWeatherPattern,
  type EnvironmentalHazard,
  type HazardCheckResult,
  type HazardType,
  type HazardCheckType,
  type HazardStatusEffect,
  type TimeOfDay,
  type TimeEffects,
  type Season,
  type SeasonalEffects,
  type EnvironmentState,
  WeatherTypeSchema,
  WeatherSeveritySchema,
  WeatherEffectsSchema,
  WeatherStateSchema,
  EnvironmentalHazardSchema,
  HazardCheckResultSchema,
  EnvironmentStateSchema,
  ENVIRONMENT_SCHEMA_VERSION,
} from '../schemas/environment';

// ============================================================================
// WEATHER EFFECT DEFINITIONS
// ============================================================================

/**
 * Base effects for each weather type.
 * These are modified by severity and combined with biome effects.
 */
export const WEATHER_EFFECTS: Record<WeatherType, WeatherEffects> = {
  clear: {
    movementMultiplier: 1.0,
    visibilityMultiplier: 1.0,
    accuracyModifier: 0,
    fireWeaponMultiplier: 1.0,
    trackingModifier: 0,
    ambushChanceModifier: 0,
    waterConsumptionMultiplier: 1.0,
    staminaDrainMultiplier: 1.0,
    outdoorDamagePerHour: 0,
    requiresShelter: false,
    requiredEquipment: [],
    encounterRateModifier: 1.0,
    canStartFire: true,
    lightningChance: 0,
  },

  cloudy: {
    movementMultiplier: 1.0,
    visibilityMultiplier: 0.85,
    accuracyModifier: -5,
    fireWeaponMultiplier: 1.0,
    trackingModifier: 0,
    ambushChanceModifier: 5,
    waterConsumptionMultiplier: 0.9,
    staminaDrainMultiplier: 1.0,
    outdoorDamagePerHour: 0,
    requiresShelter: false,
    requiredEquipment: [],
    encounterRateModifier: 1.0,
    canStartFire: true,
    lightningChance: 0,
  },

  rain: {
    movementMultiplier: 0.85,
    visibilityMultiplier: 0.7,
    accuracyModifier: -15,
    fireWeaponMultiplier: 0.7,
    trackingModifier: 20, // Mud shows tracks
    ambushChanceModifier: 10,
    waterConsumptionMultiplier: 0.5, // Can collect rainwater
    staminaDrainMultiplier: 1.2,
    outdoorDamagePerHour: 0,
    requiresShelter: false,
    requiredEquipment: [],
    encounterRateModifier: 0.8,
    canStartFire: false,
    lightningChance: 0,
  },

  thunderstorm: {
    movementMultiplier: 0.6,
    visibilityMultiplier: 0.4,
    accuracyModifier: -30,
    fireWeaponMultiplier: 0.4,
    trackingModifier: -20, // Tracks washed away
    ambushChanceModifier: 25,
    waterConsumptionMultiplier: 0.3,
    staminaDrainMultiplier: 1.5,
    outdoorDamagePerHour: 2,
    requiresShelter: true,
    requiredEquipment: [],
    encounterRateModifier: 0.5,
    canStartFire: false,
    lightningChance: 0.05, // 5% per hour
  },

  dust_storm: {
    movementMultiplier: 0.5,
    visibilityMultiplier: 0.2,
    accuracyModifier: -40,
    fireWeaponMultiplier: 0.8, // Guns still work but hard to aim
    trackingModifier: -50, // Tracks covered
    ambushChanceModifier: 40,
    waterConsumptionMultiplier: 2.0,
    staminaDrainMultiplier: 2.0,
    outdoorDamagePerHour: 5,
    requiresShelter: true,
    requiredEquipment: ['bandana', 'goggles'],
    encounterRateModifier: 0.3,
    canStartFire: false,
    lightningChance: 0,
  },

  heat_wave: {
    movementMultiplier: 0.8,
    visibilityMultiplier: 0.9, // Heat shimmer
    accuracyModifier: -10,
    fireWeaponMultiplier: 1.0,
    trackingModifier: 0,
    ambushChanceModifier: 0,
    waterConsumptionMultiplier: 2.5,
    staminaDrainMultiplier: 1.8,
    outdoorDamagePerHour: 3,
    requiresShelter: false,
    requiredEquipment: ['hat', 'light_clothing'],
    encounterRateModifier: 0.7,
    canStartFire: true,
    lightningChance: 0,
  },

  cold_snap: {
    movementMultiplier: 0.75,
    visibilityMultiplier: 1.0,
    accuracyModifier: -10,
    fireWeaponMultiplier: 0.9, // Frostbite affects handling
    trackingModifier: 15, // Snow shows tracks
    ambushChanceModifier: 5,
    waterConsumptionMultiplier: 0.7,
    staminaDrainMultiplier: 1.6,
    outdoorDamagePerHour: 4,
    requiresShelter: false,
    requiredEquipment: ['warm_coat', 'gloves'],
    encounterRateModifier: 0.8,
    canStartFire: true,
    lightningChance: 0,
  },

  fog: {
    movementMultiplier: 0.9,
    visibilityMultiplier: 0.3,
    accuracyModifier: -25,
    fireWeaponMultiplier: 1.0,
    trackingModifier: 10, // Damp ground
    ambushChanceModifier: 35,
    waterConsumptionMultiplier: 0.8,
    staminaDrainMultiplier: 1.0,
    outdoorDamagePerHour: 0,
    requiresShelter: false,
    requiredEquipment: [],
    encounterRateModifier: 1.2, // More surprise encounters
    canStartFire: true,
    lightningChance: 0,
  },
};

/**
 * Severity multipliers for weather effects.
 */
export const SEVERITY_MULTIPLIERS: Record<WeatherSeverity, number> = {
  mild: 0.5,
  moderate: 1.0,
  severe: 1.5,
  extreme: 2.0,
};

// ============================================================================
// BIOME WEATHER PATTERNS
// ============================================================================

/**
 * Weather patterns for each biome type.
 */
export const BIOME_WEATHER_PATTERNS: Record<string, BiomeWeatherPattern> = {
  desert: {
    biome: 'desert',
    baseWeights: {
      clear: 15,
      cloudy: 3,
      rain: 1,
      thunderstorm: 0.5,
      dust_storm: 4,
      heat_wave: 5,
      cold_snap: 0.5,
      fog: 0.5,
    },
    seasonalModifiers: {
      summer: { heat_wave: 2.5, dust_storm: 1.5 },
      winter: { cold_snap: 2, heat_wave: 0.2 },
    },
    temperatureRange: { min: 30, max: 115 },
    temperatureSwing: 40, // Desert has huge day/night swing
    averageWeatherDuration: 12,
  },

  mountains: {
    biome: 'mountains',
    baseWeights: {
      clear: 8,
      cloudy: 6,
      rain: 3,
      thunderstorm: 2,
      dust_storm: 0,
      heat_wave: 0.5,
      cold_snap: 4,
      fog: 3,
    },
    seasonalModifiers: {
      winter: { cold_snap: 3, clear: 0.5 },
      summer: { thunderstorm: 1.5 },
    },
    temperatureRange: { min: -10, max: 75 },
    temperatureSwing: 25,
    averageWeatherDuration: 6, // Mountain weather changes fast
  },

  plains: {
    biome: 'plains',
    baseWeights: {
      clear: 10,
      cloudy: 5,
      rain: 4,
      thunderstorm: 3,
      dust_storm: 1,
      heat_wave: 2,
      cold_snap: 2,
      fog: 2,
    },
    seasonalModifiers: {
      spring: { thunderstorm: 2, rain: 1.5 },
      fall: { fog: 2 },
    },
    temperatureRange: { min: 10, max: 100 },
    temperatureSwing: 20,
    averageWeatherDuration: 8,
  },

  canyon: {
    biome: 'canyon',
    baseWeights: {
      clear: 12,
      cloudy: 4,
      rain: 2,
      thunderstorm: 1.5,
      dust_storm: 2,
      heat_wave: 4,
      cold_snap: 1,
      fog: 1,
    },
    seasonalModifiers: {
      summer: { heat_wave: 2 },
      spring: { rain: 2 }, // Flash flood season
    },
    temperatureRange: { min: 20, max: 110 },
    temperatureSwing: 35,
    averageWeatherDuration: 10,
  },

  badlands: {
    biome: 'badlands',
    baseWeights: {
      clear: 14,
      cloudy: 3,
      rain: 1,
      thunderstorm: 1,
      dust_storm: 3,
      heat_wave: 4,
      cold_snap: 1,
      fog: 0.5,
    },
    seasonalModifiers: {
      summer: { heat_wave: 2, dust_storm: 1.5 },
    },
    temperatureRange: { min: 15, max: 110 },
    temperatureSwing: 30,
    averageWeatherDuration: 10,
  },

  riverside: {
    biome: 'riverside',
    baseWeights: {
      clear: 8,
      cloudy: 5,
      rain: 4,
      thunderstorm: 2,
      dust_storm: 0,
      heat_wave: 2,
      cold_snap: 2,
      fog: 5,
    },
    seasonalModifiers: {
      fall: { fog: 2.5 },
      spring: { rain: 1.5 },
    },
    temperatureRange: { min: 20, max: 95 },
    temperatureSwing: 15, // Water moderates temperature
    averageWeatherDuration: 8,
  },

  forest: {
    biome: 'forest',
    baseWeights: {
      clear: 7,
      cloudy: 6,
      rain: 5,
      thunderstorm: 2,
      dust_storm: 0,
      heat_wave: 1,
      cold_snap: 2,
      fog: 4,
    },
    seasonalModifiers: {
      fall: { fog: 2, cloudy: 1.5 },
      spring: { rain: 1.5 },
    },
    temperatureRange: { min: 15, max: 90 },
    temperatureSwing: 15,
    averageWeatherDuration: 8,
  },
};

// ============================================================================
// ENVIRONMENTAL HAZARDS
// ============================================================================

/**
 * All environmental hazard definitions.
 */
export const ENVIRONMENTAL_HAZARDS: EnvironmentalHazard[] = [
  // Desert/Badlands Hazards
  {
    id: 'quicksand',
    name: 'Quicksand',
    type: 'quicksand',
    description: 'A patch of deceptively solid-looking sand that gives way beneath your feet.',
    biomes: ['desert', 'badlands', 'riverside'],
    checkType: 'agility',
    baseDifficulty: 55,
    damageRange: { min: 10, max: 25 },
    statusEffect: 'slowed',
    statusDuration: 2,
    canBeLethal: true,
    counterItem: 'rope',
    counterSkill: 'survival',
    detectionDifficulty: 60,
    successMessage: 'You struggle free from the quicksand, covered in mud but unharmed.',
    failureMessage: 'You sink into the quicksand, taking damage as you desperately escape.',
    detectionMessage: 'You notice the telltale signs of quicksand ahead and carefully avoid it.',
    encounterWeight: 1.5,
    tags: ['desert', 'terrain'],
  },

  {
    id: 'rockslide',
    name: 'Rockslide',
    type: 'rockslide',
    description: 'Loose rocks tumble down the mountainside, threatening to crush anything below.',
    biomes: ['mountains', 'canyon', 'badlands'],
    weatherTriggers: ['rain', 'thunderstorm'],
    checkType: 'agility',
    baseDifficulty: 50,
    damageRange: { min: 15, max: 40 },
    statusEffect: 'stunned',
    statusDuration: 1,
    canBeLethal: true,
    detectionDifficulty: 45,
    successMessage: 'You dive clear as rocks thunder past, narrowly avoiding the rockslide.',
    failureMessage: 'Rocks slam into you, knocking you down and leaving you battered.',
    detectionMessage: 'You hear rumbling above and take cover before the rockslide hits.',
    encounterWeight: 2,
    tags: ['mountain', 'weather_triggered'],
  },

  {
    id: 'flash_flood',
    name: 'Flash Flood',
    type: 'flash_flood',
    description: 'A wall of water rushes through the canyon with terrifying speed.',
    biomes: ['canyon', 'riverside'],
    weatherTriggers: ['rain', 'thunderstorm'],
    checkType: 'agility',
    baseDifficulty: 65,
    damageRange: { min: 25, max: 50 },
    statusEffect: 'stunned',
    statusDuration: 2,
    canBeLethal: true,
    counterItem: 'rope',
    detectionDifficulty: 55,
    successMessage: 'You scramble to high ground just as the flood waters rage past.',
    failureMessage: 'The flood sweeps you away, battering you against rocks.',
    detectionMessage: 'You hear the distant roar of rushing water and quickly move to higher ground.',
    encounterWeight: 1,
    tags: ['canyon', 'weather_triggered', 'lethal'],
  },

  {
    id: 'mine_gas',
    name: 'Poisonous Mine Gas',
    type: 'mine_gas',
    description: 'Invisible toxic fumes fill the abandoned mine shaft.',
    biomes: ['underground'],
    checkType: 'perception',
    baseDifficulty: 60,
    damageRange: { min: 10, max: 30 },
    statusEffect: 'poisoned',
    statusDuration: 4,
    canBeLethal: true,
    counterItem: 'gas_mask',
    counterSkill: 'survival',
    detectionDifficulty: 70,
    successMessage: 'You hold your breath and retreat before the gas can affect you.',
    failureMessage: 'You breathe in the noxious fumes, feeling your lungs burn.',
    detectionMessage: 'Your canary stops singing - there must be bad air ahead.',
    encounterWeight: 1.5,
    tags: ['mine', 'underground'],
  },

  {
    id: 'rattlesnake_nest',
    name: 'Rattlesnake Nest',
    type: 'rattlesnake_nest',
    description: 'You stumble upon a nest of agitated rattlesnakes.',
    biomes: ['desert', 'badlands', 'canyon'],
    checkType: 'agility',
    baseDifficulty: 45,
    damageRange: { min: 8, max: 20 },
    statusEffect: 'poisoned',
    statusDuration: 6,
    canBeLethal: false,
    counterItem: 'antivenom',
    counterSkill: 'survival',
    detectionDifficulty: 40,
    successMessage: 'You carefully back away from the rattlesnakes before they can strike.',
    failureMessage: 'A rattlesnake sinks its fangs into your leg, injecting venom.',
    detectionMessage: 'You hear the distinctive rattle and freeze, spotting the snakes ahead.',
    encounterWeight: 2.5,
    tags: ['wildlife', 'desert', 'poison'],
  },

  {
    id: 'abandoned_mine_shaft',
    name: 'Abandoned Mine Shaft',
    type: 'abandoned_mine_shaft',
    description: 'A rotten wooden cover gives way, revealing a deep shaft below.',
    biomes: ['mountains', 'badlands', 'underground'],
    checkType: 'agility',
    baseDifficulty: 50,
    damageRange: { min: 20, max: 45 },
    statusEffect: 'bleeding',
    statusDuration: 3,
    canBeLethal: true,
    counterItem: 'rope',
    detectionDifficulty: 55,
    successMessage: 'You catch yourself on the edge as the cover breaks, pulling yourself up.',
    failureMessage: 'You plummet into the darkness, hitting the sides on the way down.',
    detectionMessage: 'You notice the rotted timber and carefully step around the old shaft.',
    encounterWeight: 1,
    tags: ['mine', 'fall_damage'],
  },

  {
    id: 'cactus_field',
    name: 'Dense Cactus Field',
    type: 'cactus_field',
    description: 'A dense field of cholla and prickly pear forces a painful passage.',
    biomes: ['desert', 'badlands'],
    checkType: 'agility',
    baseDifficulty: 35,
    damageRange: { min: 5, max: 15 },
    statusEffect: 'slowed',
    statusDuration: 1,
    canBeLethal: false,
    counterItem: 'machete',
    detectionDifficulty: 20, // Easy to see
    successMessage: 'You carefully navigate through the cacti without a scratch.',
    failureMessage: 'Cactus spines embed themselves in your skin as you push through.',
    detectionMessage: 'You spot a way around the cactus field.',
    encounterWeight: 3,
    tags: ['desert', 'terrain', 'minor'],
  },

  {
    id: 'extreme_heat_zone',
    name: 'Heat Trap',
    type: 'extreme_heat_zone',
    description: 'A natural bowl that traps and intensifies the desert heat.',
    biomes: ['desert', 'badlands', 'canyon'],
    weatherTriggers: ['heat_wave', 'clear'],
    checkType: 'survival',
    baseDifficulty: 50,
    damageRange: { min: 0, max: 0 }, // Damage through dehydration
    statusEffect: 'dehydrated',
    statusDuration: 4,
    canBeLethal: false,
    counterItem: 'extra_water',
    counterSkill: 'survival',
    detectionDifficulty: 35,
    successMessage: 'You pace yourself and conserve water, making it through the heat.',
    failureMessage: 'The relentless heat saps your strength and drains your water reserves.',
    detectionMessage: 'You recognize the signs of a heat trap and find another route.',
    encounterWeight: 2,
    tags: ['desert', 'heat', 'survival'],
  },

  {
    id: 'freezing_water',
    name: 'Freezing Water Crossing',
    type: 'freezing_water',
    description: 'You must cross a stream of ice-cold mountain runoff.',
    biomes: ['mountains', 'riverside'],
    weatherTriggers: ['cold_snap'],
    checkType: 'strength',
    baseDifficulty: 45,
    damageRange: { min: 5, max: 15 },
    statusEffect: 'hypothermia',
    statusDuration: 3,
    canBeLethal: false,
    counterItem: 'warm_coat',
    detectionDifficulty: 15, // Obvious
    successMessage: 'You wade across quickly and warm yourself on the other side.',
    failureMessage: 'The freezing water numbs your limbs as you struggle across.',
    detectionMessage: 'You find a natural bridge to cross without getting wet.',
    encounterWeight: 1.5,
    tags: ['water', 'cold', 'crossing'],
  },

  {
    id: 'toxic_spring',
    name: 'Toxic Spring',
    type: 'toxic_spring',
    description: 'A natural spring with mineral-tainted water that smells of sulfur.',
    biomes: ['badlands', 'mountains', 'canyon'],
    checkType: 'perception',
    baseDifficulty: 40,
    damageRange: { min: 15, max: 30 },
    statusEffect: 'poisoned',
    statusDuration: 5,
    canBeLethal: false,
    counterSkill: 'survival',
    detectionDifficulty: 45,
    successMessage: 'You notice the mineral deposits and avoid drinking the tainted water.',
    failureMessage: 'You drink deeply before noticing the sulfurous taste. Your stomach rebels.',
    detectionMessage: 'The yellow staining and smell warn you this water is not safe to drink.',
    encounterWeight: 1,
    tags: ['water', 'poison', 'trap'],
  },
];

/**
 * Hazard lookup by ID.
 */
export const HAZARDS_BY_ID: Record<string, EnvironmentalHazard> = Object.fromEntries(
  ENVIRONMENTAL_HAZARDS.map((h) => [h.id, h])
);

/**
 * Hazard lookup by type.
 */
export const HAZARDS_BY_TYPE: Record<HazardType, EnvironmentalHazard[]> = {
  quicksand: ENVIRONMENTAL_HAZARDS.filter((h) => h.type === 'quicksand'),
  rockslide: ENVIRONMENTAL_HAZARDS.filter((h) => h.type === 'rockslide'),
  flash_flood: ENVIRONMENTAL_HAZARDS.filter((h) => h.type === 'flash_flood'),
  mine_gas: ENVIRONMENTAL_HAZARDS.filter((h) => h.type === 'mine_gas'),
  rattlesnake_nest: ENVIRONMENTAL_HAZARDS.filter((h) => h.type === 'rattlesnake_nest'),
  abandoned_mine_shaft: ENVIRONMENTAL_HAZARDS.filter((h) => h.type === 'abandoned_mine_shaft'),
  cactus_field: ENVIRONMENTAL_HAZARDS.filter((h) => h.type === 'cactus_field'),
  extreme_heat_zone: ENVIRONMENTAL_HAZARDS.filter((h) => h.type === 'extreme_heat_zone'),
  freezing_water: ENVIRONMENTAL_HAZARDS.filter((h) => h.type === 'freezing_water'),
  toxic_spring: ENVIRONMENTAL_HAZARDS.filter((h) => h.type === 'toxic_spring'),
};

// ============================================================================
// TIME OF DAY EFFECTS
// ============================================================================

/**
 * Effects for each time of day.
 */
export const TIME_OF_DAY_EFFECTS: Record<TimeOfDay, TimeEffects> = {
  dawn: {
    visibilityMultiplier: 0.7,
    ambientLight: 0.5,
    encounterModifiers: {
      wildlife: 1.5, // Animals active at dawn
      bandit: 0.5,
      traveler: 0.5,
      supernatural: 0.2,
    },
    npcAvailability: 0.3,
    stealthBonus: 15,
    temperatureModifier: -15,
    safeTravelWithoutLight: true,
  },

  morning: {
    visibilityMultiplier: 1.0,
    ambientLight: 0.9,
    encounterModifiers: {
      wildlife: 1.0,
      bandit: 1.0,
      traveler: 1.2,
      supernatural: 0,
    },
    npcAvailability: 1.0,
    stealthBonus: 0,
    temperatureModifier: -5,
    safeTravelWithoutLight: true,
  },

  afternoon: {
    visibilityMultiplier: 1.0,
    ambientLight: 1.0,
    encounterModifiers: {
      wildlife: 0.7, // Animals rest in heat
      bandit: 1.2,
      traveler: 1.0,
      supernatural: 0,
    },
    npcAvailability: 1.0,
    stealthBonus: 0,
    temperatureModifier: 10, // Peak heat
    safeTravelWithoutLight: true,
  },

  dusk: {
    visibilityMultiplier: 0.6,
    ambientLight: 0.4,
    encounterModifiers: {
      wildlife: 1.5, // Animals active at dusk
      bandit: 1.3, // Bandits like dusk attacks
      traveler: 0.7,
      supernatural: 0.5,
    },
    npcAvailability: 0.7,
    stealthBonus: 20,
    temperatureModifier: 0,
    safeTravelWithoutLight: true,
  },

  evening: {
    visibilityMultiplier: 0.4,
    ambientLight: 0.2,
    encounterModifiers: {
      wildlife: 0.8,
      bandit: 1.5,
      traveler: 0.3,
      supernatural: 1.0,
    },
    npcAvailability: 0.5, // Some businesses still open
    stealthBonus: 30,
    temperatureModifier: -10,
    safeTravelWithoutLight: false,
  },

  night: {
    visibilityMultiplier: 0.2,
    ambientLight: 0.1,
    encounterModifiers: {
      wildlife: 0.5, // Nocturnal only
      bandit: 1.8, // Peak bandit activity
      traveler: 0.1,
      supernatural: 2.0,
    },
    npcAvailability: 0.1, // Only saloons and inns
    stealthBonus: 40,
    temperatureModifier: -20,
    safeTravelWithoutLight: false,
  },
};

// ============================================================================
// SEASONAL EFFECTS
// ============================================================================

/**
 * Effects for each season.
 */
export const SEASONAL_EFFECTS: Record<Season, SeasonalEffects> = {
  spring: {
    season: 'spring',
    temperatureModifier: -5,
    daylightHours: 13,
    weatherModifiers: {
      rain: 1.5,
      thunderstorm: 1.5,
      clear: 0.8,
      cloudy: 1.2,
      dust_storm: 0.5,
      heat_wave: 0.3,
      cold_snap: 0.5,
      fog: 1.0,
    },
    resourceModifier: 1.3, // Good foraging
    waterAvailability: 1.5,
    description: 'Spring brings rain and new growth to the frontier.',
  },

  summer: {
    season: 'summer',
    temperatureModifier: 15,
    daylightHours: 15,
    weatherModifiers: {
      rain: 0.5,
      thunderstorm: 1.2,
      clear: 1.5,
      cloudy: 0.7,
      dust_storm: 1.5,
      heat_wave: 2.0,
      cold_snap: 0,
      fog: 0.3,
    },
    resourceModifier: 1.0,
    waterAvailability: 0.7, // Drought conditions
    description: 'Summer heat bakes the land and dries the water holes.',
  },

  fall: {
    season: 'fall',
    temperatureModifier: 0,
    daylightHours: 11,
    weatherModifiers: {
      rain: 1.0,
      thunderstorm: 0.8,
      clear: 1.2,
      cloudy: 1.3,
      dust_storm: 1.0,
      heat_wave: 0.2,
      cold_snap: 0.8,
      fog: 1.8,
    },
    resourceModifier: 1.5, // Harvest time
    waterAvailability: 1.0,
    description: 'Fall brings cooler days and morning fog to the frontier.',
  },

  winter: {
    season: 'winter',
    temperatureModifier: -20,
    daylightHours: 9,
    weatherModifiers: {
      rain: 0.5,
      thunderstorm: 0.2,
      clear: 1.0,
      cloudy: 1.2,
      dust_storm: 0.3,
      heat_wave: 0,
      cold_snap: 2.5,
      fog: 0.8,
    },
    resourceModifier: 0.5, // Scarce resources
    waterAvailability: 0.8,
    description: 'Winter cold grips the frontier, making travel dangerous.',
  },
};

// ============================================================================
// WEATHER STATE MACHINE
// ============================================================================

/**
 * Default weather state.
 */
export const DEFAULT_WEATHER_STATE: WeatherState = {
  current: 'clear',
  severity: 'moderate',
  hoursUntilChange: 8,
  hoursSinceCurrent: 0,
  temperature: 70,
  windSpeed: 10,
  precipitation: 0,
};

/**
 * Default environment state.
 */
export const DEFAULT_ENVIRONMENT_STATE: EnvironmentState = {
  weather: DEFAULT_WEATHER_STATE,
  currentBiome: 'plains',
  season: 'summer',
  dayOfYear: 180, // Mid-summer
  activeHazards: [],
  triggeredHazards: [],
  weatherHistory: [],
};

/**
 * WeatherSystem - State machine for weather transitions.
 */
export class WeatherSystem {
  private state: WeatherState;
  private biome: string;
  private season: Season;

  constructor(initialState?: Partial<WeatherState>, biome = 'plains', season: Season = 'summer') {
    this.state = { ...DEFAULT_WEATHER_STATE, ...initialState };
    this.biome = biome;
    this.season = season;
  }

  /**
   * Get current weather state.
   */
  getState(): WeatherState {
    return { ...this.state };
  }

  /**
   * Get current weather type.
   */
  getCurrentWeather(): WeatherType {
    return this.state.current;
  }

  /**
   * Get current severity.
   */
  getSeverity(): WeatherSeverity {
    return this.state.severity;
  }

  /**
   * Get effective weather effects (base + severity).
   */
  getEffects(): WeatherEffects {
    const base = WEATHER_EFFECTS[this.state.current];
    const severityMult = SEVERITY_MULTIPLIERS[this.state.severity];

    // Apply severity to negative effects
    return {
      ...base,
      movementMultiplier: 1 - (1 - base.movementMultiplier) * severityMult,
      visibilityMultiplier: 1 - (1 - base.visibilityMultiplier) * severityMult,
      accuracyModifier: Math.round(base.accuracyModifier * severityMult),
      waterConsumptionMultiplier: 1 + (base.waterConsumptionMultiplier - 1) * severityMult,
      staminaDrainMultiplier: 1 + (base.staminaDrainMultiplier - 1) * severityMult,
      outdoorDamagePerHour: Math.round(base.outdoorDamagePerHour * severityMult),
      lightningChance: base.lightningChance * severityMult,
    };
  }

  /**
   * Advance weather by hours.
   */
  advanceTime(hours: number): { changed: boolean; newWeather?: WeatherType } {
    this.state.hoursSinceCurrent += hours;
    this.state.hoursUntilChange -= hours;

    if (this.state.hoursUntilChange <= 0) {
      const newWeather = this.selectNextWeather();
      const oldWeather = this.state.current;

      this.state.current = newWeather;
      this.state.severity = this.selectSeverity();
      this.state.hoursSinceCurrent = 0;
      this.state.hoursUntilChange = this.selectDuration();
      this.state.transitioningTo = undefined;

      // Update temperature based on weather
      this.updateTemperature();

      return { changed: true, newWeather };
    }

    return { changed: false };
  }

  /**
   * Select next weather based on biome probabilities.
   */
  private selectNextWeather(): WeatherType {
    const pattern = BIOME_WEATHER_PATTERNS[this.biome] ?? BIOME_WEATHER_PATTERNS.plains;
    const seasonal = SEASONAL_EFFECTS[this.season];

    // Calculate weights
    const weights: Record<WeatherType, number> = { ...pattern.baseWeights };

    // Apply seasonal modifiers
    if (seasonal.weatherModifiers) {
      for (const [weather, modifier] of Object.entries(seasonal.weatherModifiers)) {
        if (weather in weights) {
          weights[weather as WeatherType] *= modifier;
        }
      }
    }

    // Apply biome seasonal modifiers
    const biomeSeasonalMods = pattern.seasonalModifiers?.[this.season];
    if (biomeSeasonalMods) {
      for (const [weather, modifier] of Object.entries(biomeSeasonalMods)) {
        if (weather in weights) {
          weights[weather as WeatherType] *= modifier;
        }
      }
    }

    // Weighted random selection
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (const [weather, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        return weather as WeatherType;
      }
    }

    return 'clear';
  }

  /**
   * Select severity for current weather.
   */
  private selectSeverity(): WeatherSeverity {
    const roll = Math.random();
    if (roll < 0.1) return 'extreme';
    if (roll < 0.3) return 'severe';
    if (roll < 0.6) return 'moderate';
    return 'mild';
  }

  /**
   * Select duration for current weather.
   */
  private selectDuration(): number {
    const pattern = BIOME_WEATHER_PATTERNS[this.biome] ?? BIOME_WEATHER_PATTERNS.plains;
    const base = pattern.averageWeatherDuration;

    // Add variance (50% to 150% of base)
    return Math.round(base * (0.5 + Math.random()));
  }

  /**
   * Update temperature based on weather.
   */
  private updateTemperature(): void {
    const pattern = BIOME_WEATHER_PATTERNS[this.biome] ?? BIOME_WEATHER_PATTERNS.plains;
    const seasonal = SEASONAL_EFFECTS[this.season];

    // Base temperature from biome
    const { min, max } = pattern.temperatureRange;
    let baseTemp = (min + max) / 2 + seasonal.temperatureModifier;

    // Weather modifiers
    switch (this.state.current) {
      case 'heat_wave':
        baseTemp += 20;
        break;
      case 'cold_snap':
        baseTemp -= 25;
        break;
      case 'rain':
      case 'thunderstorm':
        baseTemp -= 10;
        break;
      case 'cloudy':
        baseTemp -= 5;
        break;
    }

    this.state.temperature = Math.round(
      Math.max(min, Math.min(max + 10, baseTemp))
    );
  }

  /**
   * Set biome (for location changes).
   */
  setBiome(biome: string): void {
    this.biome = biome;
    this.updateTemperature();
  }

  /**
   * Set season.
   */
  setSeason(season: Season): void {
    this.season = season;
    this.updateTemperature();
  }

  /**
   * Force weather change (for events).
   */
  forceWeather(weather: WeatherType, severity: WeatherSeverity = 'moderate', duration?: number): void {
    this.state.current = weather;
    this.state.severity = severity;
    this.state.hoursSinceCurrent = 0;
    this.state.hoursUntilChange = duration ?? this.selectDuration();
    this.updateTemperature();
  }

  /**
   * Load state from save.
   */
  loadState(state: WeatherState): void {
    this.state = { ...state };
  }

  /**
   * Reset to defaults.
   */
  reset(): void {
    this.state = { ...DEFAULT_WEATHER_STATE };
    this.biome = 'plains';
    this.season = 'summer';
  }
}

// ============================================================================
// HAZARD SYSTEM
// ============================================================================

/**
 * HazardSystem - Handles environmental hazard checks and effects.
 */
export class HazardSystem {
  /**
   * Get hazards for a biome.
   */
  static getHazardsForBiome(biome: string): EnvironmentalHazard[] {
    return ENVIRONMENTAL_HAZARDS.filter((h) =>
      h.biomes.includes(biome as never)
    );
  }

  /**
   * Get hazards triggered by weather.
   */
  static getHazardsForWeather(weather: WeatherType): EnvironmentalHazard[] {
    return ENVIRONMENTAL_HAZARDS.filter(
      (h) => h.weatherTriggers?.includes(weather)
    );
  }

  /**
   * Roll for random hazard encounter.
   */
  static rollForHazard(
    biome: string,
    weather: WeatherType,
    dangerLevel: number = 3
  ): EnvironmentalHazard | null {
    // Get eligible hazards
    let hazards = this.getHazardsForBiome(biome);

    // Add weather-triggered hazards
    const weatherHazards = this.getHazardsForWeather(weather);
    hazards = [...hazards, ...weatherHazards.filter((h) => !hazards.includes(h))];

    if (hazards.length === 0) return null;

    // Base encounter chance modified by danger level
    const baseChance = 0.05 + dangerLevel * 0.02;
    if (Math.random() > baseChance) return null;

    // Weight-based selection
    const totalWeight = hazards.reduce((sum, h) => sum + h.encounterWeight, 0);
    let random = Math.random() * totalWeight;

    for (const hazard of hazards) {
      random -= hazard.encounterWeight;
      if (random <= 0) return hazard;
    }

    return hazards[0];
  }

  /**
   * Perform a hazard check.
   */
  static performCheck(
    hazard: EnvironmentalHazard,
    playerStats: {
      agility?: number;
      strength?: number;
      perception?: number;
      survival?: number;
      luck?: number;
    },
    hasCounterItem: boolean = false,
    hasCounterSkill: boolean = false
  ): HazardCheckResult {
    // Detection check first
    const perceptionMod = (playerStats.perception ?? 50) - 50;
    const detectRoll = Math.random() * 100 + perceptionMod;
    const detected = detectRoll >= hazard.detectionDifficulty;

    if (detected) {
      return {
        hazardId: hazard.id,
        detected: true,
        success: true,
        critical: false,
        damageTaken: 0,
        message: hazard.detectionMessage ?? hazard.successMessage,
      };
    }

    // Main check
    let difficulty = hazard.baseDifficulty;

    // Counter item/skill bonuses
    if (hasCounterItem) difficulty -= 20;
    if (hasCounterSkill) difficulty -= 15;

    // Get relevant stat
    const stat = playerStats[hazard.checkType as keyof typeof playerStats] ?? 50;
    const statMod = stat - 50;

    const roll = Math.random() * 100 + statMod;
    const success = roll >= difficulty;
    const critical = roll >= difficulty + 40 || roll < difficulty - 30;

    if (success) {
      return {
        hazardId: hazard.id,
        detected: false,
        success: true,
        critical: critical && roll >= difficulty + 40,
        damageTaken: 0,
        message: hazard.successMessage,
      };
    }

    // Failure
    const { min, max } = hazard.damageRange;
    let damage = min + Math.floor(Math.random() * (max - min + 1));

    // Critical failure doubles damage
    if (critical) {
      damage = Math.round(damage * 1.5);

      // Check for lethal
      if (hazard.canBeLethal && Math.random() < 0.1) {
        return {
          hazardId: hazard.id,
          detected: false,
          success: false,
          critical: true,
          damageTaken: 9999, // Lethal
          statusApplied: hazard.statusEffect !== 'none' ? hazard.statusEffect : undefined,
          statusDuration: hazard.statusDuration,
          message: `CRITICAL: ${hazard.failureMessage} The ${hazard.name} proves fatal.`,
        };
      }
    }

    return {
      hazardId: hazard.id,
      detected: false,
      success: false,
      critical,
      damageTaken: damage,
      statusApplied: hazard.statusEffect !== 'none' ? hazard.statusEffect : undefined,
      statusDuration: hazard.statusDuration,
      message: critical ? `CRITICAL: ${hazard.failureMessage}` : hazard.failureMessage,
    };
  }
}

// ============================================================================
// TIME SYSTEM HELPERS
// ============================================================================

/**
 * Get time of day from hour.
 */
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'dusk';
  if (hour >= 19 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Get time effects for current hour.
 */
export function getTimeEffects(hour: number): TimeEffects {
  return TIME_OF_DAY_EFFECTS[getTimeOfDay(hour)];
}

/**
 * Get season from day of year.
 */
export function getSeason(dayOfYear: number): Season {
  if (dayOfYear >= 79 && dayOfYear < 172) return 'spring';
  if (dayOfYear >= 172 && dayOfYear < 265) return 'summer';
  if (dayOfYear >= 265 && dayOfYear < 355) return 'fall';
  return 'winter';
}

/**
 * Get seasonal effects.
 */
export function getSeasonalEffects(dayOfYear: number): SeasonalEffects {
  return SEASONAL_EFFECTS[getSeason(dayOfYear)];
}

// ============================================================================
// COMBINED ENVIRONMENT EFFECTS
// ============================================================================

/**
 * Calculate combined environmental effects.
 */
export function getCombinedEffects(
  weather: WeatherEffects,
  timeOfDay: TimeEffects,
  seasonal: SeasonalEffects
): {
  movementMultiplier: number;
  visibilityMultiplier: number;
  accuracyModifier: number;
  encounterModifiers: Record<string, number>;
  waterConsumption: number;
  staminaDrain: number;
  outdoorDamage: number;
  temperature: number;
  canTravel: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Combine multipliers
  const movementMultiplier = weather.movementMultiplier;
  const visibilityMultiplier = weather.visibilityMultiplier * timeOfDay.visibilityMultiplier;
  const accuracyModifier = weather.accuracyModifier;

  // Combine encounter modifiers
  const encounterModifiers: Record<string, number> = { ...timeOfDay.encounterModifiers };
  for (const key of Object.keys(encounterModifiers)) {
    encounterModifiers[key] *= weather.encounterRateModifier;
  }

  // Resource consumption
  const waterConsumption = weather.waterConsumptionMultiplier;
  const staminaDrain = weather.staminaDrainMultiplier;
  const outdoorDamage = weather.outdoorDamagePerHour;

  // Temperature (base from seasonal)
  const temperature = seasonal.temperatureModifier + timeOfDay.temperatureModifier;

  // Can travel safely
  let canTravel = true;
  if (weather.requiresShelter) {
    warnings.push('Severe weather - seek shelter!');
    canTravel = false;
  }
  if (!timeOfDay.safeTravelWithoutLight) {
    warnings.push('Too dark to travel safely without a light source.');
  }

  // Equipment warnings
  if (weather.requiredEquipment.length > 0) {
    warnings.push(`Recommended equipment: ${weather.requiredEquipment.join(', ')}`);
  }

  return {
    movementMultiplier,
    visibilityMultiplier,
    accuracyModifier,
    encounterModifiers,
    waterConsumption,
    staminaDrain,
    outdoorDamage,
    temperature,
    canTravel,
    warnings,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Re-export schema types
  type WeatherType,
  type WeatherSeverity,
  type WeatherEffects,
  type WeatherState,
  type BiomeWeatherPattern,
  type EnvironmentalHazard,
  type HazardCheckResult,
  type HazardType,
  type HazardCheckType,
  type HazardStatusEffect,
  type TimeOfDay,
  type TimeEffects,
  type Season,
  type SeasonalEffects,
  type EnvironmentState,
  // Re-export schemas for validation
  WeatherTypeSchema,
  WeatherSeveritySchema,
  WeatherEffectsSchema,
  WeatherStateSchema,
  EnvironmentalHazardSchema,
  HazardCheckResultSchema,
  EnvironmentStateSchema,
  ENVIRONMENT_SCHEMA_VERSION,
};
