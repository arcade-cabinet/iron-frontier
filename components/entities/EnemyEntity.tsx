// EnemyEntity — R3F component that renders an enemy in the scene
//
// Constructs the enemy geometry once via MonsterFactory (memoised),
// plays idle animations via useFrame, and shows a floating health bar
// with an optional name label above.

import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import Alea from 'alea';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import {
  constructEnemy,
  type EnemyType,
} from '@/src/game/engine/renderers/MonsterFactory';
import {
  createAnimState,
  tickIdleAnimation,
  type EnemyAnimState,
} from '@/src/game/engine/renderers/EnemyAnimations';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EnemyEntityProps {
  /** Which enemy archetype to render. */
  enemyType: EnemyType;
  /** World position [x, y, z]. */
  position: [number, number, number];
  /** Deterministic seed for visual variation and animation phase. */
  seed: string;
  /** Display name shown above the enemy. */
  name?: string;
  /** Current health (0-1 normalised). Drives the health bar fill. */
  healthPercent?: number;
  /** Facing rotation in radians around Y. */
  rotation?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HEALTH_BAR_WIDTH = 0.5;
const HEALTH_BAR_HEIGHT = 0.06;
const HEALTH_BAR_Y = 2.4;
const NAME_Y_OFFSET = 2.55;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EnemyEntity({
  enemyType,
  position,
  seed,
  name,
  healthPercent = 1,
  rotation = 0,
}: EnemyEntityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const animState = useRef<EnemyAnimState>(createAnimState());

  // Per-instance PRNG for animation timing variety
  const rng = useMemo(() => Alea(seed), [seed]);
  const phaseOffset = useMemo(() => rng() * Math.PI * 2, [rng]);

  // Construct enemy geometry — only rebuilds if type/seed change
  const enemyGroup = useMemo(
    () => constructEnemy(enemyType, seed),
    [enemyType, seed],
  );

  // Animate every frame
  useFrame((_state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    tickIdleAnimation(
      enemyType,
      enemyGroup,
      animState.current,
      delta,
      phaseOffset,
    );
  });

  // Health bar geometry (built once, fill controlled via scale)
  const healthBar = useMemo(() => {
    const group = new THREE.Group();
    group.name = 'healthBar';

    // Background (dark)
    const bgGeo = new THREE.PlaneGeometry(HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.7,
    });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    group.add(bg);

    // Fill (red)
    const fillGeo = new THREE.PlaneGeometry(HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
    const fillMat = new THREE.MeshBasicMaterial({ color: 0xcc2222 });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.z = 0.001;
    fill.name = 'healthFill';
    group.add(fill);

    // Border outline
    const borderGeo = new THREE.PlaneGeometry(
      HEALTH_BAR_WIDTH + 0.02,
      HEALTH_BAR_HEIGHT + 0.02,
    );
    const borderMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8,
    });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.z = -0.001;
    group.add(border);

    return group;
  }, []);

  // Update health fill scale and position each render
  const pct = Math.max(0, Math.min(1, healthPercent));
  const fill = healthBar.getObjectByName('healthFill');
  if (fill) {
    fill.scale.x = pct;
    fill.position.x = -(1 - pct) * HEALTH_BAR_WIDTH * 0.5;
  }

  // Health bar color based on remaining health
  if (fill && fill instanceof THREE.Mesh) {
    const mat = fill.material as THREE.MeshBasicMaterial;
    if (pct > 0.5) {
      mat.color.setHex(0xcc2222);
    } else if (pct > 0.25) {
      mat.color.setHex(0xcc8822);
    } else {
      mat.color.setHex(0xcc2222);
    }
  }

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      rotation={[0, rotation, 0]}
    >
      <primitive object={enemyGroup} />

      {/* Floating health bar */}
      <primitive object={healthBar} position={[0, HEALTH_BAR_Y, 0]} />

      {/* Floating name label */}
      {name && (
        <Text
          position={[0, NAME_Y_OFFSET, 0]}
          fontSize={0.13}
          color="#FF4444"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#000000"
          font={undefined}
        >
          {name}
        </Text>
      )}
    </group>
  );
}
