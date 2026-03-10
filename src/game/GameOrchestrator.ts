/**
 * GameOrchestrator - Central game lifecycle manager for Iron Frontier
 *
 * Connects all subsystems into a playable game:
 * - Initializes game state (player, inventory, quests, survival)
 * - Starts event systems (quest wiring, audio bridge)
 * - Runs the game loop (time, survival, auto-save)
 * - Provides clean teardown for unmounting
 *
 * Usage:
 *   import { gameOrchestrator } from '@/src/game/GameOrchestrator';
 *
 *   // Title screen: start new game
 *   await gameOrchestrator.initGame({ playerName: 'Stranger' });
 *   router.push('/game');
 *
 *   // Game page mount
 *   gameOrchestrator.startSystems();
 *
 *   // Game page unmount
 *   gameOrchestrator.teardown();
 *
 * @module game/GameOrchestrator
 */

import { gameStore } from './store/webGameStore';
import { initQuestSystem, type QuestSystemHandle } from './systems/QuestWiring';
import { questEvents, type QuestEventMap } from './systems/QuestEvents';
import { getSaveSystem } from './systems/SaveSystem';
import { QuestNotification } from '@/components/game/QuestNotification';

// ============================================================================
// TYPES
// ============================================================================

export interface InitGameOptions {
  /** Player display name. Defaults to 'Stranger'. */
  playerName?: string;
  /** World generation seed. Defaults to Date.now(). */
  seed?: string;
  /** Difficulty preset (reserved for future use). */
  difficulty?: 'easy' | 'normal' | 'hard';
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Starting location ID — Dusty Springs is the tutorial town. */
const STARTING_LOCATION = 'dusty_springs';

/** Starting world ID */
const STARTING_WORLD = 'frontier_territory';

/** Autosave interval in milliseconds (5 minutes). */
const AUTOSAVE_INTERVAL_MS = 5 * 60 * 1000;

/** Game loop tick interval in milliseconds (~10 Hz for survival ticks). */
const TICK_INTERVAL_MS = 100;

/** Low health warning threshold (percentage). */
const LOW_HEALTH_THRESHOLD = 0.25;

/** Idle provision consumption rate relative to travel rate (exploring, not traveling). */
const IDLE_PROVISION_RATE = 0.25;

/** How often (in real ms) to apply survival effects. */
const SURVIVAL_TICK_INTERVAL_MS = 1000;

/** Starting quest ID — the main story quest. */
const TUTORIAL_QUEST_ID = 'main_the_inheritance';

/** Morning hour for new game start. */
const MORNING_HOUR = 8;

// ============================================================================
// ORCHESTRATOR
// ============================================================================

class GameOrchestrator {
  private questHandle: QuestSystemHandle | null = null;
  private questNotifyTeardown: (() => void) | null = null;
  private autosaveTimer: ReturnType<typeof setInterval> | null = null;
  private gameLoopTimer: ReturnType<typeof setInterval> | null = null;
  private lastTickTime = 0;
  private lastLowHealthWarning = 0;
  private lastSurvivalTick = 0;
  private lastClockTotalMinutes = 0;
  /** Accumulated game-minutes since last auto-save for 5-game-minute trigger */
  private gameMinutesSinceAutoSave = 0;
  private systemsStarted = false;

  // --------------------------------------------------------------------------
  // INIT GAME
  // --------------------------------------------------------------------------

