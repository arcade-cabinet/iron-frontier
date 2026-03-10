// EntitySpawner — Reads the current location from the store, spawns NPCs
// and enemies as R3F entities, registers them with the ECS world, and
// provides enemy refs to CombatSystem.
//
// For towns: resolves NPC schedules via NPCScheduleResolver, drives
// NPCMovementSystem per frame, renders NPCEntity components with live
// movementState (walk animation, schedule positions), hides indoor NPCs,
// and registers each NPC as an InteractableEntity for the InteractionSystem
// (E to talk / trade). When the player approaches and presses E, the
// InteractionSystem dispatches startDialogue(npcId) or openShop(shopId).
//
// For wilderness: spawns EnemyEntity components based on encounter data
// from the store (danger level, enemy types).
// Also listens to EncounterSystem triggers to spawn encounter enemies.

import { useFrame } from "@react-three/fiber";
import Alea from "alea";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { EnemyEntity } from "@/components/entities/EnemyEntity";
import { NPCEntity } from "@/components/entities/NPCEntity";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { getScheduleForRole } from "@/src/game/data/generation/templates/scheduleTemplates";
// Schedule & movement systems
import { getLocationById } from "@/src/game/data/locations";
import { getNPCsByLocation } from "@/src/game/data/npcs";
import type { Entity } from "@/src/game/ecs/components";
import { world as ecsWorld } from "@/src/game/ecs/world";
import type { CombatEnemy } from "@/src/game/engine/combat";
import { getScaledEnemyStats } from "@/src/game/engine/combat/DamageCalculator";
import { createEnemyAI, disposeEnemyAI } from "@/src/game/engine/combat/EnemyAI";
import type { ChibiConfig } from "@/src/game/engine/renderers/ChibiRenderer";
import type { EnemyType } from "@/src/game/engine/renderers/MonsterFactory";
import type { NPC } from "@/src/game/store/types";
import { getEncounterSystem } from "@/src/game/systems/EncounterSystem";
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
import { rngTick, scopedRNG } from "../../src/game/lib/prng.ts";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EntitySpawnerProps {
  /** Callback providing the current list of CombatEnemy refs to the parent. */
  onEnemiesChange?: (enemies: CombatEnemy[]) => void;
  /** Callback providing the current list of interactable entities (NPCs, etc.). */
  onInteractablesChange?: (entities: InteractableEntity[]) => void;
}

// ---------------------------------------------------------------------------
// Enemy config ID mapping: MonsterFactory EnemyType -> enemies.json ID
// ---------------------------------------------------------------------------

const ENEMY_TYPE_TO_CONFIG_ID: Record<EnemyType, string> = {
  outlaw: "bandit_gunman",
  coyote: "desert_wolf",
  rattlesnake: "rattlesnake",
  scorpion: "scorpion",
  banditBoss: "bandit_leader",
  mineCrawler: "scorpion",
  dustDevil: "desert_wolf",
  clockworkAutomaton: "remnant_sentry",
  wendigo: "grizzly_bear",
  railWraith: "remnant_scout",
};

// ---------------------------------------------------------------------------
// NPC appearance -> ChibiConfig conversion
// ---------------------------------------------------------------------------

const HAT_MAP: Record<string, ChibiConfig["hatType"]> = {
  cowboy: "cowboy",
  bowler: "bowler",
  flat_cap: "bandana",
  none: "none",
};

const CLOTHING_MAP: Record<string, ChibiConfig["clothingType"]> = {
  work: "vest",
  fancy: "shirt",
  vest: "vest",
};

