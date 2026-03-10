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
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { cn } from "@/lib/utils";

import { DangerIndicator } from "./DangerIndicator.tsx";
import { EncounterPanel } from "./EncounterPanel.tsx";
import { RouteHeader, TravelBobIcon } from "./RouteHeader.tsx";
import { TravelCosts } from "./TravelCosts.tsx";
import { TravelProgressBar } from "./TravelProgressBar.tsx";
import { getLocationName, METHOD_INFO } from "./travelConstants.ts";

export function TravelPanel() {
  const [showEncounter, setShowEncounter] = React.useState(false);
  const [localProgress, setLocalProgress] = React.useState(0);
  const prevStartedAtRef = React.useRef<number | null>(null);

  const { travel, completeTravel, cancelTravel, startCombat } = useGameStoreShallow((s) => ({
    travel: s.travelState,
    completeTravel: s.completeTravel,
    cancelTravel: s.cancelTravel,
    startCombat: s.startCombat,
  }));

  const prevEncounterIdRef = React.useRef<string | null>(null);

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
      setLocalProgress(travel.progress);
      const revealTimer = setTimeout(() => {
        setShowEncounter(true);
      }, 500);
      return () => clearTimeout(revealTimer);
    }

    prevEncounterIdRef.current = travel.encounterId;

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

  const handleFight = React.useCallback(() => {
    if (travel?.encounterId) {
      startCombat(travel.encounterId);
    }
  }, [travel, startCombat]);

  const handleFlee = React.useCallback(() => {
    cancelTravel();
  }, [cancelTravel]);

  if (!travel || !travel.encounterId) return null;

  const fromName = getLocationName(travel.fromLocationId);
  const toName = getLocationName(travel.toLocationId);
  const methodInfo = METHOD_INFO[travel.method] ?? METHOD_INFO.trail;

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

            <RouteHeader
              fromName={fromName}
              toName={toName}
              travelTime={travel.travelTime}
              method={travel.method}
            />
          </View>

          {/* Content */}
          <View className="gap-3 p-4">
            <DangerIndicator dangerLevel={travel.dangerLevel} />
            <TravelCosts travelTime={travel.travelTime} method={travel.method} />
            <TravelProgressBar
              progress={localProgress}
              fromName={fromName}
              toName={toName}
              dangerLevel={travel.dangerLevel}
            />

            {showEncounter && travel.encounterId ? (
              <EncounterPanel travel={travel} onFight={handleFight} onFlee={handleFlee} />
            ) : null}

            {!showEncounter && !travel.encounterId ? (
              <View className="items-center py-4">
                <TravelBobIcon iconChar={methodInfo.iconChar} />
                <Text className="mt-3 text-sm text-amber-400/70">
                  Traveling via {methodInfo.label.toLowerCase()}...
                </Text>
                <Text className="mt-1 text-xs text-amber-500/50">
                  {methodInfo.speed} travel speed
                </Text>
              </View>
            ) : null}
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
