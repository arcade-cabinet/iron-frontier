/**
 * React Native Card Component
 *
 * A container component for grouping related content.
 */

import * as React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type PressableProps,
} from 'react-native';
import type { CardProps } from '../primitives/types';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';

/**
 * Card variant configurations
 */
const variantStyles: Record<CardProps['variant'] & string, ViewStyle> = {
  elevated: {
    backgroundColor: colors.parchment[50],
    shadowColor: colors.obsidian[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    backgroundColor: colors.parchment[50],
    borderWidth: 2,
    borderColor: colors.leather[300],
  },
  filled: {
    backgroundColor: colors.parchment[100],
  },
};

/**
 * Padding configurations
 */
const paddingStyles: Record<string, number> = {
  none: 0,
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[6],
};

export interface NativeCardProps extends Omit<CardProps, 'onPress'> {
  /** Additional style for the card */
  style?: ViewStyle;
  /** Press handler for interactive cards */
  onPress?: () => void;
}

/**
 * Card component for React Native
 */
export const Card: React.FC<NativeCardProps> = ({
  variant = 'elevated',
  padding = 'md',
  onPress,
  children,
  style,
  testID,
  ...props
}) => {
  const [pressed, setPressed] = React.useState(false);
  const isInteractive = !!onPress;

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...variantStyles[variant],
    padding: paddingStyles[padding],
    transform: pressed ? [{ scale: 0.99 }] : [{ scale: 1 }],
  };

  if (isInteractive) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[containerStyle, style]}
        testID={testID}
        accessibilityRole="button"
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[containerStyle, style]} testID={testID}>
      {children}
    </View>
  );
};

/**
 * Card Header component
 */
export const CardHeader: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => (
  <View style={[styles.header, style]}>{children}</View>
);

/**
 * Card Title component
 */
export const CardTitle: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => (
  <View style={style}>
    {typeof children === 'string' ? (
      <View style={styles.titleText}>
        {/* Note: Would use Text component here in real implementation */}
      </View>
    ) : (
      children
    )}
  </View>
);

/**
 * Card Content component
 */
export const CardContent: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => (
  <View style={style}>{children}</View>
);

/**
 * Card Footer component
 */
export const CardFooter: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  header: {
    gap: spacing[1],
  },
  titleText: {
    // Typography would be applied here
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingTop: spacing[4],
  },
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