function npcToChibiConfig(npc: NPC): ChibiConfig {
  const app = npc.appearance;
  return {
    skinTone: app?.skinTone ?? "#C08050",
    hairColor: "#3B2F2F",
    hairStyle: app?.hasBeard ? "short" : "short",
    hatType: HAT_MAP[app?.hatStyle ?? "none"] ?? "none",
    hatColor: app?.hatColor ?? "#4A3728",
    clothingColor: app?.shirtColor ?? "#8B6914",
    clothingType: CLOTHING_MAP[app?.shirtStyle ?? "work"] ?? "vest",
    accessory:
      npc.role === "sheriff" || npc.role === "deputy"
        ? "badge"
        : npc.role === "doctor"
          ? "stethoscope"
          : "none",
  };
}

// ---------------------------------------------------------------------------
// Enemy spawn config for wilderness areas
// ---------------------------------------------------------------------------

const WILDERNESS_ENEMIES: Record<
  number,
  { types: EnemyType[]; count: [number, number]; level: number }
> = {
  1: { types: ["coyote", "rattlesnake"], count: [1, 2], level: 1 },
  2: { types: ["coyote", "rattlesnake", "outlaw"], count: [1, 3], level: 1 },
  3: { types: ["outlaw", "coyote"], count: [2, 4], level: 2 },
  4: { types: ["outlaw"], count: [2, 5], level: 3 },
  5: { types: ["outlaw"], count: [3, 6], level: 4 },
};

// ---------------------------------------------------------------------------
// Default schedule for NPCs without a matching template
// ---------------------------------------------------------------------------

