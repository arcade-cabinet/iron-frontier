/**
 * InteriorGenerator public API — Query metadata, compute world positions,
 * and add interior lighting to building groups.
 *
 * @module engine/interiors/InteriorGenerator/api
 */

import { PointLight, type Group } from 'three';

import type { InteriorMetadata } from './types.ts';
import { INTERIOR_METADATA } from './metadata.ts';

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
