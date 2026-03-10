/**
 * TravelPanel - Bottom-sheet travel interface
 *
 * Shown when the player initiates travel between towns. Displays:
 * - Route header: from/to locations with estimated time
 * - Color-coded danger level indicator
 * - Animated progress bar during travel
 * - Travel cost estimates (provisions, fatigue)
 * - Encounter interruption panel with enemy silhouette description
 * - Fight (red) / Flee (amber) action buttons
 *
 * Ported from legacy/angular-ui/travel-panel.component.ts
 */

import * as React from "react";
import { Pressable, View } from "react-native";
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
  label: string;
  barColor: string;
};

const DANGER_STYLES: Record<DangerLevel, DangerStyle> = {
  safe: {
    bg: "bg-green-900/50",
    text: "text-green-400",
    border: "border-green-700/50",
    label: "Safe",
    barColor: "#22c55e",
  },
  low: {
    bg: "bg-lime-900/50",
    text: "text-lime-400",
    border: "border-lime-700/50",
    label: "Low",
    barColor: "#84cc16",
  },
  moderate: {
    bg: "bg-yellow-900/50",
    text: "text-yellow-400",
    border: "border-yellow-700/50",
    label: "Moderate",
    barColor: "#eab308",
  },
  high: {
    bg: "bg-orange-900/50",
    text: "text-orange-400",
    border: "border-orange-700/50",
    label: "High",
    barColor: "#f97316",
  },
  extreme: {
    bg: "bg-red-900/50",
    text: "text-red-400",
    border: "border-red-700/50",
    label: "Extreme",
    barColor: "#ef4444",
  },
};

type MethodInfo = {
  label: string;
  speed: string;
  iconChar: string;
  provisionCostMod: number;
  fatigueCostMod: number;
};

const METHOD_INFO: Record<TravelMethod, MethodInfo> = {
  road: {
    label: "Road",
    speed: "Fast",
    iconChar: "\u{1F40E}",
    provisionCostMod: 1,
    fatigueCostMod: 0.8,
  },
  trail: {
    label: "Trail",
    speed: "Moderate",
    iconChar: "\u{1F97E}",
    provisionCostMod: 1.2,
    fatigueCostMod: 1,
  },
  railroad: {
    label: "Railroad",
    speed: "Very Fast",
    iconChar: "\u{1F682}",
    provisionCostMod: 0.5,
    fatigueCostMod: 0.3,
  },
  wilderness: {
    label: "Wilderness",
    speed: "Slow",
    iconChar: "\u{1F97E}",
    provisionCostMod: 1.5,
    fatigueCostMod: 1.5,
  },
  river: {
    label: "River",
    speed: "Varies",
    iconChar: "\u{1F6F6}",
    provisionCostMod: 0.8,
    fatigueCostMod: 0.7,
  },
};

const DANGER_COLORS: Record<string, string> = {
  safe: "#22c55e",
  low: "#84cc16",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#ef4444",
};

/** Estimate travel costs based on travel time and method */
function estimateTravelCosts(
  travelTime: number,
  method: TravelMethod,
): { provisions: number; fatigue: number } {
  const info = METHOD_INFO[method] ?? METHOD_INFO.trail;
  return {
    provisions: Math.ceil(travelTime * info.provisionCostMod),
    fatigue: Math.ceil(travelTime * 10 * info.fatigueCostMod),
  };
}

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

