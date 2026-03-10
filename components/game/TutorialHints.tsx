/**
 * TutorialHints - Bottom-center tutorial hint overlay.
 *
 * Shows timed contextual hints when the game first starts:
 * 1. (3s)  "Use WASD to move, Mouse to look around"
 * 2. (8s)  "Press TAB to open your inventory"
 * 3. (15s) "Follow the marker to your first objective"
 *
 * Each hint fades in, displays for a few seconds, then fades out.
 * The sequence only plays once per game session. Uses React Native
 * Animated API for smooth fades, rendered as an overlay above the Canvas.
 */

import { useEffect, useRef, useState } from "react";
import { Animated, Platform, View } from "react-native";

import { Text } from "@/components/ui/Text";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HUD_AMBER = "#D4A855";
const HUD_BG = "rgba(20, 15, 10, 0.75)";
const FADE_DURATION = 600;
const DISPLAY_DURATION = 4000;

interface HintConfig {
  delay: number;
  text: string;
}

const HINTS: HintConfig[] = [
  { delay: 3000, text: "Use WASD to move, Mouse to look around" },
  { delay: 8000, text: "Press TAB to open your inventory" },
  {
    delay: 15000,
    text: "Follow the \u25C6 marker to your first objective",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TutorialHints() {
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    const timers: ReturnType<typeof setTimeout>[] = [];

    HINTS.forEach((hint, index) => {
      const timer = setTimeout(() => {
        setCurrentHintIndex(index);

        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: Platform.OS !== "web",
        }).start();

        // Schedule fade out
        const fadeOutTimer = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: FADE_DURATION,
            useNativeDriver: Platform.OS !== "web",
          }).start(() => {
            // After last hint fades out, hide the component
            if (index === HINTS.length - 1) {
              setCurrentHintIndex(-2); // sentinel for "done"
            }
          });
        }, DISPLAY_DURATION);

        timers.push(fadeOutTimer);
      }, hint.delay);

      timers.push(timer);
    });

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [fadeAnim]);

  // Don't render if we haven't started or are finished
  if (currentHintIndex < 0 && currentHintIndex !== -1) return null;
  if (currentHintIndex === -2) return null;
  if (currentHintIndex < 0) return null;

  const hint = HINTS[currentHintIndex];
  if (!hint) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 10,
      }}
      pointerEvents="none"
    >
      <Animated.View
        style={{
          backgroundColor: HUD_BG,
          borderWidth: 1,
          borderColor: `${HUD_AMBER}44`,
          borderRadius: 8,
          paddingHorizontal: 20,
          paddingVertical: 10,
          maxWidth: 420,
          opacity: fadeAnim,
        }}
      >
        <Text
          style={{
            color: HUD_AMBER,
            fontSize: 14,
            fontFamily: Platform.select({
              ios: "Menlo",
              android: "monospace",
              default: "monospace",
            }),
            textAlign: "center",
            letterSpacing: 0.5,
          }}
        >
          {hint.text}
        </Text>
      </Animated.View>
    </View>
  );
}
