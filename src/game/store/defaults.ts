/**
 * Default values for the game store
 *
 * Platform-agnostic default configuration values.
 */

import type {
  AudioState,
  CameraState,
  EquipmentState,
  GameSettings,
  PlayerStats,
  TimeState,
  WeatherState,
} from './types';

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  xp: 0,
  xpToNext: 100,
  level: 1,
  gold: 50,
  ivrcScript: 0,
  reputation: 0,
  attributes: {
    grit: 5,
    perception: 5,
    endurance: 5,
    charisma: 5,
    intelligence: 5,
    agility: 5,
    luck: 5,
  },
  skills: {
    guns: 15,
    melee: 15,
    lockpick: 15,
    speech: 15,
    repair: 15,
    medicine: 15,
    survival: 15,
    barter: 15,
  },
};

export const DEFAULT_EQUIPMENT: EquipmentState = {
  weapon: null,
  offhand: null,
  head: null,
  body: null,
  accessory: null,
};

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 1.0,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
  haptics: true,
  controlMode: 'tap',
  reducedMotion: false,
  showMinimap: true,
  lowPowerMode: false,
  cameraDistance: 25,
};

export const DEFAULT_TIME: TimeState = {
  hour: 10,
  dayOfYear: 150,
  year: 1887,
};

export const DEFAULT_WEATHER: WeatherState = {
  type: 'clear',
  intensity: 0,
  windDirection: 0,
  windSpeed: 5,
};

export const DEFAULT_CAMERA_STATE: CameraState = {
  focusPoint: { x: 32, y: 5, z: 32 },
  distance: 35,
  azimuth: Math.PI * 0.75,
  elevation: 0.55,
  minDistance: 15,
  maxDistance: 80,
  minElevation: 0.2,
  maxElevation: 1.4,
  followLag: 0.1,
  isInCutscene: false,
};

export const DEFAULT_AUDIO_STATE: AudioState = {
  currentTrack: null,
  isPlaying: false,
};

/**
 * Default player spawn position in world space.
 * Corresponds to the west entry of Dusty Springs (starting town).
 *
 * Dusty Springs world coord is (11, 9) with WORLD_CELL_SIZE=200, so town center
 * is at (2200, 0, 1800). The player arrives from the west road, placing them
 * at the western edge of town looking east down Main Street.
 */
export const DEFAULT_WORLD_POSITION = { x: 2120, y: 0, z: 1798 };

export const SAVE_VERSION = 2;

export const STORAGE_KEY = 'iron-frontier-save';
