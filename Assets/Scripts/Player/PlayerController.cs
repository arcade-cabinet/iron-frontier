// =============================================================================
// PlayerController.cs - Main Player Character Controller
// Iron Frontier - Unity 6
// =============================================================================

using System;
using UnityEngine;
using UnityEngine.AI;
using IronFrontier.Core;
using IronFrontier.Input;

namespace IronFrontier.Player
{
    /// <summary>
    /// Player character states for animation and behavior control.
    /// </summary>
    public enum PlayerState
    {
        Idle,
        Walking,
        Running,
        Interacting,
        InDialogue,
        InCombat,
        Dead
    }

    /// <summary>
    /// Event arguments for player state changes.
    /// </summary>
    public class PlayerStateChangedEventArgs : EventArgs
    {
        public PlayerState PreviousState { get; }
        public PlayerState NewState { get; }

        public PlayerStateChangedEventArgs(PlayerState previous, PlayerState newState)
        {
            PreviousState = previous;
            NewState = newState;
        }
    }

    /// <summary>
    /// Main player character controller handling movement, interaction, and state.
    /// Uses CharacterController for physics and responds to InputController events.
    /// </summary>
    /// <remarks>
    /// Designed for prefab setup with the following structure:
    /// - PlayerPrefab (root with this script, CharacterController)
    ///   - Model (child with mesh/skinned mesh)
    ///   - InteractionTrigger (child with trigger collider)
    /// </remarks>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        #region Singleton

        private static PlayerController _instance;

        /// <summary>
        /// Global singleton instance of PlayerController.
        /// </summary>
        public static PlayerController Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<PlayerController>();
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when player state changes.</summary>
        public event EventHandler<PlayerStateChangedEventArgs> OnStateChanged;

        /// <summary>Fired when player initiates interaction with an object.</summary>
        public event EventHandler<Collider> OnInteract;

        /// <summary>Fired when player enters an interaction range.</summary>
        public event EventHandler<Collider> OnEnterInteractionRange;

        /// <summary>Fired when player exits an interaction range.</summary>
        public event EventHandler<Collider> OnExitInteractionRange;

        /// <summary>Fired when player takes damage.</summary>
        public event EventHandler<int> OnDamageTaken;

        /// <summary>Fired when player dies.</summary>
        public event EventHandler OnDeath;

        #endregion

        #region Serialized Fields

        [Header("Movement")]
        [SerializeField]
        [Tooltip("Walking speed in units per second")]
        private float walkSpeed = 4f;

        [SerializeField]
        [Tooltip("Running speed in units per second")]
        private float runSpeed = 7f;

        [SerializeField]
        [Tooltip("Rotation speed in degrees per second")]
        private float rotationSpeed = 720f;

        [SerializeField]
        [Tooltip("Gravity applied to the player")]
        private float gravity = 20f;

        [SerializeField]
        [Tooltip("Acceleration for smooth movement")]
        private float acceleration = 15f;

        [Header("Interaction")]
        [SerializeField]
        [Tooltip("Layer mask for interactable objects")]
        private LayerMask interactionLayer;

        [SerializeField]
        [Tooltip("Maximum interaction distance")]
        private float interactionRange = 2.5f;

        [Header("Animation")]
        [SerializeField]
        [Tooltip("Reference to the Animator component")]
        private Animator animator;

        [SerializeField]
        [Tooltip("Animation parameter name for movement speed")]
        private string speedParameterName = "Speed";

        [SerializeField]
        [Tooltip("Animation parameter name for is grounded")]
        private string groundedParameterName = "IsGrounded";

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private CharacterController _characterController;
        private PlayerState _currentState = PlayerState.Idle;
        private Vector3 _velocity;
        private Vector3 _targetVelocity;
        private float _verticalVelocity;
        private bool _isRunning;
        private Collider _nearestInteractable;
        private readonly Collider[] _interactionBuffer = new Collider[10];

        #endregion

        #region Properties

        /// <summary>Current player state.</summary>
        public PlayerState CurrentState => _currentState;

        /// <summary>Current movement velocity.</summary>
        public Vector3 Velocity => _velocity;

        /// <summary>Whether the player is currently grounded.</summary>
        public bool IsGrounded => _characterController != null && _characterController.isGrounded;

        /// <summary>Whether the player is currently running.</summary>
        public bool IsRunning => _isRunning;

        /// <summary>Current movement speed.</summary>
        public float CurrentSpeed => _isRunning ? runSpeed : walkSpeed;

        /// <summary>The nearest interactable object within range.</summary>
        public Collider NearestInteractable => _nearestInteractable;

        /// <summary>Whether the player can currently move.</summary>
        public bool CanMove => _currentState != PlayerState.InDialogue &&
                               _currentState != PlayerState.InCombat &&
                               _currentState != PlayerState.Dead &&
                               _currentState != PlayerState.Interacting;

