// Type declarations for JSX components to suppress errors
import type React from 'react';

declare module './document.jsx' {
  const Document: React.FC<Record<string, unknown>>;
  export default Document;
  export const Html: React.FC<Record<string, unknown>>;
  export const Head: React.FC<Record<string, unknown>>;
  export const Main: React.FC<Record<string, unknown>>;
  export const NextScript: React.FC<Record<string, unknown>>;
}

declare module './dynamic.jsx' {
  const dynamic: <P = Record<string, unknown>>(
    importFunc: () => Promise<{ default: React.ComponentType<P> }>,
    options?: { ssr?: boolean; loading?: React.ComponentType }
  ) => React.ComponentType<P>;
  export default dynamic;
}

declare module './font.jsx' {
  export const Roboto: (options?: Record<string, unknown>) => {
    className: string;
    style: Record<string, unknown>;
  };
}

declare module './head.jsx' {
  const Head: React.FC<{ children?: React.ReactNode }>;
  export default Head;
}

declare module './image.jsx' {
  const Image: React.FC<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  } & Record<string, unknown>>;
  export default Image;
}

declare module './link.jsx' {
  const Link: React.FC<{
    href: string;
    children?: React.ReactNode;
  } & Record<string, unknown>>;
  export default Link;
}

declare module './navigation.jsx' {
  export function useSearchParams(): URLSearchParams;
  export function useParams(): Record<string, string>;
}

declare module './router.jsx' {
  export function useRouter(): {
    push: (path: string) => void;
    replace: (path: string) => void;
    back: () => void;
    pathname: string;
  };
  export function usePathname(): string;
  export const RouterProvider: React.FC<{ children?: React.ReactNode }>;
}

declare module './script.jsx' {
  const Script: React.FC<{
    src: string;
    strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  } & Record<string, unknown>>;
  export default Script;
}
