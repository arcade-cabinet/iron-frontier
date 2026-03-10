/**
 * LoadingScreen -- Full-screen overlay shown while the game initializes.
 *
 * Covers the raw R3F canvas with a themed overlay that matches the title
 * screen aesthetic. Tracks multiple loading stages and only dismisses
 * when ALL systems report ready.
 *
 * Uses react-native-reanimated for the fade-out transition.
 */

import * as React from "react";
import { View } from "react-native";
import Animated, { Easing, FadeOut } from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { rngTick, scopedRNG } from "../../../src/game/lib/prng.ts";

import { LOADING_TIPS } from "./loadingTips.ts";
import { ProgressBar } from "./ProgressBar.tsx";
import { PulsingDot } from "./PulsingDot.tsx";
import type { LoadingScreenProps } from "./types.ts";

export function LoadingScreen({ stages, allReady }: LoadingScreenProps) {
  // Pick a random tip on mount
  const [tipIndex] = React.useState(() =>
    Math.floor(scopedRNG("ui", 42, rngTick()) * LOADING_TIPS.length),
  );

  // Rotate tips every 4 seconds
  const [currentTip, setCurrentTip] = React.useState(LOADING_TIPS[tipIndex]!);
  React.useEffect(() => {
    let idx = tipIndex;
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_TIPS.length;
      setCurrentTip(LOADING_TIPS[idx]!);
    }, 4000);
    return () => clearInterval(interval);
  }, [tipIndex]);

  // Derive the current status label from the first incomplete stage
  const statusLabel = React.useMemo(() => {
    const pending = stages.find((s) => !s.done);
    return pending?.label ?? "Finishing up...";
  }, [stages]);

  // If ready, start a short delay then unmount via parent
  const [shouldRender, setShouldRender] = React.useState(true);

  React.useEffect(() => {
    if (allReady) {
      // Give reanimated time to run the FadeOut exit animation
      const timer = setTimeout(() => setShouldRender(false), 600);
      return () => clearTimeout(timer);
    }
  }, [allReady]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      exiting={FadeOut.duration(500).easing(Easing.out(Easing.ease))}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        backgroundColor: "#1A0F0A",
        alignItems: "center",
        justifyContent: "center",
      }}
      pointerEvents={allReady ? "none" : "auto"}
    >
      {/* Decorative top border */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: "#B5A642",
          opacity: 0.4,
        }}
      />

      {/* Title */}
      <View style={{ alignItems: "center", marginBottom: 48 }}>
        <Text
          variant="h1"
          style={{
            color: "#C4A882",
            letterSpacing: 8,
            fontSize: 36,
          }}
          className="font-display"
        >
          IRON
        </Text>
        <View
          style={{
            width: 160,
            height: 1,
            backgroundColor: "#B5A642",
            opacity: 0.6,
            marginVertical: 8,
          }}
        />
        <Text
          variant="h1"
          style={{
            color: "#B5A642",
            letterSpacing: 8,
            fontSize: 36,
          }}
          className="font-display"
        >
          FRONTIER
        </Text>
      </View>

      {/* Loading indicator */}
      <View style={{ alignItems: "center", gap: 16 }}>
        {/* Pulsing dot */}
        <PulsingDot />

        {/* Progress bar */}
        <ProgressBar stages={stages} />

        {/* Status text */}
        <Text
          variant="label"
          style={{
            color: "#C4A882",
            opacity: 0.8,
            fontSize: 13,
            letterSpacing: 1,
          }}
          className="font-body"
        >
          {statusLabel}
        </Text>
      </View>

      {/* Loading tip */}
      <View
        style={{
          position: "absolute",
          bottom: 60,
          left: 32,
          right: 32,
          alignItems: "center",
        }}
      >
        <Text
          variant="caption"
          style={{
            color: "#C4A882",
            opacity: 0.4,
            fontSize: 12,
            textAlign: "center",
            fontStyle: "italic",
            lineHeight: 18,
          }}
          className="font-body"
        >
          {currentTip}
        </Text>
      </View>

      {/* Decorative bottom border */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: "#B5A642",
          opacity: 0.4,
        }}
      />
    </Animated.View>
  );
}
