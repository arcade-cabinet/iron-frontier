/**
 * Spatial Validation helpers
 */

import type { Assemblage } from './slots.ts';
import type { Location } from './location.ts';
import type { Region, World } from './region.ts';
import { AssemblageSchema } from './slots.ts';
import { LocationSchema } from './location.ts';
import { RegionSchema, WorldSchema } from './region.ts';

export function validateAssemblage(data: unknown): Assemblage {
  return AssemblageSchema.parse(data);
}

export function validateLocation(data: unknown): Location {
  return LocationSchema.parse(data);
}

export function validateRegion(data: unknown): Region {
  return RegionSchema.parse(data);
}

export function validateWorld(data: unknown): World {
  return WorldSchema.parse(data);
}

export const SCHEMA_VERSION = '2.0.0';
