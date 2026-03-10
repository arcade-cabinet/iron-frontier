/**
 * ProceduralLocationManager - Central orchestrator for procedural content generation
 *
 * Bridges the procedural generation system with the existing location/NPC/item infrastructure.
 */

import type { WorldItemSpawn } from '../../items/worldItems';
import type { DialogueTree } from '../../schemas/npc';
import type { ResolvedLocation } from '../../worlds/WorldLoader';
import { combineSeeds, hashString, SeededRandom } from '../seededRandom';
import { generateContentForLocation } from './contentGenerator.ts';
import { initializeGenerators } from './initialization.ts';
import type {
  ProceduralLocationContent,
  ProceduralNPC,
  ShopInventory,
} from './types.ts';
import type { GeneratedQuest } from '../generators/questGenerator';
import type { GeneratedNPC } from '../generators';

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
      return;
    }

    console.log(`[ProceduralLocationManager] Initializing with seed: ${worldSeed}`);

    this.worldSeed = worldSeed;
    this.cache.clear();
    this.npcCache.clear();
    this.itemCache.clear();

    initializeGenerators();

    this.initialized = true;
    console.log('[ProceduralLocationManager] Initialized successfully');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getWorldSeed(): number {
    return this.worldSeed;
  }

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
    resolved: ResolvedLocation & { _regionId?: string },
    options: {
      npcCount?: { background: number; notable: number };
      itemCount?: number;
    } = {}
  ): ProceduralLocationContent {
    if (!this.initialized) {
      throw new Error(
        'ProceduralLocationManager not initialized. Call initialize() first.'
      );
    }

    const locationId = resolved.ref.id;
    const locationSeed = combineSeeds(this.worldSeed, hashString(locationId));

    // Check cache first
    const cached = this.cache.get(locationId);
    if (cached && cached.seed === locationSeed) {
      console.log(
        `[ProceduralLocationManager] Using cached content for: ${locationId}`
      );
      return cached;
    }

    console.log(
      `[ProceduralLocationManager] Generating content for: ${locationId}`
    );

    const content = generateContentForLocation(resolved, this.worldSeed, options);

    // Cache
    this.cache.set(locationId, content);
    this.npcCache.set(locationId, content.npcs);
    this.itemCache.set(locationId, content.worldItems);

    console.log(
      `[ProceduralLocationManager] Generated: ${content.npcs.length} NPCs, ${content.worldItems.length} items, ${content.quests.length} quests`
    );

    return content;
  }

  getOrGenerateNPCs(
    locationId: string,
    resolved?: ResolvedLocation
  ): ProceduralNPC[] {
    const cached = this.npcCache.get(locationId);
    if (cached) {
      return cached;
    }

    if (resolved?.isProcedural) {
      const content = this.generateLocationContent(resolved);
      return content.npcs;
    }

    return [];
  }

  getOrGenerateItems(
    locationId: string,
    resolved?: ResolvedLocation
  ): WorldItemSpawn[] {
    const cached = this.itemCache.get(locationId);
    if (cached) {
      return cached;
    }

    if (resolved?.isProcedural) {
      const content = this.generateLocationContent(resolved);
      return content.worldItems;
    }

    return [];
  }

  getOrGenerateShop(npcId: string, locationId: string): ShopInventory | null {
    const cached = this.cache.get(locationId);
    if (cached) {
      return cached.shopInventories.get(npcId) || null;
    }
    return null;
  }

  getOrGenerateDialogue(
    npcId: string,
    locationId: string
  ): DialogueTree | null {
    const cached = this.cache.get(locationId);
    if (cached) {
      return cached.dialogueTrees.get(npcId) || null;
    }
    return null;
  }

  getOrGenerateStructureState(
    locationId: string,
    hexKey: string
  ): 'functional' | 'broken' | 'locked' {
    const content = this.cache.get(locationId);
    if (!content) {
      return 'functional';
    }

    if (content.structureStates.has(hexKey)) {
      return content.structureStates.get(hexKey)!;
    }

    const stateSeed = combineSeeds(content.seed, hashString(hexKey));
    const rng = new SeededRandom(stateSeed);

    let state: 'functional' | 'broken' | 'locked' = 'functional';
    if (rng.float(0, 1) < 0.2) {
      state = rng.bool() ? 'broken' : 'locked';
    }

    content.structureStates.set(hexKey, state);
    return state;
  }

  hasGeneratedContent(locationId: string): boolean {
    return this.cache.has(locationId);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Global ProceduralLocationManager instance
 */
export const ProceduralLocationManager =
  new ProceduralLocationManagerClass();

// Export types for external use
export type { GeneratedNPC, GeneratedQuest };
