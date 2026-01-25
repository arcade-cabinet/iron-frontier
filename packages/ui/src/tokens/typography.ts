/**
 * Iron Frontier Typography System
 *
 * Font families, sizes, weights, and line heights for
 * consistent text styling across platforms.
 */

/**
 * Font families
 * - Display: Western-style decorative (fallback to serif)
 * - Body: Clean readable sans-serif
 * - Mono: Mechanical/typewriter feel
 */
export const fontFamilies = {
  display: [
    'Rye',
    'Playfair Display',
    'Georgia',
    'Times New Roman',
    'serif',
  ].join(', '),
  body: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ].join(', '),
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
  ].join(', '),
} as const;

/**
 * Font sizes in pixels
 */
export const fontSizes = {
  /** 10px - tiny labels */
  xs: 10,
  /** 12px - small text */
  sm: 12,
  /** 14px - body small */
  base: 14,
  /** 16px - body */
  md: 16,
  /** 18px - body large */
  lg: 18,
  /** 20px - heading small */
  xl: 20,
  /** 24px - heading */
  '2xl': 24,
  /** 30px - heading large */
  '3xl': 30,
  /** 36px - display small */
  '4xl': 36,
  /** 48px - display */
  '5xl': 48,
  /** 60px - display large */
  '6xl': 60,
  /** 72px - hero */
  '7xl': 72,
  /** 96px - hero large */
  '8xl': 96,
} as const;

/**
 * Font weights
 */
export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

/**
 * Line heights as multipliers
 */
export const lineHeights = {
  /** No extra spacing */
  none: 1,
  /** Tight - headings */
  tight: 1.25,
  /** Snug - large text */
  snug: 1.375,
  /** Normal - body text */
  normal: 1.5,
  /** Relaxed - small text */
  relaxed: 1.625,
  /** Loose - tiny text */
  loose: 2,
} as const;

/**
 * Letter spacing in em units
 */
export const letterSpacing = {
  tighter: -0.05,
  tight: -0.025,
  normal: 0,
  wide: 0.025,
  wider: 0.05,
  widest: 0.1,
} as const;

/**
 * Pre-composed typography styles
 */
export const textStyles = {
  // Display styles (western headers)
  displayLarge: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  displayMedium: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  displaySmall: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  },

  // Heading styles
  headingLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.normal,
  },
  headingMedium: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },
  headingSmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },

  // Body styles
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  bodyMedium: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Label styles
  labelLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  },
  labelMedium: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  },
  labelSmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wider,
  },

  // Mono/mechanical styles
  code: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacing.normal,
  },
} as const;

export type FontSizeToken = keyof typeof fontSizes;
export type FontWeightToken = keyof typeof fontWeights;
export type LineHeightToken = keyof typeof lineHeights;
export type TextStyleToken = keyof typeof textStyles;
