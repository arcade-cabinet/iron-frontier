using System;
using UnityEngine;
using UnityEngine.Audio;

namespace IronFrontier.Audio
{
    /// <summary>
    /// Game locations for context-aware audio.
    /// </summary>
    public enum GameLocation
    {
        Menu,
        Overworld,
        Town,
        Combat,
        Camp,
        Shop,
        Saloon,
        Mine,
        Dialogue
    }

    /// <summary>
    /// Time of day for audio variations.
    /// </summary>
    public enum TimeOfDay
    {
        Dawn,
        Day,
        Dusk,
        Night
    }

    /// <summary>
    /// Central audio coordination for Iron Frontier.
    /// Singleton manager that coordinates music, sound effects, and ambient audio.
    /// Provides unified API for game systems to trigger audio.
    /// Integrates with game state for context-aware audio.
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        [Header("Audio Mixer")]
        [SerializeField] private AudioMixer audioMixer;
        [SerializeField] private string masterVolumeParam = "MasterVolume";
        [SerializeField] private string musicVolumeParam = "MusicVolume";
        [SerializeField] private string sfxVolumeParam = "SFXVolume";
        [SerializeField] private string ambientVolumeParam = "AmbientVolume";

        [Header("Sub-Managers (Auto-found if not assigned)")]
        [SerializeField] private MusicManager musicManager;
        [SerializeField] private SFXManager sfxManager;
        [SerializeField] private AmbientManager ambientManager;

        [Header("Settings")]
        [SerializeField] private bool autoInitialize = true;
        [SerializeField] private bool persistAcrossScenes = true;

        // State
        private AudioSettings settings = new AudioSettings();
        private GameLocation currentLocation = GameLocation.Menu;
        private TimeOfDay currentTimeOfDay = TimeOfDay.Day;
        private bool isInitialized = false;

        // Events
        public event Action<GameLocation> OnLocationChanged;
        public event Action<TimeOfDay> OnTimeOfDayChanged;
        public event Action OnAudioInitialized;

        #region Singleton

