// =============================================================================
// NamePlate.cs - NPC Name Plate UI Component
// Iron Frontier - Unity 6
// =============================================================================

using UnityEngine;
using TMPro;
using IronFrontier.Core;

namespace IronFrontier.UI
{
    /// <summary>
    /// NPC name display type for styling.
    /// </summary>
    public enum NamePlateType
    {
        /// <summary>Friendly NPC.</summary>
        Friendly,
        /// <summary>Neutral NPC.</summary>
        Neutral,
        /// <summary>Hostile enemy.</summary>
        Hostile,
        /// <summary>Quest giver.</summary>
        QuestGiver,
        /// <summary>Merchant/vendor.</summary>
        Merchant,
        /// <summary>Party member.</summary>
        Party
    }

    /// <summary>
    /// Floating name plate that displays above NPCs and enemies.
    /// Shows name, optional title, and health bar.
    /// </summary>
    public class NamePlate : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Name plate type for styling")]
        private NamePlateType plateType = NamePlateType.Neutral;

        [SerializeField]
        [Tooltip("Show health bar")]
        private bool showHealthBar = true;

        [SerializeField]
        [Tooltip("Hide when full health")]
        private bool hideHealthWhenFull = true;

        [SerializeField]
        [Tooltip("Offset from target")]
        private Vector3 offset = new Vector3(0f, 2.5f, 0f);

        [SerializeField]
        [Tooltip("Scale with distance")]
        private bool scaleWithDistance = true;

        [SerializeField]
        [Tooltip("Min scale at max distance")]
        private float minScale = 0.5f;

        [SerializeField]
        [Tooltip("Max distance for visibility")]
        private float maxDistance = 30f;

        [Header("Colors")]
        [SerializeField]
        private Color friendlyColor = new Color(0f, 0.8f, 0f);

        [SerializeField]
        private Color neutralColor = Color.white;

        [SerializeField]
        private Color hostileColor = new Color(0.9f, 0.2f, 0.2f);

        [SerializeField]
        private Color questGiverColor = new Color(1f, 0.84f, 0f);

        [SerializeField]
        private Color merchantColor = new Color(0.5f, 0.8f, 1f);

        [SerializeField]
        private Color partyColor = new Color(0.3f, 0.7f, 1f);

        [Header("Health Bar Colors")]
        [SerializeField]
        private Color healthBarFull = new Color(0f, 0.8f, 0f);

        [SerializeField]
        private Color healthBarMedium = new Color(1f, 0.8f, 0f);

        [SerializeField]
        private Color healthBarLow = new Color(0.9f, 0.2f, 0.2f);

        [SerializeField]
        private Color healthBarBackground = new Color(0.2f, 0.2f, 0.2f, 0.8f);

        [Header("References")]
        [SerializeField]
        private TextMeshPro nameText;

        [SerializeField]
        private TextMeshPro titleText;

        [SerializeField]
        private SpriteRenderer healthBarFill;

        [SerializeField]
        private SpriteRenderer healthBarBg;

        [SerializeField]
        private GameObject questIcon;

        [SerializeField]
        private GameObject merchantIcon;

        #endregion

        #region Private Fields

        private Transform _target;
        private Camera _mainCamera;
        private Transform _player;
        private Vector3 _baseScale;
        private float _currentHealth = 1f;
        private float _maxHealth = 1f;
        private string _npcName;
        private string _npcTitle;
        private bool _isVisible = true;

        #endregion

        #region Properties

        /// <summary>NPC name displayed.</summary>
        public string NpcName => _npcName;

        /// <summary>NPC title displayed.</summary>
        public string NpcTitle => _npcTitle;

        /// <summary>Current name plate type.</summary>
        public NamePlateType PlateType => plateType;

        /// <summary>Target transform.</summary>
        public Transform Target => _target;

        /// <summary>Whether the name plate is visible.</summary>
        public bool IsVisible => _isVisible;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            _mainCamera = Camera.main;
            _baseScale = transform.localScale;

