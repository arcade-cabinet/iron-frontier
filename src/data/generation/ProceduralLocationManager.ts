/**
 * ProceduralLocationManager - Central orchestrator for procedural content generation
 *
 * Bridges the procedural generation system with the existing location/NPC/item infrastructure.
 * Generates and caches content for procedural locations, ensuring deterministic results
 * when given the same seed.
 *
 * Design:
 * - Singleton pattern for global cache access
 * - Lazy generation: content is generated on first access
 * - Seed-based determinism: same locationId + worldSeed = same content
 * - Compatible with existing data structures (NPCDefinition, WorldItemSpawn, etc.)
 */

// Integration
import { ITEM_LIBRARY } from '../items';
import type { WorldItemSpawn } from '../items/worldItems';
import type { GenerationContext } from '../schemas/generation';
import type { DialogueChoice, DialogueNode, DialogueTree, NPCDefinition } from '../schemas/npc';
import type { HexCoord } from '../schemas/spatial';
import type { LocationRef } from '../schemas/world';
import type { ResolvedLocation } from '../worlds/WorldLoader';
import {
  type GeneratedDialogueTree,
  generateSimpleDialogueTree,
  initDialogueData,
} from './generators/dialogueGenerator';
import {
  generateShopInventory,
  initItemGeneration,
  type ShopInventoryItem,
} from './generators/itemGenerator';
import { initNamePools } from './generators/nameGenerator';
import {
  type GeneratedNPC,
  generateNPCsForLocation,
  initNPCTemplates,
} from './generators/npcGenerator';
import {
  type GeneratedQuest,
  generateRandomQuest,
  initQuestTemplates,
} from './generators/questGenerator';
import { convertItemsToTemplates } from './integration/itemIntegration';
import { DIALOGUE_SNIPPETS } from './pools/dialogueSnippets';

// Import templates and pools
import { NAME_POOLS, PLACE_NAME_POOLS } from './pools/index';
import { combineSeeds, hashString, SeededRandom } from './seededRandom';
import { DIALOGUE_TREE_TEMPLATES } from './templates/dialogueTreeTemplates';
import { NPC_TEMPLATES, QUEST_TEMPLATES } from './templates/index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Generated content for a procedural location
 */
export interface ProceduralLocationContent {
  locationId: string;
  seed: number;
  generatedAt: number;

  /** Generated NPCs with positions */
  npcs: ProceduralNPC[];

  /** Generated world items with positions */
  worldItems: WorldItemSpawn[];

  /** Generated dialogue trees keyed by NPC ID */
  dialogueTrees: Map<string, DialogueTree>;

  /** Generated shop inventories keyed by NPC ID */
  shopInventories: Map<string, ShopInventory>;

  /** Generated quests for this location */
  quests: GeneratedQuest[];

  /** Structure states (broken/locked) keyed by hex coordinate key */
  structureStates: Map<string, 'functional' | 'broken' | 'locked'>;
}

/**
 * Procedural NPC with spawn position (extends NPCDefinition)
 */
export interface ProceduralNPC extends Omit<NPCDefinition, 'spawnCoord'> {
  /** Indicates this is a procedural NPC */
  isProcedural: true;
  /** Generation data */
  generated: GeneratedNPC;
  /** Spawn coordinate */
  spawnCoord: HexCoord;
}

/**
 * Shop inventory for procedural merchants
 */
export interface ShopInventory {
  npcId: string;
  shopType: string;
  items: ShopItem[];
  priceModifier: number;
  canBuy: boolean;
  canSell: boolean;
}

export interface ShopItem {
  itemId: string;
  stock: number;
  basePrice: number;
}

// ============================================================================
// PROCEDURAL LOCATION MANAGER
// ============================================================================

class ProceduralLocationManagerClass {
  private initialized = false;
  private worldSeed: number = 0;

  /** Cache of generated content by locationId */
  private cache: Map<string, ProceduralLocationContent> = new Map();

  /** NPC cache for quick lookup */
  private npcCache: Map<string, ProceduralNPC[]> = new Map();

  /** Item cache for quick lookup */
  private itemCache: Map<string, WorldItemSpawn[]> = new Map();

