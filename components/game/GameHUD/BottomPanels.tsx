import * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { useResponsive } from "@/hooks/useResponsive";
import {
  activeQuestSummary,
  fatigueBadgeVariant,
  fatigueLabel,
  foodPercent,
  waterPercent,
} from "./helpers.ts";

export const BottomLeftPanel = React.memo(function BottomLeftPanel() {
  const activeQuests = useGameStoreShallow((s) => s.activeQuests);
  const insets = useSafeAreaInsets();
  const { isPhone, isDesktop } = useResponsive();
  const quest = activeQuestSummary(activeQuests);

  if (!quest) return null;

  const labelSize = isPhone ? "text-[9px]" : "text-[10px]";
  const titleSize = isPhone ? "text-[10px]" : "text-xs";

  return (
    <View
      className="absolute"
      style={{
        bottom: Math.max(insets.bottom, 8) + 4,
        left: Math.max(insets.left, 8) + 4,
        maxWidth: isPhone ? 200 : isDesktop ? 300 : 260,
      }}
    >
      <View className={`rounded-lg bg-black/50 ${isPhone ? "px-2 py-1.5" : "px-3 py-2"} gap-1`}>
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-frontier-whiskey" />
          <Text className={`text-frontier-dust ${labelSize} font-body`}>QUEST</Text>
        </View>
        <Text className={`text-white ${titleSize} font-heading font-semibold`} numberOfLines={1}>
          {quest.title}
        </Text>
        <Text
          className={`text-frontier-dust ${labelSize} font-body`}
          numberOfLines={isPhone ? 1 : 2}
        >
          {quest.objective}
        </Text>
      </View>
    </View>
  );
});

export const BottomRightPanel = React.memo(function BottomRightPanel() {
  const { gold, fatigueCurrent, food, water } = useGameStoreShallow((s) => ({
    gold: s.playerStats.gold,
    fatigueCurrent: s.fatigueState.current,
    food: s.provisionsState.food,
    water: s.provisionsState.water,
  }));

  const insets = useSafeAreaInsets();
  const { isPhone } = useResponsive();

  const fLabel = fatigueLabel(fatigueCurrent);
  const fVariant = fatigueBadgeVariant(fLabel);
  const fPct = Math.min(100, Math.max(0, fatigueCurrent));
  const fFood = foodPercent(food);
  const fWater = waterPercent(water);

  const labelSize = isPhone ? "text-[9px]" : "text-[10px]";
  const padding = isPhone ? "px-2 py-1" : "px-3 py-1.5";
  const barPadding = isPhone ? "px-2 py-1.5" : "px-3 py-2";

  return (
    <View
      className="absolute items-end gap-1.5"
      style={{
        bottom: Math.max(insets.bottom, 8) + 4,
        right: Math.max(insets.right, 8) + 4,
      }}
    >
      <View className={`rounded-lg bg-black/50 ${padding} flex-row items-center gap-2`}>
        <Text className={`text-frontier-dust ${labelSize} font-body`}>GOLD</Text>
        <Text
          className={`text-frontier-whiskey ${isPhone ? "text-xs" : "text-sm"} font-bold font-mono`}
        >
          {gold}
        </Text>
      </View>

      <View
        className={`rounded-lg bg-black/50 ${barPadding} gap-1`}
        style={{ minWidth: isPhone ? 100 : 120 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className={`text-frontier-dust ${labelSize} font-body`}>FATIGUE</Text>
          <Badge variant={fVariant}>
            <Text className="text-[9px] font-body">{fLabel}</Text>
          </Badge>
        </View>
        <Progress value={fPct} className={isPhone ? "h-1" : "h-1.5"} />
      </View>

      <View
        className={`rounded-lg bg-black/50 ${barPadding} gap-1.5`}
        style={{ minWidth: isPhone ? 100 : 120 }}
      >
        <Text className={`text-frontier-dust ${labelSize} font-body`}>PROVISIONS</Text>

        <View className="flex-row items-center gap-2">
          <Text className={`text-frontier-dust text-[9px] font-body ${isPhone ? "w-8" : "w-10"}`}>
            Food
          </Text>
          <View className="flex-1">
            <Progress value={fFood} className={isPhone ? "h-1" : "h-1.5"} />
          </View>
          {!isPhone && (
            <Text className="text-white text-[9px] font-mono w-6 text-right">
              {Math.round(food)}
            </Text>
          )}
        </View>

        <View className="flex-row items-center gap-2">
          <Text className={`text-frontier-dust text-[9px] font-body ${isPhone ? "w-8" : "w-10"}`}>
            Water
          </Text>
          <View className="flex-1">
            <Progress value={fWater} className={isPhone ? "h-1" : "h-1.5"} />
          </View>
          {!isPhone && (
            <Text className="text-frontier-sky text-[9px] font-mono w-6 text-right">
              {Math.round(water)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
});
