/**
 * Location Generation Helpers - Data mappings and helper functions for location generation
 */

import type { GenerationContext } from '../../../schemas/generation';
import { SeededRandom } from '../../seededRandom';
import { generatePlaceName } from '../nameGenerator';
import { generateNPCsForLocation } from '../npcGenerator';
import {
  type GeneratedQuest,
  generateRandomQuest,
  type QuestGenerationContext,
} from '../questGenerator';
import type { GeneratedLocation } from './types.ts';

/** Size mapping for location types */
const LOCATION_SIZE_MAP: Record<string, string> = {
  frontier_town: 'large',
  mining_town: 'medium',
  cattle_town: 'medium',
  outpost: 'small',
  ranch: 'small',
  homestead: 'tiny',
};

/** NPC count configuration by location size */
const NPC_COUNTS_BY_SIZE: Record<string, { background: number; notable: number }> = {
  tiny: { background: 1, notable: 1 },
  small: { background: 3, notable: 2 },
  medium: { background: 6, notable: 4 },
  large: { background: 10, notable: 6 },
};

/** Description templates by location type */
const LOCATION_DESCRIPTIONS: Record<string, string[]> = {
  frontier_town: [
    '{name} is a bustling frontier town, where law and outlaws uneasily coexist.',
    'The town of {name} rises from the dust, a beacon of civilization in the wilderness.',
  ],
  mining_town: [
    '{name} grew up around the mines, its residents seeking fortune in the earth.',
    'The mining town of {name} echoes with the sound of picks and the dreams of prospectors.',
  ],
  outpost: [
    '{name} is little more than a few buildings and determined souls.',
    'The small outpost of {name} offers shelter to weary travelers.',
  ],
};

/**
 * Generate a single location with NPCs and quests
 */
export function generateLocationData(
  masterRng: SeededRandom,
  locationType: string,
  context: GenerationContext
): {
  location: GeneratedLocation;
  npcCount: number;
  questCount: number;
} {
  const locationSeed = masterRng.int(0, 0xffffffff);
  const locationRng = new SeededRandom(locationSeed);

  // Generate location name
  const placeName = generatePlaceName(locationRng, locationType);

  // Determine size based on type
  const size = LOCATION_SIZE_MAP[locationType] ?? 'small';

  // Generate NPCs
  const counts = NPC_COUNTS_BY_SIZE[size] ?? NPC_COUNTS_BY_SIZE.small;
  const npcs = generateNPCsForLocation(locationRng, locationType, context, counts);

  // Generate quests from quest-giving NPCs
  const quests: GeneratedQuest[] = [];
  const questGivers = npcs.filter((npc) => npc.isQuestGiver);

  for (const giver of questGivers) {
    const questContext: QuestGenerationContext = {
      ...context,
      availableNPCs: npcs.map((n) => ({
        id: n.id,
        name: n.name,
        role: n.role,
        tags: n.tags,
      })),
      availableItems: [],
      availableLocations: [],
      availableEnemies: [],
    };

    const quest = generateRandomQuest(locationRng, questContext, {
      id: giver.id,
      name: giver.name,
      role: giver.role,
      faction: giver.faction,
    });

    if (quest) {
      quests.push(quest);
    }
  }

  // Generate description
  const descTemplates = LOCATION_DESCRIPTIONS[locationType];
  let description: string;
  if (descTemplates) {
    description = locationRng.pick(descTemplates).replace('{name}', placeName.name);
  } else {
    description = `${placeName.name} awaits exploration.`;
  }

  return {
    location: {
      id: `loc_${locationSeed.toString(16)}`,
      name: placeName.name,
      type: locationType,
      size,
      description,
      npcs,
      quests,
      buildings: [],
      tags: [],
      coord: { q: 0, r: 0 },
      seed: locationSeed,
    },
    npcCount: npcs.length,
    questCount: quests.length,
  };
}
