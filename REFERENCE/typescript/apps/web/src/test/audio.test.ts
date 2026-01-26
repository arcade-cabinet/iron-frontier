/**
 * Audio System Tests
 *
 * Tests for AudioManager, MusicManager, and SoundEffects
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AudioManager,
  getAudioManager,
  resetAudioManager,
  type AudioSettings,
} from '@/game/services/audio/AudioManager';
import { MusicManager } from '@/game/services/audio/MusicManager';
import {
  getSoundEffects,
  resetSoundEffects,
  SoundEffects,
} from '@/game/services/audio/SoundEffects';

describe('AudioManager', () => {
  beforeEach(() => {
    resetAudioManager();
    resetSoundEffects();
  });

  afterEach(() => {
    resetAudioManager();
    resetSoundEffects();
  });

  describe('Initialization', () => {
    it('should create a singleton instance', () => {
      const instance1 = getAudioManager();
      const instance2 = getAudioManager();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with default settings', () => {
      const audio = getAudioManager();
      const settings = audio.getSettings();

      expect(settings.masterVolume).toBe(80);
      expect(settings.musicVolume).toBe(70);
      expect(settings.sfxVolume).toBe(80);
      expect(settings.ambientVolume).toBe(60);
      expect(settings.enabled).toBe(true);
    });

    it('should initialize Tone.js on init()', async () => {
      const audio = getAudioManager();
      await audio.init();
      expect(audio.getIsInitialized()).toBe(true);
    });
  });

  describe('Settings', () => {
    it('should update settings', () => {
      const audio = getAudioManager();
      audio.setSettings({ masterVolume: 50, musicVolume: 30 });

      const settings = audio.getSettings();
      expect(settings.masterVolume).toBe(50);
      expect(settings.musicVolume).toBe(30);
      expect(settings.sfxVolume).toBe(80); // Unchanged
    });

    it('should toggle enabled state', () => {
      const audio = getAudioManager();
      expect(audio.isEnabled()).toBe(true);

      audio.toggle();
      expect(audio.isEnabled()).toBe(false);

      audio.toggle();
      expect(audio.isEnabled()).toBe(true);
    });
  });

  describe('Location and Time', () => {
    it('should set location', () => {
      const audio = getAudioManager();
      // Should not throw
      audio.setLocation('combat');
      audio.setLocation('town');
      audio.setLocation('overworld');
    });

    it('should set time of day', () => {
      const audio = getAudioManager();
      // Should not throw
      audio.setTimeOfDay('dawn');
      audio.setTimeOfDay('day');
      audio.setTimeOfDay('dusk');
      audio.setTimeOfDay('night');
    });
  });

  describe('Sound Effect Methods', () => {
    it('should have playUI method', () => {
      const audio = getAudioManager();
      expect(() => audio.playUI('click')).not.toThrow();
      expect(() => audio.playUI('hover')).not.toThrow();
      expect(() => audio.playUI('open')).not.toThrow();
      expect(() => audio.playUI('close')).not.toThrow();
      expect(() => audio.playUI('error')).not.toThrow();
      expect(() => audio.playUI('success')).not.toThrow();
    });

    it('should have playCombat method', () => {
      const audio = getAudioManager();
      expect(() => audio.playCombat('hit')).not.toThrow();
      expect(() => audio.playCombat('miss')).not.toThrow();
      expect(() => audio.playCombat('crit')).not.toThrow();
      expect(() => audio.playCombat('gunshot')).not.toThrow();
      expect(() => audio.playCombat('reload')).not.toThrow();
    });

    it('should have playMovement method', () => {
      const audio = getAudioManager();
      expect(() => audio.playMovement('footstep_dirt')).not.toThrow();
      expect(() => audio.playMovement('door_open')).not.toThrow();
      expect(() => audio.playMovement('item_pickup')).not.toThrow();
    });

    it('should have playShop method', () => {
      const audio = getAudioManager();
      expect(() => audio.playShop('buy')).not.toThrow();
      expect(() => audio.playShop('sell')).not.toThrow();
      expect(() => audio.playShop('browse')).not.toThrow();
    });

    it('should have playStinger method', () => {
      const audio = getAudioManager();
      expect(() => audio.playStinger('victory')).not.toThrow();
      expect(() => audio.playStinger('defeat')).not.toThrow();
      expect(() => audio.playStinger('quest_complete')).not.toThrow();
      expect(() => audio.playStinger('level_up')).not.toThrow();
    });

    it('should have playAmbient method', () => {
      const audio = getAudioManager();
      expect(() => audio.playAmbient('wind_gust')).not.toThrow();
      expect(() => audio.playAmbient('bird')).not.toThrow();
      expect(() => audio.playAmbient('coyote')).not.toThrow();
    });

    it('should not play sounds when disabled', () => {
      const audio = getAudioManager();
      audio.setSettings({ enabled: false });

      // These should complete without error (just skip playing)
      expect(() => audio.playUI('click')).not.toThrow();
      expect(() => audio.playCombat('hit')).not.toThrow();
    });
  });

  describe('Game Event Handlers', () => {
    it('should have onCombatStart handler', () => {
      const audio = getAudioManager();
      expect(() => audio.onCombatStart()).not.toThrow();
    });

    it('should have onCombatEnd handler', () => {
      const audio = getAudioManager();
      expect(() => audio.onCombatEnd('victory')).not.toThrow();
      expect(() => audio.onCombatEnd('defeat')).not.toThrow();
      expect(() => audio.onCombatEnd('fled')).not.toThrow();
    });

    it('should have onShopOpen/Close handlers', () => {
      const audio = getAudioManager();
      expect(() => audio.onShopOpen()).not.toThrow();
      expect(() => audio.onShopClose()).not.toThrow();
    });

    it('should have onQuestComplete handler', () => {
      const audio = getAudioManager();
      expect(() => audio.onQuestComplete()).not.toThrow();
    });

    it('should have onLevelUp handler', () => {
      const audio = getAudioManager();
      expect(() => audio.onLevelUp()).not.toThrow();
    });

    it('should have onDialogueStart/End handlers', () => {
      const audio = getAudioManager();
      expect(() => audio.onDialogueStart()).not.toThrow();
      expect(() => audio.onDialogueEnd()).not.toThrow();
    });
  });

  describe('Lifecycle', () => {
    it('should start and stop without error', async () => {
      const audio = getAudioManager();
      await audio.init();
      await audio.start();
      audio.stop();
    });

    it('should dispose cleanly', () => {
      const audio = getAudioManager();
      expect(() => audio.dispose()).not.toThrow();
    });
  });
});

describe('MusicManager', () => {
  let music: MusicManager;

  beforeEach(() => {
    music = new MusicManager();
  });

  afterEach(() => {
    music.dispose();
  });

  it('should create instance', () => {
    expect(music).toBeInstanceOf(MusicManager);
  });

  it('should start without error', async () => {
    await expect(music.start()).resolves.not.toThrow();
  });

  it('should stop without error', () => {
    expect(() => music.stop()).not.toThrow();
  });

  it('should set state', () => {
    expect(() => music.setState('exploration_day')).not.toThrow();
    expect(() => music.setState('exploration_night')).not.toThrow();
    expect(() => music.setState('combat')).not.toThrow();
    expect(() => music.setState('town')).not.toThrow();
    expect(() => music.setState('camp')).not.toThrow();
    expect(() => music.setState('shop')).not.toThrow();
  });

  it('should get current state', () => {
    music.setState('combat');
    expect(music.getState()).toBe('combat');
  });

  it('should set volume', () => {
    expect(() => music.setVolume(-20)).not.toThrow();
    expect(() => music.setVolume(0)).not.toThrow();
  });

  it('should play stingers', () => {
    expect(() => music.playStinger('victory')).not.toThrow();
    expect(() => music.playStinger('defeat')).not.toThrow();
  });

  it('should report playing state', async () => {
    expect(music.getIsPlaying()).toBe(false);
    await music.start();
    expect(music.getIsPlaying()).toBe(true);
    music.stop();
    expect(music.getIsPlaying()).toBe(false);
  });
});

describe('SoundEffects', () => {
  beforeEach(() => {
    resetSoundEffects();
  });

  afterEach(() => {
    resetSoundEffects();
  });

  it('should create singleton instance', () => {
    const sfx1 = getSoundEffects();
    const sfx2 = getSoundEffects();
    expect(sfx1).toBe(sfx2);
  });

  describe('UI Sounds', () => {
    it('should play UI sounds', () => {
      const sfx = getSoundEffects();
      expect(() => sfx.play('ui_click')).not.toThrow();
      expect(() => sfx.play('ui_hover')).not.toThrow();
      expect(() => sfx.play('ui_open')).not.toThrow();
      expect(() => sfx.play('ui_close')).not.toThrow();
      expect(() => sfx.play('ui_error')).not.toThrow();
      expect(() => sfx.play('ui_success')).not.toThrow();
      expect(() => sfx.play('ui_select')).not.toThrow();
      expect(() => sfx.play('ui_confirm')).not.toThrow();
      expect(() => sfx.play('ui_cancel')).not.toThrow();
    });
  });

  describe('Combat Sounds', () => {
    it('should play combat sounds', () => {
      const sfx = getSoundEffects();
      expect(() => sfx.play('combat_hit')).not.toThrow();
      expect(() => sfx.play('combat_miss')).not.toThrow();
      expect(() => sfx.play('combat_crit')).not.toThrow();
      expect(() => sfx.play('combat_death')).not.toThrow();
      expect(() => sfx.play('combat_heal')).not.toThrow();
      expect(() => sfx.play('combat_defend')).not.toThrow();
      expect(() => sfx.play('combat_flee')).not.toThrow();
      expect(() => sfx.play('combat_start')).not.toThrow();
      expect(() => sfx.play('combat_victory')).not.toThrow();
      expect(() => sfx.play('combat_defeat')).not.toThrow();
      expect(() => sfx.play('combat_gunshot')).not.toThrow();
      expect(() => sfx.play('combat_reload')).not.toThrow();
      expect(() => sfx.play('combat_ability')).not.toThrow();
    });
  });

  describe('Movement Sounds', () => {
    it('should play movement sounds', () => {
      const sfx = getSoundEffects();
      expect(() => sfx.play('footstep_dirt')).not.toThrow();
      expect(() => sfx.play('footstep_stone')).not.toThrow();
      expect(() => sfx.play('footstep_sand')).not.toThrow();
      expect(() => sfx.play('footstep_wood')).not.toThrow();
      expect(() => sfx.play('door_open')).not.toThrow();
      expect(() => sfx.play('door_close')).not.toThrow();
      expect(() => sfx.play('chest_open')).not.toThrow();
      expect(() => sfx.play('item_pickup')).not.toThrow();
    });
  });

  describe('Shop Sounds', () => {
    it('should play shop sounds', () => {
      const sfx = getSoundEffects();
      expect(() => sfx.play('shop_buy')).not.toThrow();
      expect(() => sfx.play('shop_sell')).not.toThrow();
      expect(() => sfx.play('shop_browse')).not.toThrow();
      expect(() => sfx.play('shop_error')).not.toThrow();
      expect(() => sfx.play('coins_jingle')).not.toThrow();
    });
  });

  describe('Ambient Sounds', () => {
    it('should play ambient sounds', () => {
      const sfx = getSoundEffects();
      expect(() => sfx.play('ambient_wind_gust')).not.toThrow();
      expect(() => sfx.play('ambient_bird')).not.toThrow();
      expect(() => sfx.play('ambient_coyote')).not.toThrow();
      expect(() => sfx.play('ambient_crow')).not.toThrow();
      expect(() => sfx.play('ambient_thunder')).not.toThrow();
    });
  });

  describe('Stinger Sounds', () => {
    it('should play stinger sounds', () => {
      const sfx = getSoundEffects();
      expect(() => sfx.play('stinger_victory')).not.toThrow();
      expect(() => sfx.play('stinger_defeat')).not.toThrow();
      expect(() => sfx.play('stinger_quest_complete')).not.toThrow();
      expect(() => sfx.play('stinger_level_up')).not.toThrow();
      expect(() => sfx.play('stinger_discovery')).not.toThrow();
    });
  });

  describe('Volume Control', () => {
    it('should set master volume', () => {
      const sfx = getSoundEffects();
      expect(() => sfx.setMasterVolume(-20)).not.toThrow();
      expect(() => sfx.setMasterVolume(0)).not.toThrow();
    });

    it('should set category volume', () => {
      const sfx = getSoundEffects();
      expect(() => sfx.setCategoryVolume('ui', -10)).not.toThrow();
      expect(() => sfx.setCategoryVolume('combat', -15)).not.toThrow();
      expect(() => sfx.setCategoryVolume('ambient', -20)).not.toThrow();
    });

    it('should clamp volume to valid range', () => {
      const sfx = getSoundEffects();
      // Should not throw even with extreme values
      expect(() => sfx.setMasterVolume(-100)).not.toThrow();
      expect(() => sfx.setMasterVolume(100)).not.toThrow();
    });
  });

  describe('Enable/Disable', () => {
    it('should enable/disable sounds', () => {
      const sfx = getSoundEffects();

      sfx.setEnabled(false);
      expect(sfx.isEnabled()).toBe(false);

      sfx.setEnabled(true);
      expect(sfx.isEnabled()).toBe(true);
    });

    it('should not play when disabled', () => {
      const sfx = getSoundEffects();
      sfx.setEnabled(false);

      // Should complete without error (just skip playing)
      expect(() => sfx.play('ui_click')).not.toThrow();
    });
  });

  describe('Unknown Sounds', () => {
    it('should warn on unknown sound ID', () => {
      const sfx = getSoundEffects();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      sfx.play('unknown_sound_id');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown SFX: unknown_sound_id')
      );

      warnSpy.mockRestore();
    });
  });
});
