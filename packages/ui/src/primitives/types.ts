/**
 * Platform-agnostic type definitions for UI components
 *
 * These types define the interface that both web and native
 * implementations must conform to.
 */

import type { ReactNode } from 'react';

/**
 * Base props shared by all components
 */
export interface BaseProps {
  /** Test ID for automated testing */
  testID?: string;
  /** Children elements */
  children?: ReactNode;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Props for pressable components
 */
export interface PressableProps {
  /** Called when the component is pressed */
  onPress?: () => void;
  /** Called when press begins */
  onPressIn?: () => void;
  /** Called when press ends */
  onPressOut?: () => void;
}

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

/**
 * Button size types
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button props interface
 */
export interface ButtonProps extends BaseProps, DisableableProps, PressableProps {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Icon to show before text */
  leftIcon?: ReactNode;
  /** Icon to show after text */
  rightIcon?: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Card props interface
 */
export interface CardProps extends BaseProps {
  /** Card variant */
  variant?: 'elevated' | 'outlined' | 'filled';
  /** Optional padding override */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Press handler for interactive cards */
  onPress?: () => void;
}

/**
 * Text variant types
 */
export type TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headingLarge'
  | 'headingMedium'
  | 'headingSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'code';

/**
 * Text color types
 */
export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'muted' | 'inverse' | 'link' | 'error' | 'success' | 'warning';

/**
 * Text alignment
 */
export type TextAlign = 'left' | 'center' | 'right';

/**
 * Text props interface
 */
export interface TextProps extends BaseProps {
  /** Typography variant */
  variant?: TextVariant;
  /** Text color */
  color?: TextColor;
  /** Text alignment */
  align?: TextAlign;
  /** Number of lines before truncating (0 = no limit) */
  numberOfLines?: number;
  /** Whether text should be selectable */
  selectable?: boolean;
}

/**
 * Input type variants
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';

/**
 * Input props interface
 */
export interface InputProps extends BaseProps, DisableableProps {
  /** Input value */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Input type */
  type?: InputType;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Required field */
  required?: boolean;
  /** Read only */
  readOnly?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Max length */
  maxLength?: number;
  /** Change handler */
  onChangeText?: (text: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Submit handler */
  onSubmitEditing?: () => void;
}

/**
 * Modal/Sheet side for sliding panels
 */
export type SheetSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Modal/Sheet props interface
 */
export interface ModalProps extends BaseProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal description */
  description?: string;
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
}

/**
 * Sheet props (extends Modal for side panels)
 */
export interface SheetProps extends ModalProps {
  /** Side the sheet slides in from */
  side?: SheetSide;
}

/**
 * Loading spinner size
 */
export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Loading spinner props
 */
export interface SpinnerProps extends BaseProps {
  /** Spinner size */
  size?: SpinnerSize;
  /** Custom color */
  color?: string;
  /** Loading label for accessibility */
  label?: string;
}
