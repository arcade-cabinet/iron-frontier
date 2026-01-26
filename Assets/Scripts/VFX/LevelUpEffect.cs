// =============================================================================
// LevelUpEffect.cs - Level Up Celebration Visual Effect
// Iron Frontier - Unity 6
// =============================================================================

using System;
using System.Collections;
using UnityEngine;
using TMPro;
using IronFrontier.Core;

namespace IronFrontier.VFX
{
    /// <summary>
    /// Level up celebration effect with particles, light burst, and text.
    /// Attaches to player or NPC when they level up.
    /// </summary>
    public class LevelUpEffect : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Particle Systems")]
        [SerializeField]
        [Tooltip("Main level up particles (column of light)")]
        private ParticleSystem mainParticles;

        [SerializeField]
        [Tooltip("Burst particles at start")]
        private ParticleSystem burstParticles;

        [SerializeField]
        [Tooltip("Floating sparkle particles")]
        private ParticleSystem sparkleParticles;

        [SerializeField]
        [Tooltip("Rising star particles")]
        private ParticleSystem starParticles;

        [Header("Light")]
        [SerializeField]
        [Tooltip("Point light for the glow effect")]
        private Light pointLight;

        [SerializeField]
        [Tooltip("Light intensity at peak")]
        private float peakLightIntensity = 3f;

        [SerializeField]
        [Tooltip("Light color")]
        private Color lightColor = new Color(1f, 0.9f, 0.4f);

        [Header("Text")]
        [SerializeField]
        [Tooltip("Level up text mesh")]
        private TextMeshPro levelText;

        [SerializeField]
        [Tooltip("Text format (use {0} for level number)")]
        private string textFormat = "LEVEL UP!\nLevel {0}";

        [SerializeField]
        [Tooltip("Text color")]
        private Color textColor = new Color(1f, 0.84f, 0f);

        [Header("Animation")]
        [SerializeField]
        [Tooltip("Total duration of the effect")]
        private float duration = 3f;

        [SerializeField]
        [Tooltip("Time for the buildup phase")]
        private float buildupTime = 0.5f;

        [SerializeField]
        [Tooltip("Time for the peak phase")]
        private float peakTime = 1f;

        [SerializeField]
        [Tooltip("Text rise height")]
        private float textRiseHeight = 2f;

        [SerializeField]
        [Tooltip("Text scale animation curve")]
        private AnimationCurve textScaleCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

        [Header("Audio")]
        [SerializeField]
        private AudioSource audioSource;

        [SerializeField]
        private AudioClip levelUpSound;

        [SerializeField]
        private AudioClip fanfareSound;

        #endregion

        #region Events

        /// <summary>Fired when the effect completes.</summary>
        public event Action OnEffectComplete;

        #endregion

        #region Private Fields

        private int _level;
        private float _timer;
        private Vector3 _textStartPosition;
        private Vector3 _textBaseScale;
        private bool _isPlaying;

        #endregion

        #region Properties

        /// <summary>Whether the effect is currently playing.</summary>
        public bool IsPlaying => _isPlaying;

        /// <summary>The level being celebrated.</summary>
        public int Level => _level;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            // Find components if not assigned
            if (mainParticles == null)
            {
                mainParticles = GetComponent<ParticleSystem>();
            }

            if (audioSource == null)
            {
                audioSource = GetComponent<AudioSource>();
            }

            if (pointLight != null)
            {
                pointLight.intensity = 0f;
                pointLight.color = lightColor;
            }

