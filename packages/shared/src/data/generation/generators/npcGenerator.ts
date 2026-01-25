/**
 * NPC Generator - Procedural NPC generation from templates
 *
 * Combines NPC templates with name pools and context to create unique NPCs.
 */

import { SeededRandom } from '../seededRandom';
import {
  type NPCTemplate,
  type GenerationContext,
  type NameOrigin,
  substituteTemplate,
} from '../../schemas/generation';
import {
  generateName,
  generateNameWeighted,
  type GeneratedName,
  type NameGender,
} from './nameGenerator';

// Template registry (populated at init)
let NPC_TEMPLATES: NPCTemplate[] = [];

/**
 * Initialize NPC templates
 */
export function initNPCTemplates(templates: NPCTemplate[]): void {
  NPC_TEMPLATES = templates;
}

/**
 * Generated NPC data
 */
export interface GeneratedNPC {
  /** Unique ID */
  id: string;
  /** Full name */
  name: string;
  /** Template used */
  templateId: string;
  /** Role */
  role: string;
  /** Faction */
  faction: string;
  /** Gender */
  gender: NameGender;
  /** Name details */
  nameDetails: GeneratedName;
  /** Generated personality values */
  personality: {
    aggression: number;
    friendliness: number;
    curiosity: number;
    greed: number;
    honesty: number;
    lawfulness: number;
  };
  /** Generated backstory */
  backstory: string;
  /** Generated description */
  description: string;
  /** Is quest giver */
  isQuestGiver: boolean;
  /** Has shop */
  hasShop: boolean;
  /** Tags from template */
  tags: string[];
  /** Generation seed for reproducibility */
  seed: number;
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
    (t) =>
      t.validLocationTypes.length === 0 ||
      t.validLocationTypes.includes(locationType)
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
  const faction =
    options.forceFaction ?? npcRng.pick(template.allowedFactions);

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

/**
 * Generate multiple NPCs for a location
 */
export function generateNPCsForLocation(
  rng: SeededRandom,
  locationType: string,
  context: GenerationContext,
  counts: {
    background: number;
    notable: number;
  }
): GeneratedNPC[] {
  const validTemplates = getNPCTemplatesForLocation(locationType);
  if (validTemplates.length === 0) {
    console.warn(`No NPC templates valid for location type: ${locationType}`);
    return [];
  }

  const npcs: GeneratedNPC[] = [];
  const usedNames = new Set<string>();

  // Generate notable NPCs first (higher importance)
  const notableTemplates = validTemplates.filter((t) => t.minImportance >= 0.5);
  for (let i = 0; i < counts.notable; i++) {
    const template =
      notableTemplates.length > 0
        ? rng.pick(notableTemplates)
        : rng.pick(validTemplates);

    let npc = generateNPC(rng, template, context);

    // Ensure unique name
    let attempts = 0;
    while (usedNames.has(npc.name.toLowerCase()) && attempts < 10) {
      npc = generateNPC(rng, template, context);
      attempts++;
    }

    usedNames.add(npc.name.toLowerCase());
    npcs.push(npc);
  }

  // Generate background NPCs
  const backgroundTemplates = validTemplates.filter((t) => t.minImportance < 0.5);
  for (let i = 0; i < counts.background; i++) {
    const template =
      backgroundTemplates.length > 0
        ? rng.pick(backgroundTemplates)
        : rng.pick(validTemplates);

    let npc = generateNPC(rng, template, context);

    // Ensure unique name
    let attempts = 0;
    while (usedNames.has(npc.name.toLowerCase()) && attempts < 10) {
      npc = generateNPC(rng, template, context);
      attempts++;
    }

    usedNames.add(npc.name.toLowerCase());
    npcs.push(npc);
  }

  return npcs;
}

/**
 * Generate NPCs to fill building slots
 */
export function generateNPCsForBuilding(
  rng: SeededRandom,
  buildingType: string,
  npcSlots: Array<{ role: string; required: boolean; count: number }>,
  context: GenerationContext
): GeneratedNPC[] {
  const npcs: GeneratedNPC[] = [];

  for (const slot of npcSlots) {
    const templates = getNPCTemplatesByRole(slot.role);
    if (templates.length === 0) {
      if (slot.required) {
        console.warn(`No NPC templates for required role: ${slot.role}`);
      }
      continue;
    }

    for (let i = 0; i < slot.count; i++) {
      const template = rng.pick(templates);
      const npc = generateNPC(rng, template, context);
      npcs.push(npc);
    }
  }

  return npcs;
}
