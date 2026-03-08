/**
 * useXRMode — Hooks for detecting the current XR session mode.
 *
 * - `useXRMode()` reads the live XR session from `@react-three/xr`.
 *   Must be called inside the `<XR>` provider (i.e. inside the R3F Canvas).
 * - `useXRModeOutsideCanvas()` uses platform detection for components
 *   outside the Canvas tree (e.g. HUD overlays, settings).
 *
 * Both return the same shape: { isVR, isAR, isDesktop, isMobile }.
 */

import { Platform } from 'react-native';

// Conditionally import @react-three/xr — only available on web
const xrModule = Platform.OS === 'web' ? require('@react-three/xr') : null;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface XRModeState {
  /** True when an immersive-vr session is active */
  isVR: boolean;
  /** True when an immersive-ar session is active */
  isAR: boolean;
  /** True when running on desktop (keyboard + mouse) without XR */
  isDesktop: boolean;
  /** True when running on a mobile/touch device without XR */
  isMobile: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detect whether the current device is touch-primary.
 * Used as the fallback when no XR session is active.
 */
function isTouchPrimary(): boolean {
  if (Platform.OS !== 'web') return true;
  if (
    typeof window !== 'undefined' &&
    'ontouchstart' in window &&
    navigator.maxTouchPoints > 0
  ) {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Inside Canvas: live XR session detection
// ---------------------------------------------------------------------------

/**
 * Detect the current XR session mode from the live XR runtime.
 *
 * When an XR session is active, `useXR(xr => xr.mode)` returns
 * `'immersive-vr'` or `'immersive-ar'`. When no session is active
 * it returns `null`, and we fall back to platform detection.
 *
 * Must be called inside the `<XR>` provider tree (inside Canvas).
 */
export function useXRMode(): XRModeState {
  // On native or if xr module is unavailable, fall back to platform detection
  if (!xrModule) {
    const touch = isTouchPrimary();
    return {
      isVR: false,
      isAR: false,
      isDesktop: !touch,
      isMobile: touch,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- guarded by module check
  const xrMode = xrModule.useXR((xr: { mode: string | null }) => xr.mode);

  const isVR = xrMode === 'immersive-vr';
  const isAR = xrMode === 'immersive-ar';
  const touch = isTouchPrimary();

  return {
    isVR,
    isAR,
    isDesktop: !isVR && !isAR && !touch,
    isMobile: !isVR && !isAR && touch,
  };
}

// ---------------------------------------------------------------------------
// Outside Canvas: platform detection fallback
// ---------------------------------------------------------------------------

/**
 * Detect XR mode for components outside the Canvas tree.
 *
 * Cannot read the live XR session (no <XR> provider context).
 * Falls back to xrStore session state and platform detection.
 */
export function useXRModeOutsideCanvas(): XRModeState {
  const touch = isTouchPrimary();

  // Try to read from xrStore if available
  if (xrModule) {
    try {
      // Import xrStore from XRSetup — dynamic to avoid circular deps
      const { xrStore } = require('./XRSetup');
      if (xrStore) {
        const state = xrStore.getState();
        const session = state?.session;
        if (session) {
          // XR session is active — determine mode from session
          const mode =
            (session as { mode?: string }).mode ??
            (state?.mode as string | null);
          return {
            isVR: mode === 'immersive-vr',
            isAR: mode === 'immersive-ar',
            isDesktop: false,
            isMobile: false,
          };
        }
      }
    } catch {
      // xrStore not available — fall through to platform detection
    }
  }

  return {
    isVR: false,
    isAR: false,
    isDesktop: !touch,
    isMobile: touch,
  };
}
