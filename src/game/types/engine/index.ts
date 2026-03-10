// Engine Types - Barrel export
// Re-exports all engine types from domain-specific files.

export type { ChunkCoord, Color3Simple, Vector3Simple, WorldPosition } from './coordinates.ts';
export { CHUNK_SIZE, chunkKey, chunkToWorld, VIEW_DISTANCE, worldToChunk } from './coordinates.ts';

export type { BiomeConfig, BiomeType } from './biomes.ts';

export type { Prop, PropType, Structure, StructureTemplate, StructureType } from './structures.ts';
export { STRUCTURE_TEMPLATES } from './structureTemplates.ts';

export type { CharacterAppearance, NPC, NPCPersonality, NPCRole } from './characters.ts';

export type {
  ItemCategory,
  ItemDefinition,
  ItemEffect,
  ItemRarity,
  WorldItem,
} from './items.ts';

export type { TimeState, WeatherState, WeatherType } from './weather.ts';
