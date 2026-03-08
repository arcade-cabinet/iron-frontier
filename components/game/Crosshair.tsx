/**
 * Crosshair — Fallout-style `> <` bracket crosshair overlay for Iron Frontier.
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

import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';

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
// Constants
// ---------------------------------------------------------------------------

/** Base gap between center and bracket arms (pixels). */
const BASE_GAP = 8;
/** Length of each bracket arm (pixels). */
const ARM_LENGTH = 10;
/** Thickness of bracket arms (pixels). */
const ARM_THICKNESS = 2;
/** How much spread (in radians) maps to pixel gap expansion. */
const SPREAD_TO_PIXELS = 200;
/** Hit marker line length (pixels). */
const HIT_MARKER_SIZE = 10;

const MONO_FONT = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLOR_DEFAULT = '#D4A855'; // Amber
const COLOR_ENEMY = '#CC4444'; // Red
const COLOR_INTERACT = '#D4A855'; // Amber (matching HUD)
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
    (Crosshair as any)._flash = flashRef.current;
    return () => {
      (Crosshair as any)._flash = undefined;
    };
  }, []);

  if (!visible) return null;

  // If targeting interactable, show [E] instead of brackets
  if (isTargetingInteractable) {
    return (
      <View style={styles.container} pointerEvents="none">
        <View
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -10 }, { translateY: -8 }],
          }}
        >
          <Text
            style={{
              color: COLOR_INTERACT,
              fontSize: 14,
              fontWeight: '700',
              fontFamily: MONO_FONT,
              textShadowColor: 'rgba(212, 168, 85, 0.4)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4,
            }}
          >
            [E]
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Left bracket:  >  */}
      {/* Top arm of left bracket (going up-right) */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: ARM_LENGTH,
          height: ARM_THICKNESS,
          backgroundColor: crosshairColor,
          opacity: 0.85,
          marginLeft: -(effectiveGap + ARM_LENGTH),
          marginTop: -ARM_LENGTH / 2,
          transform: [{ rotate: '30deg' }],
        }}
      />
      {/* Bottom arm of left bracket */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: ARM_LENGTH,
          height: ARM_THICKNESS,
          backgroundColor: crosshairColor,
          opacity: 0.85,
          marginLeft: -(effectiveGap + ARM_LENGTH),
          marginTop: ARM_LENGTH / 2 - ARM_THICKNESS,
          transform: [{ rotate: '-30deg' }],
        }}
      />

      {/* Right bracket:  <  */}
      {/* Top arm of right bracket */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: ARM_LENGTH,
          height: ARM_THICKNESS,
          backgroundColor: crosshairColor,
          opacity: 0.85,
          marginLeft: effectiveGap,
          marginTop: -ARM_LENGTH / 2,
          transform: [{ rotate: '-30deg' }],
        }}
      />
      {/* Bottom arm of right bracket */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: ARM_LENGTH,
          height: ARM_THICKNESS,
          backgroundColor: crosshairColor,
          opacity: 0.85,
          marginLeft: effectiveGap,
          marginTop: ARM_LENGTH / 2 - ARM_THICKNESS,
          transform: [{ rotate: '30deg' }],
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
      <Animated.View
        style={[
          styles.hitMarkerContainer,
          { opacity: hitOpacity },
        ]}
      >
        <View
          style={[
            styles.hitMarkerLine,
            {
              backgroundColor: hitColor,
              width: HIT_MARKER_SIZE,
              height: ARM_THICKNESS,
              transform: [{ rotate: '45deg' }],
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: -ARM_THICKNESS / 2,
              marginLeft: -HIT_MARKER_SIZE / 2,
            },
          ]}
        />
        <View
          style={[
            styles.hitMarkerLine,
            {
              backgroundColor: hitColor,
              width: HIT_MARKER_SIZE,
              height: ARM_THICKNESS,
              transform: [{ rotate: '-45deg' }],
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: -ARM_THICKNESS / 2,
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
    width: 2,
    height: 2,
    borderRadius: 1,
    marginTop: -1,
    marginLeft: -1,
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
