/**
 * Color-coded danger level indicator with description and level bars.
 */

import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import type { DangerLevel } from "@/src/game/data/schemas/world";

import { DANGER_STYLES } from "./travelConstants.ts";

const DANGER_DESCRIPTIONS: Record<DangerLevel, string> = {
  safe: "Patrolled route, minimal risk",
  low: "Occasional wildlife sightings",
  moderate: "Bandits sometimes patrol this area",
  high: "Frequent bandit activity, travel armed",
  extreme: "Lawless territory, extreme caution",
};

const DANGER_LEVELS: DangerLevel[] = ["safe", "low", "moderate", "high", "extreme"];

export function DangerIndicator({ dangerLevel }: { dangerLevel: DangerLevel }) {
  const style = DANGER_STYLES[dangerLevel] ?? DANGER_STYLES.moderate;
  const currentIdx = DANGER_LEVELS.indexOf(dangerLevel);

  return (
    <View
      className={cn(
        "flex-row items-center gap-2 rounded-lg border px-3 py-2",
        style.bg,
        style.border,
      )}
    >
      {/* Danger dot with glow effect */}
      <View className="items-center justify-center">
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: style.barColor,
          }}
        />
        <View
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: style.barColor,
            opacity: 0.2,
          }}
        />
      </View>
      <View className="flex-1">
        <Text className={cn("text-xs font-medium", style.text)}>{style.label} Danger</Text>
        <Text className="text-[10px] text-zinc-500 font-body">
          {DANGER_DESCRIPTIONS[dangerLevel]}
        </Text>
      </View>
      {/* Danger level bars */}
      <View className="flex-row gap-0.5">
        {DANGER_LEVELS.map((level, idx) => {
          const isFilled = idx <= currentIdx;
          return (
            <View
              key={level}
              style={{
                width: 3,
                height: 8 + idx * 2,
                borderRadius: 1,
                backgroundColor: isFilled ? style.barColor : "rgba(255,255,255,0.1)",
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