/** Default schedule — logged as error when used since every NPC should have a role-matched schedule. */
const DEFAULT_IDLE_SCHEDULE = {
  id: "default_idle",
  validRoles: [] as string[],
  entries: [
    { startHour: 0, endHour: 6, activity: "sleep" as const, locationMarker: "{{home}}" },
    { startHour: 6, endHour: 8, activity: "eat" as const, locationMarker: "{{home}}" },
    { startHour: 8, endHour: 18, activity: "idle" as const, locationMarker: "{{town_center}}" },
    { startHour: 18, endHour: 20, activity: "eat" as const, locationMarker: "{{home}}" },
    { startHour: 20, endHour: 24, activity: "sleep" as const, locationMarker: "{{home}}" },
  ],
  tags: [] as string[],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Internal enemy spawn descriptor
// ---------------------------------------------------------------------------

interface SpawnedEnemy {
  id: string;
  enemyType: EnemyType;
  configId: string;
  level: number;
  maxHealth: number;
  position: [number, number, number];
  name: string;
  seed: string;
}

export function EntitySpawner({ onEnemiesChange, onInteractablesChange }: EntitySpawnerProps) {
  const { currentLocationId, npcs, time, playerPosition } = useGameStoreShallow((s) => ({
    currentLocationId: s.currentLocationId,
    npcs: s.npcs,
    time: s.time,
    playerPosition: s.playerPosition,
  }));

  // Track ECS entity handles for cleanup
  const ecsEntitiesRef = useRef<Entity[]>([]);
  const enemyGroupRefs = useRef<Map<string, THREE.Group>>(new Map());
  const prevLocationRef = useRef<string | null>(null);

  // NPC movement system refs (persistent across renders, rebuilt on location change)
  const movementSystemRef = useRef<NPCMovementSystem | null>(null);
  const markerIndexRef = useRef<LocationMarkerIndex | null>(null);
  const interactablesRef = useRef<InteractableEntity[]>([]);

  // Track enemy health for HP bar rendering (keyed by entity ID)
  const [enemyHealthMap, setEnemyHealthMap] = useState<
    Map<string, { current: number; max: number }>
  >(new Map());

  // Track combat enemies ref for health polling
  const combatEnemiesRef = useRef<CombatEnemy[]>([]);

  // Track encounter-spawned enemies (appended to wilderness enemies)
  const [encounterEnemies, setEncounterEnemies] = useState<SpawnedEnemy[]>([]);
  const encounterCounterRef = useRef(0);

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

  // ---------------------------------------------------------------------------
  // Build LocationMarkerIndex and NPCMovementSystem when location changes
  // ---------------------------------------------------------------------------

  // Track NPC IDs for dependency comparison (avoids re-running on object identity)
  const npcIds = useMemo(
    () =>
      locationNPCs
        .map((n) => n.id)
        .sort()
        .join(","),
    [locationNPCs],
  );

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
      // No location data -- NPCs remain at store positions (no schedule)
      movementSystemRef.current = null;
      markerIndexRef.current = null;
      return;
    }

    // Build marker index from the location data
    const index = buildLocationMarkerIndex(locationData);
    markerIndexRef.current = index;

    // Create movement system
    const system = new NPCMovementSystem(index);
    movementSystemRef.current = system;

    const gameHour = time.hour;

    // Get NPC definitions from the data layer for schedule/shopId info
    const npcDefs = getNPCsByLocation(currentLocationId);
    const npcDefMap = new Map(npcDefs.map((d) => [d.id, d]));

    // Build a map from NPC role -> npcMarker assignedTo building ID
    // so we can give the movement system proper workplace assignments.
    const roleToAssignment = new Map<string, string>();
    for (const marker of locationData.npcMarkers) {
      if (marker.assignedTo) {
        roleToAssignment.set(marker.role, marker.assignedTo);
      }
    }

    // Register each store NPC with the movement system
    for (const npc of locationNPCs) {
      const def = npcDefMap.get(npc.id);
      const schedule = def
        ? (getScheduleForRole(def.role) ??
          (console.error(`[EntitySpawner] No schedule for NPC role "${def.role}" (${def.id})`),
          DEFAULT_IDLE_SCHEDULE))
        : (getScheduleForRole(npc.role) ??
          (console.error(`[EntitySpawner] No schedule for NPC role "${npc.role}" (${npc.id})`),
          DEFAULT_IDLE_SCHEDULE));

      // Resolve the NPC's workplace assignment from the location marker data.
      // Priority: store homeStructureId > marker role match > NPC definition role match
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
  }, [currentLocationId, isTown, npcIds]);

  // ---------------------------------------------------------------------------
  // Per-frame: tick the NPC movement system and update interactable positions
  // ---------------------------------------------------------------------------

  useFrame((_frameState, delta) => {
    const system = movementSystemRef.current;
    if (!system || !isTown) return;

    // Tick the movement system (moves NPCs toward schedule targets)
    system.update({
      gameHour: time.hour,
      playerPosition: { x: playerPosition.x, y: playerPosition.y, z: playerPosition.z },
      deltaTime: delta,
    });

    // Update interactable entity positions from movement states so the
    // InteractionSystem always has fresh positions for proximity checks.
    const interactables = interactablesRef.current;
    for (const entity of interactables) {
      const state = system.getState(entity.id);
      if (state) {
        entity.position = state.currentPosition;
        entity.enabled = state.isAvailable;
      }
    }
  });

  // Generate wilderness enemies based on a seeded RNG and danger level
  const wildernessEnemies = useMemo((): SpawnedEnemy[] => {
    if (isTown || !currentLocationId) return [];

    const rng = Alea(currentLocationId) as unknown as () => number;
    const dangerLevel = 2;
    const config = WILDERNESS_ENEMIES[dangerLevel] ?? WILDERNESS_ENEMIES[2];
    const count = config.count[0] + Math.floor(rng() * (config.count[1] - config.count[0] + 1));

    const result: SpawnedEnemy[] = [];

    for (let i = 0; i < count; i++) {
      const typeIndex = Math.floor(rng() * config.types.length);
      const enemyType = config.types[typeIndex];
      const configId = ENEMY_TYPE_TO_CONFIG_ID[enemyType];
      const level = config.level;
      const scaledStats = getScaledEnemyStats(configId, level, "normal");
      const angle = rng() * Math.PI * 2;
      const dist = 15 + rng() * 40;

      result.push({
        id: `enemy-${currentLocationId}-${i}`,
        enemyType,
        configId,
        level,
        maxHealth: scaledStats.health,
        position: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        name: enemyType.charAt(0).toUpperCase() + enemyType.slice(1),
        seed: `${currentLocationId}-enemy-${i}`,
      });
    }

    return result;
  }, [currentLocationId, isTown]);

  // Combine wilderness + encounter enemies
  const allEnemies = useMemo(
    () => [...wildernessEnemies, ...encounterEnemies],
    [wildernessEnemies, encounterEnemies],
  );

  // ---------------------------------------------------------------------------
  // Wire EncounterSystem to spawn enemies when encounters trigger
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const encounterSystem = getEncounterSystem();

    const unsubscribe = encounterSystem.onEncounter((trigger) => {
      // Map encounter IDs to enemy types and spawn them near the player
      const encounterEnemyTypes: Record<string, EnemyType[]> = {
        bandit_ambush: ["outlaw", "outlaw"],
        bandit_gang: ["outlaw", "outlaw", "outlaw"],
        coyote_pack: ["coyote", "coyote", "coyote"],
        rattlesnake: ["rattlesnake"],
        snake_nest: ["rattlesnake", "rattlesnake"],
        mountain_lion: ["coyote"],
        wolf_pack: ["coyote", "coyote"],
        wild_boar: ["coyote"],
        bear: ["coyote"],
        rockslide: [],
        drifter: ["outlaw"],
        outlaw_camp: ["outlaw", "outlaw", "outlaw"],
        highwayman: ["outlaw"],
        traveling_merchant: [],
      };

      const types = encounterEnemyTypes[trigger.encounterId] ?? ["outlaw"];
      if (types.length === 0) return;

      const newEnemies: SpawnedEnemy[] = types.map((enemyType, i) => {
        const idx = encounterCounterRef.current++;
        const configId = ENEMY_TYPE_TO_CONFIG_ID[enemyType];
        const level = Math.min(3, Math.max(1, Math.floor(scopedRNG("ui", 42, rngTick()) * 3) + 1));
        const scaledStats = getScaledEnemyStats(configId, level, "normal");
        const angle = (i / types.length) * Math.PI * 2 + scopedRNG("ui", 42, rngTick()) * 0.5;
        const dist = 20 + scopedRNG("ui", 42, rngTick()) * 15;

        return {
          id: `encounter-${idx}`,
          enemyType,
          configId,
          level,
          maxHealth: scaledStats.health,
          position: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist] as [number, number, number],
          name: enemyType.charAt(0).toUpperCase() + enemyType.slice(1),
          seed: `encounter-${idx}`,
        };
      });

      setEncounterEnemies((prev) => [...prev, ...newEnemies]);
    });

    return unsubscribe;
  }, []);

  // Clear encounter enemies on location change
  useEffect(() => {
    setEncounterEnemies([]);
  }, [currentLocationId]);

  // Cleanup old ECS entities on location change
  useEffect(() => {
    if (prevLocationRef.current !== currentLocationId) {
      for (const entity of ecsEntitiesRef.current) {
        ecsWorld.remove(entity);
      }
      ecsEntitiesRef.current = [];
      enemyGroupRefs.current.clear();
      prevLocationRef.current = currentLocationId;
    }
  }, [currentLocationId]);

  // Register NPC entities with ECS
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

  // Register enemy entities with ECS and build CombatEnemy refs
  useEffect(() => {
    const newEntities: Entity[] = [];
    const combatEnemies: CombatEnemy[] = [];
    const initialHealthMap = new Map<string, { current: number; max: number }>();

    for (const enemy of allEnemies) {
      const entity: Entity = {
        name: enemy.name,
        tag: "enemy",
        position: { x: enemy.position[0], y: enemy.position[1], z: enemy.position[2] },
        health: { current: enemy.maxHealth, max: enemy.maxHealth },
        aiBehavior: { type: "patrol" },
        loot: {
          items: [
            { itemId: "ammo_pistol", chance: 0.5, quantity: 3 },
            { itemId: "bandages", chance: 0.3, quantity: 1 },
          ],
        },
      };

      ecsWorld.add(entity);
      newEntities.push(entity);

      // Build CombatEnemy — meshGroup is set via ref callback
      const meshGroup = enemyGroupRefs.current.get(enemy.id) ?? new THREE.Group();

      const pos = { x: enemy.position[0], y: enemy.position[1], z: enemy.position[2] };
      const aiState = createEnemyAI(
        enemy.configId,
        enemy.level,
        pos,
        enemy.maxHealth,
        enemy.maxHealth,
        `enemy-${enemy.id}`,
      );

      combatEnemies.push({
        entityId: enemy.id,
        enemyId: enemy.configId,
        level: enemy.level,
        meshGroup,
        ai: aiState,
      });

      initialHealthMap.set(enemy.id, { current: enemy.maxHealth, max: enemy.maxHealth });
    }

    ecsEntitiesRef.current.push(...newEntities);
    combatEnemiesRef.current = combatEnemies;
    setEnemyHealthMap(initialHealthMap);
    onEnemiesChange?.(combatEnemies);

    return () => {
      for (const ce of combatEnemies) {
        disposeEnemyAI(ce.ai);
      }
      for (const e of newEntities) {
        ecsWorld.remove(e);
      }
      ecsEntitiesRef.current = ecsEntitiesRef.current.filter((e) => !newEntities.includes(e));
      combatEnemiesRef.current = [];
      onEnemiesChange?.([]);
    };
  }, [allEnemies, onEnemiesChange]);

  // Poll enemy health from CombatEnemy AI state each frame to update HP bars
  useFrame(() => {
    const enemies = combatEnemiesRef.current;
    if (enemies.length === 0) return;

    let changed = false;
    const newMap = new Map(enemyHealthMap);

    for (const enemy of enemies) {
      const prev = newMap.get(enemy.entityId);
      const currentHealth = enemy.ai.health;
      const maxHealth = enemy.ai.maxHealth;
      if (!prev || prev.current !== currentHealth) {
        newMap.set(enemy.entityId, { current: currentHealth, max: maxHealth });
        changed = true;
      }
    }

    if (changed) {
      setEnemyHealthMap(newMap);
    }
  });

  // Helper to get health percent for an enemy
  const getHealthPercent = useCallback(
    (enemyId: string): number => {
      const hp = enemyHealthMap.get(enemyId);
      if (!hp || hp.max <= 0) return 1;
      return Math.max(0, hp.current / hp.max);
    },
    [enemyHealthMap],
  );

  // Helper to check if enemy is dead
  const isEnemyDead = useCallback(
    (enemyId: string): boolean => {
      const hp = enemyHealthMap.get(enemyId);
      return hp ? hp.current <= 0 : false;
    },
    [enemyHealthMap],
  );

  return (
    <group name="entity-spawner">
      {/* Town NPCs with schedule-driven movement */}
      {isTown &&
        locationNPCs.map((npc) => {
          const moveState = movementSystemRef.current?.getState(npc.id);
          return (
            <NPCEntity
              key={npc.id}
              config={npcToChibiConfig(npc)}
              position={[npc.position.x, npc.position.y, npc.position.z]}
              name={npc.name}
              rotation={npc.rotation}
              seed={`npc-${npc.id}`}
              movementState={moveState}
              hidden={moveState?.isIndoors === true}
            />
          );
        })}

      {/* Wilderness + encounter enemies */}
      {!isTown &&
        allEnemies.map((enemy) => (
          <group
            key={enemy.id}
            ref={(g) => {
              if (g) enemyGroupRefs.current.set(enemy.id, g);
            }}
          >
            <EnemyEntity
              enemyType={enemy.enemyType}
              position={enemy.position}
              seed={enemy.seed}
              name={enemy.name}
              healthPercent={getHealthPercent(enemy.id)}
              isDead={isEnemyDead(enemy.id)}
            />
          </group>
        ))}
    </group>
  );
}
