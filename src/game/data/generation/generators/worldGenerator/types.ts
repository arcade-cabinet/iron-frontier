/**
 * World Generator Types - Interfaces for generated world data
 */

import type { GenerationManifest } from '../../../schemas/generation';
import type { GeneratedNPC } from '../npcGenerator';
import type { GeneratedQuest } from '../questGenerator';

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
  contextOverrides?: Partial<import('../../../schemas/generation').GenerationContext>;
}
