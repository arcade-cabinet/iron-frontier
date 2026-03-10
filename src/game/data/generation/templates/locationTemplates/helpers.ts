/**
 * Location Template Helpers
 */

import type { BuildingTemplate, LocationTemplate } from '../../../schemas/generation.ts';
import { BUILDING_TEMPLATES } from './buildings.ts';
import { LOCATION_TEMPLATES } from './locations.ts';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a building template by ID
 */
export function getBuildingTemplateById(id: string): BuildingTemplate | undefined {
  return BUILDING_TEMPLATES.find((b) => b.id === id);
}

/**
 * Get a building template by type
 */
export function getBuildingTemplateByType(type: string): BuildingTemplate | undefined {
  return BUILDING_TEMPLATES.find((b) => b.type === type);
}

/**
 * Get all building templates that fit a town size
 */
export function getBuildingTemplatesForTownSize(
  size: 'hamlet' | 'village' | 'town' | 'city'
): BuildingTemplate[] {
  const sizeOrder = ['hamlet', 'village', 'town', 'city'];
  const sizeIndex = sizeOrder.indexOf(size);
  return BUILDING_TEMPLATES.filter((b) => {
    const minIndex = sizeOrder.indexOf(b.minTownSize);
    return minIndex <= sizeIndex;
  });
}

/**
 * Get a location template by ID
 */
export function getLocationTemplateById(id: string): LocationTemplate | undefined {
  return LOCATION_TEMPLATES.find((l) => l.id === id);
}

/**
 * Get location templates by type
 */
export function getLocationTemplatesByType(type: string): LocationTemplate[] {
  return LOCATION_TEMPLATES.filter((l) => l.locationType === type);
}

/**
 * Get location templates valid for a specific biome
 */
export function getLocationTemplatesForBiome(biome: string): LocationTemplate[] {
  return LOCATION_TEMPLATES.filter((l) => {
    const validBiomes = l.validBiomes ?? [];
    return validBiomes.length === 0 || validBiomes.includes(biome);
  });
}

/**
 * Get location templates by size
 */
export function getLocationTemplatesBySize(
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge'
): LocationTemplate[] {
  return LOCATION_TEMPLATES.filter((l) => l.size === size);
}

/**
 * Get location templates with a specific tag
 */
export function getLocationTemplatesWithTag(tag: string): LocationTemplate[] {
  return LOCATION_TEMPLATES.filter((l) => (l.tags ?? []).includes(tag));
}

/**
 * Get building templates with a specific tag
 */
export function getBuildingTemplatesWithTag(tag: string): BuildingTemplate[] {
  return BUILDING_TEMPLATES.filter((b) => b.tags.includes(tag));
}

/**
 * Get all NPC roles required by a location template
 */
export function getRequiredNpcRolesForLocation(templateId: string): string[] {
  const location = getLocationTemplateById(templateId);
  if (!location) return [];

  const roles: string[] = [];
  for (const buildingRef of location.buildings ?? []) {
    const building = getBuildingTemplateById(buildingRef.templateId);
    if (building) {
      for (const slot of building.npcSlots) {
        if (slot.required && !roles.includes(slot.role)) {
          roles.push(slot.role);
        }
      }
    }
  }
  return roles;
}

/**
 * Get all possible NPC roles for a location template
 */
export function getAllNpcRolesForLocation(templateId: string): string[] {
  const location = getLocationTemplateById(templateId);
  if (!location) return [];

  const roles: string[] = [];
  for (const buildingRef of location.buildings ?? []) {
    const building = getBuildingTemplateById(buildingRef.templateId);
    if (building) {
      for (const slot of building.npcSlots) {
        if (!roles.includes(slot.role)) {
          roles.push(slot.role);
        }
      }
    }
  }
  return roles;
}

/**
 * Calculate the total NPC capacity for a location template
 */
export function getNpcCapacityForLocation(templateId: string): { min: number; max: number } {
  const location = getLocationTemplateById(templateId);
  if (!location) return { min: 0, max: 0 };

  const backgroundNpcRange = location.backgroundNpcRange ?? [0, 5];
  let minTotal = backgroundNpcRange[0];
  let maxTotal = backgroundNpcRange[1];

  // Add building NPC slots
  for (const buildingRef of location.buildings ?? []) {
    const building = getBuildingTemplateById(buildingRef.templateId);
    if (building) {
      const countRange = buildingRef.countRange ?? [1, 1];
      const buildingMin = countRange[0];
      const buildingMax = countRange[1];

      for (const slot of building.npcSlots) {
        if (slot.required) {
          minTotal += buildingMin * slot.count;
        }
        maxTotal += buildingMax * slot.count;
      }
    }
  }

  // Add notable NPCs
  const notableNpcRange = location.notableNpcRange ?? [1, 3];
  minTotal += notableNpcRange[0];
  maxTotal += notableNpcRange[1];

  return { min: minTotal, max: maxTotal };
}

// ============================================================================
// EXPORTS SUMMARY
// ============================================================================

export const BUILDING_TEMPLATE_COUNT = BUILDING_TEMPLATES.length;
export const LOCATION_TEMPLATE_COUNT = LOCATION_TEMPLATES.length;

/**
 * Quick stats about the template library
 */
export function getTemplateStats(): {
  buildings: number;
  locations: number;
  npcRoles: string[];
  biomes: string[];
  tags: string[];
} {
  const npcRoles = new Set<string>();
  const biomes = new Set<string>();
  const tags = new Set<string>();

  for (const building of BUILDING_TEMPLATES) {
    for (const slot of building.npcSlots) {
      npcRoles.add(slot.role);
    }
    for (const tag of building.tags) {
      tags.add(tag);
    }
  }

  for (const location of LOCATION_TEMPLATES) {
    for (const biome of location.validBiomes ?? []) {
      biomes.add(biome);
    }
    for (const tag of location.tags ?? []) {
      tags.add(tag);
    }
  }

  return {
    buildings: BUILDING_TEMPLATES.length,
    locations: LOCATION_TEMPLATES.length,
    npcRoles: Array.from(npcRoles).sort(),
    biomes: Array.from(biomes).sort(),
    tags: Array.from(tags).sort(),
  };
}
