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

import { EnemyEntity } from "@/components/entities/EnemyEntity";
import { NPCEntity } from "@/components/entities/NPCEntity";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { type EntitySpawnerProps, npcToChibiConfig } from "./types.ts";
import { useEnemySpawner } from "./useEnemySpawner.ts";
import { useNPCSpawner } from "./useNPCSpawner.ts";

export function EntitySpawner({ onEnemiesChange, onInteractablesChange }: EntitySpawnerProps) {
  const currentLocationId = useGameStoreShallow((s) => s.currentLocationId);

  const { locationNPCs, isTown, movementSystemRef } = useNPCSpawner(onInteractablesChange);
  const { allEnemies, enemyGroupRefs, getHealthPercent, isEnemyDead } = useEnemySpawner(
    currentLocationId,
    isTown,
    onEnemiesChange,
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
