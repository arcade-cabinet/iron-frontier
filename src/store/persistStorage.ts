/**
 * Custom Zustand persist storage implementation
 *
 * This provides a bridge between our async StorageAdapter interface
 * and Zustand's persist middleware which expects StateStorage.
 */

import type { StateStorage } from 'zustand/middleware';
import type { StorageAdapter } from './StorageAdapter';

/**
 * Create a Zustand-compatible StateStorage from our StorageAdapter
 *
 * This is the main function to use for storage integration.
 */
export function persistStorage(adapter: StorageAdapter): StateStorage {
  return createStateStorage(adapter);
}

/**
 * Create a Zustand-compatible StateStorage from our StorageAdapter
 *
 * Note: Zustand's persist middleware expects synchronous getItem for initial hydration,
 * but our StorageAdapter is async. This wrapper handles that by:
 * 1. Using a synchronous cache for immediate reads
 * 2. Populating the cache asynchronously
 *
 * For proper async hydration, use the preloadStorage() function before creating the store.
 */
export function createStateStorage(adapter: StorageAdapter): StateStorage {
  // Synchronous cache for immediate reads
  const cache = new Map<string, string | null>();

  return {
    getItem: (name: string): string | null => {
      // Return cached value if available
      if (cache.has(name)) {
        return cache.get(name) ?? null;
      }

      // Trigger async load for next time
      adapter.getItem(name).then((value) => {
        cache.set(name, value);
      });

      return null;
    },

    setItem: (name: string, value: string): void => {
      cache.set(name, value);
      adapter.setItem(name, value).catch((error) => {
        // eslint-disable-next-line no-console
        if (typeof console !== 'undefined')
          console.error('[persistStorage] Failed to persist:', name, error);
      });
    },

    removeItem: (name: string): void => {
      cache.delete(name);
      adapter.removeItem(name).catch((error) => {
        // eslint-disable-next-line no-console
        if (typeof console !== 'undefined')
          console.error('[persistStorage] Failed to remove:', name, error);
      });
    },
  };
}

/**
 * Preload storage values into cache before store creation
 * Call this before creating the store to ensure hydration works correctly
 *
 * @param adapter The storage adapter to use
 * @param keys Array of keys to preload
 * @returns Promise that resolves when all keys are loaded
 */
export async function preloadStorage(
  adapter: StorageAdapter,
  keys: string[]
): Promise<Map<string, string | null>> {
  const cache = new Map<string, string | null>();

  await Promise.all(
    keys.map(async (key) => {
      const value = await adapter.getItem(key);
      cache.set(key, value);
    })
  );

  return cache;
}

/**
 * Create an async-aware StateStorage that properly handles hydration
 *
 * This version maintains an internal cache and provides methods for
 * async preloading. Use this for proper async storage support.
 */
export class AsyncStateStorage implements StateStorage {
  private cache = new Map<string, string | null>();
  private adapter: StorageAdapter;
  private loadPromises = new Map<string, Promise<string | null>>();

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  /**
   * Preload a key into the cache
   */
  async preload(key: string): Promise<void> {
    if (this.cache.has(key) || this.loadPromises.has(key)) {
      return;
    }

    const promise = this.adapter.getItem(key);
    this.loadPromises.set(key, promise);

    try {
      const value = await promise;
      this.cache.set(key, value);
    } finally {
      this.loadPromises.delete(key);
    }
  }

  /**
   * Check if a key is loaded in the cache
   */
  isLoaded(key: string): boolean {
    return this.cache.has(key);
  }

  getItem(name: string): string | null {
    if (this.cache.has(name)) {
      return this.cache.get(name) ?? null;
    }

    // Start loading for next access
    this.preload(name);

    return null;
  }

  setItem(name: string, value: string): void {
    this.cache.set(name, value);
    this.adapter.setItem(name, value).catch((error) => {
      // eslint-disable-next-line no-console
      if (typeof console !== 'undefined')
        console.error('[AsyncStateStorage] Failed to persist:', name, error);
    });
  }

  removeItem(name: string): void {
    this.cache.delete(name);
    this.adapter.removeItem(name).catch((error) => {
      // eslint-disable-next-line no-console
      if (typeof console !== 'undefined')
        console.error('[AsyncStateStorage] Failed to remove:', name, error);
    });
  }

  /**
   * Clear the internal cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    this.loadPromises.clear();
  }
}
