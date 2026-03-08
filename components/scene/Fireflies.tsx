// Fireflies — Night-time particle effect using instanced rendering.
//
// Small glowing spheres with emissive yellow-green material, random drift
// via alea-seeded positions, and sine-wave float motion. Fade in/out
// based on night factor (0 during day, 1 at full night).

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import Alea from 'alea';
import * as THREE from 'three';

import { FIREFLY_CONFIG } from '@/engine/renderers/AtmosphericEffects';

export interface FirefliesProps {
  /** 0 = day (invisible), 1 = full night (fully visible) */
  nightFactor: number;
  /** PRNG seed for deterministic positions */
  seed?: string;
}

interface FireflyData {
  basePosition: THREE.Vector3;
  phase: number;
  phaseSpeed: number;
  driftAngle: number;
  driftSpeed: number;
  pulsePhase: number;
  pulseSpeed: number;
}

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export function Fireflies({ nightFactor, seed = 'iron-frontier-fireflies' }: FirefliesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const elapsedRef = useRef(0);

  const { count, size, color, emissiveIntensity, heightRange, floatAmplitude, floatFrequency, driftSpeed, radius, pulseFrequency } = FIREFLY_CONFIG;

  // Generate deterministic firefly data
  const fireflies = useMemo<FireflyData[]>(() => {
    const rng = Alea(seed) as unknown as () => number;
    const result: FireflyData[] = [];

    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * radius;
      const y = heightRange[0] + rng() * (heightRange[1] - heightRange[0]);

      result.push({
        basePosition: new THREE.Vector3(
          Math.cos(angle) * dist,
          y,
          Math.sin(angle) * dist,
        ),
        phase: rng() * Math.PI * 2,
        phaseSpeed: floatFrequency * (0.7 + rng() * 0.6),
        driftAngle: rng() * Math.PI * 2,
        driftSpeed: driftSpeed * (0.5 + rng() * 1.0),
        pulsePhase: rng() * Math.PI * 2,
        pulseSpeed: pulseFrequency * (0.6 + rng() * 0.8),
      });
    }

    return result;
  }, [seed, count, radius, heightRange, floatAmplitude, floatFrequency, driftSpeed, pulseFrequency]);

  // Material — emissive glow, no lighting needed
  const material = useMemo(() => {
    _color.set(color);
    return new THREE.MeshBasicMaterial({
      color: _color,
      transparent: true,
      opacity: 0,
      toneMapped: false,
      depthWrite: false,
    });
  }, [color]);

  // Geometry
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(size, 6, 6);
  }, [size]);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    // Skip entirely when invisible
    if (nightFactor < 0.01) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;

    elapsedRef.current += delta;
    const t = elapsedRef.current;

    // Update material opacity
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = nightFactor * 0.8;
    // Boost color brightness with night factor
    _color.set(color).multiplyScalar(emissiveIntensity * nightFactor);
    mat.color.copy(_color);

    // Update each instance transform
    for (let i = 0; i < fireflies.length; i++) {
      const f = fireflies[i];

      // Gentle sine-wave float
      const floatY = Math.sin(t * f.phaseSpeed + f.phase) * floatAmplitude;

      // Slow circular drift
      const driftX = Math.cos(t * f.driftSpeed * 0.1 + f.driftAngle) * 0.5;
      const driftZ = Math.sin(t * f.driftSpeed * 0.1 + f.driftAngle + 1.0) * 0.5;

      _dummy.position.set(
        f.basePosition.x + driftX,
        f.basePosition.y + floatY,
        f.basePosition.z + driftZ,
      );

      // Pulse scale for twinkle effect
      const pulse = 0.5 + 0.5 * Math.sin(t * f.pulseSpeed + f.pulsePhase);
      const s = 0.6 + pulse * 0.4;
      _dummy.scale.setScalar(s);

      _dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, _dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
