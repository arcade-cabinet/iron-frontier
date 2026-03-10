import React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value);
      // If onValueChange is provided, use array-based API
      if (onValueChange) {
        onValueChange([numValue]);
      }
      // Also call onChange if provided for backward compatibility
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-slate-900 dark:bg-slate-800 dark:accent-slate-50',
          className
        )}
        value={value && value.length > 0 ? value[0] : ''}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
