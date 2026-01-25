/**
 * GameClock - Time tracking and day/night cycle system for Iron Frontier
 *
 * Manages game time with configurable time scale, day/night phase detection,
 * and event emission for time-based game systems.
 *
 * @module systems/time
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Time phases representing different parts of the day.
 * Each phase affects gameplay differently (visibility, encounters, NPC schedules).
 */
export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';

/**
 * Events emitted by the GameClock system.
 */
export type TimeEventType = 'tick' | 'hourChanged' | 'phaseChanged' | 'dayChanged';

/**
 * Payload for time events.
 */
export interface TimeEventPayload {
  /** Current game time in hours (0-23.999) */
  hour: number;
  /** Current game time in minutes (0-59) */
  minute: number;
  /** Current day number (starts at 1) */
  day: number;
  /** Current time phase */
  phase: TimePhase;
  /** Previous phase (only for phaseChanged events) */
  previousPhase?: TimePhase;
}

/**
 * Callback function for time events.
 */
export type TimeEventCallback = (event: TimeEventPayload) => void;

/**
 * Configuration options for the GameClock.
 */
export interface GameClockConfig {
  /**
   * Game time scale: how many real milliseconds equal one game minute.
   * Default: 2000ms (1 game hour = 2 real minutes, 1 game minute = 2 real seconds)
   */
  msPerGameMinute: number;

  /**
   * Update interval in milliseconds.
   * Smaller values = smoother updates but more CPU usage.
   * Default: 1000ms
   */
  tickInterval: number;

  /**
   * Hour boundaries for each time phase.
   * Format: { dawn: [start, end], day: [start, end], ... }
   */
  phaseBoundaries: {
    dawn: [number, number];
    day: [number, number];
    dusk: [number, number];
    night: [number, number];
  };
}

/**
 * Serializable state for save/load functionality.
 */
export interface GameClockState {
  /** Current hour (0-23) */
  hour: number;
  /** Current minute (0-59) */
  minute: number;
  /** Current day number */
  day: number;
  /** Whether the clock is paused */
  isPaused: boolean;
  /** Total elapsed game time in minutes */
  totalMinutes: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default configuration for the GameClock.
 * 1 game hour = 2 real minutes (120,000ms)
 * 1 game minute = 2 real seconds (2000ms)
 */
export const DEFAULT_CLOCK_CONFIG: GameClockConfig = {
  msPerGameMinute: 2000,
  tickInterval: 1000,
  phaseBoundaries: {
    dawn: [5, 7],
    day: [7, 18],
    dusk: [18, 20],
    night: [20, 5], // wraps around midnight
  },
};

/**
 * Default initial state for a new game.
 */
export const DEFAULT_CLOCK_STATE: GameClockState = {
  hour: 10, // Start at 10 AM
  minute: 0,
  day: 1,
  isPaused: true,
  totalMinutes: 10 * 60, // 10 hours in minutes
};

// ============================================================================
// GAMECLOCK CLASS
// ============================================================================

/**
 * GameClock manages the passage of time in the game world.
 *
 * Features:
 * - Configurable time scale (default: 1 game hour = 2 real minutes)
 * - Day/night phase detection with callbacks
 * - Pause/resume capability
 * - Serializable state for save/load
 * - Event emission for hourly and phase changes
 *
 * @example
 * ```typescript
 * const clock = new GameClock();
 *
 * clock.on('phaseChanged', ({ phase, previousPhase }) => {
 *   console.log(`Time phase changed from ${previousPhase} to ${phase}`);
 * });
 *
 * clock.start();
 * ```
 */
export class GameClock {
  private config: GameClockConfig;
  private state: GameClockState;
  private tickerId: ReturnType<typeof setInterval> | null = null;
  private lastTickTime: number = 0;
  private listeners: Map<TimeEventType, Set<TimeEventCallback>> = new Map();
  private accumulatedMs: number = 0;