/** Route visualization: origin -> destination */
function RouteHeader({
  fromName,
  toName,
  travelTime,
  method,
}: {
  fromName: string;
  toName: string;
  travelTime: number;
  method: TravelMethod;
}) {
  const methodInfo = METHOD_INFO[method] ?? METHOD_INFO.trail;

  return (
    <View className="flex-row items-center gap-2 py-1">
      {/* Origin */}
      <View className="flex-1 items-center">
        <View className="w-2.5 h-2.5 rounded-full bg-amber-400 mb-1" />
        <Text className="text-xs text-amber-300 font-body text-center" numberOfLines={1}>
          {fromName}
        </Text>
      </View>

      {/* Route line with travel info */}
      <View className="flex-2 items-center gap-1">
        <View className="flex-row items-center gap-1">
          <View className="h-[1px] w-6 bg-amber-600/50" />
          <Text style={{ fontSize: 14 }}>{methodInfo.iconChar}</Text>
          <View className="h-[1px] w-6 bg-amber-600/50" />
        </View>
        <Text className="text-[10px] text-amber-500/70 font-mono">
          ~{travelTime}h ({methodInfo.speed})
        </Text>
      </View>

      {/* Destination */}
      <View className="flex-1 items-center">
        <View
          className="w-2.5 h-2.5 rounded-sm bg-amber-500 mb-1"
          style={{ transform: [{ rotate: "45deg" }] }}
        />
        <Text className="text-xs text-amber-300 font-body text-center" numberOfLines={1}>
          {toName}
        </Text>
      </View>
    </View>
  );
}

