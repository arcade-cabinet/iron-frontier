/**
 * React Native Spinner Component
 *
 * Loading indicator with western styling.
 */

import * as React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import type { SpinnerProps, SpinnerSize } from '../primitives/types';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';

/**
 * Size configurations
 */
const sizeMap: Record<SpinnerSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
};

export interface NativeSpinnerProps extends SpinnerProps {
  /** Container style */
  style?: ViewStyle;
}

/**
 * Spinner component for React Native
 */
export const Spinner: React.FC<NativeSpinnerProps> = ({
  size = 'md',
  color = colors.rust[600],
  label,
  style,
  testID,
}) => {
  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={label || 'Loading'}
    >
      <ActivityIndicator
        size={sizeMap[size]}
        color={color}
      />
    </View>
  );
};

/**
 * Full-screen loading overlay
 */
export const LoadingOverlay: React.FC<{
  visible: boolean;
  label?: string;
  style?: ViewStyle;
}> = ({ visible, label = 'Loading...', style }) => {
  if (!visible) return null;

  return (
    <View
      style={[styles.overlay, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={colors.rust[600]} />
        <Text style={styles.overlayLabel}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 251, 247, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  overlayContent: {
    alignItems: 'center',
    gap: spacing[3],
  },
  overlayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.obsidian[700],
  },
});

Spinner.displayName = 'Spinner';
LoadingOverlay.displayName = 'LoadingOverlay';
