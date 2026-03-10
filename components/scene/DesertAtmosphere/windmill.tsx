import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";
import {
  WINDMILL_BLADE_MAT,
  WINDMILL_HUB_MAT,
  WINDMILL_LEG_MAT,
  WINDMILL_PLATFORM_MAT,
  WINDMILL_VANE_MAT,
} from "./shared.ts";

export function Windmill({
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
