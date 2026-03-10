/**
 * GameHUD — In-game heads-up display overlay for Iron Frontier.
 *
 * Ported from the Angular GameHudComponent. Renders an absolute overlay
 * arranged around the screen edges so the centre FPS viewport stays clear.
 *
 * Layout:
 *   Top-left:     Health bar + XP bar + player level
 *   Top-right:    Location name + time of day
 *   Bottom-left:  Active quest objective
 *   Bottom-right: Currency + fatigue + provisions
 *
 * @module components/game/GameHUD
 */

import * as React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { useResponsive } from "@/hooks/useResponsive";
import { getQuestById } from "@/src/game/data/quests";
import { DEFAULT_FATIGUE_CONFIG } from "@/src/game/systems/fatigue";
import { DEFAULT_PROVISIONS_CONFIG } from "@/src/game/systems/provisions";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Compute health percentage (0-100).
 */
function healthPercent(health: number, maxHealth: number): number {
  if (maxHealth <= 0) return 0;
  return (health / maxHealth) * 100;
}

/**
 * Compute XP percentage toward next level (0-100).
 */
function xpPercent(xp: number, xpToNext: number): number {
  if (xpToNext <= 0) return 0;
  return (xp / xpToNext) * 100;
}

/**
 * Return a frontier brand color class based on health percentage.
 */
function healthTextColor(pct: number): string {
  if (pct > 60) return "text-frontier-sage";
  if (pct > 30) return "text-frontier-whiskey";
  return "text-frontier-blood";
}

/**
 * Convert a 24-hour clock into a 12-hour display string.
 */
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

/**
 * Derive a human-readable time-of-day phase label from the hour.
 */
function timePhaseLabel(hour: number): string {
  if (hour >= 5 && hour < 7) return "Dawn";
  if (hour >= 7 && hour < 17) return "Day";
  if (hour >= 17 && hour < 20) return "Dusk";
  return "Night";
}

/**
 * Map fatigue value to a human-readable label using the default thresholds.
 */
function fatigueLabel(value: number): string {
  const { tired, weary, exhausted, collapsed } = DEFAULT_FATIGUE_CONFIG.thresholds;
  if (value >= collapsed) return "Collapsed";
  if (value >= exhausted) return "Exhausted";
  if (value >= weary) return "Weary";
  if (value >= tired) return "Tired";
  return "Rested";
}

/**
 * Map fatigue label to a badge variant for visual urgency.
 */
function fatigueBadgeVariant(label: string): "success" | "warning" | "danger" | "info" {
  switch (label) {
    case "Collapsed":
    case "Exhausted":
      return "danger";
    case "Weary":
    case "Tired":
      return "warning";
    default:
      return "success";
  }
}

/**
 * Derive the first active quest summary (title + current objective text).
 */
function activeQuestSummary(
  activeQuests: readonly {
    questId: string;
    currentStageIndex: number;
    objectiveProgress: Record<string, number>;
  }[],
): { title: string; objective: string } | null {
  if (!activeQuests.length) return null;
  const aq = activeQuests[0];
  const quest = getQuestById(aq.questId);
  if (!quest) return null;

  const stage = quest.stages[aq.currentStageIndex];
  const objective = stage?.objectives.find(
    (obj: { id: string; count: number; description: string }) => {
      const progress = aq.objectiveProgress?.[obj.id] ?? 0;
      return progress < obj.count;
    },
  );

  return {
    title: quest.title,
    objective: objective?.description ?? stage?.title ?? "Complete quest",
  };
}

/**
 * Compute food percentage (0-100).
 */
function foodPercent(food: number): number {
  return Math.min(100, Math.max(0, (food / DEFAULT_PROVISIONS_CONFIG.maxFood) * 100));
}

/**
 * Compute water percentage (0-100).
 */
