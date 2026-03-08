/**
 * Dialogue Slice - Dialogue state and actions
 *
 * Manages dialogue trees, conversation state, and dialogue effects.
 *
 * @module game/store/slices/dialogueSlice
 */

import type { StateCreator } from 'zustand';
import type { NPCDefinition, DialogueCondition, DialogueEffect } from '../../data';
import type { DialogueState, GamePhase, Notification, NPC } from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Data access interface for dialogue operations.
 */
export interface DialogueDataAccess {
  getNPCById: (npcId: string) => NPCDefinition | undefined;
  getDialogueTreeById: (treeId: string) => any;
  getPrimaryDialogueTree: (npcId: string) => any;
  getDialogueEntryNode: (tree: any, checkCondition: (c: any) => boolean) => any;
  getAvailableChoices: (node: any, checkCondition: (c: any) => boolean) => any[];
}

/**
 * Dialogue-specific state (mostly in UISlice, this focuses on logic).
 */
export interface DialogueSliceState {
  /** NPCs that have been talked to */
  talkedNPCIds: string[];
  /** NPC instances in the world */
  npcs: Record<string, NPC>;
}

/**
 * Dialogue actions.
 */
export interface DialogueActions {
  /** Start dialogue with an NPC */
  startDialogue: (npcId: string, treeId?: string) => void;
  /** Select a dialogue choice */
  selectChoice: (choiceIndex: number) => void;
  /** Advance to next dialogue node (for auto-advance) */
  advanceDialogue: () => void;
  /** End the current dialogue */
  endDialogue: () => void;
  /** Set a dialogue flag */
  setDialogueFlag: (flag: string, value: boolean) => void;
  /** Check if a dialogue condition is met */
  checkDialogueCondition: (condition: DialogueCondition) => boolean;
  /** Apply a dialogue effect */
  applyDialogueEffect: (effect: DialogueEffect) => void;
  /** Get the current NPC being talked to */
  getActiveNPC: () => NPCDefinition | undefined;
  /** Update an NPC's state */
  updateNPC: (npcId: string, updates: Partial<NPC>) => void;
  /** Talk to an NPC (starts dialogue) */
  talkToNPC: (npcId: string) => void;
  /** Mark an NPC as talked to */
  markNPCTalked: (npcId: string) => void;
  /** Reset dialogue state */
  resetDialogue: () => void;
}

/**
 * Dependencies from other slices.
 */
export interface DialogueSliceDeps {
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  dialogueState: DialogueState | null;
  setDialogue: (dialogue: DialogueState | null) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  addItemById: (itemId: string, quantity?: number) => void;
  startQuest: (questId: string) => void;
  completedQuestIds: string[];
  inventory: any[];
  playerStats: any;
}

/**
 * Complete dialogue slice type.
 */
export type DialogueSlice = DialogueSliceState & DialogueActions;

// ============================================================================
// DEFAULTS
// ============================================================================

/**
 * Default dialogue state.
 */
export const DEFAULT_DIALOGUE_SLICE_STATE: DialogueSliceState = {
  talkedNPCIds: [],
  npcs: {},
};

// ============================================================================
// SLICE FACTORY
// ============================================================================

/**
 * Creates the dialogue Zustand slice.
 *
 * @param dataAccess - Data access interface for NPC and dialogue data
 */
