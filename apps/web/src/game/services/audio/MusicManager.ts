/**
 * MusicManager.ts - Generative Western music system for Iron Frontier
 *
 * Creates procedural Western-style ambient music using Tone.js synthesis.
 * Supports multiple moods: exploration day/night, combat, town, camp.
 */

import * as Tone from 'tone';

export type MusicState =
  | 'exploration_day'
  | 'exploration_night'
  | 'combat'
  | 'combat_intense'
  | 'town'
  | 'camp'
  | 'shop'
  | 'victory'
  | 'defeat'
  | 'menu';

interface MusicConfig {
  scale: string[];
  tempo: number; // BPM
  density: number; // Note probability 0-1
  ambientChordChance: number;
  guitarVolume: number;
  ambienceVolume: number;
}

// Western-style scales and configurations for each mood
const MUSIC_CONFIGS: Record<MusicState, MusicConfig> = {
  exploration_day: {
    scale: ['E3', 'G3', 'A3', 'B3', 'D4', 'E4', 'G4'], // E minor pentatonic
    tempo: 80,
    density: 0.3,
    ambientChordChance: 0.05,
    guitarVolume: -12,
    ambienceVolume: -20,
  },
  exploration_night: {
    scale: ['A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4'], // A minor pentatonic (darker)
    tempo: 60,
    density: 0.15,
    ambientChordChance: 0.08,
    guitarVolume: -18,
    ambienceVolume: -15,
  },
  combat: {
    scale: ['E2', 'G2', 'A2', 'B2', 'D3', 'E3'], // Lower, tense
    tempo: 140,
    density: 0.6,
    ambientChordChance: 0.02,
    guitarVolume: -6,
    ambienceVolume: -25,
  },
  combat_intense: {
    scale: ['E2', 'F2', 'G2', 'A2', 'Bb2', 'D3'], // Chromatic tension
    tempo: 160,
    density: 0.75,
    ambientChordChance: 0.01,
    guitarVolume: -4,
    ambienceVolume: -30,
  },
  town: {
    scale: ['G3', 'A3', 'B3', 'D4', 'E4', 'G4', 'A4'], // G major pentatonic (friendly)
    tempo: 100,
    density: 0.4,
    ambientChordChance: 0.1,
    guitarVolume: -10,
    ambienceVolume: -18,
  },
  camp: {
    scale: ['D3', 'F3', 'G3', 'A3', 'C4', 'D4'], // D minor (reflective)
    tempo: 50,
    density: 0.1,
    ambientChordChance: 0.15,
    guitarVolume: -20,
    ambienceVolume: -12,
  },
  shop: {
    scale: ['C3', 'E3', 'G3', 'A3', 'C4', 'E4'], // C major (welcoming)
    tempo: 90,
    density: 0.35,
    ambientChordChance: 0.08,
    guitarVolume: -14,
    ambienceVolume: -22,
  },
  victory: {
    scale: ['G3', 'B3', 'D4', 'G4', 'B4', 'D5'], // G major arpeggio
    tempo: 120,
    density: 0.8,
    ambientChordChance: 0.3,
    guitarVolume: -6,
    ambienceVolume: -15,
  },
  defeat: {
    scale: ['D2', 'F2', 'A2', 'D3', 'F3'], // D minor (somber)
    tempo: 40,
    density: 0.1,
    ambientChordChance: 0.2,
    guitarVolume: -15,
    ambienceVolume: -10,
  },
  menu: {
    scale: ['E3', 'G3', 'A3', 'B3', 'D4', 'E4'],
    tempo: 70,
    density: 0.2,
    ambientChordChance: 0.1,
    guitarVolume: -15,
    ambienceVolume: -18,
  },
};

export class MusicManager {
  private currentState: MusicState = 'exploration_day';
  private guitar: Tone.PluckSynth;
  private ambience: Tone.PolySynth;
  private loop: Tone.Loop | null = null;
  private isPlaying = false;
  private transitionTimeout: ReturnType<typeof setTimeout> | null = null;
  private masterVolume = 0; // dB adjustment from settings