            // Find components if not assigned
            if (nameText == null)
            {
                nameText = GetComponentInChildren<TextMeshPro>();
            }
        }

        private void Start()
        {
            // Find player
            var playerController = FindFirstObjectByType<Player.PlayerController>();
            if (playerController != null)
            {
                _player = playerController.transform;
            }

            UpdateIcons();
            UpdateHealthBar();
        }

        private void LateUpdate()
        {
            // Follow target
            if (_target != null)
            {
                transform.position = _target.position + offset;
            }

            // Billboard effect - face camera
            if (_mainCamera != null)
            {
                transform.forward = _mainCamera.transform.forward;
            }

            // Scale and visibility based on distance
            if (scaleWithDistance && _player != null)
            {
                float distance = Vector3.Distance(transform.position, _player.position);

                // Hide if too far
                if (distance > maxDistance)
                {
                    SetVisible(false);
                    return;
                }
                else if (!_isVisible)
                {
                    SetVisible(true);
                }

                // Scale
                float t = Mathf.InverseLerp(0f, maxDistance, distance);
                float scale = Mathf.Lerp(1f, minScale, t);
                transform.localScale = _baseScale * scale;
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Initialize the name plate with NPC data.
        /// </summary>
        /// <param name="target">Transform to follow.</param>
        /// <param name="npcName">Name to display.</param>
        /// <param name="type">Name plate type.</param>
        /// <param name="title">Optional title.</param>
        public void Initialize(Transform target, string npcName, NamePlateType type = NamePlateType.Neutral,
            string title = null)
        {
            _target = target;
            _npcName = npcName;
            _npcTitle = title;
            plateType = type;

            UpdateName();
            UpdateTitle();
            ApplyTypeStyle();
            UpdateIcons();
        }

        /// <summary>
        /// Set the NPC name.
        /// </summary>
        public void SetName(string name)
        {
            _npcName = name;
            UpdateName();
        }

        /// <summary>
        /// Set the NPC title.
        /// </summary>
        public void SetTitle(string title)
        {
            _npcTitle = title;
            UpdateTitle();
        }

        /// <summary>
        /// Set the name plate type.
        /// </summary>
        public void SetType(NamePlateType type)
        {
            plateType = type;
            ApplyTypeStyle();
            UpdateIcons();
        }

        /// <summary>
        /// Update the health bar.
        /// </summary>
        public void SetHealth(float current, float max)
        {
            _currentHealth = current;
            _maxHealth = max;
            UpdateHealthBar();
        }

        /// <summary>
        /// Show or hide the name plate.
        /// </summary>
        public void SetVisible(bool visible)
        {
            if (_isVisible == visible) return;

            _isVisible = visible;
            gameObject.SetActive(visible);
        }

        /// <summary>
        /// Set the target transform.
        /// </summary>
        public void SetTarget(Transform target)
        {
            _target = target;
        }

        /// <summary>
        /// Create a name plate for a target.
        /// </summary>
        public static NamePlate Create(Transform target, string npcName, NamePlateType type = NamePlateType.Neutral,
            string title = null)
        {
            GameObject prefab = PrefabDatabase.Instance?.GetPrefab("name_plate");

            if (prefab == null)
            {
                Debug.LogWarning("[NamePlate] Prefab not found in PrefabDatabase");
                return null;
            }

            GameObject instance = Instantiate(prefab, target.position, Quaternion.identity);
            NamePlate plate = instance.GetComponent<NamePlate>();
            plate?.Initialize(target, npcName, type, title);

            return plate;
        }

        #endregion

        #region Private Methods

        private void UpdateName()
        {
            if (nameText != null)
            {
                nameText.text = _npcName;
            }
        }

        private void UpdateTitle()
        {
            if (titleText != null)
            {
                titleText.text = _npcTitle;
                titleText.gameObject.SetActive(!string.IsNullOrEmpty(_npcTitle));
            }
        }

        private void ApplyTypeStyle()
        {
            Color color = GetTypeColor();

            if (nameText != null)
            {
                nameText.color = color;
            }

            if (titleText != null)
            {
                Color titleColor = color;
                titleColor.a = 0.8f;
                titleText.color = titleColor;
            }
        }

        private Color GetTypeColor()
        {
            return plateType switch
            {
                NamePlateType.Friendly => friendlyColor,
                NamePlateType.Neutral => neutralColor,
                NamePlateType.Hostile => hostileColor,
                NamePlateType.QuestGiver => questGiverColor,
                NamePlateType.Merchant => merchantColor,
                NamePlateType.Party => partyColor,
                _ => neutralColor
            };
        }

        private void UpdateIcons()
        {
            if (questIcon != null)
            {
                questIcon.SetActive(plateType == NamePlateType.QuestGiver);
            }

            if (merchantIcon != null)
            {
                merchantIcon.SetActive(plateType == NamePlateType.Merchant);
            }
        }

        private void UpdateHealthBar()
        {
            if (!showHealthBar || healthBarFill == null) return;

            float healthPercent = _maxHealth > 0 ? _currentHealth / _maxHealth : 0f;

            // Hide if full and configured to do so
            if (hideHealthWhenFull && healthPercent >= 1f)
            {
                if (healthBarFill != null) healthBarFill.gameObject.SetActive(false);
                if (healthBarBg != null) healthBarBg.gameObject.SetActive(false);
                return;
            }

            if (healthBarFill != null)
            {
                healthBarFill.gameObject.SetActive(true);

                // Scale fill based on health
                Vector3 scale = healthBarFill.transform.localScale;
                scale.x = Mathf.Clamp01(healthPercent);
                healthBarFill.transform.localScale = scale;

                // Color based on health level
                Color barColor;
                if (healthPercent > 0.5f)
                    barColor = healthBarFull;
                else if (healthPercent > 0.25f)
                    barColor = healthBarMedium;
                else
                    barColor = healthBarLow;

                healthBarFill.color = barColor;
            }

            if (healthBarBg != null)
            {
                healthBarBg.gameObject.SetActive(true);
                healthBarBg.color = healthBarBackground;
            }
        }

        #endregion
    }
}
