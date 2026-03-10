// WorldItems — Renders dropped loot and world pickups as small glowing
// objects with bobbing animation and proximity-based auto-collect.
//
// Reads worldItems from the Zustand store and renders each as a colored
// emissive mesh. When the player camera is within PICKUP_RANGE units,
// the item is collected via store.collectWorldItem().

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useGameStore, useGameStoreShallow } from "@/hooks/useGameStore";
import type { WorldItem } from "@/src/game/store/types";
import { rngTick, scopedRNG } from "../../src/game/lib/prng.ts";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Distance (world units) at which items are auto-collected. */
const PICKUP_RANGE = 2;

/** Vertical bobbing amplitude. */
const BOB_AMPLITUDE = 0.15;

/** Bobbing speed (radians per second). */
const BOB_SPEED = 2.5;

/** Rotation speed (radians per second). */
const SPIN_SPEED = 1.5;

/** Size of item mesh. */
const ITEM_SIZE = 0.15;

/** Glow intensity. */
const EMISSIVE_INTENSITY = 2.0;

// ---------------------------------------------------------------------------
// Color mapping by item type keywords
// ---------------------------------------------------------------------------

function getItemColor(itemId: string): string {
  const id = itemId.toLowerCase();
  if (id.includes("gold") || id.includes("coin") || id.includes("nugget")) return "#FFD700";
  if (
    id.includes("weapon") ||
    id.includes("revolver") ||
    id.includes("rifle") ||
    id.includes("shotgun") ||
    id.includes("knife")
  )
    return "#C0C0C0";
  if (
    id.includes("potion") ||
    id.includes("tonic") ||
    id.includes("medicine") ||
    id.includes("bandage")
  )
    return "#44DD44";
  if (id.includes("food") || id.includes("jerky") || id.includes("bread") || id.includes("apple"))
    return "#8B4513";
  if (id.includes("ammo") || id.includes("bullet")) return "#B87333";
  if (id.includes("whiskey") || id.includes("drink")) return "#AA6622";
  // Default: pale blue for misc items
  return "#88AAFF";
}

function getItemShape(itemId: string): "sphere" | "box" {
  const id = itemId.toLowerCase();
  if (id.includes("gold") || id.includes("coin") || id.includes("nugget")) return "sphere";
  if (id.includes("potion") || id.includes("tonic")) return "sphere";
  return "box";
}

// ---------------------------------------------------------------------------
// Single world item mesh
// ---------------------------------------------------------------------------

interface WorldItemMeshProps {
  item: WorldItem;
  onCollect: (itemId: string) => void;
}

function WorldItemMesh({ item, onCollect }: WorldItemMeshProps) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const elapsedRef = useRef(scopedRNG("world", 42, rngTick()) * Math.PI * 2); // Random start phase
  const collectedRef = useRef(false);

  const color = useMemo(() => getItemColor(item.itemId), [item.itemId]);
  const shape = useMemo(() => getItemShape(item.itemId), [item.itemId]);

  const geometry = useMemo(() => {
    if (shape === "sphere") {
      return new THREE.SphereGeometry(ITEM_SIZE, 8, 8);
    }
    return new THREE.BoxGeometry(ITEM_SIZE * 1.6, ITEM_SIZE * 1.6, ITEM_SIZE * 1.6);
  }, [shape]);

  const material = useMemo(() => {
    const c = new THREE.Color(color);
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: EMISSIVE_INTENSITY,
      roughness: 0.3,
      metalness: 0.6,
      toneMapped: false,
    });
  }, [color]);

  useFrame((_state, delta) => {
    if (!meshRef.current || collectedRef.current) return;

    elapsedRef.current += delta;
    const t = elapsedRef.current;

    // Bobbing
    meshRef.current.position.y = item.position.y + 0.5 + Math.sin(t * BOB_SPEED) * BOB_AMPLITUDE;

    // Spinning
    meshRef.current.rotation.y += delta * SPIN_SPEED;

    // Pulse emissive intensity
    const pulse = 1.5 + Math.sin(t * 3) * 0.5;
    (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;

    // Proximity check for auto-collect
    const dx = camera.position.x - item.position.x;
    const dz = camera.position.z - item.position.z;
    const distSq = dx * dx + dz * dz;

    if (distSq < PICKUP_RANGE * PICKUP_RANGE) {
      collectedRef.current = true;
      onCollect(item.id);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[item.position.x, item.position.y + 0.5, item.position.z]}
      geometry={geometry}
      material={material}
      castShadow={false}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WorldItems() {
  const worldItems = useGameStore((s) => s.worldItems);
  const collectWorldItem = useGameStore((s) => s.collectWorldItem);

  const itemList = useMemo(() => Object.values(worldItems), [worldItems]);

  if (itemList.length === 0) return null;

  return (
    <group name="world-items">
      {itemList.map((item) => (
        <WorldItemMesh key={item.id} item={item} onCollect={collectWorldItem} />
      ))}
    </group>
  );
}
