using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;

namespace IronFrontier.Audio
{
    /// <summary>
    /// Environment types for ambient sound selection.
    /// </summary>
    public enum AmbientEnvironment
    {
        Desert,
        Plains,
        Mountains,
        Forest,
        Town,
        Saloon,
        Cave,
        River,
        Camp
    }

    /// <summary>
    /// Weather conditions for ambient sound layering.
    /// </summary>
    public enum WeatherCondition
    {
        Clear,
        Windy,
        Rain,
        Storm,
        Dust
    }

    /// <summary>
    /// Time of day for ambient sound variation.
    /// </summary>
    public enum AmbientTimeOfDay
    {
        Dawn,
        Day,
        Dusk,
        Night
    }

    /// <summary>
    /// Configuration for ambient sound loops.
    /// </summary>
    [Serializable]
    public class AmbientLoopConfig
    {
        public string id;
        public AmbientEnvironment environment;
        public AudioClip clip;
        [Range(0f, 1f)] public float baseVolume = 0.5f;
        public bool useTimeVariation = true;
        [Range(0f, 1f)] public float dayVolume = 1f;
        [Range(0f, 1f)] public float nightVolume = 0.8f;
    }

    /// <summary>
    /// Configuration for weather sound layers.
    /// </summary>
    [Serializable]
    public class WeatherSoundConfig
    {
        public WeatherCondition condition;
        public AudioClip loopClip;
        public AudioClip[] oneShots;  // Thunder, gusts, etc.
        [Range(0f, 1f)] public float volume = 0.7f;
        public float oneShotInterval = 10f;
        public float oneShotVariance = 5f;
    }

    /// <summary>
    /// Handles ambient/environmental audio including:
    /// - Environment loops (wind, crickets, town noise)
    /// - Weather sounds (rain, thunder, dust storms)
    /// - Location-based ambience
    /// - Day/night variations
    /// </summary>
    public class AmbientManager : MonoBehaviour
    {
        [Header("Audio Mixer")]
        [SerializeField] private AudioMixerGroup ambientMixerGroup;

        [Header("Environment Sounds")]
        [SerializeField] private List<AmbientLoopConfig> environmentConfigs = new List<AmbientLoopConfig>();

        [Header("Weather Sounds")]
        [SerializeField] private List<WeatherSoundConfig> weatherConfigs = new List<WeatherSoundConfig>();

        [Header("Crossfade Settings")]
        [SerializeField] private float environmentFadeTime = 3f;
        [SerializeField] private float weatherFadeTime = 2f;

        [Header("One-shot Settings")]
        [SerializeField] private AudioClip[] birdChirps;
        [SerializeField] private AudioClip[] coyoteHowls;
        [SerializeField] private AudioClip[] cricketChirps;
        [SerializeField] private float ambientOneShotBaseInterval = 15f;
        [SerializeField] private float ambientOneShotVariance = 10f;

        // Audio sources
        private AudioSource environmentSourceA;
        private AudioSource environmentSourceB;
        private AudioSource weatherLoopSource;
        private AudioSource weatherOneShotSource;
        private AudioSource ambientOneShotSource;

        // State
        private AmbientEnvironment currentEnvironment = AmbientEnvironment.Desert;
        private WeatherCondition currentWeather = WeatherCondition.Clear;
        private AmbientTimeOfDay currentTimeOfDay = AmbientTimeOfDay.Day;
        private AudioSource activeEnvironmentSource;
        private AudioSource inactiveEnvironmentSource;
        private bool isPlaying = false;
        private float baseVolume = 1f;

        // Coroutines
        private Coroutine environmentFadeCoroutine;
        private Coroutine weatherOneShotCoroutine;
        private Coroutine ambientOneShotCoroutine;

        // Lookups
        private Dictionary<AmbientEnvironment, AmbientLoopConfig> environmentLookup;
        private Dictionary<WeatherCondition, WeatherSoundConfig> weatherLookup;

        #region Singleton

