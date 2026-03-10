import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { CLOUD_COUNT, DUST_WISP_COUNT, makePrng } from "./shared.ts";

// ---------------------------------------------------------------------------
// Wispy Clouds
// ---------------------------------------------------------------------------

export function WispyClouds({ seed = "desert-clouds" }: { seed?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const clouds = useMemo(() => {
    const rng = makePrng(seed);
    return Array.from({ length: CLOUD_COUNT }, () => ({
      x: (rng() - 0.5) * 400,
      y: 80 + rng() * 40,
      z: (rng() - 0.5) * 400,
      scaleX: 15 + rng() * 25,
      scaleZ: 8 + rng() * 12,
      speed: 0.5 + rng() * 1.0,
      direction: rng() * Math.PI * 2,
    }));
  }, [seed]);

  useFrame((_s, delta) => {
    if (!groupRef.current) return;
    elapsedRef.current += delta;

    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const cloud = children[i];
      const data = clouds[i];
      // Slow drift
      cloud.position.x = data.x + Math.cos(data.direction) * elapsedRef.current * data.speed;
      cloud.position.z = data.z + Math.sin(data.direction) * elapsedRef.current * data.speed;

      // Wrap around when too far
      if (cloud.position.x > 300) cloud.position.x -= 600;
      if (cloud.position.x < -300) cloud.position.x += 600;
      if (cloud.position.z > 300) cloud.position.z -= 600;
      if (cloud.position.z < -300) cloud.position.z += 600;
    }
  });

  return (
    <group ref={groupRef} name="wispy-clouds">
      {clouds.map((c, i) => (
        <mesh
          key={i}
          position={[c.x, c.y, c.z]}
          scale={[c.scaleX, 0.5, c.scaleZ]}
          castShadow={false}
          receiveShadow={false}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.15}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Ground-Level Dust Wisps
// ---------------------------------------------------------------------------

export function GroundDustWisps({
  seed = "desert-dust-wisps",
  cx = 0,
  cz = 0,
}: {
  seed?: string;
  cx?: number;
  cz?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const wisps = useMemo(() => {
    const rng = makePrng(seed);
    return Array.from({ length: DUST_WISP_COUNT }, () => ({
      x: cx + (rng() - 0.5) * 100,
      z: cz + (rng() - 0.5) * 100,
      scaleX: 2 + rng() * 4,
      scaleZ: 1 + rng() * 2,
      speed: 0.3 + rng() * 0.5,
      direction: rng() * Math.PI * 2,
      phase: rng() * Math.PI * 2,
      pulseSpeed: 0.5 + rng() * 0.5,
    }));
  }, [seed, cx, cz]);

  useFrame((_s, delta) => {
    if (!groupRef.current) return;
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const wisp = children[i] as THREE.Mesh;
      const data = wisps[i];

      // Drift along wind direction
      const range = 60;
      let x = data.x + Math.cos(data.direction) * t * data.speed;
      let z = data.z + Math.sin(data.direction) * t * data.speed;

      // Wrap around center
      x = cx + ((((x - cx + range) % (range * 2)) + range * 2) % (range * 2)) - range;
      z = cz + ((((z - cz + range) % (range * 2)) + range * 2) % (range * 2)) - range;

      wisp.position.set(x, 0.1, z);

      // Pulse opacity for ephemeral feel
      const pulse = 0.5 + 0.5 * Math.sin(t * data.pulseSpeed + data.phase);
      (wisp.material as THREE.MeshBasicMaterial).opacity = 0.08 + pulse * 0.07;
    }
  });

  return (
    <group ref={groupRef} name="ground-dust-wisps">
      {wisps.map((w, i) => (
        <mesh
          key={i}
          position={[w.x, 0.1, w.z]}
          rotation={[-Math.PI / 2, 0, w.direction]}
          scale={[w.scaleX, w.scaleZ, 1]}
          castShadow={false}
          receiveShadow={false}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#C4A882"
            transparent
            opacity={0.1}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
