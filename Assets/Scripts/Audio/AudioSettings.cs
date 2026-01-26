using System;
using UnityEngine;

namespace IronFrontier.Audio
{
    /// <summary>
    /// Audio configuration settings with save/load functionality.
    /// Provides centralized volume controls and mute toggles.
    /// </summary>
    [Serializable]
    public class AudioSettings
    {
        // Volume ranges: 0-100 for user-facing, converted to 0-1 internally
        private const float MIN_VOLUME = 0f;
        private const float MAX_VOLUME = 100f;
        private const string PREFS_KEY = "IronFrontier_AudioSettings";

        [SerializeField] private float masterVolume = 80f;
        [SerializeField] private float musicVolume = 70f;
        [SerializeField] private float sfxVolume = 80f;
        [SerializeField] private float ambientVolume = 60f;
        [SerializeField] private bool enabled = true;
        [SerializeField] private bool musicMuted = false;
        [SerializeField] private bool sfxMuted = false;
        [SerializeField] private bool ambientMuted = false;

        public event Action OnSettingsChanged;

        #region Properties

        /// <summary>Master volume (0-100)</summary>
        public float MasterVolume
        {
            get => masterVolume;
            set
            {
                masterVolume = Mathf.Clamp(value, MIN_VOLUME, MAX_VOLUME);
                OnSettingsChanged?.Invoke();
            }
        }

        /// <summary>Music volume (0-100)</summary>
        public float MusicVolume
        {
            get => musicVolume;
            set
            {
                musicVolume = Mathf.Clamp(value, MIN_VOLUME, MAX_VOLUME);
                OnSettingsChanged?.Invoke();
            }
        }

        /// <summary>Sound effects volume (0-100)</summary>
        public float SFXVolume
        {
            get => sfxVolume;
            set
            {
                sfxVolume = Mathf.Clamp(value, MIN_VOLUME, MAX_VOLUME);
                OnSettingsChanged?.Invoke();
            }
        }

        /// <summary>Ambient/environmental volume (0-100)</summary>
        public float AmbientVolume
        {
            get => ambientVolume;
            set
            {
                ambientVolume = Mathf.Clamp(value, MIN_VOLUME, MAX_VOLUME);
                OnSettingsChanged?.Invoke();
            }
        }

        /// <summary>Global audio enabled state</summary>
        public bool Enabled
        {
            get => enabled;
            set
            {
                enabled = value;
                OnSettingsChanged?.Invoke();
            }
        }

        /// <summary>Music mute toggle</summary>
        public bool MusicMuted
        {
            get => musicMuted;
            set
            {
                musicMuted = value;
                OnSettingsChanged?.Invoke();
            }
        }

        /// <summary>SFX mute toggle</summary>
        public bool SFXMuted
        {
            get => sfxMuted;
            set
            {
                sfxMuted = value;
                OnSettingsChanged?.Invoke();
            }
        }

        /// <summary>Ambient mute toggle</summary>
        public bool AmbientMuted
        {
            get => ambientMuted;
            set
            {
                ambientMuted = value;
                OnSettingsChanged?.Invoke();
            }
        }

        #endregion

        #region Normalized Values (0-1 for AudioMixer)

        /// <summary>Master volume normalized (0-1)</summary>
        public float MasterVolumeNormalized => masterVolume / MAX_VOLUME;

        /// <summary>Music volume normalized (0-1)</summary>
        public float MusicVolumeNormalized => musicVolume / MAX_VOLUME;

        /// <summary>SFX volume normalized (0-1)</summary>
        public float SFXVolumeNormalized => sfxVolume / MAX_VOLUME;

        /// <summary>Ambient volume normalized (0-1)</summary>
        public float AmbientVolumeNormalized => ambientVolume / MAX_VOLUME;

        /// <summary>Effective master volume (accounting for enabled state)</summary>
        public float EffectiveMasterVolume => enabled ? MasterVolumeNormalized : 0f;

        /// <summary>Effective music volume (accounting for mute)</summary>
        public float EffectiveMusicVolume => musicMuted ? 0f : MusicVolumeNormalized * EffectiveMasterVolume;

