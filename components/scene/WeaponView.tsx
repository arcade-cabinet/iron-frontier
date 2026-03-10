// WeaponView — R3F component that renders the first-person weapon view model.
//
// Mounts the weapon into the R3F scene graph (not via camera.add, which doesn't
// render in R3F because the camera is not part of the scene tree). Each frame
// the weapon's parent group is synced to the camera's world transform so the
// weapon stays fixed in the player's view.
//
// Reads InputFrame each frame to drive sway, bob, and fire/reload triggers.
// Manages a simple state machine: IDLE -> FIRING -> IDLE, IDLE -> RELOADING -> IDLE.
//
// Phase-aware visibility: the weapon lowers/hides during dialogue, inventory,
// menus, and other non-combat phases.

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type * as THREE from "three";
import { useGameStore } from "@/hooks/useGameStore";
import { getWeaponConfig } from "@/src/game/engine/combat";
import type { WeaponViewModel } from "@/src/game/engine/renderers/WeaponViewModel";
import {
  Dynamite,
  Lantern,
  Lasso,
  Pickaxe,
  Revolver,
  Rifle,
  Shotgun,
} from "@/src/game/engine/renderers/weapons";
import { InputManager } from "@/src/game/input";

// ---------------------------------------------------------------------------
// Weapon registry — maps weapon type names to constructors
// ---------------------------------------------------------------------------

type WeaponFactory = () => WeaponViewModel;

const WEAPON_FACTORIES: Record<string, WeaponFactory> = {
  revolver: () => new Revolver(),
  rifle: () => new Rifle(),
  shotgun: () => new Shotgun(),
  dynamite: () => new Dynamite(),
  pickaxe: () => new Pickaxe(),
  lantern: () => new Lantern(),
  lasso: () => new Lasso(),
  // Melee types
  knife: () => new Pickaxe(), // Reuse pickaxe mesh for knives
  melee: () => new Pickaxe(),
  explosive: () => new Dynamite(),
};

/**
 * Map a weapon item ID (from weapons.json) to a view model type.
 * Uses the weaponType field from the weapon config.
 */
function resolveWeaponType(weaponItemId: string): string {
  const config = getWeaponConfig(weaponItemId);
  if (!config) return "revolver";
  return config.weaponType;
}

// ---------------------------------------------------------------------------
// Phase visibility — which game phases should show the weapon
// ---------------------------------------------------------------------------

/** Phases where the weapon should be fully visible and interactive. */
const WEAPON_VISIBLE_PHASES = new Set(["playing", "combat"]);

/** How quickly the weapon lowers/raises (units per second). */
const HOLSTER_SPEED = 3;

