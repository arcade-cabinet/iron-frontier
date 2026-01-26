using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;

namespace IronFrontier.Audio
{
    /// <summary>
    /// Categories for sound effects, used for volume control and organization.
    /// </summary>
    public enum SFXCategory
    {
        UI,
        Combat,
        Movement,
        Ambient,
        Shop,
        Stinger
    }

    /// <summary>
    /// Configuration for individual sound effects.
    /// </summary>
    [Serializable]
    public class SFXConfig
    {
        public string id;
        public SFXCategory category;
        public AudioClip[] clips;  // Multiple clips for variation
        [Range(-80f, 0f)] public float volume = -10f;
        [Range(0f, 1f)] public float pitchVariation = 0f;
        [Range(0f, 1f)] public float spatialBlend = 0f;  // 0 = 2D, 1 = 3D
        public float minDistance = 1f;
        public float maxDistance = 50f;
        [Tooltip("Cooldown between plays (prevents spam)")]
        public float cooldown = 0f;
    }

    /// <summary>
    /// Handles all game sound effects with pooling, 3D spatial audio,
    /// random variation, and category-based volume control.
    /// Supports 50+ sound effect categories.
    /// </summary>
    public class SFXManager : MonoBehaviour
    {
        [Header("Audio Mixer")]
        [SerializeField] private AudioMixerGroup sfxMixerGroup;

        [Header("Pooling")]
        [SerializeField] private int initialPoolSize = 20;
        [SerializeField] private int maxPoolSize = 50;
        [SerializeField] private GameObject audioSourcePrefab;

        [Header("Sound Effect Definitions")]
        [SerializeField] private List<SFXConfig> sfxConfigs = new List<SFXConfig>();

        // Pools and lookups
        private Queue<AudioSource> audioSourcePool = new Queue<AudioSource>();
        private List<AudioSource> activeAudioSources = new List<AudioSource>();
        private Dictionary<string, SFXConfig> sfxLookup = new Dictionary<string, SFXConfig>();
        private Dictionary<string, float> cooldownTimers = new Dictionary<string, float>();
        private Dictionary<SFXCategory, float> categoryVolumes = new Dictionary<SFXCategory, float>();

        private float masterVolume = 1f;
        private bool enabled = true;

        #region Singleton

        private static SFXManager instance;
        public static SFXManager Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = FindFirstObjectByType<SFXManager>();
                    if (instance == null)
                    {
                        Debug.LogWarning("[SFXManager] No instance found in scene");
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

            InitializePool();
            BuildSFXLookup();
            InitializeCategoryVolumes();
        }

