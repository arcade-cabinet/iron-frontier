/**
 * NPC Dialogue Schemas - Conditions, effects, choices, nodes, trees
 */

import { z } from 'zod';

// ============================================================================
// DIALOGUE CONDITIONS
// ============================================================================

export const ConditionTypeSchema = z.enum([
  'quest_active', 'quest_complete', 'quest_not_started',
  'has_item', 'lacks_item',
  'reputation_gte', 'reputation_lte',
  'gold_gte',
  'talked_to', 'not_talked_to',
  'time_of_day',
  'flag_set', 'flag_not_set',
  'first_meeting', 'return_visit',
]);
export type ConditionType = z.infer<typeof ConditionTypeSchema>;

export const DialogueConditionSchema = z.object({
  type: ConditionTypeSchema,
  target: z.string().optional(),
  value: z.number().optional(),
  stringValue: z.string().optional(),
});
export type DialogueCondition = z.infer<typeof DialogueConditionSchema>;

// ============================================================================
// DIALOGUE EFFECTS
// ============================================================================

export const DialogueEffectTypeSchema = z.enum([
  'start_quest', 'complete_quest', 'advance_quest',
  'give_item', 'take_item', 'give_gold', 'take_gold',
  'change_reputation', 'set_flag', 'clear_flag',
  'unlock_location', 'change_npc_state', 'trigger_event', 'open_shop',
]);
export type DialogueEffectType = z.infer<typeof DialogueEffectTypeSchema>;

export const DialogueEffectSchema = z.object({
  type: DialogueEffectTypeSchema,
  target: z.string().optional(),
  value: z.number().optional(),
  stringValue: z.string().optional(),
});
export type DialogueEffect = z.infer<typeof DialogueEffectSchema>;

// ============================================================================
// DIALOGUE CHOICE
// ============================================================================

export const DialogueChoiceSchema = z.object({
  text: z.string(),
  nextNodeId: z.string().nullable(),
  conditions: z.array(DialogueConditionSchema).optional(),
  effects: z.array(DialogueEffectSchema).optional(),
  tags: z.array(z.string()).optional(),
  hint: z.string().optional(),
});
export type DialogueChoice = z.infer<typeof DialogueChoiceSchema>;

// ============================================================================
// DIALOGUE NODE
// ============================================================================

export const DialogueNodeSchema = z.object({
  id: z.string(),
  text: z.string(),
  speaker: z.string().optional(),
  conditions: z.array(DialogueConditionSchema).optional(),
  choices: z.array(DialogueChoiceSchema).optional(),
  nextNodeId: z.string().nullable().optional(),
  choiceDelay: z.number().int().min(0).optional(),
  onEnterEffects: z.array(DialogueEffectSchema).optional(),
  tags: z.array(z.string()).optional(),
  expression: z.string().optional(),
});
export type DialogueNode = z.infer<typeof DialogueNodeSchema>;

// ============================================================================
// DIALOGUE TREE
// ============================================================================

export const DialogueTreeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  nodes: z.array(DialogueNodeSchema).min(1),
  entryPoints: z
    .array(z.object({
      nodeId: z.string(),
      conditions: z.array(DialogueConditionSchema).optional(),
      priority: z.number().int().optional(),
    }))
    .min(1),
  tags: z.array(z.string()).optional(),
});
export type DialogueTree = z.infer<typeof DialogueTreeSchema>;

// ============================================================================
// DIALOGUE STATE (Runtime)
// ============================================================================

export const DialogueStateSchema = z.object({
  npcId: z.string(),
  treeId: z.string(),
  currentNodeId: z.string(),
  history: z.array(z.string()).default([]),
  conversationFlags: z.record(z.string(), z.boolean()).default({}),
  startedAt: z.number(),
});
export type DialogueState = z.infer<typeof DialogueStateSchema>;
