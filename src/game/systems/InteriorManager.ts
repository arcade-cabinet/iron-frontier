/**
 * InteriorManager.ts - Tracks exterior/interior state transitions
 *
 * Manages whether the player is currently inside a building or out in
 * the open world. When entering a building, reads NPC slot data from
 * the building archetype and exposes positioned interior NPCs for the
 * scene to render.
 *
 * Singleton pattern matches EncounterSystem and other game systems.
 *
 * @module systems/InteriorManager
 */

import type { BuildingSlots } from '../engine/archetypes/types';

// ============================================================================
// TYPES
// ============================================================================

/** Position and role of an NPC slot inside a building. */
export interface InteriorNPCSlot {
  /** Position relative to the building origin. */
  x: number;
  z: number;
  /** The NPC role expected to fill this slot (e.g. 'merchant', 'bartender'). */
  role: string;
  /** Resolved NPC ID, if one has been assigned. */
  npcId?: string;
}

/** Data describing the current interior the player is in. */
export interface InteriorState {
  /** The instance ID of the building the player entered. */
  buildingId: string;
  /** The archetype type key (e.g. 'saloon', 'general_store'). */
  archetypeId: string;
  /** NPC slots positioned inside this building. */
  npcSlots: InteriorNPCSlot[];
  /** When the player entered (for tracking time spent). */
  enteredAt: number;
}

/** Callback signature for interior state change listeners. */
export type InteriorChangeCallback = (interior: InteriorState | null) => void;

// ============================================================================
// ARCHETYPE NPC SLOT REGISTRY
// ============================================================================

/**
 * Default NPC slot positions by archetype type.
 * Each slot defines where an NPC should stand and what role they fill.
 * These are relative to the building origin.
 */
const ARCHETYPE_NPC_SLOTS: Record<string, Array<{ x: number; z: number; role: string }>> = {
  saloon: [
    { x: 0, z: -2.5, role: 'bartender' },
    { x: -3, z: 1, role: 'gambler' },
    { x: 3, z: 1, role: 'drifter' },
  ],
  general_store: [
    { x: 0, z: -2.5, role: 'merchant' },
  ],
  sheriff_office: [
    { x: -1.5, z: 1.0, role: 'sheriff' },
    { x: 2.0, z: -1.0, role: 'deputy' },
  ],
  bank: [
    { x: 0, z: -2.0, role: 'banker' },
  ],
  inn: [
    { x: -1.5, z: 1.5, role: 'innkeeper' },
  ],
  church: [
    { x: 0, z: -5.0, role: 'preacher' },
  ],
  blacksmith: [
    { x: 0.5, z: 1.0, role: 'blacksmith' },
  ],
  doctor_office: [
    { x: -2.0, z: 1.0, role: 'doctor' },
  ],
  newspaper: [
    { x: -2.0, z: 1.0, role: 'editor' },
  ],
  mining_office: [
    { x: 0, z: -0.5, role: 'mining_foreman' },
  ],
  livery: [
    { x: 0, z: 2.0, role: 'stablehand' },
  ],
  telegraph_office: [
    { x: 0, z: -1.2, role: 'telegraph_operator' },
  ],
  undertaker: [
    { x: 2.0, z: -2.0, role: 'undertaker' },
  ],
  barber: [
    { x: -1.2, z: -0.5, role: 'barber' },
  ],
  stable: [
    { x: 0, z: -2, role: 'rancher' },
  ],
  house_small: [],
  house_large: [],
};

// ============================================================================
// MANAGER CLASS
// ============================================================================

export class InteriorManager {
  private static instance: InteriorManager | null = null;

  private currentInterior: InteriorState | null = null;
  private listeners = new Set<InteriorChangeCallback>();

  private constructor() {}

  static getInstance(): InteriorManager {
    if (!InteriorManager.instance) {
      InteriorManager.instance = new InteriorManager();
    }
    return InteriorManager.instance;
  }

  /** Reset the singleton (useful for tests and hot-reload). */
  static resetInstance(): void {
    if (InteriorManager.instance) {
      InteriorManager.instance.dispose();
      InteriorManager.instance = null;
    }
  }

  // --------------------------------------------------------------------------
  // State transitions
  // --------------------------------------------------------------------------

  /**
   * Enter a building interior.
   *
   * @param buildingId   - The instance ID of the building being entered.
   * @param archetypeId  - The archetype type key (e.g. 'saloon').
   * @param slotsOverride - Optional BuildingSlots with NPC position overrides.
   */
  enterBuilding(
    buildingId: string,
    archetypeId: string,
    slotsOverride?: BuildingSlots,
  ): void {
    // Resolve NPC slots from archetype defaults or overrides
    const defaultSlots = ARCHETYPE_NPC_SLOTS[archetypeId] ?? [];
    const overridePositions = slotsOverride?.npcPositions;

    const npcSlots: InteriorNPCSlot[] = (overridePositions ?? defaultSlots).map((slot) => ({
      x: slot.x,
      z: slot.z,
      role: slot.role,
    }));

    this.currentInterior = {
      buildingId,
      archetypeId,
      npcSlots,
      enteredAt: Date.now(),
    };

    this.notifyListeners();
    console.log(
      `[InteriorManager] Entered ${archetypeId} (${buildingId}) with ${npcSlots.length} NPC slots`,
    );
  }

  /**
   * Exit the current building and return to the exterior.
   */
  exitBuilding(): void {
    if (!this.currentInterior) return;

    const prev = this.currentInterior;
    this.currentInterior = null;
    this.notifyListeners();

    console.log(`[InteriorManager] Exited ${prev.archetypeId} (${prev.buildingId})`);
  }

  // --------------------------------------------------------------------------
  // Queries
  // --------------------------------------------------------------------------

  /** Whether the player is currently inside a building. */
  isInInterior(): boolean {
    return this.currentInterior !== null;
  }

  /** Whether the player is currently in the exterior (open world). */
  isInExterior(): boolean {
    return this.currentInterior === null;
  }

  /** Get the current interior state, or null if the player is outside. */
  getCurrentInterior(): InteriorState | null {
    return this.currentInterior;
  }

  /** Get the archetype ID of the current interior, or null. */
  getCurrentArchetypeId(): string | null {
    return this.currentInterior?.archetypeId ?? null;
  }

  /** Get the NPC slots for the current interior, or empty array. */
  getInteriorNPCSlots(): InteriorNPCSlot[] {
    return this.currentInterior?.npcSlots ?? [];
  }

  /**
   * Assign a specific NPC to an interior slot by role.
   * Returns true if a matching slot was found and assigned.
   */
  assignNPCToSlot(role: string, npcId: string): boolean {
    if (!this.currentInterior) return false;

    const slot = this.currentInterior.npcSlots.find(
      (s) => s.role === role && !s.npcId,
    );
    if (!slot) return false;

    slot.npcId = npcId;
    return true;
  }

  // --------------------------------------------------------------------------
  // Listeners
  // --------------------------------------------------------------------------

  /** Subscribe to interior state changes. Returns an unsubscribe function. */
  onChange(callback: InteriorChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    for (const cb of this.listeners) {
      cb(this.currentInterior);
    }
  }

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  dispose(): void {
    this.currentInterior = null;
    this.listeners.clear();
  }
}

// ============================================================================
// SINGLETON ACCESSOR
// ============================================================================

/** Get the shared InteriorManager instance. */
export function getInteriorManager(): InteriorManager {
  return InteriorManager.getInstance();
}

/** Reset the InteriorManager singleton (for tests). */
export function resetInteriorManager(): void {
  InteriorManager.resetInstance();
}
