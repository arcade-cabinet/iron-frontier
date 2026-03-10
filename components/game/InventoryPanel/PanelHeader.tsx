/**
 * InventoryPanel header bar with title, slot/weight counters, and close button.
 */

import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

export function PanelHeader({
  itemCount,
  maxSlots,
  totalWeight,
  maxWeight,
  gold,
  onClose,
}: {
  itemCount: number;
  maxSlots: number;
  totalWeight: number;
  maxWeight: number;
  gold: number;
  onClose: () => void;
}) {
  const isOverweight = totalWeight > maxWeight;

  return (
    <View className="px-4 pt-4 pb-3 border-b border-frontier-leather/30">
      {/* Top row: title + close */}
      <View className="flex-row items-center justify-between mb-2">
        <Text variant="subheading" className="text-frontier-dust font-heading">
          Saddlebag
        </Text>
        <Pressable
          onPress={onClose}
          className="min-h-[44px] min-w-[44px] items-center justify-center"
          accessibilityLabel="Close inventory"
          accessibilityRole="button"
        >
          <Text className="text-frontier-dust/60 text-lg font-bold">X</Text>
        </Pressable>
      </View>

      {/* Stats row: gold, slots, weight */}
      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-full bg-frontier-whiskey" />
          <Text className="text-frontier-whiskey font-bold text-sm font-data">${gold}</Text>
        </View>

        <Text className="text-frontier-dust/60 text-xs font-data">
          {itemCount}/{maxSlots} slots
        </Text>

        <View
          className={cn(
            "px-2 py-0.5 rounded",
            isOverweight ? "bg-frontier-blood/20" : "bg-frontier-leather/20",
          )}
        >
          <Text
            className={cn(
              "text-xs font-data",
              isOverweight ? "text-frontier-blood" : "text-frontier-dust/60",
            )}
          >
            {totalWeight.toFixed(1)}/{maxWeight} lbs
          </Text>
        </View>
      </View>
    </View>
  );
}
