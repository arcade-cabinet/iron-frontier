/**
 * FatigueSystem - Fatigue tracking and effects for Iron Frontier
 *
 * Manages player fatigue levels that increase with activity and decrease with rest.
 * Fatigue affects combat effectiveness, movement speed, and can cause forced rest.
 *
 * @module systems/fatigue
 */

import type { TimePhase } from './time';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Fatigue severity levels based on current fatigue value.
 */
export type FatigueLevel = 'rested' | 'tired' | 'weary' | 'exhausted' | 'collapsed';

/**
 * Effects applied at different fatigue thresholds.
 */
export interface FatigueEffects {
  /** Combat accuracy penalty (0-1, multiplied with base accuracy) */
  accuracyModifier: number;
  /** Combat damage penalty (0-1, multiplied with base damage) */
  damageModifier: number;
  /** Movement speed modifier (0-1, multiplied with base speed) */
  speedModifier: number;
  /** Chance of stumbling during movement (0-1) */
  stumbleChance: number;
  /** Whether the player can take actions */
  canAct: boolean;
  /** Whether the player is vulnerable to attacks */
  isVulnerable: boolean;
}

/**
 * Configuration for the FatigueSystem.
 */
export interface FatigueConfig {
  /** Maximum fatigue value */
  maxFatigue: number;

  /** Fatigue thresholds for each level */
  thresholds: {
    tired: number;    // Minor penalties start
    weary: number;    // Speed reduction
    exhausted: number; // Significant penalties
    collapsed: number; // Forced rest
  };

  /** Base fatigue increase rates (per game hour) */
  rates: {
    /** Fatigue gained per hour while traveling */
    travel: number;
    /** Fatigue gained per combat encounter */
    combat: number;
    /** Additional fatigue per hour when awake at night */
    nightPenalty: number;
    /** Base fatigue when just existing (awake, not traveling) */
    idle: number;
  };

  /** Fatigue recovery rates (per game hour) */
  recovery: {
    /** Recovery at an inn (full rest) */
    inn: number;
    /** Recovery while camping */
    camp: number;
    /** Recovery from rest items (per use) */
    item: number;
  };
}

/**
 * Serializable state for save/load functionality.
 */
export interface FatigueState {
  /** Current fatigue value (0-100) */
  current: number;
  /** Last time fatigue was updated (total game minutes) */
  lastUpdateTime: number;
  /** Whether a stumble event is pending */
  pendingStumble: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default fatigue configuration.
 */
export const DEFAULT_FATIGUE_CONFIG: FatigueConfig = {
  maxFatigue: 100,
  thresholds: {
    tired: 25,
    weary: 50,
    exhausted: 75,
    collapsed: 100,
  },
  rates: {
    travel: 8,      // 8 fatigue per hour of travel
    combat: 15,     // 15 fatigue per combat encounter
    nightPenalty: 5, // Extra 5 fatigue per hour awake at night
    idle: 2,        // 2 fatigue per hour just being awake
  },
  recovery: {
    inn: 25,    // 25 fatigue recovered per hour at inn
    camp: 15,   // 15 fatigue recovered per hour camping
    item: 20,   // 20 fatigue recovered per rest item
  },
};

/**
 * Default initial fatigue state.
 */
export const DEFAULT_FATIGUE_STATE: FatigueState = {
  current: 0,
  lastUpdateTime: 0,
  pendingStumble: false,
};

/**
 * Effects for each fatigue level.
 */
export const FATIGUE_EFFECTS: Record<FatigueLevel, FatigueEffects> = {
  rested: {
    accuracyModifier: 1.0,
    damageModifier: 1.0,
    speedModifier: 1.0,
    stumbleChance: 0,
    canAct: true,
    isVulnerable: false,
  },
  tired: {
    accuracyModifier: 0.95, // 5% accuracy penalty
    damageModifier: 0.95,   // 5% damage penalty
    speedModifier: 1.0,
    stumbleChance: 0,
    canAct: true,
    isVulnerable: false,
  },
  weary: {
    accuracyModifier: 0.85, // 15% accuracy penalty
    damageModifier: 0.90,   // 10% damage penalty
    speedModifier: 0.8,     // 20% speed reduction
    stumbleChance: 0.05,    // 5% stumble chance
    canAct: true,
    isVulnerable: false,
  },
  exhausted: {
    accuracyModifier: 0.7,  // 30% accuracy penalty
    damageModifier: 0.75,   // 25% damage penalty
    speedModifier: 0.6,     // 40% speed reduction
    stumbleChance: 0.15,    // 15% stumble chance
    canAct: true,
    isVulnerable: false,
  },
  collapsed: {
    accuracyModifier: 0,
    damageModifier: 0,
    speedModifier: 0,
    stumbleChance: 1.0,     // Always stumble
    canAct: false,          // Cannot take actions
    isVulnerable: true,     // Vulnerable to attacks
  },
};

// ============================================================================
// FATIGUE SYSTEM CLASS
// ============================================================================

/**
 * FatigueSystem manages player fatigue levels and their effects on gameplay.
 *
 * Features:
 * - Fatigue increases with travel, combat, and being awake at night
 * - Fatigue decreases with rest (inn, camping, items)
 * - Effects at thresholds: combat penalties, speed reduction, stumble, collapse
 * - Serializable state for save/load
 *
 * @example
 * ```typescript
 * const fatigue = new FatigueSystem();
 *
 * // Apply travel fatigue for 2 hours
 * fatigue.applyTravelFatigue(2);
 *
 * // Check effects
 * const effects = fatigue.getEffects();
 * const adjustedDamage = baseDamage * effects.damageModifier;
 *
 * // Rest at an inn
 * fatigue.applyInnRest(8); // 8 hours of rest
 * ```
 */
export class FatigueSystem {
  private config: FatigueConfig;
  private state: FatigueState;

