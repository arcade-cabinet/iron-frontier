// InteractionDetector — R3F component that detects interactive objects
// in front of the player camera each frame.
//
// Uses distance checks to NPCs and building doors to determine what the
// player can interact with. Exposes the current interaction target via
// callback so the UI layer can show "Press E" prompts.

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

import { npcs as npcQuery, dialogueTargets } from '@/src/game/ecs/world';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InteractionType = 'npc' | 'door' | 'item' | 'none';

export interface InteractionTarget {
  type: InteractionType;
  /** Entity or object name. */
  name: string;
  /** Entity ID (NPC id, building id, etc). */
  entityId: string;
  /** Distance from the player. */
  distance: number;
  /** World position of the target. */
  position: THREE.Vector3;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface InteractionDetectorProps {
  /** Called each frame with the nearest interaction target, or null. */
  onInteractionChange?: (target: InteractionTarget | null) => void;
  /** Max distance (world units) for NPC interaction. */
  npcRange?: number;
  /** Max distance (world units) for door interaction. */
  doorRange?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_NPC_RANGE = 3;
const DEFAULT_DOOR_RANGE = 2.5;

// Scratch vectors to avoid per-frame allocation
const _playerPos = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _forward = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InteractionDetector({
  onInteractionChange,
  npcRange = DEFAULT_NPC_RANGE,
  doorRange = DEFAULT_DOOR_RANGE,
}: InteractionDetectorProps) {
  const { camera, scene } = useThree();
  const prevTargetRef = useRef<string | null>(null);

  useFrame(() => {
    if (!onInteractionChange) return;

    _playerPos.copy(camera.position);
    camera.getWorldDirection(_forward);

    let bestTarget: InteractionTarget | null = null;
    let bestDist = Infinity;

    // --- Check NPC entities from ECS ---
    for (const entity of dialogueTargets.entities) {
      if (!entity.position) continue;

      _targetPos.set(entity.position.x, entity.position.y, entity.position.z);
      const dist = _playerPos.distanceTo(_targetPos);

      if (dist > npcRange) continue;

      // Check if the NPC is roughly in front of the player (dot product > 0)
      const toTarget = _targetPos.clone().sub(_playerPos).normalize();
      const dot = _forward.dot(toTarget);

      if (dot < 0.3) continue; // Must be within ~72 degrees of forward

      if (dist < bestDist) {
        bestDist = dist;
        bestTarget = {
          type: 'npc',
          name: entity.name ?? 'NPC',
          entityId: entity.dialogueTarget?.npcId ?? '',
          distance: dist,
          position: _targetPos.clone(),
        };
      }
    }

    // --- Check building doors via scene traversal ---
    // Buildings are named "building-*" in OpenWorld. We look for door markers.
    scene.traverse((obj) => {
      if (!obj.name.startsWith('building-')) return;

      _targetPos.setFromMatrixPosition(obj.matrixWorld);
      // Doors are at the front of the building, approximate as building center
      const dist = _playerPos.distanceTo(_targetPos);

      if (dist > doorRange) return;

      const toTarget = _targetPos.clone().sub(_playerPos).normalize();
      const dot = _forward.dot(toTarget);
      if (dot < 0.3) return;

      if (dist < bestDist) {
        bestDist = dist;
        const buildingId = obj.name.replace('building-', '');
        bestTarget = {
          type: 'door',
          name: obj.userData?.name ?? 'Building',
          entityId: buildingId,
          distance: dist,
          position: _targetPos.clone(),
        };
      }
    });

    // Only fire the callback when the target changes
    const targetKey = bestTarget
      ? `${bestTarget.type}:${bestTarget.entityId}`
      : null;

    if (targetKey !== prevTargetRef.current) {
      prevTargetRef.current = targetKey;
      onInteractionChange(bestTarget);
    }
  });

  // This component renders nothing — it only runs logic each frame
  return null;
}
