/**
 * Dialogue Tree Templates - Helpers and builder
 */

import type {
  DialogueSnippet,
  DialogueTreeTemplate,
  GenerationContext,
} from '../../../schemas/generation.ts';
import type { DialogueChoice, DialogueNode, DialogueTree, NPCDefinition } from '../../../schemas/npc.ts';
import type { SeededRandom } from '../../seededRandom.ts';
import { GENERAL_DIALOGUE_TREES } from './general.ts';
import { ROLE_SPECIFIC_DIALOGUE_TREES } from './role_specific.ts';
import { QUEST_DIALOGUE_TREES } from './quest.ts';
import { SPECIAL_DIALOGUE_TREES } from './special.ts';

export const DIALOGUE_TREE_TEMPLATES: Record<string, DialogueTreeTemplate> = {
  ...GENERAL_DIALOGUE_TREES,
  ...ROLE_SPECIFIC_DIALOGUE_TREES,
  ...QUEST_DIALOGUE_TREES,
  ...SPECIAL_DIALOGUE_TREES,
};

// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a dialogue tree template by ID
 */
export function getDialogueTreeTemplate(id: string): DialogueTreeTemplate | undefined {
  return DIALOGUE_TREE_TEMPLATES[id];
}

/**
 * Get all dialogue tree templates valid for a specific NPC role
 */
export function getDialogueTreesForRole(role: string): DialogueTreeTemplate[] {
  return Object.values(DIALOGUE_TREE_TEMPLATES).filter((template) => {
    // Empty validRoles means valid for all roles
    if (template.validRoles.length === 0) return true;
    return template.validRoles.includes(role);
  });
}

/**
 * Get all dialogue tree templates valid for a specific faction
 */
export function getDialogueTreesForFaction(faction: string): DialogueTreeTemplate[] {
  return Object.values(DIALOGUE_TREE_TEMPLATES).filter((template) => {
    // Empty validFactions means valid for all factions
    if (template.validFactions.length === 0) return true;
    return template.validFactions.includes(faction);
  });
}

/**
 * Get templates matching both role and faction
 */
export function getDialogueTreesForNPC(role: string, faction: string): DialogueTreeTemplate[] {
  return Object.values(DIALOGUE_TREE_TEMPLATES).filter((template) => {
    const roleMatch = template.validRoles.length === 0 || template.validRoles.includes(role);
    const factionMatch =
      template.validFactions.length === 0 || template.validFactions.includes(faction);
    return roleMatch && factionMatch;
  });
}

/**
 * Get templates by tag
 */
export function getDialogueTreesByTag(tag: string): DialogueTreeTemplate[] {
  return Object.values(DIALOGUE_TREE_TEMPLATES).filter((template) => template.tags.includes(tag));
}

// ============================================================================
// DIALOGUE TREE BUILDER
// ============================================================================

/**
 * Context for building a dialogue tree
 */
// interface BuildContext {
//   npc: NPCDefinition;
//   generationContext: GenerationContext;
//   variables: Record<string, string>;
// }

/**
 * Build a complete DialogueTree from a template, NPC, and snippets
 *
 * This is the main generation function that combines:
 * - Template structure (nodes, choices, flow)
 * - Snippet content (actual dialogue text)
 * - NPC context (personality, role, faction)
 * - Game context (time, region, events)
 *
 * @param templateId - ID of the dialogue tree template
 * @param npc - NPC definition to generate dialogue for
 * @param context - Generation context (world seed, time, region, etc.)
 * @param snippets - Available dialogue snippets to pull from
 * @param rng - Seeded random number generator
 * @returns Complete DialogueTree ready for use, or null if template not found
 */
