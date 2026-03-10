/**
 * AmmoDisplay — Fallout-style ammo counter in bottom-RIGHT corner.
 *
 * Shows current ammo / magazine size (e.g., "6 / 24") with the weapon name
 * in small text below. Right-aligned, amber monochrome, monospace font.
 *
 * Reads the equipped weapon from the Zustand store inventory + equipment slices.
 *
 * @module components/game/AmmoDisplay
 */

import * as React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { useResponsive } from "@/hooks/useResponsive";

// ============================================================================
// CONSTANTS
// ============================================================================

const HUD_AMBER = "#D4A855";
const HUD_AMBER_DIM = "#C4963F";
const HUD_TEXT = "#E8D5A8";

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AmmoDisplay() {
  const insets = useSafeAreaInsets();
  const { isPhone } = useResponsive();

  const { weaponId, inventory, combatState } = useGameStoreShallow((s) => ({
    weaponId: s.equipment.weapon,
    inventory: s.inventory,
    combatState: s.combatState,
  }));

  // Resolve equipped weapon item from inventory
  const weapon = React.useMemo(() => {
    if (!weaponId) return null;
    return inventory.find((item) => item.id === weaponId) ?? null;
  }, [weaponId, inventory]);

  // Get ammo in clip from combat state if in combat, else show full
  const ammoInClip = React.useMemo(() => {
    if (combatState) {
      const playerCombatant = combatState.combatants.find((c) => c.isPlayer);
      if (playerCombatant) return playerCombatant.ammoInClip;
    }
    return null;
  }, [combatState]);

  // Count total ammo of matching type in inventory
  const totalAmmo = React.useMemo(() => {
    if (!weapon) return 0;
    // Sum up all ammo-type items (items with type 'ammo')
    return inventory
      .filter((item) => item.type === "ammo")
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [weapon, inventory]);

  // Don't render if no weapon is equipped
  if (!weapon) return null;

  if (ammoInClip == null) {
    console.error(
      `[AmmoDisplay] ammoInClip is null for weapon "${weapon.name}" — check combat state`,
    );
  }
  const displayClip = ammoInClip ?? 0;
  const weaponName = weapon.name;

  return (
    <View
      style={{
        position: "absolute",
        bottom: Math.max(insets.bottom, 8) + 8,
        right: Math.max(insets.right, 8) + 8,
        alignItems: "flex-end",
      }}
      pointerEvents="none"
    >
      {/* Ammo count: clip / total */}
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text
          style={{
            color: HUD_AMBER,
            fontSize: isPhone ? 18 : 22,
            fontWeight: "700",
            fontFamily: MONO_FONT,
          }}
        >
          {displayClip}
        </Text>
        <Text
          style={{
            color: HUD_AMBER_DIM,
            fontSize: isPhone ? 12 : 14,
            fontWeight: "400",
            fontFamily: MONO_FONT,
            marginHorizontal: 4,
          }}
        >
          /
        </Text>
        <Text
          style={{
            color: HUD_AMBER_DIM,
            fontSize: isPhone ? 14 : 16,
            fontWeight: "600",
            fontFamily: MONO_FONT,
          }}
        >
          {totalAmmo}
        </Text>
      </View>

      {/* Weapon name */}
      <Text
        style={{
          color: HUD_TEXT,
          fontSize: isPhone ? 9 : 10,
          fontWeight: "400",
          fontFamily: MONO_FONT,
          opacity: 0.7,
          marginTop: 2,
        }}
        numberOfLines={1}
      >
        {weaponName}
      </Text>
    </View>
  );
}
