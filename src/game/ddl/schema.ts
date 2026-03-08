/**
 * DDL Schema - Zod validation schemas for DDL types
 *
 * Provides runtime validation for DDL JSON files.
 *
 * @module game/ddl/schema
 */

import { z } from 'zod';

// ============================================================================
// CORE SCHEMAS
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
// SPAWN POINTS SCHEMA
// ============================================================================

export const SpawnPointsDDLSchema = z.object({
  player: Position3DSchema,
  playerRotation: z.number().optional(),
  npcs: z
    .array(
      z.object({
        npcId: z.string(),
        position: Position3DSchema,
        rotation: z.number().optional(),
      })
    )
    .optional(),
  enemies: z.array(Position3DSchema).optional(),
  allies: z.array(Position3DSchema).optional(),
  items: z
    .array(
      z.object({
        itemId: z.string(),
        position: Position3DSchema,
        quantity: z.number().int().positive().optional(),
      })
    )
    .optional(),
});

// ============================================================================
// OBJECTIVE SCHEMA
// ============================================================================

export const ObjectiveDDLSchema = z.object({
  id: z.string(),
  type: ObjectiveTypeSchema,
  description: z.string(),
  target: z.string().optional(),
  count: z.number().int().positive().optional(),
  optional: z.boolean().optional(),
  rewards: z
    .object({
      xp: z.number().int().nonnegative().optional(),
      gold: z.number().int().nonnegative().optional(),
      items: z
        .array(
          z.object({
            itemId: z.string(),
            quantity: z.number().int().positive(),
          })
        )
        .optional(),
    })
    .optional(),
});

// ============================================================================
// LIGHTING SCHEMAS
// ============================================================================

export const PointLightDDLSchema = z.object({
  name: z.string(),
  position: Position3DSchema,
  color: z.string(),
  intensity: z.number().nonnegative(),
  range: z.number().positive(),
  castsShadows: z.boolean().optional(),
});

export const PlayerTorchDDLSchema = z.object({
  enabled: z.boolean(),
  color: z.string().optional(),
  intensity: z.number().nonnegative().optional(),
  range: z.number().positive().optional(),
});

export const LightingDDLSchema = z.object({
  mode: EnvironmentModeSchema,
  timeOfDay: TimeOfDaySchema.optional(),
  ambientIntensity: z.number().min(0).max(1).optional(),
  sunColor: z.string().optional(),
  fogDensity: z.number().nonnegative().optional(),
  fogColor: z.string().optional(),
  overrides: z
    .object({
      pointLights: z.array(PointLightDDLSchema).optional(),
      playerTorch: PlayerTorchDDLSchema.optional(),
    })
    .optional(),
});

// ============================================================================
// POST-PROCESSING SCHEMA
// ============================================================================

export const PostProcessingDDLSchema = z.object({
  mode: EnvironmentModeSchema,
  bloom: z.number().nonnegative().optional(),
  vignette: z.number().min(0).max(1).optional(),
  colorGradingLUT: z.string().optional(),
  depthOfField: z
    .object({
      focalLength: z.number().positive(),
      aperture: z.number().positive(),
    })
    .optional(),
});

// ============================================================================
// WEATHER SCHEMA
// ============================================================================

export const WeatherDDLSchema = z.object({
  type: WeatherTypeSchema,
  intensity: z.number().min(0).max(1),
  windDirection: z.number().min(0).max(360).optional(),
  windSpeed: z.number().nonnegative().optional(),
  particles: z
    .object({
      type: z.enum(['dust', 'rain', 'snow', 'leaves']),
      density: z.number().min(0).max(1),
    })
    .optional(),
});

// ============================================================================
// AUDIO SCHEMA
// ============================================================================

export const AudioDDLSchema = z.object({
  musicTrack: z.string().optional(),
  ambientSounds: z
    .array(
      z.object({
        soundId: z.string(),
        volume: z.number().min(0).max(1),
        loop: z.boolean(),
      })
    )
    .optional(),
  reverbPreset: z.enum(['outdoor', 'indoor', 'cave', 'large_hall']).optional(),
});

// ============================================================================
// TERRAIN SCHEMA
// ============================================================================

export const TerrainDDLSchema = z.object({
  biome: BiomeTypeSchema,
  dimensions: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  elevation: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  features: z
    .object({
      trees: z.number().min(0).max(1).optional(),
      rocks: z.number().min(0).max(1).optional(),
      water: z.number().min(0).max(1).optional(),
      structures: z.number().min(0).max(1).optional(),
    })
    .optional(),
  seedOffset: z.number().int().optional(),
});

// ============================================================================
// STRUCTURE SCHEMA
// ============================================================================

export const StructureDDLSchema = z.object({
  type: z.string(),
  position: Position3DSchema,
  rotation: z.number().optional(),
  scale: z.number().positive().optional(),
  ownerId: z.string().optional(),
  interiorId: z.string().optional(),
});

// ============================================================================
// LEVEL DDL SCHEMA
// ============================================================================

export const LevelDDLSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  chapter: z.number().int().positive().optional(),
  actName: z.string().optional(),
  environmentMode: EnvironmentModeSchema,
  spawnPoints: SpawnPointsDDLSchema,
  objectives: z.array(ObjectiveDDLSchema),
  lighting: LightingDDLSchema,
  postProcessing: PostProcessingDDLSchema,
  weather: WeatherDDLSchema.optional(),
  audio: AudioDDLSchema.optional(),
  terrain: TerrainDDLSchema.optional(),
  structures: z.array(StructureDDLSchema).optional(),
  nextLevelId: z.string().nullable().optional(),
  previousLevelId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// CAMPAIGN DDL SCHEMA
// ============================================================================

export const CampaignDDLSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  startingLevelId: z.string(),
  levelIds: z.array(z.string()),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type Position3D = z.infer<typeof Position3DSchema>;
export type HexPosition = z.infer<typeof HexPositionSchema>;
export type SpawnPointsDDL = z.infer<typeof SpawnPointsDDLSchema>;
export type ObjectiveDDL = z.infer<typeof ObjectiveDDLSchema>;
export type PointLightDDL = z.infer<typeof PointLightDDLSchema>;
export type PlayerTorchDDL = z.infer<typeof PlayerTorchDDLSchema>;
export type LightingDDL = z.infer<typeof LightingDDLSchema>;
export type PostProcessingDDL = z.infer<typeof PostProcessingDDLSchema>;
export type WeatherDDL = z.infer<typeof WeatherDDLSchema>;
export type AudioDDL = z.infer<typeof AudioDDLSchema>;
export type TerrainDDL = z.infer<typeof TerrainDDLSchema>;
export type StructureDDL = z.infer<typeof StructureDDLSchema>;
export type LevelDDL = z.infer<typeof LevelDDLSchema>;
export type CampaignDDL = z.infer<typeof CampaignDDLSchema>;