  /**
   * Initialize a new game.
   *
   * Sets up the store with default state, starting location, equipment,
   * survival stats, and the tutorial quest.
   */
  async initGame(options: InitGameOptions = {}): Promise<void> {
    const {
      playerName = 'Stranger',
      seed,
      difficulty = 'normal',
    } = options;

    const store = gameStore;
    const state = store.getState();

    // If systems were running from a previous game, tear them down first
    this.teardown();

    // Derive numeric seed from string or use timestamp
    const numericSeed = seed ? this.hashSeed(seed) : undefined;

    // Use the store's built-in initGame which handles:
    // - Procedural generation initialization
    // - Starter inventory from data layer
    // - World initialization
    // - Survival system reset
    // - Clock start
    await state.initGame(playerName, numericSeed);

    // Now apply our additional orchestrator-level setup
    const postInitState = store.getState();

    // Set time to morning
    postInitState.setTime(MORNING_HOUR, 0);

    // Apply difficulty modifiers
    if (difficulty === 'easy') {
      postInitState.updatePlayerStats({
        maxHealth: 150,
        health: 150,
        gold: 100,
      });
      postInitState.addProvisions(20, 20);
    } else if (difficulty === 'hard') {
      postInitState.updatePlayerStats({
        maxHealth: 75,
        health: 75,
        gold: 25,
      });
    } else {
      // Normal: ensure provisions are stocked
      postInitState.addProvisions(10, 10);
    }

    // Set initial survival state: low fatigue, good provisions
    postInitState.setFatigue(0);

    // Start the tutorial quest if available
    try {
      postInitState.startQuest(TUTORIAL_QUEST_ID);
    } catch (error) {
      console.error('[GameOrchestrator] Tutorial quest not found:', TUTORIAL_QUEST_ID, error);
    }

    // Set game phase to playing (initGame already does this, but be explicit)
    postInitState.setPhase('playing');

    console.log(
      `[GameOrchestrator] New game initialized — player: "${playerName}", ` +
      `location: ${STARTING_LOCATION}, seed: ${store.getState().worldSeed}`
    );
  }

  // --------------------------------------------------------------------------
  // CONTINUE GAME
  // --------------------------------------------------------------------------

  /**
   * Load the most recent save and resume the game.
   *
   * Returns true if a save was loaded, false if no save exists.
   */
  async continueGame(): Promise<boolean> {
    // If systems were running from a previous game, tear them down first
    this.teardown();

    // Find the most recent save slot via SaveSystem
    const saveSystem = getSaveSystem();
    const mostRecent = await saveSystem.getMostRecentSlot();
    if (!mostRecent) {
      console.warn('[GameOrchestrator] No saved game found');
      return false;
    }

    // Load via the store's loadFromSlot (handles hydration + world init)
    const state = gameStore.getState();
    const loaded = await state.loadFromSlot(mostRecent.slotId);
    if (!loaded) {
      console.warn('[GameOrchestrator] Failed to load save slot:', mostRecent.slotId);
      return false;
    }

    // Restart survival systems
    const freshState = gameStore.getState();
    // Sync clock baseline to prevent first-tick elapsed-time spike
    this.lastClockTotalMinutes = freshState.clockState.totalMinutes;
    freshState.startClock();

    console.log(
      `[GameOrchestrator] Game resumed — player: "${freshState.playerName}", ` +
      `location: ${freshState.currentLocationId}`
    );

    return true;
  }

  // --------------------------------------------------------------------------
  // START SYSTEMS
  // --------------------------------------------------------------------------

  /**
   * Start all game subsystems. Call this when the game page mounts.
   *
   * Wires up:
   * - Quest event system (objective progress tracking)
   * - Audio bridge (game events -> sound effects)
   * - Game loop (time, survival, auto-save)
   */
  startSystems(): void {
    if (this.systemsStarted) {
      console.warn('[GameOrchestrator] Systems already started');
      return;
    }
    this.systemsStarted = true;

    const store = gameStore;

    // Wire quest event system
    this.questHandle = initQuestSystem(store);

    // Wire quest events to QuestNotification toast UI
    this.questNotifyTeardown = this.wireQuestNotifications();

    // Audio bridge initialization is handled by AudioProvider (mounted in the
    // game page). It waits for a user gesture to call Tone.start() and then
    // inits the bridge with the MusicManager. We do NOT init it here to avoid
    // double-initialization. The AudioProvider's teardown handles cleanup.

    // Start the game loop
    this.lastTickTime = performance.now();
    this.gameLoopTimer = setInterval(() => {
      const now = performance.now();
      const dt = (now - this.lastTickTime) / 1000; // Convert to seconds
      this.lastTickTime = now;
      this.tickGameLoop(dt);
    }, TICK_INTERVAL_MS);

    // Start autosave timer
    this.autosaveTimer = setInterval(() => {
      this.performAutosave();
    }, AUTOSAVE_INTERVAL_MS);

    // Resume the clock
    const state = store.getState();
    // Sync lastClockTotalMinutes BEFORE starting the clock to prevent
    // a huge elapsed-time spike on the first tick (e.g., clock at 8:00 AM
    // = 480 totalMinutes, but lastClockTotalMinutes was 0 → 480 min spike).
    this.lastClockTotalMinutes = state.clockState.totalMinutes;
    if (!state.isClockRunning && state.phase === 'playing') {
      state.startClock();
    }

    console.log('[GameOrchestrator] All systems started');
  }

