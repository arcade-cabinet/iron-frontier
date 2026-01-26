/**
 * musicCues.ts - Comprehensive Audio Cue System for Iron Frontier
 *
 * This module defines WHEN music and sounds play, not the actual audio files.
 * It provides:
 * - Music track definitions organized by category
 * - Sound effect trigger mappings for all game events
 * - Dynamic music system configuration
 * - Audio cue trigger conditions
 *
 * Architecture:
 * - MusicTrack: Defines a music piece with metadata and trigger conditions
 * - SoundCue: Defines when specific sounds play
 * - DynamicMusicConfig: Controls crossfading, layering, and stingers
 *
 * @module audio/musicCues
 */

// ============================================================================
// MUSIC TRACK TYPES
// ============================================================================

/**
 * Categories of music tracks
 */
export type MusicCategory =
  | 'exploration'
  | 'combat'
  | 'emotional'
  | 'location'
  | 'stinger';

/**
 * Music mood/intensity level
 */
export type MusicMood =
  | 'peaceful'
  | 'neutral'
  | 'tense'
  | 'dangerous'
  | 'intense'
  | 'dramatic'
  | 'melancholic'
  | 'triumphant';

/**
 * Time of day for conditional music
 */
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

/**
 * Biome/terrain types that affect music
 */
export type BiomeType =
  | 'plains'
  | 'desert'
  | 'mountain'
  | 'canyon'
  | 'forest'
  | 'badlands'
  | 'town'
  | 'interior';

/**
 * Faction alignment for thematic music
 */
export type FactionTheme =
  | 'neutral'
  | 'ivrc'
  | 'freeminer'
  | 'copperhead'
  | 'townfolk'
  | 'church';

/**
 * Music transition types
 */
export type TransitionType =
  | 'crossfade' // Smooth blend between tracks
  | 'cut' // Immediate switch
  | 'fade_out_in' // Fade out current, silence, fade in new
  | 'stinger_bridge'; // Play stinger, then transition

/**
 * Music layer for dynamic layering system
 */
export type MusicLayer =
  | 'base' // Main melodic content
  | 'rhythm' // Percussion and rhythm section
  | 'tension' // Added tension elements
  | 'ambient'; // Background atmospheric layer

// ============================================================================
// MUSIC TRACK DEFINITION
// ============================================================================

/**
 * Trigger condition for when music should play
 */
export interface MusicTriggerCondition {
  /** Type of condition */
  type:
    | 'location' // Specific location ID
    | 'biome' // Terrain/biome type
    | 'time' // Time of day
    | 'combat_state' // Combat active/inactive
    | 'danger_level' // Area danger rating (0-5)
    | 'quest_active' // Specific quest is active
    | 'faction_territory' // In faction-controlled area
    | 'player_health' // Health percentage threshold
    | 'flag_set'; // Game flag is set

  /** Value for the condition (depends on type) */
  value: string | number | boolean;

  /** Comparison operator for numeric conditions */
  operator?: 'eq' | 'lt' | 'gt' | 'lte' | 'gte';
}

/**
 * Complete music track definition
 */
export interface MusicTrack {
  /** Unique identifier */
  id: string;

  /** Display name for settings/debug */
  name: string;

  /** Category for organization */
  category: MusicCategory;

  /** Emotional mood of the track */
  mood: MusicMood;

  /** Priority (higher takes precedence when multiple tracks match) */
  priority: number;

  /** Conditions that trigger this track */
  conditions: MusicTriggerCondition[];

  /** How to transition to this track */
  transitionIn: TransitionType;

  /** How long to fade/transition (ms) */
  transitionDuration: number;

  /** Whether this track can be layered with tension elements */
  layerable: boolean;

  /** Available layers if layerable */
  layers?: MusicLayer[];

  /** Whether to loop the track */
  loop: boolean;

  /** BPM for synchronization */
  bpm?: number;

  /** Scale/key for procedural harmony */
  scale?: string[];

  /** Tags for filtering/grouping */
  tags: string[];

  /** Descriptive notes for the composer/sound designer */
  notes?: string;
}

// ============================================================================
// EXPLORATION THEMES (6 tracks)
// ============================================================================

export const MainOverworldTheme: MusicTrack = {
  id: 'exploration_main',
  name: 'The Iron Frontier',
  category: 'exploration',
  mood: 'neutral',
  priority: 10,
  conditions: [
    { type: 'biome', value: 'plains' },
    { type: 'combat_state', value: false },
    { type: 'danger_level', value: 2, operator: 'lte' },
  ],
  transitionIn: 'crossfade',
  transitionDuration: 2000,
  layerable: true,
  layers: ['base', 'rhythm', 'ambient'],
  loop: true,
  bpm: 80,
  scale: ['E3', 'G3', 'A3', 'B3', 'D4', 'E4', 'G4'], // E minor pentatonic
  tags: ['overworld', 'default', 'western'],
  notes:
    'Main exploration theme. Evokes wide open spaces, frontier adventure. Acoustic guitar lead with subtle strings.',
};

export const DesertExplorationTheme: MusicTrack = {
  id: 'exploration_desert',
  name: 'Dust and Sun',
  category: 'exploration',
  mood: 'neutral',
  priority: 15,
  conditions: [
    { type: 'biome', value: 'desert' },
    { type: 'combat_state', value: false },
  ],
  transitionIn: 'crossfade',
  transitionDuration: 3000,
  layerable: true,
  layers: ['base', 'ambient'],
  loop: true,
  bpm: 70,
  scale: ['A3', 'C4', 'D4', 'E4', 'G4', 'A4'], // A minor pentatonic
  tags: ['desert', 'heat', 'desolate'],
  notes:
    'Sparse, heat-hazed atmosphere. Distant harmonica, minimal percussion. Evokes the harsh beauty of the desert.',
};

export const MountainExplorationTheme: MusicTrack = {
  id: 'exploration_mountain',
  name: 'High Country',
  category: 'exploration',
  mood: 'peaceful',
  priority: 15,
  conditions: [
    { type: 'biome', value: 'mountain' },
    { type: 'combat_state', value: false },
  ],
  transitionIn: 'crossfade',
  transitionDuration: 3000,
  layerable: true,
  layers: ['base', 'ambient'],
  loop: true,
  bpm: 65,
  scale: ['D3', 'E3', 'F#3', 'A3', 'B3', 'D4'], // D major pentatonic
  tags: ['mountain', 'majestic', 'cold'],
  notes:
    'Majestic, open feeling. Echoing horns, clean guitar arpeggios. Wind ambience woven into the track.',
};

export const NightExplorationTheme: MusicTrack = {
  id: 'exploration_night',
  name: 'Moonlit Trail',
  category: 'exploration',
  mood: 'tense',
  priority: 20,
  conditions: [
    { type: 'time', value: 'night' },
    { type: 'combat_state', value: false },
    { type: 'location', value: 'overworld' },
  ],
  transitionIn: 'crossfade',
  transitionDuration: 4000,
  layerable: true,
  layers: ['base', 'tension', 'ambient'],
  loop: true,
  bpm: 60,
  scale: ['A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4'], // A minor (darker)
  tags: ['night', 'mysterious', 'danger'],
  notes:
    'Quieter, more mysterious. Subtle tension underneath. Coyote howls in ambience, sparse notes.',
};

export const TownAmbienceTheme: MusicTrack = {
  id: 'exploration_town_peaceful',
  name: 'Dusty Streets',
  category: 'exploration',
  mood: 'peaceful',
  priority: 25,
  conditions: [
    { type: 'biome', value: 'town' },
    { type: 'combat_state', value: false },
    { type: 'danger_level', value: 1, operator: 'lte' },
  ],
  transitionIn: 'crossfade',
  transitionDuration: 2000,
  layerable: false,
  loop: true,
  bpm: 90,
  scale: ['G3', 'A3', 'B3', 'D4', 'E4', 'G4', 'A4'], // G major pentatonic
  tags: ['town', 'safe', 'friendly'],
  notes:
    'Warm, welcoming. Light fingerpicking guitar, distant saloon piano. Feels like coming home.',
};

export const DangerousTensionTheme: MusicTrack = {
  id: 'exploration_danger',
  name: 'Something Stirs',
  category: 'exploration',
  mood: 'dangerous',
  priority: 30,
  conditions: [
    { type: 'danger_level', value: 4, operator: 'gte' },
    { type: 'combat_state', value: false },
  ],
  transitionIn: 'crossfade',
  transitionDuration: 1500,
  layerable: true,
  layers: ['base', 'tension'],
  loop: true,
  bpm: 100,
  scale: ['E2', 'F2', 'G2', 'Bb2', 'C3', 'D3'], // E phrygian (tense)
  tags: ['danger', 'tension', 'stealth'],
  notes:
    'Ominous, building dread. Low strings, subtle percussion, dissonant undertones. Used in hostile territory.',
};