        /// <summary>Effective SFX volume (accounting for mute)</summary>
        public float EffectiveSFXVolume => sfxMuted ? 0f : SFXVolumeNormalized * EffectiveMasterVolume;

        /// <summary>Effective ambient volume (accounting for mute)</summary>
        public float EffectiveAmbientVolume => ambientMuted ? 0f : AmbientVolumeNormalized * EffectiveMasterVolume;

        #endregion

        #region dB Conversion (for AudioMixer exposed parameters)

        /// <summary>
        /// Convert linear volume (0-1) to decibels.
        /// Uses logarithmic curve: 0 -> -80dB, 1 -> 0dB
        /// </summary>
        public static float LinearToDecibels(float linear)
        {
            if (linear <= 0f) return -80f;
            return Mathf.Log10(linear) * 20f;
        }

        /// <summary>
        /// Convert decibels to linear volume (0-1).
        /// </summary>
        public static float DecibelsToLinear(float db)
        {
            if (db <= -80f) return 0f;
            return Mathf.Pow(10f, db / 20f);
        }

        /// <summary>Master volume in dB</summary>
        public float MasterVolumeDb => LinearToDecibels(EffectiveMasterVolume);

        /// <summary>Music volume in dB</summary>
        public float MusicVolumeDb => LinearToDecibels(EffectiveMusicVolume);

        /// <summary>SFX volume in dB</summary>
        public float SFXVolumeDb => LinearToDecibels(EffectiveSFXVolume);

        /// <summary>Ambient volume in dB</summary>
        public float AmbientVolumeDb => LinearToDecibels(EffectiveAmbientVolume);

        #endregion

        #region Persistence

        /// <summary>
        /// Save settings to PlayerPrefs.
        /// </summary>
        public void Save()
        {
            string json = JsonUtility.ToJson(this);
            PlayerPrefs.SetString(PREFS_KEY, json);
            PlayerPrefs.Save();
            Debug.Log("[AudioSettings] Settings saved");
        }

        /// <summary>
        /// Load settings from PlayerPrefs.
        /// </summary>
        public void Load()
        {
            if (PlayerPrefs.HasKey(PREFS_KEY))
            {
                string json = PlayerPrefs.GetString(PREFS_KEY);
                JsonUtility.FromJsonOverwrite(json, this);
                Debug.Log("[AudioSettings] Settings loaded");
            }
            else
            {
                Debug.Log("[AudioSettings] No saved settings found, using defaults");
            }
        }

        /// <summary>
        /// Reset to default values.
        /// </summary>
        public void ResetToDefaults()
        {
            masterVolume = 80f;
            musicVolume = 70f;
            sfxVolume = 80f;
            ambientVolume = 60f;
            enabled = true;
            musicMuted = false;
            sfxMuted = false;
            ambientMuted = false;
            OnSettingsChanged?.Invoke();
            Debug.Log("[AudioSettings] Reset to defaults");
        }

        /// <summary>
        /// Create a copy of current settings.
        /// </summary>
        public AudioSettings Clone()
        {
            return new AudioSettings
            {
                masterVolume = this.masterVolume,
                musicVolume = this.musicVolume,
                sfxVolume = this.sfxVolume,
                ambientVolume = this.ambientVolume,
                enabled = this.enabled,
                musicMuted = this.musicMuted,
                sfxMuted = this.sfxMuted,
                ambientMuted = this.ambientMuted
            };
        }

        /// <summary>
        /// Apply settings from another AudioSettings instance.
        /// </summary>
        public void ApplyFrom(AudioSettings other)
        {
            masterVolume = other.masterVolume;
            musicVolume = other.musicVolume;
            sfxVolume = other.sfxVolume;
            ambientVolume = other.ambientVolume;
            enabled = other.enabled;
            musicMuted = other.musicMuted;
            sfxMuted = other.sfxMuted;
            ambientMuted = other.ambientMuted;
            OnSettingsChanged?.Invoke();
        }

        #endregion
    }
}
