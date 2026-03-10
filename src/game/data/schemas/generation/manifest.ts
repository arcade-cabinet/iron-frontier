/**
 * Generation Manifest, Validation, and Utilities
 */

import { z } from 'zod';
import type { NPCTemplate } from './npcTemplates.ts';
import type { QuestTemplate } from './npcTemplates.ts';
import type { DialogueSnippet, EncounterTemplate, LocationTemplate } from './dialogueTemplates.ts';
import type { RumorTemplate } from './economyTemplates.ts';
import type { NamePool } from './context.ts';
import { NPCTemplateSchema } from './npcTemplates.ts';
import { QuestTemplateSchema } from './npcTemplates.ts';
import { DialogueSnippetSchema, EncounterTemplateSchema, LocationTemplateSchema } from './dialogueTemplates.ts';
import { RumorTemplateSchema } from './economyTemplates.ts';
import { NamePoolSchema } from './context.ts';

// ============================================================================
// GENERATION OUTPUT MANIFEST
// ============================================================================

export const GenerationManifestSchema = z.object({
  generatedAt: z.number().int(),
  worldSeed: z.number().int(),
  schemaVersion: z.string(),
  counts: z.object({
    npcs: z.number().int().default(0),
    quests: z.number().int().default(0),
    dialogueTrees: z.number().int().default(0),
    locations: z.number().int().default(0),
    encounters: z.number().int().default(0),
    rumors: z.number().int().default(0),
    loreFragments: z.number().int().default(0),
  }),
  templatesUsed: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});
export type GenerationManifest = z.infer<typeof GenerationManifestSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateNPCTemplate(data: unknown): NPCTemplate {
  return NPCTemplateSchema.parse(data);
}

export function validateQuestTemplate(data: unknown): QuestTemplate {
  return QuestTemplateSchema.parse(data);
}

export function validateDialogueSnippet(data: unknown): DialogueSnippet {
  return DialogueSnippetSchema.parse(data);
}

export function validateLocationTemplate(data: unknown): LocationTemplate {
  return LocationTemplateSchema.parse(data);
}

export function validateEncounterTemplate(data: unknown): EncounterTemplate {
  return EncounterTemplateSchema.parse(data);
}

export function validateRumorTemplate(data: unknown): RumorTemplate {
  return RumorTemplateSchema.parse(data);
}

export function validateNamePool(data: unknown): NamePool {
  return NamePoolSchema.parse(data);
}

// ============================================================================
// UTILITY: TEMPLATE VARIABLE SUBSTITUTION
// ============================================================================

export function substituteTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match;
  });
}

export function extractTemplateVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  return [...new Set([...matches].map((m) => m[1]))];
}

export const GENERATION_SCHEMA_VERSION = '1.0.0';
