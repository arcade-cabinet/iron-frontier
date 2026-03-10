/**
 * Single item cell in the inventory grid.
 */

import * as React from "react";
import { Pressable, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { getItem } from "@/src/game/data/items";
import type { InventoryItem } from "@/src/game/store/types";
import { rarityBadgeVariant, rarityBorderColor } from "./helpers.ts";

export function ItemCell({
  item,
  isSelected,
  isEquipped,
  onSelect,
}: {
  item: InventoryItem;
  isSelected: boolean;
  isEquipped: boolean;
  onSelect: () => void;
}) {
  const def = getItem(item.itemId);

  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        "min-h-[44px] rounded-md border p-2",
        "bg-frontier-gunmetal/40",
        rarityBorderColor(item.rarity),
        isSelected && "ring-2 ring-frontier-brass/60 border-frontier-brass/60",
      )}
      accessibilityLabel={`${def?.name ?? item.name}, quantity ${item.quantity}`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center gap-2">
        <View
          className={cn(
            "w-8 h-8 rounded items-center justify-center",
            "bg-frontier-leather/30 border border-frontier-iron/20",
          )}
        >
          <Text className="text-frontier-dust/40 text-xs font-data">
            {(item.type as string).charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-frontier-dust text-xs font-body font-semibold" numberOfLines={1}>
            {def?.name ?? item.name}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Text className="text-frontier-dust/40 text-[10px] font-data">x{item.quantity}</Text>
            {isEquipped && (
              <Badge variant="info" className="px-1.5 py-0">
                <Text className="text-[9px]">E</Text>
              </Badge>
            )}
          </View>
        </View>

        <Badge variant={rarityBadgeVariant(item.rarity)} className="px-1.5">
          <Text className="text-[9px] capitalize">{item.rarity}</Text>
        </Badge>
      </View>
    </Pressable>
  );
}
