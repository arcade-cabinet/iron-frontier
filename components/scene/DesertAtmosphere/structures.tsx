import { useMemo } from "react";
import * as THREE from "three";
import {
  FENCE_POST_COUNT,
  FENCE_POST_MAT,
  FENCE_RAIL_MAT,
  makePrng,
  RAILROAD_RAIL_MAT,
  RAILROAD_TIE_MAT,
  TELEGRAPH_POLE_COUNT,
  TELEGRAPH_POLE_MAT,
} from "./shared.ts";

// ---------------------------------------------------------------------------
// Telegraph Poles with Wire
// ---------------------------------------------------------------------------

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

export function TelegraphLine({
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
// Worn Fence
// ---------------------------------------------------------------------------

export function WornFence({
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
// Railroad Track (extending into distance)
// ---------------------------------------------------------------------------

export function DistantRailroad({
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
