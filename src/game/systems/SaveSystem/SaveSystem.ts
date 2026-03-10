import type {
  GameSaveData,
  SaveFile,
  SaveSlotMeta,
  SaveStorageAdapter,
  SaveCallback,
  LoadCallback,
} from './types';
import { LocalStorageSaveAdapter } from './adapters';

export class SaveSystem {
  private adapter: SaveStorageAdapter;
  private saveCallbacks: Set<SaveCallback> = new Set();
  private loadCallbacks: Set<LoadCallback> = new Set();

  private autoSaveEnabled = true;
  private autoSaveInterval = 5 * 60 * 1000;
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  private lastAutoSave = 0;

  private readonly QUICK_SAVE_SLOT = 'quicksave';
  private readonly AUTO_SAVE_SLOT = 'autosave';
  private readonly MAX_MANUAL_SLOTS = 3;
  private readonly SAVE_VERSION = 1;

  constructor(adapter?: SaveStorageAdapter) {
    this.adapter = adapter ?? new LocalStorageSaveAdapter();
    console.log('[SaveSystem] Initialized');
  }

  public setAdapter(adapter: SaveStorageAdapter): void {
    this.adapter = adapter;
  }

  public async save(
    slotId: string,
    data: GameSaveData,
    locationName: string
  ): Promise<SaveSlotMeta> {
    const meta: SaveSlotMeta = {
      slotId,
      timestamp: Date.now(),
      playTime: data.playTime ?? 0,
      playerName: data.playerName ?? 'Unknown',
      playerLevel: ((data.playerStats as Record<string, unknown>)?.level as number) ?? 1,
      currentDay: ((data.clockState as Record<string, unknown>)?.day as number) ?? 1,
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

  public async load(slotId: string): Promise<GameSaveData | null> {
    const file = await this.adapter.loadFromSlot(slotId);
    if (!file) {
      console.warn(`[SaveSystem] No save found in slot: ${slotId}`);
      return null;
    }

    const migratedData = this.migrateIfNeeded(file.data, file.meta.version);

    this.notifyLoad(migratedData);
    console.log(`[SaveSystem] Loaded from slot: ${slotId}`);
    return migratedData;
  }

  public async quickSave(data: GameSaveData, locationName: string): Promise<SaveSlotMeta> {
    return this.save(this.QUICK_SAVE_SLOT, data, locationName);
  }

  public async quickLoad(): Promise<GameSaveData | null> {
    return this.load(this.QUICK_SAVE_SLOT);
  }

  public async autoSave(data: GameSaveData, locationName: string): Promise<SaveSlotMeta> {
    this.lastAutoSave = Date.now();
    return this.save(this.AUTO_SAVE_SLOT, data, locationName);
  }

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

  public stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    console.log('[SaveSystem] Auto-save stopped');
  }

  public setAutoSaveEnabled(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
  }

  public async getNextSlotId(): Promise<string> {
    const slots = await this.getManualSlots();
    for (let i = 1; i <= this.MAX_MANUAL_SLOTS; i++) {
      const slotId = `slot-${i}`;
      if (!slots.find((s) => s.slotId === slotId)) {
        return slotId;
      }
    }
    return slots[slots.length - 1]?.slotId ?? 'slot-1';
  }

  public async getManualSlots(): Promise<SaveSlotMeta[]> {
    const all = await this.adapter.listSlots();
    return all.filter((s) => !s.isAutoSave && !s.isQuickSave);
  }

  public async getAllSlots(): Promise<SaveSlotMeta[]> {
    return this.adapter.listSlots();
  }

  public async getMostRecentSlot(): Promise<SaveSlotMeta | null> {
    const slots = await this.adapter.listSlots();
    return slots.length > 0 ? slots[0] : null;
  }

  public async deleteSlot(slotId: string): Promise<void> {
    await this.adapter.deleteSlot(slotId);
    console.log(`[SaveSystem] Deleted slot: ${slotId}`);
  }

  public async hasQuickSave(): Promise<boolean> {
    const file = await this.adapter.loadFromSlot(this.QUICK_SAVE_SLOT);
    return file !== null;
  }

  public async hasAutoSave(): Promise<boolean> {
    const file = await this.adapter.loadFromSlot(this.AUTO_SAVE_SLOT);
    return file !== null;
  }

  public async exportSave(slotId: string): Promise<string> {
    return this.adapter.exportSave(slotId);
  }

  public async importSave(data: string): Promise<SaveSlotMeta> {
    return this.adapter.importSave(data);
  }

  public onSave(callback: SaveCallback): () => void {
    this.saveCallbacks.add(callback);
    return () => this.saveCallbacks.delete(callback);
  }

  public onLoad(callback: LoadCallback): () => void {
    this.loadCallbacks.add(callback);
    return () => this.loadCallbacks.delete(callback);
  }

  private migrateIfNeeded(data: GameSaveData, fromVersion: number): GameSaveData {
    if (fromVersion >= this.SAVE_VERSION) {
      return data;
    }

    console.log(`[SaveSystem] Migrated save from v${fromVersion} to v${this.SAVE_VERSION}`);
    return data;
  }

  private notifySave(meta: SaveSlotMeta): void {
    this.saveCallbacks.forEach((cb) => cb(meta));
  }

  private notifyLoad(data: GameSaveData): void {
    this.loadCallbacks.forEach((cb) => cb(data));
  }

  public dispose(): void {
    this.stopAutoSave();
    this.saveCallbacks.clear();
    this.loadCallbacks.clear();
    console.log('[SaveSystem] Disposed');
  }
}
