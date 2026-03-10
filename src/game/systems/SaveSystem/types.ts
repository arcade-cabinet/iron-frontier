// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GameSaveData extends Record<string, unknown> {
  playerName: string;
  playTime: number;
  currentLocationId?: string | null;
}

export interface SaveSlotMeta {
  slotId: string;
  timestamp: number;
  playTime: number;
  playerName: string;
  playerLevel: number;
  currentDay: number;
  location: string;
  version: number;
  isQuickSave: boolean;
  isAutoSave: boolean;
}

export interface SaveFile {
  meta: SaveSlotMeta;
  data: GameSaveData;
}

export interface SaveStorageAdapter {
  saveToSlot(slotId: string, data: SaveFile): Promise<void>;
  loadFromSlot(slotId: string): Promise<SaveFile | null>;
  deleteSlot(slotId: string): Promise<void>;
  listSlots(): Promise<SaveSlotMeta[]>;
  exportSave(slotId: string): Promise<string>;
  importSave(data: string): Promise<SaveSlotMeta>;
}

export type SaveCallback = (slot: SaveSlotMeta) => void;
export type LoadCallback = (data: GameSaveData) => void;
