// PropCluster — R3F component for placing authored Western props.
//
// Renders individual props at specified positions using the procedural
// constructors from engine/renderers/Props. Each prop is looked up by
// type string and converted to a <primitive> for rendering.

import { useMemo } from "react";
import type * as THREE from "three";

import {
  createBarrel,
  createCrate,
  createHitchingPost,
  createMineCart,
  createRailroadTrack,
  createWagonWheel,
  createWaterTrough,
} from "@/src/game/engine/renderers";

// --- Types ---

export type PropType =
  | "hitchingPost"
  | "waterTrough"
  | "barrel"
  | "crate"
  | "wagonWheel"
  | "mineCart"
  | "railroadTrack";

export interface PropPlacement {
  type: PropType;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
  /** Optional length parameter for track-type props */
  length?: number;
}

export interface PropClusterProps {
  /** Array of props to place in the scene */
  placements: PropPlacement[];
}

// --- Prop factory registry ---

type PropFactory = (seed: string, length?: number) => THREE.Group;

const PROP_FACTORIES: Record<PropType, PropFactory> = {
  hitchingPost: (seed) => createHitchingPost(seed),
  waterTrough: (seed) => createWaterTrough(seed),
  barrel: (seed) => createBarrel(seed),
  crate: (seed) => createCrate(seed),
  wagonWheel: (seed) => createWagonWheel(seed),
  mineCart: (seed) => createMineCart(seed),
  railroadTrack: (seed, length) => createRailroadTrack(length, seed),
};

// --- Component ---

export function PropCluster({ placements }: PropClusterProps) {
  // Build all prop groups once, keyed by index
  const propGroups = useMemo(() => {
    return placements.map((pl, i) => {
      const factory = PROP_FACTORIES[pl.type];
      if (!factory) return null;

      const seed = `${pl.type}-${i}`;
      const group = factory(seed, pl.length);

      // Apply transform
      group.position.set(pl.position[0], pl.position[1], pl.position[2]);
      if (pl.rotation != null) {
        group.rotation.y = pl.rotation;
      }
      if (pl.scale != null) {
        group.scale.setScalar(pl.scale);
      }

      return group;
    });
  }, [placements]);

  return (
    <group>
      {propGroups.map((group, i) => (group ? <primitive key={i} object={group} /> : null))}
    </group>
  );
}