            if (levelText != null)
            {
                _textStartPosition = levelText.transform.localPosition;
                _textBaseScale = levelText.transform.localScale;
                levelText.gameObject.SetActive(false);
            }
        }

        private void Update()
        {
            if (!_isPlaying) return;

            _timer += Time.deltaTime;
            float normalizedTime = _timer / duration;

            UpdateLight(normalizedTime);
            UpdateText(normalizedTime);

            if (_timer >= duration)
            {
                Complete();
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Initialize and play the level up effect.
        /// </summary>
        /// <param name="newLevel">The new level achieved.</param>
        public void Initialize(int newLevel)
        {
            _level = newLevel;
            _timer = 0f;
            _isPlaying = true;

            // Set up text
            if (levelText != null)
            {
                levelText.text = string.Format(textFormat, newLevel);
                levelText.color = textColor;
                levelText.gameObject.SetActive(true);
                levelText.transform.localPosition = _textStartPosition;
                levelText.transform.localScale = Vector3.zero;
            }

            // Play particles
            StartCoroutine(PlayParticleSequence());

            // Play audio
            PlayAudio();
        }

        /// <summary>
        /// Create a level up effect at a target transform.
        /// </summary>
        public static LevelUpEffect Create(Transform target, int newLevel)
        {
            GameObject prefab = PrefabDatabase.Instance?.GetPrefab("level_up_effect");

            if (prefab == null)
            {
                Debug.LogWarning("[LevelUpEffect] Prefab not found in PrefabDatabase");
                return null;
            }

            GameObject instance = Instantiate(prefab, target.position, Quaternion.identity, target);
            LevelUpEffect effect = instance.GetComponent<LevelUpEffect>();
            effect?.Initialize(newLevel);

            return effect;
        }

        /// <summary>
        /// Stop and clean up the effect early.
        /// </summary>
        public void Stop()
        {
            StopAllCoroutines();
            Complete();
        }

        #endregion

        #region Private Methods

        private IEnumerator PlayParticleSequence()
        {
            // Buildup phase - start main particles
            if (mainParticles != null)
            {
                mainParticles.Play();
            }

            yield return new WaitForSeconds(buildupTime);

            // Peak phase - burst and sparkles
            if (burstParticles != null)
            {
                burstParticles.Play();
            }

            if (sparkleParticles != null)
            {
                sparkleParticles.Play();
            }

            if (starParticles != null)
            {
                starParticles.Play();
            }
        }

        private void UpdateLight(float normalizedTime)
        {
            if (pointLight == null) return;

            float intensity;

            if (normalizedTime < buildupTime / duration)
            {
                // Buildup - ramp up
                float buildupNormalized = normalizedTime / (buildupTime / duration);
                intensity = Mathf.Lerp(0f, peakLightIntensity, buildupNormalized);
            }
            else if (normalizedTime < (buildupTime + peakTime) / duration)
            {
                // Peak - full intensity with slight pulse
                float pulseTime = (normalizedTime - buildupTime / duration) * duration;
                float pulse = 1f + Mathf.Sin(pulseTime * 10f) * 0.1f;
                intensity = peakLightIntensity * pulse;
            }
            else
            {
                // Fadeout
                float fadeStart = (buildupTime + peakTime) / duration;
                float fadeNormalized = (normalizedTime - fadeStart) / (1f - fadeStart);
                intensity = Mathf.Lerp(peakLightIntensity, 0f, fadeNormalized);
            }

            pointLight.intensity = intensity;
        }

        private void UpdateText(float normalizedTime)
        {
            if (levelText == null) return;

            // Scale animation
            float scaleProgress = Mathf.Clamp01(normalizedTime * 2f); // Scale up in first half
            float scaleValue = textScaleCurve.Evaluate(scaleProgress);
            levelText.transform.localScale = _textBaseScale * scaleValue;

            // Rise animation
            float riseProgress = Mathf.Clamp01(normalizedTime);
            float riseOffset = riseProgress * textRiseHeight;
            levelText.transform.localPosition = _textStartPosition + new Vector3(0f, riseOffset, 0f);

            // Fade out in last 20%
            if (normalizedTime > 0.8f)
            {
                float fadeProgress = (normalizedTime - 0.8f) / 0.2f;
                Color color = textColor;
                color.a = 1f - fadeProgress;
                levelText.color = color;
            }
        }

        private void PlayAudio()
        {
            if (audioSource == null) return;

            if (levelUpSound != null)
            {
                audioSource.PlayOneShot(levelUpSound);
            }

            // Play fanfare after a short delay
            if (fanfareSound != null)
            {
                StartCoroutine(PlayDelayedSound(fanfareSound, buildupTime));
            }
        }

        private IEnumerator PlayDelayedSound(AudioClip clip, float delay)
        {
            yield return new WaitForSeconds(delay);

            if (audioSource != null && clip != null)
            {
                audioSource.PlayOneShot(clip);
            }
        }

        private void Complete()
        {
            _isPlaying = false;

            // Stop any remaining particles
            if (mainParticles != null) mainParticles.Stop();
            if (burstParticles != null) burstParticles.Stop();
            if (sparkleParticles != null) sparkleParticles.Stop();
            if (starParticles != null) starParticles.Stop();

            // Turn off light
            if (pointLight != null) pointLight.intensity = 0f;

            // Hide text
            if (levelText != null) levelText.gameObject.SetActive(false);

            OnEffectComplete?.Invoke();

            // Self-destruct
            Destroy(gameObject);
        }

        #endregion
    }
}
