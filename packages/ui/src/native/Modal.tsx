/**
 * React Native Modal/Sheet Component
 *
 * Overlay components for dialogs and sliding panels.
 */

import * as React from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  Modal as RNModal,
  type ModalProps as RNModalProps,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import type { ModalProps, SheetProps, SheetSide } from '../primitives/types';
import { colors } from '../tokens/colors';
import { radius } from '../tokens/radius';
import { spacing } from '../tokens/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Close button component
 */
const CloseButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <Pressable
    onPress={onPress}
    style={styles.closeButton}
    accessibilityLabel="Close"
    accessibilityRole="button"
  >
    <Text style={styles.closeIcon}>x</Text>
  </Pressable>
);

/**
 * Modal Header component
 */
export const ModalHeader: React.FC<{
  title?: string;
  description?: string;
  style?: ViewStyle;
}> = ({ title, description, style }) => {
  if (!title && !description) return null;

  return (
    <View style={[styles.header, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
};

export interface NativeModalProps
  extends ModalProps,
    Omit<RNModalProps, 'visible' | 'onRequestClose'> {
  /** Container style */
  containerStyle?: ViewStyle;
  /** Content style */
  contentStyle?: ViewStyle;
}

/**
 * Modal component for React Native
 */
export const Modal: React.FC<NativeModalProps> = ({
  open,
  onClose,
  title,
  description,
  closeOnOverlayClick = true,
  showCloseButton = true,
  children,
  containerStyle,
  contentStyle,
  testID,
  ...props
}) => {
  return (
    <RNModal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
      {...props}
    >
      <Pressable
        style={[styles.overlay, containerStyle]}
        onPress={closeOnOverlayClick ? onClose : undefined}
      >
        <Pressable style={[styles.modalContent, contentStyle]} onPress={(e) => e.stopPropagation()}>
          {showCloseButton && <CloseButton onPress={onClose} />}
          <ModalHeader title={title} description={description} />
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

export interface NativeSheetProps
  extends SheetProps,
    Omit<RNModalProps, 'visible' | 'onRequestClose'> {
  /** Container style */
  containerStyle?: ViewStyle;
  /** Content style */
  contentStyle?: ViewStyle;
}

/**
 * Get sheet position styles based on side
 */
const getSheetPositionStyle = (side: SheetSide): ViewStyle => {
  switch (side) {
    case 'top':
      return {
        top: 0,
        left: 0,
        right: 0,
        borderBottomLeftRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
        maxHeight: SCREEN_HEIGHT * 0.85,
      };
    case 'bottom':
      return {
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        maxHeight: SCREEN_HEIGHT * 0.85,
      };
    case 'left':
      return {
        top: 0,
        bottom: 0,
        left: 0,
        borderTopRightRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
        width: SCREEN_WIDTH * 0.75,
        maxWidth: 320,
      };
    case 'right':
    default:
      return {
        top: 0,
        bottom: 0,
        right: 0,
        borderTopLeftRadius: radius.lg,
        borderBottomLeftRadius: radius.lg,
        width: SCREEN_WIDTH * 0.75,
        maxWidth: 320,
      };
  }
};

/**
 * Sheet component for sliding panels
 */
export const Sheet: React.FC<NativeSheetProps> = ({
  open,
  onClose,
  side = 'right',
  title,
  description,
  closeOnOverlayClick = true,
  showCloseButton = true,
  children,
  containerStyle,
  contentStyle,
  testID,
  ...props
}) => {
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [open, slideAnim]);

  const sheetPositionStyle = getSheetPositionStyle(side);

  return (
    <RNModal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
      {...props}
    >
      <Pressable
        style={[styles.overlay, containerStyle]}
        onPress={closeOnOverlayClick ? onClose : undefined}
      >
        <Pressable
          style={[styles.sheetContent, sheetPositionStyle, contentStyle]}
          onPress={(e) => e.stopPropagation()}
        >
          {showCloseButton && <CloseButton onPress={onClose} />}
          <ModalHeader title={title} description={description} />
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 30, 28, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.parchment[50],
    borderRadius: radius.lg,
    padding: spacing[6],
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: colors.obsidian[950],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  sheetContent: {
    position: 'absolute',
    backgroundColor: colors.parchment[50],
    padding: spacing[6],
    shadowColor: colors.obsidian[950],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    zIndex: 1,
    padding: spacing[1],
  },
  closeIcon: {
    fontSize: 20,
    color: colors.obsidian[600],
    fontWeight: '300',
  },
  header: {
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.obsidian[900],
  },
  description: {
    marginTop: spacing[1],
    fontSize: 14,
    color: colors.obsidian[600],
  },
});

Modal.displayName = 'Modal';
Sheet.displayName = 'Sheet';
ModalHeader.displayName = 'ModalHeader';
