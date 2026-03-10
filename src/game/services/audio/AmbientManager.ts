/**
 * AmbientManager.ts - Manages ambient audio layers for Iron Frontier
 *
 * Handles crossfading between ambient soundscapes based on location context,
 * time of day, and weather overlays.
 *
 * @module services/audio/AmbientManager
 */

import * as Tone from 'tone';
import type { TimeOfDay } from '../../ddl/types';
import { scopedRNG, rngTick } from '../../lib/prng';

export type { AmbientZone, AmbientLayerConfig } from './ambientPresets';
import type { AmbientZone } from './ambientPresets';
import { ZONE_PRESETS, CROSSFADE_DURATION } from './ambientPresets';

export class AmbientManager {
  private activeNoise: Tone.Noise | null = null;
  private activeFilter: Tone.AutoFilter | null = null;
  private activeVolume: Tone.Volume | null = null;
  private fadingNoise: Tone.Noise | null = null;
  private fadingFilter: Tone.AutoFilter | null = null;
  private fadingVolume: Tone.Volume | null = null;
  private crickets: Tone.PolySynth | null = null;
  private cricketsVolume: Tone.Volume | null = null;
  private cricketTimer: ReturnType<typeof setTimeout> | null = null;
  private windNoise: Tone.Noise | null = null;
  private windFilter: Tone.AutoFilter | null = null;
  private windVolume: Tone.Volume | null = null;
  private currentZone: AmbientZone = 'wilderness';
  private currentTimeOfDay: TimeOfDay = 'noon';
  private isPlaying = false;

  public start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.buildLayer(this.currentZone);
    this.updateTimeOfDayLayers();
    console.log('[AmbientManager] Started');
  }

  public stop(): void {
    this.isPlaying = false;
    this.disposeActive();
    this.disposeFading();
    this.disposeCrickets();
    this.disposeWind();
    console.log('[AmbientManager] Stopped');
  }

  public dispose(): void {
    this.stop();
  }

  public setZone(zone: AmbientZone): void {
    if (zone === this.currentZone) return;
    this.currentZone = zone;
    if (!this.isPlaying) return;

    this.disposeFading();
    this.fadingNoise = this.activeNoise;
    this.fadingFilter = this.activeFilter;
    this.fadingVolume = this.activeVolume;
    this.activeNoise = null;
    this.activeFilter = null;
    this.activeVolume = null;

    if (this.fadingVolume) {
      this.fadingVolume.volume.rampTo(-60, CROSSFADE_DURATION);
      setTimeout(() => this.disposeFading(), CROSSFADE_DURATION * 1000 + 200);
    }

    this.buildLayer(zone);
    console.log(`[AmbientManager] Zone transition -> ${zone}`);
  }

  public setTimeOfDay(timeOfDay: TimeOfDay): void {
    if (timeOfDay === this.currentTimeOfDay) return;
    this.currentTimeOfDay = timeOfDay;
    if (!this.isPlaying) return;
    this.updateTimeOfDayLayers();
    console.log(`[AmbientManager] Time of day -> ${timeOfDay}`);
  }

  public setWindIntensity(intensity: number): void {
    if (intensity <= 0) { this.disposeWind(); return; }
    if (!this.isPlaying) return;

    if (!this.windNoise) {
      this.windVolume = new Tone.Volume(-60).toDestination();
      this.windFilter = new Tone.AutoFilter({
        frequency: 0.12, depth: 0.7, baseFrequency: 150, octaves: 3,
      }).connect(this.windVolume);
      this.windNoise = new Tone.Noise('pink').connect(this.windFilter);
      this.windNoise.start();
      this.windFilter.start();
    }

    const targetDb = -40 + intensity * 28;
    this.windVolume!.volume.rampTo(targetDb, 1.5);
  }

  private buildLayer(zone: AmbientZone): void {
    const preset = ZONE_PRESETS[zone];
    this.activeVolume = new Tone.Volume(-60).toDestination();
    this.activeFilter = new Tone.AutoFilter({
      frequency: preset.lfoRate, depth: 0.5, baseFrequency: preset.filterFreq, octaves: 2,
    }).connect(this.activeVolume);
    this.activeNoise = new Tone.Noise(preset.noiseType).connect(this.activeFilter);
    this.activeNoise.start();
    this.activeFilter.start();
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

    if (this.activeVolume && this.activeFilter) {
      const preset = ZONE_PRESETS[this.currentZone];
      let volumeOffset = 0;
      if (isNight) volumeOffset = -4;
      else if (isDawn) volumeOffset = -2;
      this.activeVolume.volume.rampTo(preset.baseVolume + volumeOffset, CROSSFADE_DURATION);
    }
  }

  private startCrickets(): void {
    if (this.crickets) return;
    this.cricketsVolume = new Tone.Volume(-60).toDestination();
    this.crickets = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
    }).connect(this.cricketsVolume);
    this.cricketsVolume.volume.rampTo(-28, CROSSFADE_DURATION);
    this.scheduleCricketChirp();
  }

  private scheduleCricketChirp(): void {
    if (!this.crickets || !this.isPlaying) return;
    const delay = scopedRNG('audio', 42, rngTick()) * 2 + 0.8;
    this.cricketTimer = setTimeout(() => {
      if (!this.crickets || !this.isPlaying) return;
      if (scopedRNG('audio', 42, rngTick()) > 0.4) {
        const baseFreq = 5500 + scopedRNG('audio', 42, rngTick()) * 1500;
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
    if (this.cricketTimer) { clearTimeout(this.cricketTimer); this.cricketTimer = null; }
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
