/**
 * InteriorGenerator — Procedural 3D interior generation for building archetypes.
 *
 * Takes a building archetype type and dimensions, returns a THREE.Group
 * containing interior geometry (floor, furniture, fixtures) that fits
 * inside the exterior shell. All furniture is simple procedural geometry
 * (boxes, cylinders) with CanvasTexture materials.
 *
 * The archetypes themselves already generate interiors inline, so this
 * module provides:
 *   1. A unified API for querying interior metadata (dimensions, NPC slots)
 *   2. Interior lighting setup (ambient + point lights)
 *   3. Door trigger zone positioning
 *   4. Proximity-based LOD control (only render interiors when close)
 *
 * @module engine/interiors/InteriorGenerator
 */

import { PointLight, type Group } from 'three';

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

// ============================================================================
// ARCHETYPE INTERIOR METADATA REGISTRY
// ============================================================================

/**
 * Registry of interior metadata by archetype type key.
 * Each entry describes the physical layout for door placement,
 * NPC positioning, and interior lighting.
 */
const INTERIOR_METADATA: Record<string, InteriorMetadata> = {
  saloon: {
    dimensions: { width: 12, depth: 8, wallHeight: 5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 4, width: 1.6, height: 2.2 },
    npcPositions: [
      { x: 0, z: -2.5, y: 0, role: 'bartender', behindCounter: true },
      { x: -3, z: 1, y: 0, role: 'gambler', behindCounter: false },
      { x: 3, z: 1, y: 0, role: 'drifter', behindCounter: false },
    ],
    ambientColor: 0xffcc88,
    ambientIntensity: 0.3,
    lightPositions: [
      { x: 0, y: 3.5, z: 0, color: 0xffcc88, intensity: 0.6, distance: 10 },
      { x: -4, y: 2.8, z: 0, color: 0xffaa66, intensity: 0.3, distance: 5 },
      { x: 4, y: 2.8, z: 0, color: 0xffaa66, intensity: 0.3, distance: 5 },
    ],
  },

  general_store: {
    dimensions: { width: 10, depth: 8, wallHeight: 4.5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 4, width: 1.4, height: 2.1 },
    npcPositions: [
      { x: 0, z: -2.5, y: 0, role: 'merchant', behindCounter: true },
    ],
    ambientColor: 0xffddaa,
    ambientIntensity: 0.35,
    lightPositions: [
      { x: 0, y: 3.2, z: 0, color: 0xffddaa, intensity: 0.5, distance: 8 },
    ],
  },

  sheriff_office: {
    dimensions: { width: 9, depth: 7, wallHeight: 4, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 3.5, width: 1.1, height: 2.1 },
    npcPositions: [
      { x: -1.5, z: 1.0, y: 0, role: 'sheriff', behindCounter: false },
      { x: 2.0, z: -1.0, y: 0, role: 'deputy', behindCounter: false },
    ],
    ambientColor: 0xffcc88,
    ambientIntensity: 0.3,
    lightPositions: [
      { x: 0, y: 2.8, z: 0, color: 0xffcc88, intensity: 0.5, distance: 7 },
    ],
  },

  bank: {
    dimensions: { width: 10, depth: 8, wallHeight: 5, wallThick: 0.25, foundationHeight: 0.6 },
    door: { x: 0, z: 4, width: 1.2, height: 2.3 },
    npcPositions: [
      { x: 0, z: -2.0, y: 0.6, role: 'banker', behindCounter: true },
    ],
    ambientColor: 0xffddcc,
    ambientIntensity: 0.35,
    lightPositions: [
      { x: 0, y: 3.5, z: 0, color: 0xffddcc, intensity: 0.5, distance: 8 },
      { x: 2.5, y: 2.5, z: -2.0, color: 0xffaa66, intensity: 0.3, distance: 4 },
    ],
  },

  inn: {
    dimensions: { width: 10, depth: 8, wallHeight: 6.5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 4, width: 1.2, height: 2.1 },
    npcPositions: [
      { x: -1.5, z: 1.5, y: 0, role: 'innkeeper', behindCounter: true },
    ],
    ambientColor: 0xffcc88,
    ambientIntensity: 0.3,
    lightPositions: [
      { x: 0, y: 2.5, z: 0, color: 0xffcc88, intensity: 0.6, distance: 8 },
      { x: 0, y: 5.5, z: 0, color: 0xffcc88, intensity: 0.4, distance: 6 },
    ],
  },

  church: {
    dimensions: { width: 8, depth: 12, wallHeight: 5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 6, width: 1.2, height: 2.5 },
    npcPositions: [
      { x: 0, z: -5.0, y: 0, role: 'preacher', behindCounter: false },
    ],
    ambientColor: 0xffeedd,
    ambientIntensity: 0.25,
    lightPositions: [
      { x: 0, y: 3.5, z: -3, color: 0xffeedd, intensity: 0.4, distance: 10 },
      { x: -2.5, y: 3.0, z: 0, color: 0xffddaa, intensity: 0.2, distance: 5 },
      { x: 2.5, y: 3.0, z: 0, color: 0xffddaa, intensity: 0.2, distance: 5 },
    ],
  },

  blacksmith: {
    dimensions: { width: 10, depth: 8, wallHeight: 4.5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 4, width: 2.0, height: 4.3 }, // Open front
    npcPositions: [
      { x: 0.5, z: 1.0, y: 0, role: 'blacksmith', behindCounter: false },
    ],
    ambientColor: 0xff6633,
    ambientIntensity: 0.2,
    lightPositions: [
      { x: -2.5, y: 1.5, z: -2.0, color: 0xff4400, intensity: 0.8, distance: 5 },
      { x: 2.0, y: 3.0, z: 0, color: 0xffaa66, intensity: 0.3, distance: 5 },
    ],
  },

  doctor_office: {
    dimensions: { width: 8, depth: 7, wallHeight: 4, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 3.5, width: 1.0, height: 2.0 },
    npcPositions: [
      { x: -2.0, z: 1.0, y: 0, role: 'doctor', behindCounter: false },
    ],
    ambientColor: 0xffffff,
    ambientIntensity: 0.4,
    lightPositions: [
      { x: 0, y: 2.8, z: 0, color: 0xffffff, intensity: 0.5, distance: 7 },
    ],
  },

  newspaper: {
    dimensions: { width: 9, depth: 7, wallHeight: 4, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 3.5, width: 1.1, height: 2.0 },
    npcPositions: [
      { x: -2.0, z: 1.0, y: 0, role: 'editor', behindCounter: false },
    ],
    ambientColor: 0xffddaa,
    ambientIntensity: 0.35,
    lightPositions: [
      { x: 0, y: 2.8, z: 0, color: 0xffddaa, intensity: 0.5, distance: 7 },
    ],
  },

  mining_office: {
    dimensions: { width: 8, depth: 7, wallHeight: 4, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 3.5, width: 1.0, height: 1.9 },
    npcPositions: [
      { x: 0, z: -0.5, y: 0, role: 'mining_foreman', behindCounter: false },
    ],
    ambientColor: 0xffcc88,
    ambientIntensity: 0.3,
    lightPositions: [
      { x: 0, y: 2.8, z: 0, color: 0xffcc88, intensity: 0.5, distance: 7 },
    ],
  },

  livery: {
    dimensions: { width: 12, depth: 10, wallHeight: 5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 5, width: 3.5, height: 2.8 },
    npcPositions: [
      { x: 0, z: 2.0, y: 0, role: 'stablehand', behindCounter: false },
    ],
    ambientColor: 0xffcc88,
    ambientIntensity: 0.2,
    lightPositions: [
      { x: 0, y: 3.5, z: 0, color: 0xffaa66, intensity: 0.4, distance: 10 },
    ],
  },

  telegraph_office: {
    dimensions: { width: 6, depth: 5, wallHeight: 3.5, wallThick: 0.18, foundationHeight: 0 },
    door: { x: 0, z: 2.5, width: 0.9, height: 1.9 },
    npcPositions: [
      { x: 0, z: -1.2, y: 0, role: 'telegraph_operator', behindCounter: false },
    ],
    ambientColor: 0xffddaa,
    ambientIntensity: 0.35,
    lightPositions: [
      { x: 0, y: 2.5, z: 0, color: 0xffddaa, intensity: 0.5, distance: 5 },
    ],
  },

  undertaker: {
    dimensions: { width: 8, depth: 7, wallHeight: 4, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 3.5, width: 1.0, height: 2.0 },
    npcPositions: [
      { x: 2.0, z: -2.0, y: 0, role: 'undertaker', behindCounter: false },
    ],
    ambientColor: 0xccaa88,
    ambientIntensity: 0.2,
    lightPositions: [
      { x: 0, y: 2.8, z: 0, color: 0xccaa88, intensity: 0.4, distance: 7 },
    ],
  },

  barber: {
    dimensions: { width: 7, depth: 6, wallHeight: 3.8, wallThick: 0.18, foundationHeight: 0 },
    door: { x: 0, z: 3, width: 0.9, height: 1.9 },
    npcPositions: [
      { x: -1.2, z: -0.5, y: 0, role: 'barber', behindCounter: false },
    ],
    ambientColor: 0xffeedd,
    ambientIntensity: 0.35,
    lightPositions: [
      { x: 0, y: 2.6, z: 0, color: 0xffeedd, intensity: 0.5, distance: 6 },
    ],
  },
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get interior metadata for a given archetype type.
 * Returns null if the archetype is not registered (e.g. water_tower).
 */
export function getInteriorMetadata(archetypeId: string): InteriorMetadata | null {
  return INTERIOR_METADATA[archetypeId] ?? null;
}

/**
 * Get the door position in world space given a building's world position and rotation.
 */
export function getDoorWorldPosition(
  archetypeId: string,
  buildingX: number,
  buildingZ: number,
  buildingRotation: number,
): { x: number; y: number; z: number } | null {
  const meta = INTERIOR_METADATA[archetypeId];
  if (!meta) return null;

  const door = meta.door;
  const cosR = Math.cos(buildingRotation);
  const sinR = Math.sin(buildingRotation);

  // Rotate door offset by building rotation
  const worldX = buildingX + door.x * cosR - door.z * sinR;
  const worldZ = buildingZ + door.x * sinR + door.z * cosR;
  const worldY = meta.dimensions.foundationHeight;

  return { x: worldX, y: worldY, z: worldZ };
}

/**
 * Get NPC world positions inside a building.
 */
export function getInteriorNPCWorldPositions(
  archetypeId: string,
  buildingX: number,
  buildingZ: number,
  buildingRotation: number,
): Array<{ x: number; y: number; z: number; role: string; behindCounter: boolean }> {
  const meta = INTERIOR_METADATA[archetypeId];
  if (!meta) return [];

  const cosR = Math.cos(buildingRotation);
  const sinR = Math.sin(buildingRotation);

  return meta.npcPositions.map((npc) => ({
    x: buildingX + npc.x * cosR - npc.z * sinR,
    y: npc.y,
    z: buildingZ + npc.x * sinR + npc.z * cosR,
    role: npc.role,
    behindCounter: npc.behindCounter,
  }));
}

/**
 * Add interior lighting to a building group.
 * Call this after the archetype's construct() to add warm point lights.
 */
export function addInteriorLighting(
  buildingGroup: Group,
  archetypeId: string,
): void {
  const meta = INTERIOR_METADATA[archetypeId];
  if (!meta) return;

  // Find or create an interior group
  let interiorGroup = buildingGroup.getObjectByName('interior') as Group | undefined;
  if (!interiorGroup) {
    interiorGroup = buildingGroup;
  }

  // Check if lights already added (idempotent)
  const existingLight = interiorGroup.getObjectByName('interior-light-0');
  if (existingLight) return;

  for (let i = 0; i < meta.lightPositions.length; i++) {
    const lp = meta.lightPositions[i];
    const light = new PointLight(lp.color, lp.intensity, lp.distance);
    light.position.set(lp.x, lp.y, lp.z);
    light.name = `interior-light-${i}`;
    light.castShadow = false; // Interior shadows are expensive
    interiorGroup.add(light);
  }
}

/**
 * Check whether an archetype type has a walkable interior.
 */
export function hasInterior(archetypeId: string): boolean {
  return archetypeId in INTERIOR_METADATA;
}

/**
 * Get all registered archetype IDs that have interiors.
 */
export function getInteriorArchetypeIds(): string[] {
  return Object.keys(INTERIOR_METADATA);
}