export const createDialogueSlice = (
  dataAccess: DialogueDataAccess
): StateCreator<DialogueSlice & DialogueSliceDeps, [], [], DialogueSlice> => {
  return (set, get) => ({
    // State
    ...DEFAULT_DIALOGUE_SLICE_STATE,

    // Actions
    startDialogue: (npcId: string, treeId?: string) => {
      const state = get();
      const npc = dataAccess.getNPCById(npcId);
      if (!npc) return;

      const tree = treeId
        ? dataAccess.getDialogueTreeById(treeId)
        : dataAccess.getPrimaryDialogueTree(npcId);

      if (!tree) {
        state.addNotification('warning', `${npc.name} has nothing to say.`);
        return;
      }

      const node = dataAccess.getDialogueEntryNode(tree, (c) =>
        state.checkDialogueCondition(c)
      );

      if (!node) return;

      const dialogueState: DialogueState = {
        npcId,
        npcName: npc.name,
        treeId: tree.id,
        currentNodeId: node.id,
        text: node.text,
        speaker: node.speaker || npc.name,
        choices: dataAccess.getAvailableChoices(node, (c) =>
          state.checkDialogueCondition(c)
        ),
        autoAdvanceNodeId: node.nextNodeId || null,
        history: [],
        conversationFlags: {},
        startedAt: Date.now(),
      };

      state.setPhase('dialogue');
      state.setDialogue(dialogueState);
    },

    selectChoice: (choiceIndex: number) => {
      const state = get();
      const { dialogueState } = state;
      if (!dialogueState) return;

      const choice = dialogueState.choices[choiceIndex];
      if (!choice) return;

      // Apply effects
      if (choice.effects) {
        choice.effects.forEach((e: DialogueEffect) => state.applyDialogueEffect(e));
      }

      // Move to next node
      if (choice.nextNodeId) {
        const tree = dataAccess.getDialogueTreeById(dialogueState.treeId);
        const nextNode = tree.nodes.find((n: any) => n.id === choice.nextNodeId);

        if (nextNode) {
          state.setDialogue({
            ...dialogueState,
            currentNodeId: nextNode.id,
            text: nextNode.text,
            speaker: nextNode.speaker || dialogueState.npcName,
            choices: dataAccess.getAvailableChoices(nextNode, (c) =>
              state.checkDialogueCondition(c)
            ),
            history: [...dialogueState.history, choice.text],
          });
        } else {
          state.endDialogue();
        }
      } else {
        state.endDialogue();
      }
    },

    advanceDialogue: () => {
      const state = get();
      const { dialogueState } = state;
      if (dialogueState?.autoAdvanceNodeId) {
        const tree = dataAccess.getDialogueTreeById(dialogueState.treeId);
        const nextNode = tree.nodes.find(
          (n: any) => n.id === dialogueState.autoAdvanceNodeId
        );

        if (nextNode) {
          state.setDialogue({
            ...dialogueState,
            currentNodeId: nextNode.id,
            text: nextNode.text,
            speaker: nextNode.speaker || dialogueState.npcName,
            choices: dataAccess.getAvailableChoices(nextNode, (c) =>
              state.checkDialogueCondition(c)
            ),
            autoAdvanceNodeId: nextNode.nextNodeId || null,
          });
        } else {
          state.endDialogue();
        }
      } else {
        state.endDialogue();
      }
    },

    endDialogue: () => {
      const state = get();
      state.setPhase('playing');
      state.setDialogue(null);
    },

    setDialogueFlag: (flag: string, value: boolean) => {
      const state = get();
      const ds = state.dialogueState;
      if (ds) {
        state.setDialogue({
          ...ds,
          conversationFlags: { ...ds.conversationFlags, [flag]: value },
        });
      }
    },

    checkDialogueCondition: (condition: DialogueCondition) => {
      const state = get();

      switch (condition.type) {
        case 'has_item':
          return state.inventory.some(
            (item) =>
              item.itemId === condition.target &&
              item.quantity >= (condition.value ?? 1)
          );

        case 'quest_complete':
          return condition.target
            ? state.completedQuestIds.includes(condition.target)
            : false;

        case 'quest_active':
          // Would need activeQuests from quest slice
          return true;

        case 'gold_gte':
          if (condition.target && condition.value !== undefined) {
            const statValue =
              state.playerStats[condition.target as keyof typeof state.playerStats];
            return typeof statValue === 'number' && statValue >= condition.value;
          }
          return false;

        case 'flag_set':
          if (state.dialogueState && condition.target) {
            return state.dialogueState.conversationFlags[condition.target] === true;
          }
          return false;

        case 'flag_not_set':
          if (state.dialogueState && condition.target) {
            return state.dialogueState.conversationFlags[condition.target] !== true;
          }
          return true;

        default:
          return true;
      }
    },

    applyDialogueEffect: (effect: DialogueEffect) => {
      const state = get();

      switch (effect.type) {
        case 'give_item':
          if (effect.target) {
            state.addItemById(effect.target, effect.value || 1);
          }
          break;

        case 'start_quest':
          if (effect.target) {
            state.startQuest(effect.target);
          }
          break;

        case 'set_flag':
          if (effect.target) {
            state.setDialogueFlag(effect.target, true);
          }
          break;

        case 'clear_flag':
          if (effect.target) {
            state.setDialogueFlag(effect.target, false);
          }
          break;

        // Add more effect types as needed
        default:
          break;
      }
    },

    getActiveNPC: () => {
      const state = get();
      const ds = state.dialogueState;
      if (!ds) return undefined;
      return dataAccess.getNPCById(ds.npcId);
    },

    updateNPC: (npcId: string, updates: Partial<NPC>) => {
      set((s) => ({
        npcs: {
          ...s.npcs,
          [npcId]: { ...s.npcs[npcId], ...updates },
        },
      }));
    },

    talkToNPC: (npcId: string) => {
      const state = get();
      const npc = state.npcs[npcId];
      if (!npc) return;
      state.startDialogue(npcId);
    },

    markNPCTalked: (npcId: string) => {
      const state = get();
      if (!state.talkedNPCIds.includes(npcId)) {
        set((s) => ({ talkedNPCIds: [...s.talkedNPCIds, npcId] }));
      }
    },

    resetDialogue: () =>
      set({
        ...DEFAULT_DIALOGUE_SLICE_STATE,
      }),
  });
};
