/**
 * StealthSystem - Calculates player detection level based on proximity to hostiles
 *
 * Detection formula:
 *   base = inverseLerp(detectionRange, 0, distanceToNearestHostile) * 100
 *
 * Modifiers (multiplicative):
 *   - Crouching:  -30% detection
 *   - Night time: -20% detection
 *   - Moving:     +20% detection
 *   - Sprinting:  +40% detection
 *
 * Detection decays at 15 units/sec when no hostiles are nearby.
 * Detection grows at 25 units/sec when hostiles are in range.
 *
 * The system does NOT run in towns (no hostiles).
 *
 * @module game/systems/StealthSystem
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** Distance (world units) at which detection starts increasing */
const DETECTION_RANGE = 40;

/** Minimum distance — at this range, base detection is 100% */
const MIN_DETECTION_DISTANCE = 3;

/** How fast detection level rises (units per second) */
const DETECTION_RISE_RATE = 25;

/** How fast detection level decays (units per second) */
const DETECTION_DECAY_RATE = 15;

/** Crouch modifier — reduces detection by this factor */
const CROUCH_MODIFIER = 0.7;

/** Night modifier — reduces detection by this factor */
const NIGHT_MODIFIER = 0.8;

/** Moving modifier — increases detection by this factor */
const MOVING_MODIFIER = 1.2;

/** Sprinting modifier — increases detection by this factor */
const SPRINTING_MODIFIER = 1.4;

// ============================================================================
// TYPES
// ============================================================================

export interface StealthTickInput {
  /** Player world position */
  playerPosition: { x: number; y: number; z: number };
  /** Whether the player is crouching */
  isCrouching: boolean;
  /** Whether the player is currently moving (has nonzero velocity) */
  isMoving: boolean;
  /** Whether the player is sprinting */
  isSprinting: boolean;
  /** Whether it is night time */
  isNight: boolean;
  /** Current detection level (0-100) */
  currentDetection: number;
  /** Delta time in seconds */
  dt: number;
  /** Positions of all hostile entities */
  hostilePositions: Array<{ x: number; y: number; z: number }>;
}

export interface StealthTickResult {
  /** New detection level (0-100) */
  detectionLevel: number;
  /** Distance to nearest hostile (-1 if none) */
  nearestHostileDistance: number;
}

// ============================================================================
// CALCULATION
// ============================================================================

/**
 * Compute the distance between two 3D positions (XZ plane only — Y is ignored
 * because enemies can be at different elevations on terrain).
 */
function distanceXZ(
  a: { x: number; z: number },
  b: { x: number; z: number },
): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Run one stealth tick.
 *
 * Pure function — no side effects. The caller (GameOrchestrator) is responsible
 * for writing the result back to the store.
 */
export function tickStealth(input: StealthTickInput): StealthTickResult {
  const {
    playerPosition,
    isCrouching,
    isMoving,
    isSprinting,
    isNight,
    currentDetection,
    dt,
    hostilePositions,
  } = input;

  // No hostiles — decay toward zero
  if (hostilePositions.length === 0) {
    const decayed = Math.max(0, currentDetection - DETECTION_DECAY_RATE * dt);
    return { detectionLevel: decayed, nearestHostileDistance: -1 };
  }

  // Find nearest hostile
  let nearest = Infinity;
  for (const pos of hostilePositions) {
    const d = distanceXZ(playerPosition, pos);
    if (d < nearest) nearest = d;
  }

  // If nearest hostile is beyond detection range, decay
  if (nearest > DETECTION_RANGE) {
    const decayed = Math.max(0, currentDetection - DETECTION_DECAY_RATE * dt);
    return { detectionLevel: decayed, nearestHostileDistance: nearest };
  }

  // Calculate target detection from distance
  // Clamp distance to [MIN_DETECTION_DISTANCE, DETECTION_RANGE]
  const clampedDist = Math.max(MIN_DETECTION_DISTANCE, Math.min(DETECTION_RANGE, nearest));
  // inverseLerp: 1.0 at MIN_DETECTION_DISTANCE, 0.0 at DETECTION_RANGE
  const rawTarget =
    (1 - (clampedDist - MIN_DETECTION_DISTANCE) / (DETECTION_RANGE - MIN_DETECTION_DISTANCE)) * 100;

  // Apply modifiers
  let modifier = 1.0;
  if (isCrouching) modifier *= CROUCH_MODIFIER;
  if (isNight) modifier *= NIGHT_MODIFIER;
  if (isSprinting) {
    modifier *= SPRINTING_MODIFIER;
  } else if (isMoving) {
    modifier *= MOVING_MODIFIER;
  }

  const target = Math.min(100, rawTarget * modifier);

  // Lerp current detection toward target
  let newDetection: number;
  if (target > currentDetection) {
    // Rising
    newDetection = Math.min(target, currentDetection + DETECTION_RISE_RATE * dt);
  } else {
    // Falling
    newDetection = Math.max(target, currentDetection - DETECTION_DECAY_RATE * dt);
  }

  return {
    detectionLevel: Math.max(0, Math.min(100, newDetection)),
    nearestHostileDistance: nearest,
  };
}
