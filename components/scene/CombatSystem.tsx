// CombatSystem — R3F component that runs the FPS combat loop each frame.
//
// Bridges the pure-TypeScript CombatManager with the React/R3F rendering
// layer. Manages the list of active combat enemies, processes combat ticks
// via useFrame, and renders hit effects (damage numbers, impact sparks).
// Connects to the Zustand game store for player health/damage.
//
// Wires enemy death -> rewards (XP, gold, loot drops, quest events),
// reads armor from equipment for damage reduction, and handles weapon switching.

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { InputManager } from '@/src/game/input';
import { useGameStore } from '@/hooks/useGameStore';
import {
  processCombatTick,
  createWeaponState,
  getDifficultyConfig,
  type CombatEnemy,
  type KilledEnemyData,
  type WeaponRuntimeState,
  type DamageNumberData,
  type DifficultyLevel,
} from '@/src/game/engine/combat';
import { questEvents } from '@/src/game/systems/QuestEvents';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CombatSystemProps {
  /** Currently equipped weapon ID. Read from store if not provided. */
  weaponId?: string;
  /** Difficulty level. Defaults to 'normal'. */
  difficulty?: DifficultyLevel;
  /** Reserve ammo for the equipped weapon. */
  reserveAmmo?: number;
  /** Combat enemy entities to process. */
  enemies?: CombatEnemy[];
  /** Current location ID for quest event emission. */
  locationId?: string;
  /** Callback when crosshair spread changes (for the Crosshair overlay). */
  onCrosshairSpreadChange?: (spread: number) => void;
  /** Callback when a hit lands (for the Crosshair overlay). */
  onHitMarker?: (isHeadshot: boolean, isKill: boolean) => void;
  /** Callback when weapon state changes (ammo display). */
  onWeaponStateChange?: (state: Readonly<WeaponRuntimeState>) => void;
  /** Callback when player takes damage (for DamageFlash). */
  onPlayerDamage?: (damage: number) => void;
  /** Callback when weapon switches (for WeaponView sync). */
  onWeaponSwitch?: (weaponId: string) => void;
}

// ---------------------------------------------------------------------------
// Loot roll logic
// ---------------------------------------------------------------------------

