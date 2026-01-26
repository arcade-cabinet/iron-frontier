/**
 * React Native Input Component
 *
 * Form input component with label, helper text, and error states.
 */

import * as React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import type { InputProps, InputType } from '../primitives/types';
import { colors } from '../tokens/colors';
import { radius } from '../tokens/radius';
import { spacing } from '../tokens/spacing';
import { fontSizes } from '../tokens/typography';

/**
 * Map InputType to React Native keyboardType
 */
const keyboardTypeMap: Record<InputType, TextInputProps['keyboardType']> = {
  text: 'default',
  password: 'default',
  email: 'email-address',
  number: 'numeric',
  tel: 'phone-pad',
  url: 'url',
};

export interface NativeInputProps extends Omit<InputProps, 'onBlur' | 'onFocus'> {
  /** Container style */
  containerStyle?: ViewStyle;
  /** Input style override */
  inputStyle?: TextStyle;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
}

/**
 * Input component for React Native
 */
export const Input: React.FC<NativeInputProps> = ({
  value,
  defaultValue,
  placeholder,
  type = 'text',
  label,
  helperText,
  error,
  errorMessage,
  required,
  disabled,
  readOnly,
  autoFocus,
  maxLength,
  onChangeText,
  onBlur,
  onFocus,
  onSubmitEditing,
  containerStyle,
  inputStyle,
  testID,
  ...props
}) => {
  const [focused, setFocused] = React.useState(false);

  const hasError = error || !!errorMessage;

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  const inputContainerStyle: ViewStyle = {
    ...styles.inputContainer,
    borderColor: hasError
      ? colors.crimson[500]
      : focused
        ? colors.bronze[500]
        : colors.leather[300],
    backgroundColor: disabled
      ? colors.parchment[200]
      : readOnly
        ? colors.parchment[100]
        : colors.parchment[50],
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={inputContainerStyle}>
        <TextInput
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          placeholderTextColor={colors.obsidian[400]}
          keyboardType={keyboardTypeMap[type]}
          secureTextEntry={type === 'password'}
          editable={!disabled && !readOnly}
          autoFocus={autoFocus}
          maxLength={maxLength}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          style={[styles.input, inputStyle]}
          testID={testID}
          accessibilityLabel={label}
          accessibilityState={{
            disabled,
          }}
          {...props}
        />
      </View>

      {hasError && errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.obsidian[700],
  },
  labelDisabled: {
    color: colors.obsidian[500],
  },
  required: {
    color: colors.crimson[500],
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  input: {
    height: 40,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: fontSizes.sm,
    color: colors.obsidian[900],
  },
  helperText: {
    fontSize: fontSizes.xs,
    color: colors.obsidian[500],
  },
  errorText: {
    fontSize: fontSizes.xs,
    color: colors.crimson[600],
  },
});

Input.displayName = 'Input';
