/**
 * @iron-frontier/shared
 *
 * Shared game logic, types, and data for Iron Frontier.
 * Platform-agnostic code that can be used by both web and mobile apps.
 *
 * NOTE: To avoid naming conflicts, import specific modules directly:
 * - '@/data' for game data
 * - '@/store' for state management
 * - '@/hex' for hex grid utilities
 * - '@/rendering' for rendering abstractions
 * - '@/types' for shared types
 */

// Data exports - primary game content
export * from './data';

// Generation exports
export * from './generation';

// Note: hex, store, rendering, and types have conflicting exports with data
// Use direct imports for these modules:
// - '@/hex'
// - '@/store'
// - '@/rendering'
// - '@/types'
