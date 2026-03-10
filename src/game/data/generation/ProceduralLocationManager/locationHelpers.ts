/**
 * Location Helpers - Type inference, default counts, NPC conversion, dialogue/shop gen
 */

import type { DialogueChoice, DialogueNode, DialogueTree } from '../../schemas/npc';
import type { GenerationContext } from '../../schemas/generation';
import type { LocationRef } from '../../schemas/world';
import {
  type GeneratedDialogueTree,
  generateSimpleDialogueTree,
} from '../generators/dialogueGenerator';
import {
  generateShopInventory,
  type ShopInventoryItem,
} from '../generators/itemGenerator';
import type { GeneratedNPC } from '../generators/npcGenerator';
import type { GeneratedQuest } from '../generators/questGenerator';
import { generateRandomQuest } from '../generators/questGenerator';
import { SeededRandom } from '../seededRandom';
import type { ProceduralNPC, ShopInventory } from './types.ts';

/**
 * Infer location type from LocationRef properties
 * Returns types matching NPC template validLocationTypes
 */
export function inferLocationType(ref: LocationRef): string {
  // Use explicit type if available
  if (ref.type) {
    return ref.type;
  }

  // Infer from tags
  const tags = ref.tags || [];
  if (tags.includes('city')) return 'city';
  if (tags.includes('town')) return 'town';
  if (tags.includes('mine') || tags.includes('mining')) return 'mine';
  if (tags.includes('ranch') || tags.includes('cattle')) return 'ranch';
  if (tags.includes('outpost')) return 'outpost';
  if (tags.includes('camp')) return 'camp';
  if (tags.includes('ruin') || tags.includes('abandoned')) return 'ruin';

  // Default based on name patterns
  const name = ref.name.toLowerCase();
  if (name.includes('mine')) return 'mine';
  if (name.includes('ranch')) return 'ranch';
  if (name.includes('camp')) return 'camp';
  if (name.includes('station')) return 'outpost';

  return 'town'; // Default
}

/**
 * Get default NPC counts for a location type
 */
export function getDefaultNPCCounts(
  locationType: string
): { background: number; notable: number } {
  const counts: Record<string, { background: number; notable: number }> = {
    city: { background: 12, notable: 6 },
    town: { background: 8, notable: 4 },
    mine: { background: 6, notable: 3 },
    ranch: { background: 5, notable: 3 },
    outpost: { background: 3, notable: 2 },
    camp: { background: 2, notable: 1 },
    ruin: { background: 1, notable: 0 },
  };
  return counts[locationType] ?? { background: 4, notable: 2 };
}

/**
 * Get default item count for a location type
 */
export function getDefaultItemCount(locationType: string): number {
  const counts: Record<string, number> = {
    city: 12,
    town: 8,
    mine: 10,
    ranch: 6,
    outpost: 4,
    camp: 3,
    ruin: 12, // More loot in ruins
  };
  return counts[locationType] ?? 5;
}

/**
 * Convert GeneratedNPC to ProceduralNPC with spawn coordinates
 */
export function convertToProceduralNPCs(
  generated: GeneratedNPC[],
  locationId: string,
  _rng: SeededRandom
): ProceduralNPC[] {
  return generated.map((npc, index) => {
    // Simple spiral placement for NPCs
    const angle = (index / generated.length) * Math.PI * 2;
    const radius = 2 + Math.floor(index / 8) * 2;
    const q = Math.round(Math.cos(angle) * radius);
    const r = Math.round(Math.sin(angle) * radius);

    return {
      id: npc.id,
      name: npc.name,
      title: npc.nameDetails.nickname || undefined,
      role: npc.role as any,
      faction: npc.faction as any,
      locationId,
      spawnCoord: { q, r },
      personality: {
        aggression: npc.personality.aggression,
        friendliness: npc.personality.friendliness,
        curiosity: npc.personality.curiosity,
        greed: npc.personality.greed,
        honesty: npc.personality.honesty,
        lawfulness: npc.personality.lawfulness,
      },
      description: npc.description,
      backstory: npc.backstory,
      dialogueTreeIds: [`proc_dialogue_${npc.id}`],
      primaryDialogueId: `proc_dialogue_${npc.id}`,
      essential: false,
      questGiver: npc.isQuestGiver,
      questIds: [],
      shopId: npc.hasShop ? `proc_shop_${npc.id}` : undefined,
      tags: npc.tags,
      relationships: [],
      isProcedural: true as const,
      generated: npc,
    };
  });
}

