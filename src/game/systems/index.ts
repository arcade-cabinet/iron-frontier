/**
 * Game Systems - Master Barrel
 *
 * Re-exports all game systems from domain-specific sub-barrels.
 * Import from sub-barrels directly for smaller bundles, or from
 * this barrel for convenience.
 *
 * @module systems
 */

// Survival: time, fatigue, provisions, camping, survivalStore
export * from './survival.barrel.ts';

// World: encounters, travel, save, spatial, zones, collisions, boundaries
export * from './world.barrel.ts';

// Quest & Dialogue: events, wiring, markers, dialogue bridge
export * from './quest.barrel.ts';

// NPC & Interaction: interaction, interior, schedule, movement, doors
export * from './npc.barrel.ts';
