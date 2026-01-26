using System;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using IronFrontier.Core;

namespace IronFrontier.Input
{
    /// <summary>
    /// Input context determines which input mapping is active.
    /// </summary>
    public enum InputContext
    {
        /// <summary>Menu navigation (up/down/select/back).</summary>
        Menu,
        /// <summary>Overworld exploration (movement, interact, menu).</summary>
        Overworld,
        /// <summary>Town exploration (movement, interact, talk).</summary>
        Town,
        /// <summary>Dialogue interaction (advance, select choice).</summary>
        Dialogue,
        /// <summary>Turn-based combat (select action, target).</summary>
        Combat
    }

    /// <summary>
    /// Event arguments for movement input.
    /// </summary>
    public class MovementInputEventArgs : EventArgs
    {
        /// <summary>Normalized movement direction.</summary>
        public Vector2 Direction { get; }

        /// <summary>Whether movement is from keyboard (vs gamepad).</summary>
        public bool IsKeyboard { get; }

        public MovementInputEventArgs(Vector2 direction, bool isKeyboard)
        {
            Direction = direction;
            IsKeyboard = isKeyboard;
        }
    }

    /// <summary>
    /// Event arguments for action input.
    /// </summary>
    public class ActionInputEventArgs : EventArgs
    {
        /// <summary>Name of the action.</summary>
        public string ActionName { get; }

        /// <summary>Whether this is a press (true) or release (false).</summary>
        public bool IsPressed { get; }

        public ActionInputEventArgs(string actionName, bool isPressed)
        {
            ActionName = actionName;
            IsPressed = isPressed;
        }
    }

    /// <summary>
    /// Unity Input System integration for WASD, arrow keys, and gamepad input.
    /// Handles context-switching for different game phases.
    /// </summary>
    /// <remarks>
    /// Uses Unity's new Input System package for cross-platform input handling.
    /// Supports keyboard (WASD, arrows) and gamepad (left stick, d-pad, buttons).
    /// </remarks>
    [DefaultExecutionOrder(-100)] // Execute before other scripts
    public class InputController : MonoBehaviour
    {
        #region Singleton

        private static InputController _instance;

        /// <summary>
        /// Global singleton instance of InputController.
        /// </summary>
        public static InputController Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<InputController>();
                    if (_instance == null)
                    {
                        var go = new GameObject("[InputController]");
                        _instance = go.AddComponent<InputController>();
                    }
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when movement input changes.</summary>
        public event EventHandler<MovementInputEventArgs> OnMovement;

        /// <summary>Fired when movement stops.</summary>
        public event EventHandler OnMovementStopped;

        /// <summary>Fired when confirm/interact button is pressed.</summary>
        public event EventHandler OnConfirm;

        /// <summary>Fired when cancel/back button is pressed.</summary>
        public event EventHandler OnCancel;

        /// <summary>Fired when pause/menu button is pressed.</summary>
        public event EventHandler OnPause;

        /// <summary>Fired when interact button is pressed.</summary>
        public event EventHandler OnInteract;

        /// <summary>Fired for any action input.</summary>
        public event EventHandler<ActionInputEventArgs> OnAction;

        /// <summary>Fired when a dialogue choice is selected (1-4).</summary>
        public event EventHandler<int> OnDialogueChoice;

        /// <summary>Fired when quick save is pressed.</summary>
        public event EventHandler OnQuickSave;

        /// <summary>Fired when quick load is pressed.</summary>
        public event EventHandler OnQuickLoad;

        #endregion

        #region Configuration

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Deadzone for analog stick input")]
        [Range(0.05f, 0.5f)]
        private float analogDeadzone = 0.15f;

        [SerializeField]
        [Tooltip("Enable debug logging")]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private InputContext _currentContext = InputContext.Menu;
        private Vector2 _currentMovement = Vector2.zero;
        private bool _isMoving = false;
        private PlayerInput _playerInput;

