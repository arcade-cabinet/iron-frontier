/**
 * TravelTransition - Full-screen overlay shown during inter-town travel
 *
 * Displays:
 * - Route header (origin -> destination)
 * - Travel method and estimated time
 * - Animated landscape silhouette scrolling
 * - Progress bar with percentage
 * - Danger level indicator with description
 * - Cancel button
 *
 * Sits above the game scene as a modal overlay during the 'travel' phase.
 * Reads travel state from the store and delegates to TravelPanel for
 * encounter interruptions.
 */

import * as React from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { cn } from "@/lib/utils";
import type { DangerLevel, TravelMethod } from "@/src/game/data/schemas/world";
import { FrontierTerritory } from "@/src/game/data/worlds/frontier_territory";
import type { TravelState } from "@/src/game/store/types";
import { dangerDescription, methodDescription } from "@/src/game/systems/TravelManager";
import { rngTick, scopedRNG } from "../../src/game/lib/prng.ts";

// =============================================================================
// CONSTANTS
// =============================================================================

const DANGER_COLORS: Record<DangerLevel, string> = {
  safe: "#22c55e",
  low: "#84cc16",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

const DANGER_BG: Record<DangerLevel, string> = {
  safe: "bg-green-900/40",
  low: "bg-lime-900/40",
  moderate: "bg-yellow-900/40",
  high: "bg-orange-900/40",
  extreme: "bg-red-900/40",
};

const DANGER_BORDER: Record<DangerLevel, string> = {
  safe: "border-green-700/40",
  low: "border-lime-700/40",
  moderate: "border-yellow-700/40",
  high: "border-orange-700/40",
  extreme: "border-red-700/40",
};

type MethodVisual = {
  label: string;
  icon: string;
  speed: string;
};

const METHOD_VISUALS: Record<TravelMethod, MethodVisual> = {
  road: { label: "Road", icon: "\u{1F40E}", speed: "Fast" },
  trail: { label: "Trail", icon: "\u{1F97E}", speed: "Moderate" },
  railroad: { label: "Railroad", icon: "\u{1F682}", speed: "Very Fast" },
  wilderness: { label: "Wilderness", icon: "\u{1F97E}", speed: "Slow" },
  river: { label: "River", icon: "\u{1F6F6}", speed: "Varies" },
};

// =============================================================================
// HELPERS
// =============================================================================

function getLocationName(locationId: string | null | undefined): string {
  if (!locationId) return "Unknown";
  const loc = FrontierTerritory.locations.find((l) => l.id === locationId);
  return loc?.name ?? locationId;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Animated landscape silhouette that scrolls during travel */
function LandscapeSilhouette({ method }: { method: TravelMethod }) {
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    const speed = method === "railroad" ? 3000 : method === "road" ? 5000 : 7000;
    translateX.value = withRepeat(
      withTiming(-200, { duration: speed, easing: Easing.linear }),
      -1,
      false,
    );
  }, [translateX, method]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Generate simple mountain/mesa silhouette shapes
  const shapes = React.useMemo(() => {
    const items: { left: number; width: number; height: number; opacity: number }[] = [];
    // Create a repeating pattern wider than the view
    for (let i = 0; i < 12; i++) {
      items.push({
        left: i * 60 + scopedRNG("ui", 42, rngTick()) * 20,
        width: 30 + scopedRNG("ui", 42, rngTick()) * 40,
        height: 20 + scopedRNG("ui", 42, rngTick()) * 50,
        opacity: 0.15 + scopedRNG("ui", 42, rngTick()) * 0.2,
      });
    }
    return items;
  }, []);

  return (
    <View className="h-20 overflow-hidden" style={{ opacity: 0.6 }}>
      <Animated.View
        style={[
          {
            flexDirection: "row",
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 900,
            height: 80,
            alignItems: "flex-end",
          },
          animatedStyle,
        ]}
      >
        {shapes.map((shape, i) => (
          <View
            key={`mtn-${i}`}
            style={{
              position: "absolute",
              left: shape.left,
              bottom: 0,
              width: shape.width,
              height: shape.height,
              backgroundColor: "#4a3728",
              opacity: shape.opacity,
              borderTopLeftRadius: shape.width * 0.3,
              borderTopRightRadius: shape.width * 0.2,
            }}
          />
        ))}
        {/* Ground line */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "#4a3728",
            opacity: 0.3,
          }}
        />
      </Animated.View>
    </View>
  );
}

/** Progress bar with origin/destination labels */
function TravelProgress({
  progress,
  fromName,
  toName,
}: {
  progress: number;
  fromName: string;
  toName: string;
}) {
  const animatedWidth = useSharedValue(0);

  React.useEffect(() => {
    animatedWidth.value = withTiming(Math.min(progress, 100), {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View className="gap-2">
      {/* Track */}
      <View className="relative h-5 overflow-hidden rounded-full border border-amber-700/50 bg-amber-900/50">
        {/* Tick marks */}
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={`tick-${i}`}
            style={{
              position: "absolute",
              left: `${(i + 1) * 25}%`,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            }}
          />
        ))}

        {/* Fill */}
        <Animated.View className="h-full rounded-full bg-amber-500/80" style={fillStyle} />
      </View>

      {/* Labels */}
      <View className="flex-row items-center justify-between">
        <Text className="max-w-[35%] text-xs text-amber-500" numberOfLines={1}>
          {fromName}
        </Text>
        <Text className="font-mono text-sm font-bold text-amber-300">{Math.round(progress)}%</Text>
        <Text className="max-w-[35%] text-right text-xs text-amber-500" numberOfLines={1}>
          {toName}
        </Text>
      </View>
    </View>
  );
}

