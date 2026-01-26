// =============================================================================
// DamagePopup.cs - Floating Damage Number UI Component
// Iron Frontier - Unity 6
// =============================================================================

using System;
using UnityEngine;
using TMPro;

namespace IronFrontier.UI
{
    /// <summary>
    /// Type of damage for visual styling.
    /// </summary>
    public enum DamageType
    {
        Normal,
        Critical,
        Heal,
        Miss,
        Blocked
    }

    /// <summary>
    /// Floating damage number that animates upward and fades out.
    /// Spawned via PrefabDatabase when damage is dealt.
    /// </summary>
    public class DamagePopup : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Animation")]
        [SerializeField]
        [Tooltip("How long the popup lasts")]
        private float lifetime = 1f;

        [SerializeField]
        [Tooltip("Upward float speed")]
        private float floatSpeed = 2f;

        [SerializeField]
        [Tooltip("Random horizontal spread")]
        private float horizontalSpread = 0.5f;

        [SerializeField]
        [Tooltip("Animation curve for vertical movement")]
        private AnimationCurve floatCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f);

        [SerializeField]
        [Tooltip("Animation curve for fade out")]
        private AnimationCurve fadeCurve = AnimationCurve.Linear(0f, 1f, 1f, 0f);

        [SerializeField]
        [Tooltip("Scale punch amount on spawn")]
        private float scalePunchAmount = 1.3f;

        [SerializeField]
        [Tooltip("Scale punch duration")]
        private float scalePunchDuration = 0.2f;

        [Header("Colors")]
        [SerializeField]
        private Color normalColor = Color.white;

        [SerializeField]
        private Color criticalColor = Color.yellow;

        [SerializeField]
        private Color healColor = Color.green;

        [SerializeField]
        private Color missColor = Color.gray;

        [SerializeField]
        private Color blockedColor = Color.cyan;

        [Header("Text")]
        [SerializeField]
        [Tooltip("Critical damage text prefix")]
        private string criticalPrefix = "CRIT! ";

        [SerializeField]
        [Tooltip("Heal text prefix")]
        private string healPrefix = "+";

        [SerializeField]
        [Tooltip("Miss text")]
        private string missText = "MISS";

        [SerializeField]
        [Tooltip("Blocked text")]
        private string blockedText = "BLOCKED";

        [Header("References")]
        [SerializeField]
        private TextMeshPro textMesh;

        [SerializeField]
        private TextMeshProUGUI textMeshUI;

        #endregion

        #region Private Fields

        private float _elapsedTime;
        private Vector3 _startPosition;
        private Vector3 _floatDirection;
        private Color _baseColor;
        private Vector3 _baseScale;
        private bool _isInitialized;
        private Camera _mainCamera;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            _baseScale = transform.localScale;
            _mainCamera = Camera.main;

            // Find text component if not assigned
            if (textMesh == null)
            {
                textMesh = GetComponent<TextMeshPro>();
            }

            if (textMeshUI == null)
            {
                textMeshUI = GetComponent<TextMeshProUGUI>();
            }
        }

        private void Update()
        {
            if (!_isInitialized) return;

            _elapsedTime += Time.deltaTime;
            float normalizedTime = _elapsedTime / lifetime;

            if (normalizedTime >= 1f)
            {
                Destroy(gameObject);
                return;
            }

            // Apply float animation
            float floatOffset = floatCurve.Evaluate(normalizedTime) * floatSpeed * lifetime;
            transform.position = _startPosition + _floatDirection * floatOffset;

            // Apply fade
            float alpha = fadeCurve.Evaluate(normalizedTime);
            SetAlpha(alpha);

            // Apply scale punch
            float scalePunchProgress = Mathf.Clamp01(_elapsedTime / scalePunchDuration);
            float scaleFactor = Mathf.Lerp(scalePunchAmount, 1f, scalePunchProgress);
            transform.localScale = _baseScale * scaleFactor;

            // Billboard effect (face camera)
            if (_mainCamera != null && textMesh != null)
            {
                transform.forward = _mainCamera.transform.forward;
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Initialize and show damage popup.
        /// </summary>
        /// <param name="amount">Damage amount to display.</param>
        /// <param name="type">Type of damage for styling.</param>
        public void Initialize(int amount, DamageType type = DamageType.Normal)
        {
            _startPosition = transform.position;
            _floatDirection = Vector3.up + new Vector3(
                UnityEngine.Random.Range(-horizontalSpread, horizontalSpread),
                0f,
                0f
            );

            // Set text based on type
            string displayText;
            Color color;

            switch (type)
            {
                case DamageType.Critical:
                    displayText = $"{criticalPrefix}{amount}";
                    color = criticalColor;
                    break;

                case DamageType.Heal:
                    displayText = $"{healPrefix}{amount}";
                    color = healColor;
                    break;

                case DamageType.Miss:
                    displayText = missText;
                    color = missColor;
                    break;

                case DamageType.Blocked:
                    displayText = blockedText;
                    color = blockedColor;
                    break;

                default:
                    displayText = amount.ToString();
                    color = normalColor;
                    break;
            }

            SetText(displayText);
            SetColor(color);
            _baseColor = color;

            _isInitialized = true;
        }

        /// <summary>
        /// Create a damage popup at a world position.
        /// </summary>
        public static DamagePopup Create(Vector3 position, int amount, DamageType type = DamageType.Normal)
        {
            // Try to get prefab from PrefabDatabase
            GameObject prefab = PrefabDatabase.Instance?.GetPrefab("damage_popup");

            if (prefab == null)
            {
                Debug.LogWarning("[DamagePopup] Prefab not found in PrefabDatabase");
                return null;
            }

            GameObject instance = Instantiate(prefab, position, Quaternion.identity);
            DamagePopup popup = instance.GetComponent<DamagePopup>();
            popup?.Initialize(amount, type);

            return popup;
        }

        #endregion

        #region Private Methods

        private void SetText(string text)
        {
            if (textMesh != null)
            {
                textMesh.text = text;
            }

            if (textMeshUI != null)
            {
                textMeshUI.text = text;
            }
        }

        private void SetColor(Color color)
        {
            if (textMesh != null)
            {
                textMesh.color = color;
            }

            if (textMeshUI != null)
            {
                textMeshUI.color = color;
            }
        }

        private void SetAlpha(float alpha)
        {
            Color color = _baseColor;
            color.a = alpha;
            SetColor(color);
        }

        #endregion
    }
}
