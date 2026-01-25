/**
 * React Native Text Component
 *
 * Typography component with pre-defined variants.
 */

import * as React from 'react';
import {
  Text as RNText,
  StyleSheet,
  type TextStyle,
  type TextProps as RNTextProps,
} from 'react-native';
import type { TextProps, TextVariant, TextColor } from '../primitives/types';
import { colors } from '../tokens/colors';
import { fontSizes, fontWeights, lineHeights } from '../tokens/typography';

/**
 * Text variant style configurations
 */
const variantStyles: Record<TextVariant, TextStyle> = {
  displayLarge: {
    fontSize: fontSizes['5xl'],
    fontWeight: String(fontWeights.bold) as TextStyle['fontWeight'],
    lineHeight: fontSizes['5xl'] * lineHeights.tight,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: fontSizes['4xl'],
    fontWeight: String(fontWeights.bold) as TextStyle['fontWeight'],
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontSize: fontSizes['3xl'],
    fontWeight: String(fontWeights.semibold) as TextStyle['fontWeight'],
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
  },
  headingLarge: {
    fontSize: fontSizes['2xl'],
    fontWeight: String(fontWeights.semibold) as TextStyle['fontWeight'],
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  },
  headingMedium: {
    fontSize: fontSizes.xl,
    fontWeight: String(fontWeights.semibold) as TextStyle['fontWeight'],
    lineHeight: fontSizes.xl * lineHeights.snug,
  },
  headingSmall: {
    fontSize: fontSizes.lg,
    fontWeight: String(fontWeights.medium) as TextStyle['fontWeight'],
    lineHeight: fontSizes.lg * lineHeights.snug,
  },
  bodyLarge: {
    fontSize: fontSizes.md,
    fontWeight: String(fontWeights.normal) as TextStyle['fontWeight'],
    lineHeight: fontSizes.md * lineHeights.relaxed,
  },
  bodyMedium: {
    fontSize: fontSizes.base,
    fontWeight: String(fontWeights.normal) as TextStyle['fontWeight'],
    lineHeight: fontSizes.base * lineHeights.normal,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: String(fontWeights.normal) as TextStyle['fontWeight'],
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  labelLarge: {
    fontSize: fontSizes.base,
    fontWeight: String(fontWeights.medium) as TextStyle['fontWeight'],
    lineHeight: fontSizes.base * lineHeights.normal,
    letterSpacing: 0.5,
  },
  labelMedium: {
    fontSize: fontSizes.sm,
    fontWeight: String(fontWeights.medium) as TextStyle['fontWeight'],
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: fontSizes.xs,
    fontWeight: String(fontWeights.medium) as TextStyle['fontWeight'],
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  code: {
    fontSize: fontSizes.sm,
    fontWeight: String(fontWeights.normal) as TextStyle['fontWeight'],
    lineHeight: fontSizes.sm * lineHeights.relaxed,
    fontFamily: 'monospace',
  },
};

/**
 * Text color configurations
 */
const colorStyles: Record<TextColor, string> = {
  primary: colors.obsidian[950],
  secondary: colors.obsidian[700],
  tertiary: colors.obsidian[500],
  muted: colors.obsidian[400],
  inverse: colors.parchment[50],
  link: colors.bronze[600],
  error: colors.crimson[600],
  success: colors.sage[600],
  warning: colors.amber[600],
};

/**
 * Text alignment configurations
 */
const alignStyles: Record<string, TextStyle['textAlign']> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

export interface NativeTextProps extends TextProps, Omit<RNTextProps, 'children'> {
  /** Additional style */
  style?: TextStyle;
}

/**
 * Text component for React Native
 */
export const Text: React.FC<NativeTextProps> = ({
  variant = 'bodyMedium',
  color = 'primary',
  align = 'left',
  numberOfLines,
  selectable = true,
  children,
  style,
  testID,
  ...props
}) => {
  const textStyle: TextStyle = {
    ...variantStyles[variant],
    color: colorStyles[color],
    textAlign: alignStyles[align],
  };

  return (
    <RNText
      numberOfLines={numberOfLines}
      selectable={selectable}
      style={[textStyle, style]}
      testID={testID}
      {...props}
    >
      {children}
    </RNText>
  );
};

Text.displayName = 'Text';
