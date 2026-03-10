import { Platform } from 'react-native';
import type { SaveStorageAdapter } from './types';
import { LocalStorageSaveAdapter, SQLiteSaveAdapter } from './adapters';
import { SaveSystem } from './SaveSystem';

function createPlatformSaveAdapter(): SaveStorageAdapter {
  if (Platform.OS === 'web') {
    return new LocalStorageSaveAdapter();
  }
  return new SQLiteSaveAdapter();
}

let saveSystemInstance: SaveSystem | null = null;

export function getSaveSystem(): SaveSystem {
  if (!saveSystemInstance) {
    saveSystemInstance = new SaveSystem(createPlatformSaveAdapter());
  }
  return saveSystemInstance;
}
