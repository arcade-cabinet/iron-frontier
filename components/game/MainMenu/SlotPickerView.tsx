import { ActivityIndicator, ScrollView, View } from "react-native";
import { CardContent, Text } from "@/components/ui";
import type { SaveSlotMeta } from "@/src/game/systems/SaveSystem";
import { COLORS } from "./constants.ts";
import { MenuButton } from "./MenuButton.tsx";
import { WesternSeparator } from "./MenuOverlays.tsx";
import { SaveSlotRow } from "./SaveSlotRow.tsx";

export function SlotPickerView({
  mode,
  slots,
  isSaving,
  isLoading,
  onSaveToNewSlot,
  onSaveToSlot,
  onLoadFromSlot,
  onBack,
}: {
  mode: "save" | "load";
  slots: SaveSlotMeta[];
  isSaving: boolean;
  isLoading: boolean;
  onSaveToNewSlot: () => void;
  onSaveToSlot: (slotId: string) => void;
  onLoadFromSlot: (slotId: string) => void;
  onBack: () => void;
}) {
  return (
    <CardContent className="gap-3">
      {isSaving || isLoading ? (
        <View className="py-8 items-center gap-3">
          <ActivityIndicator color={COLORS.amber} size="large" />
          <Text
            variant="small"
            style={{ color: COLORS.dust, fontFamily: "Cinzel", letterSpacing: 1 }}
          >
            {isSaving ? "Saving..." : "Loading..."}
          </Text>
        </View>
      ) : (
        <ScrollView style={{ maxHeight: 300 }} className="gap-2">
          {mode === "save" && (
            <MenuButton
              label="Save to New Slot"
              variant="primary"
              onPress={onSaveToNewSlot}
              disabled={isSaving || isLoading}
            />
          )}

          <View className="gap-2 mt-2">
            {slots.length === 0 && mode === "load" && (
              <Text
                variant="small"
                className="text-center py-4"
                style={{ color: COLORS.dust, opacity: 0.6 }}
              >
                No save files found.
              </Text>
            )}

            {slots.map((slot) => (
              <SaveSlotRow
                key={slot.slotId}
                slot={slot}
                mode={mode}
                onPress={() =>
                  mode === "save" ? onSaveToSlot(slot.slotId) : onLoadFromSlot(slot.slotId)
                }
              />
            ))}
          </View>
        </ScrollView>
      )}

      <WesternSeparator />

      <MenuButton label="Back" variant="ghost" onPress={onBack} disabled={isSaving || isLoading} />
    </CardContent>
  );
}
