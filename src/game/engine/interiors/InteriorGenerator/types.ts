/**
 * InteriorGenerator types — Interfaces for interior metadata, doors, and NPC slots.
 *
 * @module engine/interiors/InteriorGenerator/types
 */

// ============================================================================
// INTERIOR METADATA
// ============================================================================

/** Physical dimensions of a building interior. */
export interface InteriorDimensions {
  /** Interior width in meters (along x). */
  width: number;
  /** Interior depth in meters (along z). */
  depth: number;
  /** Wall height in meters. */
  wallHeight: number;
  /** Wall thickness in meters. */
  wallThick: number;
  /** Foundation height in meters (0 for most buildings). */
  foundationHeight: number;
}

/** Where the door is relative to the building origin. */
export interface DoorPosition {
  /** X offset from building center. */
  x: number;
  /** Z offset from building center (positive = front). */
  z: number;
  /** Width of the door opening in meters. */
  width: number;
  /** Height of the door opening in meters. */
  height: number;
}

/** Interior NPC spawn slot. */
export interface InteriorNPCPosition {
  /** X offset from building center. */
  x: number;
  /** Z offset from building center. */
  z: number;
  /** Y offset (for buildings with foundations). */
  y: number;
  /** The NPC role at this position. */
  role: string;
  /** Whether this is "behind counter" (shopkeeper position). */
  behindCounter: boolean;
}

/** Complete interior metadata for an archetype. */
export interface InteriorMetadata {
  /** Physical dimensions. */
  dimensions: InteriorDimensions;
  /** Door position relative to building center. */
  door: DoorPosition;
  /** NPC spawn positions. */
  npcPositions: InteriorNPCPosition[];
  /** Interior light color (hex). */
  ambientColor: number;
  /** Interior light intensity. */
  ambientIntensity: number;
  /** Point light positions for lanterns/fixtures. */
  lightPositions: Array<{ x: number; y: number; z: number; color: number; intensity: number; distance: number }>;
}
