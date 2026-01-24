/**
 * Iron Frontier - NPC & Dialogue Schema Definitions
 *
 * These schemas define the structure for NPCs and their dialogue systems.
 * Dialogue trees support branching conversations with conditions and effects.
 *
 * Design principles:
 * - Dialogue is data, not code - all branching is declarative
 * - Conditions check game state (reputation, quests, items, etc.)
 * - Effects modify game state (start quests, give items, change reputation)
 * - NPCs reference dialogue trees by ID, not inline
 */

import { z } from 'zod';
import { HexCoordSchema } from './spatial';

// ============================================================================
// DIALOGUE CONDITIONS
// ============================================================================

/**
 * Condition types that can gate dialogue options
 */
export const ConditionTypeSchema = z.enum([
  'quest_active',      // Player has quest in progress
  'quest_complete',    // Player has completed quest
  'quest_not_started', // Player hasn't started quest
  'has_item',          // Player has specific item
  'lacks_item',        // Player doesn't have item
  'reputation_gte',    // Reputation >= threshold
  'reputation_lte',    // Reputation <= threshold
  'gold_gte',          // Gold >= amount
  'talked_to',         // Has talked to specific NPC
  'not_talked_to',     // Hasn't talked to specific NPC
  'time_of_day',       // Morning, afternoon, evening, night
  'flag_set',          // Custom flag is set
  'flag_not_set',      // Custom flag is not set
  'first_meeting',     // First time talking to this NPC
  'return_visit',      // Not first time talking
]);
export type ConditionType = z.infer<typeof ConditionTypeSchema>;

export const DialogueConditionSchema = z.object({
  type: ConditionTypeSchema,
  /** Target ID (quest, item, NPC, flag) */
  target: z.string().optional(),
  /** Numeric value for thresholds */
  value: z.number().optional(),
  /** String value for time_of_day, etc. */
  stringValue: z.string().optional(),
});
export type DialogueCondition = z.infer<typeof DialogueConditionSchema>;

// ============================================================================
// DIALOGUE EFFECTS
// ============================================================================

/**
 * Effect types that modify game state after dialogue
 */
export const EffectTypeSchema = z.enum([
  'start_quest',       // Begin a quest
  'complete_quest',    // Mark quest complete
  'advance_quest',     // Update quest progress
  'give_item',         // Give item to player
  'take_item',         // Remove item from player
  'give_gold',         // Award gold
  'take_gold',         // Charge gold
  'change_reputation', // Modify player reputation
  'set_flag',          // Set a custom flag
  'clear_flag',        // Clear a custom flag
  'unlock_location',   // Discover a location
  'change_npc_state',  // Modify NPC disposition/state
  'trigger_event',     // Trigger a world event
  'open_shop',         // Open NPC's shop for trading
]);
export type EffectType = z.infer<typeof EffectTypeSchema>;

export const DialogueEffectSchema = z.object({
  type: EffectTypeSchema,
  /** Target ID (quest, item, location, flag) */
  target: z.string().optional(),
  /** Numeric value for amounts */
  value: z.number().optional(),
  /** String value for additional data */
  stringValue: z.string().optional(),
});
export type DialogueEffect = z.infer<typeof DialogueEffectSchema>;

// ============================================================================
// DIALOGUE CHOICE
// ============================================================================

/**
 * A player choice in dialogue
 */
export const DialogueChoiceSchema = z.object({
  /** Display text for this choice */
  text: z.string(),

  /** ID of the next dialogue node (null = end conversation) */
  nextNodeId: z.string().nullable(),

  /** Conditions that must be met to show this choice */
  conditions: z.array(DialogueConditionSchema).default([]),

  /** Effects triggered when this choice is selected */
  effects: z.array(DialogueEffectSchema).default([]),

  /** Tags for filtering/styling (e.g., 'aggressive', 'kind', 'bribe') */
  tags: z.array(z.string()).default([]),

  /** Tooltip or hint text */
  hint: z.string().optional(),
});
export type DialogueChoice = z.infer<typeof DialogueChoiceSchema>;

// ============================================================================
// DIALOGUE NODE
// ============================================================================

/**
 * A single node in a dialogue tree
 */
