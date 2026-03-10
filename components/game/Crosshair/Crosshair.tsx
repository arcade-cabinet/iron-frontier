/**
 * Crosshair -- Fallout-style `> <` bracket crosshair overlay for Iron Frontier.
 *
 * Renders as a React Native absolute overlay on top of the 3D viewport.
 * Features:
 *   - Two opposing angle brackets (> <) that form the crosshair
 *   - Brackets spread apart when moving/shooting, tighten when still/aiming
 *   - Turns red when aimed at enemy
 *   - Turns amber [E] when aimed at interactable (coordinate with InteractionPrompt)
 *   - Hit marker flash on successful hits (X shape)
 *
 * @module components/game/Crosshair
 */

import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import {
  ARM_LENGTH,
  ARM_THICKNESS,
  BASE_GAP,
  COLOR_DEFAULT,
  COLOR_ENEMY,
  COLOR_HEADSHOT,
  COLOR_HIT,
  COLOR_INTERACT,
  COLOR_KILL,
  SPREAD_TO_PIXELS,
} from "./constants.ts";
import { HitMarker } from "./HitMarker.tsx";
import { InteractCrosshair } from "./InteractCrosshair.tsx";

// ---------------------------------------------------------------------------
// Module-level ref for imperative flash API
// ---------------------------------------------------------------------------
type FlashFn = (isHeadshot: boolean, isKill: boolean) => void;
let _crosshairFlashRef: FlashFn | undefined;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CrosshairProps {
  /** Current weapon spread in radians (0 = no spread). */
  spread?: number;
  /** Whether the player is aiming down sights. */
  isAiming?: boolean;
  /** Whether to show the crosshair at all. */
  visible?: boolean;
  /** Whether crosshair is aimed at an enemy. */
  isTargetingEnemy?: boolean;
  /** Whether crosshair is aimed at an interactable. */
  isTargetingInteractable?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Crosshair({
  spread = 0,
  isAiming = false,
  visible = true,
  isTargetingEnemy = false,
  isTargetingInteractable = false,
}: CrosshairProps) {
  // Hit marker animation
  const hitOpacity = useRef(new Animated.Value(0)).current;
  const [hitColor, setHitColor] = useState(COLOR_HIT);

  // Computed gap from spread
  const gap = BASE_GAP + spread * SPREAD_TO_PIXELS;

  // ADS: tighter crosshair
  const adsScale = isAiming ? 0.5 : 1.0;
  const effectiveGap = gap * adsScale;

  // Determine crosshair color
  const crosshairColor = isTargetingEnemy
    ? COLOR_ENEMY
    : isTargetingInteractable
      ? COLOR_INTERACT
      : COLOR_DEFAULT;

  /**
   * Flash the hit marker.
   */
  const flashHitMarker = useCallback(
    (isHeadshot: boolean, isKill: boolean) => {
      if (isKill) {
        setHitColor(COLOR_KILL);
      } else if (isHeadshot) {
        setHitColor(COLOR_HEADSHOT);
      } else {
        setHitColor(COLOR_HIT);
      }

      hitOpacity.setValue(1);
      Animated.timing(hitOpacity, {
        toValue: 0,
        duration: isKill ? 400 : 150,
        useNativeDriver: true,
      }).start();
    },
    [hitOpacity],
  );

  // Expose flashHitMarker via ref
  const flashRef = useRef(flashHitMarker);
  flashRef.current = flashHitMarker;

  React.useEffect(() => {
    _crosshairFlashRef = flashRef.current;
    return () => {
      _crosshairFlashRef = undefined;
    };
  }, []);

  if (!visible) return null;

  // If targeting interactable, show [E] instead of brackets
  if (isTargetingInteractable) {
    return <InteractCrosshair />;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Left bracket:  >  */}
      {/* Top arm of left bracket (going up-right) */}
      <View
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: ARM_LENGTH,
          height: ARM_THICKNESS,
          backgroundColor: crosshairColor,
          opacity: 0.85,
          marginLeft: -(effectiveGap + ARM_LENGTH),
          marginTop: -ARM_LENGTH / 2,
          transform: [{ rotate: "30deg" }],
        }}
      />
      {/* Bottom arm of left bracket */}
      <View
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: ARM_LENGTH,
          height: ARM_THICKNESS,
          backgroundColor: crosshairColor,
          opacity: 0.85,
          marginLeft: -(effectiveGap + ARM_LENGTH),
          marginTop: ARM_LENGTH / 2 - ARM_THICKNESS,
          transform: [{ rotate: "-30deg" }],
        }}
      />

      {/* Right bracket:  <  */}
      {/* Top arm of right bracket */}
      <View
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: ARM_LENGTH,
          height: ARM_THICKNESS,
          backgroundColor: crosshairColor,
          opacity: 0.85,
          marginLeft: effectiveGap,
          marginTop: -ARM_LENGTH / 2,
          transform: [{ rotate: "-30deg" }],
        }}
      />
      {/* Bottom arm of right bracket */}
      <View
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: ARM_LENGTH,
          height: ARM_THICKNESS,
          backgroundColor: crosshairColor,
          opacity: 0.85,
          marginLeft: effectiveGap,
          marginTop: ARM_LENGTH / 2 - ARM_THICKNESS,
          transform: [{ rotate: "30deg" }],
        }}
      />

      {/* Tiny center dot */}
      <View
        style={[
          styles.centerDot,
          {
            backgroundColor: crosshairColor,
            opacity: isAiming ? 0.9 : 0.4,
          },
        ]}
      />

      {/* Hit marker (X shape) */}
      <HitMarker hitOpacity={hitOpacity} hitColor={hitColor} />
    </View>
  );
}

/**
 * Imperative API: flash the hit marker from outside React.
 */
Crosshair.flash = (isHeadshot: boolean, isKill: boolean) => {
  _crosshairFlashRef?.(isHeadshot, isKill);
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 2,
    height: 2,
    borderRadius: 1,
    marginTop: -1,
    marginLeft: -1,
  },
});
