// DesertAtmosphere — Animated atmospheric elements for a living frontier desert.
//
// Adds visual life and depth that static geometry cannot provide:
//   - Circling buzzards/vultures overhead (animated orbits)
//   - Rolling tumbleweeds (animated drift with bounce)
//   - Wispy clouds slowly drifting across the sky
//   - Telegraph poles with wire along a road
//   - Worn fence near the town area
//   - Railroad track extending into the distance
//   - Windmill with slowly rotating blades
//   - Ground color variation patches and scattered pebbles
//   - Ground-level dust wisps (animated drift and pulse)
//
// Does NOT duplicate:
//   - DayNightCycle (sky dome, sun, lighting, fog, fireflies, dust motes)
//   - DesertEnvironment (distant mesas/mountains, static cacti/rocks scatter)
//   - VegetationField (instanced cacti/rocks/scrub/dead trees)
//   - PropCluster (barrels, crates, hitching posts, water troughs)

import { useFrame } from "@react-three/fiber";
import Alea from "alea";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  createMetalTexture,
  createRustTexture,
  createWoodTexture,
} from "@/src/game/engine/materials";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BUZZARD_COUNT = 5;
const TUMBLEWEED_COUNT = 4;
const GROUND_PATCH_COUNT = 40;
const STONE_COUNT = 60;
const TELEGRAPH_POLE_COUNT = 7;
const FENCE_POST_COUNT = 12;
const CLOUD_COUNT = 6;
const DUST_WISP_COUNT = 15;

type PRNG = () => number;

function makePrng(seed: string): PRNG {
  return Alea(seed) as unknown as PRNG;
}

// ---------------------------------------------------------------------------
// 1. Wispy Clouds
// ---------------------------------------------------------------------------

