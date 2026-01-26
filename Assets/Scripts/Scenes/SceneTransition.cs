using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace IronFrontier.Scenes
{
    /// <summary>
    /// Types of scene transition effects.
    /// </summary>
    public enum TransitionType
    {
        /// <summary>No transition effect.</summary>
        None,
        /// <summary>Simple fade to/from black.</summary>
        Fade,
        /// <summary>Fade to/from white.</summary>
        FadeWhite,
        /// <summary>Horizontal wipe from left to right.</summary>
        WipeLeft,
        /// <summary>Horizontal wipe from right to left.</summary>
        WipeRight,
        /// <summary>Vertical wipe from top to bottom.</summary>
        WipeDown,
        /// <summary>Vertical wipe from bottom to top.</summary>
        WipeUp,
        /// <summary>Circle wipe expanding from center.</summary>
        CircleWipe,
        /// <summary>Diamond wipe expanding from center.</summary>
        DiamondWipe,
        /// <summary>Pixelate effect.</summary>
        Pixelate,
        /// <summary>Crossfade (used with additive scenes).</summary>
        Crossfade
    }

    /// <summary>
    /// Transition state during animation.
    /// </summary>
    public enum TransitionState
    {
        /// <summary>No transition active.</summary>
        Idle,
        /// <summary>Transitioning out (covering screen).</summary>
        TransitioningOut,
        /// <summary>Screen is fully covered.</summary>
        Covered,
        /// <summary>Transitioning in (revealing screen).</summary>
        TransitioningIn
    }

    /// <summary>
    /// Handles visual transition effects between scenes.
    /// Creates and manages transition UI elements dynamically.
    /// </summary>
    public class SceneTransition : MonoBehaviour
    {
        #region Events

        /// <summary>Fired when transition out begins.</summary>
        public event EventHandler OnTransitionOutStarted;

        /// <summary>Fired when transition out completes.</summary>
        public event EventHandler OnTransitionOutCompleted;

        /// <summary>Fired when transition in begins.</summary>
        public event EventHandler OnTransitionInStarted;

        /// <summary>Fired when transition in completes.</summary>
        public event EventHandler OnTransitionInCompleted;

        /// <summary>Fired with transition progress (0-1).</summary>
        public event EventHandler<float> OnTransitionProgress;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Default transition duration in seconds")]
        private float defaultDuration = 0.5f;

        [SerializeField]
        [Tooltip("Easing curve for transitions")]
        private AnimationCurve transitionCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);

        [Header("Colors")]
        [SerializeField]
        private Color fadeColor = Color.black;

        [SerializeField]
        private Color fadeWhiteColor = Color.white;

        [Header("References")]
        [SerializeField]
        [Tooltip("Optional custom transition canvas")]
        private Canvas transitionCanvas;

        [SerializeField]
        [Tooltip("Optional custom transition image")]
        private Image transitionImage;

        [Header("Wipe Settings")]
        [SerializeField]
        [Tooltip("Material for wipe transitions")]
        private Material wipeMaterial;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private TransitionState _state = TransitionState.Idle;
        private float _currentProgress = 0f;
        private Coroutine _activeTransition;

        // Dynamic UI elements
        private Canvas _dynamicCanvas;
        private Image _dynamicImage;
        private RectTransform _imageRect;

        #endregion

        #region Properties

        /// <summary>Current transition state.</summary>
        public TransitionState State => _state;

        /// <summary>Current transition progress (0-1).</summary>
        public float Progress => _currentProgress;

        /// <summary>Whether a transition is currently active.</summary>
        public bool IsTransitioning => _state != TransitionState.Idle;

        /// <summary>Whether the screen is currently covered.</summary>
        public bool IsCovered => _state == TransitionState.Covered;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            EnsureTransitionUI();
        }

        private void OnDestroy()
        {
            if (_activeTransition != null)
            {
                StopCoroutine(_activeTransition);
            }

            // Clean up dynamic objects
            if (_dynamicCanvas != null && _dynamicCanvas.gameObject != null)
            {
                Destroy(_dynamicCanvas.gameObject);
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Perform transition out (cover screen).
        /// </summary>
        /// <param name="type">Transition type to use.</param>
        /// <param name="duration">Duration in seconds.</param>
        public IEnumerator TransitionOut(TransitionType type, float duration = -1f)
        {
            if (duration < 0) duration = defaultDuration;

            if (_state != TransitionState.Idle)
            {
                LogWarning("Transition already in progress");
                yield break;
            }

            _state = TransitionState.TransitioningOut;
            OnTransitionOutStarted?.Invoke(this, EventArgs.Empty);

            Log($"Transition out: {type} ({duration}s)");

            EnsureTransitionUI();
            ConfigureForTransitionType(type);

            yield return StartCoroutine(AnimateTransition(type, 0f, 1f, duration));

            _state = TransitionState.Covered;
            OnTransitionOutCompleted?.Invoke(this, EventArgs.Empty);
        }

        /// <summary>
        /// Perform transition in (reveal screen).
        /// </summary>
        /// <param name="type">Transition type to use.</param>
        /// <param name="duration">Duration in seconds.</param>
        public IEnumerator TransitionIn(TransitionType type, float duration = -1f)
        {
            if (duration < 0) duration = defaultDuration;

            if (_state != TransitionState.Covered && _state != TransitionState.Idle)
            {
                LogWarning($"Cannot transition in from state: {_state}");
                yield break;
            }

            _state = TransitionState.TransitioningIn;
            OnTransitionInStarted?.Invoke(this, EventArgs.Empty);

            Log($"Transition in: {type} ({duration}s)");

            EnsureTransitionUI();
            ConfigureForTransitionType(type);

            yield return StartCoroutine(AnimateTransition(type, 1f, 0f, duration));

            // Hide transition UI
            SetTransitionUIActive(false);

            _state = TransitionState.Idle;
            _currentProgress = 0f;
            OnTransitionInCompleted?.Invoke(this, EventArgs.Empty);
        }

        /// <summary>
        /// Perform a complete transition (out, callback, in).
        /// </summary>
        /// <param name="type">Transition type.</param>
        /// <param name="onCovered">Callback when screen is covered.</param>
        /// <param name="duration">Duration for each half of the transition.</param>
        public IEnumerator FullTransition(TransitionType type, Action onCovered, float duration = -1f)
        {
            if (duration < 0) duration = defaultDuration;

            yield return TransitionOut(type, duration);

            onCovered?.Invoke();
            yield return null; // Allow one frame for scene changes

            yield return TransitionIn(type, duration);
        }

        /// <summary>
        /// Instantly cover the screen.
        /// </summary>
        public void CoverScreen()
        {
            EnsureTransitionUI();
            SetTransitionUIActive(true);
            SetTransitionProgress(1f, TransitionType.Fade);
            _state = TransitionState.Covered;
            _currentProgress = 1f;
        }

        /// <summary>
        /// Instantly reveal the screen.
        /// </summary>
        public void RevealScreen()
        {
            SetTransitionUIActive(false);
            _state = TransitionState.Idle;
            _currentProgress = 0f;
        }

        /// <summary>
        /// Cancel any active transition.
        /// </summary>
        public void CancelTransition()
        {
            if (_activeTransition != null)
            {
                StopCoroutine(_activeTransition);
                _activeTransition = null;
            }

            SetTransitionUIActive(false);
            _state = TransitionState.Idle;
            _currentProgress = 0f;
        }

        #endregion

        #region Transition Animation

        private IEnumerator AnimateTransition(TransitionType type, float from, float to, float duration)
        {
            SetTransitionUIActive(true);

            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = Mathf.Clamp01(elapsed / duration);
                float curvedT = transitionCurve.Evaluate(t);
                float value = Mathf.Lerp(from, to, curvedT);

                _currentProgress = value;
                SetTransitionProgress(value, type);
                OnTransitionProgress?.Invoke(this, value);

                yield return null;
            }

            _currentProgress = to;
            SetTransitionProgress(to, type);
            OnTransitionProgress?.Invoke(this, to);
        }

        private void SetTransitionProgress(float progress, TransitionType type)
        {
            if (_dynamicImage == null) return;

            switch (type)
            {
                case TransitionType.None:
                    _dynamicImage.color = new Color(0, 0, 0, 0);
                    break;

                case TransitionType.Fade:
                    _dynamicImage.color = new Color(fadeColor.r, fadeColor.g, fadeColor.b, progress);
                    break;

                case TransitionType.FadeWhite:
                    _dynamicImage.color = new Color(fadeWhiteColor.r, fadeWhiteColor.g, fadeWhiteColor.b, progress);
                    break;

                case TransitionType.WipeLeft:
                    SetWipeProgress(progress, Vector2.right);
                    break;

                case TransitionType.WipeRight:
                    SetWipeProgress(progress, Vector2.left);
                    break;

                case TransitionType.WipeDown:
                    SetWipeProgress(progress, Vector2.down);
                    break;

                case TransitionType.WipeUp:
                    SetWipeProgress(progress, Vector2.up);
                    break;

                case TransitionType.CircleWipe:
                    SetCircleWipeProgress(progress);
                    break;

                case TransitionType.DiamondWipe:
                    SetDiamondWipeProgress(progress);
                    break;

                case TransitionType.Pixelate:
                    SetPixelateProgress(progress);
                    break;

                case TransitionType.Crossfade:
                    _dynamicImage.color = new Color(fadeColor.r, fadeColor.g, fadeColor.b, progress);
                    break;
            }
        }

        private void SetWipeProgress(float progress, Vector2 direction)
        {
            if (_imageRect == null) return;

            // Use anchored position to slide the image
            Vector2 screenSize = new Vector2(Screen.width, Screen.height);
            Vector2 offset = direction * screenSize * (1f - progress);

            _imageRect.anchoredPosition = offset;
            _dynamicImage.color = fadeColor;
        }

        private void SetCircleWipeProgress(float progress)
        {
            // For circle wipe, we'd typically use a shader
            // Fallback to fade if no material is available
            if (wipeMaterial != null && wipeMaterial.HasProperty("_Progress"))
            {
                wipeMaterial.SetFloat("_Progress", progress);
                _dynamicImage.color = Color.white;
            }
            else
            {
                _dynamicImage.color = new Color(fadeColor.r, fadeColor.g, fadeColor.b, progress);
            }
        }

        private void SetDiamondWipeProgress(float progress)
        {
            // Similar to circle wipe, needs shader support
            if (wipeMaterial != null && wipeMaterial.HasProperty("_Progress"))
            {
                wipeMaterial.SetFloat("_Progress", progress);
                _dynamicImage.color = Color.white;
            }
            else
            {
                _dynamicImage.color = new Color(fadeColor.r, fadeColor.g, fadeColor.b, progress);
            }
        }

        private void SetPixelateProgress(float progress)
        {
            // Pixelate effect requires shader
            if (wipeMaterial != null && wipeMaterial.HasProperty("_PixelSize"))
            {
                float pixelSize = Mathf.Lerp(1f, 64f, progress);
                wipeMaterial.SetFloat("_PixelSize", pixelSize);
                _dynamicImage.color = Color.white;
            }
            else
            {
                _dynamicImage.color = new Color(fadeColor.r, fadeColor.g, fadeColor.b, progress);
            }
        }

        #endregion

        #region UI Setup

        private void EnsureTransitionUI()
        {
            // Use provided references if available
            if (transitionCanvas != null && transitionImage != null)
            {
                _dynamicCanvas = transitionCanvas;
                _dynamicImage = transitionImage;
                _imageRect = transitionImage.GetComponent<RectTransform>();
                return;
            }

            // Create dynamic UI if needed
            if (_dynamicCanvas == null)
            {
                CreateTransitionUI();
            }
        }

        private void CreateTransitionUI()
        {
            // Create canvas
            var canvasGO = new GameObject("TransitionCanvas");
            canvasGO.transform.SetParent(transform);

            _dynamicCanvas = canvasGO.AddComponent<Canvas>();
            _dynamicCanvas.renderMode = RenderMode.ScreenSpaceOverlay;
            _dynamicCanvas.sortingOrder = 9999; // Always on top

            var scaler = canvasGO.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920, 1080);

            canvasGO.AddComponent<GraphicRaycaster>();

            // Create image
            var imageGO = new GameObject("TransitionImage");
            imageGO.transform.SetParent(canvasGO.transform);

            _dynamicImage = imageGO.AddComponent<Image>();
            _dynamicImage.color = new Color(0, 0, 0, 0);

            _imageRect = _dynamicImage.GetComponent<RectTransform>();
            _imageRect.anchorMin = Vector2.zero;
            _imageRect.anchorMax = Vector2.one;
            _imageRect.sizeDelta = Vector2.zero;
            _imageRect.anchoredPosition = Vector2.zero;

            // Start hidden
            SetTransitionUIActive(false);

            DontDestroyOnLoad(canvasGO);
        }

        private void ConfigureForTransitionType(TransitionType type)
        {
            if (_dynamicImage == null) return;

            // Reset image rect position
            if (_imageRect != null)
            {
                _imageRect.anchoredPosition = Vector2.zero;
            }

            // Apply material if needed
            switch (type)
            {
                case TransitionType.CircleWipe:
                case TransitionType.DiamondWipe:
                case TransitionType.Pixelate:
                    if (wipeMaterial != null)
                    {
                        _dynamicImage.material = wipeMaterial;
                    }
                    break;

                default:
                    _dynamicImage.material = null;
                    break;
            }
        }

        private void SetTransitionUIActive(bool active)
        {
            if (_dynamicCanvas != null)
            {
                _dynamicCanvas.gameObject.SetActive(active);
            }
            else if (transitionCanvas != null)
            {
                transitionCanvas.gameObject.SetActive(active);
            }
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[SceneTransition] {message}");
            }
        }

        private void LogWarning(string message)
        {
            Debug.LogWarning($"[SceneTransition] {message}");
        }

        #endregion
    }
}
