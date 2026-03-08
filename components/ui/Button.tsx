import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable } from 'react-native';
import { TextClassContext } from '@/components/ui/Text';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none',
    Platform.select({
      web: 'outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
    }),
  ),
  {
    variants: {
      variant: {
        primary: cn(
          'bg-primary shadow-sm shadow-black/5 active:bg-primary/90',
          Platform.select({ web: 'hover:bg-primary/90' }),
        ),
        secondary: cn(
          'bg-secondary shadow-sm shadow-black/5 active:bg-secondary/80',
          Platform.select({ web: 'hover:bg-secondary/80' }),
        ),
        destructive: cn(
          'bg-destructive shadow-sm shadow-black/5 active:bg-destructive/90',
          Platform.select({
            web: 'hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          }),
        ),
        ghost: cn(
          'active:bg-accent dark:active:bg-accent/50',
          Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' }),
        ),
        outline: cn(
          'border border-border bg-background shadow-sm shadow-black/5 active:bg-accent dark:border-input dark:bg-input/30 dark:active:bg-input/50',
          Platform.select({
            web: 'hover:bg-accent dark:hover:bg-input/50',
          }),
        ),
      },
      size: {
        sm: cn(
          'min-h-[44px] gap-1.5 rounded-md px-3',
          Platform.select({ web: 'sm:min-h-[36px]' }),
        ),
        md: cn(
          'min-h-[44px] px-4 py-2',
          Platform.select({ web: 'sm:min-h-[40px]' }),
        ),
        lg: cn(
          'min-h-[48px] rounded-md px-6',
          Platform.select({ web: 'sm:min-h-[44px]' }),
        ),
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

const buttonTextVariants = cva(
  cn(
    'text-sm font-medium text-foreground font-body',
    Platform.select({ web: 'pointer-events-none transition-colors' }),
  ),
  {
    variants: {
      variant: {
        primary: 'text-primary-foreground',
        secondary: 'text-secondary-foreground',
        destructive: 'text-destructive-foreground',
        ghost: cn(
          'group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' }),
        ),
        outline: cn(
          'group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' }),
        ),
      },
      size: {
        sm: '',
        md: '',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(
          props.disabled && 'opacity-50',
          buttonVariants({ variant, size }),
          className,
        )}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
