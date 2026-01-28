/**
 * ProvisionsSystem - Food and water tracking for Iron Frontier
 *
 * Manages player provisions (food and water) that are consumed during travel.
 * Running out of provisions increases fatigue accumulation and can cause health drain.
 *
 * @module systems/provisions
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Terrain types that affect foraging chances.
 */
export type TerrainType =
  | 'desert'
  | 'plains'
  | 'grassland'
  | 'forest'
  | 'mountains'
  | 'badlands'
  | 'riverside'
  | 'town';

/**
 * Provision status levels.
 */
export type ProvisionStatus = 'abundant' | 'adequate' | 'low' | 'critical' | 'depleted';

/**
 * Result of a hunting attempt.
 */
export interface HuntingResult {
  /** Whether the hunt was successful */
  success: boolean;
  /** Amount of food gained */
  foodGained: number;
  /** Amount of water gained (from animal sources) */
  waterGained: number;
  /** Fatigue cost of the hunt */
  fatigueCost: number;
  /** Time spent hunting (in game hours) */
  timeSpent: number;
  /** Flavor text describing the hunt */
  description: string;
}

/**
 * Result of a foraging attempt.
 */
export interface ForagingResult {
  /** Whether foraging found anything */
  success: boolean;
  /** Amount of food found */
  foodFound: number;
  /** Amount of water found */
  waterFound: number;
  /** Time spent foraging (in game hours) */
  timeSpent: number;
  /** What was found (for flavor) */
  foundItems: string[];
}

/**
 * Configuration for the ProvisionsSystem.
 */
export interface ProvisionsConfig {
  /** Maximum food capacity */
  maxFood: number;
  /** Maximum water capacity */
  maxWater: number;

  /** Consumption rates per game hour of travel */
  consumption: {
    food: number;
    water: number;
  };

  /** Fatigue multipliers when out of provisions */
  depletionEffects: {
    noFood: number;   // Fatigue increases 2x faster
    noWater: number;  // Fatigue increases 3x faster
  };

  /** Health drain when severely dehydrated (per game hour) */
  dehydrationDamage: number;

  /** Foraging success chances by terrain (0-1) */
  foragingChances: Record<TerrainType, number>;

  /** Hunting configuration */
  hunting: {
    /** Base success chance */
    baseChance: number;
    /** Time required for a hunt (game hours) */
    duration: number;
    /** Fatigue cost of hunting */
    fatigueCost: number;
    /** Food yield on success */
    foodYield: [number, number]; // [min, max]
    /** Chance of finding water while hunting */
    waterChance: number;
    /** Water yield if found */
    waterYield: [number, number];
  };
}

/**
 * Serializable state for save/load functionality.
 */
