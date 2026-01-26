// =============================================================================
// PlayerCamera.cs - Cinemachine Camera Controller
// Iron Frontier - Unity 6
// =============================================================================

using System;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Input;

#if UNITY_6000_OR_NEWER
using Unity.Cinemachine;
#else
using Cinemachine;
#endif

namespace IronFrontier.Player
{
    /// <summary>
    /// Camera modes for different gameplay contexts.
    /// </summary>
    public enum CameraMode
    {
        /// <summary>Standard third-person follow camera.</summary>
        ThirdPerson,
        /// <summary>Combat-focused camera with wider view.</summary>
        Combat,
        /// <summary>Close-up camera for dialogue scenes.</summary>
        Dialogue,
        /// <summary>Free-look camera for exploration.</summary>
        FreeLook,
        /// <summary>Overhead view for tactical situations.</summary>
        Overhead,
        /// <summary>Locked camera for cutscenes.</summary>
        Cutscene
    }

    /// <summary>
    /// Event arguments for camera mode changes.
    /// </summary>
    public class CameraModeChangedEventArgs : EventArgs
    {
        public CameraMode FromMode { get; }
        public CameraMode ToMode { get; }

        public CameraModeChangedEventArgs(CameraMode from, CameraMode to)
        {
            FromMode = from;
            ToMode = to;
        }
    }

    /// <summary>
    /// Cinemachine-based camera controller for third-person gameplay.
    /// Supports multiple camera modes for different gameplay contexts.
    /// </summary>
    /// <remarks>
    /// Uses Cinemachine for smooth camera behavior and transitions.
    /// Integrates with Unity 6 Input System for zoom and rotation controls.
    /// </remarks>
    public class PlayerCamera : MonoBehaviour
    {
        #region Singleton

        private static PlayerCamera _instance;

        /// <summary>
        /// Global singleton instance.
        /// </summary>
        public static PlayerCamera Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<PlayerCamera>();
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when camera mode changes.</summary>
        public event EventHandler<CameraModeChangedEventArgs> OnCameraModeChanged;

        /// <summary>Fired when zoom level changes.</summary>
        public event EventHandler<float> OnZoomChanged;

        #endregion

        #region Serialized Fields

        [Header("Target")]
        [SerializeField]
        [Tooltip("Transform to follow (usually player)")]
        private Transform followTarget;

        [SerializeField]
        [Tooltip("Transform to look at (usually player + offset)")]
        private Transform lookAtTarget;

        [Header("Cinemachine Cameras")]
        [SerializeField]
        [Tooltip("Main third-person virtual camera")]
        private CinemachineCamera thirdPersonCamera;

        [SerializeField]
        [Tooltip("Combat mode virtual camera")]
        private CinemachineCamera combatCamera;

        [SerializeField]
        [Tooltip("Dialogue mode virtual camera")]
        private CinemachineCamera dialogueCamera;

        [SerializeField]
        [Tooltip("Overhead view virtual camera")]
        private CinemachineCamera overheadCamera;

        [Header("Third-Person Settings")]
        [SerializeField]
        [Tooltip("Default camera distance")]
        private float defaultDistance = 8f;

        [SerializeField]
        [Tooltip("Minimum zoom distance")]
        private float minDistance = 3f;

        [SerializeField]
        [Tooltip("Maximum zoom distance")]
        private float maxDistance = 15f;

        [SerializeField]
        [Tooltip("Default camera height offset")]
        private float heightOffset = 2f;

        [SerializeField]
        [Tooltip("Horizontal rotation speed")]
        private float rotationSpeed = 180f;

        [SerializeField]
        [Tooltip("Vertical rotation speed")]
        private float verticalSpeed = 90f;

        [SerializeField]
        [Tooltip("Zoom speed")]
        private float zoomSpeed = 5f;

        [SerializeField]
        [Tooltip("Zoom smoothing")]
        private float zoomSmoothTime = 0.15f;

        [Header("Vertical Limits")]
        [SerializeField]
        [Tooltip("Minimum vertical angle")]
        private float minVerticalAngle = -30f;

        [SerializeField]
        [Tooltip("Maximum vertical angle")]
        private float maxVerticalAngle = 60f;

        [Header("Combat Camera")]
        [SerializeField]
        [Tooltip("Combat camera distance")]
        private float combatDistance = 10f;

