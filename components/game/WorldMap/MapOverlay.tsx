/**
 * Map overlay components: region backgrounds, labels, compass, legend, and tooltip.
 */

import { Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import type { Region } from "@/src/game/data/schemas/world";
import { BIOME_COLORS, DANGER_COLORS, type TooltipData, toRenderX, toRenderY } from "./types.ts";

// =============================================================================
// RegionRect
// =============================================================================

export function RegionRect({ region, isDiscovered }: { region: Region; isDiscovered: boolean }) {
  const x = toRenderX(region.bounds.minX);
  const y = toRenderY(region.bounds.minY);
  const x2 = toRenderX(region.bounds.maxX + 1);
  const y2 = toRenderY(region.bounds.maxY + 1);
  const w = x2 - x;
  const h = y2 - y;

  const biomeColor = BIOME_COLORS[region.biome] ?? "#c2b280";

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        backgroundColor: biomeColor,
        opacity: isDiscovered ? 0.35 : 0.12,
        borderRadius: 4,
        borderWidth: isDiscovered ? 2 : 1,
        borderColor: biomeColor,
      }}
    />
  );
}

// =============================================================================
// RegionLabel
// =============================================================================

export function RegionLabel({ region }: { region: Region }) {
  const x = toRenderX(region.bounds.minX);
  const x2 = toRenderX(region.bounds.maxX + 1);
  const y = toRenderY(region.bounds.minY);
  const centerX = x + (x2 - x) / 2;

  return (
    <Text
      style={{
        position: "absolute",
        left: centerX - 60,
        top: y + 4,
        width: 120,
        textAlign: "center",
        fontSize: 9,
        fontStyle: "italic",
        color: "#4a3728",
        opacity: 0.6,
      }}
      numberOfLines={1}
    >
      {region.name}
    </Text>
  );
}

// =============================================================================
// CompassRose
// =============================================================================

export function CompassRose() {
  return (
    <View
      style={{
        position: "absolute",
        right: 10,
        top: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(74, 55, 40, 0.15)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 10,
          color: "#4a3728",
          fontWeight: "bold",
          position: "absolute",
          top: 2,
        }}
      >
        N
      </Text>
      <View style={{ width: 1, height: 20, backgroundColor: "#4a3728", opacity: 0.5 }} />
      <View
        style={{
          position: "absolute",
          width: 20,
          height: 1,
          backgroundColor: "#4a3728",
          opacity: 0.5,
        }}
      />
    </View>
  );
}

// =============================================================================
// MapLegend
// =============================================================================

export function MapLegend() {
  return (
    <View className="mx-3 mt-2 flex-row flex-wrap gap-x-4 gap-y-1.5 rounded-lg bg-amber-900/30 p-2">
      <View className="flex-row items-center gap-1">
        <View className="h-[3px] w-4 bg-amber-800" />
        <Text className="text-[10px] text-amber-300">Road</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <View className="h-[2px] w-4 border-t-2 border-dashed border-amber-700" />
        <Text className="text-[10px] text-amber-300">Trail</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <View className="h-[3px] w-4 bg-gray-600" />
        <Text className="text-[10px] text-amber-300">Rail</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <View className="h-3 w-3 rounded-full border-2 border-amber-200 bg-red-600" />
        <Text className="text-[10px] text-amber-300">Current</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <View className="h-3 w-3 rounded-full border border-dashed border-emerald-400 bg-emerald-600" />
        <Text className="text-[10px] text-amber-300">Reachable</Text>
      </View>
    </View>
  );
}

// =============================================================================
// LocationTooltip
// =============================================================================

export function LocationTooltip({
  data,
  currentLocationId,
  isDiscovered,
  onDismiss,
  onTravel,
}: {
  data: TooltipData;
  currentLocationId: string;
  isDiscovered: boolean;
  onDismiss: () => void;
  onTravel: (locationId: string) => void;
}) {
  const { location, travelInfo } = data;
  const isHere = location.id === currentLocationId;
  const canTravel = isDiscovered && !isHere && travelInfo != null;

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(100)}
      className="absolute bottom-4 left-4 right-4 z-50"
    >
      <Pressable onPress={onDismiss}>
        <View className="rounded-lg border border-amber-700 bg-amber-950 p-3 shadow-xl">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-amber-100">{location.name}</Text>
            <Text className="text-xs capitalize text-amber-400">{location.type}</Text>
          </View>

          {location.tags && location.tags.length > 0 ? (
            <View className="mt-1.5 flex-row flex-wrap gap-1">
              {location.tags.slice(0, 4).map((tag) => (
                <View key={tag} className="rounded bg-amber-800/50 px-1.5 py-0.5">
                  <Text className="text-[10px] text-amber-300">{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {travelInfo ? (
            <View className="mt-2 border-t border-amber-700/50 pt-2">
              <Text className="text-xs text-amber-300">
                <Text className="capitalize">{travelInfo.method}</Text>
                {" - "}
                {travelInfo.travelTime}h travel time
              </Text>
              <View className="mt-1 flex-row items-center gap-1">
                <Text className="text-xs text-amber-400">Danger:</Text>
                <Text
                  className="text-xs font-medium capitalize"
                  style={{ color: DANGER_COLORS[travelInfo.danger] ?? "#eab308" }}
                >
                  {travelInfo.danger}
                </Text>
              </View>
            </View>
          ) : null}

          {isHere ? <Text className="mt-2 text-xs italic text-amber-500">You are here</Text> : null}

          {!isDiscovered ? (
            <Text className="mt-2 text-xs italic text-amber-500/70">
              Explore the frontier to discover this location
            </Text>
          ) : null}

          {canTravel ? (
            <Pressable
              className="mt-3 min-h-[40px] items-center justify-center rounded-lg bg-amber-700 px-4 py-2"
              onPress={() => onTravel(location.id)}
              accessibilityRole="button"
              accessibilityLabel={`Fast travel to ${location.name}`}
            >
              <Text className="text-sm font-medium text-amber-100">
                Fast Travel ({travelInfo.travelTime}h)
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
