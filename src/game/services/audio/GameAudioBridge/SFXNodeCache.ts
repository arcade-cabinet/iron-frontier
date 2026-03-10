/**
 * SFXNodeCache - Lazily creates and caches Tone.js synth nodes.
 *
 * Nodes are not re-allocated on every trigger. All nodes are disposed
 * during teardown.
 *
 * @module services/audio/GameAudioBridge/SFXNodeCache
 */

import * as Tone from 'tone';
import { SFX_CATALOG, type SFXEntry } from '../SFXCatalog';

export class SFXNodeCache {
  private cache = new Map<string, Tone.ToneAudioNode>();
  private volumeNode: Tone.Volume;

  constructor(initialVolume: number) {
    this.volumeNode = new Tone.Volume(Tone.gainToDb(initialVolume)).toDestination();
  }

  /** Get or create the synth node for a given SFX id. */
  get(sfxId: string): { node: Tone.ToneAudioNode; entry: SFXEntry } | null {
    const entry = SFX_CATALOG[sfxId];
    if (!entry) return null;

    let node = this.cache.get(sfxId);
    if (!node) {
      node = entry.create();
      node.connect(this.volumeNode);
      this.cache.set(sfxId, node);
    }

    return { node, entry };
  }

  /** Play a sound effect by catalog ID. */
  play(sfxId: string, time?: number): void {
    const result = this.get(sfxId);
    if (!result) return;
    result.entry.trigger(result.node, time);
  }

  /** Update the master SFX volume (0-1 gain). */
  setVolume(gain: number): void {
    this.volumeNode.volume.rampTo(Tone.gainToDb(gain), 0.1);
  }

  /** Dispose all cached nodes. */
  dispose(): void {
    for (const node of this.cache.values()) {
      node.dispose();
    }
    this.cache.clear();
    this.volumeNode.dispose();
  }
}
