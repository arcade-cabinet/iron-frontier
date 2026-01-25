/**
 * Web Card Component
 *
 * A container component for grouping related content.
 * Supports elevated, outlined, and filled variants.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import type { CardProps } from '../primitives/types';

/**
 * Card style variants using CVA
 */
const cardVariants = cva(
  // Base styles
  [
    'rounded-lg',
    'transition-all duration-150 ease-out',
  ].join(' '),
  {
    variants: {
      variant: {
        elevated: [
          'bg-parchment-50 shadow-md',
          'hover:shadow-lg',
        ].join(' '),
        outlined: [
          'bg-parchment-50 border-2 border-leather-300',
        ].join(' '),
        filled: [
          'bg-parchment-100',
        ].join(' '),
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover:scale-[1.01] active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-500 focus-visible:ring-offset-2',
        ].join(' '),
        false: '',
      },
    },
    defaultVariants: {
      variant: 'elevated',
      padding: 'md',
      interactive: false,
    },
  }
);

export type WebCardProps = CardProps &
  React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>;

/**
 * Card component for web platform
 */
export const Card = React.forwardRef<HTMLDivElement, WebCardProps>(
  (
    {
      className,
      variant,
      padding,
      onPress,
      children,
      testID,
      ...props
    },
    ref
  ) => {
    const isInteractive = !!onPress;

    const handleClick = () => {
      onPress?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onPress?.();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, interactive: isInteractive }),
          className
        )}
        onClick={isInteractive ? handleClick : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? 'button' : undefined}
        data-testid={testID}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header component
 */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

/**
 * Card Title component
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-semibold text-lg text-obsidian-900 leading-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/**
 * Card Description component
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-obsidian-600', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/**
 * Card Content component
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

/**
 * Card Footer component
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-3 pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { cardVariants };
