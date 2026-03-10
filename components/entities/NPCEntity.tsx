// NPCEntity — R3F component that renders a chibi NPC in the scene
//
// Supports two modes:
// 1. Static: original behavior with fixed position
// 2. Schedule-driven: reads from NPCMovementState for smooth movement
//
// Constructs the chibi geometry once via useMemo, then animates:
// - Breathing bob (always)
// - Occasional head turns (when idle)
// - Smooth position interpolation (when moving via schedule)
// - Walk animation: arm/leg swing when speed > 0
// - Rotation facing movement direction

import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import Alea from "alea";
import { useMemo, useRef } from "react";
import type * as THREE from "three";

import { type ChibiConfig, constructChibi } from "@/src/game/engine/renderers/ChibiRenderer";
import type { NPCMovementState } from "@/src/game/systems/NPCMovementSystem";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NPCEntityProps {
  /** Full chibi configuration for appearance. */
  config: ChibiConfig;
  /** World position [x, y, z] — used as initial/fallback position. */
  position: [number, number, number];
  /** Display name shown above the character's head. */
  name: string;
  /** Facing rotation in radians around Y (used when no movementState). */
  rotation?: number;
  /** Deterministic seed for animation variation. */
  seed?: string;
  /**
   * Optional movement state from NPCMovementSystem.
   * When provided, the NPC will smoothly move and rotate based on schedule.
   * When absent, the NPC uses the static position/rotation props.
   */
  movementState?: NPCMovementState;
  /**
   * Whether the NPC is hidden (e.g., sleeping indoors).
   * Hidden NPCs are not rendered at all.
   */
  hidden?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BREATH_SPEED = 1.8;
const BREATH_AMPLITUDE = 0.02;
const HEAD_TURN_SPEED = 0.6;
const HEAD_TURN_MAX = 0.26; // ~15 degrees
const HEAD_TURN_PAUSE = 3.0; // seconds between turns
const NAME_Y_OFFSET = 2.25; // above feet

// Walk animation constants
const WALK_SWING_SPEED = 8.0; // oscillation speed when walking
const ARM_SWING_MAX = 0.4; // radians
const LEG_SWING_MAX = 0.35; // radians

// Position smoothing
const POSITION_LERP_SPEED = 6.0; // how quickly to interpolate position

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NPCEntity({
  config,
  position,
  name,
  rotation = 0,
  seed = "npc-anim",
  movementState,
  hidden = false,
}: NPCEntityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D | null>(null);
  const leftArmRef = useRef<THREE.Object3D | null>(null);
  const rightArmRef = useRef<THREE.Object3D | null>(null);
  const leftLegRef = useRef<THREE.Object3D | null>(null);
  const rightLegRef = useRef<THREE.Object3D | null>(null);

  const animState = useRef({
    breathPhase: 0,
    headTimer: 0,
    headTarget: 0,
    headCurrent: 0,
    walkPhase: 0,
    // Smoothed position for interpolation -- initialize from movementState
    // when available so there's no initial teleport from spawn to schedule pos.
    smoothX: movementState?.currentPosition.x ?? position[0],
    smoothY: movementState?.currentPosition.y ?? position[1],
    smoothZ: movementState?.currentPosition.z ?? position[2],
    smoothYaw: movementState?.facingYaw ?? rotation,
  });

  // Build a per-instance PRNG so each NPC has distinct animation timing
  const rng = useMemo(() => Alea(seed), [seed]);

  // Offset the starting breath phase so NPCs don't bob in sync
  const breathOffset = useMemo(() => rng() * Math.PI * 2, [rng]);

  // Construct chibi geometry (memoised -- only rebuilds if config changes)
  const chibiGroup = useMemo(() => {
    const group = constructChibi(config);

    // Grab refs to animated subgroups
    headRef.current = group.getObjectByName("head") ?? null;
    leftArmRef.current = group.getObjectByName("left_arm") ?? null;
    rightArmRef.current = group.getObjectByName("right_arm") ?? null;
    leftLegRef.current = group.getObjectByName("left_leg") ?? null;
    rightLegRef.current = group.getObjectByName("right_leg") ?? null;

    return group;
  }, [config]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const anim = animState.current;

    // Determine target position and rotation from movement state or props
    let targetX: number;
    let targetY: number;
    let targetZ: number;
    let targetYaw: number;
    let isMoving: boolean;

    if (movementState) {
      targetX = movementState.currentPosition.x;
      targetY = movementState.currentPosition.y;
      targetZ = movementState.currentPosition.z;
      targetYaw = movementState.facingYaw;
      isMoving = movementState.speed > 0.1;
    } else {
      targetX = position[0];
      targetY = position[1];
      targetZ = position[2];
      targetYaw = rotation;
      isMoving = false;
    }

    // Smooth position interpolation
    const lerpFactor = Math.min(POSITION_LERP_SPEED * delta, 1);
    anim.smoothX += (targetX - anim.smoothX) * lerpFactor;
    anim.smoothY += (targetY - anim.smoothY) * lerpFactor;
    anim.smoothZ += (targetZ - anim.smoothZ) * lerpFactor;

    // Smooth rotation interpolation (handle angle wrapping)
    let yawDiff = targetYaw - anim.smoothYaw;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    anim.smoothYaw += yawDiff * lerpFactor;

    // --- Breathing bob ---
    anim.breathPhase += delta * BREATH_SPEED;
    const breathY = Math.sin(anim.breathPhase + breathOffset) * BREATH_AMPLITUDE;

    // Apply position
    group.position.x = anim.smoothX;
    group.position.y = anim.smoothY + breathY;
    group.position.z = anim.smoothZ;

    // Apply rotation
    group.rotation.y = anim.smoothYaw;

    // --- Walk animation ---
    if (isMoving) {
      anim.walkPhase += delta * WALK_SWING_SPEED;
      const swing = Math.sin(anim.walkPhase);

      // Animate arms (opposite phase)
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = swing * ARM_SWING_MAX;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -swing * ARM_SWING_MAX;
      }

      // Animate legs
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = -swing * LEG_SWING_MAX;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = swing * LEG_SWING_MAX;
      }

      // Subtle head bobbing while walking
      anim.headTimer = 0;
      anim.headTarget = 0;
    } else {
      // Return limbs to rest
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x *= 0.9;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x *= 0.9;
      }
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x *= 0.9;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x *= 0.9;
      }

      anim.walkPhase = 0;

      // --- Occasional head turn (idle only) ---
      anim.headTimer += delta;
      if (anim.headTimer > HEAD_TURN_PAUSE) {
        anim.headTimer = 0;
        anim.headTarget = (rng() - 0.5) * 2 * HEAD_TURN_MAX;
      }
    }

    // Smoothly ease head toward target
    anim.headCurrent += (anim.headTarget - anim.headCurrent) * delta * HEAD_TURN_SPEED * 3;

    const head = headRef.current;
    if (head) {
      head.rotation.y = anim.headCurrent;
    }
  });

  if (hidden) return null;

  return (
    <group
      ref={groupRef}
      position={[
        movementState?.currentPosition.x ?? position[0],
        movementState?.currentPosition.y ?? position[1],
        movementState?.currentPosition.z ?? position[2],
      ]}
      rotation={[0, movementState?.facingYaw ?? rotation, 0]}
    >
      <primitive object={chibiGroup} />

      {/* Floating name label */}
      <Text
        position={[0, NAME_Y_OFFSET, 0]}
        fontSize={0.14}
        color="#FFFFFF"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.012}
        outlineColor="#000000"
        font={undefined}
      >
        {name}
      </Text>
    </group>
  );
}
