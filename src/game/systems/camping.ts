/**
 * CampingSystem - Wilderness camping and rest mechanics for Iron Frontier
 *
 * Manages camping activities including rest, fire management, encounter chances,
 * and integration with fatigue and provisions systems.
 *
 * @module systems/camping
 */

import type { FatigueSystem } from './fatigue';
import type { ProvisionsSystem, TerrainType } from './provisions';
import type { GameClock, TimePhase } from './time';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Standard rest duration options.
 */
export type RestDuration = 2 | 4 | 8;

/**
 * Types of camping activities.
 */
export type CampActivity = 'rest' | 'hunt' | 'forage' | 'keep_watch' | 'break_camp';

/**
 * Camp fire states.
 */
export type FireState = 'none' | 'smoldering' | 'burning' | 'blazing';

/**
 * Random encounter types while camping.
 */
export type CampEncounterType =
  | 'none'
  | 'wildlife_passive'    // Curious animals, no threat
  | 'wildlife_hostile'    // Predator attack
  | 'bandit_scout'        // Bandits spotted your camp
  | 'bandit_raid'         // Full bandit attack
  | 'traveler_friendly'   // Fellow traveler passes by
  | 'traveler_suspicious' // Suspicious character
  | 'weather_event'       // Sudden weather change
  | 'discovery';          // Find something interesting

/**
 * Result of a camping encounter check.
 */
export interface CampEncounter {
  /** Type of encounter */
  type: CampEncounterType;
  /** Whether it triggers combat */
  isCombat: boolean;
  /** Associated enemy encounter ID (if combat) */
  encounterId?: string;
  /** Flavor text describing the encounter */
  description: string;
  /** Whether the player was awakened */
  wakesPlayer: boolean;
  /** Any resources gained or lost */
  resourceChange?: {
    food?: number;
    water?: number;
    gold?: number;
  };
}

/**
 * Result of a camping session.
 */
export interface CampingResult {
  /** Hours actually rested (may be interrupted) */
  hoursRested: number;
  /** Fatigue recovered */
  fatigueRecovered: number;
  /** Food consumed */
  foodConsumed: number;
  /** Water consumed */
  waterConsumed: number;
  /** Whether rest was interrupted */
  wasInterrupted: boolean;
  /** Any encounters that occurred */
  encounters: CampEncounter[];
  /** Time phase at the end of rest */
  endPhase: TimePhase;
  /** Summary description */
  summary: string;
}

/**
 * Configuration for the CampingSystem.
 */
export interface CampingConfig {
  /** Available rest durations */
  restDurations: RestDuration[];

  /** Fatigue recovery rates per hour by rest type */
  recoveryRates: {
    /** Recovery rate without fire */
    noFire: number;
    /** Recovery rate with fire */
    withFire: number;
    /** Bonus recovery during day */
    dayBonus: number;
  };

  /** Fire visibility and safety modifiers */
  fire: {
    /** Base encounter chance reduction with fire */
    safetyBonus: number;
    /** Detection range increase with fire */
    visibilityIncrease: number;
    /** Fuel consumption per hour */
    fuelPerHour: number;
  };

  /** Base encounter chances per hour */
  encounterChances: {
    /** Base chance without fire */
    base: number;
    /** Increased chance at night */
    nightMultiplier: number;
    /** Modifier by terrain */
    terrainModifiers: Record<TerrainType, number>;
  };

  /** Encounter type probabilities (should sum to ~1) */
  encounterProbabilities: Record<CampEncounterType, number>;
}

/**
 * Serializable state for save/load functionality.
 */
