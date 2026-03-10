import * as Tone from 'tone';
import type { SFXEntry } from './sfxTypes';

export const ENVIRONMENT_SFX: Record<string, SFXEntry> = {
  footstep_dirt: {
    label: 'Footstep (Dirt)',
    category: 'environment',
    volume: -22,
    pitchRange: [-80, 80],
    spatial: false,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: { attack: 0.005, decay: 0.08, sustain: 0 },
      });
      synth.volume.value = -22;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('64n', time);
    },
  },

  footstep_wood: {
    label: 'Footstep (Wood)',
    category: 'environment',
    volume: -18,
    pitchRange: [-40, 80],
    spatial: false,
    create: () => {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.06, sustain: 0 },
      });
      synth.volume.value = -18;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.MembraneSynth).triggerAttackRelease('G3', '64n', time);
    },
  },

  footstep_stone: {
    label: 'Footstep (Stone)',
    category: 'environment',
    volume: -20,
    pitchRange: [-20, 60],
    spatial: false,
    create: () => {
      const synth = new Tone.MetalSynth({
        harmonicity: 5,
        resonance: 2000,
        modulationIndex: 8,
        envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
        volume: -20,
      });
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.MetalSynth).triggerAttackRelease('64n', time ?? Tone.now());
    },
  },

  door_open: {
    label: 'Door Open',
    category: 'environment',
    volume: -14,
    pitchRange: [-30, 30],
    spatial: true,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.05, release: 0.1 },
      });
      synth.volume.value = -14;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('8n', time);
    },
  },

  door_close: {
    label: 'Door Close',
    category: 'environment',
    volume: -10,
    pitchRange: [-50, 10],
    spatial: true,
    create: () => {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
      });
      synth.volume.value = -10;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.MembraneSynth).triggerAttackRelease('E2', '16n', time);
    },
  },
};