        [SerializeField]
        [Tooltip("Combat camera height")]
        private float combatHeight = 4f;

        [Header("Dialogue Camera")]
        [SerializeField]
        [Tooltip("Dialogue camera distance")]
        private float dialogueDistance = 3f;

        [SerializeField]
        [Tooltip("Dialogue camera height offset")]
        private float dialogueHeight = 1.5f;

        [Header("Transitions")]
        [SerializeField]
        [Tooltip("Camera transition blend time")]
        private float blendTime = 0.5f;

        [Header("Collision")]
        [SerializeField]
        [Tooltip("Enable camera collision avoidance")]
        private bool enableCollision = true;

        [SerializeField]
        [Tooltip("Collision detection layer mask")]
        private LayerMask collisionLayerMask = ~0;

        [SerializeField]
        [Tooltip("Minimum distance from obstacles")]
        private float collisionPadding = 0.3f;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // State
        private CameraMode _currentMode = CameraMode.ThirdPerson;
        private float _currentDistance;
        private float _targetDistance;
        private float _zoomVelocity;
        private float _horizontalAngle;
        private float _verticalAngle;

        // Components
        private CinemachineBrain _brain;
        private CinemachineFollow _thirdPersonFollow;
        private CinemachineRotationComposer _rotationComposer;

        // Input
        private Vector2 _lookInput;
        private float _zoomInput;
        private bool _isRotating;

        // Dialogue target
        private Transform _dialogueFocusTarget;

        #endregion

        #region Properties

        /// <summary>Current camera mode.</summary>
        public CameraMode CurrentMode => _currentMode;

        /// <summary>Current zoom distance.</summary>
        public float CurrentDistance => _currentDistance;

        /// <summary>Normalized zoom level (0 = min, 1 = max).</summary>
        public float ZoomLevel => Mathf.InverseLerp(minDistance, maxDistance, _currentDistance);

        /// <summary>Current horizontal rotation angle.</summary>
        public float HorizontalAngle => _horizontalAngle;

        /// <summary>Current vertical rotation angle.</summary>
        public float VerticalAngle => _verticalAngle;

        /// <summary>Main camera reference.</summary>
        public Camera MainCamera => Camera.main;

        /// <summary>Follow target transform.</summary>
        public Transform FollowTarget => followTarget;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;

            // Find Cinemachine brain
            _brain = Camera.main?.GetComponent<CinemachineBrain>();

            InitializeCameras();
        }

        private void Start()
        {
            // Initialize distance
            _currentDistance = defaultDistance;
            _targetDistance = defaultDistance;

            // Initialize angles from current rotation
            _horizontalAngle = transform.eulerAngles.y;
            _verticalAngle = 20f;

            // Subscribe to game phase changes
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnPhaseChanged += HandlePhaseChanged;
            }

            // Auto-find player if not set
            if (followTarget == null)
            {
                var player = PlayerController.Instance;
                if (player != null)
                {
                    SetFollowTarget(player.transform);
                }
            }