export const DialogueNodeSchema = z.object({
  /** Unique ID within the dialogue tree */
  id: z.string(),

  /** The NPC's spoken text */
  text: z.string(),

  /** Speaker override (for cutscenes with multiple speakers) */
  speaker: z.string().optional(),

  /** Available player choices */
  choices: z.array(DialogueChoiceSchema).default([]),

  /** Auto-advance to next node (for monologues) */
  nextNodeId: z.string().nullable().default(null),

  /** Delay before showing choices (ms, for dramatic effect) */
  choiceDelay: z.number().int().min(0).default(0),

  /** Effects triggered when this node is shown */
  onEnterEffects: z.array(DialogueEffectSchema).default([]),

  /** Tags for this node (for analytics, conditionals) */
  tags: z.array(z.string()).default([]),

  /** Portrait expression override (e.g., 'angry', 'happy', 'suspicious') */
  expression: z.string().optional(),
});
export type DialogueNode = z.infer<typeof DialogueNodeSchema>;

// ============================================================================
// DIALOGUE TREE
// ============================================================================

/**
 * A complete dialogue tree for an NPC or situation
 */
export const DialogueTreeSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Human-readable name (for editors) */
  name: z.string(),

  /** Description of this dialogue's purpose */
  description: z.string().optional(),

  /** All nodes in this tree */
  nodes: z.array(DialogueNodeSchema).min(1),

  /** Entry point nodes - conditions determine which one starts */
  entryPoints: z.array(z.object({
    nodeId: z.string(),
    conditions: z.array(DialogueConditionSchema).default([]),
    priority: z.number().int().default(0),
  })).min(1),

  /** Tags for categorization */
  tags: z.array(z.string()).default([]),
});
export type DialogueTree = z.infer<typeof DialogueTreeSchema>;

// ============================================================================
// NPC PERSONALITY & APPEARANCE
// ============================================================================

export const NPCPersonalitySchema = z.object({
  /** How aggressive in conflict (0-1) */
  aggression: z.number().min(0).max(1).default(0.3),
  /** How open and warm to strangers (0-1) */
  friendliness: z.number().min(0).max(1).default(0.5),
  /** How inquisitive/nosy (0-1) */
  curiosity: z.number().min(0).max(1).default(0.5),
  /** How motivated by money (0-1) */
  greed: z.number().min(0).max(1).default(0.3),
  /** How truthful (0-1) */
  honesty: z.number().min(0).max(1).default(0.7),
  /** How law-abiding (0-1) */
  lawfulness: z.number().min(0).max(1).default(0.5),
});
export type NPCPersonality = z.infer<typeof NPCPersonalitySchema>;

export const NPCRoleSchema = z.enum([
  // Authority
  'sheriff',
  'deputy',
  'mayor',
  // Commerce
  'merchant',
  'bartender',
  'banker',
  'blacksmith',
  // Services
  'doctor',
  'preacher',
  'undertaker',
  // Labor
  'rancher',
  'miner',
  'farmer',
  'prospector',
  // Outlaws
  'outlaw',
  'gang_leader',
  'bounty_hunter',
  // Other
  'drifter',
  'gambler',
  'townsfolk',
]);
export type NPCRole = z.infer<typeof NPCRoleSchema>;

export const NPCFactionSchema = z.enum([
  'neutral',        // No strong allegiance
  'ivrc',           // Iron Valley Railroad Company
  'copperhead',     // Copperhead Gang
  'freeminer',      // Freeminer Coalition
  'remnant',        // The Remnant (automatons)
  'townsfolk',      // Local community
]);
export type NPCFaction = z.infer<typeof NPCFactionSchema>;

// ============================================================================
// NPC DEFINITION
// ============================================================================

/**
 * Complete NPC definition
 */
