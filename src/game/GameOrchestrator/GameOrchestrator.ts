import { gameStore } from '../store/webGameStore';
import { initQuestSystem, type QuestSystemHandle } from '../systems/QuestWiring';
import { getSaveSystem } from '../systems/SaveSystem';
import { tickSurvival } from './survivalTick';
import { wireQuestNotifications } from './questNotifications';
import {
  AUTOSAVE_INTERVAL_MS,
  LOW_HEALTH_THRESHOLD,
  MORNING_HOUR,
  SURVIVAL_TICK_INTERVAL_MS,
  TICK_INTERVAL_MS,
  TUTORIAL_QUEST_ID,
  type InitGameOptions,
} from './types';

class GameOrchestrator {
  private questHandle: QuestSystemHandle | null = null;
  private questNotifyTeardown: (() => void) | null = null;
  private autosaveTimer: ReturnType<typeof setInterval> | null = null;
  private gameLoopTimer: ReturnType<typeof setInterval> | null = null;
  private lastTickTime = 0;
  private lastLowHealthWarning = 0;
  private lastSurvivalTick = 0;
  private lastClockTotalMinutes = 0;
  private gameMinutesSinceAutoSave = 0;
  private systemsStarted = false;

  async initGame(options: InitGameOptions = {}): Promise<void> {
    const {
      playerName = 'Stranger',
      seed,
      difficulty = 'normal',
    } = options;

    const store = gameStore;
    const state = store.getState();

    this.teardown();

    const numericSeed = seed ? this.hashSeed(seed) : undefined;

    await state.initGame(playerName, numericSeed);

    const postInitState = store.getState();

    postInitState.setTime(MORNING_HOUR, 0);

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
      postInitState.addProvisions(10, 10);
    }

    postInitState.setFatigue(0);

    try {
      postInitState.startQuest(TUTORIAL_QUEST_ID);
    } catch (error) {
      console.error('[GameOrchestrator] Tutorial quest not found:', TUTORIAL_QUEST_ID, error);
    }

    postInitState.setPhase('playing');

    console.log(
      `[GameOrchestrator] New game initialized — player: "${playerName}", ` +
      `location: ${store.getState().currentLocationId}, seed: ${store.getState().worldSeed}`
    );
  }

  async continueGame(): Promise<boolean> {
    this.teardown();

    const saveSystem = getSaveSystem();
    const mostRecent = await saveSystem.getMostRecentSlot();
    if (!mostRecent) {
      console.warn('[GameOrchestrator] No saved game found');
      return false;
    }

    const state = gameStore.getState();
    const loaded = await state.loadFromSlot(mostRecent.slotId);
    if (!loaded) {
      console.warn('[GameOrchestrator] Failed to load save slot:', mostRecent.slotId);
      return false;
    }

    const freshState = gameStore.getState();
    this.lastClockTotalMinutes = freshState.clockState.totalMinutes;
    freshState.startClock();

    console.log(
      `[GameOrchestrator] Game resumed — player: "${freshState.playerName}", ` +
      `location: ${freshState.currentLocationId}`
    );

    return true;
  }

  startSystems(): void {
    if (this.systemsStarted) {
      console.warn('[GameOrchestrator] Systems already started');
      return;
    }
    this.systemsStarted = true;

    const store = gameStore;

    this.questHandle = initQuestSystem(store);
    this.questNotifyTeardown = wireQuestNotifications(store);

    this.lastTickTime = performance.now();
    this.gameLoopTimer = setInterval(() => {
      const now = performance.now();
      const dt = (now - this.lastTickTime) / 1000;
      this.lastTickTime = now;
      this.tickGameLoop(dt);
    }, TICK_INTERVAL_MS);

    this.autosaveTimer = setInterval(() => {
      this.performAutosave();
    }, AUTOSAVE_INTERVAL_MS);

    const state = store.getState();
    this.lastClockTotalMinutes = state.clockState.totalMinutes;
    if (!state.isClockRunning && state.phase === 'playing') {
      state.startClock();
    }

    console.log('[GameOrchestrator] All systems started');
  }

  private tickGameLoop(dt: number): void {
    const store = gameStore;
    const state = store.getState();

    if (state.phase !== 'playing') return;

    const prevTotalMinutes = state.clockState.totalMinutes;

    state.tickClock();

    const postState = store.getState();
    const elapsedGameMinutes = postState.clockState.totalMinutes - prevTotalMinutes;

    if (dt > 0) {
      store.setState({ playTime: postState.playTime + dt * 1000 } as any);
    }

    const now = performance.now();
    if (now - this.lastSurvivalTick >= SURVIVAL_TICK_INTERVAL_MS && elapsedGameMinutes > 0) {
      this.lastSurvivalTick = now;
      tickSurvival(store, elapsedGameMinutes);
    }

    if (elapsedGameMinutes > 0) {
      this.gameMinutesSinceAutoSave += elapsedGameMinutes;
      if (this.gameMinutesSinceAutoSave >= 5) {
        this.gameMinutesSinceAutoSave = 0;
        this.performAutosave();
      }
    }

    if (now - this.lastLowHealthWarning > 30_000) {
      const freshState = store.getState();
      const { health, maxHealth } = freshState.playerStats;
      if (health > 0 && health / maxHealth <= LOW_HEALTH_THRESHOLD) {
        state.addNotification('warning', 'Health is critically low! Find medical supplies.');
        this.lastLowHealthWarning = now;
      }
    }
  }

  private async performAutosave(): Promise<void> {
    const state = gameStore.getState();

    if (!state.initialized || state.phase === 'title') return;

    try {
      await state.saveToSlot('autosave');
      console.log('[GameOrchestrator] Autosaved');
    } catch (error) {
      console.error('[GameOrchestrator] Autosave failed:', error);
    }
  }

  teardown(): void {
    if (this.questHandle) {
      this.questHandle.teardown();
      this.questHandle = null;
    }

    if (this.questNotifyTeardown) {
      this.questNotifyTeardown();
      this.questNotifyTeardown = null;
    }

    if (this.gameLoopTimer) {
      clearInterval(this.gameLoopTimer);
      this.gameLoopTimer = null;
    }

    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }

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

  private hashSeed(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash);
  }

  async hasSavedGame(): Promise<boolean> {
    const saveSystem = getSaveSystem();
    const mostRecent = await saveSystem.getMostRecentSlot();
    return mostRecent != null;
  }
}

export const gameOrchestrator = new GameOrchestrator();
