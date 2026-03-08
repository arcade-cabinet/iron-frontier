/**
 * usePlatform -- Platform and input-capability detection hook.
 *
 * Distinguishes native iOS/Android from web, and further separates
 * mobile-web (touch-only) from desktop-web (mouse/trackpad).  This
 * drives decisions like whether to render touch controls, disable
 * anti-aliasing, or show keyboard prompts.
 *
 * @module hooks/usePlatform
 */

import { Platform } from 'react-native';

export interface PlatformInfo {
  /** Running inside a web browser (Expo Web / Metro Web). */
  isWeb: boolean;
  /** Running as a native iOS or Android app. */
  isNative: boolean;
  /** Running on iOS (native). */
  isIOS: boolean;
  /** Running on Android (native). */
  isAndroid: boolean;
  /** Device has a touchscreen (native devices, tablets, phones, Quest). */
  isTouchDevice: boolean;
  /** Device has a fine pointer (mouse or trackpad). */
  hasFinePointer: boolean;
  /** Web browser on a touch-only device (phone or tablet in browser). */
  isMobileWeb: boolean;
}

/**
 * Detect whether the current web environment is touch-capable.
 * Always true for native platforms.
 */
function detectTouchDevice(): boolean {
  if (Platform.OS !== 'web') return true;
  if (typeof globalThis === 'undefined') return false;
  return (
    'ontouchstart' in globalThis ||
    ((globalThis as any).navigator?.maxTouchPoints ?? 0) > 0
  );
}

/**
 * Detect whether the current web environment has a fine pointer (mouse).
 * Always false for native platforms.
 */
function detectFinePointer(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof globalThis === 'undefined' || !globalThis.matchMedia) return false;
  return globalThis.matchMedia('(pointer: fine)').matches;
}

export function usePlatform(): PlatformInfo {
  const isTouchDevice = detectTouchDevice();
  const hasFinePointer = detectFinePointer();

  return {
    isWeb: Platform.OS === 'web',
    isNative: Platform.OS !== 'web',
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isTouchDevice,
    hasFinePointer,
    isMobileWeb: Platform.OS === 'web' && isTouchDevice && !hasFinePointer,
  };
}
