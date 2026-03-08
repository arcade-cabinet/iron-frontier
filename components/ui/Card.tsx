import * as React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';
import { TextClassContext } from '@/components/ui/Text';

type CardProps = React.ComponentProps<typeof View> & React.RefAttributes<View>;

function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-lg border border-border bg-card shadow-sm shadow-black/10',
        // Western-themed: subtle leather-toned border in dark mode
        'dark:border-frontier-leather/40 dark:bg-card',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'flex-col gap-1.5 px-6 pt-6',
        // Subtle bottom border for western "panel header" feel
        'border-b border-border/50 pb-4',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: CardProps) {
  return (
    <TextClassContext.Provider
      value={cn('text-lg font-semibold leading-none tracking-tight font-heading text-card-foreground')}
    >
      <View className={cn('flex-row items-center', className)} {...props} />
    </TextClassContext.Provider>
  );
}

function CardDescription({ className, ...props }: CardProps) {
  return (
    <TextClassContext.Provider value={cn('text-sm text-muted-foreground font-body')}>
      <View className={cn(className)} {...props} />
    </TextClassContext.Provider>
  );
}

function CardContent({ className, ...props }: CardProps) {
  return <View className={cn('px-6 py-4', className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'flex-row items-center px-6 pb-6 pt-0',
        'border-t border-border/50',
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
