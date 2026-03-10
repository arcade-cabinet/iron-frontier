/**
 * NPC Template Helpers - Registry and lookup functions
 */

import type { NPCTemplate } from '../../../schemas/generation.ts';
import { SheriffTemplate, DeputyTemplate, MayorTemplate, JudgeTemplate, BankerTemplate } from './officials.ts';
import { SaloonKeeperTemplate, GeneralStoreOwnerTemplate, GunsmithTemplate, BlacksmithTemplate, DoctorTemplate, UndertakerTemplate, HotelOwnerTemplate, StableMasterTemplate } from './business.ts';
import { BartenderTemplate, RanchHandTemplate, MinerTemplate, RailroadWorkerTemplate, TelegraphOperatorTemplate } from './workers.ts';
import { BanditLeaderTemplate, GangMemberTemplate, RustlerTemplate, FenceTemplate, GamblerTemplate } from './outlaws.ts';
import { PreacherTemplate, ProspectorTemplate, BountyHunterTemplate, DrifterTemplate, HomesteaderTemplate, WidowTemplate, WidowerTemplate } from './other.ts';

export const NPC_TEMPLATES: NPCTemplate[] = [
  // Town Officials
  SheriffTemplate,
  DeputyTemplate,
  MayorTemplate,
  JudgeTemplate,
  BankerTemplate,

  // Business Owners
  SaloonKeeperTemplate,
  GeneralStoreOwnerTemplate,
  GunsmithTemplate,
  BlacksmithTemplate,
  DoctorTemplate,
  UndertakerTemplate,
  HotelOwnerTemplate,
  StableMasterTemplate,

  // Workers
  BartenderTemplate,
  RanchHandTemplate,
  MinerTemplate,
  RailroadWorkerTemplate,
  TelegraphOperatorTemplate,

  // Outlaws
  BanditLeaderTemplate,
  GangMemberTemplate,
  RustlerTemplate,
  FenceTemplate,
  GamblerTemplate,

  // Other
  PreacherTemplate,
  ProspectorTemplate,
  BountyHunterTemplate,
  DrifterTemplate,
  HomesteaderTemplate,
  WidowTemplate,
  WidowerTemplate,
];

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/** Map of template ID to template for quick lookup */
const TEMPLATES_BY_ID = new Map<string, NPCTemplate>(NPC_TEMPLATES.map((t) => [t.id, t]));

/** Map of role to templates for role-based lookup */
const TEMPLATES_BY_ROLE = new Map<string, NPCTemplate[]>();
for (const template of NPC_TEMPLATES) {
  const existing = TEMPLATES_BY_ROLE.get(template.role) || [];
  existing.push(template);
  TEMPLATES_BY_ROLE.set(template.role, existing);
}

/**
 * Get an NPC template by its unique ID
 */
export function getNPCTemplate(id: string): NPCTemplate | undefined {
  return TEMPLATES_BY_ID.get(id);
}

/**
 * Get all NPC templates for a given role
 */
export function getNPCTemplatesByRole(role: string): NPCTemplate[] {
  return TEMPLATES_BY_ROLE.get(role) || [];
}

/**
 * Get NPC templates filtered by tags
 */
export function getNPCTemplatesByTag(tag: string): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.tags.includes(tag));
}

/**
 * Get NPC templates valid for a specific location type
 */
export function getNPCTemplatesByLocationType(locationType: string): NPCTemplate[] {
  return NPC_TEMPLATES.filter(
    (t) => t.validLocationTypes.length === 0 || t.validLocationTypes.includes(locationType)
  );
}

/**
 * Get NPC templates that can give quests
 */
export function getQuestGiverTemplates(): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.questGiverChance > 0);
}

/**
 * Get NPC templates that can have shops
 */
export function getMerchantTemplates(): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.shopChance > 0);
}

/**
 * Get NPC templates by minimum importance
 */
export function getNPCTemplatesByImportance(minImportance: number): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.minImportance >= minImportance);
}

/**
 * Get NPC templates allowed for a specific faction
 */
export function getNPCTemplatesByFaction(faction: string): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.allowedFactions.includes(faction));
}

// ============================================================================
// INDIVIDUAL EXPORTS
// ============================================================================

export {
  SheriffTemplate,
  DeputyTemplate,
  MayorTemplate,
  JudgeTemplate,
  BankerTemplate,
  SaloonKeeperTemplate,
  GeneralStoreOwnerTemplate,
  GunsmithTemplate,
  BlacksmithTemplate,
  DoctorTemplate,
  UndertakerTemplate,
  HotelOwnerTemplate,
  StableMasterTemplate,
  BartenderTemplate,
  RanchHandTemplate,
  MinerTemplate,
  RailroadWorkerTemplate,
  TelegraphOperatorTemplate,
  BanditLeaderTemplate,
  GangMemberTemplate,
  RustlerTemplate,
  FenceTemplate,
  GamblerTemplate,
  PreacherTemplate,
  ProspectorTemplate,
  BountyHunterTemplate,
  DrifterTemplate,
  HomesteaderTemplate,
  WidowTemplate,
  WidowerTemplate,
};
