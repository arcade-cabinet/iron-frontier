/**
 * Web Text Component
 *
 * Typography component with pre-defined variants
 * matching the Iron Frontier design system.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import type { TextProps } from '../primitives/types';

/**
 * Text style variants using CVA
 */
const textVariants = cva('', {
  variants: {
    variant: {
      // Display styles (western headers)
      displayLarge: 'font-display text-5xl font-bold leading-tight tracking-tight',
      displayMedium: 'font-display text-4xl font-bold leading-tight tracking-tight',
      displaySmall: 'font-display text-3xl font-semibold leading-tight',

      // Heading styles
      headingLarge: 'font-sans text-2xl font-semibold leading-tight',
      headingMedium: 'font-sans text-xl font-semibold leading-snug',
      headingSmall: 'font-sans text-lg font-medium leading-snug',

      // Body styles
      bodyLarge: 'font-sans text-base leading-relaxed',
      bodyMedium: 'font-sans text-sm leading-normal',
      bodySmall: 'font-sans text-xs leading-normal',

      // Label styles
      labelLarge: 'font-sans text-sm font-medium leading-normal tracking-wide',
      labelMedium: 'font-sans text-xs font-medium leading-normal tracking-wide',
      labelSmall: 'font-sans text-[10px] font-medium leading-normal tracking-wider uppercase',

      // Code/mono
      code: 'font-mono text-sm leading-relaxed',
    },
    color: {
      primary: 'text-obsidian-950',
      secondary: 'text-obsidian-700',
      tertiary: 'text-obsidian-500',
      muted: 'text-obsidian-400',
      inverse: 'text-parchment-50',
      link: 'text-bronze-600 hover:text-bronze-700 cursor-pointer',
      error: 'text-crimson-600',
      success: 'text-sage-600',
      warning: 'text-amber-600',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    variant: 'bodyMedium',
    color: 'primary',
    align: 'left',
  },
});

export type WebTextProps = TextProps &
  React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & {
    /** HTML element to render as */
    as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'code' | 'pre';
  };

/**
 * Get the default HTML element for a variant
 */
function getDefaultElement(variant: WebTextProps['variant']): WebTextProps['as'] {
  switch (variant) {
    case 'displayLarge':
    case 'displayMedium':
      return 'h1';
    case 'displaySmall':
      return 'h2';
    case 'headingLarge':
      return 'h3';
    case 'headingMedium':
      return 'h4';
    case 'headingSmall':
      return 'h5';
    case 'code':
      return 'code';
    case 'labelLarge':
    case 'labelMedium':
    case 'labelSmall':
      return 'span';
    default:
      return 'p';
  }
}

/**
 * Text component for web platform
 */
export const Text = React.forwardRef<HTMLElement, WebTextProps>(
  (
    {
      className,
      variant,
      color,
      align,
      as,
      numberOfLines,
      selectable = true,
      children,
      testID,
      ...props
    },
    ref
  ) => {
    const Component = as || getDefaultElement(variant) || 'p';

    const truncateStyles = numberOfLines
      ? numberOfLines === 1
        ? 'truncate'
        : `line-clamp-${numberOfLines}`
      : '';

    const selectableStyles = !selectable ? 'select-none' : '';

    return React.createElement(
      Component,
      {
        ref,
        className: cn(
          textVariants({ variant, color, align }),
          truncateStyles,
          selectableStyles,
          className
        ),
        'data-testid': testID,
        ...props,
      },
      children
    );
  }
);

Text.displayName = 'Text';

export { textVariants };
