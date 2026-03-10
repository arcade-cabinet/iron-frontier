/**
 * Test Town - Atmosphere
 *
 * Sound, lighting, and weather for this environment.
 */

export const testTownAtmosphere = {
  dangerLevel: 1,
  wealthLevel: 4,
  populationDensity: 'sparse',
  lawLevel: 'frontier',

  sound: {
    base: 'desert_wind',
    accents: ['horse_whinny', 'piano_distant', 'dog_bark'],
  },

  lighting: {
    lanternPositions: [
      { x: 48, y: 3, z: 40 },   // Saloon porch lantern
      { x: 32, y: 3, z: 42 },   // Sheriff office porch lantern
      { x: 64, y: 3, z: 40 },   // General store porch lantern
      { x: 48, y: 2, z: 28 },   // Well area lantern post
    ],
    litWindows: ['saloon_main', 'sheriff_office'],
    campfires: [],
    peakActivity: 'afternoon',
  },

  weather: {
    dominant: 'clear',
    variability: 'mild',
    particleEffect: 'dust_light',
  },
};
