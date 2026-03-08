// Crosshair — Dynamic FPS crosshair overlay for Iron Frontier.
//
// Renders as a React Native absolute overlay on top of the 3D viewport.
// Features:
//   - Four crosshair lines that expand/contract based on weapon spread
//   - Hit marker flash on successful hits (X shape)
//   - Color coding: white (default), red (enemy hit), green (headshot)
//   - Center dot for precision aiming
//
// This component receives spread/hit data from CombatSystem via props
// rather than subscribing to the Zustand store, to avoid coupling combat
// tick frequency to React render cycles.

import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

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
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Base gap between center and crosshair lines (pixels). */
const BASE_GAP = 6;
/** Length of each crosshair line (pixels). */
const LINE_LENGTH = 12;
/** Line thickness (pixels). */
const LINE_WIDTH = 2;
/** How much spread (in radians) maps to pixel gap expansion. */
const SPREAD_TO_PIXELS = 200;
/** Hit marker line length (pixels). */
const HIT_MARKER_SIZE = 10;

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLOR_DEFAULT = '#FFFFFF';
const COLOR_HIT = '#FF4444';
const COLOR_HEADSHOT = '#44FF44';
const COLOR_KILL = '#FFD700';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Crosshair({
  spread = 0,
  isAiming = false,
  visible = true,
}: CrosshairProps) {
  // Hit marker animation
  const hitOpacity = useRef(new Animated.Value(0)).current;
  const [hitColor, setHitColor] = useState(COLOR_HIT);

  // Computed gap from spread
  const gap = BASE_GAP + spread * SPREAD_TO_PIXELS;

  // ADS: thinner crosshair, smaller gap
  const adsScale = isAiming ? 0.6 : 1.0;
  const effectiveGap = gap * adsScale;
  const effectiveLength = LINE_LENGTH * adsScale;
  const effectiveWidth = isAiming ? 1 : LINE_WIDTH;

  /**
   * Flash the hit marker. Called from CombatSystem via imperative handle
   * or parent callback.
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

  // Expose flashHitMarker via ref for parent components
  // We also listen for a custom event pattern via a stable callback ref
  const flashRef = useRef(flashHitMarker);
  flashRef.current = flashHitMarker;

  // Make flashHitMarker accessible to parent via a global-ish pattern
  // (CombatSystem calls onHitMarker which the parent routes here)
  React.useEffect(() => {
    (Crosshair as any)._flash = flashRef.current;
    return () => {
      (Crosshair as any)._flash = undefined;
    };
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Center dot */}
      <View style={[styles.centerDot, { opacity: isAiming ? 0.9 : 0.6 }]} />

      {/* Top line */}
      <View
        style={[
          styles.line,
          {
            width: effectiveWidth,
            height: effectiveLength,
            top: '50%',
            left: '50%',
            marginLeft: -effectiveWidth / 2,
            marginTop: -(effectiveGap + effectiveLength),
          },
        ]}
      />

      {/* Bottom line */}
      <View
        style={[
          styles.line,
          {
            width: effectiveWidth,
            height: effectiveLength,
            top: '50%',
            left: '50%',
            marginLeft: -effectiveWidth / 2,
            marginTop: effectiveGap,
          },
        ]}
      />

      {/* Left line */}
      <View
        style={[
          styles.line,
          {
            width: effectiveLength,
            height: effectiveWidth,
            top: '50%',
            left: '50%',
            marginTop: -effectiveWidth / 2,
            marginLeft: -(effectiveGap + effectiveLength),
          },
        ]}
      />

      {/* Right line */}
      <View
        style={[
          styles.line,
          {
            width: effectiveLength,
            height: effectiveWidth,
            top: '50%',
            left: '50%',
            marginTop: -effectiveWidth / 2,
            marginLeft: effectiveGap,
          },
        ]}
      />

      {/* Hit marker (X shape) */}
      <Animated.View
        style={[
          styles.hitMarkerContainer,
          { opacity: hitOpacity },
        ]}
      >
        {/* Top-left to bottom-right diagonal */}
        <View
          style={[
            styles.hitMarkerLine,
            {
              backgroundColor: hitColor,
              width: HIT_MARKER_SIZE,
              height: LINE_WIDTH,
              transform: [{ rotate: '45deg' }],
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: -LINE_WIDTH / 2,
              marginLeft: -HIT_MARKER_SIZE / 2,
            },
          ]}
        />
        {/* Top-right to bottom-left diagonal */}
        <View
          style={[
            styles.hitMarkerLine,
            {
              backgroundColor: hitColor,
              width: HIT_MARKER_SIZE,
              height: LINE_WIDTH,
              transform: [{ rotate: '-45deg' }],
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: -LINE_WIDTH / 2,
              marginLeft: -HIT_MARKER_SIZE / 2,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

/**
 * Imperative API: flash the hit marker from outside React.
 * Call Crosshair.flash(isHeadshot, isKill) when a hit is confirmed.
 */
Crosshair.flash = (isHeadshot: boolean, isKill: boolean) => {
  (Crosshair as any)._flash?.(isHeadshot, isKill);
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLOR_DEFAULT,
    marginTop: -1.5,
    marginLeft: -1.5,
  },
  line: {
    position: 'absolute',
    backgroundColor: COLOR_DEFAULT,
    opacity: 0.8,
  },
  hitMarkerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hitMarkerLine: {
    opacity: 1,
  },
});
