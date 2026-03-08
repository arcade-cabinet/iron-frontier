/**
 * StorageAdapter - Platform-agnostic storage interface
 *
 * This interface allows the game store to persist state across different platforms
 * (web, mobile native, etc.) without being coupled to a specific storage implementation.
 */

/**
 * Base interface for storage adapters
 */
export interface StorageAdapter {
  /**
   * Get an item from storage
   * @param key The key to retrieve
   * @returns The stored value or null if not found
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Set an item in storage
   * @param key The key to store under
   * @param value The value to store (must be JSON-serializable string)
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove an item from storage
   * @param key The key to remove
   */
  removeItem(key: string): Promise<void>;
}

/**
 * Web storage adapter using localStorage
 * Used for browser-based game sessions
 *
 * Note: This class accesses browser globals (localStorage) and should only
 * be instantiated in a browser environment.
 */
export class WebStorageAdapter implements StorageAdapter {
  private storage: Storage;

  constructor(storage?: Storage) {
    // Allow injection for testing, or use globalThis.localStorage in browser
    this.storage =
      storage ?? (typeof globalThis !== 'undefined' && (globalThis as any).localStorage);
    if (!this.storage) {
      throw new Error('[WebStorageAdapter] localStorage not available');
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      // eslint-disable-next-line no-console
      if (typeof console !== 'undefined')
        console.error('[WebStorageAdapter] Failed to get item:', key, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      // eslint-disable-next-line no-console
      if (typeof console !== 'undefined')
        console.error('[WebStorageAdapter] Failed to set item:', key, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      // eslint-disable-next-line no-console
      if (typeof console !== 'undefined')
        console.error('[WebStorageAdapter] Failed to remove item:', key, error);
      throw error;
    }
  }
}

/**
 * In-memory storage adapter for testing and SSR
 * Does not persist across sessions
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  /**
   * Clear all stored items (useful for testing)
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Get all keys (useful for testing/debugging)
   */
  keys(): string[] {
    return Array.from(this.storage.keys());
  }
}

/**
 * Native storage adapter using expo-sqlite.
 * Works on iOS/Android via expo-sqlite's synchronous key-value storage.
 */
export class NativeStorageAdapter implements StorageAdapter {
  private db: import('expo-sqlite').SQLiteDatabase | null = null;
  private dbReady: Promise<void>;

  constructor() {
    this.dbReady = this.initDb();
  }

  private async initDb(): Promise<void> {
    try {
      const { openDatabaseSync } = await import('expo-sqlite');
      this.db = openDatabaseSync('iron-frontier-kv.db');
      this.db.execSync(
        'CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT)'
      );
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.error('[NativeStorageAdapter] Failed to init database:', error);
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      await this.dbReady;
      if (!this.db) return null;
      const row = this.db.getFirstSync<{ value: string }>(
        'SELECT value FROM kv WHERE key = ?',
        [key]
      );
      return row?.value ?? null;
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.error('[NativeStorageAdapter] Failed to get item:', key, error);
      }
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.dbReady;
      if (!this.db) return;
      this.db.runSync(
        'INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)',
        [key, value]
      );
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.error('[NativeStorageAdapter] Failed to set item:', key, error);
      }
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.dbReady;
      if (!this.db) return;
      this.db.runSync('DELETE FROM kv WHERE key = ?', [key]);
    } catch (error) {
      if (typeof console !== 'undefined') {
        console.error('[NativeStorageAdapter] Failed to remove item:', key, error);
      }
      throw error;
    }
  }
}

/**
 * Default storage adapter - returns null storage (no persistence)
 * Used when no adapter is configured
 */
export class NoopStorageAdapter implements StorageAdapter {
  async getItem(_key: string): Promise<string | null> {
    return null;
  }

  async setItem(_key: string, _value: string): Promise<void> {
    // No-op
  }

  async removeItem(_key: string): Promise<void> {
    // No-op
  }
}
