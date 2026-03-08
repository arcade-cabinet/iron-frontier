/**
 * AmbientManager.ts - Manages ambient audio layers for Iron Frontier
 *
 * Handles crossfading between ambient soundscapes based on:
 *  - Location context (town vs wilderness)
 *  - Time of day (crickets at night, birds at dawn)
 *  - Weather overlays (wind during dust storms)
 *
 * Builds on top of the existing AmbienceManager (which provides wind + insect
 * chirps) by adding location-aware layer management and smooth transitions.
 *
 * @module services/audio/AmbientManager
 */

import * as Tone from 'tone';
import type { TimeOfDay } from '../../ddl/types';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// PRESETS
// ============================================================================

const ZONE_PRESETS: Record<AmbientZone, AmbientLayerConfig> = {
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
const CROSSFADE_DURATION = 2.5;

// ============================================================================
// AMBIENT MANAGER
// ============================================================================

export class AmbientManager {
  // Active layer
  private activeNoise: Tone.Noise | null = null;
  private activeFilter: Tone.AutoFilter | null = null;
  private activeVolume: Tone.Volume | null = null;

  // Previous layer (fading out)
  private fadingNoise: Tone.Noise | null = null;
  private fadingFilter: Tone.AutoFilter | null = null;
  private fadingVolume: Tone.Volume | null = null;

  // Cricket layer (night ambience)
  private crickets: Tone.PolySynth | null = null;
  private cricketsVolume: Tone.Volume | null = null;
  private cricketTimer: ReturnType<typeof setTimeout> | null = null;

  // Wind overlay (weather)
  private windNoise: Tone.Noise | null = null;
  private windFilter: Tone.AutoFilter | null = null;
  private windVolume: Tone.Volume | null = null;

  private currentZone: AmbientZone = 'wilderness';
  private currentTimeOfDay: TimeOfDay = 'noon';
  private isPlaying = false;

  // -----------------------------------------------------------------------
  // LIFECYCLE
  // -----------------------------------------------------------------------

  /**
   * Start the ambient audio system.
   */
  public start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.buildLayer(this.currentZone);
    this.updateTimeOfDayLayers();
    console.log('[AmbientManager] Started');
  }

  /**
   * Stop all ambient audio and clean up.
   */
  public stop(): void {
    this.isPlaying = false;
    this.disposeActive();
    this.disposeFading();
    this.disposeCrickets();
    this.disposeWind();
    console.log('[AmbientManager] Stopped');
  }

  /**
   * Full teardown - call when unmounting.
   */
  public dispose(): void {
    this.stop();
  }

  // -----------------------------------------------------------------------
  // ZONE TRANSITIONS
  // -----------------------------------------------------------------------

  /**
   * Transition ambient sound to a new zone with a crossfade.
   */
  public setZone(zone: AmbientZone): void {
    if (zone === this.currentZone) return;
    this.currentZone = zone;

    if (!this.isPlaying) return;

    // Move current active layer to fading-out slot
    this.disposeFading();
    this.fadingNoise = this.activeNoise;
    this.fadingFilter = this.activeFilter;
    this.fadingVolume = this.activeVolume;
    this.activeNoise = null;
    this.activeFilter = null;
    this.activeVolume = null;

    // Fade out old layer
    if (this.fadingVolume) {
      this.fadingVolume.volume.rampTo(-60, CROSSFADE_DURATION);
      setTimeout(() => this.disposeFading(), CROSSFADE_DURATION * 1000 + 200);
    }

    // Build and fade in new layer
    this.buildLayer(zone);

    console.log(`[AmbientManager] Zone transition -> ${zone}`);
  }

  // -----------------------------------------------------------------------
  // TIME-OF-DAY MODULATION
  // -----------------------------------------------------------------------

  /**
   * Update ambient layers based on the current time of day.
   * Call this whenever the game clock advances a phase.
   */
  public setTimeOfDay(timeOfDay: TimeOfDay): void {
    if (timeOfDay === this.currentTimeOfDay) return;
    this.currentTimeOfDay = timeOfDay;
    if (!this.isPlaying) return;
    this.updateTimeOfDayLayers();

    console.log(`[AmbientManager] Time of day -> ${timeOfDay}`);
  }

  // -----------------------------------------------------------------------
  // WEATHER OVERLAY
  // -----------------------------------------------------------------------

  /**
   * Set wind intensity for weather effects.
   * @param intensity 0 = no wind, 1 = full dust storm
   */
  public setWindIntensity(intensity: number): void {
    if (intensity <= 0) {
      this.disposeWind();
      return;
    }

    if (!this.isPlaying) return;

    if (!this.windNoise) {
      this.windVolume = new Tone.Volume(-60).toDestination();
      this.windFilter = new Tone.AutoFilter({
        frequency: 0.12,
        depth: 0.7,
        baseFrequency: 150,
        octaves: 3,
      }).connect(this.windVolume);
      this.windNoise = new Tone.Noise('pink').connect(this.windFilter);
      this.windNoise.start();
      this.windFilter.start();
    }

    // Map intensity (0-1) to volume (-40 to -12 dB)
    const targetDb = -40 + intensity * 28;
    this.windVolume!.volume.rampTo(targetDb, 1.5);
  }

  // -----------------------------------------------------------------------
  // PRIVATE - LAYER BUILDING
  // -----------------------------------------------------------------------

  private buildLayer(zone: AmbientZone): void {
    const preset = ZONE_PRESETS[zone];

    this.activeVolume = new Tone.Volume(-60).toDestination();
    this.activeFilter = new Tone.AutoFilter({
      frequency: preset.lfoRate,
      depth: 0.5,
      baseFrequency: preset.filterFreq,
      octaves: 2,
    }).connect(this.activeVolume);
    this.activeNoise = new Tone.Noise(preset.noiseType).connect(this.activeFilter);

    this.activeNoise.start();
    this.activeFilter.start();

    // Fade in
    this.activeVolume.volume.rampTo(preset.baseVolume, CROSSFADE_DURATION);
  }

  private updateTimeOfDayLayers(): void {
    const isNight = this.currentTimeOfDay === 'night' || this.currentTimeOfDay === 'dusk';
    const isDawn = this.currentTimeOfDay === 'dawn';

    if (isNight && this.currentZone !== 'interior') {
      this.startCrickets();
    } else {
      this.fadeCrickets();
    }

    // Adjust base layer brightness for time of day
    if (this.activeVolume && this.activeFilter) {
      const preset = ZONE_PRESETS[this.currentZone];
      let volumeOffset = 0;

      if (isNight) {
        volumeOffset = -4; // Quieter at night
      } else if (isDawn) {
        volumeOffset = -2;
      }

      this.activeVolume.volume.rampTo(preset.baseVolume + volumeOffset, CROSSFADE_DURATION);
      // We can't easily ramp AutoFilter baseFrequency, so we skip filter modulation
      // for now. The cricket/wind layers provide the tonal shift.
    }
  }

  // -----------------------------------------------------------------------
  // PRIVATE - CRICKET LAYER
  // -----------------------------------------------------------------------

  private startCrickets(): void {
    if (this.crickets) return;

    this.cricketsVolume = new Tone.Volume(-60).toDestination();
    this.crickets = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
    }).connect(this.cricketsVolume);

    // Fade in
    this.cricketsVolume.volume.rampTo(-28, CROSSFADE_DURATION);

    this.scheduleCricketChirp();
  }

  private scheduleCricketChirp(): void {
    if (!this.crickets || !this.isPlaying) return;

    const delay = Math.random() * 2 + 0.8; // 0.8-2.8 seconds
    this.cricketTimer = setTimeout(() => {
      if (!this.crickets || !this.isPlaying) return;

      if (Math.random() > 0.4) {
        // Vary the cricket pitch slightly each chirp
        const baseFreq = 5500 + Math.random() * 1500;
        const note1 = Tone.Frequency(baseFreq, 'hz').toNote();
        const note2 = Tone.Frequency(baseFreq * 1.18, 'hz').toNote();
        this.crickets.triggerAttackRelease([note1, note2], '32n');
      }

      this.scheduleCricketChirp();
    }, delay * 1000);
  }

  private fadeCrickets(): void {
    if (!this.cricketsVolume) return;
    this.cricketsVolume.volume.rampTo(-60, CROSSFADE_DURATION);
    setTimeout(() => this.disposeCrickets(), CROSSFADE_DURATION * 1000 + 200);
  }

  // -----------------------------------------------------------------------
  // PRIVATE - DISPOSAL
  // -----------------------------------------------------------------------

  private disposeActive(): void {
    this.activeNoise?.stop();
    this.activeNoise?.dispose();
    this.activeNoise = null;
    this.activeFilter?.stop();
    this.activeFilter?.dispose();
    this.activeFilter = null;
    this.activeVolume?.dispose();
    this.activeVolume = null;
  }

  private disposeFading(): void {
    this.fadingNoise?.stop();
    this.fadingNoise?.dispose();
    this.fadingNoise = null;
    this.fadingFilter?.stop();
    this.fadingFilter?.dispose();
    this.fadingFilter = null;
    this.fadingVolume?.dispose();
    this.fadingVolume = null;
  }

  private disposeCrickets(): void {
    if (this.cricketTimer) {
      clearTimeout(this.cricketTimer);
      this.cricketTimer = null;
    }
    this.crickets?.dispose();
    this.crickets = null;
    this.cricketsVolume?.dispose();
    this.cricketsVolume = null;
  }

  private disposeWind(): void {
    this.windNoise?.stop();
    this.windNoise?.dispose();
    this.windNoise = null;
    this.windFilter?.stop();
    this.windFilter?.dispose();
    this.windFilter = null;
    this.windVolume?.dispose();
    this.windVolume = null;
  }
}
