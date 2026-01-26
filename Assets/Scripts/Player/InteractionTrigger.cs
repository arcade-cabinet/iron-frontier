// =============================================================================
// InteractionTrigger.cs - Player Interaction Detection Component
// Iron Frontier - Unity 6
// =============================================================================

using System;
using UnityEngine;

namespace IronFrontier.Player
{
    /// <summary>
    /// Component for detecting when the player enters interaction range.
    /// Attach to a child object with a trigger collider on the player prefab.
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public class InteractionTrigger : MonoBehaviour
    {
        #region Events

        /// <summary>Fired when an interactable enters the trigger.</summary>
        public event Action<Collider> OnInteractableEnter;

        /// <summary>Fired when an interactable exits the trigger.</summary>
        public event Action<Collider> OnInteractableExit;

        /// <summary>Fired when an interactable stays in the trigger.</summary>
        public event Action<Collider> OnInteractableStay;

        #endregion

        #region Serialized Fields

        [Header("Configuration")]
        [SerializeField]
        [Tooltip("Layer mask for interactable objects")]
        private LayerMask interactableLayer;

        [SerializeField]
        [Tooltip("Tag filter for interactables (leave empty for no filter)")]
        private string interactableTag = "";

        [Header("Debug")]
        [SerializeField]
        private bool debugMode = false;

        #endregion

        #region Private Fields

        private Collider _trigger;

        #endregion

        #region Properties

        /// <summary>Layer mask for filtering interactables.</summary>
        public LayerMask InteractableLayer => interactableLayer;

        #endregion

        #region Unity Lifecycle

        private void Awake()
        {
            _trigger = GetComponent<Collider>();

            if (!_trigger.isTrigger)
            {
                Debug.LogWarning("[InteractionTrigger] Collider should be set as trigger");
                _trigger.isTrigger = true;
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            if (!IsValidInteractable(other)) return;

            Log($"Interactable entered: {other.gameObject.name}");
            OnInteractableEnter?.Invoke(other);
        }

        private void OnTriggerExit(Collider other)
        {
            if (!IsValidInteractable(other)) return;

            Log($"Interactable exited: {other.gameObject.name}");
            OnInteractableExit?.Invoke(other);
        }

        private void OnTriggerStay(Collider other)
        {
            if (!IsValidInteractable(other)) return;

            OnInteractableStay?.Invoke(other);
        }

        #endregion

        #region Validation

        private bool IsValidInteractable(Collider other)
        {
            // Check layer
            if (interactableLayer != 0 && ((1 << other.gameObject.layer) & interactableLayer) == 0)
            {
                return false;
            }

            // Check tag
            if (!string.IsNullOrEmpty(interactableTag) && !other.CompareTag(interactableTag))
            {
                return false;
            }

            return true;
        }

        #endregion

        #region Public API

        /// <summary>
        /// Set the interactable layer at runtime.
        /// </summary>
        public void SetInteractableLayer(LayerMask layer)
        {
            interactableLayer = layer;
        }

        /// <summary>
        /// Set the interactable tag filter at runtime.
        /// </summary>
        public void SetInteractableTag(string tag)
        {
            interactableTag = tag;
        }

        #endregion

        #region Debug

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[InteractionTrigger] {message}");
            }
        }

        private void OnDrawGizmos()
        {
            if (_trigger == null) return;

            Gizmos.color = new Color(0f, 1f, 0f, 0.2f);

            if (_trigger is SphereCollider sphere)
            {
                Gizmos.DrawWireSphere(transform.position, sphere.radius);
            }
            else if (_trigger is BoxCollider box)
            {
                Gizmos.DrawWireCube(transform.position + box.center, box.size);
            }
        }

        #endregion
    }
}
