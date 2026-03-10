/**
 * World Generator Class - Master orchestrator for procedural world generation
 */

import {
  GENERATION_SCHEMA_VERSION,
  type GenerationContext,
  type GenerationManifest,
} from '../../../schemas/generation';
import { combineSeeds, hashString, SeededRandom } from '../../seededRandom';
import { generatePlaceName, initNamePools } from '../nameGenerator';
import { initNPCTemplates } from '../npcGenerator';
import { initQuestTemplates } from '../questGenerator';
import { generateLocationData } from './locationGeneration.ts';
import type {
  GeneratedLocation,
  GeneratedRegion,
  GeneratedWorld,
  WorldGenerationOptions,
} from './types.ts';

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

    const context = this.createContext({ regionId });
    const { location, npcCount, questCount } = generateLocationData(
      this.masterRng,
      locationType,
      context
    );

    // Set coord from caller
    location.coord = coord;

    this.stats.npcsGenerated += npcCount;
    this.stats.questsGenerated += questCount;
    this.stats.locationsGenerated++;

    return location;
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

    const regionName = generatePlaceName(regionRng, 'landmark_names');

    const [minLocs, maxLocs] = this.options.locationsPerRegion;
    const locationCount = regionRng.int(minLocs, maxLocs);

    const locationTypes = [
      'frontier_town', 'mining_town', 'cattle_town',
      'outpost', 'ranch', 'homestead',
    ];

    const locations: GeneratedLocation[] = [];
    for (let i = 0; i < locationCount; i++) {
      const locationType = regionRng.pick(locationTypes);
      const angle = (i / locationCount) * Math.PI * 2;
      const radius = 3 + regionRng.int(0, 3);
      const q = Math.round(Math.cos(angle) * radius);
      const r = Math.round(Math.sin(angle) * radius);

      const location = this.generateLocation(locationType, `region_${regionIndex}`, { q, r });
      locations.push(location);
    }

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
      rumors: [],
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

    const regions: GeneratedRegion[] = [];
    for (let i = 0; i < this.options.regionCount; i++) {
      const region = this.generateRegion(i);
      regions.push(region);
      console.log(
        `[WorldGenerator] Generated region: ${region.name} with ${region.locations.length} locations`
      );
    }

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
