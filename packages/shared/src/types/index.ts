/**
 * Shared Type Definitions
 *
 * Note: Most types are declared in .d.ts files for ambient declarations.
 * This file re-exports any runtime type utilities.
 */

// Re-export any runtime types from data schemas
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
export * from './engine';
