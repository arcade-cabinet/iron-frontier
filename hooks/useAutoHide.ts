/**
 * useAutoHide — Animated visibility hook for HUD elements.
 *
 * Returns a Reanimated shared value (0..1) that fades in when `visible`
 * becomes true, holds for `displayMs`, then fades out. Designed for
 * on-demand HUD elements like location names, gold counters, and
 * ammo displays that should only appear when relevant.
 *
 * @module hooks/useAutoHide
 */

import { useEffect, useRef } from 'react';
import {
  useSharedValue,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

export interface UseAutoHideOptions {
  /** Whether the element should currently be visible. */
  visible: boolean;
  /** Duration to hold at full opacity before fading out (ms). 0 = stay visible. */
  displayMs?: number;
  /** Fade-in duration (ms). Default 300. */
  fadeInMs?: number;
  /** Fade-out duration (ms). Default 500. */
  fadeOutMs?: number;
}

/**
 * Returns a shared value representing opacity (0..1).
 *
 * When `visible` flips to true, fades in over `fadeInMs`.
 * After `displayMs` at full opacity, fades out over `fadeOutMs`.
 * If `displayMs` is 0, the element stays visible until `visible` becomes false.
 */
export function useAutoHide({
  visible,
  displayMs = 3000,
  fadeInMs = 300,
  fadeOutMs = 500,
}: UseAutoHideOptions): SharedValue<number> {
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending hide timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (visible) {
      // Fade in
      opacity.value = withTiming(1, {
        duration: fadeInMs,
        easing: Easing.out(Easing.quad),
      });

      // Schedule fade out (if displayMs > 0)
      if (displayMs > 0) {
        timerRef.current = setTimeout(() => {
          opacity.value = withTiming(0, {
            duration: fadeOutMs,
            easing: Easing.in(Easing.quad),
          });
          timerRef.current = null;
        }, fadeInMs + displayMs);
      }
    } else {
      // Fade out immediately
      opacity.value = withTiming(0, {
        duration: fadeOutMs,
        easing: Easing.in(Easing.quad),
      });
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, displayMs, fadeInMs, fadeOutMs, opacity]);

  return opacity;
}

/**
 * useShowOnChange — Shows an element briefly whenever a value changes.
 *
 * Useful for things like XP gains, gold changes, location transitions.
 * The element fades in when `value` changes, displays for `displayMs`,
 * then fades out.
 */
export function useShowOnChange<T>(
  value: T,
  options?: Omit<UseAutoHideOptions, 'visible'>,
): SharedValue<number> {
  const opacity = useSharedValue(0);
  const isFirstRender = useRef(true);
  const prevValue = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fadeInMs = options?.fadeInMs ?? 300;
  const fadeOutMs = options?.fadeOutMs ?? 500;
  const displayMs = options?.displayMs ?? 3000;

  useEffect(() => {
    // Skip the first render — don't flash on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValue.current = value;
      return;
    }

    // Only trigger when value actually changes
    if (value === prevValue.current) return;
    prevValue.current = value;

    // Clear any pending timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Fade in
    opacity.value = withTiming(1, {
      duration: fadeInMs,
      easing: Easing.out(Easing.quad),
    });

    // Schedule fade out
    timerRef.current = setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: fadeOutMs,
        easing: Easing.in(Easing.quad),
      });
      timerRef.current = null;
    }, fadeInMs + displayMs);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, fadeInMs, fadeOutMs, displayMs, opacity]);

  return opacity;
}