export interface CampingState {
  /** Whether player is currently camping */
  isCamping: boolean;
  /** Current fire state */
  fireState: FireState;
  /** Fuel remaining for fire */
  fuelRemaining: number;
  /** Time camping started (total game minutes) */
  campStartTime: number;
  /** Total hours camped this session */
  hoursCamped: number;
  /** Encounters that occurred */
  encounters: CampEncounter[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default camping configuration.
 */
export const DEFAULT_CAMPING_CONFIG: CampingConfig = {
  restDurations: [2, 4, 8],

  recoveryRates: {
    noFire: 12,     // 12 fatigue per hour without fire
    withFire: 15,   // 15 fatigue per hour with fire
    dayBonus: 3,    // Extra 3 fatigue per hour during day
  },

  fire: {
    safetyBonus: 0.5,       // 50% reduction in hostile encounters
    visibilityIncrease: 2,  // 2x more likely to be spotted
    fuelPerHour: 1,         // 1 fuel unit per hour
  },

  encounterChances: {
    base: 0.15,             // 15% per hour
    nightMultiplier: 1.5,   // 50% more likely at night
    terrainModifiers: {
      desert: 0.8,      // -20% in desert
      plains: 1.0,      // Normal
      grassland: 1.0,   // Normal
      forest: 1.2,      // +20% in forest
      mountains: 1.1,   // +10% in mountains
      badlands: 1.3,    // +30% in badlands (bandits)
      riverside: 0.9,   // -10% at riverside
      town: 0,          // No camping in town
    },
  },

  encounterProbabilities: {
    none: 0,                    // Never selected as encounter
    wildlife_passive: 0.25,
    wildlife_hostile: 0.15,
    bandit_scout: 0.15,
    bandit_raid: 0.10,
    traveler_friendly: 0.15,
    traveler_suspicious: 0.10,
    weather_event: 0.05,
    discovery: 0.05,
  },
};

/**
 * Default initial camping state.
 */
export const DEFAULT_CAMPING_STATE: CampingState = {
  isCamping: false,
  fireState: 'none',
  fuelRemaining: 0,
  campStartTime: 0,
  hoursCamped: 0,
  encounters: [],
};

/**
 * Encounter descriptions for flavor text.
 */
const ENCOUNTER_DESCRIPTIONS: Record<CampEncounterType, string[]> = {
  none: [],
  wildlife_passive: [
    'A curious rabbit watches your camp from a distance.',
    'An owl hoots softly from a nearby tree.',
    'A family of deer passes by peacefully.',
    'You hear coyotes howling in the distance.',
  ],
  wildlife_hostile: [
    'A rattlesnake slithers into your camp!',
    'A pack of coyotes circles your camp, drawn by the smell of food.',
    'You wake to find a mountain lion prowling nearby!',
    'A angry javelina charges out of the brush!',
  ],
  bandit_scout: [
    'You spot a figure watching your camp from the shadows.',
    'The sound of hooves retreating quickly catches your attention.',
    'You find fresh boot prints around your camp perimeter.',
  ],
  bandit_raid: [
    'Armed men emerge from the darkness, demanding your valuables!',
    'You wake to find bandits rifling through your belongings!',
    'A voice calls out: "Nobody moves, nobody gets hurt!"',
  ],
  traveler_friendly: [
    'A weary traveler asks to share your fire.',
    'A prospector passes by and shares some water.',
    'A friendly trader offers to share news of the road ahead.',
  ],
  traveler_suspicious: [
    'A stranger in a long coat watches your camp from a distance.',
    'Someone approaches but turns away when they see you\'re awake.',
    'You notice someone has been going through your things...',
  ],
  weather_event: [
    'A sudden dust storm forces you to take cover.',
    'Thunder rumbles as a storm rolls in.',
    'The temperature drops sharply as night deepens.',
  ],
  discovery: [
    'You find an old trail marker pointing to a hidden spring.',
    'Digging to make camp, you uncover an old coin purse.',
    'You spot tracks leading to what might be an abandoned mine.',
  ],
};

// ============================================================================
// CAMPING SYSTEM CLASS
// ============================================================================

/**
 * CampingSystem manages wilderness camping, rest, and related activities.
 *
 * Features:
 * - Make camp action (only in wilderness)
 * - Rest duration selection (2/4/8 hours)
 * - Fatigue recovery with fire/no-fire options
 * - Random encounter chances while camping
 * - Provisions consumption during camping
 * - Fire management for safety vs. visibility tradeoff
 *
 * @example
 * ```typescript
 * const camping = new CampingSystem();
 *
 * // Check if camping is possible
 * if (camping.canCamp('grassland')) {
 *   // Set up camp with fire
 *   camping.setupCamp(true);
 *
 *   // Rest for 4 hours
 *   const result = camping.rest(4, fatigue, provisions, clock);
 *
 *   if (result.wasInterrupted) {
 *     console.log('Your rest was interrupted!');
 *   }
 * }
 * ```
 */
export class CampingSystem {
  private config: CampingConfig;
  private state: CampingState;

  /**
   * Creates a new CampingSystem instance.
   *
   * @param config - Optional configuration overrides
   * @param initialState - Optional initial state (for loading saves)
   */
  constructor(
    config: Partial<CampingConfig> = {},
    initialState: Partial<CampingState> = {}
  ) {
    this.config = { ...DEFAULT_CAMPING_CONFIG, ...config };
    this.state = { ...DEFAULT_CAMPING_STATE, ...initialState };
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Camp Queries
  // --------------------------------------------------------------------------

  /**
   * Checks if camping is currently active.
   */
  isCamping(): boolean {
    return this.state.isCamping;
  }

  /**
   * Gets the current fire state.
   */
  getFireState(): FireState {
    return this.state.fireState;
  }

  /**
   * Checks if there is an active fire.
   */
  hasFire(): boolean {
    return this.state.fireState !== 'none';
  }

  /**
   * Gets remaining fuel for the fire.
   */
  getFuelRemaining(): number {
    return this.state.fuelRemaining;
  }

  /**
   * Gets total hours camped this session.
   */
  getHoursCamped(): number {
    return this.state.hoursCamped;
  }

  /**
   * Gets available rest duration options.
   */
  getRestDurations(): RestDuration[] {
    return this.config.restDurations;
  }

  /**
   * Checks if camping is possible in the given terrain.
   *
   * @param terrain - Current terrain type
   * @returns Whether camping is allowed
   */
  canCamp(terrain: TerrainType): boolean {
    // Cannot camp in towns
    return terrain !== 'town';
  }

  /**
   * Estimates fatigue recovery for a rest duration.
   *
   * @param hours - Rest duration
   * @param hasFire - Whether fire is active
   * @param isDay - Whether it's daytime
   * @returns Estimated fatigue recovery
   */
  estimateRecovery(hours: RestDuration, hasFire: boolean, isDay: boolean): number {
    const { recoveryRates } = this.config;
    let rate = hasFire ? recoveryRates.withFire : recoveryRates.noFire;
    if (isDay) {
      rate += recoveryRates.dayBonus;
    }
    return hours * rate;
  }

  /**
   * Gets the encounter chance for current conditions.
   *
   * @param terrain - Current terrain type
   * @param isNight - Whether it's night time
   * @param hasFire - Whether fire is active
   * @returns Encounter chance per hour (0-1)
   */
  getEncounterChance(
    terrain: TerrainType,
    isNight: boolean,
    hasFire: boolean
  ): number {
    const { encounterChances, fire } = this.config;

    let chance = encounterChances.base;
    chance *= encounterChances.terrainModifiers[terrain];

    if (isNight) {
      chance *= encounterChances.nightMultiplier;
    }

    if (hasFire) {
      // Fire provides safety but increases visibility
      // Net effect: slight reduction in hostile encounters,
      // slight increase in curious encounters
      chance *= 1 - fire.safetyBonus * 0.3;
    }

    return Math.min(1, Math.max(0, chance));
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Camp Management
  // --------------------------------------------------------------------------

  /**
   * Sets up a camp site.
   *
   * @param withFire - Whether to start a fire
   * @param fuelAmount - Amount of fuel for the fire
   * @param currentTime - Current total game minutes
   */
  setupCamp(withFire: boolean, fuelAmount = 0, currentTime = 0): void {
    this.state.isCamping = true;
    this.state.campStartTime = currentTime;
    this.state.hoursCamped = 0;
    this.state.encounters = [];

    if (withFire && fuelAmount > 0) {
      this.state.fireState = 'burning';
      this.state.fuelRemaining = fuelAmount;
    } else {
      this.state.fireState = 'none';
      this.state.fuelRemaining = 0;
    }
  }

  /**
   * Adds fuel to the fire.
   *
   * @param amount - Fuel to add
   */
  addFuel(amount: number): void {
    this.state.fuelRemaining += amount;
    if (this.state.fireState === 'none' || this.state.fireState === 'smoldering') {
      this.state.fireState = 'burning';
    }
  }

  /**
   * Breaks camp and cleans up.
   */
  breakCamp(): void {
    this.state.isCamping = false;
    this.state.fireState = 'none';
    this.state.fuelRemaining = 0;
  }

  /**
   * Performs rest activity at camp.
   * Integrates with fatigue, provisions, and time systems.
   *
   * @param duration - Rest duration in hours
   * @param fatigue - FatigueSystem instance
   * @param provisions - ProvisionsSystem instance
   * @param clock - GameClock instance
   * @param terrain - Current terrain type
   * @param rng - Optional random number generator
   * @returns Camping result
   */
  rest(
    duration: RestDuration,
    fatigue: FatigueSystem,
    provisions: ProvisionsSystem,
    clock: GameClock,
    terrain: TerrainType,
    rng?: () => number
  ): CampingResult {
    const random = rng ?? Math.random;

    let hoursRested = 0;
    let fatigueRecovered = 0;
    const encounters: CampEncounter[] = [];
    let wasInterrupted = false;

    // Rest hour by hour to check for encounters
    for (let hour = 0; hour < duration && !wasInterrupted; hour++) {
      const isNight = clock.isNight();

      // Check for encounter
      const encounter = this.checkEncounter(terrain, isNight, random);
      if (encounter.type !== 'none') {
        encounters.push(encounter);
        this.state.encounters.push(encounter);

        if (encounter.wakesPlayer) {
          wasInterrupted = true;
          // Still get partial rest
          hoursRested = hour;
          break;
        }
      }

      // Consume fuel
      if (this.hasFire()) {
        this.state.fuelRemaining -= this.config.fire.fuelPerHour;
        if (this.state.fuelRemaining <= 0) {
          this.state.fuelRemaining = 0;
          this.state.fireState = 'smoldering';
        }
      }

      // Advance time
      clock.advanceHours(1, false); // Don't emit events for each hour

      hoursRested = hour + 1;
    }

    // Calculate fatigue recovery
    const recoveryRate = this.hasFire()
      ? this.config.recoveryRates.withFire
      : this.config.recoveryRates.noFire;
    const isDay = !clock.isNight();
    const dayBonus = isDay ? this.config.recoveryRates.dayBonus : 0;

    fatigueRecovered = hoursRested * (recoveryRate + dayBonus);
    fatigue.applyCampRest(hoursRested);

    // Consume provisions
    const consumed = provisions.consumeForCamping(hoursRested);

    // Update state
    this.state.hoursCamped += hoursRested;

    // Generate summary
    let summary = `You rested for ${hoursRested} hour${hoursRested !== 1 ? 's' : ''}.`;
    if (wasInterrupted) {
      summary = `Your rest was interrupted after ${hoursRested} hour${hoursRested !== 1 ? 's' : ''}!`;
    }
    if (encounters.length > 0) {
      summary += ` You had ${encounters.length} encounter${encounters.length !== 1 ? 's' : ''}.`;
    }

    return {
      hoursRested,
      fatigueRecovered,
      foodConsumed: consumed.foodConsumed,
      waterConsumed: consumed.waterConsumed,
      wasInterrupted,
      encounters,
      endPhase: clock.getPhase(),
      summary,
    };
  }

  /**
   * Checks for a random encounter while camping.
   *
   * @param terrain - Current terrain type
   * @param isNight - Whether it's night time
   * @param rng - Random number generator
   * @returns Encounter result
   */
  checkEncounter(
    terrain: TerrainType,
    isNight: boolean,
    rng?: () => number
  ): CampEncounter {
    const random = rng ?? Math.random;
    const chance = this.getEncounterChance(terrain, isNight, this.hasFire());

    // Roll for encounter
    if (random() > chance) {
      return {
        type: 'none',
        isCombat: false,
        description: '',
        wakesPlayer: false,
      };
    }

    // Determine encounter type
    const encounterType = this.rollEncounterType(random);

    return this.generateEncounter(encounterType, random);
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Serialization
  // --------------------------------------------------------------------------

  /**
   * Gets the current state for serialization (save game).
   */
  getState(): CampingState {
    return { ...this.state };
  }

  /**
   * Loads state from a save (deserialization).
   *
   * @param state - The state to load
   */
  loadState(state: Partial<CampingState>): void {
    this.state = { ...this.state, ...state };
  }

  /**
   * Resets to default state.
   */
  reset(): void {
    this.state = { ...DEFAULT_CAMPING_STATE };
  }

  // --------------------------------------------------------------------------
  // PRIVATE METHODS
  // --------------------------------------------------------------------------

  /**
   * Rolls for an encounter type based on probabilities.
   */
  private rollEncounterType(random: () => number): CampEncounterType {
    const { encounterProbabilities } = this.config;
    const roll = random();
    let cumulative = 0;

    for (const [type, probability] of Object.entries(encounterProbabilities)) {
      if (type === 'none') continue;
      cumulative += probability;
      if (roll < cumulative) {
        return type as CampEncounterType;
      }
    }

    return 'wildlife_passive'; // Fallback
  }

  /**
   * Generates an encounter with full details.
   */
  private generateEncounter(
    type: CampEncounterType,
    random: () => number
  ): CampEncounter {
    const descriptions = ENCOUNTER_DESCRIPTIONS[type];
    const description =
      descriptions.length > 0
        ? descriptions[Math.floor(random() * descriptions.length)]
        : '';

    const baseEncounter: CampEncounter = {
      type,
      isCombat: false,
      description,
      wakesPlayer: false,
    };

    // Customize based on type
    switch (type) {
      case 'wildlife_hostile':
        return {
          ...baseEncounter,
          isCombat: true,
          encounterId: 'camp_wildlife_attack',
          wakesPlayer: true,
        };

      case 'bandit_raid':
        return {
          ...baseEncounter,
          isCombat: true,
          encounterId: 'camp_bandit_raid',
          wakesPlayer: true,
        };

      case 'bandit_scout':
        // May or may not wake player
        return {
          ...baseEncounter,
          wakesPlayer: random() > 0.5,
        };

      case 'traveler_suspicious':
        return {
          ...baseEncounter,
          wakesPlayer: true,
          resourceChange: random() > 0.7 ? { gold: -Math.floor(random() * 10 + 5) } : undefined,
        };

      case 'discovery':
        return {
          ...baseEncounter,
          wakesPlayer: false,
          resourceChange: {
            gold: Math.floor(random() * 15 + 5),
          },
        };

      case 'weather_event':
        return {
          ...baseEncounter,
          wakesPlayer: true,
        };

      default:
        return baseEncounter;
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a new CampingSystem instance with default settings.
 *
 * @param initialState - Optional initial state
 * @returns A new CampingSystem instance
 */
export function createCampingSystem(
  initialState?: Partial<CampingState>
): CampingSystem {
  return new CampingSystem(undefined, initialState);
}

/**
 * Calculates the total fatigue recovery for a rest period.
 *
 * @param hours - Rest duration
 * @param hasFire - Whether fire is active
 * @param isDay - Whether it's daytime
 * @returns Fatigue recovery amount
 */
export function calculateRestRecovery(
  hours: number,
  hasFire: boolean,
  isDay: boolean
): number {
  const { recoveryRates } = DEFAULT_CAMPING_CONFIG;
  let rate = hasFire ? recoveryRates.withFire : recoveryRates.noFire;
  if (isDay) {
    rate += recoveryRates.dayBonus;
  }
  return hours * rate;
}

/**
 * Gets the display name for a rest duration.
 *
 * @param duration - Rest duration in hours
 * @returns Display string
 */
export function getRestDurationLabel(duration: RestDuration): string {
  switch (duration) {
    case 2:
      return 'Short Rest (2 hours)';
    case 4:
      return 'Medium Rest (4 hours)';
    case 8:
      return 'Full Rest (8 hours)';
  }
}

/**
 * Gets the recommended rest duration based on fatigue level.
 *
 * @param fatigue - Current fatigue (0-100)
 * @returns Recommended rest duration
 */
export function getRecommendedRestDuration(fatigue: number): RestDuration {
  if (fatigue >= 75) return 8;
  if (fatigue >= 50) return 4;
  return 2;
}
