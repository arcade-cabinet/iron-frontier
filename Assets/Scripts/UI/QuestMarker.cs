// =============================================================================
// QuestMarker.cs - Quest Objective Marker UI Component
// Iron Frontier - Unity 6
// =============================================================================

using System;
using UnityEngine;
using TMPro;
using UnityEngine.UI;
using IronFrontier.Core;

namespace IronFrontier.UI
{
    /// <summary>
    /// Type of quest marker for visual styling.
    /// </summary>
    public enum QuestMarkerType
    {
        /// <summary>Main quest objective.</summary>
        MainQuest,
        /// <summary>Side quest objective.</summary>
        SideQuest,
        /// <summary>NPC to talk to.</summary>
        TalkTo,
        /// <summary>Location to go to.</summary>
        GoTo,
        /// <summary>Item to collect.</summary>
        Collect,
        /// <summary>Enemy to defeat.</summary>
        Defeat,
        /// <summary>Turn-in location.</summary>
        TurnIn
    }

    /// <summary>
    /// Quest objective marker that floats above objectives in the world.
    /// Shows distance and updates based on quest tracking.
    /// </summary>
    public class QuestMarker : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Quest marker type for styling")]
        private QuestMarkerType markerType = QuestMarkerType.MainQuest;

        [SerializeField]
        [Tooltip("Show distance text")]
        private bool showDistance = true;

        [SerializeField]
        [Tooltip("Minimum distance to show marker")]
        private float minDistance = 2f;

        [SerializeField]
        [Tooltip("Maximum distance to show marker")]
        private float maxDistance = 100f;

        [SerializeField]
        [Tooltip("Scale with distance")]
        private bool scaleWithDistance = true;

        [SerializeField]
        [Tooltip("Minimum scale at max distance")]
        private float minScale = 0.5f;

        [Header("Animation")]
        [SerializeField]
        [Tooltip("Bob amplitude")]
        private float bobAmplitude = 0.2f;

        [SerializeField]
        [Tooltip("Bob frequency")]
        private float bobFrequency = 1f;

        [SerializeField]
        [Tooltip("Rotation speed")]
        private float rotationSpeed = 30f;

        [SerializeField]
        [Tooltip("Offset from target")]
        private Vector3 offset = new Vector3(0f, 2.5f, 0f);

        [Header("Colors")]
        [SerializeField]
        private Color mainQuestColor = new Color(1f, 0.84f, 0f); // Gold

        [SerializeField]
        private Color sideQuestColor = new Color(0.5f, 0.5f, 1f); // Light blue

        [SerializeField]
        private Color talkToColor = new Color(0f, 1f, 0.5f); // Cyan-green

        [SerializeField]
        private Color goToColor = Color.white;

        [SerializeField]
        private Color collectColor = new Color(0f, 1f, 1f); // Cyan

        [SerializeField]
        private Color defeatColor = new Color(1f, 0.3f, 0.3f); // Red

        [SerializeField]
        private Color turnInColor = new Color(0f, 1f, 0f); // Green

        [Header("References")]
        [SerializeField]
        private SpriteRenderer iconRenderer;

        [SerializeField]
        private TextMeshPro distanceText;

        [SerializeField]
        private Image iconImage;

        [SerializeField]
        private TextMeshProUGUI distanceTextUI;

        [Header("Icons")]
        [SerializeField]
        private Sprite mainQuestIcon;

        [SerializeField]
        private Sprite sideQuestIcon;

        [SerializeField]
        private Sprite talkIcon;

        [SerializeField]
        private Sprite goToIcon;

        [SerializeField]
        private Sprite collectIcon;

        [SerializeField]
        private Sprite defeatIcon;

        [SerializeField]
        private Sprite turnInIcon;

        #endregion

        #region Private Fields

        private Transform _target;
        private Transform _player;
        private Camera _mainCamera;
        private Vector3 _baseScale;
        private string _questId;
        private string _objectiveId;
        private bool _isActive = true;

        #endregion

        #region Properties

        /// <summary>Quest ID this marker is tracking.</summary>
        public string QuestId => _questId;

        /// <summary>Objective ID this marker is tracking.</summary>
        public string ObjectiveId => _objectiveId;

        /// <summary>Current marker type.</summary>
        public QuestMarkerType MarkerType => markerType;

        /// <summary>Whether the marker is currently active.</summary>
        public bool IsActive => _isActive;

        /// <summary>Target transform.</summary>
        public Transform Target => _target;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            _mainCamera = Camera.main;
            _baseScale = transform.localScale;

            // Find components if not assigned
            if (iconRenderer == null)
            {
                iconRenderer = GetComponentInChildren<SpriteRenderer>();
            }

