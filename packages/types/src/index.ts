/**
 * @iron-frontier/types
 *
 * Pure TypeScript type definitions for the Iron Frontier game.
 * This package contains NO runtime code - only types, interfaces, and type aliases.
 *
 * For runtime values (constants, functions), use @iron-frontier/shared.
 * For Zod schemas with validation, use @iron-frontier/schemas.
 */

// Engine types - coordinates, structures, biomes, NPCs, items
export * from './engine';

// Game types - phases, combat, quests, inventory, saves
export * from './game';

// AI types - YukaJS-based AI system types
export * from './ai';