        private static AmbientManager instance;
        public static AmbientManager Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = FindFirstObjectByType<AmbientManager>();
                    if (instance == null)
                    {
                        Debug.LogWarning("[AmbientManager] No instance found in scene");
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
            BuildLookups();
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
            // Environment sources (for crossfade)
            environmentSourceA = CreateAudioSource("EnvironmentA");
            environmentSourceB = CreateAudioSource("EnvironmentB");
            activeEnvironmentSource = environmentSourceA;
            inactiveEnvironmentSource = environmentSourceB;

            // Weather sources
            weatherLoopSource = CreateAudioSource("WeatherLoop");
            weatherOneShotSource = CreateAudioSource("WeatherOneShot");

            // Ambient one-shot source
            ambientOneShotSource = CreateAudioSource("AmbientOneShot");
        }

        private AudioSource CreateAudioSource(string name)
        {
            GameObject go = new GameObject(name);
            go.transform.SetParent(transform);

            AudioSource source = go.AddComponent<AudioSource>();
            source.playOnAwake = false;
            source.loop = true;
            source.spatialBlend = 0f;  // 2D
            source.outputAudioMixerGroup = ambientMixerGroup;
            source.volume = 0f;

            return source;
        }

        private void BuildLookups()
        {
            // Environment lookup
            environmentLookup = new Dictionary<AmbientEnvironment, AmbientLoopConfig>();
            foreach (var config in environmentConfigs)
            {
                environmentLookup[config.environment] = config;
            }

            // Add defaults for missing environments
            foreach (AmbientEnvironment env in Enum.GetValues(typeof(AmbientEnvironment)))
            {
                if (!environmentLookup.ContainsKey(env))
                {
                    environmentLookup[env] = new AmbientLoopConfig
                    {
                        id = env.ToString().ToLower(),
                        environment = env,
                        baseVolume = 0.5f,
                        useTimeVariation = true
                    };
                }
            }

            // Weather lookup
            weatherLookup = new Dictionary<WeatherCondition, WeatherSoundConfig>();
            foreach (var config in weatherConfigs)
            {
                weatherLookup[config.condition] = config;
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Start ambient audio playback.
        /// </summary>
        public void Play()
        {
            if (isPlaying) return;
            isPlaying = true;

            PlayEnvironmentAmbience(currentEnvironment);
            StartAmbientOneShots();

            Debug.Log($"[AmbientManager] Started: {currentEnvironment}, {currentWeather}");
        }

        /// <summary>
        /// Stop all ambient audio.
        /// </summary>
        public void Stop()
        {
            isPlaying = false;

            StopAllCoroutines();
            StartCoroutine(FadeOutAll(environmentFadeTime));

            Debug.Log("[AmbientManager] Stopped");
        }

        /// <summary>
        /// Set the current environment (location-based ambience).
        /// </summary>
        public void SetEnvironment(AmbientEnvironment environment)
        {
            if (currentEnvironment == environment) return;

            AmbientEnvironment previous = currentEnvironment;
            currentEnvironment = environment;

            Debug.Log($"[AmbientManager] Environment: {previous} -> {environment}");

            if (isPlaying)
            {
                TransitionEnvironment(environment);
            }
        }

        /// <summary>
        /// Set weather condition for ambient layering.
        /// </summary>
        public void SetWeather(WeatherCondition weather)
        {
            if (currentWeather == weather) return;

            WeatherCondition previous = currentWeather;
            currentWeather = weather;

            Debug.Log($"[AmbientManager] Weather: {previous} -> {weather}");

            if (isPlaying)
            {
                TransitionWeather(weather);
            }
        }

        /// <summary>
        /// Set time of day for ambient variation.
        /// </summary>
        public void SetTimeOfDay(AmbientTimeOfDay timeOfDay)
        {
            if (currentTimeOfDay == timeOfDay) return;

            currentTimeOfDay = timeOfDay;
            UpdateEnvironmentVolume();

            Debug.Log($"[AmbientManager] Time of day: {timeOfDay}");
        }

        /// <summary>
        /// Set time of day from hour (0-24).
        /// </summary>
        public void SetTimeOfDayFromHour(float hour)
        {
            AmbientTimeOfDay newTime;

            if (hour >= 5f && hour < 7f)
                newTime = AmbientTimeOfDay.Dawn;
            else if (hour >= 7f && hour < 18f)
                newTime = AmbientTimeOfDay.Day;
            else if (hour >= 18f && hour < 20f)
                newTime = AmbientTimeOfDay.Dusk;
            else
                newTime = AmbientTimeOfDay.Night;

            SetTimeOfDay(newTime);
        }

        /// <summary>
        /// Set ambient volume (0-1).
        /// </summary>
        public void SetVolume(float volume)
        {
            baseVolume = Mathf.Clamp01(volume);
            UpdateAllVolumes();
        }

        /// <summary>
        /// Get current environment.
        /// </summary>
        public AmbientEnvironment GetCurrentEnvironment() => currentEnvironment;

        /// <summary>
        /// Get current weather.
        /// </summary>
        public WeatherCondition GetCurrentWeather() => currentWeather;

        /// <summary>
        /// Check if ambient audio is playing.
        /// </summary>
        public bool IsPlaying => isPlaying;

        #endregion

        #region Environment Audio

        private void PlayEnvironmentAmbience(AmbientEnvironment environment)
        {
            if (!environmentLookup.TryGetValue(environment, out var config))
            {
                Debug.LogWarning($"[AmbientManager] No config for environment: {environment}");
                return;
            }

            if (config.clip == null)
            {
                Debug.LogWarning($"[AmbientManager] No clip for environment: {environment}");
                return;
            }

            activeEnvironmentSource.clip = config.clip;
            activeEnvironmentSource.volume = CalculateEnvironmentVolume(config);
            activeEnvironmentSource.loop = true;
            activeEnvironmentSource.Play();
        }

        private void TransitionEnvironment(AmbientEnvironment newEnvironment)
        {
            if (!environmentLookup.TryGetValue(newEnvironment, out var config))
            {
                return;
            }

            if (config.clip == null)
            {
                // No clip, just fade out current
                StartCoroutine(FadeOut(activeEnvironmentSource, environmentFadeTime));
                return;
            }

            if (environmentFadeCoroutine != null)
            {
                StopCoroutine(environmentFadeCoroutine);
            }

            environmentFadeCoroutine = StartCoroutine(CrossfadeEnvironment(config));
        }

        private IEnumerator CrossfadeEnvironment(AmbientLoopConfig config)
        {
            // Swap sources
            var oldSource = activeEnvironmentSource;
            activeEnvironmentSource = inactiveEnvironmentSource;
            inactiveEnvironmentSource = oldSource;

            // Setup new source
            activeEnvironmentSource.clip = config.clip;
            activeEnvironmentSource.volume = 0f;
            activeEnvironmentSource.loop = true;
            activeEnvironmentSource.Play();

            float targetVolume = CalculateEnvironmentVolume(config);
            float startVolume = inactiveEnvironmentSource.volume;
            float elapsed = 0f;

            while (elapsed < environmentFadeTime)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / environmentFadeTime;

                activeEnvironmentSource.volume = Mathf.Lerp(0f, targetVolume, t);
                inactiveEnvironmentSource.volume = Mathf.Lerp(startVolume, 0f, t);

                yield return null;
            }

            activeEnvironmentSource.volume = targetVolume;
            inactiveEnvironmentSource.Stop();
            inactiveEnvironmentSource.volume = 0f;

            environmentFadeCoroutine = null;
        }

        private float CalculateEnvironmentVolume(AmbientLoopConfig config)
        {
            float timeMultiplier = 1f;

            if (config.useTimeVariation)
            {
                timeMultiplier = currentTimeOfDay switch
                {
                    AmbientTimeOfDay.Night => config.nightVolume,
                    AmbientTimeOfDay.Dusk => Mathf.Lerp(config.dayVolume, config.nightVolume, 0.5f),
                    AmbientTimeOfDay.Dawn => Mathf.Lerp(config.nightVolume, config.dayVolume, 0.5f),
                    _ => config.dayVolume
                };
            }

            return config.baseVolume * timeMultiplier * baseVolume;
        }

        private void UpdateEnvironmentVolume()
        {
            if (!isPlaying) return;

            if (environmentLookup.TryGetValue(currentEnvironment, out var config))
            {
                float targetVolume = CalculateEnvironmentVolume(config);
                StartCoroutine(FadeTo(activeEnvironmentSource, targetVolume, 1f));
            }
        }

        #endregion

        #region Weather Audio

        private void TransitionWeather(WeatherCondition weather)
        {
            // Stop current weather if any
            if (weatherOneShotCoroutine != null)
            {
                StopCoroutine(weatherOneShotCoroutine);
                weatherOneShotCoroutine = null;
            }

            if (weather == WeatherCondition.Clear)
            {
                // Fade out weather
                StartCoroutine(FadeOut(weatherLoopSource, weatherFadeTime));
                return;
            }

            if (!weatherLookup.TryGetValue(weather, out var config))
            {
                return;
            }

            // Start weather loop
            if (config.loopClip != null)
            {
                StartCoroutine(FadeInWeather(config));
            }

            // Start weather one-shots
            if (config.oneShots != null && config.oneShots.Length > 0)
            {
                weatherOneShotCoroutine = StartCoroutine(WeatherOneShotLoop(config));
            }
        }

        private IEnumerator FadeInWeather(WeatherSoundConfig config)
        {
            weatherLoopSource.clip = config.loopClip;
            weatherLoopSource.volume = 0f;
            weatherLoopSource.loop = true;
            weatherLoopSource.Play();

            float targetVolume = config.volume * baseVolume;
            float elapsed = 0f;

            while (elapsed < weatherFadeTime)
            {
                elapsed += Time.deltaTime;
                weatherLoopSource.volume = Mathf.Lerp(0f, targetVolume, elapsed / weatherFadeTime);
                yield return null;
            }

            weatherLoopSource.volume = targetVolume;
        }

        private IEnumerator WeatherOneShotLoop(WeatherSoundConfig config)
        {
            while (isPlaying && currentWeather == config.condition)
            {
                // Wait for interval
                float interval = config.oneShotInterval + UnityEngine.Random.Range(-config.oneShotVariance, config.oneShotVariance);
                yield return new WaitForSeconds(Mathf.Max(1f, interval));

                if (!isPlaying || currentWeather != config.condition) break;

                // Play random one-shot
                if (config.oneShots != null && config.oneShots.Length > 0)
                {
                    AudioClip clip = config.oneShots[UnityEngine.Random.Range(0, config.oneShots.Length)];
                    weatherOneShotSource.PlayOneShot(clip, config.volume * baseVolume);
                }
            }
        }

        #endregion

        #region Ambient One-shots (Wildlife, etc.)

        private void StartAmbientOneShots()
        {
            if (ambientOneShotCoroutine != null)
            {
                StopCoroutine(ambientOneShotCoroutine);
            }
            ambientOneShotCoroutine = StartCoroutine(AmbientOneShotLoop());
        }

        private IEnumerator AmbientOneShotLoop()
        {
            while (isPlaying)
            {
                float interval = ambientOneShotBaseInterval + UnityEngine.Random.Range(-ambientOneShotVariance, ambientOneShotVariance);
                yield return new WaitForSeconds(Mathf.Max(2f, interval));

                if (!isPlaying) break;

                // Select appropriate one-shot based on environment and time
                AudioClip clip = SelectAmbientOneShot();
                if (clip != null)
                {
                    float volume = GetOneShotVolume();
                    ambientOneShotSource.PlayOneShot(clip, volume * baseVolume);
                }
            }
        }

        private AudioClip SelectAmbientOneShot()
        {
            // Time-based selection
            bool isNight = currentTimeOfDay == AmbientTimeOfDay.Night || currentTimeOfDay == AmbientTimeOfDay.Dusk;

            // Environment-based selection with time consideration
            switch (currentEnvironment)
            {
                case AmbientEnvironment.Desert:
                case AmbientEnvironment.Plains:
                    if (isNight && coyoteHowls != null && coyoteHowls.Length > 0 && UnityEngine.Random.value > 0.7f)
                    {
                        return coyoteHowls[UnityEngine.Random.Range(0, coyoteHowls.Length)];
                    }
                    break;

                case AmbientEnvironment.Forest:
                case AmbientEnvironment.Mountains:
                    if (!isNight && birdChirps != null && birdChirps.Length > 0)
                    {
                        return birdChirps[UnityEngine.Random.Range(0, birdChirps.Length)];
                    }
                    break;
            }

            // Night crickets
            if (isNight && cricketChirps != null && cricketChirps.Length > 0 && UnityEngine.Random.value > 0.5f)
            {
                return cricketChirps[UnityEngine.Random.Range(0, cricketChirps.Length)];
            }

            // Day birds (generic)
            if (!isNight && birdChirps != null && birdChirps.Length > 0 && UnityEngine.Random.value > 0.6f)
            {
                return birdChirps[UnityEngine.Random.Range(0, birdChirps.Length)];
            }

            return null;
        }

        private float GetOneShotVolume()
        {
            // Quieter at night, based on environment
            float timeMultiplier = currentTimeOfDay == AmbientTimeOfDay.Night ? 0.6f : 0.8f;

            return 0.5f * timeMultiplier;
        }

        #endregion

        #region Utility Coroutines

        private IEnumerator FadeOut(AudioSource source, float duration)
        {
            float startVolume = source.volume;
            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                source.volume = Mathf.Lerp(startVolume, 0f, elapsed / duration);
                yield return null;
            }

            source.Stop();
            source.volume = 0f;
        }