// ============================================================================
// COMBAT THEMES (4 tracks)
// ============================================================================

export const StandardCombatTheme: MusicTrack = {
  id: 'combat_standard',
  name: 'Draw!',
  category: 'combat',
  mood: 'intense',
  priority: 100,
  conditions: [
    { type: 'combat_state', value: true },
    { type: 'danger_level', value: 3, operator: 'lte' },
  ],
  transitionIn: 'cut',
  transitionDuration: 500,
  layerable: true,
  layers: ['base', 'rhythm', 'tension'],
  loop: true,
  bpm: 140,
  scale: ['E2', 'G2', 'A2', 'B2', 'D3', 'E3'], // E minor (intense)
  tags: ['combat', 'action', 'standard'],
  notes:
    'Driving Western combat theme. Heavy guitar riffs, pounding drums. Classic showdown energy.',
};

export const BossBattleTheme: MusicTrack = {
  id: 'combat_boss',
  name: 'The Reckoning',
  category: 'combat',
  mood: 'dramatic',
  priority: 120,
  conditions: [
    { type: 'combat_state', value: true },
    { type: 'flag_set', value: 'boss_battle_active' },
  ],
  transitionIn: 'stinger_bridge',
  transitionDuration: 1000,
  layerable: true,
  layers: ['base', 'rhythm', 'tension'],
  loop: true,
  bpm: 160,
  scale: ['E2', 'F2', 'G#2', 'A2', 'B2', 'D3'], // E harmonic minor (epic)
  tags: ['combat', 'boss', 'epic'],
  notes:
    'Epic boss confrontation. Full orchestra meets Western. Builds intensity throughout battle.',
};

export const AmbushCombatTheme: MusicTrack = {
  id: 'combat_ambush',
  name: 'Bushwhacked!',
  category: 'combat',
  mood: 'intense',
  priority: 110,
  conditions: [
    { type: 'combat_state', value: true },
    { type: 'flag_set', value: 'ambush_triggered' },
  ],
  transitionIn: 'cut',
  transitionDuration: 0,
  layerable: false,
  loop: true,
  bpm: 150,
  scale: ['F#2', 'A2', 'B2', 'C#3', 'E3'], // F# minor (sharp, urgent)
  tags: ['combat', 'ambush', 'surprise'],
  notes:
    'Sudden, chaotic. Starts with jarring stinger. Faster tempo, more frantic energy than standard combat.',
};

export const FinalConfrontationTheme: MusicTrack = {
  id: 'combat_final',
  name: 'Iron Judgment',
  category: 'combat',
  mood: 'dramatic',
  priority: 150,
  conditions: [
    { type: 'combat_state', value: true },
    { type: 'quest_active', value: 'iron_tyrant' },
  ],
  transitionIn: 'stinger_bridge',
  transitionDuration: 2000,
  layerable: true,
  layers: ['base', 'rhythm', 'tension'],
  loop: true,
  bpm: 170,
  scale: ['D2', 'E2', 'F2', 'G2', 'A2', 'Bb2', 'C3'], // D phrygian dominant
  tags: ['combat', 'final', 'climax'],
  notes:
    'The ultimate confrontation. Steam-powered intensity, mechanical rhythms mixed with Western. The sound of industry vs humanity.',
};

// ============================================================================
// EMOTIONAL THEMES (6 tracks)
// ============================================================================

export const VictoryTriumphTheme: MusicTrack = {
  id: 'emotional_victory',
  name: 'Justice Done',
  category: 'emotional',
  mood: 'triumphant',
  priority: 200,
  conditions: [{ type: 'flag_set', value: 'major_victory' }],
  transitionIn: 'stinger_bridge',
  transitionDuration: 500,
  layerable: false,
  loop: false,
  bpm: 120,
  scale: ['G3', 'B3', 'D4', 'G4', 'B4', 'D5'], // G major arpeggio
  tags: ['victory', 'triumph', 'celebration'],
  notes:
    'Triumphant fanfare. Brass swells, uplifting melody. Plays after major quest completions.',
};

export const DefeatGameOverTheme: MusicTrack = {
  id: 'emotional_defeat',
  name: 'Fallen Hero',
  category: 'emotional',
  mood: 'melancholic',
  priority: 200,
  conditions: [{ type: 'flag_set', value: 'game_over' }],
  transitionIn: 'fade_out_in',
  transitionDuration: 2000,
  layerable: false,
  loop: false,
  bpm: 40,
  scale: ['D2', 'F2', 'A2', 'D3', 'F3'], // D minor (somber)
  tags: ['defeat', 'death', 'game_over'],
  notes:
    'Somber, respectful. Slow strings, mournful guitar. Brief but impactful.',
};

export const SadLossMomentTheme: MusicTrack = {
  id: 'emotional_loss',
  name: 'The Cost',
  category: 'emotional',
  mood: 'melancholic',
  priority: 180,
  conditions: [{ type: 'flag_set', value: 'tragic_moment' }],
  transitionIn: 'fade_out_in',
  transitionDuration: 3000,
  layerable: false,
  loop: true,
  bpm: 50,
  scale: ['A2', 'C3', 'E3', 'G3', 'B3'], // A minor 7
  tags: ['sad', 'emotional', 'loss'],
  notes:
    'Heartfelt, personal tragedy. Solo acoustic guitar, minimal arrangement. For NPC deaths, failed quests.',
};

export const MysteryDiscoveryTheme: MusicTrack = {
  id: 'emotional_mystery',
  name: 'Ancient Secrets',
  category: 'emotional',
  mood: 'tense',
  priority: 170,
  conditions: [{ type: 'flag_set', value: 'discovery_moment' }],
  transitionIn: 'crossfade',
  transitionDuration: 2000,
  layerable: true,
  layers: ['base', 'ambient'],
  loop: true,
  bpm: 55,
  scale: ['B2', 'D3', 'E3', 'F#3', 'A3', 'B3'], // B dorian
  tags: ['mystery', 'discovery', 'lore'],
  notes:
    'Wonder mixed with unease. Ethereal pads, curious melodies. For discovering secrets, ancient ruins.',
};

export const RomanceTenderTheme: MusicTrack = {
  id: 'emotional_romance',
  name: 'Gentle Heart',
  category: 'emotional',
  mood: 'peaceful',
  priority: 160,
  conditions: [{ type: 'flag_set', value: 'romance_scene' }],
  transitionIn: 'crossfade',
  transitionDuration: 3000,
  layerable: false,
  loop: true,
  bpm: 70,
  scale: ['C3', 'E3', 'G3', 'A3', 'B3', 'D4', 'E4'], // C major
  tags: ['romance', 'tender', 'emotional'],
  notes:
    'Warm, intimate. Fingerpicked guitar, soft strings. For romantic dialogue, tender moments.',
};

export const TensionStealthTheme: MusicTrack = {
  id: 'emotional_stealth',
  name: 'Shadows Move',
  category: 'emotional',
  mood: 'tense',
  priority: 90,
  conditions: [
    { type: 'flag_set', value: 'stealth_active' },
    { type: 'combat_state', value: false },
  ],
  transitionIn: 'crossfade',
  transitionDuration: 1500,
  layerable: true,
  layers: ['base', 'tension'],
  loop: true,
  bpm: 85,
  scale: ['C#2', 'E2', 'F#2', 'G#2', 'B2'], // C# minor
  tags: ['stealth', 'tension', 'infiltration'],
  notes:
    'Creeping dread. Heartbeat-like bass, sparse high notes. For sneaking, tense exploration.',
};

// ============================================================================
// LOCATION THEMES (6 tracks)
// ============================================================================

export const SaloonPianoTheme: MusicTrack = {
  id: 'location_saloon',
  name: 'Whiskey and Cards',
  category: 'location',
  mood: 'neutral',
  priority: 50,
  conditions: [{ type: 'location', value: 'saloon' }],
  transitionIn: 'crossfade',
  transitionDuration: 1000,
  layerable: false,
  loop: true,
  bpm: 120,
  scale: ['C3', 'D3', 'E3', 'G3', 'A3', 'C4'], // C major pentatonic
  tags: ['saloon', 'piano', 'ragtime'],
  notes:
    'Honky-tonk piano. Ragtime-influenced, lively. Crowd murmur in ambience. Classic Western saloon feel.',
};

