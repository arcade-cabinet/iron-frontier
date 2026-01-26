// =============================================================================
// PlayerInput.cs - Unity 6 Input System Integration
// Iron Frontier - Unity 6
// =============================================================================

using System;
using UnityEngine;
using UnityEngine.InputSystem;
using IronFrontier.Core;

namespace IronFrontier.Player
{
    /// <summary>
    /// Input action map names for context switching.
    /// </summary>
    public static class InputActionMaps
    {
        public const string Gameplay = "Gameplay";
        public const string UI = "UI";
        public const string Combat = "Combat";
        public const string Dialogue = "Dialogue";
        public const string Vehicle = "Vehicle";
    }

    /// <summary>
    /// Event data for player input events.
    /// </summary>
    public class PlayerInputEventArgs : EventArgs
    {
        /// <summary>Action that triggered the event.</summary>
        public string ActionName { get; }

        /// <summary>Whether this is a press (started) or release (canceled).</summary>
        public bool IsPressed { get; }

        /// <summary>Input device type.</summary>
        public string DeviceType { get; }

        /// <summary>Timestamp of the input.</summary>
        public float Timestamp { get; }

        public PlayerInputEventArgs(string actionName, bool isPressed, string deviceType)
        {
            ActionName = actionName;
            IsPressed = isPressed;
            DeviceType = deviceType;
            Timestamp = Time.time;
        }
    }

    /// <summary>
    /// Player input handler using Unity 6 Input System.
    /// Manages input action maps, context switching, and device detection.
    /// </summary>
    /// <remarks>
    /// Works alongside InputController for centralized input management.
    /// Provides player-specific input processing with support for:
    /// - Movement input (WASD, gamepad)
    /// - Action buttons (interact, attack, dodge)
    /// - UI navigation (menu, inventory)
    /// - Context-based input map switching
    /// </remarks>
    [RequireComponent(typeof(UnityEngine.InputSystem.PlayerInput))]
    public class PlayerInput : MonoBehaviour
    {
        #region Events

        /// <summary>Fired when movement input changes.</summary>
        public event EventHandler<Vector2> OnMoveInput;

        /// <summary>Fired when look/camera input changes.</summary>
        public event EventHandler<Vector2> OnLookInput;

        /// <summary>Fired when any action is triggered.</summary>
        public event EventHandler<PlayerInputEventArgs> OnActionTriggered;

        /// <summary>Fired when interact action is pressed.</summary>
        public event EventHandler OnInteractPressed;

        /// <summary>Fired when attack/primary action is pressed.</summary>
        public event EventHandler OnAttackPressed;

        /// <summary>Fired when dodge/secondary action is pressed.</summary>
        public event EventHandler OnDodgePressed;

        /// <summary>Fired when sprint state changes.</summary>
        public event EventHandler<bool> OnSprintStateChanged;

        /// <summary>Fired when menu/pause is pressed.</summary>
        public event EventHandler OnMenuPressed;

        /// <summary>Fired when inventory is pressed.</summary>
        public event EventHandler OnInventoryPressed;

        /// <summary>Fired when quick slot is pressed.</summary>
        public event EventHandler<int> OnQuickSlotPressed;

        /// <summary>Fired when input device changes.</summary>
        public event EventHandler<string> OnDeviceChanged;

        /// <summary>Fired when action map changes.</summary>
        public event EventHandler<string> OnActionMapChanged;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Default action map to use")]
        private string defaultActionMap = InputActionMaps.Gameplay;

        [SerializeField]
        [Tooltip("Enable sprint toggle (vs hold)")]
        private bool sprintToggle = false;

        [SerializeField]
        [Tooltip("Enable aim toggle (vs hold)")]
        private bool aimToggle = false;

        [SerializeField]
        [Tooltip("Input deadzone")]
        [Range(0.05f, 0.3f)]
        private float deadzone = 0.15f;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // Components
        private UnityEngine.InputSystem.PlayerInput _playerInput;
        private InputActionMap _currentActionMap;

        // Input state
        private Vector2 _moveInput;
        private Vector2 _lookInput;
        private bool _isSprinting;
        private bool _isAiming;
        private string _currentDeviceType;
        private string _activeMapName;

        // Input Actions
        private InputAction _moveAction;
        private InputAction _lookAction;
        private InputAction _interactAction;
        private InputAction _attackAction;
        private InputAction _dodgeAction;
        private InputAction _sprintAction;
        private InputAction _menuAction;
        private InputAction _inventoryAction;
        private InputAction _aimAction;
        private InputAction[] _quickSlotActions;

