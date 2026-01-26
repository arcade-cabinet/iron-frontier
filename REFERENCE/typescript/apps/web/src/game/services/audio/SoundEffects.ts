/**
 * SoundEffects.ts - Comprehensive sound effect manager for Iron Frontier
 *
 * Handles all game SFX using Tone.js synthesis:
 * - UI sounds (clicks, hovers, menus)
 * - Combat sounds (gunshots, hits, abilities)
 * - Movement/world sounds (footsteps, doors)
 * - Shop sounds (transactions, browse)
 * - Ambient one-shots (wind, wildlife)
 * - Stingers (victory, defeat)
 */

import * as Tone from 'tone';

export type SFXCategory = 'ui' | 'combat' | 'ambient' | 'movement' | 'shop' | 'stinger';

export interface SFXConfig {
  id: string;
  category: SFXCategory;
  volume: number; // -60 to 0 dB
  pitchVariation?: number; // Random pitch variation range
}

// Sound effect definitions using Tone.js synthesis
const SFX_DEFINITIONS: Record<string, SFXConfig> = {
  // UI Sounds
  ui_click: { id: 'ui_click', category: 'ui', volume: -15 },
  ui_hover: { id: 'ui_hover', category: 'ui', volume: -20 },
  ui_open: { id: 'ui_open', category: 'ui', volume: -12 },
  ui_close: { id: 'ui_close', category: 'ui', volume: -12 },
  ui_error: { id: 'ui_error', category: 'ui', volume: -10 },
  ui_success: { id: 'ui_success', category: 'ui', volume: -10 },
  ui_select: { id: 'ui_select', category: 'ui', volume: -14 },
  ui_confirm: { id: 'ui_confirm', category: 'ui', volume: -10 },
  ui_cancel: { id: 'ui_cancel', category: 'ui', volume: -12 },

  // Combat Sounds
  combat_hit: { id: 'combat_hit', category: 'combat', volume: -8, pitchVariation: 0.1 },
  combat_miss: { id: 'combat_miss', category: 'combat', volume: -12 },
  combat_crit: { id: 'combat_crit', category: 'combat', volume: -5 },
  combat_death: { id: 'combat_death', category: 'combat', volume: -6 },
  combat_heal: { id: 'combat_heal', category: 'combat', volume: -10 },
  combat_defend: { id: 'combat_defend', category: 'combat', volume: -10 },
  combat_flee: { id: 'combat_flee', category: 'combat', volume: -8 },
  combat_start: { id: 'combat_start', category: 'combat', volume: -6 },
  combat_victory: { id: 'combat_victory', category: 'combat', volume: -5 },
  combat_defeat: { id: 'combat_defeat', category: 'combat', volume: -6 },
  combat_gunshot: { id: 'combat_gunshot', category: 'combat', volume: -4, pitchVariation: 0.05 },
  combat_reload: { id: 'combat_reload', category: 'combat', volume: -10 },
  combat_ability: { id: 'combat_ability', category: 'combat', volume: -8 },

  // Movement/World Sounds
  footstep_dirt: { id: 'footstep_dirt', category: 'movement', volume: -18, pitchVariation: 0.15 },
  footstep_stone: { id: 'footstep_stone', category: 'movement', volume: -16, pitchVariation: 0.15 },
  footstep_sand: { id: 'footstep_sand', category: 'movement', volume: -20, pitchVariation: 0.1 },
  footstep_wood: { id: 'footstep_wood', category: 'movement', volume: -16, pitchVariation: 0.12 },
  door_open: { id: 'door_open', category: 'movement', volume: -10 },
  door_close: { id: 'door_close', category: 'movement', volume: -10 },
  chest_open: { id: 'chest_open', category: 'movement', volume: -12 },
  item_pickup: { id: 'item_pickup', category: 'movement', volume: -14 },

  // Shop Sounds
  shop_buy: { id: 'shop_buy', category: 'shop', volume: -10 },
  shop_sell: { id: 'shop_sell', category: 'shop', volume: -10 },
  shop_browse: { id: 'shop_browse', category: 'shop', volume: -16 },
  shop_error: { id: 'shop_error', category: 'shop', volume: -10 },
  coins_jingle: { id: 'coins_jingle', category: 'shop', volume: -12 },

  // Ambient (one-shot)
  ambient_wind_gust: { id: 'ambient_wind_gust', category: 'ambient', volume: -15 },
  ambient_bird: { id: 'ambient_bird', category: 'ambient', volume: -18, pitchVariation: 0.2 },
  ambient_coyote: { id: 'ambient_coyote', category: 'ambient', volume: -12 },
  ambient_crow: { id: 'ambient_crow', category: 'ambient', volume: -14 },
  ambient_thunder: { id: 'ambient_thunder', category: 'ambient', volume: -8 },

  // Stingers (short musical phrases)
  stinger_victory: { id: 'stinger_victory', category: 'stinger', volume: -6 },
  stinger_defeat: { id: 'stinger_defeat', category: 'stinger', volume: -8 },
  stinger_quest_complete: { id: 'stinger_quest_complete', category: 'stinger', volume: -8 },
  stinger_level_up: { id: 'stinger_level_up', category: 'stinger', volume: -6 },
  stinger_discovery: { id: 'stinger_discovery', category: 'stinger', volume: -10 },
};