  /**
   * Creates a new FatigueSystem instance.
   *
   * @param config - Optional configuration overrides
   * @param initialState - Optional initial state (for loading saves)
   */
  constructor(
    config: Partial<FatigueConfig> = {},
    initialState: Partial<FatigueState> = {}
  ) {
    this.config = { ...DEFAULT_FATIGUE_CONFIG, ...config };
    this.state = { ...DEFAULT_FATIGUE_STATE, ...initialState };
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Fatigue Queries
  // --------------------------------------------------------------------------

  /**
   * Gets the current fatigue value (0-100).
   */
  getCurrent(): number {
    return this.state.current;
  }

  /**
   * Gets the maximum fatigue value.
   */
  getMax(): number {
    return this.config.maxFatigue;
  }

  /**
   * Gets the current fatigue as a percentage (0-1).
   */
  getPercentage(): number {
    return this.state.current / this.config.maxFatigue;
  }

  /**
   * Gets the current fatigue level based on thresholds.
   */
  getLevel(): FatigueLevel {
    const { current } = this.state;
    const { thresholds } = this.config;

    if (current >= thresholds.collapsed) return 'collapsed';
    if (current >= thresholds.exhausted) return 'exhausted';
    if (current >= thresholds.weary) return 'weary';
    if (current >= thresholds.tired) return 'tired';
    return 'rested';
  }

  /**
   * Gets the effects for the current fatigue level.
   */
  getEffects(): FatigueEffects {
    return FATIGUE_EFFECTS[this.getLevel()];
  }

  /**
   * Gets a human-readable description of current fatigue.
   */
  getDescription(): string {
    const level = this.getLevel();
    switch (level) {
      case 'rested':
        return 'You feel well-rested and ready for anything.';
      case 'tired':
        return 'You are starting to feel tired. Combat is slightly affected.';
      case 'weary':
        return 'Weariness slows your movements. You need rest soon.';
      case 'exhausted':
        return 'Exhaustion clouds your mind. Combat is severely impaired.';
      case 'collapsed':
        return 'You collapse from exhaustion and cannot continue.';
    }
  }

  /**
   * Checks if a stumble should occur (for movement systems).
   * Resets the pending stumble flag after checking.
   */
  checkStumble(): boolean {
    const effects = this.getEffects();
    if (effects.stumbleChance <= 0) return false;

    const shouldStumble = Math.random() < effects.stumbleChance;
    if (shouldStumble) {
      this.state.pendingStumble = true;
    }
    return shouldStumble;
  }

  /**
   * Checks if there's a pending stumble event and clears it.
   */
  consumePendingStumble(): boolean {
    const pending = this.state.pendingStumble;
    this.state.pendingStumble = false;
    return pending;
  }

  /**
   * Checks if the player can take actions.
   */
  canAct(): boolean {
    return this.getEffects().canAct;
  }

  /**
   * Checks if the player is vulnerable to attacks.
   */
  isVulnerable(): boolean {
    return this.getEffects().isVulnerable;
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Fatigue Modification
  // --------------------------------------------------------------------------

  /**
   * Applies fatigue from traveling.
   *
   * @param hours - Number of game hours traveled
   * @param isNight - Whether it's currently night time
   */
  applyTravelFatigue(hours: number, isNight = false): void {
    let fatigue = hours * this.config.rates.travel;
    if (isNight) {
      fatigue += hours * this.config.rates.nightPenalty;
    }
    this.addFatigue(fatigue);
  }

  /**
   * Applies fatigue from combat.
   *
   * @param intensity - Combat intensity multiplier (default: 1)
   */
  applyCombatFatigue(intensity = 1): void {
    this.addFatigue(this.config.rates.combat * intensity);
  }

  /**
   * Applies fatigue from being awake (idle time).
   *
   * @param hours - Number of game hours awake
   * @param isNight - Whether it's currently night time
   */
  applyIdleFatigue(hours: number, isNight = false): void {
    let fatigue = hours * this.config.rates.idle;
    if (isNight) {
      fatigue += hours * this.config.rates.nightPenalty;
    }
    this.addFatigue(fatigue);
  }

  /**
   * Applies fatigue from the night penalty only.
   *
   * @param hours - Number of game hours awake at night
   */
  applyNightFatigue(hours: number): void {
    this.addFatigue(hours * this.config.rates.nightPenalty);
  }

  /**
   * Applies rest recovery from an inn.
   *
   * @param hours - Number of game hours rested
   */
  applyInnRest(hours: number): void {
    this.removeFatigue(hours * this.config.recovery.inn);
  }

  /**
   * Applies rest recovery from camping.
   *
   * @param hours - Number of game hours rested
   */
  applyCampRest(hours: number): void {
    this.removeFatigue(hours * this.config.recovery.camp);
  }

  /**
   * Applies rest recovery from using an item.
   *
   * @param multiplier - Item effectiveness multiplier (default: 1)
   */
  applyItemRest(multiplier = 1): void {
    this.removeFatigue(this.config.recovery.item * multiplier);
  }

  /**
   * Directly adds fatigue (clamped to max).
   *
   * @param amount - Amount of fatigue to add
   */
  addFatigue(amount: number): void {
    this.state.current = Math.min(
      this.config.maxFatigue,
      this.state.current + amount
    );
  }

  /**
   * Directly removes fatigue (clamped to 0).
   *
   * @param amount - Amount of fatigue to remove
   */
  removeFatigue(amount: number): void {
    this.state.current = Math.max(0, this.state.current - amount);
  }

  /**
   * Sets fatigue to a specific value (clamped).
   *
   * @param value - Fatigue value to set
   */
  setFatigue(value: number): void {
    this.state.current = Math.max(0, Math.min(this.config.maxFatigue, value));
  }

  /**
   * Resets fatigue to zero (fully rested).
   */
  fullRest(): void {
    this.state.current = 0;
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Serialization
  // --------------------------------------------------------------------------

  /**
   * Gets the current state for serialization (save game).
   */
  getState(): FatigueState {
    return { ...this.state };
  }

  /**
   * Loads state from a save (deserialization).
   *
   * @param state - The state to load
   */
  loadState(state: Partial<FatigueState>): void {
    this.state = { ...this.state, ...state };
  }

  /**
   * Resets to default state.
   */
  reset(): void {
    this.state = { ...DEFAULT_FATIGUE_STATE };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a new FatigueSystem instance with default settings.
 *
 * @param initialState - Optional initial state
 * @returns A new FatigueSystem instance
 */
export function createFatigueSystem(
  initialState?: Partial<FatigueState>
): FatigueSystem {
  return new FatigueSystem(undefined, initialState);
}

/**
 * Calculates fatigue gain for a travel segment.
 *
 * @param hours - Travel duration in game hours
 * @param phase - Current time phase
 * @returns Fatigue amount
 */
export function calculateTravelFatigue(
  hours: number,
  phase: TimePhase
): number {
  const isNight = phase === 'night';
  let fatigue = hours * DEFAULT_FATIGUE_CONFIG.rates.travel;
  if (isNight) {
    fatigue += hours * DEFAULT_FATIGUE_CONFIG.rates.nightPenalty;
  }
  return fatigue;
}

/**
 * Calculates fatigue recovery for a rest period.
 *
 * @param hours - Rest duration in game hours
 * @param isInn - Whether resting at an inn (vs camping)
 * @returns Fatigue recovery amount
 */
export function calculateRestRecovery(
  hours: number,
  isInn: boolean
): number {
  const rate = isInn
    ? DEFAULT_FATIGUE_CONFIG.recovery.inn
    : DEFAULT_FATIGUE_CONFIG.recovery.camp;
  return hours * rate;
}

/**
 * Gets the fatigue level for a given fatigue value.
 *
 * @param fatigue - Current fatigue value
 * @returns The fatigue level
 */
export function getFatigueLevel(fatigue: number): FatigueLevel {
  const { thresholds } = DEFAULT_FATIGUE_CONFIG;

  if (fatigue >= thresholds.collapsed) return 'collapsed';
  if (fatigue >= thresholds.exhausted) return 'exhausted';
  if (fatigue >= thresholds.weary) return 'weary';
  if (fatigue >= thresholds.tired) return 'tired';
  return 'rested';
}
