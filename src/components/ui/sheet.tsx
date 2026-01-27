import React from 'react';
import { cn } from '@/lib/utils';

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ children }, ref) => (
    <div ref={ref}>{children}</div>
  )
);
Sheet.displayName = 'Sheet';

export interface SheetTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-transparent px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  )
);
SheetTrigger.displayName = 'SheetTrigger';

export interface SheetContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'fixed inset-y-0 right-0 z-50 w-3/4 border-l border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950 sm:w-[440px]',
        className
      )}
      {...props}
    />
  )
);
SheetContent.displayName = 'SheetContent';

export interface SheetHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-2', className)}
      {...props}
    />
  )
);
SheetHeader.displayName = 'SheetHeader';

export interface SheetTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const SheetTitle = React.forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
);
SheetTitle.displayName = 'SheetTitle';

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle };
