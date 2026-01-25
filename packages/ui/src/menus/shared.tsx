/**
 * Shared Menu Components and Utilities
 *
 * Common components, icons, and utilities used across all menu screens.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../primitives/utils';

// ============================================================================
// ICONS
// ============================================================================

export function GearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  );
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BackpackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SaveIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17 21 17 13 7 13 7 21" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="7 3 7 8 12 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LoadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function CoinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function SwordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PotionIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M10 2v6M14 2v6M8 8h8l2 14H6L8 8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KeyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ScrollIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CampfireIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M12 2c-2 2-4 4-4 7 0 3 2 5 4 5s4-2 4-5c0-3-2-5-4-7z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9c-1 1-2 2-2 3.5 0 1.5 1 2.5 2 2.5s2-1 2-2.5c0-1.5-1-2.5-2-3.5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20l3-3M20 20l-3-3M12 17v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function QuitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <polyline points="3 6 5 6 21 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TargetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

// ============================================================================
// MENU BUTTON
// ============================================================================

const menuButtonVariants = cva(
  [
    'relative flex items-center justify-center gap-2 sm:gap-3',
    'w-full min-h-[48px] sm:min-h-[52px] px-4 sm:px-6 py-3',
    'font-medium text-sm sm:text-base tracking-wide uppercase',
    'rounded-lg border-2',
    'transition-all duration-200 ease-out',
    'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-b from-amber-600 to-amber-700',
          'border-amber-500/50 shadow-lg shadow-amber-900/30',
          'text-white',
          'hover:from-amber-500 hover:to-amber-600',
          'focus-visible:ring-amber-500',
        ].join(' '),
        secondary: [
          'bg-stone-800/80',
          'border-stone-600/50',
          'text-stone-200',
          'hover:bg-stone-700/80 hover:border-stone-500/50',
          'focus-visible:ring-stone-500',
        ].join(' '),
        danger: [
          'bg-red-900/80',
          'border-red-700/50',
          'text-red-100',
          'hover:bg-red-800/80 hover:border-red-600/50',
          'focus-visible:ring-red-500',
        ].join(' '),
        ghost: [
          'bg-transparent',
          'border-transparent',
          'text-stone-400',
          'hover:bg-stone-800/50 hover:text-stone-200',
          'focus-visible:ring-stone-500',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  }
);

export interface MenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof menuButtonVariants> {
  icon?: React.ReactNode;
  loading?: boolean;
}

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ className, variant, icon, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(menuButtonVariants({ variant }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
        ) : icon ? (
          <span className="w-5 h-5 sm:w-6 sm:h-6">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);
MenuButton.displayName = 'MenuButton';

// ============================================================================
// MENU OVERLAY
// ============================================================================

export interface MenuOverlayProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function MenuOverlay({ open, onClose, children, transparent, className }: MenuOverlayProps) {
  // Handle escape key
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        transparent ? 'bg-black/60 backdrop-blur-sm' : 'bg-stone-950',
        'animate-in fade-in duration-200',
        className
      )}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

// ============================================================================
// MENU PANEL
// ============================================================================

export interface MenuPanelProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function MenuPanel({ children, className, maxWidth = 'md' }: MenuPanelProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full h-full sm:h-auto',
        maxWidthClasses[maxWidth],
        'mx-auto p-4 sm:p-6',
        'bg-stone-900/95 sm:rounded-xl',
        'border-0 sm:border-2 border-amber-800/30',
        'shadow-2xl',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MENU HEADER
// ============================================================================

export interface MenuHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export function MenuHeader({ title, subtitle, onClose, showCloseButton = true, className }: MenuHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4 sm:mb-6', className)}>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-amber-200 tracking-wide uppercase">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-stone-400 mt-1">{subtitle}</p>}
      </div>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-stone-800/50 text-stone-400 hover:text-stone-200 hover:bg-stone-700/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// MENU DIVIDER
// ============================================================================

export function MenuDivider({ className }: { className?: string }) {
  return <div className={cn('h-px bg-amber-800/30 my-4', className)} />;
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

export interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'green' | 'red' | 'blue' | 'amber' | 'purple';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value,
  max,
  color = 'green',
  showLabel = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full bg-stone-800 overflow-hidden', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-stone-400 mt-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB GROUP
// ============================================================================

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabGroup({ tabs, activeTab, onTabChange, className }: TabGroupProps) {
  return (
    <div
      className={cn(
        'flex gap-1 p-1 rounded-lg bg-stone-800/50 overflow-x-auto',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={cn(
            'flex items-center justify-center gap-1.5 px-3 py-2 rounded-md',
            'text-xs sm:text-sm font-medium whitespace-nowrap',
            'transition-colors duration-150',
            'min-h-[40px] sm:min-h-[36px]',
            activeTab === tab.id
              ? 'bg-amber-700/80 text-amber-100'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-700/50'
          )}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          <span className="hidden xs:inline sm:inline">{tab.label}</span>
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-medium',
                activeTab === tab.id ? 'bg-amber-600/50' : 'bg-stone-700'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// SLIDER CONTROL
// ============================================================================

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  onChange: (value: number) => void;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  label,
  onChange,
  showValue = true,
  formatValue,
  className,
}: SliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString();
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-stone-300">{label}</span>}
          {showValue && <span className="text-sm font-mono text-amber-400">{displayValue}</span>}
        </div>
      )}
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer',
          'bg-stone-700',
          '[&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
          '[&::-webkit-slider-thumb]:rounded-full',
          '[&::-webkit-slider-thumb]:bg-amber-500',
          '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-400',
          '[&::-webkit-slider-thumb]:shadow-lg',
          '[&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5',
          '[&::-moz-range-thumb]:rounded-full',
          '[&::-moz-range-thumb]:bg-amber-500',
          '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-amber-400',
          '[&::-moz-range-thumb]:shadow-lg',
          '[&::-moz-range-thumb]:cursor-pointer'
        )}
        style={{
          background: `linear-gradient(to right, #d97706 0%, #d97706 ${percentage}%, #44403c ${percentage}%, #44403c 100%)`,
        }}
      />
    </div>
  );
}

// ============================================================================
// TOGGLE SWITCH
// ============================================================================

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, disabled, className }: ToggleProps) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-3 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {label && <span className="text-sm text-stone-300">{label}</span>}
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative w-12 h-7 rounded-full transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900',
          checked ? 'bg-amber-600' : 'bg-stone-700'
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md',
            'transition-transform duration-200',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </label>
  );
}

// ============================================================================
// SELECT DROPDOWN
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function Select({ value, options, onChange, label, className }: SelectProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && <label className="block text-sm text-stone-300 mb-2">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg',
          'bg-stone-800 border-2 border-stone-700',
          'text-stone-200 text-sm',
          'focus:outline-none focus:border-amber-600',
          'cursor-pointer appearance-none',
          'min-h-[44px]'
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.25rem',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format playtime in hours and minutes
 */
export function formatPlayTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get rarity color class
 */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'text-yellow-400';
    case 'epic':
      return 'text-purple-400';
    case 'rare':
      return 'text-blue-400';
    case 'uncommon':
      return 'text-green-400';
    default:
      return 'text-stone-300';
  }
}

/**
 * Get rarity background class
 */
export function getRarityBgColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 'epic':
      return 'bg-purple-500/10 border-purple-500/30';
    case 'rare':
      return 'bg-blue-500/10 border-blue-500/30';
    case 'uncommon':
      return 'bg-green-500/10 border-green-500/30';
    default:
      return 'bg-stone-800/50 border-stone-700/50';
  }
}
