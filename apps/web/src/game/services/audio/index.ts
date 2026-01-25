/**
 * Audio System - Iron Frontier
 *
 * Central export for all audio functionality.
 */

export {
  AudioManager,
  getAudioManager,
  resetAudioManager,
  type AudioSettings,
  type GameLocation,
  type TimeOfDay,
} from './AudioManager';

export { MusicManager, type MusicState } from './MusicManager';

export {
  SoundEffects,
  getSoundEffects,
  resetSoundEffects,
  type SFXCategory,
  type SFXConfig,
} from './SoundEffects';

export { AmbienceManager } from './AmbienceManager';

export { SoundManager } from './SoundManager';