        private IEnumerator FadeTo(AudioSource source, float targetVolume, float duration)
        {
            float startVolume = source.volume;
            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                source.volume = Mathf.Lerp(startVolume, targetVolume, elapsed / duration);
                yield return null;
            }

            source.volume = targetVolume;
        }

        private IEnumerator FadeOutAll(float duration)
        {
            float startEnvA = environmentSourceA.volume;
            float startEnvB = environmentSourceB.volume;
            float startWeather = weatherLoopSource.volume;
            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;

                environmentSourceA.volume = Mathf.Lerp(startEnvA, 0f, t);
                environmentSourceB.volume = Mathf.Lerp(startEnvB, 0f, t);
                weatherLoopSource.volume = Mathf.Lerp(startWeather, 0f, t);

                yield return null;
            }

            environmentSourceA.Stop();
            environmentSourceB.Stop();
            weatherLoopSource.Stop();

            environmentSourceA.volume = 0f;
            environmentSourceB.volume = 0f;
            weatherLoopSource.volume = 0f;
        }

        private void UpdateAllVolumes()
        {
            if (!isPlaying) return;

            // Update environment
            if (environmentLookup.TryGetValue(currentEnvironment, out var envConfig))
            {
                activeEnvironmentSource.volume = CalculateEnvironmentVolume(envConfig);
            }

            // Update weather
            if (currentWeather != WeatherCondition.Clear && weatherLookup.TryGetValue(currentWeather, out var weatherConfig))
            {
                weatherLoopSource.volume = weatherConfig.volume * baseVolume;
            }
        }

        #endregion

        #region Editor Helpers