export function buildDialogueTree(
  templateId: string,
  npc: NPCDefinition,
  context: GenerationContext,
  snippets: DialogueSnippet[],
  rng: SeededRandom
): DialogueTree | null {
  const template = getDialogueTreeTemplate(templateId);
  if (!template) return null;

  // Build variable substitution map
  const variables: Record<string, string> = {
    npc_name: npc.name,
    npc_title: npc.title || '',
    npc_role: npc.role,
    npc_faction: npc.faction,
    location: npc.locationId,
    time_of_day: getTimeOfDay(context.gameHour),
    region: context.regionId || 'unknown',
  };

  // const _buildContext: BuildContext = {
  //   npc,
  //   generationContext: context,
  //   variables,
  // };

  // Filter snippets by NPC compatibility
  const compatibleSnippets = filterSnippetsByNPC(snippets, npc, context);

  // Build nodes from patterns
  const nodes: DialogueNode[] = [];
  const nodeIdMap: Map<string, string> = new Map();

  // First pass: create node IDs for all patterns
  template.nodePatterns.forEach((pattern, index) => {
    const nodeId = `${template.id}_${pattern.role}_${index}`;
    nodeIdMap.set(pattern.role, nodeId);
  });

  // Second pass: build actual nodes
  template.nodePatterns.forEach((pattern, _index) => {
    const nodeId = nodeIdMap.get(pattern.role)!;

    // Find matching snippet for this node's categories
    const matchingSnippets = compatibleSnippets.filter((s) =>
      pattern.snippetCategories.includes(s.category)
    );

    // Select a snippet (or use fallback)
    const selectedSnippet = matchingSnippets.length > 0 ? rng.pick(matchingSnippets) : null;

    // Get text from snippet or use fallback
    const nodeText = selectedSnippet
      ? substituteVariables(rng.pick(selectedSnippet.textTemplates), variables)
      : getFallbackText(pattern.role, npc);

    // Build choices
    const choices: DialogueChoice[] = pattern.choicePatterns.map((choicePattern) => {
      const nextNodeId = choicePattern.nextRole
        ? nodeIdMap.get(choicePattern.nextRole) || null
        : null;

      return {
        text: substituteVariables(choicePattern.textTemplate, variables),
        nextNodeId,
        conditions: [],
        effects: [],
        tags: choicePattern.tags,
      };
    });

    const node: DialogueNode = {
      id: nodeId,
      text: nodeText,
      choices,
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [pattern.role],
    };

    nodes.push(node);
  });

  // Build dialogue tree
  const dialogueTree: DialogueTree = {
    id: `${template.id}_${npc.id}_${rng.int(0, 99999)}`,
    name: `${template.name} - ${npc.name}`,
    description: template.description,
    nodes,
    entryPoints: [
      {
        nodeId: nodes[0]?.id || '',
        conditions: template.entryConditions.map((ec) => ({
          type: ec.type as any,
          target: substituteVariables(ec.target || '', variables),
          value: ec.value,
        })),
        priority: 0,
      },
    ],
    tags: [...template.tags, npc.role, npc.faction],
  };

  return dialogueTree;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Get time of day string from hour
 */
function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Filter snippets by NPC compatibility
 */
function filterSnippetsByNPC(
  snippets: DialogueSnippet[],
  npc: NPCDefinition,
  context: GenerationContext
): DialogueSnippet[] {
  const timeOfDay = getTimeOfDay(context.gameHour);

  return snippets.filter((snippet) => {
    // Check role restrictions
    const validRoles = snippet.validRoles ?? [];
    if (validRoles.length > 0 && !validRoles.includes(npc.role)) {
      return false;
    }

    // Check faction restrictions
    const validFactions = snippet.validFactions ?? [];
    if (validFactions.length > 0 && !validFactions.includes(npc.faction)) {
      return false;
    }

    // Check time of day restrictions
    const validTimeOfDay = snippet.validTimeOfDay ?? [];
    if (validTimeOfDay.length > 0 && !validTimeOfDay.includes(timeOfDay)) {
      return false;
    }

    // Check personality requirements
    const personality = npc.personality;
    for (const [trait, minValue] of Object.entries(snippet.personalityMin ?? {})) {
      const npcValue = (personality as any)[trait];
      if (npcValue !== undefined && npcValue < minValue) {
        return false;
      }
    }
    for (const [trait, maxValue] of Object.entries(snippet.personalityMax ?? {})) {
      const npcValue = (personality as any)[trait];
      if (npcValue !== undefined && npcValue > maxValue) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Substitute {{variables}} in a string
 */
function substituteVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

/**
 * Get fallback text when no snippet matches
 */
function getFallbackText(role: string, npc: NPCDefinition): string {
  const fallbacks: Record<string, string> = {
    greeting: `${npc.name} acknowledges your presence.`,
    main: `${npc.name} considers what to say.`,
    branch: `${npc.name} pauses thoughtfully.`,
    farewell: `${npc.name} nods in farewell.`,
    quest: `${npc.name} has a proposition for you.`,
    shop: `${npc.name} gestures to their wares.`,
    rumor: `${npc.name} leans in conspiratorially.`,
  };

  return fallbacks[role] || `${npc.name} remains silent.`;
}

export type { DialogueTreeTemplate } from '../../../schemas/generation.ts';
