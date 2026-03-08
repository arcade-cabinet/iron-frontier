// NPCEntity — R3F component that renders a chibi NPC in the scene
//
// Constructs the chibi geometry once via useMemo, then animates idle
// behaviours each frame: gentle breathing bob and occasional head turns.

import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import Alea from 'alea';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import {
  constructChibi,
  type ChibiConfig,
} from '@/src/game/engine/renderers/ChibiRenderer';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NPCEntityProps {
  /** Full chibi configuration for appearance. */
  config: ChibiConfig;
  /** World position [x, y, z]. */
  position: [number, number, number];
  /** Display name shown above the character's head. */
  name: string;
  /** Facing rotation in radians around Y. */
  rotation?: number;
  /** Deterministic seed for animation variation. */
  seed?: string;
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NPCEntity({
  config,
  position,
  name,
  rotation = 0,
  seed = 'npc-anim',
}: NPCEntityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D | null>(null);
  const animState = useRef({ breathPhase: 0, headTimer: 0, headTarget: 0, headCurrent: 0 });

  // Build a per-instance PRNG so each NPC has distinct animation timing
  const rng = useMemo(() => Alea(seed), [seed]);

  // Offset the starting breath phase so NPCs don't bob in sync
  const breathOffset = useMemo(() => rng() * Math.PI * 2, [rng]);

  // Construct chibi geometry (memoised — only rebuilds if config changes)
  const chibiGroup = useMemo(() => {
    const group = constructChibi(config);

    // Grab a ref to the head subgroup for turn animation
    const head = group.getObjectByName('head');
    headRef.current = head ?? null;

    return group;
  }, [config]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const anim = animState.current;

    // --- Breathing bob ---
    anim.breathPhase += delta * BREATH_SPEED;
    const breathY = Math.sin(anim.breathPhase + breathOffset) * BREATH_AMPLITUDE;
    group.position.y = position[1] + breathY;

    // --- Occasional head turn ---
    anim.headTimer += delta;
    if (anim.headTimer > HEAD_TURN_PAUSE) {
      anim.headTimer = 0;
      // Pick a new random target angle
      anim.headTarget = (rng() - 0.5) * 2 * HEAD_TURN_MAX;
    }

    // Smoothly ease head toward target
    anim.headCurrent += (anim.headTarget - anim.headCurrent) * delta * HEAD_TURN_SPEED * 3;

    const head = headRef.current;
    if (head) {
      head.rotation.y = anim.headCurrent;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      rotation={[0, rotation, 0]}
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
