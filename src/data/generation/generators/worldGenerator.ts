/**
 * World Generator - Master orchestrator for procedural world generation
 *
 * Coordinates all generators to create a coherent procedural world.
 */

import {
  GENERATION_SCHEMA_VERSION,
  type GenerationContext,
  type GenerationManifest,
} from '../../schemas/generation';
import { combineSeeds, hashString, SeededRandom } from '../seededRandom';
import { generatePlaceName, initNamePools } from './nameGenerator';
import { type GeneratedNPC, generateNPCsForLocation, initNPCTemplates } from './npcGenerator';
import {
  type GeneratedQuest,
  generateRandomQuest,
  initQuestTemplates,
  type QuestGenerationContext,
} from './questGenerator';

/**
 * Generated location data
 */
export interface GeneratedLocation {
  id: string;
  name: string;
  type: string;
  size: string;
  description: string;
  npcs: GeneratedNPC[];
  quests: GeneratedQuest[];
  buildings: string[];
  tags: string[];
  coord: { q: number; r: number };
  seed: number;
}

/**
 * Generated world region
 */
export interface GeneratedRegion {
  id: string;
  name: string;
  description: string;
  locations: GeneratedLocation[];
  rumors: string[];
  factionPresence: Record<string, number>;
  seed: number;
}

/**
 * Complete generated world
 */
export interface GeneratedWorld {
  id: string;
  name: string;
  seed: number;
  regions: GeneratedRegion[];
  globalNPCs: GeneratedNPC[];
  globalQuests: GeneratedQuest[];
  loreFragments: string[];
  manifest: GenerationManifest;
}

/**
 * World generation options
 */
export interface WorldGenerationOptions {
  /** Base world seed */
  seed: number;
  /** World name (affects seed) */
  worldName?: string;
  /** Number of regions to generate */
  regionCount?: number;
  /** Locations per region range */
  locationsPerRegion?: [number, number];
  /** Generation context overrides */
  contextOverrides?: Partial<GenerationContext>;
}

/**
 * World Generator class
 */
export class WorldGenerator {
  private masterRng: SeededRandom;
  private options: Required<WorldGenerationOptions>;
  private initialized = false;

  // Generation stats
  private stats = {
    npcsGenerated: 0,
    questsGenerated: 0,
    locationsGenerated: 0,
    regionsGenerated: 0,
  };

  constructor(options: WorldGenerationOptions) {
    // Combine seed with world name if provided
    const finalSeed = options.worldName
      ? combineSeeds(options.seed, hashString(options.worldName))
      : options.seed;

    this.masterRng = new SeededRandom(finalSeed);

    this.options = {
      seed: finalSeed,
      worldName: options.worldName ?? 'Iron Frontier',
      regionCount: options.regionCount ?? 3,
      locationsPerRegion: options.locationsPerRegion ?? [3, 6],
      contextOverrides: options.contextOverrides ?? {},
    };
  }

  /**
   * Initialize the generator with templates and pools
   */
  async initialize(
    namePools: Parameters<typeof initNamePools>[0],
    placeNamePools: Parameters<typeof initNamePools>[1],
    npcTemplates: Parameters<typeof initNPCTemplates>[0],
    questTemplates: Parameters<typeof initQuestTemplates>[0]
  ): Promise<void> {
    initNamePools(namePools, placeNamePools);
    initNPCTemplates(npcTemplates);
    initQuestTemplates(questTemplates);
    this.initialized = true;
  }

  /**
   * Check if generator is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create generation context
   */
  private createContext(overrides: Partial<GenerationContext> = {}): GenerationContext {
    return {
      worldSeed: this.options.seed,
      playerLevel: 1,
      gameHour: 12,
      factionTensions: {},
      activeEvents: [],
      contextTags: [],
      ...this.options.contextOverrides,
      ...overrides,
    };
  }

  /**
   * Generate a single location
   */
  generateLocation(
    locationType: string,
    regionId: string,
    coord: { q: number; r: number }
  ): GeneratedLocation {
    if (!this.initialized) {
      throw new Error('WorldGenerator not initialized. Call initialize() first.');
    }

    const locationSeed = this.masterRng.int(0, 0xffffffff);
    const locationRng = new SeededRandom(locationSeed);

    const context = this.createContext({
      regionId,
      locationId: `loc_${locationSeed.toString(16)}`,
    });

    // Generate location name
    const placeName = generatePlaceName(locationRng, locationType);

    // Determine size based on type
    const sizeMap: Record<string, string> = {
      frontier_town: 'large',
      mining_town: 'medium',
      cattle_town: 'medium',
      outpost: 'small',
      ranch: 'small',
      homestead: 'tiny',
    };
    const size = sizeMap[locationType] ?? 'small';

    // Generate NPCs
    const npcCounts = {
      tiny: { background: 1, notable: 1 },
      small: { background: 3, notable: 2 },
      medium: { background: 6, notable: 4 },
      large: { background: 10, notable: 6 },
    };
    const counts = npcCounts[size as keyof typeof npcCounts] ?? npcCounts.small;

    const npcs = generateNPCsForLocation(locationRng, locationType, context, counts);
    this.stats.npcsGenerated += npcs.length;

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
        availableItems: [], // Would be populated from item pools
        availableLocations: [], // Would include nearby locations
        availableEnemies: [], // Would be populated from enemy pools
      };

      const quest = generateRandomQuest(locationRng, questContext, {
        id: giver.id,
        name: giver.name,
        role: giver.role,
        faction: giver.faction,
      });

