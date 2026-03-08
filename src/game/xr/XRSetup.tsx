/**
 * XRSetup — WebXR/VR integration wrapper for the R3F scene.
 *
 * Creates the XR store singleton, provides the <XR> context wrapper,
 * and exports xrStore for external access (e.g. EnterVRButton, XRControllerProvider).
 *
 * Uses @react-three/xr v6 API:
 *   - createXRStore() for the module-level store singleton
 *   - <XR store={xrStore}> as the context wrapper
 *   - <XROrigin> for tracking space origin
 *
 * On native iOS/Android, all XR functionality is disabled — the component
 * simply renders children without the XR context.
 */

import type React from 'react';
import { Platform } from 'react-native';

// @react-three/xr uses the browser WebXR API — only import on web.
// On native the module import is skipped to avoid bundling WebXR code.
const xrModule = Platform.OS === 'web' ? require('@react-three/xr') : null;

// ---------------------------------------------------------------------------
// XR Store singleton
// ---------------------------------------------------------------------------

/**
 * Module-level XR store. Shared across the app so that EnterVRButton,
 * XRControllerProvider, and any other XR-aware code can access it.
 * null on native platforms.
 */
export const xrStore = xrModule
  ? xrModule.createXRStore({
      // Disable the automatic offer-session browser prompt — we control entry
      // via the EnterVRButton component.
      offerSession: false,
      // Emulate a Meta Quest 3 in development when WebXR is not natively available.
      // Disabled in production to avoid shipping the emulator bundle.
      emulate: typeof __DEV__ !== 'undefined' && __DEV__ ? 'metaQuest3' : undefined,
    })
  : null;

// ---------------------------------------------------------------------------
// XRSetup component (3D context — lives inside <Canvas>)
// ---------------------------------------------------------------------------

interface XRSetupProps {
  children?: React.ReactNode;
}

/**
 * Wraps children in the <XR> context on web, or passes them through on native.
 *
 * Usage:
 * ```tsx
 * <Canvas>
 *   <XRSetup>
 *     <PhysicsProvider>...</PhysicsProvider>
 *   </XRSetup>
 * </Canvas>
 * ```
 */
declare const __DEV__: boolean;

export function XRSetup({ children }: XRSetupProps) {
  if (Platform.OS !== 'web' || !xrModule || !xrStore) {
    return <>{children}</>;
  }

  const { XR, XROrigin } = xrModule;

  return (
    <XR store={xrStore}>
      {/* XROrigin sets the player's feet position in the tracking space.
          Position can be overridden by the player controller for teleportation. */}
      <XROrigin />

      {children}
    </XR>
  );
}
