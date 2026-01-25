/**
 * @iron-frontier/ui
 *
 * Shared UI components for Iron Frontier.
 * This package provides platform-agnostic components that work
 * across both web (React DOM) and mobile (React Native) platforms.
 *
 * Usage:
 *
 * For web applications:
 * ```ts
 * import { Button, Card, Text } from '@iron-frontier/ui/web';
 * ```
 *
 * For React Native applications:
 * ```ts
 * import { Button, Card, Text } from '@iron-frontier/ui/native';
 * ```
 *
 * For design tokens only:
 * ```ts
 * import { colors, spacing, theme } from '@iron-frontier/ui/tokens';
 * ```
 *
 * For shared types and utilities:
 * ```ts
 * import { cn, type ButtonProps } from '@iron-frontier/ui';
 * ```
 */

// Re-export primitives (types and utilities)
export * from './primitives';

// Re-export design tokens
export * from './tokens';

// Note: Platform-specific components should be imported from
// their respective entry points:
// - '@iron-frontier/ui/web' for web components
// - '@iron-frontier/ui/native' for React Native components