function waterPercent(water: number): number {
  return Math.min(100, Math.max(0, (water / DEFAULT_PROVISIONS_CONFIG.maxWater) * 100));
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Top-left: health bar, XP bar, player level. */
const TopLeftPanel = React.memo(function TopLeftPanel() {
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
      {/* Player name + level */}
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

      {/* Health bar */}
      <View className={`rounded-lg bg-black/50 ${barPadding} gap-1`}>
        <View className="flex-row items-center justify-between">
          <Text className={`text-frontier-dust ${labelSize} font-body`}>HP</Text>
          <Text className={`${valueSize} font-mono ${healthTextColor(hp)}`}>
            {health}/{maxHealth}
          </Text>
        </View>
        <Progress variant="health" value={hp} className={isPhone ? "h-1.5" : "h-2"} />
      </View>

      {/* XP bar */}
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

/** Top-right: location name, time of day, compass placeholder. */
const TopRightPanel = React.memo(function TopRightPanel() {
  const { currentLocationId, loadedWorld, clockHour, clockMinute } = useGameStoreShallow((s) => ({
    currentLocationId: s.currentLocationId,
    loadedWorld: s.loadedWorld,
    clockHour: s.clockState.hour,
    clockMinute: s.clockState.minute,
  }));

  const insets = useSafeAreaInsets();
  const { isPhone, isDesktop } = useResponsive();

  // Derive location name
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
      {/* Location */}
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

      {/* Time of day */}
      <View className={`rounded-lg bg-black/50 ${padding} flex-row items-center gap-2`}>
        <Text className={`text-frontier-dust ${labelSize} font-body`}>TIME</Text>
        <Text className={`text-white ${valueSize} font-mono`}>{timeStr}</Text>
        {!isPhone && (
          <Badge variant={phase === "Night" ? "warning" : "success"}>
            <Text className="text-[9px] font-body">{phase}</Text>
          </Badge>
        )}
      </View>

      {/* Compass placeholder -- hidden on phones to save space */}
      {!isPhone && (
        <View className={`rounded-lg bg-black/50 ${padding} flex-row items-center gap-2`}>
          <Text className={`text-frontier-dust ${labelSize} font-body`}>DIR</Text>
          <Text className={`text-white ${valueSize} font-mono`}>N</Text>
        </View>
      )}
    </View>
  );
});

/** Bottom-left: active quest objective summary. */
const BottomLeftPanel = React.memo(function BottomLeftPanel() {
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
        {/* On phone, show only one line of objective to save space */}
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

/** Bottom-right: gold, fatigue, provisions. */
const BottomRightPanel = React.memo(function BottomRightPanel() {
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
      {/* Gold */}
      <View className={`rounded-lg bg-black/50 ${padding} flex-row items-center gap-2`}>
        <Text className={`text-frontier-dust ${labelSize} font-body`}>GOLD</Text>
        <Text
          className={`text-frontier-whiskey ${isPhone ? "text-xs" : "text-sm"} font-bold font-mono`}
        >
          {gold}
        </Text>
      </View>

      {/* Fatigue */}
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

      {/* Provisions -- show condensed on phones */}
      <View
        className={`rounded-lg bg-black/50 ${barPadding} gap-1.5`}
        style={{ minWidth: isPhone ? 100 : 120 }}
      >
        <Text className={`text-frontier-dust ${labelSize} font-body`}>PROVISIONS</Text>

        {/* Food bar */}
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

        {/* Water bar */}
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * GameHUD renders the in-game overlay arranged around screen edges.
 *
 * It is designed to sit as a sibling of the R3F Canvas / Filament view
 * with `position: absolute` and `pointerEvents: 'box-none'` so that
 * touch events pass through the transparent centre to the 3D scene.
 */
export function GameHUD() {
  return (
    <View className="absolute inset-0" pointerEvents="box-none" accessibilityRole="none">
      <TopLeftPanel />
      <TopRightPanel />
      <BottomLeftPanel />
      <BottomRightPanel />
    </View>
  );
}