            SetMode(CameraMode.ThirdPerson);
            Log("PlayerCamera initialized");
        }

        private void Update()
        {
            ProcessInput();
            UpdateZoom();
            UpdateRotation();
            UpdateCameraPosition();
        }

        private void LateUpdate()
        {
            // Handle camera collision
            if (enableCollision && _currentMode == CameraMode.ThirdPerson)
            {
                HandleCollision();
            }
        }

        private void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnPhaseChanged -= HandlePhaseChanged;
            }

            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Initialization

        private void InitializeCameras()
        {
            // Configure third-person camera
            if (thirdPersonCamera != null)
            {
                _thirdPersonFollow = thirdPersonCamera.GetComponent<CinemachineFollow>();
                _rotationComposer = thirdPersonCamera.GetComponent<CinemachineRotationComposer>();

                thirdPersonCamera.Priority = 10;
            }

            // Configure other cameras with lower priority
            if (combatCamera != null)
            {
                combatCamera.Priority = 0;
            }

            if (dialogueCamera != null)
            {
                dialogueCamera.Priority = 0;
            }

            if (overheadCamera != null)
            {
                overheadCamera.Priority = 0;
            }
        }

        #endregion

        #region Input Processing

        private void ProcessInput()
        {
            // Get mouse/gamepad look input
            if (UnityEngine.InputSystem.Mouse.current != null)
            {
                var mouse = UnityEngine.InputSystem.Mouse.current;

                // Only rotate when right mouse button is held
                _isRotating = mouse.rightButton.isPressed;

                if (_isRotating)
                {
                    _lookInput = mouse.delta.ReadValue() * 0.1f;
                }

                // Scroll wheel for zoom
                _zoomInput = -mouse.scroll.ReadValue().y * 0.01f;
            }

            // Gamepad look input
            if (UnityEngine.InputSystem.Gamepad.current != null)
            {
                var gamepad = UnityEngine.InputSystem.Gamepad.current;
                _lookInput = gamepad.rightStick.ReadValue();
                _isRotating = _lookInput.sqrMagnitude > 0.01f;

                // Shoulder buttons for zoom
                if (gamepad.leftShoulder.isPressed)
                {
                    _zoomInput = 1f * Time.deltaTime * 5f;
                }
                else if (gamepad.rightShoulder.isPressed)
                {
                    _zoomInput = -1f * Time.deltaTime * 5f;
                }
            }
        }

        #endregion

        #region Camera Updates

        private void UpdateZoom()
        {
            if (Mathf.Abs(_zoomInput) > 0.01f)
            {
                _targetDistance = Mathf.Clamp(_targetDistance + _zoomInput * zoomSpeed, minDistance, maxDistance);
            }

            // Smooth zoom
            _currentDistance = Mathf.SmoothDamp(_currentDistance, _targetDistance, ref _zoomVelocity, zoomSmoothTime);

            // Update Cinemachine camera distance
            if (_thirdPersonFollow != null)
            {
                _thirdPersonFollow.FollowOffset = new Vector3(0f, heightOffset, -_currentDistance);
            }

            // Notify if significant change
            if (Mathf.Abs(_zoomInput) > 0.01f)
            {
                OnZoomChanged?.Invoke(this, ZoomLevel);
            }

            _zoomInput = 0f;
        }

        private void UpdateRotation()
        {
            if (!_isRotating || _currentMode == CameraMode.Cutscene)
            {
                return;
            }

            // Horizontal rotation
            _horizontalAngle += _lookInput.x * rotationSpeed * Time.deltaTime;
            _horizontalAngle = Mathf.Repeat(_horizontalAngle, 360f);

            // Vertical rotation with limits
            _verticalAngle -= _lookInput.y * verticalSpeed * Time.deltaTime;
            _verticalAngle = Mathf.Clamp(_verticalAngle, minVerticalAngle, maxVerticalAngle);
        }

        private void UpdateCameraPosition()
        {
            if (followTarget == null || _currentMode == CameraMode.Cutscene)
            {
                return;
            }

            // Calculate camera position for manual override (if not using Cinemachine)
            if (thirdPersonCamera == null)
            {
                // Fallback manual positioning
                Quaternion rotation = Quaternion.Euler(_verticalAngle, _horizontalAngle, 0f);
                Vector3 offset = rotation * new Vector3(0f, 0f, -_currentDistance);
                Vector3 targetPosition = followTarget.position + Vector3.up * heightOffset + offset;

                transform.position = targetPosition;
                transform.LookAt(followTarget.position + Vector3.up * heightOffset);
            }
        }

        private void HandleCollision()
        {
            if (followTarget == null)
            {
                return;
            }

            Vector3 targetPos = followTarget.position + Vector3.up * heightOffset;
            Vector3 direction = (transform.position - targetPos).normalized;
            float desiredDistance = _currentDistance;

            // Raycast from target to camera
            if (Physics.Raycast(targetPos, direction, out RaycastHit hit, _currentDistance + collisionPadding, collisionLayerMask))
            {
                desiredDistance = hit.distance - collisionPadding;
                desiredDistance = Mathf.Max(minDistance * 0.5f, desiredDistance);

                // Apply collision adjustment
                if (_thirdPersonFollow != null)
                {
                    _thirdPersonFollow.FollowOffset = new Vector3(0f, heightOffset, -desiredDistance);
                }
            }
        }

        #endregion

        #region Mode Management

        /// <summary>
        /// Set the camera mode.
        /// </summary>
        /// <param name="mode">Mode to set.</param>
        public void SetMode(CameraMode mode)
        {
            if (mode == _currentMode)
            {
                return;
            }

            var previousMode = _currentMode;
            _currentMode = mode;

            ApplyCameraMode(mode);

            Log($"Camera mode changed: {previousMode} -> {mode}");
            OnCameraModeChanged?.Invoke(this, new CameraModeChangedEventArgs(previousMode, mode));
        }

        private void ApplyCameraMode(CameraMode mode)
        {
            // Reset all priorities
            SetCameraPriority(thirdPersonCamera, 0);
            SetCameraPriority(combatCamera, 0);
            SetCameraPriority(dialogueCamera, 0);
            SetCameraPriority(overheadCamera, 0);

            switch (mode)
            {
                case CameraMode.ThirdPerson:
                    SetCameraPriority(thirdPersonCamera, 10);
                    _targetDistance = defaultDistance;
                    break;

                case CameraMode.Combat:
                    if (combatCamera != null)
                    {
                        SetCameraPriority(combatCamera, 10);
                    }
                    else
                    {
                        SetCameraPriority(thirdPersonCamera, 10);
                        _targetDistance = combatDistance;
                    }
                    break;

                case CameraMode.Dialogue:
                    if (dialogueCamera != null)
                    {
                        SetCameraPriority(dialogueCamera, 10);
                        ConfigureDialogueCamera();
                    }
                    else
                    {
                        SetCameraPriority(thirdPersonCamera, 10);
                        _targetDistance = dialogueDistance;
                    }
                    break;

                case CameraMode.Overhead:
                    if (overheadCamera != null)
                    {
                        SetCameraPriority(overheadCamera, 10);
                    }
                    else
                    {
                        SetCameraPriority(thirdPersonCamera, 10);
                        _verticalAngle = maxVerticalAngle;
                        _targetDistance = maxDistance;
                    }
                    break;

                case CameraMode.FreeLook:
                    SetCameraPriority(thirdPersonCamera, 10);
                    break;

                case CameraMode.Cutscene:
                    // Cutscene camera handled externally
                    break;
            }
        }

        private void SetCameraPriority(CinemachineCamera cam, int priority)
        {
            if (cam != null)
            {
                cam.Priority = priority;
            }
        }

        private void ConfigureDialogueCamera()
        {
            if (dialogueCamera == null || followTarget == null)
            {
                return;
            }

            // Position dialogue camera
            var follow = dialogueCamera.GetComponent<CinemachineFollow>();
            if (follow != null)
            {
                follow.FollowOffset = new Vector3(1.5f, dialogueHeight, -dialogueDistance);
            }

            // If we have a dialogue focus target, look at midpoint
            if (_dialogueFocusTarget != null)
            {
                Vector3 midpoint = (followTarget.position + _dialogueFocusTarget.position) * 0.5f + Vector3.up * 1.5f;
                dialogueCamera.LookAt = null; // Custom look handled by position
            }
        }

        private void HandlePhaseChanged(object sender, GamePhaseChangedEventArgs e)
        {
            switch (e.ToPhase)
            {
                case GamePhase.Combat:
                    SetMode(CameraMode.Combat);
                    break;

                case GamePhase.Dialogue:
                    SetMode(CameraMode.Dialogue);
                    break;

                case GamePhase.Overworld:
                case GamePhase.Town:
                    SetMode(CameraMode.ThirdPerson);
                    break;
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Set the follow target.
        /// </summary>
        /// <param name="target">Transform to follow.</param>
        public void SetFollowTarget(Transform target)
        {
            followTarget = target;
            lookAtTarget = target;

            // Update Cinemachine cameras
            if (thirdPersonCamera != null)
            {
                thirdPersonCamera.Follow = target;
                thirdPersonCamera.LookAt = target;
            }

            if (combatCamera != null)
            {
                combatCamera.Follow = target;
                combatCamera.LookAt = target;
            }

            if (dialogueCamera != null)
            {
                dialogueCamera.Follow = target;
            }

            if (overheadCamera != null)
            {
                overheadCamera.Follow = target;
                overheadCamera.LookAt = target;
            }

            Log($"Follow target set: {target?.name}");
        }

        /// <summary>
        /// Set dialogue focus target (NPC being spoken to).
        /// </summary>
        /// <param name="target">NPC transform.</param>
        public void SetDialogueFocusTarget(Transform target)
        {
            _dialogueFocusTarget = target;

            if (_currentMode == CameraMode.Dialogue)
            {
                ConfigureDialogueCamera();
            }
        }

        /// <summary>
        /// Clear dialogue focus target.
        /// </summary>
        public void ClearDialogueFocusTarget()
        {
            _dialogueFocusTarget = null;
        }

        /// <summary>
        /// Zoom to a specific distance.
        /// </summary>
        /// <param name="distance">Target distance.</param>
        public void SetZoomDistance(float distance)
        {
            _targetDistance = Mathf.Clamp(distance, minDistance, maxDistance);
        }

        /// <summary>
        /// Set zoom by normalized level (0-1).
        /// </summary>
        /// <param name="level">Zoom level (0 = close, 1 = far).</param>
        public void SetZoomLevel(float level)
        {
            _targetDistance = Mathf.Lerp(minDistance, maxDistance, level);
        }

        /// <summary>
        /// Set camera rotation angles.
        /// </summary>
        /// <param name="horizontal">Horizontal angle in degrees.</param>
        /// <param name="vertical">Vertical angle in degrees.</param>
        public void SetRotation(float horizontal, float vertical)
        {
            _horizontalAngle = horizontal;
            _verticalAngle = Mathf.Clamp(vertical, minVerticalAngle, maxVerticalAngle);
        }

        /// <summary>
        /// Rotate to look at a world position.
        /// </summary>
        /// <param name="worldPosition">Position to look at.</param>
        public void LookAt(Vector3 worldPosition)
        {
            if (followTarget == null)
            {
                return;
            }

            Vector3 direction = worldPosition - followTarget.position;
            direction.y = 0f;

            if (direction.sqrMagnitude > 0.01f)
            {
                _horizontalAngle = Quaternion.LookRotation(direction).eulerAngles.y;
            }
        }

        /// <summary>
        /// Shake the camera.
        /// </summary>
        /// <param name="intensity">Shake intensity.</param>
        /// <param name="duration">Shake duration.</param>
        public void Shake(float intensity, float duration)
        {
            // Use Cinemachine impulse if available
            var impulse = thirdPersonCamera?.GetComponent<CinemachineImpulseSource>();
            if (impulse != null)
            {
                impulse.GenerateImpulse(intensity);
            }
            else
            {
                // Fallback: could use coroutine for manual shake
                Log($"Camera shake: intensity={intensity}, duration={duration}");
            }
        }

        /// <summary>
        /// Get world point from screen point.
        /// </summary>
        /// <param name="screenPoint">Screen coordinates.</param>
        /// <returns>World position on ground plane.</returns>
        public Vector3 ScreenToWorldPoint(Vector2 screenPoint)
        {
            if (MainCamera == null)
            {
                return Vector3.zero;
            }

            Ray ray = MainCamera.ScreenPointToRay(screenPoint);
            Plane groundPlane = new Plane(Vector3.up, Vector3.zero);

            if (groundPlane.Raycast(ray, out float distance))
            {
                return ray.GetPoint(distance);
            }

            return ray.GetPoint(10f);
        }

        /// <summary>
        /// Check if a world point is visible on screen.
        /// </summary>
        /// <param name="worldPoint">World position to check.</param>
        /// <returns>True if visible.</returns>
        public bool IsPointVisible(Vector3 worldPoint)
        {
            if (MainCamera == null)
            {
                return false;
            }

            Vector3 viewportPoint = MainCamera.WorldToViewportPoint(worldPoint);
            return viewportPoint.z > 0f &&
                   viewportPoint.x >= 0f && viewportPoint.x <= 1f &&
                   viewportPoint.y >= 0f && viewportPoint.y <= 1f;
        }

        #endregion

        #region Gizmos

        private void OnDrawGizmosSelected()
        {
            if (followTarget != null)
            {
                // Draw camera target
                Gizmos.color = Color.cyan;
                Gizmos.DrawWireSphere(followTarget.position + Vector3.up * heightOffset, 0.3f);

                // Draw distance range
                Gizmos.color = new Color(0f, 1f, 1f, 0.2f);
                Gizmos.DrawWireSphere(followTarget.position, minDistance);
                Gizmos.DrawWireSphere(followTarget.position, maxDistance);
            }
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[PlayerCamera] {message}");
            }
        }

        #endregion
    }
}
