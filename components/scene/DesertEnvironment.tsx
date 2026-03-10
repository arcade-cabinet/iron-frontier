// DesertEnvironment — Static scene dressing visible from the player spawn.
//
// Adds visual landmarks and props so the world feels inhabited from the very
// first frame instead of being flat brown nothing:
//   - Distant mesa/mountain silhouettes on the horizon
//   - Extra cacti and rocks scattered around the town area
//   - Tumbleweeds for atmosphere
//
// All geometry is simple R3F primitives (box, sphere, cylinder, cone).
// No external models needed.

import Alea from "alea";
import { useMemo } from "react";
import * as THREE from "three";
import { createStoneTexture, createWoodTexture } from "@/src/game/engine/materials";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DesertEnvironmentProps {
  /** World-space center of the town [x, y, z]. Landmarks are placed relative to this. */
  townCenter: [number, number, number];
}

// ---------------------------------------------------------------------------
// Distant mountain/mesa definitions
// ---------------------------------------------------------------------------

interface MountainDef {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  type: "mesa" | "peak" | "ridge";
}

function buildMountains(cx: number, cz: number): MountainDef[] {
  return [
    // Northwest mesa range
    { position: [cx - 400, 0, cz - 350], scale: [120, 60, 80], color: "#3B2D5B", type: "mesa" },
    { position: [cx - 320, 0, cz - 400], scale: [90, 45, 60], color: "#4A3668", type: "mesa" },
    { position: [cx - 480, 0, cz - 280], scale: [100, 50, 90], color: "#352850", type: "mesa" },

    // Northeast peaks
    { position: [cx + 380, 0, cz - 300], scale: [60, 80, 60], color: "#443366", type: "peak" },
    { position: [cx + 450, 0, cz - 350], scale: [70, 90, 70], color: "#3D2E5C", type: "peak" },
    { position: [cx + 320, 0, cz - 380], scale: [80, 55, 70], color: "#4B3670", type: "mesa" },

    // South ridge line
    { position: [cx - 200, 0, cz + 400], scale: [150, 40, 50], color: "#483262", type: "ridge" },
    { position: [cx + 100, 0, cz + 450], scale: [180, 35, 60], color: "#3E2D58", type: "ridge" },
    { position: [cx + 350, 0, cz + 380], scale: [100, 50, 70], color: "#4A3668", type: "mesa" },

    // West mesa (visible when looking away from town)
    { position: [cx - 500, 0, cz + 50], scale: [130, 55, 90], color: "#402F5E", type: "mesa" },
    { position: [cx - 420, 0, cz + 120], scale: [80, 40, 60], color: "#3B2D54", type: "mesa" },

    // East distant peaks
    { position: [cx + 500, 0, cz + 100], scale: [70, 70, 60], color: "#443366", type: "peak" },
    { position: [cx + 480, 0, cz - 100], scale: [90, 85, 75], color: "#3D2E5C", type: "peak" },
  ];
}

// ---------------------------------------------------------------------------
// Scatter definitions (cacti, rocks, tumbleweeds)
// ---------------------------------------------------------------------------

interface ScatterItem {
  type: "cactus_saguaro" | "cactus_barrel" | "rock" | "rock_large" | "tumbleweed" | "dead_bush";
  position: [number, number, number];
  rotation: number;
  scale: number;
}

