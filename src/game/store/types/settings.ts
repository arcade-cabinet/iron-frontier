export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  haptics: boolean;
  controlMode: 'tap' | 'joystick';
  reducedMotion: boolean;
  showMinimap: boolean;
  lowPowerMode: boolean;
  cameraDistance: number;
}
