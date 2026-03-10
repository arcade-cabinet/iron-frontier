/**
 * Dialogue Type Converters - Generated Dialogues to Game Format
 */

import type {
  DialogueChoice,
  DialogueEffect,
  DialogueNode,
  DialogueTree,
} from '../../../schemas/npc';
import type {
  GeneratedDialogueChoice,
  GeneratedDialogueNode,
  GeneratedDialogueTree,
} from '../../generators';

/**
 * Convert generated dialogue choice to DialogueChoice format
 */
function convertGeneratedDialogueChoice(generated: GeneratedDialogueChoice): DialogueChoice {
  const effects: DialogueEffect[] = [];

  if (generated.effects?.reputation) {
    for (const [faction, value] of Object.entries(generated.effects.reputation)) {
      effects.push({
        type: 'change_reputation',
        target: faction,
        value,
      });
    }
  }

  if (generated.effects?.flags) {
    for (const flag of generated.effects.flags) {
      effects.push({
        type: 'set_flag',
        target: flag,
      });
    }
  }

  return {
    text: generated.text,
    nextNodeId: generated.nextNodeId,
    conditions: [],
    effects,
    tags: generated.tags,
  };
}

/**
 * Convert generated dialogue node to DialogueNode format
 */
function convertGeneratedDialogueNode(generated: GeneratedDialogueNode): DialogueNode {
  return {
    id: generated.id,
    text: generated.speakerText,
    speaker: generated.speakerName,
    choices: generated.choices.map(convertGeneratedDialogueChoice),
    nextNodeId: null,
    choiceDelay: 0,
    onEnterEffects: [],
    tags: generated.tags,
  };
}

/**
 * Convert generated dialogue tree to DialogueTree format
 */
export function convertGeneratedDialogue(generated: GeneratedDialogueTree): DialogueTree {
  const nodes: DialogueNode[] = [];

  for (const node of Array.from(generated.nodes.values())) {
    nodes.push(convertGeneratedDialogueNode(node));
  }

  return {
    id: generated.id,
    name: `Dialogue with ${generated.npcName}`,
    description: `Generated dialogue for ${generated.npcId}`,
    nodes,
    entryPoints: [
      {
        nodeId: generated.rootNodeId,
        conditions: [],
        priority: 0,
      },
    ],
    tags: generated.tags,
  };
}
