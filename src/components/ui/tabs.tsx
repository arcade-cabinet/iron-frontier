import React from 'react';
import { cn } from '@/lib/utils';

export interface TabsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => (
    <div ref={ref} className={cn('w-full', className)} {...props}>
      {children}
    </div>
  )
);
Tabs.displayName = 'Tabs';

export interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50',
        className
      )}
      {...props}
    />
  )
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  )
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
