/**
 * Location NPC Generation - Batch NPC generation for locations and buildings
 */

import type { GenerationContext } from '../../../schemas/generation';
import { SeededRandom } from '../../seededRandom';
import {
  generateNPC,
  getNPCTemplatesByRole,
  getNPCTemplatesForLocation,
} from './npcCore.ts';
import type { GeneratedNPC } from './types.ts';

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
      notableTemplates.length > 0 ? rng.pick(notableTemplates) : rng.pick(validTemplates);

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
      backgroundTemplates.length > 0 ? rng.pick(backgroundTemplates) : rng.pick(validTemplates);

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
  _buildingType: string,
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