      if (quest) {
        quests.push(quest);
        this.stats.questsGenerated++;
      }
    }

    // Generate description
    const descriptions: Record<string, string[]> = {
      frontier_town: [
        `${placeName.name} is a bustling frontier town, where law and outlaws uneasily coexist.`,
        `The town of ${placeName.name} rises from the dust, a beacon of civilization in the wilderness.`,
      ],
      mining_town: [
        `${placeName.name} grew up around the mines, its residents seeking fortune in the earth.`,
        `The mining town of ${placeName.name} echoes with the sound of picks and the dreams of prospectors.`,
      ],
      outpost: [
        `${placeName.name} is little more than a few buildings and determined souls.`,
        `The small outpost of ${placeName.name} offers shelter to weary travelers.`,
      ],
    };
    const descList = descriptions[locationType] ?? [`${placeName.name} awaits exploration.`];
    const description = locationRng.pick(descList);

    this.stats.locationsGenerated++;

    return {
      id: `loc_${locationSeed.toString(16)}`,
      name: placeName.name,
      type: locationType,
      size,
      description,
      npcs,
      quests,
      buildings: [], // Would be populated from building templates
      tags: [],
      coord,
      seed: locationSeed,
    };
  }

  /**
   * Generate a region with multiple locations
   */
  generateRegion(regionIndex: number): GeneratedRegion {
    if (!this.initialized) {
      throw new Error('WorldGenerator not initialized. Call initialize() first.');
    }

    const regionSeed = this.masterRng.int(0, 0xffffffff);
    const regionRng = new SeededRandom(regionSeed);

    // Generate region name
    const regionName = generatePlaceName(regionRng, 'landmark_names');

    // Determine number of locations
    const [minLocs, maxLocs] = this.options.locationsPerRegion;
    const locationCount = regionRng.int(minLocs, maxLocs);

    // Location types to distribute
    const locationTypes = [
      'frontier_town',
      'mining_town',
      'cattle_town',
      'outpost',
      'ranch',
      'homestead',
    ];

    // Generate locations in a spread pattern
    const locations: GeneratedLocation[] = [];
    for (let i = 0; i < locationCount; i++) {
      const locationType = regionRng.pick(locationTypes);

      // Simple hex spiral placement
      const angle = (i / locationCount) * Math.PI * 2;
      const radius = 3 + regionRng.int(0, 3);
      const q = Math.round(Math.cos(angle) * radius);
      const r = Math.round(Math.sin(angle) * radius);

      const location = this.generateLocation(locationType, `region_${regionIndex}`, { q, r });
      locations.push(location);
    }

    // Generate faction presence
    const factions = ['law_enforcement', 'desperados', 'railroad_company', 'mining_consortium'];
    const factionPresence: Record<string, number> = {};
    for (const faction of factions) {
      factionPresence[faction] = regionRng.float(0, 1);
    }

    this.stats.regionsGenerated++;

    return {
      id: `region_${regionSeed.toString(16)}`,
      name: `${regionName.name} Territory`,
      description: `The ${regionName.name} Territory stretches across the frontier, home to ${locations.length} settlements.`,
      locations,
      rumors: [], // Would be populated from rumor templates
      factionPresence,
      seed: regionSeed,
    };
  }

  /**
   * Generate complete world
   */
  generateWorld(): GeneratedWorld {
    if (!this.initialized) {
      throw new Error('WorldGenerator not initialized. Call initialize() first.');
    }

    console.log(`[WorldGenerator] Generating world with seed: ${this.options.seed}`);

    // Generate regions
    const regions: GeneratedRegion[] = [];
    for (let i = 0; i < this.options.regionCount; i++) {
      const region = this.generateRegion(i);
      regions.push(region);
      console.log(
        `[WorldGenerator] Generated region: ${region.name} with ${region.locations.length} locations`
      );
    }

    // Create manifest
    const manifest: GenerationManifest = {
      generatedAt: Date.now(),
      worldSeed: this.options.seed,
      schemaVersion: GENERATION_SCHEMA_VERSION,
      counts: {
        npcs: this.stats.npcsGenerated,
        quests: this.stats.questsGenerated,
        dialogueTrees: 0,
        locations: this.stats.locationsGenerated,
        encounters: 0,
        rumors: 0,
        loreFragments: 0,
      },
      templatesUsed: [],
      warnings: [],
    };

    console.log(`[WorldGenerator] Generation complete:`);
    console.log(`  - Regions: ${this.stats.regionsGenerated}`);
    console.log(`  - Locations: ${this.stats.locationsGenerated}`);
    console.log(`  - NPCs: ${this.stats.npcsGenerated}`);
    console.log(`  - Quests: ${this.stats.questsGenerated}`);

    return {
      id: `world_${this.options.seed.toString(16)}`,
      name: this.options.worldName,
      seed: this.options.seed,
      regions,
      globalNPCs: [],
      globalQuests: [],
      loreFragments: [],
      manifest,
    };
  }

  /**
   * Get generation statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      npcsGenerated: 0,
      questsGenerated: 0,
      locationsGenerated: 0,
      regionsGenerated: 0,
    };
  }
}

/**
 * Quick world generation function
 */
export async function generateWorld(
  options: WorldGenerationOptions,
  pools: {
    namePools: Parameters<typeof initNamePools>[0];
    placeNamePools: Parameters<typeof initNamePools>[1];
    npcTemplates: Parameters<typeof initNPCTemplates>[0];
    questTemplates: Parameters<typeof initQuestTemplates>[0];
  }
): Promise<GeneratedWorld> {
  const generator = new WorldGenerator(options);
  await generator.initialize(
    pools.namePools,
    pools.placeNamePools,
    pools.npcTemplates,
    pools.questTemplates
  );
  return generator.generateWorld();
}
