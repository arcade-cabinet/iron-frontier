/**
 * useResponsive -- Responsive breakpoint hook for cross-platform layout.
 *
 * Returns device-class flags and a scale factor so UI components can
 * adapt their sizing/spacing for iPhone SE (375x667), iPad (1024x768),
 * desktop (1920x1080), and Quest 3 (landscape VR).
 *
 * @module hooks/useResponsive
 */

import { useWindowDimensions } from 'react-native';

export interface ResponsiveInfo {
  /** Phone-sized viewport (< 768 logical px wide). */
  isPhone: boolean;
  /** Tablet-sized viewport (768..1023 px wide). */
  isTablet: boolean;
  /** Desktop / large viewport (>= 1024 px wide). */
  isDesktop: boolean;
  /** Width > height. */
  isLandscape: boolean;
  /** Height > width. */
  isPortrait: boolean;
  /**
   * Scale factor relative to iPhone SE (375 px). Clamped to 1.5 so
   * elements never grow ridiculously large on 4K monitors.
   */
  safeScale: number;
  /** Current viewport width in logical pixels. */
  width: number;
  /** Current viewport height in logical pixels. */
  height: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  return {
    isPhone: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isLandscape: width > height,
    isPortrait: height > width,
    safeScale: Math.min(width / 375, 1.5),
    width,
    height,
  };
}
