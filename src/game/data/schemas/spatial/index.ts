/**
 * Spatial Schemas - Barrel export
 */

// Primitives
export {
  BuildingFootprintSchema,
  FacingSchema,
  HexCoordSchema,
  HexRotationSchema,
  Vec3Schema,
  WorldPosSchema,
} from './primitives.ts';
export type { BuildingFootprint, HexCoord, Vec3, WorldPos } from './primitives.ts';

// Environment
export {
  AmbientSoundSchema,
  LightingHintsSchema,
  NpcMarkerSchema,
  RoadSegmentSchema,
  WeatherProfileSchema,
} from './environment.ts';
export type { AmbientSound, LightingHints, NpcMarker, RoadSegment, WeatherProfile } from './environment.ts';

// Tiles
export {
  EdgeTypeSchema,
  FeatureTypeSchema,
  StructureTypeSchema,
  TerrainTypeSchema,
  TileDefSchema,
} from './tiles.ts';
export type { TileDef } from './tiles.ts';

// Slots
export {
  AssemblageRefSchema,
  AssemblageSchema,
  MarkerSchema,
  MarkerTypeSchema,
  SlotInstanceSchema,
  SlotTypeSchema,
  ZoneSchema,
  ZoneTypeSchema,
} from './slots.ts';
export type {
  Assemblage,
  AssemblageRef,
  Marker,
  MarkerType,
  SlotInstance,
  SlotType,
  Zone,
  ZoneType,
} from './slots.ts';

// Location
export { EntryPointSchema, LocationSchema, LocationSizeSchema, LocationTypeSchema } from './location.ts';
export type { EntryPoint, Location } from './location.ts';

// Region & World
export {
  RegionBiomeSchema,
  RegionSchema,
  WorldLocationSchema,
  WorldPathSchema,
  WorldSchema,
} from './region.ts';
export type { Region, World, WorldLocation, WorldPath } from './region.ts';

// Validation
export {
  SCHEMA_VERSION,
  validateAssemblage,
  validateLocation,
  validateRegion,
  validateWorld,
} from './validation.ts';
