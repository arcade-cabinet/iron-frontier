import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGameStore } from "@/hooks/useGameStore";
import {
  createWeaponState,
  type DamageNumberData,
  getDifficultyConfig,
  processCombatTick,
  type WeaponRuntimeState,
} from "@/src/game/engine/combat";
import { InputManager } from "@/src/game/input";
import { gameAudioBridge } from "@/src/game/services/audio/GameAudioBridge";
import { questEvents } from "@/src/game/systems/QuestEvents";
import { DamageNumber } from "./DamageNumber.tsx";
import { rollLoot } from "./loot.ts";
import type { CombatSystemProps } from "./types.ts";
import { getWeaponSlots } from "./weaponSlots.ts";

export function CombatSystem({
  weaponId: weaponIdProp,
  difficulty = "normal",
  reserveAmmo = 60,
  enemies = [],
  locationId = "unknown",
  onCrosshairSpreadChange,
  onHitMarker,
  onWeaponStateChange,
  onPlayerDamage,
  onPlayerDamageDirectional,
  onWeaponSwitch,
}: CombatSystemProps) {
  const { camera, scene } = useThree();

  const takeDamage = useGameStore((s) => s.takeDamage);
  const gainXP = useGameStore((s) => s.gainXP);
  const addGold = useGameStore((s) => s.addGold);
  const addItemById = useGameStore((s) => s.addItemById);
  const equipItem = useGameStore((s) => s.equipItem);
  const getEquippedItem = useGameStore((s) => s.getEquippedItem);
  const getEquipmentBonuses = useGameStore((s) => s.getEquipmentBonuses);
  const inventory = useGameStore((s) => s.inventory);
  const equipment = useGameStore((s) => s.equipment);

  const equippedWeapon = getEquippedItem("weapon");
  const activeWeaponId = weaponIdProp ?? equippedWeapon?.itemId ?? "revolver";

  const playerArmor = getEquipmentBonuses().defense;

  const weaponStateRef = useRef<WeaponRuntimeState>(createWeaponState(activeWeaponId, reserveAmmo));

  const prevWeaponIdRef = useRef(activeWeaponId);
  useEffect(() => {
    if (prevWeaponIdRef.current !== activeWeaponId) {
      weaponStateRef.current = createWeaponState(activeWeaponId, reserveAmmo);
      prevWeaponIdRef.current = activeWeaponId;
    }
  }, [activeWeaponId, reserveAmmo]);

  const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);

  const prevFireRef = useRef(false);

  const weaponSlots = useMemo(
    () => getWeaponSlots(inventory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inventory.length, inventory],
  );

  const deadEnemyTimers = useRef<Map<string, number>>(new Map());
  const prevReloadPhaseRef = useRef<string>("none");

  useFrame((_state, delta) => {
    const inputFrame = InputManager.getInstance().getFrame();

    if (inputFrame.weaponSwitch > 0 && inputFrame.weaponSwitch <= 5) {
      const slotIndex = inputFrame.weaponSwitch - 1;
      const targetInventoryId = weaponSlots[slotIndex];
      if (targetInventoryId && targetInventoryId !== equipment.weapon) {
        equipItem(targetInventoryId, "weapon");
        const targetItem = inventory.find((i) => i.id === targetInventoryId);
        if (targetItem) {
          onWeaponSwitch?.(targetItem.itemId);
        }
      }
    }

    const firePressed = inputFrame.fire && !prevFireRef.current;
    prevFireRef.current = inputFrame.fire;

    const combatInput = {
      ...inputFrame,
      fire: firePressed,
    };

    const result = processCombatTick(
      delta,
      combatInput,
      camera,
      scene,
      enemies,
      weaponStateRef.current,
      difficulty,
      playerArmor,
    );

    if (result.playerFired) {
      gameAudioBridge.playWeaponFire(activeWeaponId);
    }

    const currentReloadPhase = result.weaponState.reloadPhase;
    if (currentReloadPhase === "starting" && prevReloadPhaseRef.current === "none") {
      gameAudioBridge.playWeaponReload(activeWeaponId);
    }
    prevReloadPhaseRef.current = currentReloadPhase;

    if (result.hitMarker?.hit) {
      if (result.hitMarker.isKill) {
        gameAudioBridge.playEnemyDeath();
      } else {
        gameAudioBridge.playEnemyHit();
      }
    }

    if (result.impactSparks.length > 0) {
      gameAudioBridge.playBulletImpact();
    }

    for (const dmgEvent of result.playerDamageEvents) {
      takeDamage(dmgEvent.damage);
      onPlayerDamage?.(dmgEvent.damage);
      onPlayerDamageDirectional?.(dmgEvent.damage, dmgEvent.attackDirection);
      gameAudioBridge.playPlayerHurt();
    }

    const diffConfig = getDifficultyConfig(difficulty);
    for (const killData of result.killedEnemyData) {
      const xp = Math.floor(killData.xpReward * diffConfig.xpMultiplier);
      if (xp > 0) gainXP(xp);

      const gold = Math.floor(killData.goldReward * diffConfig.goldMultiplier);
      if (gold > 0) addGold(gold);

      const lootItems = rollLoot(killData.lootTable, difficulty);
      for (const itemId of lootItems) {
        addItemById(itemId, 1);
      }

      questEvents.emit("enemyKilled", {
        enemyType: killData.enemyType,
        enemyId: killData.enemyId,
        locationId,
      });

      deadEnemyTimers.current.set(killData.entityId, performance.now());
    }

    const now = performance.now();
    for (const [entityId, deathTime] of deadEnemyTimers.current.entries()) {
      if (now - deathTime >= 1000) {
        const enemy = enemies.find((e) => e.entityId === entityId);
        if (enemy?.meshGroup.parent) {
          enemy.meshGroup.parent.remove(enemy.meshGroup);
        }
        deadEnemyTimers.current.delete(entityId);
      }
    }

    if (result.damageNumbers.length > 0) {
      setDamageNumbers((prev) => {
        const ts = performance.now();
        const active = prev.filter((d) => (ts - d.createdAt) / 1000 < d.duration);
        return [...active, ...result.damageNumbers];
      });
    }

    onCrosshairSpreadChange?.(result.crosshairSpread);

    if (result.hitMarker?.hit) {
      onHitMarker?.(result.hitMarker.isHeadshot, result.hitMarker.isKill);
    }

    onWeaponStateChange?.(result.weaponState);
  });

  useFrame(() => {
    const ts = performance.now();
    setDamageNumbers((prev) => {
      const filtered = prev.filter((d) => (ts - d.createdAt) / 1000 < d.duration);
      return filtered.length === prev.length ? prev : filtered;
    });
  });

  return (
    <group name="CombatSystem">
      {damageNumbers.map((dmg) => (
        <DamageNumber key={dmg.id} data={dmg} />
      ))}
    </group>
  );
}
