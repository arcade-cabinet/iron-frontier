/**
 * DialogueController.ts - Dialogue system coordination for Iron Frontier v2
 *
 * Manages:
 * - NPC dialogue flow
 * - Choice processing and consequences
 * - Quest flag integration
 * - Item/reward delivery
 * - Dialogue history
 */

/**
 * Dialogue node from the data layer
 */
export interface DialogueNode {
  id: string;
  text: string;
  speaker?: string;
  emotion?: string;
  choices?: DialogueChoice[];
  actions?: DialogueAction[];
  nextNodeId?: string; // For auto-advancing nodes
}

/**
 * Dialogue choice
 */
export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId: string;
  condition?: DialogueCondition;
  consequence?: string; // Preview text
  actions?: DialogueAction[];
}

/**
 * Condition for dialogue availability
 */
export interface DialogueCondition {
  type: 'quest_flag' | 'has_item' | 'has_gold' | 'reputation' | 'stat';
  flag?: string;
  itemId?: string;
  amount?: number;
  comparison?: 'gte' | 'lte' | 'eq';
}

/**
 * Action triggered by dialogue
 */
export interface DialogueAction {
  type: 'set_quest_flag' | 'give_item' | 'take_item' | 'give_gold' | 'take_gold' |
        'start_quest' | 'advance_quest' | 'change_reputation' | 'trigger_combat' |
        'open_shop' | 'heal_party';
  flag?: string;
  value?: boolean | number;
  itemId?: string;
  quantity?: number;
  questId?: string;
  encounterId?: string;
  shopId?: string;
  amount?: number;
}

/**
 * NPC info for dialogue
 */
export interface DialogueNPC {
  id: string;
  name: string;
  title?: string;
  portraitId?: string;
}

/**
 * Dialogue event types
 */
export type DialogueEvent =
  | { type: 'dialogue_start'; npcId: string; npcName: string }
  | { type: 'node_change'; nodeId: string; text: string }
  | { type: 'choice_made'; choiceId: string; text: string }
  | { type: 'action_executed'; action: DialogueAction }
  | { type: 'dialogue_end' }
  | { type: 'quest_started'; questId: string; questName: string }
  | { type: 'item_received'; itemId: string; quantity: number }
  | { type: 'gold_changed'; amount: number };

/**
 * Controller state
 */
export interface DialogueControllerState {
  isActive: boolean;
  currentNPC: DialogueNPC | null;
  currentNode: DialogueNode | null;
  availableChoices: Array<DialogueChoice & { available: boolean; reason?: string }>;
  history: Array<{ nodeId: string; choiceId?: string }>;
}

type DialogueEventListener = (event: DialogueEvent) => void;

/**
 * Data access for dialogue controller
 */
export interface DialogueControllerDataAccess {
  getDialogueTree: (npcId: string) => Map<string, DialogueNode> | undefined;
  getEntryNodeId: (npcId: string) => string | undefined;
  checkCondition: (condition: DialogueCondition) => boolean;
  executeAction: (action: DialogueAction) => Promise<void>;
  getNPCInfo: (npcId: string) => DialogueNPC | undefined;
}

export class DialogueController {
  private state: DialogueControllerState = {
    isActive: false,
    currentNPC: null,
    currentNode: null,
    availableChoices: [],
    history: [],
  };

  private dialogueTree: Map<string, DialogueNode> | null = null;
  private eventListeners: Set<DialogueEventListener> = new Set();
  private dataAccess: DialogueControllerDataAccess;

  constructor(dataAccess: DialogueControllerDataAccess) {
    this.dataAccess = dataAccess;
    console.log('[DialogueController] Initialized');
  }

  /**
   * Start dialogue with an NPC
   */
  public async startDialogue(npcId: string): Promise<boolean> {
    if (this.state.isActive) {
      console.warn('[DialogueController] Dialogue already active');
      return false;
    }

    // Get NPC info
    const npc = this.dataAccess.getNPCInfo(npcId);
    if (!npc) {
      console.error(`[DialogueController] NPC not found: ${npcId}`);
      return false;
    }

    // Get dialogue tree
    const tree = this.dataAccess.getDialogueTree(npcId);
    if (!tree) {
      console.error(`[DialogueController] No dialogue for NPC: ${npcId}`);
      return false;
    }

    // Get entry node
    const entryNodeId = this.dataAccess.getEntryNodeId(npcId);
    if (!entryNodeId) {
      console.error(`[DialogueController] No entry node for NPC: ${npcId}`);
      return false;
    }

    const entryNode = tree.get(entryNodeId);
    if (!entryNode) {
      console.error(`[DialogueController] Entry node not found: ${entryNodeId}`);
      return false;
    }

    // Initialize state
    this.dialogueTree = tree;
    this.state = {
      isActive: true,
      currentNPC: npc,
      currentNode: entryNode,
      availableChoices: this.evaluateChoices(entryNode.choices ?? []),
      history: [{ nodeId: entryNodeId }],
    };

    this.emitEvent({ type: 'dialogue_start', npcId, npcName: npc.name });
    this.emitEvent({ type: 'node_change', nodeId: entryNodeId, text: entryNode.text });

    // Execute entry node actions
    if (entryNode.actions) {
      await this.executeActions(entryNode.actions);
    }

    return true;
  }

  /**
   * Select a dialogue choice
   */
  public async selectChoice(choiceIndex: number): Promise<boolean> {
    if (!this.state.isActive || !this.state.currentNode) return false;

    const choice = this.state.availableChoices[choiceIndex];
    if (!choice || !choice.available) {
      console.warn('[DialogueController] Invalid or unavailable choice');
      return false;
    }

    // Record choice
    this.state.history.push({
      nodeId: this.state.currentNode.id,
      choiceId: choice.id,
    });

    this.emitEvent({ type: 'choice_made', choiceId: choice.id, text: choice.text });

    // Execute choice actions
    if (choice.actions) {
      await this.executeActions(choice.actions);
    }

    // Navigate to next node
    await this.goToNode(choice.nextNodeId);

    return true;
  }

