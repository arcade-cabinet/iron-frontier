/**
 * Web Spinner Component
 *
 * Loading indicator with western styling.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import type { SpinnerProps } from '../primitives/types';
import { cn } from '../primitives/utils';

/**
 * Spinner variants
 */
const spinnerVariants = cva(
  [
    'inline-block animate-spin',
    'rounded-full border-2 border-solid border-current border-r-transparent',
    'align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'size-4 border-2',
        md: 'size-6 border-2',
        lg: 'size-8 border-[3px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export type WebSpinnerProps = SpinnerProps &
  React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof spinnerVariants>;

/**
 * Spinner component for web platform
 */
export const Spinner = React.forwardRef<HTMLDivElement, WebSpinnerProps>(
  ({ className, size, color, label = 'Loading...', testID, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn('inline-flex items-center justify-center', className)}
        data-testid={testID}
        {...props}
      >
        <span className={cn(spinnerVariants({ size }))} style={color ? { color } : undefined} />
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

/**
 * Full-page loading overlay
 */
export const LoadingOverlay: React.FC<{
  visible: boolean;
  label?: string;
  className?: string;
}> = ({ visible, label = 'Loading...', className }) => {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-parchment-50/80 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" color="#c94f2e" />
        <span className="text-sm font-medium text-obsidian-700">{label}</span>
      </div>
    </div>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';

export { spinnerVariants };
