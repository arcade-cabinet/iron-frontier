// Save Manager - handles local storage and IndexedDB saves

import { del, get, keys, set } from 'idb-keyval';
import { dbManager } from './DatabaseManager';

const SAVE_PREFIX = 'iron_frontier_save_';
const BINARY_SAVE_PREFIX = 'iron_frontier_bin_';
const AUTOSAVE_KEY = 'iron_frontier_autosave';
const SETTINGS_KEY = 'iron_frontier_settings';

export interface SaveSlot {
  id: string;
  playerName: string;
  playTime: number;
  timestamp: number;
  level: number;
  isBinary: boolean;
}

// Get list of all save slots (JSON and Binary)
export async function getSaveSlots(): Promise<SaveSlot[]> {
  try {
    const allKeys = await keys();
    const slots: SaveSlot[] = [];

    for (const key of allKeys) {
      if (typeof key !== 'string') continue;

      if (key.startsWith(SAVE_PREFIX)) {
        const save = await get<any>(key);
        if (save) {
          slots.push({
            id: save.id,
            playerName: save.playerName || 'Stranger',
            playTime: save.playTime || 0,
            timestamp: save.timestamp || Date.now(),
            level: save.playerStats?.level || 1,
            isBinary: false,
          });
        }
      } else if (key.startsWith(BINARY_SAVE_PREFIX)) {
        const id = key.replace(BINARY_SAVE_PREFIX, '');
        // For binary saves, we'd ideally store metadata separately or peek the DB
        // For now, let's assume we have a metadata store or just use defaults
        slots.push({
          id,
          playerName: 'Persistent Hero', // TODO: Load from separate metadata store
          playTime: 0,
          timestamp: Date.now(),
          level: 1,
          isBinary: true,
        });
      }
    }

    return slots.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get save slots:', error);
    return [];
  }
}

// Save game as SQLite binary
export async function saveGameBinary(saveId: string): Promise<boolean> {
  try {
    const binary = dbManager.export();
    if (!binary) return false;
    await set(`${BINARY_SAVE_PREFIX}${saveId}`, binary);
    return true;
  } catch (error) {
    console.error('Failed to save binary game:', error);
    return false;
  }
}

// Save game to IndexedDB (Legacy JSON)
export async function saveGame(save: any): Promise<boolean> {
  try {
    await set(`${SAVE_PREFIX}${save.id}`, save);
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

// Load game from IndexedDB
export async function loadGame(saveId: string): Promise<any | null> {
  try {
    // Try binary first
    const binary = await get<Uint8Array>(`${BINARY_SAVE_PREFIX}${saveId}`);
    if (binary) {
      try {
        await dbManager.init(binary);
        return dbManager.loadGameState();
      } catch (e) {
        console.warn('Binary load failed, falling back to JSON', e);
      }
    }

    // Fallback to JSON
    const save = await get<any>(`${SAVE_PREFIX}${saveId}`);
    return save ?? null;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}
}

/**
 * Trigger a browser download of the SQLite .save file
 */
export function downloadSaveFile(saveId: string): void {
  const binary = dbManager.export();
  if (!binary) return;

  const blob = new Blob([binary as any], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${saveId}.save`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Delete a save
export async function deleteSave(saveId: string): Promise<boolean> {
  try {
    await del(`${SAVE_PREFIX}${saveId}`);
    await del(`${BINARY_SAVE_PREFIX}${saveId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
}

// Autosave (JSON for speed, binary for durability)
export async function autosave(save: any): Promise<boolean> {
  try {
    await set(AUTOSAVE_KEY, save);
    // Optional: push to binary every N minutes
    return true;
  } catch (error) {
    console.error('Failed to autosave:', error);
    return false;
  }
}

// Load autosave
export async function loadAutosave(): Promise<any | null> {
  try {
    const save = await get<any>(AUTOSAVE_KEY);
    return save ?? null;
  } catch (error) {
    console.error('Failed to load autosave:', error);
    return null;
  }
}

// Save settings separately
export async function saveSettings(settings: any): Promise<boolean> {
  try {
    await set(SETTINGS_KEY, settings);
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

// Load settings
export async function loadSettings(): Promise<any | null> {
  try {
    const settings = await get<any>(SETTINGS_KEY);
    return settings ?? null;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
}

// Format play time for display
export function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${secs}s`;
}

// Format timestamp for display
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;

  // Less than a day ago
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  // Less than a week ago
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  // Otherwise show date
  return date.toLocaleDateString();
}