export const ChurchOrganTheme: MusicTrack = {
  id: 'location_church',
  name: 'Sacred Ground',
  category: 'location',
  mood: 'peaceful',
  priority: 50,
  conditions: [{ type: 'location', value: 'church' }],
  transitionIn: 'crossfade',
  transitionDuration: 2000,
  layerable: false,
  loop: true,
  bpm: 60,
  scale: ['F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4'], // F major
  tags: ['church', 'organ', 'sacred'],
  notes:
    'Reverent pipe organ. Hymn-like progressions. Solemn but hopeful. For Salvation church scenes.',
};

export const IVRCCorporateTheme: MusicTrack = {
  id: 'location_ivrc',
  name: 'The Machine',
  category: 'location',
  mood: 'tense',
  priority: 55,
  conditions: [{ type: 'faction_territory', value: 'ivrc' }],
  transitionIn: 'crossfade',
  transitionDuration: 2000,
  layerable: true,
  layers: ['base', 'rhythm'],
  loop: true,
  bpm: 100,
  scale: ['E2', 'F#2', 'G2', 'A2', 'B2', 'C3', 'D3'], // E aeolian
  tags: ['ivrc', 'industrial', 'oppressive'],
  notes:
    'Cold, mechanical. Industrial percussion, steam hisses, oppressive brass. Evokes corporate power.',
};

export const FreeminerCampTheme: MusicTrack = {
  id: 'location_freeminer',
  name: 'Free Spirits',
  category: 'location',
  mood: 'peaceful',
  priority: 55,
  conditions: [{ type: 'faction_territory', value: 'freeminer' }],
  transitionIn: 'crossfade',
  transitionDuration: 2000,
  layerable: false,
  loop: true,
  bpm: 85,
  scale: ['D3', 'E3', 'F#3', 'G3', 'A3', 'B3', 'C#4', 'D4'], // D major
  tags: ['freeminer', 'hopeful', 'folk'],
  notes:
    'Folk-influenced, hopeful. Banjo, fiddle, campfire warmth. Community and freedom themes.',
};

export const CopperheadHideoutTheme: MusicTrack = {
  id: 'location_copperhead',
  name: "Viper's Den",
  category: 'location',
  mood: 'dangerous',
  priority: 55,
  conditions: [{ type: 'faction_territory', value: 'copperhead' }],
  transitionIn: 'crossfade',
  transitionDuration: 1500,
  layerable: true,
  layers: ['base', 'tension'],
  loop: true,
  bpm: 95,
  scale: ['Bb2', 'Db3', 'Eb3', 'F3', 'Gb3', 'Ab3'], // Bb minor blues
  tags: ['copperhead', 'outlaw', 'dangerous'],
  notes:
    'Menacing, lawless. Slide guitar, rattlesnake-like percussion. Danger and rebellion.',
};

export const FinalLocationTheme: MusicTrack = {
  id: 'location_finale',
  name: 'End of the Line',
  category: 'location',
  mood: 'dramatic',
  priority: 60,
  conditions: [{ type: 'location', value: 'iron_heart_factory' }],
  transitionIn: 'fade_out_in',
  transitionDuration: 3000,
  layerable: true,
  layers: ['base', 'rhythm', 'tension', 'ambient'],
  loop: true,
  bpm: 110,
  scale: ['C2', 'Eb2', 'F2', 'G2', 'Bb2', 'C3'], // C minor
  tags: ['finale', 'factory', 'climax'],
  notes:
    'The final location. Full industrial soundscape meets epic Western. Steam, gears, and destiny.',
};

// ============================================================================
// STINGERS (Short musical phrases for events)
// ============================================================================

export const VictoryStinger: MusicTrack = {
  id: 'stinger_victory',
  name: 'Victory Fanfare',
  category: 'stinger',
  mood: 'triumphant',
  priority: 250,
  conditions: [{ type: 'flag_set', value: 'combat_victory' }],
  transitionIn: 'cut',
  transitionDuration: 0,
  layerable: false,
  loop: false,
  bpm: 120,
  scale: ['G4', 'B4', 'D5', 'G5'],
  tags: ['stinger', 'victory', 'combat_end'],
  notes: 'Short triumphant arpeggio. 2-3 seconds. Plays on combat victory.',
};

export const DefeatStinger: MusicTrack = {
  id: 'stinger_defeat',
  name: 'Fallen',
  category: 'stinger',
  mood: 'melancholic',
  priority: 250,
  conditions: [{ type: 'flag_set', value: 'combat_defeat' }],
  transitionIn: 'cut',
  transitionDuration: 0,
  layerable: false,
  loop: false,
  bpm: 50,
  scale: ['D3', 'A2', 'F2', 'D2'],
  tags: ['stinger', 'defeat', 'combat_end'],
  notes: 'Descending minor arpeggio. Brief, respectful. Plays on combat defeat.',
};

export const QuestCompleteStinger: MusicTrack = {
  id: 'stinger_quest',
  name: 'Quest Complete',
  category: 'stinger',
  mood: 'triumphant',
  priority: 240,
  conditions: [{ type: 'flag_set', value: 'quest_complete' }],
  transitionIn: 'cut',
  transitionDuration: 0,
  layerable: false,
  loop: false,
  bpm: 100,
  scale: ['C4', 'E4', 'G4', 'C5'],
  tags: ['stinger', 'quest', 'achievement'],
  notes: 'Achievement fanfare. Major arpeggio with resolve.',
};

export const LevelUpStinger: MusicTrack = {
  id: 'stinger_levelup',
  name: 'Level Up',
  category: 'stinger',
  mood: 'triumphant',
  priority: 240,
  conditions: [{ type: 'flag_set', value: 'level_up' }],
  transitionIn: 'cut',
  transitionDuration: 0,
  layerable: false,
  loop: false,
  bpm: 100,
  scale: ['C4', 'E4', 'G4', 'C5', 'E5'],
  tags: ['stinger', 'levelup', 'achievement'],
  notes: 'Ascending fanfare. More elaborate than quest complete.',
};

export const DiscoveryStinger: MusicTrack = {
  id: 'stinger_discovery',
  name: 'Discovery',
  category: 'stinger',
  mood: 'neutral',
  priority: 230,
  conditions: [{ type: 'flag_set', value: 'new_discovery' }],
  transitionIn: 'cut',
  transitionDuration: 0,
  layerable: false,
  loop: false,
  bpm: 80,
  scale: ['E4', 'G4', 'A4'],
  tags: ['stinger', 'discovery', 'exploration'],
  notes:
    'Short, curious phrase. Wonder mixed with intrigue. For finding secrets.',
};

export const DangerStinger: MusicTrack = {
  id: 'stinger_danger',
  name: 'Danger Ahead',
  category: 'stinger',
  mood: 'tense',
  priority: 235,
  conditions: [{ type: 'flag_set', value: 'danger_detected' }],
  transitionIn: 'cut',
  transitionDuration: 0,
  layerable: false,
  loop: false,
  bpm: 90,
  scale: ['E2', 'Bb2', 'E3'],
  tags: ['stinger', 'danger', 'warning'],
  notes:
    'Ominous warning. Low tritone stab. For detecting enemies, traps.',
};

// ============================================================================
// MUSIC TRACK REGISTRY
// ============================================================================

export const ALL_MUSIC_TRACKS: MusicTrack[] = [
  // Exploration
  MainOverworldTheme,
  DesertExplorationTheme,
  MountainExplorationTheme,
  NightExplorationTheme,
  TownAmbienceTheme,
  DangerousTensionTheme,

  // Combat
  StandardCombatTheme,
  BossBattleTheme,
  AmbushCombatTheme,
  FinalConfrontationTheme,

  // Emotional
  VictoryTriumphTheme,
  DefeatGameOverTheme,
  SadLossMomentTheme,
  MysteryDiscoveryTheme,
  RomanceTenderTheme,
  TensionStealthTheme,

  // Location
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
];

export const MUSIC_TRACKS_BY_ID: Record<string, MusicTrack> = Object.fromEntries(
  ALL_MUSIC_TRACKS.map((track) => [track.id, track])
);

export const MUSIC_TRACKS_BY_CATEGORY: Record<MusicCategory, MusicTrack[]> = {
  exploration: ALL_MUSIC_TRACKS.filter((t) => t.category === 'exploration'),
  combat: ALL_MUSIC_TRACKS.filter((t) => t.category === 'combat'),
  emotional: ALL_MUSIC_TRACKS.filter((t) => t.category === 'emotional'),
  location: ALL_MUSIC_TRACKS.filter((t) => t.category === 'location'),
  stinger: ALL_MUSIC_TRACKS.filter((t) => t.category === 'stinger'),
};

