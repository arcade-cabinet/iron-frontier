/**
 * CombatController.ts - High-level combat coordination for Iron Frontier v2
 *
 * Bridges between:
 * - Combat System (game logic)
 * - Scene Manager (transitions)
 * - Game State (progression)
 * - Audio Manager (sound effects)
 * - Input Manager (combat controls)
 */

import type { CombatState, CombatAction, CombatResult, Combatant } from '../systems/combat/types';
import {
  initializeCombat,
  processAction,
  getAIAction,
  getCurrentCombatant,
  advanceTurn,
  getCombatOutcome,
  calculateRewards,
} from '../systems/combat';
import type { EncounterTrigger } from '../systems/EncounterSystem';

/**
 * Combat event types
 */
export type CombatEvent =
  | { type: 'combat_start'; combatId: string; enemies: string[] }
  | { type: 'turn_start'; combatantId: string; isPlayer: boolean }
  | { type: 'action_executed'; action: CombatAction; result: CombatResult }
  | { type: 'combatant_defeated'; combatantId: string; name: string }
  | { type: 'combat_end'; outcome: 'victory' | 'defeat' | 'fled'; rewards?: CombatRewards }
  | { type: 'player_input_required' }
  | { type: 'ai_thinking'; combatantId: string };

/**
 * Combat rewards
 */
export interface CombatRewards {
  xp: number;
  gold: number;
  items: Array<{ itemId: string; quantity: number }>;
}

/**
 * Combat controller state
 */
export interface CombatControllerState {
  isActive: boolean;
  combatId: string | null;
  combatState: CombatState | null;
  encounterId: string | null;
  selectedAction: CombatAction | null;
  selectedTarget: string | null;
  isProcessing: boolean;
  turnQueue: string[];
}

type CombatEventListener = (event: CombatEvent) => void;

/**
 * Data access for combat controller
 */
export interface CombatControllerDataAccess {
  getEncounterById: (id: string) => any | undefined;
  getEnemyById: (id: string) => any | undefined;
}

export class CombatController {
  private state: CombatControllerState = {
    isActive: false,
    combatId: null,
    combatState: null,
    encounterId: null,
    selectedAction: null,
    selectedTarget: null,
    isProcessing: false,
    turnQueue: [],
  };

  private eventListeners: Set<CombatEventListener> = new Set();
  private aiTurnDelay = 800; // ms between AI actions
  private actionDelay = 500; // ms between actions
  private dataAccess: CombatControllerDataAccess;

  constructor(dataAccess: CombatControllerDataAccess) {
    this.dataAccess = dataAccess;
    console.log('[CombatController] Initialized');
  }

  /**
   * Start combat from an encounter trigger
   */
  public async startCombat(
    trigger: EncounterTrigger,
    playerStats: Combatant['stats'],
    playerName: string,
    playerWeaponId: string | null
  ): Promise<boolean> {
    if (this.state.isActive) {
      console.warn('[CombatController] Combat already active');
      return false;
    }

    const encounter = this.dataAccess.getEncounterById(trigger.encounterId);
    if (!encounter) {
      console.error(`[CombatController] Encounter not found: ${trigger.encounterId}`);
      return false;
    }

    // Initialize combat state
    const combatState = initializeCombat(
      encounter,
      {
        encounterId: trigger.encounterId,
        playerStats,
        playerName,
        playerWeaponId,
      },
      (id) => this.dataAccess.getEnemyById(id)
    );

    this.state = {
      isActive: true,
      combatId: `combat_${Date.now()}`,
      combatState,
      encounterId: trigger.encounterId,
      selectedAction: null,
      selectedTarget: null,
      isProcessing: false,
      turnQueue: combatState.turnOrder,
    };

    // Emit start event
    this.emitEvent({
      type: 'combat_start',
      combatId: this.state.combatId ?? 'unknown',
      enemies: combatState.combatants
        .filter((c) => c.type === 'enemy')
        .map((c) => c.name),
    });

    // Start the first turn
    await this.startNextTurn();

    return true;
  }

  /**
   * Start the next turn
   */
  private async startNextTurn(): Promise<void> {
    if (!this.state.combatState) return;

    const currentCombatant = getCurrentCombatant(this.state.combatState);
    if (!currentCombatant) return;

    const isPlayer = currentCombatant.type === 'player';

    this.emitEvent({
      type: 'turn_start',
      combatantId: currentCombatant.id,
      isPlayer,
    });

    if (isPlayer) {
      // Wait for player input
      this.emitEvent({ type: 'player_input_required' });
    } else {
      // AI turn
      await this.processAITurn(currentCombatant.id);
    }
  }

  /**
   * Process an AI turn
   */
  private async processAITurn(combatantId: string): Promise<void> {
    if (!this.state.combatState) return;

    this.emitEvent({ type: 'ai_thinking', combatantId });

    // Add delay for player to see what's happening
    await this.delay(this.aiTurnDelay);

    // Get AI decision
    const action = getAIAction(this.state.combatState, combatantId);
    if (!action) {
      // Skip turn if no valid action
      await this.endTurn();
      return;
    }

    await this.executeAction(action);
  }

  /**
   * Set player's selected action
   */
  public selectAction(actionType: CombatAction['type']): void {
    if (!this.state.isActive || this.state.isProcessing) return;

    const combatState = this.state.combatState;
    if (!combatState) return;

    const currentCombatant = getCurrentCombatant(combatState);
    if (!currentCombatant || currentCombatant.type !== 'player') return;

    this.state.selectedAction = {
      type: actionType,
      actorId: currentCombatant.id,
      targetId: this.state.selectedTarget ?? undefined,
    } as CombatAction;
  }

