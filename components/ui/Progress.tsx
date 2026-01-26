import { cn } from '@/src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text, View, type ViewProps } from 'react-native';

const progressVariants = cva('h-2 w-full rounded-full bg-steam-700 overflow-hidden', {
  variants: {
    size: {
      sm: 'h-1',
      default: 'h-2',
      lg: 'h-3',
      xl: 'h-4',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const progressBarVariants = cva('h-full rounded-full transition-all', {
  variants: {
    variant: {
      default: 'bg-brass-600',
      health: 'bg-red-600',
      mana: 'bg-blue-600',
      experience: 'bg-amber-500',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      danger: 'bg-red-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ProgressProps extends ViewProps, VariantProps<typeof progressVariants> {
  value: number; // 0-100
  max?: number;
  variant?: VariantProps<typeof progressBarVariants>['variant'];
  showLabel?: boolean;
  label?: string;
  containerClassName?: string;
  barClassName?: string;
}

export function Progress({
  value,
  max = 100,
  variant = 'default',
  size,
  showLabel = false,
  label,
  className,
  containerClassName,
  barClassName,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <View className={cn('gap-1', containerClassName)}>
      {(showLabel || label) && (
        <View className="flex-row justify-between items-center">
          {label && <Text className="text-xs font-medium text-brass-300">{label}</Text>}
          {showLabel && (
            <Text className="text-xs text-brass-100/70">
              {Math.round(value)}/{max}
            </Text>
          )}
        </View>
      )}
      <View className={cn(progressVariants({ size, className }))} {...props}>
        <View
          className={cn(progressBarVariants({ variant }), barClassName)}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}

export interface ProgressBarProps extends ViewProps {
  current: number;
  max: number;
  variant?: VariantProps<typeof progressBarVariants>['variant'];
  size?: VariantProps<typeof progressVariants>['size'];
  label?: string;
  showValues?: boolean;
}

/**
 * Convenience component for common use cases like health/mana bars
 */
export function ProgressBar({
  current,
  max,
  variant = 'default',
  size = 'default',
  label,
  showValues = true,
  className,
  ...props
}: ProgressBarProps) {
  return (
    <Progress
      value={current}
      max={max}
      variant={variant}
      size={size}
      label={label}
      showLabel={showValues}
      className={className}
      {...props}
    />
  );
}

export { progressBarVariants, progressVariants };

