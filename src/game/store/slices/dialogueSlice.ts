/**
 * Dialogue Slice - NPC dialogue state and actions
 * @module game/store/slices/dialogueSlice
 */
import type { StateCreator } from 'zustand';
import type { NPCDefinition, DialogueCondition, DialogueEffect } from '../../data';
import type { DialogueState, GamePhase, Notification, NPC } from '../types';
import { applyDialogueEffectHelper, evaluateDialogueCondition } from './dialogueHelpers';

export interface DialogueDataAccess {
  getNPCById: (npcId: string) => NPCDefinition | undefined;
  getDialogueTreeById: (treeId: string) => any;
  getPrimaryDialogueTree: (npcId: string) => any;
  getDialogueEntryNode: (tree: any, checkCondition: (c: any) => boolean) => any;
  getAvailableChoices: (node: any, checkCondition: (c: any) => boolean) => any[];
}

export interface DialogueSliceState {
  talkedNPCIds: string[];
  npcs: Record<string, NPC>;
}

export interface DialogueActions {
  startDialogue: (npcId: string, treeId?: string) => void;
  selectChoice: (choiceIndex: number) => void;
  advanceDialogue: () => void;
  endDialogue: () => void;
  setDialogueFlag: (flag: string, value: boolean) => void;
  checkDialogueCondition: (condition: DialogueCondition) => boolean;
  applyDialogueEffect: (effect: DialogueEffect) => void;
  getActiveNPC: () => NPCDefinition | undefined;
  updateNPC: (npcId: string, updates: Partial<NPC>) => void;
  talkToNPC: (npcId: string) => void;
  markNPCTalked: (npcId: string) => void;
  resetDialogue: () => void;
}

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

export type DialogueSlice = DialogueSliceState & DialogueActions;

export const DEFAULT_DIALOGUE_SLICE_STATE: DialogueSliceState = {
  talkedNPCIds: [],
  npcs: {},
};

export const createDialogueSlice = (
  dataAccess: DialogueDataAccess
): StateCreator<DialogueSlice & DialogueSliceDeps, [], [], DialogueSlice> => {
  return (set, get) => ({
    ...DEFAULT_DIALOGUE_SLICE_STATE,

    startDialogue: (npcId: string, treeId?: string) => {
      const state = get();
      const npc = dataAccess.getNPCById(npcId);
      if (!npc) return;

      const tree = treeId
        ? dataAccess.getDialogueTreeById(treeId)
        : dataAccess.getPrimaryDialogueTree(npcId);
      if (!tree) { state.addNotification('warning', `${npc.name} has nothing to say.`); return; }

      const node = dataAccess.getDialogueEntryNode(tree, (c) => state.checkDialogueCondition(c));
      if (!node) return;

      state.setPhase('dialogue');
      state.setDialogue({
        npcId, npcName: npc.name, treeId: tree.id, currentNodeId: node.id,
        text: node.text, speaker: node.speaker || npc.name,
        choices: dataAccess.getAvailableChoices(node, (c) => state.checkDialogueCondition(c)),
        autoAdvanceNodeId: node.nextNodeId || null, history: [],
        conversationFlags: {}, startedAt: Date.now(),
      });
    },

    selectChoice: (choiceIndex: number) => {
      const state = get();
      const { dialogueState } = state;
      if (!dialogueState) return;
      const choice = dialogueState.choices[choiceIndex];
      if (!choice) return;

      if (choice.effects) choice.effects.forEach((e: DialogueEffect) => state.applyDialogueEffect(e));

      if (choice.nextNodeId) {
        const tree = dataAccess.getDialogueTreeById(dialogueState.treeId);
        const nextNode = tree.nodes.find((n: any) => n.id === choice.nextNodeId);
        if (nextNode) {
          state.setDialogue({
            ...dialogueState, currentNodeId: nextNode.id, text: nextNode.text,
            speaker: nextNode.speaker || dialogueState.npcName,
            choices: dataAccess.getAvailableChoices(nextNode, (c) => state.checkDialogueCondition(c)),
            history: [...dialogueState.history, choice.text],
          });
        } else { state.endDialogue(); }
      } else { state.endDialogue(); }
    },

    advanceDialogue: () => {
      const state = get();
      const { dialogueState } = state;
      if (dialogueState?.autoAdvanceNodeId) {
        const tree = dataAccess.getDialogueTreeById(dialogueState.treeId);
        const nextNode = tree.nodes.find((n: any) => n.id === dialogueState.autoAdvanceNodeId);
        if (nextNode) {
          state.setDialogue({
            ...dialogueState, currentNodeId: nextNode.id, text: nextNode.text,
            speaker: nextNode.speaker || dialogueState.npcName,
            choices: dataAccess.getAvailableChoices(nextNode, (c) => state.checkDialogueCondition(c)),
            autoAdvanceNodeId: nextNode.nextNodeId || null,
          });
        } else { state.endDialogue(); }
      } else { state.endDialogue(); }
    },

    endDialogue: () => {
      const state = get();
      state.setPhase('playing');
      state.setDialogue(null);
    },

    setDialogueFlag: (flag: string, value: boolean) => {
      const state = get();
      const ds = state.dialogueState;
      if (ds) state.setDialogue({ ...ds, conversationFlags: { ...ds.conversationFlags, [flag]: value } });
    },

    checkDialogueCondition: (condition: DialogueCondition) =>
      evaluateDialogueCondition(condition, get()),

    applyDialogueEffect: (effect: DialogueEffect) =>
      applyDialogueEffectHelper(effect, get()),

    getActiveNPC: () => {
      const ds = get().dialogueState;
      if (!ds) return undefined;
      return dataAccess.getNPCById(ds.npcId);
    },

    updateNPC: (npcId: string, updates: Partial<NPC>) => {
      set((s) => ({ npcs: { ...s.npcs, [npcId]: { ...s.npcs[npcId], ...updates } } }));
    },

    talkToNPC: (npcId: string) => {
      const npc = get().npcs[npcId];
      if (!npc) return;
      get().startDialogue(npcId);
    },

    markNPCTalked: (npcId: string) => {
      if (!get().talkedNPCIds.includes(npcId)) {
        set((s) => ({ talkedNPCIds: [...s.talkedNPCIds, npcId] }));
      }
    },

    resetDialogue: () => set({ ...DEFAULT_DIALOGUE_SLICE_STATE }),
  });
};
