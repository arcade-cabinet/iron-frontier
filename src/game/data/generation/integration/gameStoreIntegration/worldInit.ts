/**
 * World Initialization - Procedural world state management and triggers
 */

import type { GenerationContext } from '../../../schemas/generation';
import type { Quest } from '../../../schemas/quest';
import {
  type GeneratedEncounter,
  type GeneratedNPC,
  generateRandomEncounter,
  generateRandomQuest,
  generateSimpleDialogueTree,
  shouldTriggerEncounter,
} from '../../generators';
import { type GeneratedLocation, WorldGenerator } from '../../generators/worldGenerator';
import { combineSeeds, hashString, SeededRandom } from '../../seededRandom';
import { convertGeneratedDialogue, convertGeneratedQuest } from './converters.ts';
import { buildGenerationContext, buildQuestGenerationContext, generateLocationContent } from './population.ts';
import type { DialogueTree } from '../../../schemas/npc';

/**
 * Generate a quest from a specific NPC
 */
export function generateQuestForGiver(
  rng: SeededRandom,
  giverId: string,
  giverName: string,
  giverRole: string,
  giverFaction: string,
  context: GenerationContext
): Quest | null {
  const questContext = buildQuestGenerationContext(context);

  const generatedQuest = generateRandomQuest(rng, questContext, {
    id: giverId,
    name: giverName,
    role: giverRole,
    faction: giverFaction,
  });

  if (!generatedQuest) {
    return null;
  }

  return convertGeneratedQuest(generatedQuest);
}

/**
 * Check and trigger a random encounter
 */
export function generateRandomEncounterCheck(
  rng: SeededRandom,
  context: GenerationContext,
  options: {
    biome?: string;
    locationType?: string;
    minDifficulty?: number;
    maxDifficulty?: number;
    baseChance?: number;
  } = {}
): GeneratedEncounter | null {
  if (!shouldTriggerEncounter(rng, context, options.baseChance)) {
    return null;
  }

  const encounter = generateRandomEncounter(rng, context, options);
  return encounter;
}

/**
 * Generate dialogue for an NPC dynamically
 */
export function generateNPCDialogue(
  npc: GeneratedNPC,
  context: GenerationContext,
  options: {
    includeRumors?: boolean;
    includeQuest?: boolean;
    includeShop?: boolean;
  } = {}
): DialogueTree {
  const rng = new SeededRandom(hashString(`${npc.id}_dialogue`));

  const generatedTree = generateSimpleDialogueTree(rng, npc, context, {
    includeRumors: options.includeRumors ?? true,
    includeQuest: options.includeQuest ?? npc.isQuestGiver,
    includeShop: options.includeShop ?? npc.hasShop,
  });

  return convertGeneratedDialogue(generatedTree);
}

// ============================================================================
// WORLD INITIALIZATION
// ============================================================================

/**
 * Procedural world state tracker
 */
export interface ProceduralWorldState {
  worldSeed: number;
  worldName: string;
  generatedLocations: Map<string, GeneratedLocation>;
  generatedQuests: Map<string, Quest>;
  initialized: boolean;
}

// Global procedural world state
let proceduralWorldState: ProceduralWorldState | null = null;

/**
 * Get current procedural world state
 */
export function getProceduralWorldState(): ProceduralWorldState | null {
  return proceduralWorldState;
}

/**
 * Initialize a procedural world
 */
export async function initializeProceduralWorld(
  worldSeed: number,
  options: {
    worldName?: string;
    regionCount?: number;
    locationsPerRegion?: [number, number];
    namePools?: Parameters<typeof WorldGenerator.prototype.initialize>[0];
    placeNamePools?: Parameters<typeof WorldGenerator.prototype.initialize>[1];
    npcTemplates?: Parameters<typeof WorldGenerator.prototype.initialize>[2];
    questTemplates?: Parameters<typeof WorldGenerator.prototype.initialize>[3];
  } = {}
): Promise<ProceduralWorldState> {
  const worldName = options.worldName ?? 'Iron Frontier';

  const generator = new WorldGenerator({
    seed: worldSeed,
    worldName,
    regionCount: options.regionCount ?? 1,
    locationsPerRegion: options.locationsPerRegion ?? [3, 5],
  });

  if (
    options.namePools &&
    options.placeNamePools &&
    options.npcTemplates &&
    options.questTemplates
  ) {
    await generator.initialize(
      options.namePools,
      options.placeNamePools,
      options.npcTemplates,
      options.questTemplates
    );
  }

  proceduralWorldState = {
    worldSeed,
    worldName,
    generatedLocations: new Map(),
    generatedQuests: new Map(),
    initialized: generator.isInitialized(),
  };

  return proceduralWorldState;
}

/**
 * Regenerate a specific location
 */
export async function regenerateLocation(
  locationId: string,
  worldSeed: number,
  options: {
    locationType?: string;
    npcCounts?: { background: number; notable: number };
  } = {}
): Promise<{
  npcs: GeneratedNPC[];
  quests: Quest[];
  engineNPCs: Record<string, import('../../../../types/engine').NPC>;
}> {
  const locationSeed = combineSeeds(worldSeed, hashString(locationId));
  const rng = new SeededRandom(locationSeed);

  const context = buildGenerationContext({
    locationId,
    worldSeed: worldSeed,
    playerLevel: 1,
    gameHour: 12,
  });

  return generateLocationContent(rng, locationId, context, options);
}
