/**
 * Utils - Re-export from shared package
 *
 * This keeps the @/lib/utils import pattern working for shadcn components
 * while the actual implementation lives in packages/shared.
 */
export { cn } from '@iron-frontier/shared/lib';
