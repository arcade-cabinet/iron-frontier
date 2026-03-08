import { cva, type VariantProps } from 'class-variance-authority';
import { View } from 'react-native';
import { TextClassContext } from '@/components/ui/Text';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'flex-row items-center rounded-full px-2.5 py-0.5',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-frontier-sage/20 border border-frontier-sage/50',
        warning: 'bg-frontier-whiskey/20 border border-frontier-whiskey/50',
        danger: 'bg-frontier-blood/20 border border-frontier-blood/50',
        info: 'bg-frontier-sky/20 border border-frontier-sky/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const badgeTextVariants = cva('text-xs font-medium font-body', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      success: 'text-frontier-sage',
      warning: 'text-frontier-whiskey',
      danger: 'text-frontier-blood',
      info: 'text-frontier-sky',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type BadgeProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <View
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Badge, badgeVariants, badgeTextVariants };
export type { BadgeProps };
