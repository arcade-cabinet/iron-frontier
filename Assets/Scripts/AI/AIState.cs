// =============================================================================
// AIState.cs - AI State Definitions and State Machine
// Iron Frontier - Unity 6
// Ported from YukaJS TypeScript implementation
// =============================================================================

using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.AI
{
    /// <summary>
    /// AI behavior states matching the YukaJS implementation
    /// </summary>
    public enum AIStateType
    {
        Idle,
        Wander,
        Patrol,
        Seek,
        Flee,
        Follow,
        Interact,
        Alert
    }

    /// <summary>
    /// Base class for AI states in the state machine
    /// </summary>
    public abstract class AIStateBase
    {
        public AIStateType StateType { get; protected set; }

        /// <summary>
        /// Called when entering this state
        /// </summary>
        public virtual void Enter(AIController controller) { }

        /// <summary>
        /// Called every update while in this state
        /// </summary>
        public abstract void Execute(AIController controller, float deltaTime);

        /// <summary>
        /// Called when exiting this state
        /// </summary>
        public virtual void Exit(AIController controller) { }
    }

    /// <summary>
    /// Idle state - NPC stands still
    /// </summary>
    public class IdleState : AIStateBase
    {
        public IdleState()
        {
            StateType = AIStateType.Idle;
        }

        public override void Enter(AIController controller)
        {
            controller.StopMovement();
        }

        public override void Execute(AIController controller, float deltaTime)
        {
            // Check if player is in detection range
            if (controller.Perception.CanSeePlayer &&
                controller.Config.defaultState != AIStateType.Idle)
            {
                controller.StateMachine.ChangeState(AIStateType.Alert);
            }
        }
    }

    /// <summary>
    /// Wander state - NPC moves randomly within an area
    /// </summary>
    public class WanderState : AIStateBase
    {
        private Vector3 _wanderTarget;
        private float _wanderTimer;
        private const float WANDER_INTERVAL = 3f;

        public WanderState()
        {
            StateType = AIStateType.Wander;
        }

        public override void Enter(AIController controller)
        {
            controller.SetSpeed(controller.Config.maxSpeed * 0.5f);
            PickNewWanderTarget(controller);
        }

        public override void Execute(AIController controller, float deltaTime)
        {
            _wanderTimer += deltaTime;

            // Check if player is in detection range
            if (controller.Perception.CanSeePlayer)
            {
                controller.StateMachine.ChangeState(AIStateType.Alert);
                return;
            }

            // Check if reached target or timer expired
            float distanceToTarget = Vector3.Distance(
                controller.transform.position,
                _wanderTarget
            );

            if (distanceToTarget < controller.Config.arrivalTolerance ||
                _wanderTimer >= WANDER_INTERVAL)
            {
                PickNewWanderTarget(controller);
                _wanderTimer = 0f;
            }

            // Move toward wander target
            controller.MoveTo(_wanderTarget);
        }

        public override void Exit(AIController controller)
        {
            controller.StopMovement();
        }

        private void PickNewWanderTarget(AIController controller)
        {
            var wanderConfig = controller.Config.wander;
            Vector3 currentPos = controller.transform.position;

            // Random point within wander radius
            Vector2 randomCircle = UnityEngine.Random.insideUnitCircle * wanderConfig.radius;
            _wanderTarget = currentPos + new Vector3(randomCircle.x, 0f, randomCircle.y);

            // Add jitter
            _wanderTarget += new Vector3(
                UnityEngine.Random.Range(-wanderConfig.jitter, wanderConfig.jitter),
                0f,
                UnityEngine.Random.Range(-wanderConfig.jitter, wanderConfig.jitter)
            );
        }
    }

    /// <summary>
    /// Patrol state - NPC follows waypoints
    /// </summary>
    public class PatrolState : AIStateBase
    {
        private int _currentWaypointIndex;
        private float _waitTimer;
        private bool _isWaiting;

        public PatrolState()
        {
            StateType = AIStateType.Patrol;
        }

        public override void Enter(AIController controller)
        {
            var patrolConfig = controller.Config.patrol;

            if (patrolConfig.waypoints == null || patrolConfig.waypoints.Length == 0)
            {
                Debug.LogWarning($"[AI] {controller.name} has no patrol waypoints, switching to Idle");
                controller.StateMachine.ChangeState(AIStateType.Idle);
                return;
            }

            controller.SetSpeed(controller.Config.maxSpeed * 0.7f);
            _currentWaypointIndex = 0;
            _waitTimer = 0f;
            _isWaiting = false;
        }

        public override void Execute(AIController controller, float deltaTime)
        {
            // Check if player is in detection range
            if (controller.Perception.CanSeePlayer)
            {
                controller.StateMachine.ChangeState(AIStateType.Alert);
                return;
            }

            var patrolConfig = controller.Config.patrol;
            if (patrolConfig.waypoints == null || patrolConfig.waypoints.Length == 0)
                return;

            if (_isWaiting)
            {
                _waitTimer += deltaTime;
                if (_waitTimer >= patrolConfig.waitTime)
                {
                    _isWaiting = false;
                    _waitTimer = 0f;
                    MoveToNextWaypoint(patrolConfig);
                }
                return;
            }

            Vector3 target = patrolConfig.waypoints[_currentWaypointIndex];
            float distance = Vector3.Distance(controller.transform.position, target);

            if (distance < controller.Config.arrivalTolerance)
            {
                _isWaiting = true;
                controller.StopMovement();
            }
            else
            {
                controller.MoveTo(target);
            }
        }

        public override void Exit(AIController controller)
        {
            controller.StopMovement();
        }

        private void MoveToNextWaypoint(PatrolConfig config)
        {
            _currentWaypointIndex++;

            if (_currentWaypointIndex >= config.waypoints.Length)
            {
                if (config.loop)
                {
                    _currentWaypointIndex = 0;
                }
                else
                {
                    _currentWaypointIndex = config.waypoints.Length - 1;
                }
            }
        }
    }

    /// <summary>
    /// Alert state - NPC noticed the player
    /// </summary>
    public class AlertState : AIStateBase
    {
        private float _alertTimer;
        private const float ALERT_DURATION = 0.5f;

        public AlertState()
        {
            StateType = AIStateType.Alert;
        }

        public override void Enter(AIController controller)
        {
            controller.StopMovement();
            _alertTimer = 0f;
        }

        public override void Execute(AIController controller, float deltaTime)
        {
            _alertTimer += deltaTime;

            // Face the player
            if (controller.Perception.LastKnownPlayerPosition.HasValue)
            {
                controller.LookAt(controller.Perception.LastKnownPlayerPosition.Value);
            }

            // After brief pause, decide next action
            if (_alertTimer > ALERT_DURATION)
            {
                // Return to default state (could add hostile/friendly logic here)
                controller.StateMachine.ChangeState(controller.Config.defaultState);
            }
        }
    }

    /// <summary>
    /// Seek state - NPC moves toward a target position
    /// </summary>
    public class SeekState : AIStateBase
    {
        public SeekState()
        {
            StateType = AIStateType.Seek;
        }

        public override void Enter(AIController controller)
        {
            controller.SetSpeed(controller.Config.maxSpeed);
        }

        public override void Execute(AIController controller, float deltaTime)
        {
            if (!controller.TargetPosition.HasValue)
            {
                controller.StateMachine.ChangeState(controller.Config.defaultState);
                return;
            }

            Vector3 target = controller.TargetPosition.Value;
            float distance = Vector3.Distance(controller.transform.position, target);

            if (distance < controller.Config.arrivalTolerance)
            {
                controller.StateMachine.ChangeState(controller.Config.defaultState);
                return;
            }

            controller.MoveTo(target);
        }

        public override void Exit(AIController controller)
        {
            controller.StopMovement();
        }
    }

    /// <summary>
    /// Flee state - NPC runs away from player
    /// </summary>
    public class FleeState : AIStateBase
    {
        private float _fleeTimer;
        private const float FLEE_DURATION = 3f;

        public FleeState()
        {
            StateType = AIStateType.Flee;
        }

        public override void Enter(AIController controller)
        {
            controller.SetSpeed(controller.Config.maxSpeed * 1.2f); // Run faster when fleeing
            _fleeTimer = 0f;
        }

        public override void Execute(AIController controller, float deltaTime)
        {
            _fleeTimer += deltaTime;

            // Stop fleeing after some time or when far enough
            if (_fleeTimer > FLEE_DURATION || !controller.Perception.CanSeePlayer)
            {
                controller.StateMachine.ChangeState(controller.Config.defaultState);
                return;
            }

            // Calculate flee direction (away from player)
            if (controller.Perception.LastKnownPlayerPosition.HasValue)
            {
                Vector3 fleeDirection = controller.transform.position -
                    controller.Perception.LastKnownPlayerPosition.Value;
                fleeDirection.y = 0f;
                fleeDirection.Normalize();

                Vector3 fleeTarget = controller.transform.position + fleeDirection * 10f;
                controller.MoveTo(fleeTarget);
            }
        }

        public override void Exit(AIController controller)
        {
            controller.StopMovement();
        }
    }

    /// <summary>
    /// Follow state - NPC follows a target entity
    /// </summary>
    public class FollowState : AIStateBase
    {
        public FollowState()
        {
            StateType = AIStateType.Follow;
        }

        public override void Enter(AIController controller)
        {
            controller.SetSpeed(controller.Config.maxSpeed);
        }

        public override void Execute(AIController controller, float deltaTime)
        {
            if (controller.FollowTarget == null)
            {
                controller.StateMachine.ChangeState(controller.Config.defaultState);
                return;
            }

            Vector3 targetPos = controller.FollowTarget.position;
            float distance = Vector3.Distance(controller.transform.position, targetPos);

            // Maintain following distance
            if (distance > controller.Config.followDistance)
            {
                controller.MoveTo(targetPos);
            }
            else
            {
                controller.StopMovement();
            }
        }

        public override void Exit(AIController controller)
        {
            controller.StopMovement();
        }
    }

    /// <summary>
    /// Interact state - NPC is interacting with something
    /// </summary>
    public class InteractState : AIStateBase
    {
        public InteractState()
        {
            StateType = AIStateType.Interact;
        }

        public override void Enter(AIController controller)
        {
            controller.StopMovement();
        }

        public override void Execute(AIController controller, float deltaTime)
        {
            // Stay in interact state until explicitly changed
            // Interaction logic handled externally
        }
    }

    /// <summary>
    /// State machine for managing AI states
    /// </summary>
    public class AIStateMachine
    {
        private AIController _controller;
        private Dictionary<AIStateType, AIStateBase> _states;
        private AIStateBase _currentState;

        public AIStateType CurrentStateType => _currentState?.StateType ?? AIStateType.Idle;
        public string CurrentStateName => CurrentStateType.ToString().ToLower();

        public AIStateMachine(AIController controller)
        {
            _controller = controller;
            _states = new Dictionary<AIStateType, AIStateBase>
            {
                { AIStateType.Idle, new IdleState() },
                { AIStateType.Wander, new WanderState() },
                { AIStateType.Patrol, new PatrolState() },
                { AIStateType.Alert, new AlertState() },
                { AIStateType.Seek, new SeekState() },
                { AIStateType.Flee, new FleeState() },
                { AIStateType.Follow, new FollowState() },
                { AIStateType.Interact, new InteractState() }
            };
        }

        /// <summary>
        /// Change to a new state
        /// </summary>
        public void ChangeState(AIStateType newState)
        {
            if (!_states.TryGetValue(newState, out var state))
            {
                Debug.LogError($"[AI] Unknown state: {newState}");
                return;
            }

            _currentState?.Exit(_controller);
            _currentState = state;
            _currentState.Enter(_controller);
        }

        /// <summary>
        /// Update the current state
        /// </summary>
        public void Update(float deltaTime)
        {
            _currentState?.Execute(_controller, deltaTime);
        }
    }
}
