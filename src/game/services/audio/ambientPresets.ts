// ambientPresets — Zone presets and types for the AmbientManager.

export type AmbientZone = 'town' | 'wilderness' | 'interior' | 'combat';

export interface AmbientLayerConfig {
  /** Noise type for the underlying drone. */
  noiseType: 'white' | 'pink' | 'brown';
  /** Base volume in dB for this layer. */
  baseVolume: number;
  /** Low-pass filter cutoff (Hz). Warmer = lower. */
  filterFreq: number;
  /** Auto-filter LFO speed for movement (Hz). */
  lfoRate: number;
}

export const ZONE_PRESETS: Record<AmbientZone, AmbientLayerConfig> = {
  town: {
    noiseType: 'pink',
    baseVolume: -28,
    filterFreq: 400,
    lfoRate: 0.05,
  },
  wilderness: {
    noiseType: 'pink',
    baseVolume: -22,
    filterFreq: 300,
    lfoRate: 0.08,
  },
  interior: {
    noiseType: 'brown',
    baseVolume: -32,
    filterFreq: 250,
    lfoRate: 0.03,
  },
  combat: {
    noiseType: 'white',
    baseVolume: -26,
    filterFreq: 600,
    lfoRate: 0.15,
  },
};

/** Duration of crossfade transitions in seconds. */
export const CROSSFADE_DURATION = 2.5;
