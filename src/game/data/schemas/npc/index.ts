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

// Validation & Utilities (SCHEMA_VERSION re-exported from hex-world.ts via parent barrel)
export {
  getAvailableChoices,
  getDialogueEntryNode,
  validateDialogueNode,
  validateDialogueTree,
  validateDialogueTreeIntegrity,
  validateNPCDefinition,
} from './validation.ts';