        private static AudioManager instance;
        public static AudioManager Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = FindFirstObjectByType<AudioManager>();
                    if (instance == null)
                    {
                        Debug.LogWarning("[AudioManager] No instance found in scene. Creating one.");
                        GameObject go = new GameObject("AudioManager");
                        instance = go.AddComponent<AudioManager>();
                    }
                }
                return instance;
            }
        }

        /// <summary>
        /// Check if an instance exists without creating one.
        /// </summary>
        public static bool HasInstance => instance != null;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Debug.Log("[AudioManager] Duplicate instance destroyed");
                Destroy(gameObject);
                return;
            }

            instance = this;

            if (persistAcrossScenes)
            {
                DontDestroyOnLoad(gameObject);
            }

            FindSubManagers();
            settings.OnSettingsChanged += ApplySettings;

            if (autoInitialize)
            {
                Initialize();
            }
        }

        private void Start()
        {
            // Load saved settings
            settings.Load();
            ApplySettings();
        }

        private void OnDestroy()
        {
            if (instance == this)
            {
                settings.OnSettingsChanged -= ApplySettings;
                instance = null;
            }
        }

        #endregion

        #region Initialization

        private void FindSubManagers()
        {
            if (musicManager == null)
            {
                musicManager = GetComponentInChildren<MusicManager>();
                if (musicManager == null)
                {
                    musicManager = FindFirstObjectByType<MusicManager>();
                }
            }

            if (sfxManager == null)
            {
                sfxManager = GetComponentInChildren<SFXManager>();
                if (sfxManager == null)
                {
                    sfxManager = FindFirstObjectByType<SFXManager>();
                }
            }

            if (ambientManager == null)
            {
                ambientManager = GetComponentInChildren<AmbientManager>();
                if (ambientManager == null)
                {
                    ambientManager = FindFirstObjectByType<AmbientManager>();
                }
            }

            // Create managers if not found
            if (musicManager == null)
            {
                GameObject go = new GameObject("MusicManager");
                go.transform.SetParent(transform);
                musicManager = go.AddComponent<MusicManager>();
            }

            if (sfxManager == null)
            {
                GameObject go = new GameObject("SFXManager");
                go.transform.SetParent(transform);
                sfxManager = go.AddComponent<SFXManager>();
            }

            if (ambientManager == null)
            {
                GameObject go = new GameObject("AmbientManager");
                go.transform.SetParent(transform);
                ambientManager = go.AddComponent<AmbientManager>();
            }
        }

        /// <summary>
        /// Initialize audio system. Must be called after user interaction on web.
        /// </summary>
        public void Initialize()
        {
            if (isInitialized) return;

            isInitialized = true;
            ApplySettings();

            Debug.Log("[AudioManager] Initialized");
            OnAudioInitialized?.Invoke();
        }

        #endregion

        #region Public API - Playback Control

        /// <summary>
        /// Start all audio systems.
        /// </summary>
        public void StartAudio()
        {
            if (!isInitialized)
            {
                Initialize();
            }

            if (!settings.Enabled) return;

            musicManager?.Play();
            ambientManager?.Play();

            Debug.Log("[AudioManager] Audio started");
        }

        /// <summary>
        /// Stop all audio systems.
        /// </summary>
        public void StopAudio()
        {
            musicManager?.Stop();
            ambientManager?.Stop();
            sfxManager?.StopAll();

            Debug.Log("[AudioManager] Audio stopped");
        }

        /// <summary>
        /// Pause all audio.
        /// </summary>
        public void PauseAudio()
        {
            musicManager?.Pause();
            AudioListener.pause = true;
        }

        /// <summary>
        /// Resume all audio.
        /// </summary>
        public void ResumeAudio()
        {
            musicManager?.Resume();
            AudioListener.pause = false;
        }

        #endregion

        #region Public API - Location & Context

        /// <summary>
        /// Set current game location - affects music and ambient.
        /// </summary>
        public void SetLocation(GameLocation location)
        {
            if (currentLocation == location) return;

            GameLocation previous = currentLocation;
            currentLocation = location;

            UpdateMusicState();
            UpdateAmbientEnvironment();

            Debug.Log($"[AudioManager] Location: {previous} -> {location}");
            OnLocationChanged?.Invoke(location);
        }

        /// <summary>
        /// Set current time of day - affects music mood and ambient.
        /// </summary>
        public void SetTimeOfDay(TimeOfDay time)
        {
            if (currentTimeOfDay == time) return;

            currentTimeOfDay = time;

            UpdateMusicState();
            ambientManager?.SetTimeOfDay(ConvertToAmbientTime(time));

            Debug.Log($"[AudioManager] Time of day: {time}");
            OnTimeOfDayChanged?.Invoke(time);
        }

        /// <summary>
        /// Set time of day from hour (0-24).
        /// </summary>
        public void SetTimeOfDayFromHour(float hour)
        {
            TimeOfDay newTime;

            if (hour >= 5f && hour < 7f)
                newTime = TimeOfDay.Dawn;
            else if (hour >= 7f && hour < 18f)
                newTime = TimeOfDay.Day;
            else if (hour >= 18f && hour < 20f)
                newTime = TimeOfDay.Dusk;
            else
                newTime = TimeOfDay.Night;

            SetTimeOfDay(newTime);
            musicManager?.SetTimeOfDay(hour);
            ambientManager?.SetTimeOfDayFromHour(hour);
        }

        /// <summary>
        /// Get current game location.
        /// </summary>
        public GameLocation GetCurrentLocation() => currentLocation;

        /// <summary>
        /// Get current time of day.
        /// </summary>
        public TimeOfDay GetCurrentTimeOfDay() => currentTimeOfDay;

        #endregion

        #region Public API - Sound Effects

        /// <summary>
        /// Play a UI sound effect.
        /// </summary>
        public void PlayUI(string sfx)
        {
            if (!settings.Enabled) return;
            sfxManager?.PlayUI(sfx);
        }

        /// <summary>
        /// Play a combat sound effect.
        /// </summary>
        public void PlayCombat(string sfx)
        {
            if (!settings.Enabled) return;
            sfxManager?.PlayCombat(sfx);
        }

        /// <summary>
        /// Play a combat sound at position.
        /// </summary>
        public void PlayCombatAt(string sfx, Vector3 position)
        {
            if (!settings.Enabled) return;
            sfxManager?.PlayCombatAt(sfx, position);
        }

        /// <summary>
        /// Play a movement/world sound effect.
        /// </summary>
        public void PlayMovement(string sfx)
        {
            if (!settings.Enabled) return;
            sfxManager?.PlayMovement(sfx);
        }

        /// <summary>
        /// Play footstep sound for terrain type.
        /// </summary>
        public void PlayFootstep(string terrainType, Vector3 position)
        {
            if (!settings.Enabled) return;
            sfxManager?.PlayFootstep(terrainType, position);
        }

        /// <summary>
        /// Play an ambient one-shot.
        /// </summary>
        public void PlayAmbient(string sfx)
        {
            if (!settings.Enabled) return;
            sfxManager?.PlayAmbient(sfx);
        }

        /// <summary>
        /// Play a shop sound effect.
        /// </summary>
        public void PlayShop(string sfx)
        {
            if (!settings.Enabled) return;
            sfxManager?.PlayShop(sfx);
        }

        /// <summary>
        /// Play a musical stinger.
        /// </summary>
        public void PlayStinger(string sfx)
        {
            if (!settings.Enabled) return;
            sfxManager?.PlayStinger(sfx);

            // Also trigger music manager for certain stingers
            if (sfx == "victory")
            {
                musicManager?.PlayVictoryStinger();
            }
            else if (sfx == "defeat")
            {
                musicManager?.PlayDefeatStinger();
            }
        }

        /// <summary>
        /// Play any SFX by ID.
        /// </summary>
        public void PlaySFX(string sfxId)
        {
            if (!settings.Enabled) return;
            sfxManager?.Play(sfxId);
        }

        /// <summary>
        /// Play any SFX at position.
        /// </summary>
        public void PlaySFXAt(string sfxId, Vector3 position)
        {
            if (!settings.Enabled) return;
            sfxManager?.PlayAt(sfxId, position);
        }

        #endregion

        #region Public API - Game Events

        /// <summary>
        /// Handle combat start event.
        /// </summary>
        public void OnCombatStart()
        {
            SetLocation(GameLocation.Combat);
            PlayCombat("start");
        }

        /// <summary>
        /// Handle combat intensify (boss, low health, etc.).
        /// </summary>
        public void OnCombatIntensify()
        {
            musicManager?.TriggerCombat(intense: true);
        }

        /// <summary>
        /// Handle combat end event.
        /// </summary>
        public void OnCombatEnd(bool victory)
        {
            if (victory)
            {
                PlayStinger("victory");
            }
            else
            {
                PlayStinger("defeat");
            }

            // Location will be restored when game state changes
            musicManager?.EndCombat();
        }

        /// <summary>
        /// Handle shop open event.
        /// </summary>
        public void OnShopOpen()
        {
            SetLocation(GameLocation.Shop);
            PlayUI("open");
        }

        /// <summary>
        /// Handle shop close event.
        /// </summary>
        public void OnShopClose()
        {
            PlayUI("close");
            // Location restored by game state
        }

        /// <summary>
        /// Handle dialogue start event.
        /// </summary>
        public void OnDialogueStart()
        {
            PlayUI("open");
        }

        /// <summary>
        /// Handle dialogue end event.
        /// </summary>
        public void OnDialogueEnd()
        {
            PlayUI("close");
        }

        /// <summary>
        /// Handle quest completion event.
        /// </summary>
        public void OnQuestComplete()
        {
            PlayStinger("quest_complete");
        }

        /// <summary>
        /// Handle level up event.
        /// </summary>
        public void OnLevelUp()
        {
            PlayStinger("level_up");
        }

        /// <summary>
        /// Handle item pickup event.
        /// </summary>
        public void OnItemPickup()
        {
            PlayMovement("item_pickup");
        }

        /// <summary>
        /// Handle discovery event (new location, secret, etc.).
        /// </summary>
        public void OnDiscovery()
        {
            PlayStinger("discovery");
        }

        /// <summary>
        /// Handle player death.
        /// </summary>
        public void OnPlayerDeath()
        {
            PlayCombat("death");
            PlayStinger("defeat");
        }

        /// <summary>
        /// Handle transaction (buy/sell).
        /// </summary>
        public void OnTransaction(bool isBuy, bool success)
        {
            if (success)
            {
                PlayShop(isBuy ? "buy" : "sell");
            }
            else
            {
                PlayShop("error");
            }
        }

        #endregion

        #region Public API - Settings

        /// <summary>
        /// Get current audio settings.
        /// </summary>
        public AudioSettings GetSettings() => settings;

        /// <summary>
        /// Set master volume (0-100).
        /// </summary>
        public void SetMasterVolume(float volume)
        {
            settings.MasterVolume = volume;
        }

        /// <summary>
        /// Set music volume (0-100).
        /// </summary>
        public void SetMusicVolume(float volume)
        {
            settings.MusicVolume = volume;
        }

        /// <summary>
        /// Set SFX volume (0-100).
        /// </summary>
        public void SetSFXVolume(float volume)
        {
            settings.SFXVolume = volume;
        }

        /// <summary>
        /// Set ambient volume (0-100).
        /// </summary>
        public void SetAmbientVolume(float volume)
        {
            settings.AmbientVolume = volume;
        }

        /// <summary>
        /// Toggle audio on/off.
        /// </summary>
        public void ToggleAudio()
        {
            settings.Enabled = !settings.Enabled;

            if (settings.Enabled)
            {
                StartAudio();
            }
            else
            {
                StopAudio();
            }
        }

        /// <summary>
        /// Toggle music mute.
        /// </summary>
        public void ToggleMusicMute()
        {
            settings.MusicMuted = !settings.MusicMuted;
        }

        /// <summary>
        /// Toggle SFX mute.
        /// </summary>
        public void ToggleSFXMute()
        {
            settings.SFXMuted = !settings.SFXMuted;
        }

        /// <summary>
        /// Toggle ambient mute.
        /// </summary>
        public void ToggleAmbientMute()
        {
            settings.AmbientMuted = !settings.AmbientMuted;
        }

        /// <summary>
        /// Check if audio is enabled.
        /// </summary>
        public bool IsEnabled => settings.Enabled;

        /// <summary>
        /// Check if audio is initialized.
        /// </summary>
        public bool IsInitialized => isInitialized;

        /// <summary>
        /// Save current settings.
        /// </summary>
        public void SaveSettings()
        {
            settings.Save();
        }

        /// <summary>
        /// Load saved settings.
        /// </summary>
        public void LoadSettings()
        {
            settings.Load();
            ApplySettings();
        }

        /// <summary>
        /// Reset settings to defaults.
        /// </summary>
        public void ResetSettings()
        {
            settings.ResetToDefaults();
        }

        #endregion

        #region Internal Methods

        private void ApplySettings()
        {
            // Apply to AudioMixer (if assigned)
            if (audioMixer != null)
            {
                audioMixer.SetFloat(masterVolumeParam, settings.MasterVolumeDb);
                audioMixer.SetFloat(musicVolumeParam, settings.MusicVolumeDb);
                audioMixer.SetFloat(sfxVolumeParam, settings.SFXVolumeDb);
                audioMixer.SetFloat(ambientVolumeParam, settings.AmbientVolumeDb);
            }

            // Apply to sub-managers directly
            musicManager?.SetVolume(settings.EffectiveMusicVolume);
            sfxManager?.SetMasterVolume(settings.EffectiveSFXVolume);
            ambientManager?.SetVolume(settings.EffectiveAmbientVolume);

            // Handle mute states
            if (sfxManager != null)
            {
                sfxManager.SetEnabled(settings.Enabled && !settings.SFXMuted);
            }
        }

        private void UpdateMusicState()
        {
            if (musicManager == null) return;

            MusicMood mood = currentLocation switch
            {
                GameLocation.Combat => MusicMood.Combat,
                GameLocation.Town => MusicMood.Town,
                GameLocation.Shop => MusicMood.Shop,
                GameLocation.Saloon => MusicMood.Town,
                GameLocation.Camp => MusicMood.Camp,
                GameLocation.Menu => MusicMood.Menu,
                GameLocation.Overworld => GetExplorationMood(),
                _ => GetExplorationMood()
            };

            musicManager.SetMood(mood);
        }

        private MusicMood GetExplorationMood()
        {
            return currentTimeOfDay switch
            {
                TimeOfDay.Night => MusicMood.ExplorationNight,
                TimeOfDay.Dusk => MusicMood.ExplorationNight,
                _ => MusicMood.ExplorationDay
            };
        }

        private void UpdateAmbientEnvironment()
        {
            if (ambientManager == null) return;

            AmbientEnvironment env = currentLocation switch
            {
                GameLocation.Town => AmbientEnvironment.Town,
                GameLocation.Saloon => AmbientEnvironment.Saloon,
                GameLocation.Mine => AmbientEnvironment.Cave,
                GameLocation.Camp => AmbientEnvironment.Camp,
                _ => AmbientEnvironment.Desert  // Default overworld
            };

            ambientManager.SetEnvironment(env);
        }

        private AmbientTimeOfDay ConvertToAmbientTime(TimeOfDay time)
        {
            return time switch
            {
                TimeOfDay.Dawn => AmbientTimeOfDay.Dawn,
                TimeOfDay.Day => AmbientTimeOfDay.Day,
                TimeOfDay.Dusk => AmbientTimeOfDay.Dusk,
                TimeOfDay.Night => AmbientTimeOfDay.Night,
                _ => AmbientTimeOfDay.Day
            };
        }

        #endregion

        #region Debug

