// =============================================================================
// SteeringBehaviors.cs - Steering Behaviors for AI Movement
// Iron Frontier - Unity 6
// Ported from YukaJS TypeScript implementation
// =============================================================================

using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.AI
{
    /// <summary>
    /// Base class for all steering behaviors
    /// </summary>
    public abstract class SteeringBehavior
    {
        public float Weight { get; set; } = 1f;
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Calculate the steering force for this behavior
        /// </summary>
        public abstract Vector3 Calculate(SteeringAgent agent);
    }

    /// <summary>
    /// Agent data required for steering calculations
    /// </summary>
    public class SteeringAgent
    {
        public Vector3 Position { get; set; }
        public Vector3 Velocity { get; set; }
        public Vector3 Forward { get; set; }
        public float MaxSpeed { get; set; }
        public float MaxForce { get; set; }
        public float Mass { get; set; } = 1f;

        public SteeringAgent(Transform transform, float maxSpeed, float maxForce)
        {
            Position = transform.position;
            Forward = transform.forward;
            Velocity = Vector3.zero;
            MaxSpeed = maxSpeed;
            MaxForce = maxForce;
        }

        public void UpdateFromTransform(Transform transform, Vector3 currentVelocity)
        {
            Position = transform.position;
            Forward = transform.forward;
            Velocity = currentVelocity;
        }
    }

    /// <summary>
    /// Seek behavior - move toward a target position
    /// </summary>
    public class SeekBehavior : SteeringBehavior
    {
        public Vector3 Target { get; set; }

        public SeekBehavior(Vector3 target)
        {
            Target = target;
        }

        public override Vector3 Calculate(SteeringAgent agent)
        {
            Vector3 desiredVelocity = (Target - agent.Position).normalized * agent.MaxSpeed;
            return Vector3.ClampMagnitude(desiredVelocity - agent.Velocity, agent.MaxForce);
        }
    }

    /// <summary>
    /// Flee behavior - move away from a threat position
    /// </summary>
    public class FleeBehavior : SteeringBehavior
    {
        public Vector3 Threat { get; set; }
        public float PanicDistance { get; set; } = 10f;

        public FleeBehavior(Vector3 threat, float panicDistance = 10f)
        {
            Threat = threat;
            PanicDistance = panicDistance;
        }

        public override Vector3 Calculate(SteeringAgent agent)
        {
            float distanceSqr = (agent.Position - Threat).sqrMagnitude;

            // Only flee if within panic distance
            if (distanceSqr > PanicDistance * PanicDistance)
            {
                return Vector3.zero;
            }

            Vector3 desiredVelocity = (agent.Position - Threat).normalized * agent.MaxSpeed;
            return Vector3.ClampMagnitude(desiredVelocity - agent.Velocity, agent.MaxForce);
        }
    }

    /// <summary>
    /// Arrive behavior - seek with deceleration near target
    /// </summary>
    public class ArriveBehavior : SteeringBehavior
    {
        public Vector3 Target { get; set; }
        public float SlowingRadius { get; set; } = 5f;

        public ArriveBehavior(Vector3 target, float slowingRadius = 5f)
        {
            Target = target;
            SlowingRadius = slowingRadius;
        }

        public override Vector3 Calculate(SteeringAgent agent)
        {
            Vector3 toTarget = Target - agent.Position;
            float distance = toTarget.magnitude;

            if (distance < 0.01f)
            {
                return -agent.Velocity; // Full stop
            }

            // Calculate desired speed based on distance
            float desiredSpeed = agent.MaxSpeed;

            if (distance < SlowingRadius)
            {
                desiredSpeed = agent.MaxSpeed * (distance / SlowingRadius);
            }

            Vector3 desiredVelocity = toTarget.normalized * desiredSpeed;
            return Vector3.ClampMagnitude(desiredVelocity - agent.Velocity, agent.MaxForce);
        }
    }

    /// <summary>
    /// Wander behavior - realistic random movement
    /// </summary>
    public class WanderBehavior : SteeringBehavior
    {
        public float WanderRadius { get; set; } = 1.2f;
        public float WanderDistance { get; set; } = 2f;
        public float WanderJitter { get; set; } = 0.3f;

        private Vector3 _wanderTarget;

        public WanderBehavior(float radius = 1.2f, float distance = 2f, float jitter = 0.3f)
        {
            WanderRadius = radius;
            WanderDistance = distance;
            WanderJitter = jitter;

            // Initialize with random point on circle
            float theta = UnityEngine.Random.Range(0f, Mathf.PI * 2f);
            _wanderTarget = new Vector3(
                WanderRadius * Mathf.Cos(theta),
                0f,
                WanderRadius * Mathf.Sin(theta)
            );
        }

        public override Vector3 Calculate(SteeringAgent agent)
        {
            // Add random jitter to the wander target
            _wanderTarget += new Vector3(
                UnityEngine.Random.Range(-1f, 1f) * WanderJitter,
                0f,
                UnityEngine.Random.Range(-1f, 1f) * WanderJitter
            );

            // Project back onto the circle
            _wanderTarget = _wanderTarget.normalized * WanderRadius;

            // Calculate the target in world space
            Vector3 targetLocal = agent.Forward * WanderDistance + _wanderTarget;
            Vector3 targetWorld = agent.Position + targetLocal;

            // Seek the target
            Vector3 desiredVelocity = (targetWorld - agent.Position).normalized * agent.MaxSpeed;
            return Vector3.ClampMagnitude(desiredVelocity - agent.Velocity, agent.MaxForce);
        }
    }

    /// <summary>
    /// Follow Path behavior - follow a series of waypoints
    /// </summary>
    public class FollowPathBehavior : SteeringBehavior
    {
        public List<Vector3> Path { get; private set; }
        public bool Loop { get; set; }
        public float WaypointRadius { get; set; } = 1f;

        private int _currentWaypoint;
        private ArriveBehavior _arriveBehavior;
        private SeekBehavior _seekBehavior;

        public int CurrentWaypointIndex => _currentWaypoint;
        public bool HasReachedEnd => !Loop && _currentWaypoint >= Path.Count;

        public FollowPathBehavior(List<Vector3> path, bool loop = true, float waypointRadius = 1f)
        {
            Path = path ?? new List<Vector3>();
            Loop = loop;
            WaypointRadius = waypointRadius;
            _currentWaypoint = 0;
            _arriveBehavior = new ArriveBehavior(Vector3.zero, waypointRadius * 2f);
            _seekBehavior = new SeekBehavior(Vector3.zero);
        }

        public void SetPath(List<Vector3> path)
        {
            Path = path ?? new List<Vector3>();
            _currentWaypoint = 0;
        }

        public void Reset()
        {
            _currentWaypoint = 0;
        }

        public override Vector3 Calculate(SteeringAgent agent)
        {
            if (Path == null || Path.Count == 0 || HasReachedEnd)
            {
                return Vector3.zero;
            }

            Vector3 target = Path[_currentWaypoint];
            float distanceSqr = (agent.Position - target).sqrMagnitude;

            // Check if we've reached the current waypoint
            if (distanceSqr < WaypointRadius * WaypointRadius)
            {
                _currentWaypoint++;

                if (_currentWaypoint >= Path.Count)
                {
                    if (Loop)
                    {
                        _currentWaypoint = 0;
                    }
                    else
                    {
                        return Vector3.zero; // End of path
                    }
                }
            }

            // Use arrive for last waypoint if not looping
            if (!Loop && _currentWaypoint == Path.Count - 1)
            {
                _arriveBehavior.Target = Path[_currentWaypoint];
                return _arriveBehavior.Calculate(agent);
            }

            // Use seek for intermediate waypoints
            _seekBehavior.Target = Path[_currentWaypoint];
            return _seekBehavior.Calculate(agent);
        }
    }

    /// <summary>
    /// Pursuit behavior - intercept a moving target
    /// </summary>
    public class PursuitBehavior : SteeringBehavior
    {
        public Transform Target { get; set; }
        public float MaxPredictionTime { get; set; } = 1f;

        private Vector3 _lastTargetPosition;
        private Vector3 _targetVelocity;

        public PursuitBehavior(Transform target, float maxPredictionTime = 1f)
        {
            Target = target;
            MaxPredictionTime = maxPredictionTime;
            if (target != null)
            {
                _lastTargetPosition = target.position;
            }
        }

        public override Vector3 Calculate(SteeringAgent agent)
        {
            if (Target == null) return Vector3.zero;

            // Estimate target velocity
            _targetVelocity = (Target.position - _lastTargetPosition) / Time.deltaTime;
            _lastTargetPosition = Target.position;

            // Calculate time to intercept
            Vector3 toTarget = Target.position - agent.Position;
            float distance = toTarget.magnitude;
            float relativeSpeed = (agent.Velocity - _targetVelocity).magnitude;

            float predictionTime = relativeSpeed > 0.01f
                ? Mathf.Min(distance / relativeSpeed, MaxPredictionTime)
                : MaxPredictionTime;

            // Predict future position
            Vector3 predictedPosition = Target.position + _targetVelocity * predictionTime;

            // Seek the predicted position
            Vector3 desiredVelocity = (predictedPosition - agent.Position).normalized * agent.MaxSpeed;
            return Vector3.ClampMagnitude(desiredVelocity - agent.Velocity, agent.MaxForce);
        }
    }

    /// <summary>
    /// Evade behavior - flee from a moving threat
    /// </summary>
    public class EvadeBehavior : SteeringBehavior
    {
        public Transform Threat { get; set; }
        public float PanicDistance { get; set; } = 15f;
        public float MaxPredictionTime { get; set; } = 1f;

        private Vector3 _lastThreatPosition;
        private Vector3 _threatVelocity;

        public EvadeBehavior(Transform threat, float panicDistance = 15f)
        {
            Threat = threat;
            PanicDistance = panicDistance;
            if (threat != null)
            {
                _lastThreatPosition = threat.position;
            }
        }

        public override Vector3 Calculate(SteeringAgent agent)
        {
            if (Threat == null) return Vector3.zero;

            Vector3 toThreat = Threat.position - agent.Position;
            float distance = toThreat.magnitude;

            // Only evade if within panic distance
            if (distance > PanicDistance)
            {
                return Vector3.zero;
            }

            // Estimate threat velocity
            _threatVelocity = (Threat.position - _lastThreatPosition) / Time.deltaTime;
            _lastThreatPosition = Threat.position;

            // Predict future position
            float predictionTime = Mathf.Min(distance / agent.MaxSpeed, MaxPredictionTime);
            Vector3 predictedPosition = Threat.position + _threatVelocity * predictionTime;

            // Flee from predicted position
            Vector3 desiredVelocity = (agent.Position - predictedPosition).normalized * agent.MaxSpeed;
            return Vector3.ClampMagnitude(desiredVelocity - agent.Velocity, agent.MaxForce);
        }
    }

    /// <summary>
    /// Obstacle Avoidance behavior
    /// </summary>
    public class ObstacleAvoidanceBehavior : SteeringBehavior
    {
        public float DetectionLength { get; set; } = 5f;
        public float AvoidanceForce { get; set; } = 10f;
        public LayerMask ObstacleMask { get; set; }

        public ObstacleAvoidanceBehavior(float detectionLength = 5f, LayerMask obstacleMask = default)
        {
            DetectionLength = detectionLength;
            ObstacleMask = obstacleMask;
        }

        public override Vector3 Calculate(SteeringAgent agent)
        {
            // Scale detection length with speed
            float dynamicLength = DetectionLength * (agent.Velocity.magnitude / agent.MaxSpeed);
            dynamicLength = Mathf.Max(dynamicLength, 2f);

            // Cast ray forward
            if (Physics.Raycast(agent.Position, agent.Forward, out RaycastHit hit, dynamicLength, ObstacleMask))
            {
                // Calculate lateral force to avoid obstacle
                Vector3 avoidanceForce = Vector3.Cross(Vector3.up, agent.Forward);

                // Choose side based on which is closer to clear
                Vector3 toObstacle = hit.point - agent.Position;
                if (Vector3.Dot(toObstacle, avoidanceForce) > 0)
                {
                    avoidanceForce = -avoidanceForce;
                }

                // Scale force inversely with distance
                float urgency = 1f - (hit.distance / dynamicLength);
                return avoidanceForce.normalized * AvoidanceForce * urgency;
            }

            return Vector3.zero;
        }
    }

    /// <summary>
    /// Separation behavior - maintain distance from neighbors
    /// </summary>
    public class SeparationBehavior : SteeringBehavior
    {
        public List<Transform> Neighbors { get; set; }
        public float DesiredSeparation { get; set; } = 2f;

        public SeparationBehavior(float desiredSeparation = 2f)
        {
            DesiredSeparation = desiredSeparation;
            Neighbors = new List<Transform>();
        }

        public override Vector3 Calculate(SteeringAgent agent)
        {
            if (Neighbors == null || Neighbors.Count == 0)
            {
                return Vector3.zero;
            }

            Vector3 steeringForce = Vector3.zero;
            int count = 0;

            foreach (var neighbor in Neighbors)
            {
                if (neighbor == null) continue;

                Vector3 toAgent = agent.Position - neighbor.position;
                float distance = toAgent.magnitude;

                if (distance > 0.01f && distance < DesiredSeparation)
                {
                    // Scale force inversely with distance
                    Vector3 force = toAgent.normalized / distance;
                    steeringForce += force;
                    count++;
                }
            }

            if (count > 0)
            {
                steeringForce /= count;
                steeringForce = steeringForce.normalized * agent.MaxForce;
            }

            return steeringForce;
        }
    }

    /// <summary>
    /// Manages and combines multiple steering behaviors
    /// </summary>
    public class SteeringManager
    {
        private List<SteeringBehavior> _behaviors = new List<SteeringBehavior>();
        private SteeringAgent _agent;

        public SteeringManager(Transform transform, float maxSpeed, float maxForce)
        {
            _agent = new SteeringAgent(transform, maxSpeed, maxForce);
        }

        public void Add(SteeringBehavior behavior)
        {
            _behaviors.Add(behavior);
        }

        public void Remove(SteeringBehavior behavior)
        {
            _behaviors.Remove(behavior);
        }

        public void Clear()
        {
            _behaviors.Clear();
        }

        public void UpdateAgent(Transform transform, Vector3 currentVelocity)
        {
            _agent.UpdateFromTransform(transform, currentVelocity);
        }

        /// <summary>
        /// Calculate the combined steering force from all behaviors
        /// </summary>
        public Vector3 Calculate()
        {
            Vector3 totalForce = Vector3.zero;

            foreach (var behavior in _behaviors)
            {
                if (!behavior.IsActive) continue;

                Vector3 force = behavior.Calculate(_agent) * behavior.Weight;
                totalForce += force;

                // Clamp to max force
                if (totalForce.magnitude > _agent.MaxForce)
                {
                    totalForce = totalForce.normalized * _agent.MaxForce;
                    break; // Prioritized truncation
                }
            }

            return totalForce;
        }
    }
}