        #endregion

        #region Properties

        /// <summary>Current movement input.</summary>
        public Vector2 MoveInput => _moveInput;

        /// <summary>Current look/camera input.</summary>
        public Vector2 LookInput => _lookInput;

        /// <summary>Whether sprint is active.</summary>
        public bool IsSprinting => _isSprinting;

        /// <summary>Whether aim is active.</summary>
        public bool IsAiming => _isAiming;

        /// <summary>Current input device type.</summary>
        public string CurrentDeviceType => _currentDeviceType;

        /// <summary>Whether using keyboard/mouse.</summary>
        public bool IsUsingKeyboardMouse => _currentDeviceType == "Keyboard" || _currentDeviceType == "Mouse";

        /// <summary>Whether using gamepad.</summary>
        public bool IsUsingGamepad => _currentDeviceType == "Gamepad";

        /// <summary>Current action map name.</summary>
        public string CurrentActionMapName => _activeMapName;

        /// <summary>Whether input is enabled.</summary>
        public bool InputEnabled => _playerInput != null && _playerInput.inputIsActive;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            _playerInput = GetComponent<UnityEngine.InputSystem.PlayerInput>();
            CacheInputActions();
        }

        private void Start()
        {
            // Subscribe to device change events
            if (_playerInput != null)
            {
                _playerInput.onControlsChanged += HandleControlsChanged;
            }

            // Subscribe to game phase changes
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnPhaseChanged += HandlePhaseChanged;
            }

            // Set default action map
            SwitchActionMap(defaultActionMap);

            // Initialize device type
            UpdateDeviceType();

