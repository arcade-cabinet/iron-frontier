// Save Manager - handles local storage and IndexedDB saves

import { get, set, del, keys } from 'idb-keyval';
import type { GameSave } from '../lib/types';

const SAVE_PREFIX = 'cogsworth_save_';
const AUTOSAVE_KEY = 'cogsworth_autosave';
const SETTINGS_KEY = 'cogsworth_settings';

export interface SaveSlot {
  id: string;
  playerName: string;
  playTime: number;
  timestamp: number;
  sectorName: string;
  level: number;
}

// Get list of all save slots
export async function getSaveSlots(): Promise<SaveSlot[]> {
  try {
    const allKeys = await keys();
    const saveKeys = allKeys.filter(k => 
      typeof k === 'string' && k.startsWith(SAVE_PREFIX)
    ) as string[];
    
    const slots: SaveSlot[] = [];
    
    for (const key of saveKeys) {
      const save = await get<GameSave>(key);
      if (save) {
        slots.push({
          id: save.id,
          playerName: save.playerName,
          playTime: save.playTime,
          timestamp: save.timestamp,
          sectorName: save.player.currentSectorId,
          level: save.player.stats.level,
        });
      }
    }
    
    return slots.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get save slots:', error);
    return [];
  }
}

// Save game to IndexedDB
export async function saveGame(save: GameSave): Promise<boolean> {
  try {
    await set(`${SAVE_PREFIX}${save.id}`, save);
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

// Load game from IndexedDB
export async function loadGame(saveId: string): Promise<GameSave | null> {
  try {
    const save = await get<GameSave>(`${SAVE_PREFIX}${saveId}`);
    return save ?? null;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

// Delete a save
export async function deleteSave(saveId: string): Promise<boolean> {
  try {
    await del(`${SAVE_PREFIX}${saveId}`);
    return true;
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
}

// Autosave
export async function autosave(save: GameSave): Promise<boolean> {
  try {
    await set(AUTOSAVE_KEY, save);
    return true;
  } catch (error) {
    console.error('Failed to autosave:', error);
    return false;
  }
}

// Load autosave
export async function loadAutosave(): Promise<GameSave | null> {
  try {
    const save = await get<GameSave>(AUTOSAVE_KEY);
    return save ?? null;
  } catch (error) {
    console.error('Failed to load autosave:', error);
    return null;
  }
}

// Save settings separately (for faster access)
export async function saveSettings(settings: GameSave['settings']): Promise<boolean> {
  try {
    await set(SETTINGS_KEY, settings);
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

// Load settings
export async function loadSettings(): Promise<GameSave['settings'] | null> {
  try {
    const settings = await get<GameSave['settings']>(SETTINGS_KEY);
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
