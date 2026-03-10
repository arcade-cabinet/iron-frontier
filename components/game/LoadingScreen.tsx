/**
 * LoadingScreen — Full-screen overlay shown while the game initializes.
 *
 * Covers the raw R3F canvas with a themed overlay that matches the title
 * screen aesthetic. Tracks multiple loading stages and only dismisses
 * when ALL systems report ready.
 *
 * Uses react-native-reanimated for the fade-out transition.
 */

import * as React from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { rngTick, scopedRNG } from "../../src/game/lib/prng.ts";

// =============================================================================
// TYPES
// =============================================================================

export interface LoadingStage {
  key: string;
  label: string;
  done: boolean;
}

export interface LoadingScreenProps {
  /** Ordered list of loading stages with completion flags. */
  stages: LoadingStage[];
  /** When true, all stages are done and the screen will fade out and unmount. */
  allReady: boolean;
}

// =============================================================================
// LOADING TIPS (western lore)
// =============================================================================

const LOADING_TIPS: string[] = [
  "The frontier waits for no one.",
  "A wise gunslinger always checks their six.",
  "Water is worth more than gold in the badlands.",
  "The rail lines carry more than cargo - they carry secrets.",
  "Trust is earned slowly and lost in a heartbeat out here.",
  "A good horse is worth more than a fast draw.",
  "The desert remembers everything and forgives nothing.",
  "Keep your powder dry and your wits sharp.",
  "Dusty Springs was built on copper and broken promises.",
  "Even outlaws need a code to live by.",
  "The old mine holds more than ore, they say.",
  "A stranger with no name has no debts - and no friends.",
  "Night falls fast on the frontier. Find shelter before it does.",
  "The sheriff sees all - or so the townsfolk believe.",
  "Provisions run low when the trail runs long.",
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Pulsing amber dot indicator */
function PulsingDot() {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#D4A017",
        },
        style,
      ]}
    />
  );
}

/** Animated progress bar that fills as stages complete */
function ProgressBar({ stages }: { stages: LoadingStage[] }) {
  const total = stages.length;
  const done = stages.filter((s) => s.done).length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  const animatedWidth = useSharedValue(0);

  React.useEffect(() => {
    animatedWidth.value = withTiming(pct, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [pct, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View
      style={{
        width: "100%",
        maxWidth: 280,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(92, 64, 51, 0.4)",
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          {
            height: "100%",
            borderRadius: 2,
            backgroundColor: "#B5A642",
          },
          fillStyle,
        ]}
      />
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

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
