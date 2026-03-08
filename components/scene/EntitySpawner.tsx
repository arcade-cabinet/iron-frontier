// EntitySpawner — Reads the current location from the store, spawns NPCs
// and enemies as R3F entities, registers them with the ECS world, and
// provides enemy refs to CombatSystem.
//
// For towns: renders NPCEntity components based on the NPC records in the
// store for the current location.
// For wilderness: spawns EnemyEntity components based on encounter data
// from the store (danger level, enemy types).

import { useEffect, useMemo, useRef } from 'react';
import Alea from 'alea';
import * as THREE from 'three';

import { useGameStore, useGameStoreShallow } from '@/hooks/useGameStore';
import { NPCEntity } from '@/components/entities/NPCEntity';
import { EnemyEntity } from '@/components/entities/EnemyEntity';
import { world as ecsWorld } from '@/src/game/ecs/world';
import type { Entity } from '@/src/game/ecs/components';
import type { CombatEnemy } from '@/src/game/engine/combat';
import { createEnemyAI } from '@/src/game/engine/combat/EnemyAI';
import type { ChibiConfig } from '@/src/game/engine/renderers/ChibiRenderer';
import type { EnemyType } from '@/src/game/engine/renderers/MonsterFactory';
import type { NPC, WorldPosition } from '@/src/game/store/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EntitySpawnerProps {
  /** Callback providing the current list of CombatEnemy refs to the parent. */
  onEnemiesChange?: (enemies: CombatEnemy[]) => void;
}

// ---------------------------------------------------------------------------
// NPC appearance -> ChibiConfig conversion
// ---------------------------------------------------------------------------

const HAT_MAP: Record<string, ChibiConfig['hatType']> = {
  cowboy: 'cowboy',
  bowler: 'bowler',
  flat_cap: 'bandana',
  none: 'none',
};

const CLOTHING_MAP: Record<string, ChibiConfig['clothingType']> = {
  work: 'vest',
  fancy: 'shirt',
  vest: 'vest',
};

function npcToChibiConfig(npc: NPC): ChibiConfig {
  const app = npc.appearance;
  return {
    skinTone: app?.skinTone ?? '#C08050',
    hairColor: '#3B2F2F',
    hairStyle: app?.hasBeard ? 'short' : 'short',
    hatType: HAT_MAP[app?.hatStyle ?? 'none'] ?? 'none',
    hatColor: app?.hatColor ?? '#4A3728',
    clothingColor: app?.shirtColor ?? '#8B6914',
    clothingType: CLOTHING_MAP[app?.shirtStyle ?? 'work'] ?? 'vest',
    accessory: (npc.role === 'sheriff' || npc.role === 'deputy') ? 'badge' : npc.role === 'doctor' ? 'stethoscope' : 'none',
  };
}

// ---------------------------------------------------------------------------
// Enemy spawn config for wilderness areas
// ---------------------------------------------------------------------------

