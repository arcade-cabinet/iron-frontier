// Building — React Three Fiber component for procedural building archetypes.
// Looks up the archetype from ARCHETYPE_REGISTRY, calls construct(), and
// renders the resulting THREE.Group via <primitive>.
//
// Registers the building group as a box collider with PhysicsProvider
// so the player cannot walk through walls.

import { useEffect, useMemo, useRef } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

import { ARCHETYPE_REGISTRY } from '../../engine/archetypes';
import type { BuildingSlots } from '../../engine/archetypes';
import { usePhysics } from '@/components/scene/PhysicsProvider';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BuildingProps extends Omit<ThreeElements['group'], 'children'> {
  /** Archetype type key — must match a registered BuildingArchetype. */
  type: string;
  /** Optional slot overrides passed to the archetype's construct(). */
  slots?: BuildingSlots;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a procedural building archetype as an R3F scene node.
 *
 * Usage:
 * ```tsx
 * <Building
 *   type="saloon"
 *   slots={{ signText: 'THE LUCKY STAR' }}
 *   position={[10, 0, -5]}
 *   rotation={[0, Math.PI / 4, 0]}
 * />
 * ```
 */
export function Building({ type, slots, ...groupProps }: BuildingProps) {
  const { registerBuilding, unregister } = usePhysics();
  const groupRef = useRef<THREE.Group>(null);
  const colliderIdsRef = useRef<string[]>([]);

  // Memoize on type + serialized slots so construction only happens once
  // unless the inputs actually change.
  const slotsKey = useMemo(
    () => (slots ? JSON.stringify(slots) : ''),
    [slots],
  );

  const group = useMemo(() => {
    const archetype = ARCHETYPE_REGISTRY.get(type);
    if (!archetype) {
      console.warn(`[Building] Unknown archetype "${type}". Registered: ${[...ARCHETYPE_REGISTRY.keys()].join(', ')}`);
      return null;
    }
    return archetype.construct(slots ?? {});
  }, [type, slotsKey]);

  // Register colliders when the building group is created / changes
  useEffect(() => {
    // Unregister previous colliders
    for (const id of colliderIdsRef.current) {
      unregister(id);
    }
    colliderIdsRef.current = [];

    if (!group) return;

    // Ensure world matrices are up to date before extracting colliders.
    // We need the parent group's transform applied, so defer to next frame
    // via a microtask to let R3F place the <primitive> in the scene graph.
    const handle = requestAnimationFrame(() => {
      if (groupRef.current) {
        groupRef.current.updateMatrixWorld(true);
        const ids = registerBuilding(groupRef.current);
        colliderIdsRef.current = ids;
      }
    });

    return () => {
      cancelAnimationFrame(handle);
      for (const id of colliderIdsRef.current) {
        unregister(id);
      }
      colliderIdsRef.current = [];
    };
  }, [group, registerBuilding, unregister]);

  if (!group) return null;

  return (
    <group ref={groupRef} {...groupProps}>
      <primitive object={group} />
    </group>
  );
}