        private void Update()
        {
            UpdateCooldowns();
            RecycleFinishedSources();
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

        private void InitializePool()
        {
            for (int i = 0; i < initialPoolSize; i++)
            {
                CreatePooledAudioSource();
            }
            Debug.Log($"[SFXManager] Initialized pool with {initialPoolSize} audio sources");
        }

        private AudioSource CreatePooledAudioSource()
        {
            GameObject go;
            if (audioSourcePrefab != null)
            {
                go = Instantiate(audioSourcePrefab, transform);
            }
            else
            {
                go = new GameObject("PooledAudioSource");
                go.transform.SetParent(transform);
            }

            go.SetActive(false);

            AudioSource source = go.GetComponent<AudioSource>();
            if (source == null)
            {
                source = go.AddComponent<AudioSource>();
            }

            source.playOnAwake = false;
            source.outputAudioMixerGroup = sfxMixerGroup;

            audioSourcePool.Enqueue(source);
            return source;
        }

        private void BuildSFXLookup()
        {
            sfxLookup.Clear();

            // Add configured SFX
            foreach (var config in sfxConfigs)
            {
                if (!string.IsNullOrEmpty(config.id))
                {
                    sfxLookup[config.id] = config;
                }
            }

            // Register default IDs if not configured
            RegisterDefaultSFX();

            Debug.Log($"[SFXManager] Registered {sfxLookup.Count} sound effects");
        }

        private void RegisterDefaultSFX()
        {
            // UI Sounds
            RegisterIfMissing("ui_click", SFXCategory.UI, -15f);
            RegisterIfMissing("ui_hover", SFXCategory.UI, -20f);
            RegisterIfMissing("ui_open", SFXCategory.UI, -12f);
            RegisterIfMissing("ui_close", SFXCategory.UI, -12f);
            RegisterIfMissing("ui_error", SFXCategory.UI, -10f);
            RegisterIfMissing("ui_success", SFXCategory.UI, -10f);
            RegisterIfMissing("ui_select", SFXCategory.UI, -14f);
            RegisterIfMissing("ui_confirm", SFXCategory.UI, -10f);
            RegisterIfMissing("ui_cancel", SFXCategory.UI, -12f);

            // Combat Sounds
            RegisterIfMissing("combat_hit", SFXCategory.Combat, -8f, 0.1f);
            RegisterIfMissing("combat_miss", SFXCategory.Combat, -12f);
            RegisterIfMissing("combat_crit", SFXCategory.Combat, -5f);
            RegisterIfMissing("combat_death", SFXCategory.Combat, -6f);
            RegisterIfMissing("combat_heal", SFXCategory.Combat, -10f);
            RegisterIfMissing("combat_defend", SFXCategory.Combat, -10f);
            RegisterIfMissing("combat_flee", SFXCategory.Combat, -8f);
            RegisterIfMissing("combat_start", SFXCategory.Combat, -6f);
            RegisterIfMissing("combat_victory", SFXCategory.Combat, -5f);
            RegisterIfMissing("combat_defeat", SFXCategory.Combat, -6f);
            RegisterIfMissing("combat_gunshot", SFXCategory.Combat, -4f, 0.05f);
            RegisterIfMissing("combat_reload", SFXCategory.Combat, -10f);
            RegisterIfMissing("combat_ability", SFXCategory.Combat, -8f);
            RegisterIfMissing("combat_parry", SFXCategory.Combat, -8f);
            RegisterIfMissing("combat_ricochet", SFXCategory.Combat, -10f, 0.1f);
            RegisterIfMissing("combat_explosion", SFXCategory.Combat, -4f);

            // Movement/World Sounds
            RegisterIfMissing("footstep_dirt", SFXCategory.Movement, -18f, 0.15f);
            RegisterIfMissing("footstep_stone", SFXCategory.Movement, -16f, 0.15f);
            RegisterIfMissing("footstep_sand", SFXCategory.Movement, -20f, 0.1f);
            RegisterIfMissing("footstep_wood", SFXCategory.Movement, -16f, 0.12f);
            RegisterIfMissing("footstep_grass", SFXCategory.Movement, -19f, 0.12f);
            RegisterIfMissing("footstep_water", SFXCategory.Movement, -14f, 0.1f);
            RegisterIfMissing("door_open", SFXCategory.Movement, -10f);
            RegisterIfMissing("door_close", SFXCategory.Movement, -10f);
            RegisterIfMissing("door_locked", SFXCategory.Movement, -12f);
            RegisterIfMissing("chest_open", SFXCategory.Movement, -12f);
            RegisterIfMissing("chest_close", SFXCategory.Movement, -14f);
            RegisterIfMissing("item_pickup", SFXCategory.Movement, -14f);
            RegisterIfMissing("item_drop", SFXCategory.Movement, -16f);
            RegisterIfMissing("ladder_climb", SFXCategory.Movement, -15f);
            RegisterIfMissing("horse_gallop", SFXCategory.Movement, -10f, 0.1f);
            RegisterIfMissing("horse_neigh", SFXCategory.Movement, -12f, 0.15f);

            // Shop Sounds
            RegisterIfMissing("shop_buy", SFXCategory.Shop, -10f);
            RegisterIfMissing("shop_sell", SFXCategory.Shop, -10f);
            RegisterIfMissing("shop_browse", SFXCategory.Shop, -16f);
            RegisterIfMissing("shop_error", SFXCategory.Shop, -10f);
            RegisterIfMissing("coins_jingle", SFXCategory.Shop, -12f);
            RegisterIfMissing("coins_drop", SFXCategory.Shop, -14f);
            RegisterIfMissing("register_open", SFXCategory.Shop, -10f);

            // Ambient One-shots
            RegisterIfMissing("ambient_wind_gust", SFXCategory.Ambient, -15f);
            RegisterIfMissing("ambient_bird", SFXCategory.Ambient, -18f, 0.2f);
            RegisterIfMissing("ambient_coyote", SFXCategory.Ambient, -12f);
            RegisterIfMissing("ambient_crow", SFXCategory.Ambient, -14f);
            RegisterIfMissing("ambient_thunder", SFXCategory.Ambient, -8f);
            RegisterIfMissing("ambient_rain_start", SFXCategory.Ambient, -10f);
            RegisterIfMissing("ambient_wolf_howl", SFXCategory.Ambient, -10f, 0.15f);
            RegisterIfMissing("ambient_rattlesnake", SFXCategory.Ambient, -12f);
            RegisterIfMissing("ambient_tumble_weed", SFXCategory.Ambient, -18f);
            RegisterIfMissing("ambient_campfire_crackle", SFXCategory.Ambient, -14f, 0.1f);

            // Stingers (musical phrases)
            RegisterIfMissing("stinger_victory", SFXCategory.Stinger, -6f);
            RegisterIfMissing("stinger_defeat", SFXCategory.Stinger, -8f);
            RegisterIfMissing("stinger_quest_complete", SFXCategory.Stinger, -8f);
            RegisterIfMissing("stinger_level_up", SFXCategory.Stinger, -6f);
            RegisterIfMissing("stinger_discovery", SFXCategory.Stinger, -10f);
            RegisterIfMissing("stinger_danger", SFXCategory.Stinger, -8f);
            RegisterIfMissing("stinger_treasure", SFXCategory.Stinger, -8f);
        }

        private void RegisterIfMissing(string id, SFXCategory category, float volume, float pitchVariation = 0f)
        {
            if (!sfxLookup.ContainsKey(id))
            {
                sfxLookup[id] = new SFXConfig
                {
                    id = id,
                    category = category,
                    clips = new AudioClip[0],
                    volume = volume,
                    pitchVariation = pitchVariation
                };
            }
        }

        private void InitializeCategoryVolumes()
        {
            foreach (SFXCategory category in Enum.GetValues(typeof(SFXCategory)))
            {
                categoryVolumes[category] = 1f;
            }
        }

        #endregion

        #region Public API - Play Methods

        /// <summary>
        /// Play a sound effect by ID at listener position (2D).
        /// </summary>
        public void Play(string sfxId)
        {
            PlayInternal(sfxId, Vector3.zero, false);
        }

        /// <summary>
        /// Play a sound effect at a specific world position (3D).
        /// </summary>
        public void PlayAt(string sfxId, Vector3 position)
        {
            PlayInternal(sfxId, position, true);
        }

        /// <summary>
        /// Play a sound effect attached to a transform (follows it).
        /// </summary>
        public AudioSource PlayAttached(string sfxId, Transform target)
        {
            if (!ValidatePlay(sfxId, out var config)) return null;

            AudioSource source = GetPooledSource();
            if (source == null) return null;

            ConfigureSource(source, config, target.position, true);
            source.transform.SetParent(target);
            source.transform.localPosition = Vector3.zero;
            source.Play();

            activeAudioSources.Add(source);
            SetCooldown(sfxId, config.cooldown);

            return source;
        }

        /// <summary>
        /// Play a UI sound effect.
        /// </summary>
        public void PlayUI(string sfx)
        {
            Play($"ui_{sfx}");
        }

        /// <summary>
        /// Play a combat sound effect.
        /// </summary>
        public void PlayCombat(string sfx)
        {
            Play($"combat_{sfx}");
        }

        /// <summary>
        /// Play a combat sound effect at a position.
        /// </summary>
        public void PlayCombatAt(string sfx, Vector3 position)
        {
            PlayAt($"combat_{sfx}", position);
        }

        /// <summary>
        /// Play a movement/world sound effect.
        /// </summary>
        public void PlayMovement(string sfx)
        {
            Play(sfx.StartsWith("footstep_") || sfx.StartsWith("door_") || sfx.StartsWith("chest_") || sfx.StartsWith("item_")
                ? sfx
                : sfx);
        }

        /// <summary>
        /// Play footstep sound for terrain type at position.
        /// </summary>
        public void PlayFootstep(string terrainType, Vector3 position)
        {
            string sfxId = $"footstep_{terrainType.ToLower()}";
            if (!sfxLookup.ContainsKey(sfxId))
            {
                sfxId = "footstep_dirt";  // Fallback
            }
            PlayAt(sfxId, position);
        }

        /// <summary>
        /// Play an ambient one-shot.
        /// </summary>
        public void PlayAmbient(string sfx)
        {
            Play($"ambient_{sfx}");
        }

        /// <summary>
        /// Play an ambient one-shot at position.
        /// </summary>
        public void PlayAmbientAt(string sfx, Vector3 position)
        {
            PlayAt($"ambient_{sfx}", position);
        }

        /// <summary>
        /// Play a shop sound effect.
        /// </summary>
        public void PlayShop(string sfx)
        {
            string id = sfx == "coins" ? "coins_jingle" : $"shop_{sfx}";
            Play(id);
        }

        /// <summary>
        /// Play a musical stinger.
        /// </summary>
        public void PlayStinger(string sfx)
        {
            Play($"stinger_{sfx}");
        }

        #endregion

        #region Public API - Volume Control

        /// <summary>
        /// Set master SFX volume (0-1).
        /// </summary>
        public void SetMasterVolume(float volume)
        {
            masterVolume = Mathf.Clamp01(volume);
        }

        /// <summary>
        /// Set volume for a specific category (0-1).
        /// </summary>
        public void SetCategoryVolume(SFXCategory category, float volume)
        {
            categoryVolumes[category] = Mathf.Clamp01(volume);
        }

        /// <summary>
        /// Enable/disable all SFX.
        /// </summary>
        public void SetEnabled(bool isEnabled)
        {
            enabled = isEnabled;
            if (!enabled)
            {
                StopAll();
            }
        }

        /// <summary>
        /// Check if SFX are enabled.
        /// </summary>
        public bool IsEnabled => enabled;

        /// <summary>
        /// Stop all currently playing SFX.
        /// </summary>
        public void StopAll()
        {
            foreach (var source in activeAudioSources)
            {
                if (source != null)
                {
                    source.Stop();
                    ReturnToPool(source);
                }
            }
            activeAudioSources.Clear();
        }

        #endregion

        #region Internal Methods

        private void PlayInternal(string sfxId, Vector3 position, bool is3D)
        {
            if (!ValidatePlay(sfxId, out var config)) return;

            AudioSource source = GetPooledSource();
            if (source == null) return;

            ConfigureSource(source, config, position, is3D);
            source.Play();

            activeAudioSources.Add(source);
            SetCooldown(sfxId, config.cooldown);
        }

        private bool ValidatePlay(string sfxId, out SFXConfig config)
        {
            config = null;

            if (!enabled) return false;

            if (!sfxLookup.TryGetValue(sfxId, out config))
            {
                Debug.LogWarning($"[SFXManager] Unknown SFX: {sfxId}");
                return false;
            }

            if (IsOnCooldown(sfxId)) return false;

            if (config.clips == null || config.clips.Length == 0)
            {
                // No clips assigned, silent play
                return false;
            }

            return true;
        }

        private AudioSource GetPooledSource()
        {
            if (audioSourcePool.Count == 0)
            {
                if (activeAudioSources.Count < maxPoolSize)
                {
                    return CreatePooledAudioSource();
                }
                else
                {
                    Debug.LogWarning("[SFXManager] Audio source pool exhausted");
                    return null;
                }
            }

            AudioSource source = audioSourcePool.Dequeue();
            source.gameObject.SetActive(true);
            source.transform.SetParent(transform);
            return source;
        }

        private void ReturnToPool(AudioSource source)
        {
            if (source == null) return;

            source.Stop();
            source.clip = null;
            source.transform.SetParent(transform);
            source.gameObject.SetActive(false);

            audioSourcePool.Enqueue(source);
        }

        private void ConfigureSource(AudioSource source, SFXConfig config, Vector3 position, bool is3D)
        {
            // Select random clip
            AudioClip clip = config.clips[UnityEngine.Random.Range(0, config.clips.Length)];
            source.clip = clip;

            // Calculate volume with category multiplier
            float categoryVol = categoryVolumes.TryGetValue(config.category, out float cv) ? cv : 1f;
            float linearVolume = AudioSettings.DecibelsToLinear(config.volume) * masterVolume * categoryVol;
            source.volume = linearVolume;

            // Apply pitch variation
            float pitchMod = 1f + (UnityEngine.Random.value - 0.5f) * config.pitchVariation * 2f;
            source.pitch = pitchMod;

            // Spatial settings
            source.spatialBlend = is3D ? config.spatialBlend : 0f;
            source.minDistance = config.minDistance;
            source.maxDistance = config.maxDistance;
            source.rolloffMode = AudioRolloffMode.Logarithmic;

            // Position
            if (is3D)
            {
                source.transform.position = position;
            }

            source.loop = false;
        }

        private void UpdateCooldowns()
        {
            List<string> keysToRemove = new List<string>();

            foreach (var kvp in cooldownTimers)
            {
                float newTime = kvp.Value - Time.deltaTime;
                if (newTime <= 0)
                {
                    keysToRemove.Add(kvp.Key);
                }
                else
                {
                    cooldownTimers[kvp.Key] = newTime;
                }
            }

            foreach (var key in keysToRemove)
            {
                cooldownTimers.Remove(key);
            }
        }

        private bool IsOnCooldown(string sfxId)
        {
            return cooldownTimers.ContainsKey(sfxId) && cooldownTimers[sfxId] > 0;
        }

        private void SetCooldown(string sfxId, float cooldown)
        {
            if (cooldown > 0)
            {
                cooldownTimers[sfxId] = cooldown;
            }
        }

        private void RecycleFinishedSources()
        {
            for (int i = activeAudioSources.Count - 1; i >= 0; i--)
            {
                AudioSource source = activeAudioSources[i];
                if (source == null || !source.isPlaying)
                {
                    if (source != null)
                    {
                        ReturnToPool(source);
                    }
                    activeAudioSources.RemoveAt(i);
                }
            }
        }

        #endregion

        #region Editor Helpers

#if UNITY_EDITOR
        [ContextMenu("Generate Default SFX Configs")]
        private void GenerateDefaultSFXConfigs()
        {
            sfxConfigs.Clear();

            // Add all registered defaults as serialized configs
            foreach (var kvp in sfxLookup)
            {
                sfxConfigs.Add(new SFXConfig
                {
                    id = kvp.Value.id,
                    category = kvp.Value.category,
                    clips = new AudioClip[0],
                    volume = kvp.Value.volume,
                    pitchVariation = kvp.Value.pitchVariation,
                    spatialBlend = kvp.Value.spatialBlend
                });
            }

            Debug.Log($"[SFXManager] Generated {sfxConfigs.Count} SFX configs");
        }
#endif

        #endregion
    }
}