/**
 * Generate dialogue tree for a procedural NPC
 */
export function generateNPCDialogue(
  rng: SeededRandom,
  npc: ProceduralNPC,
  context: GenerationContext
): DialogueTree | null {
  try {
    const generatedTree = generateSimpleDialogueTree(rng, npc.generated, context, {
      includeRumors: true,
      includeQuest: npc.questGiver,
      includeShop: !!npc.shopId,
    });

    return convertToDialogueTree(generatedTree, npc);
  } catch (err) {
    console.warn(
      `[ProceduralLocationManager] Failed to generate dialogue for ${npc.id}:`,
      err
    );
    return null;
  }
}

/**
 * Convert GeneratedDialogueTree to DialogueTree schema format
 */
function convertToDialogueTree(
  generated: GeneratedDialogueTree,
  npc: ProceduralNPC
): DialogueTree {
  const nodes: DialogueNode[] = [];
  for (const [, genNode] of generated.nodes) {
    const choices: DialogueChoice[] = genNode.choices.map((choice) => ({
      text: choice.text,
      nextNodeId: choice.nextNodeId,
      conditions: [],
      effects: choice.tags.includes('open_shop')
        ? [{ type: 'open_shop' as const, target: npc.shopId }]
        : [],
      tags: choice.tags,
    }));

    nodes.push({
      id: genNode.id,
      text: genNode.speakerText,
      speaker: genNode.speakerName,
      conditions: [],
      choices,
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: genNode.tags,
    });
  }

  return {
    id: `proc_dialogue_${npc.id}`,
    name: `${npc.name} Dialogue`,
    description: `Procedurally generated dialogue for ${npc.name}`,
    nodes,
    entryPoints: [
      {
        nodeId: generated.rootNodeId,
        conditions: [],
        priority: 0,
      },
    ],
    tags: ['procedural', ...generated.tags],
  };
}

/**
 * Generate shop inventory for a merchant NPC
 */
export function generateShopForNPC(
  rng: SeededRandom,
  npc: ProceduralNPC,
  _locationType: string
): ShopInventory {
  const shopTypeByRole: Record<string, string> = {
    merchant: 'general_store',
    bartender: 'saloon',
    blacksmith: 'blacksmith',
    gunsmith: 'gunsmith',
    doctor: 'apothecary',
  };
  const shopType = shopTypeByRole[npc.role] || 'general_store';

  const generatedItems: ShopInventoryItem[] = generateShopInventory(rng, shopType, 1);

  return {
    npcId: npc.id,
    shopType,
    items: generatedItems.map((item) => ({
      itemId: item.item.id,
      stock: item.quantity,
      basePrice: item.buyPrice,
    })),
    priceModifier: 1.0 + rng.float(-0.1, 0.2),
    canBuy: true,
    canSell: true,
  };
}

/**
 * Generate quests from quest-giving NPCs
 */
export function generateLocationQuests(
  rng: SeededRandom,
  npcs: ProceduralNPC[],
  context: GenerationContext
): GeneratedQuest[] {
  const quests: GeneratedQuest[] = [];
  const questGivers = npcs.filter((npc) => npc.questGiver);

  for (const giver of questGivers) {
    try {
      const quest = generateRandomQuest(
        rng,
        {
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
        },
        {
          id: giver.id,
          name: giver.name,
          role: giver.role,
          faction: giver.faction,
        }
      );

      if (quest) {
        quests.push(quest);
      }
    } catch (err) {
      console.warn(
        `[ProceduralLocationManager] Failed to generate quest for ${giver.id}:`,
        err
      );
    }
  }

  return quests;
}
