import { useMemo } from "react";
import { GROUND_PATCH_COUNT, makePrng, STONE_COUNT } from "./shared.ts";

// ---------------------------------------------------------------------------
// Ground Color Variation & Scattered Pebbles
// ---------------------------------------------------------------------------

export function GroundVariation({
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
