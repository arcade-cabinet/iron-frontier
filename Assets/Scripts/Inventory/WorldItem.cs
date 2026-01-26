using IronFrontier.Data;
using UnityEngine;

namespace IronFrontier.Inventory
{
    /// <summary>
    /// Component for items that exist in the world and can be picked up.
    /// Attach this to any GameObject that represents a collectible item.
    /// </summary>
    public class WorldItem : MonoBehaviour
    {
        [Header("Item Configuration")]
        [SerializeField] private ItemData _itemData;
        [SerializeField] private int _quantity = 1;
        [SerializeField] private string _itemId;

        [Header("Visual Effects")]
        [SerializeField] private bool _enableBobbing = true;
        [SerializeField] private float _bobSpeed = 2f;
        [SerializeField] private float _bobHeight = 0.1f;
        [SerializeField] private bool _enableRotation = true;
        [SerializeField] private float _rotationSpeed = 45f;
        [SerializeField] private bool _enableGlow = true;

        [Header("Audio")]
        [SerializeField] private AudioClip _pickupSound;

        private Vector3 _startPosition;
        private float _bobTimer;

        /// <summary>
        /// The item data for this world item.
        /// </summary>
        public ItemData ItemData
        {
            get => _itemData;
            set => _itemData = value;
        }

        /// <summary>
        /// The quantity of items in this stack.
        /// </summary>
        public int Quantity
        {
            get => _quantity;
            set => _quantity = Mathf.Max(1, value);
        }

        /// <summary>
        /// The item ID (used when ItemData is not assigned).
        /// </summary>
        public string ItemId
        {
            get => !string.IsNullOrEmpty(_itemId) ? _itemId : (_itemData != null ? _itemData.id : gameObject.name);
            set => _itemId = value;
        }

        /// <summary>
        /// Display name for UI prompts.
        /// </summary>
        public string DisplayName
        {
            get
            {
                if (_itemData != null)
                    return _quantity > 1 ? $"{_itemData.displayName} x{_quantity}" : _itemData.displayName;
                return gameObject.name.Replace("_", " ");
            }
        }

        private void Awake()
        {
            _startPosition = transform.position;
        }

        private void Update()
        {
            // Bobbing animation
            if (_enableBobbing)
            {
                _bobTimer += Time.deltaTime * _bobSpeed;
                float yOffset = Mathf.Sin(_bobTimer) * _bobHeight;
                transform.position = _startPosition + Vector3.up * yOffset;
            }

            // Rotation animation
            if (_enableRotation)
            {
                transform.Rotate(Vector3.up, _rotationSpeed * Time.deltaTime);
            }
        }

        /// <summary>
        /// Picks up this world item and adds it to the player's inventory.
        /// </summary>
        /// <returns>True if the item was successfully picked up.</returns>
        public bool Pickup()
        {
            if (InventoryManager.Instance == null)
            {
                Debug.LogWarning("[WorldItem] InventoryManager not found");
                return false;
            }

            int addedQuantity = 0;

            if (_itemData != null)
            {
                addedQuantity = InventoryManager.Instance.AddItem(_itemData, _quantity);
            }
            else if (!string.IsNullOrEmpty(_itemId))
            {
                addedQuantity = InventoryManager.Instance.AddItemById(_itemId, _quantity);
            }
            else
            {
                // Fallback: try to add by name
                addedQuantity = InventoryManager.Instance.AddItemById(gameObject.name, _quantity);
            }

            if (addedQuantity > 0)
            {
                // Play pickup sound
                if (_pickupSound != null)
                {
                    AudioSource.PlayClipAtPoint(_pickupSound, transform.position);
                }

                // Publish event
                Core.EventBus.Instance?.Publish(Core.GameEvents.ItemAdded, ItemId);

                // If we picked up everything, destroy the object
                if (addedQuantity >= _quantity)
                {
                    Destroy(gameObject);
                }
                else
                {
                    // Partial pickup - reduce quantity
                    _quantity -= addedQuantity;
                }

                return true;
            }

            return false;
        }

        /// <summary>
        /// Highlights this item (called when player is nearby).
        /// </summary>
        public void Highlight()
        {
            if (_enableGlow)
            {
                // Could add outline effect or emission here
                var renderer = GetComponentInChildren<Renderer>();
                if (renderer != null)
                {
                    // Enable emission or outline shader
                }
            }
        }

        /// <summary>
        /// Removes highlight from this item.
        /// </summary>
        public void RemoveHighlight()
        {
            if (_enableGlow)
            {
                var renderer = GetComponentInChildren<Renderer>();
                if (renderer != null)
                {
                    // Disable emission or outline shader
                }
            }
        }

        /// <summary>
        /// Creates a world item at the specified position.
        /// </summary>
        public static WorldItem Create(ItemData itemData, Vector3 position, int quantity = 1)
        {
            // Create a simple cube placeholder (should be replaced with proper prefab)
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.transform.position = position;
            go.transform.localScale = Vector3.one * 0.3f;
            go.name = $"WorldItem_{itemData.id}";
            go.layer = LayerMask.NameToLayer("Interactable");

            // Remove collider and add trigger
            var col = go.GetComponent<Collider>();
            if (col != null)
            {
                col.isTrigger = true;
            }

            // Add WorldItem component
            var worldItem = go.AddComponent<WorldItem>();
            worldItem._itemData = itemData;
            worldItem._quantity = quantity;

            // Set material color based on rarity
            var renderer = go.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = GetRarityColor(itemData.rarity);
            }

            return worldItem;
        }

        /// <summary>
        /// Creates a world item at the specified position by item ID.
        /// </summary>
        public static WorldItem CreateById(string itemId, Vector3 position, int quantity = 1)
        {
            // Create placeholder
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.transform.position = position;
            go.transform.localScale = Vector3.one * 0.3f;
            go.name = $"WorldItem_{itemId}";
            go.layer = LayerMask.NameToLayer("Interactable");

            var col = go.GetComponent<Collider>();
            if (col != null)
            {
                col.isTrigger = true;
            }

            var worldItem = go.AddComponent<WorldItem>();
            worldItem._itemId = itemId;
            worldItem._quantity = quantity;

            return worldItem;
        }

        private static Color GetRarityColor(ItemRarity rarity)
        {
            return rarity switch
            {
                ItemRarity.Common => new Color(0.8f, 0.8f, 0.8f),
                ItemRarity.Uncommon => new Color(0.2f, 0.8f, 0.2f),
                ItemRarity.Rare => new Color(0.2f, 0.4f, 0.9f),
                ItemRarity.Legendary => new Color(1f, 0.6f, 0f),
                _ => Color.white
            };
        }
    }
}
