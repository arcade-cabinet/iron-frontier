import type { DialogueEffect } from './common';

export interface DialogueState {
  npcId: string;
  npcName: string;
  npcTitle?: string;
  npcPortraitId?: string;
  npcExpression?: string;
  treeId: string;
  currentNodeId: string;
  text: string;
  speaker?: string;
  choices: {
    text: string;
    nextNodeId: string | null;
    effects: DialogueEffect[];
    tags: string[];
    hint?: string;
  }[];
  autoAdvanceNodeId: string | null;
  history: string[];
  conversationFlags: Record<string, boolean>;
  startedAt: number;
}
