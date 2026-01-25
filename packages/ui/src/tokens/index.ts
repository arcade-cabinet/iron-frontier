/**
 * Iron Frontier Design Tokens
 *
 * Platform-agnostic design tokens for consistent styling
 * across web and mobile applications.
 */

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './radius';
export * from './shadows';
export * from './animation';

// Re-export everything as a theme object for convenience
import { colors, semanticColors } from './colors';
import { spacing, namedSpacing } from './spacing';
import {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  textStyles,
} from './typography';
import { radius, componentRadius } from './radius';
import { shadows, componentShadows } from './shadows';
import { durations, easings, transitions } from './animation';

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
