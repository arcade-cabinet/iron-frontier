/**
 * Iron Frontier - ECS Component Definitions
 *
 * Component types for the Miniplex entity-component system.
 * ECS handles dynamic runtime entities ONLY: NPCs, projectiles,
 * pickups, active enemies. Static world geometry is NOT in ECS.
 */

import type * as THREE from 'three';

// ============================================================================
// SPATIAL COMPONENTS
// ============================================================================

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Velocity {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  yaw: number;
  pitch: number;
}

// ============================================================================
// COMBAT COMPONENTS
// ============================================================================

export interface Health {
  current: number;
  max: number;
}

export interface Loot {
  items: Array<{ itemId: string; chance: number; quantity: number }>;
}

export interface Projectile {
  weaponId: string;
  damage: number;
  speed: number;
  origin: Position;
  direction: Position;
  lifetime: number;
  age: number;
}

// ============================================================================
// AI COMPONENTS
// ============================================================================

export type AIBehaviorType = 'patrol' | 'pursue' | 'flee' | 'idle' | 'guard';

export interface AIBehavior {
  type: AIBehaviorType;
  target?: string;
  waypoints?: Position[];
  currentWaypointIndex?: number;
  decisionCooldown?: number;
}

// ============================================================================
// RENDERING COMPONENTS
// ============================================================================

export interface Renderable {
  meshGroup: THREE.Group;
  visible: boolean;
}

export interface Collider {
  type: 'sphere' | 'box' | 'capsule';
  radius?: number;
  halfExtents?: Position;
}

// ============================================================================
// SOCIAL / NPC COMPONENTS
// ============================================================================

export interface Faction {
  id: string;
  reputation: number;
}

export interface DialogueTarget {
  npcId: string;
  dialogueTreeId: string;
}

export interface QuestGiver {
  questIds: string[];
}

export interface ShopKeeper {
  shopId: string;
}

export interface NPCSchedule {
  currentActivity: string;
  homePosition: Position;
  /** Schedule template ID used by NPCScheduleResolver */
  scheduleTemplateId?: string;
  /** Building/area this NPC is assigned to */
  assignedTo?: string;
  /** Whether the NPC is currently indoors */
  isIndoors?: boolean;
  /** Whether the NPC is available for interaction */
  isAvailable?: boolean;
  /** Target position from schedule resolver */
  targetPosition?: Position;
  /** Dialogue override for the current time period */
  dialogueOverride?: string;
}

// ============================================================================
// ITEM COMPONENTS
// ============================================================================

export interface Pickup {
  itemId: string;
  quantity: number;
}

// ============================================================================
// LIFECYCLE COMPONENTS
// ============================================================================

export interface Lifetime {
  remaining: number;
}

export interface Particle {
  type: string;
  startSize: number;
  endSize: number;
  color: string;
}

// ============================================================================
// ENTITY ARCHETYPE
// ============================================================================

/**
 * The union entity type used by Miniplex World.
 * All fields are optional; presence of a component determines behavior.
 * Miniplex queries select entities by which components they have.
 */
export interface Entity {
  // Spatial
  position?: Position;
  velocity?: Velocity;
  rotation?: Rotation;

  // Combat
  health?: Health;
  loot?: Loot;
  projectile?: Projectile;

  // AI
  aiBehavior?: AIBehavior;

  // Rendering
  renderable?: Renderable;
  collider?: Collider;

  // Social / NPC
  faction?: Faction;
  dialogueTarget?: DialogueTarget;
  questGiver?: QuestGiver;
  shopKeeper?: ShopKeeper;
  npcSchedule?: NPCSchedule;

  // Items
  pickup?: Pickup;

  // Lifecycle
  lifetime?: Lifetime;
  particle?: Particle;

  // Identity
  name?: string;
  tag?: string;
}