const WILDERNESS_ENEMIES: Record<number, { types: EnemyType[]; count: [number, number] }> = {
  1: { types: ['coyote', 'rattlesnake'], count: [1, 2] },
  2: { types: ['coyote', 'rattlesnake', 'outlaw'], count: [1, 3] },
  3: { types: ['outlaw', 'coyote'], count: [2, 4] },
  4: { types: ['outlaw'], count: [2, 5] },
  5: { types: ['outlaw'], count: [3, 6] },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EntitySpawner({ onEnemiesChange }: EntitySpawnerProps) {
  const { currentLocationId, npcs } = useGameStoreShallow((s) => ({
    currentLocationId: s.currentLocationId,
    npcs: s.npcs,
  }));

  // Track ECS entity handles for cleanup
  const ecsEntitiesRef = useRef<Entity[]>([]);
  const enemyGroupRefs = useRef<Map<string, THREE.Group>>(new Map());
  const prevLocationRef = useRef<string | null>(null);

  // Determine if this is a town (has NPCs) or wilderness
  const locationNPCs = useMemo(() => {
    if (!currentLocationId) return [];
    return Object.values(npcs).filter((npc) => {
      // NPCs are associated with the current location if their home structure
      // or their presence is tracked. We render all known NPCs for now.
      return npc.isAlive;
    });
  }, [currentLocationId, npcs]);

  const isTown = locationNPCs.length > 0;

  // Generate wilderness enemies based on a seeded RNG and danger level
  const wildernessEnemies = useMemo(() => {
    if (isTown || !currentLocationId) return [];

    const rng = Alea(currentLocationId) as unknown as () => number;
    // Default danger level 2 for wilderness without specific data
    const dangerLevel = 2;
    const config = WILDERNESS_ENEMIES[dangerLevel] ?? WILDERNESS_ENEMIES[2];
    const count = config.count[0] + Math.floor(rng() * (config.count[1] - config.count[0] + 1));

    const result: Array<{
      id: string;
      enemyType: EnemyType;
      position: [number, number, number];
      name: string;
      seed: string;
    }> = [];

    for (let i = 0; i < count; i++) {
      const typeIndex = Math.floor(rng() * config.types.length);
      const angle = rng() * Math.PI * 2;
      const dist = 15 + rng() * 40;

      result.push({
        id: `enemy-${currentLocationId}-${i}`,
        enemyType: config.types[typeIndex],
        position: [
          Math.cos(angle) * dist,
          0,
          Math.sin(angle) * dist,
        ],
        name: config.types[typeIndex].charAt(0).toUpperCase() + config.types[typeIndex].slice(1),
        seed: `${currentLocationId}-enemy-${i}`,
      });
    }

    return result;
  }, [currentLocationId, isTown]);

  // Cleanup old ECS entities on location change
  useEffect(() => {
    if (prevLocationRef.current !== currentLocationId) {
      // Remove old ECS entities
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
        tag: 'npc',
        position: { x: npc.position.x, y: npc.position.y, z: npc.position.z },
        health: { current: 100, max: 100 },
        aiBehavior: { type: 'idle' },
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
      ecsEntitiesRef.current = ecsEntitiesRef.current.filter(
        (e) => !newEntities.includes(e),
      );
    };
  }, [locationNPCs]);

  // Register enemy entities with ECS and build CombatEnemy refs
  useEffect(() => {
    const newEntities: Entity[] = [];
    const combatEnemies: CombatEnemy[] = [];

    for (const enemy of wildernessEnemies) {
      const entity: Entity = {
        name: enemy.name,
        tag: 'enemy',
        position: { x: enemy.position[0], y: enemy.position[1], z: enemy.position[2] },
        health: { current: 30, max: 30 },
        aiBehavior: { type: 'patrol' },
        loot: {
          items: [
            { itemId: 'ammo_pistol', chance: 0.5, quantity: 3 },
            { itemId: 'bandages', chance: 0.3, quantity: 1 },
          ],
        },
      };

      ecsWorld.add(entity);
      newEntities.push(entity);

      // Build CombatEnemy — meshGroup is set via ref callback
      const meshGroup = enemyGroupRefs.current.get(enemy.id) ?? new THREE.Group();

      const pos = { x: enemy.position[0], y: enemy.position[1], z: enemy.position[2] };
      const aiState = createEnemyAI(
        enemy.id,
        1,
        pos,
        30,
        30,
        `enemy-${enemy.id}`,
      );

      combatEnemies.push({
        entityId: enemy.id,
        enemyId: enemy.id,
        level: 1,
        meshGroup,
        ai: aiState,
      });
    }

    ecsEntitiesRef.current.push(...newEntities);
    onEnemiesChange?.(combatEnemies);

    return () => {
      for (const e of newEntities) {
        ecsWorld.remove(e);
      }
      ecsEntitiesRef.current = ecsEntitiesRef.current.filter(
        (e) => !newEntities.includes(e),
      );
      onEnemiesChange?.([]);
    };
  }, [wildernessEnemies, onEnemiesChange]);

  return (
    <group name="entity-spawner">
      {/* Town NPCs */}
      {isTown &&
        locationNPCs.map((npc) => (
          <NPCEntity
            key={npc.id}
            config={npcToChibiConfig(npc)}
            position={[npc.position.x, npc.position.y, npc.position.z]}
            name={npc.name}
            rotation={npc.rotation}
            seed={`npc-${npc.id}`}
          />
        ))}

      {/* Wilderness enemies */}
      {!isTown &&
        wildernessEnemies.map((enemy) => (
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
              healthPercent={1}
            />
          </group>
        ))}
    </group>
  );
}