// ============================================================================
// SOUND EFFECT CUE TYPES
// ============================================================================

/**
 * Categories of sound effects
 */
export type SFXCategory =
  | 'ui'
  | 'combat'
  | 'movement'
  | 'ambient'
  | 'character'
  | 'shop'
  | 'environmental'
  | 'stinger';

/**
 * Sound effect trigger event type
 */
export type SFXTriggerEvent =
  // UI Events
  | 'ui_click'
  | 'ui_hover'
  | 'ui_open'
  | 'ui_close'
  | 'ui_error'
  | 'ui_success'
  | 'ui_select'
  | 'ui_confirm'
  | 'ui_cancel'
  | 'ui_tab_switch'
  | 'ui_scroll'
  | 'ui_notification'

  // Inventory Events
  | 'inventory_open'
  | 'inventory_close'
  | 'inventory_item_select'
  | 'inventory_item_use'
  | 'inventory_item_equip'
  | 'inventory_item_unequip'
  | 'inventory_item_drop'
  | 'inventory_sort'
  | 'inventory_full'

  // Combat Events
  | 'combat_start'
  | 'combat_end_victory'
  | 'combat_end_defeat'
  | 'combat_end_fled'
  | 'combat_attack_melee'
  | 'combat_attack_ranged'
  | 'combat_hit'
  | 'combat_miss'
  | 'combat_critical'
  | 'combat_block'
  | 'combat_parry'
  | 'combat_dodge'
  | 'combat_death_enemy'
  | 'combat_death_ally'
  | 'combat_heal'
  | 'combat_buff'
  | 'combat_debuff'
  | 'combat_flee_attempt'
  | 'combat_flee_success'
  | 'combat_flee_fail'
  | 'combat_turn_start'
  | 'combat_turn_end'
  | 'combat_ability_fire'
  | 'combat_ability_steam'
  | 'combat_ability_heal'
  | 'combat_reload'
  | 'combat_out_of_ammo'

  // Weapon-Specific Events
  | 'weapon_revolver_fire'
  | 'weapon_rifle_fire'
  | 'weapon_shotgun_fire'
  | 'weapon_gatling_fire'
  | 'weapon_melee_swing'
  | 'weapon_melee_hit'
  | 'weapon_dynamite_throw'
  | 'weapon_dynamite_explode'
  | 'weapon_reload'
  | 'weapon_empty_click'

  // Movement Events
  | 'footstep_dirt'
  | 'footstep_sand'
  | 'footstep_stone'
  | 'footstep_wood'
  | 'footstep_metal'
  | 'footstep_grass'
  | 'footstep_water'
  | 'footstep_snow'
  | 'mount_horse'
  | 'dismount_horse'
  | 'horse_gallop'
  | 'horse_trot'
  | 'horse_neigh'
  | 'horse_snort'

  // Environmental Events
  | 'door_open_wood'
  | 'door_close_wood'
  | 'door_open_metal'
  | 'door_close_metal'
  | 'door_locked'
  | 'door_unlock'
  | 'chest_open'
  | 'chest_close'
  | 'chest_locked'
  | 'crate_break'
  | 'lever_pull'
  | 'switch_toggle'
  | 'bell_ring'
  | 'train_whistle'
  | 'train_chug'
  | 'steam_release'
  | 'machinery_whir'
  | 'gears_turning'
  | 'explosion_small'
  | 'explosion_large'
  | 'collapse_structure'

  // Weather Events
  | 'wind_light'
  | 'wind_strong'
  | 'wind_gust'
  | 'rain_start'
  | 'rain_loop'
  | 'rain_stop'
  | 'thunder_distant'
  | 'thunder_close'
  | 'sandstorm_start'
  | 'sandstorm_loop'

  // Ambient One-Shots
  | 'ambient_bird_chirp'
  | 'ambient_bird_crow'
  | 'ambient_coyote_howl'
  | 'ambient_wolf_howl'
  | 'ambient_rattlesnake'
  | 'ambient_cricket'
  | 'ambient_owl'
  | 'ambient_cicada'
  | 'ambient_saloon_murmur'
  | 'ambient_crowd_cheer'
  | 'ambient_pickaxe'
  | 'ambient_hammer'
  | 'ambient_church_bell'

  // Character/Dialogue Events
  | 'dialogue_start'
  | 'dialogue_end'
  | 'dialogue_choice_select'
  | 'dialogue_text_blip'
  | 'dialogue_text_blip_male'
  | 'dialogue_text_blip_female'
  | 'dialogue_text_blip_old'
  | 'dialogue_text_blip_gruff'
  | 'character_grunt_male'
  | 'character_grunt_female'
  | 'character_pain_male'
  | 'character_pain_female'
  | 'character_death_male'
  | 'character_death_female'
  | 'character_laugh'
  | 'character_cough'

  // Shop Events
  | 'shop_open'
  | 'shop_close'
  | 'shop_browse'
  | 'shop_buy'
  | 'shop_sell'
  | 'shop_haggle'
  | 'shop_error'
  | 'coins_jingle'
  | 'coins_drop'
  | 'cash_register'

  // Pickup/Loot Events
  | 'item_pickup'
  | 'item_pickup_gold'
  | 'item_pickup_ammo'
  | 'item_pickup_health'
  | 'item_pickup_key'
  | 'item_pickup_quest'
  | 'loot_reveal'
  | 'loot_rare'
  | 'loot_legendary'

  // Quest Events
  | 'quest_accepted'
  | 'quest_updated'
  | 'quest_objective_complete'
  | 'quest_complete'
  | 'quest_failed'

  // Level/XP Events
  | 'xp_gain'
  | 'level_up'
  | 'skill_unlock'
  | 'achievement_unlock'

  // Save/Load Events
  | 'save_game'
  | 'load_game'
  | 'autosave'

  // System Events
  | 'game_start'
  | 'game_pause'
  | 'game_resume'
  | 'screenshot';

/**
 * Sound cue definition
 */
export interface SoundCue {
  /** Event that triggers this sound */
  event: SFXTriggerEvent;

  /** Sound effect ID to play */
  sfxId: string;

  /** Category for volume control */
  category: SFXCategory;

  /** Volume adjustment from category default (-20 to +10 dB) */
  volumeOffset: number;

  /** Random pitch variation range (0-0.5) */
  pitchVariation: number;

  /** Delay before playing (ms) */
  delay: number;

  /** Whether to allow overlapping instances */
  allowOverlap: boolean;

  /** Cooldown between plays (ms), 0 for none */
  cooldown: number;

  /** Probability of playing (0-1), for random variation */
  probability: number;

  /** Alternative sounds to randomly choose from */
  variants?: string[];

  /** Tags for filtering */
  tags: string[];
}

// ============================================================================
// SOUND CUE DEFINITIONS
// ============================================================================

/**
 * All sound cue mappings
 */
