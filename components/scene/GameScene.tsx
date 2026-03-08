// GameScene — Root scene component placed inside the R3F Canvas.
//
// Assembles ALL scene subsystems into a complete playable 3D world:
//   - PhysicsProvider (collision, character controller)
//   - FPSCamera (projection setup; position driven by physics)
//   - DayNightCycle (sky, lighting, fog, fireflies, dust, lantern)
//   - OpenWorld (terrain chunks, towns, buildings, roads, vegetation)
//   - CombatSystem (processes per-frame combat tick with enemy list)
//   - WeaponView (first-person weapon model, reads equipped weapon)
//   - EntitySpawner (spawns NPCs in towns, enemies in wilderness)
//   - WorldItems (dropped loot, glowing pickups with auto-collect)
//   - InteractionDetector (proximity/raycast detection for "Press E")
//
// The Crosshair overlay is a React Native component rendered in the
// game page's RN overlay layer (outside the Canvas). This component
// routes crosshair spread and hit marker data to the Crosshair via
// the imperative Crosshair.flash() API.

import { useCallback, useState } from 'react';

import { useGameStore } from '@/hooks/useGameStore';
import { Crosshair } from '@/components/game/Crosshair';
import type { CombatEnemy } from '@/src/game/engine/combat';
import type { World } from '@/src/game/data/schemas/world';
import { XRSetup } from '@/src/game/xr/XRSetup';
import { useXRMode } from '@/src/game/xr/useXRMode';

import { CombatSystem } from './CombatSystem';
import { DayNightCycle, type DayNightCycleProps } from './DayNightCycle';
import { EntitySpawner } from './EntitySpawner';
import { FPSCamera } from './FPSCamera';
import {
  InteractionDetector,
  type InteractionTarget,
} from './InteractionDetector';
import { OpenWorld } from './OpenWorld';
import { PhysicsProvider } from './PhysicsProvider';
import { Terrain } from './Terrain';
import { WeaponView } from './WeaponView';
import { WorldItems } from './WorldItems';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface GameSceneProps {
  /** Starting time of day as a 0-24 float (default: 10 = 10 AM). */
  initialTime?: number;
  /** Real seconds per game minute. Lower = faster day cycle. */
  timeMultiplier?: number;
  /** Pause time progression (menus, dialogue). */
  paused?: boolean;
  /** Callback when the day/night phase changes. */
  onPhaseChange?: DayNightCycleProps['onPhaseChange'];
  /** World definition for OpenWorld rendering. If null, falls back to Terrain only. */
  world?: World | null;
  /** Callback when an interactable is in range (for UI "Press E" prompt). */
  onInteractionChange?: (target: InteractionTarget | null) => void;
  /** Callback when crosshair spread changes (routed to Crosshair overlay). */
  onCrosshairSpreadChange?: (spread: number) => void;
  /** Callback when player takes damage (for DamageFlash overlay). */
  onPlayerDamage?: (damage: number) => void;
  /** Current location ID for quest event emission on enemy kills. */
  locationId?: string;
  /** Difficulty level for combat. */
  difficulty?: 'easy' | 'normal' | 'hard';
}

// ---------------------------------------------------------------------------
// Weapon type mapping
// ---------------------------------------------------------------------------

/** Maps item IDs / weapon def weaponType fields to WeaponView model names. */
const WEAPON_TYPE_MAP: Record<string, string> = {
  revolver: 'revolver',
  revolver_basic: 'revolver',
  navy_revolver: 'revolver',
  revolver_fancy: 'revolver',
  hunting_rifle: 'rifle',
  lever_action_rifle: 'rifle',
  rifle_winchester: 'rifle',
  shotgun: 'shotgun',
  shotgun_coach: 'shotgun',
  dynamite: 'dynamite',
  pickaxe: 'pickaxe',
  lantern: 'lantern',
  lasso: 'lasso',
};

