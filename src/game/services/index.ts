/**
 * Game Services - Platform-agnostic business logic for game systems
 */

export {
  // Travel functions
  canTravel,
  executeTravel,
  formatTravelTime,
  // Display helpers
  getDangerDescription,
  getMethodDescription,
  getReachableLocations,
  getTravelCost,
  // Types
  type TravelCost,
  type TravelGameState,
  type TravelResult,
} from './TravelService';

// Audio
export { audioService } from './AudioService';
export { AmbienceManager } from './audio/AmbienceManager';
export { MusicManager } from './audio/MusicManager';
export { SoundManager } from './audio/SoundManager';

// Audio bridge & catalog (new)
export {
  GameAudioBridge,
  gameAudioBridge,
  type AudioBridgeStoreShape,
  type GameAudioBridgeOptions,
} from './audio/GameAudioBridge';
export {
  SFX_CATALOG,
  WEAPON_SOUND_MAP,
  getWeaponSounds,
  randomDetune,
  type SFXEntry,
} from './audio/SFXCatalog';
export {
  AmbientManager,
  type AmbientZone,
  type AmbientLayerConfig,
} from './audio/AmbientManager';
