// =============================================================================
// NPCBehavior.cs - NPC-Specific Behaviors and Configuration
// Iron Frontier - Unity 6
// Ported from YukaJS TypeScript implementation
// =============================================================================

using System;
using UnityEngine;

namespace IronFrontier.AI
{
    /// <summary>
    /// Wander behavior configuration
    /// </summary>
    [Serializable]
    public struct WanderConfig
    {
        [Tooltip("Radius of the wander circle")]
        public float radius;

        [Tooltip("Distance in front for wander target calculation")]
        public float distance;

        [Tooltip("Random jitter applied each frame")]
        public float jitter;

        public static WanderConfig Default => new WanderConfig
        {
            radius = 5f,
            distance = 4f,
            jitter = 1f
        };
    }

    /// <summary>
    /// Patrol behavior configuration
    /// </summary>
    [Serializable]
    public struct PatrolConfig
    {
        [Tooltip("Waypoints to patrol in world coordinates")]
        public Vector3[] waypoints;

        [Tooltip("Whether to loop the patrol path")]
        public bool loop;

        [Tooltip("Wait time at each waypoint in seconds")]
        public float waitTime;

        public static PatrolConfig Default => new PatrolConfig
        {
            waypoints = Array.Empty<Vector3>(),
            loop = true,
            waitTime = 2f
        };
    }

    /// <summary>
    /// ScriptableObject for AI behavior configuration
    /// Allows drag-and-drop configuration in the Unity Inspector
    /// </summary>
    [CreateAssetMenu(fileName = "AIBehaviorConfig", menuName = "Iron Frontier/AI/Behavior Config")]
    public class AIBehaviorConfig : ScriptableObject
    {
        [Header("Default Behavior")]
        [Tooltip("The default state when no other state is active")]
        public AIStateType defaultState = AIStateType.Idle;

        [Header("Movement")]
        [Tooltip("Maximum movement speed in units per second")]
        public float maxSpeed = 3.5f;

        [Tooltip("Maximum steering force (acceleration)")]
        public float maxForce = 8f;

        [Tooltip("How close to get before considering arrived")]
        public float arrivalTolerance = 0.5f;

        [Tooltip("Distance to maintain when following a target")]
        public float followDistance = 3f;

        [Header("Perception")]
        [Tooltip("Detection range for seeing the player")]
        public float detectionRange = 15f;

        [Tooltip("Field of view in degrees")]
        [Range(0f, 360f)]
        public float fieldOfView = 90f;

        [Header("Behaviors")]
        public WanderConfig wander = WanderConfig.Default;
        public PatrolConfig patrol = PatrolConfig.Default;

        /// <summary>
        /// Create a runtime copy that can be modified without affecting the asset
        /// </summary>
        public AIBehaviorConfig CreateRuntimeCopy()
        {
            var copy = CreateInstance<AIBehaviorConfig>();
            copy.defaultState = defaultState;
            copy.maxSpeed = maxSpeed;
            copy.maxForce = maxForce;
            copy.arrivalTolerance = arrivalTolerance;
            copy.followDistance = followDistance;
            copy.detectionRange = detectionRange;
            copy.fieldOfView = fieldOfView;
            copy.wander = wander;
            copy.patrol = new PatrolConfig
            {
                waypoints = patrol.waypoints != null
                    ? (Vector3[])patrol.waypoints.Clone()
                    : Array.Empty<Vector3>(),
                loop = patrol.loop,
                waitTime = patrol.waitTime
            };
            return copy;
        }
    }

    /// <summary>
    /// NPC role types for determining default behaviors
    /// </summary>
    public enum NPCRole
    {
        Civilian,
        Sheriff,
        Deputy,
        Merchant,
        Banker,
        Rancher,
        Miner,
        Bartender,
        Outlaw,
        Drifter,
        Companion
    }

    /// <summary>
    /// Component for NPC-specific behavior and configuration.
    /// Extends AIController with NPC role-based behavior presets.
    /// </summary>
    [RequireComponent(typeof(AIController))]
    public class NPCBehavior : MonoBehaviour
    {
        [Header("NPC Identity")]
        [SerializeField] private string _npcId;
        [SerializeField] private string _displayName;
        [SerializeField] private NPCRole _role = NPCRole.Civilian;

        [Header("Behavior Presets")]
        [SerializeField] private bool _useRolePreset = true;
        [SerializeField] private AIBehaviorConfig _customConfig;

        [Header("Interaction")]
        [SerializeField] private bool _canInteract = true;
        [SerializeField] private float _interactionRange = 2f;
        [SerializeField] private string _dialogueId;

        [Header("Combat")]
        [SerializeField] private bool _isHostile;
        [SerializeField] private float _aggroRange = 10f;
        [SerializeField] private float _attackRange = 2f;

        // Components
        private AIController _aiController;

        // Public accessors
        public string NpcId => _npcId;
        public string DisplayName => _displayName;
        public NPCRole Role => _role;
        public bool CanInteract => _canInteract;
        public float InteractionRange => _interactionRange;
        public bool IsHostile => _isHostile;
        public string DialogueId => _dialogueId;

        /// <summary>
        /// Event fired when the NPC wants to interact with the player
        /// </summary>
        public event Action OnWantsToInteract;

        /// <summary>
        /// Event fired when the NPC becomes hostile
        /// </summary>
        public event Action OnBecameHostile;

        private void Awake()
        {
            _aiController = GetComponent<AIController>();

            if (string.IsNullOrEmpty(_npcId))
            {
                _npcId = gameObject.name;
            }
        }

        private void Start()
        {
            ApplyBehaviorConfig();

            // Subscribe to perception events
            if (_aiController.Perception != null)
            {
                _aiController.Perception.OnPlayerDetected += HandlePlayerDetected;
            }
        }