export const SOUND_CUES: SoundCue[] = [
  // =========================================================================
  // UI SOUNDS
  // =========================================================================
  {
    event: 'ui_click',
    sfxId: 'ui_click',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: true,
    cooldown: 50,
    probability: 1,
    tags: ['ui', 'basic'],
  },
  {
    event: 'ui_hover',
    sfxId: 'ui_hover',
    category: 'ui',
    volumeOffset: -6,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 30,
    probability: 0.8,
    tags: ['ui', 'subtle'],
  },
  {
    event: 'ui_open',
    sfxId: 'ui_open',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 100,
    probability: 1,
    tags: ['ui', 'panel'],
  },
  {
    event: 'ui_close',
    sfxId: 'ui_close',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 100,
    probability: 1,
    tags: ['ui', 'panel'],
  },
  {
    event: 'ui_error',
    sfxId: 'ui_error',
    category: 'ui',
    volumeOffset: 3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['ui', 'feedback'],
  },
  {
    event: 'ui_success',
    sfxId: 'ui_success',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['ui', 'feedback'],
  },
  {
    event: 'ui_confirm',
    sfxId: 'ui_confirm',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 100,
    probability: 1,
    tags: ['ui', 'action'],
  },
  {
    event: 'ui_cancel',
    sfxId: 'ui_cancel',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 100,
    probability: 1,
    tags: ['ui', 'action'],
  },
  {
    event: 'ui_select',
    sfxId: 'ui_select',
    category: 'ui',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 50,
    probability: 1,
    tags: ['ui', 'navigation'],
  },
  {
    event: 'ui_tab_switch',
    sfxId: 'ui_tab',
    category: 'ui',
    volumeOffset: -3,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 100,
    probability: 1,
    tags: ['ui', 'navigation'],
  },
  {
    event: 'ui_notification',
    sfxId: 'ui_notification',
    category: 'ui',
    volumeOffset: 3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 500,
    probability: 1,
    tags: ['ui', 'alert'],
  },

  // =========================================================================
  // INVENTORY SOUNDS
  // =========================================================================
  {
    event: 'inventory_open',
    sfxId: 'inventory_open',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['inventory', 'panel'],
  },
  {
    event: 'inventory_close',
    sfxId: 'inventory_close',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['inventory', 'panel'],
  },
  {
    event: 'inventory_item_select',
    sfxId: 'item_select',
    category: 'ui',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 50,
    probability: 1,
    tags: ['inventory', 'item'],
  },
  {
    event: 'inventory_item_use',
    sfxId: 'item_use',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['inventory', 'item'],
  },
  {
    event: 'inventory_item_equip',
    sfxId: 'item_equip',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 100,
    probability: 1,
    tags: ['inventory', 'equipment'],
  },
  {
    event: 'inventory_item_unequip',
    sfxId: 'item_unequip',
    category: 'ui',
    volumeOffset: -3,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 100,
    probability: 1,
    tags: ['inventory', 'equipment'],
  },
  {
    event: 'inventory_full',
    sfxId: 'inventory_full',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 500,
    probability: 1,
    tags: ['inventory', 'error'],
  },

  // =========================================================================
  // COMBAT SOUNDS
  // =========================================================================
  {
    event: 'combat_start',
    sfxId: 'combat_start',
    category: 'combat',
    volumeOffset: 3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 1000,
    probability: 1,
    tags: ['combat', 'transition'],
  },
  {
    event: 'combat_end_victory',
    sfxId: 'combat_victory',
    category: 'stinger',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 500,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['combat', 'victory'],
  },
  {
    event: 'combat_end_defeat',
    sfxId: 'combat_defeat',
    category: 'stinger',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 500,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['combat', 'defeat'],
  },
  {
    event: 'combat_hit',
    sfxId: 'combat_hit',
    category: 'combat',
    volumeOffset: 0,
    pitchVariation: 0.15,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    variants: ['combat_hit_1', 'combat_hit_2', 'combat_hit_3'],
    tags: ['combat', 'damage'],
  },
  {
    event: 'combat_miss',
    sfxId: 'combat_miss',
    category: 'combat',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['combat', 'miss'],
  },
  {
    event: 'combat_critical',
    sfxId: 'combat_crit',
    category: 'combat',
    volumeOffset: 6,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['combat', 'damage', 'critical'],
  },
  {
    event: 'combat_block',
    sfxId: 'combat_block',
    category: 'combat',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['combat', 'defense'],
  },
  {
    event: 'combat_dodge',
    sfxId: 'combat_dodge',
    category: 'combat',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['combat', 'defense'],
  },
  {
    event: 'combat_death_enemy',
    sfxId: 'enemy_death',
    category: 'combat',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    variants: ['enemy_death_1', 'enemy_death_2'],
    tags: ['combat', 'death'],
  },
  {
    event: 'combat_heal',
    sfxId: 'heal',
    category: 'combat',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 100,
    probability: 1,
    tags: ['combat', 'healing'],
  },
  {
    event: 'combat_buff',
    sfxId: 'buff_apply',
    category: 'combat',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['combat', 'buff'],
  },
  {
    event: 'combat_debuff',
    sfxId: 'debuff_apply',
    category: 'combat',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['combat', 'debuff'],
  },
  {
    event: 'combat_flee_success',
    sfxId: 'flee_success',
    category: 'combat',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['combat', 'flee'],
  },
  {
    event: 'combat_flee_fail',
    sfxId: 'flee_fail',
    category: 'combat',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['combat', 'flee'],
  },
  {
    event: 'combat_turn_start',
    sfxId: 'turn_start',
    category: 'combat',
    volumeOffset: -6,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 500,
    probability: 1,
    tags: ['combat', 'turn'],
  },
  {
    event: 'combat_reload',
    sfxId: 'weapon_reload',
    category: 'combat',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 500,
    probability: 1,
    tags: ['combat', 'weapon'],
  },
  {
    event: 'combat_out_of_ammo',
    sfxId: 'ammo_empty',
    category: 'combat',
    volumeOffset: 3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['combat', 'weapon', 'error'],
  },

  // =========================================================================
  // WEAPON SOUNDS
  // =========================================================================
  {
    event: 'weapon_revolver_fire',
    sfxId: 'revolver_fire',
    category: 'combat',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    variants: ['revolver_fire_1', 'revolver_fire_2'],
    tags: ['weapon', 'gunfire', 'revolver'],
  },
  {
    event: 'weapon_rifle_fire',
    sfxId: 'rifle_fire',
    category: 'combat',
    volumeOffset: 3,
    pitchVariation: 0.03,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['weapon', 'gunfire', 'rifle'],
  },
  {
    event: 'weapon_shotgun_fire',
    sfxId: 'shotgun_fire',
    category: 'combat',
    volumeOffset: 6,
    pitchVariation: 0.02,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['weapon', 'gunfire', 'shotgun'],
  },
  {
    event: 'weapon_gatling_fire',
    sfxId: 'gatling_fire',
    category: 'combat',
    volumeOffset: 6,
    pitchVariation: 0.02,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['weapon', 'gunfire', 'gatling'],
  },
  {
    event: 'weapon_melee_swing',
    sfxId: 'melee_swing',
    category: 'combat',
    volumeOffset: -3,
    pitchVariation: 0.15,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['weapon', 'melee'],
  },
  {
    event: 'weapon_melee_hit',
    sfxId: 'melee_hit',
    category: 'combat',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['weapon', 'melee', 'impact'],
  },
  {
    event: 'weapon_dynamite_throw',
    sfxId: 'dynamite_throw',
    category: 'combat',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['weapon', 'explosive'],
  },
  {
    event: 'weapon_dynamite_explode',
    sfxId: 'explosion_large',
    category: 'combat',
    volumeOffset: 6,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['weapon', 'explosive', 'impact'],
  },
  {
    event: 'weapon_reload',
    sfxId: 'weapon_reload',
    category: 'combat',
    volumeOffset: -3,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 300,
    probability: 1,
    tags: ['weapon', 'reload'],
  },
  {
    event: 'weapon_empty_click',
    sfxId: 'weapon_empty',
    category: 'combat',
    volumeOffset: -6,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: false,
    cooldown: 100,
    probability: 1,
    tags: ['weapon', 'empty'],
  },

  // =========================================================================
  // MOVEMENT/FOOTSTEP SOUNDS
  // =========================================================================
  {
    event: 'footstep_dirt',
    sfxId: 'footstep_dirt',
    category: 'movement',
    volumeOffset: -6,
    pitchVariation: 0.2,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 0.9,
    variants: ['footstep_dirt_1', 'footstep_dirt_2', 'footstep_dirt_3'],
    tags: ['footstep', 'dirt'],
  },
  {
    event: 'footstep_sand',
    sfxId: 'footstep_sand',
    category: 'movement',
    volumeOffset: -9,
    pitchVariation: 0.15,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 0.85,
    variants: ['footstep_sand_1', 'footstep_sand_2'],
    tags: ['footstep', 'sand'],
  },
  {
    event: 'footstep_stone',
    sfxId: 'footstep_stone',
    category: 'movement',
    volumeOffset: -3,
    pitchVariation: 0.15,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 0.9,
    variants: ['footstep_stone_1', 'footstep_stone_2', 'footstep_stone_3'],
    tags: ['footstep', 'stone'],
  },
  {
    event: 'footstep_wood',
    sfxId: 'footstep_wood',
    category: 'movement',
    volumeOffset: -6,
    pitchVariation: 0.15,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 0.9,
    variants: ['footstep_wood_1', 'footstep_wood_2'],
    tags: ['footstep', 'wood'],
  },
  {
    event: 'footstep_metal',
    sfxId: 'footstep_metal',
    category: 'movement',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 0.9,
    variants: ['footstep_metal_1', 'footstep_metal_2'],
    tags: ['footstep', 'metal'],
  },
  {
    event: 'footstep_grass',
    sfxId: 'footstep_grass',
    category: 'movement',
    volumeOffset: -12,
    pitchVariation: 0.2,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 0.8,
    variants: ['footstep_grass_1', 'footstep_grass_2'],
    tags: ['footstep', 'grass'],
  },
  {
    event: 'horse_gallop',
    sfxId: 'horse_gallop',
    category: 'movement',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['horse', 'mount'],
  },
  {
    event: 'horse_neigh',
    sfxId: 'horse_neigh',
    category: 'movement',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: false,
    cooldown: 2000,
    probability: 0.3,
    variants: ['horse_neigh_1', 'horse_neigh_2'],
    tags: ['horse', 'vocalization'],
  },

  // =========================================================================
  // ENVIRONMENTAL SOUNDS
  // =========================================================================
  {
    event: 'door_open_wood',
    sfxId: 'door_wood_open',
    category: 'environmental',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['door', 'wood'],
  },
  {
    event: 'door_close_wood',
    sfxId: 'door_wood_close',
    category: 'environmental',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['door', 'wood'],
  },
  {
    event: 'door_open_metal',
    sfxId: 'door_metal_open',
    category: 'environmental',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['door', 'metal'],
  },
  {
    event: 'door_locked',
    sfxId: 'door_locked',
    category: 'environmental',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: false,
    cooldown: 300,
    probability: 1,
    tags: ['door', 'locked'],
  },
  {
    event: 'door_unlock',
    sfxId: 'door_unlock',
    category: 'environmental',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['door', 'unlock'],
  },
  {
    event: 'chest_open',
    sfxId: 'chest_open',
    category: 'environmental',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['chest', 'container'],
  },
  {
    event: 'chest_locked',
    sfxId: 'chest_locked',
    category: 'environmental',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: false,
    cooldown: 300,
    probability: 1,
    tags: ['chest', 'locked'],
  },
  {
    event: 'lever_pull',
    sfxId: 'lever_pull',
    category: 'environmental',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 500,
    probability: 1,
    tags: ['lever', 'mechanical'],
  },
  {
    event: 'switch_toggle',
    sfxId: 'switch_toggle',
    category: 'environmental',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['switch', 'mechanical'],
  },
  {
    event: 'train_whistle',
    sfxId: 'train_whistle',
    category: 'environmental',
    volumeOffset: 6,
    pitchVariation: 0.02,
    delay: 0,
    allowOverlap: false,
    cooldown: 3000,
    probability: 1,
    tags: ['train', 'ambient'],
  },
  {
    event: 'steam_release',
    sfxId: 'steam_release',
    category: 'environmental',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['steam', 'mechanical'],
  },
  {
    event: 'gears_turning',
    sfxId: 'gears_loop',
    category: 'environmental',
    volumeOffset: -6,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['gears', 'mechanical', 'loop'],
  },
  {
    event: 'explosion_small',
    sfxId: 'explosion_small',
    category: 'environmental',
    volumeOffset: 3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['explosion'],
  },
  {
    event: 'explosion_large',
    sfxId: 'explosion_large',
    category: 'environmental',
    volumeOffset: 6,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['explosion', 'large'],
  },

  // =========================================================================
  // WEATHER SOUNDS
  // =========================================================================
  {
    event: 'wind_gust',
    sfxId: 'wind_gust',
    category: 'ambient',
    volumeOffset: -6,
    pitchVariation: 0.2,
    delay: 0,
    allowOverlap: true,
    cooldown: 2000,
    probability: 0.5,
    variants: ['wind_gust_1', 'wind_gust_2', 'wind_gust_3'],
    tags: ['weather', 'wind'],
  },
  {
    event: 'thunder_distant',
    sfxId: 'thunder_distant',
    category: 'ambient',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 5000,
    probability: 1,
    variants: ['thunder_1', 'thunder_2'],
    tags: ['weather', 'thunder'],
  },
  {
    event: 'thunder_close',
    sfxId: 'thunder_close',
    category: 'ambient',
    volumeOffset: 6,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: true,
    cooldown: 3000,
    probability: 1,
    tags: ['weather', 'thunder', 'loud'],
  },

  // =========================================================================
  // AMBIENT ONE-SHOT SOUNDS
  // =========================================================================
  {
    event: 'ambient_bird_chirp',
    sfxId: 'bird_chirp',
    category: 'ambient',
    volumeOffset: -12,
    pitchVariation: 0.3,
    delay: 0,
    allowOverlap: true,
    cooldown: 1000,
    probability: 0.3,
    variants: ['bird_chirp_1', 'bird_chirp_2', 'bird_chirp_3'],
    tags: ['ambient', 'wildlife', 'bird'],
  },
  {
    event: 'ambient_bird_crow',
    sfxId: 'crow_caw',
    category: 'ambient',
    volumeOffset: -6,
    pitchVariation: 0.15,
    delay: 0,
    allowOverlap: true,
    cooldown: 3000,
    probability: 0.2,
    variants: ['crow_caw_1', 'crow_caw_2'],
    tags: ['ambient', 'wildlife', 'bird', 'ominous'],
  },
  {
    event: 'ambient_coyote_howl',
    sfxId: 'coyote_howl',
    category: 'ambient',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: false,
    cooldown: 10000,
    probability: 0.15,
    tags: ['ambient', 'wildlife', 'night'],
  },
  {
    event: 'ambient_rattlesnake',
    sfxId: 'rattlesnake_rattle',
    category: 'ambient',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 5000,
    probability: 0.4,
    tags: ['ambient', 'wildlife', 'danger'],
  },
  {
    event: 'ambient_cricket',
    sfxId: 'cricket_chirp',
    category: 'ambient',
    volumeOffset: -15,
    pitchVariation: 0.2,
    delay: 0,
    allowOverlap: true,
    cooldown: 500,
    probability: 0.4,
    tags: ['ambient', 'wildlife', 'night'],
  },
  {
    event: 'ambient_owl',
    sfxId: 'owl_hoot',
    category: 'ambient',
    volumeOffset: -9,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: false,
    cooldown: 8000,
    probability: 0.2,
    tags: ['ambient', 'wildlife', 'night'],
  },
  {
    event: 'ambient_church_bell',
    sfxId: 'church_bell',
    category: 'ambient',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['ambient', 'town', 'church'],
  },

  // =========================================================================
  // CHARACTER/DIALOGUE SOUNDS
  // =========================================================================
  {
    event: 'dialogue_start',
    sfxId: 'dialogue_open',
    category: 'character',
    volumeOffset: -6,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['dialogue', 'ui'],
  },
  {
    event: 'dialogue_end',
    sfxId: 'dialogue_close',
    category: 'character',
    volumeOffset: -6,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['dialogue', 'ui'],
  },
  {
    event: 'dialogue_choice_select',
    sfxId: 'dialogue_select',
    category: 'character',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: false,
    cooldown: 100,
    probability: 1,
    tags: ['dialogue', 'selection'],
  },
  {
    event: 'dialogue_text_blip',
    sfxId: 'text_blip',
    category: 'character',
    volumeOffset: -15,
    pitchVariation: 0.3,
    delay: 0,
    allowOverlap: true,
    cooldown: 30,
    probability: 0.7,
    tags: ['dialogue', 'text'],
  },
  {
    event: 'dialogue_text_blip_male',
    sfxId: 'text_blip_male',
    category: 'character',
    volumeOffset: -15,
    pitchVariation: 0.2,
    delay: 0,
    allowOverlap: true,
    cooldown: 30,
    probability: 0.7,
    tags: ['dialogue', 'text', 'male'],
  },
  {
    event: 'dialogue_text_blip_female',
    sfxId: 'text_blip_female',
    category: 'character',
    volumeOffset: -15,
    pitchVariation: 0.2,
    delay: 0,
    allowOverlap: true,
    cooldown: 30,
    probability: 0.7,
    tags: ['dialogue', 'text', 'female'],
  },
  {
    event: 'dialogue_text_blip_gruff',
    sfxId: 'text_blip_gruff',
    category: 'character',
    volumeOffset: -12,
    pitchVariation: 0.15,
    delay: 0,
    allowOverlap: true,
    cooldown: 30,
    probability: 0.7,
    tags: ['dialogue', 'text', 'gruff'],
  },

  // =========================================================================
  // SHOP SOUNDS
  // =========================================================================
  {
    event: 'shop_open',
    sfxId: 'shop_open',
    category: 'shop',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['shop', 'ui'],
  },
  {
    event: 'shop_close',
    sfxId: 'shop_close',
    category: 'shop',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['shop', 'ui'],
  },
  {
    event: 'shop_browse',
    sfxId: 'shop_browse',
    category: 'shop',
    volumeOffset: -6,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 50,
    probability: 0.8,
    tags: ['shop', 'navigation'],
  },
  {
    event: 'shop_buy',
    sfxId: 'coins_exchange',
    category: 'shop',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['shop', 'transaction'],
  },
  {
    event: 'shop_sell',
    sfxId: 'coins_receive',
    category: 'shop',
    volumeOffset: 0,
    pitchVariation: 0.05,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['shop', 'transaction'],
  },
  {
    event: 'shop_error',
    sfxId: 'shop_error',
    category: 'shop',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 300,
    probability: 1,
    tags: ['shop', 'error'],
  },
  {
    event: 'coins_jingle',
    sfxId: 'coins_jingle',
    category: 'shop',
    volumeOffset: -6,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 100,
    probability: 1,
    tags: ['coins', 'ambient'],
  },

  // =========================================================================
  // PICKUP/LOOT SOUNDS
  // =========================================================================
  {
    event: 'item_pickup',
    sfxId: 'item_pickup',
    category: 'movement',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 50,
    probability: 1,
    tags: ['item', 'pickup'],
  },
  {
    event: 'item_pickup_gold',
    sfxId: 'gold_pickup',
    category: 'movement',
    volumeOffset: 0,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['item', 'pickup', 'gold'],
  },
  {
    event: 'item_pickup_ammo',
    sfxId: 'ammo_pickup',
    category: 'movement',
    volumeOffset: -3,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['item', 'pickup', 'ammo'],
  },
  {
    event: 'item_pickup_health',
    sfxId: 'health_pickup',
    category: 'movement',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: true,
    cooldown: 0,
    probability: 1,
    tags: ['item', 'pickup', 'health'],
  },
  {
    event: 'item_pickup_quest',
    sfxId: 'quest_item_pickup',
    category: 'movement',
    volumeOffset: 3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['item', 'pickup', 'quest'],
  },
  {
    event: 'loot_reveal',
    sfxId: 'loot_reveal',
    category: 'movement',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['loot', 'reveal'],
  },
  {
    event: 'loot_rare',
    sfxId: 'loot_rare',
    category: 'stinger',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['loot', 'rare'],
  },
  {
    event: 'loot_legendary',
    sfxId: 'loot_legendary',
    category: 'stinger',
    volumeOffset: 3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['loot', 'legendary'],
  },

  // =========================================================================
  // QUEST SOUNDS
  // =========================================================================
  {
    event: 'quest_accepted',
    sfxId: 'quest_accept',
    category: 'stinger',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 500,
    probability: 1,
    tags: ['quest', 'accept'],
  },
  {
    event: 'quest_updated',
    sfxId: 'quest_update',
    category: 'ui',
    volumeOffset: -3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['quest', 'update'],
  },
  {
    event: 'quest_objective_complete',
    sfxId: 'objective_complete',
    category: 'stinger',
    volumeOffset: -3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 200,
    probability: 1,
    tags: ['quest', 'objective'],
  },
  {
    event: 'quest_complete',
    sfxId: 'quest_complete',
    category: 'stinger',
    volumeOffset: 3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['quest', 'complete'],
  },
  {
    event: 'quest_failed',
    sfxId: 'quest_failed',
    category: 'stinger',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['quest', 'failed'],
  },

  // =========================================================================
  // LEVEL/XP SOUNDS
  // =========================================================================
  {
    event: 'xp_gain',
    sfxId: 'xp_gain',
    category: 'ui',
    volumeOffset: -9,
    pitchVariation: 0.1,
    delay: 0,
    allowOverlap: true,
    cooldown: 50,
    probability: 0.8,
    tags: ['xp', 'gain'],
  },
  {
    event: 'level_up',
    sfxId: 'level_up',
    category: 'stinger',
    volumeOffset: 3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['level', 'achievement'],
  },
  {
    event: 'skill_unlock',
    sfxId: 'skill_unlock',
    category: 'stinger',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['skill', 'unlock'],
  },
  {
    event: 'achievement_unlock',
    sfxId: 'achievement_unlock',
    category: 'stinger',
    volumeOffset: 3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 0,
    probability: 1,
    tags: ['achievement', 'unlock'],
  },

  // =========================================================================
  // SAVE/LOAD SOUNDS
  // =========================================================================
  {
    event: 'save_game',
    sfxId: 'save_game',
    category: 'ui',
    volumeOffset: -3,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 500,
    probability: 1,
    tags: ['save', 'system'],
  },
  {
    event: 'load_game',
    sfxId: 'load_game',
    category: 'ui',
    volumeOffset: 0,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 500,
    probability: 1,
    tags: ['load', 'system'],
  },
  {
    event: 'autosave',
    sfxId: 'autosave',
    category: 'ui',
    volumeOffset: -9,
    pitchVariation: 0,
    delay: 0,
    allowOverlap: false,
    cooldown: 1000,
    probability: 1,
    tags: ['save', 'auto', 'system'],
  },
];

