// =============================================================================
// PerceptionSystem.cs - Vision, Hearing, and Detection System
// Iron Frontier - Unity 6
// Ported from YukaJS TypeScript implementation
// =============================================================================

using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.AI
{
    /// <summary>
    /// Handles AI perception including vision cones, hearing, and target detection.
    /// </summary>
    public class PerceptionSystem : MonoBehaviour
    {
        [Header("Vision Settings")]
        [SerializeField] private float _visionRange = 15f;
        [SerializeField] private float _visionAngle = 90f; // Field of view in degrees
        [SerializeField] private LayerMask _visionObstacleMask;
        [SerializeField] private LayerMask _targetMask;
        [SerializeField] private float _heightOffset = 1.5f;

        [Header("Hearing Settings")]
        [SerializeField] private float _hearingRange = 10f;
        [SerializeField] private bool _hearingEnabled = true;

        [Header("Detection Settings")]
        [SerializeField] private float _detectionUpdateRate = 0.2f;
        [SerializeField] private float _memoryDuration = 5f;

        [Header("Debug")]
        [SerializeField] private bool _showDebugGizmos = true;

        // Cached references
        private AIController _aiController;
        private Transform _playerTransform;

        // State
        private float _detectionTimer;
        private float _lastSeenTimer;
        private List<Transform> _visibleTargets = new List<Transform>();
        private List<Transform> _heardTargets = new List<Transform>();

        // Public accessors
        public bool CanSeePlayer { get; private set; }
        public bool CanHearPlayer { get; private set; }
        public Vector3? LastKnownPlayerPosition { get; private set; }
        public float DistanceToPlayer { get; private set; } = float.MaxValue;
        public IReadOnlyList<Transform> VisibleTargets => _visibleTargets;
        public IReadOnlyList<Transform> HeardTargets => _heardTargets;

        /// <summary>
        /// Event fired when the player is first detected
        /// </summary>
        public event Action OnPlayerDetected;

        /// <summary>
        /// Event fired when the player is lost from perception
        /// </summary>
        public event Action OnPlayerLost;

        private void Awake()
        {
            _aiController = GetComponent<AIController>();
        }

        private void Start()
        {
            // Find player - could be optimized with a singleton or manager
            var player = GameObject.FindGameObjectWithTag("Player");
            if (player != null)
            {
                _playerTransform = player.transform;
            }
        }

        private void Update()
        {
            _detectionTimer += Time.deltaTime;

            if (_detectionTimer >= _detectionUpdateRate)
            {
                _detectionTimer = 0f;
                UpdatePerception();
            }

            // Update memory timer
            if (LastKnownPlayerPosition.HasValue && !CanSeePlayer)
            {
                _lastSeenTimer += Time.deltaTime;
                if (_lastSeenTimer > _memoryDuration)
                {
                    LastKnownPlayerPosition = null;
                    _lastSeenTimer = 0f;
                }
            }
        }

        /// <summary>
        /// Set the player transform reference
        /// </summary>
        public void SetPlayerTransform(Transform player)
        {
            _playerTransform = player;
        }

        /// <summary>
        /// Update detection range from config
        /// </summary>
        public void SetDetectionRange(float range)
        {
            _visionRange = range;
        }

        /// <summary>
        /// Update field of view from config
        /// </summary>
        public void SetFieldOfView(float fovDegrees)
        {
            _visionAngle = fovDegrees;
        }

        private void UpdatePerception()
        {
            bool wasVisible = CanSeePlayer;

            _visibleTargets.Clear();
            _heardTargets.Clear();

            CanSeePlayer = false;
            CanHearPlayer = false;

            if (_playerTransform == null) return;

            // Calculate distance to player
            DistanceToPlayer = Vector3.Distance(transform.position, _playerTransform.position);

            // Check vision
            if (DistanceToPlayer <= _visionRange)
            {
                if (IsInFieldOfView(_playerTransform) && HasLineOfSight(_playerTransform))
                {
                    CanSeePlayer = true;
                    LastKnownPlayerPosition = _playerTransform.position;
                    _lastSeenTimer = 0f;
                    _visibleTargets.Add(_playerTransform);
                }
            }

            // Check hearing
            if (_hearingEnabled && DistanceToPlayer <= _hearingRange)
            {
                CanHearPlayer = true;
                _heardTargets.Add(_playerTransform);

                // Hearing can update last known position even without sight
                if (!CanSeePlayer && !LastKnownPlayerPosition.HasValue)
                {
                    LastKnownPlayerPosition = _playerTransform.position;
                }
            }

            // Fire events
            if (CanSeePlayer && !wasVisible)
            {
                OnPlayerDetected?.Invoke();
            }
            else if (!CanSeePlayer && wasVisible)
            {
                OnPlayerLost?.Invoke();
            }
        }

        /// <summary>
        /// Check if a target is within the field of view cone
        /// </summary>
        public bool IsInFieldOfView(Transform target)
        {
            if (target == null) return false;

            Vector3 directionToTarget = (target.position - transform.position).normalized;
            directionToTarget.y = 0f;

            Vector3 forward = transform.forward;
            forward.y = 0f;

            float angle = Vector3.Angle(forward, directionToTarget);
            return angle <= _visionAngle * 0.5f;
        }

        /// <summary>
        /// Check if there is an unobstructed line of sight to the target
        /// </summary>
        public bool HasLineOfSight(Transform target)
        {
            if (target == null) return false;

            Vector3 eyePosition = transform.position + Vector3.up * _heightOffset;
            Vector3 targetPosition = target.position + Vector3.up * _heightOffset;
            Vector3 direction = targetPosition - eyePosition;
            float distance = direction.magnitude;

            // Raycast to check for obstacles
            if (Physics.Raycast(eyePosition, direction.normalized, out RaycastHit hit, distance, _visionObstacleMask))
            {
                // Hit something that isn't the target
                return hit.transform == target;
            }

            return true;
        }

        /// <summary>
        /// Check if a specific position is within detection range and field of view
        /// </summary>
        public bool CanSeePosition(Vector3 position)
        {
            float distance = Vector3.Distance(transform.position, position);
            if (distance > _visionRange) return false;

            Vector3 direction = (position - transform.position).normalized;
            direction.y = 0f;

            Vector3 forward = transform.forward;
            forward.y = 0f;

            float angle = Vector3.Angle(forward, direction);
            if (angle > _visionAngle * 0.5f) return false;

            // Check line of sight
            Vector3 eyePosition = transform.position + Vector3.up * _heightOffset;
            if (Physics.Raycast(eyePosition, direction, distance, _visionObstacleMask))
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Simulate hearing a sound at a position with a given volume
        /// </summary>
        public void HearSound(Vector3 soundPosition, float volume)
        {
            if (!_hearingEnabled) return;

            float effectiveRange = _hearingRange * volume;
            float distance = Vector3.Distance(transform.position, soundPosition);

            if (distance <= effectiveRange)
            {
                // Sound heard - update last known position
                LastKnownPlayerPosition = soundPosition;
                _lastSeenTimer = 0f;
            }
        }

        /// <summary>
        /// Force detection of a target (e.g., when attacked)
        /// </summary>
        public void ForceDetection(Vector3 position)
        {
            LastKnownPlayerPosition = position;
            _lastSeenTimer = 0f;
        }

        /// <summary>
        /// Clear all perception memory
        /// </summary>
        public void ClearMemory()
        {
            LastKnownPlayerPosition = null;
            CanSeePlayer = false;
            CanHearPlayer = false;
            _lastSeenTimer = 0f;
            _visibleTargets.Clear();
            _heardTargets.Clear();
        }

        #region Gizmos

        private void OnDrawGizmos()
        {
            if (!_showDebugGizmos) return;

            DrawVisionCone();
            DrawHearingRange();
            DrawLastKnownPosition();
        }

        private void DrawVisionCone()
        {
            Vector3 position = transform.position + Vector3.up * 0.1f;
            Vector3 forward = transform.forward;

            // Draw vision range
            Gizmos.color = CanSeePlayer ? new Color(1f, 0f, 0f, 0.3f) : new Color(0f, 1f, 0f, 0.2f);

            // Draw cone edges
            float halfAngle = _visionAngle * 0.5f * Mathf.Deg2Rad;

            Vector3 leftDir = Quaternion.Euler(0f, -_visionAngle * 0.5f, 0f) * forward;
            Vector3 rightDir = Quaternion.Euler(0f, _visionAngle * 0.5f, 0f) * forward;

            Gizmos.DrawRay(position, leftDir * _visionRange);
            Gizmos.DrawRay(position, rightDir * _visionRange);
            Gizmos.DrawRay(position, forward * _visionRange);

            // Draw arc
            int segments = 20;
            float angleStep = _visionAngle / segments;
            Vector3 prevPoint = position + leftDir * _visionRange;

            for (int i = 1; i <= segments; i++)
            {
                float angle = -_visionAngle * 0.5f + angleStep * i;
                Vector3 dir = Quaternion.Euler(0f, angle, 0f) * forward;
                Vector3 point = position + dir * _visionRange;
                Gizmos.DrawLine(prevPoint, point);
                prevPoint = point;
            }
        }

        private void DrawHearingRange()
        {
            if (!_hearingEnabled) return;

            Gizmos.color = CanHearPlayer ? new Color(1f, 0.5f, 0f, 0.2f) : new Color(0f, 0.5f, 1f, 0.1f);
            Gizmos.DrawWireSphere(transform.position, _hearingRange);
        }

        private void DrawLastKnownPosition()
        {
            if (!LastKnownPlayerPosition.HasValue) return;

            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(LastKnownPlayerPosition.Value, 0.5f);
            Gizmos.DrawLine(transform.position, LastKnownPlayerPosition.Value);
        }

        #endregion
    }
}
