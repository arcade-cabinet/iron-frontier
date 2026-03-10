/**
 * InteriorGenerator metadata registry — Interior layouts for all building archetypes.
 *
 * @module engine/interiors/InteriorGenerator/metadata
 */

import type { InteriorMetadata } from './types.ts';

// ============================================================================
// ARCHETYPE INTERIOR METADATA REGISTRY
// ============================================================================

/**
 * Registry of interior metadata by archetype type key.
 * Each entry describes the physical layout for door placement,
 * NPC positioning, and interior lighting.
 */
export const INTERIOR_METADATA: Record<string, InteriorMetadata> = {
  saloon: {
    dimensions: { width: 12, depth: 8, wallHeight: 5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 4, width: 1.6, height: 2.2 },
    npcPositions: [
      { x: 0, z: -2.5, y: 0, role: 'bartender', behindCounter: true },
      { x: -3, z: 1, y: 0, role: 'gambler', behindCounter: false },
      { x: 3, z: 1, y: 0, role: 'drifter', behindCounter: false },
    ],
    ambientColor: 0xffcc88,
    ambientIntensity: 0.3,
    lightPositions: [
      { x: 0, y: 3.5, z: 0, color: 0xffcc88, intensity: 0.6, distance: 10 },
      { x: -4, y: 2.8, z: 0, color: 0xffaa66, intensity: 0.3, distance: 5 },
      { x: 4, y: 2.8, z: 0, color: 0xffaa66, intensity: 0.3, distance: 5 },
    ],
  },

  general_store: {
    dimensions: { width: 10, depth: 8, wallHeight: 4.5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 4, width: 1.4, height: 2.1 },
    npcPositions: [
      { x: 0, z: -2.5, y: 0, role: 'merchant', behindCounter: true },
    ],
    ambientColor: 0xffddaa,
    ambientIntensity: 0.35,
    lightPositions: [
      { x: 0, y: 3.2, z: 0, color: 0xffddaa, intensity: 0.5, distance: 8 },
    ],
  },

  sheriff_office: {
    dimensions: { width: 9, depth: 7, wallHeight: 4, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 3.5, width: 1.1, height: 2.1 },
    npcPositions: [
      { x: -1.5, z: 1.0, y: 0, role: 'sheriff', behindCounter: false },
      { x: 2.0, z: -1.0, y: 0, role: 'deputy', behindCounter: false },
    ],
    ambientColor: 0xffcc88,
    ambientIntensity: 0.3,
    lightPositions: [
      { x: 0, y: 2.8, z: 0, color: 0xffcc88, intensity: 0.5, distance: 7 },
    ],
  },

  bank: {
    dimensions: { width: 10, depth: 8, wallHeight: 5, wallThick: 0.25, foundationHeight: 0.6 },
    door: { x: 0, z: 4, width: 1.2, height: 2.3 },
    npcPositions: [
      { x: 0, z: -2.0, y: 0.6, role: 'banker', behindCounter: true },
    ],
    ambientColor: 0xffddcc,
    ambientIntensity: 0.35,
    lightPositions: [
      { x: 0, y: 3.5, z: 0, color: 0xffddcc, intensity: 0.5, distance: 8 },
      { x: 2.5, y: 2.5, z: -2.0, color: 0xffaa66, intensity: 0.3, distance: 4 },
    ],
  },

  inn: {
    dimensions: { width: 10, depth: 8, wallHeight: 6.5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 4, width: 1.2, height: 2.1 },
    npcPositions: [
      { x: -1.5, z: 1.5, y: 0, role: 'innkeeper', behindCounter: true },
    ],
    ambientColor: 0xffcc88,
    ambientIntensity: 0.3,
    lightPositions: [
      { x: 0, y: 2.5, z: 0, color: 0xffcc88, intensity: 0.6, distance: 8 },
      { x: 0, y: 5.5, z: 0, color: 0xffcc88, intensity: 0.4, distance: 6 },
    ],
  },

  church: {
    dimensions: { width: 8, depth: 12, wallHeight: 5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 6, width: 1.2, height: 2.5 },
    npcPositions: [
      { x: 0, z: -5.0, y: 0, role: 'preacher', behindCounter: false },
    ],
    ambientColor: 0xffeedd,
    ambientIntensity: 0.25,
    lightPositions: [
      { x: 0, y: 3.5, z: -3, color: 0xffeedd, intensity: 0.4, distance: 10 },
      { x: -2.5, y: 3.0, z: 0, color: 0xffddaa, intensity: 0.2, distance: 5 },
      { x: 2.5, y: 3.0, z: 0, color: 0xffddaa, intensity: 0.2, distance: 5 },
    ],
  },

  blacksmith: {
    dimensions: { width: 10, depth: 8, wallHeight: 4.5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 4, width: 2.0, height: 4.3 }, // Open front
    npcPositions: [
      { x: 0.5, z: 1.0, y: 0, role: 'blacksmith', behindCounter: false },
    ],
    ambientColor: 0xff6633,
    ambientIntensity: 0.2,
    lightPositions: [
      { x: -2.5, y: 1.5, z: -2.0, color: 0xff4400, intensity: 0.8, distance: 5 },
      { x: 2.0, y: 3.0, z: 0, color: 0xffaa66, intensity: 0.3, distance: 5 },
    ],
  },

  doctor_office: {
    dimensions: { width: 8, depth: 7, wallHeight: 4, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 3.5, width: 1.0, height: 2.0 },
    npcPositions: [
      { x: -2.0, z: 1.0, y: 0, role: 'doctor', behindCounter: false },
    ],
    ambientColor: 0xffffff,
    ambientIntensity: 0.4,
    lightPositions: [
      { x: 0, y: 2.8, z: 0, color: 0xffffff, intensity: 0.5, distance: 7 },
    ],
  },

  newspaper: {
    dimensions: { width: 9, depth: 7, wallHeight: 4, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 3.5, width: 1.1, height: 2.0 },
    npcPositions: [
      { x: -2.0, z: 1.0, y: 0, role: 'editor', behindCounter: false },
    ],
    ambientColor: 0xffddaa,
    ambientIntensity: 0.35,
    lightPositions: [
      { x: 0, y: 2.8, z: 0, color: 0xffddaa, intensity: 0.5, distance: 7 },
    ],
  },

  mining_office: {
    dimensions: { width: 8, depth: 7, wallHeight: 4, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 3.5, width: 1.0, height: 1.9 },
    npcPositions: [
      { x: 0, z: -0.5, y: 0, role: 'mining_foreman', behindCounter: false },
    ],
    ambientColor: 0xffcc88,
    ambientIntensity: 0.3,
    lightPositions: [
      { x: 0, y: 2.8, z: 0, color: 0xffcc88, intensity: 0.5, distance: 7 },
    ],
  },

  livery: {
    dimensions: { width: 12, depth: 10, wallHeight: 5, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 5, width: 3.5, height: 2.8 },
    npcPositions: [
      { x: 0, z: 2.0, y: 0, role: 'stablehand', behindCounter: false },
    ],
    ambientColor: 0xffcc88,
    ambientIntensity: 0.2,
    lightPositions: [
      { x: 0, y: 3.5, z: 0, color: 0xffaa66, intensity: 0.4, distance: 10 },
    ],
  },

  telegraph_office: {
    dimensions: { width: 6, depth: 5, wallHeight: 3.5, wallThick: 0.18, foundationHeight: 0 },
    door: { x: 0, z: 2.5, width: 0.9, height: 1.9 },
    npcPositions: [
      { x: 0, z: -1.2, y: 0, role: 'telegraph_operator', behindCounter: false },
    ],
    ambientColor: 0xffddaa,
    ambientIntensity: 0.35,
    lightPositions: [
      { x: 0, y: 2.5, z: 0, color: 0xffddaa, intensity: 0.5, distance: 5 },
    ],
  },

  undertaker: {
    dimensions: { width: 8, depth: 7, wallHeight: 4, wallThick: 0.2, foundationHeight: 0 },
    door: { x: 0, z: 3.5, width: 1.0, height: 2.0 },
    npcPositions: [
      { x: 2.0, z: -2.0, y: 0, role: 'undertaker', behindCounter: false },
    ],
    ambientColor: 0xccaa88,
    ambientIntensity: 0.2,
    lightPositions: [
      { x: 0, y: 2.8, z: 0, color: 0xccaa88, intensity: 0.4, distance: 7 },
    ],
  },

  barber: {
    dimensions: { width: 7, depth: 6, wallHeight: 3.8, wallThick: 0.18, foundationHeight: 0 },
    door: { x: 0, z: 3, width: 0.9, height: 1.9 },
    npcPositions: [
      { x: -1.2, z: -0.5, y: 0, role: 'barber', behindCounter: false },
    ],
    ambientColor: 0xffeedd,
    ambientIntensity: 0.35,
    lightPositions: [
      { x: 0, y: 2.6, z: 0, color: 0xffeedd, intensity: 0.5, distance: 6 },
    ],
  },
};
