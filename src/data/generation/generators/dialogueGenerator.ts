/**
 * Dialogue Generator - Procedural dialogue tree generation
 *
 * Assembles dialogue trees from templates and snippets.
 */

import {
  type DialogueSnippet,
  type DialogueTreeTemplate,
  type GenerationContext,
  substituteTemplate,
} from '../../schemas/generation';
import { SeededRandom } from '../seededRandom';
import type { GeneratedNPC } from './npcGenerator';

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

/**
 * Get snippets by category
 */
export function getSnippetsByCategory(category: DialogueSnippet['category']): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((s) => s.category === category);
}

/**
 * Get snippets valid for an NPC
 */
export function getSnippetsForNPC(
  role: string,
  faction: string,
  personality: Record<string, number>
): DialogueSnippet[] {
  return DIALOGUE_SNIPPETS.filter((snippet) => {
    // Check role
    const validRoles = snippet.validRoles ?? [];
    if (validRoles.length > 0 && !validRoles.includes(role)) {
      return false;
    }

    // Check faction
    const validFactions = snippet.validFactions ?? [];
    if (validFactions.length > 0 && !validFactions.includes(faction)) {
      return false;
    }

    // Check personality minimums
    for (const [trait, minValue] of Object.entries(snippet.personalityMin ?? {})) {
      if ((personality[trait] ?? 0.5) < minValue) {
        return false;
      }
    }

    // Check personality maximums
    for (const [trait, maxValue] of Object.entries(snippet.personalityMax ?? {})) {
      if ((personality[trait] ?? 0.5) > maxValue) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get dialogue tree templates for a role
 */
export function getDialogueTreesForRole(role: string): DialogueTreeTemplate[] {
  return DIALOGUE_TREE_TEMPLATES.filter(
    (t) => t.validRoles.length === 0 || t.validRoles.includes(role)
  );
}

/**
 * Get dialogue tree template by ID
 */
export function getDialogueTreeTemplate(id: string): DialogueTreeTemplate | undefined {
  return DIALOGUE_TREE_TEMPLATES.find((t) => t.id === id);
}

/**
 * Select a snippet matching criteria
 */
function selectSnippet(
  rng: SeededRandom,
  category: DialogueSnippet['category'],
  npc: GeneratedNPC,
  additionalTags: string[] = []
): DialogueSnippet | null {
  let candidates = getSnippetsByCategory(category);

  // Filter by NPC compatibility
  candidates = candidates.filter((s) => {
    const validRoles = s.validRoles ?? [];
    const validFactions = s.validFactions ?? [];
    if (validRoles.length > 0 && !validRoles.includes(npc.role)) {
      return false;
    }
    if (validFactions.length > 0 && !validFactions.includes(npc.faction)) {
      return false;
    }

    // Check personality requirements
    for (const [trait, minVal] of Object.entries(s.personalityMin ?? {})) {
      const npcVal = npc.personality[trait as keyof typeof npc.personality] ?? 0.5;
      if (npcVal < minVal) return false;
    }
    for (const [trait, maxVal] of Object.entries(s.personalityMax ?? {})) {
      const npcVal = npc.personality[trait as keyof typeof npc.personality] ?? 0.5;
      if (npcVal > maxVal) return false;
    }

    return true;
  });

  // Prefer snippets matching additional tags
  if (additionalTags.length > 0) {
    const tagMatched = candidates.filter((s) =>
      additionalTags.some((tag) => (s.tags ?? []).includes(tag))
    );
    if (tagMatched.length > 0) {
      candidates = tagMatched;
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  return rng.pick(candidates);
}

/**
 * Build template variables for dialogue
 */
function buildDialogueVariables(
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
function generateNode(
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
  const template = getDialogueTreeTemplate(templateId);
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
  const nodes = new Map<string, GeneratedDialogueNode>();

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
