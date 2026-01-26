/**
 * Iron Frontier Design Tokens
 *
 * Platform-agnostic design tokens for consistent styling
 * across web and mobile applications.
 */

export * from './animation';
export * from './colors';
export * from './radius';
export * from './shadows';
export * from './spacing';
export * from './typography';

import { durations, easings, transitions } from './animation';
// Re-export everything as a theme object for convenience
import { colors, semanticColors } from './colors';
import { componentRadius, radius } from './radius';
import { componentShadows, shadows } from './shadows';
import { namedSpacing, spacing } from './spacing';
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  letterSpacing,
  lineHeights,
  textStyles,
} from './typography';

/**
 * Complete theme object with all design tokens
 */
export const theme = {
  colors,
  semanticColors,
  spacing,
  namedSpacing,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  textStyles,
  radius,
  componentRadius,
  shadows,
  componentShadows,
  durations,
  easings,
  transitions,
} as const;

export type Theme = typeof theme;
