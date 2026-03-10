/**
 * Equipment slots strip showing currently equipped items.
 */

import * as React from "react";
import { Pressable, View } from "react-native";

import { ScrollArea } from "@/components/ui/ScrollArea";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { getItem } from "@/src/game/data/items";
import type { EquipmentSlot, EquipmentState, InventoryItem } from "@/src/game/store/types";
import { EQUIPMENT_SLOTS } from "./helpers.ts";

export function EquipmentStrip({
  equipment,
  inventory,
  onUnequip,
}: {
  equipment: EquipmentState;
  inventory: InventoryItem[];
  onUnequip: (slot: EquipmentSlot) => void;
}) {
  return (
    <View className="px-4 py-3 border-b border-frontier-leather/30 bg-frontier-night/50">
      <Text className="text-frontier-dust/50 text-xs font-heading mb-2 uppercase tracking-wider">
        Equipment
      </Text>
      <ScrollArea horizontal className="flex-none">
        <View className="flex-row gap-2">
          {EQUIPMENT_SLOTS.map(({ slot, label }) => {
            const equippedId = equipment[slot];
            const item = equippedId ? inventory.find((i) => i.id === equippedId) : null;
            const def = item ? getItem(item.itemId) : null;

            return (
              <Pressable
                key={slot}
                onPress={() => {
                  if (equippedId) onUnequip(slot);
                }}
                className={cn(
                  "min-h-[44px] min-w-[72px] px-2 py-1.5 rounded-md border items-center justify-center",
                  item
                    ? "border-frontier-brass/40 bg-frontier-leather/20"
                    : "border-frontier-iron/30 bg-frontier-gunmetal/30",
                )}
                accessibilityLabel={`${label} slot${item ? `: ${item.name}` : ": empty"}`}
              >
                <Text className="text-frontier-dust/40 text-[10px] font-data uppercase mb-0.5">
                  {label}
                </Text>
                {item ? (
                  <Text className="text-frontier-dust text-xs font-body" numberOfLines={1}>
                    {def?.name ?? item.name}
                  </Text>
                ) : (
                  <Text className="text-frontier-iron text-[10px] font-body">--</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollArea>
    </View>
  );
}
