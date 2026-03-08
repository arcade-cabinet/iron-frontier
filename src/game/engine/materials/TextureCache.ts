// TextureCache — LRU cache for canvas-generated materials
// Prevents re-creating identical materials when the same parameters are used.

import type { MeshStandardMaterial } from 'three';

interface CacheEntry {
  material: MeshStandardMaterial;
  lastAccess: number;
}

/**
 * LRU cache that stores MeshStandardMaterial instances keyed by a
 * parameter-hash string.  When the cache exceeds `maxSize`, the least
 * recently accessed entry is evicted and its material disposed.
 */
export class TextureCache {
  private entries = new Map<string, CacheEntry>();
  private readonly maxSize: number;

  constructor(maxSize = 256) {
    this.maxSize = maxSize;
  }

  get(key: string): MeshStandardMaterial | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    // Refresh access timestamp
    entry.lastAccess = Date.now();
    return entry.material;
  }

  set(key: string, material: MeshStandardMaterial): void {
    // If the key already exists, update in place
    if (this.entries.has(key)) {
      const existing = this.entries.get(key)!;
      if (existing.material !== material) {
        existing.material.dispose();
      }
      existing.material = material;
      existing.lastAccess = Date.now();
      return;
    }

    // Evict least-recently-used entries if at capacity
    while (this.entries.size >= this.maxSize) {
      this.evictLRU();
    }

    this.entries.set(key, { material, lastAccess: Date.now() });
  }

  clear(): void {
    for (const entry of this.entries.values()) {
      entry.material.dispose();
    }
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }

  /** Remove the entry with the oldest `lastAccess` timestamp. */
  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.entries) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey !== undefined) {
      const entry = this.entries.get(oldestKey)!;
      entry.material.dispose();
      this.entries.delete(oldestKey);
    }
  }
}

/** Shared singleton cache used by all texture factory functions. */
export const globalTextureCache = new TextureCache(256);
