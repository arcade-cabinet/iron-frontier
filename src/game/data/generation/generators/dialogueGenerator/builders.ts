/**
 * Dialogue Tree Builders - Template-based dialogue tree construction
 */

import {
  type DialogueSnippet,
  type DialogueTreeTemplate,
  type GenerationContext,
  substituteTemplate,
} from '../../../schemas/generation';
import { SeededRandom } from '../../seededRandom';
import type { GeneratedNPC } from '../npcGenerator';
import { selectSnippet } from './snippets.ts';
import type {
  GeneratedDialogueChoice,
  GeneratedDialogueNode,
  GeneratedDialogueTree,
} from './types.ts';
import { getTreeTemplatesRegistry } from './types.ts';

/**
 * Build template variables for dialogue
 */
export function buildDialogueVariables(
  npc: GeneratedNPC,
  context: GenerationContext,
  extras: Record<string, string> = {}
): Record<string, string> {
  return {
    npcName: npc.name,
    npcFirstName: npc.nameDetails.firstName,
    npcRole: npc.role,
    npcFaction: npc.faction,
    playerName: 'stranger', // Would be replaced at runtime
    location: context.locationId ?? 'here',
    region: context.regionId ?? 'these parts',
    timeOfDay:
      context.gameHour < 6
        ? 'night'
        : context.gameHour < 12
          ? 'morning'
          : context.gameHour < 18
            ? 'afternoon'
            : 'evening',
    ...extras,
  };
}

/**
 * Generate a dialogue node from a pattern
 */
export function generateNode(
  rng: SeededRandom,
  nodePattern: DialogueTreeTemplate['nodePatterns'][0],
  npc: GeneratedNPC,
  _context: GenerationContext,
  variables: Record<string, string>,
  nodeIndex: number
): GeneratedDialogueNode | null {
  // Select a snippet for the speaker text
  const snippetCategory = nodePattern.snippetCategories[0] as DialogueSnippet['category'];
  const snippet = selectSnippet(rng, snippetCategory, npc);

  if (!snippet) {
    // Fallback text
    const fallbackTexts: Record<string, string> = {
      greeting: 'Howdy.',
      farewell: "Be seein' ya.",
      rumor: "Ain't heard nothin' interesting.",
      quest: "Got nothin' for ya right now.",
      shop: 'Take a look around.',
    };
    const speakerText = fallbackTexts[nodePattern.role] ?? '...';

    return {
      id: `node_${nodeIndex}`,
      speakerText,
      speakerId: npc.id,
      speakerName: npc.name,
      choices: [],
      tags: [nodePattern.role],
    };
  }

  // Select and substitute text
  const textTemplate = rng.pick(snippet.textTemplates);
  const speakerText = substituteTemplate(textTemplate, variables);

  // Generate choices from pattern
  const choices: GeneratedDialogueChoice[] = nodePattern.choicePatterns.map(
    (choicePattern, choiceIndex) => ({
      id: `choice_${nodeIndex}_${choiceIndex}`,
      text: substituteTemplate(choicePattern.textTemplate, variables),
      nextNodeId: choicePattern.nextRole ? `node_${choicePattern.nextRole}` : null,
      tags: choicePattern.tags,
    })
  );

  // Add default farewell choice if none
  if (choices.length === 0 && nodePattern.role !== 'farewell') {
    choices.push({
      id: `choice_${nodeIndex}_farewell`,
      text: 'Goodbye.',
      nextNodeId: null,
      tags: ['farewell'],
    });
  }

  return {
    id: `node_${nodeIndex}`,
    speakerText,
    speakerId: npc.id,
    speakerName: npc.name,
    choices,
    tags: [nodePattern.role, ...(snippet.tags ?? [])],
  };
}

/**
 * Build a complete dialogue tree from a template
 */
export function buildDialogueTree(
  rng: SeededRandom,
  templateId: string,
  npc: GeneratedNPC,
  context: GenerationContext
): GeneratedDialogueTree | null {
  const template = getTreeTemplatesRegistry().find((t) => t.id === templateId);
  if (!template) {
    return null;
  }

  const treeSeed = rng.int(0, 0xffffffff);
  const treeRng = new SeededRandom(treeSeed);

  const variables = buildDialogueVariables(npc, context);
  const nodes = new Map<string, GeneratedDialogueNode>();

  // Generate nodes for each pattern
  template.nodePatterns.forEach((pattern, index) => {
    const node = generateNode(treeRng, pattern, npc, context, variables, index);
    if (node) {
      // Use role as node ID for linking
      node.id = `node_${pattern.role}`;
      nodes.set(node.id, node);
    }
  });

  // Find root node (usually greeting)
  const rootPattern = template.nodePatterns.find((p) => p.role === 'greeting');
  const rootNodeId = rootPattern ? 'node_greeting' : nodes.keys().next().value;

  if (!rootNodeId || nodes.size === 0) {
    return null;
  }

  return {
    id: `dialogue_${treeSeed.toString(16)}`,
    templateId,
    rootNodeId,
    nodes,
    npcId: npc.id,
    npcName: npc.name,
    tags: [...template.tags],
    seed: treeSeed,
  };
}
