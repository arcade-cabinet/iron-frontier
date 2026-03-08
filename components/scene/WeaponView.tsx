// WeaponView — R3F component that renders the first-person weapon view model.
//
// Attaches the weapon to the camera so it stays fixed in the player's view.
// Reads InputFrame each frame to drive sway, bob, and fire/reload triggers.
// Manages a simple state machine: IDLE -> FIRING -> IDLE, IDLE -> RELOADING -> IDLE.
//
// Now reads the equipped weapon from the Zustand store and maps weapon item IDs
// to view model types. Supports weapon switching via number keys 1-5.

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { InputManager } from '@/src/game/input';
import { useGameStore } from '@/hooks/useGameStore';
import { getWeaponConfig } from '@/src/game/engine/combat';
import { WeaponViewModel } from '@/src/game/engine/renderers/WeaponViewModel';
import {
  Dynamite,
  Lantern,
  Lasso,
  Pickaxe,
  Revolver,
  Rifle,
  Shotgun,
} from '@/src/game/engine/renderers/weapons';

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
  if (!config) return 'revolver';
  return config.weaponType;
}

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

export function WeaponView({
  weaponType: weaponTypeProp,
  weaponItemId,
}: WeaponViewProps) {
  const { camera } = useThree();
  const weaponRef = useRef<WeaponViewModel | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Read equipped weapon from store if no prop provided
  const getEquippedItem = useGameStore((s) => s.getEquippedItem);
  const equippedWeapon = getEquippedItem('weapon');

  // Resolve the weapon type to display
  const resolvedWeaponType = useMemo(() => {
    // Explicit weaponType prop takes precedence
    if (weaponTypeProp) return weaponTypeProp;

    // If weaponItemId provided, resolve from config
    if (weaponItemId) return resolveWeaponType(weaponItemId);

    // Read from store equipment
    if (equippedWeapon) return resolveWeaponType(equippedWeapon.itemId);

    // Default
    return 'revolver';
  }, [weaponTypeProp, weaponItemId, equippedWeapon?.itemId]);

  // Track previous fire/reload to detect rising edge (press, not hold)
  const prevFireRef = useRef(false);
  const prevReloadRef = useRef(false);

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

  // Attach/detach weapon group to the camera
  useEffect(() => {
    // Dispose previous weapon if swapping
    if (weaponRef.current && weaponRef.current !== weapon) {
      camera.remove(weaponRef.current.group);
      weaponRef.current.dispose();
    }

    weaponRef.current = weapon;
    camera.add(weapon.group);

    return () => {
      camera.remove(weapon.group);
      weapon.dispose();
      weaponRef.current = null;
    };
  }, [weapon, camera]);

  // Per-frame update
  useFrame((_state, delta) => {
    const current = weaponRef.current;
    if (!current) return;

    const frame = InputManager.getInstance().getFrame();

    // Detect rising edge for fire and reload (trigger on press, not hold)
    const firePressed = frame.fire && !prevFireRef.current;
    const reloadPressed = frame.reload && !prevReloadRef.current;
    prevFireRef.current = frame.fire;
    prevReloadRef.current = frame.reload;

    // State machine transitions
    if (firePressed && current.canFire()) {
      current.playFire();
    } else if (reloadPressed && current.canReload()) {
      current.playReload();
    }

    // Update weapon sway, bob, and animation
    current.update(delta, frame);
  });

  // The weapon is attached directly to the camera via useEffect,
  // so we don't render anything into the R3F scene graph here.
  // We return an empty group as a mount point for future extensions
  // (e.g., crosshair, ammo HUD attached to weapon space).
  return <group ref={groupRef} />;
}
