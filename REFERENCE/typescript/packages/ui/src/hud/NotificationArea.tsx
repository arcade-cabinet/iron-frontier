/**
 * NotificationArea Component
 *
 * Displays toast notifications that stack and auto-dismiss.
 * Located at the top-center or right side of the HUD.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import { InfoIcon, WarningIcon, StarIcon, CoinIcon, CompassIcon, DangerIcon } from './icons';
import { useReducedMotion } from './hooks';
import type { HUDNotification } from './types';

const notificationAreaVariants = cva(
  ['flex flex-col gap-2', 'max-w-[280px] sm:max-w-[320px]'].join(' '),
  {
    variants: {
      position: {
        topCenter: 'items-center',
        topRight: 'items-end',
        bottomRight: 'items-end flex-col-reverse',
      },
    },
    defaultVariants: {
      position: 'topRight',
    },
  }
);

const notificationItemVariants = cva(
  [
    'flex items-start gap-2',
    'px-3 py-2 rounded-lg',
    'backdrop-blur-sm',
    'border',
    'shadow-lg',
    'animate-in fade-in slide-in-from-right-4',
    'data-[state=exiting]:animate-out data-[state=exiting]:fade-out data-[state=exiting]:slide-out-to-right-4',
  ].join(' '),
  {
    variants: {
      type: {
        info: 'bg-amber-950/90 border-amber-700/50 text-amber-100',
        warning: 'bg-orange-950/90 border-orange-700/50 text-orange-100',
        danger: 'bg-red-950/90 border-red-700/50 text-red-100',
        item: 'bg-green-950/90 border-green-700/50 text-green-100',
        xp: 'bg-purple-950/90 border-purple-700/50 text-purple-100',
        quest: 'bg-yellow-950/90 border-yellow-700/50 text-yellow-100',
        level: 'bg-blue-950/90 border-blue-700/50 text-blue-100',
        location: 'bg-sky-950/90 border-sky-700/50 text-sky-100',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
);

export interface NotificationAreaProps extends VariantProps<typeof notificationAreaVariants> {
  /** Array of notifications to display */
  notifications: HUDNotification[];
  /** Callback when notification should be dismissed */
  onDismiss?: (id: string) => void;
  /** Auto-dismiss duration in ms (0 to disable) */
  autoDismissMs?: number;
  /** Maximum notifications to show */
  maxVisible?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: HUDNotification['type']): React.ReactNode {
  switch (type) {
    case 'item':
      return <CoinIcon className="w-4 h-4 text-green-400" aria-label="Item acquired" />;
    case 'xp':
      return <StarIcon className="w-4 h-4 text-purple-400" aria-label="XP gained" />;
    case 'quest':
      return <StarIcon className="w-4 h-4 text-yellow-400" aria-label="Quest update" />;
    case 'level':
      return <StarIcon className="w-4 h-4 text-blue-400" aria-label="Level up" />;
    case 'warning':
      return <WarningIcon className="w-4 h-4 text-orange-400" aria-label="Warning" />;
    case 'danger':
      return <DangerIcon className="w-4 h-4 text-red-400" aria-label="Danger" />;
    case 'location':
      return <CompassIcon className="w-4 h-4 text-sky-400" aria-label="Location" />;
    case 'info':
    default:
      return <InfoIcon className="w-4 h-4 text-amber-400" aria-label="Info" />;
  }
}

/**
 * Single notification item
 */
interface NotificationItemProps {
  notification: HUDNotification;
  onDismiss?: () => void;
  autoDismissMs: number;
}

function NotificationItem({
  notification,
  onDismiss,
  autoDismissMs,
}: NotificationItemProps) {
  const [isExiting, setIsExiting] = React.useState(false);
  const reducedMotion = useReducedMotion();

  // Auto-dismiss timer
  React.useEffect(() => {
    if (autoDismissMs <= 0) return;

    const duration = notification.duration || autoDismissMs;
    const exitDuration = reducedMotion ? 0 : 200;

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - exitDuration);

    const dismissTimer = setTimeout(() => {
      onDismiss?.();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(dismissTimer);
    };
  }, [notification, autoDismissMs, onDismiss, reducedMotion]);

  return (
    <div
      className={cn(
        notificationItemVariants({ type: notification.type }),
        reducedMotion && 'animate-none'
      )}
      data-state={isExiting ? 'exiting' : 'active'}
      role="alert"
      aria-live="polite"
    >
      <span className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </span>
      <span className="text-sm leading-snug flex-1">{notification.message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * NotificationArea component for the game HUD
 */
export function NotificationArea({
  notifications,
  onDismiss,
  autoDismissMs = 3000,
  maxVisible = 5,
  position,
  className,
}: NotificationAreaProps) {
  // Limit visible notifications
  const visibleNotifications = React.useMemo(() => {
    return notifications.slice(0, maxVisible);
  }, [notifications, maxVisible]);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(notificationAreaVariants({ position }), className)}
      role="log"
      aria-label="Notifications"
      aria-live="polite"
    >
      {visibleNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss ? () => onDismiss(notification.id) : undefined}
          autoDismissMs={autoDismissMs}
        />
      ))}
    </div>
  );
}

export { notificationAreaVariants, notificationItemVariants };
