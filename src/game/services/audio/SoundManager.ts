import * as Tone from 'tone';

/**
 * SoundManager - Procedural sound effects using Tone.js synthesizers.
 *
 * All public methods are wrapped in try/catch so that audio failures
 * never crash the game. Errors are logged to the console.
 */
export class SoundManager {
  private uiClick: Tone.MembraneSynth;
  private uiSuccess: Tone.PolySynth;
  private uiError: Tone.MetalSynth;

  // Combat Instruments
  private gunSynth: Tone.NoiseSynth;
  private reloadSynth: Tone.MetalSynth;
  private hitSynth: Tone.MembraneSynth;
  private missSynth: Tone.NoiseSynth;

  private disposed = false;

  constructor() {
    // UI Sounds
    this.uiClick = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
    }).toDestination();
    this.uiClick.volume.value = -10;

    this.uiSuccess = new Tone.PolySynth(Tone.Synth).toDestination();
    this.uiSuccess.volume.value = -12;

    this.uiError = new Tone.MetalSynth({
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    }).toDestination();
    this.uiError.volume.value = -15;

    // Combat Sounds
    this.gunSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    }).toDestination();
    this.gunSynth.volume.value = -5;

    this.reloadSynth = new Tone.MetalSynth({
      harmonicity: 12,
      resonance: 800,
      modulationIndex: 20,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      volume: -15,
    }).toDestination();

    this.hitSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 },
    }).toDestination();
    this.hitSynth.volume.value = -8;

    this.missSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0 },
    }).toDestination();
    this.missSynth.volume.value = -15;
  }

  public playClick() {
    try {
      if (this.disposed) return;
      this.uiClick.triggerAttackRelease('C2', '32n');
    } catch (e) {
      console.error('[SoundManager] playClick failed:', e);
    }
  }

  public playSuccess() {
    try {
      if (this.disposed) return;
      this.uiSuccess.triggerAttackRelease(['C5', 'E5', 'G5'], '16n');
    } catch (e) {
      console.error('[SoundManager] playSuccess failed:', e);
    }
  }

  public playError() {
    try {
      if (this.disposed) return;
      this.uiError.triggerAttackRelease('G2', '32n');
    } catch (e) {
      console.error('[SoundManager] playError failed:', e);
    }
  }

  public playFootstep() {
    try {
      if (this.disposed) return;
      // Simple noise burst for now, could be improved
      const noise = new Tone.NoiseSynth({
        envelope: { attack: 0.01, decay: 0.1, sustain: 0 },
      }).toDestination();
      noise.volume.value = -20;
      noise.triggerAttackRelease('32n');
    } catch (e) {
      console.error('[SoundManager] playFootstep failed:', e);
    }
  }

  public playGunshot() {
    try {
      if (this.disposed) return;
      this.gunSynth.triggerAttackRelease('16n');
    } catch (e) {
      console.error('[SoundManager] playGunshot failed:', e);
    }
  }

  public playReload() {
    try {
      if (this.disposed) return;
      // Two clicks
      const now = Tone.now();
      this.reloadSynth.triggerAttackRelease('32n', now);
      this.reloadSynth.triggerAttackRelease('32n', now + 0.15);
    } catch (e) {
      console.error('[SoundManager] playReload failed:', e);
    }
  }

  public playHit() {
    try {
      if (this.disposed) return;
      this.hitSynth.triggerAttackRelease('C1', '16n');
    } catch (e) {
      console.error('[SoundManager] playHit failed:', e);
    }
  }

  public playMiss() {
    try {
      if (this.disposed) return;
      this.missSynth.triggerAttackRelease('32n');
    } catch (e) {
      console.error('[SoundManager] playMiss failed:', e);
    }
  }

  /**
   * Dispose all synth nodes. Call on teardown.
   */
  public dispose() {
    this.disposed = true;
    try {
      this.uiClick.dispose();
      this.uiSuccess.dispose();
      this.uiError.dispose();
      this.gunSynth.dispose();
      this.reloadSynth.dispose();
      this.hitSynth.dispose();
      this.missSynth.dispose();
    } catch (e) {
      console.error('[SoundManager] dispose failed:', e);
    }
  }
}
