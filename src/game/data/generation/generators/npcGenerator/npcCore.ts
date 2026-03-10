/**
 * NPC Core - NPC generation logic from templates
 */

import {
  type GenerationContext,
  type NameOrigin,
  type NPCTemplate,
  substituteTemplate,
} from '../../../schemas/generation';
import { SeededRandom } from '../../seededRandom';
import { generateNameWeighted, type NameGender } from '../nameGenerator';
import type { GeneratedNPC } from './types.ts';

// Template registry (populated at init)
let NPC_TEMPLATES: NPCTemplate[] = [];

/**
 * Initialize NPC templates
 */
export function initNPCTemplates(templates: NPCTemplate[]): void {
  NPC_TEMPLATES = templates;
}

/**
 * Get NPC template by ID
 */
export function getNPCTemplate(id: string): NPCTemplate | undefined {
  return NPC_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get NPC templates by role
 */
export function getNPCTemplatesByRole(role: string): NPCTemplate[] {
  return NPC_TEMPLATES.filter((t) => t.role === role);
}

/**
 * Get NPC templates valid for a location type
 */
export function getNPCTemplatesForLocation(locationType: string): NPCTemplate[] {
  return NPC_TEMPLATES.filter(
    (t) => t.validLocationTypes.length === 0 || t.validLocationTypes.includes(locationType)
  );
}

/**
 * Generate a random value within a range
 */
function randomInRange(rng: SeededRandom, range: [number, number]): number {
  return rng.float(range[0], range[1]);
}

/**
 * Generate an NPC from a template
 */
export function generateNPC(
  rng: SeededRandom,
  template: NPCTemplate,
  context: GenerationContext,
  options: {
    forceGender?: NameGender;
    forceFaction?: string;
    overrides?: Partial<GeneratedNPC>;
  } = {}
): GeneratedNPC {
  // Create child RNG for this NPC
  const npcSeed = rng.int(0, 0xffffffff);
  const npcRng = new SeededRandom(npcSeed);

  // Determine gender from distribution
  const genderRoll = npcRng.random();
  const [maleChance, femaleChance] = template.genderDistribution;
  let gender: NameGender;
  if (options.forceGender) {
    gender = options.forceGender;
  } else if (genderRoll < maleChance) {
    gender = 'male';
  } else if (genderRoll < maleChance + femaleChance) {
    gender = 'female';
  } else {
    gender = 'neutral';
  }

  // Generate name from weighted origins
  const nameDetails = generateNameWeighted(
    npcRng,
    template.nameOrigins as Array<{ origin: NameOrigin; weight: number }>,
    gender,
    {
      includeNickname: npcRng.bool(0.3),
      includeTitle: template.minImportance > 0.5,
    }
  );

  // Select faction
  const faction = options.forceFaction ?? npcRng.pick(template.allowedFactions);

  // Generate personality values within template ranges
  const defaultRanges: Record<string, [number, number]> = {
    aggression: [0.2, 0.5],
    friendliness: [0.3, 0.7],
    curiosity: [0.3, 0.7],
    greed: [0.2, 0.5],
    honesty: [0.4, 0.8],
    lawfulness: [0.3, 0.7],
  };

  const getRange = (key: keyof typeof defaultRanges): [number, number] => {
    const range = template.personality[key as keyof typeof template.personality];
    if (range && Array.isArray(range) && range.length >= 2) {
      return [range[0], range[1]];
    }
    return defaultRanges[key];
  };

  const personality = {
    aggression: randomInRange(npcRng, getRange('aggression')),
    friendliness: randomInRange(npcRng, getRange('friendliness')),
    curiosity: randomInRange(npcRng, getRange('curiosity')),
    greed: randomInRange(npcRng, getRange('greed')),
    honesty: randomInRange(npcRng, getRange('honesty')),
    lawfulness: randomInRange(npcRng, getRange('lawfulness')),
  };

  // Build template variables
  const templateVars: Record<string, string> = {
    name: nameDetails.fullName,
    firstName: nameDetails.firstName,
    lastName: nameDetails.lastName,
    nickname: nameDetails.nickname ?? nameDetails.firstName,
    title: nameDetails.title ?? '',
    role: template.role,
    faction: faction,
    gender: gender,
    pronoun: gender === 'male' ? 'he' : gender === 'female' ? 'she' : 'they',
    possessive: gender === 'male' ? 'his' : gender === 'female' ? 'her' : 'their',
    location: context.locationId ?? 'the frontier',
    region: context.regionId ?? 'these parts',
  };

  // Generate backstory
  let backstory = '';
  if (template.backstoryTemplates.length > 0) {
    const backstoryTemplate = npcRng.pick(template.backstoryTemplates);
    backstory = substituteTemplate(backstoryTemplate, templateVars);
  }

  // Generate description
  let description = '';
  if (template.descriptionTemplates.length > 0) {
    const descTemplate = npcRng.pick(template.descriptionTemplates);
    description = substituteTemplate(descTemplate, templateVars);
  }

  // Determine if quest giver
  const isQuestGiver = npcRng.bool(template.questGiverChance);

  // Determine if has shop
  const hasShop = npcRng.bool(template.shopChance);

  // Generate unique ID
  const id = `npc_${template.id}_${npcSeed.toString(16)}`;

  const generated: GeneratedNPC = {
    id,
    name: nameDetails.fullName,
    templateId: template.id,
    role: template.role,
    faction,
    gender,
    nameDetails,
    personality,
    backstory,
    description,
    isQuestGiver,
    hasShop,
    tags: [...template.tags],
    seed: npcSeed,
    ...options.overrides,
  };

  return generated;
}
