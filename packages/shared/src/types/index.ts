/**
 * Shared Type Definitions
 *
 * Note: Most types are declared in .d.ts files for ambient declarations.
 * This file re-exports any runtime type utilities.
 */

// Re-export any runtime types from data schemas
export type {
  HexCoord,
  WorldPos,
  TerrainTypeSchema,
  FeatureTypeSchema,
  StructureTypeSchema,
  SlotType,
  MarkerType,
  Marker,
  ZoneType,
  Zone,
  TileDef,
  SlotInstance,
  Assemblage,
  AssemblageRef,
  EntryPoint,
  Location,
  WorldLocation,
  Region,
  World,
} from '../data/schemas/spatial';
