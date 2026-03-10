// useEnemySpawner — Manages enemy lifecycle: wilderness spawning, encounter
// system integration, ECS registration, health tracking, and CombatEnemy refs.

import { useFrame } from "@react-three/fiber";
import Alea from "alea";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Entity } from "@/src/game/ecs/components";
import { world as ecsWorld } from "@/src/game/ecs/world";
import type { CombatEnemy } from "@/src/game/engine/combat";
import { getScaledEnemyStats } from "@/src/game/engine/combat/DamageCalculator";
import { createEnemyAI, disposeEnemyAI } from "@/src/game/engine/combat/EnemyAI";
import type { EnemyType } from "@/src/game/engine/renderers/MonsterFactory";
import { getEncounterSystem } from "@/src/game/systems/EncounterSystem";
import { rngTick, scopedRNG } from "../../../src/game/lib/prng.ts";
import { ENEMY_TYPE_TO_CONFIG_ID, type SpawnedEnemy, WILDERNESS_ENEMIES } from "./types.ts";

interface UseEnemySpawnerResult {
  allEnemies: SpawnedEnemy[];
  enemyGroupRefs: React.RefObject<Map<string, THREE.Group>>;
  getHealthPercent: (enemyId: string) => number;
  isEnemyDead: (enemyId: string) => boolean;
}

export function useEnemySpawner(
  currentLocationId: string | null,
  isTown: boolean,
  onEnemiesChange?: (enemies: CombatEnemy[]) => void,
): UseEnemySpawnerResult {
  const ecsEntitiesRef = useRef<Entity[]>([]);
  const enemyGroupRefs = useRef<Map<string, THREE.Group>>(new Map());
  const prevLocationRef = useRef<string | null>(null);
  const combatEnemiesRef = useRef<CombatEnemy[]>([]);
  const encounterCounterRef = useRef(0);

  const [enemyHealthMap, setEnemyHealthMap] = useState<
    Map<string, { current: number; max: number }>
  >(new Map());

  const [encounterEnemies, setEncounterEnemies] = useState<SpawnedEnemy[]>([]);

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
  }, []);

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

  const getHealthPercent = useCallback(
    (enemyId: string): number => {
      const hp = enemyHealthMap.get(enemyId);
      if (!hp || hp.max <= 0) return 1;
      return Math.max(0, hp.current / hp.max);
    },
    [enemyHealthMap],
  );

  const isEnemyDead = useCallback(
    (enemyId: string): boolean => {
      const hp = enemyHealthMap.get(enemyId);
      return hp ? hp.current <= 0 : false;
    },
    [enemyHealthMap],
  );

  return { allEnemies, enemyGroupRefs, getHealthPercent, isEnemyDead };
}
