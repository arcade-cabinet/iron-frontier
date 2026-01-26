// =============================================================================
// AIManager.cs - Central AI Entity Management and Updates
// Iron Frontier - Unity 6
// Ported from YukaJS TypeScript implementation
// =============================================================================

using System;
using System.Collections.Generic;
using UnityEngine;

namespace IronFrontier.AI
{
    /// <summary>
    /// Result of an AI entity update, used for synchronizing with other systems
    /// </summary>
    public struct AIUpdateResult
    {
        public string Id;
        public Vector3 Position;
        public Vector3 Direction;
        public AIStateType State;
        public bool WantsToInteract;
    }

    /// <summary>
    /// Configuration for the AI system
    /// </summary>
    [Serializable]
    public class AISystemConfig
    {
        [Tooltip("Maximum number of AI entities to update per frame")]
        public int maxUpdatesPerFrame = 50;

        [Tooltip("Fixed timestep for AI simulation (seconds)")]
        public float fixedTimestep = 1f / 30f; // 30 AI updates per second

        [Tooltip("Enable debug visualization")]
        public bool debug = false;

        [Tooltip("Maximum distance for AI updates (entities beyond this are paused)")]
        public float maxUpdateDistance = 100f;

        public static AISystemConfig Default => new AISystemConfig();
    }

    /// <summary>
    /// Central manager for all AI entities.
    /// Handles entity registration, updates, and player tracking.
    /// </summary>
    public class AIManager : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private AISystemConfig _config = AISystemConfig.Default;

        [Header("Player Reference")]
        [SerializeField] private Transform _playerTransform;

        [Header("Debug")]
        [SerializeField] private bool _showDebugInfo;

        // Entity tracking
        private Dictionary<string, AIController> _entities = new Dictionary<string, AIController>();
        private List<AIController> _activeEntities = new List<AIController>();
        private List<AIUpdateResult> _updateResults = new List<AIUpdateResult>();

        // Timing
        private float _accumulator;
        private int _updatesThisFrame;

        // Singleton pattern (optional - can be removed if using DI)
        public static AIManager Instance { get; private set; }

        // Public accessors
        public IReadOnlyDictionary<string, AIController> Entities => _entities;
        public IReadOnlyList<AIUpdateResult> UpdateResults => _updateResults;
        public int EntityCount => _entities.Count;
        public int ActiveEntityCount => _activeEntities.Count;
        public Transform PlayerTransform => _playerTransform;

        /// <summary>
        /// Event fired after all AI entities have been updated
        /// </summary>
        public event Action<IReadOnlyList<AIUpdateResult>> OnEntitiesUpdated;

