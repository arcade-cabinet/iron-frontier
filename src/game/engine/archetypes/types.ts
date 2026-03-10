// Building archetype interfaces
// Every procedural building implements BuildingArchetype and is registered
// in the ARCHETYPE_REGISTRY so the R3F <Building> component can look it up.

import type { Group } from 'three';

/** Slot overrides passed into a building archetype at construction time. */
export interface BuildingSlots {
  /** Text rendered on the sign above the door. */
  signText?: string;
  /** Override the default color palette (base, trim, accent). */
  colorPalette?: string[];
  /** Item types to place inside (e.g. 'barrel', 'crate'). */
  interiorItems?: string[];
  /** NPC spawn positions relative to the building origin. */
  npcPositions?: Array<{ x: number; z: number; role: string }>;
}

/** Contract every procedural building archetype must implement. */
export interface BuildingArchetype {
  /** Unique type key matching the archetype registry (e.g. 'saloon'). */
  readonly type: string;
  /** Build the full THREE.Group for this archetype with the given slot overrides. */
  construct(slots: BuildingSlots): Group;
}