  /**
   * Creates a new GameClock instance.
   *
   * @param config - Optional configuration overrides
   * @param initialState - Optional initial state (for loading saves)
   */
  constructor(
    config: Partial<GameClockConfig> = {},
    initialState: Partial<GameClockState> = {}
  ) {
    this.config = { ...DEFAULT_CLOCK_CONFIG, ...config };
    this.state = { ...DEFAULT_CLOCK_STATE, ...initialState };
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Time Queries
  // --------------------------------------------------------------------------

  /**
   * Gets the current hour (0-23).
   */
  getHour(): number {
    return this.state.hour;
  }

  /**
   * Gets the current minute (0-59).
   */
  getMinute(): number {
    return this.state.minute;
  }

  /**
   * Gets the current day number (starts at 1).
   */
  getDay(): number {
    return this.state.day;
  }

  /**
   * Gets the current time phase based on hour.
   */
  getPhase(): TimePhase {
    return this.calculatePhase(this.state.hour);
  }

  /**
   * Gets the total elapsed game time in minutes.
   */
  getTotalMinutes(): number {
    return this.state.totalMinutes;
  }

  /**
   * Gets the total elapsed game time in hours (fractional).
   */
  getTotalHours(): number {
    return this.state.totalMinutes / 60;
  }

  /**
   * Checks if the clock is currently paused.
   */
  isPaused(): boolean {
    return this.state.isPaused;
  }

  /**
   * Gets a formatted time string (HH:MM).
   */
  getFormattedTime(): string {
    const hour = this.state.hour.toString().padStart(2, '0');
    const minute = this.state.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }

  /**
   * Gets a formatted time string with day (Day X, HH:MM).
   */
  getFormattedDateTime(): string {
    return `Day ${this.state.day}, ${this.getFormattedTime()}`;
  }

  /**
   * Checks if it's currently nighttime (night phase).
   */
  isNight(): boolean {
    return this.getPhase() === 'night';
  }

  /**
   * Checks if it's currently daytime (dawn, day, or dusk phase).
   */
  isDay(): boolean {
    return !this.isNight();
  }

  /**
   * Gets the ambient light level (0-1) based on time of day.
   * Useful for rendering systems.
   */
  getAmbientLight(): number {
    const hour = this.state.hour + this.state.minute / 60;
    const { phaseBoundaries } = this.config;

    // Night: very dark
    if (hour >= phaseBoundaries.night[0] || hour < phaseBoundaries.dawn[0]) {
      return 0.2;
    }
    // Dawn: gradual brightening
    if (hour >= phaseBoundaries.dawn[0] && hour < phaseBoundaries.dawn[1]) {
      const progress = (hour - phaseBoundaries.dawn[0]) / (phaseBoundaries.dawn[1] - phaseBoundaries.dawn[0]);
      return 0.2 + progress * 0.6;
    }
    // Day: full brightness
    if (hour >= phaseBoundaries.day[0] && hour < phaseBoundaries.dusk[0]) {
      return 1.0;
    }
    // Dusk: gradual darkening
    if (hour >= phaseBoundaries.dusk[0] && hour < phaseBoundaries.dusk[1]) {
      const progress = (hour - phaseBoundaries.dusk[0]) / (phaseBoundaries.dusk[1] - phaseBoundaries.dusk[0]);
      return 1.0 - progress * 0.6;
    }
    // Early night
    const progress = (hour - phaseBoundaries.dusk[1]) / (phaseBoundaries.night[0] - phaseBoundaries.dusk[1]);
    return 0.4 - progress * 0.2;
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Time Control
  // --------------------------------------------------------------------------

  /**
   * Starts the game clock.
   * Time will progress according to the configured time scale.
   */
  start(): void {
    if (this.tickerId !== null) return; // Already running

    this.state.isPaused = false;
    this.lastTickTime = Date.now();
    this.accumulatedMs = 0;

    this.tickerId = setInterval(() => {
      this.tick();
    }, this.config.tickInterval);
  }

  /**
   * Pauses the game clock.
   * Time progression stops but state is preserved.
   */
  pause(): void {
    if (this.tickerId === null) return; // Already paused

    clearInterval(this.tickerId);
    this.tickerId = null;
    this.state.isPaused = true;
  }

  /**
   * Resumes the game clock after being paused.
   */
  resume(): void {
    if (!this.state.isPaused) return;
    this.start();
  }

  /**
   * Toggles between paused and running states.
   */
  toggle(): void {
    if (this.state.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /**
   * Advances time by a specified number of game minutes.
   * Useful for sleeping, waiting, or time skips.
   *
   * @param minutes - Number of game minutes to advance
   * @param emitEvents - Whether to emit time events (default: true)
   */
  advanceTime(minutes: number, emitEvents = true): void {
    if (minutes <= 0) return;

    const previousPhase = this.getPhase();
    const previousHour = this.state.hour;
    const previousDay = this.state.day;

    // Update total minutes
    this.state.totalMinutes += minutes;

    // Calculate new time
    let totalMinutes = this.state.hour * 60 + this.state.minute + minutes;
    const daysToAdd = Math.floor(totalMinutes / (24 * 60));
    totalMinutes = totalMinutes % (24 * 60);

    this.state.day += daysToAdd;
    this.state.hour = Math.floor(totalMinutes / 60);
    this.state.minute = totalMinutes % 60;

    if (!emitEvents) return;

    // Emit events
    const newPhase = this.getPhase();
    const eventPayload = this.createEventPayload();

    this.emit('tick', eventPayload);

    if (this.state.hour !== previousHour) {
      this.emit('hourChanged', eventPayload);
    }

    if (newPhase !== previousPhase) {
      this.emit('phaseChanged', { ...eventPayload, previousPhase });
    }

    if (this.state.day !== previousDay) {
      this.emit('dayChanged', eventPayload);
    }
  }

  /**
   * Advances time by a specified number of game hours.
   *
   * @param hours - Number of game hours to advance
   * @param emitEvents - Whether to emit time events (default: true)
   */
  advanceHours(hours: number, emitEvents = true): void {
    this.advanceTime(hours * 60, emitEvents);
  }

  /**
   * Sets the time to a specific hour and minute.
   *
   * @param hour - Hour to set (0-23)
   * @param minute - Minute to set (0-59, default: 0)
   */
  setTime(hour: number, minute = 0): void {
    const previousPhase = this.getPhase();

    this.state.hour = Math.max(0, Math.min(23, Math.floor(hour)));
    this.state.minute = Math.max(0, Math.min(59, Math.floor(minute)));

    const newPhase = this.getPhase();
    if (newPhase !== previousPhase) {
      this.emit('phaseChanged', {
        ...this.createEventPayload(),
        previousPhase,
      });
    }
  }

  /**
   * Advances to the next occurrence of a specific hour.
   * If the hour is in the past today, advances to tomorrow.
   *
   * @param targetHour - The hour to advance to (0-23)
   */
  advanceToHour(targetHour: number): void {
    const currentHour = this.state.hour + this.state.minute / 60;
    let hoursToAdvance: number;

    if (targetHour > currentHour) {
      hoursToAdvance = targetHour - currentHour;
    } else {
      hoursToAdvance = 24 - currentHour + targetHour;
    }

    this.advanceHours(hoursToAdvance);
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Event System
  // --------------------------------------------------------------------------

  /**
   * Registers a callback for a specific time event.
   *
   * @param event - The event type to listen for
   * @param callback - The callback function
   * @returns A cleanup function to remove the listener
   */
  on(event: TimeEventType, callback: TimeEventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  /**
   * Removes a callback for a specific time event.
   *
   * @param event - The event type
   * @param callback - The callback to remove
   */
  off(event: TimeEventType, callback: TimeEventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Removes all listeners for a specific event type, or all listeners if no type specified.
   *
   * @param event - Optional event type to clear
   */
  removeAllListeners(event?: TimeEventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  // --------------------------------------------------------------------------
  // PUBLIC API - Serialization
  // --------------------------------------------------------------------------

  /**
   * Gets the current state for serialization (save game).
   */
  getState(): GameClockState {
    return { ...this.state };
  }

  /**
   * Loads state from a save (deserialization).
   *
   * @param state - The state to load
   */
  loadState(state: Partial<GameClockState>): void {
    this.state = { ...this.state, ...state };
  }

  /**
   * Resets the clock to default state.
   */
  reset(): void {
    this.pause();
    this.state = { ...DEFAULT_CLOCK_STATE };
    this.accumulatedMs = 0;
  }

  /**
   * Cleans up the clock (stop ticker, remove listeners).
   * Call this when disposing of the clock.
   */
  dispose(): void {
    this.pause();
    this.removeAllListeners();
  }

  // --------------------------------------------------------------------------
  // PRIVATE METHODS
  // --------------------------------------------------------------------------

  /**
   * Internal tick handler called by the interval.
   */
  private tick(): void {
    const now = Date.now();
    const deltaMs = now - this.lastTickTime;
    this.lastTickTime = now;

    // Accumulate real time
    this.accumulatedMs += deltaMs;

    // Convert to game minutes
    const gameMinutes = Math.floor(this.accumulatedMs / this.config.msPerGameMinute);

    if (gameMinutes > 0) {
      this.accumulatedMs -= gameMinutes * this.config.msPerGameMinute;
      this.advanceTime(gameMinutes);
    } else {
      // Still emit tick for UI updates
      this.emit('tick', this.createEventPayload());
    }
  }

  /**
   * Calculates the time phase for a given hour.
   */
  private calculatePhase(hour: number): TimePhase {
    const { phaseBoundaries } = this.config;

    // Night wraps around midnight
    if (hour >= phaseBoundaries.night[0] || hour < phaseBoundaries.night[1]) {
      return 'night';
    }
    if (hour >= phaseBoundaries.dawn[0] && hour < phaseBoundaries.dawn[1]) {
      return 'dawn';
    }
    if (hour >= phaseBoundaries.day[0] && hour < phaseBoundaries.day[1]) {
      return 'day';
    }
    if (hour >= phaseBoundaries.dusk[0] && hour < phaseBoundaries.dusk[1]) {
      return 'dusk';
    }

    // Fallback (shouldn't happen with default config)
    return 'day';
  }

  /**
   * Creates an event payload from current state.
   */
  private createEventPayload(): TimeEventPayload {
    return {
      hour: this.state.hour,
      minute: this.state.minute,
      day: this.state.day,
      phase: this.getPhase(),
    };
  }

  /**
   * Emits an event to all registered listeners.
   */
  private emit(event: TimeEventType, payload: TimeEventPayload): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in time event listener (${event}):`, error);
        }
      });
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a new GameClock instance with default settings.
 *
 * @param initialState - Optional initial state
 * @returns A new GameClock instance
 */
export function createGameClock(
  initialState?: Partial<GameClockState>
): GameClock {
  return new GameClock(undefined, initialState);
}

/**
 * Converts real milliseconds to game minutes based on default config.
 *
 * @param realMs - Real time in milliseconds
 * @returns Game time in minutes
 */
export function realMsToGameMinutes(realMs: number): number {
  return realMs / DEFAULT_CLOCK_CONFIG.msPerGameMinute;
}

/**
 * Converts game minutes to real milliseconds based on default config.
 *
 * @param gameMinutes - Game time in minutes
 * @returns Real time in milliseconds
 */
export function gameMinutesToRealMs(gameMinutes: number): number {
  return gameMinutes * DEFAULT_CLOCK_CONFIG.msPerGameMinute;
}

/**
 * Calculates the game hours elapsed in a given real-time duration.
 *
 * @param realMs - Real time in milliseconds
 * @returns Game time in hours
 */
export function realMsToGameHours(realMs: number): number {
  return realMsToGameMinutes(realMs) / 60;
}
