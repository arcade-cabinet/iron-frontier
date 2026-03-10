/**
 * Spatial Slots - Functional roles, markers, zones, and slot instances
 */

import { z } from 'zod';
import { HexCoordSchema, HexRotationSchema } from './primitives.ts';
import { TileDefSchema, TerrainTypeSchema } from './tiles.ts';

// ============================================================================
// SLOTS - Functional roles (WHAT a place IS FOR)
// ============================================================================

export const SlotTypeSchema = z.enum([
  // Commerce
  'tavern',
  'general_store',
  'gunsmith',
  'doctor',
  'bank',
  'hotel',
  'stable',
  // Civic
  'law_office',
  'church',
  'telegraph',
  'train_station',
  // Industrial
  'mine',
  'smelter',
  'workshop',
  'farm',
  'ranch',
  // Residential
  'residence',
  'residence_wealthy',
  'residence_poor',
  // Wilderness & Camps
  'camp',
  'hideout',
  'waystation',
  'water_source',
  'landmark',
  // Ruins & Abandoned
  'ruins',
  // Special
  'quest_location',
  'hidden_cache',
  'ambush_point',
  'meeting_point',
]);
export type SlotType = z.infer<typeof SlotTypeSchema>;

// ============================================================================
// MARKERS - Named points within a slot
// ============================================================================

export const MarkerTypeSchema = z.enum([
  // Universal
  'entrance',
  'exit',
  'spawn_point',
  // Interaction
  'counter',
  'desk',
  'bed',
  'chair',
  'table',
  // Functional
  'storage',
  'display',
  'workbench',
  // Quest/Event
  'evidence_spot',
  'hiding_spot',
  'ambush_trigger',
  'conversation_spot',
  // Special
  'cell',
  'vault',
  'altar',
  'stage',
  // Wilderness/Camp
  'rest_spot',
  'vantage_point',
]);
export type MarkerType = z.infer<typeof MarkerTypeSchema>;

export const MarkerSchema = z.object({
  /** Marker type */
  type: MarkerTypeSchema,
  /** Unique name within the slot (e.g., "main_counter", "cell_1") */
  name: z.string(),
  /** Position relative to slot anchor */
  offset: HexCoordSchema,
  /** Facing direction (0-5) */
  facing: HexRotationSchema.optional(),
  /** Tags for additional filtering */
  tags: z.array(z.string()).default([]),
});
export type Marker = z.infer<typeof MarkerSchema>;

// ============================================================================
// ZONES - Areas that can be dynamically filled
// ============================================================================

export const ZoneTypeSchema = z.enum([
  'loot_area',
  'npc_area',
  'combat_area',
  'combat_zone',
  'event_stage',
  'decoration_area',
  'restricted_area',
  'public_area',
]);
export type ZoneType = z.infer<typeof ZoneTypeSchema>;

export const ZoneSchema = z.object({
  /** Zone type */
  type: ZoneTypeSchema,
  /** Unique name within the slot */
  name: z.string(),
  /** Tiles that make up this zone (relative to slot anchor) */
  tiles: z.array(HexCoordSchema).min(1),
  /** Priority when zones overlap (higher = takes precedence) */
  priority: z.number().int().optional(),
  /** Tags for filtering */
  tags: z.array(z.string()).optional(),
});
export type Zone = z.infer<typeof ZoneSchema>;

// ============================================================================
// SLOT INSTANCE - A functional area within a location
// ============================================================================

export const SlotInstanceSchema = z.object({
  /** Unique ID within the location */
  id: z.string(),
  /** Functional type - game logic binds to this */
  type: SlotTypeSchema,
  /** Human-readable name (for debugging/editors) */
  name: z.string().optional(),
  /** Anchor position in location coordinates */
  anchor: HexCoordSchema,
  /** Rotation (0-5) */
  rotation: HexRotationSchema.default(0),
  /** Visual tiles (relative to anchor) */
  tiles: z.array(TileDefSchema).min(1),
  /** Interaction markers */
  markers: z.array(MarkerSchema).default([]),
  /** Fillable zones */
  zones: z.array(ZoneSchema).default([]),
  /** Tags for filtering/matching */
  tags: z.array(z.string()).default([]),
  /** Importance level (1 = minor, 5 = critical to town function) */
  importance: z.number().int().min(1).max(5).default(3),
});
export type SlotInstance = z.infer<typeof SlotInstanceSchema>;

// ============================================================================
// ASSEMBLAGE - Reusable slot template
// ============================================================================

export const AssemblageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  /** Primary slot type this assemblage provides */
  primarySlot: SlotTypeSchema,
  /** Additional slots */
  secondarySlots: z.array(SlotTypeSchema).default([]),
  /** All tiles in the assemblage */
  tiles: z.array(TileDefSchema).min(1),
  /** Marker definitions */
  markers: z.array(MarkerSchema).default([]),
  /** Zone definitions */
  zones: z.array(ZoneSchema).default([]),
  /** Placement constraints */
  validRotations: z.array(HexRotationSchema).default([0, 1, 2, 3, 4, 5]),
  requiredTerrain: z.array(TerrainTypeSchema).optional(),
  forbiddenTerrain: z.array(TerrainTypeSchema).optional(),
  minWaterDistance: z.number().int().min(0).default(0),
  requiresRoadAccess: z.boolean().default(false),
});
export type Assemblage = z.infer<typeof AssemblageSchema>;

// ============================================================================
// ASSEMBLAGE REFERENCE
// ============================================================================

export const AssemblageRefSchema = z.object({
  /** Reference to assemblage ID in the library */
  assemblageId: z.string(),
  /** Unique instance ID within this location */
  instanceId: z.string(),
  /** Position of assemblage anchor in location coordinates */
  anchor: HexCoordSchema,
  /** Rotation (0-5) */
  rotation: HexRotationSchema.default(0),
  /** Override the slot type */
  slotTypeOverride: SlotTypeSchema.optional(),
  /** Additional tags */
  tags: z.array(z.string()).default([]),
  /** Importance override */
  importance: z.number().int().min(1).max(5).optional(),
});
export type AssemblageRef = z.infer<typeof AssemblageRefSchema>;