/** Roll against an enemy's loot table and return item IDs to drop. */
function rollLoot(
  lootTable: KilledEnemyData['lootTable'],
  difficulty: DifficultyLevel,
): string[] {
  const diffConfig = getDifficultyConfig(difficulty);
  const lootMul = diffConfig.lootMultiplier;
  const items: string[] = [];

  // Always drops
  for (const itemId of lootTable.always) {
    items.push(itemId);
  }

  // Common: 60% base chance per item
  for (const itemId of lootTable.common) {
    if (Math.random() < 0.6 * lootMul) {
      items.push(itemId);
    }
  }

  // Uncommon: 25% base chance per item
  for (const itemId of lootTable.uncommon) {
    if (Math.random() < 0.25 * lootMul) {
      items.push(itemId);
    }
  }

  // Rare: 5% base chance per item
  for (const itemId of lootTable.rare) {
    if (Math.random() < 0.05 * lootMul) {
      items.push(itemId);
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// Weapon slot mapping helpers
// ---------------------------------------------------------------------------

/** Maps inventory weapon slots (1-5) to weapon IDs from the player's inventory. */
function getWeaponSlots(
  inventory: Array<{ id: string; itemId: string; type: string }>,
): (string | null)[] {
  // Slots 1-5: first 5 weapons in inventory order
  const weaponItems = inventory.filter((i) => i.type === 'weapon');
  const slots: (string | null)[] = [null, null, null, null, null];
  for (let i = 0; i < Math.min(5, weaponItems.length); i++) {
    slots[i] = weaponItems[i].id; // inventory item id
  }
  return slots;
}

// ---------------------------------------------------------------------------
// Damage number billboard (Three.js Sprite)
// ---------------------------------------------------------------------------

function DamageNumber({ data }: { data: DamageNumberData }) {
  const meshRef = useRef<THREE.Sprite>(null);
  const materialRef = useRef<THREE.SpriteMaterial>(null);
  const startY = data.position.y;

  // Create canvas texture for the damage number
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    const displayText = data.label ?? String(data.value);

    // Text style
    ctx.font = data.label
      ? 'bold 40px monospace'
      : data.isCritical
        ? 'bold 48px monospace'
        : 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(displayText, 64, 32);

    // Fill color: KILL = gold, critical = yellow, normal = white
    ctx.fillStyle = data.label
      ? '#FFD700'
      : data.isCritical
        ? '#FFD700'
        : '#FFFFFF';
    ctx.fillText(displayText, 64, 32);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [data.value, data.isCritical, data.label]);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    const elapsed = (performance.now() - data.createdAt) / 1000;
    const progress = elapsed / data.duration;

    if (progress >= 1) {
      materialRef.current.opacity = 0;
      return;
    }

    // Float upward
    meshRef.current.position.y = startY + elapsed * 1.5;

    // Scale pop on critical hits and kill labels
    const scale =
      data.label || data.isCritical
        ? 0.4 + Math.sin(progress * Math.PI) * 0.2
        : 0.3;
    meshRef.current.scale.set(scale, scale * 0.5, 1);

    // Fade out
    materialRef.current.opacity = 1 - progress * progress;
  });

  return (
    <sprite
      ref={meshRef}
      position={[data.position.x, data.position.y, data.position.z]}
    >
      <spriteMaterial
        ref={materialRef}
        map={texture}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </sprite>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CombatSystem({
  weaponId: weaponIdProp,
  difficulty = 'normal',
  reserveAmmo = 60,
  enemies = [],
  locationId = 'unknown',
  onCrosshairSpreadChange,
  onHitMarker,
  onWeaponStateChange,
  onPlayerDamage,
  onWeaponSwitch,
}: CombatSystemProps) {
  const { camera, scene } = useThree();

  // ---------------------------------------------------------------------------
  // Store selectors
  // ---------------------------------------------------------------------------
  const takeDamage = useGameStore((s) => s.takeDamage);
  const gainXP = useGameStore((s) => s.gainXP);
  const addGold = useGameStore((s) => s.addGold);
  const addItemById = useGameStore((s) => s.addItemById);
  const equipItem = useGameStore((s) => s.equipItem);
  const getEquippedItem = useGameStore((s) => s.getEquippedItem);
  const getEquipmentBonuses = useGameStore((s) => s.getEquipmentBonuses);
  const inventory = useGameStore((s) => s.inventory);
  const equipment = useGameStore((s) => s.equipment);

  // ---------------------------------------------------------------------------
  // Derive active weapon ID from store equipment
  // ---------------------------------------------------------------------------
  const equippedWeapon = getEquippedItem('weapon');
  const activeWeaponId =
    weaponIdProp ?? equippedWeapon?.itemId ?? 'revolver';

  // Derive armor from equipment bonuses
  const playerArmor = getEquipmentBonuses().defense;

  // Weapon state (mutable ref, not React state to avoid re-renders)
  const weaponStateRef = useRef<WeaponRuntimeState>(
    createWeaponState(activeWeaponId, reserveAmmo),
  );

  // Reinitialize weapon state when weapon changes
  const prevWeaponIdRef = useRef(activeWeaponId);
  useEffect(() => {
    if (prevWeaponIdRef.current !== activeWeaponId) {
      weaponStateRef.current = createWeaponState(activeWeaponId, reserveAmmo);
      prevWeaponIdRef.current = activeWeaponId;
    }
  }, [activeWeaponId, reserveAmmo]);

  // Store damage numbers in state for rendering
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);

  // Track previous fire state for rising-edge detection
  const prevFireRef = useRef(false);

  // Weapon slots for switching
  const weaponSlots = useMemo(
    () => getWeaponSlots(inventory),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inventory.length, equipment.weapon],
  );

  // Track dead enemies to schedule removal
  const deadEnemyTimers = useRef<Map<string, number>>(new Map());

  // Per-frame combat processing
  useFrame((_state, delta) => {
    const inputFrame = InputManager.getInstance().getFrame();

    // -----------------------------------------------------------------------
    // Weapon switching (number keys 1-5)
    // -----------------------------------------------------------------------
    if (inputFrame.weaponSwitch > 0 && inputFrame.weaponSwitch <= 5) {
      const slotIndex = inputFrame.weaponSwitch - 1;
      const targetInventoryId = weaponSlots[slotIndex];
      if (targetInventoryId && targetInventoryId !== equipment.weapon) {
        equipItem(targetInventoryId, 'weapon');
        // Look up the item to get its itemId for the weapon view
        const targetItem = inventory.find(
          (i) => i.id === targetInventoryId,
        );
        if (targetItem) {
          onWeaponSwitch?.(targetItem.itemId);
        }
      }
    }

    // Rising-edge detection for fire (press, not hold)
    // For semi-automatic weapons, we only fire on press
    const firePressed = inputFrame.fire && !prevFireRef.current;
    prevFireRef.current = inputFrame.fire;

    // Create a modified input frame for semi-auto behavior
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

    // -----------------------------------------------------------------------
    // Handle player damage events
    // -----------------------------------------------------------------------
    for (const dmgEvent of result.playerDamageEvents) {
      takeDamage(dmgEvent.damage);
      onPlayerDamage?.(dmgEvent.damage);
    }

    // -----------------------------------------------------------------------
    // Handle enemy kills — grant rewards
    // -----------------------------------------------------------------------
    const diffConfig = getDifficultyConfig(difficulty);
    for (const killData of result.killedEnemyData) {
      // XP reward (scaled by difficulty)
      const xp = Math.floor(killData.xpReward * diffConfig.xpMultiplier);
      if (xp > 0) gainXP(xp);

      // Gold reward (scaled by difficulty)
      const gold = Math.floor(
        killData.goldReward * diffConfig.goldMultiplier,
      );
      if (gold > 0) addGold(gold);

      // Roll loot and add items to player inventory
      const lootItems = rollLoot(killData.lootTable, difficulty);
      for (const itemId of lootItems) {
        addItemById(itemId, 1);
      }

      // Emit quest event
      questEvents.emit('enemyKilled', {
        enemyType: killData.enemyType,
        enemyId: killData.enemyId,
        locationId,
      });

      // Schedule enemy entity removal after death animation (1 second)
      deadEnemyTimers.current.set(killData.entityId, performance.now());
    }

    // -----------------------------------------------------------------------
    // Remove dead enemy meshes after 1 second death animation
    // -----------------------------------------------------------------------
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

    // Accumulate damage numbers
    if (result.damageNumbers.length > 0) {
      setDamageNumbers((prev) => {
        // Clean up expired numbers and add new ones
        const ts = performance.now();
        const active = prev.filter(
          (d) => (ts - d.createdAt) / 1000 < d.duration,
        );
        return [...active, ...result.damageNumbers];
      });
    }

    // Notify crosshair of spread changes
    onCrosshairSpreadChange?.(result.crosshairSpread);

    // Notify crosshair of hits
    if (result.hitMarker?.hit) {
      onHitMarker?.(
        result.hitMarker.isHeadshot,
        result.hitMarker.isKill,
      );
    }

    // Notify weapon state changes
    onWeaponStateChange?.(result.weaponState);
  });

  // Clean up expired damage numbers periodically
  useFrame(() => {
    const ts = performance.now();
    setDamageNumbers((prev) => {
      const filtered = prev.filter(
        (d) => (ts - d.createdAt) / 1000 < d.duration,
      );
      // Only update if something was removed
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
