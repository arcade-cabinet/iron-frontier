/**
 * Spatial Environment - NPC markers, roads, atmosphere, weather
 */

import { z } from 'zod';
import { Vec3Schema, FacingSchema } from './primitives.ts';

// ============================================================================
// NPC PLACEMENT - Where NPCs stand, sit, patrol
// ============================================================================

/** Static NPC position marker */
export const NpcMarkerSchema = z.object({
  /** NPC role identifier (e.g., 'shopkeeper', 'sheriff', 'guard') */
  role: z.string(),
  /** World-space position in meters */
  position: Vec3Schema,
  /** Compass facing in degrees */
  facing: FacingSchema.default(0),
  /** What the NPC is doing at this position */
  activity: z.enum(['standing', 'sitting', 'working', 'patrolling', 'guarding']).default('standing'),
  /** For patrolling NPCs: ordered list of waypoints in world-space */
  waypoints: z.array(Vec3Schema).optional(),
  /** Which building/area this NPC belongs to */
  assignedTo: z.string().optional(),
  /** Tags for additional context */
  tags: z.array(z.string()).default([]),
});
export type NpcMarker = z.infer<typeof NpcMarkerSchema>;

// ============================================================================
// ROAD SEGMENT - Walkable path between points
// ============================================================================

/** A road or path defined as a series of world-space points */
export const RoadSegmentSchema = z.object({
  /** Unique identifier */
  id: z.string(),
  /** Road type affects rendering and width */
  type: z.enum(['main_street', 'side_street', 'alley', 'trail', 'railroad', 'boardwalk']),
  /** Width in meters */
  width: z.number().positive(),
  /** Ordered centerline points in world-space */
  points: z.array(Vec3Schema).min(2),
  /** Surface material */
  surface: z.enum(['dirt', 'gravel', 'packed_earth', 'boardwalk', 'stone', 'rail_bed']).default('dirt'),
  /** Tags */
  tags: z.array(z.string()).default([]),
});
export type RoadSegment = z.infer<typeof RoadSegmentSchema>;

// ============================================================================
// ATMOSPHERE (expanded for 3D environments)
// ============================================================================

/** Ambient sound profile for a location */
export const AmbientSoundSchema = z.object({
  /** Base ambient loop (wind, crowd, etc.) */
  base: z.enum([
    'desert_wind',
    'mountain_wind',
    'prairie_breeze',
    'town_bustle',
    'crowd_murmur',
    'mine_echoes',
    'river_flow',
    'forest_ambience',
    'industrial_hum',
    'silence',
  ]),
  /** Layered accents that play intermittently */
  accents: z.array(z.enum([
    'crickets',
    'coyote_howl',
    'horse_whinny',
    'blacksmith_hammer',
    'piano_distant',
    'steam_hiss',
    'pickaxe_clink',
    'church_bell',
    'train_whistle',
    'gunshot_distant',
    'dog_bark',
    'rooster_crow',
    'owl_hoot',
    'raven_call',
    'cattle_low',
    'saloon_chatter',
    'cart_creak',
  ])).default([]),
});
export type AmbientSound = z.infer<typeof AmbientSoundSchema>;

/** Lighting configuration for time-of-day */
export const LightingHintsSchema = z.object({
  /** Positions of lanterns/torches for nighttime (world-space) */
  lanternPositions: z.array(Vec3Schema).default([]),
  /** Interior light sources (windows that glow at night) */
  litWindows: z.array(z.string()).default([]), // References building instanceIds
  /** Campfire positions that provide light */
  campfires: z.array(Vec3Schema).default([]),
  /** Time of day when most activity happens */
  peakActivity: z.enum(['dawn', 'morning', 'midday', 'afternoon', 'evening', 'night']).default('midday'),
});
export type LightingHints = z.infer<typeof LightingHintsSchema>;

/** Weather tendencies for a location */
export const WeatherProfileSchema = z.object({
  /** Dominant weather condition */
  dominant: z.enum(['clear', 'dusty', 'windy', 'overcast', 'rainy', 'foggy', 'stormy', 'snowy']),
  /** How often weather changes */
  variability: z.enum(['static', 'mild', 'moderate', 'volatile']).default('mild'),
  /** Seasonal dust/sand particles */
  particleEffect: z.enum(['none', 'dust_light', 'dust_heavy', 'sand_blow', 'ash', 'snow_light', 'rain_mist']).default('none'),
});
export type WeatherProfile = z.infer<typeof WeatherProfileSchema>;