  // --------------------------------------------------------------------------
  // GAME LOOP TICK
  // --------------------------------------------------------------------------

  /**
   * Main game loop tick. Called at ~10 Hz.
   *
   * Handles:
   * - Time-of-day advancement (via the survival clock)
   * - Survival ticks (idle fatigue, provision consumption, dehydration damage)
   * - Low-health warnings
   * - Play time tracking
   */
  private tickGameLoop(dt: number): void {
    const store = gameStore;
    const state = store.getState();

    // Only tick during active gameplay
    if (state.phase !== 'playing') return;

    // Snapshot clock before tick to compute elapsed game time
    const prevTotalMinutes = state.clockState.totalMinutes;

    // Tick the game clock (advances game time based on real time)
    state.tickClock();

    // Compute how many game-minutes elapsed this tick
    const postState = store.getState();
    const elapsedGameMinutes = postState.clockState.totalMinutes - prevTotalMinutes;


    // Track real play time (in ms) — dt is already in seconds
    if (dt > 0) {
      store.setState({ playTime: postState.playTime + dt * 1000 } as any);
    }

    // --- Survival tick (throttled to ~1 Hz for efficiency) ---
    const now = performance.now();
    if (now - this.lastSurvivalTick >= SURVIVAL_TICK_INTERVAL_MS && elapsedGameMinutes > 0) {
      this.lastSurvivalTick = now;
      this.tickSurvival(elapsedGameMinutes);
    }

    // --- Auto-save every 5 game-minutes ---
    if (elapsedGameMinutes > 0) {
      this.gameMinutesSinceAutoSave += elapsedGameMinutes;
      if (this.gameMinutesSinceAutoSave >= 5) {
        this.gameMinutesSinceAutoSave = 0;
        this.performAutosave();
      }
    }

    // Check for low-health warnings (throttled to once per 30 seconds)
    if (now - this.lastLowHealthWarning > 30_000) {
      const freshState = store.getState();
      const { health, maxHealth } = freshState.playerStats;
      if (health > 0 && health / maxHealth <= LOW_HEALTH_THRESHOLD) {
        state.addNotification('warning', 'Health is critically low! Find medical supplies.');
        this.lastLowHealthWarning = now;
      }
    }
  }

  // --------------------------------------------------------------------------
  // SURVIVAL TICK
  // --------------------------------------------------------------------------