#if UNITY_EDITOR
        [Header("Debug")]
        [SerializeField] private bool showDebugGUI = false;

        private void OnGUI()
        {
            if (!showDebugGUI) return;

            GUILayout.BeginArea(new Rect(10, 10, 300, 400));
            GUILayout.BeginVertical("box");

            GUILayout.Label($"Audio Manager Debug", GUI.skin.box);
            GUILayout.Label($"Initialized: {isInitialized}");
            GUILayout.Label($"Enabled: {settings.Enabled}");
            GUILayout.Label($"Location: {currentLocation}");
            GUILayout.Label($"Time: {currentTimeOfDay}");
            GUILayout.Label($"Music Mood: {musicManager?.GetCurrentMood()}");

            GUILayout.Space(10);
            GUILayout.Label($"Master: {settings.MasterVolume:F0}%");
            GUILayout.Label($"Music: {settings.MusicVolume:F0}%");
            GUILayout.Label($"SFX: {settings.SFXVolume:F0}%");
            GUILayout.Label($"Ambient: {settings.AmbientVolume:F0}%");

            GUILayout.Space(10);
            if (GUILayout.Button("Test UI Click")) PlayUI("click");
            if (GUILayout.Button("Test Combat Hit")) PlayCombat("hit");
            if (GUILayout.Button("Test Victory Stinger")) PlayStinger("victory");

            GUILayout.EndVertical();
            GUILayout.EndArea();
        }
#endif

        #endregion
    }
}