export const NPCDefinitionSchema = z.object({
  /** Unique identifier */
  id: z.string(),

  /** Display name */
  name: z.string(),

  /** Title/nickname (e.g., "Diamondback", "Doc") */
  title: z.string().optional(),

  /** Role determines behavior patterns */
  role: NPCRoleSchema,

  /** Faction allegiance */
  faction: NPCFactionSchema.default('neutral'),

  /** Location where this NPC is found */
  locationId: z.string(),

  /** Spawn position within location */
  spawnCoord: HexCoordSchema.optional(),

  /** Personality traits */
  personality: NPCPersonalitySchema.default({}),

  /** Physical description (for UI/portraits) */
  description: z.string().optional(),

  /** Portrait image key */
  portraitId: z.string().optional(),

  /** Dialogue tree IDs this NPC uses */
  dialogueTreeIds: z.array(z.string()).default([]),

  /** Primary dialogue tree (main conversation) */
  primaryDialogueId: z.string().optional(),

  /** Is this NPC essential (can't die) */
  essential: z.boolean().default(false),

  /** Is this NPC a quest giver */
  questGiver: z.boolean().default(false),

  /** Quest IDs this NPC can give */
  questIds: z.array(z.string()).default([]),

  /** Shop/service ID if merchant */
  shopId: z.string().optional(),

  /** Background lore */
  backstory: z.string().optional(),

  /** Relationship hints for dialogue */
  relationships: z.array(z.object({
    npcId: z.string(),
    type: z.enum(['ally', 'enemy', 'neutral', 'family', 'romantic', 'rival']),
    notes: z.string().optional(),
  })).default([]),

  /** Tags for filtering */
  tags: z.array(z.string()).default([]),
});
export type NPCDefinition = z.infer<typeof NPCDefinitionSchema>;

// ============================================================================
// DIALOGUE STATE (Runtime)
// ============================================================================

/**
 * Runtime state for active dialogue
 */
export const DialogueStateSchema = z.object({
  /** NPC we're talking to */
  npcId: z.string(),

  /** Current dialogue tree */
  treeId: z.string(),

  /** Current node in the tree */
  currentNodeId: z.string(),

  /** History of visited node IDs (for back navigation) */
  history: z.array(z.string()).default([]),

  /** Flags set during this conversation */
  conversationFlags: z.record(z.string(), z.boolean()).default({}),

  /** When dialogue started */
  startedAt: z.number(),
});
export type DialogueState = z.infer<typeof DialogueStateSchema>;

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

/**
 * Validate that all dialogue tree references are valid
 */
export function validateDialogueTreeIntegrity(tree: DialogueTree): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(tree.nodes.map(n => n.id));

  // Check entry points reference valid nodes
  for (const entry of tree.entryPoints) {
    if (!nodeIds.has(entry.nodeId)) {
      errors.push(`Entry point references unknown node: ${entry.nodeId}`);
    }
  }

  // Check all nextNodeId references
  for (const node of tree.nodes) {
    if (node.nextNodeId && !nodeIds.has(node.nextNodeId)) {
      errors.push(`Node ${node.id} references unknown next node: ${node.nextNodeId}`);
    }

    for (const choice of node.choices) {
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

/**
 * Get the starting node for a dialogue tree based on conditions
 */
export function getDialogueEntryNode(
  tree: DialogueTree,
  checkCondition: (condition: DialogueCondition) => boolean
): DialogueNode | null {
  // Sort by priority (higher first)
  const sortedEntries = [...tree.entryPoints].sort((a, b) => b.priority - a.priority);

  for (const entry of sortedEntries) {
    // Check if all conditions are met
    const allConditionsMet = entry.conditions.every(checkCondition);
    if (allConditionsMet) {
      return tree.nodes.find(n => n.id === entry.nodeId) || null;
    }
  }

  // Fall back to first entry point if no conditions match
  const fallback = sortedEntries[sortedEntries.length - 1];
  return tree.nodes.find(n => n.id === fallback?.nodeId) || null;
}

/**
 * Get available choices for a node based on conditions
 */
export function getAvailableChoices(
  node: DialogueNode,
  checkCondition: (condition: DialogueCondition) => boolean
): DialogueChoice[] {
  // Guard against undefined choices array
  if (!node.choices || !Array.isArray(node.choices)) {
    return [];
  }

  return node.choices.filter(choice => {
    // If no conditions, the choice is always available
    if (!choice.conditions || !Array.isArray(choice.conditions) || choice.conditions.length === 0) {
      return true;
    }
    return choice.conditions.every(checkCondition);
  });
}

export const SCHEMA_VERSION = '1.0.0';