export interface ProvisionsState {
  /** Current food amount */
  food: number;
  /** Current water amount */
  water: number;
  /** Hours since last meal (for starvation tracking) */
  hoursSinceFood: number;
  /** Hours since last drink (for dehydration tracking) */
  hoursSinceWater: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default provisions configuration.
 */
export const DEFAULT_PROVISIONS_CONFIG: ProvisionsConfig = {
  maxFood: 100,
  maxWater: 100,

  consumption: {
    food: 4,   // 4 units per hour of travel (25 hours to deplete)
    water: 6,  // 6 units per hour of travel (16.7 hours to deplete)
  },

  depletionEffects: {
    noFood: 2.0,  // Double fatigue rate
    noWater: 3.0, // Triple fatigue rate
  },

  dehydrationDamage: 5, // 5 HP per hour without water

  foragingChances: {
    desert: 0.05,     // Very low
    plains: 0.25,     // Low-medium
    grassland: 0.35,  // Medium
    forest: 0.50,     // High
    mountains: 0.15,  // Low
    badlands: 0.10,   // Very low
    riverside: 0.60,  // Very high (fish, water)
    town: 0,          // Cannot forage in town
  },

  hunting: {
    baseChance: 0.6,      // 60% base success
    duration: 2,          // 2 hours to hunt
    fatigueCost: 15,      // Hunting is tiring
    foodYield: [15, 30],  // 15-30 food on success
    waterChance: 0.3,     // 30% chance of water
    waterYield: [5, 15],  // 5-15 water if found
  },
};

/**
 * Default initial provisions state (well-stocked).
 */
export const DEFAULT_PROVISIONS_STATE: ProvisionsState = {
  food: 75,
  water: 75,
  hoursSinceFood: 0,
  hoursSinceWater: 0,
};

/**
 * Status thresholds (as percentage of max).
 */
const STATUS_THRESHOLDS = {
  abundant: 0.75,  // > 75%
  adequate: 0.50,  // 50-75%
  low: 0.25,       // 25-50%
  critical: 0.10,  // 10-25%
  depleted: 0,     // < 10%
};

/**
 * Foraging yield by terrain type.
 */
const FORAGING_YIELDS: Record<TerrainType, { food: [number, number]; water: [number, number] }> = {
  desert: { food: [1, 3], water: [0, 1] },
  plains: { food: [2, 6], water: [1, 3] },
  grassland: { food: [3, 8], water: [2, 5] },
  forest: { food: [5, 12], water: [3, 8] },
  mountains: { food: [2, 5], water: [2, 6] },
  badlands: { food: [1, 4], water: [0, 2] },
  riverside: { food: [4, 10], water: [8, 15] },
  town: { food: [0, 0], water: [0, 0] },
};

/**
 * Foraging item descriptions by terrain.
 */
const FORAGING_ITEMS: Record<TerrainType, string[]> = {
  desert: ['cactus fruit', 'desert roots', 'lizard eggs'],
  plains: ['wild berries', 'prairie herbs', 'small game'],
  grassland: ['wild vegetables', 'bird eggs', 'edible flowers'],
  forest: ['mushrooms', 'nuts', 'wild berries', 'herbs'],
  mountains: ['mountain berries', 'pine nuts', 'spring water'],
  badlands: ['tough roots', 'snake eggs', 'bitter herbs'],
  riverside: ['fish', 'crawfish', 'watercress', 'fresh water'],
  town: [],
};

// ============================================================================
// PROVISIONS SYSTEM CLASS
// ============================================================================

/**
 * ProvisionsSystem manages player food and water supplies.
 *
 * Features:
 * - Separate tracking for food and water
 * - Consumption during travel
 * - Effects when running out (increased fatigue, health drain)
 * - Hunting mini-game for acquiring food
 * - Foraging based on terrain type
 *
 * @example
 * ```typescript
 * const provisions = new ProvisionsSystem();
 *
 * // Consume during 2 hours of travel
 * provisions.consumeForTravel(2);
 *
 * // Check status
 * if (provisions.getWaterStatus() === 'critical') {
 *   console.log('Need water urgently!');
 * }
 *
 * // Try hunting
 * const result = provisions.attemptHunt();
 * if (result.success) {
 *   console.log(`Caught game: +${result.foodGained} food`);
 * }
 * ```
 */
export class ProvisionsSystem {
  private config: ProvisionsConfig;
  private state: ProvisionsState;

