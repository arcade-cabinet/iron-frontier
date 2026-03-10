/**
 * Dialogue Generator Types and Registry
 */

import type {
  DialogueSnippet,
  DialogueTreeTemplate,
} from '../../../schemas/generation';

// Registries
let DIALOGUE_SNIPPETS: DialogueSnippet[] = [];
let DIALOGUE_TREE_TEMPLATES: DialogueTreeTemplate[] = [];

/**
 * Initialize dialogue data
 */
export function initDialogueData(
  snippets: DialogueSnippet[],
  treeTemplates: DialogueTreeTemplate[]
): void {
  DIALOGUE_SNIPPETS = snippets;
  DIALOGUE_TREE_TEMPLATES = treeTemplates;
}

/**
 * Get the current snippets registry
 */
export function getSnippetsRegistry(): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS;
}

/**
 * Get the current tree templates registry
 */
export function getTreeTemplatesRegistry(): DialogueTreeTemplate[] {
  return DIALOGUE_TREE_TEMPLATES;
}

/**
 * Generated dialogue choice
 */
export interface GeneratedDialogueChoice {
  id: string;
  text: string;
  nextNodeId: string | null;
  tags: string[];
  effects?: {
    reputation?: Record<string, number>;
    flags?: string[];
  };
}

/**
 * Generated dialogue node
 */
export interface GeneratedDialogueNode {
  id: string;
  speakerText: string;
  speakerId: string;
  speakerName: string;
  choices: GeneratedDialogueChoice[];
  tags: string[];
}

/**
 * Generated dialogue tree
 */
export interface GeneratedDialogueTree {
  id: string;
  templateId: string;
  rootNodeId: string;
  nodes: Map<string, GeneratedDialogueNode>;
  npcId: string;
  npcName: string;
  tags: string[];
  seed: number;
}