        private void OnDestroy()
        {
            if (_aiController?.Perception != null)
            {
                _aiController.Perception.OnPlayerDetected -= HandlePlayerDetected;
            }
        }

        private void ApplyBehaviorConfig()
        {
            AIBehaviorConfig config;

            if (_useRolePreset)
            {
                config = CreateRolePreset(_role);
            }
            else if (_customConfig != null)
            {
                config = _customConfig.CreateRuntimeCopy();
            }
            else
            {
                config = ScriptableObject.CreateInstance<AIBehaviorConfig>();
            }

            _aiController.ApplyConfig(config);
            _aiController.Perception?.SetDetectionRange(config.detectionRange);
            _aiController.Perception?.SetFieldOfView(config.fieldOfView);
        }

        /// <summary>
        /// Create a behavior config preset based on NPC role
        /// </summary>
        private AIBehaviorConfig CreateRolePreset(NPCRole role)
        {
            var config = ScriptableObject.CreateInstance<AIBehaviorConfig>();

            switch (role)
            {
                case NPCRole.Sheriff:
                case NPCRole.Deputy:
                    config.defaultState = AIStateType.Patrol;
                    config.maxSpeed = 4f;
                    config.detectionRange = 20f;
                    config.fieldOfView = 120f;
                    break;

                case NPCRole.Merchant:
                case NPCRole.Banker:
                case NPCRole.Bartender:
                    config.defaultState = AIStateType.Idle;
                    config.maxSpeed = 2f;
                    config.detectionRange = 8f;
                    config.fieldOfView = 180f;
                    break;

                case NPCRole.Rancher:
                case NPCRole.Miner:
                    config.defaultState = AIStateType.Wander;
                    config.maxSpeed = 2.5f;
                    config.wander = new WanderConfig { radius = 10f, distance = 4f, jitter = 0.5f };
                    config.detectionRange = 12f;
                    break;

                case NPCRole.Outlaw:
                    config.defaultState = AIStateType.Wander;
                    config.maxSpeed = 4f;
                    config.maxForce = 10f;
                    config.wander = new WanderConfig { radius = 15f, distance = 6f, jitter = 2f };
                    config.detectionRange = 25f;
                    config.fieldOfView = 150f;
                    break;

                case NPCRole.Drifter:
                    config.defaultState = AIStateType.Wander;
                    config.maxSpeed = 3f;
                    config.wander = new WanderConfig { radius = 20f, distance = 8f, jitter = 1f };
                    config.detectionRange = 15f;
                    break;

                case NPCRole.Companion:
                    config.defaultState = AIStateType.Follow;
                    config.maxSpeed = 5f;
                    config.followDistance = 3f;
                    config.detectionRange = 20f;
                    config.fieldOfView = 180f;
                    break;

                case NPCRole.Civilian:
                default:
                    config.defaultState = AIStateType.Wander;
                    config.maxSpeed = 2f;
                    config.wander = new WanderConfig { radius = 8f, distance = 3f, jitter = 0.3f };
                    config.detectionRange = 10f;
                    break;
            }

            return config;
        }

        private void HandlePlayerDetected()
        {
            if (_isHostile)
            {
                // Check if within aggro range
                float distance = _aiController.Perception.DistanceToPlayer;
                if (distance <= _aggroRange)
                {
                    OnBecameHostile?.Invoke();
                    // Could transition to attack state here
                }
            }
            else if (_canInteract)
            {
                float distance = _aiController.Perception.DistanceToPlayer;
                if (distance <= _interactionRange)
                {
                    OnWantsToInteract?.Invoke();
                }
            }
        }

        /// <summary>
        /// Set this NPC as a companion following the player
        /// </summary>
        public void SetAsCompanion(Transform playerTransform)
        {
            _role = NPCRole.Companion;
            _aiController.SetFollowTarget(playerTransform);
        }

        /// <summary>
        /// Release this NPC from companion duty
        /// </summary>
        public void ReleaseFromCompanion()
        {
            _aiController.ClearFollowTarget();
            _aiController.ReturnToDefaultState();
        }

        /// <summary>
        /// Make this NPC hostile
        /// </summary>
        public void MakeHostile()
        {
            _isHostile = true;

            // Adjust behavior for hostile NPC
            var config = _aiController.Config;
            if (config != null)
            {
                config.detectionRange = _aggroRange * 1.5f;
            }
        }

        /// <summary>
        /// Make this NPC flee from the player
        /// </summary>
        public void FleeFromPlayer()
        {
            _aiController.ForceState(AIStateType.Flee);
        }

        /// <summary>
        /// Send this NPC to a specific location
        /// </summary>
        public void GoTo(Vector3 destination)
        {
            _aiController.SetTargetPosition(destination);
        }

        /// <summary>
        /// Check if player is within interaction range
        /// </summary>
        public bool IsPlayerInInteractionRange()
        {
            if (_aiController.Perception == null) return false;
            return _aiController.Perception.DistanceToPlayer <= _interactionRange;
        }

        #region Gizmos

        private void OnDrawGizmosSelected()
        {
            // Draw interaction range
            if (_canInteract)
            {
                Gizmos.color = new Color(0f, 1f, 0f, 0.3f);
                Gizmos.DrawWireSphere(transform.position, _interactionRange);
            }

            // Draw aggro range
            if (_isHostile)
            {
                Gizmos.color = new Color(1f, 0f, 0f, 0.3f);
                Gizmos.DrawWireSphere(transform.position, _aggroRange);

                Gizmos.color = new Color(1f, 0.5f, 0f, 0.3f);
                Gizmos.DrawWireSphere(transform.position, _attackRange);
            }
        }

        #endregion
    }
}
