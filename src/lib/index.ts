/**
 * Shared utility functions
 */

export { cn } from './utils';

// Platform-specific database export
// Metro bundler will automatically resolve .web.ts or .native.ts based on platform
export { database } from './database';
export type { Database } from './database';