#if UNITY_EDITOR
        [ContextMenu("Add Default Environment Configs")]
        private void AddDefaultEnvironmentConfigs()
        {
            environmentConfigs.Clear();
            foreach (AmbientEnvironment env in Enum.GetValues(typeof(AmbientEnvironment)))
            {
                environmentConfigs.Add(new AmbientLoopConfig
                {
                    id = env.ToString().ToLower(),
                    environment = env,
                    baseVolume = 0.5f,
                    useTimeVariation = true,
                    dayVolume = 1f,
                    nightVolume = 0.8f
                });
            }
            Debug.Log("[AmbientManager] Added default environment configs");
        }

        [ContextMenu("Add Default Weather Configs")]
        private void AddDefaultWeatherConfigs()
        {
            weatherConfigs.Clear();
            foreach (WeatherCondition weather in Enum.GetValues(typeof(WeatherCondition)))
            {
                if (weather == WeatherCondition.Clear) continue;

                weatherConfigs.Add(new WeatherSoundConfig
                {
                    condition = weather,
                    volume = 0.7f,
                    oneShotInterval = weather == WeatherCondition.Storm ? 8f : 15f,
                    oneShotVariance = 5f
                });
            }
            Debug.Log("[AmbientManager] Added default weather configs");
        }
#endif

        #endregion
    }
}
