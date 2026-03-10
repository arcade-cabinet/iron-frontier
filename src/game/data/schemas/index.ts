/**
 * Iron Frontier Schema Definitions - Barrel Export
 *
 * Re-exports all schema domains for backwards compatibility.
 */

// Hex primitives (coordinates, tile types, tile definitions)
export * from './hex-primitives.ts';

// Assemblages (reusable tile groupings)
export * from './assemblage.ts';

// Hex NPC definitions
export * from './hex-npc.ts';

// Container definitions
export * from './container.ts';

// Hex location/town maps
export * from './hex-location.ts';

// Hex region and world map
export * from './hex-region.ts';

// Hex world (top-level) and validation helpers
export * from './hex-world.ts';

// Item schemas
export * from './item.ts';

// NPC and Dialogue schemas (explicit to avoid conflicts with hex-npc re-exports)
export {
  ConditionTypeSchema,
  DialogueChoiceSchema,
  DialogueConditionSchema,
  DialogueEffectSchema,
  DialogueEffectTypeSchema,
  DialogueNodeSchema,
  DialogueStateSchema,
  DialogueTreeSchema,
  NPCDefinitionSchema,
  NPCFactionSchema,
  NPCPersonalitySchema,
  getAvailableChoices,
  getDialogueEntryNode,
  validateDialogueNode,
  validateDialogueTree,
  validateDialogueTreeIntegrity,
  validateNPCDefinition,
} from './npc.ts';
export type {
  ConditionType,
  DialogueChoice,
  DialogueCondition,
  DialogueEffect,
  DialogueEffectType,
  DialogueNode,
  DialogueState,
  DialogueTree,
  NPCDefinition,
  NPCFaction,
  NPCPersonality,
} from './npc.ts';