function resolveWeaponType(equipmentWeaponId: string | null): string {
  if (!equipmentWeaponId) return 'revolver';
  return WEAPON_TYPE_MAP[equipmentWeaponId] ?? 'revolver';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GameScene({
  initialTime = 10,
  timeMultiplier,
  paused = false,
  onPhaseChange,
  world = null,
  onInteractionChange,
  onCrosshairSpreadChange,
  onPlayerDamage,
  locationId,
  difficulty = 'normal',
}: GameSceneProps) {
  // --- Store reads ---
  const equippedWeaponId = useGameStore((s) => s.equipment.weapon);
  const weaponType = resolveWeaponType(equippedWeaponId);

  // --- Enemy list for CombatSystem (managed by EntitySpawner) ---
  const [combatEnemies, setCombatEnemies] = useState<CombatEnemy[]>([]);

  const handleEnemiesChange = useCallback((enemies: CombatEnemy[]) => {
    setCombatEnemies(enemies);
  }, []);

  // --- Crosshair integration ---
  // Hit markers are routed to the RN-layer Crosshair via its imperative API.
  const handleHitMarker = useCallback((isHeadshot: boolean, isKill: boolean) => {
    Crosshair.flash(isHeadshot, isKill);
  }, []);

  // --- Weapon switch sync ---
  // When CombatSystem detects a weapon switch (number keys), update WeaponView
  const [activeWeaponItemId, setActiveWeaponItemId] = useState<string | undefined>(
    undefined,
  );
  const handleWeaponSwitch = useCallback((weaponId: string) => {
    setActiveWeaponItemId(weaponId);
  }, []);

  // Use the switched weapon item ID if available, otherwise fall back to equipped weapon
  const displayWeaponType = activeWeaponItemId
    ? (WEAPON_TYPE_MAP[activeWeaponItemId] ?? resolveWeaponType(equippedWeaponId))
    : weaponType;

  return (
    <XRSetup>
      <PhysicsProvider>
        {/* First-person camera (projection config; position driven by physics) */}
        <FPSCamera />

        {/* Day/night cycle — manages Sky, Lighting, fog, fireflies, dust, lantern */}
        <DayNightCycle
          initialTime={initialTime}
          timeMultiplier={timeMultiplier}
          paused={paused}
          onPhaseChange={onPhaseChange}
        />

        {/* World rendering: full OpenWorld if world data available, else basic Terrain */}
        {world ? (
          <OpenWorld world={world} seed="iron-frontier-terrain" />
        ) : (
          <Terrain seed="iron-frontier-terrain" biome="desert" />
        )}

        {/* Entity spawning: NPCs in towns, enemies in wilderness */}
        <EntitySpawner onEnemiesChange={handleEnemiesChange} />

        {/* World item pickups (dropped loot, glowing collectibles) */}
        <WorldItems />

        {/* Combat processing — wired end-to-end:
            - Equipment weapon ID drives damage calculations
            - Armor (defense bonus) reduces incoming damage
            - Kills grant XP, gold, loot and emit quest events
            - Weapon switching via number keys 1-5
            - In VR: uses aimOrigin/aimDirection from InputFrame for raycasting */}
        <CombatSystem
          weaponId={displayWeaponType}
          difficulty={difficulty}
          enemies={combatEnemies}
          locationId={locationId}
          onCrosshairSpreadChange={onCrosshairSpreadChange}
          onHitMarker={handleHitMarker}
          onPlayerDamage={onPlayerDamage}
          onWeaponSwitch={handleWeaponSwitch}
        />

        {/* First-person weapon view model — hidden in VR where the weapon
            is represented by the physical controller in the player's hand */}
        <VRGatedWeaponView weaponType={displayWeaponType} />

        {/* Interaction detection (NPC proximity, building doors) */}
        <InteractionDetector onInteractionChange={onInteractionChange} />
      </PhysicsProvider>
    </XRSetup>
  );
}

// ---------------------------------------------------------------------------
// VR-gated weapon view
// ---------------------------------------------------------------------------

/**
 * Wraps WeaponView with XR mode detection.
 * In VR the screen-space weapon model is hidden because the weapon
 * is represented by the physical controller in the player's hand.
 */
function VRGatedWeaponView({ weaponType }: { weaponType: string }) {
  const { isVR } = useXRMode();

  // In VR: don't render the screen-space weapon view model
  if (isVR) return null;

  return <WeaponView weaponType={weaponType} />;
}