        private void Awake()
        {
            // Singleton setup
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        private void Start()
        {
            // Try to find player if not assigned
            if (_playerTransform == null)
            {
                var player = GameObject.FindGameObjectWithTag("Player");
                if (player != null)
                {
                    _playerTransform = player.transform;
                }
            }
        }

        private void Update()
        {
            UpdateAI(Time.deltaTime);
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        #region Entity Management

        /// <summary>
        /// Register an AI entity with the manager
        /// </summary>
        public void RegisterEntity(AIController entity)
        {
            if (entity == null) return;

            string id = entity.EntityId;

            if (_entities.ContainsKey(id))
            {
                Debug.LogWarning($"[AIManager] Entity {id} already registered, updating reference");
                _entities[id] = entity;
            }
            else
            {
                _entities.Add(id, entity);
            }

            // Set player reference for perception
            if (_playerTransform != null && entity.Perception != null)
            {
                entity.Perception.SetPlayerTransform(_playerTransform);
            }

            if (_config.debug)
            {
                Debug.Log($"[AIManager] Registered entity: {id}");
            }
        }

        /// <summary>
        /// Unregister an AI entity
        /// </summary>
        public void UnregisterEntity(AIController entity)
        {
            if (entity == null) return;
            UnregisterEntity(entity.EntityId);
        }

        /// <summary>
        /// Unregister an AI entity by ID
        /// </summary>
        public void UnregisterEntity(string id)
        {
            if (_entities.Remove(id))
            {
                if (_config.debug)
                {
                    Debug.Log($"[AIManager] Unregistered entity: {id}");
                }
            }
        }

        /// <summary>
        /// Get an entity by ID
        /// </summary>
        public AIController GetEntity(string id)
        {
            _entities.TryGetValue(id, out var entity);
            return entity;
        }

        /// <summary>
        /// Check if an entity is registered
        /// </summary>
        public bool HasEntity(string id)
        {
            return _entities.ContainsKey(id);
        }

        /// <summary>
        /// Clear all registered entities
        /// </summary>
        public void ClearAllEntities()
        {
            _entities.Clear();
            _activeEntities.Clear();
            _updateResults.Clear();
        }

        #endregion

        #region Player Management

        /// <summary>
        /// Set the player transform for perception tracking
        /// </summary>
        public void SetPlayerTransform(Transform player)
        {
            _playerTransform = player;

            // Update all entity perceptions
            foreach (var entity in _entities.Values)
            {
                if (entity?.Perception != null)
                {
                    entity.Perception.SetPlayerTransform(player);
                }
            }
        }

        /// <summary>
        /// Get the current player position
        /// </summary>
        public Vector3 GetPlayerPosition()
        {
            return _playerTransform != null ? _playerTransform.position : Vector3.zero;
        }

        #endregion

        #region Entity Commands

        /// <summary>
        /// Command an entity to seek a position
        /// </summary>
        public void CommandSeek(string entityId, Vector3 position)
        {
            if (_entities.TryGetValue(entityId, out var entity))
            {
                entity.SetTargetPosition(position);
            }
        }

        /// <summary>
        /// Command an entity to follow a target
        /// </summary>
        public void CommandFollow(string entityId, Transform target)
        {
            if (_entities.TryGetValue(entityId, out var entity))
            {
                entity.SetFollowTarget(target);
            }
        }

        /// <summary>
        /// Command an entity to change state
        /// </summary>
        public void CommandState(string entityId, AIStateType state)
        {
            if (_entities.TryGetValue(entityId, out var entity))
            {
                entity.ForceState(state);
            }
        }

        /// <summary>
        /// Alert all entities within a radius about a position (e.g., gunshot)
        /// </summary>
        public void AlertEntitiesInRadius(Vector3 position, float radius, float volume = 1f)
        {
            foreach (var entity in _entities.Values)
            {
                if (entity?.Perception == null) continue;

                float distance = Vector3.Distance(entity.transform.position, position);
                if (distance <= radius)
                {
                    entity.Perception.HearSound(position, volume);
                }
            }
        }

        /// <summary>
        /// Make all entities within a radius flee from a position
        /// </summary>
        public void TriggerFleeInRadius(Vector3 position, float radius)
        {
            foreach (var entity in _entities.Values)
            {
                if (entity == null) continue;

                float distance = Vector3.Distance(entity.transform.position, position);
                if (distance <= radius)
                {
                    entity.Perception?.ForceDetection(position);
                    entity.ForceState(AIStateType.Flee);
                }
            }
        }

        #endregion

        #region Update Loop

        private void UpdateAI(float deltaTime)
        {
            _accumulator += deltaTime;
            _updatesThisFrame = 0;

            // Fixed timestep update
            while (_accumulator >= _config.fixedTimestep &&
                   _updatesThisFrame < _config.maxUpdatesPerFrame)
            {
                _accumulator -= _config.fixedTimestep;
                UpdateActiveEntities();
            }

            // Collect results
            CollectUpdateResults();

            // Fire event
            OnEntitiesUpdated?.Invoke(_updateResults);
        }

        private void UpdateActiveEntities()
        {
            _activeEntities.Clear();

            // Determine which entities are active based on distance
            foreach (var entity in _entities.Values)
            {
                if (entity == null || !entity.gameObject.activeInHierarchy)
                    continue;

                // Check distance if we have a player reference
                if (_playerTransform != null)
                {
                    float distance = Vector3.Distance(
                        entity.transform.position,
                        _playerTransform.position
                    );

                    if (distance <= _config.maxUpdateDistance)
                    {
                        _activeEntities.Add(entity);
                    }
                }
                else
                {
                    _activeEntities.Add(entity);
                }
            }

            // Sort by distance to player for priority updates
            if (_playerTransform != null)
            {
                _activeEntities.Sort((a, b) =>
                {
                    float distA = Vector3.Distance(a.transform.position, _playerTransform.position);
                    float distB = Vector3.Distance(b.transform.position, _playerTransform.position);
                    return distA.CompareTo(distB);
                });
            }

            _updatesThisFrame = _activeEntities.Count;
        }

        private void CollectUpdateResults()
        {
            _updateResults.Clear();

            foreach (var entity in _activeEntities)
            {
                if (entity == null) continue;

                var npcBehavior = entity.GetComponent<NPCBehavior>();
                bool wantsToInteract = npcBehavior != null &&
                                       npcBehavior.CanInteract &&
                                       npcBehavior.IsPlayerInInteractionRange();

                Vector3 direction = entity.Velocity.sqrMagnitude > 0.01f
                    ? entity.Velocity.normalized
                    : entity.transform.forward;

                _updateResults.Add(new AIUpdateResult
                {
                    Id = entity.EntityId,
                    Position = entity.transform.position,
                    Direction = new Vector3(direction.x, 0f, direction.z),
                    State = entity.CurrentState,
                    WantsToInteract = wantsToInteract
                });
            }
        }

        #endregion

        #region Queries

        /// <summary>
        /// Get all entities within a radius of a position
        /// </summary>
        public List<AIController> GetEntitiesInRadius(Vector3 position, float radius)
        {
            var result = new List<AIController>();
            float radiusSqr = radius * radius;

            foreach (var entity in _entities.Values)
            {
                if (entity == null) continue;

                float distSqr = (entity.transform.position - position).sqrMagnitude;
                if (distSqr <= radiusSqr)
                {
                    result.Add(entity);
                }
            }

            return result;
        }

        /// <summary>
        /// Get the nearest entity to a position
        /// </summary>
        public AIController GetNearestEntity(Vector3 position, float maxDistance = float.MaxValue)
        {
            AIController nearest = null;
            float nearestDist = maxDistance;

            foreach (var entity in _entities.Values)
            {
                if (entity == null) continue;

                float dist = Vector3.Distance(entity.transform.position, position);
                if (dist < nearestDist)
                {
                    nearestDist = dist;
                    nearest = entity;
                }
            }

            return nearest;
        }

        /// <summary>
        /// Get all entities in a specific state
        /// </summary>
        public List<AIController> GetEntitiesInState(AIStateType state)
        {
            var result = new List<AIController>();

            foreach (var entity in _entities.Values)
            {
                if (entity != null && entity.CurrentState == state)
                {
                    result.Add(entity);
                }
            }

            return result;
        }

        /// <summary>
        /// Get all entities that can see the player
        /// </summary>
        public List<AIController> GetEntitiesThatCanSeePlayer()
        {
            var result = new List<AIController>();

            foreach (var entity in _entities.Values)
            {
                if (entity?.Perception != null && entity.Perception.CanSeePlayer)
                {
                    result.Add(entity);
                }
            }

            return result;
        }

        #endregion

        #region Debug

        private void OnGUI()
        {
            if (!_showDebugInfo) return;

            GUILayout.BeginArea(new Rect(10, 10, 300, 200));
            GUILayout.BeginVertical("box");

            GUILayout.Label($"AI Manager Debug");
            GUILayout.Label($"Total Entities: {_entities.Count}");
            GUILayout.Label($"Active Entities: {_activeEntities.Count}");
            GUILayout.Label($"Updates/Frame: {_updatesThisFrame}");
            GUILayout.Label($"Accumulator: {_accumulator:F3}s");

            if (_playerTransform != null)
            {
                GUILayout.Label($"Player: {_playerTransform.position:F1}");
            }

            GUILayout.EndVertical();
            GUILayout.EndArea();
        }

        private void OnDrawGizmos()
        {
            if (!_config.debug) return;

            // Draw update radius around player
            if (_playerTransform != null)
            {
                Gizmos.color = new Color(0f, 1f, 1f, 0.1f);
                Gizmos.DrawWireSphere(_playerTransform.position, _config.maxUpdateDistance);
            }

            // Draw connections between nearby entities
            Gizmos.color = Color.gray;
            var entityList = new List<AIController>(_entities.Values);

            for (int i = 0; i < entityList.Count; i++)
            {
                for (int j = i + 1; j < entityList.Count; j++)
                {
                    if (entityList[i] == null || entityList[j] == null) continue;

                    float dist = Vector3.Distance(
                        entityList[i].transform.position,
                        entityList[j].transform.position
                    );

                    if (dist < 10f)
                    {
                        Gizmos.DrawLine(
                            entityList[i].transform.position + Vector3.up,
                            entityList[j].transform.position + Vector3.up
                        );
                    }
                }
            }
        }

        #endregion
    }
}
