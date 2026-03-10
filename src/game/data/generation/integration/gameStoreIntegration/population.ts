/**
 * Game Store Population - Generate and place NPCs/items for the game store
 */

import type {
  NPC,
  WorldItem,
  WorldPosition,
} from '../../../../types/engine';
import type { GenerationContext } from '../../../schemas/generation';
import type { Quest } from '../../../schemas/quest';
import {
  type GeneratedNPC,
  generateNPCsForLocation,
  type QuestGenerationContext,
  generateRandomQuest,
} from '../../generators';
import { hashString, SeededRandom } from '../../seededRandom';
import { convertGeneratedNPCToEngine, convertGeneratedQuest } from './converters.ts';

/**
 * Generate NPCs for a location
 * Returns a map of ID -> NPC to be merged into the game store
 */
export function generateLocationNPCs(
  locationId: string,
  npcs: GeneratedNPC[],
  centerPosition: WorldPosition = { x: 128, y: 0, z: 128 },
  _existingNPCs: Record<string, NPC> = {}
): Record<string, NPC> {
  const rng = new SeededRandom(hashString(locationId));
  const newNPCs: Record<string, NPC> = {};

  for (let i = 0; i < npcs.length; i++) {
    const generated = npcs[i];

    const angle = (i / npcs.length) * Math.PI * 2;
    const radius = 5 + rng.float(0, 15);
    const position: WorldPosition = {
      x: centerPosition.x + Math.cos(angle) * radius,
      y: centerPosition.y,
      z: centerPosition.z + Math.sin(angle) * radius,
    };

    const engineNPC = convertGeneratedNPCToEngine(generated, position, rng);
    newNPCs[engineNPC.id] = engineNPC;
  }

  return newNPCs;
}

/**
 * Generate items for a location
 * Returns a map of ID -> WorldItem to be merged into the game store
 */
export function generateLocationItems(
  locationId: string,
  items: Array<{
    itemId: string;
    quantity: number;
    position?: WorldPosition;
  }>,
  centerPosition: WorldPosition = { x: 128, y: 0, z: 128 },
  _existingItems: Record<string, WorldItem> = {}
): Record<string, WorldItem> {
  const rng = new SeededRandom(hashString(`${locationId}_items`));
  const newItems: Record<string, WorldItem> = {};

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const position = item.position ?? {
      x: centerPosition.x + rng.float(-20, 20),
      y: centerPosition.y,
      z: centerPosition.z + rng.float(-20, 20),
    };

    const worldItem: WorldItem = {
      id: `world_item_${locationId}_${i}_${Date.now()}`,
      itemId: item.itemId,
      position,
      quantity: item.quantity,
    };

    newItems[worldItem.id] = worldItem;
  }

  return newItems;
}

/**
 * Build generation context from game state parameters
 */
export function buildGenerationContext(
  params: {
    worldSeed: number;
    regionId?: string;
    locationId?: string;
    playerLevel: number;
    gameHour: number;
  },
  overrides: Partial<GenerationContext> = {}
): GenerationContext {
  return {
    worldSeed: params.worldSeed,
    regionId: params.regionId,
    locationId: params.locationId,
    playerLevel: params.playerLevel,
    gameHour: params.gameHour,
    factionTensions: {},
    activeEvents: [],
    contextTags: [],
    ...overrides,
  };
}

/**
 * Build quest generation context with available targets
 */
export function buildQuestGenerationContext(
  baseContext: GenerationContext,
  npcs: GeneratedNPC[] = []
): QuestGenerationContext {
  return {
    ...baseContext,
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
}

/**
 * Generate a complete location result (NPCs and Quests)
 */
export async function generateLocationContent(
  rng: SeededRandom,
  locationId: string,
  context: GenerationContext,
  options: {
    locationType?: string;
    npcCounts?: { background: number; notable: number };
    generateQuests?: boolean;
    centerPosition?: WorldPosition;
  } = {}
): Promise<{
  npcs: GeneratedNPC[];
  quests: Quest[];
  engineNPCs: Record<string, NPC>;
}> {
  const locationType = options.locationType ?? 'frontier_town';
  const npcCounts = options.npcCounts ?? { background: 3, notable: 2 };
  const centerPosition = options.centerPosition ?? { x: 128, y: 0, z: 128 };

  const npcs = generateNPCsForLocation(rng, locationType, context, npcCounts);
  const engineNPCs = generateLocationNPCs(locationId, npcs, centerPosition);

  const quests: Quest[] = [];
  if (options.generateQuests !== false) {
    const questContext = buildQuestGenerationContext(context, npcs);
    const questGivers = npcs.filter((npc) => npc.isQuestGiver);

    for (const giver of questGivers) {
      const generatedQuest = generateRandomQuest(rng, questContext, {
        id: giver.id,
        name: giver.name,
        role: giver.role,
        faction: giver.faction,
      });

      if (generatedQuest) {
        quests.push(convertGeneratedQuest(generatedQuest));
      }
    }
  }

  return { npcs, quests, engineNPCs };
}