  /**
   * Apply passive survival effects proportional to elapsed game time.
   *
   * Called ~1 Hz during active gameplay. Handles:
   * - Idle fatigue accumulation (0.5/real-min base, +1.5/real-min at night)
   * - Passive provision consumption (at 25% of travel rate)
   * - Dehydration health damage (5 HP/game-hour when water is depleted)
   * - Graduated HUD warnings for fatigue, food, and water
   */
  private tickSurvival(elapsedGameMinutes: number): void {
    const state = gameStore.getState();
    const elapsedHours = elapsedGameMinutes / 60;

    if (elapsedHours <= 0) return;

    // Convert game time to real minutes for fatigue (msPerGameMinute = 4000)
    // 1 game minute = 4 real seconds = 4/60 real minutes
    const realMinutesElapsed = (elapsedGameMinutes * 4000) / 60_000;

    // --- Idle fatigue (0.5 per real minute, +1.5 at night) ---
    const isNight = state.isNight();
    const idleFatigueRate = 0.5;  // per real minute
    const nightPenaltyRate = isNight ? 1.5 : 0;
    const fatigueGain = (idleFatigueRate + nightPenaltyRate) * realMinutesElapsed;

    if (fatigueGain > 0) {
      const currentFatigue = state.fatigueState.current;
      const newFatigue = Math.min(100, currentFatigue + fatigueGain);
      if (newFatigue !== currentFatigue) {
        state.setFatigue(newFatigue);
      }

      // Graduated fatigue warnings at threshold crossings
      if (currentFatigue < 90 && newFatigue >= 90) {
        state.addNotification('warning', "You're exhausted! Find shelter to rest.");
      } else if (currentFatigue < 75 && newFatigue >= 75) {
        state.addNotification('warning', "You're getting tired...");
      } else if (currentFatigue < 50 && newFatigue >= 50) {
        state.addNotification('warning', 'Weariness slows your movements. You should rest.');
      }
    }

    // --- Passive provision consumption (at reduced idle rate) ---
    const idleConsumptionHours = elapsedHours * IDLE_PROVISION_RATE;
    if (idleConsumptionHours > 0) {
      // Snapshot provision levels BEFORE consuming
      const foodBefore = state.provisionsState.food;
      const waterBefore = state.provisionsState.water;
      const maxFood = 100; // matches DEFAULT_PROVISIONS_CONFIG.maxFood
      const maxWater = 100;

      const consumption = state.consumeProvisions(idleConsumptionHours);

      // Re-read after consumption
      const afterState = gameStore.getState();
      const foodAfter = afterState.provisionsState.food;
      const waterAfter = afterState.provisionsState.water;

      // --- Food warnings (graduated at 50%, 25%, and 0%) ---
      if (consumption.ranOutOfFood) {
        state.addNotification('warning', "You're starving! Find food immediately.");
      } else if (foodBefore / maxFood > 0.50 && foodAfter / maxFood <= 0.50) {
        state.addNotification('warning', 'Food supplies are getting low.');
      } else if (foodBefore / maxFood > 0.25 && foodAfter / maxFood <= 0.25) {
        state.addNotification('warning', 'Food is critically low. Resupply soon!');
      } else if (foodBefore / maxFood > 0.10 && foodAfter / maxFood <= 0.10) {
        state.addNotification('warning', 'Almost out of food! Hunt or forage now.');
      }

      // --- Water warnings (graduated at 50%, 25%, and 0%) ---
      if (consumption.ranOutOfWater) {
        state.addNotification('warning', "You're dehydrated! Find water immediately.");
      } else if (waterBefore / maxWater > 0.50 && waterAfter / maxWater <= 0.50) {
        state.addNotification('warning', 'Water is getting low.');
      } else if (waterBefore / maxWater > 0.25 && waterAfter / maxWater <= 0.25) {
        state.addNotification('warning', 'Water is critically low. Find a source soon!');
      } else if (waterBefore / maxWater > 0.10 && waterAfter / maxWater <= 0.10) {
        state.addNotification('warning', 'Almost out of water! Find a source now.');
      }
    }

    // --- Starvation damage (3 HP per game hour without food) ---
    const freshState = gameStore.getState();
    if (freshState.provisionsState.food <= 0) {
      const starvationDamage = Math.floor(3 * elapsedHours);
      if (starvationDamage > 0 && freshState.playerStats.health > 0) {
        state.takeDamage(starvationDamage);
      }
    }

    // --- Dehydration damage (5 HP per game hour without water) ---
    const freshState2 = gameStore.getState();
    if (freshState2.provisionsState.water <= 0) {
      const dehydrationDamage = Math.floor(5 * elapsedHours);
      if (dehydrationDamage > 0 && freshState2.playerStats.health > 0) {
        state.takeDamage(dehydrationDamage);
      }
    }

    // --- Fatigue collapse check ---
    const finalState = gameStore.getState();
    if (finalState.phase === 'game_over') return;
    if (finalState.fatigueState.current >= 100 && finalState.playerStats.health > 0) {
      state.addNotification('warning', 'You collapse from exhaustion and cannot continue!');
    }
  }

