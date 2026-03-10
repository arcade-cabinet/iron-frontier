import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { BUZZARD_COUNT, makePrng, TUMBLEWEED_COUNT } from "./shared.ts";

// ---------------------------------------------------------------------------
// Buzzards Circling Overhead
// ---------------------------------------------------------------------------

const BUZZARD_GEOMETRY = (() => {
  const geo = new THREE.BufferGeometry();
  const verts = new Float32Array([
    // Left wing triangle
    0, 0, 0, -1.5, 0, 0.3, -0.5, 0, -0.2,
    // Right wing triangle
    0, 0, 0, 1.5, 0, 0.3, 0.5, 0, -0.2,
  ]);
  geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geo.computeVertexNormals();
  return geo;
})();

const BUZZARD_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x1a1a1a,
  side: THREE.DoubleSide,
});

export function CirclingBuzzards({
  seed = "desert-buzzards",
  cx = 0,
  cz = 0,
}: {
  seed?: string;
  cx?: number;
  cz?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const buzzards = useMemo(() => {
    const rng = makePrng(seed);
    return Array.from({ length: BUZZARD_COUNT }, () => ({
      centerX: cx + (rng() - 0.5) * 60,
      centerZ: cz + (rng() - 0.5) * 60,
      height: 30 + rng() * 25,
      orbitRadius: 8 + rng() * 15,
      speed: 0.15 + rng() * 0.2,
      phase: rng() * Math.PI * 2,
      bankAngle: 0.15 + rng() * 0.1,
    }));
  }, [seed, cx, cz]);

  useFrame((_s, delta) => {
    if (!groupRef.current) return;
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const bird = children[i];
      const data = buzzards[i];

      const angle = t * data.speed + data.phase;
      bird.position.set(
        data.centerX + Math.cos(angle) * data.orbitRadius,
        data.height + Math.sin(t * 0.3 + data.phase) * 1.5,
        data.centerZ + Math.sin(angle) * data.orbitRadius,
      );

      // Face direction of travel (tangent to circle)
      bird.rotation.y = -angle + Math.PI / 2;
      // Slight bank into the turn
      bird.rotation.z = Math.sin(angle) * data.bankAngle;
    }
  });

  return (
    <group ref={groupRef} name="circling-buzzards">
      {buzzards.map((_, i) => (
        <group key={i} scale={[0.8, 0.8, 0.8]}>
          <mesh
            geometry={BUZZARD_GEOMETRY}
            material={BUZZARD_MATERIAL}
            castShadow={false}
            receiveShadow={false}
          />
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Rolling Tumbleweeds
// ---------------------------------------------------------------------------

export function RollingTumbleweeds({
  seed = "desert-tumbleweeds",
  cx = 0,
  cz = 0,
}: {
  seed?: string;
  cx?: number;
  cz?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const tumbleweeds = useMemo(() => {
    const rng = makePrng(seed);
    return Array.from({ length: TUMBLEWEED_COUNT }, () => ({
      startX: cx + (rng() - 0.5) * 80,
      startZ: cz + (rng() - 0.5) * 80,
      speed: 1.5 + rng() * 2.0,
      direction: rng() * Math.PI * 2,
      size: 0.2 + rng() * 0.15,
      bouncePhase: rng() * Math.PI * 2,
      bounceFreq: 3 + rng() * 2,
      rotSpeed: 1.5 + rng() * 2.0,
    }));
  }, [seed, cx, cz]);

  useFrame((_s, delta) => {
    if (!groupRef.current) return;
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const tw = children[i];
      const data = tumbleweeds[i];

      // Move in a constant direction
      let x = data.startX + Math.cos(data.direction) * t * data.speed;
      let z = data.startZ + Math.sin(data.direction) * t * data.speed;

      // Wrap around at 80 units from center
      const range = 80;
      x = cx + ((((x - cx + range) % (range * 2)) + range * 2) % (range * 2)) - range;
      z = cz + ((((z - cz + range) % (range * 2)) + range * 2) % (range * 2)) - range;

      // Slight bounce
      const bounce = Math.abs(Math.sin(t * data.bounceFreq + data.bouncePhase)) * 0.15;

      tw.position.set(x, data.size + bounce, z);

      // Roll rotation
      tw.rotation.x = t * data.rotSpeed;
      tw.rotation.z = t * data.rotSpeed * 0.7;
    }
  });

  return (
    <group ref={groupRef} name="rolling-tumbleweeds">
      {tumbleweeds.map((tw, i) => (
        <mesh key={i} castShadow={false} receiveShadow={false}>
          <icosahedronGeometry args={[tw.size, 1]} />
          <meshStandardMaterial
            color="#C2A366"
            roughness={0.9}
            wireframe
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}
