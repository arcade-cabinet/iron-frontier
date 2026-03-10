import * as Tone from 'tone';
import type { SFXEntry } from './sfxTypes';

export const WEAPON_SFX: Record<string, SFXEntry> = {
  revolver_fire: {
    label: 'Revolver Fire',
    category: 'weapon',
    volume: -4,
    pitchRange: [-50, 50],
    spatial: true,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 },
      });
      synth.volume.value = -4;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('16n', time);
    },
  },

  rifle_fire: {
    label: 'Rifle Fire',
    category: 'weapon',
    volume: -2,
    pitchRange: [-30, 30],
    spatial: true,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.25, sustain: 0 },
      });
      synth.volume.value = -2;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('8n', time);
    },
  },

  shotgun_fire: {
    label: 'Shotgun Fire',
    category: 'weapon',
    volume: 0,
    pitchRange: [-80, -20],
    spatial: true,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: { attack: 0.001, decay: 0.35, sustain: 0 },
      });
      synth.volume.value = 0;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('8n', time);
    },
  },

  dynamite_throw: {
    label: 'Dynamite Throw',
    category: 'weapon',
    volume: -12,
    pitchRange: [0, 100],
    spatial: true,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.02, decay: 0.15, sustain: 0 },
      });
      synth.volume.value = -12;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('16n', time);
    },
  },

  dynamite_explode: {
    label: 'Dynamite Explosion',
    category: 'weapon',
    volume: 2,
    pitchRange: [-100, -50],
    spatial: true,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'brown' },
        envelope: { attack: 0.001, decay: 0.6, sustain: 0.1, release: 0.4 },
      });
      synth.volume.value = 2;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('4n', time);
    },
  },

  pickaxe_swing: {
    label: 'Pickaxe Swing',
    category: 'weapon',
    volume: -10,
    pitchRange: [-50, 100],
    spatial: true,
    create: () => {
      const synth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.01, decay: 0.12, sustain: 0 },
      });
      synth.volume.value = -10;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.NoiseSynth).triggerAttackRelease('32n', time);
    },
  },

  reload_revolver: {
    label: 'Revolver Reload',
    category: 'weapon',
    volume: -14,
    pitchRange: [-20, 20],
    spatial: false,
    create: () => {
      const synth = new Tone.MetalSynth({
        harmonicity: 12,
        resonance: 800,
        modulationIndex: 20,
        envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
        volume: -14,
      });
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.MetalSynth;
      synth.triggerAttackRelease('32n', t);
      synth.triggerAttackRelease('32n', t + 0.12);
      synth.triggerAttackRelease('32n', t + 0.28);
    },
  },

  reload_rifle: {
    label: 'Rifle Reload',
    category: 'weapon',
    volume: -14,
    pitchRange: [-30, 10],
    spatial: false,
    create: () => {
      const synth = new Tone.MetalSynth({
        harmonicity: 8,
        resonance: 600,
        modulationIndex: 16,
        envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
        volume: -14,
      });
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.MetalSynth;
      synth.triggerAttackRelease('32n', t);
      synth.triggerAttackRelease('32n', t + 0.18);
    },
  },

  reload_shotgun: {
    label: 'Shotgun Reload',
    category: 'weapon',
    volume: -12,
    pitchRange: [-40, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.MetalSynth({
        harmonicity: 6,
        resonance: 500,
        modulationIndex: 24,
        envelope: { attack: 0.001, decay: 0.12, release: 0.02 },
        volume: -12,
      });
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.MetalSynth;
      synth.triggerAttackRelease('32n', t);
      synth.triggerAttackRelease('32n', t + 0.22);
    },
  },
};
