import * as Tone from 'tone';
import { useGameStore } from '../store/webGameStore';
import { MusicManager } from './audio/MusicManager';
import { AmbienceManager } from './audio/AmbienceManager';
import { SoundManager } from './audio/SoundManager';

class AudioService {
  private musicManager: MusicManager;
  private ambienceManager: AmbienceManager;
  private soundManager: SoundManager;
  private initialized = false;

  constructor() {
    this.musicManager = new MusicManager();
    this.ambienceManager = new AmbienceManager();
    this.soundManager = new SoundManager();

    // Subscribe to store changes
    useGameStore.subscribe((state, prevState) => {
      // Volume changes (Global listener for now, can be granular)
      if (state.settings.musicVolume !== prevState.settings.musicVolume) {
        Tone.Destination.volume.rampTo(Tone.gainToDb(state.settings.musicVolume), 0.1);
      }

      // Track changes -> Map track IDs to "States" or just ensure playing
      if (state.audio.currentTrack !== prevState.audio.currentTrack) {
        if (state.audio.currentTrack) {
           // For now, any track ID triggers the generative loop
           // In future, map 'combat_theme' to musicManager.setState('combat')
           this.musicManager.start(); 
           this.ambienceManager.start();
        } else {
           this.musicManager.stop();
           this.ambienceManager.stop();
        }
      }

      // Play/Pause state
      if (state.audio.isPlaying !== prevState.audio.isPlaying) {
        if (state.audio.isPlaying) {
             if (Tone.context.state === 'suspended') Tone.start();
             Tone.Transport.start();
             this.musicManager.start();
             this.ambienceManager.start();
        } else {
             Tone.Transport.pause();
             this.musicManager.stop();
             this.ambienceManager.stop();
        }
      }
    });
  }

  public async initialize() {
    if (this.initialized) return;
    
    // Tone.js requires a user interaction to start the context.
    // This method should be called from a UI event handler (e.g. "Enter Game" button).
    await Tone.start();
    
    const settings = useGameStore.getState().settings;
    Tone.Destination.volume.value = Tone.gainToDb(settings.musicVolume); // utilizing music volume as master for now
    
    this.initialized = true;
    console.log('[AudioService] Initialized (Tone.js)');
  }

  public playMusic(_trackId: string) {
    // Generative system doesn't play "tracks", it enters states.
    // We ignore the specific ID for this v1 implementation.
    this.musicManager.start();
    this.ambienceManager.start();
  }

  public stopMusic() {
    this.musicManager.stop();
    this.ambienceManager.stop();
  }

  public playSfx(sfxId: string) {
    // Map legacy IDs to procedural sounds
    switch (sfxId) {
        case 'ui_click':
            this.soundManager.playClick();
            break;
        case 'footstep_dirt':
            this.soundManager.playFootstep();
            break;
        case 'gunshot':
            // Placeholder for now
            this.soundManager.playError(); 
            break;
        default:
            // Fallback for unmapped sounds
            this.soundManager.playClick(); 
            break;
    }
  }
}

export const audioService = new AudioService();