  /**
   * Initialize the manager with the world seed and load templates
   */
  initialize(worldSeed: number): void {
    if (this.initialized && this.worldSeed === worldSeed) {
      return; // Already initialized with this seed
    }

    console.log(`[ProceduralLocationManager] Initializing with seed: ${worldSeed}`);

    this.worldSeed = worldSeed;
    this.cache.clear();
    this.npcCache.clear();
    this.itemCache.clear();

    // Initialize all generators with templates/pools
    initNamePools(NAME_POOLS, PLACE_NAME_POOLS);
    initNPCTemplates(NPC_TEMPLATES);
    initQuestTemplates(QUEST_TEMPLATES);
    initDialogueData(DIALOGUE_SNIPPETS, Object.values(DIALOGUE_TREE_TEMPLATES));

    // Register items
    const itemTemplates = convertItemsToTemplates(Object.values(ITEM_LIBRARY));
    initItemGeneration(itemTemplates);

    this.initialized = true;
    console.log('[ProceduralLocationManager] Initialized successfully');
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the current world seed
   */
  getWorldSeed(): number {
    return this.worldSeed;
  }

  /**
   * Clear all caches (useful for new game)
   */
  clearCache(): void {
    this.cache.clear();
    this.npcCache.clear();
    this.itemCache.clear();
    console.log('[ProceduralLocationManager] Cache cleared');
  }

  /**
   * Generate content for a procedural location
   */
  generateLocationContent(
    resolved: ResolvedLocation,
    options: {
      npcCount?: { background: number; notable: number };
      itemCount?: number;
    } = {}
  ): ProceduralLocationContent {
    if (!this.initialized) {
      throw new Error('ProceduralLocationManager not initialized. Call initialize() first.');
    }

    const locationId = resolved.ref.id;
    const locationSeed = combineSeeds(this.worldSeed, hashString(locationId));

    // Check cache first
    const cached = this.cache.get(locationId);
    if (cached && cached.seed === locationSeed) {
      console.log(`[ProceduralLocationManager] Using cached content for: ${locationId}`);
      return cached;
    }

    console.log(`[ProceduralLocationManager] Generating content for: ${locationId}`);

    const rng = new SeededRandom(locationSeed);
    const locationType = this.inferLocationType(resolved.ref);

    // Create generation context
    const context: GenerationContext = {
      worldSeed: this.worldSeed,
      locationId,
      regionId: 'unknown', // Region determined at world level, not location level
      playerLevel: 1, // Default, could be passed in
      gameHour: 12,
      factionTensions: {},
      activeEvents: [],
      contextTags: resolved.ref.tags || [],
    };

    // Default NPC counts based on location type
    const defaultCounts = this.getDefaultNPCCounts(locationType);
    const npcCounts = options.npcCount || defaultCounts;

    // Generate NPCs
    const generatedNPCs = generateNPCsForLocation(rng, locationType, context, npcCounts);
    const npcs = this.convertToProceduralNPCs(generatedNPCs, locationId, rng);

    // Generate world items
    const itemCount = options.itemCount ?? this.getDefaultItemCount(locationType);
    const worldItems = this.generateWorldItems(rng, locationId, locationType, itemCount);

    // Generate dialogue trees for NPCs
    const dialogueTrees = new Map<string, DialogueTree>();
    for (const npc of npcs) {
      const tree = this.generateNPCDialogue(rng, npc, context);
      if (tree) {
        dialogueTrees.set(npc.id, tree);
      }
    }

    // Generate shop inventories for merchant NPCs
    const shopInventories = new Map<string, ShopInventory>();
    for (const npc of npcs) {
      if (npc.generated.hasShop) {
        const inventory = this.generateShopForNPC(rng, npc, locationType);
        shopInventories.set(npc.id, inventory);
      }
    }

    // Generate quests
    const quests = this.generateLocationQuests(rng, npcs, context);

    // Generate structure states
    const structureStates = new Map<string, 'functional' | 'broken' | 'locked'>();
    // We don't know exact building locations here without running HexMapGenerator,
    // so we'll lazily generate them when requested or generate a "broken map" based on noise.
    // For now, empty map, populated on demand.

    const content: ProceduralLocationContent = {
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

    // Cache the content
    this.cache.set(locationId, content);
    this.npcCache.set(locationId, npcs);
    this.itemCache.set(locationId, worldItems);

    console.log(
      `[ProceduralLocationManager] Generated: ${npcs.length} NPCs, ${worldItems.length} items, ${quests.length} quests`
    );

    return content;
  }

  /**
   * Get procedural NPCs for a location (generates if needed)
   */
  getOrGenerateNPCs(locationId: string, resolved?: ResolvedLocation): ProceduralNPC[] {
    // Check NPC cache
    const cached = this.npcCache.get(locationId);
    if (cached) {
      return cached;
    }

    // If we have resolved location info, generate full content
    if (resolved?.isProcedural) {
      const content = this.generateLocationContent(resolved);
      return content.npcs;
    }

    // No cached data and no resolved location
    return [];
  }

  /**
   * Get procedural items for a location (generates if needed)
   */
  getOrGenerateItems(locationId: string, resolved?: ResolvedLocation): WorldItemSpawn[] {
    // Check item cache
    const cached = this.itemCache.get(locationId);
    if (cached) {
      return cached;
    }

    // If we have resolved location info, generate full content
    if (resolved?.isProcedural) {
      const content = this.generateLocationContent(resolved);
      return content.worldItems;
    }

    return [];
  }

  /**
   * Get procedural shop inventory for an NPC.
   *
   * @param npcId - The ID of the merchant NPC.
   * @param locationId - The ID of the location where the shop is located.
   * @returns The shop inventory or null if not found.
   */
  getOrGenerateShop(npcId: string, locationId: string): ShopInventory | null {
    const cached = this.cache.get(locationId);
    if (cached) {
      return cached.shopInventories.get(npcId) || null;
    }
    return null;
  }

  /**
   * Get procedural dialogue tree for an NPC.
   *
   * @param npcId - The ID of the NPC.
   * @param locationId - The ID of the location.
   * @returns The dialogue tree or null if not found.
   */
  getOrGenerateDialogue(npcId: string, locationId: string): DialogueTree | null {
    const cached = this.cache.get(locationId);
    if (cached) {
      return cached.dialogueTrees.get(npcId) || null;
    }
    return null;
  }

  /**
   * Get structure state at a coordinate (generates if needed).
   *
   * @param locationId - The ID of the location.
   * @param hexKey - The key of the hex coordinate ("q,r").
   * @returns The status of the structure ('functional', 'broken', or 'locked').
   */
  getOrGenerateStructureState(
    locationId: string,
    hexKey: string
  ): 'functional' | 'broken' | 'locked' {
    // Ensure content exists
    const content = this.cache.get(locationId);
    if (!content) {
      // We can't generate full content without a resolved location object usually,
      // but for structure state we just need the seed.
      // If we are here, something is out of order or we need to support lazy init without full resolve.
      // For now, return functional if not init.
      return 'functional';
    }

    if (content.structureStates.has(hexKey)) {
      return content.structureStates.get(hexKey)!;
    }

    // Deterministically decide state
    const stateSeed = combineSeeds(content.seed, hashString(hexKey));
    const rng = new SeededRandom(stateSeed);

    // 20% chance of being broken/locked
    let state: 'functional' | 'broken' | 'locked' = 'functional';
    if (rng.float(0, 1) < 0.2) {
      state = rng.bool() ? 'broken' : 'locked';
    }

    content.structureStates.set(hexKey, state);
    return state;
  }

  /**
   * Check if a location has been generated
   */
  hasGeneratedContent(locationId: string): boolean {
    return this.cache.has(locationId);
  }

  // ========== PRIVATE HELPERS ==========

  /**
   * Infer location type from LocationRef properties
   * Returns types matching NPC template validLocationTypes: 'town', 'city', 'outpost', 'camp', 'ranch', 'mine'
   */
  private inferLocationType(ref: LocationRef): string {
    // Use explicit type if available
    if (ref.type) {
      return ref.type;
    }

    // Infer from tags - use types that match NPC template validLocationTypes
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
   * Location types match NPC template validLocationTypes: 'town', 'city', 'outpost', 'camp', 'ranch', 'mine'
   */
  private getDefaultNPCCounts(locationType: string): { background: number; notable: number } {
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
   * Location types match NPC template validLocationTypes: 'town', 'city', 'outpost', 'camp', 'ranch', 'mine'
   */
  private getDefaultItemCount(locationType: string): number {
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
  private convertToProceduralNPCs(
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
        role: npc.role as any, // Type coercion for NPCRoleSchema
        faction: npc.faction as any, // Type coercion for NPCFactionSchema
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
   * Generate world items for a location
   */
  private generateWorldItems(
    rng: SeededRandom,
    locationId: string,
    locationType: string,
    count: number
  ): WorldItemSpawn[] {
    const items: WorldItemSpawn[] = [];

    // Item pools based on location type
    // Location types match NPC template validLocationTypes: 'town', 'city', 'outpost', 'camp', 'ranch', 'mine'
    const itemPools: Record<string, { id: string; weight: number; quantity: [number, number] }[]> =
      {
        town: [
          { id: 'bandage', weight: 20, quantity: [1, 2] },
          { id: 'whiskey', weight: 15, quantity: [1, 1] },
          { id: 'revolver_ammo', weight: 25, quantity: [6, 12] },
          { id: 'rifle_ammo', weight: 15, quantity: [5, 10] },
          { id: 'lockpick', weight: 10, quantity: [1, 3] },
          { id: 'tobacco', weight: 10, quantity: [1, 2] },
          { id: 'gold_nugget', weight: 5, quantity: [1, 1] },
        ],
        city: [
          { id: 'bandage', weight: 15, quantity: [1, 3] },
          { id: 'whiskey', weight: 10, quantity: [1, 2] },
          { id: 'revolver_ammo', weight: 20, quantity: [6, 12] },
          { id: 'rifle_ammo', weight: 15, quantity: [5, 10] },
          { id: 'lockpick', weight: 15, quantity: [1, 3] },
          { id: 'tobacco', weight: 10, quantity: [1, 2] },
          { id: 'gold_nugget', weight: 10, quantity: [1, 2] },
          { id: 'pocket_watch', weight: 5, quantity: [1, 1] },
        ],
        mine: [
          { id: 'pickaxe', weight: 15, quantity: [1, 1] },
          { id: 'gold_nugget', weight: 25, quantity: [1, 3] },
          { id: 'dynamite', weight: 10, quantity: [1, 2] },
          { id: 'bandage', weight: 20, quantity: [1, 2] },
          { id: 'lantern_oil', weight: 15, quantity: [1, 2] },
          { id: 'rope', weight: 10, quantity: [1, 1] },
          { id: 'canteen', weight: 5, quantity: [1, 1] },
        ],
        ruin: [
          { id: 'gold_nugget', weight: 20, quantity: [1, 2] },
          { id: 'old_letter', weight: 15, quantity: [1, 1] },
          { id: 'revolver_ammo', weight: 20, quantity: [3, 8] },
          { id: 'bandage', weight: 15, quantity: [1, 3] },
          { id: 'whiskey', weight: 15, quantity: [1, 2] },
          { id: 'lockpick', weight: 10, quantity: [1, 2] },
          { id: 'mysterious_key', weight: 5, quantity: [1, 1] },
        ],
        ranch: [
          { id: 'rope', weight: 20, quantity: [1, 2] },
          { id: 'bandage', weight: 15, quantity: [1, 2] },
          { id: 'rifle_ammo', weight: 15, quantity: [5, 10] },
          { id: 'canteen', weight: 15, quantity: [1, 1] },
          { id: 'dried_meat', weight: 20, quantity: [1, 3] },
          { id: 'tobacco', weight: 10, quantity: [1, 2] },
          { id: 'horseshoe', weight: 5, quantity: [1, 1] },
        ],
        outpost: [
          { id: 'revolver_ammo', weight: 25, quantity: [6, 12] },
          { id: 'bandage', weight: 20, quantity: [1, 2] },
          { id: 'canteen', weight: 15, quantity: [1, 1] },
          { id: 'rope', weight: 15, quantity: [1, 1] },
          { id: 'lantern_oil', weight: 15, quantity: [1, 2] },
          { id: 'whiskey', weight: 10, quantity: [1, 1] },
        ],
        camp: [
          { id: 'bandage', weight: 25, quantity: [1, 2] },
          { id: 'dried_meat', weight: 20, quantity: [1, 2] },
          { id: 'canteen', weight: 20, quantity: [1, 1] },
          { id: 'revolver_ammo', weight: 15, quantity: [3, 6] },
          { id: 'tobacco', weight: 15, quantity: [1, 1] },
          { id: 'bedroll', weight: 5, quantity: [1, 1] },
        ],
      };

    const pool = itemPools[locationType] || itemPools.town;
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);

    for (let i = 0; i < count; i++) {
      // Weighted random selection
      let roll = rng.float(0, totalWeight);
      let selected = pool[0];
      for (const item of pool) {
        roll -= item.weight;
        if (roll <= 0) {
          selected = item;
          break;
        }
      }

      // Random position (sparse spread)
      const angle = rng.float(0, Math.PI * 2);
      const radius = rng.float(3, 10);
      const q = Math.round(Math.cos(angle) * radius);
      const r = Math.round(Math.sin(angle) * radius);

      const quantity = rng.int(selected.quantity[0], selected.quantity[1]);

      items.push({
        id: `proc_item_${locationId}_${i}`,
        itemId: selected.id,
        coord: { q, r },
        quantity,
      });
    }

    return items;
  }

  /**
   * Generate dialogue tree for a procedural NPC
   */
  private generateNPCDialogue(
    rng: SeededRandom,
    npc: ProceduralNPC,
    context: GenerationContext
  ): DialogueTree | null {
    try {
      // Generate dialogue using the simple generator
      const generatedTree = generateSimpleDialogueTree(rng, npc.generated, context, {
        includeRumors: true,
        includeQuest: npc.questGiver,
        includeShop: !!npc.shopId,
      });

      // Convert GeneratedDialogueTree to DialogueTree format
      return this.convertToDialogueTree(generatedTree, npc);
    } catch (err) {
      console.warn(`[ProceduralLocationManager] Failed to generate dialogue for ${npc.id}:`, err);
      return null;
    }
  }

  /**
   * Convert GeneratedDialogueTree to DialogueTree schema format
   */
  private convertToDialogueTree(
    generated: GeneratedDialogueTree,
    npc: ProceduralNPC
  ): DialogueTree {
    // Convert nodes from Map to array
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
  private generateShopForNPC(
    rng: SeededRandom,
    npc: ProceduralNPC,
    _locationType: string
  ): ShopInventory {
    // Determine shop type based on NPC role
    const shopTypeByRole: Record<string, string> = {
      merchant: 'general_store',
      bartender: 'saloon',
      blacksmith: 'blacksmith',
      gunsmith: 'gunsmith',
      doctor: 'apothecary',
    };
    const shopType = shopTypeByRole[npc.role] || 'general_store';

    // Generate inventory using item generator (signature: rng, shopType, level, context?)
    const generatedItems: ShopInventoryItem[] = generateShopInventory(rng, shopType, 1);

    return {
      npcId: npc.id,
      shopType,
      items: generatedItems.map((item) => ({
        itemId: item.item.id,
        stock: item.quantity,
        basePrice: item.buyPrice,
      })),
      priceModifier: 1.0 + rng.float(-0.1, 0.2), // Small price variance
      canBuy: true,
      canSell: true,
    };
  }

  /**
   * Generate quests from quest-giving NPCs
   */
  private generateLocationQuests(
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
        console.warn(`[ProceduralLocationManager] Failed to generate quest for ${giver.id}:`, err);
      }
    }

    return quests;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Global ProceduralLocationManager instance
 */
export const ProceduralLocationManager = new ProceduralLocationManagerClass();

// Export types for external use
export type { GeneratedNPC, GeneratedQuest };
