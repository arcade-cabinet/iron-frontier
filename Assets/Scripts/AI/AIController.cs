// =============================================================================
// AIController.cs - Base AI Controller with NavMeshAgent Integration
// Iron Frontier - Unity 6
// Ported from YukaJS TypeScript implementation
// =============================================================================

using System;
using UnityEngine;
using UnityEngine.AI;

namespace IronFrontier.AI
{
    /// <summary>
    /// Base AI controller that integrates NavMeshAgent with the AI state machine.
    /// Attach this to any NPC that needs AI-driven navigation and behavior.
    /// </summary>
    [RequireComponent(typeof(NavMeshAgent))]
    public class AIController : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private AIBehaviorConfig _behaviorConfig;

        [Header("Debug")]
        [SerializeField] private bool _showDebugGizmos = true;
        [SerializeField] private Color _gizmoColor = Color.cyan;

        // Components
        private NavMeshAgent _navAgent;
        private PerceptionSystem _perception;
        private AIStateMachine _stateMachine;

        // State
        private Vector3? _targetPosition;
        private Transform _followTarget;
        private float _currentSpeed;
        private bool _isInitialized;

        // Public accessors
        public AIBehaviorConfig Config => _behaviorConfig;
        public AIStateMachine StateMachine => _stateMachine;
        public PerceptionSystem Perception => _perception;
        public NavMeshAgent NavAgent => _navAgent;
        public Vector3? TargetPosition => _targetPosition;
        public Transform FollowTarget => _followTarget;
        public bool IsMoving => _navAgent != null && _navAgent.velocity.magnitude > 0.1f;
        public Vector3 Velocity => _navAgent?.velocity ?? Vector3.zero;
        public AIStateType CurrentState => _stateMachine?.CurrentStateType ?? AIStateType.Idle;

        /// <summary>
        /// Unique identifier for this AI entity
        /// </summary>
        public string EntityId { get; private set; }

        /// <summary>
        /// Event fired when the AI state changes
        /// </summary>
        public event Action<AIStateType, AIStateType> OnStateChanged;

        private void Awake()
        {
            EntityId = gameObject.name + "_" + GetInstanceID();

            _navAgent = GetComponent<NavMeshAgent>();
            _perception = GetComponent<PerceptionSystem>();

            if (_perception == null)
            {
                _perception = gameObject.AddComponent<PerceptionSystem>();
            }

            // Apply default config if none assigned
            if (_behaviorConfig == null)
            {
                _behaviorConfig = ScriptableObject.CreateInstance<AIBehaviorConfig>();
            }

            InitializeNavAgent();
            InitializeStateMachine();

            _isInitialized = true;
        }

        private void InitializeNavAgent()
        {
            if (_navAgent == null) return;

            _navAgent.speed = _behaviorConfig.maxSpeed;
            _navAgent.acceleration = _behaviorConfig.maxForce * 2f;
            _navAgent.angularSpeed = 360f;
            _navAgent.stoppingDistance = _behaviorConfig.arrivalTolerance;
            _navAgent.autoBraking = true;
        }

        private void InitializeStateMachine()
        {
            _stateMachine = new AIStateMachine(this);
            _stateMachine.ChangeState(_behaviorConfig.defaultState);
        }

        private void Update()
        {
            if (!_isInitialized) return;

            _stateMachine.Update(Time.deltaTime);
        }

        #region Movement Methods

        /// <summary>
        /// Move toward a target position using NavMesh pathfinding
        /// </summary>
        public void MoveTo(Vector3 destination)
        {
            if (_navAgent == null || !_navAgent.isOnNavMesh) return;

            _targetPosition = destination;
            _navAgent.isStopped = false;
            _navAgent.SetDestination(destination);
        }

        /// <summary>
        /// Stop all movement
        /// </summary>
        public void StopMovement()
        {
            if (_navAgent == null || !_navAgent.isOnNavMesh) return;

            _navAgent.isStopped = true;
            _navAgent.velocity = Vector3.zero;
        }

        /// <summary>
        /// Set the movement speed
        /// </summary>
        public void SetSpeed(float speed)
        {
            _currentSpeed = speed;
            if (_navAgent != null)
            {
                _navAgent.speed = speed;
            }
        }

        /// <summary>
        /// Make the AI look at a target position
        /// </summary>
        public void LookAt(Vector3 target)
        {
            Vector3 direction = target - transform.position;
            direction.y = 0f;

            if (direction.sqrMagnitude > 0.001f)
            {
                Quaternion targetRotation = Quaternion.LookRotation(direction);
                transform.rotation = Quaternion.Slerp(
                    transform.rotation,
                    targetRotation,
                    Time.deltaTime * 5f
                );
            }
        }

        #endregion

        #region State Control

        /// <summary>
        /// Set the AI to seek a target position
        /// </summary>
        public void SetTargetPosition(Vector3 position)
        {
            _targetPosition = position;
            _stateMachine.ChangeState(AIStateType.Seek);
        }

