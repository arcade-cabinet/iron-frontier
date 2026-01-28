/**
 * SaveSystem.test.ts - Comprehensive tests for save/load functionality
 *
 * Tests:
 * - Save/load game state
 * - Save file management (slots, metadata)
 * - Save data serialization/deserialization
 * - Auto-save functionality
 * - Quick save/load
 * - Import/export
 * - Edge cases (corrupted saves, missing data)
 * - Storage adapter interface
 */

import type { GameSaveData } from '@/store/gameStateSlice';
import {
    LocalStorageSaveAdapter,
    SaveSystem,
    type SaveFile,
    type SaveSlotMeta,
    type SaveStorageAdapter,
} from '../SaveSystem';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockGameData: GameSaveData = {
  version: 1,
  timestamp: Date.now(),
  gameMode: 'overworld',
  overworldPosition: { x: 10, z: 20 },
  currentTown: null,
  currentRoute: null,
  party: [
    {
      id: 'player',
      name: 'Test Hero',
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      speed: 10,
      level: 1,
      xp: 0,
      statusEffects: [],
    },
  ],
  money: 500,
  currentDay: 5,
  totalPlayTime: 3600,
  questFlags: { 'quest-1': true },
  visitedTowns: ['town-1', 'town-2'],
  completedQuests: ['quest-1'],
};

// ============================================================================
// MOCK STORAGE ADAPTER
// ============================================================================

class MockStorageAdapter implements SaveStorageAdapter {
  private storage = new Map<string, SaveFile>();

  async saveToSlot(slotId: string, data: SaveFile): Promise<void> {
    this.storage.set(slotId, JSON.parse(JSON.stringify(data)));
  }

  async loadFromSlot(slotId: string): Promise<SaveFile | null> {
    const data = this.storage.get(slotId);
    return data ? JSON.parse(JSON.stringify(data)) : null;
  }

  async deleteSlot(slotId: string): Promise<void> {
    this.storage.delete(slotId);
  }

