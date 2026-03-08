/**
 * DamageFlash — Red screen flash overlay when the player takes damage.
 *
 * Absolute-positioned red View overlay that flashes on damage.
 * Intensity scales with damage amount: more damage = more opaque.
 * Fades from peak opacity to 0 over 0.5 seconds using react-native-reanimated.
 *
 * Usage:
 *   <DamageFlash />
 *
 * Then call the imperative API from outside React:
 *   DamageFlash.trigger(damage)
 */

import * as React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum opacity for a tiny scratch (1 damage). */
const MIN_OPACITY = 0.1;
/** Maximum opacity for a devastating hit. */
const MAX_OPACITY = 0.45;
/** Damage value at which the flash reaches maximum opacity. */
const MAX_DAMAGE_THRESHOLD = 50;
/** Duration of the fade-out in milliseconds. */
const FADE_DURATION_MS = 500;

// ---------------------------------------------------------------------------
// Imperative trigger (module-scoped singleton)
// ---------------------------------------------------------------------------

type TriggerFn = (damage: number) => void;

let _triggerFn: TriggerFn | null = null;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DamageFlash() {
  const opacity = useSharedValue(0);

  const trigger = React.useCallback(
    (damage: number) => {
      // Map damage to opacity: lerp between MIN and MAX based on damage
      const t = Math.min(damage / MAX_DAMAGE_THRESHOLD, 1);
      const peakOpacity = MIN_OPACITY + t * (MAX_OPACITY - MIN_OPACITY);

      // Jump to peak opacity, then fade out
      opacity.value = peakOpacity;
      opacity.value = withTiming(0, {
        duration: FADE_DURATION_MS,
        easing: Easing.out(Easing.quad),
      });
    },
    [opacity],
  );

  // Register imperative trigger
  React.useEffect(() => {
    _triggerFn = trigger;
    return () => {
      _triggerFn = null;
    };
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.overlay, animatedStyle]}
      pointerEvents="none"
    />
  );
}

/**
 * Imperative API: trigger a damage flash from anywhere.
 * Call DamageFlash.trigger(damage) when the player takes a hit.
 *
 * @param damage - Amount of damage taken. Scales flash intensity.
 */
DamageFlash.trigger = (damage: number) => {
  _triggerFn?.(damage);
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#CC0000',
  },
});
