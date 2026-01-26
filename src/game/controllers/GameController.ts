/**
 * GameController.ts - Top-level game coordination for Iron Frontier v2
 *
 * Orchestrates all game systems:
 * - Scene transitions (overworld <-> town <-> combat)
 * - Input routing based on game mode
 * - Event coordination between systems
 * - Save/load triggers
 */

// @ts-expect-error - GameMode and GameSaveData need to be imported from store
import type { WorldPosition } from '@/store/types';
import type { InputContext } from '../input/InputManager';
import type { EncounterTrigger } from '../systems/EncounterSystem';
import type { TimePhase } from '../systems/time';
import type { CombatEvent, CombatRewards } from './CombatController';

/**
 * Game event types
 */
export type GameEvent =
  | { type: 'mode_change'; from: any; to: any } // GameMode
  | { type: 'position_change'; position: WorldPosition }
  | { type: 'town_enter'; townId: string }
  | { type: 'town_exit' }
  | { type: 'building_enter'; townId: string; buildingId: string }
  | { type: 'building_exit' }
  | { type: 'combat_triggered'; trigger: EncounterTrigger }
  | { type: 'combat_ended'; outcome: 'victory' | 'defeat' | 'fled'; rewards?: CombatRewards }
  | { type: 'time_change'; phase: TimePhase; hour: number }
  | { type: 'day_change'; day: number }
  | { type: 'save_complete'; slotId: string }
  | { type: 'load_complete' }
  | { type: 'game_start' }
  | { type: 'game_end' };

/**
 * Game controller configuration
 */
export interface GameControllerConfig {
  /** Auto-save interval in seconds (0 to disable) */
  autoSaveInterval: number;
  /** Enable encounter system */
  enableEncounters: boolean;
  /** Enable survival systems */
  enableSurvival: boolean;
}

const DEFAULT_CONFIG: GameControllerConfig = {
  autoSaveInterval: 300, // 5 minutes
  enableEncounters: true,
  enableSurvival: true,
};

type GameEventListener = (event: GameEvent) => void;

/**
 * Mode to input context mapping
 */
const MODE_TO_INPUT_CONTEXT: Record<GameMode, InputContext> = {
  title: 'menu',
  overworld: 'overworld',
  town: 'town',
  combat: 'combat',
  camp: 'menu',
  dialogue: 'dialogue',
  menu: 'menu',
};

/**
 * High-level game controller
 */
export class GameController {
  private config: GameControllerConfig;
  private currentMode: GameMode = 'title';
  private eventListeners: Set<GameEventListener> = new Set();
  private isPaused = false;
  private isInitialized = false;

  // Callback hooks for integration with external systems
  private onModeChangeHook: ((mode: GameMode, context: InputContext) => void) | null = null;
  private onPositionChangeHook: ((pos: WorldPosition) => void) | null = null;
  private onEncounterHook: ((trigger: EncounterTrigger) => Promise<boolean>) | null = null;
  private onSaveHook: (() => GameSaveData) | null = null;
  private onLoadHook: ((data: GameSaveData) => void) | null = null;

  constructor(config: Partial<GameControllerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('[GameController] Initialized');
  }

  /**
   * Initialize the game controller
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('[GameController] Ready');
  }

  /**
   * Start a new game
   */
  public async startNewGame(): Promise<void> {
    console.log('[GameController] Starting new game');
    this.emitEvent({ type: 'game_start' });
    await this.setMode('overworld');
  }

  /**
   * Continue from a save
   */
  public async continueGame(saveData: GameSaveData): Promise<void> {
    console.log('[GameController] Continuing game from save');
    if (this.onLoadHook) {
      this.onLoadHook(saveData);
    }
    this.emitEvent({ type: 'load_complete' });
    await this.setMode(saveData.gameMode);
  }

  /**
   * Set the current game mode
   */
  public async setMode(mode: GameMode): Promise<void> {
    if (mode === this.currentMode) return;

    const previousMode = this.currentMode;
    this.currentMode = mode;

    // Get corresponding input context
    const inputContext = MODE_TO_INPUT_CONTEXT[mode];

    // Notify mode change hook
    if (this.onModeChangeHook) {
      this.onModeChangeHook(mode, inputContext);
    }

    this.emitEvent({ type: 'mode_change', from: previousMode, to: mode });
    console.log(`[GameController] Mode: ${previousMode} -> ${mode}`);
  }

  /**
   * Get current game mode
   */
  public getMode(): GameMode {
    return this.currentMode;
  }

  /**
   * Handle player position update
   */
  public updatePosition(position: WorldPosition): void {
    if (this.onPositionChangeHook) {
      this.onPositionChangeHook(position);
    }
    this.emitEvent({ type: 'position_change', position });
  }

  /**
   * Enter a town
   */
  public async enterTown(townId: string): Promise<void> {
    console.log(`[GameController] Entering town: ${townId}`);
    this.emitEvent({ type: 'town_enter', townId });
    await this.setMode('town');
  }

  /**
   * Exit current town
   */
  public async exitTown(): Promise<void> {
    console.log('[GameController] Exiting town');
    this.emitEvent({ type: 'town_exit' });
    await this.setMode('overworld');
  }

