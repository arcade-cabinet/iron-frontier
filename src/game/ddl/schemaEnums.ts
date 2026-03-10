/**
 * DDL Schema enums and position schemas
 *
 * Core enum and position type definitions used across all DDL schemas.
 *
 * @module game/ddl/schemaEnums
 */

import { z } from 'zod';

// ============================================================================
// CORE ENUM SCHEMAS
// ============================================================================

export const EnvironmentModeSchema = z.enum([
  'town',
  'wilderness',
  'cave',
  'interior',
  'camp',
]);

export const BiomeTypeSchema = z.enum([
  'desert',
  'grassland',
  'badlands',
  'riverside',
  'forest',
  'mountain',
  'swamp',
]);

export const TimeOfDaySchema = z.enum([
  'dawn',
  'morning',
  'noon',
  'afternoon',
  'dusk',
  'night',
]);

export const WeatherTypeSchema = z.enum([
  'clear',
  'cloudy',
  'dusty',
  'rainy',
  'stormy',
  'foggy',
]);

export const ObjectiveTypeSchema = z.enum([
  'reach',
  'collect',
  'kill',
  'interact',
  'survive',
  'escort',
  'defend',
  'stealth',
]);

// ============================================================================
// POSITION SCHEMAS
// ============================================================================

export const Position3DSchema = z.tuple([z.number(), z.number(), z.number()]);

export const HexPositionSchema = z.object({
  q: z.number().int(),
  r: z.number().int(),
});

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Position3D = z.infer<typeof Position3DSchema>;
export type HexPosition = z.infer<typeof HexPositionSchema>;
