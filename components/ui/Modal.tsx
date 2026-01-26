import { cn } from '@/src/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import {
    Pressable,
    Modal as RNModal,
    Text,
    View,
    type ModalProps as RNModalProps,
    type ViewProps,
} from 'react-native';

const modalOverlayVariants = cva('flex-1 justify-center items-center bg-black/70 p-4', {
  variants: {
    position: {
      center: 'justify-center',
      top: 'justify-start pt-20',
      bottom: 'justify-end pb-20',
    },
  },
  defaultVariants: {
    position: 'center',
  },
});

const modalContentVariants = cva(
  'bg-steam-900 border-2 border-brass-700/40 rounded-lg shadow-2xl max-w-lg w-full',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        default: 'max-w-lg',
        lg: 'max-w-2xl',
        full: 'max-w-full mx-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface ModalProps
  extends Omit<RNModalProps, 'children'>,
    VariantProps<typeof modalOverlayVariants>,
    VariantProps<typeof modalContentVariants> {
  children: React.ReactNode;
  onClose?: () => void;
  overlayClassName?: string;
  contentClassName?: string;
}

export function Modal({
  children,
  visible,
  onClose,
  position,
  size,
  overlayClassName,
  contentClassName,
  ...props
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <Pressable
        className={cn(modalOverlayVariants({ position }), overlayClassName)}
        onPress={onClose}
      >
        <Pressable
          className={cn(modalContentVariants({ size }), contentClassName)}
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

export interface ModalHeaderProps extends ViewProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function ModalHeader({
  children,
  onClose,
  showCloseButton = true,
  className,
  ...props
}: ModalHeaderProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between p-4 border-b border-brass-700/30',
        className
      )}
      {...props}
    >
      <View className="flex-1">{children}</View>
      {showCloseButton && onClose && (
        <Pressable
          onPress={onClose}
          className="ml-4 p-2 rounded-md active:bg-brass-600/10 min-h-[44px] min-w-[44px] items-center justify-center"
        >
          <Text className="text-brass-300 text-xl font-bold">×</Text>
        </Pressable>
      )}
    </View>
  );
}

export interface ModalTitleProps extends React.ComponentProps<typeof Text> {}

export function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <Text
      className={cn('text-xl font-bold text-brass-300 font-steampunk', className)}
      {...props}
    />
  );
}

export interface ModalDescriptionProps extends React.ComponentProps<typeof Text> {}

export function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  return <Text className={cn('text-sm text-brass-100/70 mt-1', className)} {...props} />;
}

export interface ModalContentProps extends ViewProps {}

export function ModalContent({ className, ...props }: ModalContentProps) {
  return <View className={cn('p-4', className)} {...props} />;
}

export interface ModalFooterProps extends ViewProps {}

export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-end gap-2 p-4 border-t border-brass-700/30',
        className
      )}
      {...props}
    />
  );
}
