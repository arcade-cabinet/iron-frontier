/**
 * ProceduralLocationManager - Content generation logic
 *
 * Core generation method that creates NPCs, items, dialogue, shops, and quests for a location.
 */

import type { WorldItemSpawn } from '../../items/worldItems';
import type { GenerationContext } from '../../schemas/generation';
import type { DialogueTree } from '../../schemas/npc';
import type { ResolvedLocation } from '../../worlds/WorldLoader';
import { generateNPCsForLocation } from '../generators/npcGenerator';
import { combineSeeds, hashString, SeededRandom } from '../seededRandom';
import { generateWorldItems } from './itemPools.ts';
import {
  convertToProceduralNPCs,
  generateLocationQuests,
  generateNPCDialogue,
  generateShopForNPC,
  getDefaultItemCount,
  getDefaultNPCCounts,
  inferLocationType,
} from './locationHelpers.ts';
import type {
  ProceduralLocationContent,
  ProceduralNPC,
  ShopInventory,
} from './types.ts';

/**
 * Generate all procedural content for a location.
 */
export function generateContentForLocation(
  resolved: ResolvedLocation & { _regionId?: string },
  worldSeed: number,
  options: {
    npcCount?: { background: number; notable: number };
    itemCount?: number;
  } = {}
): ProceduralLocationContent {
  const locationId = resolved.ref.id;
  const locationSeed = combineSeeds(worldSeed, hashString(locationId));

  const rng = new SeededRandom(locationSeed);
  const locationType = inferLocationType(resolved.ref);
  const regionId = resolved._regionId ?? 'unknown';

  const context: GenerationContext = {
    worldSeed,
    locationId,
    regionId,
    playerLevel: 1,
    gameHour: 12,
    factionTensions: {},
    activeEvents: [],
    contextTags: resolved.ref.tags || [],
  };

  const defaultCounts = getDefaultNPCCounts(locationType);
  const npcCounts = options.npcCount || defaultCounts;

  // Generate NPCs
  const generatedNPCs = generateNPCsForLocation(
    rng,
    locationType,
    context,
    npcCounts
  );
  const npcs = convertToProceduralNPCs(generatedNPCs, locationId, rng);

  // Generate world items
  const itemCount =
    options.itemCount ?? getDefaultItemCount(locationType);
  const worldItems = generateWorldItems(rng, locationId, locationType, itemCount);

  // Generate dialogue trees for NPCs
  const dialogueTrees = new Map<string, DialogueTree>();
  for (const npc of npcs) {
    const tree = generateNPCDialogue(rng, npc, context);
    if (tree) {
      dialogueTrees.set(npc.id, tree);
    }
  }

  // Generate shop inventories for merchant NPCs
  const shopInventories = new Map<string, ShopInventory>();
  for (const npc of npcs) {
    if (npc.generated.hasShop) {
      const inventory = generateShopForNPC(rng, npc, locationType);
      shopInventories.set(npc.id, inventory);
    }
  }

  // Generate quests
  const quests = generateLocationQuests(rng, npcs, context);

  // Structure states (lazily populated)
  const structureStates = new Map<string, 'functional' | 'broken' | 'locked'>();

  return {
    locationId,
    seed: locationSeed,
    generatedAt: Date.now(),
    npcs,
    worldItems,
    dialogueTrees,
    shopInventories,
    quests,
    structureStates,
  };
}
