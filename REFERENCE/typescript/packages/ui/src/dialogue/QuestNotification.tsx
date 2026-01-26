/**
 * Quest Notification Component
 *
 * Displays notifications for quest events: started, updated, completed, failed.
 * Slides in from the side and auto-dismisses.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../primitives/utils';
import type { DialogueBaseProps, QuestNotificationData, QuestNotificationType } from './types';

/**
 * Notification container variants
 */
const notificationContainerVariants = cva(
  [
    'fixed z-50',
    'flex items-center gap-3',
    'px-4 py-3',
    'rounded-lg',
    'shadow-lg',
    'border-2',
    'max-w-md',
    // Base animation
    'transition-all duration-500 ease-out',
  ].join(' '),
  {
    variants: {
      type: {
        started: [
          'bg-gradient-to-r from-sage-100 to-sage-50',
          'border-sage-400',
          'text-sage-900',
        ].join(' '),
        updated: [
          'bg-gradient-to-r from-amber-100 to-amber-50',
          'border-amber-400',
          'text-amber-900',
        ].join(' '),
        completed: [
          'bg-gradient-to-r from-bronze-100 to-bronze-50',
          'border-bronze-500',
          'text-bronze-900',
        ].join(' '),
        failed: [
          'bg-gradient-to-r from-crimson-100 to-crimson-50',
          'border-crimson-400',
          'text-crimson-900',
        ].join(' '),
      },
      position: {
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4',
      },
      visible: {
        true: 'translate-x-0 opacity-100',
        false: '',
      },
    },
    compoundVariants: [
      {
        position: 'top-left',
        visible: false,
        className: '-translate-x-full opacity-0',
      },
      {
        position: 'bottom-left',
        visible: false,
        className: '-translate-x-full opacity-0',
      },
      {
        position: 'top-right',
        visible: false,
        className: 'translate-x-full opacity-0',
      },
      {
        position: 'bottom-right',
        visible: false,
        className: 'translate-x-full opacity-0',
      },
    ],
    defaultVariants: {
      type: 'started',
      position: 'top-right',
      visible: true,
    },
  }
);

/**
 * Quest icon based on notification type
 */
function QuestIcon({ type }: { type: QuestNotificationType }) {
  const iconClasses = 'w-8 h-8 flex-shrink-0';

  switch (type) {
    case 'started':
      return (
        <svg className={cn(iconClasses, 'text-sage-600')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Scroll/quest icon */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
          {/* Plus badge */}
          <circle cx="18" cy="6" r="4" fill="currentColor" />
          <path
            d="M16 6h4M18 4v4"
            stroke="white"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
      );

    case 'updated':
      return (
        <svg className={cn(iconClasses, 'text-amber-600')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Scroll with arrow */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
          {/* Update arrow badge */}
          <circle cx="18" cy="6" r="4" fill="currentColor" />
          <path
            d="M16 6l2 2 2-2M18 8V4"
            stroke="white"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'completed':
      return (
        <svg className={cn(iconClasses, 'text-bronze-600')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Star/achievement icon */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      );

    case 'failed':
      return (
        <svg className={cn(iconClasses, 'text-crimson-600')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* Broken/failed icon */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
          {/* X badge */}
          <circle cx="18" cy="6" r="4" fill="currentColor" />
          <path
            d="M16.5 4.5l3 3M19.5 4.5l-3 3"
            stroke="white"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

/**
 * Title text based on notification type
 */
function getTitle(type: QuestNotificationType): string {
  switch (type) {
    case 'started':
      return 'Quest Started';
    case 'updated':
      return 'Quest Updated';
    case 'completed':
      return 'Quest Complete';
    case 'failed':
      return 'Quest Failed';
  }
}

export interface QuestNotificationProps
  extends DialogueBaseProps,
    Pick<VariantProps<typeof notificationContainerVariants>, 'position'> {
  /** Notification data */
  data: QuestNotificationData;
  /** Whether the notification is visible */
  visible?: boolean;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  autoDismiss?: number;
  /** Callback when notification is dismissed */
  onDismiss?: () => void;
  /** Whether to show close button */
  showCloseButton?: boolean;
}

/**
 * QuestNotification component
 *
 * Displays quest-related notifications with appropriate styling:
 * - Quest Started (green/sage)
 * - Quest Updated (amber/yellow)
 * - Quest Complete (bronze/gold)
 * - Quest Failed (red/crimson)
 */
export const QuestNotification = React.forwardRef<HTMLDivElement, QuestNotificationProps>(
  (
    {
      data,
      visible: visibleProp = true,
      autoDismiss = 5000,
      onDismiss,
      showCloseButton = true,
      position = 'top-right',
      className,
      testID,
    },
    ref
  ) => {
    const [internalVisible, setInternalVisible] = useState(false);

    // Animate in after mount
    useEffect(() => {
      if (visibleProp) {
        // Small delay for entrance animation
        const showTimer = setTimeout(() => setInternalVisible(true), 50);
        return () => clearTimeout(showTimer);
      } else {
        setInternalVisible(false);
      }
    }, [visibleProp]);

    // Auto-dismiss
    useEffect(() => {
      if (!visibleProp || autoDismiss === 0) return;

      const timer = setTimeout(() => {
        setInternalVisible(false);
        // Wait for exit animation
        setTimeout(() => onDismiss?.(), 500);
      }, autoDismiss);

      return () => clearTimeout(timer);
    }, [visibleProp, autoDismiss, onDismiss]);

    const handleClose = () => {
      setInternalVisible(false);
      setTimeout(() => onDismiss?.(), 500);
    };

    return (
      <div
        ref={ref}
        className={cn(
          notificationContainerVariants({
            type: data.type,
            position,
            visible: internalVisible,
          }),
          className
        )}
        role="alert"
        aria-live="polite"
        data-testid={testID}
      >
        {/* Icon */}
        <QuestIcon type={data.type} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="font-bold font-serif text-sm uppercase tracking-wide">
            {getTitle(data.type)}
          </div>

          {/* Quest name */}
          <div className="font-semibold truncate">{data.questName}</div>

          {/* Description */}
          {data.description && (
            <div className="text-sm opacity-80 truncate">{data.description}</div>
          )}
        </div>

        {/* Close button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              'flex-shrink-0',
              'w-6 h-6',
              'flex items-center justify-center',
              'rounded-full',
              'opacity-60 hover:opacity-100',
              'transition-opacity duration-150',
              'focus:outline-none focus:ring-2 focus:ring-current'
            )}
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Decorative progress bar for auto-dismiss */}
        {autoDismiss > 0 && internalVisible && (
          <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-lg">
            <div
              className={cn(
                'h-full',
                data.type === 'started' && 'bg-sage-500',
                data.type === 'updated' && 'bg-amber-500',
                data.type === 'completed' && 'bg-bronze-500',
                data.type === 'failed' && 'bg-crimson-500'
              )}
              style={{
                animation: `shrink ${autoDismiss}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    );
  }
);

QuestNotification.displayName = 'QuestNotification';

/**
 * CSS keyframes for progress bar
 * Add this to your global styles
 */
export const shrinkKeyframes = `
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
`;

export { notificationContainerVariants };
