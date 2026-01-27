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
};

export const DEFAULT_EQUIPMENT: EquipmentState = {
  weapon: null,
  offhand: null,
  head: null,
  body: null,
  accessory: null,
};

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
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
  distance: 30,
  azimuth: Math.PI * 0.75,
  elevation: 0.4,
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

export const DEFAULT_WORLD_POSITION = { x: 128, y: 0, z: 128 };

export const SAVE_VERSION = 2;

export const STORAGE_KEY = 'iron-frontier-save';
