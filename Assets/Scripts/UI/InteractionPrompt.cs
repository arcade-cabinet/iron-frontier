// =============================================================================
// InteractionPrompt.cs - "Press E to Interact" UI Component
// Iron Frontier - Unity 6
// =============================================================================

using System;
using UnityEngine;
using TMPro;
using IronFrontier.Player;
using IronFrontier.Input;

namespace IronFrontier.UI
{
    /// <summary>
    /// Floating UI prompt that appears when the player is near an interactable.
    /// Shows the interaction key/button based on current input device.
    /// </summary>
    public class InteractionPrompt : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Text Configuration")]
        [SerializeField]
        [Tooltip("Text format (use {0} for key, {1} for action)")]
        private string promptFormat = "Press {0} to {1}";

        [SerializeField]
        [Tooltip("Keyboard key text")]
        private string keyboardKey = "E";

        [SerializeField]
        [Tooltip("Gamepad button text")]
        private string gamepadButton = "X";

        [SerializeField]
        [Tooltip("Default action text")]
        private string defaultAction = "Interact";

        [Header("Animation")]
        [SerializeField]
        [Tooltip("Fade in/out duration")]
        private float fadeDuration = 0.2f;

        [SerializeField]
        [Tooltip("Bob amplitude")]
        private float bobAmplitude = 0.1f;

        [SerializeField]
        [Tooltip("Bob frequency")]
        private float bobFrequency = 2f;

        [SerializeField]
        [Tooltip("Offset from target position")]
        private Vector3 offset = new Vector3(0f, 2f, 0f);

        [Header("References")]
        [SerializeField]
        private TextMeshPro textMesh;

        [SerializeField]
        private TextMeshProUGUI textMeshUI;

        [SerializeField]
        private CanvasGroup canvasGroup;

        #endregion

        #region Private Fields

        private Transform _target;
        private string _currentAction;
        private float _targetAlpha;
        private float _currentAlpha;
        private Camera _mainCamera;
        private bool _isVisible;

        #endregion

        #region Properties

        /// <summary>Whether the prompt is currently visible.</summary>
        public bool IsVisible => _isVisible;

        /// <summary>Current target transform.</summary>
        public Transform Target => _target;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            _mainCamera = Camera.main;

            // Find text components if not assigned
            if (textMesh == null)
            {
                textMesh = GetComponent<TextMeshPro>();
            }

            if (textMeshUI == null)
            {
                textMeshUI = GetComponentInChildren<TextMeshProUGUI>();
            }

            if (canvasGroup == null)
            {
                canvasGroup = GetComponentInChildren<CanvasGroup>();
            }

            // Start hidden
            SetAlpha(0f);
            _currentAlpha = 0f;
            _targetAlpha = 0f;
        }

        private void Start()
        {
            // Subscribe to player events
            if (PlayerController.Instance != null)
            {
                PlayerController.Instance.OnEnterInteractionRange += HandleEnterInteractionRange;
                PlayerController.Instance.OnExitInteractionRange += HandleExitInteractionRange;
            }

            UpdateText();
        }

        private void Update()
        {
            // Smooth fade
            if (!Mathf.Approximately(_currentAlpha, _targetAlpha))
            {
                _currentAlpha = Mathf.MoveTowards(
                    _currentAlpha,
                    _targetAlpha,
                    Time.deltaTime / fadeDuration
                );
                SetAlpha(_currentAlpha);
            }

            // Follow target
            if (_target != null && _isVisible)
            {
                float bob = Mathf.Sin(Time.time * bobFrequency * Mathf.PI * 2f) * bobAmplitude;
                transform.position = _target.position + offset + new Vector3(0f, bob, 0f);

                // Billboard effect
                if (_mainCamera != null && textMesh != null)
                {
                    transform.forward = _mainCamera.transform.forward;
                }
            }

            // Update text based on input device
            UpdateKeyText();
        }

        private void OnDestroy()
        {
            if (PlayerController.Instance != null)
            {
                PlayerController.Instance.OnEnterInteractionRange -= HandleEnterInteractionRange;
                PlayerController.Instance.OnExitInteractionRange -= HandleExitInteractionRange;
            }
        }

        #endregion

        #region Event Handlers

        private void HandleEnterInteractionRange(object sender, Collider interactable)
        {
            Show(interactable.transform);

            // Try to get custom action text from interactable
            var interactableComponent = interactable.GetComponent<IInteractable>();
            if (interactableComponent != null)
            {
                _currentAction = interactableComponent.GetInteractionPrompt();
            }
            else
            {
                _currentAction = defaultAction;
            }

            UpdateText();
        }

        private void HandleExitInteractionRange(object sender, Collider interactable)
        {
            if (_target == interactable.transform)
            {
                Hide();
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Show the prompt at a target position.
        /// </summary>
        public void Show(Transform target, string action = null)
        {
            _target = target;
            _currentAction = action ?? defaultAction;
            _targetAlpha = 1f;
            _isVisible = true;

            UpdateText();
        }

        /// <summary>
        /// Hide the prompt.
        /// </summary>
        public void Hide()
        {
            _targetAlpha = 0f;
            _isVisible = false;
        }

        /// <summary>
        /// Set custom action text.
        /// </summary>
        public void SetAction(string action)
        {
            _currentAction = action;
            UpdateText();
        }

        #endregion

        #region Private Methods

        private void UpdateText()
        {
            string key = GetCurrentKeyText();
            string text = string.Format(promptFormat, key, _currentAction);

            if (textMesh != null)
            {
                textMesh.text = text;
            }

            if (textMeshUI != null)
            {
                textMeshUI.text = text;
            }
        }

        private void UpdateKeyText()
        {
            if (InputController.Instance == null) return;

            string key = GetCurrentKeyText();
            string text = string.Format(promptFormat, key, _currentAction);

            if (textMesh != null && textMesh.text != text)
            {
                textMesh.text = text;
            }

            if (textMeshUI != null && textMeshUI.text != text)
            {
                textMeshUI.text = text;
            }
        }

        private string GetCurrentKeyText()
        {
            if (InputController.Instance != null && InputController.Instance.HasGamepad &&
                !InputController.Instance.UsingKeyboard)
            {
                return gamepadButton;
            }

            return keyboardKey;
        }

        private void SetAlpha(float alpha)
        {
            if (canvasGroup != null)
            {
                canvasGroup.alpha = alpha;
            }

            if (textMesh != null)
            {
                Color color = textMesh.color;
                color.a = alpha;
                textMesh.color = color;
            }

            if (textMeshUI != null)
            {
                Color color = textMeshUI.color;
                color.a = alpha;
                textMeshUI.color = color;
            }
        }

        #endregion
    }

    /// <summary>
    /// Interface for objects that can be interacted with.
    /// </summary>
    public interface IInteractable
    {
        /// <summary>Get the interaction prompt text (e.g., "Talk", "Open", "Pick up").</summary>
        string GetInteractionPrompt();

        /// <summary>Called when the player interacts with this object.</summary>
        void OnInteract();
    }
}
