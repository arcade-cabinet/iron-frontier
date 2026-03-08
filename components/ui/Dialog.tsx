import * as React from 'react';
import { Modal, Pressable, View, Platform } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { TextClassContext } from '@/components/ui/Text';
import { cn } from '@/lib/utils';

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

type DialogOverlayProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View>;

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;

  return (
    <Modal transparent visible={open} onRequestClose={() => onOpenChange(false)}>
      <Pressable
        className={cn(
          'absolute inset-0 flex-1 items-center justify-center bg-black/60',
          className,
        )}
        onPress={() => onOpenChange(false)}
        {...props}
      >
        {props.children}
      </Pressable>
    </Modal>
  );
}

type DialogContentProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View>;

function DialogContent({ className, children, ...props }: DialogContentProps) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;

  return (
    <Modal transparent visible={open} onRequestClose={() => onOpenChange(false)}>
      <View className="absolute inset-0 flex-1 items-center justify-center bg-black/60">
        <Pressable
          className="absolute inset-0"
          onPress={() => onOpenChange(false)}
        />
        <Animated.View
          entering={Platform.OS !== 'web' ? SlideInDown.duration(250) : FadeIn.duration(200)}
          exiting={Platform.OS !== 'web' ? SlideOutDown.duration(200) : FadeOut.duration(150)}
          className={cn(
            'mx-4 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg',
            'dark:border-frontier-leather/40 dark:bg-card',
            className,
          )}
          {...props}
        >
          <Pressable>{children}</Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

type DialogHeaderProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View>;

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <View
      className={cn('flex-col gap-1.5 pb-4', className)}
      {...props}
    />
  );
}

type DialogTitleProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View>;

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <TextClassContext.Provider
      value={cn('text-lg font-semibold leading-none tracking-tight font-heading text-card-foreground')}
    >
      <View className={cn(className)} {...props} />
    </TextClassContext.Provider>
  );
}

type DialogDescriptionProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View>;

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <TextClassContext.Provider value={cn('text-sm text-muted-foreground font-body')}>
      <View className={cn(className)} {...props} />
    </TextClassContext.Provider>
  );
}

type DialogFooterProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View>;

function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-end gap-2 pt-4',
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
