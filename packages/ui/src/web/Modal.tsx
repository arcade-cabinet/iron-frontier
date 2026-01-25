/**
 * Web Modal/Sheet Component
 *
 * Overlay components for dialogs and sliding panels.
 * Uses native dialog element with portal for accessibility.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../primitives/utils';
import type { ModalProps, SheetProps, SheetSide } from '../primitives/types';

/**
 * Overlay backdrop variants
 */
const overlayVariants = cva(
  [
    'fixed inset-0 z-50 bg-obsidian-950/60 backdrop-blur-sm',
    'transition-opacity duration-200',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  ].join(' ')
);

/**
 * Modal content variants
 */
const modalContentVariants = cva(
  [
    'fixed z-50 bg-parchment-50 shadow-xl rounded-lg',
    'transition-all duration-200',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    'w-full max-w-lg max-h-[85vh] overflow-auto',
    'p-6',
  ].join(' ')
);

/**
 * Sheet content variants based on side
 */
const sheetContentVariants = cva(
  [
    'fixed z-50 bg-parchment-50 shadow-xl',
    'transition-all duration-300 ease-out',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
  ].join(' '),
  {
    variants: {
      side: {
        top: [
          'inset-x-0 top-0 border-b-2 border-leather-300',
          'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
          'rounded-b-lg',
        ].join(' '),
        right: [
          'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l-2 border-leather-300',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'rounded-l-lg',
        ].join(' '),
        bottom: [
          'inset-x-0 bottom-0 border-t-2 border-leather-300',
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          'rounded-t-lg',
        ].join(' '),
        left: [
          'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r-2 border-leather-300',
          'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
          'rounded-r-lg',
        ].join(' '),
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

/**
 * Close button component
 */
const CloseButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'absolute right-4 top-4',
      'rounded-sm opacity-70 transition-opacity hover:opacity-100',
      'focus:outline-none focus:ring-2 focus:ring-bronze-500 focus:ring-offset-2',
      'disabled:pointer-events-none'
    )}
    aria-label="Close"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 text-obsidian-600"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  </button>
);

/**
 * Modal Header component
 */
export const ModalHeader: React.FC<{
  title?: string;
  description?: string;
  className?: string;
}> = ({ title, description, className }) => {
  if (!title && !description) return null;

  return (
    <div className={cn('mb-4', className)}>
      {title && (
        <h2 className="text-xl font-semibold text-obsidian-900">{title}</h2>
      )}
      {description && (
        <p className="mt-1 text-sm text-obsidian-600">{description}</p>
      )}
    </div>
  );
};

export type WebModalProps = ModalProps & React.HTMLAttributes<HTMLDivElement>;

/**
 * Modal component for web platform
 */
export const Modal: React.FC<WebModalProps> = ({
  open,
  onClose,
  title,
  description,
  closeOnOverlayClick = true,
  showCloseButton = true,
  children,
  className,
  testID,
  ...props
}) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Lock body scroll when open
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
    <div role="dialog" aria-modal="true" data-testid={testID}>
      {/* Overlay */}
      <div
        className={overlayVariants()}
        data-state={open ? 'open' : 'closed'}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={cn(modalContentVariants(), className)}
        data-state={open ? 'open' : 'closed'}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {showCloseButton && <CloseButton onClick={onClose} />}
        <ModalHeader title={title} description={description} />
        {children}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

export type WebSheetProps = SheetProps &
  React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof sheetContentVariants>;

/**
 * Sheet component for sliding panels
 */
export const Sheet: React.FC<WebSheetProps> = ({
  open,
  onClose,
  side = 'right',
  title,
  description,
  closeOnOverlayClick = true,
  showCloseButton = true,
  children,
  className,
  testID,
  ...props
}) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Lock body scroll when open
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
    <div role="dialog" aria-modal="true" data-testid={testID}>
      {/* Overlay */}
      <div
        className={overlayVariants()}
        data-state={open ? 'open' : 'closed'}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={cn(sheetContentVariants({ side }), 'p-6', className)}
        data-state={open ? 'open' : 'closed'}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {showCloseButton && <CloseButton onClick={onClose} />}
        <ModalHeader title={title} description={description} />
        {children}
      </div>
    </div>
  );
};

Sheet.displayName = 'Sheet';

export { overlayVariants, modalContentVariants, sheetContentVariants };
