/**
 * Shared Type Definitions
 *
 * Re-exports types from @iron-frontier/types plus schema-derived types.
 * Note: Declaration files (.d.ts) provide ambient declarations.
 */

// Re-export all types from the dedicated types package
export * from '@iron-frontier/types';

// Re-export schema-derived types (Zod-inferred)
export type {
  Assemblage,
  AssemblageRef,
  EntryPoint,
  FeatureTypeSchema,
  HexCoord,
  Location,
  Marker,
  MarkerType,
  Region,
  SlotInstance,
  SlotType,
  StructureTypeSchema,
  TerrainTypeSchema,
  TileDef,
  World,
  WorldLocation,
  WorldPos,
  Zone,
  ZoneType,
} from '../data/schemas/spatial';

// Re-export engine runtime values (constants, functions)
export {
  CHUNK_SIZE,
  VIEW_DISTANCE,
  STRUCTURE_TEMPLATES,
  worldToChunk,
  chunkToWorld,
  chunkKey,
} from './engine';
