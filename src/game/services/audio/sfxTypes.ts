import * as Tone from 'tone';
import { scopedRNG, rngTick } from '../../lib/prng';

export interface SFXEntry {
  label: string;
  category: 'weapon' | 'combat' | 'environment' | 'ui' | 'ambient';
  volume: number;
  pitchRange: [number, number];
  spatial: boolean;
  create: () => Tone.ToneAudioNode;
  trigger: (node: Tone.ToneAudioNode, time?: number) => void;
}

export function randomDetune(range: [number, number]): number {
  return range[0] + scopedRNG('audio', 42, rngTick()) * (range[1] - range[0]);
}
