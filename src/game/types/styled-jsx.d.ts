import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
    // @ts-expect-error: Styled JSX uses arbitrary properties that don't have proper TypeScript definitions
    [key: string]: any;
  }
}