// ============================================================================
// SOUND CUE REGISTRY
// ============================================================================

export const SOUND_CUES_BY_EVENT: Record<SFXTriggerEvent, SoundCue> = Object.fromEntries(
  SOUND_CUES.map((cue) => [cue.event, cue])
) as Record<SFXTriggerEvent, SoundCue>;

export const SOUND_CUES_BY_CATEGORY: Record<SFXCategory, SoundCue[]> = {
  ui: SOUND_CUES.filter((c) => c.category === 'ui'),
  combat: SOUND_CUES.filter((c) => c.category === 'combat'),
  movement: SOUND_CUES.filter((c) => c.category === 'movement'),
  ambient: SOUND_CUES.filter((c) => c.category === 'ambient'),
  character: SOUND_CUES.filter((c) => c.category === 'character'),
  shop: SOUND_CUES.filter((c) => c.category === 'shop'),
  environmental: SOUND_CUES.filter((c) => c.category === 'environmental'),
  stinger: SOUND_CUES.filter((c) => c.category === 'stinger'),
};

// ============================================================================
// DYNAMIC MUSIC SYSTEM CONFIGURATION
// ============================================================================

/**
 * Configuration for the dynamic music system
 */
export interface DynamicMusicConfig {
  /** Default crossfade duration (ms) */
  defaultCrossfadeDuration: number;

