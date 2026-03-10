import type { SaveFile, SaveSlotMeta, SaveStorageAdapter } from './types';

export class LocalStorageSaveAdapter implements SaveStorageAdapter {
  private readonly prefix = 'iron-frontier-save-';

  async saveToSlot(slotId: string, data: SaveFile): Promise<void> {
    const key = this.prefix + slotId;
    localStorage.setItem(key, JSON.stringify(data));
  }

  async loadFromSlot(slotId: string): Promise<SaveFile | null> {
    const key = this.prefix + slotId;
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as SaveFile;
    } catch {
      console.error(`[SaveSystem] Failed to parse save file: ${slotId}`);
      return null;
    }
  }

  async deleteSlot(slotId: string): Promise<void> {
    const key = this.prefix + slotId;
    localStorage.removeItem(key);
  }

  async listSlots(): Promise<SaveSlotMeta[]> {
    const slots: SaveSlotMeta[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const file = JSON.parse(raw) as SaveFile;
            slots.push(file.meta);
          } catch (error) {
            console.error(`[SaveSystem] Skipping invalid save at key "${key}":`, error);
          }
        }
      }
    }

    return slots.sort((a, b) => b.timestamp - a.timestamp);
  }

  async exportSave(slotId: string): Promise<string> {
    const file = await this.loadFromSlot(slotId);
    if (!file) throw new Error('Save not found');
    return btoa(JSON.stringify(file));
  }

  async importSave(data: string): Promise<SaveSlotMeta> {
    const file = JSON.parse(atob(data)) as SaveFile;
    const newSlotId = `import-${Date.now()}`;
    file.meta.slotId = newSlotId;
    await this.saveToSlot(newSlotId, file);
    return file.meta;
  }
}

export class SQLiteSaveAdapter implements SaveStorageAdapter {
  private db: import('expo-sqlite').SQLiteDatabase | null = null;
  private dbReady: Promise<void>;

  constructor() {
    this.dbReady = this.initDb();
  }

  private async initDb(): Promise<void> {
    try {
      const { openDatabaseSync } = await import('expo-sqlite');
      this.db = openDatabaseSync('iron-frontier-saves.db');
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS saves (
          slot TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          metadata TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);
    } catch (error) {
      console.error('[SQLiteSaveAdapter] Failed to init database:', error);
    }
  }

  async saveToSlot(slotId: string, data: SaveFile): Promise<void> {
    await this.dbReady;
    if (!this.db) throw new Error('[SQLiteSaveAdapter] Database not initialized');

    const dataJson = JSON.stringify(data.data);
    const metaJson = JSON.stringify(data.meta);
    const updatedAt = Date.now();

    this.db.runSync(
      'INSERT OR REPLACE INTO saves (slot, data, metadata, updated_at) VALUES (?, ?, ?, ?)',
      [slotId, dataJson, metaJson, updatedAt]
    );
  }

  async loadFromSlot(slotId: string): Promise<SaveFile | null> {
    await this.dbReady;
    if (!this.db) return null;

    const row = this.db.getFirstSync<{ data: string; metadata: string }>(
      'SELECT data, metadata FROM saves WHERE slot = ?',
      [slotId]
    );

    if (!row) return null;

    try {
      return {
        data: JSON.parse(row.data) as import('./types').GameSaveData,
        meta: JSON.parse(row.metadata) as SaveSlotMeta,
      };
    } catch {
      console.error(`[SQLiteSaveAdapter] Failed to parse save file: ${slotId}`);
      return null;
    }
  }

  async deleteSlot(slotId: string): Promise<void> {
    await this.dbReady;
    if (!this.db) return;

    this.db.runSync('DELETE FROM saves WHERE slot = ?', [slotId]);
  }

  async listSlots(): Promise<SaveSlotMeta[]> {
    await this.dbReady;
    if (!this.db) return [];

    const rows = this.db.getAllSync<{ metadata: string }>(
      'SELECT metadata FROM saves ORDER BY updated_at DESC'
    );

    const slots: SaveSlotMeta[] = [];
    for (const row of rows) {
      try {
        slots.push(JSON.parse(row.metadata) as SaveSlotMeta);
      } catch (error) {
        console.error(`[SQLiteSaveAdapter] Skipping invalid save metadata:`, error);
      }
    }

    return slots;
  }

  async exportSave(slotId: string): Promise<string> {
    const file = await this.loadFromSlot(slotId);
    if (!file) throw new Error('Save not found');
    return btoa(JSON.stringify(file));
  }

  async importSave(data: string): Promise<SaveSlotMeta> {
    const file = JSON.parse(atob(data)) as SaveFile;
    const newSlotId = `import-${Date.now()}`;
    file.meta.slotId = newSlotId;
    await this.saveToSlot(newSlotId, file);
    return file.meta;
  }
}
