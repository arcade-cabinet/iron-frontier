/**
 * InventoryPanel shared types, constants, and helpers.
 */

import type { EquipmentState } from "@/src/game/store/types";

// =============================================================================
// Types
// =============================================================================

export type FilterCategory = "all" | "weapon" | "armor" | "consumable" | "key_item";

export interface InventoryPanelProps {
  /** Whether the panel is visible */
  visible: boolean;
  /** Called when the panel should close */
  onClose: () => void;
}

// =============================================================================
// Constants
// =============================================================================

export const FILTER_TABS: { value: FilterCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "weapon", label: "Weapons" },
  { value: "consumable", label: "Consumables" },
  { value: "armor", label: "Gear" },
  { value: "key_item", label: "Quest" },
];

export type { EquipmentSlot } from "@/src/game/store/types";

export const EQUIPMENT_SLOTS: {
  slot: import("@/src/game/store/types").EquipmentSlot;
  label: string;
}[] = [
  { slot: "weapon", label: "Weapon" },
  { slot: "head", label: "Hat" },
  { slot: "body", label: "Duster" },
  { slot: "accessory", label: "Accessory" },
  { slot: "offhand", label: "Offhand" },
];

// =============================================================================
// Helpers
// =============================================================================

export function rarityBadgeVariant(rarity: string) {
  switch (rarity) {
    case "legendary":
      return "warning" as const;
    case "rare":
      return "info" as const;
    case "uncommon":
      return "success" as const;
    default:
      return "default" as const;
  }
}

export function rarityBorderColor(rarity: string): string {
  switch (rarity) {
    case "legendary":
      return "border-frontier-whiskey/60";
    case "rare":
      return "border-frontier-sky/40";
    case "uncommon":
      return "border-frontier-sage/40";
    default:
      return "border-frontier-leather/40";
  }
}

export function conditionColor(condition: number): string {
  if (condition > 50) return "text-frontier-sage";
  if (condition > 25) return "text-frontier-whiskey";
  return "text-frontier-blood";
}

export function isItemEquipped(equipment: EquipmentState, instanceId: string): boolean {
  return Object.values(equipment).includes(instanceId);
}
