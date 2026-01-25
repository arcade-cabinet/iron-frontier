import { Howl, Howler } from 'howler';
import { useGameStore } from '../store/webGameStore';

// Audio asset map (placeholders for now)
const AUDIO_ASSETS: Record<string, string> = {
  // Music
  title_theme: '/assets/audio/music/title_theme.mp3',
  exploration_day: '/assets/audio/music/exploration_day.mp3',
  exploration_night: '/assets/audio/music/exploration_night.mp3',
  combat_theme: '/assets/audio/music/combat_theme.mp3',
  town_theme: '/assets/audio/music/town_theme.mp3',

  // SFX
  ui_click: '/assets/audio/sfx/ui_click.mp3',
  footstep_dirt: '/assets/audio/sfx/footstep_dirt.mp3',
  gunshot: '/assets/audio/sfx/gunshot.mp3',
};

class AudioService {
  private music: Howl | null = null;
  private currentTrackId: string | null = null;
  private sfx: Map<string, Howl> = new Map();
  private initialized = false;

  constructor() {
    // Subscribe to store changes
    useGameStore.subscribe((state, prevState) => {
      // Volume changes
      if (state.settings.musicVolume !== prevState.settings.musicVolume) {
        this.updateMusicVolume(state.settings.musicVolume);
      }
      if (state.settings.sfxVolume !== prevState.settings.sfxVolume) {
        // SFX volume is global for now, or per instance
        // Howler.volume() sets global, but we want separate channels
        // We handle this when playing SFX
      }

      // Track changes
      if (state.audio.currentTrack !== this.currentTrackId) {
        if (state.audio.currentTrack) {
          this.playMusic(state.audio.currentTrack);
        } else {
          this.stopMusic();
        }
      }

      // Play/Pause state
      if (state.audio.isPlaying !== prevState.audio.isPlaying) {
        if (state.audio.isPlaying) {
          if (this.music && !this.music.playing()) {
            this.music.play();
          }
        } else {
          if (this.music && this.music.playing()) {
            this.music.pause();
          }
        }
      }
    });
  }

  public initialize() {
    if (this.initialized) return;
    
    // Set initial volumes
    const settings = useGameStore.getState().settings;
    this.updateMusicVolume(settings.musicVolume);
    
    this.initialized = true;
    console.log('[AudioService] Initialized');
  }

  public playMusic(trackId: string) {
    if (this.currentTrackId === trackId && this.music?.playing()) return;

    // Fade out old music
    if (this.music) {
      const oldMusic = this.music;
      oldMusic.fade(oldMusic.volume(), 0, 1000);
      setTimeout(() => oldMusic.stop(), 1000);
    }

    const src = AUDIO_ASSETS[trackId];
    if (!src) {
      console.warn(`[AudioService] Track not found: ${trackId}`);
      return;
    }

    const volume = useGameStore.getState().settings.musicVolume;

    this.music = new Howl({
      src: [src],
      html5: true, // Use HTML5 Audio for music (streaming)
      loop: true,
      volume: 0, // Start at 0 for fade-in
      onload: () => {
        this.music?.fade(0, volume, 1000);
      },
      onloaderror: (_id, err) => {
        console.warn(`[AudioService] Failed to load music: ${trackId}`, err);
      },
    });

    this.music.play();
    this.currentTrackId = trackId;
  }

  public stopMusic() {
    if (this.music) {
      this.music.fade(this.music.volume(), 0, 1000);
      setTimeout(() => {
        this.music?.stop();
        this.music = null;
        this.currentTrackId = null;
      }, 1000);
    }
  }

  public playSfx(sfxId: string) {
    const src = AUDIO_ASSETS[sfxId];
    if (!src) return;

    let sound = this.sfx.get(sfxId);
    if (!sound) {
      sound = new Howl({
        src: [src],
        volume: useGameStore.getState().settings.sfxVolume,
      });
      this.sfx.set(sfxId, sound);
    } else {
      // Update volume in case settings changed
      sound.volume(useGameStore.getState().settings.sfxVolume);
    }

    sound.play();
  }

  private updateMusicVolume(vol: number) {
    if (this.music) {
      this.music.volume(vol);
    }
  }
}

export const audioService = new AudioService();
