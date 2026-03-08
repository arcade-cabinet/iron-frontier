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
import { gameAudioBridge } from './services/audio/GameAudioBridge';
import { autosave, loadAutosave } from './store/saveManager';

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
  private autosaveTimer: ReturnType<typeof setInterval> | null = null;
  private gameLoopTimer: ReturnType<typeof setInterval> | null = null;
  private lastTickTime = 0;
  private lastLowHealthWarning = 0;
  private lastSurvivalTick = 0;
  private lastClockTotalMinutes = 0;
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
    } catch {
      // Quest might not exist yet - that's OK
      console.warn('[GameOrchestrator] Tutorial quest not found:', TUTORIAL_QUEST_ID);
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

    const savedState = await loadAutosave();
    if (!savedState) {
      console.warn('[GameOrchestrator] No saved game found');
      return false;
    }

    // The Zustand persist middleware handles rehydration automatically.
    // If there is saved state, the store should already have it from the
    // persist middleware on creation. We just need to verify it's valid.
    const state = gameStore.getState();

    if (!state.initialized) {
      console.warn('[GameOrchestrator] Saved state is not initialized');
      return false;
    }

    // Re-initialize the world data (runtime-only, not persisted)
    if (state.currentWorldId) {
      state.initWorld(state.currentWorldId);
    }

    // Restart survival systems
    state.startClock();

    // Set phase to playing
    state.setPhase('playing');

    console.log(
      `[GameOrchestrator] Game resumed — player: "${state.playerName}", ` +
      `location: ${state.currentLocationId}`
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

    // Wire audio bridge
    try {
      gameAudioBridge.init({ store: store as any });
    } catch (error) {
      // Audio init can fail if Tone.js context isn't ready yet.
      // That's fine - it will be initialized on first user interaction.
      console.warn('[GameOrchestrator] Audio bridge init deferred:', error);
    }

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
   * - Idle fatigue accumulation (2/game-hour base, +5/hour at night)
   * - Passive provision consumption (at 25% of travel rate)
   * - Dehydration health damage (5 HP/game-hour when water is depleted)
   * - Fatigue speed warnings at thresholds
   */
  private tickSurvival(elapsedGameMinutes: number): void {
    const state = gameStore.getState();
    const elapsedHours = elapsedGameMinutes / 60;

    if (elapsedHours <= 0) return;

    // --- Idle fatigue (2 fatigue per game hour, +5 at night) ---
    // The fatigue system's applyIdleFatigue is not exposed on the slice,
    // so we use setFatigue to manually apply the idle rate.
    const isNight = state.isNight();
    const idleFatigueRate = 2; // per game hour
    const nightPenaltyRate = isNight ? 5 : 0;
    const fatigueGain = (idleFatigueRate + nightPenaltyRate) * elapsedHours;

    if (fatigueGain > 0) {
      const currentFatigue = state.fatigueState.current;
      const newFatigue = Math.min(100, currentFatigue + fatigueGain);
      if (newFatigue !== currentFatigue) {
        state.setFatigue(newFatigue);
      }

      // Warn at threshold crossings
      if (currentFatigue < 75 && newFatigue >= 75) {
        state.addNotification('warning', 'You are exhausted. Movement speed is severely reduced. Rest soon!');
      } else if (currentFatigue < 50 && newFatigue >= 50) {
        state.addNotification('warning', 'Weariness slows your movements. You should rest.');
      }
    }

    // --- Passive provision consumption (at reduced idle rate) ---
    // Use consumeProvisions with a fraction of the elapsed time to
    // simulate background food/water needs (25% of travel consumption rate)
    const idleConsumptionHours = elapsedHours * IDLE_PROVISION_RATE;
    if (idleConsumptionHours > 0) {
      const consumption = state.consumeProvisions(idleConsumptionHours);

      if (consumption.ranOutOfFood) {
        state.addNotification('warning', 'You have run out of food! Fatigue will increase rapidly.');
      }
      if (consumption.ranOutOfWater) {
        state.addNotification('warning', 'You have run out of water! Health will drain over time.');
      }
    }

    // --- Dehydration damage (5 HP per game hour without water) ---
    const freshState = gameStore.getState();
    if (freshState.provisionsState.water <= 0) {
      const dehydrationDamage = Math.floor(5 * elapsedHours);
      if (dehydrationDamage > 0 && freshState.playerStats.health > 0) {
        state.takeDamage(dehydrationDamage);
      }
    }

    // --- Fatigue collapse check ---
    const finalState = gameStore.getState();
    if (finalState.phase === 'game_over') return; // Player died from dehydration; skip further checks
    if (finalState.fatigueState.current >= 100 && finalState.playerStats.health > 0) {
      // Collapsed from exhaustion — force rest notification
      state.addNotification('warning', 'You collapse from exhaustion and cannot continue!');
    }
  }

  // --------------------------------------------------------------------------
  // AUTOSAVE
  // --------------------------------------------------------------------------

  /**
   * Perform an autosave of the current game state.
   */
  private async performAutosave(): Promise<void> {
    const state = gameStore.getState();

    // Only autosave during active gameplay with an initialized game
    if (!state.initialized || state.phase === 'title') return;

    try {
      // Mark the save timestamp via the store's saveGame action
      state.saveGame();

      // Re-read state after saveGame updated lastSaved
      const freshState = gameStore.getState();

      // Extract serializable state for autosave
      const saveData = {
        initialized: freshState.initialized,
        worldSeed: freshState.worldSeed,
        playerName: freshState.playerName,
        playerAppearance: freshState.playerAppearance,
        playerPosition: freshState.playerPosition,
        playerStats: freshState.playerStats,
        equipment: freshState.equipment,
        inventory: freshState.inventory,
        activeQuests: freshState.activeQuests,
        completedQuests: freshState.completedQuests,
        completedQuestIds: freshState.completedQuestIds,
        collectedItemIds: freshState.collectedItemIds,
        talkedNPCIds: freshState.talkedNPCIds,
        settings: freshState.settings,
        time: freshState.time,
        saveVersion: freshState.saveVersion,
        lastSaved: freshState.lastSaved,
        playTime: freshState.playTime,
        currentWorldId: freshState.currentWorldId,
        currentLocationId: freshState.currentLocationId,
        discoveredLocationIds: freshState.discoveredLocationIds,
        // Survival state
        clockState: freshState.clockState,
        fatigueState: freshState.fatigueState,
        provisionsState: freshState.provisionsState,
      };

      await autosave(saveData);
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

    // Tear down audio bridge
    try {
      gameAudioBridge.teardown();
    } catch {
      // Ignore errors during audio teardown
    }

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
    } catch {
      // Ignore if store is not available
    }

    this.systemsStarted = false;
    this.lastTickTime = 0;
    this.lastLowHealthWarning = 0;
    this.lastSurvivalTick = 0;
    this.lastClockTotalMinutes = 0;

    console.log('[GameOrchestrator] Torn down');
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
    const saved = await loadAutosave();
    return saved != null && saved.initialized === true;
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

/** Singleton game orchestrator for app-wide use. */
export const gameOrchestrator = new GameOrchestrator();
