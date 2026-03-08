import * as React from 'react';
import { Pressable, View, Platform } from 'react-native';
import { TextClassContext } from '@/components/ui/Text';
import { cn } from '@/lib/utils';

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue>({
  value: '',
  onValueChange: () => {},
});

type TabsProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View> & {
    value: string;
    onValueChange: (value: string) => void;
  };

function Tabs({ value, onValueChange, className, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View className={cn('flex-1', className)} {...props} />
    </TabsContext.Provider>
  );
}

type TabsListProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View>;

function TabsList({ className, ...props }: TabsListProps) {
  return (
    <View
      className={cn(
        'flex-row items-center rounded-lg bg-muted p-1',
        className,
      )}
      role="tablist"
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> & {
    value: string;
  };

function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <TextClassContext.Provider
      value={cn(
        'text-sm font-medium font-body',
        isActive ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      <Pressable
        className={cn(
          'min-h-[44px] flex-1 items-center justify-center rounded-md px-3 py-1.5',
          isActive && 'bg-background shadow-sm',
          !isActive &&
            cn(
              'active:bg-background/50',
              Platform.select({ web: 'hover:bg-background/50' }),
            ),
          className,
        )}
        role="tab"
        aria-selected={isActive}
        onPress={() => onValueChange(value)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

type TabsContentProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View> & {
    value: string;
  };

function TabsContent({ value, className, ...props }: TabsContentProps) {
  const { value: selectedValue } = React.useContext(TabsContext);

  if (selectedValue !== value) return null;

  return (
    <View
      className={cn('flex-1', className)}
      role="tabpanel"
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
