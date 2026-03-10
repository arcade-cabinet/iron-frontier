/**
 * QuestObjectiveToast — Bottom-center quest objective with typewriter reveal.
 *
 * Shows the current quest objective with a typewriter text effect, holds
 * for a few seconds, then fades out. Re-triggers when the objective changes.
 *
 * Replaces the always-visible quest panel from GameHUD.
 *
 * @module components/game/QuestObjectiveToast
 */

import * as React from "react";
import { Platform, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { useGameStoreShallow } from "@/hooks/useGameStore";
import { useResponsive } from "@/hooks/useResponsive";
import { getQuestById } from "@/src/game/data/quests";

// ============================================================================
// CONSTANTS
// ============================================================================

const HUD_AMBER = "#D4A855";
const HUD_TEXT = "#E8D5A8";
const TYPEWRITER_CHAR_MS = 30;
const DISPLAY_MS = 5000;
const FADE_IN_MS = 300;
const FADE_OUT_MS = 500;

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

// ============================================================================
// HELPERS
// ============================================================================

function getCurrentObjectiveText(
  activeQuests: readonly {
    questId: string;
    currentStageIndex: number;
    objectiveProgress: Record<string, number>;
  }[],
): string | null {
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

  return objective?.description ?? stage?.title ?? null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function QuestObjectiveToast() {
  const insets = useSafeAreaInsets();
  const { isPhone } = useResponsive();
  const activeQuests = useGameStoreShallow((s) => s.activeQuests);

  const objectiveText = getCurrentObjectiveText(activeQuests);

  // Track previous objective to detect changes
  const prevObjectiveRef = React.useRef<string | null>(null);
  const [displayText, setDisplayText] = React.useState("");
  const [targetText, setTargetText] = React.useState<string | null>(null);
  const opacity = useSharedValue(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const typewriterRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect objective changes
  React.useEffect(() => {
    if (objectiveText === prevObjectiveRef.current) return;
    prevObjectiveRef.current = objectiveText;

    if (!objectiveText) {
      // No objective — fade out
      opacity.value = withTiming(0, { duration: FADE_OUT_MS, easing: Easing.in(Easing.quad) });
      return;
    }

    // New objective — start typewriter
    setTargetText(objectiveText);
    setDisplayText("");

    // Fade in
    opacity.value = withTiming(1, { duration: FADE_IN_MS, easing: Easing.out(Easing.quad) });

    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typewriterRef.current) clearInterval(typewriterRef.current);

    // Typewriter effect
    let charIndex = 0;
    typewriterRef.current = setInterval(() => {
      charIndex++;
      if (charIndex >= objectiveText.length) {
        setDisplayText(objectiveText);
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      } else {
        setDisplayText(objectiveText.slice(0, charIndex));
      }
    }, TYPEWRITER_CHAR_MS);

    // Schedule fade-out
    const totalTypewriterMs = objectiveText.length * TYPEWRITER_CHAR_MS;
    timerRef.current = setTimeout(() => {
      opacity.value = withTiming(0, { duration: FADE_OUT_MS, easing: Easing.in(Easing.quad) });
      timerRef.current = null;
    }, totalTypewriterMs + DISPLAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, [objectiveText, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!targetText) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: Math.max(insets.bottom, 8) + (isPhone ? 50 : 60),
          left: 0,
          right: 0,
          alignItems: "center",
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "rgba(20, 15, 10, 0.7)",
          borderRadius: 4,
          borderLeftWidth: 3,
          borderLeftColor: HUD_AMBER,
          maxWidth: isPhone ? 280 : 400,
        }}
      >
        <Text
          style={{
            color: HUD_TEXT,
            fontSize: isPhone ? 11 : 13,
            fontFamily: MONO_FONT,
            fontWeight: "500",
          }}
        >
          {displayText}
          {displayText.length < (targetText?.length ?? 0) && (
            <Text style={{ color: HUD_AMBER, opacity: 0.6 }}>_</Text>
          )}
        </Text>
      </View>
    </Animated.View>
  );
}
