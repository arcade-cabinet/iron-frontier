// =============================================================================
// HitEffect.cs - Combat Hit Visual Effect
// Iron Frontier - Unity 6
// =============================================================================

using UnityEngine;

namespace IronFrontier.VFX
{
    /// <summary>
    /// Type of hit for effect variations.
    /// </summary>
    public enum HitType
    {
        Normal,
        Critical,
        Slash,
        Blunt,
        Gunshot,
        Magic,
        Fire,
        Ice,
        Electric
    }

    /// <summary>
    /// Visual effect for combat hits. Spawns particles and optional sound.
    /// Self-destructs after particle system completes.
    /// </summary>
    public class HitEffect : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Particle Systems")]
        [SerializeField]
        [Tooltip("Main hit particle system")]
        private ParticleSystem mainParticles;

        [SerializeField]
        [Tooltip("Secondary particle system for critical hits")]
        private ParticleSystem criticalParticles;

        [SerializeField]
        [Tooltip("Spark particles")]
        private ParticleSystem sparkParticles;

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Lifetime before auto-destroy")]
        private float lifetime = 2f;

        [SerializeField]
        [Tooltip("Scale multiplier for critical hits")]
        private float criticalScale = 1.5f;

        [Header("Colors")]
        [SerializeField]
        private Color normalColor = Color.white;

        [SerializeField]
        private Color criticalColor = new Color(1f, 0.8f, 0f);

        [SerializeField]
        private Color fireColor = new Color(1f, 0.4f, 0f);

        [SerializeField]
        private Color iceColor = new Color(0.5f, 0.8f, 1f);

        [SerializeField]
        private Color electricColor = new Color(1f, 1f, 0f);

        [SerializeField]
        private Color magicColor = new Color(0.8f, 0f, 1f);

        [Header("Audio")]
        [SerializeField]
        private AudioSource audioSource;

        [SerializeField]
        private AudioClip normalHitSound;

        [SerializeField]
        private AudioClip criticalHitSound;

        #endregion

        #region Private Fields

        private float _timer;
        private bool _isInitialized;
        private HitType _hitType;

        #endregion

        #region Properties

        /// <summary>Current hit type.</summary>
        public HitType CurrentHitType => _hitType;

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

            // Check if all particles are done
            bool particlesDone = true;

            if (mainParticles != null && mainParticles.isPlaying)
                particlesDone = false;

            if (criticalParticles != null && criticalParticles.isPlaying)
                particlesDone = false;

            if (sparkParticles != null && sparkParticles.isPlaying)
                particlesDone = false;

            // Destroy when done or timeout
            if (particlesDone || _timer >= lifetime)
            {
                Destroy(gameObject);
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Initialize and play the hit effect.
        /// </summary>
        /// <param name="hitType">Type of hit for effect variation.</param>
        /// <param name="isCritical">Whether this is a critical hit.</param>
        public void Initialize(HitType hitType = HitType.Normal, bool isCritical = false)
        {
            _hitType = hitType;

            // Apply color based on type
            Color color = GetHitColor(hitType);
            ApplyColor(color);

            // Scale for critical hits
            if (isCritical)
            {
                transform.localScale *= criticalScale;
            }

            // Play particles
            if (mainParticles != null)
            {
                mainParticles.Play();
            }

            if (isCritical && criticalParticles != null)
            {
                criticalParticles.Play();
            }

            if (sparkParticles != null)
            {
                sparkParticles.Play();
            }

            // Play sound
            PlaySound(isCritical);

            _isInitialized = true;
        }

        /// <summary>
        /// Create a hit effect at a position.
        /// </summary>
        public static HitEffect Create(Vector3 position, HitType hitType = HitType.Normal,
            bool isCritical = false)
        {
            GameObject prefab = PrefabDatabase.Instance?.GetPrefab("hit_effect");

            if (prefab == null)
            {
                Debug.LogWarning("[HitEffect] Prefab not found in PrefabDatabase");
                return null;
            }

            GameObject instance = Instantiate(prefab, position, Quaternion.identity);
            HitEffect effect = instance.GetComponent<HitEffect>();
            effect?.Initialize(hitType, isCritical);

            return effect;
        }

        /// <summary>
        /// Create a hit effect at a position with a normal direction.
        /// </summary>
        public static HitEffect Create(Vector3 position, Vector3 normal, HitType hitType = HitType.Normal,
            bool isCritical = false)
        {
            GameObject prefab = PrefabDatabase.Instance?.GetPrefab("hit_effect");

            if (prefab == null)
            {
                Debug.LogWarning("[HitEffect] Prefab not found in PrefabDatabase");
                return null;
            }

            Quaternion rotation = Quaternion.LookRotation(normal);
            GameObject instance = Instantiate(prefab, position, rotation);
            HitEffect effect = instance.GetComponent<HitEffect>();
            effect?.Initialize(hitType, isCritical);

            return effect;
        }

        #endregion

        #region Private Methods

        private Color GetHitColor(HitType hitType)
        {
            return hitType switch
            {
                HitType.Critical => criticalColor,
                HitType.Fire => fireColor,
                HitType.Ice => iceColor,
                HitType.Electric => electricColor,
                HitType.Magic => magicColor,
                _ => normalColor
            };
        }

        private void ApplyColor(Color color)
        {
            ApplyColorToParticleSystem(mainParticles, color);
            ApplyColorToParticleSystem(sparkParticles, color);
        }

        private void ApplyColorToParticleSystem(ParticleSystem ps, Color color)
        {
            if (ps == null) return;

            var main = ps.main;
            main.startColor = color;
        }

        private void PlaySound(bool isCritical)
        {
            if (audioSource == null) return;

            AudioClip clip = isCritical ? criticalHitSound : normalHitSound;

            if (clip != null)
            {
                audioSource.PlayOneShot(clip);
            }
        }

        #endregion
    }
}