  /**
   * Set player's selected target
   */
  public selectTarget(targetId: string): void {
    if (!this.state.isActive || this.state.isProcessing) return;
    this.state.selectedTarget = targetId;

    // Update action target if action is selected
    if (this.state.selectedAction) {
      this.state.selectedAction.targetId = targetId;
    }
  }

  /**
   * Confirm and execute player's action
   */
  public async confirmAction(): Promise<boolean> {
    if (!this.state.selectedAction) return false;
    return this.executeAction(this.state.selectedAction);
  }

  /**
   * Execute a combat action
   */
  public async executeAction(action: CombatAction): Promise<boolean> {
    if (!this.state.combatState || this.state.isProcessing) return false;

    this.state.isProcessing = true;

    try {
      // Process the action
      const result = processAction(this.state.combatState, action);
      if (!result) {
        console.warn('[CombatController] Action failed');
        return false;
      }

      // Update state
      this.state.combatState = result.state;

      // Emit action event
      this.emitEvent({
        type: 'action_executed',
        action,
        result: result.result,
      });

      // Check for defeated combatants
      for (const combatant of result.state.combatants) {
        if (!combatant.isAlive) {
          this.emitEvent({
            type: 'combatant_defeated',
            combatantId: combatant.id,
            name: combatant.name,
          });
        }
      }

      // Add action delay
      await this.delay(this.actionDelay);

      // Check combat end
      const outcome = getCombatOutcome(result.state);
      if (outcome !== 'ongoing') {
        await this.endCombat(outcome as 'player_wins' | 'enemy_wins' | 'fled');
        return true;
      }

      // End turn and start next
      await this.endTurn();

      return true;
    } finally {
      this.state.isProcessing = false;
      this.state.selectedAction = null;
    }
  }

  /**
   * Attempt to flee combat
   */
  public async attemptFlee(): Promise<boolean> {
    if (!this.state.combatState) return false;

    const currentCombatant = getCurrentCombatant(this.state.combatState);
    if (!currentCombatant || currentCombatant.type !== 'player') return false;

    const fleeAction: CombatAction = {
      type: 'flee',
      actorId: currentCombatant.id,
    };

    return this.executeAction(fleeAction);
  }

  /**
   * End the current turn
   */
  private async endTurn(): Promise<void> {
    if (!this.state.combatState) return;

    // Advance to next turn
    this.state.combatState = advanceTurn(this.state.combatState);

    // Start next turn
    await this.startNextTurn();
  }

  /**
   * End combat
   */
  private async endCombat(
    outcome: 'player_wins' | 'enemy_wins' | 'fled'
  ): Promise<void> {
    if (!this.state.combatState) return;

    let rewards: CombatRewards | undefined;

    if (outcome === 'player_wins' && this.state.encounterId) {
      const encounter = this.dataAccess.getEncounterById(this.state.encounterId);
      if (encounter) {
        const rawRewards = calculateRewards(this.state.combatState, encounter);
        rewards = {
          xp: rawRewards.xp,
          gold: rawRewards.gold,
          items: rawRewards.loot.map((l) => ({ itemId: l.itemId, quantity: l.quantity })),
        };
      }
    }

    this.emitEvent({
      type: 'combat_end',
      outcome: outcome === 'player_wins' ? 'victory' : outcome === 'enemy_wins' ? 'defeat' : 'fled',
      rewards,
    });

    // Reset state
    this.state = {
      isActive: false,
      combatId: null,
      combatState: null,
      encounterId: null,
      selectedAction: null,
      selectedTarget: null,
      isProcessing: false,
      turnQueue: [],
    };
  }

  /**
   * Get current combat state
   */
  public getState(): CombatControllerState {
    return { ...this.state };
  }

  /**
   * Get current combatant
   */
  public getCurrentCombatant(): Combatant | null {
    if (!this.state.combatState) return null;
    return getCurrentCombatant(this.state.combatState) ?? null;
  }

  /**
   * Get all combatants
   */
  public getCombatants(): Combatant[] {
    return this.state.combatState?.combatants ?? [];
  }

  /**
   * Get enemies only
   */
  public getEnemies(): Combatant[] {
    return this.getCombatants().filter((c) => c.type === 'enemy' && c.isAlive);
  }

  /**
   * Get player combatant
   */
  public getPlayer(): Combatant | null {
    return this.getCombatants().find((c) => c.type === 'player') ?? null;
  }

  /**
   * Check if combat is active
   */
  public isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Check if waiting for player input
   */
  public isWaitingForInput(): boolean {
    if (!this.state.isActive || this.state.isProcessing) return false;
    const current = this.getCurrentCombatant();
    return current?.type === 'player';
  }

  /**
   * Subscribe to combat events
   */
  public onEvent(listener: CombatEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * Emit combat event
   */
  private emitEvent(event: CombatEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[CombatController] Event listener error:', err);
      }
    });
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Set animation delays
   */
  public setDelays(aiTurnDelay: number, actionDelay: number): void {
    this.aiTurnDelay = aiTurnDelay;
    this.actionDelay = actionDelay;
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.eventListeners.clear();
    this.state = {
      isActive: false,
      combatId: null,
      combatState: null,
      encounterId: null,
      selectedAction: null,
      selectedTarget: null,
      isProcessing: false,
      turnQueue: [],
    };
    console.log('[CombatController] Disposed');
  }
}

// Singleton instance
let combatControllerInstance: CombatController | null = null;

export function getCombatController(dataAccess: CombatControllerDataAccess): CombatController {
  if (!combatControllerInstance) {
    combatControllerInstance = new CombatController(dataAccess);
  }
  return combatControllerInstance;
}
