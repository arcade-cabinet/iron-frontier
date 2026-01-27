import * as Tone from 'tone';

type MusicState = 'exploration_day' | 'exploration_night' | 'combat' | 'town';

export class MusicManager {
  private currentState: MusicState = 'exploration_day';
  private guitar: Tone.PolySynth;
  private ambience: Tone.PolySynth;
  private loop: Tone.Loop | null = null;
  private isPlaying = false;

  // E Minor Pentatonic
  private scale = ['E3', 'G3', 'A3', 'B3', 'D4', 'E4', 'G4'];
  
  constructor() {
    this.guitar = new Tone.PolySynth(Tone.PluckSynth as any, {
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.98
    } as any).toDestination();
    this.guitar.volume.value = -12;

    this.ambience = new Tone.PolySynth(Tone.AMSynth).toDestination();
    this.ambience.volume.value = -20;
    this.ambience.set({
      oscillator: { type: 'sine' },
      envelope: { attack: 1, decay: 2, sustain: 0.5, release: 3 }
    });
  }

  public async start() {
    if (this.isPlaying) return;
    
    await Tone.start();
    Tone.Transport.start();
    
    this.isPlaying = true;
    this.startGenerativeLoop();
  }

  public stop() {
    this.isPlaying = false;
    Tone.Transport.stop();
    if (this.loop) {
      this.loop.stop();
      this.loop.dispose();
      this.loop = null;
    }
  }

  public setState(state: MusicState) {
    if (this.currentState === state) return;
    this.currentState = state;
    // In a full implementation, this would trigger a transition (e.g., change scale, tempo)
    console.log(`[MusicManager] Transitioning to ${state}`);
  }

  private startGenerativeLoop() {
    // 4/4 Time, simplistic "Western" picking pattern generator
    this.loop = new Tone.Loop((time) => {
      // 30% chance to play a note
      if (Math.random() > 0.7) {
        const note = this.scale[Math.floor(Math.random() * this.scale.length)];
        const length = Math.random() > 0.5 ? '8n' : '4n';
        this.guitar.triggerAttackRelease(note, length, time);
      }
      
      // Occasional atmospheric chord
      if (Math.random() > 0.95) {
         this.ambience.triggerAttackRelease(['E2', 'B2'], '1m', time);
      }
    }, '8n').start(0);
  }
}