        /// <summary>Transform reference for external systems.</summary>
        public Transform Transform => transform;

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

            _characterController = GetComponent<CharacterController>();

            if (animator == null)
            {
                animator = GetComponentInChildren<Animator>();
            }

            Log("PlayerController initialized");
        }

        private void Start()
        {
            SubscribeToInput();
            SubscribeToGameEvents();
        }

        private void Update()
        {
            if (CanMove)
            {
                ProcessMovement();
            }

            ApplyGravity();
            CheckInteractables();
            UpdateAnimator();
        }

        private void OnDestroy()
        {
            UnsubscribeFromInput();
            UnsubscribeFromGameEvents();

            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Input Handling

        private void SubscribeToInput()
        {
            if (InputController.Instance != null)
            {
                InputController.Instance.OnMovement += HandleMovement;
                InputController.Instance.OnMovementStopped += HandleMovementStopped;
                InputController.Instance.OnInteract += HandleInteract;
            }
        }

        private void UnsubscribeFromInput()
        {
            if (InputController.Instance != null)
            {
                InputController.Instance.OnMovement -= HandleMovement;
                InputController.Instance.OnMovementStopped -= HandleMovementStopped;
                InputController.Instance.OnInteract -= HandleInteract;
            }
        }

        private void HandleMovement(object sender, MovementInputEventArgs args)
        {
            if (!CanMove) return;

            Vector3 inputDirection = new Vector3(args.Direction.x, 0f, args.Direction.y);

            // Transform input to world space relative to camera
            if (Camera.main != null)
            {
                Vector3 cameraForward = Camera.main.transform.forward;
                Vector3 cameraRight = Camera.main.transform.right;
                cameraForward.y = 0f;
                cameraRight.y = 0f;
                cameraForward.Normalize();
                cameraRight.Normalize();

                inputDirection = cameraForward * args.Direction.y + cameraRight * args.Direction.x;
            }

            float speed = _isRunning ? runSpeed : walkSpeed;
            _targetVelocity = inputDirection.normalized * speed;

            // Rotate towards movement direction
            if (inputDirection.magnitude > 0.1f)
            {
                Quaternion targetRotation = Quaternion.LookRotation(inputDirection);
                transform.rotation = Quaternion.RotateTowards(
                    transform.rotation,
                    targetRotation,
                    rotationSpeed * Time.deltaTime
                );
            }

            // Update state
            SetState(_isRunning ? PlayerState.Running : PlayerState.Walking);
        }

        private void HandleMovementStopped(object sender, EventArgs args)
        {
            _targetVelocity = Vector3.zero;

            if (_currentState == PlayerState.Walking || _currentState == PlayerState.Running)
            {
                SetState(PlayerState.Idle);
            }
        }

        private void HandleInteract(object sender, EventArgs args)
        {
            if (_nearestInteractable != null)
            {
                Log($"Interacting with: {_nearestInteractable.gameObject.name}");
                OnInteract?.Invoke(this, _nearestInteractable);
                EventBus.Instance?.Publish("player_interact", _nearestInteractable.gameObject.name);
            }
        }

        /// <summary>
        /// Toggle run mode on/off.
        /// </summary>
        public void ToggleRun()
        {
            _isRunning = !_isRunning;
        }

        /// <summary>
        /// Set run mode explicitly.
        /// </summary>
        public void SetRunning(bool running)
        {
            _isRunning = running;
        }

        #endregion

        #region Movement

        private void ProcessMovement()
        {
            // Smooth acceleration
            _velocity = Vector3.MoveTowards(
                _velocity,
                _targetVelocity,
                acceleration * Time.deltaTime
            );

            // Apply horizontal movement
            Vector3 move = _velocity * Time.deltaTime;
            move.y = _verticalVelocity * Time.deltaTime;

            _characterController.Move(move);
        }

        private void ApplyGravity()
        {
            if (IsGrounded && _verticalVelocity < 0)
            {
                _verticalVelocity = -2f; // Small downward force to keep grounded
            }
            else
            {
                _verticalVelocity -= gravity * Time.deltaTime;
            }
        }

        /// <summary>
        /// Teleport the player to a specific position.
        /// </summary>
        public void TeleportTo(Vector3 position)
        {
            _characterController.enabled = false;
            transform.position = position;
            _characterController.enabled = true;

            _velocity = Vector3.zero;
            _targetVelocity = Vector3.zero;

            Log($"Teleported to {position}");
        }

        /// <summary>
        /// Teleport the player to a specific position and rotation.
        /// </summary>
        public void TeleportTo(Vector3 position, Quaternion rotation)
        {
            TeleportTo(position);
            transform.rotation = rotation;
        }

        #endregion

        #region Interaction

        private void CheckInteractables()
        {
            Collider previousNearest = _nearestInteractable;
            _nearestInteractable = null;
            float nearestDistance = float.MaxValue;

            int count = Physics.OverlapSphereNonAlloc(
                transform.position,
                interactionRange,
                _interactionBuffer,
                interactionLayer
            );

            for (int i = 0; i < count; i++)
            {
                Collider col = _interactionBuffer[i];
                if (col.gameObject == gameObject) continue;

                float distance = Vector3.Distance(transform.position, col.transform.position);
                if (distance < nearestDistance)
                {
                    nearestDistance = distance;
                    _nearestInteractable = col;
                }
            }

            // Fire events for entering/exiting interaction range
            if (_nearestInteractable != previousNearest)
            {
                if (previousNearest != null)
                {
                    OnExitInteractionRange?.Invoke(this, previousNearest);
                }

                if (_nearestInteractable != null)
                {
                    OnEnterInteractionRange?.Invoke(this, _nearestInteractable);
                }
            }
        }

        #endregion

        #region State Management

        private void SetState(PlayerState newState)
        {
            if (newState == _currentState) return;

            PlayerState previousState = _currentState;
            _currentState = newState;

            Log($"State changed: {previousState} -> {newState}");

            OnStateChanged?.Invoke(this, new PlayerStateChangedEventArgs(previousState, newState));
            EventBus.Instance?.Publish("player_state_changed", newState.ToString());
        }

        /// <summary>
        /// Force a specific player state (for external systems).
        /// </summary>
        public void ForceState(PlayerState state)
        {
            SetState(state);
        }

        /// <summary>
        /// Enter dialogue mode (disables movement).
        /// </summary>
        public void EnterDialogue()
        {
            SetState(PlayerState.InDialogue);
            _velocity = Vector3.zero;
            _targetVelocity = Vector3.zero;
        }

        /// <summary>
        /// Exit dialogue mode (re-enables movement).
        /// </summary>
        public void ExitDialogue()
        {
            SetState(PlayerState.Idle);
        }

        /// <summary>
        /// Enter combat mode.
        /// </summary>
        public void EnterCombat()
        {
            SetState(PlayerState.InCombat);
            _velocity = Vector3.zero;
            _targetVelocity = Vector3.zero;
        }

        /// <summary>
        /// Exit combat mode.
        /// </summary>
        public void ExitCombat()
        {
            SetState(PlayerState.Idle);
        }

        #endregion

        #region Game Events

        private void SubscribeToGameEvents()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnPhaseChanged += HandlePhaseChanged;
            }
        }

        private void UnsubscribeFromGameEvents()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnPhaseChanged -= HandlePhaseChanged;
            }
        }

        private void HandlePhaseChanged(object sender, GamePhaseChangedEventArgs args)
        {
            switch (args.ToPhase)
            {
                case GamePhase.Dialogue:
                    EnterDialogue();
                    break;

                case GamePhase.Combat:
                    EnterCombat();
                    break;

                case GamePhase.Overworld:
                case GamePhase.Town:
                    if (_currentState == PlayerState.InDialogue ||
                        _currentState == PlayerState.InCombat)
                    {
                        SetState(PlayerState.Idle);
                    }
                    break;
            }
        }

        #endregion

        #region Animation

        private void UpdateAnimator()
        {
            if (animator == null) return;

            float speed = new Vector3(_velocity.x, 0f, _velocity.z).magnitude;
            animator.SetFloat(speedParameterName, speed);
            animator.SetBool(groundedParameterName, IsGrounded);
        }

        /// <summary>
        /// Trigger an animation by name.
        /// </summary>
        public void TriggerAnimation(string triggerName)
        {
            animator?.SetTrigger(triggerName);
        }

        #endregion

        #region Combat Integration

        /// <summary>
        /// Apply damage to the player.
        /// </summary>
        public void TakeDamage(int amount)
        {
            OnDamageTaken?.Invoke(this, amount);
            EventBus.Instance?.Publish("player_damage", amount.ToString());

            Log($"Player took {amount} damage");
        }

        /// <summary>
        /// Handle player death.
        /// </summary>
        public void Die()
        {
            SetState(PlayerState.Dead);
            _velocity = Vector3.zero;
            _targetVelocity = Vector3.zero;

            OnDeath?.Invoke(this, EventArgs.Empty);
            EventBus.Instance?.Publish("player_death", string.Empty);

            Log("Player died");
        }

        #endregion

        #region Debug

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[PlayerController] {message}");
            }
        }

        private void OnDrawGizmosSelected()
        {
            // Draw interaction range
            Gizmos.color = new Color(0f, 1f, 0f, 0.3f);
            Gizmos.DrawWireSphere(transform.position, interactionRange);

            // Draw nearest interactable connection
            if (_nearestInteractable != null)
            {
                Gizmos.color = Color.green;
                Gizmos.DrawLine(transform.position, _nearestInteractable.transform.position);
            }
        }

        #endregion
    }
}
