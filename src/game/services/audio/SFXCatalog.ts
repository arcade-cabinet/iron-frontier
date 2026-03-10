/**
 * SFXCatalog.ts - Sound effect definitions for Iron Frontier
 *
 * Each entry defines synthesizer configuration for procedurally generated
 * sounds using Tone.js. Sounds are categorized by game context (weapon,
 * combat, environment, UI, ambient) and include per-entry volume, pitch
 * randomization range, and spatial-audio flag.
 *
 * @module services/audio/SFXCatalog
 */

import * as Tone from 'tone';
import { scopedRNG, rngTick } from '../../lib/prng';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Descriptor for a single synthesized sound effect.
 * Used by GameAudioBridge to instantiate and trigger sounds at runtime.
 */
export interface SFXEntry {
  /** Human-readable label for debugging. */
  label: string;
  /** Category grouping for volume bus routing. */
  category: 'weapon' | 'combat' | 'environment' | 'ui' | 'ambient';
  /** Base volume in dB. */
  volume: number;
  /** Random pitch detune range in cents [min, max]. Applied on each trigger. */
  pitchRange: [number, number];
  /** Whether this sound should use 3D spatial panning. */
  spatial: boolean;
  /** Factory that creates and returns a connected Tone.js source node. */
  create: () => Tone.ToneAudioNode;
  /** Trigger function. Receives the node returned by `create()`. */
  trigger: (node: Tone.ToneAudioNode, time?: number) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Returns a random detune value within the given cent range.
 */
export function randomDetune(range: [number, number]): number {
  return range[0] + scopedRNG('audio', 42, rngTick()) * (range[1] - range[0]);
}

// ============================================================================
// CATALOG
// ============================================================================

export const SFX_CATALOG: Record<string, SFXEntry> = {
  // --------------------------------------------------------------------------
  // WEAPON SOUNDS
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // COMBAT SOUNDS
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // ENVIRONMENT SOUNDS
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // UI SOUNDS
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // AMBIENT SOUNDS (one-shots; loops managed by AmbientManager)
  // --------------------------------------------------------------------------

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
    trigger: () => {
      // Managed by AmbientManager lifecycle, not one-shot.
    },
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

// ============================================================================
// WEAPON TYPE MAPPING
// ============================================================================

/**
 * Maps weapon IDs / weapon types to their fire and reload sound IDs.
 * CombatManager uses weaponState.weaponId which references weapon config IDs.
 */
export const WEAPON_SOUND_MAP: Record<string, { fire: string; reload: string }> = {
  revolver: { fire: 'revolver_fire', reload: 'reload_revolver' },
  rifle: { fire: 'rifle_fire', reload: 'reload_rifle' },
  shotgun: { fire: 'shotgun_fire', reload: 'reload_shotgun' },
  dynamite: { fire: 'dynamite_throw', reload: 'reload_revolver' },
  pickaxe: { fire: 'pickaxe_swing', reload: 'reload_revolver' },
  // Fallbacks for any unmapped weapon
  default: { fire: 'revolver_fire', reload: 'reload_revolver' },
};

/**
 * Look up weapon sound IDs for a given weapon ID.
 * Falls back to 'default' (revolver) if the weapon type is unknown.
 */
export function getWeaponSounds(weaponId: string): { fire: string; reload: string } {
  // Try exact match first, then match by substring (e.g. "rusty_revolver" -> "revolver")
  if (WEAPON_SOUND_MAP[weaponId]) {
    return WEAPON_SOUND_MAP[weaponId];
  }
  for (const [key, sounds] of Object.entries(WEAPON_SOUND_MAP)) {
    if (key !== 'default' && weaponId.toLowerCase().includes(key)) {
      return sounds;
    }
  }
  return WEAPON_SOUND_MAP.default;
}
