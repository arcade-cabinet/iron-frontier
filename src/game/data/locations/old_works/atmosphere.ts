import type { Location } from '../../schemas/spatial.ts';

export const oldWorksAtmosphere: NonNullable<Location['atmosphere']> = {
  dangerLevel: 8, // Very dangerous - final dungeon
  wealthLevel: 7, // Valuable Civil War artifacts
  populationDensity: 'sparse', // Only automatons remain
  lawLevel: 'lawless', // No law here - machine law

  sound: {
    base: 'industrial_hum',
    accents: ['steam_hiss', 'pickaxe_clink'],
  },

  lighting: {
    lanternPositions: [
      { x: 120, y: 3, z: 180 },  // Entry hall
      { x: 120, y: 3, z: 136 },  // Assembly hall center
      { x: 68, y: 3, z: 132 },   // Power station
      { x: 120, y: 3, z: 92 },   // Command center
      { x: 176, y: 3, z: 136 },  // Barracks
      { x: 164, y: 3, z: 92 },   // Armory entrance
    ],
    litWindows: [],
    campfires: [],
    peakActivity: 'night', // Automatons never sleep
  },

  weather: {
    dominant: 'foggy',
    variability: 'static',
    particleEffect: 'ash',
  },
};
