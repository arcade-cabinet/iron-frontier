// =============================================================================
// DustCloud.cs - Movement Dust Visual Effect
// Iron Frontier - Unity 6
// =============================================================================

using UnityEngine;

namespace IronFrontier.VFX
{
    /// <summary>
    /// Dust cloud effect type for different surfaces and actions.
    /// </summary>
    public enum DustType
    {
        /// <summary>Normal dirt/dust.</summary>
        Dirt,
        /// <summary>Sand particles.</summary>
        Sand,
        /// <summary>Snow particles.</summary>
        Snow,
        /// <summary>Grass particles.</summary>
        Grass,
        /// <summary>Water splash.</summary>
        Water,
        /// <summary>Impact dust (landing, stomping).</summary>
        Impact
    }

    /// <summary>
    /// Dust cloud effect for movement, landing, and surface interaction.
    /// Can be triggered by player or NPC movement systems.
    /// </summary>
    public class DustCloud : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Particle Systems")]
        [SerializeField]
        [Tooltip("Main dust particle system")]
        private ParticleSystem mainParticles;

        [SerializeField]
        [Tooltip("Secondary particle system for detail")]
        private ParticleSystem detailParticles;

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Dust type for color/behavior variation")]
        private DustType dustType = DustType.Dirt;

        [SerializeField]
        [Tooltip("Lifetime before auto-destroy")]
        private float lifetime = 2f;

        [SerializeField]
        [Tooltip("Scale multiplier for impact dust")]
        private float impactScale = 1.5f;

        [Header("Colors by Type")]
        [SerializeField]
        private Color dirtColor = new Color(0.6f, 0.5f, 0.4f);

        [SerializeField]
        private Color sandColor = new Color(0.9f, 0.8f, 0.6f);

        [SerializeField]
        private Color snowColor = new Color(0.95f, 0.98f, 1f);

        [SerializeField]
        private Color grassColor = new Color(0.4f, 0.6f, 0.3f);

        [SerializeField]
        private Color waterColor = new Color(0.5f, 0.7f, 1f);

        [Header("Audio")]
        [SerializeField]
        private AudioSource audioSource;

        [SerializeField]
        private AudioClip dustSound;

        [SerializeField]
        private AudioClip splashSound;

        [SerializeField]
        [Range(0f, 1f)]
        private float soundVolume = 0.3f;

        #endregion

        #region Private Fields

        private float _timer;
        private bool _isInitialized;
        private bool _isOneShot = true;

        #endregion

        #region Properties

        /// <summary>Current dust type.</summary>
        public DustType CurrentDustType => dustType;

        /// <summary>Whether this is a one-shot effect (vs looping).</summary>
        public bool IsOneShot
        {
            get => _isOneShot;
            set
            {
                _isOneShot = value;
                if (mainParticles != null)
                {
                    var main = mainParticles.main;
                    main.loop = !value;
                }
            }
        }

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            // Find particle systems if not assigned
            if (mainParticles == null)
            {
                mainParticles = GetComponent<ParticleSystem>();
            }

            if (audioSource == null)
            {
                audioSource = GetComponent<AudioSource>();
            }
        }

        private void Update()
        {
            if (!_isInitialized) return;

            _timer += Time.deltaTime;

            // Check if particles are done (for one-shot)
            if (_isOneShot)
            {
                bool particlesDone = true;

                if (mainParticles != null && mainParticles.isPlaying)
                    particlesDone = false;

                if (detailParticles != null && detailParticles.isPlaying)
                    particlesDone = false;

                // Destroy when done or timeout
                if (particlesDone || _timer >= lifetime)
                {
                    Destroy(gameObject);
                }
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Initialize and play the dust effect.
        /// </summary>
        /// <param name="type">Type of dust/surface.</param>
        /// <param name="isImpact">Whether this is an impact (larger effect).</param>
        public void Initialize(DustType type = DustType.Dirt, bool isImpact = false)
        {
            dustType = type;

            // Apply color based on type
            Color color = GetDustColor(type);
            ApplyColor(color);

            // Scale for impact
            if (isImpact)
            {
                transform.localScale *= impactScale;
            }

            // Play particles
            if (mainParticles != null)
            {
                mainParticles.Play();
            }

            if (detailParticles != null)
            {
                detailParticles.Play();
            }

            // Play sound
            PlaySound(type);

            _isInitialized = true;
        }

        /// <summary>
        /// Create a dust cloud at a position.
        /// </summary>
        public static DustCloud Create(Vector3 position, DustType type = DustType.Dirt, bool isImpact = false)
        {
            GameObject prefab = PrefabDatabase.Instance?.GetPrefab("dust_cloud");

            if (prefab == null)
            {
                Debug.LogWarning("[DustCloud] Prefab not found in PrefabDatabase");
                return null;
            }

            GameObject instance = Instantiate(prefab, position, Quaternion.identity);
            DustCloud dust = instance.GetComponent<DustCloud>();
            dust?.Initialize(type, isImpact);

            return dust;
        }

        /// <summary>
        /// Create a dust cloud with a surface normal direction.
        /// </summary>
        public static DustCloud Create(Vector3 position, Vector3 normal, DustType type = DustType.Dirt,
            bool isImpact = false)
        {
            GameObject prefab = PrefabDatabase.Instance?.GetPrefab("dust_cloud");

            if (prefab == null)
            {
                Debug.LogWarning("[DustCloud] Prefab not found in PrefabDatabase");
                return null;
            }

            Quaternion rotation = Quaternion.LookRotation(Vector3.up, normal);
            GameObject instance = Instantiate(prefab, position, rotation);
            DustCloud dust = instance.GetComponent<DustCloud>();
            dust?.Initialize(type, isImpact);

            return dust;
        }

        /// <summary>
        /// Stop the effect (for looping dust).
        /// </summary>
        public void Stop()
        {
            if (mainParticles != null)
            {
                mainParticles.Stop();
            }

            if (detailParticles != null)
            {
                detailParticles.Stop();
            }
        }

        /// <summary>
        /// Set emission rate (for looping dust based on speed).
        /// </summary>
        public void SetEmissionRate(float rate)
        {
            if (mainParticles != null)
            {
                var emission = mainParticles.emission;
                emission.rateOverTime = rate;
            }
        }

        #endregion

        #region Private Methods

        private Color GetDustColor(DustType type)
        {
            return type switch
            {
                DustType.Dirt => dirtColor,
                DustType.Sand => sandColor,
                DustType.Snow => snowColor,
                DustType.Grass => grassColor,
                DustType.Water => waterColor,
                DustType.Impact => dirtColor,
                _ => dirtColor
            };
        }

        private void ApplyColor(Color color)
        {
            ApplyColorToParticleSystem(mainParticles, color);
            ApplyColorToParticleSystem(detailParticles, color);
        }

        private void ApplyColorToParticleSystem(ParticleSystem ps, Color color)
        {
            if (ps == null) return;

            var main = ps.main;
            main.startColor = color;
        }

        private void PlaySound(DustType type)
        {
            if (audioSource == null) return;

            AudioClip clip = type == DustType.Water ? splashSound : dustSound;

            if (clip != null)
            {
                audioSource.PlayOneShot(clip, soundVolume);
            }
        }

        #endregion
    }
}
