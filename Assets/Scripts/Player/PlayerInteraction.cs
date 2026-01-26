// =============================================================================
// PlayerInteraction.cs - Interaction Handling System
// Iron Frontier - Unity 6
// =============================================================================

using System;
using System.Collections.Generic;
using UnityEngine;
using IronFrontier.Core;
using IronFrontier.Input;
using IronFrontier.Dialogue;
using IronFrontier.Inventory;

namespace IronFrontier.Player
{
    /// <summary>
    /// Types of interactable objects.
    /// </summary>
    public enum InteractableType
    {
        None,
        NPC,
        Item,
        Door,
        Chest,
        Container,
        Sign,
        Campfire,
        Crafting,
        Shop,
        Generic
    }

    /// <summary>
    /// Interface for interactable objects.
    /// </summary>
    public interface IInteractable
    {
        /// <summary>Unique identifier for this interactable.</summary>
        string InteractableId { get; }

        /// <summary>Type of interactable.</summary>
        InteractableType InteractableType { get; }

        /// <summary>Display name for UI prompts.</summary>
        string DisplayName { get; }

        /// <summary>Custom interaction prompt text.</summary>
        string InteractionPrompt { get; }

        /// <summary>Whether interaction is currently possible.</summary>
        bool CanInteract { get; }

        /// <summary>Execute the interaction.</summary>
        /// <param name="player">Player controller reference.</param>
        void OnInteract(PlayerController player);

        /// <summary>Called when player enters interaction range.</summary>
        void OnPlayerEnterRange();

        /// <summary>Called when player exits interaction range.</summary>
        void OnPlayerExitRange();
    }

    /// <summary>
    /// Event arguments for interaction events.
    /// </summary>
    public class InteractionEventArgs : EventArgs
    {
        /// <summary>The interactable involved.</summary>
        public IInteractable Interactable { get; }

        /// <summary>The game object being interacted with.</summary>
        public GameObject Target { get; }

        /// <summary>Type of interactable.</summary>
        public InteractableType Type { get; }

        public InteractionEventArgs(IInteractable interactable, GameObject target)
        {
            Interactable = interactable;
            Target = target;
            Type = interactable?.InteractableType ?? InteractableType.None;
        }
    }

    /// <summary>
    /// Handles player interaction detection, UI prompts, and interaction execution.
    /// Supports NPCs, items, doors, chests, and custom interactables.
    /// </summary>
    public class PlayerInteraction : MonoBehaviour
    {
        #region Singleton

        private static PlayerInteraction _instance;

