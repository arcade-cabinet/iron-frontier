import { Pressable, View } from "react-native";
import { Text } from "@/components/ui";
import { formatPlayTime, formatTimestamp } from "@/src/game/store/saveManager";
import type { SaveSlotMeta } from "@/src/game/systems/SaveSystem";

export function SaveSlotRow({ slot, onPress }: { slot: SaveSlotMeta; onPress: () => void }) {
  const label = slot.isAutoSave
    ? "Auto Save"
    : slot.isQuickSave
      ? "Quick Save"
      : `Slot: ${slot.slotId}`;

  return (
    <Pressable
      className="rounded-lg border border-red-800/40 bg-red-950/40 px-4 py-3 active:bg-red-950/60"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-0.5">
          <Text variant="small" className="font-semibold text-red-100">
            {label}
          </Text>
          <Text variant="caption" className="text-red-300/70">
            {slot.playerName} - Lv.{slot.playerLevel ?? 1} - {slot.location}
          </Text>
        </View>
        <View className="items-end gap-0.5">
          <Text variant="caption" className="text-red-300/60">
            {formatTimestamp(slot.timestamp)}
          </Text>
          <Text variant="caption" className="text-red-300/60">
            {formatPlayTime(slot.playTime)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
