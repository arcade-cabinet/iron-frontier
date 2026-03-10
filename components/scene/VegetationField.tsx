// VegetationField — R3F instanced vegetation scattering.
//
// Uses drei <Merged> for GPU instancing of procedural vegetation meshes.
// Scatter positions are deterministic via alea PRNG + chunk seed.
// Only renders instances within a configurable distance threshold.

import { Merged } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import Alea from "alea";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

import {
  type CactusVariant,
  createCactus,
  createDeadTree,
  createRock,
  createScrubBrush,
  createTumbleweed,
} from "@/src/game/engine/renderers";

// --- Types ---

export type VegetationType =
  | "saguaro"
  | "barrel"
  | "prickly"
  | "tumbleweed"
  | "scrub"
  | "deadTree"
  | "rockSmall"
  | "rockMedium"
  | "rockLarge";

export interface VegetationFieldProps {
  /** World-space center of the scattering region */
  center: [number, number, number];
  /** Radius around center to scatter vegetation */
  radius: number;
  /** PRNG seed for deterministic placement */
  seed: string;
  /** Number of vegetation instances per unit area (items / m^2) */
  density?: number;
  /** Which vegetation types to include */
  types?: VegetationType[];
  /** Max distance from camera to render instances */
  viewDistance?: number;
}

const DEFAULT_TYPES: VegetationType[] = [
  "saguaro",
  "barrel",
  "prickly",
  "tumbleweed",
  "scrub",
  "deadTree",
  "rockSmall",
  "rockMedium",
];

const DEFAULT_DENSITY = 0.02;
const DEFAULT_VIEW_DISTANCE = 80;

// --- Scatter point generator ---

interface ScatterPoint {
  type: VegetationType;
  position: THREE.Vector3;
  rotation: number;
  scale: number;
}

function generateScatterPoints(
  center: [number, number, number],
  radius: number,
  seed: string,
  density: number,
  types: VegetationType[],
): ScatterPoint[] {
  const rng = Alea(seed) as unknown as () => number;
  const area = Math.PI * radius * radius;
  const count = Math.floor(area * density);
  const points: ScatterPoint[] = [];

  for (let i = 0; i < count; i++) {
    // Rejection-sample in a circle
    let x: number;
    let z: number;
    do {
      x = (rng() * 2 - 1) * radius;
      z = (rng() * 2 - 1) * radius;
    } while (x * x + z * z > radius * radius);

    const typeIdx = Math.floor(rng() * types.length);
    points.push({
      type: types[typeIdx],
      position: new THREE.Vector3(center[0] + x, center[1], center[2] + z),
      rotation: rng() * Math.PI * 2,
      scale: 0.7 + rng() * 0.6,
    });
  }

  return points;
}

// --- Build source meshes for each type ---

function buildSourceMeshes(types: VegetationType[]): Record<string, THREE.Mesh> {
  const meshes: Record<string, THREE.Mesh> = {};

  for (const type of types) {
    const group = buildGroupForType(type);
    // Merge group children into a single mesh for instancing
    const merged = mergeGroupToMesh(group);
    if (merged) {
      meshes[type] = merged;
    }
  }

  return meshes;
}

function buildGroupForType(type: VegetationType): THREE.Group {
  switch (type) {
    case "saguaro":
      return createCactus("saguaro", type);
    case "barrel":
      return createCactus("barrel", type);
    case "prickly":
      return createCactus("prickly", type);
    case "tumbleweed":
      return createTumbleweed(type);
    case "scrub":
      return createScrubBrush(type);
    case "deadTree":
      return createDeadTree(type);
    case "rockSmall":
      return createRock("small", type);
    case "rockMedium":
      return createRock("medium", type);
    case "rockLarge":
      return createRock("large", type);
  }
}

/** Flatten a group's child meshes into a single merged mesh. */
function mergeGroupToMesh(group: THREE.Group): THREE.Mesh | null {
  const geometries: THREE.BufferGeometry[] = [];
  let sharedMat: THREE.Material | null = null;

  group.updateMatrixWorld(true);

  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const cloned = child.geometry.clone();
      cloned.applyMatrix4(child.matrixWorld);
      geometries.push(cloned);
      if (!sharedMat) {
        sharedMat = child.material as THREE.Material;
      }
    }
  });

  if (geometries.length === 0 || !sharedMat) return null;

  const merged = mergeBufferGeometries(geometries);
  if (!merged) return null;

  const mesh = new THREE.Mesh(merged, sharedMat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Simple buffer geometry merge (position + normal). */
function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  let totalVerts = 0;
  let totalIndices = 0;

  for (const geo of geometries) {
    totalVerts += geo.attributes.position.count;
    totalIndices += geo.index ? geo.index.count : geo.attributes.position.count;
  }

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const indices: number[] = [];

  let vertOffset = 0;
  const idxOffset = 0;

  for (const geo of geometries) {
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const normAttr = geo.attributes.normal as THREE.BufferAttribute | undefined;

    positions.set(posAttr.array as Float32Array, vertOffset * 3);
    if (normAttr) {
      normals.set(normAttr.array as Float32Array, vertOffset * 3);
    }

    if (geo.index) {
      for (let i = 0; i < geo.index.count; i++) {
        indices.push(geo.index.getX(i) + vertOffset);
      }
    } else {
      for (let i = 0; i < posAttr.count; i++) {
        indices.push(i + vertOffset);
      }
    }

    vertOffset += posAttr.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.setIndex(indices);
  return merged;
}

// --- Component ---

const _cameraPos = new THREE.Vector3();

export function VegetationField({
  center,
  radius,
  seed,
  density = DEFAULT_DENSITY,
  types = DEFAULT_TYPES,
  viewDistance = DEFAULT_VIEW_DISTANCE,
}: VegetationFieldProps) {
  const camera = useThree((s) => s.camera);
  const groupRef = useRef<THREE.Group>(null);

  // Generate scatter points once (deterministic)
  const points = useMemo(
    () => generateScatterPoints(center, radius, seed, density, types),
    [center, radius, seed, density, types],
  );

  // Build source meshes for instancing
  const sourceMeshes = useMemo(() => buildSourceMeshes(types), [types]);

  // Track visibility per frame
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(() => new Set());

  useFrame(() => {
    camera.getWorldPosition(_cameraPos);
    const distSq = viewDistance * viewDistance;
    const next = new Set<number>();

    for (let i = 0; i < points.length; i++) {
      if (points[i].position.distanceToSquared(_cameraPos) < distSq) {
        next.add(i);
      }
    }

    // Only update state if the set actually changed
    if (next.size !== visibleIndices.size) {
      setVisibleIndices(next);
    }
  });

  if (Object.keys(sourceMeshes).length === 0) return null;

  return (
    <Merged meshes={sourceMeshes}>
      {(
        instances: Record<
          string,
          React.FC<{
            position?: THREE.Vector3Tuple;
            rotation?: THREE.Euler | THREE.Vector3Tuple;
            scale?: number | THREE.Vector3Tuple;
          }>
        >,
      ) => (
        <group ref={groupRef}>
          {points.map((pt, i) => {
            if (!visibleIndices.has(i)) return null;
            const InstanceComponent = instances[pt.type];
            if (!InstanceComponent) return null;
            return (
              <InstanceComponent
                key={i}
                position={[pt.position.x, pt.position.y, pt.position.z]}
                rotation={[0, pt.rotation, 0]}
                scale={pt.scale}
              />
            );
          })}
        </group>
      )}
    </Merged>
  );
}
