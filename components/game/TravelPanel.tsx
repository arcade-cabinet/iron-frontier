/**
 * TravelPanel - Bottom-sheet travel interface
 *
 * Shown when the player initiates travel between towns. Displays:
 * - Route header: from/to locations, travel method icon
 * - Progress bar with animated fill during travel
 * - Danger level badge and travel time
 * - Encounter interruption panel (ambush) with Fight/Flee options
 * - Animated travel icon bobbing during normal travel
 *
 * Ported from legacy/angular-ui/travel-panel.component.ts
 */

import * as React from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { cn } from "@/lib/utils";
import type { DangerLevel, TravelMethod } from "@/src/game/data/schemas/world";
import { FrontierTerritory } from "@/src/game/data/worlds/frontier_territory";
import type { TravelState } from "@/src/game/store/types";

// =============================================================================
// CONSTANTS
// =============================================================================

type DangerStyle = {
  bg: string;
  text: string;
  border: string;
};

const DANGER_STYLES: Record<DangerLevel, DangerStyle> = {
  safe: {
    bg: "bg-green-900/50",
    text: "text-green-400",
    border: "border-green-700/50",
  },
  low: {
    bg: "bg-lime-900/50",
    text: "text-lime-400",
    border: "border-lime-700/50",
  },
  moderate: {
    bg: "bg-yellow-900/50",
    text: "text-yellow-400",
    border: "border-yellow-700/50",
  },
  high: {
    bg: "bg-orange-900/50",
    text: "text-orange-400",
    border: "border-orange-700/50",
  },
  extreme: {
    bg: "bg-red-900/50",
    text: "text-red-400",
    border: "border-red-700/50",
  },
};

type MethodInfo = {
  label: string;
  speed: string;
  iconChar: string;
};

const METHOD_INFO: Record<TravelMethod, MethodInfo> = {
  road: { label: "Road", speed: "Fast", iconChar: "\u{1F40E}" }, // horse
  trail: { label: "Trail", speed: "Moderate", iconChar: "\u{1F97E}" }, // boot
  railroad: { label: "Railroad", speed: "Very Fast", iconChar: "\u{1F682}" }, // train
  wilderness: { label: "Wilderness", speed: "Slow", iconChar: "\u{1F97E}" }, // boot
  river: { label: "River", speed: "Varies", iconChar: "\u{1F6F6}" }, // canoe
};

const DANGER_COLORS: Record<string, string> = {
  safe: "#22c55e",
  low: "#84cc16",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

// =============================================================================
// HELPERS
// =============================================================================

function getLocationName(locationId?: string | null): string {
  if (!locationId) return "Unknown";
  const loc = FrontierTerritory.locations.find((l) => l.id === locationId);
  return loc?.name ?? locationId;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Animated bobbing icon during travel */
function TravelBobIcon({ iconChar }: { iconChar: string }) {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ alignItems: "center" }, animatedStyle]}>
      <Text style={{ fontSize: 48 }}>{iconChar}</Text>
    </Animated.View>
  );
}

/** Animated progress bar */
function TravelProgressBar({
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

  const markerStyle = useAnimatedStyle(() => ({
    left: `${Math.min(animatedWidth.value, 97)}%`,
  }));

  return (
    <View className="gap-2">
      {/* Progress track */}
      <View className="relative h-4 overflow-hidden rounded-full border border-amber-700/50 bg-amber-900/50">
        {/* Tick marks background */}
        <View
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.15,
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <View
              key={`tick-${i}`}
              style={{
                position: "absolute",
                left: `${(i + 1) * 10}%`,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: "rgba(255, 255, 255, 0.3)",
              }}
            />
          ))}
        </View>

        {/* Fill */}
        <Animated.View className="h-full rounded-full bg-amber-500" style={fillStyle} />

        {/* Marker dot */}
        <Animated.View
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-amber-700 bg-amber-300 shadow-lg"
          style={markerStyle}
        />
      </View>

      {/* Labels */}
      <View className="flex-row items-center justify-between">
        <Text className="max-w-[35%] text-xs text-amber-500" numberOfLines={1}>
          {fromName}
        </Text>
        <Text className="font-mono text-xs text-amber-400">{Math.round(progress)}%</Text>
        <Text className="max-w-[35%] text-right text-xs text-amber-500" numberOfLines={1}>
          {toName}
        </Text>
      </View>
    </View>
  );
}