        // Input action references
        private InputAction _moveAction;
        private InputAction _confirmAction;
        private InputAction _cancelAction;
        private InputAction _pauseAction;
        private InputAction _interactAction;
        private InputAction _quickSaveAction;
        private InputAction _quickLoadAction;
        private InputAction _choice1Action;
        private InputAction _choice2Action;
        private InputAction _choice3Action;
        private InputAction _choice4Action;

        #endregion

        #region Properties

        /// <summary>Current input context.</summary>
        public InputContext CurrentContext => _currentContext;

        /// <summary>Current movement input (normalized).</summary>
        public Vector2 CurrentMovement => _currentMovement;

        /// <summary>Whether any movement input is active.</summary>
        public bool IsMoving => _isMoving;

        /// <summary>Whether a gamepad is connected.</summary>
        public bool HasGamepad => Gamepad.current != null;

        /// <summary>Whether keyboard is the last used input device.</summary>
        public bool UsingKeyboard { get; private set; } = true;

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
            DontDestroyOnLoad(gameObject);

            InitializeInputSystem();
            Log("InputController initialized");
        }

        private void Start()
        {
            // Subscribe to game phase changes
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnPhaseChanged += OnGamePhaseChanged;
            }
        }

        private void Update()
        {
            ProcessMovementInput();
        }

        private void OnDestroy()
        {
            CleanupInputSystem();

            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnPhaseChanged -= OnGamePhaseChanged;
            }

            if (_instance == this)
            {
                _instance = null;
            }
        }

        private void OnEnable()
        {
            EnableInputActions();
        }

        private void OnDisable()
        {
            DisableInputActions();
        }

        #endregion

        #region Input System Setup

        private void InitializeInputSystem()
        {
            // Try to find existing PlayerInput component
            _playerInput = GetComponent<PlayerInput>();

            if (_playerInput == null)
            {
                // Create input actions programmatically
                CreateInputActions();
            }
            else
            {
                // Use PlayerInput component's actions
                var actions = _playerInput.actions;
                BindFromAsset(actions);
            }
        }

        private void CreateInputActions()
        {
            // Create movement action (WASD, arrows, left stick, d-pad)
            _moveAction = new InputAction("Move", InputActionType.Value);
            _moveAction.AddCompositeBinding("2DVector")
                .With("Up", "<Keyboard>/w")
                .With("Down", "<Keyboard>/s")
                .With("Left", "<Keyboard>/a")
                .With("Right", "<Keyboard>/d");
            _moveAction.AddCompositeBinding("2DVector")
                .With("Up", "<Keyboard>/upArrow")
                .With("Down", "<Keyboard>/downArrow")
                .With("Left", "<Keyboard>/leftArrow")
                .With("Right", "<Keyboard>/rightArrow");
            _moveAction.AddBinding("<Gamepad>/leftStick");
            _moveAction.AddCompositeBinding("2DVector")
                .With("Up", "<Gamepad>/dpad/up")
                .With("Down", "<Gamepad>/dpad/down")
                .With("Left", "<Gamepad>/dpad/left")
                .With("Right", "<Gamepad>/dpad/right");

            // Confirm action (Enter, Space, A button)
            _confirmAction = new InputAction("Confirm", InputActionType.Button);
            _confirmAction.AddBinding("<Keyboard>/enter");
            _confirmAction.AddBinding("<Keyboard>/space");
            _confirmAction.AddBinding("<Gamepad>/buttonSouth"); // A on Xbox, Cross on PS

            // Cancel action (Escape, Backspace, B button)
            _cancelAction = new InputAction("Cancel", InputActionType.Button);
            _cancelAction.AddBinding("<Keyboard>/escape");
            _cancelAction.AddBinding("<Keyboard>/backspace");
            _cancelAction.AddBinding("<Gamepad>/buttonEast"); // B on Xbox, Circle on PS

            // Pause action (Escape, Start button)
            _pauseAction = new InputAction("Pause", InputActionType.Button);
            _pauseAction.AddBinding("<Keyboard>/escape");
            _pauseAction.AddBinding("<Gamepad>/start");

            // Interact action (E, X button)
            _interactAction = new InputAction("Interact", InputActionType.Button);
            _interactAction.AddBinding("<Keyboard>/e");
            _interactAction.AddBinding("<Gamepad>/buttonWest"); // X on Xbox, Square on PS

            // Quick save (F5)
            _quickSaveAction = new InputAction("QuickSave", InputActionType.Button);
            _quickSaveAction.AddBinding("<Keyboard>/f5");

            // Quick load (F9)
            _quickLoadAction = new InputAction("QuickLoad", InputActionType.Button);
            _quickLoadAction.AddBinding("<Keyboard>/f9");

            // Dialogue choices (1-4 number keys)
            _choice1Action = new InputAction("Choice1", InputActionType.Button);
            _choice1Action.AddBinding("<Keyboard>/1");

            _choice2Action = new InputAction("Choice2", InputActionType.Button);
            _choice2Action.AddBinding("<Keyboard>/2");

            _choice3Action = new InputAction("Choice3", InputActionType.Button);
            _choice3Action.AddBinding("<Keyboard>/3");

            _choice4Action = new InputAction("Choice4", InputActionType.Button);
            _choice4Action.AddBinding("<Keyboard>/4");

            // Subscribe to action callbacks
            BindActionCallbacks();
        }

        private void BindFromAsset(InputActionAsset actions)
        {
            // Try to find actions in the asset
            _moveAction = actions.FindAction("Move");
            _confirmAction = actions.FindAction("Confirm") ?? actions.FindAction("Submit");
            _cancelAction = actions.FindAction("Cancel");
            _pauseAction = actions.FindAction("Pause") ?? actions.FindAction("Menu");
            _interactAction = actions.FindAction("Interact");
            _quickSaveAction = actions.FindAction("QuickSave");
            _quickLoadAction = actions.FindAction("QuickLoad");

            // Bind callbacks
            BindActionCallbacks();
        }

        private void BindActionCallbacks()
        {
            if (_confirmAction != null)
            {
                _confirmAction.performed += OnConfirmPerformed;
            }

            if (_cancelAction != null)
            {
                _cancelAction.performed += OnCancelPerformed;
            }

            if (_pauseAction != null)
            {
                _pauseAction.performed += OnPausePerformed;
            }

            if (_interactAction != null)
            {
                _interactAction.performed += OnInteractPerformed;
            }

            if (_quickSaveAction != null)
            {
                _quickSaveAction.performed += OnQuickSavePerformed;
            }

            if (_quickLoadAction != null)
            {
                _quickLoadAction.performed += OnQuickLoadPerformed;
            }

            if (_choice1Action != null)
            {
                _choice1Action.performed += ctx => OnDialogueChoicePerformed(1);
            }

            if (_choice2Action != null)
            {
                _choice2Action.performed += ctx => OnDialogueChoicePerformed(2);
            }

            if (_choice3Action != null)
            {
                _choice3Action.performed += ctx => OnDialogueChoicePerformed(3);
            }

            if (_choice4Action != null)
            {
                _choice4Action.performed += ctx => OnDialogueChoicePerformed(4);
            }
        }

        private void EnableInputActions()
        {
            _moveAction?.Enable();
            _confirmAction?.Enable();
            _cancelAction?.Enable();
            _pauseAction?.Enable();
            _interactAction?.Enable();
            _quickSaveAction?.Enable();
            _quickLoadAction?.Enable();
            _choice1Action?.Enable();
            _choice2Action?.Enable();
            _choice3Action?.Enable();
            _choice4Action?.Enable();
        }

        private void DisableInputActions()
        {
            _moveAction?.Disable();
            _confirmAction?.Disable();
            _cancelAction?.Disable();
            _pauseAction?.Disable();
            _interactAction?.Disable();
            _quickSaveAction?.Disable();
            _quickLoadAction?.Disable();
            _choice1Action?.Disable();
            _choice2Action?.Disable();
            _choice3Action?.Disable();
            _choice4Action?.Disable();
        }

        private void CleanupInputSystem()
        {
            // Unbind callbacks
            if (_confirmAction != null) _confirmAction.performed -= OnConfirmPerformed;
            if (_cancelAction != null) _cancelAction.performed -= OnCancelPerformed;
            if (_pauseAction != null) _pauseAction.performed -= OnPausePerformed;
            if (_interactAction != null) _interactAction.performed -= OnInteractPerformed;
            if (_quickSaveAction != null) _quickSaveAction.performed -= OnQuickSavePerformed;
            if (_quickLoadAction != null) _quickLoadAction.performed -= OnQuickLoadPerformed;

            DisableInputActions();

            // Dispose if we created the actions
            if (_playerInput == null)
            {
                _moveAction?.Dispose();
                _confirmAction?.Dispose();
                _cancelAction?.Dispose();
                _pauseAction?.Dispose();
                _interactAction?.Dispose();
                _quickSaveAction?.Dispose();
                _quickLoadAction?.Dispose();
                _choice1Action?.Dispose();
                _choice2Action?.Dispose();
                _choice3Action?.Dispose();
                _choice4Action?.Dispose();
            }
        }

        #endregion

        #region Input Processing

        private void ProcessMovementInput()
        {
            if (_moveAction == null) return;

            Vector2 input = _moveAction.ReadValue<Vector2>();

            // Apply deadzone
            if (input.magnitude < analogDeadzone)
            {
                input = Vector2.zero;
            }
            else
            {
                // Normalize for consistent diagonal movement
                input = input.normalized * ((input.magnitude - analogDeadzone) / (1f - analogDeadzone));
            }

            // Track input device
            var device = _moveAction.activeControl?.device;
            UsingKeyboard = device is Keyboard;

            // Update state
            bool wasMoving = _isMoving;
            _currentMovement = input;
            _isMoving = input.magnitude > 0.01f;

            // Emit events
            if (_isMoving)
            {
                OnMovement?.Invoke(this, new MovementInputEventArgs(input, UsingKeyboard));
            }
            else if (wasMoving)
            {
                OnMovementStopped?.Invoke(this, EventArgs.Empty);
            }
        }

        #endregion

        #region Action Callbacks

        private void OnConfirmPerformed(InputAction.CallbackContext ctx)
        {
            if (!IsContextValid()) return;

            Log("Confirm pressed");
            OnConfirm?.Invoke(this, EventArgs.Empty);
            OnAction?.Invoke(this, new ActionInputEventArgs("Confirm", true));

            EventBus.Instance?.Publish("input_confirm", string.Empty);
        }

        private void OnCancelPerformed(InputAction.CallbackContext ctx)
        {
            if (!IsContextValid()) return;

            Log("Cancel pressed");
            OnCancel?.Invoke(this, EventArgs.Empty);
            OnAction?.Invoke(this, new ActionInputEventArgs("Cancel", true));

            EventBus.Instance?.Publish("input_cancel", string.Empty);
        }

        private void OnPausePerformed(InputAction.CallbackContext ctx)
        {
            Log("Pause pressed");
            OnPause?.Invoke(this, EventArgs.Empty);
            OnAction?.Invoke(this, new ActionInputEventArgs("Pause", true));

            // Toggle pause through GameManager
            if (GameManager.Instance != null)
            {
                if (GameManager.Instance.CurrentPhase == GamePhase.Menu)
                {
                    GameManager.Instance.CloseMenu();
                }
                else if (GameManager.Instance.IsGameActive)
                {
                    GameManager.Instance.OpenMenu();
                }
            }

            EventBus.Instance?.Publish("input_pause", string.Empty);
        }

        private void OnInteractPerformed(InputAction.CallbackContext ctx)
        {
            if (!IsContextValid()) return;
            if (_currentContext != InputContext.Overworld && _currentContext != InputContext.Town) return;

            Log("Interact pressed");
            OnInteract?.Invoke(this, EventArgs.Empty);
            OnAction?.Invoke(this, new ActionInputEventArgs("Interact", true));

            EventBus.Instance?.Publish("input_interact", string.Empty);
        }

        private void OnQuickSavePerformed(InputAction.CallbackContext ctx)
        {
            Log("Quick Save pressed");
            OnQuickSave?.Invoke(this, EventArgs.Empty);

            GameManager.Instance?.QuickSave();
        }

        private void OnQuickLoadPerformed(InputAction.CallbackContext ctx)
        {
            Log("Quick Load pressed");
            OnQuickLoad?.Invoke(this, EventArgs.Empty);

            GameManager.Instance?.QuickLoad();
        }

        private void OnDialogueChoicePerformed(int choice)
        {
            if (_currentContext != InputContext.Dialogue) return;

            Log($"Dialogue choice {choice} pressed");
            OnDialogueChoice?.Invoke(this, choice);

            EventBus.Instance?.Publish("input_dialogue_choice", choice.ToString());
        }

        #endregion

        #region Context Management

        private void OnGamePhaseChanged(object sender, GamePhaseChangedEventArgs args)
        {
            // Map game phase to input context
            _currentContext = args.ToPhase switch
            {
                GamePhase.Title => InputContext.Menu,
                GamePhase.Loading => InputContext.Menu,
                GamePhase.Overworld => InputContext.Overworld,
                GamePhase.Town => InputContext.Town,
                GamePhase.Dialogue => InputContext.Dialogue,
                GamePhase.Combat => InputContext.Combat,
                GamePhase.Shop => InputContext.Menu,
                GamePhase.Menu => InputContext.Menu,
                GamePhase.Camp => InputContext.Menu,
                GamePhase.GameOver => InputContext.Menu,
                _ => InputContext.Menu
            };

            Log($"Input context changed to: {_currentContext}");
        }

        /// <summary>
        /// Manually set the input context.
        /// </summary>
        /// <param name="context">Context to set.</param>
        public void SetContext(InputContext context)
        {
            _currentContext = context;
            Log($"Input context manually set to: {_currentContext}");
        }

        private bool IsContextValid()
        {
            // Don't process input during loading
            if (GameManager.Instance != null &&
                GameManager.Instance.CurrentPhase == GamePhase.Loading)
            {
                return false;
            }

            return true;
        }

        #endregion

        #region Public API

        /// <summary>
        /// Get the movement input as a Vector3 (XZ plane).
        /// </summary>
        /// <returns>Movement vector for 3D space.</returns>
        public Vector3 GetMovement3D()
        {
            return new Vector3(_currentMovement.x, 0f, _currentMovement.y);
        }

        /// <summary>
        /// Check if a specific key is currently pressed.
        /// </summary>
        /// <param name="key">Key to check.</param>
        /// <returns>True if pressed.</returns>
        public bool IsKeyPressed(Key key)
        {
            return Keyboard.current != null && Keyboard.current[key].isPressed;
        }

        /// <summary>
        /// Check if a specific gamepad button is currently pressed.
        /// </summary>
        /// <param name="button">Button to check.</param>
        /// <returns>True if pressed.</returns>
        public bool IsButtonPressed(GamepadButton button)
        {
            return Gamepad.current != null && Gamepad.current[button].isPressed;
        }

        /// <summary>
        /// Vibrate the gamepad (if available).
        /// </summary>
        /// <param name="leftMotor">Left motor intensity (0-1).</param>
        /// <param name="rightMotor">Right motor intensity (0-1).</param>
        public void VibrateGamepad(float leftMotor, float rightMotor)
        {
            if (Gamepad.current != null)
            {
                Gamepad.current.SetMotorSpeeds(leftMotor, rightMotor);
            }
        }

        /// <summary>
        /// Stop gamepad vibration.
        /// </summary>
        public void StopVibration()
        {
            if (Gamepad.current != null)
            {
                Gamepad.current.SetMotorSpeeds(0f, 0f);
            }
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[InputController] {message}");
            }
        }

        #endregion
    }
}