export class SoundEffects {
  private synths: Map<string, Tone.Synth | Tone.NoiseSynth | Tone.MetalSynth | Tone.MembraneSynth> =
    new Map();
  private masterVolume: Tone.Volume;
  private categoryVolumes: Map<SFXCategory, Tone.Volume> = new Map();
  private enabled = true;

  constructor() {
    // Master volume for all SFX
    this.masterVolume = new Tone.Volume(-6).toDestination();

    // Category volumes for granular control
    const categories: SFXCategory[] = ['ui', 'combat', 'ambient', 'movement', 'shop', 'stinger'];
    for (const cat of categories) {
      const vol = new Tone.Volume(0).connect(this.masterVolume);
      this.categoryVolumes.set(cat, vol);
    }

    // Initialize synths for each sound type
    this.initializeSynths();
  }

  private initializeSynths(): void {
    const uiVol = this.categoryVolumes.get('ui')!;
    const combatVol = this.categoryVolumes.get('combat')!;
    const movementVol = this.categoryVolumes.get('movement')!;
    const ambientVol = this.categoryVolumes.get('ambient')!;
    const shopVol = this.categoryVolumes.get('shop')!;
    const stingerVol = this.categoryVolumes.get('stinger')!;

    // =========================================================================
    // UI Synths
    // =========================================================================

    // UI click - short blip
    const uiClick = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    }).connect(uiVol);
    this.synths.set('ui_click', uiClick);

    // UI hover - softer blip
    const uiHover = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 },
    }).connect(uiVol);
    this.synths.set('ui_hover', uiHover);

    // UI open - ascending tone
    const uiOpen = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 },
    }).connect(uiVol);
    this.synths.set('ui_open', uiOpen);

    // =========================================================================
    // Combat Synths
    // =========================================================================

    // Combat hit - impact sound
    const combatHit = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(combatVol);
    this.synths.set('combat_hit', combatHit);

    // Combat crit - bigger impact
    const combatCrit = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.2, release: 0.15 },
      harmonicity: 3.1,
      modulationIndex: 40,
      resonance: 3000,
      octaves: 2,
    }).connect(combatVol);
    this.synths.set('combat_crit', combatCrit);

    // Combat miss - whoosh
    const combatMiss = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.1 },
    }).connect(combatVol);
    this.synths.set('combat_miss', combatMiss);

    // Combat heal - gentle chime
    const combatHeal = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.3 },
    }).connect(combatVol);
    this.synths.set('combat_heal', combatHeal);

    // Gunshot - sharp noise burst
    const gunshot = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
    }).connect(combatVol);
    this.synths.set('combat_gunshot', gunshot);

    // Reload - metallic click
    const reload = new Tone.MetalSynth({
      harmonicity: 12,
      resonance: 800,
      modulationIndex: 20,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    }).connect(combatVol);
    this.synths.set('combat_reload', reload);

    // Ability - magical whoosh
    const ability = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.2 },
    }).connect(combatVol);
    this.synths.set('combat_ability', ability);

    // =========================================================================
    // Movement Synths
    // =========================================================================

    // Footsteps - noise based
    const footstep = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.02 },
    }).connect(movementVol);
    this.synths.set('footstep', footstep);

    // Door - creaky synth
    const door = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.1, release: 0.2 },
    }).connect(movementVol);
    this.synths.set('door', door);

    // Chest open - metallic thunk
    const chest = new Tone.MetalSynth({
      harmonicity: 8,
      resonance: 2000,
      modulationIndex: 15,
      envelope: { attack: 0.01, decay: 0.2, release: 0.1 },
    }).connect(movementVol);
    this.synths.set('chest_open', chest);

    // Item pickup - bright blip
    const itemPickup = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
    }).connect(movementVol);
    this.synths.set('item_pickup', itemPickup);

    // =========================================================================
    // Shop Synths
    // =========================================================================

    // Shop transaction - coin sound
    const shopCoin = new Tone.MetalSynth({
      harmonicity: 10,
      resonance: 3000,
      modulationIndex: 25,
      envelope: { attack: 0.001, decay: 0.15, release: 0.1 },
    }).connect(shopVol);
    this.synths.set('shop_buy', shopCoin);
    this.synths.set('shop_sell', shopCoin);
    this.synths.set('coins_jingle', shopCoin);

    // Shop browse - soft click
    const shopBrowse = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.03 },
    }).connect(shopVol);
    this.synths.set('shop_browse', shopBrowse);

    // =========================================================================
    // Ambient Synths
    // =========================================================================

    // Wind gust - filtered noise
    const wind = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.5, decay: 1, sustain: 0.3, release: 0.5 },
    }).connect(ambientVol);
    this.synths.set('ambient_wind_gust', wind);

    // Bird chirp - high sine
    const bird = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.05, release: 0.05 },
    }).connect(ambientVol);
    this.synths.set('ambient_bird', bird);

    // Coyote howl - longer envelope
    const coyote = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.2, decay: 0.5, sustain: 0.3, release: 0.5 },
    }).connect(ambientVol);
    this.synths.set('ambient_coyote', coyote);

    // Thunder - low rumble
    const thunder = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: { attack: 0.1, decay: 1.5, sustain: 0.2, release: 1 },
    }).connect(ambientVol);
    this.synths.set('ambient_thunder', thunder);

    // =========================================================================
    // Stinger Synths (musical phrases)
    // =========================================================================

    const stingerSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.3 },
    }).connect(stingerVol);
    this.synths.set('stinger', stingerSynth);
  }

  /**
   * Play a sound effect by ID
   */
  public play(sfxId: string): void {
    if (!this.enabled) return;

    const config = SFX_DEFINITIONS[sfxId];
    if (!config) {
      console.warn(`[SoundEffects] Unknown SFX: ${sfxId}`);
      return;
    }

    // Map SFX IDs to synths
    let synthKey = sfxId;

    // Footsteps all use the same synth
    if (sfxId.startsWith('footstep_')) synthKey = 'footstep';
    // Door sounds
    if (sfxId === 'door_close') synthKey = 'door';
    if (sfxId === 'door_open') synthKey = 'door';
    // UI variations
    if (sfxId === 'ui_close') synthKey = 'ui_open';
    if (sfxId === 'ui_error') synthKey = 'ui_click';
    if (sfxId === 'ui_success') synthKey = 'ui_click';
    if (sfxId === 'ui_select') synthKey = 'ui_hover';
    if (sfxId === 'ui_confirm') synthKey = 'ui_click';
    if (sfxId === 'ui_cancel') synthKey = 'ui_click';
    // Combat variations
    if (sfxId === 'combat_defend') synthKey = 'combat_hit';
    if (sfxId === 'combat_death') synthKey = 'combat_crit';
    if (sfxId === 'combat_start') synthKey = 'combat_hit';
    if (sfxId === 'combat_flee') synthKey = 'combat_miss';
    if (sfxId === 'combat_victory') synthKey = 'stinger';
    if (sfxId === 'combat_defeat') synthKey = 'stinger';
    // Shop variations
    if (sfxId === 'shop_error') synthKey = 'ui_click';
    // Ambient variations
    if (sfxId === 'ambient_crow') synthKey = 'ambient_bird';
    // Stingers
    if (sfxId.startsWith('stinger_')) synthKey = 'stinger';

    const synth = this.synths.get(synthKey);
    if (!synth) {
      console.warn(`[SoundEffects] No synth for: ${synthKey}`);
      return;
    }

    // Apply volume
    synth.volume.value = config.volume;

    // Apply pitch variation if configured
    const variation = config.pitchVariation ?? 0;
    const pitchMod = 1 + (Math.random() - 0.5) * variation * 2;

    // Trigger based on synth type
    if (synth instanceof Tone.NoiseSynth) {
      synth.triggerAttackRelease('8n');
    } else if (synth instanceof Tone.MetalSynth) {
      synth.triggerAttackRelease(200 * pitchMod, '16n');
    } else if (synth instanceof Tone.MembraneSynth) {
      synth.triggerAttackRelease('C2', '8n');
    } else {
      // Regular synth - pick note based on SFX type
      let note = 'C4';

      // UI notes
      if (sfxId === 'ui_hover' || sfxId === 'ui_select') note = 'E5';
      if (sfxId === 'ui_click' || sfxId === 'ui_confirm') note = 'G4';
      if (sfxId === 'ui_open') note = 'C5';
      if (sfxId === 'ui_close') note = 'G4';
      if (sfxId === 'ui_error' || sfxId === 'ui_cancel') note = 'C3';
      if (sfxId === 'ui_success') note = 'G5';

      // Combat notes
      if (sfxId === 'combat_heal') note = 'E5';
      if (sfxId === 'combat_ability') note = 'A4';

      // Ambient notes
      if (sfxId === 'ambient_bird' || sfxId === 'ambient_crow') note = 'E6';
      if (sfxId === 'ambient_coyote') note = 'E4';

      // Movement notes
      if (sfxId === 'door_open') note = 'D3';
      if (sfxId === 'door_close') note = 'C3';
      if (sfxId === 'item_pickup') note = 'G5';

      // Shop notes
      if (sfxId === 'shop_browse') note = 'D5';

      // Stinger notes (play arpeggio) - includes combat victory/defeat
      if (sfxId.startsWith('stinger_') || sfxId === 'combat_victory' || sfxId === 'combat_defeat') {
        const stingerType = sfxId === 'combat_victory' ? 'stinger_victory' :
                           sfxId === 'combat_defeat' ? 'stinger_defeat' : sfxId;
        this.playStingerNotes(stingerType, synth as Tone.Synth);
        return;
      }

      // Apply pitch variation
      const freq = Tone.Frequency(note).toFrequency() * pitchMod;
      (synth as Tone.Synth).triggerAttackRelease(freq, '8n');
    }
  }

  /**
   * Play stinger arpeggio
   */
  private playStingerNotes(sfxId: string, synth: Tone.Synth): void {
    const now = Tone.now();

    let notes: string[];
    let timing: number;

    if (sfxId === 'stinger_victory' || sfxId === 'stinger_quest_complete') {
      notes = ['G4', 'B4', 'D5', 'G5']; // G major ascending
      timing = 0.12;
    } else if (sfxId === 'stinger_defeat') {
      notes = ['D4', 'A3', 'F3', 'D3']; // D minor descending
      timing = 0.2;
    } else if (sfxId === 'stinger_level_up') {
      notes = ['C4', 'E4', 'G4', 'C5', 'E5']; // C major fanfare
      timing = 0.1;
    } else if (sfxId === 'stinger_discovery') {
      notes = ['E4', 'G4', 'A4']; // Short discovery
      timing = 0.15;
    } else {
      notes = ['C4', 'E4', 'G4'];
      timing = 0.15;
    }

    notes.forEach((note, i) => {
      synth.triggerAttackRelease(note, '8n', now + i * timing);
    });
  }

  /**
   * Set master SFX volume
   */
  public setMasterVolume(db: number): void {
    this.masterVolume.volume.value = Math.max(-60, Math.min(0, db));
  }

  /**
   * Set category volume
   */
  public setCategoryVolume(category: SFXCategory, db: number): void {
    const vol = this.categoryVolumes.get(category);
    if (vol) {
      vol.volume.value = Math.max(-60, Math.min(0, db));
    }
  }

  /**
   * Enable/disable all SFX
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if SFX are enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Dispose all resources
   */
  public dispose(): void {
    for (const synth of this.synths.values()) {
      synth.dispose();
    }
    this.synths.clear();
    this.masterVolume.dispose();
    for (const vol of this.categoryVolumes.values()) {
      vol.dispose();
    }
    this.categoryVolumes.clear();
  }
}

// Singleton instance
let sfxInstance: SoundEffects | null = null;

export function getSoundEffects(): SoundEffects {
  if (!sfxInstance) {
    sfxInstance = new SoundEffects();
  }
  return sfxInstance;
}

/**
 * Reset singleton (for testing)
 */
export function resetSoundEffects(): void {
  if (sfxInstance) {
    sfxInstance.dispose();
    sfxInstance = null;
  }
}
