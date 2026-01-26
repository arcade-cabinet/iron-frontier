/**
 * SaveSystem.ts - Save/Load persistence for Iron Frontier v2
 *
 * Handles save game persistence with:
 * - Multiple save slots
 * - Auto-save functionality
 * - Quick save/quick load
 * - Save file versioning and migration
 */

// @ts-expect-error - GameSaveData needs to be imported from store/gameStateSlice

/**
 * Save slot metadata
 */
export interface SaveSlotMeta {
  slotId: string;
  timestamp: number;
  playTime: number;
  playerName: string;
  currentDay: number;
  location: string;
  version: number;
  isQuickSave: boolean;
  isAutoSave: boolean;
}

/**
 * Full save file structure
 */
export interface SaveFile {
  meta: SaveSlotMeta;
  data: GameSaveData;
}

/**
 * Storage adapter interface for platform-specific storage
 */
export interface SaveStorageAdapter {
  saveToSlot(slotId: string, data: SaveFile): Promise<void>;
  loadFromSlot(slotId: string): Promise<SaveFile | null>;
  deleteSlot(slotId: string): Promise<void>;
  listSlots(): Promise<SaveSlotMeta[]>;
  exportSave(slotId: string): Promise<string>;
  importSave(data: string): Promise<SaveSlotMeta>;
}

/**
 * Default web storage adapter using localStorage
 */
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
          } catch {
            // Skip invalid saves
          }
        }
      }
    }

    // Sort by timestamp, newest first
    return slots.sort((a, b) => b.timestamp - a.timestamp);
  }

  async exportSave(slotId: string): Promise<string> {
    const file = await this.loadFromSlot(slotId);
    if (!file) throw new Error('Save not found');
    return btoa(JSON.stringify(file));
  }

  async importSave(data: string): Promise<SaveSlotMeta> {
    const file = JSON.parse(atob(data)) as SaveFile;
    // Generate new slot ID to avoid overwriting
    const newSlotId = `import-${Date.now()}`;
    file.meta.slotId = newSlotId;
    await this.saveToSlot(newSlotId, file);
    return file.meta;
  }
}

type SaveCallback = (slot: SaveSlotMeta) => void;
type LoadCallback = (data: GameSaveData) => void;

export class SaveSystem {
  private adapter: SaveStorageAdapter;
  private saveCallbacks: Set<SaveCallback> = new Set();
  private loadCallbacks: Set<LoadCallback> = new Set();

  // Auto-save configuration
  private autoSaveEnabled = true;
  private autoSaveInterval = 5 * 60 * 1000; // 5 minutes
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  private lastAutoSave = 0;

  // Quick save slot
  private readonly QUICK_SAVE_SLOT = 'quicksave';
  private readonly AUTO_SAVE_SLOT = 'autosave';
  private readonly MAX_MANUAL_SLOTS = 10;

  // Current save version
  private readonly SAVE_VERSION = 1;

  constructor(adapter?: SaveStorageAdapter) {
    this.adapter = adapter ?? new LocalStorageSaveAdapter();
    console.log('[SaveSystem] Initialized');
  }

  /**
   * Set storage adapter
   */
  public setAdapter(adapter: SaveStorageAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Save game to a slot
   */
  public async save(
    slotId: string,
    data: GameSaveData,
    locationName: string
  ): Promise<SaveSlotMeta> {
    const meta: SaveSlotMeta = {
      slotId,
      timestamp: Date.now(),
      playTime: data.totalPlayTime,
      playerName: data.party[0]?.name ?? 'Unknown',
      currentDay: data.currentDay,
      location: locationName,
      version: this.SAVE_VERSION,
      isQuickSave: slotId === this.QUICK_SAVE_SLOT,
      isAutoSave: slotId === this.AUTO_SAVE_SLOT,
    };

    const file: SaveFile = { meta, data };

    await this.adapter.saveToSlot(slotId, file);
    this.notifySave(meta);

    console.log(`[SaveSystem] Saved to slot: ${slotId}`);
    return meta;
  }

  /**
   * Load game from a slot
   */
  public async load(slotId: string): Promise<GameSaveData | null> {
    const file = await this.adapter.loadFromSlot(slotId);
    if (!file) {
      console.warn(`[SaveSystem] No save found in slot: ${slotId}`);
      return null;
    }

    // Handle version migration if needed
    const migratedData = this.migrateIfNeeded(file.data, file.meta.version);

    this.notifyLoad(migratedData);
    console.log(`[SaveSystem] Loaded from slot: ${slotId}`);
    return migratedData;
  }

  /**
   * Quick save (single slot, overwritten)
   */
  public async quickSave(data: GameSaveData, locationName: string): Promise<SaveSlotMeta> {
    return this.save(this.QUICK_SAVE_SLOT, data, locationName);
  }

  /**
   * Quick load
   */
  public async quickLoad(): Promise<GameSaveData | null> {
    return this.load(this.QUICK_SAVE_SLOT);
  }

  /**
   * Auto-save
   */
  public async autoSave(data: GameSaveData, locationName: string): Promise<SaveSlotMeta> {
    this.lastAutoSave = Date.now();
    return this.save(this.AUTO_SAVE_SLOT, data, locationName);
  }

  /**
   * Start auto-save timer
   */
  public startAutoSave(getState: () => { data: GameSaveData; location: string }): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(async () => {
      if (!this.autoSaveEnabled) return;

      const state = getState();
      await this.autoSave(state.data, state.location);
    }, this.autoSaveInterval);

    console.log('[SaveSystem] Auto-save started');
  }

