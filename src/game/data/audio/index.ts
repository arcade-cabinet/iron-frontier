/**
 * Audio Data Module
 *
 * Exports all audio cue definitions for Iron Frontier.
 * This module defines WHEN music/sounds play, not the actual audio files.
 *
 * @module data/audio
 */

export {
  // Types - Music
  type MusicCategory,
  type MusicMood,
  type TimeOfDay,
  type BiomeType,
  type FactionTheme,
  type TransitionType,
  type MusicLayer,
  type MusicTriggerCondition,
  type MusicTrack,

  // Types - Sound Effects
  type SFXCategory,
  type SFXTriggerEvent,
  type SoundCue,

  // Types - Dynamic Music
  type DynamicMusicConfig,
  type MusicMemory,

  // Types - Ambience
  type AmbienceLayer,

  // Exploration Themes
  MainOverworldTheme,
  DesertExplorationTheme,
  MountainExplorationTheme,
  NightExplorationTheme,
  TownAmbienceTheme,
  DangerousTensionTheme,

  // Combat Themes
  StandardCombatTheme,
  BossBattleTheme,
  AmbushCombatTheme,
  FinalConfrontationTheme,

  // Emotional Themes
  VictoryTriumphTheme,
  DefeatGameOverTheme,
  SadLossMomentTheme,
  MysteryDiscoveryTheme,
  RomanceTenderTheme,
  TensionStealthTheme,

  // Location Themes
  SaloonPianoTheme,
  ChurchOrganTheme,
  IVRCCorporateTheme,
  FreeminerCampTheme,
  CopperheadHideoutTheme,
  FinalLocationTheme,

  // Stingers
  VictoryStinger,
  DefeatStinger,
  QuestCompleteStinger,
  LevelUpStinger,
  DiscoveryStinger,
  DangerStinger,

  // Registries
  ALL_MUSIC_TRACKS,
  MUSIC_TRACKS_BY_ID,
  MUSIC_TRACKS_BY_CATEGORY,
  SOUND_CUES,
  SOUND_CUES_BY_EVENT,
  SOUND_CUES_BY_CATEGORY,
  AMBIENCE_LAYERS,
  AMBIENCE_LAYERS_BY_ID,

  // Configuration
  DYNAMIC_MUSIC_CONFIG,

  // Utility Functions
  selectMusicTrack,
  getSoundCue,
  selectAmbienceLayer,
  getMusicTracksByCategory,
  getMusicTrackById,
  getStingers,
  getSoundCuesByCategory,
  shouldPlaySoundCue,
  selectSoundVariant,
} from './musicCues';