  /**
   * Enter a building within a town
   */
  public async enterBuilding(townId: string, buildingId: string): Promise<void> {
    console.log(`[GameController] Entering building: ${buildingId}`);
    this.emitEvent({ type: 'building_enter', townId, buildingId });
  }

  /**
   * Exit current building
   */
  public async exitBuilding(): Promise<void> {
    console.log('[GameController] Exiting building');
    this.emitEvent({ type: 'building_exit' });
  }

  /**
   * Handle encounter trigger
   */
  public async handleEncounter(trigger: EncounterTrigger): Promise<void> {
    console.log(`[GameController] Encounter triggered: ${trigger.encounterId}`);
    this.emitEvent({ type: 'combat_triggered', trigger });

    // Let the encounter hook handle combat initiation
    if (this.onEncounterHook) {
      const combatStarted = await this.onEncounterHook(trigger);
      if (combatStarted) {
        await this.setMode('combat');
      }
    }
  }

  /**
   * Handle combat end
   */
  public async handleCombatEnd(event: CombatEvent & { type: 'combat_end' }): Promise<void> {
    console.log(`[GameController] Combat ended: ${event.outcome}`);
    this.emitEvent({
      type: 'combat_ended',
      outcome: event.outcome,
      rewards: event.rewards,
    });

    if (event.outcome === 'defeat') {
      // Handle game over
      await this.setMode('title');
    } else {
      // Return to overworld
      await this.setMode('overworld');
    }
  }

  /**
   * Open camp mode
   */
  public async openCamp(): Promise<void> {
    console.log('[GameController] Opening camp');
    await this.setMode('camp');
  }

  /**
   * Close camp and return to overworld
   */
  public async closeCamp(): Promise<void> {
    console.log('[GameController] Closing camp');
    await this.setMode('overworld');
  }

  /**
   * Open pause menu
   */
  public async openMenu(): Promise<void> {
    console.log('[GameController] Opening menu');
    this.isPaused = true;
    await this.setMode('menu');
  }

  /**
   * Close pause menu and return to previous mode
   */
  public async closeMenu(previousMode: GameMode): Promise<void> {
    console.log('[GameController] Closing menu');
    this.isPaused = false;
    await this.setMode(previousMode);
  }

  /**
   * Start dialogue
   */
  public async startDialogue(): Promise<void> {
    console.log('[GameController] Starting dialogue');
    await this.setMode('dialogue');
  }

  /**
   * End dialogue
   */
  public async endDialogue(returnMode: GameMode = 'town'): Promise<void> {
    console.log('[GameController] Ending dialogue');
    await this.setMode(returnMode);
  }

  /**
   * Handle time change
   */
  public handleTimeChange(phase: TimePhase, hour: number): void {
    this.emitEvent({ type: 'time_change', phase, hour });
  }

  /**
   * Handle day change
   */
  public handleDayChange(day: number): void {
    this.emitEvent({ type: 'day_change', day });
  }

  /**
   * Quick save
   */
  public async quickSave(): Promise<void> {
    if (!this.onSaveHook) return;
    console.log('[GameController] Quick saving');
    // The actual save is handled by the save system
    this.emitEvent({ type: 'save_complete', slotId: 'quicksave' });
  }

  /**
   * Save to slot
   */
  public async saveToSlot(slotId: string): Promise<void> {
    if (!this.onSaveHook) return;
    console.log(`[GameController] Saving to slot: ${slotId}`);
    this.emitEvent({ type: 'save_complete', slotId });
  }

  /**
   * Check if game is paused
   */
  public isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Set hook for mode changes
   */
  public setModeChangeHook(hook: (mode: GameMode, context: InputContext) => void): void {
    this.onModeChangeHook = hook;
  }

  /**
   * Set hook for position changes
   */
  public setPositionChangeHook(hook: (pos: WorldPosition) => void): void {
    this.onPositionChangeHook = hook;
  }

  /**
   * Set hook for encounters
   */
  public setEncounterHook(hook: (trigger: EncounterTrigger) => Promise<boolean>): void {
    this.onEncounterHook = hook;
  }

  /**
   * Set hook for getting save data
   */
  public setSaveHook(hook: () => GameSaveData): void {
    this.onSaveHook = hook;
  }

  /**
   * Set hook for loading save data
   */
  public setLoadHook(hook: (data: GameSaveData) => void): void {
    this.onLoadHook = hook;
  }

  /**
   * Subscribe to game events
   */
  public onEvent(listener: GameEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * Emit game event
   */
  private emitEvent(event: GameEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[GameController] Event listener error:', err);
      }
    });
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.eventListeners.clear();
    this.onModeChangeHook = null;
    this.onPositionChangeHook = null;
    this.onEncounterHook = null;
    this.onSaveHook = null;
    this.onLoadHook = null;
    console.log('[GameController] Disposed');
  }
}

// Singleton instance
let gameControllerInstance: GameController | null = null;

export function getGameController(config?: Partial<GameControllerConfig>): GameController {
  if (!gameControllerInstance) {
    gameControllerInstance = new GameController(config);
  }
  return gameControllerInstance;
}