        /// <summary>
        /// Global singleton instance.
        /// </summary>
        public static PlayerInteraction Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindFirstObjectByType<PlayerInteraction>();
                }
                return _instance;
            }
        }

        #endregion

        #region Events

        /// <summary>Fired when a new interactable enters range.</summary>
        public event EventHandler<InteractionEventArgs> OnInteractableDetected;

        /// <summary>Fired when interactable exits range.</summary>
        public event EventHandler OnInteractableLost;

        /// <summary>Fired when player starts an interaction.</summary>
        public event EventHandler<InteractionEventArgs> OnInteractionStarted;

        /// <summary>Fired when interaction completes.</summary>
        public event EventHandler<InteractionEventArgs> OnInteractionCompleted;

        /// <summary>Fired when interaction prompt should show/hide.</summary>
        public event EventHandler<bool> OnPromptVisibilityChanged;

        #endregion

        #region Serialized Fields

        [Header("Detection Settings")]
        [SerializeField]
        [Tooltip("Maximum detection range for interactables")]
        private float detectionRange = 3f;

        [SerializeField]
        [Tooltip("Angle of view for detection (0 = any direction)")]
        [Range(0f, 360f)]
        private float detectionAngle = 180f;

        [SerializeField]
        [Tooltip("Layer mask for interactables")]
        private LayerMask interactableLayerMask = ~0;

        [SerializeField]
        [Tooltip("Detection update interval (seconds)")]
        private float scanInterval = 0.1f;

        [Header("Prompt Settings")]
        [SerializeField]
        [Tooltip("Default interaction prompt")]
        private string defaultPrompt = "Press E to interact";

        [SerializeField]
        [Tooltip("Time before prompt appears after detection")]
        private float promptDelay = 0.2f;

        [Header("References")]
        [SerializeField]
        private PlayerController playerController;

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        // Detection
        private Collider[] _detectionColliders = new Collider[20];
        private List<IInteractable> _interactablesInRange = new List<IInteractable>();
        private IInteractable _currentTarget;
        private GameObject _currentTargetObject;
        private float _lastScanTime;

        // State
        private bool _isInteracting;
        private bool _promptVisible;
        private float _targetDetectedTime;

        #endregion

        #region Properties

        /// <summary>Current interaction target.</summary>
        public IInteractable CurrentTarget => _currentTarget;

        /// <summary>Current target game object.</summary>
        public GameObject CurrentTargetObject => _currentTargetObject;

        /// <summary>Whether player is currently interacting.</summary>
        public bool IsInteracting => _isInteracting;

        /// <summary>Whether prompt should be visible.</summary>
        public bool IsPromptVisible => _promptVisible;

        /// <summary>All interactables currently in range.</summary>
        public IReadOnlyList<IInteractable> InteractablesInRange => _interactablesInRange;

        /// <summary>Current interaction prompt text.</summary>
        public string CurrentPrompt
        {
            get
            {
                if (_currentTarget != null && !string.IsNullOrEmpty(_currentTarget.InteractionPrompt))
                {
                    return _currentTarget.InteractionPrompt;
                }
                return GetDefaultPrompt(_currentTarget?.InteractableType ?? InteractableType.None);
            }
        }

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(this);
                return;
            }
            _instance = this;

            if (playerController == null)
            {
                playerController = GetComponent<PlayerController>();
            }
        }

        private void Start()
        {
            // Subscribe to input events
            if (InputController.Instance != null)
            {
                InputController.Instance.OnInteract += HandleInteractInput;
                InputController.Instance.OnConfirm += HandleConfirmInput;
                InputController.Instance.OnCancel += HandleCancelInput;
            }

            // Subscribe to player events
            if (playerController != null)
            {
                playerController.OnStateChanged += HandlePlayerStateChanged;
            }
        }

        private void Update()
        {
            if (!_isInteracting)
            {
                ScanForInteractables();
                UpdatePromptVisibility();
            }
        }

        private void OnDestroy()
        {
            if (InputController.Instance != null)
            {
                InputController.Instance.OnInteract -= HandleInteractInput;
                InputController.Instance.OnConfirm -= HandleConfirmInput;
                InputController.Instance.OnCancel -= HandleCancelInput;
            }

            if (playerController != null)
            {
                playerController.OnStateChanged -= HandlePlayerStateChanged;
            }

            if (_instance == this)
            {
                _instance = null;
            }
        }

        #endregion

        #region Input Handling

        private void HandleInteractInput(object sender, EventArgs e)
        {
            TryInteract();
        }

        private void HandleConfirmInput(object sender, EventArgs e)
        {
            // Confirm can also trigger interaction when not in dialogue
            if (!DialogueManager.Instance?.IsInDialogue ?? true)
            {
                TryInteract();
            }
        }

        private void HandleCancelInput(object sender, EventArgs e)
        {
            if (_isInteracting)
            {
                CancelInteraction();
            }
        }

        private void HandlePlayerStateChanged(object sender, PlayerStateChangedEventArgs e)
        {
            // Clear interaction state when entering non-interactive states
            if (e.ToState == PlayerState.InCombat ||
                e.ToState == PlayerState.Disabled)
            {
                ClearCurrentTarget();
                _isInteracting = false;
            }
        }

        #endregion

        #region Detection

        private void ScanForInteractables()
        {
            if (Time.time - _lastScanTime < scanInterval)
            {
                return;
            }
            _lastScanTime = Time.time;

            Vector3 origin = transform.position;

            // Clear previous list
            _interactablesInRange.Clear();

            // Sphere overlap detection
            int count = Physics.OverlapSphereNonAlloc(
                origin,
                detectionRange,
                _detectionColliders,
                interactableLayerMask
            );

            IInteractable bestTarget = null;
            GameObject bestTargetObject = null;
            float bestScore = float.MinValue;

            for (int i = 0; i < count; i++)
            {
                var collider = _detectionColliders[i];

                // Skip self
                if (collider.transform.IsChildOf(transform))
                    continue;

                // Get interactable component
                var interactable = GetInteractable(collider.gameObject);
                if (interactable == null || !interactable.CanInteract)
                    continue;

                // Check angle if configured
                if (detectionAngle < 360f)
                {
                    Vector3 toTarget = (collider.transform.position - origin).normalized;
                    float angle = Vector3.Angle(transform.forward, toTarget);
                    if (angle > detectionAngle * 0.5f)
                        continue;
                }

                _interactablesInRange.Add(interactable);

                // Calculate priority score
                float distance = Vector3.Distance(origin, collider.transform.position);
                float distanceScore = 1f - (distance / detectionRange);

                Vector3 toTarget2 = (collider.transform.position - origin).normalized;
                float dotProduct = Vector3.Dot(transform.forward, toTarget2);
                float angleScore = (dotProduct + 1f) * 0.5f; // 0-1 range

                float priorityBonus = GetInteractablePriority(interactable.InteractableType);

                float score = distanceScore * 0.4f + angleScore * 0.4f + priorityBonus * 0.2f;

                if (score > bestScore)
                {
                    bestScore = score;
                    bestTarget = interactable;
                    bestTargetObject = collider.gameObject;
                }
            }

            // Update current target
            if (bestTarget != _currentTarget)
            {
                // Notify previous target
                if (_currentTarget != null)
                {
                    _currentTarget.OnPlayerExitRange();
                    OnInteractableLost?.Invoke(this, EventArgs.Empty);
                    Log($"Lost target: {_currentTarget.DisplayName}");
                }

                _currentTarget = bestTarget;
                _currentTargetObject = bestTargetObject;

                // Notify new target
                if (_currentTarget != null)
                {
                    _currentTarget.OnPlayerEnterRange();
                    _targetDetectedTime = Time.time;
                    OnInteractableDetected?.Invoke(this, new InteractionEventArgs(_currentTarget, _currentTargetObject));
                    Log($"New target: {_currentTarget.DisplayName}");
                }
            }
        }

        private IInteractable GetInteractable(GameObject obj)
        {
            // First check for IInteractable interface
            var interactable = obj.GetComponent<IInteractable>();
            if (interactable != null)
            {
                return interactable;
            }

            // Check for NPCBehavior
            var npc = obj.GetComponent<AI.NPCBehavior>();
            if (npc != null && npc.CanInteract)
            {
                return new NPCInteractableWrapper(npc);
            }

            // Check for tagged objects
            if (obj.CompareTag("Item"))
            {
                return new ItemInteractableWrapper(obj);
            }

            if (obj.CompareTag("Door"))
            {
                return new DoorInteractableWrapper(obj);
            }

            if (obj.CompareTag("Chest"))
            {
                return new ChestInteractableWrapper(obj);
            }

            return null;
        }

        private float GetInteractablePriority(InteractableType type)
        {
            return type switch
            {
                InteractableType.NPC => 1.0f,
                InteractableType.Shop => 0.9f,
                InteractableType.Item => 0.8f,
                InteractableType.Chest => 0.7f,
                InteractableType.Door => 0.5f,
                InteractableType.Sign => 0.3f,
                _ => 0.5f
            };
        }

        private void ClearCurrentTarget()
        {
            if (_currentTarget != null)
            {
                _currentTarget.OnPlayerExitRange();
                _currentTarget = null;
                _currentTargetObject = null;
                OnInteractableLost?.Invoke(this, EventArgs.Empty);
            }

            _interactablesInRange.Clear();
            SetPromptVisible(false);
        }

        #endregion

        #region Interaction Execution

        /// <summary>
        /// Attempt to interact with the current target.
        /// </summary>
        /// <returns>True if interaction started.</returns>
        public bool TryInteract()
        {
            if (_currentTarget == null || _isInteracting)
            {
                return false;
            }

            if (!_currentTarget.CanInteract)
            {
                Log($"Cannot interact with {_currentTarget.DisplayName}");
                return false;
            }

            if (playerController != null && !playerController.CanInteract)
            {
                return false;
            }

            return StartInteraction(_currentTarget, _currentTargetObject);
        }

        /// <summary>
        /// Start interaction with a specific target.
        /// </summary>
        /// <param name="target">Target to interact with.</param>
        /// <param name="targetObject">Game object reference.</param>
        /// <returns>True if interaction started.</returns>
        public bool StartInteraction(IInteractable target, GameObject targetObject)
        {
            if (target == null || _isInteracting)
            {
                return false;
            }

            Log($"Starting interaction with {target.DisplayName}");

            _isInteracting = true;
            SetPromptVisible(false);

            // Face the target
            if (targetObject != null && playerController != null)
            {
                playerController.LookAt(targetObject.transform.position);
            }

            // Fire event
            OnInteractionStarted?.Invoke(this, new InteractionEventArgs(target, targetObject));

            // Execute interaction
            try
            {
                target.OnInteract(playerController);

                OnInteractionCompleted?.Invoke(this, new InteractionEventArgs(target, targetObject));
            }
            catch (Exception e)
            {
                Debug.LogError($"[PlayerInteraction] Error during interaction: {e}");
            }

            // Mark interaction complete (unless in dialogue/shop)
            if (target.InteractableType != InteractableType.NPC &&
                target.InteractableType != InteractableType.Shop)
            {
                _isInteracting = false;
            }

            return true;
        }

        /// <summary>
        /// Cancel the current interaction.
        /// </summary>
        public void CancelInteraction()
        {
            if (!_isInteracting)
            {
                return;
            }

            Log("Interaction cancelled");
            _isInteracting = false;

            EventBus.Instance?.Publish("interaction_cancelled", string.Empty);
        }

        /// <summary>
        /// Mark interaction as complete (called by dialogue/shop systems).
        /// </summary>
        public void CompleteInteraction()
        {
            _isInteracting = false;
            Log("Interaction completed");
        }

        #endregion

        #region Prompt Management

        private void UpdatePromptVisibility()
        {
            bool shouldShow = _currentTarget != null &&
                              Time.time - _targetDetectedTime >= promptDelay &&
                              (playerController == null || playerController.CanInteract);

            if (shouldShow != _promptVisible)
            {
                SetPromptVisible(shouldShow);
            }
        }

        private void SetPromptVisible(bool visible)
        {
            if (_promptVisible != visible)
            {
                _promptVisible = visible;
                OnPromptVisibilityChanged?.Invoke(this, visible);
            }
        }

        private string GetDefaultPrompt(InteractableType type)
        {
            string action = type switch
            {
                InteractableType.NPC => "Talk",
                InteractableType.Item => "Pick up",
                InteractableType.Door => "Open",
                InteractableType.Chest => "Open",
                InteractableType.Container => "Search",
                InteractableType.Sign => "Read",
                InteractableType.Campfire => "Rest",
                InteractableType.Crafting => "Craft",
                InteractableType.Shop => "Trade",
                _ => "Interact"
            };

            // Get input hint
            string inputHint = InputController.Instance?.UsingKeyboard ?? true
                ? "E"
                : "X";

            return $"Press {inputHint} to {action}";
        }

        #endregion

        #region Gizmos

        private void OnDrawGizmosSelected()
        {
            // Draw detection range
            Gizmos.color = new Color(0f, 1f, 0.5f, 0.2f);
            Gizmos.DrawWireSphere(transform.position, detectionRange);

            // Draw detection angle
            if (detectionAngle < 360f)
            {
                Gizmos.color = new Color(1f, 1f, 0f, 0.3f);
                Vector3 leftDir = Quaternion.Euler(0, -detectionAngle * 0.5f, 0) * transform.forward;
                Vector3 rightDir = Quaternion.Euler(0, detectionAngle * 0.5f, 0) * transform.forward;
                Gizmos.DrawRay(transform.position, leftDir * detectionRange);
                Gizmos.DrawRay(transform.position, rightDir * detectionRange);
            }

            // Draw line to current target
            if (_currentTargetObject != null)
            {
                Gizmos.color = Color.green;
                Gizmos.DrawLine(transform.position + Vector3.up, _currentTargetObject.transform.position);
            }
        }

        #endregion

        #region Logging

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[PlayerInteraction] {message}");
            }
        }

        #endregion
    }

    #region Interactable Wrappers

    /// <summary>
    /// Wrapper to make NPCBehavior work with IInteractable interface.
    /// </summary>
    internal class NPCInteractableWrapper : IInteractable
    {
        private readonly AI.NPCBehavior _npc;

        public NPCInteractableWrapper(AI.NPCBehavior npc)
        {
            _npc = npc;
        }

        public string InteractableId => _npc.NpcId;
        public InteractableType InteractableType => InteractableType.NPC;
        public string DisplayName => _npc.DisplayName;
        public string InteractionPrompt => $"Talk to {_npc.DisplayName}";
        public bool CanInteract => _npc.CanInteract && _npc.IsPlayerInInteractionRange();

        public void OnInteract(PlayerController player)
        {
            if (!string.IsNullOrEmpty(_npc.DialogueId))
            {
                DialogueManager.Instance?.StartDialogue(_npc.NpcId, _npc.DialogueId);
            }

            EventBus.Instance?.Publish("npc_interact", _npc.NpcId);
        }

        public void OnPlayerEnterRange() { }
        public void OnPlayerExitRange() { }
    }

    /// <summary>
    /// Wrapper for item pickups.
    /// </summary>
    internal class ItemInteractableWrapper : IInteractable
    {
        private readonly GameObject _itemObject;
        private readonly string _itemId;
        private readonly string _displayName;

        public ItemInteractableWrapper(GameObject itemObject)
        {
            _itemObject = itemObject;
            _itemId = itemObject.name;
            _displayName = itemObject.name.Replace("_", " ");
        }

        public string InteractableId => _itemId;
        public InteractableType InteractableType => InteractableType.Item;
        public string DisplayName => _displayName;
        public string InteractionPrompt => $"Pick up {_displayName}";
        public bool CanInteract => _itemObject != null;

        public void OnInteract(PlayerController player)
        {
            // TODO: Get ItemData from WorldItem component and add to inventory
            EventBus.Instance?.Publish(GameEvents.ItemAdded, _itemId);

            // Destroy the world item
            if (_itemObject != null)
            {
                UnityEngine.Object.Destroy(_itemObject);
            }
        }

        public void OnPlayerEnterRange()
        {
            // Could trigger item highlight effect
        }

        public void OnPlayerExitRange()
        {
            // Remove highlight
        }
    }

    /// <summary>
    /// Wrapper for door interactions.
    /// </summary>
    internal class DoorInteractableWrapper : IInteractable
    {
        private readonly GameObject _door;
        private bool _isOpen;

        public DoorInteractableWrapper(GameObject door)
        {
            _door = door;
            _isOpen = false;
        }

        public string InteractableId => _door.name;
        public InteractableType InteractableType => InteractableType.Door;
        public string DisplayName => "Door";
        public string InteractionPrompt => _isOpen ? "Close door" : "Open door";
        public bool CanInteract => _door != null;

        public void OnInteract(PlayerController player)
        {
            _isOpen = !_isOpen;
            EventBus.Instance?.Publish("door_interact", _door.name);

            // TODO: Trigger door animation
        }

        public void OnPlayerEnterRange() { }
        public void OnPlayerExitRange() { }
    }

    /// <summary>
    /// Wrapper for chest/container interactions.
    /// </summary>
    internal class ChestInteractableWrapper : IInteractable
    {
        private readonly GameObject _chest;
        private bool _isOpened;

        public ChestInteractableWrapper(GameObject chest)
        {
            _chest = chest;
            _isOpened = false;
        }

        public string InteractableId => _chest.name;
        public InteractableType InteractableType => InteractableType.Chest;
        public string DisplayName => "Chest";
        public string InteractionPrompt => _isOpened ? "Search chest" : "Open chest";
        public bool CanInteract => _chest != null;

        public void OnInteract(PlayerController player)
        {
            _isOpened = true;
            EventBus.Instance?.Publish("chest_interact", _chest.name);

            // TODO: Open chest UI and show loot
        }

        public void OnPlayerEnterRange() { }
        public void OnPlayerExitRange() { }
    }

    #endregion
}
