/**
 * Web Input Component
 *
 * Form input component with label, helper text, and error states.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, generateId } from '../primitives/utils';
import type { InputProps } from '../primitives/types';

/**
 * Input container variants
 */
const inputContainerVariants = cva('flex flex-col gap-1.5', {
  variants: {
    fullWidth: {
      true: 'w-full',
      false: 'w-auto',
    },
  },
  defaultVariants: {
    fullWidth: true,
  },
});

/**
 * Input field variants
 */
const inputVariants = cva(
  [
    // Base styles
    'w-full rounded-md px-3 py-2',
    'text-sm text-obsidian-900 placeholder:text-obsidian-400',
    'bg-parchment-50 border-2 border-leather-300',
    'transition-all duration-150 ease-out',
    'outline-none',

    // Focus states
    'focus:border-bronze-500 focus:ring-2 focus:ring-bronze-500/20',

    // Disabled states
    'disabled:bg-parchment-200 disabled:text-obsidian-500 disabled:cursor-not-allowed',

    // Read-only states
    'read-only:bg-parchment-100',
  ].join(' '),
  {
    variants: {
      error: {
        true: 'border-crimson-500 focus:border-crimson-500 focus:ring-crimson-500/20',
        false: '',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      error: false,
      size: 'md',
    },
  }
);

export type WebInputProps = Omit<InputProps, 'type'> &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> &
  VariantProps<typeof inputVariants> & {
    /** Input type */
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
    /** Full width */
    fullWidth?: boolean;
    /** Native onChange handler */
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  };

/**
 * Input component for web platform
 */
export const Input = React.forwardRef<HTMLInputElement, WebInputProps>(
  (
    {
      className,
      type = 'text',
      label,
      helperText,
      error,
      errorMessage,
      disabled,
      required,
      readOnly,
      fullWidth = true,
      size,
      onChangeText,
      onChange,
      testID,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const id = providedId || generateId('input');
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    const hasError = error || !!errorMessage;
    const describedBy = hasError ? errorId : helperText ? helperId : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onChangeText?.(e.target.value);
    };

    return (
      <div className={cn(inputContainerVariants({ fullWidth }))}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium text-obsidian-700',
              disabled && 'text-obsidian-500'
            )}
          >
            {label}
            {required && (
              <span className="text-crimson-500 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={cn(inputVariants({ error: hasError, size }), className)}
          onChange={handleChange}
          data-testid={testID}
          {...props}
        />

        {hasError && errorMessage ? (
          <p id={errorId} className="text-xs text-crimson-600" role="alert">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-obsidian-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { inputVariants };