  /** Time to remember previous track for return (ms) */
  musicMemoryDuration: number;

  /** Volume duck amount for stingers (-dB) */
  stingerDuckAmount: number;

  /** Duck duration for stingers (ms) */
  stingerDuckDuration: number;

  /** Minimum time before switching tracks (ms) */
  minimumPlayTime: number;

  /** Layer fade duration (ms) */
  layerFadeDuration: number;

  /** Tension layer trigger threshold (danger level) */
  tensionLayerThreshold: number;

  /** Combat start stinger ID */
  combatStartStinger: string;

  /** Boss encounter stinger ID */
  bossEncounterStinger: string;

  /** Ambush stinger ID */
  ambushStinger: string;
}

export const DYNAMIC_MUSIC_CONFIG: DynamicMusicConfig = {
  defaultCrossfadeDuration: 2000,
  musicMemoryDuration: 60000, // Remember for 1 minute
  stingerDuckAmount: -12,
  stingerDuckDuration: 500,
  minimumPlayTime: 5000, // Play at least 5 seconds
  layerFadeDuration: 1000,
  tensionLayerThreshold: 3, // Danger level 3+ adds tension layer
  combatStartStinger: 'stinger_danger',
  bossEncounterStinger: 'stinger_boss',
  ambushStinger: 'stinger_danger',
};

/**
 * Music memory state for return-to-previous functionality
 */
export interface MusicMemory {
  /** Previous track ID */
  trackId: string;

  /** Timestamp when we switched away */
  switchedAt: number;

  /** Position in track (ms) - for resuming */
  position?: number;
}

// ============================================================================
// AMBIENCE LAYER DEFINITIONS
// ============================================================================

/**
 * Ambient sound layer definition
 */
export interface AmbienceLayer {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Conditions when this layer plays */
  conditions: MusicTriggerCondition[];

  /** List of ambient sound IDs to randomly trigger */
  sounds: string[];

  /** Minimum interval between sounds (ms) */
  minInterval: number;

  /** Maximum interval between sounds (ms) */
  maxInterval: number;

  /** Base volume (-dB) */
  volume: number;

  /** Whether to loop a base ambient track */
  hasBaseLoop: boolean;

  /** Base loop track ID if applicable */
  baseLoopId?: string;

  /** Tags for filtering */
  tags: string[];
}

