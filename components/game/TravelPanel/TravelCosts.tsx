/**
 * Travel cost estimates row: provisions, fatigue, and time.
 */

import { View } from "react-native";

import { Text } from "@/components/ui/Text";
import type { TravelMethod } from "@/src/game/data/schemas/world";

import { estimateTravelCosts } from "./travelConstants.ts";

export function TravelCosts({ travelTime, method }: { travelTime: number; method: TravelMethod }) {
  const costs = estimateTravelCosts(travelTime, method);

  return (
    <View className="flex-row gap-3">
      <View className="flex-1 rounded-lg border border-amber-700/30 bg-amber-950/30 px-3 py-2">
        <Text className="text-[10px] text-amber-600 font-body uppercase tracking-wider mb-0.5">
          Provisions
        </Text>
        <View className="flex-row items-baseline gap-1">
          <Text className="text-sm text-amber-300 font-mono font-medium">{costs.provisions}</Text>
          <Text className="text-[10px] text-amber-600 font-body">rations</Text>
        </View>
      </View>
      <View className="flex-1 rounded-lg border border-amber-700/30 bg-amber-950/30 px-3 py-2">
        <Text className="text-[10px] text-amber-600 font-body uppercase tracking-wider mb-0.5">
          Fatigue
        </Text>
        <View className="flex-row items-baseline gap-1">
          <Text className="text-sm text-amber-300 font-mono font-medium">{costs.fatigue}%</Text>
          <Text className="text-[10px] text-amber-600 font-body">stamina</Text>
        </View>
      </View>
      <View className="flex-1 rounded-lg border border-amber-700/30 bg-amber-950/30 px-3 py-2">
        <Text className="text-[10px] text-amber-600 font-body uppercase tracking-wider mb-0.5">
          Time
        </Text>
        <View className="flex-row items-baseline gap-1">
          <Text className="text-sm text-amber-300 font-mono font-medium">{travelTime}</Text>
          <Text className="text-[10px] text-amber-600 font-body">hours</Text>
        </View>
      </View>
    </View>
  );
}