  constructor() {
    // Acoustic guitar simulation
    this.guitar = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.98,
    }).toDestination();
    this.guitar.volume.value = -12;

    // Ambient pad for atmosphere
    this.ambience = new Tone.PolySynth(Tone.AMSynth).toDestination();
    this.ambience.volume.value = -20;
    this.ambience.set({
      oscillator: { type: 'sine' },
      envelope: { attack: 1, decay: 2, sustain: 0.5, release: 3 },
    });
  }

  /**
   * Start the music system
   */
  public async start(): Promise<void> {
    if (this.isPlaying) return;

    try {
      await Tone.start();
      Tone.Transport.start();

      this.isPlaying = true;
      this.applyMusicConfig();
      this.startGenerativeLoop();
      console.log(`[MusicManager] Started in ${this.currentState} mode`);
    } catch (err) {
      console.error('[MusicManager] Failed to start:', err);
    }
  }

  /**
   * Stop the music system
   */
  public stop(): void {
    this.isPlaying = false;
    Tone.Transport.stop();

    if (this.loop) {
      this.loop.stop();
      this.loop.dispose();
      this.loop = null;
    }

    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }

    console.log('[MusicManager] Stopped');
  }

  /**
   * Transition to a new music state
   */
  public setState(state: MusicState): void {
    if (this.currentState === state) return;

    console.log(`[MusicManager] Transitioning: ${this.currentState} -> ${state}`);
    this.currentState = state;

    if (this.isPlaying) {
      // Fade out current, fade in new
      this.transitionMusic();
    }
  }

  /**
   * Get current music state
   */
  public getState(): MusicState {
    return this.currentState;
  }

  /**
   * Set master volume adjustment
   */
  public setVolume(db: number): void {
    this.masterVolume = db;
    this.applyMusicConfig();
  }

  /**
   * Check if music is playing
   */
  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Apply current music configuration to synths
   */
  private applyMusicConfig(): void {
    const config = MUSIC_CONFIGS[this.currentState];
    Tone.Transport.bpm.value = config.tempo;
    this.guitar.volume.value = config.guitarVolume + this.masterVolume;
    this.ambience.volume.value = config.ambienceVolume + this.masterVolume;
  }

  /**
   * Smooth transition between music states
   */
  private transitionMusic(): void {
    // Stop current loop
    if (this.loop) {
      this.loop.stop();
      this.loop.dispose();
      this.loop = null;
    }

    // Brief pause then restart with new config
    this.transitionTimeout = setTimeout(() => {
      this.applyMusicConfig();
      this.startGenerativeLoop();
    }, 500);
  }

  /**
   * Start the generative music loop
   */
  private startGenerativeLoop(): void {
    const config = MUSIC_CONFIGS[this.currentState];

    this.loop = new Tone.Loop((time) => {
      if (!this.isPlaying) return;

      // Random note based on density
      if (Math.random() < config.density) {
        const note = config.scale[Math.floor(Math.random() * config.scale.length)];
        const length = Math.random() > 0.5 ? '8n' : '4n';
        this.guitar.triggerAttackRelease(note, length, time);
      }

      // Occasional atmospheric chord
      if (Math.random() < config.ambientChordChance) {
        // Build a chord from the scale
        const root = config.scale[0];
        const fifth = config.scale[Math.min(3, config.scale.length - 1)];
        this.ambience.triggerAttackRelease([root, fifth], '1m', time);
      }
    }, '8n').start(0);
  }

  /**
   * Play a one-shot stinger (victory/defeat)
   */
  public playStinger(type: 'victory' | 'defeat'): void {
    const config = MUSIC_CONFIGS[type];

    // Play ascending or descending arpeggio
    const now = Tone.now();
    const notes = type === 'victory' ? config.scale : [...config.scale].reverse();
    const duration = type === 'victory' ? 0.15 : 0.3;

    notes.forEach((note, i) => {
      this.guitar.triggerAttackRelease(note, '8n', now + i * duration);
    });

    // Final chord
    setTimeout(
      () => {
        this.ambience.triggerAttackRelease(
          [notes[0], notes[Math.floor(notes.length / 2)]],
          '2n'
        );
      },
      notes.length * duration * 1000
    );
  }

  /**
   * Dispose all resources
   */
  public dispose(): void {
    this.stop();
    this.guitar.dispose();
    this.ambience.dispose();
    console.log('[MusicManager] Disposed');
  }
}
