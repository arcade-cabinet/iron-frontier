import { Pressable, View } from "react-native";
import { Text } from "@/components/ui";
import { formatPlayTime, formatTimestamp } from "@/src/game/store/saveManager";
import type { SaveSlotMeta } from "@/src/game/systems/SaveSystem";

export function SaveSlotRow({
  slot,
  onPress,
  mode,
}: {
  slot: SaveSlotMeta;
  onPress: () => void;
  mode: "save" | "load";
}) {
  const label = slot.isAutoSave
    ? "Auto Save"
    : slot.isQuickSave
      ? "Quick Save"
      : `Slot: ${slot.slotId}`;

  return (
    <Pressable
      className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 active:bg-muted/60"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-0.5">
          <Text variant="small" className="font-semibold text-foreground">
            {label}
          </Text>
          <Text variant="caption" className="text-muted-foreground">
            {slot.playerName} - Lv.{slot.playerLevel ?? 1} - {slot.location}
          </Text>
        </View>
        <View className="items-end gap-0.5">
          <Text variant="caption" className="text-muted-foreground">
            {formatTimestamp(slot.timestamp)}
          </Text>
          <Text variant="caption" className="text-muted-foreground">
            {formatPlayTime(slot.playTime)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
