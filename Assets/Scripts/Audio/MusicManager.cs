using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;

namespace IronFrontier.Audio
{
    /// <summary>
    /// Music mood/state for context-aware music playback.
    /// </summary>
    public enum MusicMood
    {
        Menu,
        ExplorationDay,
        ExplorationNight,
        Town,
        Shop,
        Camp,
        Combat,
        CombatIntense,
        Victory,
        Defeat
    }

    /// <summary>
    /// Configuration for each music mood.
    /// </summary>
    [Serializable]
    public class MusicMoodConfig
    {
        public MusicMood mood;
        public AudioClip[] tracks;
        [Range(0f, 1f)] public float volume = 0.8f;
        [Range(0.5f, 2f)] public float tempo = 1f;
        public bool loop = true;
        [Tooltip("Time in seconds for crossfade transitions")]
        public float fadeTime = 2f;
    }

    /// <summary>
    /// Handles music playback with mood-based selection, crossfade transitions,
    /// and day/night variants. Supports 10 distinct music moods.
    /// </summary>
    public class MusicManager : MonoBehaviour
    {
        [Header("Audio Mixer")]
        [SerializeField] private AudioMixerGroup musicMixerGroup;

        [Header("Music Sources (for crossfade)")]
        [SerializeField] private AudioSource musicSourceA;
        [SerializeField] private AudioSource musicSourceB;

        [Header("Mood Configurations")]
        [SerializeField] private List<MusicMoodConfig> moodConfigs = new List<MusicMoodConfig>();

        [Header("Crossfade Settings")]
        [SerializeField] private float defaultCrossfadeTime = 2f;
        [SerializeField] private AnimationCurve fadeCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

        [Header("Day/Night Settings")]
        [SerializeField] private bool useDayNightCycle = true;
        [Range(0f, 24f)]
        [SerializeField] private float nightStartHour = 19f;
        [Range(0f, 24f)]
        [SerializeField] private float nightEndHour = 6f;

        // State
        private MusicMood currentMood = MusicMood.Menu;
        private MusicMood targetMood = MusicMood.Menu;
        private AudioSource activeSource;
        private AudioSource inactiveSource;
        private Coroutine crossfadeCoroutine;
        private Coroutine stingerCoroutine;
        private float baseVolume = 1f;
        private bool isPlaying = false;
        private Dictionary<MusicMood, MusicMoodConfig> moodConfigLookup;

        // Events
        public event Action<MusicMood> OnMoodChanged;
        public event Action<string> OnTrackChanged;

        #region Singleton

