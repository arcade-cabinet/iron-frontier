import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    ref={ref}
    className={cn(
      'peer relative inline-flex h-6 w-11 appearance-none rounded-full bg-slate-300 transition-colors checked:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 dark:bg-slate-700 dark:checked:bg-slate-50',
      className
    )}
    {...props}
  />
));
Switch.displayName = 'Switch';

export { Switch };