/** Encounter interruption panel */
function EncounterPanel({
  travel,
  onFight,
  onFlee,
}: {
  travel: TravelState;
  onFight: () => void;
  onFlee: () => void;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      className="rounded-lg border border-red-800/50 bg-red-950/40 p-4"
    >
      {/* Encounter header */}
      <View className="mb-3 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-lg border border-red-700/50 bg-red-900/50">
          <Text style={{ fontSize: 20 }}>{"\u{1F480}"}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-red-200">Road Ambush!</Text>
          <Text className="text-sm text-red-400/80">
            Hostiles have blocked the {travel.method}!
          </Text>
        </View>
      </View>

      <Text className="mb-4 text-sm text-amber-200/70">
        You've been waylaid by enemies. You can fight your way through or attempt to flee back the
        way you came.
      </Text>

      {/* Action buttons */}
      <View className="flex-row gap-3">
        <Pressable
          className="min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-red-800 px-3 py-2.5"
          onPress={onFight}
          accessibilityRole="button"
          accessibilityLabel="Fight the encounter"
        >
          <Text style={{ fontSize: 16 }}>{"\u{2694}"}</Text>
          <Text className="text-sm font-medium text-red-100">Fight</Text>
        </Pressable>

        <Pressable
          className="min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-amber-700/50 bg-amber-900/50 px-3 py-2.5"
          onPress={onFlee}
          accessibilityRole="button"
          accessibilityLabel="Flee from the encounter"
        >
          <Text style={{ fontSize: 16 }}>{"\u{1F3C3}"}</Text>
          <Text className="text-sm font-medium text-amber-200">Flee</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TravelPanel() {
  const [showEncounter, setShowEncounter] = React.useState(false);
  const [localProgress, setLocalProgress] = React.useState(0);
  const prevStartedAtRef = React.useRef<number | null>(null);

  // Store state
  const { travel, completeTravel, cancelTravel, startCombat } = useGameStoreShallow((s) => ({
    travel: s.travelState,
    completeTravel: s.completeTravel,
    cancelTravel: s.cancelTravel,
    startCombat: s.startCombat,
  }));

  // Track the last known encounter ID to detect mid-travel encounters
  const prevEncounterIdRef = React.useRef<string | null>(null);

  // Track travel state changes
  React.useEffect(() => {
    if (!travel) {
      setLocalProgress(0);
      setShowEncounter(false);
      prevStartedAtRef.current = null;
      prevEncounterIdRef.current = null;
      return;
    }

    // New travel started
    if (travel.startedAt !== prevStartedAtRef.current) {
      prevStartedAtRef.current = travel.startedAt;
      setLocalProgress(0);
      setShowEncounter(false);
      prevEncounterIdRef.current = travel.encounterId;

      // If there's an encounter from the start, animate to current progress then show encounter
      if (travel.encounterId) {
        const encounterTimer = setTimeout(() => {
          setLocalProgress(travel.progress > 0 ? travel.progress : 50);
          const revealTimer = setTimeout(() => {
            setShowEncounter(true);
          }, 500);
          return () => clearTimeout(revealTimer);
        }, 1000);
        return () => clearTimeout(encounterTimer);
      }
    }

    // Mid-travel encounter: encounterId changed from null to a value
    if (
      travel.encounterId &&
      travel.encounterId !== prevEncounterIdRef.current
    ) {
      prevEncounterIdRef.current = travel.encounterId;
      // Show encounter at current progress
      setLocalProgress(travel.progress);
      const revealTimer = setTimeout(() => {
        setShowEncounter(true);
      }, 500);
      return () => clearTimeout(revealTimer);
    }

    prevEncounterIdRef.current = travel.encounterId;

    // Sync progress from store
    if (travel.progress > 0) {
      setLocalProgress(travel.progress);
    }
  }, [travel]);

  // Auto-complete when progress hits 100 (for non-encounter travel)
  React.useEffect(() => {
    if (!travel || travel.encounterId) return;
    if (localProgress >= 100) {
      const timer = setTimeout(() => {
        completeTravel();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [localProgress, travel, completeTravel]);

  // Handlers
  const handleFight = React.useCallback(() => {
    if (travel?.encounterId) {
      startCombat(travel.encounterId);
    }
  }, [travel, startCombat]);

  const handleFlee = React.useCallback(() => {
    cancelTravel();
  }, [cancelTravel]);

  // TravelTransition handles non-encounter travel display.
  // TravelPanel only shows when there is an active encounter during travel.
  if (!travel || !travel.encounterId) return null;

  const fromName = getLocationName(travel.fromLocationId);
  const toName = getLocationName(travel.toLocationId);
  const methodInfo = METHOD_INFO[travel.method] ?? METHOD_INFO.trail;
  const dangerStyle = DANGER_STYLES[travel.dangerLevel] ?? DANGER_STYLES.moderate;

  return (
    <Modal visible={!!travel && !!travel.encounterId} transparent animationType="none" onRequestClose={cancelTravel}>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        className="absolute inset-0 items-center justify-center bg-black/85"
      >
        <Animated.View
          entering={SlideInDown.duration(200).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(180).easing(Easing.in(Easing.cubic))}
          className="mx-4 w-full max-w-md overflow-hidden rounded-xl border-2 border-amber-700/60 bg-amber-950 shadow-2xl"
        >
          {/* Header */}
          <View className="border-b border-amber-800/50 bg-amber-900/40 p-4">
            <View className="flex-row items-center gap-3">
              {/* Method icon */}
              <View className="h-12 w-12 items-center justify-center rounded-lg border border-amber-700/50 bg-amber-800/50">
                <Text style={{ fontSize: 24 }}>
                  {showEncounter ? "\u{1F480}" : methodInfo.iconChar}
                </Text>
              </View>

              <View className="min-w-0 flex-1">
                <Text
                  className={cn(
                    "text-lg font-bold",
                    showEncounter ? "text-red-400" : "text-amber-200",
                  )}
                >
                  {showEncounter ? "Ambush!" : "Traveling..."}
                </Text>
                <Text className="text-sm text-amber-400/80" numberOfLines={1}>
                  {fromName} <Text className="text-amber-500">{"\u{2192}"}</Text> {toName}
                </Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View className="gap-4 p-4">
            {/* Method & danger info row */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                {/* Method badge */}
                <View className="flex-row items-center gap-1.5 rounded-md border border-amber-700/50 bg-amber-900/50 px-2.5 py-1">
                  <Text style={{ fontSize: 12 }}>{methodInfo.iconChar}</Text>
                  <Text className="text-xs font-medium text-amber-200">{methodInfo.label}</Text>
                </View>

                {/* Travel time badge */}
                <View className="flex-row items-center gap-1.5 rounded-md border border-amber-700/50 bg-amber-900/50 px-2.5 py-1">
                  <Text style={{ fontSize: 12 }}>{"\u{1F9ED}"}</Text>
                  <Text className="text-xs text-amber-300">{travel.travelTime}h</Text>
                </View>
              </View>

              {/* Danger badge */}
              <View
                className={cn(
                  "flex-row items-center gap-1.5 rounded-md border px-2.5 py-1",
                  dangerStyle.bg,
                  dangerStyle.border,
                )}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: DANGER_COLORS[travel.dangerLevel] ?? "#eab308",
                  }}
                />
                <Text className={cn("text-xs font-medium capitalize", dangerStyle.text)}>
                  {travel.dangerLevel} danger
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <TravelProgressBar progress={localProgress} fromName={fromName} toName={toName} />

            {/* Encounter panel */}
            {showEncounter && travel.encounterId && (
              <EncounterPanel travel={travel} onFight={handleFight} onFlee={handleFlee} />
            )}

            {/* Travel animation (no encounter) */}
            {!showEncounter && !travel.encounterId && (
              <View className="items-center py-4">
                <TravelBobIcon iconChar={methodInfo.iconChar} />
                <Text className="mt-3 text-sm text-amber-400/70">
                  Traveling via {methodInfo.label.toLowerCase()}...
                </Text>
                <Text className="mt-1 text-xs text-amber-500/50">
                  {methodInfo.speed} travel speed
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View className="border-t border-amber-800/50 bg-amber-900/20 p-3">
            <Text className="text-center text-[10px] text-amber-500/50">
              {showEncounter
                ? "Choose your course of action"
                : "The frontier stretches before you..."}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default TravelPanel;
