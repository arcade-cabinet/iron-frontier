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
 */

// Data exports - primary game content
export * from './data';

// Types exports - includes spatial types that may overlap with data
// Import './types' directly for type declarations
export * from './types';

// Generation exports
export * from './generation';

// Note: hex, store, and rendering have conflicting exports with data
// Use direct imports for these modules:
// - '@iron-frontier/shared/hex'
// - '@iron-frontier/shared/store'
// - '@iron-frontier/shared/rendering'

// Rendering module is NOT re-exported here to avoid React dependency issues
// Import directly: import { ... } from '@iron-frontier/shared/rendering'