  // --------------------------------------------------------------------------
  // AUTOSAVE
  // --------------------------------------------------------------------------

  /**
   * Perform an autosave of the current game state via SaveSystem.
   */
  private async performAutosave(): Promise<void> {
    const state = gameStore.getState();

    // Only autosave during active gameplay with an initialized game
    if (!state.initialized || state.phase === 'title') return;

    try {
      await state.saveToSlot('autosave');
      console.log('[GameOrchestrator] Autosaved');
    } catch (error) {
      console.error('[GameOrchestrator] Autosave failed:', error);
    }
  }

  // --------------------------------------------------------------------------
  // TEARDOWN
  // --------------------------------------------------------------------------

  /**
   * Clean up all systems and subscriptions.
   * Call this when the game page unmounts.
   */
  teardown(): void {
    // Tear down quest event wiring
    if (this.questHandle) {
      this.questHandle.teardown();
      this.questHandle = null;
    }

    // Tear down quest notification bridge
    if (this.questNotifyTeardown) {
      this.questNotifyTeardown();
      this.questNotifyTeardown = null;
    }

    // Audio bridge teardown is handled by AudioProvider (which owns the
    // Tone.js context and MusicManager lifecycle).

    // Stop game loop
    if (this.gameLoopTimer) {
      clearInterval(this.gameLoopTimer);
      this.gameLoopTimer = null;
    }

    // Stop autosave timer
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }

    // Pause the clock
    try {
      const state = gameStore.getState();
      if (state.isClockRunning) {
        state.pauseClock();
      }
    } catch (error) {
      console.error('[GameOrchestrator] Failed to pause clock during teardown:', error);
    }

    this.systemsStarted = false;
    this.lastTickTime = 0;
    this.lastLowHealthWarning = 0;
    this.lastSurvivalTick = 0;
    this.lastClockTotalMinutes = 0;
    this.gameMinutesSinceAutoSave = 0;

    console.log('[GameOrchestrator] Torn down');
  }

  // --------------------------------------------------------------------------
  // QUEST NOTIFICATION BRIDGE
  // --------------------------------------------------------------------------

  /**
   * Subscribe to quest events and forward them to the QuestNotification toast UI.
   * Returns a teardown function that removes all listeners.
   */
  private wireQuestNotifications(): () => void {
    const onQuestStarted = (d: QuestEventMap['questStarted']) => {
      const def = gameStore.getState().getQuestDefinition(d.questId);
      QuestNotification.show(
        'quest_started',
        def?.title ?? d.questId,
        def?.description,
      );
    };

    const onQuestCompleted = (d: QuestEventMap['questCompleted']) => {
      const def = gameStore.getState().getQuestDefinition(d.questId);
      QuestNotification.show(
        'quest_completed',
        def?.title ?? d.questId,
      );
    };

    const onStageAdvanced = (d: QuestEventMap['stageAdvanced']) => {
      const def = gameStore.getState().getQuestDefinition(d.questId);
      const stage = def?.stages[d.stageIndex];
      QuestNotification.show(
        'quest_updated',
        def?.title ?? d.questId,
        stage?.title,
      );
    };

    questEvents.on('questStarted', onQuestStarted);
    questEvents.on('questCompleted', onQuestCompleted);
    questEvents.on('stageAdvanced', onStageAdvanced);

    return () => {
      questEvents.off('questStarted', onQuestStarted);
      questEvents.off('questCompleted', onQuestCompleted);
      questEvents.off('stageAdvanced', onStageAdvanced);
    };
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  /**
   * Hash a string seed into a numeric seed.
   */
  private hashSeed(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash);
  }

  /**
   * Check whether a saved game exists.
   */
  async hasSavedGame(): Promise<boolean> {
    const saveSystem = getSaveSystem();
    const mostRecent = await saveSystem.getMostRecentSlot();
    return mostRecent != null;
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

/** Singleton game orchestrator for app-wide use. */
export const gameOrchestrator = new GameOrchestrator();
