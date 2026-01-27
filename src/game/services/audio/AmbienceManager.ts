import * as Tone from 'tone';

export class AmbienceManager {
  private wind: Tone.Noise;
  private windFilter: Tone.AutoFilter;
  private insects: Tone.PolySynth;
  private isPlaying = false;

  constructor() {
    // Wind: Pink noise through a moving filter
    this.wind = new Tone.Noise("pink").start();
    this.wind.volume.value = -20;

    this.windFilter = new Tone.AutoFilter({
      frequency: 0.1, // Slow movement
      depth: 0.6,
      baseFrequency: 200,
      octaves: 2.6
    }).toDestination();

    this.wind.connect(this.windFilter);

    // Insects: High pitched chirps
    this.insects = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();
    this.insects.volume.value = -30;
  }

  public start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // Start wind modulation
    this.windFilter.start();

    // Random insect chirps
    this.scheduleInsects();
  }

  public stop() {
    this.isPlaying = false;
    this.windFilter.stop();
  }

  private scheduleInsects() {
    if (!this.isPlaying) return;

    const delay = Math.random() * 2 + 1; // 1-3 seconds
    setTimeout(() => {
        if (!this.isPlaying) return;
        
        // Play a chirp (high pitch triad)
        if (Math.random() > 0.5) {
             this.insects.triggerAttackRelease(['F#6', 'A6'], '32n');
        }
        this.scheduleInsects();
    }, delay * 1000);
  }
}