export const AMBIENCE_LAYERS: AmbienceLayer[] = [
  {
    id: 'ambience_day_plains',
    name: 'Daytime Plains',
    conditions: [
      { type: 'biome', value: 'plains' },
      { type: 'time', value: 'day' },
    ],
    sounds: [
      'bird_chirp_1', 'bird_chirp_2', 'bird_chirp_3',
      'wind_gust_1', 'wind_gust_2',
      'cricket_chirp',
    ],
    minInterval: 2000,
    maxInterval: 8000,
    volume: -18,
    hasBaseLoop: true,
    baseLoopId: 'wind_light_loop',
    tags: ['day', 'plains', 'peaceful'],
  },
  {
    id: 'ambience_night_plains',
    name: 'Nighttime Plains',
    conditions: [
      { type: 'biome', value: 'plains' },
      { type: 'time', value: 'night' },
    ],
    sounds: [
      'cricket_chirp', 'owl_hoot', 'coyote_howl',
      'wind_gust_1',
    ],
    minInterval: 3000,
    maxInterval: 12000,
    volume: -15,
    hasBaseLoop: true,
    baseLoopId: 'wind_light_loop',
    tags: ['night', 'plains', 'eerie'],
  },
  {
    id: 'ambience_desert',
    name: 'Desert',
    conditions: [{ type: 'biome', value: 'desert' }],
    sounds: [
      'wind_gust_1', 'wind_gust_2', 'wind_gust_3',
      'rattlesnake_rattle', 'crow_caw_1',
    ],
    minInterval: 4000,
    maxInterval: 15000,
    volume: -12,
    hasBaseLoop: true,
    baseLoopId: 'desert_wind_loop',
    tags: ['desert', 'desolate'],
  },
  {
    id: 'ambience_mountain',
    name: 'Mountain',
    conditions: [{ type: 'biome', value: 'mountain' }],
    sounds: [
      'wind_strong', 'eagle_cry', 'rock_tumble',
    ],
    minInterval: 5000,
    maxInterval: 20000,
    volume: -12,
    hasBaseLoop: true,
    baseLoopId: 'mountain_wind_loop',
    tags: ['mountain', 'majestic'],
  },
  {
    id: 'ambience_town_day',
    name: 'Town Daytime',
    conditions: [
      { type: 'biome', value: 'town' },
      { type: 'time', value: 'day' },
    ],
    sounds: [
      'horse_snort', 'distant_hammer', 'door_creak',
      'saloon_murmur', 'chicken_cluck', 'dog_bark',
    ],
    minInterval: 2000,
    maxInterval: 8000,
    volume: -15,
    hasBaseLoop: true,
    baseLoopId: 'town_bustle_loop',
    tags: ['town', 'busy', 'day'],
  },
  {
    id: 'ambience_town_night',
    name: 'Town Nighttime',
    conditions: [
      { type: 'biome', value: 'town' },
      { type: 'time', value: 'night' },
    ],
    sounds: [
      'saloon_piano_distant', 'dog_bark', 'owl_hoot',
      'drunk_laughter', 'door_creak',
    ],
    minInterval: 4000,
    maxInterval: 15000,
    volume: -18,
    hasBaseLoop: true,
    baseLoopId: 'night_quiet_loop',
    tags: ['town', 'quiet', 'night'],
  },
  {
    id: 'ambience_factory',
    name: 'Factory/Industrial',
    conditions: [{ type: 'faction_territory', value: 'ivrc' }],
    sounds: [
      'steam_release', 'gears_turning', 'metal_clang',
      'machinery_whir', 'hammer_strike',
    ],
    minInterval: 1000,
    maxInterval: 5000,
    volume: -9,
    hasBaseLoop: true,
    baseLoopId: 'machinery_loop',
    tags: ['industrial', 'factory', 'ivrc'],
  },
  {
    id: 'ambience_saloon',
    name: 'Saloon Interior',
    conditions: [{ type: 'location', value: 'saloon' }],
    sounds: [
      'glass_clink', 'card_shuffle', 'chair_scrape',
      'laughter', 'coin_drop',
    ],
    minInterval: 500,
    maxInterval: 3000,
    volume: -12,
    hasBaseLoop: true,
    baseLoopId: 'saloon_crowd_loop',
    tags: ['saloon', 'interior', 'busy'],
  },
];

export const AMBIENCE_LAYERS_BY_ID: Record<string, AmbienceLayer> = Object.fromEntries(
  AMBIENCE_LAYERS.map((layer) => [layer.id, layer])
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the highest priority matching music track for current game state
 */
export function selectMusicTrack(
  state: {
    location?: string;
    biome?: BiomeType;
    timeOfDay?: TimeOfDay;
    inCombat?: boolean;
    dangerLevel?: number;
    flags?: Set<string>;
    factionTerritory?: FactionTheme;
    activeQuests?: string[];
    playerHealth?: number;
  }
): MusicTrack | null {
  const matchingTracks = ALL_MUSIC_TRACKS.filter((track) => {
    return track.conditions.every((condition) => {
      switch (condition.type) {
        case 'location':
          return state.location === condition.value;
        case 'biome':
          return state.biome === condition.value;
        case 'time':
          return state.timeOfDay === condition.value;
        case 'combat_state':
          return state.inCombat === condition.value;
        case 'danger_level':
          if (state.dangerLevel === undefined) return false;
          return compareNumeric(state.dangerLevel, condition.value as number, condition.operator);
        case 'flag_set':
          return state.flags?.has(condition.value as string) ?? false;
        case 'faction_territory':
          return state.factionTerritory === condition.value;
        case 'quest_active':
          return state.activeQuests?.includes(condition.value as string) ?? false;
        case 'player_health':
          if (state.playerHealth === undefined) return false;
          return compareNumeric(state.playerHealth, condition.value as number, condition.operator);
        default:
          return false;
      }
    });
  });

  if (matchingTracks.length === 0) return null;

  // Return highest priority track
  return matchingTracks.reduce((highest, current) =>
    current.priority > highest.priority ? current : highest
  );
}

/**
 * Compare numeric values with operator
 */
function compareNumeric(
  value: number,
  target: number,
  operator?: 'eq' | 'lt' | 'gt' | 'lte' | 'gte'
): boolean {
  switch (operator) {
    case 'lt':
      return value < target;
    case 'gt':
      return value > target;
    case 'lte':
      return value <= target;
    case 'gte':
      return value >= target;
    case 'eq':
    default:
      return value === target;
  }
}

/**
 * Get sound cue for an event
 */
export function getSoundCue(event: SFXTriggerEvent): SoundCue | undefined {
  return SOUND_CUES_BY_EVENT[event];
}

/**
 * Get applicable ambience layer for current state
 */
export function selectAmbienceLayer(
  state: {
    location?: string;
    biome?: BiomeType;
    timeOfDay?: TimeOfDay;
    factionTerritory?: FactionTheme;
  }
): AmbienceLayer | null {
  // Find matching layer with most specific conditions
  const matchingLayers = AMBIENCE_LAYERS.filter((layer) => {
    return layer.conditions.every((condition) => {
      switch (condition.type) {
        case 'location':
          return state.location === condition.value;
        case 'biome':
          return state.biome === condition.value;
        case 'time':
          return state.timeOfDay === condition.value;
        case 'faction_territory':
          return state.factionTerritory === condition.value;
        default:
          return false;
      }
    });
  });

  if (matchingLayers.length === 0) return null;

  // Return layer with most conditions (most specific)
  return matchingLayers.reduce((most, current) =>
    current.conditions.length > most.conditions.length ? current : most
  );
}

/**
 * Get music tracks by category
 */
export function getMusicTracksByCategory(category: MusicCategory): MusicTrack[] {
  return MUSIC_TRACKS_BY_CATEGORY[category] ?? [];
}

/**
 * Get a music track by ID
 */
export function getMusicTrackById(id: string): MusicTrack | undefined {
  return MUSIC_TRACKS_BY_ID[id];
}

/**
 * Get all stinger tracks
 */
export function getStingers(): MusicTrack[] {
  return MUSIC_TRACKS_BY_CATEGORY.stinger;
}

/**
 * Get sound cues by category
 */
export function getSoundCuesByCategory(category: SFXCategory): SoundCue[] {
  return SOUND_CUES_BY_CATEGORY[category] ?? [];
}

/**
 * Check if a sound cue should play based on probability
 */
export function shouldPlaySoundCue(cue: SoundCue): boolean {
  return Math.random() < cue.probability;
}

/**
 * Select a random variant from a sound cue
 */
export function selectSoundVariant(cue: SoundCue): string {
  if (!cue.variants || cue.variants.length === 0) {
    return cue.sfxId;
  }
  return cue.variants[Math.floor(Math.random() * cue.variants.length)];
}
