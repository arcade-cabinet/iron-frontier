import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

const inputVariants = cva(
  'rounded-md border-2 bg-steam-800 text-brass-100 px-3 py-2 text-base min-h-[44px]',
  {
    variants: {
      variant: {
        default: 'border-brass-700/40 focus:border-brass-600',
        error: 'border-red-600 focus:border-red-500',
        success: 'border-green-600 focus:border-green-500',
      },
      size: {
        sm: 'h-9 px-2 py-1 text-sm',
        default: 'h-11 px-3 py-2 text-base',
        lg: 'h-12 px-4 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<TextInputProps, 'placeholderTextColor'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      containerClassName,
      editable = true,
      ...props
    },
    ref
  ) => {
    const finalVariant = error ? 'error' : variant;

    return (
      <View className={cn('gap-1.5', containerClassName)}>
        {label && <Text className="text-sm font-medium text-brass-300">{label}</Text>}
        <TextInput
          ref={ref}
          className={cn(
            inputVariants({ variant: finalVariant, size, className }),
            !editable && 'opacity-50'
          )}
          placeholderTextColor="#a8a29e"
          editable={editable}
          {...props}
        />
        {error && <Text className="text-xs text-red-500">{error}</Text>}
        {helperText && !error && <Text className="text-xs text-brass-100/60">{helperText}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { inputVariants };
