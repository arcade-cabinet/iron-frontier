/**
 * Web Button Component
 *
 * A pressable button with western/steampunk styling.
 * Supports multiple variants and sizes.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import type { ButtonProps } from '../primitives/types';
import { cn } from '../primitives/utils';
import { Spinner } from './Spinner';

/**
 * Button style variants using CVA
 */
const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-medium',
    'transition-all duration-150 ease-out',
    'outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'whitespace-nowrap select-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-rust-600 text-white shadow-sm',
          'hover:bg-rust-700 active:bg-rust-800',
          'focus-visible:ring-rust-500',
        ].join(' '),
        secondary: [
          'bg-bronze-500 text-white shadow-sm',
          'hover:bg-bronze-600 active:bg-bronze-700',
          'focus-visible:ring-bronze-500',
        ].join(' '),
        danger: [
          'bg-crimson-600 text-white shadow-sm',
          'hover:bg-crimson-700 active:bg-crimson-800',
          'focus-visible:ring-crimson-500',
        ].join(' '),
        ghost: [
          'bg-transparent text-obsidian-700',
          'hover:bg-parchment-200 active:bg-parchment-300',
          'focus-visible:ring-leather-400',
        ].join(' '),
        outline: [
          'border-2 border-leather-400 bg-transparent text-obsidian-700',
          'hover:bg-parchment-100 active:bg-parchment-200',
          'focus-visible:ring-leather-400',
        ].join(' '),
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-1.5 [&_svg]:size-3.5',
        md: 'h-10 px-4 text-sm gap-2 [&_svg]:size-4',
        lg: 'h-12 px-6 text-base gap-2.5 [&_svg]:size-5',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export type WebButtonProps = ButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Render as a different element */
    asChild?: boolean;
  };

/**
 * Button component for web platform
 */
export const Button = React.forwardRef<HTMLButtonElement, WebButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      disabled,
      loading,
      leftIcon,
      rightIcon,
      children,
      onPress,
      onClick,
      testID,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
      onPress?.();
    };

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        onClick={handleClick}
        data-testid={testID}
        aria-busy={loading}
        {...props}
      >
        {loading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { buttonVariants };