  /**
   * Stop auto-save timer
   */
  public stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    console.log('[SaveSystem] Auto-save stopped');
  }

  /**
   * Enable/disable auto-save
   */
  public setAutoSaveEnabled(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
  }

  /**
   * Get next available manual save slot
   */
  public async getNextSlotId(): Promise<string> {
    const slots = await this.getManualSlots();
    for (let i = 1; i <= this.MAX_MANUAL_SLOTS; i++) {
      const slotId = `slot-${i}`;
      if (!slots.find((s) => s.slotId === slotId)) {
        return slotId;
      }
    }
    // All slots full, return oldest
    return slots[slots.length - 1]?.slotId ?? 'slot-1';
  }

  /**
   * Get all save slots (excluding auto/quick)
   */
  public async getManualSlots(): Promise<SaveSlotMeta[]> {
    const all = await this.adapter.listSlots();
    return all.filter((s) => !s.isAutoSave && !s.isQuickSave);
  }

  /**
   * Get all save slots
   */
  public async getAllSlots(): Promise<SaveSlotMeta[]> {
    return this.adapter.listSlots();
  }

  /**
   * Delete a save slot
   */
  public async deleteSlot(slotId: string): Promise<void> {
    await this.adapter.deleteSlot(slotId);
    console.log(`[SaveSystem] Deleted slot: ${slotId}`);
  }

  /**
   * Check if quick save exists
   */
  public async hasQuickSave(): Promise<boolean> {
    const file = await this.adapter.loadFromSlot(this.QUICK_SAVE_SLOT);
    return file !== null;
  }

  /**
   * Check if auto save exists
   */
  public async hasAutoSave(): Promise<boolean> {
    const file = await this.adapter.loadFromSlot(this.AUTO_SAVE_SLOT);
    return file !== null;
  }

  /**
   * Export save as shareable string
   */
  public async exportSave(slotId: string): Promise<string> {
    return this.adapter.exportSave(slotId);
  }

  /**
   * Import save from string
   */
  public async importSave(data: string): Promise<SaveSlotMeta> {
    return this.adapter.importSave(data);
  }

  /**
   * Subscribe to save events
   */
  public onSave(callback: SaveCallback): () => void {
    this.saveCallbacks.add(callback);
    return () => this.saveCallbacks.delete(callback);
  }

  /**
   * Subscribe to load events
   */
  public onLoad(callback: LoadCallback): () => void {
    this.loadCallbacks.add(callback);
    return () => this.loadCallbacks.delete(callback);
  }

  /**
   * Migrate save data to current version
   */
  private migrateIfNeeded(data: GameSaveData, fromVersion: number): GameSaveData {
    if (fromVersion >= this.SAVE_VERSION) {
      return data;
    }

    // Add migration logic here as versions increase
    // Example:
    // if (fromVersion < 2) {
    //   data = migrateV1ToV2(data);
    // }

    console.log(`[SaveSystem] Migrated save from v${fromVersion} to v${this.SAVE_VERSION}`);
    return data;
  }

  /**
   * Notify save listeners
   */
  private notifySave(meta: SaveSlotMeta): void {
    this.saveCallbacks.forEach((cb) => cb(meta));
  }

  /**
   * Notify load listeners
   */
  private notifyLoad(data: GameSaveData): void {
    this.loadCallbacks.forEach((cb) => cb(data));
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.stopAutoSave();
    this.saveCallbacks.clear();
    this.loadCallbacks.clear();
    console.log('[SaveSystem] Disposed');
  }
}

// Singleton instance
let saveSystemInstance: SaveSystem | null = null;

export function getSaveSystem(): SaveSystem {
  if (!saveSystemInstance) {
    saveSystemInstance = new SaveSystem();
  }
  return saveSystemInstance;
}