/** Color-coded danger level indicator */
function DangerIndicator({ dangerLevel }: { dangerLevel: DangerLevel }) {
  const style = DANGER_STYLES[dangerLevel] ?? DANGER_STYLES.moderate;

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
          {dangerLevel === "safe" && "Patrolled route, minimal risk"}
          {dangerLevel === "low" && "Occasional wildlife sightings"}
          {dangerLevel === "moderate" && "Bandits sometimes patrol this area"}
          {dangerLevel === "high" && "Frequent bandit activity, travel armed"}
          {dangerLevel === "extreme" && "Lawless territory, extreme caution"}
        </Text>
      </View>
      {/* Danger level bars */}
      <View className="flex-row gap-0.5">
        {(["safe", "low", "moderate", "high", "extreme"] as DangerLevel[]).map((level, idx) => {
          const levels: DangerLevel[] = ["safe", "low", "moderate", "high", "extreme"];
          const currentIdx = levels.indexOf(dangerLevel);
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

/** Travel cost estimates row */
function TravelCosts({ travelTime, method }: { travelTime: number; method: TravelMethod }) {
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

/** Animated progress bar */
function TravelProgressBar({
  progress,
  fromName,
  toName,
  dangerLevel,
}: {
  progress: number;
  fromName: string;
  toName: string;
  dangerLevel: DangerLevel;
}) {
  const animatedWidth = useSharedValue(0);
  const dangerColor = DANGER_COLORS[dangerLevel] ?? DANGER_COLORS.moderate;

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
      <View className="relative h-5 overflow-hidden rounded-full border border-amber-700/50 bg-amber-950/70">
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
        <Animated.View
          className="h-full rounded-full"
          style={[fillStyle, { backgroundColor: dangerColor, opacity: 0.7 }]}
        />

        {/* Percentage centered on bar */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text className="font-mono text-[10px] text-amber-200 font-medium">
            {Math.round(progress)}%
          </Text>
        </View>

        {/* Marker dot */}
        <Animated.View
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-amber-700 shadow-lg"
          style={[markerStyle, { backgroundColor: dangerColor }]}
        />
      </View>

      {/* Labels */}
      <View className="flex-row items-center justify-between">
        <Text className="max-w-[35%] text-xs text-amber-500" numberOfLines={1}>
          {fromName}
        </Text>
        <Text className="max-w-[35%] text-right text-xs text-amber-500" numberOfLines={1}>
          {toName}
        </Text>
      </View>
    </View>
  );
}

/** Encounter interruption panel with dramatic reveal */
function EncounterPanel({
  travel,
  onFight,
  onFlee,
}: {
  travel: TravelState;
  onFight: () => void;
  onFlee: () => void;
}) {
  // Pulsing border effect for urgency
  const pulseOpacity = useSharedValue(0.5);

  React.useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="rounded-lg border-2 border-red-700/60 bg-red-950/50 overflow-hidden"
    >
      {/* Pulsing danger strip at top */}
      <Animated.View className="h-1 bg-red-500" style={pulseStyle} />

      <View className="p-4">
        {/* Encounter header with silhouette */}
        <View className="mb-3 items-center">
          <View className="mb-2 h-16 w-16 items-center justify-center rounded-full border-2 border-red-700/50 bg-red-900/40">
            <Text style={{ fontSize: 32 }}>{"\u{1F480}"}</Text>
          </View>
          <Text className="text-lg font-bold text-red-300 font-heading text-center">
            Road Ambush!
          </Text>
          <Text className="text-sm text-red-400/80 text-center mt-0.5">
            Hostiles have blocked the {travel.method}!
          </Text>
        </View>

        {/* Enemy silhouette description */}
        <View className="rounded-lg border border-red-800/40 bg-red-950/40 p-3 mb-4">
          <Text className="text-xs text-red-400/60 font-body uppercase tracking-wider mb-1">
            Threat Assessment
          </Text>
          <Text className="text-sm text-amber-200/80 font-body leading-5">
            Dark shapes block the path ahead. You've been waylaid by enemies and must decide quickly
            -- fight your way through or attempt to flee back the way you came.
          </Text>
        </View>

        {/* Action buttons with urgency styling */}
        <View className="flex-row gap-3">
          {/* Fight button - RED urgency */}
          <Pressable
            className="min-h-[52px] flex-1 items-center justify-center gap-1 rounded-lg bg-red-800 border border-red-600/50 px-3 py-3"
            onPress={onFight}
            accessibilityRole="button"
            accessibilityLabel="Fight the encounter"
          >
            <Text style={{ fontSize: 20 }}>{"\u{2694}"}</Text>
            <Text className="text-sm font-bold text-red-100 font-heading uppercase tracking-wider">
              Fight
            </Text>
          </Pressable>

          {/* Flee button - AMBER retreat */}
          <Pressable
            className="min-h-[52px] flex-1 items-center justify-center gap-1 rounded-lg border-2 border-amber-600/50 bg-amber-900/40 px-3 py-3"
            onPress={onFlee}
            accessibilityRole="button"
            accessibilityLabel="Flee from the encounter"
          >
            <Text style={{ fontSize: 20 }}>{"\u{1F3C3}"}</Text>
            <Text className="text-sm font-bold text-amber-200 font-heading uppercase tracking-wider">
              Flee
            </Text>
          </Pressable>
        </View>
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
    if (travel.encounterId && travel.encounterId !== prevEncounterIdRef.current) {
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
    <View
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      pointerEvents="box-none"
      className="z-50"
    >
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        className="absolute inset-0 items-center justify-center"
        pointerEvents="box-none"
      >
        {/* Semi-transparent backdrop */}
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
          }}
          onPress={cancelTravel}
          accessibilityRole="none"
        />

        <Animated.View
          entering={SlideInDown.duration(200).easing(Easing.out(Easing.cubic))}
          exiting={SlideOutDown.duration(180).easing(Easing.in(Easing.cubic))}
          className="mx-4 w-full max-w-md overflow-hidden rounded-xl border-2 border-amber-700/60 bg-amber-950 shadow-2xl"
          pointerEvents="auto"
        >
          {/* Header */}
          <View className="border-b border-amber-800/50 bg-amber-900/40 p-4">
            <View className="flex-row items-center gap-3 mb-3">
              {/* Method icon */}
              <View className="h-12 w-12 items-center justify-center rounded-lg border border-amber-700/50 bg-amber-800/50">
                <Text style={{ fontSize: 24 }}>
                  {showEncounter ? "\u{1F480}" : methodInfo.iconChar}
                </Text>
              </View>

              <View className="min-w-0 flex-1">
                <Text
                  className={cn(
                    "text-lg font-bold font-heading",
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

            {/* Route visualization */}
            <RouteHeader
              fromName={fromName}
              toName={toName}
              travelTime={travel.travelTime}
              method={travel.method}
            />
          </View>

          {/* Content */}
          <View className="gap-3 p-4">
            {/* Danger indicator */}
            <DangerIndicator dangerLevel={travel.dangerLevel} />

            {/* Travel cost estimates */}
            <TravelCosts travelTime={travel.travelTime} method={travel.method} />

            {/* Progress bar */}
            <TravelProgressBar
              progress={localProgress}
              fromName={fromName}
              toName={toName}
              dangerLevel={travel.dangerLevel}
            />

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
    </View>
  );
}

export default TravelPanel;
