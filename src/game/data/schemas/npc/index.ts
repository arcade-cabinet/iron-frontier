/**
 * NPC Schemas - Barrel export
 */

// Dialogue
export {
  ConditionTypeSchema,
  DialogueChoiceSchema,
  DialogueConditionSchema,
  DialogueEffectSchema,
  DialogueEffectTypeSchema,
  DialogueNodeSchema,
  DialogueStateSchema,
  DialogueTreeSchema,
} from './dialogue.ts';
export type {
  ConditionType,
  DialogueChoice,
  DialogueCondition,
  DialogueEffect,
  DialogueEffectType,
  DialogueNode,
  DialogueState,
  DialogueTree,
} from './dialogue.ts';

// Definition
export {
  NPCDefinitionSchema,
  NPCFactionSchema,
  NPCPersonalitySchema,
  NPCRoleSchema,
} from './definition.ts';
export type {
  NPCDefinition,
  NPCFaction,
  NPCPersonality,
  NPCRole,
} from './definition.ts';

// Validation & Utilities
export {
  getAvailableChoices,
  getDialogueEntryNode,
  SCHEMA_VERSION,
  validateDialogueNode,
  validateDialogueTree,
  validateDialogueTreeIntegrity,
  validateNPCDefinition,
} from './validation.ts';
