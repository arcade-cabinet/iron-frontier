/**
 * QuickActions Component
 *
 * Displays keyboard shortcut hints and touch-friendly action buttons.
 * Located at the bottom-center of the HUD.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import { BackpackIcon, MapIcon, CampfireIcon, MenuIcon } from './icons';
import { useKeyboardShortcut, useIsTouchDevice } from './hooks';
import type { QuickAction } from './types';

const quickActionsVariants = cva(
  [
    'px-3 py-2 rounded-lg',
    'bg-amber-950/80 backdrop-blur-sm',
    'border border-amber-800/50',
    'shadow-lg',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const actionButtonVariants = cva(
  [
    'flex flex-col items-center justify-center gap-1',
    'px-3 py-2 rounded-md',
    'transition-all duration-150',
    'outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
  ].join(' '),
  {
    variants: {
      state: {
        default: [
          'bg-amber-900/40 hover:bg-amber-800/60',
          'text-amber-200 hover:text-amber-100',
          'active:bg-amber-700/60',
        ].join(' '),
        disabled: 'bg-amber-900/20 text-amber-500/50 cursor-not-allowed',
      },
      touch: {
        true: 'min-w-[56px] min-h-[56px]', // 56px minimum touch target
        false: 'min-w-[48px] min-h-[44px]',
      },
    },
    defaultVariants: {
      state: 'default',
      touch: false,
    },
  }
);

export interface QuickActionsProps extends VariantProps<typeof quickActionsVariants> {
  /** Action handlers */
  onInventory?: () => void;
  onMap?: () => void;
  onCamp?: () => void;
  onMenu?: () => void;
  /** Disabled states */
  inventoryDisabled?: boolean;
  mapDisabled?: boolean;
  campDisabled?: boolean;
  menuDisabled?: boolean;
  /** Whether keyboard shortcuts are enabled */
  shortcutsEnabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Layout direction */
  layout?: 'horizontal' | 'vertical';
  /** Whether to show keyboard hints */
  showKeyboardHints?: boolean;
}

/**
 * Default quick action icons
 */
const DEFAULT_ICONS: Record<string, React.ReactNode> = {
  inventory: <BackpackIcon className="w-5 h-5" />,
  map: <MapIcon className="w-5 h-5" />,
  camp: <CampfireIcon className="w-5 h-5" />,
  menu: <MenuIcon className="w-5 h-5" />,
};

/**
 * Individual action button
 */
interface ActionButtonProps {
  action: QuickAction;
  isTouch: boolean;
  showKeyboardHint: boolean;
}

function ActionButton({ action, isTouch, showKeyboardHint }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={action.onPress}
      disabled={action.disabled}
      className={actionButtonVariants({
        state: action.disabled ? 'disabled' : 'default',
        touch: isTouch,
      })}
      aria-label={action.label}
      title={`${action.label} (${action.shortcut.toUpperCase()})`}
    >
      {action.icon ? (
        <span aria-hidden="true">{action.icon}</span>
      ) : (
        DEFAULT_ICONS[action.id] || null
      )}
      {/* Keyboard hint */}
      {showKeyboardHint && !isTouch && (
        <span className="text-[0.7em] text-amber-400/70 font-mono">
          [{action.shortcut.toUpperCase()}]
        </span>
      )}
      {/* Label for touch devices */}
      {isTouch && <span className="text-[0.7em] mt-0.5">{action.label}</span>}
    </button>
  );
}

/**
 * QuickActions component for the game HUD
 */
export function QuickActions({
  onInventory,
  onMap,
  onCamp,
  onMenu,
  inventoryDisabled = false,
  mapDisabled = false,
  campDisabled = false,
  menuDisabled = false,
  shortcutsEnabled = true,
  size,
  layout = 'horizontal',
  showKeyboardHints = true,
  className,
}: QuickActionsProps) {
  const isTouch = useIsTouchDevice();

  // Build actions array
  const actions: QuickAction[] = React.useMemo(
    () => [
      {
        id: 'inventory',
        label: 'Inventory',
        shortcut: 'i',
        disabled: inventoryDisabled,
        onPress: onInventory || (() => {}),
      },
      {
        id: 'map',
        label: 'Map',
        shortcut: 'm',
        disabled: mapDisabled,
        onPress: onMap || (() => {}),
      },
      {
        id: 'camp',
        label: 'Camp',
        shortcut: 'c',
        disabled: campDisabled,
        onPress: onCamp || (() => {}),
      },
      {
        id: 'menu',
        label: 'Menu',
        shortcut: 'escape',
        disabled: menuDisabled,
        onPress: onMenu || (() => {}),
      },
    ],
    [
      onInventory,
      onMap,
      onCamp,
      onMenu,
      inventoryDisabled,
      mapDisabled,
      campDisabled,
      menuDisabled,
    ]
  );

  // Build keyboard shortcuts map
  const shortcuts = React.useMemo(() => {
    const map = new Map<string, () => void>();
    for (const action of actions) {
      if (!action.disabled) {
        map.set(action.shortcut, action.onPress);
      }
    }
    return map;
  }, [actions]);

  // Register keyboard shortcuts
  useKeyboardShortcut(shortcuts, shortcutsEnabled && !isTouch);

  return (
    <nav
      className={cn(quickActionsVariants({ size }), className)}
      role="toolbar"
      aria-label="Quick actions"
    >
      <div
        className={cn(
          'flex gap-1',
          layout === 'vertical' ? 'flex-col' : 'flex-row'
        )}
      >
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            isTouch={isTouch}
            showKeyboardHint={showKeyboardHints}
          />
        ))}
      </div>
    </nav>
  );
}

export { quickActionsVariants, actionButtonVariants };
