// TownBuilding — Renders a single building using the archetype registry
// or a fallback procedural box. Registers doors with the DoorSystem for
// archetypes that have walkable interiors.

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { ARCHETYPE_REGISTRY } from "@/src/game/engine/archetypes/index";
import { getDoorSystem } from "@/src/game/engine/interiors/DoorSystem";
import {
  addInteriorLighting,
  getDoorWorldPosition,
  hasInterior,
} from "@/src/game/engine/interiors/InteriorGenerator";

import { buildFallbackBuilding, STRUCTURE_TO_ARCHETYPE } from "./fallbackBuilding.ts";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TownBuildingProps {
  id: string;
  position: [number, number, number];
  rotation: number;
  structureType: string;
  name: string;
  importance: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TownBuilding({
  id,
  position,
  rotation,
  structureType,
  name,
  importance,
}: TownBuildingProps) {
  const groupRef = useRef<THREE.Group>(null);

  const archetypeKey = useMemo(
    () => STRUCTURE_TO_ARCHETYPE[structureType] ?? structureType,
    [structureType],
  );

  const buildingGroup = useMemo(() => {
    const archetype = ARCHETYPE_REGISTRY.get(archetypeKey);

    if (archetype) {
      const group = archetype.construct({ signText: name });

      // Add interior lighting (warm point lights, idempotent)
      addInteriorLighting(group, archetypeKey);

      return group;
    }

    // No archetype registered — use procedural PBR building
    console.warn(
      `[OpenWorld] No archetype "${archetypeKey}" for structure "${structureType}" — using procedural building`,
    );
    return buildFallbackBuilding(structureType, importance);
  }, [archetypeKey, structureType, name, importance]);

  // Register door trigger zone with the DoorSystem when mounted
  useEffect(() => {
    if (!hasInterior(archetypeKey)) return;

    const doorPos = getDoorWorldPosition(archetypeKey, position[0], position[2], rotation);
    if (!doorPos) return;

    const doorSystem = getDoorSystem();

    // Find the door mesh inside the building group for animation
    let doorMesh: THREE.Object3D | undefined;
    buildingGroup.traverse((child) => {
      if (child.name === "door" || child.name === "door-panel") {
        doorMesh = child;
      }
    });

    doorSystem.registerDoor(
      id,
      archetypeKey,
      name,
      new THREE.Vector3(doorPos.x, doorPos.y, doorPos.z),
      doorMesh,
    );

    return () => {
      doorSystem.unregisterDoor(id);
    };
  }, [id, archetypeKey, name, position, rotation, buildingGroup]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotation, 0]}
      name={`building-${id}`}
      userData={{ name, archetypeKey }}
    >
      <primitive object={buildingGroup} />
    </group>
  );
}
