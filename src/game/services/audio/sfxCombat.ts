import * as Tone from 'tone';
import type { SFXEntry } from './sfxTypes';

export const COMBAT_SFX: Record<string, SFXEntry> = {
  bullet_impact: {
    label: 'Bullet Impact',
    category: 'combat',
    volume: -8,
    pitchRange: [-60, 60],
    spatial: true,
    create: () => {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.03,
        octaves: 3,
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
      });
      synth.volume.value = -8;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.MembraneSynth).triggerAttackRelease('C1', '32n', time);
    },
  },

  bullet_whiz: {
    label: 'Bullet Whiz-by',
    category: 'combat',
    volume: -16,
    pitchRange: [200, 800],
    spatial: true,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.005, decay: 0.08, sustain: 0 },
      });
      synth.volume.value = -16;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('64n', time);
    },
  },

  enemy_hit: {
    label: 'Enemy Hit',
    category: 'combat',
    volume: -6,
    pitchRange: [-40, 40],
    spatial: true,
    create: () => {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
      });
      synth.volume.value = -6;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.MembraneSynth).triggerAttackRelease('C1', '16n', time);
    },
  },

  enemy_death: {
    label: 'Enemy Death',
    category: 'combat',
    volume: -4,
    pitchRange: [-100, -30],
    spatial: true,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.05, release: 0.3 },
      });
      synth.volume.value = -4;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('8n', time);
    },
  },

  player_hurt: {
    label: 'Player Hurt',
    category: 'combat',
    volume: -3,
    pitchRange: [-30, 30],
    spatial: false,
    create: () => {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 5,
        envelope: { attack: 0.001, decay: 0.25, sustain: 0 },
      });
      synth.volume.value = -3;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.MembraneSynth).triggerAttackRelease('G0', '16n', time);
    },
  },

  player_death: {
    label: 'Player Death',
    category: 'combat',
    volume: -2,
    pitchRange: [-50, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 1.0, sustain: 0.2, release: 1.5 },
      });
      synth.volume.value = -2;
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.PolySynth;
      synth.triggerAttackRelease(['E2', 'Bb2'], '2n', t);
    },
  },
};
