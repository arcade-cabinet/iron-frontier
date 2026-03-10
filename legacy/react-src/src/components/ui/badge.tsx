import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, ...props }, ref) => (
  <div
    className={cn(
      'inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      className
    )}
    ref={ref}
    {...props}
  />
));
Badge.displayName = 'Badge';

export { Badge };
