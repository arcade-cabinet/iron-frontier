import * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { useResponsive } from "@/hooks/useResponsive";
import {
  formatTime,
  healthPercent,
  healthTextColor,
  timePhaseLabel,
  xpPercent,
} from "./helpers.ts";

export const TopLeftPanel = React.memo(function TopLeftPanel() {
  const { health, maxHealth, xp, xpToNext, level, playerName } = useGameStoreShallow((s) => ({
    health: s.playerStats.health,
    maxHealth: s.playerStats.maxHealth,
    xp: s.playerStats.xp,
    xpToNext: s.playerStats.xpToNext,
    level: s.playerStats.level,
    playerName: s.playerName,
  }));

  const insets = useSafeAreaInsets();
  const { isPhone, isDesktop } = useResponsive();

  const hp = healthPercent(health, maxHealth);
  const xpp = xpPercent(xp, xpToNext);

  const labelSize = isPhone ? "text-[9px]" : "text-[10px]";
  const valueSize = isPhone ? "text-[9px]" : isDesktop ? "text-xs" : "text-[10px]";
  const nameSize = isPhone ? "text-xs" : "text-sm";
  const padding = isPhone ? "px-2 py-1" : "px-3 py-1.5";
  const barPadding = isPhone ? "px-2 py-1.5" : "px-3 py-2";

  return (
    <View
      className="absolute gap-1.5"
      style={{
        top: Math.max(insets.top, 8) + 4,
        left: Math.max(insets.left, 8) + 4,
        minWidth: isPhone ? 130 : isDesktop ? 180 : 160,
      }}
    >
      <View className={`flex-row items-center gap-2 rounded-lg bg-black/50 ${padding}`}>
        <Text className={`text-white font-heading ${nameSize} font-bold`} numberOfLines={1}>
          {playerName}
        </Text>
        <Badge variant="info">
          <Text className={`${isPhone ? "text-[10px]" : "text-xs"} font-bold text-frontier-sky`}>
            Lv.{level}
          </Text>
        </Badge>
      </View>

      <View className={`rounded-lg bg-black/50 ${barPadding} gap-1`}>
        <View className="flex-row items-center justify-between">
          <Text className={`text-frontier-dust ${labelSize} font-body`}>HP</Text>
          <Text className={`${valueSize} font-mono ${healthTextColor(hp)}`}>
            {health}/{maxHealth}
          </Text>
        </View>
        <Progress variant="health" value={hp} className={isPhone ? "h-1.5" : "h-2"} />
      </View>

      <View className={`rounded-lg bg-black/50 ${barPadding} gap-1`}>
        <View className="flex-row items-center justify-between">
          <Text className={`text-frontier-dust ${labelSize} font-body`}>XP</Text>
          <Text className={`text-frontier-sky ${valueSize} font-mono`}>
            {xp}/{xpToNext}
          </Text>
        </View>
        <Progress variant="xp" value={xpp} className={isPhone ? "h-1" : "h-1.5"} />
      </View>
    </View>
  );
});

export const TopRightPanel = React.memo(function TopRightPanel() {
  const { currentLocationId, loadedWorld, clockHour, clockMinute } = useGameStoreShallow((s) => ({
    currentLocationId: s.currentLocationId,
    loadedWorld: s.loadedWorld,
    clockHour: s.clockState.hour,
    clockMinute: s.clockState.minute,
  }));

  const insets = useSafeAreaInsets();
  const { isPhone, isDesktop } = useResponsive();

  const currentLocation = currentLocationId
    ? loadedWorld?.locations?.get?.(currentLocationId)
    : null;
  const locationName = currentLocation?.ref?.name ?? "Unknown Territory";

  const timeStr = formatTime(clockHour, clockMinute);
  const phase = timePhaseLabel(clockHour);

  const labelSize = isPhone ? "text-[9px]" : "text-[10px]";
  const valueSize = isPhone ? "text-[10px]" : "text-xs";
  const padding = isPhone ? "px-2 py-1" : "px-3 py-1.5";

  return (
    <View
      className="absolute items-end gap-1.5"
      style={{
        top: Math.max(insets.top, 8) + 4,
        right: Math.max(insets.right, 8) + 4,
      }}
    >
      <View className={`rounded-lg bg-black/50 ${padding} flex-row items-center gap-2`}>
        <Text className={`text-frontier-dust ${labelSize} font-body`}>LOC</Text>
        <Text
          className={`text-white ${valueSize} font-body`}
          numberOfLines={1}
          style={{ maxWidth: isPhone ? 100 : isDesktop ? 200 : 150 }}
        >
          {locationName}
        </Text>
      </View>

      <View className={`rounded-lg bg-black/50 ${padding} flex-row items-center gap-2`}>
        <Text className={`text-frontier-dust ${labelSize} font-body`}>TIME</Text>
        <Text className={`text-white ${valueSize} font-mono`}>{timeStr}</Text>
        {!isPhone && (
          <Badge variant={phase === "Night" ? "warning" : "success"}>
            <Text className="text-[9px] font-body">{phase}</Text>
          </Badge>
        )}
      </View>

      {!isPhone && (
        <View className={`rounded-lg bg-black/50 ${padding} flex-row items-center gap-2`}>
          <Text className={`text-frontier-dust ${labelSize} font-body`}>DIR</Text>
          <Text className={`text-white ${valueSize} font-mono`}>N</Text>
        </View>
      )}
    </View>
  );
});
