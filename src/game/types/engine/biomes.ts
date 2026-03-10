// Engine Types - Biome System

import type { Color3Simple } from './coordinates.ts';

// ============================================================================
// BIOME SYSTEM
// ============================================================================

export type BiomeType =
  | 'desert' // Sandy, cacti, mesas
  | 'grassland' // Prairie grass, wildflowers
  | 'badlands' // Rocky, canyons, red earth
  | 'riverside' // Near water, greener
  | 'town' // Developed area, buildings
  | 'railyard' // Industrial, tracks, coal
  | 'mine'; // Rocky, cave entrances, ore veins

export interface BiomeConfig {
  type: BiomeType;
  groundColor: Color3Simple;
  detailColor: Color3Simple;
  vegetationDensity: number;
  rockDensity: number;
  moisture: number;
  temperature: number;
}
