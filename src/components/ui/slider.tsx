import React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => (
    <input
      type="range"
      ref={ref}
      className={cn(
        'h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-slate-900 dark:bg-slate-800 dark:accent-slate-50',
        className
      )}
      {...props}
    />
  )
);
Slider.displayName = 'Slider';

export { Slider };
