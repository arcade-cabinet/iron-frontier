/**
 * World Schemas - Barrel export
 */

export {
  ConnectionSchema,
  DangerLevelSchema,
  LocationRefSchema,
  LocationTypeSchema,
  RegionBiomeSchema,
  RegionSchema,
  TravelMethodSchema,
  WorldCoordSchema,
  WorldSchema,
} from './schemas.ts';
export type {
  Connection,
  DangerLevel,
  LocationRef,
  LocationType,
  Region,
  RegionBiome,
  TravelMethod,
  World,
  WorldCoord,
} from './schemas.ts';

export {
  getConnectionsFrom,
  getLocationAt,
  getLocationsInRegion,
  getRegionAt,
  validateConnection,
  validateLocationRef,
  validateRegion,
  validateWorld,
  worldDistance,
} from './utilities.ts';