            if (distanceText == null)
            {
                distanceText = GetComponentInChildren<TextMeshPro>();
            }
        }

        private void Start()
        {
            // Try to find player
            var playerController = FindFirstObjectByType<Player.PlayerController>();
            if (playerController != null)
            {
                _player = playerController.transform;
            }

            ApplyStyle();
        }

        private void Update()
        {
            if (!_isActive) return;

            // Update position
            if (_target != null)
            {
                float bob = Mathf.Sin(Time.time * bobFrequency * Mathf.PI * 2f) * bobAmplitude;
                transform.position = _target.position + offset + new Vector3(0f, bob, 0f);
            }

            // Rotate
            if (iconRenderer != null)
            {
                iconRenderer.transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);
            }

            // Billboard effect
            if (_mainCamera != null)
            {
                transform.forward = _mainCamera.transform.forward;
            }

            // Update distance
            UpdateDistance();

            // Scale with distance
            if (scaleWithDistance && _player != null)
            {
                float distance = Vector3.Distance(transform.position, _player.position);
                float t = Mathf.InverseLerp(minDistance, maxDistance, distance);
                float scale = Mathf.Lerp(1f, minScale, t);
                transform.localScale = _baseScale * scale;

                // Hide if too close or too far
                bool visible = distance >= minDistance && distance <= maxDistance;
                SetVisible(visible);
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Initialize the marker with target and quest info.
        /// </summary>
        public void Initialize(Transform target, string questId, string objectiveId,
            QuestMarkerType type = QuestMarkerType.MainQuest)
        {
            _target = target;
            _questId = questId;
            _objectiveId = objectiveId;
            markerType = type;

            ApplyStyle();
        }

        /// <summary>
        /// Set the marker type.
        /// </summary>
        public void SetType(QuestMarkerType type)
        {
            markerType = type;
            ApplyStyle();
        }

        /// <summary>
        /// Set the target transform.
        /// </summary>
        public void SetTarget(Transform target)
        {
            _target = target;
        }

        /// <summary>
        /// Activate the marker.
        /// </summary>
        public void Activate()
        {
            _isActive = true;
            SetVisible(true);
        }

        /// <summary>
        /// Deactivate the marker.
        /// </summary>
        public void Deactivate()
        {
            _isActive = false;
            SetVisible(false);
        }

        /// <summary>
        /// Complete the objective (plays completion effect and deactivates).
        /// </summary>
        public void Complete()
        {
            // Could play completion VFX here
            Deactivate();
        }

        /// <summary>
        /// Create a quest marker at a target position.
        /// </summary>
        public static QuestMarker Create(Transform target, string questId, string objectiveId,
            QuestMarkerType type = QuestMarkerType.MainQuest)
        {
            GameObject prefab = PrefabDatabase.Instance?.GetPrefab("quest_marker");

            if (prefab == null)
            {
                Debug.LogWarning("[QuestMarker] Prefab not found in PrefabDatabase");
                return null;
            }

            GameObject instance = Instantiate(prefab, target.position, Quaternion.identity);
            QuestMarker marker = instance.GetComponent<QuestMarker>();
            marker?.Initialize(target, questId, objectiveId, type);

            return marker;
        }

        #endregion

        #region Private Methods

        private void ApplyStyle()
        {
            Color color = GetMarkerColor();
            Sprite icon = GetMarkerIcon();

            // Apply to sprite renderer
            if (iconRenderer != null)
            {
                iconRenderer.color = color;
                if (icon != null)
                {
                    iconRenderer.sprite = icon;
                }
            }

            // Apply to UI image
            if (iconImage != null)
            {
                iconImage.color = color;
                if (icon != null)
                {
                    iconImage.sprite = icon;
                }
            }

            // Apply to distance text
            if (distanceText != null)
            {
                distanceText.color = color;
            }

            if (distanceTextUI != null)
            {
                distanceTextUI.color = color;
            }
        }

        private Color GetMarkerColor()
        {
            return markerType switch
            {
                QuestMarkerType.MainQuest => mainQuestColor,
                QuestMarkerType.SideQuest => sideQuestColor,
                QuestMarkerType.TalkTo => talkToColor,
                QuestMarkerType.GoTo => goToColor,
                QuestMarkerType.Collect => collectColor,
                QuestMarkerType.Defeat => defeatColor,
                QuestMarkerType.TurnIn => turnInColor,
                _ => Color.white
            };
        }

        private Sprite GetMarkerIcon()
        {
            return markerType switch
            {
                QuestMarkerType.MainQuest => mainQuestIcon,
                QuestMarkerType.SideQuest => sideQuestIcon,
                QuestMarkerType.TalkTo => talkIcon,
                QuestMarkerType.GoTo => goToIcon,
                QuestMarkerType.Collect => collectIcon,
                QuestMarkerType.Defeat => defeatIcon,
                QuestMarkerType.TurnIn => turnInIcon,
                _ => null
            };
        }

        private void UpdateDistance()
        {
            if (!showDistance || _player == null) return;

            float distance = Vector3.Distance(transform.position, _player.position);
            string distanceStr = distance >= 1000f
                ? $"{distance / 1000f:F1}km"
                : $"{Mathf.RoundToInt(distance)}m";

            if (distanceText != null)
            {
                distanceText.text = distanceStr;
            }

            if (distanceTextUI != null)
            {
                distanceTextUI.text = distanceStr;
            }
        }

        private void SetVisible(bool visible)
        {
            if (iconRenderer != null)
            {
                iconRenderer.enabled = visible;
            }

            if (iconImage != null)
            {
                iconImage.enabled = visible;
            }

            if (distanceText != null)
            {
                distanceText.enabled = visible && showDistance;
            }

            if (distanceTextUI != null)
            {
                distanceTextUI.enabled = visible && showDistance;
            }
        }

        #endregion

        #region Gizmos

        private void OnDrawGizmos()
        {
            Gizmos.color = GetMarkerColor();
            Gizmos.DrawWireSphere(transform.position, 0.5f);

            if (_target != null)
            {
                Gizmos.DrawLine(transform.position, _target.position);
            }
        }

        #endregion
    }
}