        /// <summary>
        /// Set the AI to follow a target transform
        /// </summary>
        public void SetFollowTarget(Transform target)
        {
            _followTarget = target;
            _stateMachine.ChangeState(AIStateType.Follow);
        }

        /// <summary>
        /// Clear the follow target
        /// </summary>
        public void ClearFollowTarget()
        {
            _followTarget = null;
        }

        /// <summary>
        /// Force a state change
        /// </summary>
        public void ForceState(AIStateType state)
        {
            var previousState = _stateMachine.CurrentStateType;
            _stateMachine.ChangeState(state);
            OnStateChanged?.Invoke(previousState, state);
        }

        /// <summary>
        /// Return to the default state
        /// </summary>
        public void ReturnToDefaultState()
        {
            _stateMachine.ChangeState(_behaviorConfig.defaultState);
        }

        #endregion

        #region Configuration

        /// <summary>
        /// Apply a new behavior configuration at runtime
        /// </summary>
        public void ApplyConfig(AIBehaviorConfig config)
        {
            _behaviorConfig = config;
            InitializeNavAgent();
            _stateMachine.ChangeState(config.defaultState);
        }

        /// <summary>
        /// Set patrol waypoints at runtime
        /// </summary>
        public void SetPatrolWaypoints(Vector3[] waypoints, bool loop = true)
        {
            if (_behaviorConfig != null)
            {
                _behaviorConfig.patrol.waypoints = waypoints;
                _behaviorConfig.patrol.loop = loop;
            }
        }

        #endregion

        #region Queries

        /// <summary>
        /// Check if the AI can reach a destination
        /// </summary>
        public bool CanReach(Vector3 destination)
        {
            if (_navAgent == null) return false;

            NavMeshPath path = new NavMeshPath();
            return _navAgent.CalculatePath(destination, path) &&
                   path.status == NavMeshPathStatus.PathComplete;
        }

        /// <summary>
        /// Get the remaining distance to the current destination
        /// </summary>
        public float GetRemainingDistance()
        {
            if (_navAgent == null || !_navAgent.hasPath) return float.MaxValue;
            return _navAgent.remainingDistance;
        }

        /// <summary>
        /// Check if the AI has reached its destination
        /// </summary>
        public bool HasReachedDestination()
        {
            if (_navAgent == null || !_navAgent.hasPath) return true;
            return _navAgent.remainingDistance <= _navAgent.stoppingDistance;
        }

        #endregion

        #region Debug Visualization

        private void OnDrawGizmos()
        {
            if (!_showDebugGizmos) return;

            Gizmos.color = _gizmoColor;

            // Draw current path
            if (_navAgent != null && _navAgent.hasPath)
            {
                var path = _navAgent.path;
                for (int i = 0; i < path.corners.Length - 1; i++)
                {
                    Gizmos.DrawLine(path.corners[i], path.corners[i + 1]);
                }
            }

            // Draw target position
            if (_targetPosition.HasValue)
            {
                Gizmos.color = Color.yellow;
                Gizmos.DrawWireSphere(_targetPosition.Value, 0.5f);
            }

            // Draw state indicator
            Gizmos.color = GetStateColor();
            Gizmos.DrawWireSphere(transform.position + Vector3.up * 2f, 0.3f);
        }

        private void OnDrawGizmosSelected()
        {
            if (_behaviorConfig == null) return;

            // Draw detection range
            Gizmos.color = new Color(1f, 0.5f, 0f, 0.3f);
            Gizmos.DrawWireSphere(transform.position, _behaviorConfig.detectionRange);

            // Draw patrol waypoints
            if (_behaviorConfig.patrol.waypoints != null &&
                _behaviorConfig.patrol.waypoints.Length > 0)
            {
                Gizmos.color = Color.blue;
                var waypoints = _behaviorConfig.patrol.waypoints;

                for (int i = 0; i < waypoints.Length; i++)
                {
                    Gizmos.DrawWireSphere(waypoints[i], 0.3f);

                    int nextIndex = (i + 1) % waypoints.Length;
                    if (nextIndex > i || _behaviorConfig.patrol.loop)
                    {
                        Gizmos.DrawLine(waypoints[i], waypoints[nextIndex]);
                    }
                }
            }

            // Draw wander area
            if (_behaviorConfig.wander.radius > 0)
            {
                Gizmos.color = new Color(0f, 1f, 0f, 0.2f);
                Gizmos.DrawWireSphere(transform.position, _behaviorConfig.wander.radius);
            }
        }

        private Color GetStateColor()
        {
            return CurrentState switch
            {
                AIStateType.Idle => Color.gray,
                AIStateType.Wander => Color.green,
                AIStateType.Patrol => Color.blue,
                AIStateType.Seek => Color.yellow,
                AIStateType.Flee => Color.red,
                AIStateType.Follow => Color.cyan,
                AIStateType.Alert => Color.magenta,
                AIStateType.Interact => Color.white,
                _ => Color.gray
            };
        }

        #endregion
    }
}
