import { cn } from '@/src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text, View, type ViewProps } from 'react-native';

const cardVariants = cva(
  'rounded-lg border-2 bg-steam-900 border-brass-700/30 shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-steam-900 border-brass-700/30',
        elevated: 'bg-steam-800 border-brass-600/40 shadow-xl',
        outlined: 'bg-transparent border-brass-600',
        ghost: 'bg-steam-900/50 border-brass-700/20',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return <View className={cn(cardVariants({ variant, padding, className }))} {...props} />;
}

export interface CardHeaderProps extends ViewProps {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <View className={cn('flex-col gap-1.5 pb-3', className)} {...props} />;
}

export interface CardTitleProps extends React.ComponentProps<typeof Text> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <Text
      className={cn(
        'text-xl font-bold text-brass-300 font-steampunk leading-tight',
        className
      )}
      {...props}
    />
  );
}

export interface CardDescriptionProps extends React.ComponentProps<typeof Text> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <Text className={cn('text-sm text-brass-100/70', className)} {...props} />;
}

export interface CardContentProps extends ViewProps {}

export function CardContent({ className, ...props }: CardContentProps) {
  return <View className={cn('', className)} {...props} />;
}

export interface CardFooterProps extends ViewProps {}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <View className={cn('flex-row items-center gap-2 pt-3', className)} {...props} />;
}
