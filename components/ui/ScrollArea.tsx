import * as React from 'react';
import { ScrollView } from 'react-native';
import { cn } from '@/lib/utils';

type ScrollAreaProps = React.ComponentProps<typeof ScrollView> &
  React.RefAttributes<ScrollView>;

function ScrollArea({ className, contentContainerClassName, ...props }: ScrollAreaProps) {
  return (
    <ScrollView
      className={cn('flex-1', className)}
      contentContainerClassName={cn(contentContainerClassName)}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      {...props}
    />
  );
}

export { ScrollArea };
export type { ScrollAreaProps };
