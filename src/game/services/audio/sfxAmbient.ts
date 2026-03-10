import * as Tone from 'tone';
import type { SFXEntry } from './sfxTypes';

export const AMBIENT_SFX: Record<string, SFXEntry> = {
  town_ambient: {
    label: 'Town Ambient Loop',
    category: 'ambient',
    volume: -24,
    pitchRange: [0, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.Noise('pink');
      synth.volume.value = -24;
      return synth;
    },
    trigger: () => {},
  },

  wilderness_ambient: {
    label: 'Wilderness Ambient Loop',
    category: 'ambient',
    volume: -22,
    pitchRange: [0, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.Noise('pink');
      synth.volume.value = -22;
      return synth;
    },
    trigger: () => {},
  },

  night_crickets: {
    label: 'Night Crickets',
    category: 'ambient',
    volume: -28,
    pitchRange: [0, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
      });
      synth.volume.value = -28;
      return synth;
    },
    trigger: (node, time) => {
      const synth = node as Tone.PolySynth;
      synth.triggerAttackRelease(['F#6', 'A6'], '32n', time);
    },
  },

  wind: {
    label: 'Wind Gust',
    category: 'ambient',
    volume: -20,
    pitchRange: [0, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.Noise('pink');
      synth.volume.value = -20;
      return synth;
    },
    trigger: () => {},
  },

  campfire: {
    label: 'Campfire Crackle',
    category: 'ambient',
    volume: -18,
    pitchRange: [-50, 50],
    spatial: true,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.02, release: 0.05 },
      });
      synth.volume.value = -18;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('32n', time);
    },
  },
};
