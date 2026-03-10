// useNPCSpawner — Manages NPC lifecycle: schedule resolution, movement,
// ECS registration, and interactable entity tracking for towns.

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { getScheduleForRole } from "@/src/game/data/generation/templates/scheduleTemplates";
import { getLocationById } from "@/src/game/data/locations";
import { getNPCsByLocation } from "@/src/game/data/npcs";
import type { Entity } from "@/src/game/ecs/components";
import { world as ecsWorld } from "@/src/game/ecs/world";
import type { NPC } from "@/src/game/store/types";
import {
  createNPCInteractable,
  type InteractableEntity,
} from "@/src/game/systems/InteractionSystem";
import { NPCMovementSystem } from "@/src/game/systems/NPCMovementSystem";
import {
  buildLocationMarkerIndex,
  type LocationMarkerIndex,
  type NPCInstanceData,
} from "@/src/game/systems/NPCScheduleResolver";
import { DEFAULT_IDLE_SCHEDULE } from "./types.ts";

interface UseNPCSpawnerResult {
  locationNPCs: NPC[];
  isTown: boolean;
  movementSystemRef: React.RefObject<NPCMovementSystem | null>;
}

export function useNPCSpawner(
  onInteractablesChange?: (entities: InteractableEntity[]) => void,
): UseNPCSpawnerResult {
  const { currentLocationId, npcs, time, playerPosition } = useGameStoreShallow((s) => ({
    currentLocationId: s.currentLocationId,
    npcs: s.npcs,
    time: s.time,
    playerPosition: s.playerPosition,
  }));

  const movementSystemRef = useRef<NPCMovementSystem | null>(null);
  const markerIndexRef = useRef<LocationMarkerIndex | null>(null);
  const interactablesRef = useRef<InteractableEntity[]>([]);
  const ecsEntitiesRef = useRef<Entity[]>([]);

  // Determine if this is a town (has NPCs) or wilderness
  const locationNPCs = useMemo(() => {
    if (!currentLocationId) return [];
    return Object.values(npcs).filter((npc) => {
      return npc.isAlive;
    });
  }, [currentLocationId, npcs]);

  // Check if this is a town — use store NPCs first, but fall back to the data
  // layer to avoid spawning wilderness enemies in towns before NPCs are loaded.
  const isTown = useMemo(() => {
    if (locationNPCs.length > 0) return true;
    if (!currentLocationId) return false;
    const dataNPCs = getNPCsByLocation(currentLocationId);
    return dataNPCs.length > 0;
  }, [locationNPCs, currentLocationId]);

  // Track NPC IDs for dependency comparison (avoids re-running on object identity)
  const _npcIds = useMemo(
    () =>
      locationNPCs
        .map((n) => n.id)
        .sort()
        .join(","),
    [locationNPCs],
  );

  // ---------------------------------------------------------------------------
  // Build LocationMarkerIndex and NPCMovementSystem when location changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!currentLocationId || !isTown) {
      movementSystemRef.current?.clear();
      movementSystemRef.current = null;
      markerIndexRef.current = null;
      interactablesRef.current = [];
      onInteractablesChange?.([]);
      return;
    }

    const locationData = getLocationById(currentLocationId);
    if (!locationData) {
      movementSystemRef.current = null;
      markerIndexRef.current = null;
      return;
    }

    const index = buildLocationMarkerIndex(locationData);
    markerIndexRef.current = index;

    const system = new NPCMovementSystem(index);
    movementSystemRef.current = system;

    const gameHour = time.hour;

    const npcDefs = getNPCsByLocation(currentLocationId);
    const npcDefMap = new Map(npcDefs.map((d) => [d.id, d]));

    const roleToAssignment = new Map<string, string>();
    for (const marker of locationData.npcMarkers) {
      if (marker.assignedTo) {
        roleToAssignment.set(marker.role, marker.assignedTo);
      }
    }

    for (const npc of locationNPCs) {
      const def = npcDefMap.get(npc.id);
      const roleForSchedule = def ? def.role : npc.role;
      const idForLog = def ? def.id : npc.id;
      let schedule = getScheduleForRole(roleForSchedule);
      if (!schedule) {
        console.error(
          `[EntitySpawner] No schedule for NPC role "${roleForSchedule}" (${idForLog})`,
        );
        schedule = DEFAULT_IDLE_SCHEDULE;
      }

      const assignedTo =
        npc.homeStructureId ??
        roleToAssignment.get(npc.role) ??
        (def ? roleToAssignment.get(def.role) : undefined);

      const instanceData: NPCInstanceData = {
        npcId: npc.id,
        role: npc.role,
        homePosition: { x: npc.position.x, y: npc.position.y, z: npc.position.z },
        assignedTo,
        schedule,
      };

      system.registerNPC(instanceData, gameHour);
    }

    // Build initial interactable entries for the InteractionSystem
    const interactables: InteractableEntity[] = [];
    for (const npc of locationNPCs) {
      const state = system.getState(npc.id);
      const pos = state?.currentPosition ?? npc.position;
      const def = npcDefMap.get(npc.id);

      interactables.push(
        createNPCInteractable(npc.id, npc.name, pos, {
          npcId: npc.id,
          shopId: def?.shopId,
          enabled: state?.isAvailable !== false,
        }),
      );
    }
    interactablesRef.current = interactables;
    onInteractablesChange?.(interactables);

    return () => {
      system.clear();
      interactablesRef.current = [];
      onInteractablesChange?.([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocationId, isTown, locationNPCs, onInteractablesChange, time.hour]);

  // ---------------------------------------------------------------------------
  // Per-frame: tick the NPC movement system and update interactable positions
  // ---------------------------------------------------------------------------

  useFrame((_frameState, delta) => {
    const system = movementSystemRef.current;
    if (!system || !isTown) return;

    system.update({
      gameHour: time.hour,
      playerPosition: { x: playerPosition.x, y: playerPosition.y, z: playerPosition.z },
      deltaTime: delta,
    });

    const interactables = interactablesRef.current;
    for (const entity of interactables) {
      const state = system.getState(entity.id);
      if (state) {
        entity.position = state.currentPosition;
        entity.enabled = state.isAvailable;
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Register NPC entities with ECS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const newEntities: Entity[] = [];

    for (const npc of locationNPCs) {
      const entity: Entity = {
        name: npc.name,
        tag: "npc",
        position: { x: npc.position.x, y: npc.position.y, z: npc.position.z },
        health: { current: 100, max: 100 },
        aiBehavior: { type: "idle" },
        dialogueTarget: {
          npcId: npc.id,
          dialogueTreeId: npc.questIds?.[0] ?? npc.id,
        },
      };

      if (npc.questGiver && npc.questIds.length > 0) {
        entity.questGiver = { questIds: npc.questIds };
      }

      ecsWorld.add(entity);
      newEntities.push(entity);
    }

    ecsEntitiesRef.current.push(...newEntities);

    return () => {
      for (const e of newEntities) {
        ecsWorld.remove(e);
      }
      ecsEntitiesRef.current = ecsEntitiesRef.current.filter((e) => !newEntities.includes(e));
    };
  }, [locationNPCs]);

  return { locationNPCs, isTown, movementSystemRef };
}