  /**
   * Creates a new ProvisionsSystem instance.
   *
   * @param config - Optional configuration overrides
   * @param initialState - Optional initial state (for loading saves)
   */
  constructor(
    config: Partial<ProvisionsConfig> = {},
    initialState: Partial<ProvisionsState> = {}
  ) {
    this.config = { ...DEFAULT_PROVISIONS_CONFIG, ...config };
    this.state = { ...DEFAULT_PROVISIONS_STATE, ...initialState };
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Provision Queries
  // --------------------------------------------------------------------------

  /**
   * Gets the current food amount.
   */
  getFood(): number {
    return this.state.food;
  }

  /**
   * Gets the current water amount.
   */
  getWater(): number {
    return this.state.water;
  }

  /**
   * Gets food as a percentage of maximum (0-1).
   */
  getFoodPercentage(): number {
    return this.state.food / this.config.maxFood;
  }

  /**
   * Gets water as a percentage of maximum (0-1).
   */
  getWaterPercentage(): number {
    return this.state.water / this.config.maxWater;
  }

  /**
   * Gets the food provision status.
   */
  getFoodStatus(): ProvisionStatus {
    return this.getStatus(this.getFoodPercentage());
  }

  /**
   * Gets the water provision status.
   */
  getWaterStatus(): ProvisionStatus {
    return this.getStatus(this.getWaterPercentage());
  }

  /**
   * Gets the overall provision status (worst of food/water).
   */
  getOverallStatus(): ProvisionStatus {
    const foodStatus = this.getFoodStatus();
    const waterStatus = this.getWaterStatus();

    // Return the worse status
    const statusOrder: ProvisionStatus[] = [
      'abundant',
      'adequate',
      'low',
      'critical',
      'depleted',
    ];
    const foodIndex = statusOrder.indexOf(foodStatus);
    const waterIndex = statusOrder.indexOf(waterStatus);
    return statusOrder[Math.max(foodIndex, waterIndex)];
  }

  /**
   * Checks if player has any food.
   */
  hasFood(): boolean {
    return this.state.food > 0;
  }

  /**
   * Checks if player has any water.
   */
  hasWater(): boolean {
    return this.state.water > 0;
  }

  /**
   * Gets the fatigue multiplier based on provision status.
   */
  getFatigueMultiplier(): number {
    let multiplier = 1.0;

    if (!this.hasFood()) {
      multiplier *= this.config.depletionEffects.noFood;
    }
    if (!this.hasWater()) {
      multiplier *= this.config.depletionEffects.noWater;
    }

    return multiplier;
  }

  /**
   * Gets health damage from dehydration (per hour).
   * Returns 0 if player has water.
   */
  getDehydrationDamage(): number {
    return this.hasWater() ? 0 : this.config.dehydrationDamage;
  }

  /**
   * Gets hours since last food consumption.
   */
  getHoursSinceFood(): number {
    return this.state.hoursSinceFood;
  }

  /**
   * Gets hours since last water consumption.
   */
  getHoursSinceWater(): number {
    return this.state.hoursSinceWater;
  }

  /**
   * Estimates hours of travel until food runs out.
   */
  estimateFoodDuration(): number {
    if (!this.hasFood()) return 0;
    return this.state.food / this.config.consumption.food;
  }

  /**
   * Estimates hours of travel until water runs out.
   */
  estimateWaterDuration(): number {
    if (!this.hasWater()) return 0;
    return this.state.water / this.config.consumption.water;
  }

  /**
   * Gets a human-readable description of provision status.
   */
  getDescription(): string {
    const foodStatus = this.getFoodStatus();
    const waterStatus = this.getWaterStatus();

    if (foodStatus === 'depleted' && waterStatus === 'depleted') {
      return 'You are starving and severely dehydrated. Find supplies immediately!';
    }
    if (waterStatus === 'depleted') {
      return 'You are severely dehydrated. Your health is draining!';
    }
    if (foodStatus === 'depleted') {
      return 'You are starving. Fatigue is building rapidly.';
    }
    if (foodStatus === 'critical' || waterStatus === 'critical') {
      return 'Supplies are critically low. Resupply soon or hunt for food.';
    }
    if (foodStatus === 'low' || waterStatus === 'low') {
      return 'Supplies are running low. Consider restocking.';
    }
    if (foodStatus === 'abundant' && waterStatus === 'abundant') {
      return 'Well-stocked with provisions.';
    }
    return 'Supplies are adequate for now.';
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Provision Modification
  // --------------------------------------------------------------------------

  /**
   * Consumes provisions for a travel duration.
   *
   * @param hours - Hours of travel
   * @returns Object with amounts consumed and any warnings
   */
  consumeForTravel(hours: number): {
    foodConsumed: number;
    waterConsumed: number;
    ranOutOfFood: boolean;
    ranOutOfWater: boolean;
  } {
    const foodToConsume = hours * this.config.consumption.food;
    const waterToConsume = hours * this.config.consumption.water;

    const previousFood = this.state.food;
    const previousWater = this.state.water;

    this.state.food = Math.max(0, this.state.food - foodToConsume);
    this.state.water = Math.max(0, this.state.water - waterToConsume);

    // Track time since consumption
    if (this.hasFood()) {
      this.state.hoursSinceFood = 0;
    } else {
      this.state.hoursSinceFood += hours;
    }

    if (this.hasWater()) {
      this.state.hoursSinceWater = 0;
    } else {
      this.state.hoursSinceWater += hours;
    }

    return {
      foodConsumed: previousFood - this.state.food,
      waterConsumed: previousWater - this.state.water,
      ranOutOfFood: previousFood > 0 && this.state.food === 0,
      ranOutOfWater: previousWater > 0 && this.state.water === 0,
    };
  }

  /**
   * Consumes provisions while camping (reduced rate).
   *
   * @param hours - Hours of camping
   * @returns Object with amounts consumed
   */
  consumeForCamping(hours: number): {
    foodConsumed: number;
    waterConsumed: number;
  } {
    // Half consumption rate while camping
    const foodToConsume = (hours * this.config.consumption.food) / 2;
    const waterToConsume = (hours * this.config.consumption.water) / 2;

    const previousFood = this.state.food;
    const previousWater = this.state.water;

    this.state.food = Math.max(0, this.state.food - foodToConsume);
    this.state.water = Math.max(0, this.state.water - waterToConsume);

    return {
      foodConsumed: previousFood - this.state.food,
      waterConsumed: previousWater - this.state.water,
    };
  }

  /**
   * Adds food to inventory (clamped to max).
   *
   * @param amount - Amount of food to add
   */
  addFood(amount: number): void {
    this.state.food = Math.min(this.config.maxFood, this.state.food + amount);
    this.state.hoursSinceFood = 0;
  }

  /**
   * Adds water to inventory (clamped to max).
   *
   * @param amount - Amount of water to add
   */
  addWater(amount: number): void {
    this.state.water = Math.min(this.config.maxWater, this.state.water + amount);
    this.state.hoursSinceWater = 0;
  }

  /**
   * Adds both food and water.
   *
   * @param food - Amount of food to add
   * @param water - Amount of water to add
   */
  addProvisions(food: number, water: number): void {
    this.addFood(food);
    this.addWater(water);
  }

  /**
   * Refills provisions to maximum (e.g., at a town).
   */
  refillAll(): void {
    this.state.food = this.config.maxFood;
    this.state.water = this.config.maxWater;
    this.state.hoursSinceFood = 0;
    this.state.hoursSinceWater = 0;
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Hunting & Foraging
  // --------------------------------------------------------------------------

  /**
   * Attempts a hunting mini-game.
   * This is pure logic; UI should handle the actual mini-game presentation.
   *
   * @param skillModifier - Player's hunting skill modifier (0-1 bonus)
   * @param rng - Optional random number generator for deterministic results
   * @returns Hunting result
   */
  attemptHunt(skillModifier = 0, rng?: () => number): HuntingResult {
    const random = rng ?? Math.random;
    const { hunting } = this.config;

    const successChance = Math.min(1, hunting.baseChance + skillModifier);
    const success = random() < successChance;

    if (!success) {
      return {
        success: false,
        foodGained: 0,
        waterGained: 0,
        fatigueCost: hunting.fatigueCost,
        timeSpent: hunting.duration,
        description: 'The hunt was unsuccessful. No game was found.',
      };
    }

    // Calculate yields
    const foodGained = Math.floor(
      hunting.foodYield[0] +
        random() * (hunting.foodYield[1] - hunting.foodYield[0])
    );

    let waterGained = 0;
    let description = `You caught game and gained ${foodGained} food.`;

    if (random() < hunting.waterChance) {
      waterGained = Math.floor(
        hunting.waterYield[0] +
          random() * (hunting.waterYield[1] - hunting.waterYield[0])
      );
      description += ` You also found ${waterGained} water.`;
    }

    // Apply the gains
    this.addFood(foodGained);
    this.addWater(waterGained);

    return {
      success: true,
      foodGained,
      waterGained,
      fatigueCost: hunting.fatigueCost,
      timeSpent: hunting.duration,
      description,
    };
  }

  /**
   * Attempts to forage for provisions based on terrain.
   *
   * @param terrain - Current terrain type
   * @param rng - Optional random number generator
   * @returns Foraging result
   */
  attemptForage(terrain: TerrainType, rng?: () => number): ForagingResult {
    const random = rng ?? Math.random;
    const chance = this.config.foragingChances[terrain];

    // Zero chance means impossible (e.g., in town)
    if (chance <= 0 || random() >= chance) {
      return {
        success: false,
        foodFound: 0,
        waterFound: 0,
        timeSpent: 0.5, // Half hour spent looking
        foundItems: [],
      };
    }

    const yields = FORAGING_YIELDS[terrain];
    const items = FORAGING_ITEMS[terrain];

    const foodFound = Math.floor(
      yields.food[0] + random() * (yields.food[1] - yields.food[0])
    );
    const waterFound = Math.floor(
      yields.water[0] + random() * (yields.water[1] - yields.water[0])
    );

    // Pick 1-2 random items found
    const numItems = Math.min(items.length, 1 + Math.floor(random() * 2));
    const foundItems: string[] = [];
    const itemsCopy = [...items];
    for (let i = 0; i < numItems && itemsCopy.length > 0; i++) {
      const idx = Math.floor(random() * itemsCopy.length);
      foundItems.push(itemsCopy.splice(idx, 1)[0]);
    }

    // Apply the gains
    this.addFood(foodFound);
    this.addWater(waterFound);

    return {
      success: true,
      foodFound,
      waterFound,
      timeSpent: 1, // One hour foraging
      foundItems,
    };
  }

  /**
   * Gets the foraging success chance for a terrain type.
   *
   * @param terrain - Terrain type
   * @returns Success chance (0-1)
   */
  getForagingChance(terrain: TerrainType): number {
    return this.config.foragingChances[terrain];
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Serialization
  // --------------------------------------------------------------------------

  /**
   * Gets the current state for serialization (save game).
   */
  getState(): ProvisionsState {
    return { ...this.state };
  }

  /**
   * Loads state from a save (deserialization).
   *
   * @param state - The state to load
   */
  loadState(state: Partial<ProvisionsState>): void {
    this.state = { ...this.state, ...state };
  }

  /**
   * Resets to default state.
   */
  reset(): void {
    this.state = { ...DEFAULT_PROVISIONS_STATE };
  }

  // --------------------------------------------------------------------------
  // PRIVATE METHODS
  // --------------------------------------------------------------------------

  /**
   * Converts a percentage to a provision status.
   */
  private getStatus(percentage: number): ProvisionStatus {
    if (percentage >= STATUS_THRESHOLDS.abundant) return 'abundant';
    if (percentage >= STATUS_THRESHOLDS.adequate) return 'adequate';
    if (percentage >= STATUS_THRESHOLDS.low) return 'low';
    if (percentage >= STATUS_THRESHOLDS.critical) return 'critical';
    return 'depleted';
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a new ProvisionsSystem instance with default settings.
 *
 * @param initialState - Optional initial state
 * @returns A new ProvisionsSystem instance
 */
export function createProvisionsSystem(
  initialState?: Partial<ProvisionsState>
): ProvisionsSystem {
  return new ProvisionsSystem(undefined, initialState);
}

/**
 * Calculates provision consumption for a travel duration.
 *
 * @param hours - Travel duration in hours
 * @returns Object with food and water consumption
 */
export function calculateTravelConsumption(hours: number): {
  food: number;
  water: number;
} {
  return {
    food: hours * DEFAULT_PROVISIONS_CONFIG.consumption.food,
    water: hours * DEFAULT_PROVISIONS_CONFIG.consumption.water,
  };
}

/**
 * Checks if provisions are sufficient for a journey.
 *
 * @param food - Current food
 * @param water - Current water
 * @param travelHours - Estimated travel time
 * @returns Whether provisions are sufficient
 */
export function hasEnoughProvisions(
  food: number,
  water: number,
  travelHours: number
): boolean {
  const consumption = calculateTravelConsumption(travelHours);
  return food >= consumption.food && water >= consumption.water;
}

/**
 * Gets the provision status for a given amount and max.
 *
 * @param current - Current amount
 * @param max - Maximum amount
 * @returns Provision status
 */
export function getProvisionStatus(
  current: number,
  max: number
): ProvisionStatus {
  const percentage = current / max;
  if (percentage >= STATUS_THRESHOLDS.abundant) return 'abundant';
  if (percentage >= STATUS_THRESHOLDS.adequate) return 'adequate';
  if (percentage >= STATUS_THRESHOLDS.low) return 'low';
  if (percentage >= STATUS_THRESHOLDS.critical) return 'critical';
  return 'depleted';
}
