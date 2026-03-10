// EntitySpawner shared types and constants

import type { CombatEnemy } from "@/src/game/engine/combat";
import type { ChibiConfig } from "@/src/game/engine/renderers/ChibiRenderer";
import type { EnemyType } from "@/src/game/engine/renderers/MonsterFactory";
import type { NPC } from "@/src/game/store/types";
import type { InteractableEntity } from "@/src/game/systems/InteractionSystem";

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
// Internal enemy spawn descriptor
// ---------------------------------------------------------------------------

export interface SpawnedEnemy {
  id: string;
  enemyType: EnemyType;
  configId: string;
  level: number;
  maxHealth: number;
  position: [number, number, number];
  name: string;
  seed: string;
}

// ---------------------------------------------------------------------------
// Enemy config ID mapping: MonsterFactory EnemyType -> enemies.json ID
// ---------------------------------------------------------------------------

export const ENEMY_TYPE_TO_CONFIG_ID: Record<EnemyType, string> = {
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

export function npcToChibiConfig(npc: NPC): ChibiConfig {
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
// Wilderness enemy spawn tables
// ---------------------------------------------------------------------------

export const WILDERNESS_ENEMIES: Record<
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
export const DEFAULT_IDLE_SCHEDULE = {
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
