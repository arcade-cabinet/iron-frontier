/**
 * NPC Validation & Utility Functions
 */

import type { DialogueChoice, DialogueCondition, DialogueNode, DialogueTree } from './dialogue.ts';
import type { NPCDefinition } from './definition.ts';
import { DialogueNodeSchema, DialogueTreeSchema } from './dialogue.ts';
import { NPCDefinitionSchema } from './definition.ts';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateDialogueNode(data: unknown): DialogueNode {
  return DialogueNodeSchema.parse(data);
}

export function validateDialogueTree(data: unknown): DialogueTree {
  return DialogueTreeSchema.parse(data);
}

export function validateNPCDefinition(data: unknown): NPCDefinition {
  return NPCDefinitionSchema.parse(data);
}

export function validateDialogueTreeIntegrity(tree: DialogueTree): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(tree.nodes.map((n) => n.id));

  for (const entry of tree.entryPoints) {
    if (!nodeIds.has(entry.nodeId)) {
      errors.push(`Entry point references unknown node: ${entry.nodeId}`);
    }
  }

  for (const node of tree.nodes) {
    if (node.nextNodeId && !nodeIds.has(node.nextNodeId)) {
      errors.push(`Node ${node.id} references unknown next node: ${node.nextNodeId}`);
    }

    for (const choice of node.choices ?? []) {
      if (choice.nextNodeId && !nodeIds.has(choice.nextNodeId)) {
        errors.push(`Choice in node ${node.id} references unknown node: ${choice.nextNodeId}`);
      }
    }
  }

  return errors;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getDialogueEntryNode(
  tree: DialogueTree,
  checkCondition: (condition: DialogueCondition) => boolean
): DialogueNode | null {
  const sortedEntries = [...tree.entryPoints].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const entry of sortedEntries) {
    const allConditionsMet = (entry.conditions ?? []).every(checkCondition);
    if (allConditionsMet) {
      return tree.nodes.find((n) => n.id === entry.nodeId) || null;
    }
  }

  const fallback = sortedEntries[sortedEntries.length - 1];
  return tree.nodes.find((n) => n.id === fallback?.nodeId) || null;
}

export function getAvailableChoices(
  node: DialogueNode,
  checkCondition: (condition: DialogueCondition) => boolean
): DialogueChoice[] {
  if (!node.choices || !Array.isArray(node.choices)) {
    return [];
  }

  return node.choices.filter((choice) => {
    if (!choice.conditions || !Array.isArray(choice.conditions) || choice.conditions.length === 0) {
      return true;
    }
    return choice.conditions.every(checkCondition);
  });
}

export const SCHEMA_VERSION = '1.0.0';
