/**
 * Item Received Component
 *
 * Displays notifications when the player receives items.
 * Shows item icon, name, and quantity with appropriate rarity styling.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../primitives/utils';
import type { DialogueBaseProps, ItemReceivedData } from './types';

/**
 * Item notification container variants
 */
const itemContainerVariants = cva(
  [
    'fixed z-50',
    'flex items-center gap-3',
    'px-4 py-3',
    'rounded-lg',
    'shadow-lg',
    'border-2',
    'max-w-sm',
    // Base animation
    'transition-all duration-500 ease-out',
  ].join(' '),
  {
    variants: {
      rarity: {
        common: [
          'bg-gradient-to-r from-parchment-100 to-parchment-50',
          'border-leather-300',
        ].join(' '),
        uncommon: [
          'bg-gradient-to-r from-sage-100 to-sage-50',
          'border-sage-400',
        ].join(' '),
        rare: [
          'bg-gradient-to-r from-sky-100 to-sky-50',
          'border-sky-400',
        ].join(' '),
        epic: [
          'bg-gradient-to-r from-purple-100 to-purple-50',
          'border-purple-400',
        ].join(' '),
        legendary: [
          'bg-gradient-to-r from-amber-100 to-amber-50',
          'border-amber-500',
          // Legendary glow effect
          'shadow-amber-200/50',
        ].join(' '),
      },
      position: {
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
        'top-right': 'top-4 right-4',
      },
      visible: {
        true: 'translate-y-0 opacity-100',
        false: '-translate-y-4 opacity-0',
      },
    },
    defaultVariants: {
      rarity: 'common',
      position: 'bottom-center',
      visible: true,
    },
  }
);

/**
 * Item icon container variants
 */
const iconContainerVariants = cva(
  [
    'flex items-center justify-center',
    'w-12 h-12',
    'rounded-lg',
    'border-2',
    'flex-shrink-0',
  ].join(' '),
  {
    variants: {
      rarity: {
        common: 'bg-parchment-200 border-leather-400',
        uncommon: 'bg-sage-200 border-sage-500',
        rare: 'bg-sky-200 border-sky-500',
        epic: 'bg-purple-200 border-purple-500',
        legendary: 'bg-amber-200 border-amber-600 shadow-inner',
      },
    },
    defaultVariants: {
      rarity: 'common',
    },
  }
);

/**
 * Rarity text styles
 */
const rarityTextVariants = cva(
  'text-xs font-semibold uppercase tracking-wide',
  {
    variants: {
      rarity: {
        common: 'text-obsidian-500',
        uncommon: 'text-sage-600',
        rare: 'text-sky-600',
        epic: 'text-purple-600',
        legendary: 'text-amber-600',
      },
    },
    defaultVariants: {
      rarity: 'common',
    },
  }
);

/**
 * Placeholder item icon
 */
function PlaceholderIcon({ rarity }: { rarity: ItemReceivedData['rarity'] }) {
  const colorMap = {
    common: 'text-leather-600',
    uncommon: 'text-sage-600',
    rare: 'text-sky-600',
    epic: 'text-purple-600',
    legendary: 'text-amber-600',
  };

  return (
    <svg className={cn('w-8 h-8', colorMap[rarity || 'common'])} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {/* Generic item/bag icon */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

export interface ItemReceivedProps
  extends DialogueBaseProps,
    Pick<VariantProps<typeof itemContainerVariants>, 'position'> {
  /** Item data */
  data: ItemReceivedData;
  /** Whether the notification is visible */
  visible?: boolean;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  autoDismiss?: number;
  /** Callback when notification is dismissed */
  onDismiss?: () => void;
  /** Custom icon renderer */
  renderIcon?: (data: ItemReceivedData) => React.ReactNode;
}

/**
 * ItemReceived component
 *
 * Displays item acquisition notifications with rarity-based styling:
 * - Common (gray/parchment)
 * - Uncommon (green/sage)
 * - Rare (blue/sky)
 * - Epic (purple)
 * - Legendary (gold/amber with glow)
 */
export const ItemReceived = React.forwardRef<HTMLDivElement, ItemReceivedProps>(
  (
    {
      data,
      visible: visibleProp = true,
      autoDismiss = 3000,
      onDismiss,
      position = 'bottom-center',
      renderIcon,
      className,
      testID,
    },
    ref
  ) => {
    const [internalVisible, setInternalVisible] = useState(false);
    const rarity = data.rarity || 'common';

    // Animate in after mount
    useEffect(() => {
      if (visibleProp) {
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
        setTimeout(() => onDismiss?.(), 500);
      }, autoDismiss);

      return () => clearTimeout(timer);
    }, [visibleProp, autoDismiss, onDismiss]);

    // Format quantity display
    const quantityDisplay = data.quantity > 1 ? `x${data.quantity}` : '';

    return (
      <div
        ref={ref}
        className={cn(
          itemContainerVariants({
            rarity,
            position,
            visible: internalVisible,
          }),
          // Legendary pulsing effect
          rarity === 'legendary' && 'animate-pulse-subtle',
          className
        )}
        role="alert"
        aria-live="polite"
        data-testid={testID}
      >
        {/* Item icon */}
        <div className={iconContainerVariants({ rarity })}>
          {renderIcon ? (
            renderIcon(data)
          ) : data.iconId ? (
            <img
              src={data.iconId}
              alt={data.name}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <PlaceholderIcon rarity={rarity} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Received label */}
          <div className="text-xs text-obsidian-500 font-medium uppercase tracking-wide">
            Received
          </div>

          {/* Item name with quantity */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-obsidian-800 truncate">
              {data.name}
            </span>
            {quantityDisplay && (
              <span className="text-obsidian-600 font-mono text-sm flex-shrink-0">
                {quantityDisplay}
              </span>
            )}
          </div>

          {/* Rarity badge */}
          {rarity !== 'common' && (
            <span className={rarityTextVariants({ rarity })}>
              {rarity}
            </span>
          )}
        </div>

        {/* Decorative sparkle for rare+ items */}
        {(rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') && (
          <div className="absolute -top-1 -right-1">
            <svg
              className={cn(
                'w-6 h-6',
                rarity === 'rare' && 'text-sky-400',
                rarity === 'epic' && 'text-purple-400',
                rarity === 'legendary' && 'text-amber-400'
              )}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
            </svg>
          </div>
        )}

        {/* Legendary border glow animation */}
        {rarity === 'legendary' && (
          <div
            className="absolute inset-0 rounded-lg border-2 border-amber-400 opacity-50 animate-ping"
            style={{ animationDuration: '2s' }}
          />
        )}
      </div>
    );
  }
);

ItemReceived.displayName = 'ItemReceived';

/**
 * Hook for managing a queue of item notifications
 */
export function useItemNotificationQueue() {
  const [queue, setQueue] = useState<(ItemReceivedData & { id: string })[]>([]);

  const addItem = React.useCallback((item: ItemReceivedData) => {
    const id = `${item.itemId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setQueue((prev) => [...prev, { ...item, id }]);
  }, []);

  const removeItem = React.useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const currentItem = queue[0] || null;

  return {
    currentItem,
    addItem,
    removeItem: () => currentItem && removeItem(currentItem.id),
    queueLength: queue.length,
  };
}

export { itemContainerVariants, iconContainerVariants, rarityTextVariants };
