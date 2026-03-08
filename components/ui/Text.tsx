import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';
import { cn } from '@/lib/utils';

const textVariants = cva(
  cn(
    'text-base text-foreground font-body',
    Platform.select({
      web: 'select-text',
    }),
  ),
  {
    variants: {
      variant: {
        default: '',
        heading: cn(
          'text-2xl font-bold tracking-tight font-heading',
          Platform.select({ web: 'scroll-m-20' }),
        ),
        subheading: cn(
          'text-lg font-semibold tracking-tight font-heading',
          Platform.select({ web: 'scroll-m-20' }),
        ),
        body: 'text-base leading-7 font-body',
        caption: 'text-xs text-muted-foreground font-body',
        label: 'text-sm font-medium leading-none font-body',
        h1: cn(
          'text-center text-4xl font-extrabold tracking-tight font-display',
          Platform.select({ web: 'scroll-m-20 text-balance' }),
        ),
        h2: cn(
          'border-b border-border pb-2 text-3xl font-semibold tracking-tight font-heading',
          Platform.select({ web: 'scroll-m-20 first:mt-0' }),
        ),
        h3: cn(
          'text-2xl font-semibold tracking-tight font-heading',
          Platform.select({ web: 'scroll-m-20' }),
        ),
        h4: cn(
          'text-xl font-semibold tracking-tight font-heading',
          Platform.select({ web: 'scroll-m-20' }),
        ),
        p: 'mt-3 leading-7 sm:mt-6',
        lead: 'text-xl text-muted-foreground',
        large: 'text-lg font-semibold',
        small: 'text-sm font-medium leading-none',
        muted: 'text-sm text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  heading: 'heading',
  subheading: 'heading',
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  heading: '2',
  subheading: '3',
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
};

const TextClassContext = React.createContext<string | undefined>(undefined);

type TextProps = React.ComponentProps<typeof RNText> &
  TextVariantProps &
  React.RefAttributes<RNText>;

function Text({ className, variant = 'default', ...props }: TextProps) {
  const textClass = React.useContext(TextClassContext);
  return (
    <RNText
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext, textVariants };
export type { TextProps };
