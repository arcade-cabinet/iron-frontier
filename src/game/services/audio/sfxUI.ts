import * as Tone from 'tone';
import type { SFXEntry } from './sfxTypes';

export const UI_SFX: Record<string, SFXEntry> = {
  menu_open: {
    label: 'Menu Open',
    category: 'ui',
    volume: -12,
    pitchRange: [0, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
      });
      synth.volume.value = -12;
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.PolySynth;
      synth.triggerAttackRelease('E5', '32n', t);
      synth.triggerAttackRelease('A5', '32n', t + 0.05);
    },
  },

  menu_close: {
    label: 'Menu Close',
    category: 'ui',
    volume: -12,
    pitchRange: [0, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
      });
      synth.volume.value = -12;
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.PolySynth;
      synth.triggerAttackRelease('A5', '32n', t);
      synth.triggerAttackRelease('E5', '32n', t + 0.05);
    },
  },

  item_pickup: {
    label: 'Item Pickup',
    category: 'ui',
    volume: -10,
    pitchRange: [-20, 20],
    spatial: false,
    create: () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.08 },
      });
      synth.volume.value = -10;
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.PolySynth;
      synth.triggerAttackRelease('C5', '32n', t);
      synth.triggerAttackRelease('E5', '32n', t + 0.06);
      synth.triggerAttackRelease('G5', '32n', t + 0.12);
    },
  },

  gold_clink: {
    label: 'Gold Clink',
    category: 'ui',
    volume: -10,
    pitchRange: [0, 100],
    spatial: false,
    create: () => {
      const synth = new Tone.MetalSynth({
        harmonicity: 8,
        resonance: 3000,
        modulationIndex: 10,
        envelope: { attack: 0.001, decay: 0.15, release: 0.05 },
        volume: -10,
      });
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.MetalSynth;
      synth.triggerAttackRelease('32n', t);
      synth.triggerAttackRelease('32n', t + 0.08);
    },
  },

  quest_start: {
    label: 'Quest Start Fanfare',
    category: 'ui',
    volume: -8,
    pitchRange: [0, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.4 },
      });
      synth.volume.value = -8;
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.PolySynth;
      synth.triggerAttackRelease('E4', '8n', t);
      synth.triggerAttackRelease('G4', '8n', t + 0.12);
      synth.triggerAttackRelease(['B4', 'E5'], '4n', t + 0.24);
    },
  },

  quest_complete: {
    label: 'Quest Complete Celebration',
    category: 'ui',
    volume: -6,
    pitchRange: [0, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.15, release: 0.6 },
      });
      synth.volume.value = -6;
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.PolySynth;
      synth.triggerAttackRelease('C4', '8n', t);
      synth.triggerAttackRelease('E4', '8n', t + 0.1);
      synth.triggerAttackRelease('G4', '8n', t + 0.2);
      synth.triggerAttackRelease(['C5', 'E5', 'G5'], '2n', t + 0.35);
    },
  },

  level_up: {
    label: 'Level Up',
    category: 'ui',
    volume: -4,
    pitchRange: [0, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.03, decay: 0.5, sustain: 0.2, release: 0.8 },
      });
      synth.volume.value = -4;
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.PolySynth;
      synth.triggerAttackRelease('C4', '8n', t);
      synth.triggerAttackRelease('E4', '8n', t + 0.08);
      synth.triggerAttackRelease('G4', '8n', t + 0.16);
      synth.triggerAttackRelease('C5', '8n', t + 0.24);
      synth.triggerAttackRelease(['E5', 'G5', 'C6'], '2n', t + 0.4);
    },
  },

  stage_advance: {
    label: 'Quest Stage Advance',
    category: 'ui',
    volume: -10,
    pitchRange: [0, 0],
    spatial: false,
    create: () => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.05, release: 0.2 },
      });
      synth.volume.value = -10;
      return synth;
    },
    trigger: (node, time) => {
      const t = time ?? Tone.now();
      const synth = node as Tone.PolySynth;
      synth.triggerAttackRelease('D5', '16n', t);
      synth.triggerAttackRelease('G5', '16n', t + 0.08);
    },
  },

  dialogue_advance: {
    label: 'Dialogue Advance',
    category: 'ui',
    volume: -16,
    pitchRange: [-10, 10],
    spatial: false,
    create: () => {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
      });
      synth.volume.value = -16;
      return synth;
    },
    trigger: (node, time) => {
      (node as Tone.MembraneSynth).triggerAttackRelease('C3', '64n', time);
    },
  },
};
