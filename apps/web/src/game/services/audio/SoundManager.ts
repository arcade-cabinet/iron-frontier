import * as Tone from 'tone';

export class SoundManager {
  private uiClick: Tone.MembraneSynth;
  private uiSuccess: Tone.PolySynth;
  private uiError: Tone.MetalSynth;

  constructor() {
    this.uiClick = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();
    this.uiClick.volume.value = -10;

    this.uiSuccess = new Tone.PolySynth(Tone.Synth).toDestination();
    this.uiSuccess.volume.value = -12;

    this.uiError = new Tone.MetalSynth({
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 }
    }).toDestination();
    this.uiError.volume.value = -15;
  }

  public playClick() {
    this.uiClick.triggerAttackRelease('C2', '32n');
  }

  public playSuccess() {
    this.uiSuccess.triggerAttackRelease(['C5', 'E5', 'G5'], '16n');
  }

  public playError() {
    this.uiError.triggerAttackRelease('G2', '32n');
  }
  
  public playFootstep() {
      // Simple noise burst for now, could be improved
      const noise = new Tone.NoiseSynth({
          envelope: { attack: 0.01, decay: 0.1, sustain: 0 }
      }).toDestination();
      noise.volume.value = -20;
      noise.triggerAttackRelease('32n');
  }
}
