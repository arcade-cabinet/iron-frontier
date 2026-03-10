/**
 * CurrentLocationBar - shows current location info and travel options
 * below the map canvas.
 */

import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/Text";
import type { Connection, LocationRef } from "@/src/game/data/schemas/world";
import { DANGER_COLORS, getLocationById } from "./types.ts";

export function CurrentLocationBar({
  currentLoc,
  currentLocationId,
  currentConnections,
  discoveredIds,
  onTravel,
  onUndiscoveredTravel,
}: {
  currentLoc: LocationRef | undefined;
  currentLocationId: string;
  currentConnections: Connection[];
  discoveredIds: Set<string>;
  onTravel: (locationId: string) => void;
  onUndiscoveredTravel: () => void;
}) {
  return (
    <View className="mt-3 rounded-lg border border-amber-700/50 bg-amber-900/40 p-3">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] uppercase tracking-wider text-amber-400">
            Current Location
          </Text>
          <Text className="text-sm font-medium text-amber-100">
            {currentLoc?.name ?? "Unknown"}
          </Text>
        </View>
        <View className="rounded bg-amber-600 px-2 py-0.5">
          <Text className="text-[10px] capitalize text-amber-100">
            {currentLoc?.type ?? "unknown"}
          </Text>
        </View>
      </View>

      {currentConnections.length > 0 && (
        <View className="mt-3">
          <Text className="mb-1.5 text-[10px] uppercase tracking-wider text-amber-400">
            Travel Options ({currentConnections.length})
          </Text>
          <View className="gap-1.5">
            {currentConnections.slice(0, 6).map((conn) => {
              const targetId = conn.to === currentLocationId ? conn.from : conn.to;
              const target = getLocationById(targetId);
              if (!target) return null;
              const isTargetDiscovered = discoveredIds.has(targetId);

              return (
                <Pressable
                  key={`travel-${targetId}`}
                  className="min-h-[44px] flex-row items-center justify-between rounded border border-amber-700/50 bg-amber-800/30 px-3 py-2"
                  onPress={() => {
                    if (isTargetDiscovered) {
                      onTravel(targetId);
                    } else {
                      onUndiscoveredTravel();
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Travel to ${isTargetDiscovered ? target.name : "unknown location"}`}
                >
                  <View className="flex-1">
                    <Text className="text-xs font-medium text-amber-200">
                      {isTargetDiscovered ? target.name : "???"}
                    </Text>
                    <Text className="text-[10px] text-amber-400">
                      {conn.travelTime}h via {conn.method}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: DANGER_COLORS[conn.danger] ?? "#eab308",
                      }}
                    />
                    <Text
                      className="text-[10px] capitalize"
                      style={{ color: DANGER_COLORS[conn.danger] ?? "#eab308" }}
                    >
                      {conn.danger}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