/** Bobbing travel icon */
function TravelIcon({ icon }: { icon: string }) {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ alignItems: "center" }, animatedStyle]}>
      <Text style={{ fontSize: 56 }}>{icon}</Text>
    </Animated.View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TravelTransition() {
  // Store state
  const { travel, cancelTravel, phase } = useGameStoreShallow((s) => ({
    travel: s.travelState,
    cancelTravel: s.cancelTravel,
    phase: s.phase,
  }));

  // Only show during travel phase when there's no encounter (TravelPanel handles encounters)
  const shouldShow = phase === "travel" && travel && !travel.encounterId;

  if (!shouldShow || !travel) return null;

  const fromName = getLocationName(travel.fromLocationId);
  const toName = getLocationName(travel.toLocationId);
  const visual = METHOD_VISUALS[travel.method] ?? METHOD_VISUALS.trail;
  const dangerColor = DANGER_COLORS[travel.dangerLevel] ?? DANGER_COLORS.moderate;
  const dangerBg = DANGER_BG[travel.dangerLevel] ?? DANGER_BG.moderate;
  const dangerBorder = DANGER_BORDER[travel.dangerLevel] ?? DANGER_BORDER.moderate;
  const dangerDesc = dangerDescription(travel.dangerLevel);
  const methodDesc = methodDescription(travel.method);

  return (
    <Modal visible transparent animationType="none" onRequestClose={cancelTravel}>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="absolute inset-0 bg-black/90"
      >
        <View className="flex-1 items-center justify-center px-4">
          <Animated.View
            entering={SlideInDown.duration(300).easing(Easing.out(Easing.cubic))}
            className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-amber-700/50 bg-amber-950 shadow-2xl"
          >
            {/* Header */}
            <View className="border-b border-amber-800/50 bg-amber-900/30 px-5 py-4">
              <Text className="text-center text-lg font-bold text-amber-200">Traveling...</Text>
              <View className="mt-1 flex-row items-center justify-center gap-2">
                <Text className="text-sm text-amber-400" numberOfLines={1}>
                  {fromName}
                </Text>
                <Text className="text-amber-600">{"\u{2192}"}</Text>
                <Text className="text-sm text-amber-400" numberOfLines={1}>
                  {toName}
                </Text>
              </View>
            </View>

            {/* Body */}
            <View className="gap-5 px-5 py-5">
              {/* Method & time row */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 rounded-lg border border-amber-700/40 bg-amber-900/40 px-3 py-1.5">
                  <Text style={{ fontSize: 14 }}>{visual.icon}</Text>
                  <View>
                    <Text className="text-xs font-medium text-amber-200">{visual.label}</Text>
                    <Text className="text-[10px] text-amber-500">{visual.speed}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2 rounded-lg border border-amber-700/40 bg-amber-900/40 px-3 py-1.5">
                  <Text style={{ fontSize: 14 }}>{"\u{1F9ED}"}</Text>
                  <Text className="text-xs text-amber-300">{travel.travelTime}h journey</Text>
                </View>
              </View>

              {/* Landscape animation */}
              <LandscapeSilhouette method={travel.method} />

              {/* Travel icon */}
              <View className="items-center py-2">
                <TravelIcon icon={visual.icon} />
                <Text className="mt-2 text-xs italic text-amber-400/60">{methodDesc}</Text>
              </View>

              {/* Progress bar */}
              <TravelProgress progress={travel.progress} fromName={fromName} toName={toName} />

              {/* Danger level */}
              <View className={cn("rounded-lg border px-4 py-3", dangerBg, dangerBorder)}>
                <View className="flex-row items-center gap-2">
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: dangerColor,
                    }}
                  />
                  <Text className="text-xs font-bold capitalize" style={{ color: dangerColor }}>
                    {travel.dangerLevel} danger
                  </Text>
                </View>
                <Text className="mt-1 text-[11px] text-amber-300/70">{dangerDesc}</Text>
              </View>
            </View>

            {/* Footer with cancel */}
            <View className="border-t border-amber-800/50 bg-amber-900/20 px-5 py-4">
              <Pressable
                className="min-h-[44px] items-center justify-center rounded-lg border border-amber-700/50 bg-amber-800/40 px-4 py-2.5"
                onPress={cancelTravel}
                accessibilityRole="button"
                accessibilityLabel="Cancel travel and return to origin"
              >
                <Text className="text-sm font-medium text-amber-300">Cancel Journey</Text>
                <Text className="mt-0.5 text-[10px] text-amber-500/60">Return to {fromName}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

export default TravelTransition;