  /**
   * Advance dialogue (for auto-advancing nodes)
   */
  public async advance(): Promise<boolean> {
    if (!this.state.isActive || !this.state.currentNode) return false;

    const node = this.state.currentNode;

    // If no choices and has next node, auto-advance
    if ((!node.choices || node.choices.length === 0) && node.nextNodeId) {
      await this.goToNode(node.nextNodeId);
      return true;
    }

    // If no choices and no next node, end dialogue
    if (!node.choices || node.choices.length === 0) {
      await this.endDialogue();
      return true;
    }

    return false;
  }

  /**
   * Go to a specific node
   */
  private async goToNode(nodeId: string): Promise<void> {
    if (!this.dialogueTree) return;

    // Check for special node IDs
    if (nodeId === 'END' || nodeId === 'end') {
      await this.endDialogue();
      return;
    }

    const node = this.dialogueTree.get(nodeId);
    if (!node) {
      console.error(`[DialogueController] Node not found: ${nodeId}`);
      await this.endDialogue();
      return;
    }

    this.state.currentNode = node;
    this.state.availableChoices = this.evaluateChoices(node.choices ?? []);
    this.state.history.push({ nodeId });

    this.emitEvent({ type: 'node_change', nodeId, text: node.text });

    // Execute node actions
    if (node.actions) {
      await this.executeActions(node.actions);
    }
  }

  /**
   * End the current dialogue
   */
  public async endDialogue(): Promise<void> {
    if (!this.state.isActive) return;

    this.emitEvent({ type: 'dialogue_end' });

    this.state = {
      isActive: false,
      currentNPC: null,
      currentNode: null,
      availableChoices: [],
      history: [],
    };
    this.dialogueTree = null;

    console.log('[DialogueController] Dialogue ended');
  }

  /**
   * Evaluate which choices are available
   */
  private evaluateChoices(
    choices: DialogueChoice[]
  ): Array<DialogueChoice & { available: boolean; reason?: string }> {
    return choices.map((choice) => {
      if (!choice.condition) {
        return { ...choice, available: true };
      }

      const available = this.dataAccess.checkCondition(choice.condition);
      const reason = available ? undefined : this.getConditionReason(choice.condition);

      return { ...choice, available, reason };
    });
  }

  /**
   * Get human-readable reason for unavailable choice
   */
  private getConditionReason(condition: DialogueCondition): string {
    switch (condition.type) {
      case 'quest_flag':
        return 'Requirements not met';
      case 'has_item':
        return `Requires: ${condition.itemId}`;
      case 'has_gold':
        return `Requires ${condition.amount} gold`;
      case 'reputation':
        return 'Insufficient reputation';
      case 'stat':
        return 'Stat requirement not met';
      default:
        return 'Not available';
    }
  }

  /**
   * Execute dialogue actions
   */
  private async executeActions(actions: DialogueAction[]): Promise<void> {
    for (const action of actions) {
      try {
        await this.dataAccess.executeAction(action);
        this.emitEvent({ type: 'action_executed', action });

        // Emit specific events for UI feedback
        switch (action.type) {
          case 'start_quest':
            if (action.questId) {
              this.emitEvent({
                type: 'quest_started',
                questId: action.questId,
                questName: action.questId, // Would need lookup for real name
              });
            }
            break;
          case 'give_item':
            if (action.itemId) {
              this.emitEvent({
                type: 'item_received',
                itemId: action.itemId,
                quantity: action.quantity ?? 1,
              });
            }
            break;
          case 'give_gold':
            if (action.amount) {
              this.emitEvent({ type: 'gold_changed', amount: action.amount });
            }
            break;
          case 'take_gold':
            if (action.amount) {
              this.emitEvent({ type: 'gold_changed', amount: -action.amount });
            }
            break;
        }
      } catch (err) {
        console.error('[DialogueController] Action failed:', err);
      }
    }
  }

  /**
   * Get current state
   */
  public getState(): DialogueControllerState {
    return {
      ...this.state,
      availableChoices: [...this.state.availableChoices],
      history: [...this.state.history],
    };
  }

  /**
   * Get current NPC
   */
  public getCurrentNPC(): DialogueNPC | null {
    return this.state.currentNPC;
  }

  /**
   * Get current node
   */
  public getCurrentNode(): DialogueNode | null {
    return this.state.currentNode;
  }

  /**
   * Get available choices
   */
  public getChoices(): Array<DialogueChoice & { available: boolean; reason?: string }> {
    return this.state.availableChoices;
  }

  /**
   * Check if dialogue is active
   */
  public isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Subscribe to dialogue events
   */
  public onEvent(listener: DialogueEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * Emit dialogue event
   */
  private emitEvent(event: DialogueEvent): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[DialogueController] Event listener error:', err);
      }
    });
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.eventListeners.clear();
    this.dialogueTree = null;
    this.state = {
      isActive: false,
      currentNPC: null,
      currentNode: null,
      availableChoices: [],
      history: [],
    };
    console.log('[DialogueController] Disposed');
  }
}

// Singleton instance
let dialogueControllerInstance: DialogueController | null = null;

export function getDialogueController(
  dataAccess: DialogueControllerDataAccess
): DialogueController {
  if (!dialogueControllerInstance) {
    dialogueControllerInstance = new DialogueController(dataAccess);
  }
  return dialogueControllerInstance;
}