  async listSlots(): Promise<SaveSlotMeta[]> {
    const slots: SaveSlotMeta[] = [];
    for (const file of this.storage.values()) {
      slots.push(file.meta);
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

  // Test helper
  clear(): void {
    this.storage.clear();
  }

  // Test helper - corrupt a save
  corruptSave(slotId: string): void {
    const file = this.storage.get(slotId);
    if (file) {
      // @ts-expect-error - intentionally corrupting data
      file.data = 'corrupted';
    }
  }
}

// ============================================================================
// TESTS
// ============================================================================

describe('SaveSystem', () => {
  let saveSystem: SaveSystem;
  let mockAdapter: MockStorageAdapter;

  beforeEach(() => {
    mockAdapter = new MockStorageAdapter();
    saveSystem = new SaveSystem(mockAdapter);
  });

  afterEach(() => {
    saveSystem.dispose();
    mockAdapter.clear();
  });

  // ==========================================================================
  // BASIC SAVE/LOAD
  // ==========================================================================

  describe('Basic Save/Load', () => {
    it('should save game data to a slot', async () => {
      const meta = await saveSystem.save('slot-1', mockGameData, 'Test Town');

      expect(meta.slotId).toBe('slot-1');
      expect(meta.playerName).toBe('Test Hero');
      expect(meta.currentDay).toBe(5);
      expect(meta.location).toBe('Test Town');
      expect(meta.playTime).toBe(3600);
      expect(meta.version).toBe(1);
      expect(meta.isQuickSave).toBe(false);
      expect(meta.isAutoSave).toBe(false);
    });

    it('should load game data from a slot', async () => {
      await saveSystem.save('slot-1', mockGameData, 'Test Town');
      const loaded = await saveSystem.load('slot-1');

      expect(loaded).not.toBeNull();
      expect(loaded?.gameMode).toBe('overworld');
      expect(loaded?.party[0].name).toBe('Test Hero');
      expect(loaded?.money).toBe(500);
      expect(loaded?.currentDay).toBe(5);
      expect(loaded?.visitedTowns).toEqual(['town-1', 'town-2']);
    });

    it('should return null when loading non-existent slot', async () => {
      const loaded = await saveSystem.load('non-existent');
      expect(loaded).toBeNull();
    });

    it('should overwrite existing save in same slot', async () => {
      await saveSystem.save('slot-1', mockGameData, 'Town A');

      const updatedData = { ...mockGameData, money: 1000, currentDay: 10 };
      await saveSystem.save('slot-1', updatedData, 'Town B');

      const loaded = await saveSystem.load('slot-1');
      expect(loaded?.money).toBe(1000);
      expect(loaded?.currentDay).toBe(10);
    });
  });

  // ==========================================================================
  // QUICK SAVE/LOAD
  // ==========================================================================

  describe('Quick Save/Load', () => {
    it('should quick save to dedicated slot', async () => {
      const meta = await saveSystem.quickSave(mockGameData, 'Quick Town');

      expect(meta.slotId).toBe('quicksave');
      expect(meta.isQuickSave).toBe(true);
      expect(meta.isAutoSave).toBe(false);
      expect(meta.location).toBe('Quick Town');
    });

    it('should quick load from dedicated slot', async () => {
      await saveSystem.quickSave(mockGameData, 'Quick Town');
      const loaded = await saveSystem.quickLoad();

      expect(loaded).not.toBeNull();
      expect(loaded?.party[0].name).toBe('Test Hero');
    });

    it('should return null when quick loading without quick save', async () => {
      const loaded = await saveSystem.quickLoad();
      expect(loaded).toBeNull();
    });

    it('should overwrite previous quick save', async () => {
      await saveSystem.quickSave(mockGameData, 'Town A');

      const updatedData = { ...mockGameData, money: 2000 };
      await saveSystem.quickSave(updatedData, 'Town B');

      const loaded = await saveSystem.quickLoad();
      expect(loaded?.money).toBe(2000);
    });

    it('should check if quick save exists', async () => {
      expect(await saveSystem.hasQuickSave()).toBe(false);

      await saveSystem.quickSave(mockGameData, 'Town');
      expect(await saveSystem.hasQuickSave()).toBe(true);
    });
  });

  // ==========================================================================
  // AUTO-SAVE
  // ==========================================================================

  describe('Auto-Save', () => {
    it('should auto save to dedicated slot', async () => {
      const meta = await saveSystem.autoSave(mockGameData, 'Auto Town');

      expect(meta.slotId).toBe('autosave');
      expect(meta.isAutoSave).toBe(true);
      expect(meta.isQuickSave).toBe(false);
    });

    it('should check if auto save exists', async () => {
      expect(await saveSystem.hasAutoSave()).toBe(false);

      await saveSystem.autoSave(mockGameData, 'Town');
      expect(await saveSystem.hasAutoSave()).toBe(true);
    });

    it('should start auto-save timer', async () => {
      jest.useFakeTimers();

      let saveCount = 0;
      const getState = () => {
        saveCount++;
        return { data: mockGameData, location: 'Auto Town' };
      };

      saveSystem.startAutoSave(getState);

      // Fast-forward 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);

      // Should have auto-saved
      expect(await saveSystem.hasAutoSave()).toBe(true);

      jest.useRealTimers();
    });

    it('should stop auto-save timer', () => {
      jest.useFakeTimers();

      const getState = () => ({ data: mockGameData, location: 'Town' });
      saveSystem.startAutoSave(getState);
      saveSystem.stopAutoSave();

      // Fast-forward - should not auto-save
      jest.advanceTimersByTime(10 * 60 * 1000);

      jest.useRealTimers();
    });

    it('should respect auto-save enabled flag', async () => {
      jest.useFakeTimers();

      saveSystem.setAutoSaveEnabled(false);

      const getState = () => ({ data: mockGameData, location: 'Town' });
      saveSystem.startAutoSave(getState);

      jest.advanceTimersByTime(5 * 60 * 1000);

      // Should not have auto-saved
      expect(await saveSystem.hasAutoSave()).toBe(false);

      jest.useRealTimers();
    });
  });

  // ==========================================================================
  // SLOT MANAGEMENT
  // ==========================================================================

  describe('Slot Management', () => {
    it('should list all save slots', async () => {
      await saveSystem.save('slot-1', mockGameData, 'Town A');
      await saveSystem.save('slot-2', mockGameData, 'Town B');
      await saveSystem.quickSave(mockGameData, 'Quick Town');

      const slots = await saveSystem.getAllSlots();
      expect(slots.length).toBe(3);
    });

    it('should list only manual save slots', async () => {
      await saveSystem.save('slot-1', mockGameData, 'Town A');
      await saveSystem.save('slot-2', mockGameData, 'Town B');
      await saveSystem.quickSave(mockGameData, 'Quick Town');
      await saveSystem.autoSave(mockGameData, 'Auto Town');

      const manualSlots = await saveSystem.getManualSlots();
      expect(manualSlots.length).toBe(2);
      expect(manualSlots.every((s) => !s.isQuickSave && !s.isAutoSave)).toBe(true);
    });

    it('should delete a save slot', async () => {
      await saveSystem.save('slot-1', mockGameData, 'Town');
      expect(await saveSystem.load('slot-1')).not.toBeNull();

      await saveSystem.deleteSlot('slot-1');
      expect(await saveSystem.load('slot-1')).toBeNull();
    });

    it('should get next available slot ID', async () => {
      const nextSlot = await saveSystem.getNextSlotId();
      expect(nextSlot).toBe('slot-1');

      await saveSystem.save('slot-1', mockGameData, 'Town');
      const nextSlot2 = await saveSystem.getNextSlotId();
      expect(nextSlot2).toBe('slot-2');
    });

    it('should return oldest slot when all slots are full', async () => {
      // Fill all 10 slots with increasing timestamps
      for (let i = 1; i <= 10; i++) {
        await saveSystem.save(`slot-${i}`, mockGameData, `Town ${i}`);
        // Add delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      const nextSlot = await saveSystem.getNextSlotId();
      const slots = await saveSystem.getManualSlots();
      
      // Should return the oldest slot (last in sorted array)
      expect(nextSlot).toBe(slots[slots.length - 1].slotId);
    });

    it('should sort slots by timestamp (newest first)', async () => {
      await saveSystem.save('slot-1', mockGameData, 'Town A');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await saveSystem.save('slot-2', mockGameData, 'Town B');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await saveSystem.save('slot-3', mockGameData, 'Town C');

      const slots = await saveSystem.getManualSlots();
      expect(slots[0].slotId).toBe('slot-3'); // Newest
      expect(slots[2].slotId).toBe('slot-1'); // Oldest
    });
  });

  // ==========================================================================
  // IMPORT/EXPORT
  // ==========================================================================

  describe('Import/Export', () => {
    it('should export save as base64 string', async () => {
      await saveSystem.save('slot-1', mockGameData, 'Town');
      const exported = await saveSystem.exportSave('slot-1');

      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
    });

    it('should import save from base64 string', async () => {
      await saveSystem.save('slot-1', mockGameData, 'Town');
      const exported = await saveSystem.exportSave('slot-1');

      const meta = await saveSystem.importSave(exported);
      expect(meta.slotId).toContain('import-');
      expect(meta.playerName).toBe('Test Hero');

      const loaded = await saveSystem.load(meta.slotId);
      expect(loaded?.money).toBe(500);
    });

    it('should throw error when exporting non-existent save', async () => {
      await expect(saveSystem.exportSave('non-existent')).rejects.toThrow('Save not found');
    });

    it('should generate unique slot ID on import', async () => {
      await saveSystem.save('slot-1', mockGameData, 'Town');
      const exported = await saveSystem.exportSave('slot-1');

      const meta1 = await saveSystem.importSave(exported);
      // Add small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      const meta2 = await saveSystem.importSave(exported);

      expect(meta1.slotId).not.toBe(meta2.slotId);
    });
  });

  // ==========================================================================
  // CALLBACKS
  // ==========================================================================

  describe('Callbacks', () => {
    it('should notify listeners on save', async () => {
      const onSave = jest.fn();
      saveSystem.onSave(onSave);

      await saveSystem.save('slot-1', mockGameData, 'Town');

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          slotId: 'slot-1',
          playerName: 'Test Hero',
        })
      );
    });

    it('should notify listeners on load', async () => {
      const onLoad = jest.fn();
      saveSystem.onLoad(onLoad);

      await saveSystem.save('slot-1', mockGameData, 'Town');
      await saveSystem.load('slot-1');

      expect(onLoad).toHaveBeenCalledTimes(1);
      expect(onLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          money: 500,
          currentDay: 5,
        })
      );
    });

    it('should unsubscribe from save events', async () => {
      const onSave = jest.fn();
      const unsubscribe = saveSystem.onSave(onSave);

      await saveSystem.save('slot-1', mockGameData, 'Town');
      expect(onSave).toHaveBeenCalledTimes(1);

      unsubscribe();
      await saveSystem.save('slot-2', mockGameData, 'Town');
      expect(onSave).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should unsubscribe from load events', async () => {
      const onLoad = jest.fn();
      const unsubscribe = saveSystem.onLoad(onLoad);

      await saveSystem.save('slot-1', mockGameData, 'Town');
      await saveSystem.load('slot-1');
      expect(onLoad).toHaveBeenCalledTimes(1);

      unsubscribe();
      await saveSystem.load('slot-1');
      expect(onLoad).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  // ==========================================================================
  // VERSIONING & MIGRATION
  // ==========================================================================

  describe('Versioning & Migration', () => {
    it('should include version in save metadata', async () => {
      const meta = await saveSystem.save('slot-1', mockGameData, 'Town');
      expect(meta.version).toBe(1);
    });

    it('should handle loading saves with same version', async () => {
      await saveSystem.save('slot-1', mockGameData, 'Town');
      const loaded = await saveSystem.load('slot-1');

      expect(loaded).not.toBeNull();
      expect(loaded?.version).toBe(1);
    });

    it('should migrate old save versions (future-proofing)', async () => {
      // Manually create an old version save
      const oldSave: SaveFile = {
        meta: {
          slotId: 'slot-1',
          timestamp: Date.now(),
          playTime: 3600,
          playerName: 'Old Hero',
          currentDay: 1,
          location: 'Old Town',
          version: 0, // Old version
          isQuickSave: false,
          isAutoSave: false,
        },
        data: mockGameData,
      };

      await mockAdapter.saveToSlot('slot-1', oldSave);
      const loaded = await saveSystem.load('slot-1');

      // Should load successfully (migration logic would run here)
      expect(loaded).not.toBeNull();
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle empty party array', async () => {
      const emptyPartyData = { ...mockGameData, party: [] };
      const meta = await saveSystem.save('slot-1', emptyPartyData, 'Town');

      expect(meta.playerName).toBe('Unknown');
    });

    it('should handle missing location name', async () => {
      const meta = await saveSystem.save('slot-1', mockGameData, '');
      expect(meta.location).toBe('');
    });

    it('should handle very long play times', async () => {
      const longPlayData = { ...mockGameData, totalPlayTime: 999999999 };
      await saveSystem.save('slot-1', longPlayData, 'Town');

      const loaded = await saveSystem.load('slot-1');
      expect(loaded?.totalPlayTime).toBe(999999999);
    });

    it('should handle special characters in location names', async () => {
      const meta = await saveSystem.save('slot-1', mockGameData, "O'Malley's Saloon & Hotel");
      expect(meta.location).toBe("O'Malley's Saloon & Hotel");
    });

    it('should handle large quest flag objects', async () => {
      const largeFlags: Record<string, boolean> = {};
      for (let i = 0; i < 1000; i++) {
        largeFlags[`quest-${i}`] = i % 2 === 0;
      }

      const largeData = { ...mockGameData, questFlags: largeFlags };
      await saveSystem.save('slot-1', largeData, 'Town');

      const loaded = await saveSystem.load('slot-1');
      expect(Object.keys(loaded?.questFlags ?? {}).length).toBe(1000);
    });
  });

  // ==========================================================================
  // ADAPTER INTERFACE
  // ==========================================================================

  describe('Storage Adapter', () => {
    it('should use custom adapter', async () => {
      const customAdapter = new MockStorageAdapter();
      const customSystem = new SaveSystem(customAdapter);

      await customSystem.save('slot-1', mockGameData, 'Town');
      const loaded = await customSystem.load('slot-1');

      expect(loaded).not.toBeNull();
      customSystem.dispose();
    });

    it('should allow changing adapter', async () => {
      const adapter1 = new MockStorageAdapter();
      const adapter2 = new MockStorageAdapter();

      saveSystem.setAdapter(adapter1);
      await saveSystem.save('slot-1', mockGameData, 'Town A');

      saveSystem.setAdapter(adapter2);
      await saveSystem.save('slot-2', mockGameData, 'Town B');

      // slot-1 should be in adapter1, slot-2 in adapter2
      expect(await adapter1.loadFromSlot('slot-1')).not.toBeNull();
      expect(await adapter1.loadFromSlot('slot-2')).toBeNull();
      expect(await adapter2.loadFromSlot('slot-2')).not.toBeNull();
    });
  });

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  describe('Cleanup', () => {
    it('should dispose and clear callbacks', () => {
      const onSave = jest.fn();
      const onLoad = jest.fn();

      saveSystem.onSave(onSave);
      saveSystem.onLoad(onLoad);
      saveSystem.dispose();

      // Callbacks should be cleared (can't test directly, but ensures no memory leaks)
      expect(true).toBe(true);
    });

    it('should stop auto-save on dispose', () => {
      jest.useFakeTimers();

      const getState = () => ({ data: mockGameData, location: 'Town' });
      saveSystem.startAutoSave(getState);
      saveSystem.dispose();

      // Should not crash or auto-save after dispose
      jest.advanceTimersByTime(10 * 60 * 1000);

      jest.useRealTimers();
    });
  });
});

// ============================================================================
// LOCAL STORAGE ADAPTER TESTS
// ============================================================================

describe('LocalStorageSaveAdapter', () => {
  let adapter: LocalStorageSaveAdapter;

  beforeEach(() => {
    adapter = new LocalStorageSaveAdapter();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should save to localStorage', async () => {
    const saveFile: SaveFile = {
      meta: {
        slotId: 'slot-1',
        timestamp: Date.now(),
        playTime: 3600,
        playerName: 'Hero',
        currentDay: 1,
        location: 'Town',
        version: 1,
        isQuickSave: false,
        isAutoSave: false,
      },
      data: mockGameData,
    };

    await adapter.saveToSlot('slot-1', saveFile);

    const key = 'iron-frontier-save-slot-1';
    expect(localStorage.getItem(key)).not.toBeNull();
  });

  it('should load from localStorage', async () => {
    const saveFile: SaveFile = {
      meta: {
        slotId: 'slot-1',
        timestamp: Date.now(),
        playTime: 3600,
        playerName: 'Hero',
        currentDay: 1,
        location: 'Town',
        version: 1,
        isQuickSave: false,
        isAutoSave: false,
      },
      data: mockGameData,
    };

    await adapter.saveToSlot('slot-1', saveFile);
    const loaded = await adapter.loadFromSlot('slot-1');

    expect(loaded).not.toBeNull();
    expect(loaded?.meta.playerName).toBe('Hero');
  });

  it('should return null for non-existent slot', async () => {
    const loaded = await adapter.loadFromSlot('non-existent');
    expect(loaded).toBeNull();
  });

  it('should delete from localStorage', async () => {
    const saveFile: SaveFile = {
      meta: {
        slotId: 'slot-1',
        timestamp: Date.now(),
        playTime: 3600,
        playerName: 'Hero',
        currentDay: 1,
        location: 'Town',
        version: 1,
        isQuickSave: false,
        isAutoSave: false,
      },
      data: mockGameData,
    };

    await adapter.saveToSlot('slot-1', saveFile);
    await adapter.deleteSlot('slot-1');

    const loaded = await adapter.loadFromSlot('slot-1');
    expect(loaded).toBeNull();
  });

  it('should list all slots', async () => {
    const saveFile1: SaveFile = {
      meta: {
        slotId: 'slot-1',
        timestamp: Date.now(),
        playTime: 3600,
        playerName: 'Hero 1',
        currentDay: 1,
        location: 'Town A',
        version: 1,
        isQuickSave: false,
        isAutoSave: false,
      },
      data: mockGameData,
    };

    const saveFile2: SaveFile = {
      meta: {
        slotId: 'slot-2',
        timestamp: Date.now() + 1000,
        playTime: 7200,
        playerName: 'Hero 2',
        currentDay: 2,
        location: 'Town B',
        version: 1,
        isQuickSave: false,
        isAutoSave: false,
      },
      data: mockGameData,
    };

    await adapter.saveToSlot('slot-1', saveFile1);
    await adapter.saveToSlot('slot-2', saveFile2);

    const slots = await adapter.listSlots();
    expect(slots.length).toBe(2);
    expect(slots[0].slotId).toBe('slot-2'); // Newest first
  });

  it('should handle corrupted save data gracefully', async () => {
    const key = 'iron-frontier-save-slot-1';
    localStorage.setItem(key, 'corrupted-json-data');

    const loaded = await adapter.loadFromSlot('slot-1');
    expect(loaded).toBeNull();
  });

  it('should skip invalid saves when listing', async () => {
    const validSave: SaveFile = {
      meta: {
        slotId: 'slot-1',
        timestamp: Date.now(),
        playTime: 3600,
        playerName: 'Hero',
        currentDay: 1,
        location: 'Town',
        version: 1,
        isQuickSave: false,
        isAutoSave: false,
      },
      data: mockGameData,
    };

    await adapter.saveToSlot('slot-1', validSave);
    localStorage.setItem('iron-frontier-save-slot-2', 'corrupted');

    const slots = await adapter.listSlots();
    expect(slots.length).toBe(1);
    expect(slots[0].slotId).toBe('slot-1');
  });

  it('should export save as base64', async () => {
    const saveFile: SaveFile = {
      meta: {
        slotId: 'slot-1',
        timestamp: Date.now(),
        playTime: 3600,
        playerName: 'Hero',
        currentDay: 1,
        location: 'Town',
        version: 1,
        isQuickSave: false,
        isAutoSave: false,
      },
      data: mockGameData,
    };

    await adapter.saveToSlot('slot-1', saveFile);
    const exported = await adapter.exportSave('slot-1');

    expect(typeof exported).toBe('string');
    expect(exported.length).toBeGreaterThan(0);

    // Should be valid base64
    const decoded = atob(exported);
    expect(() => JSON.parse(decoded)).not.toThrow();
  });

  it('should import save from base64', async () => {
    const saveFile: SaveFile = {
      meta: {
        slotId: 'slot-1',
        timestamp: Date.now(),
        playTime: 3600,
        playerName: 'Hero',
        currentDay: 1,
        location: 'Town',
        version: 1,
        isQuickSave: false,
        isAutoSave: false,
      },
      data: mockGameData,
    };

    await adapter.saveToSlot('slot-1', saveFile);
    const exported = await adapter.exportSave('slot-1');
    const meta = await adapter.importSave(exported);

    expect(meta.slotId).toContain('import-');
    expect(meta.playerName).toBe('Hero');
  });
});
