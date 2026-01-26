/**
 * React Native Button Component
 *
 * A pressable button with western/steampunk styling for mobile.
 */

import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { ButtonProps, ButtonSize, ButtonVariant } from '../primitives/types';
import { colors } from '../tokens/colors';
import { radius } from '../tokens/radius';
import { spacing } from '../tokens/spacing';

/**
 * Button color configurations by variant
 */
const variantColors: Record<ButtonVariant, { bg: string; bgPressed: string; text: string }> = {
  primary: {
    bg: colors.rust[600],
    bgPressed: colors.rust[700],
    text: colors.white,
  },
  secondary: {
    bg: colors.bronze[500],
    bgPressed: colors.bronze[600],
    text: colors.white,
  },
  danger: {
    bg: colors.crimson[600],
    bgPressed: colors.crimson[700],
    text: colors.white,
  },
  ghost: {
    bg: 'transparent',
    bgPressed: colors.parchment[200],
    text: colors.obsidian[700],
  },
  outline: {
    bg: 'transparent',
    bgPressed: colors.parchment[100],
    text: colors.obsidian[700],
  },
};

/**
 * Button size configurations
 */
const sizeStyles: Record<
  ButtonSize,
  { height: number; paddingHorizontal: number; fontSize: number; iconSize: number }
> = {
  sm: { height: 32, paddingHorizontal: spacing[3], fontSize: 13, iconSize: 14 },
  md: { height: 40, paddingHorizontal: spacing[4], fontSize: 14, iconSize: 16 },
  lg: { height: 48, paddingHorizontal: spacing[6], fontSize: 16, iconSize: 20 },
};

export interface NativeButtonProps
  extends Omit<ButtonProps, 'onPress' | 'onPressIn' | 'onPressOut'> {
  /** Additional style for the button container */
  style?: ViewStyle;
  /** Additional style for the button text */
  textStyle?: TextStyle;
  /** Called when the component is pressed */
  onPress?: () => void;
  /** Called when press begins */
  onPressIn?: () => void;
  /** Called when press ends */
  onPressOut?: () => void;
}

/**
 * Button component for React Native
 */
export const Button: React.FC<NativeButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  onPress,
  onPressIn,
  onPressOut,
  style,
  textStyle,
  testID,
  ...props
}) => {
  const [pressed, setPressed] = React.useState(false);

  const colorConfig = variantColors[variant];
  const sizeConfig = sizeStyles[size];

  const handlePressIn = () => {
    setPressed(true);
    onPressIn?.();
  };

  const handlePressOut = () => {
    setPressed(false);
    onPressOut?.();
  };

  const containerStyle: ViewStyle = {
    ...styles.container,
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    backgroundColor: pressed ? colorConfig.bgPressed : colorConfig.bg,
    borderWidth: variant === 'outline' ? 2 : 0,
    borderColor: variant === 'outline' ? colors.leather[400] : undefined,
    opacity: disabled ? 0.5 : 1,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
  };

  const labelStyle: TextStyle = {
    ...styles.label,
    fontSize: sizeConfig.fontSize,
    color: colorConfig.text,
  };

  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[containerStyle, style]}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colorConfig.text} />
      ) : (
        <>
          {leftIcon}
          {typeof children === 'string' ? (
            <Text style={[labelStyle, textStyle]}>{children}</Text>
          ) : (
            children
          )}
          {rightIcon}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: radius.md,
  },
  label: {
    fontWeight: '500',
  },
});

Button.displayName = 'Button';