/** How far below rest position the weapon drops when holstered. */
const HOLSTER_DROP = 0.4;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WeaponViewProps {
  /** Which weapon to display. If not provided, reads from store equipment. */
  weaponType?: string;
  /** Weapon item ID override (from store equipment). */
  weaponItemId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WeaponView({ weaponType: weaponTypeProp, weaponItemId }: WeaponViewProps) {
  const { camera } = useThree();
  const weaponRef = useRef<WeaponViewModel | null>(null);

  // The "anchor" group follows the camera's world transform each frame.
  // The weapon's own group is a child of this anchor, positioned in camera-local space.
  const anchorRef = useRef<THREE.Group>(null);

  // Read equipped weapon from store if no prop provided
  const getEquippedItem = useGameStore((s) => s.getEquippedItem);
  const equippedWeapon = getEquippedItem("weapon");

  // Read game phase for holster logic
  const phase = useGameStore((s) => s.phase);
  const dialogueState = useGameStore((s) => s.dialogueState);
  const activePanel = useGameStore((s) => s.activePanel);

  // Resolve the weapon type to display
  const resolvedWeaponType = useMemo(() => {
    // Explicit weaponType prop takes precedence
    if (weaponTypeProp) return weaponTypeProp;

    // If weaponItemId provided, resolve from config
    if (weaponItemId) return resolveWeaponType(weaponItemId);

    // Read from store equipment
    if (equippedWeapon) return resolveWeaponType(equippedWeapon.itemId);

    // Default
    return "revolver";
  }, [weaponTypeProp, weaponItemId, equippedWeapon?.itemId]);

  // Track previous fire/reload to detect rising edge (press, not hold)
  const prevFireRef = useRef(false);
  const prevReloadRef = useRef(false);

  // Holster interpolation (0 = fully raised, 1 = fully lowered)
  const holsterAmount = useRef(0);

  // Create or swap the weapon model when weaponType changes
  const weapon = useMemo(() => {
    const factory = WEAPON_FACTORIES[resolvedWeaponType];
    if (!factory) {
      console.warn(
        `WeaponView: unknown weapon type "${resolvedWeaponType}", falling back to revolver`,
      );
      return new Revolver();
    }
    return factory();
  }, [resolvedWeaponType]);

  // Manage weapon model lifecycle: attach to anchor, dispose on swap/unmount
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    // Dispose previous weapon if swapping
    if (weaponRef.current && weaponRef.current !== weapon) {
      anchor.remove(weaponRef.current.group);
      weaponRef.current.dispose();
    }

    weaponRef.current = weapon;
    anchor.add(weapon.group);

    return () => {
      anchor.remove(weapon.group);
      weapon.dispose();
      weaponRef.current = null;
    };
  }, [weapon]);

  // Determine if the weapon should be visible based on game phase
  const shouldShow = WEAPON_VISIBLE_PHASES.has(phase) && !dialogueState && !activePanel;

  // Per-frame update: sync anchor to camera, drive weapon animations
  useFrame((_state, delta) => {
    const anchor = anchorRef.current;
    const current = weaponRef.current;
    if (!anchor || !current) return;

    // --- Sync anchor group to camera world transform ---
    // This keeps the weapon fixed relative to the player's view.
    anchor.position.copy(camera.position);
    anchor.quaternion.copy(camera.quaternion);

    // --- Holster animation ---
    const targetHolster = shouldShow ? 0 : 1;
    if (holsterAmount.current !== targetHolster) {
      const step = HOLSTER_SPEED * delta;
      if (holsterAmount.current < targetHolster) {
        holsterAmount.current = Math.min(holsterAmount.current + step, 1);
      } else {
        holsterAmount.current = Math.max(holsterAmount.current - step, 0);
      }
    }

    // Apply holster offset: slide weapon down and slightly rotate
    const rest = current.getRestPosition();
    const holsterOffset = holsterAmount.current * HOLSTER_DROP;
    const holsterRotation = holsterAmount.current * 0.3; // slight tilt as it lowers

    // The weapon group position is set by WeaponViewModel.update() each frame,
    // but we need to add the holster offset on top. We do this by modifying the
    // group's position after the weapon update runs.

    // Skip input processing if weapon is fully holstered
    if (holsterAmount.current >= 1) {
      // Still update position so the weapon stays attached
      current.group.position.y = rest.y - holsterOffset;
      current.group.rotation.x = holsterRotation;
      return;
    }

    // --- Input processing ---
    const frame = InputManager.getInstance().getFrame();

    // Detect rising edge for fire and reload (trigger on press, not hold)
    const firePressed = frame.fire && !prevFireRef.current;
    const reloadPressed = frame.reload && !prevReloadRef.current;
    prevFireRef.current = frame.fire;
    prevReloadRef.current = frame.reload;

    // State machine transitions (only when weapon is raised)
    if (holsterAmount.current < 0.1) {
      if (firePressed && current.canFire()) {
        current.playFire();
      } else if (reloadPressed && current.canReload()) {
        current.playReload();
      }
    }

    // Update weapon sway, bob, and animation
    current.update(delta, frame);

    // Apply holster offset on top of the sway/bob position
    if (holsterAmount.current > 0) {
      current.group.position.y -= holsterOffset;
      current.group.rotation.x += holsterRotation;
    }
  });

  // Render the anchor group into the R3F scene graph.
  // The weapon's Three.js group is attached imperatively as a child of the
  // anchor (via the useEffect above), so it participates in the scene render.
  return <group ref={anchorRef} />;
}
