/**
 * Audio Services - Barrel export
 *
 * Re-exports all audio service modules for Iron Frontier.
 *
 * @module services/audio
 */

// Existing audio managers
export { AmbienceManager } from './AmbienceManager';
export { MusicManager } from './MusicManager';
export { SoundManager } from './SoundManager';

// New audio bridge and catalog
export {
  GameAudioBridge,
  gameAudioBridge,
  type AudioBridgeStoreShape,
  type GameAudioBridgeOptions,
} from './GameAudioBridge';

export {
  SFX_CATALOG,
  WEAPON_SOUND_MAP,
  getWeaponSounds,
  randomDetune,
  type SFXEntry,
} from './SFXCatalog';

export {
  AmbientManager,
  type AmbientZone,
  type AmbientLayerConfig,
} from './AmbientManager';