            Log("PlayerInput initialized");
        }

        private void Update()
        {
            ProcessContinuousInput();
        }

        private void OnDestroy()
        {
            if (_playerInput != null)
            {
                _playerInput.onControlsChanged -= HandleControlsChanged;
            }

            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnPhaseChanged -= HandlePhaseChanged;
            }

            UnsubscribeFromActions();
        }

        private void OnEnable()
        {
            SubscribeToActions();
        }

        private void OnDisable()
        {
            UnsubscribeFromActions();
        }

        #endregion

        #region Input Action Setup

        private void CacheInputActions()
        {
            if (_playerInput == null) return;

            var actions = _playerInput.actions;
            if (actions == null) return;

            // Cache gameplay actions
            _moveAction = actions.FindAction("Move");
            _lookAction = actions.FindAction("Look");
            _interactAction = actions.FindAction("Interact");
            _attackAction = actions.FindAction("Attack") ?? actions.FindAction("Fire");
            _dodgeAction = actions.FindAction("Dodge") ?? actions.FindAction("Roll");
            _sprintAction = actions.FindAction("Sprint") ?? actions.FindAction("Run");
            _menuAction = actions.FindAction("Menu") ?? actions.FindAction("Pause");
            _inventoryAction = actions.FindAction("Inventory");
            _aimAction = actions.FindAction("Aim");

            // Cache quick slot actions
            _quickSlotActions = new InputAction[10];
            for (int i = 0; i < 10; i++)
            {
                _quickSlotActions[i] = actions.FindAction($"QuickSlot{i}");
            }

            Log("Input actions cached");
        }

        private void SubscribeToActions()
        {
            // Interact
            if (_interactAction != null)
            {
                _interactAction.performed += HandleInteract;
            }

            // Attack
            if (_attackAction != null)
            {
                _attackAction.performed += HandleAttack;
            }

            // Dodge
            if (_dodgeAction != null)
            {
                _dodgeAction.performed += HandleDodge;
            }

            // Sprint
            if (_sprintAction != null)
            {
                _sprintAction.started += HandleSprintStarted;
                _sprintAction.canceled += HandleSprintCanceled;
            }

            // Menu
            if (_menuAction != null)
            {
                _menuAction.performed += HandleMenu;
            }

            // Inventory
            if (_inventoryAction != null)
            {
                _inventoryAction.performed += HandleInventory;
            }

            // Aim
            if (_aimAction != null)
            {
                _aimAction.started += HandleAimStarted;
                _aimAction.canceled += HandleAimCanceled;
            }

            // Quick slots
            for (int i = 0; i < _quickSlotActions.Length; i++)
            {
                if (_quickSlotActions[i] != null)
                {
                    int slotIndex = i;
                    _quickSlotActions[i].performed += ctx => HandleQuickSlot(slotIndex);
                }
            }
        }

        private void UnsubscribeFromActions()
        {
            if (_interactAction != null)
                _interactAction.performed -= HandleInteract;

            if (_attackAction != null)
                _attackAction.performed -= HandleAttack;

            if (_dodgeAction != null)
                _dodgeAction.performed -= HandleDodge;

            if (_sprintAction != null)
            {
                _sprintAction.started -= HandleSprintStarted;
                _sprintAction.canceled -= HandleSprintCanceled;
            }

            if (_menuAction != null)
                _menuAction.performed -= HandleMenu;

            if (_inventoryAction != null)
                _inventoryAction.performed -= HandleInventory;

            if (_aimAction != null)
            {
                _aimAction.started -= HandleAimStarted;
                _aimAction.canceled -= HandleAimCanceled;
            }
        }

        #endregion

        #region Input Processing

        private void ProcessContinuousInput()
        {
            // Process move input
            if (_moveAction != null)
            {
                Vector2 rawMove = _moveAction.ReadValue<Vector2>();
                _moveInput = ApplyDeadzone(rawMove);
                OnMoveInput?.Invoke(this, _moveInput);
            }

            // Process look input
            if (_lookAction != null)
            {
                Vector2 rawLook = _lookAction.ReadValue<Vector2>();
                _lookInput = rawLook; // Usually no deadzone for look
                OnLookInput?.Invoke(this, _lookInput);
            }
        }

        private Vector2 ApplyDeadzone(Vector2 input)
        {
            float magnitude = input.magnitude;
            if (magnitude < deadzone)
            {
                return Vector2.zero;
            }

            // Normalize and scale
            return input.normalized * ((magnitude - deadzone) / (1f - deadzone));
        }

        #endregion

        #region Action Handlers

        private void HandleInteract(InputAction.CallbackContext ctx)
        {
            Log("Interact pressed");
            OnInteractPressed?.Invoke(this, EventArgs.Empty);
            NotifyAction("Interact", true);
        }

        private void HandleAttack(InputAction.CallbackContext ctx)
        {
            Log("Attack pressed");
            OnAttackPressed?.Invoke(this, EventArgs.Empty);
            NotifyAction("Attack", true);
        }

        private void HandleDodge(InputAction.CallbackContext ctx)
        {
            Log("Dodge pressed");
            OnDodgePressed?.Invoke(this, EventArgs.Empty);
            NotifyAction("Dodge", true);
        }

        private void HandleSprintStarted(InputAction.CallbackContext ctx)
        {
            if (sprintToggle)
            {
                _isSprinting = !_isSprinting;
            }
            else
            {
                _isSprinting = true;
            }

            Log($"Sprint: {_isSprinting}");
            OnSprintStateChanged?.Invoke(this, _isSprinting);
            NotifyAction("Sprint", _isSprinting);
        }

        private void HandleSprintCanceled(InputAction.CallbackContext ctx)
        {
            if (!sprintToggle)
            {
                _isSprinting = false;
                OnSprintStateChanged?.Invoke(this, false);
                NotifyAction("Sprint", false);
            }
        }

        private void HandleAimStarted(InputAction.CallbackContext ctx)
        {
            if (aimToggle)
            {
                _isAiming = !_isAiming;
            }
            else
            {
                _isAiming = true;
            }

            NotifyAction("Aim", _isAiming);
        }

        private void HandleAimCanceled(InputAction.CallbackContext ctx)
        {
            if (!aimToggle)
            {
                _isAiming = false;
                NotifyAction("Aim", false);
            }
        }

        private void HandleMenu(InputAction.CallbackContext ctx)
        {
            Log("Menu pressed");
            OnMenuPressed?.Invoke(this, EventArgs.Empty);
            NotifyAction("Menu", true);
        }

        private void HandleInventory(InputAction.CallbackContext ctx)
        {
            Log("Inventory pressed");
            OnInventoryPressed?.Invoke(this, EventArgs.Empty);
            NotifyAction("Inventory", true);
        }

        private void HandleQuickSlot(int slotIndex)
        {
            Log($"Quick slot {slotIndex} pressed");
            OnQuickSlotPressed?.Invoke(this, slotIndex);
            NotifyAction($"QuickSlot{slotIndex}", true);
        }

        private void HandleControlsChanged(UnityEngine.InputSystem.PlayerInput input)
        {
            UpdateDeviceType();
        }

        private void HandlePhaseChanged(object sender, GamePhaseChangedEventArgs e)
        {
            // Switch action maps based on game phase
            switch (e.ToPhase)
            {
                case GamePhase.Title:
                case GamePhase.Menu:
                case GamePhase.Shop:
                    SwitchActionMap(InputActionMaps.UI);
                    break;

                case GamePhase.Combat:
                    SwitchActionMap(InputActionMaps.Combat);
                    break;

                case GamePhase.Dialogue:
                    SwitchActionMap(InputActionMaps.Dialogue);
                    break;

                case GamePhase.Overworld:
                case GamePhase.Town:
                    SwitchActionMap(InputActionMaps.Gameplay);
                    break;
            }
        }

        #endregion

        #region Device Management

        private void UpdateDeviceType()
        {
            if (_playerInput == null) return;

            var device = _playerInput.currentControlScheme;
            string newDeviceType = "Unknown";

            if (device != null)
            {
                if (device.Contains("Keyboard") || device.Contains("Mouse"))
                {
                    newDeviceType = "Keyboard";
                }
                else if (device.Contains("Gamepad") || device.Contains("Controller"))
                {
                    newDeviceType = "Gamepad";
                }
                else
                {
                    newDeviceType = device;
                }
            }

            if (_currentDeviceType != newDeviceType)
            {
                _currentDeviceType = newDeviceType;
                Log($"Device changed to: {_currentDeviceType}");
                OnDeviceChanged?.Invoke(this, _currentDeviceType);
            }
        }

        #endregion

        #region Action Map Management

        /// <summary>
        /// Switch to a different action map.
        /// </summary>
        /// <param name="mapName">Name of the action map.</param>
        public void SwitchActionMap(string mapName)
        {
            if (_playerInput == null) return;

            try
            {
                _playerInput.SwitchCurrentActionMap(mapName);
                _activeMapName = mapName;
                Log($"Switched to action map: {mapName}");
                OnActionMapChanged?.Invoke(this, mapName);
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[PlayerInput] Failed to switch action map to '{mapName}': {e.Message}");
            }
        }

        /// <summary>
        /// Enable a specific action.
        /// </summary>
        /// <param name="actionName">Action to enable.</param>
        public void EnableAction(string actionName)
        {
            var action = _playerInput?.actions?.FindAction(actionName);
            action?.Enable();
        }

        /// <summary>
        /// Disable a specific action.
        /// </summary>
        /// <param name="actionName">Action to disable.</param>
        public void DisableAction(string actionName)
        {
            var action = _playerInput?.actions?.FindAction(actionName);
            action?.Disable();
        }

        /// <summary>
        /// Enable all input.
        /// </summary>
        public void EnableAllInput()
        {
            if (_playerInput != null)
            {
                _playerInput.ActivateInput();
            }
        }

        /// <summary>
        /// Disable all input.
        /// </summary>
        public void DisableAllInput()
        {
            if (_playerInput != null)
            {
                _playerInput.DeactivateInput();
            }

            _moveInput = Vector2.zero;
            _lookInput = Vector2.zero;
            _isSprinting = false;
            _isAiming = false;
        }

        #endregion

        #region Public API

        /// <summary>
        /// Check if a specific action is currently pressed.
        /// </summary>
        /// <param name="actionName">Action to check.</param>
        /// <returns>True if pressed.</returns>
        public bool IsActionPressed(string actionName)
        {
            var action = _playerInput?.actions?.FindAction(actionName);
            return action != null && action.IsPressed();
        }

        /// <summary>
        /// Get the current value of an action.
        /// </summary>
        /// <typeparam name="T">Value type.</typeparam>
        /// <param name="actionName">Action name.</param>
        /// <returns>Action value.</returns>
        public T GetActionValue<T>(string actionName) where T : struct
        {
            var action = _playerInput?.actions?.FindAction(actionName);
            if (action != null)
            {
                return action.ReadValue<T>();
            }
            return default;
        }

        /// <summary>
        /// Get binding display string for an action.
        /// </summary>
        /// <param name="actionName">Action name.</param>
        /// <returns>Human-readable binding string.</returns>
        public string GetBindingDisplayString(string actionName)
        {
            var action = _playerInput?.actions?.FindAction(actionName);
            if (action == null) return "";

            // Get binding for current control scheme
            int bindingIndex = action.GetBindingIndex(
                IsUsingGamepad
                    ? InputBinding.MaskByGroup("Gamepad")
                    : InputBinding.MaskByGroup("Keyboard&Mouse")
            );

            if (bindingIndex >= 0)
            {
                return action.GetBindingDisplayString(bindingIndex);
            }

            return action.GetBindingDisplayString();
        }

        /// <summary>
        /// Set sprint toggle mode.
        /// </summary>
        /// <param name="toggle">True for toggle, false for hold.</param>
        public void SetSprintToggle(bool toggle)
        {
            sprintToggle = toggle;
            if (!toggle)
            {
                _isSprinting = false;
            }
        }

        /// <summary>
        /// Cancel sprint.
        /// </summary>
        public void CancelSprint()
        {
            if (_isSprinting)
            {
                _isSprinting = false;
                OnSprintStateChanged?.Invoke(this, false);
            }
        }

        /// <summary>
        /// Set aim toggle mode.
        /// </summary>
        /// <param name="toggle">True for toggle, false for hold.</param>
        public void SetAimToggle(bool toggle)
        {
            aimToggle = toggle;
            if (!toggle)
            {
                _isAiming = false;
            }
        }

        /// <summary>
        /// Cancel aim.
        /// </summary>
        public void CancelAim()
        {
            if (_isAiming)
            {
                _isAiming = false;
            }
        }

        /// <summary>
        /// Trigger haptic feedback (gamepad vibration).
        /// </summary>
        /// <param name="leftIntensity">Left motor intensity (0-1).</param>
        /// <param name="rightIntensity">Right motor intensity (0-1).</param>
        /// <param name="duration">Duration in seconds.</param>
        public void TriggerHapticFeedback(float leftIntensity, float rightIntensity, float duration = 0.1f)
        {
            if (Gamepad.current != null)
            {
                Gamepad.current.SetMotorSpeeds(leftIntensity, rightIntensity);
                Invoke(nameof(StopHapticFeedback), duration);
            }
        }

        private void StopHapticFeedback()
        {
            if (Gamepad.current != null)
            {
                Gamepad.current.SetMotorSpeeds(0f, 0f);
            }
        }

        #endregion

        #region Rebinding (Placeholder)

        /// <summary>
        /// Start interactive rebinding for an action.
        /// </summary>
        /// <param name="actionName">Action to rebind.</param>
        /// <param name="bindingIndex">Binding index to rebind.</param>
        /// <param name="onComplete">Callback when rebinding completes.</param>
        public void StartRebinding(string actionName, int bindingIndex, Action<bool> onComplete)
        {
            var action = _playerInput?.actions?.FindAction(actionName);
            if (action == null)
            {
                onComplete?.Invoke(false);
                return;
            }

            action.Disable();

            var rebindOperation = action.PerformInteractiveRebinding(bindingIndex)
                .WithControlsExcluding("<Mouse>/position")
                .WithControlsExcluding("<Mouse>/delta")
                .WithCancelingThrough("<Keyboard>/escape")
                .OnComplete(operation =>
                {
                    action.Enable();
                    operation.Dispose();
                    onComplete?.Invoke(true);
                    Log($"Rebind complete for {actionName}");
                })
                .OnCancel(operation =>
                {
                    action.Enable();
                    operation.Dispose();
                    onComplete?.Invoke(false);
                    Log($"Rebind cancelled for {actionName}");
                });

            rebindOperation.Start();
            Log($"Started rebinding for {actionName}");
        }

        /// <summary>
        /// Reset action bindings to defaults.
        /// </summary>
        /// <param name="actionName">Action to reset.</param>
        public void ResetBindings(string actionName)
        {
            var action = _playerInput?.actions?.FindAction(actionName);
            if (action != null)
            {
                action.RemoveAllBindingOverrides();
                Log($"Reset bindings for {actionName}");
            }
        }

        /// <summary>
        /// Reset all bindings to defaults.
        /// </summary>
        public void ResetAllBindings()
        {
            _playerInput?.actions?.RemoveAllBindingOverrides();
            Log("Reset all bindings");
        }

        #endregion

        #region Notifications

        private void NotifyAction(string actionName, bool isPressed)
        {
            OnActionTriggered?.Invoke(this, new PlayerInputEventArgs(actionName, isPressed, _currentDeviceType));
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[PlayerInput] {message}");
            }
        }

        #endregion
    }
}