        private static MusicManager instance;
        public static MusicManager Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = FindFirstObjectByType<MusicManager>();
                    if (instance == null)
                    {
                        Debug.LogWarning("[MusicManager] No instance found in scene");
                    }
                }
                return instance;
            }
        }

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
                return;
            }
            instance = this;

            InitializeAudioSources();
            BuildMoodConfigLookup();
        }

        private void OnDestroy()
        {
            if (instance == this)
            {
                instance = null;
            }
        }

        #endregion

        #region Initialization

        private void InitializeAudioSources()
        {
            // Create audio sources if not assigned
            if (musicSourceA == null)
            {
                musicSourceA = gameObject.AddComponent<AudioSource>();
                musicSourceA.playOnAwake = false;
                musicSourceA.outputAudioMixerGroup = musicMixerGroup;
            }

            if (musicSourceB == null)
            {
                musicSourceB = gameObject.AddComponent<AudioSource>();
                musicSourceB.playOnAwake = false;
                musicSourceB.outputAudioMixerGroup = musicMixerGroup;
            }

            activeSource = musicSourceA;
            inactiveSource = musicSourceB;

            activeSource.volume = 0f;
            inactiveSource.volume = 0f;
        }

        private void BuildMoodConfigLookup()
        {
            moodConfigLookup = new Dictionary<MusicMood, MusicMoodConfig>();

            // Add default configs for all moods
            foreach (MusicMood mood in Enum.GetValues(typeof(MusicMood)))
            {
                moodConfigLookup[mood] = new MusicMoodConfig
                {
                    mood = mood,
                    tracks = new AudioClip[0],
                    volume = GetDefaultVolumeForMood(mood),
                    fadeTime = GetDefaultFadeTimeForMood(mood)
                };
            }

            // Override with serialized configs
            foreach (var config in moodConfigs)
            {
                moodConfigLookup[config.mood] = config;
            }
        }

        private float GetDefaultVolumeForMood(MusicMood mood)
        {
            return mood switch
            {
                MusicMood.Combat => 0.9f,
                MusicMood.CombatIntense => 1f,
                MusicMood.Victory => 0.85f,
                MusicMood.Defeat => 0.7f,
                MusicMood.Camp => 0.5f,
                MusicMood.ExplorationNight => 0.6f,
                _ => 0.75f
            };
        }

        private float GetDefaultFadeTimeForMood(MusicMood mood)
        {
            return mood switch
            {
                MusicMood.Combat => 0.5f,       // Quick transition to combat
                MusicMood.CombatIntense => 0.3f,
                MusicMood.Victory => 1f,
                MusicMood.Defeat => 1.5f,
                _ => defaultCrossfadeTime
            };
        }

        #endregion

        #region Public API

        /// <summary>
        /// Start playing music with current mood.
        /// </summary>
        public void Play()
        {
            if (isPlaying) return;

            isPlaying = true;
            PlayMoodMusic(currentMood);
            Debug.Log($"[MusicManager] Started in {currentMood} mood");
        }

        /// <summary>
        /// Stop all music playback.
        /// </summary>
        public void Stop()
        {
            isPlaying = false;

            if (crossfadeCoroutine != null)
            {
                StopCoroutine(crossfadeCoroutine);
                crossfadeCoroutine = null;
            }

            StartCoroutine(FadeOutAll(defaultCrossfadeTime));
            Debug.Log("[MusicManager] Stopped");
        }

        /// <summary>
        /// Pause music playback.
        /// </summary>
        public void Pause()
        {
            musicSourceA.Pause();
            musicSourceB.Pause();
        }

        /// <summary>
        /// Resume music playback.
        /// </summary>
        public void Resume()
        {
            if (activeSource.clip != null)
            {
                activeSource.UnPause();
            }
        }

        /// <summary>
        /// Set the current music mood with crossfade transition.
        /// </summary>
        public void SetMood(MusicMood newMood)
        {
            if (currentMood == newMood) return;

            MusicMood previousMood = currentMood;
            currentMood = newMood;
            targetMood = newMood;

            Debug.Log($"[MusicManager] Transitioning: {previousMood} -> {newMood}");

            if (isPlaying)
            {
                TransitionToMood(newMood);
            }

            OnMoodChanged?.Invoke(newMood);
        }

        /// <summary>
        /// Get current music mood.
        /// </summary>
        public MusicMood GetCurrentMood() => currentMood;

        /// <summary>
        /// Check if music is currently playing.
        /// </summary>
        public bool IsPlaying => isPlaying && activeSource.isPlaying;

        /// <summary>
        /// Set music volume (0-1).
        /// </summary>
        public void SetVolume(float volume)
        {
            baseVolume = Mathf.Clamp01(volume);
            UpdateSourceVolumes();
        }

        /// <summary>
        /// Play a victory stinger then return to previous mood.
        /// </summary>
        public void PlayVictoryStinger()
        {
            PlayStinger(MusicMood.Victory);
        }

        /// <summary>
        /// Play a defeat stinger then return to previous mood.
        /// </summary>
        public void PlayDefeatStinger()
        {
            PlayStinger(MusicMood.Defeat);
        }

        /// <summary>
        /// Trigger combat music.
        /// </summary>
        public void TriggerCombat(bool intense = false)
        {
            SetMood(intense ? MusicMood.CombatIntense : MusicMood.Combat);
        }

        /// <summary>
        /// End combat and return to appropriate exploration music.
        /// </summary>
        public void EndCombat()
        {
            SetMood(GetExplorationMood());
        }

        /// <summary>
        /// Update for day/night cycle (call from game's time system).
        /// </summary>
        public void SetTimeOfDay(float hour)
        {
            if (!useDayNightCycle) return;
            if (currentMood == MusicMood.Combat || currentMood == MusicMood.CombatIntense) return;

            bool isNight = IsNightTime(hour);
            MusicMood targetExplorationMood = isNight ? MusicMood.ExplorationNight : MusicMood.ExplorationDay;

            if ((currentMood == MusicMood.ExplorationDay || currentMood == MusicMood.ExplorationNight)
                && currentMood != targetExplorationMood)
            {
                SetMood(targetExplorationMood);
            }
        }

        #endregion

        #region Private Methods

        private void PlayMoodMusic(MusicMood mood)
        {
            var config = GetMoodConfig(mood);
            if (config.tracks == null || config.tracks.Length == 0)
            {
                Debug.LogWarning($"[MusicManager] No tracks configured for mood: {mood}");
                return;
            }

            AudioClip track = SelectRandomTrack(config.tracks);
            PlayTrack(track, config.volume, config.loop);
        }

        private void TransitionToMood(MusicMood newMood)
        {
            var config = GetMoodConfig(newMood);
            if (config.tracks == null || config.tracks.Length == 0)
            {
                Debug.LogWarning($"[MusicManager] No tracks configured for mood: {newMood}");
                return;
            }

            AudioClip track = SelectRandomTrack(config.tracks);
            CrossfadeTo(track, config.volume, config.fadeTime, config.loop);
        }

        private void PlayTrack(AudioClip clip, float volume, bool loop)
        {
            activeSource.clip = clip;
            activeSource.volume = volume * baseVolume;
            activeSource.loop = loop;
            activeSource.Play();

            OnTrackChanged?.Invoke(clip.name);
        }

        private void CrossfadeTo(AudioClip newClip, float targetVolume, float fadeTime, bool loop)
        {
            if (crossfadeCoroutine != null)
            {
                StopCoroutine(crossfadeCoroutine);
            }

            crossfadeCoroutine = StartCoroutine(CrossfadeCoroutine(newClip, targetVolume * baseVolume, fadeTime, loop));
        }

        private IEnumerator CrossfadeCoroutine(AudioClip newClip, float targetVolume, float fadeTime, bool loop)
        {
            // Swap active/inactive sources
            var oldSource = activeSource;
            activeSource = inactiveSource;
            inactiveSource = oldSource;

            // Setup new source
            activeSource.clip = newClip;
            activeSource.volume = 0f;
            activeSource.loop = loop;
            activeSource.Play();

            float startVolume = inactiveSource.volume;
            float elapsed = 0f;

            while (elapsed < fadeTime)
            {
                elapsed += Time.deltaTime;
                float t = fadeCurve.Evaluate(elapsed / fadeTime);

                activeSource.volume = Mathf.Lerp(0f, targetVolume, t);
                inactiveSource.volume = Mathf.Lerp(startVolume, 0f, t);

                yield return null;
            }

            activeSource.volume = targetVolume;
            inactiveSource.Stop();
            inactiveSource.volume = 0f;

            OnTrackChanged?.Invoke(newClip.name);
            crossfadeCoroutine = null;
        }

        private IEnumerator FadeOutAll(float fadeTime)
        {
            float startVolumeA = musicSourceA.volume;
            float startVolumeB = musicSourceB.volume;
            float elapsed = 0f;

            while (elapsed < fadeTime)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / fadeTime;

                musicSourceA.volume = Mathf.Lerp(startVolumeA, 0f, t);
                musicSourceB.volume = Mathf.Lerp(startVolumeB, 0f, t);

                yield return null;
            }

            musicSourceA.Stop();
            musicSourceB.Stop();
            musicSourceA.volume = 0f;
            musicSourceB.volume = 0f;
        }

        private void PlayStinger(MusicMood stingerMood)
        {
            if (stingerCoroutine != null)
            {
                StopCoroutine(stingerCoroutine);
            }

            stingerCoroutine = StartCoroutine(StingerCoroutine(stingerMood));
        }

        private IEnumerator StingerCoroutine(MusicMood stingerMood)
        {
            MusicMood previousMood = currentMood;
            var config = GetMoodConfig(stingerMood);

            if (config.tracks == null || config.tracks.Length == 0)
            {
                Debug.LogWarning($"[MusicManager] No stinger track for: {stingerMood}");
                yield break;
            }

            AudioClip stingerClip = SelectRandomTrack(config.tracks);

            // Quick fade to stinger
            CrossfadeTo(stingerClip, config.volume, 0.5f, false);

            // Wait for stinger to finish
            yield return new WaitForSeconds(stingerClip.length);

            // Return to previous mood (or exploration)
            MusicMood returnMood = previousMood == MusicMood.Combat || previousMood == MusicMood.CombatIntense
                ? GetExplorationMood()
                : previousMood;

            SetMood(returnMood);
            stingerCoroutine = null;
        }

        private MusicMoodConfig GetMoodConfig(MusicMood mood)
        {
            return moodConfigLookup.TryGetValue(mood, out var config)
                ? config
                : new MusicMoodConfig { mood = mood, volume = 0.75f };
        }

        private AudioClip SelectRandomTrack(AudioClip[] tracks)
        {
            if (tracks == null || tracks.Length == 0) return null;
            return tracks[UnityEngine.Random.Range(0, tracks.Length)];
        }

        private MusicMood GetExplorationMood()
        {
            if (!useDayNightCycle) return MusicMood.ExplorationDay;

            // Get current game time (you'd integrate with your time system)
            float currentHour = 12f; // Default to day
            return IsNightTime(currentHour) ? MusicMood.ExplorationNight : MusicMood.ExplorationDay;
        }

        private bool IsNightTime(float hour)
        {
            if (nightStartHour > nightEndHour)
            {
                // Night spans midnight (e.g., 19:00 to 6:00)
                return hour >= nightStartHour || hour < nightEndHour;
            }
            else
            {
                // Night within same day
                return hour >= nightStartHour && hour < nightEndHour;
            }
        }

        private void UpdateSourceVolumes()
        {
            var config = GetMoodConfig(currentMood);
            if (activeSource.isPlaying)
            {
                activeSource.volume = config.volume * baseVolume;
            }
        }

        #endregion

        #region Editor Helpers

#if UNITY_EDITOR
        [ContextMenu("Add Default Mood Configs")]
        private void AddDefaultMoodConfigs()
        {
            moodConfigs.Clear();
            foreach (MusicMood mood in Enum.GetValues(typeof(MusicMood)))
            {
                moodConfigs.Add(new MusicMoodConfig
                {
                    mood = mood,
                    tracks = new AudioClip[0],
                    volume = GetDefaultVolumeForMood(mood),
                    fadeTime = GetDefaultFadeTimeForMood(mood),
                    loop = mood != MusicMood.Victory && mood != MusicMood.Defeat
                });
            }
            Debug.Log("[MusicManager] Added default mood configs");
        }
#endif

        #endregion
    }
}
