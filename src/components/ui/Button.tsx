import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable, Text, type PressableProps } from 'react-native';

const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 rounded-md transition-all disabled:opacity-50 min-h-[44px]',
  {
    variants: {
      variant: {
        default: 'bg-brass-600 shadow-sm active:bg-brass-700',
        destructive: 'bg-red-600 shadow-sm active:bg-red-700',
        outline: 'border-2 border-brass-600 bg-transparent active:bg-brass-600/10',
        secondary: 'bg-steam-700 shadow-sm active:bg-steam-800',
        ghost: 'active:bg-brass-600/10',
        link: '',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 px-3 py-1.5',
        lg: 'h-12 px-6 py-3',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva('text-sm font-medium text-center', {
  variants: {
    variant: {
      default: 'text-white',
      destructive: 'text-white',
      outline: 'text-brass-600',
      secondary: 'text-white',
      ghost: 'text-brass-600',
      link: 'text-brass-600 underline',
    },
    size: {
      default: 'text-base',
      sm: 'text-sm',
      lg: 'text-lg',
      icon: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ButtonProps
  extends Omit<PressableProps, 'children'>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  textClassName?: string;
}

export function Button({
  className,
  variant,
  size,
  children,
  textClassName,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={cn(buttonTextVariants({ variant, size }), textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export { buttonTextVariants, buttonVariants };

