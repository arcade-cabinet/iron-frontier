/**
 * @iron-frontier/shared
 *
 * Shared game logic, types, and data for Iron Frontier.
 * Platform-agnostic code that can be used by both web and mobile apps.
 *
 * NOTE: To avoid naming conflicts, import specific modules directly:
 * - '@iron-frontier/shared/data' for game data
 * - '@iron-frontier/shared/store' for state management
 * - '@iron-frontier/shared/hex' for hex grid utilities
 * - '@iron-frontier/shared/rendering' for rendering abstractions
 * - '@iron-frontier/shared/types' for shared types
 */

// Data exports - primary game content
export * from './data';

// Generation exports
export * from './generation';

// Note: hex, store, rendering, and types have conflicting exports with data
// Use direct imports for these modules:
// - '@iron-frontier/shared/hex'
// - '@iron-frontier/shared/store'
// - '@iron-frontier/shared/rendering'
// - '@iron-frontier/shared/types'
