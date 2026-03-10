import type { DialogueCondition, DialogueEffect } from '../../data';

export type { DialogueCondition, DialogueEffect };

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

export interface CameraState {
  focusPoint: { x: number; y: number; z: number };
  distance: number;
  azimuth: number;
  elevation: number;
  minDistance: number;
  maxDistance: number;
  minElevation: number;
  maxElevation: number;
  followTarget?: string;
  followLag: number;
  isInCutscene: boolean;
}

export interface AudioState {
  currentTrack: string | null;
  isPlaying: boolean;
}

export interface TimeState {
  hour: number;
  dayOfYear: number;
  year: number;
}

export type WeatherType = 'clear' | 'cloudy' | 'dusty' | 'stormy';

export interface WeatherState {
  type: WeatherType;
  intensity: number;
  windDirection: number;
  windSpeed: number;
}

export interface CharacterAppearance {
  bodyType: 'slim' | 'average' | 'stocky';
  height: number;
  skinTone: string;
  faceShape: number;
  hasBeard: boolean;
  beardStyle?: 'stubble' | 'full' | 'mustache' | 'goatee';
  hasScar: boolean;
  scarPosition?: 'cheek' | 'eye' | 'chin';
  hatStyle: 'cowboy' | 'bowler' | 'flat_cap' | 'none';
  hatColor: string;
  shirtStyle: 'work' | 'fancy' | 'vest';
  shirtColor: string;
  pantsStyle: 'jeans' | 'chaps' | 'slacks';
  pantsColor: string;
  bootsStyle: 'work' | 'fancy' | 'spurs';
  hasBandana: boolean;
  bandanaColor?: string;
  hasGunbelt: boolean;
  hasPoncho: boolean;
  ponchoColor?: string;
}