function generateScatter(cx: number, cz: number, seed: string): ScatterItem[] {
  const rng = Alea(seed) as unknown as () => number;
  const items: ScatterItem[] = [];

  // Distribution weights
  const types: ScatterItem["type"][] = [
    "cactus_saguaro",
    "cactus_saguaro",
    "cactus_barrel",
    "cactus_barrel",
    "rock",
    "rock",
    "rock",
    "rock_large",
    "rock_large",
    "tumbleweed",
    "tumbleweed",
    "dead_bush",
    "dead_bush",
  ];

  // Scatter 60 items in a 300m radius around the town, avoiding the town core (50m)
  for (let i = 0; i < 60; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = 60 + rng() * 240; // 60m to 300m from town center
    const x = cx + Math.cos(angle) * dist;
    const z = cz + Math.sin(angle) * dist;
    const typeIdx = Math.floor(rng() * types.length);

    items.push({
      type: types[typeIdx],
      position: [x, 0, z],
      rotation: rng() * Math.PI * 2,
      scale: 0.6 + rng() * 0.8,
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Geometry builders (memoized via useMemo)
// ---------------------------------------------------------------------------

function MountainMesh({ def }: { def: MountainDef }) {
  const { position, scale, color, type } = def;

  if (type === "peak") {
    return (
      <group position={position}>
        {/* Cone peak */}
        <mesh position={[0, scale[1] * 0.4, 0]} castShadow={false} receiveShadow={false}>
          <coneGeometry args={[scale[0] * 0.7, scale[1], 6]} />
          <meshStandardMaterial color={color} roughness={0.95} />
        </mesh>
        {/* Base spread */}
        <mesh position={[0, scale[1] * 0.08, 0]} castShadow={false} receiveShadow={false}>
          <cylinderGeometry args={[scale[0], scale[0] * 1.3, scale[1] * 0.2, 8]} />
          <meshStandardMaterial color={color} roughness={0.95} />
        </mesh>
      </group>
    );
  }

  if (type === "ridge") {
    return (
      <mesh
        position={[position[0], position[1] + scale[1] * 0.5, position[2]]}
        castShadow={false}
        receiveShadow={false}
      >
        <boxGeometry args={scale} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    );
  }

  // Mesa: flat-topped box with sloped base
  return (
    <group position={position}>
      {/* Main mesa body */}
      <mesh position={[0, scale[1] * 0.5, 0]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[scale[0], scale[1], scale[2]]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Slightly wider base for visual weight */}
      <mesh position={[0, scale[1] * 0.12, 0]} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[scale[0] * 1.15, scale[1] * 0.25, scale[2] * 1.15]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

// Pre-built materials for desert scatter (cached by the texture factory)
const ROCK_MATERIAL = () => createStoneTexture("#8B7355", "#6B5340");
const ROCK_LARGE_MATERIAL = () => createStoneTexture("#7B6B55", "#5A4A3A");
const DEAD_BUSH_MATERIAL = () => createWoodTexture("#6B5B3A", "#4A3A22");

function ScatterMesh({ item }: { item: ScatterItem }) {
  const { type, position, rotation, scale } = item;

  // Memoize materials per component (factory handles caching internally)
  const rockMat = useMemo(() => ROCK_MATERIAL(), []);
  const rockLargeMat = useMemo(() => ROCK_LARGE_MATERIAL(), []);
  const deadBushMat = useMemo(() => DEAD_BUSH_MATERIAL(), []);

  switch (type) {
    case "cactus_saguaro":
      return (
        <group position={position} rotation={[0, rotation, 0]} scale={scale}>
          {/* Main trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.18, 3, 6]} />
            <meshStandardMaterial color="#2D5A27" roughness={0.75} metalness={0.0} />
          </mesh>
          {/* Left arm */}
          <mesh position={[-0.4, 2.0, 0]} rotation={[0, 0, Math.PI * 0.25]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 1.2, 5]} />
            <meshStandardMaterial color="#2A5225" roughness={0.78} metalness={0.0} />
          </mesh>
          {/* Right arm */}
          <mesh position={[0.35, 1.6, 0]} rotation={[0, 0, -Math.PI * 0.3]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.9, 5]} />
            <meshStandardMaterial color="#306030" roughness={0.72} metalness={0.0} />
          </mesh>
        </group>
      );

    case "cactus_barrel":
      return (
        <mesh position={position} rotation={[0, rotation, 0]} scale={scale} castShadow>
          <sphereGeometry args={[0.35, 6, 6]} />
          <meshStandardMaterial color="#3A6B33" roughness={0.7} metalness={0.0} />
        </mesh>
      );

    case "rock":
      return (
        <mesh
          position={[position[0], position[1] + 0.2 * scale, position[2]]}
          rotation={[rotation * 0.2, rotation, rotation * 0.1]}
          scale={[scale * 0.8, scale * 0.5, scale * 0.7]}
          castShadow
        >
          <dodecahedronGeometry args={[0.6, 0]} />
          <primitive object={rockMat} attach="material" />
        </mesh>
      );

    case "rock_large":
      return (
        <mesh
          position={[position[0], position[1] + 0.4 * scale, position[2]]}
          rotation={[rotation * 0.15, rotation, rotation * 0.08]}
          scale={[scale * 1.5, scale * 0.9, scale * 1.2]}
          castShadow
        >
          <dodecahedronGeometry args={[1.0, 0]} />
          <primitive object={rockLargeMat} attach="material" />
        </mesh>
      );

    case "tumbleweed":
      return (
        <mesh position={[position[0], position[1] + 0.2 * scale, position[2]]} scale={scale * 0.5}>
          <icosahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#C4A882" roughness={0.85} wireframe />
        </mesh>
      );

    case "dead_bush":
      return (
        <group position={position} rotation={[0, rotation, 0]} scale={scale * 0.6}>
          {/* Small scraggly trunk */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.03, 0.06, 0.3, 4]} />
            <primitive object={deadBushMat} attach="material" />
          </mesh>
          {/* Branches as small angled cylinders */}
          <mesh position={[0.1, 0.3, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.02, 0.03, 0.35, 3]} />
            <primitive object={deadBushMat} attach="material" />
          </mesh>
          <mesh position={[-0.08, 0.25, 0.05]} rotation={[0.3, 0, 0.4]}>
            <cylinderGeometry args={[0.02, 0.03, 0.3, 3]} />
            <primitive object={deadBushMat} attach="material" />
          </mesh>
        </group>
      );
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DesertEnvironment({ townCenter }: DesertEnvironmentProps) {
  const [cx, , cz] = townCenter;

  const mountains = useMemo(() => buildMountains(cx, cz), [cx, cz]);
  const scatter = useMemo(() => generateScatter(cx, cz, "desert-env-scatter"), [cx, cz]);

  return (
    <group name="desert-environment">
      {/* Distant mountains / mesas */}
      <group name="distant-mountains">
        {mountains.map((def, i) => (
          <MountainMesh key={`mt-${i}`} def={def} />
        ))}
      </group>

      {/* Scattered desert props */}
      <group name="desert-scatter">
        {scatter.map((item, i) => (
          <ScatterMesh key={`sc-${i}`} item={item} />
        ))}
      </group>
    </group>
  );
}
