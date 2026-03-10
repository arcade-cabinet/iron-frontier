/**
 * Simple Dialogue Tree Generator - Template-free dialogue tree construction
 */

import {
  type GenerationContext,
  substituteTemplate,
} from '../../../schemas/generation';
import { SeededRandom } from '../../seededRandom';
import type { GeneratedNPC } from '../npcGenerator';
import { selectSnippet } from './snippets.ts';
import { buildDialogueVariables } from './builders.ts';
import type {
  GeneratedDialogueChoice,
  GeneratedDialogueTree,
} from './types.ts';

/**
 * Generate a simple dialogue tree for an NPC (no template)
 */
export function generateSimpleDialogueTree(
  rng: SeededRandom,
  npc: GeneratedNPC,
  context: GenerationContext,
  options: {
    includeRumors?: boolean;
    includeQuest?: boolean;
    includeShop?: boolean;
  } = {}
): GeneratedDialogueTree {
  const treeSeed = rng.int(0, 0xffffffff);
  const treeRng = new SeededRandom(treeSeed);

  const variables = buildDialogueVariables(npc, context);
  const nodes = new Map<string, import('./types.ts').GeneratedDialogueNode>();

  // Generate greeting node
  const greetingSnippet = selectSnippet(treeRng, 'greeting', npc);
  const greetingText = greetingSnippet
    ? substituteTemplate(treeRng.pick(greetingSnippet.textTemplates), variables)
    : 'Howdy, stranger.';

  const greetingChoices: GeneratedDialogueChoice[] = [];

  // Add optional branches
  if (options.includeRumors) {
    greetingChoices.push({
      id: 'choice_rumor',
      text: 'Heard any news?',
      nextNodeId: 'node_rumor',
      tags: ['rumor'],
    });
  }

  if (options.includeQuest && npc.isQuestGiver) {
    greetingChoices.push({
      id: 'choice_quest',
      text: 'Got any work?',
      nextNodeId: 'node_quest',
      tags: ['quest'],
    });
  }

  if (options.includeShop && npc.hasShop) {
    greetingChoices.push({
      id: 'choice_shop',
      text: "Let's see what you got.",
      nextNodeId: 'node_shop',
      tags: ['shop'],
    });
  }

  greetingChoices.push({
    id: 'choice_farewell',
    text: 'Goodbye.',
    nextNodeId: null,
    tags: ['farewell'],
  });

  nodes.set('node_greeting', {
    id: 'node_greeting',
    speakerText: greetingText,
    speakerId: npc.id,
    speakerName: npc.name,
    choices: greetingChoices,
    tags: ['greeting'],
  });

  // Generate rumor node if needed
  if (options.includeRumors) {
    const rumorSnippet = selectSnippet(treeRng, 'rumor', npc);
    const rumorText = rumorSnippet
      ? substituteTemplate(treeRng.pick(rumorSnippet.textTemplates), variables)
      : "Ain't heard nothin' worth repeatin'.";

    nodes.set('node_rumor', {
      id: 'node_rumor',
      speakerText: rumorText,
      speakerId: npc.id,
      speakerName: npc.name,
      choices: [
        {
          id: 'choice_rumor_back',
          text: 'Thanks.',
          nextNodeId: 'node_greeting',
          tags: ['back'],
        },
      ],
      tags: ['rumor'],
    });
  }

  // Generate quest node if needed
  if (options.includeQuest && npc.isQuestGiver) {
    const questSnippet = selectSnippet(treeRng, 'quest_offer', npc);
    const questText = questSnippet
      ? substituteTemplate(treeRng.pick(questSnippet.textTemplates), variables)
      : "I might have somethin' for ya...";

    nodes.set('node_quest', {
      id: 'node_quest',
      speakerText: questText,
      speakerId: npc.id,
      speakerName: npc.name,
      choices: [
        {
          id: 'choice_quest_accept',
          text: "I'll do it.",
          nextNodeId: null,
          tags: ['accept_quest'],
        },
        {
          id: 'choice_quest_decline',
          text: 'Not interested.',
          nextNodeId: 'node_greeting',
          tags: ['decline'],
        },
      ],
      tags: ['quest'],
    });
  }

  // Generate shop node if needed
  if (options.includeShop && npc.hasShop) {
    const shopSnippet = selectSnippet(treeRng, 'shop_welcome', npc);
    const shopText = shopSnippet
      ? substituteTemplate(treeRng.pick(shopSnippet.textTemplates), variables)
      : 'Take a look at what I got.';

    nodes.set('node_shop', {
      id: 'node_shop',
      speakerText: shopText,
      speakerId: npc.id,
      speakerName: npc.name,
      choices: [
        {
          id: 'choice_shop_open',
          text: '[Open Shop]',
          nextNodeId: null,
          tags: ['open_shop'],
        },
        {
          id: 'choice_shop_back',
          text: 'Maybe later.',
          nextNodeId: 'node_greeting',
          tags: ['back'],
        },
      ],
      tags: ['shop'],
    });
  }

  return {
    id: `dialogue_${treeSeed.toString(16)}`,
    templateId: 'simple',
    rootNodeId: 'node_greeting',
    nodes,
    npcId: npc.id,
    npcName: npc.name,
    tags: ['generated', 'simple'],
    seed: treeSeed,
  };
}