function WispyClouds({ seed = "desert-clouds" }: { seed?: string }) {
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
// 2. Buzzards Circling Overhead
// ---------------------------------------------------------------------------

/** Shared V-shaped bird silhouette geometry. */
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

function CirclingBuzzards({
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
// 3. Rolling Tumbleweeds
// ---------------------------------------------------------------------------

function RollingTumbleweeds({
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

// ---------------------------------------------------------------------------
// 4. Ground Color Variation & Scattered Pebbles
// ---------------------------------------------------------------------------

function GroundVariation({
  seed = "desert-ground",
  cx = 0,
  cz = 0,
}: {
  seed?: string;
  cx?: number;
  cz?: number;
}) {
  const patches = useMemo(() => {
    const rng = makePrng(seed + "-patches");
    const colors = ["#8B7355", "#A08060", "#B8956A", "#7A5C3A", "#9E7B5A", "#6B5240"];
    return Array.from({ length: GROUND_PATCH_COUNT }, () => ({
      x: cx + (rng() - 0.5) * 160,
      z: cz + (rng() - 0.5) * 160,
      scaleX: 5 + rng() * 15,
      scaleZ: 5 + rng() * 15,
      rotation: rng() * Math.PI,
      color: colors[Math.floor(rng() * colors.length)],
      opacity: 0.2 + rng() * 0.25,
    }));
  }, [seed, cx, cz]);

  const stones = useMemo(() => {
    const rng = makePrng(seed + "-stones");
    return Array.from({ length: STONE_COUNT }, () => ({
      x: cx + (rng() - 0.5) * 120,
      z: cz + (rng() - 0.5) * 120,
      size: 0.05 + rng() * 0.12,
      color: rng() > 0.5 ? "#5A5045" : "#7A7062",
    }));
  }, [seed, cx, cz]);

  return (
    <group name="ground-variation">
      {/* Color patches at ground level */}
      {patches.map((p, i) => (
        <mesh
          key={`patch-${i}`}
          position={[p.x, 0.02, p.z]}
          rotation={[-Math.PI / 2, 0, p.rotation]}
          scale={[p.scaleX, p.scaleZ, 1]}
          receiveShadow
          castShadow={false}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={p.color}
            roughness={1}
            transparent
            opacity={p.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Scattered small pebbles */}
      {stones.map((s, i) => (
        <mesh
          key={`stone-${i}`}
          position={[s.x, s.size * 0.3, s.z]}
          castShadow={false}
          receiveShadow
        >
          <sphereGeometry args={[s.size, 4, 4]} />
          <meshStandardMaterial color={s.color} roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 5. Telegraph Poles with Wire
// ---------------------------------------------------------------------------

// Pre-cached materials for atmosphere props
const TELEGRAPH_POLE_MAT = () => createWoodTexture("#5C3317", "#3A1F0E");
const FENCE_POST_MAT = () => createWoodTexture("#6B5240", "#4A3828");
const FENCE_RAIL_MAT = () => createWoodTexture("#7A6B5A", "#5A4A38");
const RAILROAD_TIE_MAT = () => createWoodTexture("#5C3317", "#3A1F0E");
const RAILROAD_RAIL_MAT = () => createRustTexture("#555555");
const WINDMILL_LEG_MAT = () => createWoodTexture("#6B5B4B", "#4A3A2A");
const WINDMILL_PLATFORM_MAT = () => createWoodTexture("#5C4033", "#3A2A1E");
const WINDMILL_BLADE_MAT = () => createMetalTexture("#AAAAAA", "#888888");
const WINDMILL_HUB_MAT = () => createMetalTexture("#555555", "#3A3A3A");
const WINDMILL_VANE_MAT = () => createMetalTexture("#888888", "#666666");

function TelegraphPole({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  const poleMat = useMemo(() => TELEGRAPH_POLE_MAT(), []);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Vertical pole */}
      <mesh position={[0, 3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.06, 0.08, 6, 6]} />
        <primitive object={poleMat} attach="material" />
      </mesh>
      {/* Cross-piece */}
      <mesh position={[0, 5.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 5]} />
        <primitive object={poleMat} attach="material" />
      </mesh>
      {/* Wire insulators (small ceramic nubs) */}
      <mesh position={[-0.7, 5.5, 0]} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshStandardMaterial color="#CCCCBB" roughness={0.5} />
      </mesh>
      <mesh position={[0.7, 5.5, 0]} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshStandardMaterial color="#CCCCBB" roughness={0.5} />
      </mesh>
    </group>
  );
}

function TelegraphLine({
  seed = "desert-telegraph",
  cx = 0,
  cz = 0,
}: {
  seed?: string;
  cx?: number;
  cz?: number;
}) {
  const poles = useMemo(() => {
    const rng = makePrng(seed);
    // Line of poles along a dirt road direction
    const baseAngle = rng() * Math.PI * 2;
    const startX = cx + Math.cos(baseAngle) * 15;
    const startZ = cz + Math.sin(baseAngle) * 15;
    const dx = Math.cos(baseAngle) * 12;
    const dz = Math.sin(baseAngle) * 12;

    return {
      items: Array.from({ length: TELEGRAPH_POLE_COUNT }, (_, i) => ({
        position: [
          startX + dx * i + (rng() - 0.5) * 0.5,
          0,
          startZ + dz * i + (rng() - 0.5) * 0.5,
        ] as [number, number, number],
      })),
      angle: baseAngle,
    };
  }, [seed, cx, cz]);

  // Build a THREE.Line object for the wire connecting the poles
  const wireLine = useMemo(() => {
    if (poles.items.length < 2) return null;
    const points = poles.items.map((p) => new THREE.Vector3(p.position[0], 5.5, p.position[2]));
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.4,
    });
    return new THREE.Line(geo, mat);
  }, [poles]);

  return (
    <group name="telegraph-line">
      {poles.items.map((p, i) => (
        <TelegraphPole key={i} position={p.position} rotation={poles.angle} />
      ))}
      {wireLine && <primitive object={wireLine} />}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 6. Worn Fence
// ---------------------------------------------------------------------------

function WornFence({
  seed = "desert-fence",
  cx = 0,
  cz = 0,
}: {
  seed?: string;
  cx?: number;
  cz?: number;
}) {
  const fence = useMemo(() => {
    const rng = makePrng(seed);
    const baseAngle = rng() * Math.PI * 2 + Math.PI / 3; // Offset from telegraph
    const startX = cx + Math.cos(baseAngle) * 20;
    const startZ = cz + Math.sin(baseAngle) * 20;
    const dx = Math.cos(baseAngle) * 2.5;
    const dz = Math.sin(baseAngle) * 2.5;

    return {
      posts: Array.from({ length: FENCE_POST_COUNT }, (_, i) => ({
        x: startX + dx * i + (rng() - 0.5) * 0.2,
        z: startZ + dz * i + (rng() - 0.5) * 0.2,
        lean: (rng() - 0.5) * 0.15,
        height: 0.8 + rng() * 0.3,
      })),
      angle: baseAngle,
    };
  }, [seed, cx, cz]);

  const postMat = useMemo(() => FENCE_POST_MAT(), []);
  const railMat = useMemo(() => FENCE_RAIL_MAT(), []);

  return (
    <group name="worn-fence">
      {fence.posts.map((post, i) => (
        <group key={i}>
          {/* Vertical fence post */}
          <mesh
            position={[post.x, post.height / 2, post.z]}
            rotation={[post.lean, 0, post.lean * 0.5]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.06, post.height, 0.06]} />
            <primitive object={postMat} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Horizontal rails connecting posts */}
      {fence.posts.slice(0, -1).map((post, i) => {
        const next = fence.posts[i + 1];
        const midX = (post.x + next.x) / 2;
        const midZ = (post.z + next.z) / 2;
        const len = Math.sqrt((next.x - post.x) ** 2 + (next.z - post.z) ** 2);

        return (
          <group key={`rail-${i}`}>
            {/* Top rail */}
            <mesh
              position={[midX, 0.7, midZ]}
              rotation={[0, -fence.angle, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[len, 0.04, 0.03]} />
              <primitive object={railMat} attach="material" />
            </mesh>
            {/* Bottom rail */}
            <mesh
              position={[midX, 0.35, midZ]}
              rotation={[0, -fence.angle, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[len, 0.04, 0.03]} />
              <primitive object={railMat} attach="material" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 7. Railroad Track (extending into distance)
// ---------------------------------------------------------------------------

function DistantRailroad({
  seed = "desert-railroad",
  cx = 0,
  cz = 0,
}: {
  seed?: string;
  cx?: number;
  cz?: number;
}) {
  const track = useMemo(() => {
    const rng = makePrng(seed);
    const angle = rng() * Math.PI * 2 + Math.PI * 0.7;
    const startX = cx + Math.cos(angle) * 30;
    const startZ = cz + Math.sin(angle) * 30;
    const length = 120;
    const endX = startX + Math.cos(angle) * length;
    const endZ = startZ + Math.sin(angle) * length;

    const tieCount = Math.floor(length / 1.2);
    const ties = Array.from({ length: tieCount }, (_, i) => {
      const t = i / tieCount;
      return {
        x: startX + (endX - startX) * t,
        z: startZ + (endZ - startZ) * t,
      };
    });

    return { startX, startZ, endX, endZ, angle, ties };
  }, [seed, cx, cz]);

  const gauge = 0.7;
  const railMat = useMemo(() => RAILROAD_RAIL_MAT(), []);
  const tieMat = useMemo(() => RAILROAD_TIE_MAT(), []);

  return (
    <group name="distant-railroad">
      {/* Two parallel rails */}
      {([-1, 1] as const).map((side) => {
        const offsetX = Math.cos(track.angle + Math.PI / 2) * gauge * 0.5 * side;
        const offsetZ = Math.sin(track.angle + Math.PI / 2) * gauge * 0.5 * side;
        const midX = (track.startX + track.endX) / 2 + offsetX;
        const midZ = (track.startZ + track.endZ) / 2 + offsetZ;
        const len = Math.sqrt((track.endX - track.startX) ** 2 + (track.endZ - track.startZ) ** 2);

        return (
          <mesh
            key={`rail-${side}`}
            position={[midX, 0.04, midZ]}
            rotation={[0, -track.angle, 0]}
            castShadow={false}
            receiveShadow
          >
            <boxGeometry args={[len, 0.05, 0.04]} />
            <primitive object={railMat} attach="material" />
          </mesh>
        );
      })}

      {/* Wooden ties */}
      {track.ties.map((tie, i) => (
        <mesh
          key={`tie-${i}`}
          position={[tie.x, 0.015, tie.z]}
          rotation={[0, -track.angle + Math.PI / 2, 0]}
          castShadow={false}
          receiveShadow
        >
          <boxGeometry args={[gauge + 0.3, 0.03, 0.1]} />
          <primitive object={tieMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 8. Windmill
// ---------------------------------------------------------------------------

function Windmill({
  position = [35, 0, -25] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  const bladesRef = useRef<THREE.Group>(null);

  useFrame((_s, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += delta * 0.3;
    }
  });

  const legMat = useMemo(() => WINDMILL_LEG_MAT(), []);
  const platformMat = useMemo(() => WINDMILL_PLATFORM_MAT(), []);
  const hubMat = useMemo(() => WINDMILL_HUB_MAT(), []);
  const bladeMat = useMemo(() => WINDMILL_BLADE_MAT(), []);
  const vaneMat = useMemo(() => WINDMILL_VANE_MAT(), []);

  return (
    <group name="windmill" position={position}>
      {/* Tower legs */}
      {(
        [
          [-0.4, 4, -0.4],
          [0.4, 4, -0.4],
          [-0.4, 4, 0.4],
          [0.4, 4, 0.4],
        ] as const
      ).map((pos, i) => (
        <mesh key={`leg-${i}`} position={pos} castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.05, 8, 4]} />
          <primitive object={legMat} attach="material" />
        </mesh>
      ))}

      {/* Platform at top */}
      <mesh position={[0, 7.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.15, 1.2]} />
        <primitive object={platformMat} attach="material" />
      </mesh>

      {/* Hub */}
      <mesh position={[0, 8.5, 0.6]} castShadow={false} receiveShadow={false}>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 8]} />
        <primitive object={hubMat} attach="material" />
      </mesh>

      {/* Rotating blades */}
      <group ref={bladesRef} position={[0, 8.5, 0.7]}>
        {([0, 1, 2, 3] as const).map((i) => (
          <mesh
            key={`blade-${i}`}
            position={[Math.cos((i * Math.PI) / 2) * 1.8, Math.sin((i * Math.PI) / 2) * 1.8, 0]}
            rotation={[0, 0, (i * Math.PI) / 2]}
            castShadow
            receiveShadow={false}
          >
            <boxGeometry args={[0.4, 3.2, 0.02]} />
            <primitive object={bladeMat} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Tail vane */}
      <mesh position={[0, 8.5, -0.8]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[0.8, 1.2, 0.02]} />
        <primitive object={vaneMat} attach="material" />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 9. Ground-Level Dust Wisps
// ---------------------------------------------------------------------------

function GroundDustWisps({
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

// ---------------------------------------------------------------------------
// Main Composite Component
// ---------------------------------------------------------------------------

export interface DesertAtmosphereProps {
  /** PRNG seed for deterministic placement. */
  seed?: string;
  /** Center point for player-relative elements [x, y, z]. */
  townCenter?: [number, number, number];
}

export function DesertAtmosphere({
  seed = "iron-frontier-atmosphere",
  townCenter = [0, 0, 0],
}: DesertAtmosphereProps) {
  const [cx, , cz] = townCenter;

  return (
    <group name="desert-atmosphere">
      {/* Sky enhancements: drifting wispy clouds */}
      <WispyClouds seed={`${seed}:clouds`} />

      {/* Animated wildlife: buzzards circling overhead */}
      <CirclingBuzzards seed={`${seed}:buzzards`} cx={cx} cz={cz} />

      {/* Animated rolling tumbleweeds */}
      <RollingTumbleweeds seed={`${seed}:tumbleweeds`} cx={cx} cz={cz} />

      {/* Ground color variation patches and scattered pebbles */}
      <GroundVariation seed={`${seed}:ground`} cx={cx} cz={cz} />

      {/* Infrastructure / civilization hints */}
      <TelegraphLine seed={`${seed}:telegraph`} cx={cx} cz={cz} />
      <WornFence seed={`${seed}:fence`} cx={cx} cz={cz} />
      <DistantRailroad seed={`${seed}:railroad`} cx={cx} cz={cz} />
      <Windmill position={[cx + 35, 0, cz - 25]} />

      {/* Ambient ground-level dust wisps */}
      <GroundDustWisps seed={`${seed}:dust-wisps`} cx={cx} cz={cz} />
    </group>
  );
}
