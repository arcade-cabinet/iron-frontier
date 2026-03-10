/**
 * Shop header with shop name, gold display, and close button.
 */

import { Platform, Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import type { ShopDefinition } from "@/src/game/data/shops";

// =============================================================================
// GoldIcon
// =============================================================================

export function GoldIcon({ size = 12 }: { size?: number }) {
  return <View className="rounded-full bg-yellow-400" style={{ width: size, height: size }} />;
}

// =============================================================================
// ShopHeader
// =============================================================================

export function ShopHeader({
  shop,
  playerGold,
  onClose,
}: {
  shop: ShopDefinition;
  playerGold: number;
  onClose: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-frontier-leather/30 px-4 py-3">
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-lg border border-frontier-leather/40 bg-frontier-leather/20">
          <Text className="text-lg">{"\u{1F3EA}"}</Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text variant="subheading" className="text-frontier-dust" numberOfLines={1}>
            {shop.name}
          </Text>
          {shop.description ? (
            <Text variant="caption" className="text-frontier-dust/50" numberOfLines={1}>
              {shop.description}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mr-3 items-end">
        <Text className="text-[10px] uppercase tracking-wider text-frontier-dust/40">
          Your Gold
        </Text>
        <View className="flex-row items-center gap-1">
          <GoldIcon size={14} />
          <Text className="font-data text-base font-bold text-yellow-400">${playerGold}</Text>
        </View>
      </View>

      <Pressable
        className={cn(
          "min-h-[44px] min-w-[44px] items-center justify-center rounded-lg",
          "bg-frontier-gunmetal/50 active:bg-frontier-gunmetal/80",
          Platform.select({ web: "hover:bg-frontier-gunmetal/70" }),
        )}
        onPress={onClose}
        accessibilityLabel="Close shop"
        accessibilityRole="button"
      >
        <Text className="text-lg text-frontier-dust/70">{"\u2715"}</Text>
      </Pressable>
    </View>
  );
}
