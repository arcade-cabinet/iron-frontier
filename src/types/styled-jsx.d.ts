import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
    // @ts-ignore: Styled JSX compatibility
    [key: string]: any;
  }
}
