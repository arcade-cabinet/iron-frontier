import { Modal, Pressable, View } from "react-native";
import Animated, { Easing, FadeIn, FadeOut, SlideInDown } from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { cn } from "@/lib/utils";
import { dangerDescription, methodDescription } from "@/src/game/systems/TravelManager";
import {
  DANGER_BG,
  DANGER_BORDER,
  DANGER_COLORS,
  getLocationName,
  METHOD_VISUALS,
} from "./constants.ts";
import { LandscapeSilhouette, TravelIcon, TravelProgress } from "./TravelAnimations.tsx";

export function TravelTransition() {
  const { travel, cancelTravel, phase } = useGameStoreShallow((s) => ({
    travel: s.travelState,
    cancelTravel: s.cancelTravel,
    phase: s.phase,
  }));

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

            <View className="gap-5 px-5 py-5">
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

              <LandscapeSilhouette method={travel.method} />

              <View className="items-center py-2">
                <TravelIcon icon={visual.icon} />
                <Text className="mt-2 text-xs italic text-amber-400/60">{methodDesc}</Text>
              </View>

              <TravelProgress progress={travel.progress} fromName={fromName} toName={toName} />

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
