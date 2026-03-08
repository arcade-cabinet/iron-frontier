// InputInitializer — Auto-detects platform and registers input providers
//
// Call initializeInput() once on mount to register all appropriate providers.
// Call teardownInput() (or the returned cleanup function) on unmount.
//
// Platform detection:
//   - 'desktop':  matchMedia('(pointer: fine)') — mouse/trackpad present
//   - 'mobile':   'ontouchstart' in window && maxTouchPoints > 0 && no fine pointer
//   - 'tablet':   touch + screen width >= 768 (coarse pointer only)
//   - 'xr':       navigator.xr exists with immersive-vr support
//
// Provider priorities (lower number = higher priority, merged last):
//   XR(0) > Keyboard/Mouse(1) > Touch(2) > Gamepad(3) > Gyro(4) > AI(5)

import { InputManager } from './InputManager';
import { KeyboardMouseProvider } from './providers/KeyboardMouseProvider';
import { TouchProvider } from './providers/TouchProvider';
import { GamepadProvider } from './providers/GamepadProvider';
import { GyroProvider } from './providers/GyroProvider';

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

export type Platform = 'desktop' | 'mobile' | 'tablet' | 'xr';

/**
 * Detect the current platform based on input capabilities.
 *
 * Uses matchMedia('(pointer: fine)') for desktop detection (same approach as
 * goats-in-hell's KeyboardMouseProvider.isAvailable). Falls back to touch
 * detection for mobile/tablet.
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'desktop';

  // Check for WebXR immersive support
  if ('xr' in navigator) {
    // We can't await isSessionSupported here (sync function), so we just
    // check the existence of the API. XR headsets also have fine pointers
    // for controllers, so we prioritise this check.
    // In practice, XR mode is opt-in — the XR provider would be registered
    // separately when entering immersive mode.
  }

  const hasFinePointer = window.matchMedia?.('(pointer: fine)')?.matches ?? false;
  const hasTouch = 'ontouchstart' in window && navigator.maxTouchPoints > 0;

  // React Native context: Platform.OS !== 'web'
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNPlatform = require('react-native').Platform;
    if (RNPlatform?.OS && RNPlatform.OS !== 'web') {
      // Native mobile (iOS/Android via Expo)
      return 'mobile';
    }
  } catch {
    // Not in a React Native context — continue with web detection
  }

  if (hasFinePointer) {
    // Desktop or laptop — even if it also has touch (touchscreen laptops),
    // the fine pointer indicates a primary mouse/trackpad.
    return 'desktop';
  }

  if (hasTouch) {
    // Distinguish tablet from phone by screen width
    const screenWidth = Math.min(window.innerWidth, window.innerHeight);
    // This is the narrower dimension — tablets are generally >= 768 logical px
    if (screenWidth >= 600) {
      return 'tablet';
    }
    return 'mobile';
  }

  // Fallback: assume desktop
  return 'desktop';
}

/**
 * Returns true if touch input is available on this device.
 * Useful for conditionally rendering the TouchOverlay.
 */
export function hasTouchCapability(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window && navigator.maxTouchPoints > 0;
}

/**
 * Returns true if this is a native mobile platform (not web).
 */
export function isNativeMobile(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNPlatform = require('react-native').Platform;
    return RNPlatform?.OS !== undefined && RNPlatform.OS !== 'web';
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Provider initialization
// ---------------------------------------------------------------------------

/**
 * Initialize all appropriate input providers based on platform detection.
 *
 * Registers providers with the InputManager singleton:
 * - KeyboardMouseProvider: always (desktops + laptops with touch screens)
 * - TouchProvider: when touch is available
 * - GamepadProvider: always (USB/Bluetooth gamepads work on all platforms)
 * - GyroProvider: on native mobile only (requires DeviceOrientation API)
 *
 * Returns a cleanup function that disposes all registered providers.
 */
export function initializeInput(): () => void {
  const manager = InputManager.getInstance();
  const platform = detectPlatform();
  const hasTouch = hasTouchCapability();
  const nativeMobile = isNativeMobile();

  // Track what we register so we can clean up
  const registeredNames: string[] = [];

  // --- Keyboard/Mouse (priority 1) ---
  // Always register — desktop users need it, and laptops with touch screens
  // still have a keyboard and trackpad.
  if (typeof document !== 'undefined') {
    try {
      const kbm = new KeyboardMouseProvider();
      manager.registerProvider(kbm);
      kbm.enable();
      registeredNames.push(kbm.name);
    } catch (e) {
      // Already registered (hot-reload scenario)
      if (!(e instanceof Error && e.message.includes('already registered'))) {
        throw e;
      }
    }
  }

  // --- Touch (priority 5 — already set in TouchProvider) ---
  if (hasTouch) {
    try {
      const touch = new TouchProvider();
      manager.registerProvider(touch);
      touch.enable();
      registeredNames.push(touch.name);
    } catch (e) {
      if (!(e instanceof Error && e.message.includes('already registered'))) {
        throw e;
      }
    }
  }

  // --- Gamepad (priority 8 — already set in GamepadProvider) ---
  // Always register — USB and Bluetooth gamepads work everywhere
  if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
    try {
      const gamepad = new GamepadProvider();
      manager.registerProvider(gamepad);
      gamepad.enable();
      registeredNames.push(gamepad.name);
    } catch (e) {
      if (!(e instanceof Error && e.message.includes('already registered'))) {
        throw e;
      }
    }
  }

  // --- Gyro (priority 3 — already set in GyroProvider) ---
  // Only on native mobile — web gyro requires HTTPS + user permission
  if (nativeMobile && GyroProvider.isSupported()) {
    try {
      const gyro = new GyroProvider();
      manager.registerProvider(gyro);
      gyro.enable();
      registeredNames.push(gyro.name);
    } catch (e) {
      if (!(e instanceof Error && e.message.includes('already registered'))) {
        throw e;
      }
    }
  }

  if (__DEV__) {
    console.log(
      `[InputInitializer] Platform: ${platform}, providers: [${registeredNames.join(', ')}]`,
    );
  }

  // Return cleanup function
  return () => {
    teardownInput();
  };
}

/**
 * Dispose all providers and reset the InputManager singleton.
 */
export function teardownInput(): void {
  InputManager.resetInstance();
}

// Declare __DEV__ for TypeScript (set by Metro/Expo bundler)
declare const __DEV__: boolean;
