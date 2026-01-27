// Next.js component type definitions - permissive types
import React from 'react';

// Document components
export const Document: React.ComponentType<Record<string, unknown>>;
export const Html: React.ComponentType<Record<string, unknown>>;
export const Head: React.ComponentType<Record<string, unknown>>;
export const Main: React.ComponentType<Record<string, unknown>>;
export const NextScript: React.ComponentType<Record<string, unknown>>;

// Dynamic import
export function dynamic<P = Record<string, unknown>>(
  dynamicOptions: () => Promise<{ default: React.ComponentType<P> }>,
  options?: { ssr?: boolean; loading?: React.ComponentType }
): React.ComponentType<P>;

// Font
export const Roboto: (options?: Record<string, unknown>) => {
  className: string;
  style: Record<string, unknown>;
};

// Image component
export const Image: React.ComponentType<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
} & Record<string, unknown>>;

// Link component
export const Link: React.ComponentType<{
  href: string;
  children?: React.ReactNode;
} & Record<string, unknown>>;

// Navigation hooks
export function useSearchParams(): URLSearchParams;
export function useParams(): Record<string, string>;

// Router hooks and provider
export function useRouter(): {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  pathname: string;
};
export function usePathname(): string;
export const RouterProvider: React.ComponentType<{
  children?: React.ReactNode;
}>;

// Script component
export const Script: React.ComponentType<{
  src: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
} & Record<string, unknown>>;
